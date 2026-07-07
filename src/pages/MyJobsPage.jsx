import { useNavigate } from "react-router-dom";

import Card from "../components/ui/Card";
import Btn from "../components/ui/Btn";
import StatusBadge from "../components/ui/StatusBadge";
import Loading from "../components/ui/Loading";
import EmptyState from "../components/ui/EmptyState";

import { useAuth } from "../context/AuthContext";
import { useAsync } from "../hooks/useAsync";
import { getMyPostedJobs } from "../services/jobs";
import { daysLeft } from "../utils/helpers";

import { Plus, Users, Calendar, Briefcase } from "lucide-react";

export default function MyJobsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: posted, loading } = useAsync(() => getMyPostedJobs(user.id), [user.id]);
  const jobs = posted || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">My Jobs</h1>
          <p className="text-slate-500 text-sm">
            {loading ? "Loading…" : `${jobs.length} posting${jobs.length !== 1 ? "s" : ""} · review applicants and hire`}
          </p>
        </div>
        <Btn onClick={() => navigate("/post-job")} icon={<Plus size={14} />}>Post a Job</Btn>
      </div>

      {loading ? (
        <Loading label="Loading your jobs…" />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs posted yet"
          subtitle="Post your first job to start receiving applications from verified students."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {jobs.map(job => (
            <Card key={job.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <StatusBadge status={job.status} />
                    <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">{job.category}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm leading-snug">{job.title}</h3>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-slate-400"><Users size={11} /> {job.applicants} applicant{job.applicants !== 1 ? "s" : ""}</span>
                    <span className="flex items-center gap-1 text-xs text-slate-400"><Calendar size={11} /> {daysLeft(job.deadline)}</span>
                    <span className="text-xs font-bold text-emerald-600">₹{job.amount}</span>
                  </div>
                </div>
                <Btn size="sm" icon={<Users size={12} />} onClick={() => navigate(`/my-jobs/${job.id}/applicants`)}>
                  Review Applicants
                </Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
