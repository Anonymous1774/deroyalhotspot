import { Router } from 'express';
import { check, reauthenticate } from './controller';

const router = Router();

// Public routes for captive portal auto-reauthentication
router.get('/check', check);
router.post('/reauthenticate', reauthenticate);

export default router;
