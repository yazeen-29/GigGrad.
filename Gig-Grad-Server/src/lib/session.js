const { randomBytes, createHash } = require("node:crypto");
const prisma = require("./prisma");
const cookieName = "gg_session";
const hash = (value) => createHash("sha256").update(value).digest("hex");
function cookie(req) {
  const value = (req.headers.cookie || "")
    .split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith(cookieName + "="));
  return value?.slice(cookieName.length + 1);
}
async function issue(user, res) {
  const token = randomBytes(32).toString("hex");
  await prisma.session.create({
    data: {
      id: hash(token),
      userId: user.id,
      expiresAt: new Date(Date.now() + 86400000),
    },
  });
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 86400000,
  });
  return { user };
}
function clear(res) {
  res.clearCookie(cookieName, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
}
module.exports = { hash, cookie, issue, clear };
