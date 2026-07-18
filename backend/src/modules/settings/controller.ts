import { Request, Response, NextFunction } from 'express';
import * as service from './service';
import { updateSettingsSchema } from './validator';
import prisma from '../../lib/prisma';

/**
 * Controller to fetch system and router configurations.
 */
export async function fetch(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await service.getSettings();

    return res.status(200).json({
      success: true,
      message: 'System settings retrieved successfully.',
      data: settings
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to update system and router settings.
 */
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Validate payload
    const validation = updateSettingsSchema.safeParse(req.body);
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

    // 2. Call service
    const settings = await service.updateSettings(validation.data);

    // 3. Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin?.id || null,
        action: 'Settings Updated',
        module: 'SETTINGS',
        description: 'System configurations and RouterOS credentials updated.',
        ipAddress: req.ip || null
      }
    });

    // 4. Return response
    return res.status(200).json({
      success: true,
      message: 'System settings updated successfully.',
      data: settings
    });

  } catch (error) {
    next(error);
  }
}
