module.exports = (req) => {
  const page = Math.max(1, Math.min(10000, parseInt(req.query.page) || 1));
  const take = req.query.page ? 50 : 200;
  return { take, skip: (page - 1) * take };
};
