# 04_Database_Design.md

# Database Design

## DeRoyal Hotspot OS (DHOS)

**Version:** 1.0

**Database Engine:** PostgreSQL

**ORM:** Prisma

---

# 1. Overview

This document defines the logical database structure for DeRoyal Hotspot OS.

The database is designed to be normalized, scalable, and easy to extend while keeping Phase One simple.

---

# 2. Design Principles

Normalize data to Third Normal Form.

Use UUIDs as primary keys.

Store timestamps in UTC.

Implement soft deletes where appropriate.

Enforce foreign key constraints.

Create indexes on frequently queried fields.

Avoid storing derived values.

---

# 3. Entity Relationship Overview

```text
Admins
   │
   └──────┐

Plans ─────── Vouchers

             │

             │

      HotspotSessions

             │

             │

        ActivityLogs

             │

        SystemSettings
```

---

# 4. Table: admins

Purpose

Stores administrator accounts.

Columns

id

full_name

email

password_hash

role

is_active

last_login

created_at

updated_at

Indexes

email UNIQUE

---

# 5. Table: plans

Purpose

Stores available internet plans.

Columns

id

name

description

duration_value

duration_unit

mikrotik_profile

price

status

created_at

updated_at

Example

1 Hour

3 Hours

24 Hours

7 Days

30 Days

---

# 6. Table: vouchers

Purpose

Stores generated voucher codes.

Columns

id

code

plan_id

status

generated_by

activated_at

expires_at

activated_ip

activated_mac

mikrotik_username

created_at

updated_at

Status Values

Unused

Active

Expired

Disabled

Indexes

code UNIQUE

plan_id

status

---

# 7. Table: hotspot_sessions

Purpose

Stores internet sessions.

Columns

id

voucher_id

username

ip_address

mac_address

login_time

logout_time

session_duration

status

created_at

Status

Online

Offline

Expired

Disconnected

Indexes

username

ip_address

mac_address

---

# 8. Table: activity_logs

Purpose

Stores all administrator and system activities.

Columns

id

action

module

performed_by

ip_address

description

created_at

Examples

Administrator Login

Voucher Generated

Voucher Activated

Voucher Deleted

Router Connected

Router Error

Plan Created

---

# 9. Table: system_settings

Purpose

Stores configurable system settings.

Columns

id

setting_key

setting_value

updated_at

Examples

Company Name

Support Number

Portal Logo

Timezone

Router API Port

Session Timeout

Voucher Length

---

# 10. Relationships

One Plan

↓

Many Vouchers

One Voucher

↓

One Session

One Administrator

↓

Many Activity Logs

---

# 11. Constraints

Voucher code must be unique.

Administrator email must be unique.

A voucher can only be activated once.

A session must belong to one voucher.

A plan cannot be deleted while vouchers exist.

---

# 12. Recommended Indexes

admins.email

plans.name

vouchers.code

vouchers.status

vouchers.plan_id

hotspot_sessions.username

hotspot_sessions.mac_address

activity_logs.created_at

system_settings.setting_key

---

# 13. Future Tables

The following tables are reserved for future phases.

payments

customers

routers

locations

resellers

staff

notifications

transactions

payment_webhooks

audit_logs

---

# 14. Backup Strategy

Automatic PostgreSQL backup every 24 hours.

Retain daily backups for 30 days.

Retain weekly backups for 12 weeks.

Store backups outside the application directory.

Compress backup files before storage.

---

# 15. Data Retention

Hotspot Sessions

12 months

Activity Logs

24 months

Expired Vouchers

Never deleted automatically

System Settings

Permanent

Administrator Accounts

Permanent

---

# 16. Naming Convention

Tables

Plural

Snake case

Columns

Snake case

Primary Keys

id

Foreign Keys

table_name_id

Timestamps

created_at

updated_at

deleted_at

---

# 17. Database Success Criteria

The database design is considered successful when:

Data integrity is enforced through constraints.

Relationships are clearly defined.

Common queries are optimized with indexes.

Future features can be added without restructuring existing tables.

The schema supports secure, efficient, and scalable hotspot management.
