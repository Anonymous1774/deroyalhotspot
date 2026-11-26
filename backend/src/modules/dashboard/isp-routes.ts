/**
 * ISP API v1 — Dashboard module
 * Mounted at: /api/v1/dashboard
 * Protected by authenticateIsp — all queries scoped to req.ispUser.tenantId
 */
import { Router, Request, Response, NextFunction } from 'express';
import { authenticateIsp } from '../../middleware/auth';
import * as service from './service';

const router = Router();
router.use(authenticateIsp as any);

function tid(req: Request) { return (req as any).ispUser?.tenantId as string | undefined; }

router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { routerId } = req.query;
    const stats = await service.getDashboardStats(
      routerId ? String(routerId) : undefined,
      tid(req)
    );
    return res.status(200).json({ success: true, data: stats });
  } catch (err) { next(err); }
});

export default router;
