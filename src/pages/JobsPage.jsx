import { useState } from "react";
import { useNavigate } from "react-router-dom";

import JobCard from "../components/JobCard";
import Loading from "../components/ui/Loading";
import EmptyState from "../components/ui/EmptyState";

import { CATEGORIES } from "../data/constants";
import { useAsync } from "../hooks/useAsync";
import { getJobs } from "../services/jobs";

import {
  Search,
  Briefcase
} from "lucide-react";

export default function JobsPage() {
  const navigate = useNavigate();
  const { data: jobs, loading } = useAsync(getJobs);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [onlyOpen, setOnlyOpen] = useState(false);

  const filtered = (jobs || []).filter(j => {
    const matchCat   = activeCategory === "All" || j.category === activeCategory;
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) ||
                        j.description.toLowerCase().includes(search.toLowerCase());
    const matchOpen  = !onlyOpen || j.status === "open";
    return matchCat && matchSearch && matchOpen;
  }).sort((a, b) => {
    if (sortBy === "amount-high") return b.amount - a.amount;
    if (sortBy === "amount-low")  return a.amount - b.amount;
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Browse Jobs</h1>
        <p className="text-slate-500 text-sm">
          {loading ? "Loading jobs…" : `${filtered.length} jobs available on your campus`}
        </p>
      </div>

      {/* Search + Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search jobs by title or keyword..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="newest">Newest first</option>
          <option value="amount-high">Highest pay</option>
          <option value="amount-low">Lowest pay</option>
        </select>
        <label className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg bg-white cursor-pointer hover:bg-slate-50 transition-colors">
          <input type="checkbox" checked={onlyOpen} onChange={e => setOnlyOpen(e.target.checked)} className="accent-blue-700" />
          <span className="text-sm text-slate-700 font-medium whitespace-nowrap">Open only</span>
        </label>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              activeCategory === cat
                ? "bg-blue-700 text-white border-blue-700"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <Loading label="Loading jobs…" />
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(job => (
            <JobCard key={job.id} job={job} onClick={() => navigate(`/jobs/${job.id}`)} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No jobs found"
          subtitle="Try a different category or search term"
        />
      )}
    </div>
  );
}
