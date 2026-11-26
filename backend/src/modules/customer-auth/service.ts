/**
 * Customer Auth Service
 */
import prisma from '../../lib/prisma';
import { hashPassword, comparePassword } from '../../utils/hash';
import { signCustomerToken } from '../../utils/jwt';
import { CustomerRegisterInput, CustomerLoginInput } from './validator';

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function getTenantBySlug(slug: string) {
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant || tenant.status !== 'ACTIVE') {
    throw new AppError('Service not found or unavailable.', 404);
  }
  return tenant;
}

export async function registerCustomer(data: CustomerRegisterInput, ipAddress?: string | null) {
  const tenant = await getTenantBySlug(data.tenantSlug);

  // Check email uniqueness within tenant
  const existing = await prisma.customer.findFirst({
    where: { tenantId: tenant.id, email: data.email },
  });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const passwordHash = await hashPassword(data.password);

  const customer = await prisma.customer.create({
    data: {
      tenantId: tenant.id,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || null,
      passwordHash,
      isActive: true,
      isGuest: false,
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId: tenant.id,
      actorType: 'customer',
      actorEmail: customer.email || undefined,
      action: 'Customer Registration',
      module: 'AUTH',
      description: `Customer ${customer.email} registered with ${tenant.name}.`,
      ipAddress: ipAddress || null,
    },
  });

  const token = signCustomerToken({
    sub: customer.id,
    tenantId: tenant.id,
    email: customer.email || undefined,
  });

  return {
    token,
    customer: {
      id: customer.id,
      fullName: customer.fullName,
      email: customer.email,
      tenantId: tenant.id,
    },
  };
}

export async function loginCustomer(data: CustomerLoginInput, ipAddress?: string | null) {
  const tenant = await getTenantBySlug(data.tenantSlug);

  const customer = await prisma.customer.findFirst({
    where: { tenantId: tenant.id, email: data.email },
  });

  if (!customer || !customer.passwordHash) {
    throw new AppError('Invalid email address or password.', 401);
  }

  if (!customer.isActive) {
    throw new AppError('Your account has been disabled. Please contact support.', 403);
  }

  const valid = await comparePassword(data.password, customer.passwordHash);
  if (!valid) {
    throw new AppError('Invalid email address or password.', 401);
  }

  await prisma.customer.update({
    where: { id: customer.id },
    data: { lastLogin: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      tenantId: tenant.id,
      actorType: 'customer',
      actorEmail: customer.email || undefined,
      action: 'Customer Login',
      module: 'AUTH',
      description: `Customer ${customer.email} logged in.`,
      ipAddress: ipAddress || null,
    },
  });

  const token = signCustomerToken({
    sub: customer.id,
    tenantId: tenant.id,
    email: customer.email || undefined,
  });

  return {
    token,
    customer: {
      id: customer.id,
      fullName: customer.fullName,
      email: customer.email,
      tenantId: tenant.id,
    },
  };
}

export async function getCustomerProfile(customerId: string, tenantId: string) {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, tenantId },
  });
  if (!customer || !customer.isActive) {
    throw new AppError('Customer not found.', 404);
  }
  return {
    id: customer.id,
    fullName: customer.fullName,
    email: customer.email,
    phone: customer.phone,
    tenantId: customer.tenantId,
    createdAt: customer.createdAt.toISOString(),
  };
}
