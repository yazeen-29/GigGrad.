import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
const accounts = [
  {
    key: "student",
    name: "Aarav Menon",
    role: "Student",
    icon: GraduationCap,
    intro: "Discover gigs, show your skills, and build your portfolio.",
    steps: [
      "Open your profile to see skills, completed work and a five-star review.",
      "Track a pending application, active project and submitted work in your workspace.",
      "Open Messages to chat with Pixel Campus Club.",
    ],
  },
  {
    key: "teacher",
    name: "Dr Meera Nair",
    role: "Faculty poster",
    icon: BookOpen,
    intro:
      "Post academic tasks directly, without an access request, and find the right student collaborator.",
    steps: [
      "Review the pending applicant on the research handbook gig.",
      "Approve the submitted caption project or request revisions.",
      "Post a new gig, inspect student profiles, and review completed work.",
    ],
  },
  {
    key: "club",
    name: "Pixel Campus Club",
    role: "Student + approved club poster",
    icon: Users,
    intro: "See how one student account can both post and work.",
    steps: [
      "Review your open design gig and active workshop project.",
      "Switch between My postings and My applications in the workspace.",
      "Chat with Aarav about the workshop signup page.",
    ],
  },
  {
    key: "staff",
    name: "Campus Events Team",
    role: "Staff poster",
    icon: Sparkles,
    intro: "Post campus operations tasks directly and coordinate event help.",
    steps: [
      "See the open showcase registration gig.",
      "Inspect the disputed video project and its frozen work status.",
      "Create a campus operations gig with a budget and deadline.",
    ],
  },
  {
    key: "admin",
    name: "Demo Administrator",
    role: "Administrator",
    icon: ShieldCheck,
    intro: "Review posting requests and resolve a disputed brief.",
    steps: [
      "Open Admin to review Nova Robotics Club’s access request.",
      "Resolve the example scope dispute by completing or cancelling the job.",
      "Private project conversations remain accessible only to their participants.",
    ],
  },
  {
    key: "pending-club",
    name: "Nova Robotics Club",
    role: "Posting request pending",
    icon: Users,
    intro: "Follow a new club from requesting access to its first posting.",
    steps: [
      "Open Post a gig to see the pending review state.",
      "Sign in as the administrator and approve this request.",
      "Sign back in as Nova and publish a gig with the newly granted access.",
    ],
  },
];
export default function DemoPage() {
  const navigate = useNavigate();
  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <span className="eyebrow">THE GIGGRAD WALKTHROUGH</span>
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mt-4">
        One campus.{" "}
        <span className="font-editorial text-blue-700">Every perspective.</span>
      </h1>
      <p className="text-slate-500 max-w-2xl mt-5 leading-relaxed">
        Explore the app through six demonstration accounts. Every scenario uses
        the real API and database. Changes you make are saved.
      </p>
      <div className="mt-7 p-5 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
        <strong>Local demonstration workspace.</strong> Passwords are in the
        private <code>DEMO_ACCOUNTS.local.md</code> file shared with you. These
        buttons prefill the email; sign-in still requires the password.
        Demonstration jobs are labeled [DEMO].
      </div>
      <div className="grid md:grid-cols-2 gap-6 mt-9">
        {accounts.map(({ key, name, role, icon: Icon, intro, steps }) => (
          <article
            key={key}
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7"
          >
            <div className="flex items-center justify-between">
              <span className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Icon size={24} />
              </span>
              <span className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-full">
                {role}
              </span>
            </div>
            <h2 className="text-2xl font-bold mt-5">{name}</h2>
            <p className="text-sm text-slate-500 mt-2">{intro}</p>
            <ol className="list-decimal pl-5 mt-5 space-y-3 text-sm text-slate-600">
              {steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <button
              onClick={() =>
                navigate(key === "admin" ? "/admin-login" : "/login", {
                  state: {
                    email: `${key}@demo.giggrad.invalid`,
                    returnTo: "/dashboard",
                  },
                })
              }
              className="mt-7 inline-flex items-center gap-2 text-blue-700 font-bold text-sm"
            >
              Sign in as {role.toLowerCase()} <ArrowRight size={16} />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
