import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Card from "../components/ui/Card";
import Btn from "../components/ui/Btn";
import Avatar from "../components/ui/Avatar";
import RatingStars from "../components/ui/RatingStars";
import StatusBadge from "../components/ui/StatusBadge";
import SectionLabel from "../components/ui/SectionLabel";
import Loading from "../components/ui/Loading";

import { MY_APPLICATIONS } from "../data/applications";
import { STATUS_CFG } from "../data/constants";
import { useAsync } from "../hooks/useAsync";
import { getJob } from "../services/jobs";

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
  Shield
} from "lucide-react"; 
export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: job, loading } = useAsync(() => getJob(id), [id]);

  const [applying, setApplying] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);

  if (loading) return <Loading label="Loading job…" />;

  // Deep-linked or stale id that no longer maps to a job.
  if (!job) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Job not found</h2>
        <p className="text-slate-500 text-sm mb-6">This job may have been removed or the link is incorrect.</p>
        <button onClick={() => navigate("/jobs")} className="text-sm font-semibold text-blue-700 hover:underline">
          ← Back to all jobs
        </button>
      </div>
    );
  }

  // TODO(firebase): derive from the signed-in user's applications collection.
  const isApplied = MY_APPLICATIONS.some(a => a.job.id === job.id);

  const handleApply = () => {
    if (!coverNote.trim()) return;
    setApplyLoading(true);
    setTimeout(() => { setApplyLoading(false); setSubmitted(true); setApplying(false); }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Back */}
      <button onClick={() => navigate("/jobs")} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-5 transition-colors">
        <ChevronRight size={14} className="rotate-180" /> Back to Jobs
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <Card className="p-6">
            {/* Job header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">{job.category}</span>
                  {job.urgent && (
                    <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Zap size={10} className="fill-red-500" /> Urgent
                    </span>
                  )}
                  <StatusBadge status={job.status} />
                </div>
                <h1 className="text-xl font-bold text-slate-900 leading-snug">{job.title}</h1>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-start gap-0.5 text-emerald-600">
                  <span className="text-sm font-bold mt-0.5">₹</span>
                  <span className="text-3xl font-extrabold leading-none">{job.amount}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">upon completion</p>
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 pb-4 mb-4 border-b border-slate-100">
              <span className="flex items-center gap-1.5 text-sm text-slate-500"><Calendar size={13} className="text-slate-400" />{daysLeft(job.deadline)}</span>
              <span className="flex items-center gap-1.5 text-sm text-slate-500"><Users size={13} className="text-slate-400" />{job.applicants} applicants</span>
              <span className="flex items-center gap-1.5 text-sm text-slate-500"><Clock size={13} className="text-slate-400" />Posted {job.postedAgo}</span>
              {job.fileUrl && <span className="flex items-center gap-1.5 text-sm text-blue-600 cursor-pointer hover:underline"><Paperclip size={13} />{job.fileUrl}</span>}
            </div>

            {/* Description */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Job Description</p>
              <p className="text-slate-700 text-sm leading-relaxed">{job.description}</p>
            </div>
          </Card>

          {/* Apply section */}
          {!submitted && !isApplied ? (
            <Card className="p-6">
              {!applying ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Interested in this job?</p>
                    <p className="text-xs text-slate-400 mt-0.5">Write a short note and apply in seconds</p>
                  </div>
                  <Btn onClick={() => setApplying(true)} icon={<Send size={14} />}>Apply Now</Btn>
                </div>
              ) : (
                <div>
                  <p className="font-semibold text-slate-900 text-sm mb-1">Write a cover note</p>
                  <p className="text-xs text-slate-400 mb-3">Tell the poster why you are the right fit (2–3 sentences is fine)</p>
                  <textarea
                    value={coverNote}
                    onChange={e => setCoverNote(e.target.value)}
                    placeholder="e.g. I have experience in APA formatting from my research methodology course. I can deliver within 2 days..."
                    rows={4}
                    className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
                  />
                  <div className="flex items-center gap-3">
                    <Btn onClick={handleApply} disabled={!coverNote.trim() || applyLoading} icon={applyLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}>
                      {applyLoading ? "Submitting..." : "Submit Application"}
                    </Btn>
                    <Btn variant="ghost" onClick={() => setApplying(false)}>Cancel</Btn>
                    <span className="text-xs text-slate-400 ml-auto">{coverNote.length}/400</span>
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-5 border-emerald-200 bg-emerald-50">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-800 text-sm">Application submitted!</p>
                  <p className="text-xs text-emerald-600 mt-0.5">The poster will review your application and get back to you via the platform.</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Poster card */}
          <Card className="p-5">
            <SectionLabel>Posted by</SectionLabel>
            <div className="flex items-center gap-3 mb-3">
              <Avatar name={job.poster.name} size="lg" role={job.poster.role} />
              <div>
                <p className="font-bold text-slate-900 text-sm">{job.poster.name}</p>
                <p className="text-xs text-slate-400">{job.poster.dept}</p>
                <div className="mt-1"><RatingStars rating={job.poster.rating} /></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${job.poster.role === "teacher" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                {job.poster.role === "teacher" ? "Faculty" : "Student"}
              </span>
            </div>
          </Card>

          {/* Job summary card */}
          <Card className="p-5">
            <SectionLabel>Job Summary</SectionLabel>
            <div className="flex flex-col gap-3">
              {[
                { label: "Payment",   value: `₹${job.amount}`, highlight: true },
                { label: "Deadline",  value: new Date(job.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) },
                { label: "Category",  value: job.category },
                { label: "Status",    value: STATUS_CFG[job.status]?.label },
                { label: "Applicants",value: `${job.applicants} applied` },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{label}</span>
                  <span className={`text-xs font-semibold ${highlight ? "text-emerald-600" : "text-slate-700"}`}>{value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Payment info */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-2">
              <Shield size={14} className="text-blue-700 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-blue-800 mb-1">Secure Payment</p>
                <p className="text-xs text-blue-600 leading-relaxed">Payment is held by GigGrad and released only after you submit and the poster approves your work.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
