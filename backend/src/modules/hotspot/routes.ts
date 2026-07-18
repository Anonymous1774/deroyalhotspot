import { Router } from 'express';
import { listSessions, disconnect } from './controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Secure all endpoints within this module
router.use(authenticate);

router.get('/sessions', listSessions);
router.post('/disconnect', disconnect);

export default router;
