# 18_Paystack_Integration.md

# Paystack Integration Specification

## DeRoyal Hotspot OS (DHOS)

**Version:** 2.0

**Status:** Phase Two

**Payment Provider:** Paystack

---

# 1. Purpose

This document defines how online payments will integrate with DeRoyal Hotspot OS.

Customers will be able to purchase internet plans directly from the captive portal without contacting an administrator.

Successful payments automatically activate internet access.

---

# 2. Customer Flow

```text id="4rwmdr"
Customer Connects to WiFi
        │
        ▼
Captive Portal Opens
        │
        ▼
Select Internet Plan
        │
        ▼
Enter Name
        │
        ▼
Enter Email
        │
        ▼
Pay with Paystack
        │
        ▼
Payment Successful
        │
        ▼
Backend Verifies Payment
        │
        ▼
Generate Voucher
        │
        ▼
Create MikroTik User
        │
        ▼
Customer Online
```

---

# 3. Payment Methods

Supported by Paystack

Card

Bank Transfer

USSD

Bank Account

Apple Pay (where supported)

Google Pay (where supported)

Mobile Money (supported countries)

---

# 4. Database Models

Future models

Payment

Transaction

WebhookEvent

PaymentAttempt

Customer

---

# 5. Payment Status

PENDING

SUCCESS

FAILED

ABANDONED

REFUNDED

---

# 6. Customer Information

Required

Full Name

Email Address

Optional

Phone Number

---

# 7. API Endpoints

Public

```text id="v9glmr"
GET /api/v1/customer/plans

POST /api/v1/customer/payment/initialize

POST /api/v1/customer/payment/verify
```

Webhook

```text id="n0vyi7"
POST /api/v1/webhooks/paystack
```

Admin

```text id="shywvc"
GET /api/v1/admin/payments

GET /api/v1/admin/transactions
```

---

# 8. Payment Initialization

The backend

Validates the selected plan.

Creates a pending payment record.

Requests a Paystack authorization URL.

Returns the checkout URL to the frontend.

---

# 9. Webhook Flow

```text id="pg2vxv"
Paystack

↓

Webhook

↓

Verify Signature

↓

Verify Transaction

↓

Update Database

↓

Generate Voucher

↓

Create MikroTik User

↓

Activate Internet

↓

Log Event
```

---

# 10. Verification Rules

Never trust the frontend.

Every successful payment must be verified directly with Paystack.

The webhook is the source of truth.

---

# 11. Pricing

The amount charged must match the selected plan price.

The backend calculates the amount.

The frontend must never send the payment amount.

---

# 12. Voucher Generation

After successful verification

Generate a unique voucher.

Associate it with the selected plan.

Create the MikroTik hotspot user.

Mark the voucher as Active.

Record the payment reference.

---

# 13. Failed Payments

Do not create vouchers.

Do not create MikroTik users.

Log the failure.

Allow the customer to retry.

---

# 14. Refunds

Future support

Administrator initiated refunds.

Automatic voucher revocation if internet has not been used.

---

# 15. Security

Verify webhook signatures.

Use HTTPS.

Store Paystack secret keys in environment variables.

Never expose secret keys to the frontend.

Log all payment events.

---

# 16. Environment Variables

```text id="o9s6i4"
PAYSTACK_PUBLIC_KEY=

PAYSTACK_SECRET_KEY=

PAYSTACK_WEBHOOK_SECRET=

PAYSTACK_CALLBACK_URL=
```

---

# 17. Administrator Features

View transactions.

Search payments.

Filter by status.

Refund history.

Revenue dashboard.

Export payment reports.

---

# 18. Customer Features

View available plans.

Secure checkout.

Automatic activation.

Payment receipt.

Transaction reference.

---

# 19. Future Enhancements

Discount codes.

Referral rewards.

Promo campaigns.

Scheduled subscriptions.

Automatic renewals.

Wallet balance.

Business accounts.

---

# 20. Success Criteria

The payment integration is successful when:

Customers can purchase plans online.

Payments are verified securely.

Internet activates automatically after successful payment.

Failed payments never create vouchers.

All transactions are logged.

Administrators can monitor payments from the dashboard.
