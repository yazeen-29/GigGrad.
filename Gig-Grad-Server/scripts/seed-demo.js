const fs = require("node:fs");
const path = require("node:path");
const { randomBytes } = require("node:crypto");
require("dotenv").config({
  path: path.join(__dirname, "../.env"),
  quiet: true,
});
const bcrypt = require("bcryptjs");
const prisma = require("../src/lib/prisma");
const root = path.resolve(__dirname, "../..");
const credentialsPath = path.join(root, ".demo-credentials.local.json");
const definitions = [
  {
    key: "student",
    name: "Aarav Menon",
    role: "STUDENT",
    posterStatus: "none",
    bio: "[DEMO] Computer science student who loves thoughtful design and useful little tools.",
    skills: ["UI design", "React", "Document formatting"],
  },
  {
    key: "teacher",
    name: "Dr Meera Nair",
    role: "TEACHER",
    posterStatus: "approved",
    posterType: "faculty",
    bio: "[DEMO] Faculty member looking for clear communication and reliable student collaborators.",
    skills: ["Research", "Academic writing", "Mentoring"],
  },
  {
    key: "club",
    name: "Pixel Campus Club",
    role: "STUDENT",
    posterStatus: "approved",
    posterType: "club",
    bio: "[DEMO] A student-led creative club. We post event gigs and can also take on student work.",
    skills: ["Event design", "Photography", "Branding"],
  },
  {
    key: "staff",
    name: "Campus Events Team",
    role: "TEACHER",
    posterStatus: "approved",
    posterType: "staff",
    bio: "[DEMO] Campus staff coordinating accessible, well-organized events.",
    skills: ["Event operations", "Planning"],
  },
  {
    key: "admin",
    name: "Demo Administrator",
    role: "ADMIN",
    posterStatus: "approved",
    posterType: "staff",
    bio: "[DEMO] Administrator for demonstrating access requests and dispute resolution.",
    skills: ["Moderation", "Campus operations"],
  },
  {
    key: "pending-club",
    name: "Nova Robotics Club",
    role: "STUDENT",
    posterStatus: "pending",
    posterType: "club",
    posterReason:
      "[DEMO] We are a recognized robotics club and want to hire students for event posters and technical documentation.",
    bio: "[DEMO] A new club waiting for administrator review of posting access.",
    skills: ["Robotics", "Technical writing"],
  },
];
async function main() {
  const prior = fs.existsSync(credentialsPath)
    ? JSON.parse(fs.readFileSync(credentialsPath, "utf8"))
    : null;
  const password =
    prior?.password || `GigGrad!${randomBytes(15).toString("base64url")}`;
  const hash = await bcrypt.hash(password, 12);
  const future = (days) => new Date(Date.now() + days * 86400000);
  await prisma.$transaction(
    async (tx) => {
      for (const { key, ...data } of definitions) {
        const id = `giggrad-demo-user-${key}`;
        const email = `${key}@demo.giggrad.invalid`;
        const existing = await tx.user.findUnique({ where: { email } });
        if (existing && existing.id !== id)
          throw new Error(
            `Reserved demo email already belongs to another record: ${email}`,
          );
        if (existing && !prior)
          throw new Error(
            "Demo users exist but the local credential file is missing. Restore the file before rerunning.",
          );
        await tx.user.upsert({
          where: { id },
          update: {},
          create: {
            id,
            email,
            password: hash,
            college: "GigGrad Demo Campus",
            ...data,
          },
        });
      }
      const student = "giggrad-demo-user-student",
        teacher = "giggrad-demo-user-teacher",
        club = "giggrad-demo-user-club",
        staff = "giggrad-demo-user-staff";
      const jobs = [
        {
          key: "open-design",
          title: "[DEMO] Design a poster for the campus arts festival",
          category: "Design",
          postedById: club,
          amount: 650,
          description:
            "Create an A3 event poster and a social media version for our arts festival. Include a clear hierarchy, event details, and an accessible color palette.",
        },
        {
          key: "open-research",
          title: "[DEMO] Format a research workshop handbook",
          category: "Document Formatting",
          postedById: teacher,
          amount: 450,
          description:
            "Format a 15-page workshop handbook with consistent headings, references, page numbers, and a table of contents. An editable source document will be provided.",
        },
        {
          key: "open-staff",
          title: "[DEMO] Help organize the student showcase registration desk",
          category: "Lab Help",
          postedById: staff,
          amount: 500,
          description:
            "Prepare a clear registration checklist, organize participant data, and help the campus team plan the student showcase welcome desk.",
          urgent: true,
        },
        {
          key: "active",
          title: "[DEMO] Build the club workshop signup page",
          category: "Coding",
          postedById: club,
          assignedToId: student,
          status: "IN_PROGRESS",
          amount: 1200,
          description:
            "Build a responsive signup page for a campus workshop with accessible inputs, clear validation, and a friendly confirmation state.",
        },
        {
          key: "approval",
          title: "[DEMO] Edit captions for the faculty lecture series",
          category: "Video Editing",
          postedById: teacher,
          assignedToId: student,
          status: "PENDING_APPROVAL",
          amount: 700,
          description:
            "Edit and proofread captions for a short lecture recording. Work has been submitted and is ready for the faculty poster to approve or request revisions.",
        },
        {
          key: "completed",
          title: "[DEMO] Create an orientation welcome guide",
          category: "Design",
          postedById: teacher,
          assignedToId: student,
          status: "COMPLETED",
          amount: 800,
          description:
            "Create a concise orientation guide with campus resources, contact details, and an accessible layout. This demonstration project has been completed.",
        },
        {
          key: "disputed",
          title: "[DEMO] Review a changed event video brief",
          category: "Video Editing",
          postedById: staff,
          assignedToId: student,
          status: "DISPUTED",
          amount: 900,
          description:
            "An event video brief changed after work started. Both participants need an administrator to review the scope and decide the project outcome.",
        },
      ];
      for (const { key, ...job } of jobs) {
        const id = `giggrad-demo-job-${key}`;
        await tx.job.upsert({
          where: { id },
          update: {},
          create: { id, deadline: future(14), ...job },
        });
        if (job.assignedToId)
          await tx.application.upsert({
            where: { jobId_applicantId: { jobId: id, applicantId: student } },
            update: {},
            create: {
              id: `giggrad-demo-application-${key}`,
              jobId: id,
              applicantId: student,
              status: "ACCEPTED",
              coverNote:
                "[DEMO] I can deliver clear, accessible work and keep you updated as I go.",
            },
          });
      }
      await tx.application.upsert({
        where: {
          jobId_applicantId: {
            jobId: "giggrad-demo-job-open-research",
            applicantId: student,
          },
        },
        update: {},
        create: {
          id: "giggrad-demo-application-pending",
          jobId: "giggrad-demo-job-open-research",
          applicantId: student,
          coverNote:
            "[DEMO] I have experience with academic documents and can deliver a consistent, accessible handbook.",
        },
      });
      await tx.review.upsert({
        where: {
          jobId_reviewerId: {
            jobId: "giggrad-demo-job-completed",
            reviewerId: teacher,
          },
        },
        update: {},
        create: {
          id: "giggrad-demo-review",
          jobId: "giggrad-demo-job-completed",
          reviewerId: teacher,
          revieweeId: student,
          rating: 5,
          comment:
            "[DEMO] Thoughtful design, clear communication, and a polished result. A pleasure to collaborate with.",
        },
      });
      const average = await tx.review.aggregate({
        where: { revieweeId: student },
        _avg: { rating: true },
      });
      await tx.user.update({
        where: { id: student },
        data: { rating: average._avg.rating || 0 },
      });
      for (const [key, senderId, receiverId, content] of [
        [
          "hello",
          club,
          student,
          "[DEMO] Welcome aboard! Let’s keep the workshop signup page simple and accessible.",
        ],
        [
          "reply",
          student,
          club,
          "[DEMO] Sounds good. I’ll share the first draft here so you can review the layout.",
        ],
      ])
        await tx.message.upsert({
          where: { id: `giggrad-demo-message-${key}` },
          update: {},
          create: {
            id: `giggrad-demo-message-${key}`,
            jobId: "giggrad-demo-job-active",
            senderId,
            receiverId,
            content,
          },
        });
      await tx.dispute.upsert({
        where: { jobId: "giggrad-demo-job-disputed" },
        update: {},
        create: {
          id: "giggrad-demo-dispute",
          jobId: "giggrad-demo-job-disputed",
          raisedById: student,
          reason:
            "[DEMO] The requested video scope changed from one short clip to a full event recap after work began. Please review the agreed brief.",
        },
      });
    },
    { timeout: 30000 },
  );
  fs.writeFileSync(
    credentialsPath,
    JSON.stringify(
      {
        password,
        accounts: definitions.map(({ key, name }) => ({
          name,
          email: `${key}@demo.giggrad.invalid`,
        })),
      },
      null,
      2,
    ),
    { mode: 0o600 },
  );
  fs.chmodSync(credentialsPath, 0o600);
  const doc = `# Local demo accounts\n\nThese are demonstration users in the connected database. They are not real campus members. Keep these credentials private and remove the demo accounts before public deployment.\n\nPassword for these demo accounts: \`${password}\`\n\n| Experience | Name | Email |\n| --- | --- | --- |\n${definitions.map(({ key, name }) => `| ${key} | ${name} | ${key}@demo.giggrad.invalid |`).join("\n")}\n\nOpen http://127.0.0.1:5173/demo for the walkthrough. Sign in normally; no demo authentication bypass exists. Re-running the seed preserves profile edits and job progress.\n`;
  fs.writeFileSync(path.join(root, "DEMO_ACCOUNTS.local.md"), doc, {
    mode: 0o600,
  });
  fs.chmodSync(path.join(root, "DEMO_ACCOUNTS.local.md"), 0o600);
  console.log(
    "Created/preserved 6 demo accounts and 7 job scenarios. Credentials saved privately to DEMO_ACCOUNTS.local.md. No existing non-demo records changed.",
  );
}
if (require.main === module)
  main()
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
module.exports = { definitions };
