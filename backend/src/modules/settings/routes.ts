import { Router } from 'express';
import { fetch, update } from './controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Secure all endpoints within this module
router.use(authenticate);

router.get('/', fetch);
router.put('/', update);

export default router;
