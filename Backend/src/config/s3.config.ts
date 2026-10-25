/**
 * ============================================================
 *  Local VPS Disk Upload Configuration (Replaces AWS S3)
 * ============================================================
 *
 *  Features:
 *  - Upload file using multer.memoryStorage() (stores file in RAM for page counting)
 *  - Saves files to local VPS directory (`uploads/`)
 *  - Provides helpers to save, resolve, preview, and delete files on disk
 */

import fs from 'fs';
import path from 'path';
import multer from 'multer';
import dotenv from 'dotenv';
import { Request } from 'express';

dotenv.config();

const PRINT_ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/jpg',
  'image/png'
];

export const UPLOAD_DIR = path.resolve(
  process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')
);

// Ensure upload directory exists on startup
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

console.log(`📁 Local file storage initialized at: ${UPLOAD_DIR}`);

// Kept truthy for backward compatibility with any legacy checks
export const s3Client = { isLocalStorage: true };

/**
 * Safely resolve a stored file key (e.g. "uploads/123-doc.pdf" or "123-doc.pdf")
 * to an absolute path inside UPLOAD_DIR, preventing path traversal.
 */
export const getLocalFilePath = (key: string): string => {
  const cleanFileName = path.basename(decodeURIComponent(key));
  return path.join(UPLOAD_DIR, cleanFileName);
};

/**
 * Helper: Save uploaded file buffer to local VPS disk
 */
export const uploadFileToS3 = async (file: Express.Multer.File) => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    await fs.promises.mkdir(UPLOAD_DIR, { recursive: true });
  }

  const safeFileName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
  const storedFileName = `${Date.now()}-${safeFileName}`;
  const key = `uploads/${storedFileName}`;
  const filePath = path.join(UPLOAD_DIR, storedFileName);

  await fs.promises.writeFile(filePath, file.buffer);

  const publicBase = (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '');
  const fileUrl = `${publicBase}/api/uploads/${encodeURIComponent(storedFileName)}`;

  return { key, fileUrl };
};

/**
 * Helper: Delete a file from local VPS disk by its stored key
 */
export const deleteLocalFile = async (key: string): Promise<void> => {
  if (!key || key.startsWith('memory-')) return;
  const filePath = getLocalFilePath(key);
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (error) {
    console.error(`Failed to delete local file ${filePath}:`, error);
  }
};

/**
 * Helper: Build a preview URL accessible from the browser/Admin panel
 */
export const getPreviewUrl = (req: Request, key: string): string => {
  const cleanFileName = path.basename(decodeURIComponent(key));
  const publicBase = (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '');
  if (publicBase) {
    return `${publicBase}/api/uploads/${encodeURIComponent(cleanFileName)}`;
  }
  const protocol = (req.headers['x-forwarded-proto'] as string)?.split(',')[0] || req.protocol || 'http';
  const host = req.get('host');
  return `${protocol}://${host}/api/uploads/${encodeURIComponent(cleanFileName)}`;
};

/**
 * Multer configuration with memory storage
 * Files are stored in RAM (req.file.buffer) for page counting and local disk save
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    if (PRINT_ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only supported document, image, and text files are allowed.'));
    }
  },
});

/**
 * Memory storage for temporary cost calculation
 */
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    if (PRINT_ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type.'));
    }
  },
});

export { upload, memoryUpload };

