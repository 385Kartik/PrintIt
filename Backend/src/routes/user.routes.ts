import express from 'express';
import { getTokenBalance } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { createRateLimiter } from '../middleware/rateLimit.middleware';

const router = express.Router();

const authMiddleware = authenticate;
const rateLimiter = createRateLimiter('user');

router.get('/tokens', authMiddleware, rateLimiter, getTokenBalance);

export default router;
