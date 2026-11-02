# GigGrad: upgrade and deployment plan

The current app is suitable for a controlled demonstration. Public launch should follow the gates below. Effort estimates are planning ranges for one developer, not commitments; external provider approvals can add time.

## What is implemented

- Normal signup/login, server-checked roles, direct faculty/staff posting and administrator-approved student posting.
- Student, faculty/staff, approved student organization and administrator workflows.
- Discovery, saved gigs, applications, applicant profiles, one-worker hiring and rejection.
- Work submission status, revisions, completion, participant reviews and disputes.
- Private project messages with persistence, pagination, unread counts and read receipts.
- Profile overview, editing, completion state, completed-work portfolio and received reviews.
- Responsive landing page with self-hosted typefaces, scroll reveals, floating artwork, a skills ribbon, a perspective switch and FAQs. Reduced-motion settings are respected.
- Migrations, database indexes/checks, API readiness probes, container definitions and CI tests.
- Supabase app tables are server-only: RLS is enabled, browser database roles have no table privileges, and the Express API performs authorization. This deliberately does not use Supabase browser JWTs for database access.

## Phase 1 — close launch blockers (roughly 1–2 weeks)

| Priority | Upgrade                                                                                                                                                                 | Acceptance gate                                                                                                                                                                                                                                                             |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0       | Choose one identity system: integrate campus SSO or migrate to Supabase Auth with verified email and configured SMTP. Plan migration for the existing bcrypt accounts.  | Unverified signups cannot apply/post; reset and verification emails complete end to end; existing accounts have a supported migration path.                                                                                                                                 |
| P0       | Enforce campus membership from a trusted institution record. A free-text college field currently describes a profile and is not an authorization boundary.              | Cross-campus access tests fail where isolation is required; administrators cannot self-assign another campus.                                                                                                                                                               |
| P0       | Add revocable sessions, secure HttpOnly refresh cookies, rotation, logout revocation and admin MFA.                                                                     | Stolen/revoked refresh tokens cannot create sessions; CSRF and cross-tab logout are tested.                                                                                                                                                                                 |
| P0       | Establish separate development, staging and production projects with distinct secrets and least-privilege database credentials.                                         | No demo users or credentials in production; browser bundles contain no database/admin secrets; direct Data API access remains blocked. Configure RLS policies specifically for the dedicated backend role before switching away from the current database-owner connection. |
| P0       | Choose a payments policy. Keep a direct-payment pilot clearly labeled, or integrate a provider with signed webhooks, reconciliation and idempotent transaction records. | No escrow claim without an actual supported settlement flow; duplicate/out-of-order webhooks cannot double-charge or double-release.                                                                                                                                        |
| P1       | Add an account-management/audit trail for permission changes and dispute decisions.                                                                                     | Privileged actions require current server-side permissions and create immutable audit entries; support has a traceable action history.                                                                                                                                      |

The identity and security work should follow the [Supabase production checklist](https://supabase.com/docs/guides/deployment/going-into-prod) and a scoped [OWASP ASVS](https://asvs.owasp.org/) review. These are launch gates, not claims that the current app has passed a security audit.

## Phase 2 — reliable deployment and a small pilot (roughly 1 week)

1. Deploy the static frontend and the containerized API behind TLS on one public origin. Keep the database private to the backend. Run migrations in a separate release job; do not run destructive schema push/reset commands.
2. Build and smoke-test the Docker stack in CI. It is defined but has not yet been built in this workspace. Add health-based rollout checks and a tested previous-image rollback procedure. Use forward-compatible migrations so application rollback remains possible.
3. Add structured request logs, error tracking, uptime alerts and database connection monitoring. Exclude credentials, message contents and personal profile details from logs.
4. Configure scheduled off-site backups and test a restore into staging. Define a recovery point and recovery time with the campus owner. Review plan-specific recovery options using [Supabase backup guidance](https://supabase.com/docs/guides/platform/backups).
5. Add a shared rate limiter for multiple API replicas, bounded database connections and alerts for error rates, latency and failed authentication bursts.
6. Pilot with one department or a few recognized clubs. Recruit real posters before broad student signup. Confirm support ownership and a clear dispute-response process.

Pilot exit: normal users can complete application → hire → chat → submission → review without operator intervention; no unresolved access-control failures; a backup restore and rollback have been exercised.

## Phase 3 — finish the work-delivery experience (roughly 1–2 weeks)

- Add private object storage, signed download URLs, size/type checks and malware scanning for instructions and deliverables. Store delivery versions and revision notes against a project.
- Move from three-second message polling to authenticated realtime delivery when traffic justifies it. Preserve persisted history, ordering, retries and authorization. Add durable notifications and email preferences.
- Add pagination to dashboard, inbox, applicant and admin queues. They currently have bounded result limits. Measure queries with real pilot data before adding search infrastructure.
- Add profile image storage and moderation, account deletion/export, reporting/blocking, and documented message/data retention.
- Run keyboard, screen-reader, zoom, reduced-motion and device checks on every major flow; make these part of browser regression tests.

## Phase 4 — grow useful demand (after pilot evidence)

| Idea                                      | User benefit                                                    | Measure before expanding                                          |
| ----------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------- |
| Student service offers                    | Students can advertise skills even when the job board is quiet. | Leads that turn into paid projects, not profile views alone.      |
| Skill-based recommendations               | Relevant gigs reach the right students sooner.                  | Apply-to-hire rate and time to first suitable application.        |
| Repeat-hire shortcuts and reusable briefs | Faculty and clubs spend less time recreating common jobs.       | Repeat posting and successful project completion.                 |
| Availability and workload limits          | Students accept work that fits around classes.                  | Missed deadlines and revision burden.                             |
| Verified portfolio sharing                | Completed campus work becomes useful career evidence.           | External shares and repeat collaborations, with privacy controls. |

## Demonstration and current limits

Open `/demo` in the local development app. Six accounts cover student, teacher, club, staff, administrator and a club awaiting approval. Passwords are in the ignored, private `DEMO_ACCOUNTS.local.md` file. All demo records are explicitly labeled. Demo UI and credentials are not bundled into the production frontend; database demo accounts must still be removed before launch.

Use `npm run check`, the PostgreSQL integration suite, `npm run test:browser`, and the role walkthrough before each release. Passing these verifies the covered scenarios; it does not prove every possible edge case. Payments, verified identity, uploads, account recovery, deployment operations and the other gates above remain explicit work.

## Scholarship and assistant launch gates

The first scholarship catalogue, preliminary questionnaire, private tracker, calendar export and guided companion are implemented. Live AI requires a server-side provider key/model; it is not currently connected. Before public use, add a source-review/expiry workflow, cycle-specific data, durable reminder delivery and AI spend controls. The detailed source registry, limitations, configuration and phased upgrades are in [SCHOLARSHIPS_AND_ASSISTANT.md](SCHOLARSHIPS_AND_ASSISTANT.md). Matching is advisory; only the official authority decides eligibility and selection.

## Updated role policy

Faculty and staff publish directly. Only students/student organizations request posting permission. Administration has its own sign-in, global overview, student approval queue and conflict decisions with saved notes. The pilot currently trusts faculty/staff identity declared at signup; integrate verified institutional identity/SSO before a public launch while preserving the no-admin-approval workflow for legitimate faculty/staff. The provisioned operator login in `ADMIN_LOGIN.local.md` must be kept private and replaced with institution-managed identity and MFA before deployment.
