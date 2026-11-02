module.exports = async function notify(tx, users, title, jobId) {
  const ids = [...new Set(users.filter(Boolean))];
  if (ids.length)
    await tx.notification.createMany({
      data: ids.map((userId) => ({ userId, title, jobId })),
    });
};
