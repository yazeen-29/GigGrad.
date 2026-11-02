const router = require("express").Router();
const prisma = require("../lib/prisma");
const { showcase } = require("../lib/profile");
const requireAuth = require("../middleware/auth");
const { text, fail, userSelect } = require("../lib/validation");
router.get("/me/dashboard", requireAuth, async (req, res) => {
  const [jobs, applications] = await prisma.$transaction([
    prisma.job.findMany({
      where: { postedById: req.user.id },
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.application.findMany({
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
  ]);
  res.json({ jobs, applications });
});
async function profile(id, own = false) {
  const publicSelect = {
    id: true,
    name: true,
    role: true,
    college: true,
    rating: true,
    bio: true,
    headline: true,
    portfolioUrl: true,
    resumeUrl: true,
    githubUrl: true,
    linkedinUrl: true,
    achievements: true,
    projects: true,
    skills: true,
    createdAt: true,
    posterType: true,
    posterStatus: true,
  };
  const participant = { OR: [{ assignedToId: id }, { postedById: id }] };
  const [user, completedJobs, postedJobs, feedback, portfolio, reviews] =
    await prisma.$transaction([
      prisma.user.findUnique({
        where: { id },
        select: own ? { ...userSelect, createdAt: true } : publicSelect,
      }),
      prisma.job.count({ where: { ...participant, status: "COMPLETED" } }),
      prisma.job.count({ where: { postedById: id } }),
      prisma.review.aggregate({
        where: { revieweeId: id },
        _avg: { rating: true },
        _count: true,
      }),
      prisma.job.findMany({
        where: { ...participant, status: "COMPLETED" },
        select: {
          id: true,
          title: true,
          category: true,
          updatedAt: true,
          postedById: true,
        },
        take: 12,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.review.findMany({
        where: { revieweeId: id },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          reviewer: { select: { id: true, name: true } },
          job: { select: { id: true, title: true } },
        },
        take: 12,
        orderBy: { createdAt: "desc" },
      }),
    ]);
  if (!user) fail("User not found", 404);
  return {
    ...user,
    user,
    stats: {
      completedJobs,
      postedJobs,
      reviewCount: feedback._count,
      averageRating: feedback._avg.rating || 0,
    },
    portfolio,
    reviews,
  };
}
router.get("/me/profile", requireAuth, async (req, res) =>
  res.json(await profile(req.user.id, true)),
);
router.get("/:id", async (req, res) => res.json(await profile(req.params.id)));
router.patch("/me", requireAuth, async (req, res) => {
  const data = showcase(req.body);
  if (Object.keys(data).length && req.user.role !== "STUDENT")
    fail("Student showcase fields are available to student accounts", 403);
  for (const [key, min, max] of [
    ["name", 2, 100],
    ["bio", 0, 2000],
    ["college", 2, 160],
  ])
    if (req.body[key] !== undefined)
      data[key] = text(req.body[key], key, min, max);
  if (req.body.skills !== undefined) {
    if (!Array.isArray(req.body.skills) || req.body.skills.length > 10)
      fail("Choose up to 10 skills");
    data.skills = [
      ...new Set(req.body.skills.map((s) => text(s, "Skill", 1, 50))),
    ];
  }
  res.json(
    await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: userSelect,
    }),
  );
});
router.post("/review", requireAuth, async (req, res) => {
  const { jobId, revieweeId, rating } = req.body;
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    fail("Rating must be an integer from 1 to 5");
  const comment =
    req.body.comment === undefined
      ? ""
      : text(req.body.comment, "Comment", 0, 2000);
  const review = await prisma.$transaction(
    async (tx) => {
      const job = await tx.job.findUnique({
        where: { id: text(jobId, "Job ID") },
      });
      if (!job || job.status !== "COMPLETED")
        fail("Only completed jobs can be reviewed");
      const counterpart =
        req.user.id === job.postedById
          ? job.assignedToId
          : req.user.id === job.assignedToId
            ? job.postedById
            : null;
      if (!counterpart || counterpart !== revieweeId)
        fail("You may only review the other participant", 403);
      const created = await tx.review.create({
        data: { jobId, reviewerId: req.user.id, revieweeId, rating, comment },
      });
      const average = await tx.review.aggregate({
        where: { revieweeId },
        _avg: { rating: true },
      });
      await tx.user.update({
        where: { id: revieweeId },
        data: { rating: Math.round(average._avg.rating * 10) / 10 },
      });
      return created;
    },
    { isolationLevel: "Serializable" },
  );
  res.status(201).json(review);
});
module.exports = router;
