import { useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  Check,
  Sparkles,
  Target,
} from "lucide-react";
import paths from "../../Gig-Grad-Server/src/data/learning.json";

export default function LearnPage({ currentUser, setPage }) {
  const storageKey = `gg_learning_v1:${currentUser?.id || "guest"}`;
  const [plan, setPlan] = useState(() => {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey));
      return value && typeof value === "object" && !Array.isArray(value)
        ? value
        : {};
    } catch {
      return {};
    }
  });
  const [storageError, setStorageError] = useState("");
  const [filter, setFilter] = useState("");
  const skills = (currentUser?.skills || []).map((s) => s.toLowerCase());
  const ranked = [...paths].sort(
    (a, b) =>
      Number(b.skills.some((s) => skills.includes(s.toLowerCase()))) -
      Number(a.skills.some((s) => skills.includes(s.toLowerCase()))),
  );
  const [selected, setSelected] = useState(
    () => paths.find((p) => p.id === plan.goal)?.id || ranked[0].id,
  );
  const path = paths.find((p) => p.id === selected);
  const steps = [
    ...path.lessons,
    "Complete the practice brief",
    "Check your portfolio sample",
  ];
  const complete = steps.filter(
    (_, i) => plan[`${path.id}:${i}`] === true,
  ).length;
  function save(next) {
    setPlan(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setStorageError("");
    } catch {
      setStorageError(
        "Progress could not be saved on this browser. You can keep learning this session.",
      );
    }
  }
  function askMilo() {
    window.dispatchEvent(
      new CustomEvent("giggrad:ask-milo", {
        detail: `Help me learn ${path.category}. My goal is to complete this portfolio brief: ${path.brief}. Give me a practical plan based on my current skills.`,
      }),
    );
  }
  return (
    <div className="skill-studio max-w-7xl mx-auto px-5 py-10 md:py-16">
      <div className="studio-hero">
        <div>
          <span className="studio-eyebrow">
            <Sparkles size={15} /> SKILL STUDIO
          </span>
          <h1>
            Small steps.
            <br />
            <em>Real skills.</em> Better gigs.
          </h1>
          <p>
            {currentUser
              ? `${currentUser.name?.split(" ")[0] || "Hi"}, build on what you know and make something worth showing.`
              : "Your next opportunity starts with something you can do. Pick a path, practise, and build proof of your skills."}
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <a href="#learning-paths" className="studio-primary">
              Find your path <ArrowRight size={17} />
            </a>
            <button
              onClick={() => setPage("jobs")}
              className="studio-secondary"
            >
              Explore gigs <ArrowUpRight size={17} />
            </button>
          </div>
        </div>
        <aside className="studio-note">
          <span className="studio-eyebrow">YOUR NEXT CHAPTER</span>
          <BookOpen size={42} />
          <h2>
            Learn it. Make it.
            <br />
            Show your work.
          </h2>
          <p>One useful sample says more than a long list of skills.</p>
          <span className="text-xs">
            6 paths · practical briefs · official resources
          </span>
        </aside>
      </div>
      <section id="learning-paths" className="mt-12 scroll-mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <span className="studio-eyebrow">START WHERE YOU ARE</span>
            <h2 className="text-3xl font-bold mt-2">Choose your next skill</h2>
            <p className="text-slate-500 mt-2">
              {skills.length
                ? "Paths related to your profile skills appear first. Explore a new direction anytime."
                : "Beginner-friendly paths for the work you want to do."}
            </p>
          </div>
          <label className="text-sm text-slate-600">
            Find a path
            <input
              aria-label="Search learning paths"
              className="form-input mt-1"
              placeholder="Design, coding, Excel…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </label>
        </div>
        <div className="studio-paths">
          {ranked
            .filter((p) =>
              `${p.title} ${p.category} ${p.skills.join(" ")}`
                .toLowerCase()
                .includes(filter.toLowerCase()),
            )
            .map((p, i) => (
              <button
                key={p.id}
                aria-pressed={selected === p.id}
                onClick={() => {
                  setSelected(p.id);
                  save({ ...plan, goal: p.id });
                }}
                className={`studio-path ${selected === p.id ? "selected" : ""}`}
              >
                <div className="flex justify-between items-center">
                  <span className="studio-path-number">0{i + 1}</span>
                  {p.skills.some((s) => skills.includes(s.toLowerCase())) && (
                    <span className="studio-match">Builds on your skills</span>
                  )}
                </div>
                <span className="text-xs uppercase tracking-wider text-slate-500">
                  {p.category}
                </span>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <span className="text-sm font-semibold flex items-center gap-2 mt-5">
                  View learning path <ArrowRight size={15} />
                </span>
              </button>
            ))}
        </div>
        {!ranked.some((p) =>
          `${p.title} ${p.category} ${p.skills.join(" ")}`
            .toLowerCase()
            .includes(filter.toLowerCase()),
        ) && (
          <p className="p-6">
            No paths match yet. Try design, coding, data, documents, video or
            writing.
          </p>
        )}
      </section>
      <section className="studio-plan mt-10" aria-label="Your learning plan">
        <div>
          <span className="studio-eyebrow">
            <Target size={15} /> YOUR PRACTICE PLAN
          </span>
          <h2 className="text-3xl font-bold mt-3">{path.title}</h2>
          <p className="text-slate-500 mt-3">
            Go at your own pace. Mark each milestone when you have practised it.
          </p>
          <div
            className="studio-progress"
            role="progressbar"
            aria-label="Learning milestones"
            aria-valuemin={0}
            aria-valuemax={5}
            aria-valuenow={complete}
          >
            <span style={{ width: `${(complete / 5) * 100}%` }} />
          </div>
          <p className="text-sm text-slate-500 mb-6">
            {complete} of 5 milestones ·{" "}
            {complete === 5
              ? "Sample ready for your own review"
              : "Keep going, one step at a time"}
          </p>
          <div className="space-y-3">
            {steps.map((step, i) => (
              <label className="studio-step" key={`${path.id}:${i}`}>
                <input
                  type="checkbox"
                  checked={plan[`${path.id}:${i}`] === true}
                  onChange={(e) =>
                    save({ ...plan, [`${path.id}:${i}`]: e.target.checked })
                  }
                />
                <span>{step}</span>
              </label>
            ))}
          </div>
          <a
            className="studio-resource"
            href={path.resource.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <BookOpen size={22} />
            <span>
              <strong>{path.resource.title}</strong>
              <small>
                {path.resource.provider} · official learning resource
              </small>
            </span>
            <ArrowUpRight size={20} />
          </a>
          <p className="text-xs text-slate-500">
            Resources checked November 2026. Some providers require an account;
            access and software terms vary.
          </p>
        </div>
        <div className="studio-brief">
          <span className="studio-eyebrow">MAKE SOMETHING REAL</span>
          <h3 className="text-2xl font-bold mt-3 mb-4">
            Your first portfolio piece
          </h3>
          <p className="leading-relaxed">{path.brief}</p>
          <h4 className="font-bold mt-6 mb-3">Before you share it</h4>
          {path.checks.map((check) => (
            <p key={check} className="flex gap-2 my-3 text-sm">
              <Check size={17} className="shrink-0 text-emerald-700" />
              {check}
            </p>
          ))}
          <button className="studio-primary mt-5" onClick={askMilo}>
            <Sparkles size={17} /> Make a plan with Milo
          </button>
        </div>
      </section>
      <div className="studio-finish">
        <div>
          <h2 className="text-2xl font-bold">
            Turn practice into your next application.
          </h2>
          <p className="text-slate-500 mt-2">
            Add skills you can demonstrate to your profile. Mention your sample
            and a realistic delivery plan when applying.
          </p>
        </div>
        <button className="studio-secondary" onClick={() => setPage("profile")}>
          Update my profile <ArrowRight size={16} />
        </button>
      </div>
      <p className="text-xs text-slate-500 mt-6">
        Progress stays on this device, separately for each account. Milestones
        are self-reported; completing a path does not certify skills or
        guarantee hiring.
      </p>
      {storageError && (
        <p role="alert" className="text-sm text-amber-700 mt-3">
          {storageError}
        </p>
      )}
    </div>
  );
}
