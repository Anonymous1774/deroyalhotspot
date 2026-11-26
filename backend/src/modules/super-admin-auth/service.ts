/**
 * Super Admin Auth Service
 */
import prisma from '../../lib/prisma';
import { comparePassword } from '../../utils/hash';
import { signSuperAdminToken } from '../../utils/jwt';
import { SuperAdminLoginInput } from './validator';

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function loginSuperAdmin(data: SuperAdminLoginInput, ipAddress?: string | null) {
  // Only users with isSuperAdmin: true can use this endpoint
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user || !user.isSuperAdmin) {
    throw new AppError('Invalid credentials.', 401);
  }

  if (!user.isActive) {
    throw new AppError('This account has been disabled.', 403);
  }

  const valid = await comparePassword(data.password, user.passwordHash);
  if (!valid) {
    throw new AppError('Invalid credentials.', 401);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  // Platform-level audit log (no tenantId)
  await prisma.auditLog.create({
    data: {
      tenantId: null,
      userId: user.id,
      actorType: 'superadmin',
      actorEmail: user.email,
      action: 'Super Admin Login',
      module: 'AUTH',
      description: `Super Admin ${user.email} logged in.`,
      ipAddress: ipAddress || null,
    },
  });

  const token = signSuperAdminToken({ sub: user.id, email: user.email });

  return {
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      isSuperAdmin: true,
    },
  };
}

export async function getSuperAdminProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isSuperAdmin || !user.isActive) {
    throw new AppError('Unauthorized.', 401);
  }
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    isSuperAdmin: true,
    lastLogin: user.lastLogin?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}
