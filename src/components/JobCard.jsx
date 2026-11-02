import Card from "./ui/Card";
import Avatar from "./ui/Avatar";
import StatusBadge from "./ui/StatusBadge";

import { daysLeft } from "../utils/helpers";

import { Calendar, Users, Paperclip, Zap, Check } from "lucide-react";

export default function JobCard({ job, onClick, applied = false }) {
  // Real backend response uses `postedBy`
  // Keep fallback support for any old/mock data.
  const poster = job.postedBy ||
    job.poster || {
      name: "Unknown",
      role: "STUDENT",
      dept: "",
      rating: 0,
    };

  // Real backend response uses _count.applications
  const applicantCount = job._count?.applications ?? job.applicants ?? 0;

  // Whether the current user has applied to this job. The browse page
  // doesn't fetch the user's own applications for every card by default —
  // pass `applied` in from a parent that has that data (e.g. after cross-
  // referencing appsAPI.mine()) if you want the "Applied" badge to show.
  const isApplied = applied;

  return (
    <Card
      className="p-5 cursor-pointer hover:shadow-lg hover:shadow-blue-900/5 hover:border-blue-200 transition-all"
      onClick={onClick}
    >
      {/* ── Top row ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {job.urgent && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-bold">
              <Zap size={10} />
              Urgent
            </span>
          )}

          <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold">
            {job.category}
          </span>
        </div>

        {/* Amount */}
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-extrabold text-slate-900">
            ₹{Number(job.amount || 0).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* ── Title ───────────────────────────────────────────────── */}
      <h3 className="font-bold text-slate-900 text-xl leading-snug mb-2">
        {job.title}
      </h3>

      {job.matchedSkills?.length > 0 && (
        <p className="text-xs text-emerald-700 mt-2">
          Shared skills: {job.matchedSkills.join(", ")}
        </p>
      )}
      {/* ── Description ────────────────────────────────────────── */}
      <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4">
        {job.description}
      </p>

      {/* ── Meta row ───────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <Calendar size={11} />
          {daysLeft(job.deadline)}
        </span>

        <span className="flex items-center gap-1 text-xs text-slate-400">
          <Users size={11} />
          {applicantCount} applicant
          {applicantCount !== 1 ? "s" : ""}
        </span>

        {job.fileUrl && (
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Paperclip size={11} />
            File attached
          </span>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-3">
        {/* Poster */}
        <div className="flex items-center gap-2 min-w-0">
          <Avatar
            name={poster.name}
            size="sm"
            role={poster.role?.toLowerCase()}
          />

          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-700 leading-none truncate">
              {poster.name}
            </p>

            <p className="text-xs text-slate-400 truncate mt-1">
              {poster.dept || poster.college || poster.role || ""}
            </p>
          </div>
        </div>

        {/* Status + applied */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={job.status} />

          {isApplied && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <Check size={11} />
              Applied
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
