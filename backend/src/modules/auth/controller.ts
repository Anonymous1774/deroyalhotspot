import { Request, Response, NextFunction } from 'express';
import prisma from '../../lib/prisma';
import { comparePassword } from '../../utils/hash';
import { signToken } from '../../utils/jwt';
import { loginSchema } from './validator';

/**
 * Handles administrator login.
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Validate incoming parameters
    const validation = loginSchema.safeParse(req.body);
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

    const { email, password } = validation.data;

    // 2. Fetch admin from database
    const admin = await prisma.admin.findUnique({
      where: { email }
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
        error: {
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // 3. Check if administrator account is active
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your administrator account has been disabled. Please contact support.',
        error: {
          code: 'ACCOUNT_DISABLED'
        }
      });
    }

    // 4. Verify password hash
    const isPasswordValid = await comparePassword(password, admin.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
        error: {
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    // 5. Update last login timestamp
    const now = new Date();
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: now }
    });

    // 6. Generate JWT token
    const token = signToken({
      id: admin.id,
      email: admin.email,
      role: admin.role
    });

    // 7. Write activity log
    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'Administrator Login',
        module: 'AUTH',
        description: `Administrator ${admin.email} logged in successfully.`,
        ipAddress: req.ip || null
      }
    });

    // 8. Return response
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        admin: {
          id: admin.id,
          fullName: admin.fullName,
          email: admin.email,
          role: admin.role,
          lastLogin: now.toISOString()
        },
        expiresIn: '8h'
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Handles retrieving the authenticated administrator's profile.
 */
export async function profile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized.'
      });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id }
    });

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Account is inactive or does not exist.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile fetched successfully.',
      data: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin ? admin.lastLogin.toISOString() : null,
        createdAt: admin.createdAt.toISOString()
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Handles logging out the current session.
 */
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.admin) {
      // Write activity log for audit purposes
      await prisma.activityLog.create({
        data: {
          adminId: req.admin.id,
          action: 'Administrator Logout',
          module: 'AUTH',
          description: `Administrator ${req.admin.email} logged out successfully.`,
          ipAddress: req.ip || null
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Logout successful.'
    });

  } catch (error) {
    next(error);
  }
}
