export const CATEGORIES = ["All", "Document Formatting", "Data Entry", "Design", "Lab Help", "Video Editing", "Coding", "Delivery"];

export const STATUS_CFG = {
  "open":             { label: "Open",             tw: "bg-blue-50 text-blue-700 border border-blue-200",   dot: "bg-blue-500"   },
  "in-progress":      { label: "In Progress",      tw: "bg-amber-50 text-amber-700 border border-amber-200",  dot: "bg-amber-500"  },
  "pending-approval": { label: "Pending Approval", tw: "bg-violet-50 text-violet-700 border border-violet-200", dot: "bg-violet-500" },
  "completed":        { label: "Completed",        tw: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
  "disputed":         { label: "Disputed",         tw: "bg-red-50 text-red-700 border border-red-200",    dot: "bg-red-500"    },
  "cancelled":        { label: "Cancelled",        tw: "bg-slate-100 text-slate-500 border border-slate-200", dot: "bg-slate-400"  },
};

export const APP_CFG = {
  "pending":  { label: "Pending",  tw: "bg-amber-50 text-amber-700 border border-amber-200"  },
  "accepted": { label: "Accepted", tw: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  "rejected": { label: "Rejected", tw: "bg-red-50 text-red-700 border border-red-200"  },
};
