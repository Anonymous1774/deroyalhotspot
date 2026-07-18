# 16_MikroTik_Integration.md

# MikroTik Integration Specification

## DeRoyal Hotspot OS (DHOS)

**Version:** 1.0

**Router:** MikroTik hAP ax³

**Access Point:** TP Link Outdoor Access Point (Bridge Mode)

---

# 1. Purpose

This document defines how DeRoyal Hotspot OS communicates with the MikroTik router.

The backend is the only component allowed to communicate with RouterOS.

Customers and the frontend never communicate directly with MikroTik.

---

# 2. Network Topology

```text
                    Unlimited Internet
                           │
                     Ethernet Cable
                           │
                           ▼
                  MikroTik hAP ax³
        (Gateway, DHCP, Hotspot, Firewall)
                           │
                  LAN Ethernet Port
                           │
                           ▼
             TP Link Outdoor Access Point
                  (Bridge / AP Mode)
                           │
                     Customer Devices
```

---

# 3. Responsibilities

## MikroTik

Internet Gateway

DHCP Server

DNS

Hotspot Server

Firewall

Queue Management

User Sessions

Bandwidth Limiting

Session Timeout

---

## DeRoyal Hotspot OS

Voucher Management

Plan Management

Bandwidth Profiles

Administrator Dashboard

Hotspot User Creation

Statistics

Logging

Router Monitoring

---

# 4. Router Communication

Protocol

RouterOS API

Default Port

8728

Future

API SSL (8729)

Communication

Backend Only

---

# 5. Environment Variables

```text
MIKROTIK_HOST=

MIKROTIK_PORT=8728

MIKROTIK_USERNAME=

MIKROTIK_PASSWORD=

MIKROTIK_TIMEOUT=5000
```

---

# 6. Router Connection

The backend maintains a connection service.

Functions

Connect

Reconnect

Disconnect

Health Check

Timeout Detection

Retry

Maximum retries

3

---

# 7. Hotspot Configuration

Hotspot Server

One

Authentication

Username

Password

Server Profile

default

DNS Name

deroyalhotspot.name.ng

---

# 8. User Creation Strategy

Every activated voucher creates one hotspot user.

Example

Username

```text
BRZ7F82KD
```

Password

```text
BRZ7F82KD
```

The customer never sees these credentials.

The system submits them automatically.

---

# 9. Voucher Activation Flow

```text
Customer

↓

Connect to WiFi

↓

Captive Portal Opens

↓

Customer Enters Voucher

↓

Backend Validates Voucher

↓

Backend Connects to MikroTik

↓

Create Hotspot User

↓

Assign Profile

↓

Record Session

↓

Mark Voucher Active

↓

Return Success

↓

Customer Online
```

---

# 10. Session Expiration

The MikroTik router controls session expiration.

When the plan expires

Internet access stops.

The session disconnects.

Voucher becomes Expired.

The backend synchronizes the status.

---

# 11. Bandwidth Profiles

Bronze

Example

5 Mbps Download

2 Mbps Upload

Silver

10 Mbps Download

5 Mbps Upload

Gold

20 Mbps Download

10 Mbps Upload

These values are configurable.

---

# 12. Queue Profiles

Bronze

bronze_queue

Silver

silver_queue

Gold

gold_queue

Each Bandwidth Profile maps to one Queue Profile.

---

# 13. Router Health

Health checks every

60 seconds

Collected Information

Router Identity

Version

Uptime

CPU Usage

Memory Usage

Free Memory

Connected Users

Hotspot Status

API Status

---

# 14. Active Sessions

Retrieve

Username

IP Address

MAC Address

Login Time

Session Duration

Remaining Time

Assigned Queue

---

# 15. Disconnect User

Administrator selects

Disconnect

↓

Backend calls RouterOS API

↓

Session terminated

↓

Database updated

↓

Dashboard refreshed

---

# 16. Router Failures

If router unavailable

Voucher remains Unused.

Activation stops.

Customer receives friendly error.

Administrator receives log entry.

---

# 17. Logging

Log

Router Connected

Router Disconnected

Authentication Failure

API Timeout

User Created

User Removed

Queue Assigned

Session Disconnected

Unexpected Error

---

# 18. Synchronization

Every 5 minutes

Synchronize

Online Users

Expired Sessions

Router Health

Statistics

---

# 19. Security

Only backend communicates with RouterOS.

Never expose credentials.

Never log passwords.

Encrypt stored credentials.

Restrict RouterOS API access to the backend server IP.

---

# 20. Future Features

Multiple Routers

Router Groups

Automatic Failover

Load Balancing

Location Based Routers

Remote Router Provisioning

Bandwidth Analytics

Radius Integration

---

# 21. Success Criteria

The integration is considered successful when:

The backend connects to the MikroTik router.

Voucher activation creates hotspot users.

Bandwidth profiles are assigned correctly.

Sessions expire automatically.

Administrators can disconnect users.

Router health is continuously monitored.

All router events are logged.

No customer communicates directly with RouterOS.
