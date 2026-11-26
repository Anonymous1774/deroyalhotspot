import { Request, Response, NextFunction } from 'express';
import * as service from './service';
import { customerRegisterSchema, customerLoginSchema } from './validator';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const v = customerRegisterSchema.safeParse(req.body);
    if (!v.success) {
      return res.status(422).json({ success: false, message: 'Validation failed', error: { code: 'VALIDATION_ERROR', details: v.error.format() } });
    }
    const result = await service.registerCustomer(v.data, req.ip);
    return res.status(201).json({ success: true, message: 'Account created successfully.', data: result });
  } catch (err: any) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const v = customerLoginSchema.safeParse(req.body);
    if (!v.success) {
      return res.status(422).json({ success: false, message: 'Validation failed', error: { code: 'VALIDATION_ERROR', details: v.error.format() } });
    }
    const result = await service.loginCustomer(v.data, req.ip);
    return res.status(200).json({ success: true, message: 'Login successful.', data: result });
  } catch (err: any) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
    next(err);
  }
}

export async function profile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.customer) return res.status(401).json({ success: false, message: 'Unauthorized.' });
    const data = await service.getCustomerProfile(req.customer.id, req.customer.tenantId);
    return res.status(200).json({ success: true, message: 'Profile fetched.', data });
  } catch (err: any) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
    next(err);
  }
}

export async function logout(_req: Request, res: Response) {
  return res.status(200).json({ success: true, message: 'Logged out successfully.' });
}
