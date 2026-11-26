/**
 * ISP API v1 — Vouchers module
 * Mounted at: /api/v1/vouchers
 * Protected by authenticateIsp — all queries scoped to req.ispUser.tenantId
 */
import { Router, Request, Response, NextFunction } from 'express';
import { authenticateIsp } from '../../middleware/auth';
import * as service from './service';
import { generateVouchersSchema } from './validator';
import prisma from '../../lib/prisma';

const router = Router();
router.use(authenticateIsp as any);

function tid(req: Request) { return (req as any).ispUser?.tenantId as string | undefined; }

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, status, planId, routerId, search } = req.query as Record<string, string>;
    const result = await service.getVouchersList({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status,
      planId,
      routerId,
      search,
      tenantId: tid(req)
    } as any);
    return res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
});

router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const v = generateVouchersSchema.safeParse(req.body);
    if (!v.success) return res.status(422).json({ success: false, message: 'Validation failed', error: { code: 'VALIDATION_ERROR', details: v.error.format() } });
    const vouchers = await service.generateVouchers(v.data, tid(req));
    return res.status(201).json({ success: true, data: vouchers });
  } catch (err) { next(err); }
});

router.put('/:id/disable', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const voucher = await service.disableVoucher(req.params.id, tid(req));
    return res.status(200).json({ success: true, data: voucher });
  } catch (err) { next(err); }
});

router.delete('/delete-all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.deleteAllVouchers(tid(req));
    return res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.deleteVoucher(req.params.id, tid(req));
    return res.status(200).json({ success: true, message: 'Voucher deleted.' });
  } catch (err) { next(err); }
});

export default router;
