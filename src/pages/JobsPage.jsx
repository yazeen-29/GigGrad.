import { useEffect, useState } from "react";
import { getExperience } from "../utils/experience";
import { jobsAPI, getUser } from "../lib/api";
import JobCard from "../components/JobCard";
import Loading from "../components/ui/Loading";
import EmptyState from "../components/ui/EmptyState";
import { CATEGORIES } from "../data/constants";
import {
  Search,
  Briefcase,
  Bookmark,
  ArrowLeft,
  ArrowRight,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
export default function JobsPage({ setPage, currentUser }) {
  const experience = getExperience(currentUser);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [page, setPageNumber] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 0 });
  const [retry, setRetry] = useState(0);
  const [savedOnly, setSavedOnly] = useState(false);
  const storageKey = `gg_saved_${getUser()?.id || "guest"}`;
  const [saved, setSaved] = useState(() => {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    if (savedOnly) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const result = await jobsAPI.getAll(
          { search: search.trim(), category, sort, page },
          controller.signal,
        );
        if (!controller.signal.aborted) {
          setJobs(result.jobs);
          setMeta({ total: result.total, pages: result.pages });
        }
      } catch (err) {
        if (!controller.signal.aborted) setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, category, sort, page, retry, savedOnly]);
  function bookmark(job) {
    const next = saved.some((item) => item.id === job.id)
      ? saved.filter((item) => item.id !== job.id)
      : [...saved, job];
    setSaved(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      setError("Your browser could not save this bookmark.");
    }
  }
  const visible = savedOnly
    ? saved.filter(
        (job) =>
          (category === "All" || job.category === category) &&
          `${job.title} ${job.description}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      )
    : jobs;
  function filter(setter, value) {
    setter(value);
    setPageNumber(1);
  }
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="market-header rounded-3xl p-7 sm:p-10 mb-8 relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <span className="eyebrow text-blue-200">
            <Sparkles size={14} /> SMALL GIGS. REAL POSSIBILITIES.
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-4 mb-3">
            {experience.isAdmin ? (
              "The campus work board, at a glance."
            ) : experience.kind === "faculty" ? (
              "See how campus expertise comes together."
            ) : experience.kind === "staff" ? (
              "A clearer view of campus collaboration."
            ) : (
              <>
                Your next opportunity
                <br />
                is closer than you think.
              </>
            )}
          </h1>
          <p className="text-blue-100 text-sm leading-relaxed">
            {experience.isAdmin
              ? "Review open postings across the community. Participant permissions still apply."
              : experience.isPoster && !experience.isStudent
                ? "Explore campus briefs and project categories. Manage your own applicants and delivery from your dashboard."
                : "Put your skills to work, build your portfolio, and earn around your classes. Find a campus gig that fits you."}
          </p>
        </div>
        <Briefcase
          className="absolute right-10 bottom-4 text-white/10 hidden sm:block"
          size={170}
          strokeWidth={1}
        />
      </div>
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {savedOnly ? "Your shortlist" : "Explore opportunities"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {savedOnly
              ? `${saved.length} saved on this device`
              : `${meta.total} open gigs · a little work, a lot of potential`}
          </p>
        </div>
        <button
          onClick={() => setSavedOnly(!savedOnly)}
          aria-pressed={savedOnly}
          className={`flex gap-2 items-center px-4 py-2.5 rounded-xl text-sm font-semibold border ${savedOnly ? "bg-blue-700 border-blue-700 text-white" : "bg-white border-slate-200 text-slate-700"}`}
        >
          <Bookmark size={15} />
          Saved ({saved.length})
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-3 flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-3 text-slate-400" />
          <input
            aria-label="Search jobs"
            value={search}
            onChange={(e) => filter(setSearch, e.target.value)}
            placeholder="Try ‘design’, ‘coding’, or a skill you love…"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl text-sm outline-none"
          />
        </div>
        <div className="flex items-center gap-2 border-l border-slate-100 pl-3">
          <SlidersHorizontal size={16} className="text-slate-400" />
          <select
            aria-label="Sort opportunities"
            value={sort}
            onChange={(e) => filter(setSort, e.target.value)}
            className="text-sm bg-white py-2.5 pr-3 text-slate-700"
          >
            <option value="newest">Recently posted</option>
            <option value="amount-high">Highest budget</option>
            <option value="amount-low">Lowest budget</option>
            <option value="deadline">Closing soon</option>
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-7">
        {CATEGORIES.map((item) => (
          <button
            key={item}
            aria-pressed={category === item}
            onClick={() => filter(setCategory, item)}
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${category === item ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-blue-400"}`}
          >
            {item}
          </button>
        ))}
      </div>
      {error && !savedOnly && (
        <div
          role="alert"
          className="rounded-2xl p-8 border border-red-200 bg-red-50 text-center"
        >
          <p className="font-semibold text-red-700">
            We couldn’t load opportunities.
          </p>
          <p className="text-sm text-red-600 mt-2">{error}</p>
          <button
            onClick={() => setRetry(retry + 1)}
            className="mt-4 text-sm font-bold text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )}
      {loading && !savedOnly && !error && (
        <Loading label="Finding your next opportunity…" />
      )}
      {(!loading || savedOnly) && (!error || savedOnly) && (
        <>
          {visible.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {visible.map((job) => (
                <div key={job.id} className="relative">
                  <JobCard
                    job={job}
                    onClick={() => setPage("job-detail", job)}
                  />
                  <button
                    onClick={() => bookmark(job)}
                    aria-label={`${saved.some((item) => item.id === job.id) ? "Remove saved job" : "Save job"}: ${job.title}`}
                    aria-pressed={saved.some((item) => item.id === job.id)}
                    className="absolute right-4 top-16 bg-white rounded-lg p-1.5 text-blue-700 hover:bg-blue-50"
                  >
                    <Bookmark
                      size={17}
                      fill={
                        saved.some((item) => item.id === job.id)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={savedOnly ? Bookmark : Briefcase}
              title={
                savedOnly
                  ? "Make room for your next move"
                  : "No matching opportunities yet"
              }
              subtitle={
                savedOnly
                  ? "Save interesting gigs here and come back when you’re ready to apply."
                  : "Try another category or search. New jobs will appear as posters publish them."
              }
            />
          )}
        </>
      )}
      {!savedOnly && !loading && !error && meta.pages > 1 && (
        <div className="flex justify-center items-center gap-5 mt-8">
          <button
            aria-label="Previous page"
            disabled={page === 1}
            onClick={() => setPageNumber(page - 1)}
            className="p-3 rounded-xl border border-slate-200 bg-white disabled:opacity-30"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="text-sm text-slate-600">
            {page} / {meta.pages}
          </span>
          <button
            aria-label="Next page"
            disabled={page >= meta.pages}
            onClick={() => setPageNumber(page + 1)}
            className="p-3 rounded-xl border border-slate-200 bg-white disabled:opacity-30"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      )}
      <p className="text-xs text-slate-400 mt-10 text-center">
        A clear brief. A fair budget. A chance to grow.
      </p>
    </div>
  );
}
