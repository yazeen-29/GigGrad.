const router = require("express").Router();
const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");
const { fail } = require("../lib/validation");
const paths = require("../data/learning.json");
router.use(auth);
router.get("/saved", async (req, res) =>
  res.json(
    await prisma.savedGig.findMany({
      where: { userId: req.user.id },
      include: { job: true },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
  ),
);
router.put("/saved/:id", async (req, res) => {
  if (!(await prisma.job.findUnique({ where: { id: req.params.id } })))
    fail("Gig no longer exists", 404);
  await prisma.savedGig.upsert({
    where: { userId_jobId: { userId: req.user.id, jobId: req.params.id } },
    create: { userId: req.user.id, jobId: req.params.id },
    update: {},
  });
  res.json({ saved: true });
});
router.delete("/saved/:id", async (req, res) => {
  await prisma.savedGig.deleteMany({
    where: { userId: req.user.id, jobId: req.params.id },
  });
  res.json({ saved: false });
});
router.post("/saved/import", async (req, res) => {
  if (
    !Array.isArray(req.body.ids) ||
    req.body.ids.length > 500 ||
    req.body.ids.some((id) => typeof id !== "string" || id.length > 100)
  )
    fail("Invalid saved gigs");
  const jobs = await prisma.job.findMany({
    where: { id: { in: req.body.ids } },
    select: { id: true },
  });
  await prisma.savedGig.createMany({
    data: jobs.map((j) => ({ userId: req.user.id, jobId: j.id })),
    skipDuplicates: true,
  });
  res.json({ imported: jobs.length });
});
router.get("/learning", async (req, res) => {
  const rows = await prisma.learningProgress.findMany({
    where: { userId: req.user.id },
  });
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { learningGoal: true },
  });
  const plan = { goal: user.learningGoal };
  for (const row of rows)
    for (const i of row.milestones) plan[`${row.pathId}:${i}`] = true;
  res.json(plan);
});
router.put("/learning/goal", async (req, res) => {
  if (!paths.some((p) => p.id === req.body.goal))
    fail("Choose a learning path");
  await prisma.user.update({
    where: { id: req.user.id },
    data: { learningGoal: req.body.goal },
  });
  res.json({ saved: true });
});
router.put("/learning/:path", async (req, res) => {
  if (
    !paths.some((p) => p.id === req.params.path) ||
    !Array.isArray(req.body.milestones) ||
    req.body.milestones.length > 5 ||
    req.body.milestones.some((i) => !Number.isInteger(i) || i < 0 || i > 4)
  )
    fail("Invalid learning milestones");
  const milestones = [...new Set(req.body.milestones)];
  res.json(
    await prisma.learningProgress.upsert({
      where: {
        userId_pathId: { userId: req.user.id, pathId: req.params.path },
      },
      create: { userId: req.user.id, pathId: req.params.path, milestones },
      update: { milestones },
    }),
  );
});
router.get("/notifications", async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const where = { userId: req.user.id };
  const [items, total, unread] = await prisma.$transaction([
    prisma.notification.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * 25,
      take: 25,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { ...where, isRead: false } }),
  ]);
  res.json({ items, total, unread, page, pages: Math.ceil(total / 25) });
});
router.post("/notifications/read", async (req, res) => {
  if (req.body.id !== undefined && typeof req.body.id !== "string")
    fail("Invalid notification");
  await prisma.notification.updateMany({
    where: { userId: req.user.id, ...(req.body.id ? { id: req.body.id } : {}) },
    data: { isRead: true },
  });
  res.json({ read: true });
});
module.exports = router;
