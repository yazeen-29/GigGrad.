const router  = require("express").Router();
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const prisma  = require("../lib/prisma");

function makeToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role, college } = req.body;
    if (!name || !email || !password || !college)
      return res.status(400).json({ error: "All fields are required" });
    if (!email.endsWith(".ac.in") && !email.endsWith(".edu"))
      return res.status(400).json({ error: "Only college emails allowed" });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return res.status(400).json({ error: "Email already registered" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: role === "TEACHER" ? "TEACHER" : "STUDENT",
        college,
      }
    });
    res.status(201).json({
      token: makeToken(user),
      user: { id: user.id, name: user.name, email: user.email, role: user.role, college: user.college, rating: user.rating }
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Signup failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(400).json({ error: "No account found with this email" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ error: "Wrong password" });
    res.json({
      token: makeToken(user),
      user: { id: user.id, name: user.name, email: user.email, role: user.role, college: user.college, rating: user.rating }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/me", require("../middleware/auth"), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, college: true, rating: true, bio: true }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to get user" });
  }
});

module.exports = router;
