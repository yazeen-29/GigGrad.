const articles = [
  {
    id: "learning",
    title: "Build skills in Skill Studio",
    keywords: [
      "learn",
      "learning",
      "upskill",
      "course",
      "resource",
      "practice",
      "portfolio",
      "studio",
    ],
    content:
      "Skill Studio at /learn offers beginner paths for Design, Coding, Data Entry, Document Formatting, Video Editing and Writing & Marketing. Each path has an official learning resource, three learning milestones, a practice brief and a portfolio checklist. Recommendations use your profile skills. Choose a goal to personalize your plan. Progress is self-reported, saved on this browser per account, and does not certify ability or guarantee hiring. Finish a sample, add relevant skills to Profile, then explore gigs and write a specific cover note.",
    action: { label: "Open Skill Studio", page: "learn" },
  },
  {
    id: "start",
    title: "Find your way around GigGrad",
    keywords: [
      "hello",
      "hi",
      "help",
      "website",
      "giggrad",
      "start",
      "features",
      "navigate",
    ],
    content:
      "GigGrad connects campus work with student skills. Explore lists open gigs; Workspace tracks applications and postings; Profile shows skills, completed work and feedback; Messages holds hired-project conversations; Scholarships helps discover and organize education support.",
    action: { label: "Explore gigs", page: "jobs" },
  },
  {
    id: "apply",
    title: "Apply for a gig",
    keywords: [
      "apply",
      "application",
      "cover",
      "letter",
      "note",
      "earn",
      "job",
    ],
    content:
      "Sign in as a student, open an unexpired gig in Explore, and send a cover note of at least 10 characters. Mention a relevant skill, a deliverable and when you can finish. You cannot apply to your own gig or apply twice. Track the result in My applications. A useful cover-note template: “I have experience with [skill]. I can deliver [specific outcome] by [date]. I would clarify [question] before starting.”",
    action: { label: "Find a gig", page: "jobs" },
  },
  {
    id: "posting",
    title: "Posting access and roles",
    keywords: [
      "post",
      "poster",
      "teacher",
      "faculty",
      "staff",
      "club",
      "admin",
      "permission",
      "role",
      "access",
    ],
    content:
      "Faculty and staff can post directly without administrator approval. Students and student-led organizations request posting access, and an administrator approves it. An approved student can both publish gigs and apply to other people’s gigs. Admin rights are assigned by an operator, never public signup. Create a gig with a specific brief, ₹50–₹10,000 budget, and a future deadline.",
    action: { label: "Posting access", page: "request-access" },
  },
  {
    id: "hiring",
    title: "Hire, deliver and approve work",
    keywords: [
      "hire",
      "hiring",
      "worker",
      "submit",
      "delivery",
      "deliver",
      "revision",
      "approve",
      "complete",
      "status",
    ],
    content:
      "The poster reviews applicants and hires one worker; other pending applications are rejected. The worker submits work for approval. The poster either completes it or requests revisions. Completed participants can review each other. Open gigs can be cancelled by their poster. Use project chat to agree on details and share delivery links.",
    action: { label: "Open workspace", page: "dashboard" },
  },
  {
    id: "chat",
    title: "Private project conversations",
    keywords: ["chat", "message", "inbox", "conversation", "read", "unread"],
    content:
      "Messages opens when a worker is hired. Only that worker and the poster can read or send messages; administrators have no automatic chat access. History and unread state are saved. The open thread checks for new messages every three seconds. Completed or cancelled projects have read-only conversation history.",
    action: { label: "Open messages", page: "messages" },
  },
  {
    id: "profile",
    title: "Build and edit your profile",
    keywords: [
      "profile",
      "bio",
      "skills",
      "portfolio",
      "review",
      "rating",
      "edit",
      "save",
    ],
    content:
      "Profile opens as an overview. Select Edit profile to change your name, college, introduction and up to 10 skills. Save changes returns to the overview and persists edits. Student profiles also support an optional professional headline, portfolio website, CV link, GitHub and LinkedIn links, up to eight independent projects and up to eight achievements with optional evidence. Add these through Edit profile. Use full HTTPS links and a view-only CV hosted on a service you choose. Showcase details are public and student-provided, not independently verified. Completed GigGrad work and received reviews appear automatically in a separate section. Public profiles do not expose your account email or password.",
    action: { label: "My profile", page: "profile" },
  },
  {
    id: "payment",
    title: "How payment works today",
    keywords: [
      "payment",
      "pay",
      "money",
      "escrow",
      "refund",
      "paid",
      "gateway",
      "fee",
    ],
    content:
      "GigGrad currently records agreed budgets and work status. Participants arrange payment directly. GigGrad does not collect, hold, release or refund funds, and there is no integrated escrow or payment gateway. Confirm the terms with your collaborator before starting.",
    action: { label: "Open workspace", page: "dashboard" },
  },
  {
    id: "dispute",
    title: "Resolve a project problem",
    keywords: [
      "dispute",
      "problem",
      "issue",
      "scam",
      "fraud",
      "cancel",
      "report",
    ],
    content:
      "A poster or assigned worker can raise a dispute on active or submitted work. The project is frozen until an administrator resolves it as completed or cancelled. Resolution changes the work status; it does not transfer money. Keep relevant project details in the project conversation.",
    action: { label: "Open workspace", page: "dashboard" },
  },
  {
    id: "scholarships",
    title: "Find scholarship support",
    keywords: [
      "scholarship",
      "funding",
      "support",
      "education",
      "grant",
      "pragati",
      "saksham",
      "inspire",
      "csss",
    ],
    content:
      "Scholarships contains a small, India-focused catalogue of official schemes. Search by scheme, provider or support category, use Check eligibility for preliminary screening, and save schemes to your private tracker. The catalogue is curated, not a complete live scholarship search engine. Each entry links to official guidance and shows when it was reviewed.",
    action: { label: "Scholarship support", page: "scholarships" },
  },
  {
    id: "eligibility",
    title: "Check criteria without guessing",
    keywords: [
      "eligible",
      "eligibility",
      "income",
      "percentile",
      "disability",
      "qualify",
      "criteria",
      "women",
    ],
    content:
      "Use the eligibility questionnaire in Scholarships. Leave uncertain answers blank. It returns potential match, more details needed, or listed criteria not met, with the reasons for each result. A board percentile is not percentage marks. Some selection routes and renewal rules need official review. Screening does not confirm admission, final eligibility, or an award. Questionnaire answers are not stored or sent to the AI provider.",
    action: { label: "Check scholarship criteria", page: "scholarships" },
  },
  {
    id: "tracking",
    title: "Track applications and prepare documents",
    keywords: [
      "track",
      "tracker",
      "deadline",
      "reminder",
      "document",
      "checklist",
      "applied",
      "award",
      "renewal",
    ],
    content:
      "Save a scholarship, then open My tracker. Record your preparation/application stage, mark document types ready, add a private note and choose a reminder date. Download a calendar reminder if useful. These are your own records: they do not synchronize with NSP or submit an application. Check current deadlines and official application status on the scheme portal. Do not put Aadhaar, banking details, passwords, or document scans in notes or chat.",
    action: { label: "Open scholarship tracker", page: "scholarships" },
  },
  {
    id: "account",
    title: "Account and sign-in help",
    keywords: [
      "login",
      "password",
      "sign",
      "account",
      "reset",
      "verification",
      "email",
    ],
    content:
      "Use your registered email and password; email matching ignores case. New signup requires a college email. Email ownership verification, password-reset delivery and campus/Google SSO are not connected yet. An administrator cannot read your password. Demo accounts use the private local demo guide; the site has no authentication bypass.",
    action: { label: "Sign in", page: "login" },
  },
];
function retrieve(question) {
  const words = question.toLowerCase().match(/[a-z]+/g) || [];
  const ranked = articles
    .map((article) => ({
      article,
      score: article.keywords.reduce(
        (sum, key) =>
          sum +
          (words.some(
            (word) =>
              word === key ||
              (key.length > 4 && word.startsWith(key.slice(0, -1))),
          )
            ? 1
            : 0),
        0,
      ),
    }))
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.score
    ? ranked
        .filter((item) => item.score > 0)
        .slice(0, 3)
        .map((item) => item.article)
    : [articles[0]];
}
module.exports = { articles, retrieve };
