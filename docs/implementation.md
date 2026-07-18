# DeRoyal Hotspot OS - Implementation Log

This document records the exact details of the implemented milestones, backend modules, database structures, and frontend layouts.

---

## Completed Milestones Summary

### 1. Milestone 1: Project Initialization
- Established base configurations for both `backend` and `frontend`.
- Configured PostgreSQL Docker container.
- Initialized Prisma schema mapping the specifications to PostgreSQL tables.
- Built initial Express server boot configurations and Vite-React routing shells.

### 2. Milestone 2: Authentication
- Created an administrative database seeding script (`backend/prisma/seed.ts`).
- Hashed admin passwords using Argon2id.
- Implemented stateless session logins protected by JWT tokens (8-hour shelf life).
- Configured brute-force rate limit shields restricting login attempts to 5 failures per 15 minutes.
- Secured backend routes with auth validation middleware and integrated user profiles.

### 3. Milestone 3: Bandwidth Profiles
- Implemented full CRUD endpoint handlers for reusable bandwidth speed limits (Bronze, Silver, Gold).
- Added logic checks preventing duplication of profile names.
- Restricted profile deletion if linked to existing plans to prevent cascading orphan records.
- Configured real-time profiles creation/edit modal tables in the administration UI.

### 4. Milestone 4: Internet Plans
- Implemented CRUD handlers for pricing plans (e.g. "1 Hour Regular" at ₦100).
- Linked pricing plans to Bandwidth speed profiles.
- Added referential integrity deletion constraints that block removing plans if they have linked vouchers.
- Created plans UI page with forms, list tables, and select dropdowns matching active speed profiles.

### 5. Milestone 5: Voucher System
- Built Zod schemas validating bulk generation counts (limiting requests to up to 500 codes per call).
- Configured alphanumeric code generator excluding confusing symbols (`O`, `0`, `I`, `1`) to avoid typing issues for customers.
- Loaded active code length configurations dynamically from `SystemSetting.voucher_length`.
- Restored voucher details, plan relations, and search lookups with pagination support.
- Built bulk vouchers generation modal forms, search queries, and CSV file exporter tools in the admin console.

### 6. Milestone 6: Active Sessions
- Configured `GET /api/v1/hotspot/sessions` returning live `ONLINE` hotspot sessions.
- Created `POST /api/v1/hotspot/disconnect` to administratively terminate active sessions. This updates database session rows to `DISCONNECTED` and computes user usage duration logs.
- Wrote disconnections logs in the `ActivityLog` under the `ROUTER` audit module.
- Rendered live active sessions data grids and refresh controls in the admin dashboard.

### 7. Milestone 7: Voucher Activation (Captive Portal)
- Implemented a public public endpoint `POST /api/v1/activate` for client devices.
- Validates voucher existence, ensures it's `UNUSED`, and the associated plan is `ACTIVE`.
- Calculates expiration timestamp based on plan duration and changes status to `ACTIVE`.
- Creates `ONLINE` sessions in the `HotspotSession` table.
- Connected the frontend captive portal page (`/`) to this API, displaying success details (expiry time, plan, code) or failure banners.

### 8. Milestone 8: Activity Logs (Audit Trails)
- Built a system audit route `GET /api/v1/logs` to list and filter admin audits.
- Categorized logs with premium colored borders by module (`AUTH`, `VOUCHER`, `ROUTER`, `SETTINGS`, `SYSTEM`).
- Updated the global Express exception handler to automatically log unhandled 500 server errors under the `SYSTEM` category.
- Designed dynamic search bars, pagination controls, and collapsible details drawers in the admin dashboard.

### 9. Milestone 9: Settings
- Created symmetric AES-256-CBC encryption/decryption utilities inside `backend/src/utils/crypto.ts` to encrypt and store RouterOS credentials.
- Created `GET /api/v1/settings` and `PUT /api/v1/settings` to manage portal information and router configuration records.
- Built a functional configurations page binding state values, saving inputs safely, and recording settings audits.

### 10. Milestone 10: MikroTik Integration - Health & Connection Checks
- Configured Node bindings for the gateway hAP ax3 RouterOS API.
- Implemented a symmetrical config loader decrypting saved credentials.
- Enabled hardware resource queries for CPU load, free memory size, uptime duration, and active online users.
- Supported automatic simulation fallback when no physical router is running locally.
- Added connection testing API commands (`POST /api/v1/router/test`) and dashboard health widgets on the frontend.

### 11. Milestone 11: Dashboard - Statistics & Recent Activity
- Implemented `GET /api/v1/dashboard/stats` to aggregate total plans count, active/unused vouchers counts, and live sessions counts.
- Queried the 5 most recent activity audit logs to feed a dashboard preview logs panel.
- Replaced static dashboard counter card placeholders with dynamically bound state variables.
- Added a stylized list for recent system activity with badge colors matched to log modules.

### 12. Milestone 12: Background Synchronization & Expiration Engine
- Implemented a periodic sync scheduler running every 60 seconds to scan active vouchers past their expiration time.
- Wrote database updates to transition expired vouchers to `EXPIRED` status and corresponding sessions to `DISCONNECTED`.
- Hooked the scheduler into Express server bootstrap and graceful shutdown lifecycle handlers.

### 13. Milestone 13: Testing & Verification
- Configured automated test suites using the native Node test runner (`node:test`).
- Implemented crypto and router mocks tests in `backend/tests/router.test.ts`.
- Implemented password hashing and JWT signing validation tests in `backend/tests/auth.test.ts`.
- Implemented voucher character exclusions and uptime formatting test cases in `backend/tests/business.test.ts`.
- Set up a test script shortcut (`npm test`) in `backend/package.json` to execute all suites.
