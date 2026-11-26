import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, profile, logout } from './controller';
import { authenticateCustomer } from '../../middleware/auth';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please wait and try again.' },
});

router.post('/register', authLimiter, register);
router.post('/login',    authLimiter, login);
router.get('/profile',   authenticateCustomer, profile);
router.post('/logout',   authenticateCustomer, logout);

export default router;
