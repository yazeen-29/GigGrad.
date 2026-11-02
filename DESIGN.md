# GigGrad architecture

## Application

The React application uses URL-based navigation with shareable job links and lazy-loaded page modules. `src/lib/api.js` is the shared HTTP client; it handles request timeouts, JSON errors, session expiry and authentication storage. Page components own their async state. Backend responses are the source of truth for identity and posting capability.

Public visitors can browse and inspect jobs. Authenticated students can apply and maintain their profile. Approved posting access is independent of role: faculty and staff post directly, while students and student-led organizations need approved posting access. Staff is represented by TEACHER with posterType=staff for separate presentation. Administrators are provisioned through an operator script, never public signup.

## Backend

`src/index.js` validates configuration and owns server lifecycle. `src/app.js` composes middleware and routes and can be loaded independently by tests. Authentication verifies the signed token and re-reads the user so current permissions take effect immediately. Route code validates inputs and only selects safe user fields.

`lib/validation.js` defines the permission and job-transition rules. Conditional updates and transactions protect hiring, cancellation, reviews and dispute decisions against stale writes. Hiring claims an open, unassigned job before accepting an application and rejecting the other pending applicants. Reviews require completed work and the exact other participant, then compute the rating with a database aggregate in the same transaction.

Job browsing uses bounded pagination, stable tie ordering, category/search filters and future-deadline filtering. The dashboard uses one API request and a fixed number of database queries, independent of the number of jobs. Personalized responses are not cached by intermediaries.

## Persistence

PostgreSQL stores users, jobs, applications, reviews and disputes. Money is stored in fixed-point decimal columns. Compound indexes follow listing and account queries; unique constraints prevent duplicate applications and reviews. Database checks protect posting statuses, positive budgets and review ratings. Migrations include an initial baseline plus a separate additive upgrade for installations created before migration history.

Payment integration remains future work. The Message table now supports private conversations between each job’s poster and hired worker, with cursor-based history, read state, stable message IDs for retry handling, and three-second client polling. Completed and cancelled projects archive their conversations. Files are not accepted until object storage and access controls are implemented; delivery links can be shared in chat.

## Verification and operations

Unit tests validate permission and transition boundaries. PostgreSQL integration tests exercise actual HTTP endpoints, concurrency, foreign keys and transactions. Browser smoke tests use Chrome DevTools Protocol with no extra automation dependency. CI runs migrations, lint, tests and a production build. Container deployments separate migrations from API startup and use readiness probes and a persistent database volume.

The Supabase database is connected and upgraded. Remaining launch dependencies are documented in README.md: TLS and scheduled backups, verified campus identity and account recovery, plus a payment provider if integrated payments are desired. Project messaging is implemented in the API.

Role content is centralized in `src/utils/experience.js`. Signed-in home pages, navigation, dashboards, profile wording and funding resources use this identity view; server authorization remains in `lib/validation.js` and route middleware. Admin sign-in uses `/api/auth/admin/login` and rechecks the account role before issuing a token. Admin overview counts and decision history come from database queries, not the operator's own job list.
