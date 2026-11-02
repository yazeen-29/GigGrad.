import { useEffect, useState } from "react";
import { usersAPI } from "../lib/api";
import { getExperience } from "../utils/experience";
import StatusBadge from "../components/ui/StatusBadge";
import AppBadge from "../components/ui/AppBadge";
import Loading from "../components/ui/Loading";
import EmptyState from "../components/ui/EmptyState";
import AdminPage from "./AdminPage";
import {
  ArrowUpRight,
  Briefcase,
  CheckCircle,
  Clock,
  GraduationCap,
  MessageCircle,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";
export default function DashboardPage(props) {
  return props.currentUser.role === "ADMIN" ? (
    <AdminPage {...props} />
  ) : (
    <WorkDashboard key={props.currentUser.id} {...props} />
  );
}
function WorkDashboard({ currentUser: user, setPage }) {
  const experience = getExperience(user);
  const [data, setData] = useState({ jobs: [], applications: [] }),
    [tab, setTab] = useState(experience.canPost ? "posted" : "applied"),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await usersAPI.dashboard();
        if (active) setData(result);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [version]);
  const workerView = tab === "applied",
    completed = data.applications.filter(
      (app) => app.status === "ACCEPTED" && app.job.status === "COMPLETED",
    ),
    active = data.applications.filter(
      (app) =>
        app.status === "ACCEPTED" &&
        ["IN_PROGRESS", "PENDING_APPROVAL"].includes(app.job.status),
    ),
    awaiting = data.jobs.filter((job) => job.status === "PENDING_APPROVAL");
  const stats = workerView
    ? [
        {
          label: "My applications",
          value: data.applications.length,
          icon: Briefcase,
        },
        { label: "Active assignments", value: active.length, icon: Clock },
        { label: "Completed gigs", value: completed.length, icon: CheckCircle },
        {
          label: "Completed work value",
          value: `₹${completed.reduce((sum, app) => sum + Number(app.job.amount), 0).toLocaleString("en-IN")}`,
          icon: Sparkles,
        },
      ]
    : [
        {
          label:
            experience.kind === "faculty"
              ? "Academic briefs"
              : "Published projects",
          value: data.jobs.length,
          icon: Briefcase,
        },
        {
          label: "Awaiting your review",
          value: awaiting.length,
          icon: CheckCircle,
        },
        {
          label: "Incoming applications",
          value: data.jobs
            .filter((job) => job.status === "OPEN")
            .reduce((sum, job) => sum + job._count.applications, 0),
          icon: Users,
        },
        {
          label: "Active projects",
          value: data.jobs.filter((job) =>
            ["IN_PROGRESS", "PENDING_APPROVAL"].includes(job.status),
          ).length,
          icon: Clock,
        },
      ];
  const profileComplete = !!user.bio?.trim() && !!user.skills?.length;
  const title =
    experience.kind === "student"
      ? profileComplete
        ? "Your profile is ready for its next opportunity."
        : "Your skills deserve to be seen."
      : experience.kind === "faculty"
        ? "A clear academic brief brings the right support."
        : experience.kind === "staff"
          ? "Give your campus team a reliable extra pair of hands."
          : "Your next club project starts with a clear brief.";
  const visibleJobs = tab === "review" ? awaiting : data.jobs;
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-wrap justify-between gap-5 mb-8">
        <div>
          <span className="eyebrow">
            YOUR CAMPUS WORKSPACE · {experience.label}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mt-3">
            {experience.heading}
          </h1>
          <p className="text-sm text-slate-500 mt-3 max-w-3xl">
            {experience.subtitle}
          </p>
        </div>
        <button
          aria-label="Refresh dashboard"
          disabled={loading}
          onClick={() => setVersion(version + 1)}
          className="self-start flex items-center gap-2 px-4 py-3 border border-slate-200 rounded-xl bg-white text-sm text-slate-600 font-semibold"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>
      {error && (
        <p
          role="alert"
          className="p-4 mb-5 rounded-xl bg-red-50 text-red-700 text-sm"
        >
          {error}
        </p>
      )}
      {loading ? (
        <Loading label={`Loading ${experience.label.toLowerCase()}…`} />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
            {stats.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="bg-white border border-slate-200 rounded-2xl p-5"
              >
                <Icon size={20} className="text-blue-600 mb-4" />
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-slate-500 mt-2">{label}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-blue-50 border border-blue-100 px-6 py-5 flex flex-wrap items-center justify-between gap-5 mb-7">
            <div>
              <h2 className="font-bold">{title}</h2>
              <p className="text-sm text-slate-500 mt-2">
                {experience.canPost
                  ? "Post directly, review students’ profiles, and coordinate delivery in project chat."
                  : profileComplete
                    ? "See your skills, completed work, and feedback in one place."
                    : "Add your skills and a short introduction so posters can get to know your work."}
              </p>
            </div>
            <button
              onClick={() =>
                setPage(experience.canPost ? "post-job" : "profile")
              }
              className="text-sm text-blue-700 font-bold flex gap-2 items-center"
            >
              {experience.canPost
                ? "Post a gig"
                : profileComplete
                  ? "View your profile"
                  : "Complete your profile"}
              <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-5 border-b border-slate-200 mb-6">
            {[
              ...(experience.canPost
                ? [
                    ["posted", "My postings"],
                    ["review", `Awaiting review (${awaiting.length})`],
                  ]
                : []),
              ...(experience.isStudent ? [["applied", "My applications"]] : []),
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`pb-3 text-sm font-semibold border-b-2 ${tab === key ? "text-blue-700 border-blue-700" : "text-slate-500 border-transparent"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {workerView ? (
              data.applications.length ? (
                data.applications.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => setPage("job-detail", app.job)}
                    className="w-full text-left bg-white border border-slate-200 rounded-2xl p-5 flex justify-between gap-4 items-center hover:border-blue-300"
                  >
                    <div>
                      <p className="font-bold">{app.job.title}</p>
                      <p className="text-sm text-slate-500 mt-2">
                        ₹{Number(app.job.amount).toLocaleString("en-IN")} ·{" "}
                        {app.job.postedBy.name}
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <AppBadge status={app.status} />
                      {app.status === "ACCEPTED" && (
                        <StatusBadge status={app.job.status} />
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <EmptyState
                  icon={Briefcase}
                  title="Your next campus project starts here."
                  subtitle="Explore open gigs and send a thoughtful introduction. Your applications will appear here."
                />
              )
            ) : visibleJobs.length ? (
              visibleJobs.map((job) => (
                <article
                  key={job.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-wrap justify-between items-center gap-4"
                >
                  <button
                    className="text-left"
                    onClick={() => setPage("job-detail", job)}
                  >
                    <p className="font-bold">{job.title}</p>
                    <p className="text-sm text-slate-500 mt-2">
                      ₹{Number(job.amount).toLocaleString("en-IN")} ·{" "}
                      {job._count.applications} applicants
                    </p>
                  </button>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={job.status} />
                    <button
                      onClick={() =>
                        setPage(
                          job.status === "PENDING_APPROVAL"
                            ? "job-detail"
                            : "applicants",
                          job,
                        )
                      }
                      className="text-sm font-bold text-blue-700"
                    >
                      {job.status === "PENDING_APPROVAL"
                        ? "Review delivered work →"
                        : "Review applicants →"}
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                icon={CheckCircle}
                title={
                  tab === "review"
                    ? "No work waiting for your decision."
                    : experience.empty
                }
                subtitle={
                  tab === "review"
                    ? "Submitted work will appear here when a student requests approval."
                    : experience.emptyNote
                }
              />
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-4 mt-9">
            <button
              onClick={() => setPage("messages")}
              className="bg-white border border-slate-200 rounded-2xl p-5 text-left"
            >
              <MessageCircle size={21} className="text-blue-600 mb-3" />
              <h2 className="font-bold">
                {experience.isStudent
                  ? "Keep your collaborations moving."
                  : "Coordinate with your student collaborators."}
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                Open project conversations and agree on the next step.
              </p>
            </button>
            <button
              onClick={() => setPage("scholarships")}
              className="bg-white border border-slate-200 rounded-2xl p-5 text-left"
            >
              <GraduationCap size={23} className="text-emerald-600 mb-3" />
              <h2 className="font-bold">
                {experience.isStudent
                  ? "Support for your studies."
                  : "Student funding resources to share."}
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                {experience.isStudent
                  ? "Explore scholarships, check listed criteria, and organize your applications."
                  : "Use official scholarship references when mentoring students. This is a support resource, not a personal funding prompt."}
              </p>
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-8">
            {workerView ? "Completed work value reflects agreed budgets. " : ""}
            Payment is arranged directly between participants.
          </p>
        </>
      )}
    </div>
  );
}
