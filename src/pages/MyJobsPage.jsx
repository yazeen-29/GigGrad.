import { useEffect, useState } from "react";

import Card from "../components/ui/Card";
import Btn from "../components/ui/Btn";
import StatusBadge from "../components/ui/StatusBadge";
import Loading from "../components/ui/Loading";
import EmptyState from "../components/ui/EmptyState";

import { jobsAPI } from "../lib/api";
import { daysLeft } from "../utils/helpers";

import {
  Users,
  Calendar,
  Briefcase,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

export default function MyJobsPage({
  setPage,
  setSelectedJob,
  currentUser,
}) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ─────────────────────────────────────────────
  // Load jobs posted by the logged-in teacher
  // ─────────────────────────────────────────────

  const loadMyJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await jobsAPI.getMine();

      // Backend should return an array.
      // This also safely handles common { jobs: [...] } responses.
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.jobs)
        ? data.jobs
        : [];

      setJobs(list);
    } catch (err) {
      console.error("Failed to load my jobs:", err);
      setError(err.message || "Failed to load your jobs.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      setJobs([]);
      setLoading(false);
      return;
    }

    loadMyJobs();
  }, [currentUser?.id]);

  // ─────────────────────────────────────────────
  // Open a specific job
  // ─────────────────────────────────────────────

  const openJob = (job) => {
    setSelectedJob(job);
    setPage("job-detail");
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            My Jobs
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            {loading
              ? "Loading…"
              : `${jobs.length} posting${
                  jobs.length !== 1 ? "s" : ""
                } · manage your jobs and applications`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadMyJobs}
            disabled={loading}
            title="Refresh"
            className="p-2.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-blue-700 hover:border-blue-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
          </button>

          <Btn onClick={() => setPage("post-job")}>
            Post a Job
          </Btn>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">
            Failed to load your jobs
          </p>

          <p className="text-xs text-red-600 mt-1">
            {error}
          </p>

          <button
            type="button"
            onClick={loadMyJobs}
            className="mt-3 text-xs font-semibold text-red-700 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <Loading label="Loading your jobs…" />
      )}

      {/* Empty */}
      {!loading && !error && jobs.length === 0 && (
        <EmptyState
          icon={Briefcase}
          title="No jobs posted yet"
          subtitle="Post your first job to start receiving applications from verified students."
        />
      )}

      {/* Jobs */}
      {!loading && jobs.length > 0 && (
        <div className="flex flex-col gap-4">
          {jobs.map((job) => {
            const applicantCount =
              Number(job.applicants ?? job.applicationCount ?? 0);

            return (
              <Card
                key={job.id}
                className="p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-5 flex-wrap">
                  {/* Main information */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <StatusBadge status={job.status} />

                      <span className="text-xs text-slate-500 font-medium bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                        {job.category || "General"}
                      </span>
                    </div>

                    <h3 className="font-semibold text-slate-900 text-base">
                      {job.title}
                    </h3>

                    {job.description && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                        {job.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Users size={12} />

                        {applicantCount} applicant
                        {applicantCount !== 1 ? "s" : ""}
                      </span>

                      {job.deadline && (
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Calendar size={12} />

                          {daysLeft(job.deadline)}
                        </span>
                      )}

                      <span className="text-xs font-bold text-emerald-600">
                        ₹{job.amount}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Btn
                      size="sm"
                      variant="secondary"
                      onClick={() => openJob(job)}
                      icon={<ArrowRight size={12} />}
                    >
                      View Job
                    </Btn>
                  </div>
                </div>

                {/* Bottom application section */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Users size={14} />

                    <span>
                      <strong className="text-slate-700">
                        {applicantCount}
                      </strong>{" "}
                      application
                      {applicantCount !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      /*
                       * Your current App.jsx does NOT have a dedicated
                       * applicants page/route yet.
                       *
                       * Therefore we do not pretend that
                       * /my-jobs/:id/applicants exists.
                       *
                       * For now, open the job itself.
                       */
                      openJob(job);
                    }}
                    className="text-sm font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                  >
                    Review Job →
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}