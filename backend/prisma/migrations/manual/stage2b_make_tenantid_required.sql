-- ================================================================
-- DHOS Stage 2b Migration: Make tenantId NOT NULL
-- ================================================================
-- Run ONLY after:
--   1. Stage 2a schema migration has applied successfully
--   2. The seed script has backfilled all tenantId values
--   3. You have verified with:
--        SELECT COUNT(*) FROM routers WHERE tenant_id IS NULL;
--        SELECT COUNT(*) FROM plans WHERE tenant_id IS NULL;
--        SELECT COUNT(*) FROM vouchers WHERE tenant_id IS NULL;
--        SELECT COUNT(*) FROM hotspot_sessions WHERE tenant_id IS NULL;
--        SELECT COUNT(*) FROM bandwidth_profiles WHERE tenant_id IS NULL;
--        SELECT COUNT(*) FROM registered_devices WHERE tenant_id IS NULL;
--      All of the above must return 0 before running this file.
-- ================================================================

-- Make tenantId NOT NULL on routers
ALTER TABLE "routers" ALTER COLUMN "tenant_id" SET NOT NULL;

-- Make tenantId NOT NULL on bandwidth_profiles
ALTER TABLE "bandwidth_profiles" ALTER COLUMN "tenant_id" SET NOT NULL;

-- Make tenantId NOT NULL on plans
ALTER TABLE "plans" ALTER COLUMN "tenant_id" SET NOT NULL;

-- Make tenantId NOT NULL on vouchers
ALTER TABLE "vouchers" ALTER COLUMN "tenant_id" SET NOT NULL;

-- Make tenantId NOT NULL on hotspot_sessions
ALTER TABLE "hotspot_sessions" ALTER COLUMN "tenant_id" SET NOT NULL;

-- Make tenantId NOT NULL on registered_devices
ALTER TABLE "registered_devices" ALTER COLUMN "tenant_id" SET NOT NULL;

-- Verification queries (run after migration):
-- SELECT COUNT(*) FROM routers WHERE tenant_id IS NULL;           -- must be 0
-- SELECT COUNT(*) FROM plans WHERE tenant_id IS NULL;             -- must be 0
-- SELECT COUNT(*) FROM vouchers WHERE tenant_id IS NULL;          -- must be 0
-- SELECT COUNT(*) FROM hotspot_sessions WHERE tenant_id IS NULL;  -- must be 0
-- SELECT COUNT(*) FROM bandwidth_profiles WHERE tenant_id IS NULL; -- must be 0
-- SELECT COUNT(*) FROM registered_devices WHERE tenant_id IS NULL; -- must be 0
