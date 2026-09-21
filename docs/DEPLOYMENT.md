# Deploy Haven to Namecheap cPanel

GitHub Actions builds Haven because Namecheap's current shared-hosting image does not provide the glibc version required by Next.js 16's native SWC build binary. cPanel runs the already-built application and generates Prisma Client against its own Linux and OpenSSL environment.

## Deploy through cPanel Git Version Control

Every successful push to `main` replaces the `cpanel-release` branch with the verified Linux build. Configure cPanel Git Version Control with:

- Clone URL: `https://github.com/ossykelvin/haven-dashboard.git`
- Repository path: `/home/koptryzt/repositories/haven-dashboard`
- Branch: `cpanel-release`

The repository path must remain separate from the Node application root (`/home/koptryzt/njtest.koptechnology.co.uk`). The checked-in `.cpanel.yml` copies the prebuilt application into that root and touches Passenger's restart marker.

The deployment also creates `.htaccess` when it is absent. It does not replace an existing file, because CloudLinux Node.js Selector stores and removes its Passenger directives there when stopping or restarting the application.

Because the repository is private, configure GitHub authentication for the cPanel clone using a read-only deploy key. Do not place a token in the clone URL or commit credentials.

After adding or updating the repository in cPanel:

1. Click **Update from Remote**.
2. Confirm the checked-out branch has no uncommitted changes.
3. Click **Deploy HEAD Commit**.
4. On the first deployment, or whenever dependencies change, open **Setup Node.js App** and click **Run NPM Install**.
5. Click **Restart** in **Setup Node.js App**.

Do not point cPanel Git Version Control at `main`; that branch contains source code rather than the prebuilt `.next` application.

## Download the package

1. Open the repository's **Actions** tab.
2. Open the latest successful **verify** run for `main`.
3. Download the `haven-cpanel-<commit>` artifact.
4. Extract it locally. The extracted package must contain `.next`, `prisma`, `package.json`, `package-lock.json`, `next.config.ts`, and `server.js`. It also contains `public` when the application has public assets.

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
npm run prisma:generate
npm run start:cpanel
```

For a cPanel-managed process, use the **Restart** action instead of leaving `npm run start:cpanel` attached to the terminal. `prisma` is a production dependency so that cPanel can generate the correct query engine even though build-only packages are omitted. Prisma generation is deliberately not an npm `postinstall` lifecycle: CloudLinux runs lifecycle commands from its separate `nodevenv` library directory, so generate it explicitly from the application root as shown above.

The current repository does not contain committed Prisma migrations. Do not use `prisma db push` automatically against a production database. Establish reviewed migrations and backups before introducing real persistent data.

## Data boundary

Haven remains an authenticated demonstration and is not approved for live care records. Production use still requires the controls listed in `docs/SECURITY.md`, including an accredited identity provider with MFA, encryption, backups, retention controls, a DPIA, and threat modelling.
