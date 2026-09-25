import { Router } from 'express';
import { list, clear } from './controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Secure all endpoints within this module
router.use(authenticate);

router.get('/', list);
router.delete('/', clear);
router.delete('/clear', clear);

export default router;
