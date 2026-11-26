import { Request, Response, NextFunction } from 'express';
import * as service from './service';
import { superAdminLoginSchema } from './validator';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const v = superAdminLoginSchema.safeParse(req.body);
    if (!v.success) {
      return res.status(422).json({ success: false, message: 'Validation failed', error: { code: 'VALIDATION_ERROR', details: v.error.format() } });
    }
    const result = await service.loginSuperAdmin(v.data, req.ip);
    return res.status(200).json({ success: true, message: 'Login successful.', data: result });
  } catch (err: any) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
    next(err);
  }
}

export async function profile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.superAdmin) return res.status(401).json({ success: false, message: 'Unauthorized.' });
    const data = await service.getSuperAdminProfile(req.superAdmin.id);
    return res.status(200).json({ success: true, message: 'Profile fetched.', data });
  } catch (err: any) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
    next(err);
  }
}

export async function logout(_req: Request, res: Response) {
  return res.status(200).json({ success: true, message: 'Logged out successfully.' });
}
