import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Card from "../components/ui/Card";
import Btn from "../components/ui/Btn";
import Avatar from "../components/ui/Avatar";
import RatingStars from "../components/ui/RatingStars";
import AppBadge from "../components/ui/AppBadge";
import Loading from "../components/ui/Loading";
import EmptyState from "../components/ui/EmptyState";

import { useAsync } from "../hooks/useAsync";
import { getJob } from "../services/jobs";
import { getApplicants, decideApplicant } from "../services/applicants";

import { ChevronRight, Users, Award, Check, X, CheckCircle } from "lucide-react";

export default function ApplicantsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: job, loading: jobLoading } = useAsync(() => getJob(id), [id]);
  const { data: fetched, loading: appsLoading } = useAsync(() => getApplicants(id), [id]);

  // Decisions overlay the fetched data (id → new status), so no effect is needed
  // to copy async data into state.
  const [overrides, setOverrides] = useState({});
  const [deciding, setDeciding] = useState(null);

  const applicants = (fetched || []).map(a => (overrides[a.id] ? { ...a, status: overrides[a.id] } : a));
  const hired = applicants.find(a => a.status === "accepted");

  const decide = async (applicantId, decision) => {
    setDeciding(applicantId + decision);
    const next = await decideApplicant(id, applicantId, decision);
    const map = {};
    next.forEach(a => { map[a.id] = a.status; });
    setOverrides(map);
    setDeciding(null);
  };

  if (jobLoading || appsLoading) return <Loading label="Loading applicants…" />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Back */}
      <button onClick={() => navigate("/my-jobs")} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-5 transition-colors">
        <ChevronRight size={14} className="rotate-180" /> Back to My Jobs
      </button>

      {/* Job header */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Applicants for</p>
        <h1 className="text-xl font-bold text-slate-900 leading-snug">{job?.title || "This job"}</h1>
        <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
          <Users size={12} /> {applicants.length} applicant{applicants.length !== 1 ? "s" : ""}
          {job && <> · ₹{job.amount}</>}
        </p>
      </div>

      {/* Hired banner */}
      {hired && (
        <Card className="p-4 mb-5 border-emerald-200 bg-emerald-50">
          <div className="flex items-center gap-3">
            <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-emerald-800 text-sm">You hired {hired.applicant.name}</p>
              <p className="text-xs text-emerald-600 mt-0.5">The job moves to In Progress. Payment is held securely until you approve the work.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Applicant list */}
      {applicants.length === 0 ? (
        <EmptyState icon={Users} title="No applicants yet" subtitle="Share the job — applications will appear here as students apply." />
      ) : (
        <div className="flex flex-col gap-3">
          {applicants.map(({ id: appId, applicant, status, appliedAgo, coverNote }) => (
            <Card key={appId} className={`p-5 ${status === "rejected" ? "opacity-60" : ""}`}>
              <div className="flex items-start gap-4">
                <Avatar name={applicant.name} size="md" role={applicant.role} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm">{applicant.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <RatingStars rating={applicant.rating} />
                        <span className="text-xs text-slate-400 flex items-center gap-1"><Award size={11} /> {applicant.jobsDone} jobs done</span>
                        <span className="text-xs text-slate-400">· {appliedAgo}</span>
                      </div>
                    </div>
                    {status !== "pending" && <AppBadge status={status} />}
                  </div>

                  <p className="text-xs text-slate-600 mt-3 leading-relaxed bg-slate-50 rounded-lg p-3 border border-slate-100">
                    "{coverNote}"
                  </p>

                  {/* Actions — only while a decision is still open */}
                  {status === "pending" && !hired && (
                    <div className="flex items-center gap-2 mt-3">
                      <Btn size="sm" variant="success" icon={<Check size={12} />}
                        disabled={deciding === appId + "accept"}
                        onClick={() => decide(appId, "accept")}>
                        {deciding === appId + "accept" ? "Hiring…" : "Accept & Hire"}
                      </Btn>
                      <Btn size="sm" variant="ghost" icon={<X size={12} />}
                        disabled={deciding === appId + "reject"}
                        onClick={() => decide(appId, "reject")}>
                        Reject
                      </Btn>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
