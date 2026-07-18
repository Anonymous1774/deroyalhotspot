# 09_Deployment_Guide.md

# Deployment Guide

## DeRoyal Hotspot OS (DHOS)

**Version:** 1.0

**Target Environment:** Production

**Hosting Provider:** Contabo VPS

**Operating System:** Ubuntu Server 24.04 LTS

---

# 1. Purpose

This document describes the complete production deployment process for DeRoyal Hotspot OS.

The deployment must be repeatable, secure, and require minimal manual configuration.

---

# 2. Infrastructure

Domain

deroyalhotspot.name.ng

API

api.deroyalhotspot.name.ng

Server

Contabo VPS

Operating System

Ubuntu 24.04 LTS

Reverse Proxy

Nginx

Process Manager

PM2

Database

PostgreSQL 16

SSL

Let's Encrypt

Firewall

UFW

---

# 3. Software Requirements

Node.js 22 LTS

Git

Nginx

PM2

PostgreSQL

Certbot

OpenSSL

---

# 4. Server Directory Structure

```text
/opt/deroyal-hotspot-os/
│
├── backend/
├── frontend/
├── logs/
├── backups/
├── uploads/
└── scripts/
```

---

# 5. DNS Configuration

Create the following DNS records.

A Record

deroyalhotspot.name.ng

Points to

Contabo VPS IP

A Record

api.deroyalhotspot.name.ng

Points to

Contabo VPS IP

---

# 6. Nginx Configuration

Frontend

Serve compiled React application.

Backend

Reverse proxy all `/api` requests to the Express server.

Enable Gzip compression.

Enable HTTP to HTTPS redirection.

---

# 7. SSL

Use Let's Encrypt.

Automatically renew certificates.

Renewal should be scheduled using Cron.

---

# 8. Backend Deployment

Clone repository.

Install dependencies.

Configure environment variables.

Run database migrations.

Generate Prisma client.

Build application.

Start using PM2.

---

# 9. Frontend Deployment

Install dependencies.

Build production assets.

Copy generated files to the web root.

Configure Nginx to serve the application.

---

# 10. Database

Install PostgreSQL.

Create production database.

Create dedicated database user.

Restrict remote access.

Run Prisma migrations.

---

# 11. Environment Variables

Backend requires:

DATABASE_URL

JWT_SECRET

NODE_ENV

PORT

MIKROTIK_HOST

MIKROTIK_PORT

MIKROTIK_USERNAME

MIKROTIK_PASSWORD

APP_URL

API_URL

---

# 12. Firewall

Allow:

22

80

443

Restrict PostgreSQL to localhost.

Restrict RouterOS API access to the backend only.

---

# 13. Logging

Application logs stored in:

`/opt/deroyal-hotspot-os/logs`

PM2 manages process logs.

Log rotation enabled.

---

# 14. Backups

Daily PostgreSQL backup.

Daily uploads backup.

Weekly full application backup.

Monthly archive.

Store backups outside the application directory.

---

# 15. Monitoring

Monitor:

CPU

RAM

Disk

Node.js process

Database

Nginx

Router connection

Available storage

---

# 16. Recovery

Recovery procedure:

Restore PostgreSQL.

Restore uploads.

Restart PM2.

Restart Nginx.

Verify router connectivity.

Run health checks.

---

# 17. Deployment Checklist

Ubuntu updated.

Firewall configured.

Node.js installed.

PostgreSQL installed.

Nginx configured.

SSL active.

Environment variables configured.

Database migrated.

Frontend built.

Backend running.

Health endpoint responding.

Hotspot activation tested.

---

# 18. Success Criteria

Deployment is successful when:

The frontend is accessible at `https://deroyalhotspot.name.ng`.

The API is accessible at `https://api.deroyalhotspot.name.ng`.

The backend connects successfully to PostgreSQL.

The backend communicates with the MikroTik router.

Voucher activation works.

HTTPS is enforced.

Automatic backups are scheduled.

Application processes restart automatically after a reboot.
