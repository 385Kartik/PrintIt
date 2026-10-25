import { Router } from 'express';
import { submitContactForm } from '../controllers/support.controller';
import { createRateLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

const rateLimiter = createRateLimiter('support');

router.post('/contact', rateLimiter, submitContactForm);

export default router;
