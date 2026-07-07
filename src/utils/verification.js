import { DEMO_ACCOUNTS } from "../data/user";

// ─── Campus email rules — ADJUST to your institution ─────────────────────────
// Amrita: students use the students subdomain, staff use the bare domain. If
// your college shares one domain across students & staff, you cannot auto-detect
// role from email alone — fall back to a faculty allowlist / admin approval.
const STAFF_DOMAINS = ["amrita.edu"];
const ADMIN_EMAILS  = ["admin@amrita.edu"];

const domainOf = email => email.slice(email.lastIndexOf("@") + 1);

function nameFromEmail(email) {
  const local = email.split("@")[0].replace(/[._]+/g, " ").trim();
  return local.replace(/\b\w/g, c => c.toUpperCase());
}

// Resolve a login email to a full user identity + posting capability.
// In production this becomes a Firestore users/{uid} read — the returned SHAPE
// is identical, so nothing downstream changes.
export function resolveIdentity(email) {
  const key = email.trim().toLowerCase();

  // 1) Seeded demo accounts (rich profiles that own existing jobs).
  if (DEMO_ACCOUNTS[key]) return { ...DEMO_ACCOUNTS[key] };

  const base = {
    id: `u_${key.split("@")[0]}`,
    name: nameFromEmail(key),
    email: key,
    college: "Amrita Vishwa Vidyapeetham, Kollam",
    rating: 5.0, avatar: null, totalEarned: 0, jobsDone: 0,
    posterStatus: "none", posterType: null, verifiedVia: null,
  };

  // 2) Admin allowlist.
  if (ADMIN_EMAILS.includes(key)) {
    return { ...base, role: "admin", posterStatus: "approved", posterType: "staff", verifiedVia: "admin" };
  }
  // 3) Staff/faculty domain → auto-approved poster.
  if (STAFF_DOMAINS.includes(domainOf(key))) {
    return { ...base, role: "teacher", posterStatus: "approved", posterType: "faculty", verifiedVia: "email_domain" };
  }
  // 4) Everyone else → worker, no posting rights yet (can request access).
  return { ...base, role: "student" };
}

// The single posting gate. Everything (nav, routes, rules) keys off this.
export function canPostJobs(user) {
  return user?.posterStatus === "approved";
}

export const POSTER_TYPE_LABEL = {
  faculty: "Faculty",
  staff: "Staff",
  council: "Student Council",
  club: "Club",
  org: "Organization",
  startup: "Campus Startup",
};
