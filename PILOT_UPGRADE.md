# Campus pilot release

## Behavior

- Faculty and staff **do not need administrator posting approval**. Email verification is required before applying, posting or messaging for non-admin accounts. Email verification is not a claim that a teacher identity has been independently checked. Students still request posting approval.
- Existing passwords, profiles, projects and work histories are preserved. Existing users sign in again: legacy browser JWTs are no longer accepted. New sessions use a random HttpOnly, SameSite=Strict cookie, hashed session IDs in PostgreSQL, a one-day expiry, server logout and password-reset revocation. Production cookies are Secure. Write requests require an approved Origin; deployment is same-origin.
- Verification links expire after 24 hours, password reset links after 30 minutes. Tokens are random, stored hashed, consumed once, and subject to account cooldowns plus the authentication request limiter. Reset requests return a generic response; delivery runs asynchronously so recipient-specific SMTP delays/errors are not disclosed to the requester.
- Signed-in saved gigs and learning milestones sync through PostgreSQL. Guest data remains on its browser. Explicit import buttons read only the signed-in account's old local-storage key; anonymous data is never imported. Progress changes on the same path use last-write-wins semantics across devices. Learning goals also sync.
- Project notifications are inserted in the same database transaction as applications, hiring, rejections, delivery/status changes and dispute events. Read state is account-scoped. Polling occurs every 30 seconds while visible. Existing history is not backfilled as new notifications.
- Posters specify up to ten required skills. “Matches your skills” ranks open, unexpired, not-yet-applied gigs by the share of required skills present on the profile, then creation date and ID. Shared skills explain each match. This uses no paid AI.
- Applications support sample links and delivery plans, stored with the cover note. Skill Studio offers a portfolio draft after five self-reported milestones; students must review it and supply a project link before saving. No certificate or automatic verified-skill badge is issued.
- Workspace/posting/application/admin queues have Previous/Next controls in batches of 50. Counts based on the visible lists are labelled as page-local. Existing API callers without a page parameter retain their bounded array responses.

## Configuration and release

1. Apply tracked migration `202611020002_pilot` and regenerate Prisma. Deploy backend and frontend together. Server-only tables enable RLS and revoke Supabase browser-role privileges; use the same trusted backend database role as the existing setup.
2. Set `APP_ORIGIN` to the exact public HTTPS origin and `CAMPUS_EMAIL_DOMAINS` to comma-separated institution domains. Do not invent or guess the campus domains.
3. Configure email delivery. For **Render Free**, use `RESEND_API_KEY` and `MAIL_FROM` with an authorized verified sending domain. SMTP is also supported through `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` on hosts/ports that permit it. Render Free blocks common SMTP ports: https://render.com/docs/free . No provider account, domain purchase or paid plan is automatically created. Provider/domain access and actual delivery are still external setup dependencies.
4. Keep `PUBLIC_SIGNUP_ENABLED=0` until verification and reset messages have reached real campus inboxes, including expiry and resend checks. Then set it to `1` in the hosting dashboard (the Blueprint defaults to closed signup). Configuration detection alone does not prove mail delivery or free allowance availability.
5. Existing non-admin users must verify their email before work mutations. Existing administrators remain able to operate. They do not receive a false email-verification badge. Unverified users can edit profiles, browse gigs and manage learning/saved items.
6. Use distinct development, test and pilot database schemas/projects and secrets. Do not seed demonstration credentials into the pilot. Validate a backup/restore before onboarding real participants. Live deployment still requires the owner's Render connection.

## Pilot acceptance

Run lint, unit/integration tests and the browser walkthrough against an isolated database. Test verification/recovery, cookie origin restrictions, replayed/expired tokens, session revocation, teacher and staff direct posting after email verification, student posting approval, personal-data isolation, matching, profile drafts and the complete apply → hire → chat → delivery → review flow. Recruit about 30 students and five real posters only after email delivery and deployment smoke checks pass. Review applications, hires, completions and disputes weekly; no message contents should be used for administrator analytics.
