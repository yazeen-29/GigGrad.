import { useState, useRef, useEffect } from "react";

import { Bell, Check } from "lucide-react";

import { usersAPI, getUser } from "../lib/api";

export default function NotificationBell({ setPage }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const storageKey = `gg_read_${getUser()?.id}`;
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await usersAPI.dashboard();
        let seen = [];
        try {
          seen = JSON.parse(localStorage.getItem(storageKey) || "[]");
          if (!Array.isArray(seen)) seen = [];
        } catch {
          /* use an empty read list */
        }
        const incoming = data.jobs
          .filter(
            (job) =>
              job.status === "PENDING_APPROVAL" || job._count.applications > 0,
          )
          .map((job) => ({
            id: `${job.id}:${job.status}:${job._count.applications}`,
            title:
              job.status === "PENDING_APPROVAL"
                ? "Work ready for your review"
                : "Your gig has applicants",
            body: job.title,
            to: job.status === "OPEN" ? "applicants" : "job-detail",
            job,
          }));
        const applications = data.applications
          .filter((app) => app.status !== "PENDING")
          .map((app) => ({
            id: `${app.id}:${app.status}:${app.job.status}`,
            title:
              app.status === "ACCEPTED"
                ? "You’ve been selected for a gig"
                : "Application update",
            body: app.job.title,
            to: "job-detail",
            job: app.job,
          }));
        if (active)
          setItems(
            [...incoming, ...applications]
              .slice(0, 30)
              .map((item) => ({ ...item, read: seen.includes(item.id) })),
          );
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
  }, [open, storageKey]);
  function markRead(ids) {
    setItems((previous) =>
      previous.map((item) => ({
        ...item,
        read: item.read || ids.includes(item.id),
      })),
    );
    try {
      const previous = JSON.parse(localStorage.getItem(storageKey) || "[]");
      localStorage.setItem(
        storageKey,
        JSON.stringify(
          [
            ...new Set([...(Array.isArray(previous) ? previous : []), ...ids]),
          ].slice(-200),
        ),
      );
    } catch {
      /* read state remains available for this session */
    }
  }
  const unread = items.filter((n) => !n.read).length;

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const markAllRead = () => markRead(items.map((item) => item.id));
  const openNotification = (item) => {
    markRead([item.id]);
    setOpen(false);
    setPage(item.to, item.job);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-900">
              Notifications
            </span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800"
              >
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>

          {loading ? (
            <p
              role="status"
              className="px-4 py-8 text-center text-sm text-slate-500"
            >
              Loading activity…
            </p>
          ) : error ? (
            <p role="alert" className="p-4 text-sm text-red-600">
              {error}
            </p>
          ) : items.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500">
              You&apos;re all caught up.
            </div>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => openNotification(n)}
                    className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                      n.read ? "" : "bg-blue-50/40"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read && (
                        <span className="mt-1.5 w-1.5 h-1.5 shrink-0 bg-blue-600 rounded-full" />
                      )}
                      <div className={n.read ? "pl-3.5" : ""}>
                        <p className="text-sm font-medium text-slate-900">
                          {n.title}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {n.body}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {n.timeAgo}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
