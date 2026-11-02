import HeroGigIllustration from "../components/HeroGigIllustration";
import HomeInspiration from "../components/HomeInspiration";
import LandingStories from "../components/LandingStories";
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Palette,
  FileText,
  Check,
  ShieldCheck,
} from "lucide-react";
const categories = [
  {
    icon: Palette,
    name: "Design & creativity",
    detail: "Make something worth sharing.",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: Code2,
    name: "Code & technology",
    detail: "Turn a good idea into something real.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: FileText,
    name: "Writing & documents",
    detail: "Bring clarity to the details.",
    color: "bg-amber-50 text-amber-600",
  },
];
export default function LandingPage({ setPage, currentUser }) {
  return (
    <div className="landing-page home-expanded">
      {currentUser && (
        <div className="home-welcome">
          <span>
            Welcome back, <strong>{currentUser.name?.split(" ")[0]}</strong>.
            Your next chapter is waiting.
          </span>
          <button
            onClick={() =>
              setPage(currentUser.role === "ADMIN" ? "admin" : "dashboard")
            }
          >
            Open my workspace <ArrowRight size={15} />
          </button>
        </div>
      )}
      <section className="hero-section">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-16 pb-20 lg:pt-24 lg:pb-28 grid lg:grid-cols-2 gap-12 items-center">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="signal-dot w-2 h-2 rounded-full bg-emerald-500" />{" "}
              YOUR CAMPUS. YOUR OPPORTUNITY.
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.06] text-slate-950 mt-6">
              Big talent.
              <br />
              Small gigs.
              <br />
              <span className="font-editorial gradient-ink">Real growth.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-md mt-6">
              You have the skills. Your campus has the work. Connect the two —
              earn on your terms and build experience that goes beyond the
              classroom.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <button
                onClick={() => setPage("jobs")}
                className="inline-flex items-center gap-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl px-6 py-3.5 text-sm font-bold shadow-lg shadow-blue-700/15"
              >
                Find your next gig <ArrowRight size={17} />
              </button>
              <button
                onClick={() => setPage("post-job")}
                className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-6 py-3.5 text-sm font-bold text-slate-700"
              >
                Hire campus talent <ArrowUpRight size={16} />
              </button>
            </div>
            <div className="mt-7 flex gap-5 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-emerald-600" />
                Free to explore
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-emerald-600" />
                Built around your classes
              </span>
            </div>
          </div>
          <HeroGigIllustration setPage={setPage} />
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-16">
        <div className="flex items-end justify-between gap-4 mb-7">
          <div>
            <span className="eyebrow">FIND YOUR THING</span>
            <h2 className="text-3xl font-bold tracking-tight mt-3">
              A place for what you do best.
            </h2>
          </div>
          <button
            onClick={() => setPage("jobs")}
            className="text-sm text-blue-700 font-semibold hidden sm:flex items-center gap-2"
          >
            Explore jobs <ArrowRight size={16} />
          </button>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {categories.map(({ icon: Icon, name, detail, color }) => (
            <button
              key={name}
              onClick={() => setPage("jobs")}
              className="feature-lift group text-left rounded-2xl border border-slate-200 p-6 bg-white hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
              >
                <Icon size={23} />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mt-5 flex justify-between items-center">
                {name}
                <ArrowUpRight
                  size={18}
                  className="text-slate-300 group-hover:text-blue-600"
                />
              </h3>
              <p className="text-sm text-slate-500 mt-2">{detail}</p>
            </button>
          ))}
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-5 sm:px-6 pb-12">
        <div className="scholar-hero rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row gap-7 items-start sm:items-center justify-between text-white">
          <div>
            <span className="eyebrow text-emerald-200">
              BEYOND THE NEXT GIG
            </span>
            <h2 className="text-3xl font-bold mt-4">
              More possibility.
              <br />
              <span className="font-editorial text-emerald-200">
                A little more support.
              </span>
            </h2>
            <p className="text-sm text-emerald-100 mt-4 max-w-md">
              Explore scholarship sources, check the listed criteria, and keep
              your applications moving.
            </p>
          </div>
          <button
            onClick={() => setPage("scholarships")}
            className="bg-white text-emerald-800 rounded-xl px-5 py-3 text-sm font-bold whitespace-nowrap"
          >
            Explore scholarship support →
          </button>
        </div>
      </section>
      <HomeInspiration setPage={setPage} />
      <LandingStories setPage={setPage} />
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-16">
        <div className="rounded-3xl bg-blue-50 border border-blue-100 p-8 sm:p-12 flex flex-col sm:flex-row justify-between gap-6 items-start sm:items-center">
          <div>
            <ShieldCheck className="text-blue-700 mb-3" size={24} />
            <h2 className="text-2xl font-bold text-slate-900">
              Good work starts with trust.
            </h2>
            <p className="text-sm text-slate-500 mt-3 max-w-lg leading-relaxed">
              Faculty and staff can post directly; student posting is approved
              by an administrator. Every gig has a clear brief, budget, and
              deadline. Payments are arranged directly between participants.
            </p>
          </div>
          <button
            onClick={() =>
              setPage(
                currentUser
                  ? currentUser.role === "ADMIN"
                    ? "admin"
                    : "dashboard"
                  : "login",
              )
            }
            className="whitespace-nowrap bg-blue-700 text-white px-5 py-3 rounded-xl text-sm font-bold"
          >
            {currentUser ? "Open your workspace" : "Join your campus"} →
          </button>
        </div>
      </section>
      <footer className="border-t border-slate-200 max-w-6xl mx-auto px-5 py-7 flex justify-between gap-5 text-xs text-slate-400">
        <span className="font-bold text-slate-700">
          GigGrad
          <span className="font-normal text-slate-400 ml-3">
            Small gigs. Real growth.
          </span>
        </span>
        <span>Made for the campus community.</span>
      </footer>
    </div>
  );
}
