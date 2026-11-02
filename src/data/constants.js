export const CATEGORIES = [
  "All",
  "Document Formatting",
  "Data Entry",
  "Design",
  "Lab Help",
  "Video Editing",
  "Coding",
  "Delivery",
];

// Keys MUST match the Prisma JobStatus enum exactly (uppercase, underscores) —
// job.status coming back from the real API is never lowercase-hyphenated.
export const STATUS_CFG = {
  OPEN: {
    label: "Open",
    tw: "bg-blue-50 text-blue-700 border border-blue-200",
    dot: "bg-blue-500",
  },
  IN_PROGRESS: {
    label: "In Progress",
    tw: "bg-amber-50 text-amber-700 border border-amber-200",
    dot: "bg-amber-500",
  },
  PENDING_APPROVAL: {
    label: "Pending Approval",
    tw: "bg-violet-50 text-violet-700 border border-violet-200",
    dot: "bg-violet-500",
  },
  COMPLETED: {
    label: "Completed",
    tw: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-500",
  },
  DISPUTED: {
    label: "Disputed",
    tw: "bg-red-50 text-red-700 border border-red-200",
    dot: "bg-red-500",
  },
  CANCELLED: {
    label: "Cancelled",
    tw: "bg-slate-100 text-slate-500 border border-slate-200",
    dot: "bg-slate-400",
  },
};

// Keys MUST match the Prisma ApplicationStatus enum exactly (uppercase).
export const APP_CFG = {
  PENDING: {
    label: "Pending",
    tw: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  ACCEPTED: {
    label: "Accepted",
    tw: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  REJECTED: {
    label: "Rejected",
    tw: "bg-red-50 text-red-700 border border-red-200",
  },
};
