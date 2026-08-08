import { useEffect, useState } from "react";

import Card        from "../components/ui/Card";
import Btn         from "../components/ui/Btn";
import Avatar      from "../components/ui/Avatar";
import SectionLabel from "../components/ui/SectionLabel";
import EmptyState  from "../components/ui/EmptyState";
import Loading     from "../components/ui/Loading";

import { disputesAPI } from "../lib/api";

import {
  ShieldCheck,
  Check,
  X,
  Inbox,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

export default function AdminPage({ setPage }) {
  const [disputes,  setDisputes]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [actioning, setActioning] = useState(null); // id being resolved

  // ── Load open disputes ───────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await disputesAPI.getAll();
        setDisputes(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Failed to load disputes.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Resolve a dispute ────────────────────────────────────────────────────
  const resolve = async (id, outcome, adminNote) => {
    setActioning(id);
    try {
      await disputesAPI.resolve(id, { outcome, adminNote });
      // Remove from list once resolved
      setDisputes(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      alert("Failed to resolve: " + err.message);
    } finally {
      setActioning(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-700 bg-violet-50 border border-violet-200 px-3 py-1.5 rounded-full mb-3">
          <ShieldCheck size={12} /> Admin Panel
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Dispute Resolution</h1>
        <p className="text-slate-500 text-sm">
          Review open disputes and decide the outcome. Your decision releases or
          refunds the payment held in escrow.
        </p>
      </div>

      {/* ── Error ───────────────────────────────────────────────────── */}
      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm font-semibold text-red-700">{error}</p>
        </div>
      )}

      {/* ── Loading ─────────────────────────────────────────────────── */}
      {loading && <Loading label="Loading open disputes…" />}

      {/* ── Empty ───────────────────────────────────────────────────── */}
      {!loading && !error && disputes.length === 0 && (
        <EmptyState
          icon={Inbox}
          title="No open disputes"
          subtitle="All disputes have been resolved. New ones will appear here."
        />
      )}

      {/* ── Disputes ────────────────────────────────────────────────── */}
      {!loading && disputes.length > 0 && (
        <>
          <SectionLabel>Open Disputes ({disputes.length})</SectionLabel>
          <div className="flex flex-col gap-4">
            {disputes.map((dispute) => {
              const job       = dispute.job      || {};
              const raisedBy  = dispute.raisedBy || {};
              const isActioning = actioning === dispute.id;

              return (
                <Card key={dispute.id} className="p-5">

                  {/* Dispute header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <AlertTriangle size={15} className="text-red-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Dispute</p>
                        <p className="text-sm font-semibold text-slate-900 leading-snug">{job.title || "Unknown Job"}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-emerald-600 flex-shrink-0">₹{job.amount}</span>
                  </div>

                  {/* Who raised it */}
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar name={raisedBy.name || "?"} size="sm" role={raisedBy.role?.toLowerCase()} />
                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        Raised by {raisedBy.name}
                      </p>
                      <p className="text-xs text-slate-400 capitalize">
                        {raisedBy.role?.toLowerCase()} ·{" "}
                        {new Date(dispute.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4">
                    <p className="text-xs font-semibold text-red-700 mb-1">Dispute reason:</p>
                    <p className="text-xs text-red-600 leading-relaxed">"{dispute.reason}"</p>
                  </div>

                  {/* Outcome options */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4">
                    <p className="text-xs font-semibold text-slate-600 mb-2">Choose outcome:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500">
                      <div className="flex items-start gap-1.5">
                        <Check size={11} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span><strong className="text-slate-700">Pay Student</strong> — work was done, student deserves payment</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <X size={11} className="text-red-500 mt-0.5 flex-shrink-0" />
                        <span><strong className="text-slate-700">Refund Poster</strong> — work not delivered or unacceptable</span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Btn
                      size="sm"
                      variant="success"
                      disabled={isActioning}
                      icon={<Check size={13} />}
                      onClick={() => resolve(
                        dispute.id,
                        "COMPLETE",
                        "Admin reviewed and approved — payment released to student."
                      )}
                    >
                      {isActioning ? "Resolving…" : "Pay Student"}
                    </Btn>
                    <Btn
                      size="sm"
                      variant="danger"
                      disabled={isActioning}
                      icon={<X size={13} />}
                      onClick={() => resolve(
                        dispute.id,
                        "CANCEL",
                        "Admin reviewed and cancelled — payment refunded to poster."
                      )}
                    >
                      {isActioning ? "Resolving…" : "Refund Poster"}
                    </Btn>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* ── Info card ───────────────────────────────────────────────── */}
      <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <p className="text-xs text-slate-500 leading-relaxed">
          <strong className="text-slate-700">How disputes work:</strong> When either party raises a dispute,
          the job status is frozen and payment is held. As admin, your decision is final —
          "Pay Student" marks the job completed and releases funds; "Refund Poster" cancels
          the job and returns the payment.
        </p>
      </div>
    </div>
  );
}