import { useEffect, useState } from "react";
import { getExperience } from "../utils/experience";
import { scholarshipsAPI } from "../lib/api";
import {
  ArrowUpRight,
  BookOpen,
  Bookmark,
  CalendarDays,
  Check,
  CheckCircle,
  ChevronRight,
  GraduationCap,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import Loading from "../components/ui/Loading";
const stageLabels = {
  SAVED: "Saved",
  PREPARING: "Preparing",
  APPLIED: "Applied",
  AWARDED: "Awarded",
  NOT_SELECTED: "Not selected",
};
const choices = [
  [
    "indianCitizen",
    "Indian citizen?",
    [
      ["true", "Yes"],
      ["false", "No"],
    ],
  ],
  [
    "course",
    "Current course",
    [
      ["general_degree", "General degree"],
      ["technical_degree", "Technical degree (e.g. B.Tech)"],
      ["technical_diploma", "Technical diploma"],
      ["basic_science", "Basic/natural science degree"],
      ["postgraduate", "Other postgraduate course"],
      ["school", "Class XI / XII"],
      ["other", "Other"],
    ],
  ],
  [
    "entry",
    "Admission route",
    [
      ["first_year", "First year"],
      ["lateral_second", "Second year through lateral entry"],
      ["other", "Other year / route"],
    ],
  ],
  [
    "regularCourse",
    "Regular, non-distance study?",
    [
      ["true", "Yes"],
      ["false", "No"],
    ],
  ],
  [
    "institutionApproved",
    "Institution/course recognized by the relevant authority?",
    [
      ["true", "Yes"],
      ["false", "No"],
    ],
  ],
  [
    "gender",
    "Gender",
    [
      ["female", "Woman / girl"],
      ["male", "Man / boy"],
      ["other", "Another identity"],
    ],
  ],
  [
    "gapAfter12",
    "Did you take a gap after Class XII?",
    [
      ["true", "Yes"],
      ["false", "No"],
    ],
  ],
  [
    "otherScholarship",
    "Receiving another scholarship / fee reimbursement?",
    [
      ["true", "Yes"],
      ["false", "No"],
    ],
  ],
  [
    "udid",
    "Do you have UDID documentation?",
    [
      ["true", "Yes"],
      ["false", "No"],
    ],
  ],
];
const numberFields = [
  ["annualIncome", "Annual family income (₹)", 0, 100000000],
  ["boardPercentile", "Class XII board percentile (not marks %)", 0, 100],
  ["age", "Age", 14, 100],
  ["disabilityPercent", "Disability percentage, if applicable", 0, 100],
];
function calendar(item, track) {
  const day = track.remindOn.slice(0, 10),
    next = new Date(day + "T12:00:00Z");
  next.setUTCDate(next.getUTCDate() + 1);
  const safe = (value) => value.replace(/[\r\n,;]/g, " ");
  const value = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GigGrad//Scholarship planner//EN",
    "BEGIN:VEVENT",
    `UID:${track.id}@giggrad.local`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    `DTSTART;VALUE=DATE:${day.replaceAll("-", "")}`,
    `DTEND;VALUE=DATE:${next.toISOString().slice(0, 10).replaceAll("-", "")}`,
    `SUMMARY:${safe("Scholarship follow-up: " + item.title)}`,
    `DESCRIPTION:${safe("Check your preparation and the current official deadline. " + item.applicationUrl)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(
      new Blob([value], { type: "text/calendar;charset=utf-8" }),
    ),
    link = document.createElement("a");
  link.href = url;
  link.download = `${item.id}-reminder.ics`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function TrackerItem({ item, track, onSave, onRemove }) {
  const [form, setForm] = useState({
    status: track.status,
    notes: track.notes,
    remindOn: track.remindOn?.slice(0, 10) || "",
    documents: track.documents,
  });
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const dirty =
    JSON.stringify(form) !==
    JSON.stringify({
      status: track.status,
      notes: track.notes,
      remindOn: track.remindOn?.slice(0, 10) || "",
      documents: track.documents,
    });
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSave(item.id, form);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className="scholar-card">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <span className="eyebrow">{item.provider}</span>
          <h3 className="text-xl font-bold mt-3">{item.title}</h3>
        </div>
        <span className="self-start rounded-full bg-blue-50 text-blue-700 px-3 py-2 text-xs font-bold">
          {stageLabels[track.status]}
        </span>
      </div>
      <form onSubmit={save} className="mt-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="text-sm font-semibold">
            Your stage
            <select
              className="form-input mt-2"
              value={form.status}
              onChange={(event) =>
                setForm({ ...form, status: event.target.value })
              }
            >
              {Object.entries(stageLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Follow-up date
            <input
              type="date"
              className="form-input mt-2"
              value={form.remindOn}
              onChange={(event) =>
                setForm({ ...form, remindOn: event.target.value })
              }
            />
          </label>
        </div>
        <fieldset>
          <legend className="font-semibold text-sm mb-3">
            Document preparation checklist
          </legend>
          <p className="text-xs text-slate-500 mb-3">
            Mark types ready. Keep the actual files and identifiers on the
            official portal.
          </p>
          <div className="space-y-2">
            {item.documents.map((document) => (
              <label
                key={document}
                className="flex gap-3 items-start text-sm text-slate-600"
              >
                <input
                  type="checkbox"
                  className="mt-1 accent-blue-700"
                  checked={form.documents.includes(document)}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      documents: event.target.checked
                        ? [...form.documents, document]
                        : form.documents.filter((value) => value !== document),
                    })
                  }
                />
                {document}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="block text-sm font-semibold">
          Your next step
          <textarea
            className="form-input mt-2"
            rows={3}
            maxLength={1000}
            value={form.notes}
            placeholder="What needs doing next? Do not add identity, bank, or login details."
            onChange={(event) =>
              setForm({ ...form, notes: event.target.value })
            }
          />
        </label>
        {error && (
          <p role="alert" className="text-red-700 text-sm">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-3 items-center">
          <button
            disabled={busy || !dirty}
            className="bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40"
          >
            {busy ? "Saving…" : dirty ? "Save progress" : "Progress saved"}
          </button>
          {track.remindOn && (
            <button
              type="button"
              onClick={() => calendar(item, track)}
              className="text-sm text-blue-700 font-bold flex gap-2 items-center"
            >
              <CalendarDays size={15} />
              Calendar reminder
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onRemove(item.id);
              } catch (err) {
                setError(err.message);
                setBusy(false);
              }
            }}
            className="ml-auto text-sm text-slate-400 hover:text-red-600"
          >
            Remove
          </button>
        </div>
      </form>
      <a
        className="inline-flex items-center gap-2 mt-5 text-blue-700 text-sm font-bold"
        href={item.applicationUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        Check official application status
        <ArrowUpRight size={15} />
      </a>
      <p className="text-xs text-slate-400 mt-3">
        This is your record, not a synchronized government application status.
      </p>
    </article>
  );
}
export default function ScholarshipsPage({ currentUser, setPage }) {
  const experience = getExperience(currentUser);
  const resourceView = !!currentUser && !experience.isStudent;
  const [catalogue, setCatalogue] = useState([]),
    [tracks, setTracks] = useState([]),
    [tab, setTab] = useState("explore"),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState("All"),
    [answers, setAnswers] = useState({}),
    [results, setResults] = useState(null),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await scholarshipsAPI.catalogue();
        if (active) {
          setCatalogue(data.scholarships);
          setError("");
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
  }, [retry]);
  useEffect(() => {
    let active = true;
    if (currentUser)
      scholarshipsAPI
        .tracking()
        .then((data) => {
          if (active) setTracks(data);
        })
        .catch((err) => {
          if (active) setError(err.message);
        });
    return () => {
      active = false;
    };
  }, [currentUser]);
  async function save(id, data = {}) {
    const saved = await scholarshipsAPI.save(id, data);
    setTracks((previous) => [
      saved,
      ...previous.filter((item) => item.scholarshipId !== id),
    ]);
    setNotice(
      resourceView
        ? "Saved to your student-funding references."
        : "Scholarship saved to your tracker.",
    );
  }
  async function check(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const profile = {};
    for (const [key, value] of Object.entries(answers)) {
      if (value === "") continue;
      profile[key] = [
        "annualIncome",
        "boardPercentile",
        "age",
        "disabilityPercent",
      ].includes(key)
        ? Number(value)
        : value === "true"
          ? true
          : value === "false"
            ? false
            : value;
    }
    try {
      const data = await scholarshipsAPI.eligibility(profile);
      setResults(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  const filtered = catalogue.filter(
    (item) =>
      (category === "All" || category === item.category) &&
      `${item.title} ${item.provider} ${item.category}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <section className="scholar-hero rounded-[2rem] p-7 sm:p-11 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="eyebrow text-emerald-200">
            <GraduationCap size={16} />
            MORE ROOM TO KEEP GOING
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mt-5 leading-tight">
            {resourceView ? "Help students find" : "Your ambition deserves"}
            <br />
            <span className="font-editorial text-emerald-200">
              {resourceView ? "the support to continue." : "a little support."}
            </span>
          </h1>
          <p className="text-emerald-100 mt-5 leading-relaxed max-w-xl">
            {resourceView
              ? "Official funding references for mentoring students. Use anonymous criteria and save a resource list for your support work."
              : "Find education support, understand the listed criteria, and give every application a clear next step."}
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <span className="scholar-pill">
              <ShieldCheck size={15} />
              Official sources
            </span>
            <span className="scholar-pill">
              <BookOpen size={15} />
              {catalogue.length || "Curated"} schemes · India
            </span>
            <span className="scholar-pill">
              <Bookmark size={15} />
              {resourceView ? "Your reference list" : "Your private tracker"}
            </span>
          </div>
        </div>
        <span
          className="absolute right-4 bottom-0 text-white/10 font-editorial text-[8rem] leading-none"
          aria-hidden="true"
        >
          possibility
        </span>
      </section>
      <div
        className="flex flex-wrap gap-2 mt-8 mb-7"
        aria-label="Scholarship sections"
      >
        {[
          ["explore", "Discover support"],
          [
            "eligibility",
            resourceView ? "Check student criteria" : "Check eligibility",
          ],
          [
            "tracker",
            `${resourceView ? "Saved references" : "My tracker"} (${tracks.length})`,
          ],
        ].map(([key, label]) => (
          <button
            key={key}
            aria-pressed={tab === key}
            onClick={() => {
              setTab(key);
              setNotice("");
            }}
            className={`px-5 py-3 text-sm font-bold rounded-full border ${tab === key ? "bg-slate-900 text-white border-slate-900" : "bg-white/90 text-slate-600 border-slate-200"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {error && (
        <div
          role="alert"
          className="bg-red-50 text-red-700 rounded-xl p-4 mb-5 text-sm"
        >
          {error}
          <button
            onClick={() => setRetry(retry + 1)}
            className="ml-3 underline"
          >
            Retry
          </button>
        </div>
      )}
      {notice && (
        <p
          role="status"
          className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-5 text-sm"
        >
          {notice}
        </p>
      )}
      {loading ? (
        <Loading label="Gathering scholarship support…" />
      ) : (
        <>
          {tab === "explore" && (
            <>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1 min-w-0">
                  <Search
                    className="absolute top-4 left-4 text-slate-400"
                    size={18}
                  />
                  <input
                    aria-label="Search scholarships"
                    placeholder="Search a scheme, provider, or kind of support…"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="form-input bg-white/90"
                    style={{ paddingLeft: "2.75rem" }}
                  />
                </div>
                <div className="sm:w-[280px] shrink-0">
                  <select
                    aria-label="Scholarship category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="form-input"
                  >
                    <option>All</option>
                    {[...new Set(catalogue.map((item) => item.category))].map(
                      (value) => (
                        <option key={value}>{value}</option>
                      ),
                    )}
                  </select>
                </div>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                A curated starting point, not every scholarship available.
                Opening dates and final decisions stay with the scheme
                authority.
              </p>
              <div className="grid md:grid-cols-2 gap-5">
                {filtered.map((item) => (
                  <article key={item.id} className="scholar-card flex flex-col">
                    <div className="flex justify-between items-start gap-3">
                      <span className="text-xs text-emerald-700 bg-emerald-50 rounded-full px-3 py-1.5 font-semibold">
                        {item.category}
                      </span>
                      <GraduationCap
                        size={23}
                        className="text-emerald-600 shrink-0"
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-5">
                      {item.provider}
                    </p>
                    <h2 className="text-xl font-bold mt-2">{item.title}</h2>
                    <p className="text-sm text-slate-500 leading-relaxed mt-3">
                      {item.summary}
                    </p>
                    <p className="text-sm font-semibold text-slate-700 mt-4">
                      {item.support}
                    </p>
                    <details className="mt-4 text-sm">
                      <summary className="font-semibold cursor-pointer text-slate-600">
                        Listed criteria & preparation
                      </summary>
                      <ul className="space-y-2 mt-3 text-slate-500">
                        {item.rules.map((rule, i) => (
                          <li key={i} className="flex gap-2">
                            <ChevronRight size={15} className="shrink-0 mt-1" />
                            {rule.label}
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-slate-400 mt-3">
                        {item.sourceNote}
                      </p>
                      {item.additionalSources?.map((url) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-3 text-emerald-700 underline text-xs"
                        >
                          Additional official guidance
                        </a>
                      ))}
                    </details>
                    <div className="mt-auto pt-6">
                      <div className="flex flex-wrap gap-3 items-center">
                        <a
                          href={item.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-emerald-700 font-bold inline-flex gap-1 items-center"
                        >
                          Official guidance
                          <ArrowUpRight size={16} />
                        </a>
                        <button
                          disabled={tracks.some(
                            (track) => track.scholarshipId === item.id,
                          )}
                          onClick={async () => {
                            if (!currentUser) {
                              setPage("login");
                              return;
                            }
                            setError("");
                            try {
                              await save(item.id);
                            } catch (err) {
                              setError(err.message);
                            }
                          }}
                          className="ml-auto text-sm border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-700 disabled:opacity-40"
                        >
                          {tracks.some(
                            (track) => track.scholarshipId === item.id,
                          )
                            ? "Saved"
                            : resourceView
                              ? "Save reference"
                              : "Save to tracker"}
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 mt-4">
                        Reviewed {item.reviewedOn} · Check the official
                        application window
                      </p>
                    </div>
                  </article>
                ))}
              </div>
              {!filtered.length && (
                <p className="py-12 text-center text-slate-500">
                  No schemes match that search. Try a broader term or category.
                </p>
              )}
              <a
                className="inline-flex gap-2 items-center text-sm font-bold text-emerald-700 mt-7"
                href="https://scholarships.gov.in/All-Scholarships"
                target="_blank"
                rel="noopener noreferrer"
              >
                Explore more schemes on the National Scholarship Portal
                <ArrowUpRight size={16} />
              </a>
            </>
          )}
          {tab === "eligibility" && (
            <>
              <section className="scholar-card">
                <div className="flex items-start gap-3">
                  <Sparkles size={25} className="text-emerald-600 shrink-0" />
                  <div>
                    <h2 className="text-2xl font-bold">
                      Find a sensible starting point.
                    </h2>
                    <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                      Answer what you know; leave the rest blank. This checks
                      only the criteria listed in our catalogue. Your answers
                      stay out of saved profiles, trackers, and AI
                      conversations.
                    </p>
                  </div>
                </div>
                <form onSubmit={check} className="mt-7">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {choices.map(([key, label, options]) => (
                      <label
                        key={key}
                        className="text-sm font-semibold text-slate-700"
                        htmlFor={`eligibility-${key}`}
                      >
                        {label}
                        <select
                          id={`eligibility-${key}`}
                          className="form-input mt-2"
                          value={answers[key] || ""}
                          onChange={(event) =>
                            setAnswers({
                              ...answers,
                              [key]: event.target.value,
                            })
                          }
                        >
                          <option value="">
                            Not provided / prefer not to say
                          </option>
                          {options.map(([value, text]) => (
                            <option key={value} value={value}>
                              {text}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                    {numberFields.map(([key, label, min, max]) => (
                      <label
                        key={key}
                        htmlFor={`eligibility-${key}`}
                        className="text-sm font-semibold text-slate-700"
                      >
                        {label}
                        <input
                          id={`eligibility-${key}`}
                          type="number"
                          min={min}
                          max={max}
                          step="any"
                          value={answers[key] ?? ""}
                          onChange={(event) =>
                            setAnswers({
                              ...answers,
                              [key]: event.target.value,
                            })
                          }
                          className="form-input mt-2"
                          placeholder="Optional"
                        />
                      </label>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-7">
                    <button
                      disabled={busy}
                      className="rounded-xl bg-emerald-700 text-white px-5 py-3 font-bold text-sm disabled:opacity-50"
                    >
                      {busy ? "Checking…" : "Check listed criteria"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAnswers({});
                        setResults(null);
                      }}
                      className="text-slate-500 text-sm"
                    >
                      Clear answers
                    </button>
                    <p className="text-xs text-slate-400">
                      No identity numbers or documents needed.
                    </p>
                  </div>
                </form>
              </section>
              {results && (
                <section className="mt-7 space-y-4" aria-live="polite">
                  <h2 className="text-2xl font-bold">
                    Your preliminary results
                  </h2>
                  <p className="text-sm text-slate-500">
                    A potential match still needs official review of the
                    remaining conditions and current cycle.
                  </p>
                  {results.map((result) => {
                    const item = catalogue.find(
                      (scholarship) => scholarship.id === result.scholarshipId,
                    );
                    return (
                      <article
                        className="scholar-card"
                        key={result.scholarshipId}
                      >
                        <div className="flex flex-wrap justify-between gap-3">
                          <h3 className="text-xl font-bold">{item.title}</h3>
                          <span
                            className={`text-xs font-bold rounded-full px-3 py-2 ${result.outcome === "potential_match" ? "bg-emerald-50 text-emerald-700" : result.outcome === "needs_details" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}
                          >
                            {result.outcome === "potential_match"
                              ? "Potential match"
                              : result.outcome === "needs_details"
                                ? "More details needed"
                                : "Listed criteria not met"}
                          </span>
                        </div>
                        <details className="mt-4">
                          <summary className="text-sm font-semibold cursor-pointer">
                            See the reasons and remaining checks
                          </summary>
                          <ul className="grid sm:grid-cols-2 gap-3 mt-5">
                            {result.checks.map((check, i) => (
                              <li
                                key={i}
                                className="flex gap-2 text-sm text-slate-600"
                              >
                                {check.status === "pass" ? (
                                  <Check
                                    size={17}
                                    className="text-emerald-600 shrink-0"
                                  />
                                ) : check.status === "fail" ? (
                                  <X
                                    size={17}
                                    className="text-slate-400 shrink-0"
                                  />
                                ) : (
                                  <span className="text-amber-600 w-4 shrink-0">
                                    ?
                                  </span>
                                )}
                                {check.label}
                                {check.status === "unknown"
                                  ? " — not provided"
                                  : ""}
                              </li>
                            ))}
                          </ul>
                          <p className="font-bold text-sm mt-5 mb-2">
                            Still confirm with the authority
                          </p>
                          {result.stillToConfirm.map((value) => (
                            <p
                              key={value}
                              className="text-sm text-slate-500 mt-1"
                            >
                              • {value}
                            </p>
                          ))}
                        </details>
                        <a
                          href={item.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 text-sm font-bold inline-flex items-center gap-1 mt-5"
                        >
                          Verify official conditions
                          <ArrowUpRight size={16} />
                        </a>
                      </article>
                    );
                  })}
                </section>
              )}
            </>
          )}
          {tab === "tracker" &&
            (!currentUser ? (
              <section className="scholar-card text-center py-12">
                <Bookmark className="mx-auto text-emerald-600" size={32} />
                <h2 className="text-2xl font-bold mt-4">
                  Keep your next step close.
                </h2>
                <p className="text-slate-500 text-sm mt-3">
                  Sign in to save schemes, prepare documents and track your
                  progress privately.
                </p>
                <button
                  onClick={() => setPage("login")}
                  className="mt-6 bg-emerald-700 text-white rounded-xl px-5 py-3 font-bold text-sm"
                >
                  Sign in to start tracking
                </button>
              </section>
            ) : tracks.length ? (
              <div className="space-y-5">
                {tracks.map((track) => {
                  const item = catalogue.find(
                    (scholarship) => scholarship.id === track.scholarshipId,
                  );
                  return item && resourceView ? (
                    <article className="scholar-card" key={track.id}>
                      <h3 className="text-xl font-bold">{item.title}</h3>
                      <p className="text-sm text-slate-500 mt-3">
                        {item.summary}
                      </p>
                      <a
                        className="inline-flex text-emerald-700 text-sm font-bold mt-4"
                        href={item.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Official student funding guidance →
                      </a>
                      <button
                        className="block mt-4 text-sm text-slate-400"
                        onClick={async () => {
                          try {
                            await scholarshipsAPI.remove(item.id);
                            setTracks((previous) =>
                              previous.filter(
                                (value) => value.scholarshipId !== item.id,
                              ),
                            );
                          } catch (err) {
                            setError(err.message);
                          }
                        }}
                      >
                        Remove reference
                      </button>
                    </article>
                  ) : item ? (
                    <TrackerItem
                      key={`${track.id}:${track.updatedAt}`}
                      item={item}
                      track={track}
                      onSave={save}
                      onRemove={async (id) => {
                        await scholarshipsAPI.remove(id);
                        setTracks((previous) =>
                          previous.filter(
                            (value) => value.scholarshipId !== id,
                          ),
                        );
                        setNotice("Removed from your tracker.");
                      }}
                    />
                  ) : null;
                })}
              </div>
            ) : (
              <section className="scholar-card text-center py-12">
                <CheckCircle className="mx-auto text-emerald-600" size={32} />
                <h2 className="text-2xl font-bold mt-4">
                  A little organization goes a long way.
                </h2>
                <p className="text-sm text-slate-500 mt-3">
                  Save a scheme from Discover support to start your checklist.
                </p>
                <button
                  className="mt-5 text-emerald-700 font-bold"
                  onClick={() => setTab("explore")}
                >
                  Discover support →
                </button>
              </section>
            ))}
        </>
      )}
      <p className="mt-10 text-xs text-slate-400 text-center">
        Apply only through official portals. GigGrad does not charge a
        scholarship application fee or guarantee selection.
      </p>
    </div>
  );
}
