import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Card from "../components/ui/Card";
import Btn from "../components/ui/Btn";
import Avatar from "../components/ui/Avatar";
import RatingStars from "../components/ui/RatingStars";
import SectionLabel from "../components/ui/SectionLabel";
import AppBadge from "../components/ui/AppBadge";
import StatusBadge from "../components/ui/StatusBadge";

import Loading from "../components/ui/Loading";
import PosterDashboard from "./PosterDashboard";

import { useAuth } from "../context/AuthContext";
import { useAsync } from "../hooks/useAsync";
import { getMyApplications } from "../services/applications";

import {
  Award,
  Wallet,
  CheckCircle,
  Send,
  Star,
  MessageSquare,
  Edit3,
  TrendingUp,
  Check,
  Zap
} from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, canPostJobs } = useAuth();

  // Posters (faculty, staff, recognized bodies, admin) get the poster dashboard;
  // workers get the applications/earnings view below.
  const { data: applications, loading } = useAsync(getMyApplications);
  const apps = applications || [];
  const [activeTab, setActiveTab] = useState("applied");

  // Guard placed after all hooks so the Rules of Hooks hold.
  if (canPostJobs) return <PosterDashboard />;

  const tabs = [
    { id: "applied",  label: "My Applications", count: loading ? null : apps.length },
    { id: "earnings", label: "Earnings", count: null },
    { id: "profile",  label: "My Profile", count: null },
  ];
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Avatar name={user.name} size="xl" role={user.role} />
        <div>
          <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
          <p className="text-sm text-slate-400">{user.college}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <RatingStars rating={user.rating} />
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 flex items-center gap-1"><Award size={11} /> {user.jobsDone} jobs completed</span>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Earned",    value: `₹${user.totalEarned.toLocaleString()}`, icon: Wallet,       color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
          { label: "Jobs Completed",  value: user.jobsDone,          icon: CheckCircle,  color: "text-blue-600 bg-blue-50 border-blue-200"     },
          { label: "Applications",    value: apps.length, icon: Send,        color: "text-violet-600 bg-violet-50 border-violet-200" },
          { label: "Your Rating",     value: `${user.rating}★`,     icon: Star,          color: "text-amber-600 bg-amber-50 border-amber-200"  },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className={`p-4 border ${color.split(" ").slice(2).join(" ")}`}>
            <div className="flex items-center gap-2 mb-1">
              <Icon size={13} className={color.split(" ")[0]} />
              <span className="text-xs text-slate-400 font-medium">{label}</span>
            </div>
            <p className={`text-xl font-extrabold ${color.split(" ")[0]}`}>{value}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 mb-5">
        {tabs.map(({ id, label, count }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === id
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {label}
            {count !== null && (
              <span className="bg-slate-100 text-slate-600 text-xs px-1.5 py-0.5 rounded-full font-semibold">{count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Applications tab */}
      {activeTab === "applied" && (loading ? (
        <Loading label="Loading your applications…" />
      ) : (
        <div className="flex flex-col gap-3">
          {apps.map(({ id, job, status, appliedAgo, coverNote }) => (
            <Card key={id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <Avatar name={job.poster.name} size="md" role={job.poster.role} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm leading-snug">{job.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{job.poster.name} · {appliedAgo}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <AppBadge status={status} />
                      <span className="text-emerald-600 text-sm font-bold">₹{job.amount}</span>
                    </div>
                  </div>
                  {coverNote && (
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                      "{coverNote}"
                    </p>
                  )}
                  {status === "accepted" && (
                    <div className="mt-3 flex gap-2">
                      <Btn size="sm" icon={<MessageSquare size={12} />} onClick={() => navigate(`/jobs/${job.id}`)}>
                        Open Job Chat
                      </Btn>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ))}

      {/* Earnings tab */}
      {activeTab === "earnings" && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "This Month",  value: "₹1,100", sub: "+₹350 pending" },
              { label: "Last Month",  value: "₹950",   sub: "3 jobs" },
              { label: "All Time",    value: `₹${user.totalEarned.toLocaleString()}`, sub: `${user.jobsDone} jobs` },
            ].map(({ label, value, sub }) => (
              <Card key={label} className="p-5">
                <p className="text-xs text-slate-400 font-medium mb-1">{label}</p>
                <p className="text-2xl font-extrabold text-slate-900">{value}</p>
                <p className="text-xs text-emerald-600 mt-1">{sub}</p>
              </Card>
            ))}
          </div>
          <Card className="p-5">
            <SectionLabel>Recent Earnings</SectionLabel>
            <div className="flex flex-col gap-3">
              {[
                { title: "APA Formatting — Dr. Meera", amount: 350, date: "Jun 10", status: "completed" },
                { title: "Poster Design — Student Council", amount: 500, date: "Jun 5", status: "completed" },
                { title: "Python Script — CSE Dept", amount: 600, date: "May 28", status: "completed" },
              ].map(({ title, amount, date, status }) => (
                <div key={title} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">+₹{amount}</p>
                    <StatusBadge status={status} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Profile tab */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card className="p-5">
            <SectionLabel>Profile Info</SectionLabel>
            <div className="flex flex-col gap-3">
              {[
                { label: "Full Name",  value: user.name },
                { label: "Email",     value: user.email },
                { label: "Role",      value: user.role.charAt(0).toUpperCase() + user.role.slice(1) },
                { label: "College",   value: user.college },
                { label: "Rating",    value: `${user.rating} / 5.0` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                  <span className="text-xs text-slate-400">{label}</span>
                  <span className="text-xs font-semibold text-slate-700">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Btn full variant="secondary" size="sm" icon={<Edit3 size={12} />}>Edit Profile</Btn>
            </div>
          </Card>
          <Card className="p-5">
            <SectionLabel>Achievements</SectionLabel>
            <div className="flex flex-col gap-3">
              {[
                { icon: Award,        label: "Top Rated",       desc: "Maintained 4.8+ rating",     unlocked: true },
                { icon: CheckCircle,  label: "10 Jobs Done",    desc: `${user.jobsDone}/10 completed`, unlocked: false },
                { icon: Zap,          label: "Quick Responder", desc: "Replied within 30 minutes",  unlocked: true },
                { icon: TrendingUp,   label: "Earning Streak",  desc: "3 months in a row",          unlocked: false },
              ].map(({ icon: Icon, label, desc, unlocked }) => (
                <div key={label} className={`flex items-center gap-3 p-3 rounded-lg ${unlocked ? "bg-amber-50 border border-amber-200" : "bg-slate-50 border border-slate-200"}`}>
                  <Icon size={16} className={unlocked ? "text-amber-500" : "text-slate-400"} />
                  <div>
                    <p className={`text-xs font-semibold ${unlocked ? "text-amber-800" : "text-slate-500"}`}>{label}</p>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </div>
                  {unlocked && <Check size={13} className="text-amber-500 ml-auto" />}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
