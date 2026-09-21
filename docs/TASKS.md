# Haven product tasks

## HAVEN-003 — MySQL backend and authenticated modules

**Status:** Done on `cursor/haven-compliance-dashboard-e8e2`.

Acceptance:

- MySQL schema matching the CompliCare `tbl_*` catalogue, with `tbl_auth_user` standing in for Supabase Auth
- Session login, campus scoping, and menu/role checks in the API (MySQL has no RLS)
- Server persistence replaces localStorage for operational registers
- MAR rounds, messages, users/roles/campuses, document files, CSV import, email outbox, and change audit
- Fictional demonstration records only; no NHS numbers or contact identifiers in seed data

## HAVEN-002 — CompliCare module expansion

**Status:** Done on `cursor/haven-compliance-dashboard-e8e2`.

Acceptance:

- Demonstration modules aligned to CompliCare operations: Rota, Medication, Training, Maintenance, Notifications
- Enquiries pipeline without contact, health, or funding identifiers
- Compliance group: CQC KLOE board, Compliance Checks, Documents (metadata only), Incidents, Risks, Audits, Reports
- Validated create flows and localStorage merge for older snapshots
- No authentication, tenancy, email, file upload, or server persistence

## HAVEN-001 — Care-home compliance dashboard

**Status:** In progress on `cursor/haven-compliance-dashboard-e8e2`.

Acceptance:

- Next.js App Router, Tailwind CSS, shadcn-style UI, and Recharts
- Dashboard plus Compliance Checks, Residents, Staff, Audits, Reports, Incidents, Assets, and Notifications
- Collapsible responsive sidebar and notification bell with unread count
- CQC KLOEs: Safe, Effective, Caring, Responsive, and Well-led
- Search/filter registers, status badges, progress, stats, and four chart forms
- Validated create dialogs for residents, staff, audits, checks, incidents, and assets
- Immediate client-state updates with versioned localStorage persistence
- Notification read/unread, mark-all-read, delete, type, and priority behaviour
- Automated verification and browser smoke evidence

## Deferred follow-ons

- Production identity provider with MFA, TLS, encryption at rest, and a DPIA
- Real CQC/provider integrations and scheduled SMTP notifications
- Editing/detail views and server-backed report generation
- Full admissions CRM beyond the enquiry pipeline
- Production accessibility and security assessment with representative users
