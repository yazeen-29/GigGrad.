# Scholarship support and Campus Companion

Open http://127.0.0.1:5173/scholarships. The companion button is available throughout the app.

## Scholarship sources and scope

The initial catalogue is India-focused and contains five curated schemes, rather than claiming complete coverage or live scholarship discovery. Official sources were reviewed on 1 November 2026:

- [PM-USP CSSS — government myScheme listing](https://www.myscheme.gov.in/schemes/csss-cus)
- [AICTE Pragati — government myScheme listing](https://www.myscheme.gov.in/schemes/psgs-deg)
- [AICTE Saksham — Uttarakhand technical education](https://dte.uk.gov.in/scheme/saksham-scholarship-scheme/), with [Nagaland government guidance](https://highereducation.nagaland.gov.in/nagaland-scholarship-nodal-cell-nsnc/) for the income/disability screening thresholds
- [INSPIRE SHE — official FAQ](https://www.online-inspire.gov.in/Account/FAQ)
- [Post-Matric Scholarship for Students with Disabilities — official department page](https://depwd.gov.in/en/scholarship-post-matric/)

The [NSP student portal](https://scholarships.gov.in/Students), [scheme listing](https://scholarships.gov.in/All-Scholarships) and [official eligibility checker](https://scholarships.gov.in/scholarshipEligibility/) provide broader coverage and current scheme information. INSPIRE has its own official application portal.

Individual source pages can be revised or unavailable. A reviewed link is not an uptime guarantee. No deadline is inferred or presented as currently open. Always confirm the applicable application cycle, current guidelines and selection rules on the official portal.

## Eligibility screening

`src/data/scholarships.js` is the backend catalogue; `src/lib/scholarships.js` validates answers and evaluates the explicitly listed rules.

The questionnaire is optional and supports unknown answers. It distinguishes:

- **Potential match:** supplied answers pass the listed screening rules; additional official checks still apply.
- **More details needed:** no supplied answer fails, but relevant information is missing.
- **Listed criteria not met:** at least one supplied answer fails a listed rule, with the reason shown.

This is not a government eligibility decision, scholarship award, automatic renewal assessment, or exhaustive implementation of every selection route. INSPIRE merit routes and exact subject restrictions, family limits and current-cycle conditions are explicitly left for official confirmation. Board percentile is not percentage marks.

Eligibility answers are evaluated in memory for the request. They are not saved in User, tracking records, assistant history, or any analytics feature. The app does not collect identity numbers, bank account details, scans or certificates for screening.

## Private application organization

Authenticated accounts can save schemes and record their own stage, document-type readiness, a next-step note and a follow-up date. These are stored in `ScholarshipTracking` with one record per account/scheme. Every read/write uses the authenticated account ID. Supabase browser roles have no table privileges and RLS is enabled.

Stages are Saved, Preparing, Applied, Awarded and Not selected. They are user-entered records, not synchronized government decisions. Notes must not contain sensitive identifiers or documents. Follow-up dates are personal reminders, not official deadlines. A downloadable `.ics` calendar event can be imported into a calendar; no email, push delivery or background reminder scheduler is configured.

## Assistant modes

**Guided help works now.** It retrieves relevant entries from the app's built-in knowledge base, supplies navigation buttons, and links to curated official scholarship sources. It identifies itself as built-in guidance and is not presented as a live language model.

**Live AI is connected in code but requires server configuration.** No API key was present during implementation, so the live provider was not called. The adapter was tested with a mock response. Following the [official OpenAI Responses API documentation](https://developers.openai.com/api/docs/guides/migrate-to-responses), the server calls `/v1/responses` using a configured model and `store: false`.

Add these to `Gig-Grad-Server/.env`, then restart the API:

```dotenv
OPENAI_API_KEY=your-server-side-key
OPENAI_MODEL=an-available-Responses-compatible-model-id
```

Never add provider keys to `src`, `public`, a `VITE_` variable, git, or the browser. The model is an explicit operator choice; the application does not assume account access or enable spending without configured credentials.

Once configured, a signed-in user may opt into AI replies in the widget. The conversation is then sent to OpenAI along with trusted app knowledge, the curated scholarship catalogue and server-verified role/posting access. Private messages, account emails, passwords, saved notes and eligibility answers are not retrieved for the model. Provider policies still apply; `store: false` is not a claim of zero data retention across all provider systems.

The assistant cannot submit applications, hire workers, transfer money, approve roles, change account records, browse live sites, or verify official eligibility/deadlines. It has no action tools. Its links/buttons come from the trusted app/source registry. It must not invent implemented features or pretend an action occurred. Provider failures fall back to clearly labeled guided help. The server validates conversation roles and input limits, blocks obvious long identifiers/API keys across the submitted history, and limits requests. These guards are not a general sensitive-data classifier.

Current limits: 30 requests per minute per IP, and 60 AI requests per day per account, held in process memory. Use shared durable quotas, provider spend limits and request monitoring before running replicas or opening public AI access.

## Verification

- Database tests cover owner isolation, validation, persistence, checklist values, reminder dates, deletion and invalid statuses.
- Unit tests cover unknown/boundary eligibility values, official link domains, grounded help and the AI payload contract.
- `npm run test:scholarships` uses an isolated PostgreSQL database and Chrome to verify discovery, search, screening reasons, assistant guidance, tracker save/reload, document readiness, mobile layout and reduced motion.
- The existing job marketplace and six-role walkthrough remain separate regression checks.

```sh
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/giggrad_test npm test
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/giggrad_test npm run test:scholarships
```

## Upgrade path

1. Add a scholarship editorial/admin queue with source revisions, review expiry, broken-link monitoring and audited publication. Expand states/institutions only through authorized sources or reviewed entries; do not guess eligibility from scraped snippets.
2. Represent scheme cycles and renewal rules explicitly. Keep application dates, institute-verification dates and personal follow-up dates distinct. Add conflict checks between awards and scheme overlap rules.
3. Add consent-controlled saved matching profiles only if needed, with deletion/export, restricted access and retention rules. Keep sensitive evidence in approved private storage, not assistant conversations.
4. Add reminder delivery with explicit opt-in, job scheduling and delivery logs. Integrate official status feeds only where an authorized interface exists.
5. Evaluate the live model against source-grounded questions, hallucinated deadlines, prompt injection, role confusion, refusal boundaries and multi-turn privacy cases before enabling it publicly. Use versioned knowledge retrieval, durable rate/spend controls, feedback and source attribution.
6. Consider read-only, user-authorized account tools after the above. Any future write action needs narrow server authorization and a concrete user confirmation; do not turn conversational text into unchecked database commands.
