import { useEffect, useState } from "react";

import { jobsAPI, appsAPI, usersAPI, disputesAPI, getUser } from "../lib/api";

import Card from "../components/ui/Card";
import Btn from "../components/ui/Btn";
import Avatar from "../components/ui/Avatar";
import RatingStars from "../components/ui/RatingStars";
import StatusBadge from "../components/ui/StatusBadge";
import SectionLabel from "../components/ui/SectionLabel";
import Loading from "../components/ui/Loading";

import { STATUS_CFG } from "../data/constants";
import { daysLeft } from "../utils/helpers";

import {
  ChevronRight,
  Calendar,
  Users,
  Clock,
  Paperclip,
  Zap,
  Send,
  Loader2,
  CheckCircle,
  Shield,
  Flag,
  Play,
  Check,
} from "lucide-react";

export default function JobDetailPage({
  job: initialJob,
  setPage,
  currentUser: propUser,
}) {
  /*
   * IMPORTANT:
   * Your current App.jsx uses:
   *
   * <JobDetailPage
   *    job={selectedJob}
   *    setPage={navigate}
   *    currentUser={currentUser}
   * />
   *
   * Therefore we DO NOT use useParams() or useNavigate().
   */

  const storedUser = getUser();
  const currentUser = propUser || storedUser;

  const [job, setJob] = useState(initialJob || null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  /* Application */
  const [applying, setApplying] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [applyLoading, setApplyLoading] = useState(false);

  /* Review */
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);

  /* Dispute */
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeLoading, setDisputeLoading] = useState(false);
  const [disputeSubmitted, setDisputeSubmitted] = useState(false);

  /* Status */
  const [statusLoading, setStatusLoading] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // Load the latest job from the REAL backend
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!initialJob?.id) return;

    let cancelled = false;

    async function loadJob() {
      try {
        setLoading(true);
        setLoadError(null);

        /*
         * Refresh the selected job from PostgreSQL through Express.
         * This prevents stale job information.
         */
        const freshJob = await jobsAPI.getOne(initialJob.id);

        if (!cancelled) {
          setJob(freshJob);
        }

        /*
         * Check whether the current student already applied.
         */
        if (currentUser) {
          const membership = await jobsAPI.membership(initialJob.id);
          if (!cancelled) {
            setSubmitted(!!membership.application);
            setApplicationStatus(membership.application?.status || null);
            setReviewed(!!membership.review);
          }
        }
      } catch (err) {
        if (!cancelled) {
          /*
           * If we already have the selected job, keep displaying it
           * instead of turning the entire page blank.
           */
          setLoadError(err.message || "Failed to load job");
          setJob(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadJob();

    return () => {
      cancelled = true;
    };
  }, [initialJob, currentUser]);

  // ─────────────────────────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────────────────────────

  if (loading && !job) {
    return <Loading label="Loading job…" />;
  }

  // ─────────────────────────────────────────────────────────────
  // Error
  // ─────────────────────────────────────────────────────────────

  if (loadError && !job) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Unable to load job
        </h2>

        <p className="text-slate-500 text-sm mb-6">{loadError}</p>

        <button
          onClick={() => setPage("jobs")}
          className="text-sm font-semibold text-blue-700 hover:underline"
        >
          ← Back to all jobs
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Job not found
  // ─────────────────────────────────────────────────────────────

  if (!job) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Job not found</h2>

        <p className="text-slate-500 text-sm mb-6">
          This job may have been removed or the link is incorrect.
        </p>

        <button
          onClick={() => setPage("jobs")}
          className="text-sm font-semibold text-blue-700 hover:underline"
        >
          ← Back to all jobs
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Derived values
  // ─────────────────────────────────────────────────────────────

  const poster = job.postedBy || job.poster || {};

  const applicantCount = job._count?.applications ?? job.applicants ?? 0;

  const isPoster = currentUser?.id === job.postedById;

  const isWorker = currentUser?.id === job.assignedToId;

  const isStudent = currentUser?.role === "STUDENT";

  const isParticipant = isPoster || isWorker;
  const applicationsOpen =
    job.status === "OPEN" && new Date(job.deadline) > new Date();

  const postedAgo = job.createdAt
    ? getTimeAgo(new Date(job.createdAt))
    : "recently";

  // ─────────────────────────────────────────────────────────────
  // Apply
  // ─────────────────────────────────────────────────────────────

  const handleApply = async () => {
    if (!coverNote.trim()) {
      return;
    }

    if (!currentUser) {
      setPage("login");
      return;
    }

    if (isPoster) {
      alert("You cannot apply to your own job.");
      return;
    }

    if (currentUser.role !== "STUDENT") {
      alert("Only students can apply for jobs.");
      return;
    }

    setApplyLoading(true);

    try {
      await appsAPI.apply({
        jobId: job.id,
        coverNote: coverNote.trim(),
      });

      setSubmitted(true);
      setApplicationStatus("PENDING");
      setApplying(false);

      /*
       * Refresh job so applicant count updates immediately.
       */
      try {
        const freshJob = await jobsAPI.getOne(job.id);
        setJob(freshJob);
      } catch {
        // Application succeeded, so don't show an error just
        // because refreshing the count failed.
      }
    } catch (err) {
      alert(err.message || "Failed to submit application.");
    } finally {
      setApplyLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Update job status
  // ─────────────────────────────────────────────────────────────

  const handleStatusUpdate = async (newStatus) => {
    if (!currentUser || !isParticipant) {
      return;
    }

    setStatusLoading(true);

    try {
      const updatedJob = await jobsAPI.status(job.id, newStatus);

      setJob((previous) => ({
        ...previous,
        ...updatedJob,
      }));
    } catch (err) {
      alert(err.message || "Failed to update job status.");
    } finally {
      setStatusLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Review
  // ─────────────────────────────────────────────────────────────

  const handleReview = async () => {
    if (!rating || !currentUser) {
      return;
    }

    if (!isParticipant) {
      alert(
        "Only the student and poster involved in the job can leave a review.",
      );
      return;
    }

    const revieweeId =
      currentUser.id === job.postedById ? job.assignedToId : job.postedById;

    if (!revieweeId) {
      alert("The other participant could not be found.");
      return;
    }

    setReviewLoading(true);

    try {
      await usersAPI.review({
        jobId: job.id,
        revieweeId,
        rating,
        comment: reviewComment.trim(),
      });

      setReviewed(true);
    } catch (err) {
      alert(err.message || "Failed to submit review.");
    } finally {
      setReviewLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Dispute
  // ─────────────────────────────────────────────────────────────

  const handleDispute = async () => {
    if (!disputeReason.trim()) {
      return;
    }

    if (!isParticipant) {
      alert("Only the people involved in this job can raise a dispute.");
      return;
    }

    setDisputeLoading(true);

    try {
      await disputesAPI.raise({
        jobId: job.id,
        reason: disputeReason.trim(),
      });

      setJob((previous) => ({ ...previous, status: "DISPUTED" }));
      setDisputeSubmitted(true);
      setShowDispute(false);
      setDisputeReason("");
    } catch (err) {
      alert(err.message || "Failed to raise dispute.");
    } finally {
      setDisputeLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* ───────────────── BACK ───────────────── */}

      <button
        onClick={() => setPage("jobs")}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-5 transition-colors"
      >
        <ChevronRight size={14} className="rotate-180" />
        Back to Jobs
      </button>

      {/* ───────────────── CONTENT ───────────────── */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ═══════════════════════════════════════════════════
            MAIN
        ═══════════════════════════════════════════════════ */}

        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* ───────────── JOB CARD ───────────── */}

          <Card className="p-6">
            {/* Header */}

            <div className="flex items-start gap-3 mb-4">
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {job.category}
                  </span>

                  {job.urgent && (
                    <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Zap size={10} className="fill-red-500" />
                      Urgent
                    </span>
                  )}

                  <StatusBadge status={job.status} />
                </div>

                <h1 className="text-xl font-bold text-slate-900 leading-snug">
                  {job.title}
                </h1>
              </div>

              {/* Amount */}

              <div className="text-right flex-shrink-0">
                <div className="flex items-start gap-0.5 text-emerald-600">
                  <span className="text-sm font-bold mt-0.5">₹</span>

                  <span className="text-3xl font-extrabold leading-none">
                    {Number(job.amount || 0).toLocaleString("en-IN")}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-0.5">upon completion</p>
              </div>
            </div>

            {/* Meta */}

            <div className="flex flex-wrap gap-4 pb-4 mb-4 border-b border-slate-100">
              <span className="flex items-center gap-1.5 text-sm text-slate-500">
                <Calendar size={13} className="text-slate-400" />
                {daysLeft(job.deadline)}
              </span>

              <span className="flex items-center gap-1.5 text-sm text-slate-500">
                <Users size={13} className="text-slate-400" />
                {applicantCount} applicant
                {applicantCount !== 1 ? "s" : ""}
              </span>

              <span className="flex items-center gap-1.5 text-sm text-slate-500">
                <Clock size={13} className="text-slate-400" />
                Posted {postedAgo}
              </span>

              {job.fileUrl && (
                <a
                  href={job.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                >
                  <Paperclip size={13} />
                  View attachment
                </a>
              )}
            </div>

            {/* Description */}

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Job Description
              </p>

              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </div>

            {isParticipant && job.assignedToId && (
              <div className="my-5 p-5 bg-blue-50 border border-blue-100 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-slate-900">
                    Keep the project moving.
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Discuss details and share your delivery link in the project
                    conversation.
                  </p>
                </div>
                <Btn onClick={() => setPage("messages", job)}>
                  Open conversation →
                </Btn>
              </div>
            )}
            {/* ───────────── STATUS CONTROLS ───────────── */}

            {isParticipant && (
              <div className="mt-5 pt-5 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Job Progress
                </p>

                <div className="flex flex-wrap gap-2">
                  {/* Assigned student starts work */}

                  {isWorker && job.status === "OPEN" && (
                    <Btn
                      size="sm"
                      onClick={() => handleStatusUpdate("IN_PROGRESS")}
                      disabled={statusLoading}
                      icon={
                        statusLoading ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Play size={13} />
                        )
                      }
                    >
                      Start Work
                    </Btn>
                  )}

                  {isPoster && job.status === "OPEN" && (
                    <Btn
                      variant="danger"
                      size="sm"
                      disabled={statusLoading}
                      onClick={() => handleStatusUpdate("CANCELLED")}
                    >
                      Cancel job
                    </Btn>
                  )}
                  {isPoster && job.status === "PENDING_APPROVAL" && (
                    <Btn
                      variant="secondary"
                      size="sm"
                      disabled={statusLoading}
                      onClick={() => handleStatusUpdate("IN_PROGRESS")}
                    >
                      Request revisions
                    </Btn>
                  )}
                  {/* Worker submits work */}

                  {isWorker && job.status === "IN_PROGRESS" && (
                    <Btn
                      size="sm"
                      onClick={() => handleStatusUpdate("PENDING_APPROVAL")}
                      disabled={statusLoading}
                      icon={
                        statusLoading ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Check size={13} />
                        )
                      }
                    >
                      Submit for Approval
                    </Btn>
                  )}

                  {/* Poster approves */}

                  {isPoster && job.status === "PENDING_APPROVAL" && (
                    <Btn
                      size="sm"
                      onClick={() => handleStatusUpdate("COMPLETED")}
                      disabled={statusLoading}
                      icon={
                        statusLoading ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <CheckCircle size={13} />
                        )
                      }
                    >
                      Approve & Complete
                    </Btn>
                  )}
                </div>
              </div>
            )}

            {/* ───────────── DISPUTE ───────────── */}

            {["IN_PROGRESS", "PENDING_APPROVAL"].includes(job.status) &&
              currentUser &&
              isParticipant && (
                <div className="mt-5 pt-5 border-t border-slate-100">
                  {!disputeSubmitted && (
                    <Btn
                      variant="danger"
                      size="sm"
                      onClick={() => setShowDispute(true)}
                      icon={<Flag size={12} />}
                    >
                      Raise Dispute
                    </Btn>
                  )}

                  {showDispute && (
                    <div className="mt-3">
                      <textarea
                        value={disputeReason}
                        onChange={(e) => setDisputeReason(e.target.value)}
                        placeholder="Explain the issue clearly..."
                        rows={4}
                        maxLength={1000}
                        className="w-full p-3 text-sm border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 resize-none mb-2"
                      />

                      <div className="flex items-center gap-3">
                        <Btn
                          variant="danger"
                          size="sm"
                          onClick={handleDispute}
                          disabled={
                            disputeReason.trim().length < 10 || disputeLoading
                          }
                          icon={
                            disputeLoading ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : undefined
                          }
                        >
                          {disputeLoading ? "Submitting..." : "Submit Dispute"}
                        </Btn>

                        <Btn
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDispute(false)}
                        >
                          Cancel
                        </Btn>
                      </div>
                    </div>
                  )}

                  {disputeSubmitted && (
                    <p className="text-xs text-red-600 mt-2">
                      Dispute raised. Admin will review and contact both
                      parties.
                    </p>
                  )}
                </div>
              )}
          </Card>

          {!currentUser && applicationsOpen && (
            <Card className="p-6">
              <p className="font-semibold mb-3">
                Your next opportunity starts here.
              </p>
              <Btn onClick={() => setPage("login")}>Sign in to apply</Btn>
            </Card>
          )}
          {/* ═══════════════════════════════════════════════════
              APPLICATION
          ═══════════════════════════════════════════════════ */}

          {isStudent && !isPoster && applicationsOpen && !submitted ? (
            <Card className="p-6">
              {!applying ? (
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">
                      Interested in this job?
                    </p>

                    <p className="text-xs text-slate-400 mt-0.5">
                      Write a short note and apply in seconds
                    </p>
                  </div>

                  <Btn
                    onClick={() => setApplying(true)}
                    icon={<Send size={14} />}
                  >
                    Apply Now
                  </Btn>
                </div>
              ) : (
                <div>
                  <p className="font-semibold text-slate-900 text-sm mb-1">
                    Write a cover note
                  </p>

                  <p className="text-xs text-slate-400 mb-3">
                    Tell the poster why you are the right fit.
                  </p>

                  <textarea
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value.slice(0, 400))}
                    placeholder="e.g. I have experience in APA formatting from my research methodology course. I can deliver within 2 days..."
                    rows={4}
                    maxLength={400}
                    className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
                  />

                  <div className="flex items-center gap-3 flex-wrap">
                    <Btn
                      onClick={handleApply}
                      disabled={coverNote.trim().length < 10 || applyLoading}
                      icon={
                        applyLoading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Send size={14} />
                        )
                      }
                    >
                      {applyLoading ? "Submitting..." : "Submit Application"}
                    </Btn>

                    <Btn variant="ghost" onClick={() => setApplying(false)}>
                      Cancel
                    </Btn>

                    <span className="text-xs text-slate-400 ml-auto">
                      {coverNote.length}/400
                    </span>
                  </div>
                </div>
              )}
            </Card>
          ) : (
            /*
             * Don't show "Application submitted" to the job poster.
             */
            submitted &&
            !isPoster && (
              <Card className="p-5 border-emerald-200 bg-emerald-50">
                <div className="flex items-center gap-3">
                  <CheckCircle
                    size={20}
                    className="text-emerald-600 flex-shrink-0"
                  />

                  <div>
                    <p className="font-semibold text-emerald-800 text-sm">
                      {applicationStatus === "ACCEPTED"
                        ? "You’re hired for this job"
                        : applicationStatus === "REJECTED"
                          ? "Application not selected"
                          : "Application submitted!"}
                    </p>

                    <p className="text-xs text-emerald-600 mt-0.5">
                      {applicationStatus === "ACCEPTED"
                        ? "Use the project conversation to agree on the next step."
                        : applicationStatus === "REJECTED"
                          ? "Keep exploring — your next opportunity is waiting."
                          : "The poster will review your application and get back to you."}
                    </p>
                  </div>
                </div>
              </Card>
            )
          )}

          {/* ═══════════════════════════════════════════════════
              REVIEW
          ═══════════════════════════════════════════════════ */}

          {job.status === "COMPLETED" &&
            currentUser &&
            isParticipant &&
            !reviewed && (
              <Card className="p-5">
                <p className="font-semibold text-slate-900 text-sm mb-3">
                  Leave a Review
                </p>

                <p className="text-xs text-slate-400 mb-3">
                  Rate your experience with the other participant.
                </p>

                <div className="flex gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      aria-label={`Rate ${star} stars`}
                      className={`text-2xl transition-colors ${
                        star <= rating ? "text-amber-400" : "text-slate-200"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="How was the experience?"
                  rows={3}
                  maxLength={500}
                  className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
                />

                <Btn
                  onClick={handleReview}
                  disabled={!rating || reviewLoading}
                  icon={
                    reviewLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : undefined
                  }
                >
                  {reviewLoading ? "Submitting..." : "Submit Review"}
                </Btn>
              </Card>
            )}

          {job.status === "COMPLETED" && reviewed && (
            <Card className="p-5 border-emerald-200 bg-emerald-50">
              <div className="flex items-center gap-3">
                <CheckCircle
                  size={20}
                  className="text-emerald-600 flex-shrink-0"
                />

                <div>
                  <p className="font-semibold text-emerald-800 text-sm">
                    Review submitted!
                  </p>

                  <p className="text-xs text-emerald-600 mt-0.5">
                    Thanks for sharing your feedback.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════
            SIDEBAR
        ═══════════════════════════════════════════════════ */}

        <div className="flex flex-col gap-4">
          {/* ───────────── POSTER ───────────── */}

          <Card className="p-5">
            <SectionLabel>Posted by</SectionLabel>

            <div className="flex items-center gap-3 mb-3">
              <Avatar
                name={poster.name || "Unknown"}
                size="lg"
                role={poster.role}
              />

              <div>
                <p className="font-bold text-slate-900 text-sm">
                  {poster.name || "Unknown"}
                </p>

                <p className="text-xs text-slate-400">
                  {poster.college || poster.dept || "GigGrad member"}
                </p>

                <div className="mt-1">
                  <RatingStars rating={Number(poster.rating || 0)} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  poster.role === "TEACHER" || poster.role === "teacher"
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : poster.role === "ADMIN" || poster.role === "admin"
                      ? "bg-violet-50 text-violet-700 border border-violet-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                {poster.role === "TEACHER" || poster.role === "teacher"
                  ? "Faculty"
                  : poster.role === "ADMIN" || poster.role === "admin"
                    ? "Admin"
                    : "Student"}
              </span>
            </div>
          </Card>

          {/* ───────────── JOB SUMMARY ───────────── */}

          <Card className="p-5">
            <SectionLabel>Job Summary</SectionLabel>

            <div className="flex flex-col gap-3">
              {[
                {
                  label: "Payment",
                  value: `₹${Number(job.amount || 0).toLocaleString("en-IN")}`,
                  highlight: true,
                },
                {
                  label: "Deadline",
                  value: job.deadline
                    ? new Date(job.deadline).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Not specified",
                },
                {
                  label: "Category",
                  value: job.category || "General",
                },
                {
                  label: "Status",
                  value:
                    STATUS_CFG[job.status]?.label || job.status || "Unknown",
                },
                {
                  label: "Applicants",
                  value: `${applicantCount} applied`,
                },
              ].map(({ label, value, highlight }) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-xs text-slate-400">{label}</span>

                  <span
                    className={`text-xs font-semibold text-right ${
                      highlight ? "text-emerald-600" : "text-slate-700"
                    }`}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {poster.id && (
            <button
              onClick={() => setPage("profile", poster)}
              className="w-full border border-slate-200 rounded-xl bg-white text-blue-700 text-sm font-bold px-5 py-3"
            >
              View poster profile →
            </button>
          )}
          {/* ───────────── PAYMENT INFO ───────────── */}

          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-2">
              <Shield
                size={14}
                className="text-blue-700 mt-0.5 flex-shrink-0"
              />

              <div>
                <p className="text-xs font-bold text-blue-800 mb-1">
                  Payment agreement
                </p>

                <p className="text-xs text-blue-600 leading-relaxed">
                  Arrange payment directly with your worker. GigGrad tracks work
                  status but does not collect, hold, or release funds.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Time ago helper
// ─────────────────────────────────────────────────────────────

function getTimeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) {
    return "just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 30) {
    return `${days}d ago`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return `${months}mo ago`;
  }

  return `${Math.floor(months / 12)}y ago`;
}
