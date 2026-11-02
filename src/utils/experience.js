import { canPostJobs } from "./verification";
export function getExperience(user) {
  const kind = !user
    ? "guest"
    : user.role === "ADMIN"
      ? "admin"
      : user.role === "TEACHER"
        ? user.posterType === "staff"
          ? "staff"
          : "faculty"
        : ["club", "council", "org", "startup"].includes(user.posterType) &&
            user.posterStatus === "approved"
          ? "club"
          : "student";
  const copy = {
    guest: {
      label: "Campus community",
      workspace: "Workspace",
      heading: "Find your place on campus.",
      subtitle: "Connect useful skills with meaningful campus work.",
    },
    student: {
      label: "Student workspace",
      workspace: "My workspace",
      heading: `Make your next move, ${user?.name?.split(" ")[0] || "student"}.`,
      subtitle:
        "Track applications, build experience, and find support for your studies.",
      empty: "Your next campus project starts here.",
      emptyNote: "Explore open gigs and introduce yourself to a poster.",
      profileTitle: "Student profile",
      skillsLabel: "Skills & interests",
      portfolioTitle: "Work worth showing.",
    },
    faculty: {
      label: "Faculty workspace",
      workspace: "Faculty dashboard",
      heading: "Bring your academic projects forward.",
      subtitle: `Welcome back, ${user?.name || "Professor"}. Review applicants, coordinate student support, and approve delivered work.`,
      empty: "Put your next academic brief in motion.",
      emptyNote:
        "Post a research, teaching, or department task and review student applications here.",
      profileTitle: "Faculty profile",
      skillsLabel: "Areas of expertise",
      portfolioTitle: "Academic projects supported.",
    },
    staff: {
      label: "Staff workspace",
      workspace: "Staff dashboard",
      heading: "Keep campus operations moving.",
      subtitle: `Welcome back, ${user?.name || "campus team"}. Coordinate event help, review applicants, and manage delivery.`,
      empty: "Find support for your next campus task.",
      emptyNote:
        "Publish an operations or event brief with a clear budget and deadline.",
      profileTitle: "Staff profile",
      skillsLabel: "Areas of responsibility",
      portfolioTitle: "Campus projects coordinated.",
    },
    club: {
      label: "Organization workspace",
      workspace: "Club workspace",
      heading: "Bring your club’s next idea to life.",
      subtitle: `${user?.name || "Your organization"} can organize projects and apply for other campus work from the same account.`,
      empty: "Give your next event the right support.",
      emptyNote: "Publish a club brief and invite students to collaborate.",
      profileTitle: "Organization profile",
      skillsLabel: "What we do",
      portfolioTitle: "Projects and collaborations.",
    },
    admin: {
      label: "Campus administration",
      workspace: "Admin overview",
      heading: "Keep campus work fair and moving.",
      subtitle: `Welcome back, ${user?.name || "administrator"}. Review student posting requests, resolve conflicts, and monitor campus activity.`,
      profileTitle: "Administrator profile",
      skillsLabel: "Administration & support",
      portfolioTitle: "Campus administration",
    },
  }[kind];
  return {
    kind,
    ...copy,
    canPost: canPostJobs(user),
    isStudent: user?.role === "STUDENT",
    isPoster: kind === "faculty" || kind === "staff" || kind === "club",
    isAdmin: kind === "admin",
    fundingLabel:
      kind === "student" || kind === "club"
        ? "Scholarships"
        : "Student funding resources",
  };
}
