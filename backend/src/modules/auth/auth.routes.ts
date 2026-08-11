import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { loginSchema } from './auth.validation';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Strict Rate Limiter for Login (Max 5 attempts per 15 minutes)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, validate(loginSchema), AuthController.login);
router.get('/me', authenticate, AuthController.getMe);

export default router;
