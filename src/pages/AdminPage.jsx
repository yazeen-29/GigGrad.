import { useState } from "react";

import Card from "../components/ui/Card";
import Btn from "../components/ui/Btn";
import Avatar from "../components/ui/Avatar";
import SectionLabel from "../components/ui/SectionLabel";
import EmptyState from "../components/ui/EmptyState";

import { POSTER_REQUESTS } from "../data/requests";
import { POSTER_TYPE_LABEL } from "../utils/verification";

import { ShieldCheck, Check, X, Inbox } from "lucide-react";

export default function AdminPage() {
  const [queue, setQueue] = useState(POSTER_REQUESTS);
  const [resolved, setResolved] = useState([]); // {id, name, decision}

  // Mock: decisions update local state. Later this writes posterStatus on the
  // user doc + resolves the posterRequests doc (admin-only security rule).
  const decide = (id, decision) => {
    const req = queue.find(r => r.id === id);
    if (!req) return;
    setQueue(q => q.filter(r => r.id !== id));
    setResolved(r => [{ id, name: req.name, decision }, ...r]);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-700 bg-violet-50 border border-violet-200 px-3 py-1.5 rounded-full mb-3">
          <ShieldCheck size={12} /> Admin
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Poster access requests</h1>
        <p className="text-slate-500 text-sm">
          Approve recognized campus bodies so they can post jobs. Faculty/staff are approved
          automatically by email; everyone else is reviewed here.
        </p>
      </div>

      <SectionLabel>Pending ({queue.length})</SectionLabel>

      {queue.length === 0 ? (
        <EmptyState icon={Inbox} title="No pending requests" subtitle="New poster-access requests will appear here for review." />
      ) : (
        <div className="flex flex-col gap-3">
          {queue.map(({ id, name, email, posterType, reason, appliedAgo }) => (
            <Card key={id} className="p-5">
              <div className="flex items-start gap-4">
                <Avatar name={name} size="md" role="student" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900 text-sm">{name}</h3>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                      {POSTER_TYPE_LABEL[posterType] || posterType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{email} · {appliedAgo}</p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 rounded-lg p-3 border border-slate-100">"{reason}"</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Btn size="sm" variant="success" icon={<Check size={12} />} onClick={() => decide(id, "approved")}>Approve</Btn>
                    <Btn size="sm" variant="ghost" icon={<X size={12} />} onClick={() => decide(id, "rejected")}>Reject</Btn>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Recently resolved (this session) */}
      {resolved.length > 0 && (
        <div className="mt-8">
          <SectionLabel>Recently resolved</SectionLabel>
          <div className="flex flex-col gap-2">
            {resolved.map(({ id, name, decision }) => (
              <div key={id} className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-100 bg-white">
                <span className="text-sm text-slate-700">{name}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                  decision === "approved"
                    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                    : "text-red-700 bg-red-50 border-red-200"
                }`}>
                  {decision === "approved" ? "Approved" : "Rejected"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
