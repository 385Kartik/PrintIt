import express from 'express';
import {
  adminLogin,
  getAllPrintRequests,
  getCollegePickupRequests,
  getPrintRequestByPin,
  updatePrintStatus,
  getStatistics,
  downloadFile,
  markAsDelivered,
  getFilePreviewAdmin,
} from '../controllers/admin.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { createRateLimiter } from '../middleware/rateLimit.middleware';

const router = express.Router();

const rateLimiter = createRateLimiter('admin');

router.post('/login', rateLimiter, adminLogin);
router.get('/print-requests', authenticate, isAdmin, rateLimiter, getAllPrintRequests);
router.get('/print-requests/college-pickup', authenticate, isAdmin, rateLimiter, getCollegePickupRequests);
router.get('/print-requests/pin/:pin', authenticate, isAdmin, rateLimiter, getPrintRequestByPin);
router.patch('/print-requests/:id/status', authenticate, isAdmin, rateLimiter, updatePrintStatus);
router.patch('/print-requests/:id/deliver', authenticate, isAdmin, rateLimiter, markAsDelivered);
router.get('/download/:s3Key', authenticate, isAdmin, rateLimiter, downloadFile);
router.get('/preview/:s3Key', authenticate, isAdmin, rateLimiter, getFilePreviewAdmin);
router.get('/statistics', authenticate, isAdmin, rateLimiter, getStatistics);

export default router;
