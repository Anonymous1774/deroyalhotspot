import { Router } from 'express';
import { fetchStats } from './controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Secure all endpoints within this module
router.use(authenticate);

router.get('/stats', fetchStats);

export default router;
