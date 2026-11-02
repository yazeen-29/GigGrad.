const router = require("express").Router();
const prisma = require("../lib/prisma");
const requireAuth = require("../middleware/auth");
const { text, fail } = require("../lib/validation");
const { scholarships } = require("../data/scholarships");
const { validateProfile, assess } = require("../lib/scholarships");
const statuses = ["SAVED", "PREPARING", "APPLIED", "AWARDED", "NOT_SELECTED"];
function find(id) {
  const item = scholarships.find((scholarship) => scholarship.id === id);
  if (!item) fail("Scholarship not found", 404);
  return item;
}
router.get("/", (req, res) =>
  res.json({
    scholarships,
    scope: "India · curated official sources",
    note: "Preliminary screening only. Current opening dates, full eligibility and selection are confirmed by the scheme authority.",
  }),
);
router.post("/eligibility", (req, res) => {
  const profile = validateProfile(req.body.profile);
  res.json({
    results: scholarships.map((item) => assess(item, profile)),
    notice:
      "Your answers are evaluated for this request and are not stored. A potential match is not an award or final eligibility decision.",
  });
});
router.get("/tracking", requireAuth, async (req, res) =>
  res.json(
    await prisma.scholarshipTracking.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: "desc" },
      take: 200,
    }),
  ),
);
router.put("/tracking/:scholarshipId", requireAuth, async (req, res) => {
  const scholarship = find(req.params.scholarshipId),
    data = {};
  if (req.body.status !== undefined) {
    if (!statuses.includes(req.body.status)) fail("Invalid tracking status");
    data.status = req.body.status;
  }
  if (req.body.notes !== undefined)
    data.notes = text(req.body.notes, "Notes", 0, 1000);
  if (req.body.remindOn !== undefined) {
    if (req.body.remindOn === null || req.body.remindOn === "")
      data.remindOn = null;
    else {
      if (
        typeof req.body.remindOn !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(req.body.remindOn)
      )
        fail("Use a valid reminder date");
      const date = new Date(req.body.remindOn + "T12:00:00.000Z");
      if (
        !Number.isFinite(date.getTime()) ||
        date.toISOString().slice(0, 10) !== req.body.remindOn
      )
        fail("Invalid reminder date");
      data.remindOn = date;
    }
  }
  if (req.body.documents !== undefined) {
    if (
      !Array.isArray(req.body.documents) ||
      req.body.documents.length > scholarship.documents.length ||
      req.body.documents.some(
        (document) => !scholarship.documents.includes(document),
      )
    )
      fail("Invalid document checklist");
    data.documents = [...new Set(req.body.documents)];
  }
  res.json(
    await prisma.scholarshipTracking.upsert({
      where: {
        userId_scholarshipId: {
          userId: req.user.id,
          scholarshipId: scholarship.id,
        },
      },
      update: data,
      create: { userId: req.user.id, scholarshipId: scholarship.id, ...data },
    }),
  );
});
router.delete("/tracking/:scholarshipId", requireAuth, async (req, res) => {
  await prisma.scholarshipTracking.deleteMany({
    where: { userId: req.user.id, scholarshipId: req.params.scholarshipId },
  });
  res.json({ success: true });
});
module.exports = router;
