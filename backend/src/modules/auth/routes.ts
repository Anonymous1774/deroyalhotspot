import { Router } from 'express';
import { login, profile, logout } from './controller';
import { authenticate } from '../../middleware/auth';
import { loginLimiter } from '../../middleware/rate-limiter';

const router = Router();

// Public login endpoint (secured with rate limiting)
router.post('/login', loginLimiter, login);

// Protected endpoints
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, profile);

export default router;
