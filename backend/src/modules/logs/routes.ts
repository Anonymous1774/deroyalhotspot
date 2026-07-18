import { Router } from 'express';
import { list } from './controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Secure all endpoints within this module
router.use(authenticate);

router.get('/', list);

export default router;
