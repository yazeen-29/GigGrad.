import QueuePager from "../components/QueuePager";
import { useCallback, useEffect, useState } from "react";
import { getExperience } from "../utils/experience";

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
  Eye,
} from "lucide-react";

export default function MyJobsPage({ setPage, setSelectedJob, currentUser }) {
  const [listPage, setListPage] = useState(1);
  const experience = getExperience(currentUser);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Load jobs posted by this user ────────────────────────────────────────
  const loadMyJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await jobsAPI.getMine(listPage);
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
  }, [listPage]);

  useEffect(() => {
    const timer = setTimeout(() => loadMyJobs(), 0);
    return () => clearTimeout(timer);
  }, [loadMyJobs]);

  // ── Open job detail ──────────────────────────────────────────────────────
  const openJob = (job) => {
    setSelectedJob(job);
    setPage("job-detail", job);
  };

  // ── Open applicants page ─────────────────────────────────────────────────
  const openApplicants = (job) => {
    setSelectedJob(job);
    setPage("applicants", job);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <QueuePager
        page={listPage}
        setPage={setListPage}
        hasNext={jobs.length >= 50}
      />
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {experience.kind === "faculty"
              ? "Academic projects"
              : experience.kind === "staff"
                ? "Campus projects"
                : "My Jobs"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {loading
              ? "Loading…"
              : `${jobs.length} posting${jobs.length !== 1 ? "s" : ""} — manage your jobs and applicants`}
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
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <Btn onClick={() => setPage("post-job")}>+ Post a Job</Btn>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">
            Failed to load your jobs
          </p>
          <p className="text-xs text-red-600 mt-1">{error}</p>
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
      {loading && <Loading label="Loading your jobs…" />}

      {/* Empty */}
      {!loading && !error && jobs.length === 0 && (
        <EmptyState
          icon={Briefcase}
          title="No jobs posted yet"
          subtitle={
            experience.emptyNote ||
            "Publish a campus brief to start receiving student applications."
          }
        />
      )}

      {/* Job list */}
      {!loading && jobs.length > 0 && (
        <div className="flex flex-col gap-4">
          {jobs.map((job) => {
            const applicantCount = Number(
              job._count?.applications ??
                job.applicants ??
                job.applicationCount ??
                0,
            );
            const statusKey = (job.status || "open")
              .toLowerCase()
              .replace(/_/g, "-");

            return (
              <Card key={job.id} className="p-5">
                <div className="flex items-start justify-between gap-5 flex-wrap">
                  {/* Job info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <StatusBadge status={statusKey} />
                      <span className="text-xs text-slate-500 font-medium bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                        {job.category || "General"}
                      </span>
                      {job.urgent && (
                        <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                          Urgent
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-slate-900 text-base leading-snug">
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

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Btn
                      size="sm"
                      variant="secondary"
                      onClick={() => openJob(job)}
                      icon={<Eye size={12} />}
                    >
                      View
                    </Btn>
                    <Btn
                      size="sm"
                      onClick={() => openApplicants(job)}
                      icon={<Users size={12} />}
                    >
                      Applicants
                      {applicantCount > 0 && (
                        <span className="ml-1 bg-white/30 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                          {applicantCount}
                        </span>
                      )}
                    </Btn>
                  </div>
                </div>

                {/* Bottom strip */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                  <p className="text-xs text-slate-400">
                    Posted{" "}
                    {new Date(job.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <button
                    type="button"
                    onClick={() => openApplicants(job)}
                    className="text-sm font-semibold text-blue-700 hover:underline flex items-center gap-1"
                  >
                    Review applicants <ArrowRight size={13} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <style>{`
        .animate-spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
