import { getExperience } from "../utils/experience";
import {
  ArrowRight,
  Briefcase,
  GraduationCap,
  MessageCircle,
  ShieldCheck,
  Users,
} from "lucide-react";
export default function RoleHome({ currentUser, setPage }) {
  const experience = getExperience(currentUser),
    student = experience.isStudent;
  const cards = experience.isAdmin
    ? [
        [
          "Review student posting requests",
          "Faculty and staff post directly. Review only student and student-organization requests.",
          "admin",
          Users,
        ],
        [
          "Resolve project conflicts",
          "Review disputed briefs and record a reasoned decision.",
          "admin",
          ShieldCheck,
        ],
        [
          "Monitor the campus board",
          "See published work across the community.",
          "jobs",
          Briefcase,
        ],
      ]
    : student
      ? [
          [
            "Find a campus gig",
            "Explore work that fits your skills and schedule.",
            "jobs",
            Briefcase,
          ],
          [
            "Support for your studies",
            "Discover scholarship references and organize applications.",
            "scholarships",
            GraduationCap,
          ],
          [
            "Your applications and projects",
            "Keep track of introductions, assignments and delivered work.",
            "dashboard",
            Users,
          ],
        ]
      : [
          [
            "Publish a project brief",
            "Find student support for academic work, campus operations, or events.",
            "post-job",
            Briefcase,
          ],
          [
            "Review your projects",
            "Compare applicants, review delivery, and request revisions.",
            "dashboard",
            Users,
          ],
          [
            "Coordinate with students",
            "Keep decisions and delivery links in project conversations.",
            "messages",
            MessageCircle,
          ],
        ];
  return (
    <div className="max-w-6xl mx-auto px-5 py-14">
      <section className="rounded-3xl bg-white/85 border border-slate-200 p-8 sm:p-12">
        <span className="eyebrow">
          {experience.label} · {currentUser.college}
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mt-5">
          {experience.heading}
        </h1>
        <p className="text-slate-500 mt-5 max-w-2xl">{experience.subtitle}</p>
        <button
          onClick={() => setPage(experience.isAdmin ? "admin" : "dashboard")}
          className="inline-flex items-center gap-3 mt-8 rounded-xl bg-blue-700 text-white px-6 py-3 font-bold text-sm"
        >
          {experience.isAdmin
            ? "Open administration"
            : `Open ${experience.workspace.toLowerCase()}`}
          <ArrowRight size={17} />
        </button>
      </section>
      <div className="grid md:grid-cols-3 gap-5 mt-7">
        {cards.map(([title, text, page, Icon]) => (
          <button
            key={title}
            onClick={() => setPage(page)}
            className="text-left rounded-3xl bg-white border border-slate-200 p-7 hover:border-blue-300 feature-lift"
          >
            <Icon className="text-blue-600" size={27} />
            <h2 className="text-xl font-bold mt-5">{title}</h2>
            <p className="text-sm text-slate-500 mt-3">{text}</p>
          </button>
        ))}
      </div>
      {!student && !experience.isAdmin && (
        <section className="rounded-2xl bg-emerald-50 border border-emerald-100 p-6 mt-7">
          <h2 className="font-bold text-emerald-900">
            A useful reference when mentoring students.
          </h2>
          <p className="text-sm text-emerald-800 mt-2">
            Scholarship guidance stays available as a student-support resource.
          </p>
          <button
            onClick={() => setPage("scholarships")}
            className="text-sm font-bold text-emerald-800 mt-4"
          >
            Student funding resources →
          </button>
        </section>
      )}
    </div>
  );
}
