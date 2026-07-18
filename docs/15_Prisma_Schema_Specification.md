# 15_Prisma_Schema_Specification.md

# Prisma Schema Specification

## DeRoyal Hotspot OS (DHOS)

**Version:** 1.0

**Database:** PostgreSQL

**ORM:** Prisma

---

# 1. Purpose

This document defines every Prisma model that must exist in the application.

No model should be created outside this specification without approval.

---

# 2. General Rules

Use UUIDs for all primary keys.

Use Prisma relations.

Use `createdAt` and `updatedAt` on every model.

Use enums where appropriate.

Never duplicate data.

---

# 3. Enums

## AdminRole

```text
SUPER_ADMIN

ADMIN
```

## VoucherStatus

```text
UNUSED

ACTIVE

EXPIRED

DISABLED
```

## SessionStatus

```text
ONLINE

OFFLINE

EXPIRED

DISCONNECTED
```

## RouterStatus

```text
ONLINE

OFFLINE
```

---

# 4. Model: Admin

Fields

```text
id

fullName

email

passwordHash

role

isActive

lastLogin

createdAt

updatedAt
```

Relations

```text
ActivityLogs
```

---

# 5. Model: BandwidthProfile

Fields

```text
id

name

downloadSpeed

uploadSpeed

mikrotikQueueName

status

createdAt

updatedAt
```

Relations

```text
Plans
```

---

# 6. Model: Plan

Fields

```text
id

name

price

duration

durationUnit

bandwidthProfileId

status

createdAt

updatedAt
```

Relations

```text
BandwidthProfile

Vouchers
```

---

# 7. Model: Voucher

Fields

```text
id

code

planId

status

activatedAt

expiresAt

activatedIp

activatedMac

mikrotikUsername

createdAt

updatedAt
```

Relations

```text
Plan

HotspotSession
```

---

# 8. Model: HotspotSession

Fields

```text
id

voucherId

username

ipAddress

macAddress

loginTime

logoutTime

sessionDuration

status

createdAt
```

Relations

```text
Voucher
```

---

# 9. Model: Router

Fields

```text
id

name

host

apiPort

username

encryptedPassword

status

enabled

lastConnected

createdAt

updatedAt
```

Relations

None in Phase One.

---

# 10. Model: ActivityLog

Fields

```text
id

adminId

action

module

description

ipAddress

createdAt
```

Relations

```text
Admin
```

---

# 11. Model: SystemSetting

Fields

```text
id

key

value

updatedAt
```

---

# 12. Relationships

```text
BandwidthProfile

↓

Plan

↓

Voucher

↓

HotspotSession
```

```text
Admin

↓

ActivityLog
```

---

# 13. Unique Constraints

Admin.email

BandwidthProfile.name

Voucher.code

SystemSetting.key

Router.name

---

# 14. Indexes

Voucher.code

Voucher.status

Voucher.planId

Plan.bandwidthProfileId

HotspotSession.username

HotspotSession.macAddress

ActivityLog.createdAt

Router.status

---

# 15. Soft Deletes

Phase One

No soft deletes.

Future versions may introduce `deletedAt` for selected models.

---

# 16. Seed Data

Create the following initial data.

Administrator account.

Bronze profile.

Silver profile.

Gold profile.

Internet plans.

System settings.

---

# 17. Migration Rules

Every schema change requires:

New migration.

Migration review.

Testing.

Documentation update.

---

# 18. Future Models

Payment

Transaction

Customer

Notification

Reseller

Location

UsageReport

AuditLog

WebhookEvent

---

# 19. Success Criteria

The Prisma schema is complete when:

Every documented feature maps to a Prisma model.

Relationships are normalized.

Indexes support common queries.

Migrations execute successfully.

No undocumented tables or fields exist.
