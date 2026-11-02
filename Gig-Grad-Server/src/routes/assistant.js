const router = require("express").Router();
const requireAuth = require("../middleware/auth");
const { fail } = require("../lib/validation");
const { guided, validateMessages, answerWithAI } = require("../lib/assistant");
const enabled = () =>
  Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_MODEL);
router.get("/status", (req, res) =>
  res.json({
    aiAvailable: enabled(),
    defaultMode: enabled() ? "ai" : "guided",
    requiresLoginForAI: true,
  }),
);
const usage = new Map();
const cleanup = setInterval(() => {
  for (const [key, value] of usage)
    if (value.until < Date.now()) usage.delete(key);
}, 60000);
cleanup.unref();
function limit(key, max, period) {
  const now = Date.now();
  let item = usage.get(key);
  if (!item || item.until < now) {
    if (usage.size >= 10000) fail("Please try again shortly", 503);
    item = { count: 0, until: now + period };
    usage.set(key, item);
  }
  if (++item.count > max)
    fail("Assistant request limit reached. Please try again later.", 429);
}
router.post(
  "/chat",
  (req, res, next) =>
    req.body.useAI === true ? requireAuth(req, res, next) : next(),
  async (req, res) => {
    if (req.body.useAI !== undefined && typeof req.body.useAI !== "boolean")
      fail("Invalid assistant mode");
    const messages = validateMessages(req.body.messages);
    if (messages.at(-1).role !== "user")
      fail("The last message must be from you");
    limit(`ip:${req.ip}`, 30, 60000);
    const last = messages.at(-1).content;
    if (
      messages.some((message) =>
        /sk-[A-Za-z0-9_-]{15,}|\b\d{12,18}\b/.test(message.content),
      )
    )
      return res.json({
        mode: "guided",
        answer:
          "Please remove API keys, identity numbers and bank details. I can explain the steps without those private details.",
        actions: [],
        sources: [],
      });
    if (req.body.useAI && enabled()) {
      limit(`ai:${req.user.id}`, 60, 86400000);
      try {
        return res.json(
          await answerWithAI(
            messages,
            req.user,
            fetch,
            typeof req.body.page === "string"
              ? req.body.page.slice(0, 80)
              : "landing",
          ),
        );
      } catch {
        return res.json({
          ...guided(last),
          notice:
            "AI replies are temporarily unavailable. This answer comes from GigGrad’s built-in help.",
        });
      }
    }
    res.json({
      ...guided(last),
      ...(req.body.useAI
        ? {
            notice:
              "AI replies are not enabled. This answer comes from GigGrad’s built-in help.",
          }
        : {}),
    });
  },
);
module.exports = router;
