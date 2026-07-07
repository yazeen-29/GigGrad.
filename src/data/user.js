// The default worker (student) seed. Also the fallback profile shape.
export const ME = {
  id: "u1", name: "Muhammad Yazeen", email: "yazeen@am.students.amrita.edu",
  role: "student", college: "Amrita Vishwa Vidyapeetham, Kollam",
  rating: 4.8, avatar: null, totalEarned: 2750, jobsDone: 9,
  posterStatus: "none", posterType: null, verifiedVia: null,
};

// Seeded demo logins so every role / verification path is testable without a
// backend. resolveIdentity() (utils/verification) returns these verbatim; any
// other campus email falls back to domain-rule derivation.
export const DEMO_ACCOUNTS = {
  "yazeen@am.students.amrita.edu": ME,

  "meera@amrita.edu": {
    id: "u2", name: "Dr. Meera Nair", email: "meera@amrita.edu",
    role: "teacher", college: "Amrita Vishwa Vidyapeetham, Kollam", dept: "English Dept",
    rating: 4.9, avatar: null, totalEarned: 0, jobsDone: 0, totalSpent: 4200, jobsPosted: 2,
    posterStatus: "approved", posterType: "faculty", verifiedVia: "email_domain",
  },

  // A student-ROLE account that can still post because it's a recognized body —
  // demonstrates that capability is decoupled from identity.
  "council@am.students.amrita.edu": {
    id: "u4", name: "Student Council", email: "council@am.students.amrita.edu",
    role: "student", college: "Amrita Vishwa Vidyapeetham, Kollam", dept: "Student Body",
    rating: 4.5, avatar: null, totalEarned: 0, jobsDone: 0, totalSpent: 1500, jobsPosted: 1,
    posterStatus: "approved", posterType: "council", verifiedVia: "recognized_body",
  },

  "admin@amrita.edu": {
    id: "u0", name: "GigGrad Admin", email: "admin@amrita.edu",
    role: "admin", college: "Amrita Vishwa Vidyapeetham, Kollam",
    rating: 5.0, avatar: null, totalEarned: 0, jobsDone: 0,
    posterStatus: "approved", posterType: "staff", verifiedVia: "admin",
  },
};

// Shown on the login screen so reviewers can try each experience in one click.
export const DEMO_LOGINS = [
  { email: "yazeen@am.students.amrita.edu", label: "Student",         desc: "Browse & apply — cannot post" },
  { email: "meera@amrita.edu",              label: "Teacher",         desc: "Auto-approved poster" },
  { email: "council@am.students.amrita.edu",label: "Student Council", desc: "Recognized body — can post" },
  { email: "admin@amrita.edu",              label: "Admin",           desc: "Approves poster requests" },
];
