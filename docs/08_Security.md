# 08_Security.md

# Security Specification

## DeRoyal Hotspot OS (DHOS)

**Version:** 1.0

**Status:** Phase One

---

# 1. Purpose

This document defines the security requirements for DeRoyal Hotspot OS.

Security applies to the frontend, backend, database, server, and MikroTik integration.

The system must follow the principle of least privilege.

---

# 2. Security Objectives

Protect administrator accounts.

Protect customer sessions.

Protect voucher integrity.

Prevent unauthorized hotspot access.

Secure communication with MikroTik.

Protect sensitive configuration.

Provide complete auditability.

---

# 3. Authentication

Administrator authentication uses:

Email

Password

JWT Access Token

Passwords must never be stored in plain text.

Passwords are hashed using Argon2id.

---

# 4. Authorization

Role Based Access Control (RBAC).

Phase One Roles

Super Admin

Administrator

Permissions are checked on every protected endpoint.

Users cannot access endpoints outside their assigned role.

---

# 5. Password Policy

Minimum length

12 characters

Must contain

Uppercase letter

Lowercase letter

Number

Special character

Passwords expire only when manually reset.

---

# 6. JWT Policy

JWT lifetime

8 hours

Refresh tokens are reserved for future versions.

Tokens are signed using a strong secret.

Expired tokens are rejected.

Invalid tokens are rejected.

---

# 7. HTTPS

HTTPS is mandatory.

HTTP requests redirect automatically to HTTPS.

TLS certificates provided through Let's Encrypt.

---

# 8. MikroTik Credentials

Router credentials are never exposed to the frontend.

Credentials are stored encrypted.

Only the Router Service may access them.

Credentials are never written to logs.

---

# 9. Environment Variables

Sensitive values stored outside the source code.

Examples

DATABASE_URL

JWT_SECRET

MIKROTIK_HOST

MIKROTIK_USERNAME

MIKROTIK_PASSWORD

SMTP_PASSWORD

Future payment keys are also stored here.

---

# 10. Database Security

Parameterized queries only.

Prisma ORM handles SQL generation.

No raw SQL unless absolutely necessary.

Database user receives only required permissions.

---

# 11. API Security

Helmet security headers.

CORS configured explicitly.

JSON payload size limited.

Request validation required.

Rate limiting enabled.

---

# 12. Rate Limiting

Login

5 attempts every 15 minutes.

Voucher activation

30 requests per minute.

Administrator API

120 requests per minute.

Health endpoint

Unlimited.

---

# 13. Input Validation

Every request validated.

Reject

Missing fields

Invalid types

Unexpected properties

Invalid formats

Invalid voucher codes

Validation occurs before business logic executes.

---

# 14. Logging

Security events logged.

Examples

Login Success

Login Failure

Password Change

Permission Denied

Voucher Activation

Router Connection Failure

Settings Change

Logs are immutable.

---

# 15. Session Security

Administrator logout invalidates the session.

Expired JWTs require a new login.

Future versions may support token revocation.

---

# 16. File Upload Security

Only administrators may upload files.

Allowed uploads

Logo

Future imports

Allowed types

PNG

JPEG

SVG

Maximum upload size

2 MB

---

# 17. Error Handling

Error responses never expose

Stack traces

Database queries

Environment variables

Router credentials

Internal file paths

---

# 18. Server Security

Ubuntu LTS

Firewall enabled

SSH key authentication

Password login disabled for SSH

Automatic security updates

Fail2Ban recommended

PM2 process monitoring

Nginx reverse proxy

---

# 19. Backup Security

Daily PostgreSQL backups.

Encrypted backup storage.

Backup verification performed regularly.

Retention policy

30 daily backups

12 weekly backups

12 monthly backups

---

# 20. Audit Requirements

Every administrator action records

Administrator ID

IP Address

Timestamp

Affected Resource

Action

Previous Value (where applicable)

New Value (where applicable)

---

# 21. Future Security Enhancements

Two Factor Authentication

Email Verification

Password Reset

Refresh Tokens

Device Management

Session Management

IP Whitelisting

Geo Blocking

Web Application Firewall

---

# 22. Security Success Criteria

The application is considered secure when:

Passwords are protected.

Sensitive configuration remains confidential.

Only authorized administrators access protected features.

Voucher fraud is prevented.

Router credentials remain inaccessible to customers.

All administrator actions are auditable.

The application can be safely deployed to the Contabo VPS with HTTPS enabled.
