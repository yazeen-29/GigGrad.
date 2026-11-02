# GigGrad

A campus gig marketplace built with React, Vite, Express, Prisma and PostgreSQL.

Students discover and save gigs, send applications, track assignments, submit work for approval and review completed work. Administrators review posting access and disputes. Approved posters publish briefs, review applicants and hire one worker per job.

## Run locally

Use Node.js 22. Install both dependency trees:

```sh
npm ci
npm ci --prefix Gig-Grad-Server
cp .env.example .env
cp Gig-Grad-Server/.env.example Gig-Grad-Server/.env
```

Set the backend `DATABASE_URL` to a PostgreSQL database and `JWT_SECRET` to a random secret of at least 32 characters. Then:

```sh
npm --prefix Gig-Grad-Server run db:generate
npm --prefix Gig-Grad-Server run db:migrate
npm --prefix Gig-Grad-Server run dev
```

In another terminal run `npm run dev` and open http://localhost:5173. Vite forwards `/api` to port 5000. Configure the root `.env`, rather than `src/.env`.

Sign up normally. To bootstrap the first administrator, verify that account's identity, then run from `Gig-Grad-Server`:

```sh
node scripts/promote-admin.js existing-user@college.edu
```

Faculty and staff accounts can publish tasks immediately. Students, including student-led organizations, need administrator approval before posting; browsing and applying do not require posting approval. Staff accounts use the TEACHER identity with posterType=staff so their content is personalized separately.

## Database changes

New databases: run `npm --prefix Gig-Grad-Server run db:migrate`.

Existing databases created before migration history was introduced: back up first and compare their schema against `prisma/migrations/202611010001_baseline/migration.sql`. If it matches, mark **only the baseline** applied, then deploy the additive migration:

```sh
cd Gig-Grad-Server
npx prisma migrate resolve --applied 202611010001_baseline
npm run db:migrate
```

Do not baseline an empty or mismatched database. The upgrade adds access-review fields, skill arrays, query indexes and database checks, and converts monetary values to `DECIMAL(10,2)`. Review existing amounts and ratings before migration; invalid historical data can make constraints fail. Existing teacher/staff accounts receive direct posting access through migration 202611010005_role_posting_policy. The configured Supabase database has now been compared with the baseline, backed up, baselined, and upgraded. The four existing accounts were preserved. A temporary signup/login check passed through the running website and was removed afterward.

## Verification

```sh
npm run check
```

This runs lint, the Node test suite and a production build. Database integration tests are intentionally skipped unless `TEST_DATABASE_URL` is explicitly set; they never use a developer database by default. To run them, migrate an isolated test database and run:

```sh
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/giggrad_test npm test
```

Tests cover permission boundaries, competing hires, signup/login, posting access, applications, state transitions, reviews, disputes and profile updates. Each run deletes only records that it created. GitHub Actions provisions PostgreSQL and runs these checks.

Optional browser smoke tests require Google Chrome at `/usr/bin/google-chrome-stable`, free ports 5501, 5517 and 9237, and a migrated test database:

```sh
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/giggrad_test node scripts/browser-smoke.mjs
```

The script launches isolated local servers and a temporary headless browser, tests the actual login form, application submission, hiring, two-account messaging and mobile navigation, and writes screenshots to `/tmp/giggrad-{desktop,dashboard,chat,mobile}.png`.

## Free hosted pilot

See [FREE_DEPLOYMENT.md](FREE_DEPLOYMENT.md) for the free Render + Supabase configuration, GitHub deployment workflow, secret setup and later upgrades. `render.yaml` selects one Free service and provisions no paid AI provider.

## Container deployment

Set `POSTGRES_PASSWORD` to a strong URL-safe password and `JWT_SECRET` to a random secret. Set `CORS_ORIGINS` to the public origin. Run:

```sh
docker compose up --build -d
```

The stack provisions PostgreSQL, runs migrations as a separate service, starts the API as a non-root user, and serves the frontend at port 8080 through nginx. The database is not exposed to the host. Put TLS termination in front of nginx and configure automated database backups. `/health` checks the API process; `/ready` also checks database connectivity. Docker images have not been built in this workspace.

When hosting separately, configure `VITE_API_URL` at build time, allow the frontend origin through `CORS_ORIGINS`, and rewrite frontend routes to `index.html`. Enable `TRUST_PROXY=1` only behind one trusted proxy that overwrites `X-Forwarded-For`; the supplied nginx setup does this. Use a shared edge rate limiter for multiple API replicas; the built-in authentication limiter is per process.

## Dependency review

After compatible security updates, `npm audit --omit=dev` reports no known vulnerabilities in either dependency tree. Full audits still report development-tool advisories in ESLint/nodemon through minimatch. These packages do not ship in the static frontend or API runtime image. Reassess them during tooling updates. Prisma 6 configuration uses a scoped `deepmerge-ts` 8 override to address [GHSA-ggr8-5vv4-36mx](https://github.com/advisories/GHSA-ggr8-5vv4-36mx); client generation, migrations and integration tests verify this combination.

## Product scope and launch requirements

- The complete work-status lifecycle is implemented: open → hire → in progress → pending approval → completed. The owner can request revisions by returning submitted work to in progress. Disputes freeze active work until an administrator decides the outcome.
- Payment is arranged directly between participants. GigGrad does not collect, hold, refund or release money. No payment gateway is connected.
- Job conversations are implemented with persistent messages, cursor-based history, unread counts, read receipts and retry-safe sending. Only the hired worker and poster can access them; administrators have no implicit chat access. New messages refresh every three seconds while the thread is visible. Completed/cancelled projects remain readable and cannot receive new messages.
- Signup checks college email syntax, **not ownership**. Connect email verification or campus SSO before opening signup to an untrusted audience. Password reset and Google sign-in controls were removed because no provider is configured.
- Saved gigs are stored on the current device per account. A saved snapshot may expire; the detail page always refreshes from the server before actions.
- Job discovery is paginated. Dashboard and applicant views currently return at most 200 records; add pagination before an individual account exceeds this limit. The posting request queue returns the oldest 100 pending requests.
- Sessions use one-day JWTs in local storage. Restrictive production CSP is supplied. A future identity integration should add verified-email enforcement, reset delivery, server-side revocation and HttpOnly refresh cookies.

See [DESIGN.md](DESIGN.md) for the current architecture and [Express security guidance](https://expressjs.com/advanced/best-practice-security/) and [Prisma transaction guidance](https://www.prisma.io/docs/orm/v6/prisma-client/queries/transactions) for the underlying operational patterns.

## Current feature coverage

| Capability                                                                                 | Status                                               |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| Signup/login with Supabase PostgreSQL                                                      | Implemented and checked through the website          |
| Student, teacher/staff identity, independent posting access, admin review                  | Implemented; privileged roles cannot be self-granted |
| Applications, single-worker hire, rejection, delivery status, revisions, reviews, disputes | Implemented and integration tested                   |
| In-app project messaging                                                                   | Implemented and tested between two accounts          |
| Saved gigs, skill profiles, activity notifications                                         | Implemented                                          |
| Escrow/payment collection, refunds                                                         | Not integrated; direct payment only                  |
| Email ownership verification, reset delivery, Google/campus SSO                            | Provider integration still required                  |
| File uploads                                                                               | Not integrated; share delivery links in project chat |

The interface uses self-hosted Manrope under its included SIL Open Font License, an 18px desktop base (16px on mobile), and larger text tokens and controls.

## Profiles and demonstration accounts

Profiles open as an overview, with a separate Edit profile action. Completed projects, received reviews and counts come from PostgreSQL. Public profile views exclude account emails and credentials. The dashboard only prompts for missing profile information.

Six labeled demo accounts and seven scenarios have been added to the connected development database. Open http://127.0.0.1:5173/demo and use the credentials in the ignored `DEMO_ACCOUNTS.local.md` file. The demo page is development-only and uses normal authentication. The seed is idempotent and preserves edited profiles and progressed jobs:

```sh
node Gig-Grad-Server/scripts/seed-demo.js
```

The `202611010003_server_only_data_access` migration enables RLS and removes direct app-table privileges from Supabase browser roles. The Express API remains the sole application data entry point.

The landing page adds animated editorial typography, scroll reveals, floating cards, a skills ribbon, a student/poster journey switch and FAQs, with reduced-motion support. Both font licenses are included under `public/fonts`.

See [DEPLOYMENT_PLAN.md](DEPLOYMENT_PLAN.md) for the staged launch plan, acceptance gates, current gaps and post-pilot upgrades.

The reproducible six-role browser walkthrough runs in a temporary schema on the explicit test database, then removes that schema:

```sh
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/giggrad_test npm run test:roles
```

It verifies profile edit/reload behavior, public-profile privacy, applications, saved gigs, hiring, posting, approvals/reviews, two-sided messaging, staff postings, administrator access/dispute decisions, mobile layout and reduced motion. Screenshots and a pass report are written to `/tmp/giggrad-role-demo/`. It does not progress the Supabase demo scenarios, which remain ready for your own walkthrough.

## Scholarship support and Campus Companion

Open `/scholarships` for the five-scheme, India-focused official-source catalogue, an optional preliminary eligibility questionnaire and a private preparation/application tracker. The new tracking table is included in migration `202611010004_scholarship_tracking`. Calendar exports are personal follow-up reminders; application status is not synchronized with government portals.

The site now has a paper-and-ink campus background with animated washes, sketch lines, calligraphic words, a pause control and reduced-motion support.

The companion widget provides built-in app/scholarship guidance now. Live AI needs `OPENAI_API_KEY` and an explicit `OPENAI_MODEL` in the backend environment. No provider key was present, so live AI has not been tested against a real provider. See [SCHOLARSHIPS_AND_ASSISTANT.md](SCHOLARSHIPS_AND_ASSISTANT.md) for source links, scope, privacy, setup, tests and upgrade work.

## Personalized workspaces and administrator sign-in

- Students see applications, assignments, profiles, work value and scholarships. Approved student organizations retain both posting and worker views.
- Faculty see academic briefs, applicants, delivered work awaiting review and project conversations. Staff see operations/event projects. Neither role needs posting approval, and neither sees a student application tab.
- Scholarships remains available to faculty/staff as a student-funding reference with anonymous criteria checks and saved links; it is not a personal funding prompt or primary navigation item.
- Administrators see student access requests, conflicts, active projects, account totals and recent saved decisions. Private project chat stays participant-only.

Open `/admin-login` for dedicated administrator sign-in. An operator administrator account has been provisioned in the connected database; its email and generated password are in the ignored, private `ADMIN_LOGIN.local.md` file. It is separate from the demonstration administrator. Public signup cannot grant ADMIN. The idempotent provisioning command is `node Gig-Grad-Server/scripts/bootstrap-admin.js`.

The current pilot trusts the selected faculty/staff identity and grants direct posting as requested. Campus SSO or verified institutional identity remains a public-launch prerequisite; account identity and posting policy should not be confused with completed identity verification.

## Milo and Skill Studio

Open `/learn` for six learning paths, official resources, practice briefs and portfolio checks. Paths that match the signed-in profile's skills appear first. Choosing a path saves a goal; milestone progress is self-reported and stored per account in this browser. It does not update profile skills or certify readiness automatically. The shared catalogue lives in `Gig-Grad-Server/src/data/learning.json` and is bundled into both the frontend and assistant context.

Milo replaces Campus Companion with an animated mascot, role-aware greetings and AI enabled by default for signed-in users when configured. The server uses OpenAI's Responses API with `store: false`, conversation history, the current page, complete app help, scholarship facts and the learning catalogue. Profile context includes name, role, posting access and skills; account email, bio, credentials and private conversations are excluded. The AI checkbox lets users choose built-in guidance instead. Provider errors and missing configuration are explicitly labelled.

Configure `OPENAI_API_KEY` and an accessible `OPENAI_MODEL` in `Gig-Grad-Server/.env`, restart the API, and refresh the site to enable live AI. Never put the key in frontend environment variables. No provider credentials were present during implementation; provider request/response handling is tested with mock responses, not a live paid request. Milo explains workflows and coaches users; it has no account action tools or live browsing.

## Student showcase and navigation

Student profiles support an optional headline, portfolio, hosted CV, GitHub, LinkedIn, up to eight featured projects and up to eight achievements. These fields persist in PostgreSQL and are visible on public profiles; achievements are explicitly student-provided. Project links are required, evidence links are optional, and all links must use HTTPS without embedded credentials. CV files are hosted externally; users should share a view-only link. Existing completed GigGrad work remains separate. Migration `202611020001_student_showcase` adds fields without removing existing data.

The navigation uses four primary destinations for students, an eligible posting action and an account dropdown for profile, messages and posting access. Smaller screens use a grouped disclosure menu. Both menus support Escape and visible keyboard focus.
