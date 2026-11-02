// Faculty/staff and administrators post directly. Students require approved access.
export function canPostJobs(user) {
  return (
    ["ADMIN", "TEACHER"].includes(user?.role) ||
    (user?.role === "STUDENT" && user?.posterStatus === "approved")
  );
}
export const POSTER_TYPE_LABEL = {
  faculty: "Faculty",
  staff: "Staff",
  council: "Student Council",
  club: "Club",
  org: "Organization",
  startup: "Campus Startup",
};
