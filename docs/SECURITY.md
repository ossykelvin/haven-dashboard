# Haven security model

## Current release

Haven is an authenticated demonstration. It uses MySQL and session cookies, but still ships only fictional UK records. It is not approved for live care data.

## Data handling rules

- Never commit real resident, relative, staff, health, safeguarding, or incident data.
- Never hardcode production credentials. Use `.env` locally; `.env.example` is the tracked template.
- Validate all mutable form input with Zod before database writes.
- Seed data must not include NHS numbers, phone numbers, or non-example email addresses.
- Do not add analytics that capture care-record fields.
- Screenshots used for development must contain only demonstration records.

## Authorization

The API loads roles from `tbl_user_role`, menus from `tbl_role_menu`, and campus access from `tbl_profile` plus `tbl_user_campus_access`. MAR writes also require `tbl_staff.is_med_competent` unless the user is an admin or manager. Denied module access is written to `tbl_rls_denial_log`.

Passwords are bcrypt hashes in `tbl_auth_user`. The session is an httpOnly JWT. `tbl_change_audit` is append-only from application code.

## Requirements before real care records

TLS, encryption at rest, backups, a DPIA, a hosted identity provider with MFA, retention/purge, and production threat modelling are still required. This schema is the storage shape; it is not a live care-record accreditation.
