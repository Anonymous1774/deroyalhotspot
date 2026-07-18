# 13_File_Structure.md

# Project File Structure

## DeRoyal Hotspot OS (DHOS)

**Version:** 1.0

---

# 1. Purpose

This document defines the complete folder and file structure for the project.

Every file has a clear responsibility.

The project follows a modular architecture that separates frontend, backend, documentation, deployment, and automation.

---

# 2. Root Structure

```text
deroyal-hotspot-os/
│
├── backend/
├── frontend/
├── docs/
├── deployment/
├── scripts/
├── .github/
├── .gitignore
├── docker-compose.yml
├── README.md
├── LICENSE
└── .env.example
```

---

# 3. Backend Structure

```text
backend/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── src/
│   ├── config/
│   ├── middleware/
│   ├── modules/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── plans/
│   │   ├── bandwidth-profiles/
│   │   ├── vouchers/
│   │   ├── hotspot/
│   │   ├── router/
│   │   ├── settings/
│   │   ├── logs/
│   │   └── health/
│   │
│   ├── services/
│   │   └── mikrotik/
│   │
│   ├── utils/
│   ├── types/
│   ├── lib/
│   ├── app.ts
│   └── server.ts
│
├── tests/
│
├── package.json
├── tsconfig.json
└── .env
```

---

# 4. Module Structure

Every module follows the same layout.

```text
plans/

controller.ts

service.ts

repository.ts

routes.ts

validator.ts

types.ts

constants.ts

index.ts
```

Future modules may also include:

dto.ts

mapper.ts

events.ts

---

# 5. Frontend Structure

```text
frontend/
│
├── public/
│
├── src/
│   ├── assets/
│   ├── components/
│   │
│   ├── layouts/
│   │
│   ├── pages/
│   │
│   ├── hooks/
│   │
│   ├── services/
│   │
│   ├── contexts/
│   │
│   ├── utils/
│   │
│   ├── routes/
│   │
│   ├── styles/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── plans/
│   │   ├── bandwidth-profiles/
│   │   ├── vouchers/
│   │   ├── hotspot/
│   │   ├── logs/
│   │   └── settings/
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── package.json
└── vite.config.ts
```

---

# 6. Deployment Structure

```text
deployment/

nginx/

ssl/

pm2/

database/

backup/

firewall/
```

---

# 7. Scripts

```text
scripts/

backup.sh

restore.sh

deploy.sh

health-check.sh

cleanup.sh
```

---

# 8. Documentation

```text
docs/

01_Project_Overview.md

02_PRD.md

03_System_Architecture.md

04_Database_Design.md

05_API_Specification.md

06_UI_UX_Specification.md

07_Business_Rules.md

08_Security.md

09_Deployment_Guide.md

10_Development_Plan.md

11_Testing_Plan.md

12_Coding_Standards.md

13_File_Structure.md

14_AI_Master_Prompt.md

15_Non_Functional_Requirements.md

16_MikroTik_Integration.md

17_Phase_2_Payments.md
```

---

# 9. Environment Files

```text
backend/

.env

.env.example

frontend/

.env

.env.example
```

Production secrets must never be committed to Git.

---

# 10. Configuration Files

Backend

package.json

tsconfig.json

eslint.config.js

prettier.config.js

Frontend

package.json

vite.config.ts

tailwind.config.ts

tsconfig.json

---

# 11. Logs

```text
backend/

logs/

application.log

error.log

router.log
```

Logs rotate automatically.

---

# 12. Uploads

```text
backend/

uploads/

logos/

exports/

backups/
```

Only administrators may upload files.

---

# 13. Naming Rules

Folders

kebab-case

Files

kebab-case

Database

snake_case

Variables

camelCase

Classes

PascalCase

Interfaces

PascalCase

---

# 14. Project Growth

Future directories

payments/

customers/

notifications/

analytics/

reports/

resellers/

locations/

mobile-api/

These can be added without changing the existing structure.

---

# 15. Success Criteria

The project structure is considered successful when:

Developers can locate files quickly.

Every feature has a dedicated module.

The frontend and backend remain independent.

Deployment assets are separated from application code.

The repository scales without major restructuring.
