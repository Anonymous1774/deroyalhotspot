import { Request, Response, NextFunction } from 'express';
import * as service from './service';
import { createProfileSchema, updateProfileSchema } from './validator';
import prisma from '../../lib/prisma';

/**
 * Controller to create a new bandwidth profile.
 */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Validate payload
    const validation = createProfileSchema.safeParse(req.body);
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
    const profile = await service.createProfile(validation.data);

    // 3. Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin?.id || null,
        action: 'Bandwidth Profile Created',
        module: 'SETTINGS',
        description: `Bandwidth profile '${profile.name}' was created.`,
        ipAddress: req.ip || null
      }
    });

    // 4. Return response
    return res.status(201).json({
      success: true,
      message: 'Bandwidth profile created successfully.',
      data: profile
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Controller to list all bandwidth profiles.
 */
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const profiles = await service.getAllProfiles();
    return res.status(200).json({
      success: true,
      message: 'Bandwidth profiles retrieved successfully.',
      data: profiles
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to get a single bandwidth profile.
 */
export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await service.getProfileById(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Bandwidth profile retrieved successfully.',
      data: profile
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to update a bandwidth profile.
 */
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Validate payload
    const validation = updateProfileSchema.safeParse(req.body);
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
    const profile = await service.updateProfile(req.params.id, validation.data);

    // 3. Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin?.id || null,
        action: 'Bandwidth Profile Updated',
        module: 'SETTINGS',
        description: `Bandwidth profile '${profile.name}' was updated.`,
        ipAddress: req.ip || null
      }
    });

    // 4. Return response
    return res.status(200).json({
      success: true,
      message: 'Bandwidth profile updated successfully.',
      data: profile
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Controller to delete a bandwidth profile.
 */
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Call service
    const profile = await service.deleteProfile(req.params.id);

    // 2. Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin?.id || null,
        action: 'Bandwidth Profile Deleted',
        module: 'SETTINGS',
        description: `Bandwidth profile '${profile.name}' (ID: ${profile.id}) was deleted.`,
        ipAddress: req.ip || null
      }
    });

    // 3. Return response
    return res.status(200).json({
      success: true,
      message: 'Bandwidth profile deleted successfully.',
      data: {
        id: profile.id,
        name: profile.name
      }
    });

  } catch (error) {
    next(error);
  }
}
