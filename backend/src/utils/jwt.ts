/**
 * DHOS Multi-Tenant JWT Utilities
 * ================================
 * Supports three distinct token types:
 *   - 'superadmin' : Platform Super Admin (no tenantId)
 *   - 'isp'        : ISP owner or staff member (has tenantId + tenantRole)
 *   - 'customer'   : Internet customer account (has tenantId)
 *
 * IMPORTANT: Never use a hardcoded fallback secret in production.
 * The JWT_SECRET environment variable MUST be set.
 */

import jwt from 'jsonwebtoken';
// TenantRole type — mirrors the Prisma enum.
// Using a local type so this file compiles before `prisma generate` runs.
export type TenantRole =
  | 'OWNER'
  | 'ADMINISTRATOR'
  | 'NETWORK_MANAGER'
  | 'FINANCE_MANAGER'
  | 'SUPPORT_AGENT'
  | 'STAFF';

// Fail fast at startup if secret is missing
function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable is not set. Refusing to start.');
    }
    // Dev-only fallback — clearly labelled, not a real secret
    console.warn('[JWT] WARNING: JWT_SECRET not set. Using insecure development fallback.');
    return 'dhos-dev-only-insecure-secret-do-not-use-in-production';
  }
  return secret;
}

// ─── Payload types ────────────────────────────────────────────

export interface SuperAdminJwtPayload {
  sub: string;      // User.id
  email: string;
  type: 'superadmin';
  iat?: number;
  exp?: number;
}

export interface IspJwtPayload {
  sub: string;      // User.id
  email: string;
  tenantId: string; // Tenant.id — required for all tenant-scoped queries
  tenantRole: TenantRole;
  type: 'isp';
  iat?: number;
  exp?: number;
}

export interface CustomerJwtPayload {
  sub: string;      // Customer.id
  tenantId: string; // Tenant.id the customer belongs to
  email?: string;
  type: 'customer';
  iat?: number;
  exp?: number;
}

export type AnyJwtPayload = SuperAdminJwtPayload | IspJwtPayload | CustomerJwtPayload;

// ─── Sign ────────────────────────────────────────────────────

export function signSuperAdminToken(payload: Omit<SuperAdminJwtPayload, 'type' | 'iat' | 'exp'>): string {
  return jwt.sign({ ...payload, type: 'superadmin' }, getSecret(), { expiresIn: '8h' });
}

export function signIspToken(payload: Omit<IspJwtPayload, 'type' | 'iat' | 'exp'>): string {
  return jwt.sign({ ...payload, type: 'isp' }, getSecret(), { expiresIn: '8h' });
}

export function signCustomerToken(payload: Omit<CustomerJwtPayload, 'type' | 'iat' | 'exp'>): string {
  return jwt.sign({ ...payload, type: 'customer' }, getSecret(), { expiresIn: '7d' });
}

// ─── Verify ──────────────────────────────────────────────────

export function verifyToken(token: string): AnyJwtPayload | null {
  try {
    return jwt.verify(token, getSecret()) as AnyJwtPayload;
  } catch {
    return null;
  }
}

// Typed helpers for each token type

export function verifyIspToken(token: string): IspJwtPayload | null {
  const decoded = verifyToken(token);
  if (decoded && decoded.type === 'isp') return decoded as IspJwtPayload;
  return null;
}

export function verifySuperAdminToken(token: string): SuperAdminJwtPayload | null {
  const decoded = verifyToken(token);
  if (decoded && decoded.type === 'superadmin') return decoded as SuperAdminJwtPayload;
  return null;
}

export function verifyCustomerToken(token: string): CustomerJwtPayload | null {
  const decoded = verifyToken(token);
  if (decoded && decoded.type === 'customer') return decoded as CustomerJwtPayload;
  return null;
}

// ─── Backward-compat shim ────────────────────────────────────
// Preserves the old signToken / verifyToken signatures so existing
// auth controller code continues to compile during Stage 3 migration.

/** @deprecated Use signIspToken / signSuperAdminToken instead */
export function signToken(payload: { id: string; email: string; role: string }): string {
  console.warn('[JWT] signToken() is deprecated. Use signIspToken() or signSuperAdminToken().');
  return jwt.sign(payload, getSecret(), { expiresIn: '8h' });
}
