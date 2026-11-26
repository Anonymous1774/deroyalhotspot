import { Request, Response, NextFunction } from 'express';
import * as service from './service';

function err(res: Response, e: any) {
  if (e.statusCode) return res.status(e.statusCode).json({ success: false, message: e.message });
  return res.status(500).json({ success: false, message: 'Internal server error.' });
}

export async function stats(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getPlatformStats();
    return res.json({ success: true, data });
  } catch (e) { next(e); }
}

export async function listTenants(req: Request, res: Response, next: NextFunction) {
  try {
    const page  = req.query.page  ? Number(req.query.page)  : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const search = req.query.search as string | undefined;
    const data = await service.listTenants(page, limit, search);
    return res.json({ success: true, data });
  } catch (e) { next(e); }
}

export async function getTenant(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getTenantById(req.params.id);
    return res.json({ success: true, data });
  } catch (e: any) { return err(res, e); }
}

export async function suspendTenant(req: Request, res: Response, next: NextFunction) {
  try {
    await service.suspendTenant(req.params.id, req.superAdmin!.id, req.superAdmin!.email);
    return res.json({ success: true, message: 'Tenant suspended.' });
  } catch (e: any) { return err(res, e); }
}

export async function activateTenant(req: Request, res: Response, next: NextFunction) {
  try {
    await service.activateTenant(req.params.id, req.superAdmin!.id, req.superAdmin!.email);
    return res.json({ success: true, message: 'Tenant activated.' });
  } catch (e: any) { return err(res, e); }
}

export async function listPlans(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.listSubscriptionPlans();
    return res.json({ success: true, data });
  } catch (e) { next(e); }
}

export async function createPlan(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.createSubscriptionPlan(req.body);
    return res.status(201).json({ success: true, message: 'Plan created.', data });
  } catch (e) { next(e); }
}

export async function activateSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const { tenantId, planId } = req.body;
    await service.activateTenantSubscription(tenantId, planId, req.superAdmin!.id, req.superAdmin!.email);
    return res.json({ success: true, message: 'Subscription activated.' });
  } catch (e: any) { return err(res, e); }
}

export async function auditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const page  = req.query.page  ? Number(req.query.page)  : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const data = await service.getPlatformAuditLogs(page, limit);
    return res.json({ success: true, data });
  } catch (e) { next(e); }
}
