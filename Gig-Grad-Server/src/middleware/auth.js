const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { userSelect } = require("../lib/validation");
module.exports = async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return res.status(401).json({ error: "Login required" });
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch {
    return res
      .status(401)
      .json({ error: "Session expired. Please sign in again." });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: userSelect,
    });
    if (!user) return res.status(401).json({ error: "Account not found" });
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
