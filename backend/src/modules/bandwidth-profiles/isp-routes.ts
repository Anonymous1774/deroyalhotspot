/**
 * ISP API v1 — Bandwidth Profiles module
 * Mounted at: /api/v1/profiles
 * Protected by authenticateIsp — all queries scoped to req.ispUser.tenantId
 */
import { Router, Request, Response, NextFunction } from 'express';
import { authenticateIsp } from '../../middleware/auth';
import * as service from './service';
import { createProfileSchema, updateProfileSchema } from './validator';

const router = Router();
router.use(authenticateIsp as any);

function tid(req: Request) { return (req as any).ispUser?.tenantId as string | undefined; }

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profiles = await service.getAllProfiles(tid(req));
    return res.status(200).json({ success: true, data: profiles });
  } catch (err) { next(err); }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const v = createProfileSchema.safeParse(req.body);
    if (!v.success) return res.status(422).json({ success: false, message: 'Validation failed', error: { code: 'VALIDATION_ERROR', details: v.error.format() } });
    const profile = await service.createProfile(v.data, tid(req));
    return res.status(201).json({ success: true, data: profile });
  } catch (err) { next(err); }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await service.getProfileById(req.params.id, tid(req));
    return res.status(200).json({ success: true, data: profile });
  } catch (err) { next(err); }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const v = updateProfileSchema.safeParse(req.body);
    if (!v.success) return res.status(422).json({ success: false, message: 'Validation failed', error: { code: 'VALIDATION_ERROR', details: v.error.format() } });
    const profile = await service.updateProfile(req.params.id, v.data, tid(req));
    return res.status(200).json({ success: true, data: profile });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.deleteProfile(req.params.id, tid(req));
    return res.status(200).json({ success: true, message: 'Bandwidth profile deleted.' });
  } catch (err) { next(err); }
});

export default router;
