/**
 * ISP API v1 — Routers module
 * Mounted at: /api/v1/routers
 * Protected by authenticateIsp — all queries scoped to req.ispUser.tenantId
 */
import { Router, Request, Response, NextFunction } from 'express';
import { authenticateIsp } from '../../middleware/auth';
import * as service from './service';
import { createRouterSchema, updateRouterSchema } from './validator';
import prisma from '../../lib/prisma';

const router = Router();
router.use(authenticateIsp as any);

function tid(req: Request) { return (req as any).ispUser?.tenantId as string | undefined; }

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const routers = await service.getAllRouters(tid(req));
    return res.status(200).json({ success: true, data: routers });
  } catch (err) { next(err); }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const v = createRouterSchema.safeParse(req.body);
    if (!v.success) return res.status(422).json({ success: false, message: 'Validation failed', error: { code: 'VALIDATION_ERROR', details: v.error.format() } });
    const router_obj = await service.createRouter(v.data, tid(req));
    await prisma.activityLog.create({ data: { adminId: null, action: 'Router Created', module: 'ROUTER', description: `ISP router '${router_obj.name}' created.`, ipAddress: req.ip || null } });
    return res.status(201).json({ success: true, data: router_obj });
  } catch (err) { next(err); }
});

router.post('/test-connection', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.testRouterConnection(undefined, req.body, tid(req));
    return res.status(result.success ? 200 : 400).json({ success: result.success, data: result });
  } catch (err: any) { return res.status(400).json({ success: false, message: err.message }); }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const router_obj = await service.getRouterById(req.params.id, tid(req));
    return res.status(200).json({ success: true, data: router_obj });
  } catch (err) { next(err); }
});

router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const v = updateRouterSchema.safeParse(req.body);
    if (!v.success) return res.status(422).json({ success: false, message: 'Validation failed', error: { code: 'VALIDATION_ERROR', details: v.error.format() } });
    const router_obj = await service.updateRouter(req.params.id, v.data, tid(req));
    return res.status(200).json({ success: true, data: router_obj });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const router_obj = await service.deleteRouter(req.params.id, tid(req));
    return res.status(200).json({ success: true, data: router_obj });
  } catch (err) { next(err); }
});

router.post('/:id/enable', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const router_obj = await service.enableRouter(req.params.id, tid(req));
    return res.status(200).json({ success: true, data: router_obj });
  } catch (err) { next(err); }
});

router.post('/:id/disable', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const router_obj = await service.disableRouter(req.params.id, tid(req));
    return res.status(200).json({ success: true, data: router_obj });
  } catch (err) { next(err); }
});

router.post('/:id/test-connection', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.testRouterConnection(req.params.id, req.body, tid(req));
    return res.status(result.success ? 200 : 400).json({ success: result.success, data: result });
  } catch (err: any) { return res.status(400).json({ success: false, message: err.message }); }
});

router.get('/:id/health', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getRouterHealthDetails(req.params.id, tid(req));
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;
