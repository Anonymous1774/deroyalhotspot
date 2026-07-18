# 02_PRD.md

# Product Requirements Document

## DeRoyal Hotspot OS (DHOS)

**Version:** 1.0

**Status:** Phase One

**Project Owner:** Adedeji Abdulqoyum Akande

---

# 1. Product Summary

DeRoyal Hotspot OS (DHOS) is a web based hotspot management platform that integrates with MikroTik RouterOS to provide voucher based internet access.

Customers connect to the hotspot, enter a voucher code, and receive internet access instantly after successful validation.

The platform is designed to be lightweight, secure, fast, and easy to maintain.

---

# 2. Product Goals

The system must:

1. Eliminate manual hotspot user creation.
2. Simplify voucher management.
3. Provide a clean administrator dashboard.
4. Integrate directly with MikroTik.
5. Support future online payments without redesigning the system.
6. Minimize administrator workload.
7. Scale to support multiple hotspot locations in future versions.

---

# 3. Users

## Administrator

Can:

Create plans

Generate vouchers

View statistics

Search vouchers

Disable vouchers

View active users

Disconnect users

Manage hotspot settings

Manage system settings

View logs

---

## Customer

Can:

Connect to WiFi

Open captive portal

Enter voucher

Activate internet

See activation result

No account creation is required.

---

# 4. Functional Requirements

## Authentication

Administrator login

JWT based authentication

Secure password hashing

Session expiration

Logout

No customer authentication

---

## Dashboard

Display:

Total vouchers

Unused vouchers

Used vouchers

Expired vouchers

Online users

Today's activations

Recent activations

Router connection status

---

## Internet Plans

Administrator can:

Create plan

Edit plan

Disable plan

Delete unused plan

Each plan contains:

Name

Duration

Bandwidth profile

Price

Description

Status

---

Example:

1 Hour

3 Hours

24 Hours

7 Days

30 Days

---

## Voucher Management

Administrator can:

Generate single voucher

Generate bulk vouchers

Delete unused voucher

Export vouchers

Print vouchers

Search vouchers

Filter vouchers

Voucher contains:

Unique code

Plan

Status

Created date

Activation date

Expiry date

Activation IP

Activation MAC Address

---

Voucher Status

Unused

Active

Expired

Disabled

---

## Voucher Activation

Customer enters voucher.

System validates:

Voucher exists

Voucher is active

Voucher has not been used

Voucher belongs to enabled plan

Router is connected

If validation passes:

Voucher is marked as used.

Hotspot access is granted.

Customer is redirected to success page.

---

If validation fails:

Display clear error message.

Do not activate internet.

Do not consume voucher.

---

# 5. MikroTik Integration

The system must:

Connect using RouterOS API.

Verify router connection.

Create hotspot user.

Assign correct user profile.

Apply time limit.

Disconnect expired users automatically through RouterOS.

Log API errors.

Retry failed API requests.

---

# 6. Customer Portal

Landing page

Logo

Welcome message

Voucher input

Activate button

Support button

Responsive layout

Loading indicator

Success page

Failure page

---

# 7. Admin Dashboard Modules

Dashboard

Plans

Vouchers

Hotspot Users

Router Status

Activity Logs

Settings

Administrator Profile

---

# 8. Validation Rules

Voucher code cannot be empty.

Voucher code is case insensitive.

Voucher can only be used once.

Disabled plans cannot activate vouchers.

Disabled vouchers cannot activate.

Inactive router prevents activation.

Expired voucher cannot activate.

---

# 9. Error Messages

Voucher not found.

Voucher already used.

Voucher expired.

Router unavailable.

Internal server error.

Activation failed.

Invalid request.

---

# 10. Logging

Log:

Administrator login

Voucher generation

Voucher activation

Router communication

Failed activations

System errors

Settings changes

---

# 11. Performance Requirements

Dashboard loads in under two seconds.

Voucher validation completes in under three seconds.

API response under one second.

Support at least 300 concurrent hotspot users.

Support at least 50 administrator actions per minute.

---

# 12. Security Requirements

Passwords hashed with Argon2.

JWT authentication.

Rate limiting.

Input validation.

Parameterized database queries.

HTTPS only.

Secure HTTP headers.

CSRF protection where applicable.

Role based authorization.

---

# 13. Non Functional Requirements

Responsive on desktop, tablet, and mobile.

Modern interface.

Accessible design.

Maintainable codebase.

Modular architecture.

Production ready.

Scalable.

Documented.

---

# 14. Out of Scope

Online payments

Customer accounts

SMS

Email

Reseller management

Multi router support

Multi location support

Mobile application

Bandwidth analytics

Usage graphs

These features are planned for later phases.

---

# 15. Acceptance Criteria

The system is considered complete when:

An administrator can create an internet plan.

An administrator can generate vouchers.

A customer can connect to the hotspot.

The captive portal opens automatically.

The customer enters a valid voucher.

The voucher is validated successfully.

Internet access is granted.

The voucher cannot be reused.

The administrator can monitor active users.

The administrator can disconnect users manually.

The system logs all important events.

All APIs return consistent responses.

The application can be deployed on the Contabo VPS and accessed through **deroyalhotspot.name.ng**.

---

# 16. Future Enhancements

Paystack integration

Automatic payment activation

QR code payment

USSD payment

Customer accounts

Usage history

Email receipts

SMS notifications

Multiple MikroTik routers

Multiple hotspot locations

Reseller dashboard

Customer dashboard

REST API for third party integrations

Analytics and reporting

Dark mode

Multi language support
