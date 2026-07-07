import { useNavigate } from "react-router-dom";

import Card from "../components/ui/Card";
import Btn from "../components/ui/Btn";
import Avatar from "../components/ui/Avatar";
import RatingStars from "../components/ui/RatingStars";
import SectionLabel from "../components/ui/SectionLabel";
import StatusBadge from "../components/ui/StatusBadge";
import Loading from "../components/ui/Loading";
import EmptyState from "../components/ui/EmptyState";

import { useAuth } from "../context/AuthContext";
import { useAsync } from "../hooks/useAsync";
import { getMyPostedJobs } from "../services/jobs";
import { POSTER_TYPE_LABEL } from "../utils/verification";

import {
  Briefcase,
  Users,
  Wallet,
  CheckCircle,
  Plus,
  ClipboardList,
  ShieldCheck
} from "lucide-react";

export default function PosterDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: posted, loading } = useAsync(() => getMyPostedJobs(user.id), [user.id]);
  const jobs = posted || [];

  const openCount = jobs.filter(j => j.status === "open").length;
  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicants || 0), 0);

  const stats = [
    { label: "Jobs Posted",     value: jobs.length,                     icon: Briefcase,  color: "text-blue-600 bg-blue-50 border-blue-200" },
    { label: "Open Positions",  value: openCount,                       icon: ClipboardList, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { label: "Total Applicants",value: totalApplicants,                 icon: Users,      color: "text-violet-600 bg-violet-50 border-violet-200" },
    { label: "Total Spent",     value: `₹${(user.totalSpent || 0).toLocaleString()}`, icon: Wallet, color: "text-amber-600 bg-amber-50 border-amber-200" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} size="xl" role={user.role} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                <ShieldCheck size={11} /> {POSTER_TYPE_LABEL[user.posterType] || "Verified Poster"}
              </span>
            </div>
            <p className="text-sm text-slate-400">{user.dept || user.college}</p>
            <div className="mt-1.5"><RatingStars rating={user.rating} /></div>
          </div>
        </div>
        <Btn onClick={() => navigate("/post-job")} icon={<Plus size={14} />}>Post a Job</Btn>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className={`p-4 border ${color.split(" ").slice(2).join(" ")}`}>
            <div className="flex items-center gap-2 mb-1">
              <Icon size={13} className={color.split(" ")[0]} />
              <span className="text-xs text-slate-400 font-medium">{label}</span>
            </div>
            <p className={`text-xl font-extrabold ${color.split(" ")[0]}`}>{value}</p>
          </Card>
        ))}
      </div>

      {/* Your postings */}
      <div className="flex items-center justify-between mb-3">
        <SectionLabel>Your Postings</SectionLabel>
        {jobs.length > 0 && (
          <button onClick={() => navigate("/my-jobs")} className="text-xs font-semibold text-blue-700 hover:underline">
            Manage all →
          </button>
        )}
      </div>

      {loading ? (
        <Loading label="Loading your postings…" />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="You haven't posted any jobs yet"
          subtitle="Post your first job and start receiving applications from verified students."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {jobs.slice(0, 3).map(job => (
            <Card key={job.id} className="p-5 flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={job.status} />
                  <span className="text-xs text-slate-400">{job.category}</span>
                </div>
                <h3 className="font-semibold text-slate-900 text-sm truncate">{job.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <Users size={11} /> {job.applicants} applicant{job.applicants !== 1 ? "s" : ""} · ₹{job.amount}
                </p>
              </div>
              <Btn size="sm" variant="secondary" icon={<Users size={12} />} onClick={() => navigate(`/my-jobs/${job.id}/applicants`)}>
                Review
              </Btn>
            </Card>
          ))}
        </div>
      )}

      {/* Trust footnote — ties to core value */}
      <Card className="p-4 bg-blue-50 border-blue-200 mt-6">
        <div className="flex items-start gap-2">
          <CheckCircle size={14} className="text-blue-700 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700 leading-relaxed">
            Payments you post are held securely and released to the student only after you approve the completed work.
          </p>
        </div>
      </Card>
    </div>
  );
}
