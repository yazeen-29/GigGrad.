const router      = require("express").Router();
const prisma      = require("../lib/prisma");
const requireAuth = require("../middleware/auth");

router.post("/", requireAuth, async (req, res) => {
  try {
    const { jobId, coverNote } = req.body;
    if (!jobId) return res.status(400).json({ error: "Job ID required" });
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job)                       return res.status(404).json({ error: "Job not found" });
    if (job.status !== "OPEN")      return res.status(400).json({ error: "Job is not open" });
    if (job.postedById === req.user.id) return res.status(400).json({ error: "Cannot apply to your own job" });
    const app = await prisma.application.create({
      data: { jobId, coverNote: coverNote || "", applicantId: req.user.id }
    });
    res.status(201).json(app);
  } catch (err) {
    if (err.code === "P2002") return res.status(400).json({ error: "Already applied" });
    console.error(err);
    res.status(500).json({ error: "Failed to apply" });
  }
});

router.get("/mine", requireAuth, async (req, res) => {
  try {
    const apps = await prisma.application.findMany({
      where:   { applicantId: req.user.id },
      include: { job: { include: { postedBy: { select: { id: true, name: true, role: true } } } } },
      orderBy: { appliedAt: "desc" }
    });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: "Failed to load applications" });
  }
});

router.get("/job/:jobId", requireAuth, async (req, res) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.jobId } });
    if (!job) return res.status(404).json({ error: "Job not found" });
    if (job.postedById !== req.user.id) return res.status(403).json({ error: "Not your job" });
    const apps = await prisma.application.findMany({
      where:   { jobId: req.params.jobId },
      include: { applicant: { select: { id: true, name: true, rating: true, bio: true } } },
      orderBy: { appliedAt: "desc" }
    });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: "Failed to load applicants" });
  }
});

router.patch("/:id/accept", requireAuth, async (req, res) => {
  try {
    const app = await prisma.application.findUnique({
      where: { id: req.params.id }, include: { job: true }
    });
    if (!app) return res.status(404).json({ error: "Application not found" });
    if (app.job.postedById !== req.user.id) return res.status(403).json({ error: "Not your job" });
    if (app.job.status !== "OPEN") return res.status(400).json({ error: "Job is no longer open" });
    await prisma.$transaction([
      prisma.application.update({ where: { id: req.params.id }, data: { status: "ACCEPTED" } }),
      prisma.application.updateMany({ where: { jobId: app.jobId, id: { not: req.params.id } }, data: { status: "REJECTED" } }),
      prisma.job.update({ where: { id: app.jobId }, data: { status: "IN_PROGRESS", assignedToId: app.applicantId } }),
    ]);
    res.json({ message: "Student hired successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to accept" });
  }
});

module.exports = router;
