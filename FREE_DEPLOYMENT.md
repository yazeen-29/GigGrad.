# Free GigGrad pilot on Render + Supabase

The repository includes `render.yaml` for one **Free** Render Node service. It serves the Vite frontend and Express API on the same HTTPS address. Supabase stores accounts, profiles, gigs, messages and scholarship tracking. No paid service, domain, Render database or AI provider is created by the Blueprint.

## Launch

1. Sign in to https://dashboard.render.com and connect GitHub with access to `yazeen-29/GigGrad.`.
2. Open [Deploy GigGrad on Render](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2Fyazeen-29%2FGigGrad..git). Alternatively choose **New → Blueprint**, select the repository and `main`, and use `render.yaml`.
3. Confirm the compute plan is **Free**. Use the default `onrender.com` address rather than buying a domain. Keep billing/spending settings at zero; do not enable paid resources or automatic upgrades.
4. Supply `DATABASE_URL` in Render's secret field. Obtain it from the Supabase project's **Connect → Session pooler** (port 5432, IPv4 compatible). It must reference a Free Supabase project for a zero-cost pilot. The configured local database URL is already in the ignored `Gig-Grad-Server/.env`; never paste it into GitHub, screenshots or chat. Use a separate Free Supabase project for a clean pilot if the development/demo records should not be shared. Use `sslmode=require`; preserve any other connection parameters supplied by Supabase.
5. Deploy. Render generates a new JWT secret. The build installs dependencies, generates Prisma and builds the UI. Startup applies pending tracked migrations before accepting traffic. No demo/admin provisioning runs automatically. Failed migrations stop startup instead of serving an incompatible version.
6. Verify the service URL and `/ready`. Check signup/login, profile save, gig discovery, and direct reloads of `/learn` and `/scholarships`. The development-only `/demo` screen is excluded from the production build.

The existing backend uses its own password authentication, not Supabase Auth. A brand-new database has no administrator. Use the existing `bootstrap-admin.js` operator script against that database from a trusted local terminal if an administrator is needed; keep its generated credential file private.

## Later app versions

Push updates to `main`. GitHub Actions runs lint, database integration tests and the production build; Render is configured to deploy **after CI checks pass**. Connect the GitHub provider in Render so automatic deploys can run. PostgreSQL data is external and remains across application restarts/deploys. Device-only learning progress and saved gigs remain browser-local.

Use additive, backward-compatible migrations. Free Render has no separate pre-deploy command, so migrations run during startup; keep this pilot to one service instance. Schema/data changes are not reverted by an application rollback. On a paid deployment, move migrations into a separate pre-deploy job before adding instances. The same repository can move to a paid plan without rewriting the app.

## Free-tier limits

- Render Free spins down after 15 minutes idle and can take about a minute to wake. Included monthly hours, build minutes and bandwidth are limited; exhaustion can suspend the service. Do not add payment details or enable overages if zero billing is essential. https://render.com/docs/free
- Supabase Free can pause after a week of inactivity and has database/egress quotas. Confirm the project is on Free in its billing page. https://supabase.com/pricing
- Milo's built-in guidance works; generative AI remains unavailable without a separately funded provider. Do not set an AI API key if no AI charges are authorized.
- CV/project files remain externally hosted links. This configuration does not add paid object storage, email delivery or payment processing.

This is a demonstration/pilot deployment. Email ownership verification and trusted faculty/staff identity are still pending, as documented in `DEPLOYMENT_PLAN.md`.
