import { useCallback, useEffect, useState } from "react";

import {
  appsAPI,
  jobsAPI,
  getUser,
} from "../lib/api";

import Card from "../components/ui/Card";
import Btn from "../components/ui/Btn";
import Avatar from "../components/ui/Avatar";
import RatingStars from "../components/ui/RatingStars";
import StatusBadge from "../components/ui/StatusBadge";
import Loading from "../components/ui/Loading";

import {
  Briefcase,
  Clock,
  CheckCircle,
  Star,
  Send,
  Users,
  RefreshCw,
  ChevronRight,
  UserCheck,
  XCircle,
  Loader2,
} from "lucide-react";


export default function DashboardPage({
  setPage,
  setSelectedJob,
  currentUser,
}) {
  // ─────────────────────────────────────────────
  // Current user
  // ─────────────────────────────────────────────

  const user = currentUser || getUser();

  const isPoster =
    user?.role === "TEACHER" ||
    user?.role === "ADMIN";

  const isStudent =
    user?.role === "STUDENT";


  // ─────────────────────────────────────────────
  // Dashboard data
  // ─────────────────────────────────────────────

  const [applications, setApplications] =
    useState([]);

  const [myJobs, setMyJobs] =
    useState([]);

  /*
   * Incoming applications for jobs posted by
   * the teacher/admin.
   *
   * Shape:
   *
   * {
   *   [jobId]: [...]
   * }
   */
  const [jobApplications, setJobApplications] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState(null);


  // ─────────────────────────────────────────────
  // Default tab
  //
  // Teacher/Admin → My Posted Jobs
  // Student       → My Applications
  // ─────────────────────────────────────────────

  const [activeTab, setActiveTab] =
    useState(isPoster ? "posted" : "applied");


  // ─────────────────────────────────────────────
  // Accept / reject state
  // ─────────────────────────────────────────────

  const [processingApplication, setProcessingApplication] =
    useState(null);


  // ─────────────────────────────────────────────
  // Load dashboard
  // ─────────────────────────────────────────────

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);


        // ───────────────────────────────────────
        // STUDENT
        //
        // Fetch applications made by student.
        // ───────────────────────────────────────

        if (isStudent) {
          const apps =
            await appsAPI.mine();

          setApplications(
            Array.isArray(apps)
              ? apps
              : []
          );

          setMyJobs([]);
          setJobApplications({});

          return;
        }


        // ───────────────────────────────────────
        // TEACHER / ADMIN
        //
        // Fetch jobs posted by this user.
        // ───────────────────────────────────────

        if (isPoster) {
          const jobs =
            await jobsAPI.getMine();

          const safeJobs =
            Array.isArray(jobs)
              ? jobs
              : [];

          setMyJobs(safeJobs);


          /*
           * IMPORTANT:
           *
           * jobsAPI.getMine() gives us the job and
           * _count.applications.
           *
           * But to display the actual applicants,
           * we must call:
           *
           * GET /api/applications/job/:jobId
           *
           * for each job.
           */

          const applicationEntries =
            await Promise.all(
              safeJobs.map(
                async (job) => {
                  try {
                    const apps =
                      await appsAPI.forJob(
                        job.id
                      );

                    return [
                      job.id,
                      Array.isArray(apps)
                        ? apps
                        : [],
                    ];

                  } catch (err) {
                    console.error(
                      `Failed to load applications for job ${job.id}:`,
                      err
                    );

                    return [
                      job.id,
                      [],
                    ];
                  }
                }
              )
            );


          const applicationMap =
            Object.fromEntries(
              applicationEntries
            );

          setJobApplications(
            applicationMap
          );

          setApplications([]);
        }

      } catch (err) {
        console.error(
          "Dashboard loading error:",
          err
        );

        setError(
          err?.message ||
          "Failed to load dashboard"
        );

      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      user?.id,
      isStudent,
      isPoster,
    ]
  );


  // ─────────────────────────────────────────────
  // Initial load
  // ─────────────────────────────────────────────

  useEffect(() => {
    loadDashboard(false);
  }, [loadDashboard]);


  // ─────────────────────────────────────────────
  // Refresh when returning to dashboard
  //
  // Useful when:
  //
  // Student applies → goes dashboard
  // Teacher opens dashboard after student applies
  // ─────────────────────────────────────────────

  useEffect(() => {
    const handleFocus = () => {
      loadDashboard(true);
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [loadDashboard]);


  // ─────────────────────────────────────────────
  // Manual refresh
  // ─────────────────────────────────────────────

  const refresh = () => {
    loadDashboard(true);
  };


  // ─────────────────────────────────────────────
  // Open job detail
  // ─────────────────────────────────────────────

  const openJob = (job) => {
    if (!job?.id) return;

    if (
      typeof setSelectedJob ===
      "function"
    ) {
      setSelectedJob(job);
    }

    /*
     * IMPORTANT:
     *
     * Your current App navigation expects:
     *
     * setPage("job-detail", job)
     *
     * so JobDetailPage receives the actual
     * backend job object.
     */

    setPage(
      "job-detail",
      job
    );
  };


  // ─────────────────────────────────────────────
  // Accept application
  // ─────────────────────────────────────────────

  const acceptApplication =
    async (application) => {
      if (!application?.id) return;

      const confirmed =
        window.confirm(
          `Hire ${
            application.applicant?.name ||
            "this student"
          } for this job?`
        );

      if (!confirmed) return;

      setProcessingApplication(
        application.id
      );

      try {
        await appsAPI.accept(
          application.id
        );

        /*
         * Reload everything so:
         *
         * application → ACCEPTED
         * job → IN_PROGRESS
         * assignedTo → student
         * stats → updated
         */

        await loadDashboard(true);

      } catch (err) {
        alert(
          err?.message ||
          "Failed to accept application"
        );
      } finally {
        setProcessingApplication(
          null
        );
      }
    };


  // ─────────────────────────────────────────────
  // Reject application
  // ─────────────────────────────────────────────

  const rejectApplication =
    async (application) => {
      if (!application?.id) return;

      const confirmed =
        window.confirm(
          `Reject ${
            application.applicant?.name ||
            "this application"
          }?`
        );

      if (!confirmed) return;

      setProcessingApplication(
        application.id
      );

      try {
        /*
         * Your frontend api.js contains reject().
         */
        await appsAPI.reject(
          application.id
        );

        await loadDashboard(true);

      } catch (err) {
        alert(
          err?.message ||
          "Failed to reject application"
        );
      } finally {
        setProcessingApplication(
          null
        );
      }
    };


  // ─────────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Loading
          label="Loading dashboard…"
        />
      </div>
    );
  }


  // ─────────────────────────────────────────────
  // Stats
  // ─────────────────────────────────────────────

  const totalPosted =
    myJobs.length;

  const activeJobs =
    myJobs.filter(
      (job) =>
        job.status === "OPEN" ||
        job.status === "IN_PROGRESS"
    ).length;

  const completedJobs =
    myJobs.filter(
      (job) =>
        job.status === "COMPLETED"
    ).length;


  const totalIncomingApplications =
    Object.values(
      jobApplications
    ).reduce(
      (total, apps) =>
        total + apps.length,
      0
    );


  const acceptedApplications =
    applications.filter(
      (app) =>
        app.status === "ACCEPTED"
    ).length;


  const pendingApplications =
    applications.filter(
      (app) =>
        app.status === "PENDING"
    ).length;


  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">


      {/* ═══════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════ */}

      <div className="flex items-center justify-between gap-4 mb-6">

        <div className="flex items-center gap-4">

          <Avatar
            name={
              user?.name ||
              "User"
            }
            size="xl"
            role={user?.role}
          />

          <div>

            <h1 className="text-xl font-bold text-slate-900">
              {user?.name ||
                "Welcome to GigGrad"}
            </h1>

            <p className="text-sm text-slate-400">
              {user?.college ||
                "GigGrad member"}
            </p>

            <div className="flex items-center gap-3 mt-1.5">

              <RatingStars
                rating={
                  Number(
                    user?.rating || 0
                  )
                }
              />

              <span className="text-xs text-slate-400">
                •
              </span>

              <span className="text-xs text-slate-500 font-medium">
                {isPoster
                  ? `${completedJobs} jobs completed`
                  : `${acceptedApplications} jobs hired`}
              </span>

            </div>

          </div>

        </div>


        {/* Refresh */}

        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          title="Refresh dashboard"
          className="p-2.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-blue-700 hover:border-blue-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />
        </button>

      </div>


      {/* ═══════════════════════════════════════════
          STATS
      ═══════════════════════════════════════════ */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">

        {isPoster ? (

          <>

            <StatCard
              label="Jobs Posted"
              value={totalPosted}
              icon={Briefcase}
              color="text-blue-600 bg-blue-50 border-blue-200"
            />

            <StatCard
              label="Active Jobs"
              value={activeJobs}
              icon={Clock}
              color="text-amber-600 bg-amber-50 border-amber-200"
            />

            <StatCard
              label="Completed"
              value={completedJobs}
              icon={CheckCircle}
              color="text-emerald-600 bg-emerald-50 border-emerald-200"
            />

            <StatCard
              label="Your Rating"
              value={`${Number(
                user?.rating || 0
              ).toFixed(1)}★`}
              icon={Star}
              color="text-violet-600 bg-violet-50 border-violet-200"
            />

          </>

        ) : (

          <>

            <StatCard
              label="Applications"
              value={
                applications.length
              }
              icon={Send}
              color="text-violet-600 bg-violet-50 border-violet-200"
            />

            <StatCard
              label="Hired"
              value={
                acceptedApplications
              }
              icon={CheckCircle}
              color="text-emerald-600 bg-emerald-50 border-emerald-200"
            />

            <StatCard
              label="Pending"
              value={
                pendingApplications
              }
              icon={Clock}
              color="text-amber-600 bg-amber-50 border-amber-200"
            />

            <StatCard
              label="Your Rating"
              value={`${Number(
                user?.rating || 0
              ).toFixed(1)}★`}
              icon={Star}
              color="text-blue-600 bg-blue-50 border-blue-200"
            />

          </>

        )}

      </div>


      {/* ═══════════════════════════════════════════
          ERROR
      ═══════════════════════════════════════════ */}

      {error && (

        <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4">

          <div className="flex items-center justify-between gap-4">

            <div>

              <p className="text-sm font-semibold text-red-700">
                Dashboard update failed
              </p>

              <p className="text-xs text-red-500 mt-1">
                {error}
              </p>

            </div>

            <button
              type="button"
              onClick={refresh}
              className="text-xs font-semibold text-red-700 hover:underline"
            >
              Retry
            </button>

          </div>

        </div>

      )}


      {/* ═══════════════════════════════════════════
          TABS
      ═══════════════════════════════════════════ */}

      <div className="flex gap-1 border-b border-slate-200 mb-5">

        {isPoster ? (

          <>

            <DashboardTab
              active={
                activeTab === "posted"
              }
              onClick={() =>
                setActiveTab("posted")
              }
              label="My Posted Jobs"
              count={totalPosted}
            />

            <DashboardTab
              active={
                activeTab === "applicants"
              }
              onClick={() =>
                setActiveTab(
                  "applicants"
                )
              }
              label="Applicants"
              count={
                totalIncomingApplications
              }
            />

            <DashboardTab
              active={
                activeTab === "profile"
              }
              onClick={() =>
                setActiveTab("profile")
              }
              label="My Profile"
            />

          </>

        ) : (

          <>

            <DashboardTab
              active={
                activeTab === "applied"
              }
              onClick={() =>
                setActiveTab("applied")
              }
              label="My Applications"
              count={
                applications.length
              }
            />

            <DashboardTab
              active={
                activeTab === "profile"
              }
              onClick={() =>
                setActiveTab("profile")
              }
              label="My Profile"
            />

          </>

        )}

      </div>


      {/* ═══════════════════════════════════════════
          TEACHER — MY POSTED JOBS
      ═══════════════════════════════════════════ */}

      {isPoster &&
        activeTab === "posted" && (

          <div className="space-y-3">

            {myJobs.length === 0 ? (

              <Card className="p-10 text-center">

                <Briefcase
                  size={28}
                  className="mx-auto text-slate-300 mb-3"
                />

                <h3 className="font-semibold text-slate-900 mb-1">
                  No jobs posted yet
                </h3>

                <p className="text-sm text-slate-400 mb-4">
                  Post your first campus job to
                  start receiving applications.
                </p>

                <Btn
                  onClick={() =>
                    setPage("post-job")
                  }
                  icon={
                    <Briefcase size={14} />
                  }
                >
                  Post a Job
                </Btn>

              </Card>

            ) : (

              myJobs.map((job) => {

                const apps =
                  jobApplications[
                    job.id
                  ] || [];

                const count =
                  job._count?.applications ??
                  apps.length;

                return (
                  <PostedJobCard
                    key={job.id}
                    job={job}
                    applications={apps}
                    applicantCount={count}
                    onOpen={() =>
                      openJob(job)
                    }
                    onViewApplicants={() =>
                      setPage(
                        "applicants",
                        job
                      )
                    }
                  />
                );
              })

            )}

          </div>

        )}


      {/* ═══════════════════════════════════════════
          TEACHER — ALL APPLICANTS
      ═══════════════════════════════════════════ */}

      {isPoster &&
        activeTab === "applicants" && (

          <div className="space-y-5">

            {myJobs.length === 0 ? (

              <Card className="p-10 text-center">

                <Users
                  size={28}
                  className="mx-auto text-slate-300 mb-3"
                />

                <p className="text-sm text-slate-400">
                  No posted jobs yet.
                </p>

              </Card>

            ) : (

              myJobs.map((job) => {

                const apps =
                  jobApplications[
                    job.id
                  ] || [];

                return (
                  <Card
                    key={job.id}
                    className="overflow-hidden"
                  >

                    <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">

                      <div>

                        <button
                          type="button"
                          onClick={() =>
                            openJob(job)
                          }
                          className="font-semibold text-slate-900 text-sm hover:text-blue-700 text-left"
                        >
                          {job.title}
                        </button>

                        <p className="text-xs text-slate-400 mt-1">
                          {apps.length} applicant
                          {apps.length !== 1
                            ? "s"
                            : ""}
                        </p>

                      </div>

                      <StatusBadge
                        status={
                          job.status
                        }
                      />

                    </div>


                    <div className="p-4">

                      {apps.length === 0 ? (

                        <p className="text-sm text-slate-400">
                          No applications yet.
                        </p>

                      ) : (

                        <div className="space-y-3">

                          {apps.map(
                            (application) => (

                              <ApplicantRow
                                key={
                                  application.id
                                }
                                application={
                                  application
                                }
                                processing={
                                  processingApplication ===
                                  application.id
                                }
                                canProcess={
                                  job.status ===
                                  "OPEN"
                                }
                                onAccept={() =>
                                  acceptApplication(
                                    application
                                  )
                                }
                                onReject={() =>
                                  rejectApplication(
                                    application
                                  )
                                }
                              />

                            )
                          )}

                        </div>

                      )}

                    </div>

                  </Card>
                );

              })

            )}

          </div>

        )}


      {/* ═══════════════════════════════════════════
          STUDENT — APPLICATIONS
      ═══════════════════════════════════════════ */}

      {!isPoster &&
        activeTab === "applied" && (

          <div className="space-y-3">

            {applications.length === 0 ? (

              <Card className="p-10 text-center">

                <Send
                  size={28}
                  className="mx-auto text-slate-300 mb-3"
                />

                <h3 className="font-semibold text-slate-900 mb-1">
                  No applications yet
                </h3>

                <p className="text-sm text-slate-400 mb-4">
                  Browse available jobs and
                  submit your first application.
                </p>

                <Btn
                  onClick={() =>
                    setPage("jobs")
                  }
                  icon={
                    <Briefcase size={14} />
                  }
                >
                  Browse Jobs
                </Btn>

              </Card>

            ) : (

              applications.map(
                (application) => {

                  const job =
                    application.job;

                  if (!job) {
                    return null;
                  }

                  return (
                    <Card
                      key={
                        application.id
                      }
                      className="p-4"
                    >

                      <div className="flex items-center justify-between gap-4">

                        <div className="min-w-0">

                          <button
                            type="button"
                            onClick={() =>
                              openJob(job)
                            }
                            className="font-semibold text-slate-900 text-sm hover:text-blue-700 text-left truncate block max-w-full"
                          >
                            {job.title}
                          </button>

                          <p className="text-xs text-slate-400 mt-1">
                            ₹
                            {Number(
                              job.amount || 0
                            ).toLocaleString(
                              "en-IN"
                            )}

                            {" · "}

                            {job.category ||
                              "General"}
                          </p>

                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">

                          <ApplicationStatus
                            status={
                              application.status
                            }
                          />

                          <ChevronRight
                            size={15}
                            className="text-slate-300"
                          />

                        </div>

                      </div>


                      {application.coverNote && (

                        <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100 line-clamp-2">
                          {application.coverNote}
                        </p>

                      )}

                    </Card>
                  );
                }
              )

            )}

          </div>

        )}


      {/* ═══════════════════════════════════════════
          PROFILE
      ═══════════════════════════════════════════ */}

      {activeTab === "profile" && (

        <Card className="p-6">

          <div className="flex items-center gap-4">

            <Avatar
              name={
                user?.name ||
                "User"
              }
              size="lg"
              role={user?.role}
            />

            <div>

              <h2 className="font-bold text-slate-900">
                {user?.name ||
                  "User"}
              </h2>

              <p className="text-sm text-slate-400">
                {user?.email}
              </p>

              <p className="text-sm text-slate-400">
                {user?.college}
              </p>

            </div>

          </div>


          <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-2 gap-4">

            <div>

              <p className="text-xs text-slate-400">
                Role
              </p>

              <p className="text-sm font-semibold text-slate-700 mt-1">
                {user?.role}
              </p>

            </div>

            <div>

              <p className="text-xs text-slate-400">
                Rating
              </p>

              <p className="text-sm font-semibold text-slate-700 mt-1">
                {Number(
                  user?.rating || 0
                ).toFixed(1)}
                ★
              </p>

            </div>

          </div>

        </Card>

      )}

    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   STAT CARD
═══════════════════════════════════════════════════════════════ */

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}) {
  const parts =
    color.split(" ");

  return (
    <Card
      className={`p-4 border ${
        parts
          .slice(2)
          .join(" ")
      }`}
    >

      <div className="flex items-center gap-2 mb-1">

        <Icon
          size={13}
          className={
            parts[0]
          }
        />

        <span className="text-xs text-slate-400 font-medium">
          {label}
        </span>

      </div>

      <p
        className={`text-xl font-extrabold ${parts[0]}`}
      >
        {value}
      </p>

    </Card>
  );
}


/* ═══════════════════════════════════════════════════════════════
   DASHBOARD TAB
═══════════════════════════════════════════════════════════════ */

function DashboardTab({
  active,
  onClick,
  label,
  count,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
        active
          ? "text-blue-700 border-blue-700"
          : "text-slate-500 border-transparent hover:text-slate-800"
      }`}
    >

      {label}

      {count !== undefined &&
        count !== null && (

          <span
            className={`text-xs px-1.5 py-0.5 rounded-full ${
              active
                ? "bg-blue-50 text-blue-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {count}
          </span>

        )}

    </button>
  );
}


/* ═══════════════════════════════════════════════════════════════
   POSTED JOB CARD
═══════════════════════════════════════════════════════════════ */

function PostedJobCard({
  job,
  applications,
  applicantCount,
  onOpen,
}) {
  return (
    <Card className="p-5">

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0 flex-1">

          <div className="flex items-center gap-2 mb-2">

            <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
              {job.category}
            </span>

            <StatusBadge
              status={
                job.status
              }
            />

          </div>

          <button
            type="button"
            onClick={onOpen}
            className="text-base font-bold text-slate-900 hover:text-blue-700 text-left"
          >
            {job.title}
          </button>

          <p className="text-sm text-slate-500 mt-1 line-clamp-2">
            {job.description}
          </p>

        </div>


        <div className="text-right flex-shrink-0">

          <p className="text-lg font-extrabold text-emerald-600">
            ₹
            {Number(
              job.amount || 0
            ).toLocaleString(
              "en-IN"
            )}
          </p>

          <p className="text-xs text-slate-400">
            {job.deadline
              ? new Date(
                  job.deadline
                ).toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "short",
                  }
                )
              : "No deadline"}
          </p>

        </div>

      </div>


      {/* Job bottom information */}

      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100">

        <div className="flex items-center gap-4">

          <span className="flex items-center gap-1.5 text-xs text-slate-500">

            <Users
              size={13}
              className="text-slate-400"
            />

            <strong>
              {applicantCount}
            </strong>

            applicant
            {applicantCount !== 1
              ? "s"
              : ""}

          </span>


          {job.assignedTo && (

            <span className="flex items-center gap-1.5 text-xs text-emerald-600">

              <UserCheck
                size={13}
              />

              Assigned to{" "}
              <strong>
                {
                  job
                    .assignedTo
                    .name
                }
              </strong>

            </span>

          )}

        </div>


        <button
          type="button"
          onClick={onOpen}
          className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
        >
          View Job
          <ChevronRight
            size={13}
          />
        </button>

      </div>


      {/* Applicant preview */}

      {applications.length > 0 && (

        <div className="mt-4 pt-4 border-t border-slate-100">

          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Recent Applicants
          </p>

          <div className="flex flex-wrap gap-2">

            {applications
              .slice(0, 3)
              .map(
                (application) => (

                  <div
                    key={
                      application.id
                    }
                    className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-2"
                  >

                    <Avatar
                      name={
                        application
                          .applicant
                          ?.name ||
                        "Student"
                      }
                      size="sm"
                      role="student"
                    />

                    <div>

                      <p className="text-xs font-semibold text-slate-700">
                        {
                          application
                            .applicant
                            ?.name ||
                          "Student"
                        }
                      </p>

                      <p className="text-[11px] text-slate-400">
                        {application.status ||
                          "PENDING"}
                      </p>

                    </div>

                  </div>

                )
              )}

          </div>

        </div>

      )}

    </Card>
  );
}


/* ═══════════════════════════════════════════════════════════════
   APPLICANT ROW
═══════════════════════════════════════════════════════════════ */

function ApplicantRow({
  application,
  processing,
  canProcess,
  onAccept,
  onReject,
}) {
  const applicant =
    application.applicant || {};

  return (
    <div className="border border-slate-100 rounded-xl p-4">

      <div className="flex items-start justify-between gap-4">

        <div className="flex items-center gap-3">

          <Avatar
            name={
              applicant.name ||
              "Student"
            }
            size="md"
            role="student"
          />

          <div>

            <p className="text-sm font-semibold text-slate-800">
              {applicant.name ||
                "Student"}
            </p>

            <div className="flex items-center gap-2 mt-0.5">

              <RatingStars
                rating={
                  Number(
                    applicant.rating ||
                    0
                  )
                }
              />

              <span className="text-xs text-slate-400">
                {Number(
                  applicant.rating ||
                  0
                ).toFixed(1)}
              </span>

            </div>

          </div>

        </div>


        <ApplicationStatus
          status={
            application.status
          }
        />

      </div>


      {application.coverNote && (

        <div className="mt-3 p-3 bg-slate-50 rounded-lg">

          <p className="text-xs text-slate-500 leading-relaxed">
            {application.coverNote}
          </p>

        </div>

      )}


      {canProcess &&
        application.status ===
          "PENDING" && (

          <div className="flex gap-2 mt-3">

            <Btn
              size="sm"
              onClick={onAccept}
              disabled={
                processing
              }
              icon={
                processing ? (
                  <Loader2
                    size={13}
                    className="animate-spin"
                  />
                ) : (
                  <UserCheck
                    size={13}
                  />
                )
              }
            >
              {processing
                ? "Processing..."
                : "Accept & Hire"}
            </Btn>


            <Btn
              variant="ghost"
              size="sm"
              onClick={onReject}
              disabled={
                processing
              }
              icon={
                <XCircle
                  size={13}
                />
              }
            >
              Reject
            </Btn>

          </div>

        )}

    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   APPLICATION STATUS
═══════════════════════════════════════════════════════════════ */

function ApplicationStatus({
  status,
}) {
  const normalized =
    String(
      status || "PENDING"
    ).toUpperCase();

  const config = {
    PENDING: {
      label: "Pending",
      className:
        "bg-amber-50 text-amber-700 border-amber-200",
    },

    ACCEPTED: {
      label: "Hired",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
    },

    REJECTED: {
      label: "Rejected",
      className:
        "bg-red-50 text-red-700 border-red-200",
    },
  };

  const item =
    config[normalized] ||
    {
      label: normalized,
      className:
        "bg-slate-50 text-slate-600 border-slate-200",
    };

  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${item.className}`}
    >
      {item.label}
    </span>
  );
}