# DeRoyal Hotspot OS (DHOS)

A modern hotspot management platform built for MikroTik RouterOS.

DHOS enables internet providers to manage hotspot plans, generate vouchers, monitor users, and automate internet access through a web based dashboard.

Phase One focuses on voucher based authentication.

Future phases introduce online payments, automatic activation, analytics, and multi router support.

---

# Features

## Administrator

* Secure authentication
* Dashboard
* Bandwidth profile management
* Internet plan management
* Voucher generation
* Voucher export
* Active session monitoring
* Disconnect users
* Router health monitoring
* Activity logs
* System settings

## Customer

* Captive portal
* Voucher activation
* Automatic internet access
* Mobile friendly interface

---

# Technology Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* TanStack Query
* React Hook Form
* Zod

## Backend

* Node.js
* Express
* TypeScript
* Prisma ORM
* PostgreSQL
* JWT
* Argon2id
* RouterOS API

## Infrastructure

* Ubuntu 24.04 LTS
* Contabo VPS
* Nginx
* PM2
* Let's Encrypt

---

# Network Topology

```text
Unlimited Internet
        │
        ▼
MikroTik hAP ax³
        │
        ▼
TP Link Outdoor AP
        │
        ▼
Customer Devices
```

The MikroTik router is responsible for:

* Gateway
* DHCP
* DNS
* Firewall
* Hotspot
* Queue Management
* User Sessions

The TP Link Outdoor device operates in Bridge or Access Point mode only.

---

# Project Structure

```text
deroyal-hotspot-os/
│
├── backend/
├── frontend/
├── docs/
├── deployment/
├── scripts/
└── .github/
```

---

# Development Workflow

Every feature follows this sequence:

1. Update Prisma schema if required.
2. Generate migration.
3. Build backend service.
4. Build controller.
5. Build routes.
6. Add validation.
7. Write tests.
8. Build frontend.
9. Connect frontend to API.
10. Verify functionality.

---

# Documentation

The `docs` directory contains the complete project specification, including:

* PRD
* Architecture
* Database Design
* API Specification
* Security
* MikroTik Integration
* Development Plan
* Testing Plan
* Coding Standards

These documents are the source of truth for development.

---

# Deployment

Target platform:

* Contabo VPS
* Ubuntu 24.04 LTS
* PostgreSQL
* Nginx
* PM2

Frontend:

`https://deroyalhotspot.name.ng`

Backend API:

`https://api.deroyalhotspot.name.ng`

---

# Roadmap

## Phase One

* Administrator Dashboard
* Bandwidth Profiles
* Plans
* Voucher Management
* MikroTik Integration
* Customer Portal

## Phase Two

* Paystack Integration
* Online Purchases
* Transaction History
* Analytics
* Reports

## Phase Three

* Multi Router Support
* Resellers
* Multi Location Management
* Mobile Application
* Notifications

---

# License

Private project.

Copyright © DeRoyal Hotspot OS.
