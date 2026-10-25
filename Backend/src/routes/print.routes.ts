import express from 'express';
import {
  uploadFiles,
  calculateOrderCost,
  calculateCostFromFiles,
  createOrder,
  verifyPayment,
  getUserPrintRequests,
  getFilePreview,
  cancelPendingRequest,
} from '../controllers/print.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../config/s3.config';
import { createRateLimiter } from '../middleware/rateLimit.middleware';

const router = express.Router();

const authMiddleware = authenticate;
const rateLimiter = createRateLimiter('print');

// Both routes now use memory storage, and upload to S3 happens in the controller
router.post('/upload', authMiddleware, rateLimiter, upload.array('files', 100), uploadFiles);
router.post('/calculate-cost', authMiddleware, rateLimiter, calculateOrderCost);
router.post('/calculate-cost-from-files', authMiddleware, rateLimiter, upload.array('files', 100), calculateCostFromFiles);
router.post('/create-order', authMiddleware, rateLimiter, createOrder);
router.post('/verify-payment', authMiddleware, rateLimiter, verifyPayment);
router.post('/cancel-pending', authMiddleware, rateLimiter, cancelPendingRequest);
router.get('/my-requests', authMiddleware, rateLimiter, getUserPrintRequests);
router.get('/preview/:s3Key', authMiddleware, rateLimiter, getFilePreview);

export default router;
