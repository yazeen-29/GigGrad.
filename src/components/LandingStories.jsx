import { useState } from "react";
import Reveal from "./Reveal";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  MessageCircle,
  Palette,
  Sparkles,
  Star,
} from "lucide-react";
const journeys = {
  student: [
    {
      n: "01",
      title: "Spot your kind of opportunity.",
      text: "Filter by what you enjoy, compare clear budgets, and save the gigs that fit around your week.",
    },
    {
      n: "02",
      title: "Make a thoughtful introduction.",
      text: "Show your skills, send a cover note, and let your profile tell the rest of your story.",
    },
    {
      n: "03",
      title: "Make something you’re proud of.",
      text: "Once hired, agree on the details in project chat. Deliver, get feedback, and add completed work to your portfolio.",
    },
  ],
  poster: [
    {
      n: "01",
      title: "Put a clear brief into the world.",
      text: "Faculty and staff post directly. Students first request posting access. Describe the outcome, set a fair budget, and choose a realistic deadline.",
    },
    {
      n: "02",
      title: "Find the person behind the application.",
      text: "Read profiles, compare introductions, and hire one student who is a good fit for the project.",
    },
    {
      n: "03",
      title: "Bring good work across the finish line.",
      text: "Collaborate in chat, review the result, request revisions if needed, and leave a review after completion.",
    },
  ],
};
export default function LandingStories({ setPage }) {
  const [perspective, setPerspective] = useState("student");
  return (
    <>
      <div
        className="skill-ribbon"
        aria-label="Design, code, write, edit, organize, learn, earn"
      >
        <div className="skill-ribbon-track">
          {[0, 1].map((copy) => (
            <div
              aria-hidden={copy === 1}
              key={copy}
              className="skill-ribbon-group"
            >
              {[
                "Design a little.",
                "Code something.",
                "Make it clearer.",
                "Learn by doing.",
                "Earn your way.",
              ].map((text, index) => (
                <span key={text} className={index % 2 ? "font-editorial" : ""}>
                  {text}
                  <Sparkles size={21} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-20">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <span className="eyebrow">YOUR NEXT CHAPTER, IN THREE STEPS</span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-4">
                A small start.
                <br />
                <span className="font-editorial text-blue-700">
                  A whole lot of possibility.
                </span>
              </h2>
            </div>
            <div
              className="inline-flex rounded-full bg-slate-100 p-1 self-start"
              aria-label="Choose your perspective"
            >
              {[
                ["student", "I want to earn"],
                ["poster", "I need a hand"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  aria-pressed={perspective === key}
                  onClick={() => setPerspective(key)}
                  className={`px-5 py-3 text-sm rounded-full font-bold transition-all ${perspective === key ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </Reveal>
        <div
          key={perspective}
          className="grid md:grid-cols-3 gap-6 mt-10 journey-enter"
        >
          {journeys[perspective].map(({ n, title, text }) => (
            <article key={n} className="border-t border-slate-200 pt-6">
              <span className="font-mono text-sm text-blue-500">/{n}</span>
              <h3 className="font-bold text-xl mt-5">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mt-4">
                {text}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section className="bg-[#edf3ff] overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-20 grid lg:grid-cols-2 items-center gap-14">
          <Reveal>
            <span className="eyebrow">A PORTFOLIO STARTS WITH A YES</span>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mt-5">
              Turn “just a student”
              <br />
              into{" "}
              <span className="font-editorial text-blue-700">
                “I made that.”
              </span>
            </h2>
            <p className="text-slate-500 mt-6 max-w-md leading-relaxed">
              The little projects count. So do the people you meet, the
              questions you ask, and the confidence you build along the way.
            </p>
            <button
              onClick={() => setPage("jobs")}
              className="mt-7 text-blue-700 font-bold inline-flex items-center gap-3"
            >
              Find a project worth starting <ArrowRight size={18} />
            </button>
          </Reveal>
          <Reveal delay={150}>
            <div className="portfolio-collage relative py-8">
              <article className="relative z-10 bg-white border border-blue-100 rounded-3xl p-7 shadow-xl shadow-blue-900/5 -rotate-3">
                <div className="flex items-center justify-between">
                  <span className="bg-violet-50 text-violet-600 rounded-xl p-3">
                    <Palette size={25} />
                  </span>
                  <span className="text-xs text-slate-400">
                    A glimpse of what’s possible
                  </span>
                </div>
                <div className="example-poster mt-6 rounded-2xl p-7 text-white">
                  <span className="text-xs tracking-widest uppercase">
                    Campus creative brief
                  </span>
                  <p className="font-editorial text-4xl mt-5 leading-tight">
                    Make room
                    <br />
                    for your ideas.
                  </p>
                  <div className="flex gap-2 mt-6">
                    {["DESIGN", "BUILD", "BELONG"].map((label) => (
                      <span
                        key={label}
                        className="text-[10px] border border-white/40 rounded-full px-2 py-1"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-5">
                  <CheckCircle size={19} className="text-emerald-600" />
                  <p className="text-sm font-semibold">
                    Good work becomes part of your story.
                  </p>
                </div>
              </article>
              <div className="collage-note absolute -right-1 -bottom-2 z-20 rounded-2xl bg-amber-100 text-amber-900 px-6 py-4 rotate-3 shadow-sm">
                <span className="font-editorial text-2xl">
                  Small gig. Big feeling.
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-20">
        <Reveal>
          <span className="eyebrow">BUILT FOR THE WAY CAMPUS WORKS</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-4">
            Less chasing. <span className="font-editorial">More creating.</span>
          </h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-5 mt-9">
          {[
            {
              icon: MessageCircle,
              title: "One project. One conversation.",
              text: "Keep the brief, the questions, and the delivery links in a private chat with your collaborator.",
            },
            {
              icon: Clock,
              title: "Know where things stand.",
              text: "Follow applications, active work, revisions, and approvals from a workspace that keeps it clear.",
            },
            {
              icon: Star,
              title: "Let good work travel with you.",
              text: "Completed projects and reviews live on your profile, so your next introduction has more behind it.",
            },
          ].map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 90}>
              <article className="h-full bg-white border border-slate-200 rounded-3xl p-7 feature-lift">
                <Icon className="text-blue-600" size={27} />
                <h3 className="font-bold text-xl mt-6">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mt-4">
                  {text}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-5 sm:px-6 pb-16">
        <Reveal>
          <div className="grid md:grid-cols-[.8fr_1.2fr] gap-8 border-t border-slate-200 pt-12">
            <div>
              <span className="eyebrow">THE LITTLE THINGS, ANSWERED</span>
              <h2 className="text-3xl font-bold mt-4">
                Before you
                <br />
                <span className="font-editorial text-blue-700">jump in.</span>
              </h2>
            </div>
            <div>
              {[
                [
                  "Who can post a gig?",
                  "Faculty and staff can post directly. Students and student-led organizations need administrator approval to publish gigs. Students can apply without posting approval.",
                ],
                [
                  "Can I both earn and post?",
                  "Yes. A student with approved posting access can apply to other people’s gigs and publish their own. You cannot apply to your own gig.",
                ],
                [
                  "How do payments work?",
                  "Agree on payment directly with your collaborator. GigGrad currently tracks the work and the agreed budget; it does not collect or hold money.",
                ],
                [
                  "What happens if something goes wrong?",
                  "Participants can raise a dispute on active work. The project is frozen for administrator review until the dispute is resolved.",
                ],
              ].map(([question, answer]) => (
                <details
                  key={question}
                  className="faq-item border-b border-slate-200 py-5"
                >
                  <summary className="font-bold cursor-pointer pr-5">
                    {question}
                  </summary>
                  <p className="text-sm text-slate-500 leading-relaxed mt-4">
                    {answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
      {import.meta.env.DEV && (
        <section className="max-w-6xl mx-auto px-5 sm:px-6 pb-12">
          <button
            onClick={() => setPage("demo")}
            className="flex flex-wrap items-center justify-between gap-4 w-full text-left bg-slate-900 text-white p-7 rounded-3xl"
          >
            <span>
              <span className="eyebrow text-blue-300">
                EXPLORE THE LOCAL DEMO
              </span>
              <span className="block text-xl font-bold mt-2">
                Meet the student, teacher, club, staff, and admin.
              </span>
            </span>
            <span className="flex items-center gap-2 text-sm font-bold">
              Try every perspective <ArrowRight size={18} />
            </span>
          </button>
        </section>
      )}
    </>
  );
}
