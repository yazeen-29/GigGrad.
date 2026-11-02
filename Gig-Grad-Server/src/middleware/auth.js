const prisma = require("../lib/prisma");
const { userSelect } = require("../lib/validation");
const { cookie, hash } = require("../lib/session");
module.exports = async function requireAuth(req, res, next) {
  const token = cookie(req);
  if (!token) return res.status(401).json({ error: "Login required" });
  try {
    const session = await prisma.session.findUnique({
      where: { id: hash(token) },
      include: { user: { select: userSelect } },
    });
    if (!session || session.expiresAt <= new Date())
      return res
        .status(401)
        .json({ error: "Session expired. Please sign in again." });
    req.user = session.user;
    req.sessionId = session.id;
    if (
      !["GET", "HEAD"].includes(req.method) &&
      req.user.role !== "ADMIN" &&
      !req.user.emailVerifiedAt &&
      ["/api/jobs", "/api/applications", "/api/messages"].includes(req.baseUrl)
    )
      return res.status(403).json({
        error:
          "Verify your campus email before applying, posting or messaging.",
      });
    next();
  } catch (error) {
    next(error);
  }
};
