// Mock notifications feed. When Firebase lands, replace this static list with a
// notifications/{uid} subscription — the Navbar dropdown consumes the same shape.
export const NOTIFICATIONS = [
  {
    id: "n1",
    type: "application",
    title: "Application accepted",
    body: "Dr. Meera Nair accepted your application for “Format 50-page Research Paper”.",
    to: "/dashboard",
    timeAgo: "2 hours ago",
    read: false,
  },
  {
    id: "n2",
    type: "job",
    title: "New job matches your skills",
    body: "“Design Poster for Annual Tech Fest 2025” was just posted — ₹500.",
    to: "/jobs",
    timeAgo: "5 hours ago",
    read: false,
  },
  {
    id: "n3",
    type: "message",
    title: "New applicant",
    body: "Prof. Arun Kumar’s “Data Entry” job received a new applicant.",
    to: "/my-jobs",
    timeAgo: "1 day ago",
    read: true,
  },
];
