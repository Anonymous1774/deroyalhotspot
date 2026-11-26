import { Request, Response, NextFunction } from 'express';
import * as service from './service';

function err(res: Response, e: any) {
  if (e.statusCode) return res.status(e.statusCode).json({ success: false, message: e.message });
  return res.status(500).json({ success: false, message: 'Internal server error.' });
}

// ── Stats ─────────────────────────────────────────────────────────────────────
export async function stats(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getPlatformStats();
    return res.json({ success: true, data });
  } catch (e) { next(e); }
}

// ── Tenants ───────────────────────────────────────────────────────────────────
export async function listTenants(req: Request, res: Response, next: NextFunction) {
  try {
    const page   = req.query.page   ? Number(req.query.page)   : 1;
    const limit  = req.query.limit  ? Number(req.query.limit)  : 20;
    const search = req.query.search  as string | undefined;
    const status = req.query.status  as string | undefined;
    const data   = await service.listTenants(page, limit, search, status);
    return res.json({ success: true, data });
  } catch (e) { next(e); }
}

export async function getTenant(req: Request, res: Response, _next: NextFunction) {
  try {
    const data = await service.getTenantById(req.params.id);
    return res.json({ success: true, data });
  } catch (e: any) { return err(res, e); }
}

export async function suspendTenant(req: Request, res: Response, _next: NextFunction) {
  try {
    await service.suspendTenant(req.params.id, (req as any).superAdmin!.id, (req as any).superAdmin!.email);
    return res.json({ success: true, message: 'Tenant suspended.' });
  } catch (e: any) { return err(res, e); }
}

export async function activateTenant(req: Request, res: Response, _next: NextFunction) {
  try {
    await service.activateTenant(req.params.id, (req as any).superAdmin!.id, (req as any).superAdmin!.email);
    return res.json({ success: true, message: 'Tenant activated.' });
  } catch (e: any) { return err(res, e); }
}

// ── Subscription plans ────────────────────────────────────────────────────────
export async function listPlans(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.listSubscriptionPlans();
    // Normalise billingInterval → billingCycle for the frontend
    const normalised = data.map((p: any) => ({
      ...p,
      billingCycle: (p.billingInterval || 'monthly').toUpperCase(),
      features: (() => { try { return JSON.parse(p.features || '[]'); } catch { return []; } })(),
    }));
    return res.json({ success: true, data: normalised });
  } catch (e) { next(e); }
}

export async function createPlan(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.createSubscriptionPlan(req.body);
    return res.status(201).json({ success: true, message: 'Plan created.', data });
  } catch (e: any) { return err(res, e); }
}

export async function updatePlan(req: Request, res: Response, _next: NextFunction) {
  try {
    const data = await service.updateSubscriptionPlan(req.params.id, req.body);
    return res.json({ success: true, message: 'Plan updated.', data });
  } catch (e: any) { return err(res, e); }
}

export async function deletePlan(req: Request, res: Response, _next: NextFunction) {
  try {
    await service.deleteSubscriptionPlan(req.params.id);
    return res.json({ success: true, message: 'Plan deleted.' });
  } catch (e: any) { return err(res, e); }
}

// ── Subscription activation ───────────────────────────────────────────────────
export async function activateSubscription(req: Request, res: Response, _next: NextFunction) {
  try {
    const { tenantId, planId } = req.body;
    await service.activateTenantSubscription(tenantId, planId, (req as any).superAdmin!.id, (req as any).superAdmin!.email);
    return res.json({ success: true, message: 'Subscription activated.' });
  } catch (e: any) { return err(res, e); }
}

// ── Audit logs ────────────────────────────────────────────────────────────────
export async function auditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const page   = req.query.page   ? Number(req.query.page)  : 1;
    const limit  = req.query.limit  ? Number(req.query.limit) : 100;
    const module = req.query.module as string | undefined;
    const result = await service.getPlatformAuditLogs(page, limit, module);
    // Frontend reads r.data.data — return the logs array directly
    return res.json({ success: true, data: result.logs, meta: { total: result.total, page, limit } });
  } catch (e) { next(e); }
}
