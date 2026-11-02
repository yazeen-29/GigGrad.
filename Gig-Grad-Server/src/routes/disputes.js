const router = require("express").Router();
const prisma = require("../lib/prisma");
const requireAuth = require("../middleware/auth");
const { fail, text } = require("../lib/validation");
router.post("/", requireAuth, async (req, res) => {
  const jobId = text(req.body.jobId, "Job ID", 1, 100),
    reason = text(req.body.reason, "Reason", 10, 2000);
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) fail("Job not found", 404);
  if (!["IN_PROGRESS", "PENDING_APPROVAL"].includes(job.status))
    fail("Only active work can be disputed", 409);
  if (job.postedById !== req.user.id && job.assignedToId !== req.user.id)
    fail("Not authorized", 403);
  const [dispute] = await prisma.$transaction([
    prisma.dispute.create({ data: { jobId, reason, raisedById: req.user.id } }),
    prisma.job.update({
      where: { id: jobId, status: job.status },
      data: { status: "DISPUTED" },
    }),
  ]);
  res.status(201).json(dispute);
});
router.get("/", requireAuth, async (req, res) => {
  if (req.user.role !== "ADMIN") fail("Admin only", 403);
  res.json(
    await prisma.dispute.findMany({
      where: { status: "OPEN" },
      include: {
        job: { select: { id: true, title: true, amount: true } },
        raisedBy: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  );
});
router.patch("/:id/resolve", requireAuth, async (req, res) => {
  if (req.user.role !== "ADMIN") fail("Admin only", 403);
  if (!["COMPLETE", "CANCEL"].includes(req.body.outcome))
    fail("outcome must be COMPLETE or CANCEL");
  const adminNote = text(req.body.adminNote, "Decision note", 10, 2000);
  const dispute = await prisma.dispute.findUnique({
    where: { id: req.params.id },
  });
  if (!dispute) fail("Dispute not found", 404);
  if (dispute.status !== "OPEN") fail("Dispute already resolved", 409);
  const status = req.body.outcome === "COMPLETE" ? "COMPLETED" : "CANCELLED";
  await prisma.$transaction([
    prisma.dispute.update({
      where: { id: dispute.id, status: "OPEN" },
      data: {
        status: "RESOLVED",
        adminNote,
        resolvedById: req.user.id,
        resolvedAt: new Date(),
      },
    }),
    prisma.job.update({
      where: { id: dispute.jobId, status: "DISPUTED" },
      data: { status },
    }),
  ]);
  res.json({ message: `Resolved — job marked ${status}` });
});
module.exports = router;
