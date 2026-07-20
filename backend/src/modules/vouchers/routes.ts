import { Router } from 'express';
import { generate, list, disable, remove, removeAll } from './controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Secure all endpoints within this module
router.use(authenticate);

router.post('/generate', generate);
router.get('/', list);
router.put('/:id/disable', disable);
router.delete('/delete-all', removeAll);
router.delete('/:id', remove);

export default router;
