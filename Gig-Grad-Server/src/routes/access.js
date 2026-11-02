const paging = require("../lib/paging");
const router = require("express").Router();
const prisma = require("../lib/prisma");
const requireAuth = require("../middleware/auth");
const { text, fail, userSelect } = require("../lib/validation");
router.use(requireAuth);
router.post("/", async (req, res) => {
  if (req.user.role !== "STUDENT")
    fail("Faculty, staff and administrators can already post directly", 409);
  if (["pending", "approved"].includes(req.user.posterStatus))
    fail("Access already requested or approved", 409);
  const posterType = text(req.body.posterType, "Poster type", 2, 40);
  if (!["individual", "club", "council", "org", "startup"].includes(posterType))
    fail("Choose a student posting type");
  const posterReason = text(req.body.reason, "Reason", 20, 2000);
  res.json(
    await prisma.user.update({
      where: { id: req.user.id },
      data: { posterStatus: "pending", posterType, posterReason },
      select: userSelect,
    }),
  );
});
router.get("/", async (req, res) => {
  if (req.user.role !== "ADMIN") fail("Admin only", 403);
  res.json(
    await prisma.user.findMany({
      where: { posterStatus: "pending", role: "STUDENT" },
      select: { ...userSelect, posterReason: true },
      ...paging(req),
      orderBy: { createdAt: "asc" },
    }),
  );
});
router.patch("/:id", async (req, res) => {
  if (req.user.role !== "ADMIN") fail("Admin only", 403);
  if (!["approved", "rejected"].includes(req.body.status))
    fail("Invalid decision");
  const user = await prisma.user.update({
    where: { id: req.params.id, posterStatus: "pending", role: "STUDENT" },
    data: { posterStatus: req.body.status },
    select: userSelect,
  });
  res.json(user);
});
module.exports = router;
