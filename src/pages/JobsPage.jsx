import { useEffect, useState } from "react";

import { jobsAPI } from "../lib/api";

import JobCard from "../components/JobCard";
import Loading from "../components/ui/Loading";
import EmptyState from "../components/ui/EmptyState";

import { CATEGORIES } from "../data/constants";

import {
  Search,
  Briefcase,
} from "lucide-react";

export default function JobsPage({
  setPage,
  setSelectedJob,
}) {
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState(null);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [onlyOpen, setOnlyOpen] = useState(false);

  // ── Load REAL jobs from backend ──────────────────────────────────────────
  useEffect(() => {
    async function loadJobs() {
      try {
        setLoadingJobs(true);
        setJobsError(null);

        const params = {
          sort: sortBy,
        };

        if (activeCategory !== "All") {
          params.category = activeCategory;
        }

        if (search.trim()) {
          params.search = search.trim();
        }

        const data = await jobsAPI.getAll(params);

        setJobs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load jobs:", err);
        setJobsError(
          err.message || "Failed to load jobs"
        );
      } finally {
        setLoadingJobs(false);
      }
    }

    loadJobs();
  }, [activeCategory, search, sortBy]);

  // ── Frontend open filter ─────────────────────────────────────────────────
  const filtered = jobs.filter((job) => {
    if (!onlyOpen) return true;

    return job.status === "OPEN";
  });

  // ── Open job detail ──────────────────────────────────────────────────────
  const openJob = (job) => {
    setSelectedJob(job);
    setPage("job-detail");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Browse Jobs
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          {loadingJobs
            ? "Loading jobs…"
            : `${filtered.length} jobs available on your campus`}
        </p>
      </div>

      {/* ── Search + Controls ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">

        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search jobs by title or keyword..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value)
          }
          className="px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="newest">
            Newest first
          </option>

          <option value="amount-high">
            Highest pay
          </option>

          <option value="amount-low">
            Lowest pay
          </option>
        </select>

        {/* Open only */}
        <label className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg bg-white cursor-pointer hover:bg-slate-50 transition-colors">
          <input
            type="checkbox"
            checked={onlyOpen}
            onChange={(e) =>
              setOnlyOpen(e.target.checked)
            }
            className="accent-blue-700"
          />

          <span className="text-sm text-slate-700 font-medium whitespace-nowrap">
            Open only
          </span>
        </label>
      </div>

      {/* ── Category chips ──────────────────────────────────────────────── */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() =>
              setActiveCategory(category)
            }
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              activeCategory === category
                ? "bg-blue-700 text-white border-blue-700"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {jobsError && (
        <div className="py-16 text-center">
          <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-xl p-5">
            <p className="text-red-600 font-semibold mb-1">
              Failed to load jobs
            </p>

            <p className="text-sm text-red-500">
              {jobsError}
            </p>

            <button
              onClick={() =>
                window.location.reload()
              }
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* ── Loading ────────────────────────────────────────────────────── */}
      {loadingJobs && !jobsError && (
        <Loading label="Loading jobs…" />
      )}

      {/* ── Jobs ───────────────────────────────────────────────────────── */}
      {!loadingJobs &&
        !jobsError &&
        filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onClick={() => openJob(job)}
              />
            ))}
          </div>
        )}

      {/* ── Empty ───────────────────────────────────────────────────────── */}
      {!loadingJobs &&
        !jobsError &&
        filtered.length === 0 && (
          <EmptyState
            icon={Briefcase}
            title="No jobs found"
            subtitle={
              search ||
              activeCategory !== "All" ||
              onlyOpen
                ? "Try a different search or filter."
                : "There are no jobs posted yet."
            }
          />
        )}
    </div>
  );
}