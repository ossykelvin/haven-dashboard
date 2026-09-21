# Deploy Haven to Namecheap cPanel

GitHub Actions builds Haven because Namecheap's current shared-hosting image does not provide the glibc version required by Next.js 16's native SWC build binary. cPanel runs the already-built application and generates Prisma Client against its own Linux and OpenSSL environment.

## Download the package

1. Open the repository's **Actions** tab.
2. Open the latest successful **verify** run for `main`.
3. Download the `haven-cpanel-<commit>` artifact.
4. Extract it locally. The extracted package must contain `.next`, `public`, `prisma`, `package.json`, `package-lock.json`, `next.config.ts`, and `server.js`.

Do not upload a local `.env`, `node_modules`, `uploads`, or a Windows-built `.next` directory.

## Configure cPanel

In **Setup Node.js App**:

- Select Node.js 24 (Node.js 22.12 or newer is required).
- Select **Production** mode.
- Set the application root to the directory containing `package.json`.
- Set the startup file to `server.js`.
- Add the variables documented in `.env.example`. Use a long random `AUTH_SECRET`, and never commit it.
- Set `UPLOAD_DIR` to a persistent directory outside any directory replaced during deployment.

Create a restricted MySQL user for Haven and use it in `DATABASE_URL`. The database and upload directory must be backed up separately from application releases.

## Install and restart

Upload and extract the artifact into the application root, then activate the Node environment using the command shown at the top of cPanel's Node.js application page. In cPanel Terminal, run:

```bash
cd /home/CPANEL_USER/APPLICATION_ROOT
npm install --omit=dev
npx prisma generate
npm run start:cpanel
```

For a cPanel-managed process, use the **Restart** action instead of leaving `npm run start:cpanel` attached to the terminal. `prisma` is a production dependency so that cPanel can generate the correct query engine even though build-only packages are omitted.

The current repository does not contain committed Prisma migrations. Do not use `prisma db push` automatically against a production database. Establish reviewed migrations and backups before introducing real persistent data.

## Data boundary

Haven remains an authenticated demonstration and is not approved for live care records. Production use still requires the controls listed in `docs/SECURITY.md`, including an accredited identity provider with MFA, encryption, backups, retention controls, a DPIA, and threat modelling.
