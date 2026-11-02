// Seeded pending poster-access requests for the admin approval queue. Later:
// a Firestore query on posterRequests where status == 'pending'.
export const POSTER_REQUESTS = [
  {
    id: "r1",
    name: "ACM Student Chapter",
    email: "acm@am.students.amrita.edu",
    posterType: "club",
    reason:
      "We run technical events and hackathons and want to hire student designers/developers.",
    appliedAgo: "2 days ago",
  },
  {
    id: "r2",
    name: "Aravind Krishnan",
    email: "aravind@am.students.amrita.edu",
    posterType: "startup",
    reason:
      "Final-year startup (campus-incubated) — need React developers for our MVP.",
    appliedAgo: "4 days ago",
  },
  {
    id: "r3",
    name: "Cultural Committee",
    email: "culturals@am.students.amrita.edu",
    posterType: "council",
    reason:
      "Organizing the annual fest; need help with video editing and social media.",
    appliedAgo: "6 days ago",
  },
];
