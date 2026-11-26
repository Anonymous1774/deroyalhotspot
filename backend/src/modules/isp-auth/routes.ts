import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, profile, logout } from './controller';
import { authenticateIsp } from '../../middleware/auth';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please wait and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public
router.post('/register', authLimiter, register);
router.post('/login',    authLimiter, login);

// Protected
router.get('/profile',  authenticateIsp, profile);
router.post('/logout',  authenticateIsp, logout);

export default router;
