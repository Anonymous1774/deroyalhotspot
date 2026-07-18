# 11_Testing_Plan.md

# Testing Plan

## DeRoyal Hotspot OS (DHOS)

**Version:** 1.0

**Status:** Phase One

---

# 1. Purpose

This document defines the testing strategy for DeRoyal Hotspot OS.

Every feature must pass all applicable tests before deployment.

---

# 2. Testing Objectives

Verify application stability.

Verify voucher integrity.

Verify MikroTik communication.

Verify API functionality.

Verify frontend functionality.

Verify database integrity.

Prevent regressions.

---

# 3. Testing Levels

Unit Testing

Integration Testing

System Testing

User Acceptance Testing

Performance Testing

Security Testing

---

# 4. Unit Testing

Test individual components independently.

Backend

Services

Utilities

Validators

Controllers

Frontend

Components

Hooks

Utility Functions

Forms

---

# 5. Integration Testing

Verify communication between modules.

Examples

Frontend ↔ API

API ↔ Database

API ↔ MikroTik

Authentication ↔ Protected Routes

Voucher ↔ Session Creation

---

# 6. System Testing

Validate the complete workflow.

Example

Customer connects to WiFi.

Captive portal appears.

Voucher entered.

Voucher validated.

MikroTik user created.

Customer receives internet.

Voucher marked as used.

---

# 7. User Acceptance Testing

Administrator

Login

Create bandwidth profile

Create plan

Generate vouchers

View dashboard

Disconnect user

Update settings

Customer

Connect to hotspot

Activate voucher

Receive internet

View success page

---

# 8. Voucher Test Cases

Valid voucher

Expected

Activation successful.

Used voucher

Expected

Activation denied.

Disabled voucher

Expected

Activation denied.

Expired voucher

Expected

Activation denied.

Invalid voucher

Expected

Activation denied.

Empty voucher

Expected

Validation error.

---

# 9. Authentication Test Cases

Valid credentials

Login successful.

Wrong password

Access denied.

Inactive administrator

Access denied.

Expired JWT

Unauthorized.

Missing JWT

Unauthorized.

---

# 10. MikroTik Test Cases

Router online

Connection successful.

Router offline

Activation blocked.

Invalid API credentials

Connection fails.

Create hotspot user

Success.

Disconnect hotspot user

Success.

Retrieve active users

Success.

---

# 11. Database Testing

Unique voucher codes.

Unique administrator emails.

Foreign key integrity.

Cascade behavior.

Indexes used correctly.

Migration success.

---

# 12. API Testing

Every endpoint must verify

Authentication

Validation

Success response

Failure response

Status codes

Error messages

---

# 13. Frontend Testing

Responsive layout.

Navigation.

Forms.

Validation.

Loading states.

Empty states.

Toast notifications.

Error screens.

---

# 14. Performance Testing

Dashboard loads within two seconds.

Voucher activation completes within three seconds.

API response under one second.

Support at least 300 simultaneous hotspot users.

Support 50 administrator requests per minute.

---

# 15. Security Testing

SQL Injection

Cross Site Scripting

Cross Site Request Forgery

Rate Limiting

JWT Validation

Authorization Checks

Environment Variable Protection

---

# 16. Browser Testing

Google Chrome

Mozilla Firefox

Microsoft Edge

Safari

Latest stable versions only.

---

# 17. Mobile Testing

Android

Chrome

Samsung Internet

iPhone

Safari

Responsive layouts verified.

---

# 18. Error Recovery Testing

Database unavailable.

Router unavailable.

Backend restart.

Network interruption.

Expired JWT.

Invalid request payload.

---

# 19. Deployment Testing

Frontend loads.

API responds.

Database connected.

Router connected.

HTTPS enabled.

Health endpoint operational.

PM2 restart successful.

Nginx serving correctly.

---

# 20. Regression Testing

Run after every release.

Authentication

Plans

Bandwidth Profiles

Voucher Generation

Voucher Activation

Dashboard

Settings

Router Integration

---

# 21. Acceptance Checklist

Administrator can log in.

Bandwidth profiles work.

Plans work.

Voucher generation works.

Voucher activation works.

Router integration works.

Dashboard displays accurate information.

Logs are recorded.

Settings save correctly.

Deployment succeeds.

---

# 22. Test Data

Create dedicated test data.

Administrator accounts.

Bandwidth profiles.

Internet plans.

Unused vouchers.

Used vouchers.

Expired vouchers.

Disabled vouchers.

Mock hotspot sessions.

---

# 23. Success Criteria

The system is considered production ready when:

All critical test cases pass.

No critical or high severity defects remain.

Voucher activation is reliable.

Router communication is stable.

Performance targets are achieved.

The application operates correctly on the production Contabo VPS.
