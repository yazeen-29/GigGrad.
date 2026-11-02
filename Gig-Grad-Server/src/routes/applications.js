const router = require("express").Router();
const prisma = require("../lib/prisma");
const requireAuth = require("../middleware/auth");
const { text, fail } = require("../lib/validation");
router.use(requireAuth);
router.post("/", async (req, res) => {
  const jobId = text(req.body.jobId, "Job ID", 1, 100);
  const coverNote = text(req.body.coverNote, "Cover note", 10, 2000);
  if (req.user.role !== "STUDENT")
    fail("Only student accounts can apply for gigs", 403);
  const app = await prisma.$transaction(
    async (tx) => {
      const job = await tx.job.findUnique({ where: { id: jobId } });
      if (!job) fail("Job not found", 404);
      if (job.status !== "OPEN" || job.deadline <= new Date())
        fail("Applications are closed", 409);
      if (job.postedById === req.user.id) fail("Cannot apply to your own job");
      return tx.application.create({
        data: { jobId, coverNote, applicantId: req.user.id },
      });
    },
    { isolationLevel: "Serializable" },
  );
  res.status(201).json(app);
});
router.get("/mine", async (req, res) =>
  res.json(
    await prisma.application.findMany({
      where: { applicantId: req.user.id },
      include: {
        job: {
          include: {
            postedBy: { select: { id: true, name: true, role: true } },
          },
        },
      },
      orderBy: { appliedAt: "desc" },
      take: 200,
    }),
  ),
);
router.get("/job/:jobId", async (req, res) => {
  const job = await prisma.job.findUnique({ where: { id: req.params.jobId } });
  if (!job) fail("Job not found", 404);
  if (job.postedById !== req.user.id) fail("Not your job", 403);
  res.json(
    await prisma.application.findMany({
      where: { jobId: job.id },
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            rating: true,
            bio: true,
            skills: true,
          },
        },
      },
      orderBy: { appliedAt: "desc" },
      take: 200,
    }),
  );
});
router.patch("/:id/:action", async (req, res) => {
  if (!["accept", "reject"].includes(req.params.action))
    fail("Unknown action", 404);
  await prisma.$transaction(async (tx) => {
    const app = await tx.application.findUnique({
      where: { id: req.params.id },
      include: { job: true },
    });
    if (!app) fail("Application not found", 404);
    if (app.job.postedById !== req.user.id) fail("Not your job", 403);
    if (app.status !== "PENDING" || app.job.status !== "OPEN")
      fail("Application is no longer pending on an open job", 409);
    if (req.params.action === "accept") {
      // Conditional update serializes competing hires on the same job.
      const claimed = await tx.job.updateMany({
        where: { id: app.jobId, status: "OPEN", assignedToId: null },
        data: { status: "IN_PROGRESS", assignedToId: app.applicantId },
      });
      if (claimed.count !== 1)
        fail("Another applicant has already been hired", 409);
      await tx.application.updateMany({
        where: { jobId: app.jobId, id: { not: app.id }, status: "PENDING" },
        data: { status: "REJECTED" },
      });
    }
    await tx.application.update({
      where: { id: app.id, status: "PENDING" },
      data: {
        status: req.params.action === "accept" ? "ACCEPTED" : "REJECTED",
      },
    });
  });
  res.json({ message: "Application updated" });
});
module.exports = router;
