import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Btn from "../components/ui/Btn";
import Card from "../components/ui/Card";
import SectionLabel from "../components/ui/SectionLabel";

import { CATEGORIES } from "../data/constants";
import { createJob } from "../services/jobs";
import { useAuth } from "../context/AuthContext";

import {
  LayoutDashboard,
  CheckCircle,
  Check,
  Upload,
  Loader2,
  Shield,
  Zap,
  Calendar
} from "lucide-react";
export default function PostJobPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "", category: "", description: "", amount: "", deadline: "", urgent: false
  });
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const step1Valid = form.title && form.category && form.description;
  const step2Valid = form.amount && form.deadline;

  const handleSubmit = () => {
    setSubmitting(true);
    // Firestore write lives behind createJob(); on success we show the done
    // state. The poster is the signed-in user — this is what makes the job show
    // up under their "My Jobs".
    const poster = {
      id: user.id, name: user.name, role: user.role,
      rating: user.rating, dept: user.dept || user.college,
    };
    createJob({ ...form, amount: Number(form.amount), poster })
      .then(() => { setSubmitting(false); setDone(true); })
      .catch(() => setSubmitting(false));
  };

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Job Posted!</h2>
        <p className="text-slate-500 text-sm mb-6">"{form.title}" is now live. Students can apply immediately.</p>
        <div className="flex flex-col gap-3">
          <Btn full onClick={() => navigate("/dashboard")} icon={<LayoutDashboard size={14} />}>Go to Dashboard</Btn>
          <Btn full variant="secondary" onClick={() => { setForm({ title:"",category:"",description:"",amount:"",deadline:"",urgent:false }); setStep(1); setDone(false); }}>
            Post Another Job
          </Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Post a Job</h1>
        <p className="text-slate-500 text-sm">Takes about 2 minutes. Be specific — better descriptions get better applicants.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
              step > s ? "bg-blue-700 border-blue-700 text-white" :
              step === s ? "border-blue-700 text-blue-700 bg-white" :
              "border-slate-200 text-slate-400 bg-white"
            }`}>
              {step > s ? <Check size={12} /> : s}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${step >= s ? "text-slate-700" : "text-slate-400"}`}>
              {s === 1 ? "Job Details" : s === 2 ? "Budget & Deadline" : "Review & Post"}
            </span>
            {s < 3 && <div className={`flex-1 h-0.5 rounded-full ${step > s ? "bg-blue-700" : "bg-slate-200"}`} />}
          </div>
        ))}
      </div>

      <Card className="p-6">
        {/* Step 1 */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Job Title <span className="text-red-500">*</span></label>
              <input
                value={form.title}
                onChange={e => update("title", e.target.value)}
                placeholder="e.g. Format 30-page report in APA style"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">Be specific — a clear title gets 2× more applicants</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category <span className="text-red-500">*</span></label>
              <select
                value={form.category}
                onChange={e => update("category", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select a category</option>
                {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description <span className="text-red-500">*</span></label>
              <textarea
                value={form.description}
                onChange={e => update("description", e.target.value)}
                placeholder="Describe exactly what needs to be done, what you will provide, and what you expect as the final deliverable..."
                rows={5}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-slate-400 mt-1">{form.description.length}/500 characters</p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.urgent} onChange={e => update("urgent", e.target.checked)} className="accent-red-500 w-4 h-4" />
              <div>
                <span className="text-sm font-semibold text-slate-700">Mark as Urgent</span>
                <p className="text-xs text-slate-400">Urgent jobs are shown with a red badge and appear higher in search</p>
              </div>
            </label>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Payment Amount (₹) <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">₹</span>
                <input
                  type="number" min="50" max="10000"
                  value={form.amount}
                  onChange={e => update("amount", e.target.value)}
                  placeholder="300"
                  className="w-full pl-8 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Minimum ₹50. Average job on GigGrad pays ₹350.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Deadline <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={form.deadline}
                onChange={e => update("deadline", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">When must the work be submitted? Payment auto-releases 72 hours after this date.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Attach Instructions (optional)</label>
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-blue-300 transition-colors cursor-pointer">
                <Upload size={20} className="text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-400 mt-1">PDF, DOCX, XLSX up to 10MB</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Review */}
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
                    <h3 className="font-bold text-slate-900 text-sm">{form.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{form.category}</p>
                  </div>
                  <div className="text-emerald-600 text-right">
                    <span className="text-xs">₹</span>
                    <span className="text-xl font-extrabold">{form.amount}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{form.description}</p>
                <div className="flex gap-4 pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-400 flex items-center gap-1"><Calendar size={11} /> Deadline: {form.deadline}</span>
                </div>
              </div>
            </div>
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-2">
                <Shield size={14} className="text-blue-700 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  By posting this job, you agree that payment of <strong>₹{form.amount}</strong> will be collected and held securely until you approve the completed work.
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100">
          {step > 1
            ? <Btn variant="secondary" onClick={() => setStep(s => s - 1)}>← Back</Btn>
            : <div />
          }
          {step < 3
            ? <Btn onClick={() => setStep(s => s + 1)} disabled={step === 1 ? !step1Valid : !step2Valid}>
                Continue →
              </Btn>
            : <Btn variant="success" onClick={handleSubmit} disabled={submitting} icon={submitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}>
                {submitting ? "Posting..." : "Post Job"}
              </Btn>
          }
        </div>
      </Card>
    </div>
  );
}