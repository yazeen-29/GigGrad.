import { useState } from "react";
import { canPostJobs } from "../utils/verification";
import { accessAPI } from "../lib/api";

import Card from "../components/ui/Card";
import Btn from "../components/ui/Btn";
import SectionLabel from "../components/ui/SectionLabel";

import { ShieldCheck, Clock, CheckCircle, Send, Loader2 } from "lucide-react";

const POSTER_TYPES = [
  { value: "individual", label: "Student project" },
  { value: "club", label: "Club / Chapter" },
  { value: "council", label: "Student Council / Committee" },
  { value: "org", label: "Campus Organization" },
  { value: "startup", label: "Campus Startup" },
];

export default function RequestAccessPage({
  currentUser: user,
  setPage,
  onUpdate,
}) {
  const navigate = (path) => setPage(path.replace(/^\//, ""));
  const [error, setError] = useState("");
  const [posterType, setPosterType] = useState(
    user.role === "TEACHER" ? "faculty" : "club",
  );
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Already approved — nothing to request.
  if (canPostJobs(user)) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          You can already post jobs
        </h2>
        <p className="text-slate-500 text-sm mb-6">
          Your role already has posting access. No administrator approval is
          required.
        </p>
        <Btn onClick={() => navigate("/post-job")}>Post a Job</Btn>
      </div>
    );
  }

  // Request already pending admin review.
  if (user.posterStatus === "pending") {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <Clock size={30} className="text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Request under review
        </h2>
        <p className="text-slate-500 text-sm mb-6">
          An admin is reviewing your request for posting access. You'll be able
          to post once it's approved.
        </p>
        <Btn variant="secondary" onClick={() => navigate("/jobs")}>
          Browse Jobs Meanwhile
        </Btn>
      </div>
    );
  }

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      onUpdate(await accessAPI.request({ posterType, reason: reason.trim() }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full mb-3">
          <ShieldCheck size={12} /> Posting is a verified action
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Request posting access
        </h1>
        <p className="text-slate-500 text-sm">
          Students and student-led clubs, councils, organizations and campus
          startups can request posting access — an admin reviews each request to
          keep the marketplace trusted and spam-free.
        </p>
      </div>

      {error && (
        <p role="alert" className="text-red-600 mb-4">
          {error}
        </p>
      )}
      <Card className="p-6 flex flex-col gap-5">
        <div>
          <SectionLabel>Requesting as</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            {POSTER_TYPES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setPosterType(value)}
                className={`py-2.5 px-3 rounded-lg text-sm font-semibold border text-left transition-all ${
                  posterType === value
                    ? "bg-blue-50 border-blue-400 text-blue-700"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Why do you need to post jobs?
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="e.g. We're the ACM chapter and want to hire student designers and developers for our technical events."
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <p className="text-xs text-slate-400 mt-1">
            An administrator will review your student posting request.
          </p>
        </div>

        <Btn
          full
          disabled={reason.trim().length < 20 || submitting}
          icon={
            submitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )
          }
          onClick={submit}
        >
          {submitting ? "Submitting…" : "Submit Request"}
        </Btn>
      </Card>
    </div>
  );
}
