import { Response } from 'express';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth.middleware';
import razorpay from '../config/razorpay.config';
import { calculateDeadline } from '../utils/deadline';
import crypto from 'crypto';
import { s3Client, uploadFileToS3, getLocalFilePath, getPreviewUrl, deleteLocalFile } from '../config/s3.config';
import { calculateTotalCost, calculatePrintCost, calculateSpecialPagesCost } from '../utils/cost';
import * as userService from '../database/users';
import * as printRequestService from '../database/printRequests';
import { generatePickupOtp } from '../database/printRequests';
import { countPptxSlides, countImagePages, countPdfPages } from '../utils/pageCounter';
import PrintRequest from '../models/PrintRequest.model';

// In-memory store for pending print requests (before payment)
// Key: unique request ID, Value: print request data
interface PendingPrintRequest {
  userId: string;
  files: any[];
  specialPages?: {
    certificatePage: number;
    indexPage: number;
    coverPage: number;
  };
  specialPagesCost?: number;
  totalAmount: number;
  tokensUsed: number;
  amountToPay: number;
  orderId?: string;
  deliveryType: 'college_pickup' | 'home_delivery';
  timestamp: number;
}

const pendingPrintRequests = new Map<string, PendingPrintRequest>();

// Cache file metadata keyed by user + content hash to avoid re-uploading the same file
interface CachedUpload {
  hash: string;
  pages: number;
  size: number;
  s3Key: string;
  s3Url: string;
  filename: string;
  mimeType: string;
  originalName: string;
  uploadedAt: number;
}

const uploadCache = new Map<string, CachedUpload>();
const UPLOAD_CACHE_TTL = 60 * 60 * 1000; // 1 hour

const makeCacheKey = (userId: string | undefined, hash: string) => `${userId || 'anon'}:${hash}`;

const hashFileBuffer = (file: Express.Multer.File): string => {
  const hasher = crypto.createHash('sha256');
  hasher.update(file.buffer || Buffer.from(''));
  hasher.update(String(file.size));
  return hasher.digest('hex');
};

// Cleanup old entries (older than 1 hour) every 5 minutes
setInterval(() => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [key, value] of pendingPrintRequests.entries()) {
    if (value.timestamp < oneHourAgo) {
      pendingPrintRequests.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Cleanup cached uploads periodically and delete abandoned local files not linked to any DB order
setInterval(async () => {
  const expiresBefore = Date.now() - UPLOAD_CACHE_TTL;
  for (const [key, cached] of uploadCache.entries()) {
    if (cached.uploadedAt < expiresBefore) {
      uploadCache.delete(key);
      try {
        const existsInDb = await PrintRequest.exists({ 'files.s3Key': cached.s3Key });
        if (!existsInDb) {
          await deleteLocalFile(cached.s3Key);
        }
      } catch (err) {
        console.error('Error cleaning up cached upload file:', err);
      }
    }
  }
}, 10 * 60 * 1000);

// Note: PDF page counting is handled in utils/pageCounter to centralize logic

// Helper function to get page count based on file type
async function getPageCount(file: Express.Multer.File): Promise<number> {
  const { mimetype, buffer } = file;

  if (!buffer || buffer.length === 0) {
    return 1;
  }

    try {
    if (mimetype === 'application/pdf') {
      return await countPdfPages(buffer);
    }

    if (
      mimetype === 'application/vnd.ms-powerpoint' ||
      mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ) {
      return await countPptxSlides(buffer);
    }

    if (mimetype.startsWith('image/')) {
      return countImagePages(mimetype);
    }

    return 1;
  } catch (error) {
    console.error(`Error counting pages for ${mimetype}:`, error);
    return 1;
  }
}

// Calculate cost with files in memory (no S3 upload)
export const calculateCostFromFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    const { printOptions, useTokens, specialPages, deliveryType } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!files || files.length === 0) {
      res.status(400).json({ message: 'No files provided' });
      return;
    }

    const user = await userService.findUserById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (!s3Client) {
      res.status(503).json({ message: 'S3 is not configured. Uploads are required to process requests.' });
      return;
    }

    // Parse print options (sent as JSON string)
    const parsedPrintOptions = printOptions ? JSON.parse(printOptions) : [];

    // Process files and count pages, and handle S3 upload (with de-duplication cache)
    const fileDataPromises = files.map(async (file, index) => {
      const buffer = file.buffer;
      const hash = hashFileBuffer(file);
      const cacheKey = makeCacheKey(userId as string, hash);

      const cached = uploadCache.get(cacheKey);

      let pages: number;
      let s3Key: string;
      let s3Url: string;
      let filename: string;
      let mimeType: string;
      let originalName: string;
      let size: number;

      if (cached) {
        ({ pages, s3Key, s3Url, filename, mimeType, originalName, size } = cached);
      } else {
        pages = buffer ? await getPageCount({ ...file, buffer } as Express.Multer.File) : 1;
        const { key, fileUrl } = await uploadFileToS3(file);

        s3Key = key;
        s3Url = fileUrl;
        filename = key;
        mimeType = file.mimetype;
        originalName = file.originalname;
        size = file.size;

        uploadCache.set(cacheKey, {
          hash,
          pages,
          s3Key,
          s3Url,
          filename,
          mimeType,
          originalName,
          size,
          uploadedAt: Date.now(),
        });
      }

      // Get print options for this file
      const filePrintOptions = parsedPrintOptions[index] || {
        printSide: 'single',
        colorMode: 'bw',
        paperSize: 'A4',
        copies: 1,
      };

      const cost = calculatePrintCost(pages, filePrintOptions);

      return {
        size,
        pages,
        cost,
        s3Key,
        s3Url,
        filename,
        mimeType,
        originalName,
        printOptions: filePrintOptions,
      };
    });

    const fileData = await Promise.all(fileDataPromises);

    // Parse special pages (optional, may arrive as JSON string)
    let parsedSpecialPages = { certificatePage: 0, indexPage: 0, coverPage: 0 };
    try {
      if (typeof specialPages === 'string') {
        parsedSpecialPages = JSON.parse(specialPages);
      } else if (specialPages && typeof specialPages === 'object') {
        parsedSpecialPages = specialPages;
      }
    } catch (_) {
      parsedSpecialPages = { certificatePage: 0, indexPage: 0, coverPage: 0 };
    }

    const specialPagesCost = calculateSpecialPagesCost(
      Number(parsedSpecialPages.certificatePage || 0),
      Number(parsedSpecialPages.indexPage || 0),
      Number(parsedSpecialPages.coverPage || 0)
    );

    // Calculate total amount
    const totalAmount = fileData.reduce((sum, file) => sum + file.cost, 0) + specialPagesCost;

    // Calculate tokens to use (1 token = 1 rupee)
    const tokenValue = 1;
    const shouldUseTokens = useTokens === 'true' || useTokens === true;
    const tokensUsed = shouldUseTokens ? Math.min(user.tokens, Math.floor(totalAmount / tokenValue)) : 0;
    const amountToPay = totalAmount - (tokensUsed * tokenValue);

    const breakdown = fileData.map((file) => ({
      filename: file.originalName,
      pages: file.pages,
      cost: file.cost,
      printOptions: file.printOptions,
    }));

    // Create an in-memory request only; final DB record is created after payment
    const requestId = `req_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Also store in memory for backward compatibility during payment
    pendingPrintRequests.set(requestId, {
      userId: userId as string,
      files: fileData,
      specialPages: parsedSpecialPages,
      specialPagesCost,
      totalAmount,
      tokensUsed,
      amountToPay,
      deliveryType: deliveryType === 'college_pickup' ? 'college_pickup' : 'home_delivery',
      timestamp: Date.now(),
    });

    res.json({
      totalAmount,
      tokensUsed,
      amountToPay,
      tokensAvailable: user.tokens,
      breakdown,
      files: fileData,
      specialPages: parsedSpecialPages,
      specialPagesCost,
      requestId,
    });
  } catch (error: any) {
    console.error('Calculate cost from files error:', error);
    res.status(500).json({ message: 'Failed to calculate cost', error: error.message });
  }
};

export const uploadFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ message: 'No files uploaded' });
      return;
    }

    if (!s3Client) {
      res.status(503).json({ message: 'S3 is not configured. Uploads are required to proceed.' });
      return;
    }

    // Process files and count pages
    const fileDataPromises = files.map(async (file) => {
      const buffer = file.buffer;
      const pages = buffer ? await getPageCount({ ...file, buffer } as Express.Multer.File) : 1;

      const { key, fileUrl } = await uploadFileToS3(file);
      return {
        size: file.size,
        pages,
        s3Key: key,
        s3Url: fileUrl,
        filename: key,
        mimeType: file.mimetype,
        originalName: file.originalname,
      };
    });

    const fileData = await Promise.all(fileDataPromises);

    res.json({
      message: 'Files uploaded successfully',
      files: fileData,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
};

export const calculateOrderCost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { files, useTokens, specialPages, deliveryType } = req.body;
    const userId = req.user?.id || req.user?._id;

    const normalizedFiles = Array.isArray(files) ? files : [];

    // Parse special pages (optional)
    let parsedSpecialPages = { certificatePage: 0, indexPage: 0, coverPage: 0 };
    if (specialPages && typeof specialPages === 'object') {
      parsedSpecialPages = specialPages;
    }

    const specialPagesCost = calculateSpecialPagesCost(
      Number(parsedSpecialPages.certificatePage || 0),
      Number(parsedSpecialPages.indexPage || 0),
      Number(parsedSpecialPages.coverPage || 0)
    );

    if (normalizedFiles.length === 0 && specialPagesCost === 0) {
      res.status(400).json({ message: 'No files or special pages provided' });
      return;
    }

    const user = await userService.findUserById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Calculate total amount based on files and print options
    const filesTotal = normalizedFiles.length > 0 ? calculateTotalCost(normalizedFiles) : 0;
    const totalAmount = filesTotal + specialPagesCost;

    // Calculate tokens to use (1 token = 1 rupee)
    const tokenValue = 1; // Each token is worth 1 rupee
    const shouldUseTokens = useTokens === 'true' || useTokens === true;
    const tokensUsed = shouldUseTokens ? Math.min(user.tokens, Math.floor(totalAmount / tokenValue)) : 0;
    const amountToPay = totalAmount - (tokensUsed * tokenValue);

    const breakdown = normalizedFiles.map((file: any) => {
      const cost = file.printOptions ? calculatePrintCost(file.pages, file.printOptions) : 0;
      return {
        filename: file.originalName,
        pages: file.pages,
        cost,
      };
    });

    // Generate unique request ID for in-memory storage
    const requestId = `req_${userId}_${Date.now()}`;

    // Store in memory for later reference during payment
    pendingPrintRequests.set(requestId, {
      userId: userId as string,
      files: normalizedFiles,
      specialPages: parsedSpecialPages,
      specialPagesCost,
      totalAmount,
      tokensUsed,
      amountToPay,
      deliveryType: deliveryType === 'college_pickup' ? 'college_pickup' : 'home_delivery',
      timestamp: Date.now(),
    });

    res.json({
      totalAmount,
      tokensUsed,
      amountToPay,
      tokensAvailable: user.tokens,
      breakdown,
      specialPages: parsedSpecialPages,
      specialPagesCost,
      requestId,
    });
  } catch (error: any) {
    console.error('Calculate cost error:', error);
    res.status(500).json({ message: 'Failed to calculate cost', error: error.message });
  }
};

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { requestId } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!requestId) {
      res.status(400).json({ message: 'Request ID is required' });
      return;
    }

    // Retrieve pending request from memory
    const pendingRequest = pendingPrintRequests.get(requestId);
    if (!pendingRequest) {
      res.status(404).json({ message: 'Request not found or expired. Please recalculate the cost.' });
      return;
    }

    // Verify user owns this request
    if (pendingRequest.userId !== userId) {
      res.status(403).json({ message: 'Unauthorized access to this request' });
      return;
    }

    const user = await userService.findUserById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isCollegePickup = pendingRequest.deliveryType === 'college_pickup';

    // College pickup: same-day deadline (end of today); Home delivery: next-day deadline
    const deadline = isCollegePickup
      ? (() => { const d = new Date(); d.setHours(23, 59, 0, 0); return d; })()
      : calculateDeadline();

    const amountToPay = pendingRequest.amountToPay;

    // If no payment needed, create final print request now (single final creation point)
    if (amountToPay === 0) {
      const collectionPin = isCollegePickup
        ? await generatePickupOtp()
        : await printRequestService.generateUniqueCollectionPin();
      const result = await printRequestService.createPrintRequest({
        user_id: userId,
        files: pendingRequest.files,
        special_pages: pendingRequest.specialPages,
        total_amount: pendingRequest.totalAmount,
        tokens_used: pendingRequest.tokensUsed,
        amount_paid: 0,
        order_id: 'no-payment',
        collection_pin: collectionPin,
        delivery_type: pendingRequest.deliveryType,
        payment_status: 'completed',
        deadline: deadline.toISOString(),
      });
      const printRequestDoc = result ? await PrintRequest.findById(result.id) : null;

      // Calculate and update tokens based on amount actually paid (not gross total).
      // Use amount recorded on the saved print request if available, otherwise fall back.
      const paidAmount = printRequestDoc?.amount_paid ?? pendingRequest.amountToPay ?? 0;
      const tokensEarned = Math.floor(paidAmount / 20);
      const updatedTokens = user.tokens + tokensEarned - pendingRequest.tokensUsed;
      await userService.updateUserTokens(userId, updatedTokens);

      // Remove from pending requests
      pendingPrintRequests.delete(requestId);

      res.json({
        message: 'Order created successfully (no payment required)',
        orderId: 'no-payment',
        amountToPay: 0,
        tokensUsed: pendingRequest.tokensUsed,
        printRequestId: printRequestDoc?._id?.toString(),
        collectionPin: printRequestDoc?.collection_pin,
        deliveryType: pendingRequest.deliveryType,
        deadline,
      });
      return;
    }

    const isRazorpayConfigured =
      Boolean(process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      !process.env.RAZORPAY_KEY_ID.includes('your_razorpay') &&
      !process.env.RAZORPAY_KEY_SECRET.includes('your_razorpay'));

    // If Razorpay keys are not yet configured, create order directly (Pay on Pickup / Test mode)
    if (!isRazorpayConfigured) {
      console.warn('⚠️ Razorpay credentials not configured. Placing order in direct pickup/test mode.');
      const collectionPin = isCollegePickup
        ? await generatePickupOtp()
        : await printRequestService.generateUniqueCollectionPin();
      const result = await printRequestService.createPrintRequest({
        user_id: userId,
        files: pendingRequest.files,
        special_pages: pendingRequest.specialPages,
        total_amount: pendingRequest.totalAmount,
        tokens_used: pendingRequest.tokensUsed,
        amount_paid: 0,
        order_id: 'no-payment',
        collection_pin: collectionPin,
        delivery_type: pendingRequest.deliveryType,
        payment_status: 'completed',
        deadline: deadline.toISOString(),
      });
      const printRequestDoc = result ? await PrintRequest.findById(result.id) : null;

      // Update tokens
      const updatedTokens = Math.max(0, user.tokens - pendingRequest.tokensUsed);
      await userService.updateUserTokens(userId, updatedTokens);

      pendingPrintRequests.delete(requestId);

      res.json({
        message: 'Order created successfully (Pay on Pickup)',
        orderId: 'no-payment',
        amountToPay: 0,
        tokensUsed: pendingRequest.tokensUsed,
        printRequestId: printRequestDoc?._id?.toString(),
        collectionPin: printRequestDoc?.collection_pin,
        deliveryType: pendingRequest.deliveryType,
        deadline,
      });
      return;
    }

    // Create Razorpay order if payment is required and keys are configured
    const options = {
      amount: Math.round(amountToPay * 100), // Amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    let orderId: string;
    try {
      const order = await razorpay.orders.create(options);
      orderId = order.id;
    } catch (razorpayError: any) {
      console.warn('⚠️ Razorpay order creation failed (invalid keys):', razorpayError?.error?.description || razorpayError.message);
      const collectionPin = isCollegePickup
        ? await generatePickupOtp()
        : await printRequestService.generateUniqueCollectionPin();
      const result = await printRequestService.createPrintRequest({
        user_id: userId,
        files: pendingRequest.files,
        special_pages: pendingRequest.specialPages,
        total_amount: pendingRequest.totalAmount,
        tokens_used: pendingRequest.tokensUsed,
        amount_paid: 0,
        order_id: 'no-payment',
        collection_pin: collectionPin,
        delivery_type: pendingRequest.deliveryType,
        payment_status: 'completed',
        deadline: deadline.toISOString(),
      });
      const printRequestDoc = result ? await PrintRequest.findById(result.id) : null;
      const updatedTokens = Math.max(0, user.tokens - pendingRequest.tokensUsed);
      await userService.updateUserTokens(userId, updatedTokens);
      pendingPrintRequests.delete(requestId);

      res.json({
        message: 'Order created successfully (Pay on Pickup)',
        orderId: 'no-payment',
        amountToPay: 0,
        tokensUsed: pendingRequest.tokensUsed,
        printRequestId: printRequestDoc?._id?.toString(),
        collectionPin: printRequestDoc?.collection_pin,
        deliveryType: pendingRequest.deliveryType,
        deadline,
      });
      return;
    }

    // Store orderId in pending request for payment verification
    pendingRequest.orderId = orderId;
    pendingPrintRequests.set(requestId, pendingRequest);

    res.json({
      message: 'Order created successfully',
      orderId,
      amountToPay,
      tokensUsed: pendingRequest.tokensUsed,
      requestId, // Return requestId for payment verification
      deadline,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, requestId } =
      req.body;
    const userId = req.user?.id || req.user?._id;

    if (!requestId) {
      res.status(400).json({ message: 'Request ID is required' });
      return;
    }

    // Retrieve pending request from memory
    const pendingRequest = pendingPrintRequests.get(requestId);
    if (!pendingRequest) {
      res.status(404).json({ message: 'Request not found or expired. Payment may have already been processed.' });
      return;
    }

    // Verify user owns this request
    if (pendingRequest.userId !== userId) {
      res.status(403).json({ message: 'Unauthorized access to this request' });
      return;
    }

    // Verify orderId matches
    if (pendingRequest.orderId !== razorpay_order_id) {
      res.status(400).json({ message: 'Order ID mismatch' });
      return;
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
       throw new Error('Razorpay key secret is not configured in backend');
    }

    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      res.status(400).json({ message: 'Payment verification failed - invalid signature' });
      return;
    }

    // Payment verified! Create final print request (single creation point)
    const isCollegePickupVerify = pendingRequest.deliveryType === 'college_pickup';
    const collectionPin = isCollegePickupVerify
      ? await generatePickupOtp()
      : await printRequestService.generateUniqueCollectionPin();
    const verifyDeadline = isCollegePickupVerify
      ? (() => { const d = new Date(); d.setHours(23, 59, 0, 0); return d; })()
      : calculateDeadline();
    const result = await printRequestService.createPrintRequest({
      user_id: userId,
      files: pendingRequest.files,
      special_pages: pendingRequest.specialPages,
      total_amount: pendingRequest.totalAmount,
      tokens_used: pendingRequest.tokensUsed,
      amount_paid: pendingRequest.amountToPay,
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      collection_pin: collectionPin,
      delivery_type: pendingRequest.deliveryType,
      payment_status: 'completed',
      deadline: verifyDeadline.toISOString(),
    });
    const printRequestDoc = result ? await PrintRequest.findById(result.id) : null;

    
    // Calculate tokens earned and deduct used tokens based on actual amount paid.
    const paidAmount = printRequestDoc?.amount_paid ?? pendingRequest.amountToPay ?? 0;
    const tokensEarned = Math.floor(paidAmount / 20); // 1 token for every 20 rupees paid

    const user = await userService.findUserById(userId);
    if (user) {
      const updatedTokens = user.tokens + tokensEarned - pendingRequest.tokensUsed;
      await userService.updateUserTokens(userId, updatedTokens);
    }

    // Remove from pending requests after successful processing
    pendingPrintRequests.delete(requestId);

    res.json({
      message: 'Payment verified successfully',
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      printRequestId: printRequestDoc?._id?.toString(),
      collectionPin: printRequestDoc?.collection_pin,
      deliveryType: pendingRequest.deliveryType,
      deadline: calculateDeadline(),
      printRequest: printRequestDoc,
      tokensEarned,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
};

export const getUserPrintRequests = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { status, undeliveredOnly } = req.query;

    // Get all print requests for this user
    let printRequests = await printRequestService.getUserPrintRequests(userId);

    // Filter by status if provided
    if (status) {
      printRequests = printRequests.filter((req) =>
        printRequestService.normalizePrintStatus(req.print_status) ===
        printRequestService.normalizePrintStatus(status as string)
      );
    }

    // Filter for undelivered prints (not completed)
    if (undeliveredOnly === 'true') {
      printRequests = printRequests.filter(
        (req) => printRequestService.normalizePrintStatus(req.print_status) !== 'delivered'
      );
    }

    res.json({
      printRequests,
      total: printRequests.length,
    });
  } catch (error: any) {
    console.error('Get print requests error:', error);
    res.status(500).json({ message: 'Failed to fetch print requests', error: error.message });
  }
};

// Get preview URL for a file (local VPS storage)
export const getFilePreview = async (req: AuthRequest, res: Response): Promise<void> => {
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

// Cancel a pending request - keep files in S3, cron will clean up after 30 mins
export const cancelPendingRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { requestId } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!requestId) {
      res.status(400).json({ message: 'Request ID is required' });
      return;
    }

    // Check in-memory store
    const pendingRequest = pendingPrintRequests.get(requestId);
    if (pendingRequest) {
      if (pendingRequest.userId !== userId) {
        res.status(403).json({ message: 'Unauthorized access to this request' });
        return;
      }
      // Remove from in-memory store but keep DB record and S3 files
      // Cron job will clean them up after 30 minutes
      pendingPrintRequests.delete(requestId);
    }

    // Note: We intentionally do NOT delete files from S3 here
    // The cron job will handle cleanup after 30 minutes
    // This allows users to resume payment if they change their mind

    res.json({ message: 'Pending request cancelled. Files will be retained for 30 minutes.' });
  } catch (error: any) {
    console.error('Cancel pending request error:', error);
    res.status(500).json({ message: 'Failed to cancel pending request', error: error.message });
  }
};
