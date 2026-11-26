import { Router } from 'express';
import { authenticateSuperAdmin, requireSuperAdmin } from '../../middleware/auth';
import * as ctrl from './controller';

const router = Router();

// All platform routes require Super Admin authentication
router.use(authenticateSuperAdmin, requireSuperAdmin);

// ── Platform overview ─────────────────────────────────────────────────────────
router.get('/stats',                              ctrl.stats);

// ── Tenant management ─────────────────────────────────────────────────────────
router.get('/tenants',                            ctrl.listTenants);
router.get('/tenants/:id',                        ctrl.getTenant);

// Support both POST (legacy) and PATCH (frontend convention)
router.post('/tenants/:id/suspend',               ctrl.suspendTenant);
router.patch('/tenants/:id/suspend',              ctrl.suspendTenant);
router.post('/tenants/:id/activate',              ctrl.activateTenant);
router.patch('/tenants/:id/activate',             ctrl.activateTenant);

// ── Subscription plans ───────────────────────────────────────────────────────
router.get('/subscription-plans',                 ctrl.listPlans);
router.post('/subscription-plans',                ctrl.createPlan);
router.put('/subscription-plans/:id',             ctrl.updatePlan);
router.delete('/subscription-plans/:id',          ctrl.deletePlan);

// ── Subscription activation (manual) ─────────────────────────────────────────
router.post('/subscriptions/activate',            ctrl.activateSubscription);

// ── Audit logs ───────────────────────────────────────────────────────────────
router.get('/audit-logs',                         ctrl.auditLogs);

export default router;
