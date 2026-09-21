# Haven code map

| Path | Purpose |
| --- | --- |
| `src/app/layout.tsx` | Root metadata, global styles, and client data provider |
| `src/app/login/page.tsx` | Session login |
| `src/app/api/` | Authenticated route handlers |
| `src/proxy.ts` | Redirects unauthenticated page requests |
| `src/components/haven-app.tsx` | Navigation filtered by `tbl_role_menu` |
| `src/components/pages/` | Product pages, including admin, messages, MAR, and import |
| `src/components/create-dialog.tsx` | Validated create dialogs |
| `src/components/data-provider.tsx` | Loads campus-scoped data from `/api/bootstrap` |
| `src/lib/server/` | Prisma, session JWT, authorization, mappers, audit |
| `src/lib/menus.ts` | Roles, menu keys, campus-access helper |
| `prisma/schema.prisma` | MySQL schema matching CompliCare `tbl_*` tables |
| `prisma/seed.ts` | Fictional Rosewood House demonstration data |
| `tests/` | Validation, filters, authorization, and CSV parsing |

## Main flow

```text
login → session cookie → bootstrap → shell → Zod → API → MySQL → change audit
```
