import { Router } from 'express';
import {
  list,
  getById,
  create,
  update,
  remove,
  enable,
  disable,
  testConnection,
  health,
  legacyStatus,
  legacyTest
} from './controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Secure all endpoints within this module
router.use(authenticate);

// Legacy routes backward compatibility
router.get('/status', legacyStatus);
router.post('/test', legacyTest);

// Multi-router CRUD & Telemetry routes
router.get('/', list);
router.post('/', create);
router.post('/test-connection', testConnection);

router.get('/:id', getById);
router.patch('/:id', update);
router.delete('/:id', remove);
router.post('/:id/enable', enable);
router.post('/:id/disable', disable);
router.post('/:id/test-connection', testConnection);
router.get('/:id/health', health);

export default router;
