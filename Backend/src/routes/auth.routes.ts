import express from 'express';
import {
  requestSignupOTP,
  verifySignupOTP,
  requestLoginOTP,
  verifyLoginOTP,
  getProfile,
  updateProfile,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { createRateLimiter } from '../middleware/rateLimit.middleware';

const router = express.Router();

const rateLimiter = createRateLimiter('auth');

// New OTP-based signup flow
router.post('/request-signup-otp', rateLimiter, requestSignupOTP);
router.post('/verify-signup-otp', rateLimiter, verifySignupOTP);

// Passwordless login flow
router.post('/request-login-otp', rateLimiter, requestLoginOTP);
router.post('/verify-login-otp', rateLimiter, verifyLoginOTP);

// Profile (authenticated)
router.get('/profile', authenticate, rateLimiter, getProfile);
router.put('/profile', authenticate, rateLimiter, updateProfile);

export default router;
