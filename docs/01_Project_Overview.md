# DeRoyal Hotspot OS (DHOS)

**Project Overview**

**Version:** 1.0

**Prepared For:** DeRoyal Hotspot

**Owner:** Adedeji Abdulqoyum Akande

**Primary Domain:** deroyalhotspot.name.ng

**Deployment Server:** Contabo VPS

**Target Router:** MikroTik hAP ax³

**Wireless Access Point:** TP Link Outdoor Access Point

**Document Status:** Approved

**Last Updated:** July 2026

---

# 1. Introduction

DeRoyal Hotspot OS (DHOS) is a lightweight hotspot management platform designed to provide secure, reliable, and automated internet access using MikroTik routers.

The system is intended to replace complex hotspot billing solutions with a modern, modular, and easy to maintain platform that focuses on simplicity, performance, and scalability.

The first release will focus on voucher based authentication. Future releases will introduce online payments, customer accounts, reseller support, multiple hotspot locations, analytics, and advanced reporting.

---

# 2. Vision

To build the simplest and most reliable hotspot management platform for small and medium internet providers in Nigeria and across Africa.

---

# 3. Mission

Provide an affordable hotspot platform that allows internet providers to:

• Sell internet access using vouchers

• Manage customers easily

• Monitor hotspot activity

• Expand without changing the underlying software

---

# 4. Problem Statement

Existing hotspot management systems are often difficult to configure, contain unnecessary features, and rely on outdated technologies.

Common issues include:

• Complex installation

• Poor user interface

• Difficult customization

• Limited API support

• Legacy codebases

• Slow performance

• Hard to maintain

The objective is to build a modern replacement that is simple enough for a single administrator while remaining scalable for future growth.

---

# 5. Project Objectives

Primary objectives include:

1. Provide secure voucher based internet access.

2. Integrate directly with MikroTik RouterOS.

3. Allow administrators to create internet plans.

4. Generate printable voucher codes.

5. Validate voucher codes instantly.

6. Automatically activate internet access.

7. Track voucher usage.

8. Display hotspot statistics.

9. Keep the software modular for future expansion.

---

# 6. Target Users

### Administrator

Responsible for:

• Creating plans

• Generating vouchers

• Viewing sales

• Managing hotspot users

• Monitoring router status

---

### Customer

Responsible for:

• Connecting to WiFi

• Entering voucher code

• Accessing the internet

No customer account is required during Phase One.

---

# 7. Phase One Scope

Included features:

• Administrator login

• Dashboard

• Internet plan management

• Voucher generation

• Voucher activation

• MikroTik integration

• Customer captive portal

• Active session monitoring

• Voucher search

• Voucher usage history

• System settings

Not included:

• Online payments

• Customer registration

• SMS

• Email notifications

• Mobile application

• Multiple routers

• Reseller management

---

# 8. Future Roadmap

Phase Two

• Paystack integration

• Automatic payment verification

• Automatic activation

• QR code payments

Phase Three

• Customer accounts

• Purchase history

• Password recovery

• Usage tracking

• Notifications

Phase Four

• Multiple MikroTik routers

• Multi location management

• Staff accounts

• Reseller accounts

• Analytics

• Reports

---

# 9. Technology Stack

Frontend

React

TypeScript

Tailwind CSS

React Router

TanStack Query

Backend

Node.js

Express

TypeScript

Prisma ORM

Database

PostgreSQL

Infrastructure

Contabo VPS

Ubuntu Server

Nginx

PM2

SSL

Networking

MikroTik RouterOS API

Hotspot

Wireless

TP Link Outdoor Access Point

---

# 10. Success Criteria

The project will be considered successful when:

A customer connects to the hotspot.

The captive portal opens automatically.

The customer enters a valid voucher.

The system validates the voucher.

The system creates or authorizes the hotspot session through MikroTik.

The customer gains internet access within a few seconds.

The voucher cannot be reused.

The administrator can monitor usage from the dashboard.

---

# 11. Core Principles

Simplicity over complexity.

Performance over unnecessary features.

Security by default.

Modular architecture.

Clean code.

Scalable design.

Minimal administrator effort.

Reliable internet activation.

---

# 12. Long Term Vision

DeRoyal Hotspot OS will evolve into a complete hotspot management platform capable of serving schools, hotels, estates, cafés, event centers, campuses, airports, churches, and internet service providers across Africa while maintaining a simple deployment process and a modern user experience.
