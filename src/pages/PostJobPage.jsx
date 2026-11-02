import { useState } from "react";
import { getExperience } from "../utils/experience";

import Btn from "../components/ui/Btn";
import Card from "../components/ui/Card";
import SectionLabel from "../components/ui/SectionLabel";

import { jobsAPI } from "../lib/api";

import {
  LayoutDashboard,
  CheckCircle,
  Check,
  Loader2,
  Shield,
  Zap,
  Calendar,
} from "lucide-react";

const CATEGORIES = [
  "Document Formatting",
  "Data Entry",
  "Design",
  "Lab Help",
  "Video Editing",
  "Coding",
  "Delivery",
];

export default function PostJobPage({ setPage, currentUser }) {
  const experience = getExperience(currentUser);
  const [form, setForm] = useState({
    title: "",
    requiredSkills: "",
    category: "",
    description: "",
    amount: "",
    deadline: "",
    urgent: false,
  });
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const step1Valid =
    form.title.trim().length >= 5 &&
    form.title.length <= 140 &&
    form.category &&
    form.description.trim().length >= 20 &&
    form.description.length <= 5000;
  const step2Valid =
    Number(form.amount) >= 50 &&
    Number(form.amount) <= 10000 &&
    new Date(form.deadline) > new Date();

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      await jobsAPI.create({
        title: form.title,
        description: form.description,
        category: form.category,
        requiredSkills: [
          ...new Set(
            (form.requiredSkills || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          ),
        ],
        amount: form.amount,
        deadline: form.deadline,
        urgent: form.urgent,
      });
      setDone(true);
    } catch (err) {
      setError(err.message || "Failed to post job. Please try again.");
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div
          className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{
            animation: "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
          }}
        >
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Job Posted!</h2>
        <p className="text-slate-500 text-sm mb-6">
          "{form.title}" is now live. Students can apply immediately.
        </p>
        <div className="flex flex-col gap-3">
          <Btn
            full
            onClick={() => setPage("dashboard")}
            icon={<LayoutDashboard size={14} />}
          >
            Go to Dashboard
          </Btn>
          <Btn
            full
            variant="secondary"
            onClick={() => {
              setForm({
                title: "",
                category: "",
                description: "",
                amount: "",
                deadline: "",
                urgent: false,
              });
              setStep(1);
              setDone(false);
            }}
          >
            Post Another Job
          </Btn>
        </div>
        <style>{`@keyframes popIn { 0%{transform:scale(0);opacity:0;} 70%{transform:scale(1.15);} 100%{transform:scale(1);opacity:1;} }`}</style>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Post a Job</h1>
        <p className="text-slate-500 text-sm">
          {experience.kind === "faculty"
            ? "Describe the research, teaching, or department support you need. Faculty can publish directly."
            : experience.kind === "staff"
              ? "Give students a clear operations or event brief. Staff can publish directly."
              : "Give your campus project a clear outcome, budget, and deadline."}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                step > s
                  ? "bg-blue-700 border-blue-700 text-white"
                  : step === s
                    ? "border-blue-700 text-blue-700 bg-white"
                    : "border-slate-200 text-slate-400 bg-white"
              }`}
            >
              {step > s ? <Check size={12} /> : s}
            </div>
            <span
              className={`text-xs font-medium hidden sm:block transition-colors ${step >= s ? "text-slate-700" : "text-slate-400"}`}
            >
              {s === 1
                ? "Job Details"
                : s === 2
                  ? "Budget & Deadline"
                  : "Review & Post"}
            </span>
            {s < 3 && (
              <div
                className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${step > s ? "bg-blue-700" : "bg-slate-200"}`}
              />
            )}
          </div>
        ))}
      </div>

      <Card className="p-6">
        {/* STEP 1 */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="e.g. Format 30-page report in APA style"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                Be specific — a clear title gets 2x more applicants
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <label className="block text-sm font-semibold">
              Required skills (comma separated, up to 10)
              <input
                className="form-input mt-2"
                maxLength={500}
                value={form.requiredSkills || ""}
                placeholder="Design, Canva, Typography"
                onChange={(e) => update("requiredSkills", e.target.value)}
              />
            </label>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.description}
                maxLength={5000}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Describe exactly what needs to be done, what you will provide, and what you expect as the final deliverable..."
                rows={5}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-slate-400 mt-1">
                {form.description.length}/5000 characters
              </p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.urgent}
                onChange={(e) => update("urgent", e.target.checked)}
                className="accent-red-500 w-4 h-4"
              />
              <div>
                <span className="text-sm font-semibold text-slate-700">
                  Mark as Urgent
                </span>
                <p className="text-xs text-slate-400">
                  Shown with a red badge so students can spot time-sensitive
                  work.
                </p>
              </div>
            </label>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Payment Amount (Rs) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                  Rs
                </span>
                <input
                  type="number"
                  min="50"
                  max="10000"
                  value={form.amount}
                  onChange={(e) => update("amount", e.target.value)}
                  placeholder="300"
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Minimum Rs 50. Average job on GigGrad pays Rs 350.
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Deadline <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => update("deadline", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                Choose a future date that gives your worker time to deliver.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <SectionLabel>Review your job</SectionLabel>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div>
                    {form.urgent && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full mb-2">
                        <Zap size={10} className="fill-red-500" /> Urgent
                      </span>
                    )}
                    <h3 className="font-bold text-slate-900 text-sm">
                      {form.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {form.category}
                    </p>
                  </div>
                  <div className="text-emerald-600 text-right flex-shrink-0">
                    <span className="text-xs font-bold">Rs </span>
                    <span className="text-xl font-extrabold">
                      {form.amount}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {form.description}
                </p>
                <div className="flex gap-4 pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={11} /> Deadline: {form.deadline}
                  </span>
                </div>
              </div>
            </div>

            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-2">
                <Shield
                  size={14}
                  className="text-blue-700 mt-0.5 flex-shrink-0"
                />
                <p className="text-xs text-blue-700 leading-relaxed">
                  By posting, you commit to paying{" "}
                  <strong>Rs {form.amount}</strong> for the agreed work. Arrange
                  payment directly with your worker. GigGrad does not collect or
                  hold funds.
                </p>
              </div>
            </Card>

            {/* API error message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600 font-medium">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100">
          {step > 1 ? (
            <Btn variant="secondary" onClick={() => setStep((s) => s - 1)}>
              Back
            </Btn>
          ) : (
            <div />
          )}
          {step < 3 ? (
            <Btn
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 1 ? !step1Valid : !step2Valid}
            >
              Continue
            </Btn>
          ) : (
            <Btn
              variant="success"
              onClick={handleSubmit}
              disabled={submitting}
              icon={
                submitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCircle size={14} />
                )
              }
            >
              {submitting ? "Posting..." : "Post Job"}
            </Btn>
          )}
        </div>
      </Card>
    </div>
  );
}
