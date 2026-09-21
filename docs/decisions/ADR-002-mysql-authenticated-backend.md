# ADR-002 — Replace browser persistence with MySQL and session auth

**Status:** Accepted
**Date:** 2026-09-20

## Context

Haven was a client-side demonstration. CompliCare’s product surface (MAR rounds, messages, users/roles, campuses, file evidence, CSV import, email, and change audit) cannot run safely in localStorage. The source schema is the CompliCare `tbl_*` catalogue with campus scoping and menu-based authorization.

MySQL does not provide Postgres row-level security. Authorization must therefore live in the Next.js route handlers, not in the browser.

## Decision

- Persist all operational data in MySQL using the CompliCare table names (`tbl_resident`, `tbl_medication_administration`, and so on).
- Add `tbl_auth_user` for email/password credentials, because this stack has no Supabase Auth.
- Issue an httpOnly JWT session cookie. The API loads roles, campus access, and menu grants on each request.
- Enforce the CompliCare policy shape in TypeScript: `has_role`, `has_menu_access`, `can_access_campus`, and `is_med_competent` for MAR writes.
- Keep JSON columns for Postgres arrays (`_text`, `_int4`) and `jsonb`.
- Store uploaded evidence on the local disk (`UPLOAD_DIR`); the database holds metadata and path only.
- Seed only fictional UK demonstration records. NHS numbers, phones, and non-example email addresses stay empty.
- Remove localStorage as the system of record.

## Consequences

The App Router remains the UI. Route handlers become the security boundary. Real production care data still needs TLS, encryption at rest, backups, a DPIA, and a hosted identity provider; this release is an authenticated demonstration backend, not a live care-record system.
