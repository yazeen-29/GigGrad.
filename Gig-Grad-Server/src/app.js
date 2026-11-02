const express = require("express");
const cors = require("cors");
const { randomUUID } = require("node:crypto");
const prisma = require("./lib/prisma");
const app = express();
app.disable("x-powered-by");
if (process.env.TRUST_PROXY === "1") app.set("trust proxy", 1);
const origins = (
  process.env.CORS_ORIGINS ||
  process.env.RENDER_EXTERNAL_URL ||
  "http://localhost:5173"
)
  .split(",")
  .map((s) => s.trim());
app.use(
  cors({
    credentials: true,
    origin: (origin, done) => done(null, !origin || origins.includes(origin)),
  }),
);
app.use((req, res, next) => {
  req.requestId = randomUUID();
  res.set({
    "X-Request-Id": req.requestId,
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Cache-Control": "no-store",
  });
  next();
});
app.use((req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const allowed = [...origins, process.env.APP_ORIGIN].filter(Boolean);
  if (!req.headers.origin || !allowed.includes(req.headers.origin))
    return res.status(403).json({ error: "Request origin is not allowed" });
  next();
});
app.use(express.json({ limit: "64kb" }));
app.use((req, res, next) => {
  req.body ??= {};
  next();
});
// A bounded per-process limiter. Use a shared edge limiter when running multiple replicas.
const attempts = new Map();
const cleanup = setInterval(() => {
  for (const [key, value] of attempts)
    if (value.until < Date.now()) attempts.delete(key);
}, 60000);
cleanup.unref();
app.use("/api/auth", (req, res, next) => {
  if (req.method !== "POST") return next();
  const key = req.ip;
  const now = Date.now();
  let entry = attempts.get(key);
  if (!entry && attempts.size >= 10000)
    return res.status(503).json({ error: "Please try again shortly." });
  if (!entry || entry.until < now) {
    entry = { count: 0, until: now + 15 * 60000 };
    attempts.set(key, entry);
  }
  if (++entry.count > 30) {
    res.set("Retry-After", String(Math.ceil((entry.until - now) / 1000)));
    return res
      .status(429)
      .json({ error: "Too many attempts. Please try again later." });
  }
  next();
});
for (const route of [
  "personal",
  "auth",
  "jobs",
  "applications",
  "users",
  "disputes",
  "access",
  "messages",
  "scholarships",
  "assistant",
  "admin",
])
  app.use(`/api/${route}`, require(`./routes/${route}`));
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.get("/ready", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ready" });
  } catch {
    res.status(503).json({ status: "unavailable" });
  }
});
if (process.env.SERVE_WEB === "1")
  require("./lib/web")(
    app,
    require("node:path").resolve(__dirname, "../../dist"),
  );
app.use((req, res) => res.status(404).json({ error: "Route not found" }));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  let status = error.status || 500;
  let message =
    error.type === "entity.parse.failed"
      ? "Invalid JSON request body"
      : error.message;
  if (error.code === "P2002") {
    status = 409;
    message = "This record already exists";
  }
  if (error.code === "P2025" || error.code === "P2034") {
    status = 409;
    message = "This record changed. Refresh and try again.";
  }
  if (["P1000", "P1001", "P1002", "P1017"].includes(error.code)) {
    status = 503;
    message =
      "The database is temporarily unavailable. Please try again shortly.";
  }
  if (["P2021", "P2022"].includes(error.code)) {
    status = 503;
    message =
      "The database needs an update. Please contact the app administrator.";
  }
  if (status >= 500) {
    console.error(
      JSON.stringify({ requestId: req.requestId, message: error.message }),
    );
    if (status !== 503) message = "Something went wrong. Please try again.";
  }
  res.status(status).json({ error: message, requestId: req.requestId });
});
module.exports = app;
