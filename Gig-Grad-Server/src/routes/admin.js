const router = require("express").Router();
const prisma = require("../lib/prisma");
const requireAuth = require("../middleware/auth");
const { fail } = require("../lib/validation");
router.use(requireAuth, (req, res, next) => {
  if (req.user.role !== "ADMIN") fail("Administrator access required", 403);
  next();
});
router.get("/overview", async (req, res) => {
  const [
    pendingStudentRequests,
    openDisputes,
    activeProjects,
    totalUsers,
    recentResolved,
  ] = await prisma.$transaction([
    prisma.user.count({ where: { role: "STUDENT", posterStatus: "pending" } }),
    prisma.dispute.count({ where: { status: "OPEN" } }),
    prisma.job.count({
      where: {
        status: { in: ["IN_PROGRESS", "PENDING_APPROVAL", "DISPUTED"] },
      },
    }),
    prisma.user.count(),
    prisma.dispute.findMany({
      where: { status: "RESOLVED" },
      select: {
        id: true,
        adminNote: true,
        resolvedAt: true,
        job: { select: { id: true, title: true, status: true } },
        resolvedBy: { select: { id: true, name: true } },
      },
      orderBy: { resolvedAt: "desc" },
      take: 8,
    }),
  ]);
  const since = new Date(Date.now() - 7 * 86400000);
  const [applications, hires, completed, unresolvedDisputes] =
    await prisma.$transaction([
      prisma.application.count({ where: { appliedAt: { gte: since } } }),
      prisma.job.count({ where: { hiredAt: { gte: since } } }),
      prisma.job.count({
        where: { status: "COMPLETED", updatedAt: { gte: since } },
      }),
      prisma.dispute.count({ where: { status: "OPEN" } }),
    ]);
  const first =
    await prisma.$queryRaw`SELECT AVG(EXTRACT(EPOCH FROM (a.first - j."createdAt")))/3600 AS hours FROM "Job" j JOIN (SELECT "jobId",MIN("appliedAt") AS first FROM "Application" GROUP BY "jobId") a ON a."jobId"=j.id WHERE a.first>=${since}`;
  res.json({
    pilot: {
      applications,
      hires,
      completed,
      unresolvedDisputes,
      averageHoursToFirstApplication:
        first[0]?.hours == null ? null : Number(first[0].hours),
    },
    stats: { pendingStudentRequests, openDisputes, activeProjects, totalUsers },
    recentResolved,
  });
});
module.exports = router;
