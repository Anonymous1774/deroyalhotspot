/**
 * Tenants module — ISP owner self-service:
 *  GET  /api/v1/tenants/me          → their own tenant profile
 *  PUT  /api/v1/tenants/me          → update business info
 *  GET  /api/v1/tenants/me/subscription → their subscription
 *  GET  /api/v1/tenants/me/staff    → list staff
 *  POST /api/v1/tenants/me/staff    → invite staff member
 *  PUT  /api/v1/tenants/me/staff/:userId/role → update role
 *  DELETE /api/v1/tenants/me/staff/:userId    → remove staff
 */
import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import prisma from '../../lib/prisma';
import { hashPassword } from '../../utils/hash';
import { authenticateIsp, requireTenantOwner, requireTenantAdmin } from '../../middleware/auth';
import { z } from 'zod';

const router = Router();
router.use(authenticateIsp);

// ─── Helpers ──────────────────────────────────────────────────

function ok(res: Response, data: any, message = 'Success', status = 200) {
  return res.status(status).json({ success: true, message, data });
}
function fail(res: Response, e: any) {
  if (e.statusCode) return res.status(e.statusCode).json({ success: false, message: e.message });
  return res.status(500).json({ success: false, message: 'Internal server error.' });
}

// ─── GET /me ─────────────────────────────────────────────────

router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.ispUser!.tenantId },
      include: {
        _count: { select: { routers: true, plans: true, vouchers: true, customers: true, tenantUsers: true } },
      },
    });
    if (!tenant) return res.status(404).json({ success: false, message: 'Workspace not found.' });
    return ok(res, tenant);
  } catch (e) { next(e); }
});

// ─── PUT /me ─────────────────────────────────────────────────

const updateTenantSchema = z.object({
  name:    z.string().min(2).max(120).optional(),
  phone:   z.string().max(20).optional(),
  country: z.string().max(60).optional(),
  address: z.string().max(255).optional(),
});

router.put('/me', requireTenantOwner, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const v = updateTenantSchema.safeParse(req.body);
    if (!v.success) return res.status(422).json({ success: false, message: 'Validation failed', error: v.error.format() });

    const updated = await prisma.tenant.update({
      where: { id: req.ispUser!.tenantId },
      data: v.data,
    });

    await prisma.auditLog.create({
      data: {
        tenantId: req.ispUser!.tenantId,
        userId: req.ispUser!.id,
        actorType: 'owner',
        actorEmail: req.ispUser!.email,
        action: 'Business Profile Updated',
        module: 'TENANTS',
        description: `Business profile updated by ${req.ispUser!.email}.`,
      },
    });

    return ok(res, updated, 'Business profile updated.');
  } catch (e) { next(e); }
});

// ─── GET /me/subscription ────────────────────────────────────

router.get('/me/subscription', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sub = await prisma.tenantSubscription.findUnique({
      where: { tenantId: req.ispUser!.tenantId },
      include: { plan: true, payments: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });
    return ok(res, sub);
  } catch (e) { next(e); }
});

// ─── GET /me/staff ────────────────────────────────────────────

router.get('/me/staff', requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const staff = await prisma.tenantUser.findMany({
      where: { tenantId: req.ispUser!.tenantId },
      include: { user: { select: { id: true, fullName: true, email: true, isActive: true, lastLogin: true, createdAt: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return ok(res, staff);
  } catch (e) { next(e); }
});

// ─── POST /me/staff (invite) ──────────────────────────────────

const inviteStaffSchema = z.object({
  fullName: z.string().min(2).max(120),
  email:    z.string().email(),
  password: z.string().min(8).max(128),
  role:     z.enum(['ADMINISTRATOR', 'NETWORK_MANAGER', 'FINANCE_MANAGER', 'SUPPORT_AGENT', 'STAFF']),
});

router.post('/me/staff', requireTenantOwner, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const v = inviteStaffSchema.safeParse(req.body);
    if (!v.success) return res.status(422).json({ success: false, message: 'Validation failed', error: v.error.format() });

    // Check subscription staff limit
    const sub = await prisma.tenantSubscription.findUnique({
      where: { tenantId: req.ispUser!.tenantId },
      include: { plan: true },
    });
    const currentStaffCount = await prisma.tenantUser.count({
      where: { tenantId: req.ispUser!.tenantId, isActive: true },
    });
    if (sub && currentStaffCount >= sub.plan.staffLimit) {
      return res.status(403).json({
        success: false,
        message: `Your subscription plan allows a maximum of ${sub.plan.staffLimit} staff accounts. Please upgrade to add more.`,
        error: { code: 'STAFF_LIMIT_REACHED' },
      });
    }

    // Create or find user, then link to tenant
    const passwordHash = await hashPassword(v.data.password);

    let user = await prisma.user.findUnique({ where: { email: v.data.email } });
    if (!user) {
      user = await prisma.user.create({
        data: { fullName: v.data.fullName, email: v.data.email, passwordHash, isActive: true },
      });
    }

    // Check not already in this tenant
    const existing = await prisma.tenantUser.findFirst({
      where: { tenantId: req.ispUser!.tenantId, userId: user.id },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'This user is already a member of your workspace.' });
    }

    const tenantUser = await prisma.tenantUser.create({
      data: { tenantId: req.ispUser!.tenantId, userId: user.id, role: v.data.role },
      include: { user: { select: { id: true, fullName: true, email: true } } },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: req.ispUser!.tenantId,
        userId: req.ispUser!.id,
        actorType: 'owner',
        actorEmail: req.ispUser!.email,
        action: 'Staff Member Added',
        module: 'TENANTS',
        description: `${v.data.email} added as ${v.data.role} by ${req.ispUser!.email}.`,
      },
    });

    return ok(res, tenantUser, 'Staff member added.', 201);
  } catch (e) { next(e); }
});

// ─── PUT /me/staff/:userId/role ───────────────────────────────

const updateRoleSchema = z.object({
  role: z.enum(['ADMINISTRATOR', 'NETWORK_MANAGER', 'FINANCE_MANAGER', 'SUPPORT_AGENT', 'STAFF']),
});

router.put('/me/staff/:userId/role', requireTenantOwner, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const v = updateRoleSchema.safeParse(req.body);
    if (!v.success) return res.status(422).json({ success: false, message: 'Validation failed', error: v.error.format() });

    // Cannot demote self
    if (req.params.userId === req.ispUser!.id) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role.' });
    }

    const tenantUser = await prisma.tenantUser.findFirst({
      where: { tenantId: req.ispUser!.tenantId, userId: req.params.userId },
    });
    if (!tenantUser) return res.status(404).json({ success: false, message: 'Staff member not found.' });

    // Cannot change another OWNER's role
    if (tenantUser.role === 'OWNER') {
      return res.status(403).json({ success: false, message: 'The workspace owner role cannot be changed.' });
    }

    const updated = await prisma.tenantUser.update({
      where: { id: tenantUser.id },
      data: { role: v.data.role },
    });

    return ok(res, updated, 'Role updated.');
  } catch (e) { next(e); }
});

// ─── DELETE /me/staff/:userId ─────────────────────────────────

router.delete('/me/staff/:userId', requireTenantOwner, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.params.userId === req.ispUser!.id) {
      return res.status(400).json({ success: false, message: 'You cannot remove yourself from the workspace.' });
    }

    const tenantUser = await prisma.tenantUser.findFirst({
      where: { tenantId: req.ispUser!.tenantId, userId: req.params.userId },
    });
    if (!tenantUser) return res.status(404).json({ success: false, message: 'Staff member not found.' });
    if (tenantUser.role === 'OWNER') return res.status(403).json({ success: false, message: 'Cannot remove the workspace owner.' });

    await prisma.tenantUser.update({ where: { id: tenantUser.id }, data: { isActive: false } });

    return ok(res, null, 'Staff member removed.');
  } catch (e) { next(e); }
});

export default router;
