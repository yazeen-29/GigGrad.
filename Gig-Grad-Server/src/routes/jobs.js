const router      = require("express").Router();
const prisma      = require("../lib/prisma");
const requireAuth = require("../middleware/auth");

router.get("/", async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    const jobs = await prisma.job.findMany({
      where: {
        status: "OPEN",
        ...(category && category !== "All" ? { category } : {}),
        ...(search ? { OR: [
          { title:       { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ]} : {})
      },
      include: {
        postedBy: { select: { id: true, name: true, role: true, rating: true } },
        _count:   { select: { applications: true } }
      },
      orderBy:
        sort === "amount-high" ? { amount: "desc" } :
        sort === "amount-low"  ? { amount: "asc"  } :
        { createdAt: "desc" }
    });
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load jobs" });
  }
});

router.get("/my", requireAuth, async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where:   { postedById: req.user.id },
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: "desc" }
    });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: "Failed to load your jobs" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where:   { id: req.params.id },
      include: {
        postedBy:   { select: { id: true, name: true, role: true, rating: true } },
        assignedTo: { select: { id: true, name: true, role: true, rating: true } },
        _count:     { select: { applications: true } }
      }
    });
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: "Failed to load job" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, description, category, amount, deadline, urgent } = req.body;
    if (!title || !description || !category || !amount || !deadline)
      return res.status(400).json({ error: "All fields required" });
    const job = await prisma.job.create({
      data: {
        title, description, category,
        amount:     parseFloat(amount),
        deadline:   new Date(deadline),
        urgent:     Boolean(urgent),
        postedById: req.user.id,
      }
    });
    res.status(201).json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create job" });
  }
});

router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["OPEN","IN_PROGRESS","PENDING_APPROVAL","COMPLETED","DISPUTED","CANCELLED"];
    if (!valid.includes(status))
      return res.status(400).json({ error: "Invalid status" });
    const existing = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Job not found" });
    const isAllowed = existing.postedById === req.user.id || existing.assignedToId === req.user.id;
    if (!isAllowed) return res.status(403).json({ error: "Not authorized" });
    const job = await prisma.job.update({
      where: { id: req.params.id },
      data:  { status }
    });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) return res.status(404).json({ error: "Job not found" });
    if (job.postedById !== req.user.id) return res.status(403).json({ error: "Not your job" });
    if (job.status === "COMPLETED") return res.status(400).json({ error: "Cannot cancel completed job" });
    await prisma.job.update({ where: { id: req.params.id }, data: { status: "CANCELLED" } });
    res.json({ message: "Job cancelled" });
  } catch (err) {
    res.status(500).json({ error: "Failed to cancel job" });
  }
});

module.exports = router;
