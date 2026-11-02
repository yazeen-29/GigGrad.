const fail = (message, status = 400) => {
  throw Object.assign(new Error(message), { status });
};
function text(value, name, min = 1, max = 200) {
  if (
    typeof value !== "string" ||
    value.trim().length < min ||
    value.trim().length > max
  )
    fail(`${name} must be ${min}–${max} characters`);
  return value.trim();
}
const canPost = (user) =>
  ["ADMIN", "TEACHER"].includes(user.role) ||
  (user.role === "STUDENT" && user.posterStatus === "approved");
const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  college: true,
  rating: true,
  bio: true,
  posterStatus: true,
  posterType: true,
  skills: true,
};
function transition(job, userId, status) {
  const owner = job.postedById === userId;
  const worker = job.assignedToId === userId;
  return (
    (owner && job.status === "OPEN" && status === "CANCELLED") ||
    (worker && job.status === "IN_PROGRESS" && status === "PENDING_APPROVAL") ||
    (owner &&
      job.status === "PENDING_APPROVAL" &&
      ["COMPLETED", "IN_PROGRESS"].includes(status))
  );
}
module.exports = { fail, text, canPost, userSelect, transition };
