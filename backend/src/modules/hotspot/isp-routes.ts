/**
 * ISP API v1 — Sessions module
 * Mounted at: /api/v1/sessions
 * Protected by authenticateIsp — all queries scoped to req.ispUser.tenantId
 */
import { Router, Request, Response, NextFunction } from 'express';
import { authenticateIsp } from '../../middleware/auth';
import * as service from './service';
import { disconnectUserSchema } from './validator';

const router = Router();
router.use(authenticateIsp as any);

function tid(req: Request) { return (req as any).ispUser?.tenantId as string | undefined; }

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, routerId } = req.query as Record<string, string>;
    const result = await service.getActiveSessions({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      routerId,
      tenantId: tid(req)
    });
    return res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
});

router.post('/disconnect', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const v = disconnectUserSchema.safeParse(req.body);
    if (!v.success) return res.status(422).json({ success: false, message: 'Validation failed', error: { code: 'VALIDATION_ERROR', details: v.error.format() } });
    const session = await service.disconnectUser(v.data.username, undefined, tid(req));
    return res.status(200).json({ success: true, data: session });
  } catch (err) { next(err); }
});

router.delete('/purge', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const olderThanDays = req.body.olderThanDays !== undefined ? Number(req.body.olderThanDays) : undefined;
    const result = await service.purgeOldSessions(olderThanDays, tid(req));
    return res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
});

export default router;
