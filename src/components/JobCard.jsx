import Card from "./ui/Card";
import Avatar from "./ui/Avatar";
import StatusBadge from "./ui/StatusBadge";

import { MY_APPLICATIONS } from "../data/applications";
import { daysLeft } from "../utils/helpers";

import {
  Calendar,
  Users,
  Paperclip,
  Zap,
  Check,
} from "lucide-react";

export default function JobCard({ job, onClick }) {
  const isApplied = MY_APPLICATIONS.some(a => a.job.id === job.id);
  return (
    <Card hover onClick={onClick} className="p-5 flex flex-col gap-4">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {job.urgent && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-bold">
                <Zap size={10} className="fill-red-500" /> Urgent
              </span>
            )}
            <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">{job.category}</span>
          </div>
          <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2">{job.title}</h3>
        </div>
        {/* Amount */}
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-0.5 text-emerald-600">
            <span className="text-xs font-bold">₹</span>
            <span className="text-xl font-extrabold leading-none">{job.amount}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{job.description}</p>

      {/* Meta row */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <Calendar size={11} />
          {daysLeft(job.deadline)}
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <Users size={11} />
          {job.applicants} applicant{job.applicants !== 1 ? "s" : ""}
        </span>
        {job.fileUrl && (
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Paperclip size={11} /> File attached
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Avatar name={job.poster.name} size="sm" role={job.poster.role} />
          <div>
            <p className="text-xs font-semibold text-slate-700 leading-none">{job.poster.name}</p>
            <p className="text-xs text-slate-400">{job.poster.dept}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={job.status} />
          {isApplied && <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><Check size={11} />Applied</span>}
        </div>
      </div>
    </Card>
  );
}