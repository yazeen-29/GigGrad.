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
  res.json({
    stats: { pendingStudentRequests, openDisputes, activeProjects, totalUsers },
    recentResolved,
  });
});
module.exports = router;
