# Production Migration Guide — DHOS Multi-Tenant

> [!CAUTION]
> Run the database backup step first. Never skip it. Never delete existing records.
> All migration scripts are **additive** — they create new rows, never drop or modify existing data destructively.

---

## Pre-Migration Checklist

- [ ] Server is accessible via SSH
- [ ] All DNS A records are configured and resolving (see `dns-records.md`)
- [ ] Apache + SSL are configured (see `ssl-setup.md`)
- [ ] PostgreSQL is running and accessible
- [ ] Node.js v18+ is installed
- [ ] PM2 is installed globally: `npm install -g pm2`

---

## Step 1 — Backup the Database

```bash
# Run on the VPS. Replace $DATABASE_URL with your actual connection string if not set.
pg_dump $DATABASE_URL > dhos_backup_$(date +%Y%m%d_%H%M%S).sql

# Verify the backup file is non-empty
ls -lh dhos_backup_*.sql
```

> [!CAUTION]
> Do NOT proceed until a valid backup file exists. Store it somewhere safe (e.g. a separate server or object storage).

---

## Step 2 — Pull Latest Code

```bash
cd /var/www/deroyal-hotspot-os
git pull origin main
```

---

## Step 3 — Install Dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

---

## Step 4 — Build the Frontend

```bash
cd /var/www/deroyal-hotspot-os/frontend
npm run build
# Output: frontend/dist/
```

---

## Step 5 — Run Database Migrations

```bash
cd /var/www/deroyal-hotspot-os/backend

# Generate Prisma client for the new schema
npx prisma generate

# Apply all pending migrations to the database
npx prisma migrate deploy
```

> [!NOTE]
> `migrate deploy` applies migrations in order. It is safe to run on an existing database — it only applies unapplied migrations.

---

## Step 6 — Run the Multi-Tenant Seed Migration

This script creates the first tenant (De Royal Hotspot) from existing data.

```bash
cd /var/www/deroyal-hotspot-os/backend

npx ts-node --project tsconfig.json prisma/seed/migrate-to-multitenant.ts
```

**What this script does:**
1. Creates the `De Royal Hotspot` tenant record (if it doesn't already exist)
2. Associates existing admin users with the new tenant
3. Associates existing routers, plans, vouchers, sessions with the tenant
4. Creates a default subscription plan and assigns it to the tenant
5. Writes an audit log entry

**Verify zero nulls (run in psql):**
```sql
-- All routers should have a tenantId
SELECT COUNT(*) FROM "Router" WHERE "tenantId" IS NULL;
-- Should return 0

-- All vouchers should have a tenantId
SELECT COUNT(*) FROM "Voucher" WHERE "tenantId" IS NULL;
-- Should return 0
```

---

## Step 7 — Restart the Backend

```bash
# If using PM2
pm2 restart dhos-backend

# Check it is running
pm2 status
pm2 logs dhos-backend --lines 50
```

---

## Step 8 — Provision the First Super Admin

Super Admin accounts are never created via public registration. Run this one-time setup script:

```bash
cd /var/www/deroyal-hotspot-os/backend
npx ts-node --project tsconfig.json prisma/seed/create-super-admin.ts
```

This script will prompt for the Super Admin's email and password, then create the account with `isSuperAdmin: true`.

**Alternatively**, run directly in psql — but use the application's script to ensure Argon2id hashing is applied correctly.

---

## Step 9 — Smoke Tests

```bash
# Public website
curl -I https://deroyalhotspot.name.ng

# API health check
curl https://api.deroyalhotspot.name.ng/api/v1/health

# ISP login (should return 400 if no body, not 500)
curl -X POST https://api.deroyalhotspot.name.ng/api/v1/isp/auth/login \
  -H "Content-Type: application/json" -d '{}'

# Platform login
curl -X POST https://api.deroyalhotspot.name.ng/api/v1/platform/auth/login \
  -H "Content-Type: application/json" -d '{}'

# Legacy admin routes (backward compat)
curl -I https://deroyalhotspot.name.ng/admin/login
```

---

## Rollback Plan

If something goes wrong after migration:

```bash
# 1. Restore the database backup
psql $DATABASE_URL < dhos_backup_YYYYMMDD_HHMMSS.sql

# 2. Roll back to previous git commit
git checkout HEAD~1

# 3. Rebuild and restart
cd frontend && npm run build
cd ../backend && pm2 restart dhos-backend
```

---

## Environment Variables Required

See `.env.example` for the complete list. Critical new variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for existing admin tokens |
| `ISP_JWT_SECRET` | Secret for ISP tenant tokens |
| `PLATFORM_JWT_SECRET` | Secret for Super Admin tokens |
| `CUSTOMER_JWT_SECRET` | Secret for customer account tokens |
| `NODE_ENV` | Set to `production` |
| `PORT` | Backend port (default 5000) |
| `CORS_ORIGINS` | Comma-separated allowed origins |
