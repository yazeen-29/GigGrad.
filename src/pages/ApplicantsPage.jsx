import QueuePager from "../components/QueuePager";
import { useEffect, useState } from "react";

import Card from "../components/ui/Card";
import Btn from "../components/ui/Btn";
import Avatar from "../components/ui/Avatar";
import AppBadge from "../components/ui/AppBadge";
import RatingStars from "../components/ui/RatingStars";
import Loading from "../components/ui/Loading";
import EmptyState from "../components/ui/EmptyState";

import { appsAPI, jobsAPI } from "../lib/api";

import { ChevronRight, Users, CheckCircle, XCircle } from "lucide-react";

export default function ApplicantsPage({ jobId, setPage }) {
  const [listPage, setListPage] = useState(1);
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);

  const [loading, setLoading] = useState(!!jobId);
  const [error, setError] = useState(jobId ? "" : "No job selected.");
  const [actioning, setActioning] = useState(null);

  // ─────────────────────────────────────────────
  // Load job + applicants
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (!jobId) return;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [jobData, applicantsData] = await Promise.all([
          jobsAPI.getOne(jobId),
          appsAPI.forJob(jobId, listPage),
        ]);

        setJob(jobData || null);
        setApplicants(Array.isArray(applicantsData) ? applicantsData : []);
      } catch (err) {
        console.error("ApplicantsPage load error:", err);

        setError(err.message || "Failed to load applicants.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [jobId, listPage]);

  // ─────────────────────────────────────────────
  // Refresh applicants from backend
  // ─────────────────────────────────────────────

  const refreshApplicants = async () => {
    if (!jobId) return;

    const data = await appsAPI.forJob(jobId, listPage);

    setApplicants(Array.isArray(data) ? data : []);
  };

  // ─────────────────────────────────────────────
  // Accept / Hire
  // ─────────────────────────────────────────────

  const handleAccept = async (appId) => {
    setActioning(appId);
    setError("");

    try {
      // Accept the application. The backend does this as a single
      // transaction: application -> ACCEPTED, other applications on this
      // job -> REJECTED, job -> IN_PROGRESS with assignedToId set. Do NOT
      // call jobsAPI.status() separately here — that was a redundant
      // second request racing against the same job row.
      await appsAPI.accept(appId);

      // Refresh applicants and the job itself so UI shows the new state.
      await refreshApplicants();
      const updatedJob = await jobsAPI.getOne(jobId);
      setJob(updatedJob);
    } catch (err) {
      console.error("Accept applicant error:", err);

      setError(err.message || "Failed to hire applicant.");
    } finally {
      setActioning(null);
    }
  };
  // ─────────────────────────────────────────────
  // Reject
  // ─────────────────────────────────────────────

  const handleReject = async (appId) => {
    setActioning(appId);

    try {
      await appsAPI.reject(appId);

      // Get actual state from backend
      await refreshApplicants();
    } catch (err) {
      console.error("Reject applicant error:", err);

      setError(err.message || "Failed to reject applicant.");
    } finally {
      setActioning(null);
    }
  };

  // ─────────────────────────────────────────────
  // No job selected
  // ─────────────────────────────────────────────

  if (!jobId) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          No job selected
        </h2>

        <p className="text-sm text-slate-500 mb-5">
          Select a job from My Jobs to review its applicants.
        </p>

        <button
          onClick={() => setPage("my-jobs")}
          className="text-sm font-semibold text-blue-700 hover:underline"
        >
          ← Back to My Jobs
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────────

  if (loading) {
    return <Loading label="Loading applicants…" />;
  }

  const hasHired = applicants.some(
    (a) => String(a.status || "").toUpperCase() === "ACCEPTED",
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <QueuePager
        page={listPage}
        setPage={setListPage}
        hasNext={applicants.length >= 50}
      />
      {/* Back button */}
      <button
        onClick={() => setPage("my-jobs")}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-5 transition-colors"
      >
        <ChevronRight size={14} className="rotate-180" />
        Back to My Jobs
      </button>

      {/* Job summary */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-xs text-blue-500 font-semibold uppercase tracking-wider mb-1">
          Reviewing applicants for
        </p>

        <h1 className="text-lg font-bold text-slate-900 leading-snug">
          {job?.title || "This job"}
        </h1>

        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {job?.category && (
            <span className="text-xs text-slate-500">{job.category}</span>
          )}

          {job?.amount !== undefined && (
            <span className="text-xs font-bold text-emerald-600">
              ₹{job.amount}
            </span>
          )}

          <span className="text-xs text-slate-400">
            {applicants.length} applicant
            {applicants.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Hired banner */}
      {hasHired && (
        <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
          <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />

          <div>
            <p className="text-sm font-semibold text-emerald-800">
              You've hired a student for this job
            </p>

            <p className="text-xs text-emerald-600 mt-0.5">
              The job is now in progress. Other applicants have been notified.
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm font-semibold text-red-700">
            Something went wrong
          </p>

          <p className="text-xs text-red-600 mt-1">{error}</p>
        </div>
      )}

      {/* Empty */}
      {!error && applicants.length === 0 && (
        <EmptyState
          icon={Users}
          title="No applications yet"
          subtitle="Students will appear here once they apply to this job."
        />
      )}

      {/* Applicant cards */}
      {applicants.length > 0 && (
        <div className="flex flex-col gap-4">
          {applicants.map((app) => {
            const applicant = app.applicant || {};

            const status = String(app.status || "PENDING").toUpperCase();

            const statusKey = status; // APP_CFG keys are uppercase, matching the Prisma enum

            const isActioning = actioning === app.id;

            const isAccepted = status === "ACCEPTED";

            const isRejected = status === "REJECTED";

            const isPending = status === "PENDING";

            return (
              <Card
                key={app.id}
                className={`p-5 ${
                  isAccepted
                    ? "border-emerald-300 bg-emerald-50/30"
                    : isRejected
                      ? "border-slate-200 opacity-60"
                      : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar
                    name={applicant.name || "?"}
                    size="lg"
                    role="student"
                  />

                  <div className="flex-1 min-w-0">
                    {/* Name + status */}
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <button
                          onClick={() => setPage("profile", applicant)}
                          className="font-semibold text-slate-900 text-base hover:text-blue-700 text-left"
                        >
                          {applicant.name || "Unknown Student"}
                        </button>

                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <RatingStars rating={applicant.rating || 0} />

                          {applicant.college && (
                            <span className="text-xs text-slate-400">
                              {applicant.college}
                            </span>
                          )}
                        </div>
                      </div>

                      <AppBadge status={statusKey} />
                    </div>

                    {/* Cover note */}
                    {app.coverNote && (
                      <p className="mt-3 text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 rounded-lg p-3">
                        "{app.coverNote}"
                      </p>
                    )}

                    {/* Bio */}
                    {applicant.bio && (
                      <p className="mt-2 text-xs text-slate-400 italic">
                        {applicant.bio}
                      </p>
                    )}

                    {applicant.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {applicant.skills.map((skill) => (
                          <span
                            key={skill}
                            className="text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Applied date */}
                    {app.appliedAt && (
                      <p className="mt-2 text-xs text-slate-400">
                        Applied{" "}
                        {new Date(app.appliedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}

                    {/* Actions */}
                    {!hasHired && isPending && (
                      <div className="flex items-center gap-2 mt-4">
                        <Btn
                          size="sm"
                          variant="success"
                          disabled={!!actioning}
                          onClick={() => handleAccept(app.id)}
                          icon={<CheckCircle size={13} />}
                        >
                          {isActioning ? "Hiring…" : "Hire"}
                        </Btn>

                        <Btn
                          size="sm"
                          variant="secondary"
                          disabled={!!actioning}
                          onClick={() => handleReject(app.id)}
                          icon={<XCircle size={13} />}
                        >
                          {isActioning ? "Rejecting…" : "Reject"}
                        </Btn>
                      </div>
                    )}

                    {/* Accepted */}
                    {isAccepted && (
                      <div className="mt-3 flex items-center gap-2 text-emerald-700">
                        <CheckCircle size={14} />

                        <span className="text-xs font-semibold">
                          Hired for this job
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
