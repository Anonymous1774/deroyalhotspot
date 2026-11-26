import { Request, Response, NextFunction } from 'express';
import * as service from './service';
import { ispRegisterSchema, ispLoginSchema } from './validator';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const v = ispRegisterSchema.safeParse(req.body);
    if (!v.success) {
      return res.status(422).json({ success: false, message: 'Validation failed', error: { code: 'VALIDATION_ERROR', details: v.error.format() } });
    }
    const result = await service.registerIsp(v.data, req.ip);
    return res.status(201).json({ success: true, message: 'Business registered successfully. Welcome to DHOS.', data: result });
  } catch (err: any) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message, error: { code: 'REGISTRATION_ERROR' } });
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const v = ispLoginSchema.safeParse(req.body);
    if (!v.success) {
      return res.status(422).json({ success: false, message: 'Validation failed', error: { code: 'VALIDATION_ERROR', details: v.error.format() } });
    }
    const result = await service.loginIsp(v.data, req.ip);
    return res.status(200).json({ success: true, message: 'Login successful.', data: result });
  } catch (err: any) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message, error: { code: 'LOGIN_ERROR' } });
    next(err);
  }
}

export async function profile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.ispUser) return res.status(401).json({ success: false, message: 'Unauthorized.' });
    const data = await service.getIspProfile(req.ispUser.id, req.ispUser.tenantId);
    return res.status(200).json({ success: true, message: 'Profile fetched.', data });
  } catch (err: any) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
    next(err);
  }
}

export async function logout(req: Request, res: Response) {
  // JWT is stateless; client drops the token. Log the event.
  return res.status(200).json({ success: true, message: 'Logged out successfully.' });
}
