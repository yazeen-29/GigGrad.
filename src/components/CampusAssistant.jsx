import MiloIcon from "./MiloIcon";
import { useEffect, useRef, useState } from "react";
import { getExperience } from "../utils/experience";
import { assistantAPI } from "../lib/api";
import { ArrowUpRight, BookOpen, RotateCcw, Send, X } from "lucide-react";
const welcome = {
  id: "welcome",
  role: "assistant",
  mode: "guided",
  content:
    "Hi, I’m Milo, your GigGrad guide and skills coach. Ask me about the website, plan your next gig, or learn a new skill together.",
  actions: [],
  sources: [],
};
export default function CampusAssistant({ setPage, currentUser, currentPage }) {
  const experience = getExperience(currentUser);
  const roleWelcome = {
    ...welcome,
    content: experience.isAdmin
      ? "I can help with student posting requests, project conflicts, and administration workflows. What needs attention?"
      : experience.isPoster && !experience.isStudent
        ? "I can help you publish project briefs, review applicants, coordinate student delivery, or find funding references to share with students."
        : `${currentUser?.name ? `Hi ${currentUser.name.split(" ")[0]}, I’m Milo.` : "Hi, I’m Milo."} ${currentUser?.skills?.length ? `Let’s build on your ${currentUser.skills.slice(0, 3).join(", ")} skills. ` : ""}I can help you understand GigGrad, improve an application, or plan what to learn next.`,
  };
  const [open, setOpen] = useState(false),
    [messages, setMessages] = useState([roleWelcome]),
    [draft, setDraft] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [available, setAvailable] = useState(false),
    [useAI, setUseAI] = useState(true);
  const inputRef = useRef(null),
    endRef = useRef(null),
    triggerRef = useRef(null);
  useEffect(() => {
    let active = true;
    assistantAPI
      .status()
      .then((data) => {
        if (active) setAvailable(data.aiAvailable);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    const onAsk = (event) => {
      setOpen(true);
      setDraft(
        typeof event.detail === "string" ? event.detail.slice(0, 2000) : "",
      );
    };
    window.addEventListener("giggrad:ask-milo", onAsk);
    return () => window.removeEventListener("giggrad:ask-milo", onAsk);
  }, []);
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages, busy, open]);
  async function send(value = draft) {
    if (busy || !value.trim()) return;
    const content = value.trim();
    if (content.length > 2000) return;
    const next = [
      ...messages,
      { id: crypto.randomUUID(), role: "user", content },
    ];
    setMessages(next);
    setDraft("");
    setBusy(true);
    setError("");
    try {
      const history = next
        .filter((item) => item.id !== "welcome")
        .slice(-9)
        .map((item) => ({
          role: item.role,
          content: item.content.slice(0, 2000),
        }));
      const reply = await assistantAPI.ask(
        history,
        useAI && available && !!currentUser,
        currentPage,
      );
      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply.answer,
          mode: reply.mode,
          actions: reply.actions || [],
          sources: reply.sources || [],
          notice: reply.notice,
        },
      ]);
    } catch (err) {
      setError(err.message);
      setDraft(content);
      setMessages((previous) =>
        previous.filter((item) => item.id !== next.at(-1).id),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="assistant-anchor">
      {open && (
        <section role="dialog" aria-label="Milo" className="assistant-panel">
          <header className="flex items-center gap-3 p-5 border-b border-slate-100">
            <span className="w-10 h-10 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center">
              <MiloIcon busy={busy} />
            </span>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-base">Milo</h2>
              <p className="text-xs text-slate-400">
                {useAI && available
                  ? "Your AI guide & skills coach"
                  : "GigGrad guide · AI offline"}
              </p>
            </div>
            <button
              aria-label="Clear assistant conversation"
              disabled={busy}
              onClick={() => {
                setMessages([roleWelcome]);
                setError("");
                setDraft("");
              }}
              className="text-slate-400 p-1"
            >
              <RotateCcw size={16} />
            </button>
            <button
              aria-label="Close assistant"
              onClick={() => {
                setOpen(false);
                triggerRef.current?.focus();
              }}
              className="text-slate-500 p-1"
            >
              <X size={21} />
            </button>
          </header>
          <div
            className="assistant-history"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {messages.map((message) => (
              <article
                key={message.id}
                className={message.role === "user" ? "ml-7" : "mr-2"}
              >
                <div
                  className={`rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${message.role === "user" ? "bg-blue-700 text-white rounded-br-sm" : "bg-slate-50 text-slate-700 rounded-bl-sm"}`}
                >
                  {message.content}
                </div>
                {message.role === "assistant" && (
                  <>
                    <span className="text-[10px] text-slate-400 ml-1 mt-1 inline-block">
                      {message.mode === "ai"
                        ? "AI answer"
                        : "Built-in guidance"}
                    </span>
                    {message.notice && (
                      <p className="text-xs text-amber-700 mt-2">
                        {message.notice}
                      </p>
                    )}
                    {message.actions?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {message.actions.map((action) => (
                          <button
                            key={action.page}
                            className="text-xs font-semibold border border-blue-100 bg-white text-blue-700 px-3 py-2 rounded-lg"
                            onClick={() => {
                              setPage(action.page);
                              setOpen(false);
                            }}
                          >
                            {action.label} →
                          </button>
                        ))}
                      </div>
                    )}
                    {message.sources?.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.sources.map((source) => (
                          <a
                            key={source.url}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-emerald-700 font-semibold"
                          >
                            <BookOpen size={12} className="shrink-0" />
                            {source.title}
                            <ArrowUpRight size={12} className="shrink-0" />
                          </a>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </article>
            ))}
            {busy && (
              <p role="status" className="text-sm text-slate-400">
                Thinking through your next step…
              </p>
            )}
            <div ref={endRef} />
          </div>
          {messages.length === 1 && (
            <div className="px-5 pb-4 flex flex-wrap gap-2">
              {[
                experience.isAdmin
                  ? "How do I resolve disputes?"
                  : experience.isPoster && !experience.isStudent
                    ? "How do I publish a campus project?"
                    : "Find scholarship support",
                "What skills should I learn to get hired?",
                experience.isStudent || experience.kind === "guest"
                  ? "How can I apply for a gig?"
                  : "How do I review delivered work?",
                "Help with my profile",
              ].map((question) => (
                <button
                  key={question}
                  onClick={() => send(question)}
                  className="text-xs text-slate-600 border border-slate-200 rounded-full px-3 py-2 hover:border-blue-300"
                >
                  {question}
                </button>
              ))}
            </div>
          )}
          <footer className="p-4 border-t border-slate-100">
            {available ? (
              <label className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                <input
                  type="checkbox"
                  checked={useAI}
                  disabled={!currentUser || busy}
                  onChange={(event) => setUseAI(event.target.checked)}
                />
                {currentUser
                  ? "AI on · sends chat, your name, role, skills and current page to OpenAI."
                  : "Sign in to use AI replies."}
              </label>
            ) : (
              <p className="text-[11px] text-slate-400 mb-3">
                Milo’s AI connection is pending. You can use website help and
                Skill Studio meanwhile.
              </p>
            )}
            <button
              className="text-xs text-blue-700 font-semibold mb-3 block"
              onClick={() => {
                setPage("learn");
                setOpen(false);
              }}
            >
              Explore Skill Studio →
            </button>
            {error && (
              <p role="alert" className="text-red-600 text-xs mb-3">
                {error}
              </p>
            )}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                send();
              }}
              className="flex gap-2"
            >
              <label className="sr-only" htmlFor="assistant-message">
                Ask Milo
              </label>
              <input
                ref={inputRef}
                id="assistant-message"
                value={draft}
                maxLength={2000}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask Milo about gigs, skills, or GigGrad…"
                className="form-input min-w-0"
              />
              <button
                type="submit"
                aria-label="Send assistant message"
                disabled={busy || !draft.trim()}
                className="bg-blue-700 text-white p-3 rounded-xl disabled:opacity-40"
              >
                <Send size={18} />
              </button>
            </form>
            <p className="text-[10px] text-slate-400 mt-2">
              Keep passwords, identity numbers and documents out of chat.
            </p>
          </footer>
        </section>
      )}
      <button
        ref={triggerRef}
        aria-label={open ? "Close Milo" : "Open Milo"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="assistant-trigger"
      >
        {open ? <X size={22} /> : <MiloIcon />}
        <span className="hidden sm:inline">Ask Milo</span>
      </button>
    </div>
  );
}
