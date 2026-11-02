import { useEffect, useState } from "react";
import { accessAPI, adminAPI, disputesAPI } from "../lib/api";
import {
  CheckCircle,
  Clock,
  RefreshCw,
  ShieldCheck,
  Users,
  AlertTriangle,
} from "lucide-react";
import Loading from "../components/ui/Loading";
export default function AdminPage({ currentUser, setPage }) {
  const [overview, setOverview] = useState(null),
    [requests, setRequests] = useState([]),
    [disputes, setDisputes] = useState([]),
    [notes, setNotes] = useState({}),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(null),
    [version, setVersion] = useState(0),
    [loading, setLoading] = useState(true),
    [notice, setNotice] = useState("");
  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [summary, access, conflicts] = await Promise.all([
          adminAPI.overview(),
          accessAPI.list(),
          disputesAPI.getAll(),
        ]);
        if (active) {
          setOverview(summary);
          setRequests(access);
          setDisputes(conflicts);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [version]);
  async function decide(id, status) {
    setBusy(id);
    setError("");
    try {
      await accessAPI.decide(id, status);
      setNotice(
        status === "approved"
          ? "Student posting access approved."
          : "Student posting request declined.",
      );
      setVersion((value) => value + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  }
  async function resolve(dispute, outcome) {
    const note = notes[dispute.id]?.trim();
    if (!note || note.length < 10) {
      setError(
        "Add a decision note of at least 10 characters before resolving this conflict.",
      );
      return;
    }
    setBusy(dispute.id);
    setError("");
    try {
      await disputesAPI.resolve(dispute.id, { outcome, adminNote: note });
      setNotice("Conflict resolved. The decision and your note are saved.");
      setVersion((value) => value + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  }
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-wrap justify-between gap-5 mb-8">
        <div>
          <span className="eyebrow">
            <ShieldCheck size={16} />
            CAMPUS ADMINISTRATION
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold mt-4">
            Keep campus work fair and moving.
          </h1>
          <p className="text-slate-500 text-sm mt-3">
            {currentUser?.name ? `Welcome back, ${currentUser.name}. ` : ""}
            Review student posting requests, resolve conflicts, and monitor
            campus activity.
          </p>
        </div>
        <button
          disabled={loading}
          aria-label="Refresh admin overview"
          onClick={() => setVersion((value) => value + 1)}
          className="self-start flex items-center gap-2 rounded-xl px-4 py-3 border border-slate-200 bg-white text-sm font-semibold"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>
      {error && (
        <p
          role="alert"
          className="mb-5 p-4 rounded-xl bg-red-50 text-red-700 text-sm"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="mb-5 p-4 rounded-xl bg-emerald-50 text-emerald-700 text-sm"
        >
          {notice}
        </p>
      )}
      {loading ? (
        <Loading label="Loading administration queues…" />
      ) : (
        overview && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                [
                  overview.stats.pendingStudentRequests,
                  "Student requests",
                  Users,
                ],
                [overview.stats.openDisputes, "Open conflicts", AlertTriangle],
                [overview.stats.activeProjects, "Active projects", Clock],
                [overview.stats.totalUsers, "Campus accounts", ShieldCheck],
              ].map(([value, label, Icon]) => (
                <div
                  key={label}
                  className="bg-white border border-slate-200 rounded-2xl p-5"
                >
                  <Icon size={21} className="text-violet-600 mb-4" />
                  <p className="text-3xl font-bold">{value}</p>
                  <p className="text-sm text-slate-500 mt-2">{label}</p>
                </div>
              ))}
            </div>
            <section className="mb-9">
              <h2 className="text-2xl font-bold">Student posting requests</h2>
              <p className="text-sm text-slate-500 mt-2 mb-5">
                Faculty and staff post directly. Only student and
                student-organization requests appear in this queue.
              </p>
              {!requests.length ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-500 text-sm">
                  No student requests awaiting review.
                </div>
              ) : (
                requests.map((user) => (
                  <article
                    key={user.id}
                    className="bg-white border border-slate-200 rounded-2xl p-6 mb-4"
                  >
                    <h3 className="font-bold text-xl">{user.name}</h3>
                    <p className="text-sm text-slate-500 mt-2">
                      {user.email} · {user.posterType}
                    </p>
                    <p className="text-sm text-slate-600 mt-4">
                      {user.posterReason}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-5">
                      <button
                        disabled={!!busy}
                        onClick={() => decide(user.id, "approved")}
                        className="bg-blue-700 text-white rounded-xl px-4 py-3 text-sm font-bold disabled:opacity-40"
                      >
                        Approve access
                      </button>
                      <button
                        disabled={!!busy}
                        onClick={() => decide(user.id, "rejected")}
                        className="border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 disabled:opacity-40"
                      >
                        Decline request
                      </button>
                    </div>
                  </article>
                ))
              )}
            </section>
            <section className="mb-9">
              <h2 className="text-2xl font-bold">Dispute Resolution</h2>
              <p className="text-sm text-slate-500 mt-2 mb-5">
                Review the brief and both parties’ concerns. Your decision
                changes project status; it does not transfer funds.
              </p>
              {!disputes.length ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-500 text-sm">
                  No open conflicts requiring a decision.
                </div>
              ) : (
                disputes.map((dispute) => (
                  <article
                    key={dispute.id}
                    className="bg-white border border-slate-200 rounded-2xl p-6 mb-4"
                  >
                    <div className="flex justify-between gap-4">
                      <h3 className="text-xl font-bold">{dispute.job.title}</h3>
                      <span className="font-bold text-emerald-700">
                        ₹{Number(dispute.job.amount).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-3">
                      Raised by {dispute.raisedBy.name} ·{" "}
                      {new Date(dispute.createdAt).toLocaleDateString("en-IN")}
                    </p>
                    <p className="text-sm text-slate-600 bg-amber-50 rounded-xl p-4 mt-4">
                      {dispute.reason}
                    </p>
                    {setPage && (
                      <button
                        onClick={() => setPage("job-detail", dispute.job)}
                        className="text-sm text-blue-700 font-bold mt-4"
                      >
                        Review project brief →
                      </button>
                    )}
                    <label
                      className="block text-sm font-semibold mt-5"
                      htmlFor={`decision-${dispute.id}`}
                    >
                      Decision note
                      <textarea
                        id={`decision-${dispute.id}`}
                        maxLength={2000}
                        rows={3}
                        value={notes[dispute.id] || ""}
                        onChange={(event) =>
                          setNotes({
                            ...notes,
                            [dispute.id]: event.target.value,
                          })
                        }
                        placeholder="Record the reviewed facts and the reason for your decision."
                        className="form-input mt-2"
                      />
                    </label>
                    <div className="flex flex-wrap gap-3 mt-4">
                      <button
                        disabled={!!busy}
                        onClick={() => resolve(dispute, "COMPLETE")}
                        className="bg-emerald-700 text-white px-4 py-3 rounded-xl text-sm font-bold disabled:opacity-40"
                      >
                        Complete job
                      </button>
                      <button
                        disabled={!!busy}
                        onClick={() => resolve(dispute, "CANCEL")}
                        className="border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-bold disabled:opacity-40"
                      >
                        Cancel job
                      </button>
                    </div>
                  </article>
                ))
              )}
            </section>
            <section className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="font-bold text-xl flex gap-2 items-center">
                <CheckCircle size={21} className="text-emerald-600" />
                Recent conflict decisions
              </h2>
              {!overview.recentResolved.length ? (
                <p className="text-sm text-slate-500 mt-4">
                  Resolved conflicts and their decision notes will appear here.
                </p>
              ) : (
                overview.recentResolved.map((item) => (
                  <article
                    key={item.id}
                    className="mt-5 pt-5 border-t border-slate-100"
                  >
                    <p className="font-semibold">{item.job.title}</p>
                    <p className="text-sm text-slate-500 mt-2">
                      {item.adminNote || "No decision note recorded."}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      {item.job.status} · {item.resolvedBy?.name} ·{" "}
                      {new Date(item.resolvedAt).toLocaleDateString("en-IN")}
                    </p>
                  </article>
                ))
              )}
            </section>
          </>
        )
      )}
    </div>
  );
}
