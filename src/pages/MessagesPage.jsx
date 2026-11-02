import { useEffect, useRef, useState } from "react";
import { messagesAPI } from "../lib/api";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCheck,
  MessageCircle,
  Send,
} from "lucide-react";

export default function MessagesPage({ currentUser, setPage, jobId }) {
  const [inbox, setInbox] = useState([]);
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [older, setOlder] = useState(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sendError, setSendError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const endRef = useRef(null);
  const requestRef = useRef(null);
  const [atBottom, setAtBottom] = useState(true);
  useEffect(() => {
    let active = true;
    async function load() {
      if (document.hidden) return;
      try {
        const items = await messagesAPI.inbox();
        if (active) {
          setInbox(items);
          setError("");
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active && !jobId) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [jobId, refresh]);
  useEffect(() => {
    if (!jobId) return;
    let active = true;
    async function load() {
      if (document.hidden) return;
      try {
        const result = await messagesAPI.thread(jobId);
        if (!active) return;
        setThread(result.job);
        setMessages((previous) => {
          const combined = new Map(
            previous.map((message) => [message.id, message]),
          );
          result.messages.forEach((message) =>
            combined.set(message.id, message),
          );
          return [...combined.values()].sort(
            (a, b) =>
              a.createdAt.localeCompare(b.createdAt) ||
              a.id.localeCompare(b.id),
          );
        });
        setOlder((previous) =>
          previous === null ? result.nextCursor : previous,
        );
        setError("");
        if (
          result.messages.some(
            (message) =>
              message.receiverId === currentUser.id && !message.isRead,
          ) &&
          document.hasFocus() &&
          atBottom
        )
          await messagesAPI.read(jobId, result.messages.at(-1).id);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [jobId, currentUser.id, refresh, atBottom]);
  useEffect(() => {
    if (atBottom) endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages, atBottom]);
  async function loadEarlier() {
    try {
      const result = await messagesAPI.thread(jobId, older);
      setMessages((previous) => [
        ...result.messages,
        ...previous.filter(
          (item) => !result.messages.some((old) => old.id === item.id),
        ),
      ]);
      setOlder(result.nextCursor || "");
    } catch (err) {
      setError(err.message);
    }
  }
  async function send(event) {
    event.preventDefault();
    if (sending || !draft.trim()) return;
    const content = draft.trim();
    if (!requestRef.current || requestRef.current.content !== content)
      requestRef.current = { content, id: crypto.randomUUID() };
    setSending(true);
    setSendError("");
    try {
      const message = await messagesAPI.send(
        jobId,
        content,
        requestRef.current.id,
      );
      setMessages((previous) =>
        previous.some((item) => item.id === message.id)
          ? previous
          : [...previous, message],
      );
      setDraft("");
      requestRef.current = null;
      setAtBottom(true);
      setRefresh((value) => value + 1);
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  }
  const partner =
    thread &&
    (thread.postedById === currentUser.id
      ? thread.assignedTo
      : thread.postedBy);
  const archived = thread && ["COMPLETED", "CANCELLED"].includes(thread.status);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
      <div className="mb-8">
        <span className="eyebrow">LESS BACK-AND-FORTH. BETTER WORK.</span>
        <h1 className="text-4xl font-bold tracking-tight mt-3">
          Your conversations.
        </h1>
        <p className="text-slate-500 mt-3">
          A shared space for every project, from the first hello to the final
          detail.
        </p>
      </div>
      <div className="chat-shell bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm grid md:grid-cols-[300px_1fr]">
        <aside
          className={`${jobId ? "hidden md:block" : ""} border-r border-slate-200 overflow-y-auto`}
        >
          <div className="p-6 border-b border-slate-100 font-bold flex items-center gap-3">
            <MessageCircle size={20} />
            Project inbox{" "}
            <span className="ml-auto text-slate-400 text-sm">
              {inbox.length}
            </span>
          </div>
          {inbox.length === 0 && (
            <p className="p-6 text-slate-500 text-sm leading-relaxed">
              Conversations open when a worker is hired. Until then, use your
              cover note to introduce yourself.
            </p>
          )}
          {inbox.map(({ job, latest, unread }) => {
            const peer =
              job.postedById === currentUser.id ? job.assignedTo : job.postedBy;
            return (
              <button
                key={job.id}
                onClick={() => setPage("messages", job)}
                className={`w-full text-left p-5 border-b border-slate-100 hover:bg-slate-50 ${jobId === job.id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""}`}
              >
                <div className="flex justify-between gap-3">
                  <p className="font-bold truncate">{peer.name}</p>
                  {unread > 0 && (
                    <span className="bg-blue-700 text-white text-xs rounded-full px-2 py-0.5">
                      {unread}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 truncate mt-1">
                  {job.title}
                </p>
                <p className="text-sm text-slate-400 truncate mt-3">
                  {latest?.content || "Start the conversation →"}
                </p>
              </button>
            );
          })}
        </aside>
        <section
          className={`${!jobId ? "hidden md:flex" : "flex"} flex-col min-w-0 h-full`}
        >
          {!jobId ? (
            <div className="m-auto text-center p-10">
              <MessageCircle size={42} className="text-blue-200 mx-auto mb-5" />
              <h2 className="text-2xl font-bold">Keep good work moving.</h2>
              <p className="text-slate-500 mt-3 max-w-sm">
                Choose a project to discuss the brief, share a delivery link, or
                ask a question.
              </p>
            </div>
          ) : (
            <>
              <header className="p-5 sm:p-6 border-b border-slate-100 flex gap-3 justify-between items-center">
                <div className="flex gap-3 items-center min-w-0">
                  <button
                    aria-label="Back to inbox"
                    className="md:hidden"
                    onClick={() => setPage("messages")}
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className="min-w-0">
                    <h2 className="font-bold truncate">
                      {partner?.name || "Project conversation"}
                    </h2>
                    <p className="text-sm text-slate-500 truncate mt-1">
                      {thread?.title}
                    </p>
                  </div>
                </div>
                {thread && (
                  <button
                    aria-label="View project"
                    onClick={() => setPage("job-detail", thread)}
                    className="p-2 text-blue-700"
                  >
                    <ArrowUpRight size={22} />
                  </button>
                )}
              </header>
              {(error || sendError) && (
                <div
                  role="alert"
                  className="mx-5 mt-4 bg-red-50 text-red-700 rounded-xl p-3 text-sm"
                >
                  {sendError || error}
                  <button
                    className="ml-3 underline"
                    onClick={() => setRefresh((value) => value + 1)}
                  >
                    Retry
                  </button>
                </div>
              )}
              <div
                className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-4"
                onScroll={(event) => {
                  const box = event.currentTarget;
                  setAtBottom(
                    box.scrollHeight - box.scrollTop - box.clientHeight < 100,
                  );
                }}
                aria-label="Conversation messages"
              >
                {loading && (
                  <p role="status" className="text-slate-500 text-center">
                    Loading conversation…
                  </p>
                )}
                {older && (
                  <button
                    onClick={loadEarlier}
                    className="block mx-auto text-blue-700 text-sm font-bold py-2"
                  >
                    Load earlier messages
                  </button>
                )}
                {!loading && thread && messages.length === 0 && (
                  <p className="text-center text-slate-400 py-12">
                    Say hello and agree on the next step.
                  </p>
                )}
                {messages.map((message) => {
                  const mine = message.senderId === currentUser.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${mine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[88%] sm:max-w-[75%] px-4 py-3 rounded-2xl ${mine ? "bg-blue-700 text-white rounded-br-sm" : "bg-slate-100 text-slate-800 rounded-bl-sm"}`}
                      >
                        <p className="whitespace-pre-wrap break-words leading-relaxed">
                          {message.content}
                        </p>
                        <p
                          className={`mt-2 text-[12px] flex gap-2 items-center justify-end ${mine ? "text-blue-200" : "text-slate-400"}`}
                        >
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {mine && (
                            <span aria-label={message.isRead ? "Read" : "Sent"}>
                              {message.isRead ? (
                                <CheckCheck size={14} />
                              ) : (
                                "Sent"
                              )}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>
              {archived ? (
                <p className="border-t border-slate-100 p-5 text-sm text-center text-slate-500">
                  This project is {thread.status.toLowerCase()}. Its
                  conversation is archived and available to read.
                </p>
              ) : (
                thread && (
                  <form
                    onSubmit={send}
                    className="border-t border-slate-100 p-4 sm:p-5"
                  >
                    <label className="sr-only" htmlFor="message-draft">
                      Message
                    </label>
                    <div className="flex gap-3 items-end">
                      <textarea
                        id="message-draft"
                        rows={2}
                        maxLength={4000}
                        value={draft}
                        disabled={sending}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" &&
                            !event.shiftKey &&
                            !event.nativeEvent.isComposing
                          ) {
                            event.preventDefault();
                            send(event);
                          }
                        }}
                        placeholder="Write a message…"
                        className="form-input resize-none bg-slate-50"
                      />
                      <button
                        type="submit"
                        aria-label="Send message"
                        disabled={sending || !draft.trim()}
                        className="bg-blue-700 text-white rounded-xl p-4 disabled:opacity-40"
                      >
                        <Send size={21} />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Enter to send · Shift + Enter for a new line ·{" "}
                      {draft.length}/4000
                    </p>
                  </form>
                )
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
