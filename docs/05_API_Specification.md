# 05_API_Specification.md

# REST API Specification

## DeRoyal Hotspot OS (DHOS)

**Version:** 1.0

**Architecture:** REST API

**Base URL (Production):**

`https://deroyalhotspot.name.ng/api/v1`

**Content Type**

`application/json`

---

# 1. Overview

This document defines every API endpoint required for Phase One.

The frontend communicates **only** with these APIs.

No frontend component communicates directly with PostgreSQL or the MikroTik router.

---

# 2. API Standards

Every request must use HTTPS.

All responses must be JSON.

All protected endpoints require a JWT access token.

Every response follows a consistent format.

Success

```json
{
    "success": true,
    "message": "Operation successful",
    "data": {}
}
```

Failure

```json
{
    "success": false,
    "message": "Operation failed",
    "error": {}
}
```

---

# 3. Authentication

## POST

`/auth/login`

Purpose

Administrator login.

Request

```json
{
    "email":"admin@example.com",
    "password":"password"
}
```

Success

Returns

JWT

Administrator profile

Expiration time

---

## POST

`/auth/logout`

Purpose

Invalidate current session.

---

## GET

`/auth/profile`

Purpose

Returns administrator information.

Authentication required.

---

# 4. Dashboard

## GET

`/dashboard`

Returns

Total plans

Total vouchers

Unused vouchers

Active vouchers

Expired vouchers

Today's activations

Current online users

Router status

Recent activities

Authentication required.

---

# 5. Plans

## GET

`/plans`

Returns all plans.

---

## GET

`/plans/:id`

Returns one plan.

---

## POST

`/plans`

Creates a plan.

Request

```json
{
    "name":"1 Hour",
    "duration":60,
    "durationUnit":"minutes",
    "bandwidthProfile":"Bronze",
    "price":500
}
```

---

## PUT

`/plans/:id`

Updates a plan.

---

## DELETE

`/plans/:id`

Deletes an unused plan.

---

# 6. Vouchers

## GET

`/vouchers`

Returns voucher list.

Supports

Search

Pagination

Status filter

Plan filter

Date filter

---

## GET

`/vouchers/:id`

Returns voucher details.

---

## POST

`/vouchers/generate`

Generates vouchers.

Request

```json
{
    "planId":"uuid",
    "quantity":100
}
```

Returns

Generated voucher list.

---

## DELETE

`/vouchers/:id`

Deletes unused voucher.

---

## POST

`/vouchers/export`

Exports vouchers.

Supported formats

PDF

CSV

---

# 7. Voucher Activation

## POST

`/activate`

Public endpoint.

Customer submits voucher.

Request

```json
{
    "voucher":"ABC123XYZ"
}
```

Validation

Voucher exists

Voucher unused

Plan active

Router online

Returns

Activation successful

Remaining time

Internet granted

---

# 8. Hotspot Users

## GET

`/hotspot/users`

Returns online users.

Authentication required.

---

## GET

`/hotspot/users/:username`

Returns one hotspot user.

---

## POST

`/hotspot/disconnect`

Disconnects hotspot user.

Request

```json
{
    "username":"ABC123XYZ"
}
```

---

## GET

`/hotspot/sessions`

Returns hotspot sessions.

Supports pagination.

---

# 9. Router

## GET

`/router/status`

Returns

Router online status

Router identity

Router uptime

CPU usage

Memory usage

Connected users

Hotspot status

---

## POST

`/router/test`

Tests RouterOS API connection.

---

# 10. Activity Logs

## GET

`/logs`

Returns activity logs.

Supports

Search

Date filter

Pagination

---

# 11. Settings

## GET

`/settings`

Returns all settings.

---

## PUT

`/settings`

Updates system settings.

---

# 12. Health Check

## GET

`/health`

Public endpoint.

Returns

API status

Database status

Router status

Version

Server time

---

# 13. HTTP Status Codes

200

Request successful.

201

Resource created.

400

Invalid request.

401

Unauthorized.

403

Forbidden.

404

Resource not found.

409

Conflict.

422

Validation error.

429

Too many requests.

500

Internal server error.

503

Router unavailable.

---

# 14. Rate Limits

Public endpoints

30 requests per minute.

Administrator endpoints

120 requests per minute.

Login endpoint

5 failed attempts within 15 minutes before temporary lockout.

---

# 15. Validation Rules

Voucher codes

Uppercase automatically.

Trim whitespace.

Ignore leading and trailing spaces.

Reject empty values.

Reject invalid characters.

Plan price

Must be greater than zero.

Voucher quantity

Minimum 1.

Maximum 5000.

---

# 16. Versioning

Current version

v1

Future versions

v2

v3

Older API versions remain supported during migration periods.

---

# 17. Security

JWT required for protected endpoints.

Argon2 password hashing.

Rate limiting.

Input validation.

Request logging.

CORS configuration.

Helmet security headers.

Parameterized database queries.

---

# 18. Future Endpoints

Reserved for Phase Two and beyond.

`/payments`

`/customers`

`/notifications`

`/resellers`

`/locations`

`/routers`

`/analytics`

`/reports`

`/paystack/webhook`

---

# 19. API Success Criteria

The API is considered complete when:

Every frontend feature communicates through documented endpoints.

Responses follow a consistent structure.

Protected routes require authentication.

Public routes expose only necessary information.

Errors are descriptive and standardized.

The API can support future modules without breaking existing integrations.
