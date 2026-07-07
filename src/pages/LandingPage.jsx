import { useNavigate } from "react-router-dom";

import Btn from "../components/ui/Btn";
import SectionLabel from "../components/ui/SectionLabel";

import {
  Briefcase,
  Wallet,
  Users,
  Star,
  Shield,
  MessageSquare,
  Award,
  ArrowRight,
  Plus,
  Zap
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const stats = [
    { value: "200+", label: "Jobs Posted", icon: Briefcase },
    { value: "₹1.2L", label: "Paid to Students", icon: Wallet },
    { value: "450+", label: "Students Earning", icon: Users },
    { value: "4.8★", label: "Average Rating", icon: Star },
  ];
  const features = [
    { icon: Shield,  title: "Verified Campus Only", desc: "Only students and staff from your college. Login requires a college email — no outsiders, no spam." },
    { icon: Wallet,  title: "Secure Payments",       desc: "Payment is held in escrow when the job is posted and released only after you approve the work." },
    { icon: MessageSquare, title: "Built-in Chat",   desc: "Every job has its own private chat. No WhatsApp side channels — all communication is logged." },
    { icon: Award,   title: "Trust & Ratings",       desc: "After every job, both sides rate each other. Your rating is your campus reputation." },
  ];
  const steps = [
    { n: "01", title: "Post a Job",     desc: "Fill a 2-minute form. Set your budget and deadline.", color: "text-blue-700 bg-blue-50 border-blue-200" },
    { n: "02", title: "Pick an applicant", desc: "Review applicants, read their profiles, hire the best fit.", color: "text-violet-700 bg-violet-50 border-violet-200" },
    { n: "03", title: "Work Gets Done", desc: "Student delivers. Chat if you need changes.", color: "text-amber-700 bg-amber-50 border-amber-200" },
    { n: "04", title: "Approve & Pay",  desc: "Approve the work. Payment releases instantly.", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  ];
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full mb-6">
            <Zap size={11} className="fill-blue-700" />
            Now live at Amrita Vishwa Vidyapeetham, Kollam!
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mb-5">
            Earn money on campus.<br />
            <span className="text-blue-700">No WhatsApp needed.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto mb-8 leading-relaxed">
            GigGrad connects students who want to earn with teachers who need quick help — with structured jobs, secure payments, and zero drama.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Btn size="xl" onClick={() => navigate("/jobs")} icon={<Briefcase size={16} />}>Browse Open Jobs</Btn>
            <Btn size="xl" variant="secondary" onClick={() => navigate("/post-job")} icon={<Plus size={16} />}>Post a Job</Btn>
          </div>
        </div>
        <div className="mt-8 overflow-hidden rounded-lg border border-blue-100 bg-blue-50">
    <div className="ticker whitespace-nowrap py-2">
        <span className="mx-8 text-sm font-medium text-blue-700">
         Students from TKM College of Engineering have started earning on GigGrad
        </span>

        <span className="mx-8 text-sm font-medium text-blue-700">
         CET students completed 120+ campus gigs this month
        </span>

        <span className="mx-8 text-sm font-medium text-blue-700">
         NSS Palakkad students earned over ₹48,000 through micro-jobs
        </span>

        <span className="mx-8 text-sm font-medium text-blue-700">
         Join 450+ students already earning on campus
        </span>
    </div>
</div>
      </section>

      {/* Stats */}
      <section className="bg-blue-700 py-8">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-extrabold text-white mb-1">{value}</div>
              <div className="text-blue-200 text-xs font-medium flex items-center justify-center gap-1"><Icon size={11} />{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="text-2xl font-bold text-slate-900">From post to payment in 4 steps</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.map(({ n, title, desc, color }) => (
            <div key={n} className={`rounded-xl border p-5 ${color}`}>
              <div className="text-2xl font-black mb-3 opacity-30">{n}</div>
              <div className="font-bold text-sm mb-2">{title}</div>
              <div className="text-xs leading-relaxed opacity-80">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-14">
          <div className="text-center mb-10">
            <SectionLabel>Why GigGrad</SectionLabel>
            <h2 className="text-2xl font-bold text-slate-900">Built for campus. Not the internet.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-5 rounded-xl border border-slate-200">
                <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-blue-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-1">{title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-14 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Ready to start earning?</h2>
        <p className="text-slate-500 text-sm mb-6">Sign in with your college email. It takes 30 seconds.</p>
        <Btn size="xl" onClick={() => navigate("/jobs")} icon={<ArrowRight size={16} />}>Get Started Free</Btn>
      </section>
    </div>
  );
}