const router      = require("express").Router();
const prisma      = require("../lib/prisma");
const requireAuth = require("../middleware/auth");

router.get("/:id", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where:  { id: req.params.id },
      select: { id: true, name: true, role: true, college: true, rating: true, bio: true, createdAt: true,
        _count: { select: { jobsWorked: true, reviewsReceived: true } } }
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to load profile" });
  }
});

router.patch("/me", requireAuth, async (req, res) => {
  try {
    const { name, bio, college } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data:  {
        ...(name    ? { name }    : {}),
        ...(bio     ? { bio }     : {}),
        ...(college ? { college } : {}),
      },
      select: { id: true, name: true, email: true, role: true, college: true, rating: true, bio: true }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

router.post("/review", requireAuth, async (req, res) => {
  try {
    const { jobId, revieweeId, rating, comment } = req.body;
    if (!jobId || !revieweeId || !rating) return res.status(400).json({ error: "jobId, revieweeId and rating required" });
    if (rating < 1 || rating > 5) return res.status(400).json({ error: "Rating must be 1-5" });
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.status !== "COMPLETED") return res.status(400).json({ error: "Can only review completed jobs" });
    const review = await prisma.review.create({
      data: { jobId, reviewerId: req.user.id, revieweeId, rating: parseInt(rating), comment: comment || "" }
    });
    const allReviews = await prisma.review.findMany({ where: { revieweeId }, select: { rating: true } });
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await prisma.user.update({ where: { id: revieweeId }, data: { rating: Math.round(avg * 10) / 10 } });
    res.status(201).json(review);
  } catch (err) {
    if (err.code === "P2002") return res.status(400).json({ error: "Already reviewed" });
    res.status(500).json({ error: "Failed to submit review" });
  }
});

module.exports = router;
