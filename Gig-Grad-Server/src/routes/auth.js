const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const requireAuth = require("../middleware/auth");
const { text, fail, userSelect } = require("../lib/validation");
function emailValue(value, collegeOnly = true) {
  const email = text(value, "Email", 5, 254).toLowerCase();
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    (collegeOnly && !/\.(edu|ac\.in)$/.test(email))
  )
    fail("Use a valid college email address");
  return email;
}
function result(user) {
  return {
    user,
    token: jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: "1d",
    }),
  };
}
router.post("/signup", async (req, res) => {
  const name = text(req.body.name, "Name", 2, 100);
  const email = emailValue(req.body.email);
  text(req.body.password, "Password", 10, 72);
  const password = req.body.password;
  if (Buffer.byteLength(password, "utf8") > 72)
    fail("Password must be at most 72 UTF-8 bytes");
  const college = text(req.body.college, "College", 2, 160);
  const role = ["TEACHER", "STAFF"].includes(req.body.role)
    ? "TEACHER"
    : "STUDENT";
  const posterType =
    role === "TEACHER"
      ? req.body.role === "STAFF"
        ? "staff"
        : "faculty"
      : null;
  if (
    await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true },
    })
  )
    fail("An account with this email already exists", 409);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      college,
      role,
      posterType,
      posterStatus: role === "TEACHER" ? "approved" : "none",
      password: await bcrypt.hash(password, 12),
    },
    select: userSelect,
  });
  res.status(201).json(result(user));
});
async function login(req, res, adminOnly = false) {
  const email = emailValue(req.body.email, false);
  text(req.body.password, "Password", 1, 1000);
  const password = req.body.password;
  const record = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
  if (!record || !(await bcrypt.compare(password, record.password)))
    fail("Invalid email or password", 401);
  const user = Object.fromEntries(
    Object.keys(userSelect).map((key) => [key, record[key]]),
  );
  if (adminOnly && user.role !== "ADMIN")
    fail("Administrator access required", 403);
  res.json(result(user));
}
router.post("/login", (req, res) => login(req, res));
router.post("/admin/login", (req, res) => login(req, res, true));
router.get("/me", requireAuth, (req, res) => res.json(req.user));
module.exports = router;
