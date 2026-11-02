import Avatar from "./ui/Avatar";
import { getExperience } from "../utils/experience";
import NotificationBell from "./NotificationBell";

import {
  Home,
  Briefcase,
  Plus,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  LogIn,
  Menu,
  X,
  Zap,
  ShieldCheck,
  MessageCircle,
  GraduationCap,
} from "lucide-react";

export default function Navbar({
  page,
  setPage,
  isLoggedIn,
  currentUser,
  onLogout,
  mobileOpen,
  setMobileOpen,
}) {
  const experience = getExperience(currentUser);
  const navItems = !currentUser
    ? [
        { id: "landing", label: "Home", icon: Home },
        { id: "jobs", label: "Explore gigs", icon: Briefcase },
        { id: "scholarships", label: "Scholarships", icon: GraduationCap },
      ]
    : experience.isAdmin
      ? [
          { id: "admin", label: "Administration", icon: ShieldCheck },
          { id: "jobs", label: "Campus board", icon: Briefcase },
          { id: "post-job", label: "Post campus task", icon: Plus },
        ]
      : [
          {
            id: "dashboard",
            label: experience.workspace,
            icon: LayoutDashboard,
          },
          ...(experience.isStudent
            ? [
                { id: "jobs", label: "Explore gigs", icon: Briefcase },
                {
                  id: "scholarships",
                  label: "Scholarships",
                  icon: GraduationCap,
                },
              ]
            : []),
          ...(experience.canPost
            ? [
                {
                  id: "post-job",
                  label:
                    experience.kind === "faculty"
                      ? "Post academic task"
                      : experience.kind === "staff"
                        ? "Post campus task"
                        : "Post a gig",
                  icon: Plus,
                },
                {
                  id: "my-jobs",
                  label:
                    experience.kind === "faculty"
                      ? "Academic projects"
                      : experience.kind === "staff"
                        ? "Campus projects"
                        : "My postings",
                  icon: ClipboardList,
                },
              ]
            : [
                {
                  id: "request-access",
                  label: "Request posting access",
                  icon: Plus,
                },
              ]),
          { id: "messages", label: "Messages", icon: MessageCircle },
        ];

  navItems.push({ id: "learn", label: "Skill Studio", icon: GraduationCap });

  const desktopNav = navItems.length > 5 ? "2xl:flex" : "xl:flex";
  const compactNav = navItems.length > 5 ? "2xl:hidden" : "xl:hidden";

  // ── Logout ────────────────────────────────────────────────────────────
  const handleLogout = () => {
    setMobileOpen(false);
    onLogout();
  };

  // ── Navigate ───────────────────────────────────────────────────────────
  const handleNavigation = (id) => {
    setMobileOpen(false);
    setPage(id);
  };

  return (
    <>
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 h-[76px] flex items-center justify-between relative">
          {/* ── Logo ─────────────────────────────────────────────────── */}
          <button
            onClick={() => handleNavigation("landing")}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center shadow-sm">
              <Zap size={15} className="text-white fill-white" />
            </div>

            <span className="font-extrabold text-slate-900 text-lg tracking-tight">
              GigGrad
            </span>
          </button>

          {/* ── Desktop Navigation ───────────────────────────────────── */}
          <div className={`hidden ${desktopNav} items-center gap-1`}>
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleNavigation(id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all duration-150 ${
                  page === id ||
                  (experience.isAdmin && page === "dashboard" && id === "admin")
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* ── Right Side ───────────────────────────────────────────── */}
          <div className="flex items-center gap-2">
            {isLoggedIn && currentUser ? (
              <>
                {/* Notification */}
                <NotificationBell setPage={setPage} />

                {/* User */}
                <button
                  onClick={() => handleNavigation("profile")}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-50 border border-slate-200 transition-colors"
                >
                  <Avatar
                    name={currentUser.name}
                    size="sm"
                    role={currentUser.role?.toLowerCase()}
                  />

                  <span className="hidden sm:block text-xs font-semibold text-slate-700 max-w-[90px] truncate">
                    {currentUser.name?.split(" ")[0]}
                  </span>
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="hidden 2xl:flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-red-600 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-red-200 transition-colors"
                >
                  <LogOut size={13} />
                  Logout
                </button>
              </>
            ) : (
              /* Sign In */
              <button
                onClick={() => handleNavigation("login")}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold bg-blue-700 text-white hover:bg-blue-800 transition-colors shadow-sm"
              >
                <LogIn size={14} />
                Sign In
              </button>
            )}

            {/* Mobile menu */}
            <button
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`${compactNav} p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors`}
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Menu ───────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className={`fixed inset-0 z-40 pt-[76px] bg-white ${compactNav} overflow-y-auto`}
        >
          <div className="p-4 flex flex-col gap-1">
            {/* Navigation */}
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleNavigation(id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
                  page === id ||
                  (experience.isAdmin && page === "dashboard" && id === "admin")
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}

            <button
              onClick={() => handleNavigation("profile")}
              className="text-left px-4 py-3 font-semibold text-slate-700"
            >
              My profile
            </button>
            <div className="h-px bg-slate-100 my-2" />

            {/* Auth section */}
            {isLoggedIn && currentUser ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3">
                  <Avatar
                    name={currentUser.name}
                    size="md"
                    role={currentUser.role?.toLowerCase()}
                  />

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {currentUser.name}
                    </p>

                    <p className="text-xs text-slate-400">
                      {currentUser.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNavigation("login")}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
              >
                <LogIn size={16} />
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
