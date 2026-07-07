# GigGrad — Product & Data Design

A trusted, structured **campus micro-job marketplace**. Students earn; verified
posters (faculty, staff, recognized bodies) get quick help. Core value =
**verified campus + structured jobs + secure/escrow payments + trust ratings**.

## The cold-start reality

Two-sided marketplaces die from lack of **supply of jobs**, not workers
(1000 students / 5 jobs = looks dead). So:

- **Never gate the scarce side (posters) harder than necessary**, but keep it
  **trusted** (posting is a privileged, verified action — protects against spam
  and unpaid "jobs").
- **Seed supply** at launch (admin posts real jobs; onboard a few
  faculty/clubs) and **launch narrow** (one department/club first).

## Identity vs. capability (the key architectural decision)

Who you *are* is separate from what you're *allowed to do*.

```
User {
  role:         'student' | 'teacher' | 'staff' | 'admin'   // identity — a flexible lens
  email:        string                                       // used for auto-verification
  posterStatus: 'none' | 'pending' | 'approved' | 'rejected' // the posting GATE
  posterType?:  'faculty' | 'staff' | 'council' | 'club' | 'org' | 'startup'
  verifiedVia?: 'email_domain' | 'recognized_body' | 'admin'
}
// canPostJobs === (posterStatus === 'approved')   // derived; the single gate
```

`role` sets the **default view/nav**. `posterStatus` is the **business lever**:
graduate new segments into posting (scholars, club leads, orgs, seniors,
startups) by flipping a status — **no schema migration**.

## Posting rights — one status, three grant paths

| Path | Who | How granted |
|---|---|---|
| **Auto — official email** | Faculty / staff | Email matches a staff domain/pattern → `approved` (`email_domain`) |
| **Auto — recognized body** | Registered councils / clubs | On an admin-maintained allowlist → `approved` (`recognized_body`) |
| **Request → admin approval** | New clubs, verified seniors, orgs, startups | Request → `pending` → admin approves/rejects (`admin`) |

> **Email caveat:** if students & staff share one domain you can't auto-detect —
> fall back to self-declared role + verification (faculty directory / staff-ID /
> admin spot-check). Amrita uses `@am.students.amrita.edu` (student) vs
> `@amrita.edu` (staff), so a subdomain check works. See `utils/verification.js`.

Anti-spam rule: **a self-selected "I'm a teacher" checkbox must NOT alone grant
posting.** Capability is derived/assigned, never self-granted.

## The job lifecycle (the product spine)

```
Poster creates ──▶ Students apply ──▶ Poster hires one ──▶ Worker submits ──▶ Poster approves
   (open)            (pending)          (in-progress)      (pending-approval)   (completed →
                                    others → rejected                            escrow released
                                                                                 → mutual rating)
```
Statuses already exist in `data/constants.js` (`STATUS_CFG`, `APP_CFG`).

## Information architecture (role-aware)

| | Student (worker) | Poster (approved) | Admin |
|---|---|---|---|
| Nav | Home · Browse Jobs · Dashboard | Home · Post a Job · My Jobs · Dashboard | + Admin |
| Dashboard | Applications · Earnings · Profile | Overview/Spending · Postings · Profile | — |
| Workspace | Apply on job detail | **My Jobs → Applicant Review (hire)** | **Approval queue** |

Students without posting rights can **Request access** (`/request-access`).

## Firestore mapping (next: backend)

- `users/{uid}`: role, posterStatus, posterType, verifiedVia, profile.
- `jobs/{id}`: poster ref, category, amount, `status` state machine, deadline.
- `applications/{id}`: jobId + applicantId refs (NOT the embedded job), status.
- `recognizedBodies/{id}`: allowlist for auto-approval.
- `posterRequests/{id}`: pending access requests for the admin queue.

Security rules make the capability the authorization model:
```
allow create /jobs           if userDoc().posterStatus == 'approved';
allow update posterStatus    if userDoc().role == 'admin';
```

## Demo accounts (mock, until Firebase)

| Email | Experience |
|---|---|
| `yazeen@am.students.amrita.edu` | Student — browse/apply, cannot post |
| `meera@amrita.edu` | Teacher — auto-approved poster (owns jobs) |
| `council@am.students.amrita.edu` | Student **role** but recognized body → **can post** (shows the decoupling) |
| `admin@amrita.edu` | Admin — approval queue |

## Build phases

- **A — capability model + role-aware shell** ✅ (this change): user gains
  `posterStatus`; nav/routes gate on it; dashboards split; login resolves
  identity from email.
- **B — poster's half** ✅ (this change): My Jobs + Applicant Review
  (accept/reject); Request-access + Admin approval queue.
- **C — trust spine** (next, with Firebase): submit → approve → release escrow →
  mutual ratings; real verification.
- **v2 — liquidity**: student **service offers** (Fiverr-style) so the abundant
  side fills the board; peer-to-peer postings (hackathon teammates, club gigs).
