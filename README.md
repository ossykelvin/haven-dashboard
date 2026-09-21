# Haven

Haven is a blue-forward care-home compliance dashboard for UK providers. It brings CQC KLOEs, checks, residents, workforce assurance, audits, incidents, assets, reports, and notifications into one operational view.

## Run locally

Requirements: Node.js 22.12+ and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verify

```bash
npm run verify
```

This runs ESLint, Vitest, strict TypeScript checking, and a production Next.js build.

## cPanel package

Every successful build of `main` in GitHub Actions produces a downloadable `haven-cpanel-<commit>` artifact. It contains the verified Linux-built Next.js output and the files required to run it through cPanel's Node.js application manager. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Product behaviour

- Next.js App Router, Tailwind CSS, shadcn-style owned UI components, and Recharts
- Nine navigable dashboard pages with a collapsible responsive sidebar
- Validated create dialogs for residents, staff, audits, checks, incidents, and assets
- Searchable/filterable operational registers
- Browser-local persistence so demo records survive refreshes
- Notification read, mark-all-read, delete, priority, and type filtering

Haven currently uses realistic demonstration data only. It has no live backend, authentication, or CQC submission integration.
