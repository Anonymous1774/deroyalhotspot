import { Router } from 'express';
import { status, test } from './controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Secure all endpoints within this module
router.use(authenticate);

router.get('/status', status);
router.post('/test', test);

export default router;
