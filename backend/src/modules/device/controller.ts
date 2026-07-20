import { Request, Response, NextFunction } from 'express';
import * as service from './service';
import { reauthenticateSchema } from './validator';

/**
 * Controller to verify client device registration.
 */
export async function check(req: Request, res: Response, next: NextFunction) {
  try {
    const mac = typeof req.query.mac === 'string' ? req.query.mac : '';
    if (!mac) {
      return res.status(200).json({
        success: true,
        data: {
          registered: false,
          voucherActive: false
        }
      });
    }

    const result = await service.checkDeviceRegistration(mac);
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to re-authenticate a registered client device.
 */
export async function reauthenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const validation = reauthenticateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        error: {
          code: 'VALIDATION_ERROR',
          details: validation.error.format()
        }
      });
    }

    const { mac, ip } = validation.data;
    const result = await service.reauthenticateDevice(mac, ip);

    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
}
