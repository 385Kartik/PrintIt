import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import {
  getAllPrintRequests as getAllPrintRequestsDB,
  updatePrintRequestStatus,
  findPrintRequestById,
  getAllPrintRequestsWithUsers,
  findPrintRequestByCollectionPin,
  normalizePrintStatus,
} from '../database/printRequests';
import { getAllUsers, findUserById } from '../database/users';
import { AuthRequest } from '../middleware/auth.middleware';
import jwt from 'jsonwebtoken';
import { deleteLocalFile, getLocalFilePath, getPreviewUrl } from '../config/s3.config';

// Admin login with hardcoded credentials
export const adminLogin = async (req: any, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Get admin credentials from environment variables
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate token with same format as regular users
    const token = jwt.sign(
      { userId: 'admin', isAdmin: true },
      process.env.JWT_SECRET || 'secret'
    );

    res.json({
      message: 'Login successful',
      token,
      user: { 
        id: 'admin',
        username: ADMIN_USERNAME, 
        isAdmin: true,
        tokens: 0 // Admin gets same token structure
      },
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

export const getAllPrintRequests = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Use MongoDB's populate functionality to get print requests with user data
    const transformedRequests = await getAllPrintRequestsWithUsers();
    res.json(transformedRequests);
  } catch (error: any) {
    console.error('Get all print requests error:', error);
    res.status(500).json({ message: 'Failed to fetch print requests', error: error.message });
  }
};

export const getCollegePickupRequests = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const allRequests = await getAllPrintRequestsWithUsers();
    const collegeRequests = allRequests.filter(
      (r: any) => r.delivery_type === 'college_pickup'
    );
    res.json(collegeRequests);
  } catch (error: any) {
    console.error('Get college pickup requests error:', error);
    res.status(500).json({ message: 'Failed to fetch college pickup requests', error: error.message });
  }
};

export const getPrintRequestByPin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pin } = req.params;

    if (!pin || !/^[0-9]{3,6}$/.test(pin)) {
      res.status(400).json({ message: 'A valid PIN (3–6 digits) is required' });
      return;
    }

    const request = await findPrintRequestByCollectionPin(pin);
    if (!request) {
      res.status(404).json({ message: 'No print request found for this PIN' });
      return;
    }

    res.json(request);
  } catch (error: any) {
    console.error('Get print request by PIN error:', error);
    res.status(500).json({ message: 'Failed to fetch print request', error: error.message });
  }
};

export const updatePrintStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { printStatus } = req.body;

    const validStatuses = ['pending', 'processing', 'completed', 'cancelled', 'printed', 'delivered', 'collected'];
    if (!validStatuses.includes(printStatus)) {
      res.status(400).json({ message: 'Invalid print status' });
      return;
    }

    const printRequest = await updatePrintRequestStatus(id, printStatus);

    if (!printRequest) {
      res.status(404).json({ message: 'Print request not found' });
      return;
    }

    if (printStatus === 'delivered' || printStatus === 'collected') {
      for (const file of printRequest.files || []) {
        if (!file.s3Key) continue;
        await deleteLocalFile(file.s3Key);
      }
    }

    const user = await findUserById(printRequest.user_id);

    res.json({
      message: 'Print status updated successfully',
      printRequest: {
        ...printRequest,
        user: user ? { name: user.name, email: user.email, phone: user.phone } : null,
      },
    });
  } catch (error: any) {
    console.error('Update print status error:', error);
    res.status(500).json({ message: 'Failed to update print status', error: error.message });
  }
};

export const getStatistics = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await getAllUsers();
    const printRequests = await getAllPrintRequestsDB();
    
    const totalUsers = users.length;
    const totalPrintRequests = printRequests.length;
    const pendingRequests = printRequests.filter(r => normalizePrintStatus(r.print_status) === 'pending').length;
    const processingRequests = printRequests.filter(r => normalizePrintStatus(r.print_status) === 'printed').length;
    const completedRequests = printRequests.filter(r => normalizePrintStatus(r.print_status) === 'delivered').length;

    const totalRevenue = printRequests
      .filter(r => r.payment_status === 'completed')
      .reduce((sum, r) => sum + r.amount_paid, 0);
    
    const totalTokensUsed = printRequests
      .filter(r => r.payment_status === 'completed')
      .reduce((sum, r) => sum + r.tokens_used, 0);

    res.json({
      totalUsers,
      totalPrintRequests,
      pendingRequests,
      processingRequests,
      completedRequests,
      totalRevenue,
      totalTokensUsed,
    });
  } catch (error: any) {
    console.error('Get statistics error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics', error: error.message });
  }
};

const getMimeTypeFromFilename = (filename: string): string => {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.pdf':
      return 'application/pdf';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.ppt':
      return 'application/vnd.ms-powerpoint';
    case '.pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    default:
      return 'application/octet-stream';
  }
};

// Download file from local VPS disk
export const downloadFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { s3Key } = req.params;
    const decodedKey = decodeURIComponent(s3Key);
    const filePath = getLocalFilePath(decodedKey);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: 'File not found on server' });
      return;
    }

    const fileName = path.basename(filePath);
    res.setHeader('Content-Type', getMimeTypeFromFilename(fileName));
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error: any) {
    console.error('Download file error:', error);
    res.status(500).json({ message: 'Failed to download file', error: error.message });
  }
};

// Mark request as delivered and delete files from local VPS disk
export const markAsDelivered = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const printRequest = await findPrintRequestById(id);
    if (!printRequest) {
      res.status(404).json({ message: 'Print request not found' });
      return;
    }

    // Delete all files from local storage
    for (const file of printRequest.files || []) {
      if (file.s3Key) {
        await deleteLocalFile(file.s3Key);
      }
    }

    // Update print request status
    const updatedRequest = await updatePrintRequestStatus(id, 'delivered');

    res.json({
      message: 'Print request marked as delivered and files deleted',
      printRequest: updatedRequest,
    });
  } catch (error: any) {
    console.error('Mark as delivered error:', error);
    res.status(500).json({ message: 'Failed to mark as delivered', error: error.message });
  }
};

// Get preview URL for a file (admin access)
export const getFilePreviewAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { s3Key } = req.params;
    const decodedKey = decodeURIComponent(s3Key);
    const filePath = getLocalFilePath(decodedKey);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: 'File not found on server' });
      return;
    }

    const previewUrl = getPreviewUrl(req, decodedKey);

    res.json({
      previewUrl,
      expiresIn: 3600,
    });
  } catch (error: any) {
    console.error('Get file preview error:', error);
    res.status(500).json({ message: 'Failed to get file preview', error: error.message });
  }
};
