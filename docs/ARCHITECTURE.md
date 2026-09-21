# Haven architecture

## Runtime

Haven is a Next.js App Router application with a MySQL system of record.

```text
src/app route
  → proxy.ts session cookie check
  → HavenApp shell (menu grants)
  → page component
  → HavenDataProvider
  → POST /api/records/:kind
  → Zod schema
  → Prisma + campus/menu authorization
  → MySQL tbl_* tables
  → tbl_change_audit
```

The security boundary is the route handler, not the sidebar. MySQL has no row-level security, so every query is scoped by `campus_id` and `has_menu_access` using the same policy shape as CompliCare.

## Persistence

Prisma models map to the CompliCare catalogue (`tbl_resident`, `tbl_medication_administration`, and so on). `tbl_auth_user` replaces Supabase Auth. Uploaded evidence lives under `UPLOAD_DIR`; the database stores path and metadata only.

localStorage is no longer the system of record.

## Source boundaries

- `src/app/`: App Router pages, login, and API route handlers
- `src/proxy.ts`: unauthenticated request redirect
- `src/components/haven-app.tsx`: navigation filtered by role menus
- `src/lib/server/`: Prisma client, session JWT, authorization, mappers, audit
- `prisma/schema.prisma`: MySQL schema
- `tests/`: validation, filters, authorization helpers, CSV parsing
