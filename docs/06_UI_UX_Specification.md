# 06_UI_UX_Specification.md

# User Interface & User Experience Specification

## DeRoyal Hotspot OS (DHOS)

**Version:** 1.0

**Frontend Framework:** React + TypeScript + Tailwind CSS

**Target Devices:** Desktop, Tablet, Mobile

---

# 1. Design Principles

The interface should be:

Simple

Fast

Modern

Responsive

Accessible

Professional

Minimal

The administrator should be able to perform any common task in three clicks or fewer.

---

# 2. Theme

Primary Color

Royal Blue

Secondary Color

White

Success

Green

Warning

Orange

Danger

Red

Background

Light Gray

Cards

White

Dark mode is reserved for a future version.

---

# 3. Typography

Font

Inter

Weights

400

500

600

700

Buttons use medium weight.

Headings use bold.

Body text uses regular weight.

---

# 4. Layout

Administrator

```text
──────────────────────────────────

Sidebar

Top Navigation

Main Content

──────────────────────────────────
```

Customer Portal

```text
────────────────────────

Logo

Welcome Message

Voucher Input

Activate Button

Support Button

────────────────────────
```

---

# 5. Administrator Pages

Login

Dashboard

Plans

Bandwidth Profiles

Vouchers

Active Sessions

Activity Logs

Settings

Profile

404

403

---

# 6. Dashboard

Cards

Total Plans

Generated Vouchers

Unused Vouchers

Used Vouchers

Online Users

Today's Activations

System Status

Recent Activity

Quick Actions

Generate Voucher

Create Plan

Disconnect User

---

# 7. Plans Page

Table

Search

Create Button

Edit Button

Delete Button

Status Badge

Columns

Plan Name

Duration

Bandwidth Profile

Price

Status

Actions

---

# 8. Bandwidth Profiles

Purpose

Manage reusable MikroTik bandwidth profiles.

Columns

Profile Name

Download Speed

Upload Speed

MikroTik Queue Name

Status

Administrator can

Create

Edit

Disable

Delete unused profile

Example

Bronze

Silver

Gold

---

# 9. Voucher Management

Search

Filters

Bulk Generate

Export

Print

Delete

Table Columns

Voucher Code

Plan

Profile

Status

Created

Activated

Actions

Status Colors

Unused

Gray

Active

Green

Expired

Orange

Disabled

Red

---

# 10. Active Sessions

Table

Username

Voucher

Plan

IP Address

MAC Address

Login Time

Remaining Time

Disconnect Button

Refresh Button

---

# 11. Activity Logs

Filters

Date

Module

Administrator

Search

Columns

Time

Action

Description

Administrator

IP Address

---

# 12. Settings

Company Name

Portal Title

Support Phone

Support Email

Logo

Timezone

Router API Configuration

Voucher Length

Session Timeout

Save Button

---

# 13. Customer Portal

Displays

Company Logo

Welcome Message

Voucher Input

Activate Button

Support Contact

Footer

No advertisements.

No unnecessary information.

---

# 14. Activation Success Page

Displays

Success Icon

Voucher Code

Plan Name

Remaining Duration

Connected Message

Continue Browsing Button

---

# 15. Activation Failed Page

Displays

Error Icon

Reason

Try Again Button

Support Contact

---

# 16. Navigation

Sidebar

Dashboard

Plans

Bandwidth Profiles

Vouchers

Sessions

Logs

Settings

Profile

Logout

---

# 17. Components

Button

Input

Card

Table

Modal

Drawer

Dropdown

Badge

Toast

Pagination

Search Bar

Date Picker

Loader

Empty State

Confirmation Dialog

---

# 18. Responsive Behaviour

Desktop

Full sidebar

Tablet

Collapsed sidebar

Mobile

Drawer navigation

Customer portal must be fully usable on screens as small as 320 pixels.

---

# 19. Loading States

Every page must display skeleton loaders while fetching data.

Buttons display loading indicators during requests.

Tables show placeholder rows.

---

# 20. Empty States

No Plans

No Vouchers

No Sessions

No Logs

Each empty state should explain what to do next.

---

# 21. Notifications

Success

Green toast

Warning

Orange toast

Error

Red toast

Information

Blue toast

Notifications automatically disappear after five seconds.

---

# 22. Accessibility

Keyboard navigation.

Visible focus states.

ARIA labels where necessary.

High contrast text.

Proper heading hierarchy.

---

# 23. User Experience Goals

Administrator should learn the interface within ten minutes.

Generating vouchers should take less than thirty seconds.

Customer activation should require no more than one screen.

Every important action should provide immediate visual feedback.

---

# 24. Future Screens

Customer Account

Online Payment

Purchase History

Paystack Checkout

Analytics Dashboard

Reseller Dashboard

Multi Router Management

Dark Mode

Notification Center

---

# 25. UI Success Criteria

The interface is considered successful when:

Administrators can complete common tasks quickly.

Customers can activate vouchers without assistance.

The design is consistent across all pages.

The application remains responsive on desktop, tablet, and mobile devices.

The interface is intuitive, clean, and easy to maintain.
