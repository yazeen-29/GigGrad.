const notify = require("../lib/notifications");
const paging = require("../lib/paging");
const router = require("express").Router();
const prisma = require("../lib/prisma");
const requireAuth = require("../middleware/auth");
const { text, fail, canPost, transition } = require("../lib/validation");
const person = {
  select: { id: true, name: true, role: true, rating: true, college: true },
};
const include = {
  postedBy: person,
  assignedTo: person,
  _count: { select: { applications: true } },
};
router.get("/", async (req, res) => {
  const { category, search, sort } = req.query;
  const page = Math.max(
    1,
    Math.min(10000, Number.parseInt(req.query.page) || 1),
  );
  const limit = Math.max(
    1,
    Math.min(60, Number.parseInt(req.query.limit) || 24),
  );
  const where = { status: "OPEN", deadline: { gt: new Date() } };
  if (category && category !== "All")
    where.category = text(category, "Category", 1, 80);
  if (search) {
    const query = text(search, "Search", 1, 100);
    where.OR = ["title", "description"].map((key) => ({
      [key]: { contains: query, mode: "insensitive" },
    }));
  }
  const order =
    sort === "amount-high"
      ? { amount: "desc" }
      : sort === "amount-low"
        ? { amount: "asc" }
        : sort === "deadline"
          ? { deadline: "asc" }
          : { createdAt: "desc" };
  const [jobs, total] = await prisma.$transaction([
    prisma.job.findMany({
      where,
      include,
      orderBy: [order, { id: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.job.count({ where }),
  ]);
  res.set({
    "X-Total-Count": String(total),
    "Access-Control-Expose-Headers": "X-Total-Count",
  });
  res.json({ jobs, total, page, pages: Math.ceil(total / limit) });
});
router.get("/my", requireAuth, async (req, res) =>
  res.json(
    await prisma.job.findMany({
      where: { postedById: req.user.id },
      include,
      orderBy: { createdAt: "desc" },
      ...paging(req),
    }),
  ),
);
router.get("/recommended", requireAuth, async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1),
    limit = 24;
  const skills = req.user.skills.map((s) => s.trim().toLowerCase());
  const jobs =
    await prisma.$queryRaw`SELECT j.*, COALESCE((SELECT count(*)::float / NULLIF(cardinality(j."requiredSkills"),0) FROM unnest(j."requiredSkills") skill WHERE lower(skill)=ANY(${skills}::text[])),0) AS "matchScore" FROM "Job" j WHERE j.status='OPEN' AND j.deadline>NOW() AND j."postedById"<>${req.user.id} AND NOT EXISTS(SELECT 1 FROM "Application" a WHERE a."jobId"=j.id AND a."applicantId"=${req.user.id}) ORDER BY "matchScore" DESC,j."createdAt" DESC,j.id ASC LIMIT ${limit + 1} OFFSET ${(page - 1) * limit}`;
  res.json({
    jobs: jobs.slice(0, limit).map((j) => ({
      ...j,
      matchScore: undefined,
      matchedSkills: j.requiredSkills.filter((s) =>
        skills.includes(s.toLowerCase()),
      ),
    })),
    page,
    hasMore: jobs.length > limit,
  });
});
router.get("/:id/membership", requireAuth, async (req, res) => {
  const [application, review] = await prisma.$transaction([
    prisma.application.findUnique({
      where: {
        jobId_applicantId: { jobId: req.params.id, applicantId: req.user.id },
      },
      select: { id: true, status: true },
    }),
    prisma.review.findUnique({
      where: {
        jobId_reviewerId: { jobId: req.params.id, reviewerId: req.user.id },
      },
      select: { id: true, rating: true },
    }),
  ]);
  res.json({ application, review });
});
router.get("/:id", async (req, res) => {
  const job = await prisma.job.findUnique({
    where: { id: req.params.id },
    include,
  });
  if (!job) fail("Job not found", 404);
  res.json(job);
});
router.post("/", requireAuth, async (req, res) => {
  if (!canPost(req.user)) fail("Approved posting access required", 403);
  const requiredSkills = req.body.requiredSkills || [];
  if (!Array.isArray(requiredSkills) || requiredSkills.length > 10)
    fail("Choose up to 10 required skills");
  const normalizedSkills = [
    ...new Set(
      requiredSkills.map((s) => text(s, "Required skill", 1, 50).toLowerCase()),
    ),
  ];
  const title = text(req.body.title, "Title", 5, 140);
  const description = text(req.body.description, "Description", 20, 5000);
  const category = text(req.body.category, "Category", 2, 80);
  if (
    ![
      "Document Formatting",
      "Data Entry",
      "Design",
      "Lab Help",
      "Video Editing",
      "Coding",
      "Delivery",
    ].includes(category)
  )
    fail("Invalid category");
  const amount = Number(req.body.amount);
  if (
    !Number.isFinite(amount) ||
    amount < 50 ||
    amount > 10000 ||
    Math.round(amount * 100) !== amount * 100
  )
    fail("Budget must be ₹50–₹10,000 with at most two decimal places");
  const deadline = new Date(req.body.deadline);
  if (!Number.isFinite(deadline.getTime()) || deadline <= new Date())
    fail("Choose a future deadline");
  if (req.body.urgent !== undefined && typeof req.body.urgent !== "boolean")
    fail("Urgent must be a boolean");
  res.status(201).json(
    await prisma.job.create({
      data: {
        title,
        requiredSkills: normalizedSkills,
        description,
        category,
        amount,
        deadline,
        urgent: req.body.urgent || false,
        postedById: req.user.id,
      },
    }),
  );
});
async function change(req, res, status) {
  const job = await prisma.$transaction(async (tx) => {
    const existing = await tx.job.findUnique({ where: { id: req.params.id } });
    if (!existing) fail("Job not found", 404);
    if (!transition(existing, req.user.id, status))
      fail("This status change is not allowed", 403);
    const updated = await tx.job.update({
      where: { id: existing.id, status: existing.status },
      data: { status },
      include,
    });
    if (status === "CANCELLED")
      await tx.application.updateMany({
        where: { jobId: existing.id, status: "PENDING" },
        data: { status: "REJECTED" },
      });
    await notify(
      tx,
      [existing.postedById, existing.assignedToId].filter(
        (id) => id !== req.user.id,
      ),
      `Project update: ${status.toLowerCase().replaceAll("_", " ")}`,
      existing.id,
    );
    return updated;
  });
  res.json(job);
}
router.patch("/:id/status", requireAuth, (req, res) =>
  change(req, res, req.body.status),
);
router.delete("/:id", requireAuth, (req, res) => change(req, res, "CANCELLED"));
module.exports = router;
