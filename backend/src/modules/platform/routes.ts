import { Router } from 'express';
import { authenticateSuperAdmin, requireSuperAdmin } from '../../middleware/auth';
import * as ctrl from './controller';

const router = Router();

// All platform routes require Super Admin authentication
router.use(authenticateSuperAdmin, requireSuperAdmin);

router.get('/stats',                       ctrl.stats);
router.get('/tenants',                     ctrl.listTenants);
router.get('/tenants/:id',                 ctrl.getTenant);
router.post('/tenants/:id/suspend',        ctrl.suspendTenant);
router.post('/tenants/:id/activate',       ctrl.activateTenant);
router.get('/subscription-plans',          ctrl.listPlans);
router.post('/subscription-plans',         ctrl.createPlan);
router.post('/subscriptions/activate',     ctrl.activateSubscription);
router.get('/audit-logs',                  ctrl.auditLogs);

export default router;
