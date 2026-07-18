# 12_Coding_Standards.md

# Coding Standards

## DeRoyal Hotspot OS (DHOS)

**Version:** 1.0

**Language:** TypeScript

**Applies To:** Frontend and Backend

---

# 1. Purpose

This document defines the coding standards for DeRoyal Hotspot OS.

Every source file must follow these standards.

The objective is consistency, readability, maintainability, and AI friendly development.

---

# 2. General Principles

Write clean code.

Prefer readability over cleverness.

Avoid duplicate logic.

Keep functions small.

Use descriptive names.

Write modular code.

Fail gracefully.

Never ignore errors.

---

# 3. Language

Backend

TypeScript only.

Frontend

TypeScript only.

JavaScript is not permitted.

---

# 4. Formatting

Formatter

Prettier

Linter

ESLint

Indentation

2 spaces

Quotes

Single quotes

Semicolons

Required

Maximum line length

100 characters

---

# 5. Naming Conventions

Folders

kebab-case

Files

kebab-case

Variables

camelCase

Functions

camelCase

Classes

PascalCase

Interfaces

PascalCase

Enums

PascalCase

Constants

UPPER_SNAKE_CASE

Database Tables

snake_case

Database Columns

snake_case

---

# 6. Folder Architecture

Backend

Feature based.

Example

```text
src/
  modules/
    auth/
    plans/
    bandwidth-profiles/
    vouchers/
    hotspot/
    dashboard/
    settings/
```

Frontend

Feature based.

Example

```text
src/
  features/
    auth/
    dashboard/
    plans/
    vouchers/
    hotspot/
```

---

# 7. Functions

Maximum length

40 lines

Functions should perform one responsibility only.

Return early where possible.

Avoid deeply nested logic.

---

# 8. Classes

Keep classes focused.

Inject dependencies.

Avoid static state.

Do not mix business logic with infrastructure.

---

# 9. API Controllers

Controllers must:

Validate requests.

Call services.

Return responses.

Controllers must never contain business logic.

---

# 10. Services

Business logic belongs only in services.

Services may:

Read database.

Write database.

Call MikroTik.

Validate workflows.

Services should never return HTTP responses.

---

# 11. Database Access

All database access goes through Prisma.

Avoid raw SQL.

Transactions used where appropriate.

Never expose database models directly to the frontend.

---

# 12. Error Handling

Throw meaningful errors.

Catch errors centrally.

Return standardized API responses.

Never expose stack traces.

---

# 13. Logging

Use structured logging.

Log:

Errors.

Warnings.

Authentication.

Voucher activation.

Router communication.

Do not log passwords, tokens, or secrets.

---

# 14. Validation

Validate all incoming data.

Use Zod.

Reject unexpected properties.

Validate before business logic.

---

# 15. Environment Variables

Never hardcode:

Passwords.

Secrets.

Ports.

API keys.

Router credentials.

Database URLs.

All configuration must come from environment variables.

---

# 16. Comments

Write comments only when necessary.

Explain why.

Do not explain obvious code.

Avoid commented out code.

---

# 17. Git Commit Format

Examples

feat: add voucher activation

fix: resolve router timeout

refactor: simplify dashboard service

docs: update deployment guide

test: add authentication tests

---

# 18. Performance

Avoid unnecessary database queries.

Batch inserts when generating vouchers.

Paginate large datasets.

Cache static configuration where appropriate.

Avoid N+1 queries.

---

# 19. Security

Use parameterized queries.

Escape user input.

Use HTTPS.

Verify JWTs.

Hash passwords.

Protect routes.

Never trust client input.

---

# 20. Testing Requirements

Every new feature must include:

Validation.

Error handling.

Logging.

Unit tests where applicable.

Documentation updates.

---

# 21. Code Review Checklist

Readable.

No duplicate logic.

Proper typing.

Validation present.

Logging present.

Error handling complete.

No hardcoded values.

Build passes.

Lint passes.

---

# 22. AI Development Rules

The AI agent must:

Read all documentation before generating code.

Never invent APIs.

Never invent database fields.

Never bypass business rules.

Never change architecture without approval.

Reuse existing services.

Follow the documented folder structure.

Update documentation when introducing approved changes.

---

# 23. Success Criteria

The codebase is considered compliant when:

All modules follow the same structure.

Naming conventions are consistent.

Business logic is isolated.

Validation is comprehensive.

Security best practices are followed.

The project remains easy to understand and extend.
