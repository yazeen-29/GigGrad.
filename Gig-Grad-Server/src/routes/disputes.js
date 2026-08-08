const router      = require("express").Router();
const prisma      = require("../lib/prisma");
const requireAuth = require("../middleware/auth");

router.post("/", requireAuth, async (req, res) => {
  try {
    const { jobId, reason } = req.body;
    if (!jobId || !reason) return res.status(400).json({ error: "jobId and reason required" });
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return res.status(404).json({ error: "Job not found" });
    const isInvolved = job.postedById === req.user.id || job.assignedToId === req.user.id;
    if (!isInvolved) return res.status(403).json({ error: "Not authorized" });
    const [dispute] = await prisma.$transaction([
      prisma.dispute.create({ data: { jobId, reason, raisedById: req.user.id } }),
      prisma.job.update({ where: { id: jobId }, data: { status: "DISPUTED" } }),
    ]);
    res.status(201).json(dispute);
  } catch (err) {
    if (err.code === "P2002") return res.status(400).json({ error: "Dispute already exists" });
    res.status(500).json({ error: "Failed to raise dispute" });
  }
});

router.get("/", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Admin only" });
    const disputes = await prisma.dispute.findMany({
      where:   { status: "OPEN" },
      include: {
        job:      { select: { id: true, title: true, amount: true } },
        raisedBy: { select: { id: true, name: true, role: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(disputes);
  } catch (err) {
    res.status(500).json({ error: "Failed to load disputes" });
  }
});

router.patch("/:id/resolve", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Admin only" });
    const { outcome, adminNote } = req.body;
    if (!["COMPLETE","CANCEL"].includes(outcome)) return res.status(400).json({ error: "outcome must be COMPLETE or CANCEL" });
    const dispute = await prisma.dispute.findUnique({ where: { id: req.params.id } });
    if (!dispute) return res.status(404).json({ error: "Dispute not found" });
    const newStatus = outcome === "COMPLETE" ? "COMPLETED" : "CANCELLED";
    await prisma.$transaction([
      prisma.dispute.update({
        where: { id: req.params.id },
        data:  { status: "RESOLVED", adminNote: adminNote || "", resolvedById: req.user.id, resolvedAt: new Date() }
      }),
      prisma.job.update({ where: { id: dispute.jobId }, data: { status: newStatus } }),
    ]);
    res.json({ message: `Resolved — job marked ${newStatus}` });
  } catch (err) {
    res.status(500).json({ error: "Failed to resolve dispute" });
  }
});

module.exports = router;
