export function initials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
export function daysLeft(deadline) {
  const d = Math.ceil((new Date(deadline) - new Date()) / 86400000);
  return d > 0 ? `${d}d left` : "Due today";
}
