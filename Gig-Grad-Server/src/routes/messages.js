const router = require("express").Router();
const prisma = require("../lib/prisma");
const requireAuth = require("../middleware/auth");
const { fail, text } = require("../lib/validation");
const person = { select: { id: true, name: true, role: true } };
const messageSelect = {
  id: true,
  content: true,
  senderId: true,
  receiverId: true,
  createdAt: true,
  isRead: true,
  jobId: true,
};
router.use(requireAuth);
async function conversation(jobId, userId) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { postedBy: person, assignedTo: person },
  });
  if (!job) fail("Conversation not found", 404);
  if (job.postedById !== userId && job.assignedToId !== userId)
    fail("Only the hired worker and poster can access this conversation", 403);
  if (!job.assignedToId) fail("Messaging opens when a worker is hired", 409);
  return job;
}
router.get("/", async (req, res) => {
  const jobs = await prisma.job.findMany({
    where: {
      assignedToId: { not: null },
      OR: [{ postedById: req.user.id }, { assignedToId: req.user.id }],
    },
    include: {
      postedBy: person,
      assignedTo: person,
      messages: {
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 1,
        select: messageSelect,
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
  const unread = await prisma.message.groupBy({
    by: ["jobId"],
    where: {
      receiverId: req.user.id,
      isRead: false,
      jobId: { in: jobs.map((job) => job.id) },
    },
    _count: true,
  });
  const counts = new Map(unread.map((group) => [group.jobId, group._count]));
  res.json(
    jobs.map(({ messages, ...job }) => ({
      job,
      latest: messages[0] || null,
      unread: counts.get(job.id) || 0,
    })),
  );
});
router.get("/job/:jobId", async (req, res) => {
  const job = await conversation(req.params.jobId, req.user.id);
  let cursor;
  if (req.query.before) {
    const existing = await prisma.message.findUnique({
      where: { id: text(req.query.before, "Cursor", 1, 100) },
      select: { id: true, jobId: true },
    });
    if (!existing || existing.jobId !== job.id) fail("Invalid message cursor");
    cursor = { id: existing.id };
  }
  const rows = await prisma.message.findMany({
    where: { jobId: job.id },
    select: messageSelect,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 51,
    ...(cursor ? { cursor, skip: 1 } : {}),
  });
  const hasMore = rows.length > 50;
  const messages = rows.slice(0, 50).reverse();
  res.json({
    job,
    messages,
    hasMore,
    nextCursor: hasMore ? messages[0].id : null,
  });
});
const sends = new Map();
const cleanup = setInterval(() => {
  for (const [id, entry] of sends)
    if (entry.until < Date.now()) sends.delete(id);
}, 60000);
cleanup.unref();
router.post("/job/:jobId", async (req, res) => {
  const job = await conversation(req.params.jobId, req.user.id);
  const content = text(req.body.content, "Message", 1, 4000);
  const id = text(req.body.clientId, "Message ID", 36, 36);
  if (!/^[0-9a-f-]{36}$/i.test(id)) fail("Invalid message ID");
  const existing = await prisma.message.findUnique({
    where: { id },
    select: messageSelect,
  });
  if (existing) {
    if (
      existing.senderId !== req.user.id ||
      existing.jobId !== job.id ||
      existing.content !== content
    )
      fail("Message ID already used", 409);
    return res.json(existing);
  }
  if (["COMPLETED", "CANCELLED"].includes(job.status))
    fail(
      "This conversation is archived. You can still read its messages.",
      409,
    );
  const now = Date.now();
  let entry = sends.get(req.user.id);
  if (!entry || entry.until < now) {
    entry = { count: 0, until: now + 60000 };
    if (sends.size >= 10000) fail("Please try again shortly", 503);
    sends.set(req.user.id, entry);
  }
  if (++entry.count > 30) {
    res.set("Retry-After", "60");
    fail("Please wait a moment before sending more messages", 429);
  }
  const message = await prisma.$transaction(
    async (tx) => {
      // Serialize the status check with concurrent completion/cancellation.
      const current = await tx.job.findUnique({ where: { id: job.id } });
      if (
        !current ||
        current.assignedToId !== job.assignedToId ||
        ["COMPLETED", "CANCELLED"].includes(current.status)
      )
        fail(
          "This conversation is archived or has changed. Refresh and try again.",
          409,
        );
      const receiverId =
        req.user.id === current.postedById
          ? current.assignedToId
          : current.postedById;
      return tx.message.create({
        data: {
          id,
          content,
          jobId: current.id,
          senderId: req.user.id,
          receiverId,
        },
        select: messageSelect,
      });
    },
    { isolationLevel: "Serializable" },
  );
  res.status(201).json(message);
});
router.post("/job/:jobId/read", async (req, res) => {
  await conversation(req.params.jobId, req.user.id);
  const last = await prisma.message.findUnique({
    where: { id: text(req.body.messageId, "Message ID", 1, 100) },
    select: { id: true, jobId: true, createdAt: true },
  });
  if (!last || last.jobId !== req.params.jobId) fail("Message not found", 404);
  await prisma.message.updateMany({
    where: {
      jobId: last.jobId,
      receiverId: req.user.id,
      isRead: false,
      OR: [
        { createdAt: { lt: last.createdAt } },
        { createdAt: last.createdAt, id: { lte: last.id } },
      ],
    },
    data: { isRead: true },
  });
  res.json({ success: true });
});
module.exports = router;
