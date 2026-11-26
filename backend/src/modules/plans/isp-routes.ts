/**
 * ISP API v1 — Plans module
 * Mounted at: /api/v1/plans
 * Protected by authenticateIsp — all queries scoped to req.ispUser.tenantId
 */
import { Router, Request, Response, NextFunction } from 'express';
import { authenticateIsp } from '../../middleware/auth';
import * as service from './service';
import { createPlanSchema, updatePlanSchema } from './validator';
import prisma from '../../lib/prisma';

const router = Router();
router.use(authenticateIsp as any);

function tid(req: Request) { return (req as any).ispUser?.tenantId as string | undefined; }

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = await service.getAllPlans(tid(req));
    return res.status(200).json({ success: true, data: plans });
  } catch (err) { next(err); }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const v = createPlanSchema.safeParse(req.body);
    if (!v.success) return res.status(422).json({ success: false, message: 'Validation failed', error: { code: 'VALIDATION_ERROR', details: v.error.format() } });
    const plan = await service.createPlan(v.data, tid(req));
    await prisma.activityLog.create({ data: { adminId: null, action: 'Plan Created', module: 'SETTINGS', description: `ISP plan '${plan.name}' created.`, ipAddress: req.ip || null } });
    return res.status(201).json({ success: true, data: plan });
  } catch (err) { next(err); }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plan = await service.getPlanById(req.params.id, tid(req));
    return res.status(200).json({ success: true, data: plan });
  } catch (err) { next(err); }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const v = updatePlanSchema.safeParse(req.body);
    if (!v.success) return res.status(422).json({ success: false, message: 'Validation failed', error: { code: 'VALIDATION_ERROR', details: v.error.format() } });
    const plan = await service.updatePlan(req.params.id, v.data, tid(req));
    return res.status(200).json({ success: true, data: plan });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plan = await service.deletePlan(req.params.id, tid(req));
    return res.status(200).json({ success: true, data: { id: plan.id, name: plan.name } });
  } catch (err) { next(err); }
});

export default router;
