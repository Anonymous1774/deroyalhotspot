import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, profile, logout } from './controller';
import { authenticateSuperAdmin } from '../../middleware/auth';

const router = Router();

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // extra strict for Super Admin
  message: { success: false, message: 'Too many login attempts. Please wait and try again.' },
});

router.post('/login',   strictLimiter, login);
router.get('/profile',  authenticateSuperAdmin, profile);
router.post('/logout',  authenticateSuperAdmin, logout);

export default router;
