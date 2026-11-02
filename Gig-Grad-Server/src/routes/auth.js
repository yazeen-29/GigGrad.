const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { randomBytes } = require("node:crypto");
const { issue, clear, hash } = require("../lib/session");
const mail = require("../lib/mail");
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
function domains() {
  return (process.env.CAMPUS_EMAIL_DOMAINS || "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
}
function passwordValue(value) {
  text(value, "Password", 10, 72);
  if (Buffer.byteLength(value, "utf8") > 72)
    fail("Password must be at most 72 UTF-8 bytes");
  return value;
}
async function sendToken(user, kind) {
  const ttl = kind === "verify" ? 86400000 : 1800000;
  const recent = await prisma.authToken.findFirst({
    where: {
      userId: user.id,
      kind,
      expiresAt: { gt: new Date(Date.now() + ttl - 60000) },
    },
  });
  if (recent) return;
  const token = randomBytes(32).toString("hex");
  const record = await prisma.authToken.create({
    data: {
      id: hash(token),
      userId: user.id,
      kind,
      expiresAt: new Date(Date.now() + ttl),
    },
  });
  try {
    await mail.deliver(user.email, kind, token);
  } catch {
    await prisma.authToken.deleteMany({ where: { id: record.id } });
    fail(
      "Email delivery is temporarily unavailable. Please try again later.",
      503,
    );
  }
}
router.get("/status", (req, res) =>
  res.json({
    signupAvailable:
      process.env.PUBLIC_SIGNUP_ENABLED === "1" &&
      domains().length > 0 &&
      mail.ready(),
    emailAvailable: mail.ready(),
  }),
);
router.post("/signup", async (req, res) => {
  if (
    process.env.PUBLIC_SIGNUP_ENABLED !== "1" ||
    !domains().length ||
    !mail.ready()
  )
    fail(
      "Campus signup is not open yet. Email delivery and campus domains must be configured.",
      503,
    );
  const name = text(req.body.name, "Name", 2, 100);
  const email = emailValue(req.body.email, false);
  if (!domains().includes(email.split("@")[1]))
    fail("Use an email from this campus");
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
  await sendToken(user, "verify");
  res.status(201).json(await issue(user, res));
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
  res.json(await issue(user, res));
}
router.post("/login", (req, res) => login(req, res));
router.post("/admin/login", (req, res) => login(req, res, true));
router.get("/me", requireAuth, (req, res) => res.json(req.user));
router.post("/logout", requireAuth, async (req, res) => {
  await prisma.session.deleteMany({ where: { id: req.sessionId } });
  clear(res);
  res.json({ message: "Signed out" });
});
router.post("/resend", requireAuth, async (req, res) => {
  if (!req.user.emailVerifiedAt) await sendToken(req.user, "verify");
  res.json({ message: "If verification is needed, a message has been sent." });
});
router.post("/forgot", async (req, res) => {
  const email = emailValue(req.body.email, false);
  if (!mail.ready()) fail("Email recovery is not configured yet", 503);
  const user = await prisma.user.findUnique({ where: { email } });
  if (user)
    setImmediate(() =>
      sendToken(user, "reset").catch(() =>
        console.error("Password recovery delivery failed"),
      ),
    );
  res.json({
    message: "If this account exists, a recovery message has been sent.",
  });
});
router.post("/consume", async (req, res) => {
  const token = text(req.body.token, "Token", 64, 64);
  const kind = req.body.kind;
  if (!["verify", "reset"].includes(kind)) fail("Invalid link");
  const password =
    kind === "reset"
      ? await bcrypt.hash(passwordValue(req.body.password), 12)
      : null;
  await prisma.$transaction(async (tx) => {
    const record = await tx.authToken.findUnique({
      where: { id: hash(token) },
    });
    if (!record || record.kind !== kind || record.expiresAt <= new Date())
      fail("This link is invalid or expired. Request a new one.");
    const consumed = await tx.authToken.deleteMany({
      where: { id: record.id, expiresAt: { gt: new Date() } },
    });
    if (!consumed.count) fail("This link has already been used");
    await tx.user.update({
      where: { id: record.userId },
      data: kind === "verify" ? { emailVerifiedAt: new Date() } : { password },
    });
    if (kind === "reset") {
      await tx.session.deleteMany({ where: { userId: record.userId } });
      await tx.authToken.deleteMany({
        where: { userId: record.userId, kind: "reset" },
      });
    }
  });
  if (kind === "reset") clear(res);
  res.json({
    message:
      kind === "verify"
        ? "Email verified. You can now apply, post and message."
        : "Password updated. Sign in again.",
  });
});
module.exports = router;
