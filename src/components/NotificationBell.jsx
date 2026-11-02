import { useEffect, useRef, useState } from "react";
import { Bell, Check } from "lucide-react";
import { personalAPI } from "../lib/api";
export default function NotificationBell({ setPage }) {
  const [open, setOpen] = useState(false),
    [data, setData] = useState({ items: [], unread: 0, page: 1, pages: 0 }),
    [error, setError] = useState("");
  const ref = useRef(null);
  useEffect(() => {
    let active = true;
    const load = () =>
      personalAPI
        .notifications()
        .then((d) => {
          if (active) setData(d);
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    load();
    const timer = setInterval(() => {
      if (!document.hidden) load();
    }, 30000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);
  useEffect(() => {
    const outside = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const escape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  async function read(id) {
    try {
      await personalAPI.read(id);
      setData(await personalAPI.notifications(data.page));
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }
  async function page(n) {
    try {
      setData(await personalAPI.notifications(n));
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <div className="relative" ref={ref}>
      <button
        aria-label="Notifications"
        aria-expanded={open}
        className="relative p-2 text-slate-500"
        onClick={() => {
          setOpen(!open);
          if (!open) page(1);
        }}
      >
        <Bell size={19} />
        {data.unread > 0 && (
          <span className="absolute top-0 right-0 text-[9px] rounded-full bg-red-600 text-white px-1">
            {data.unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden">
          <header className="p-4 flex items-center justify-between">
            <strong>Notifications</strong>
            <button
              aria-label="Mark all notifications read"
              onClick={() => read()}
            >
              <Check size={17} />
            </button>
          </header>
          {error && (
            <p role="alert" className="text-red-700 p-4 text-sm">
              {error}
            </p>
          )}
          <ul className="max-h-80 overflow-y-auto">
            {data.items.map((item) => (
              <li key={item.id}>
                <button
                  className={`p-4 text-left w-full border-t border-slate-100 text-sm ${item.isRead ? "" : "bg-blue-50"}`}
                  onClick={async () => {
                    await read(item.id);
                    setOpen(false);
                    setPage("job-detail", { id: item.jobId });
                  }}
                >
                  {item.title}
                  <small className="block text-slate-400 mt-1">
                    {new Date(item.createdAt).toLocaleString()}
                  </small>
                </button>
              </li>
            ))}
          </ul>
          {!data.items.length && (
            <p className="p-5 text-sm text-slate-500">
              No project updates yet.
            </p>
          )}
          <footer className="p-3 flex justify-between text-sm">
            <button
              disabled={data.page <= 1}
              onClick={() => page(data.page - 1)}
            >
              Previous
            </button>
            <span>
              {data.page} / {Math.max(1, data.pages)}
            </span>
            <button
              disabled={data.page >= data.pages}
              onClick={() => page(data.page + 1)}
            >
              Next
            </button>
          </footer>
        </div>
      )}
    </div>
  );
}
