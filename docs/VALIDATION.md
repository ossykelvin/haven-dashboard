# Haven validation

## Automated

Run:

```bash
npm run verify
```

This executes Prisma client generation, ESLint, Vitest, strict TypeScript checking, and the production Next.js build.

Database setup (once):

```bash
docker compose up -d
npx prisma db push
npx prisma db seed
```

## Browser smoke

Run `npm run dev`, open `http://localhost:3000/login`, and verify:

1. Sign in as `admin@haven.example` with the demonstration password from `.env`.
2. Dashboard loads campus-scoped stats and uses the signed-in name.
3. Create a resident; it appears after the server save and a change-audit row is written.
4. Medication round recording works for a med-competent user (`staff@haven.example`) and is refused conceptually for clerk.
5. Messages persist after refresh.
6. CSV import accepts a fictional residents file.
7. Document upload stores a file and lists the evidence record.
8. Sign out returns to `/login`.
