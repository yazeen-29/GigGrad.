import { useEffect, useRef, useState } from "react";
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
  BookOpen,
  ChevronDown,
  UserRound,
  ArrowUpRight,
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
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const accountTrigger = useRef(null);
  const mobileTrigger = useRef(null);
  const signedIn = isLoggedIn && !!currentUser;
  const primary = signedIn
    ? [
        {
          id: experience.isAdmin ? "admin" : "dashboard",
          label: experience.isAdmin ? "Administration" : "Workspace",
          icon: experience.isAdmin ? ShieldCheck : LayoutDashboard,
        },
        {
          id: "jobs",
          label: experience.isStudent ? "Explore gigs" : "Campus board",
          icon: Briefcase,
        },
        { id: "learn", label: "Skill Studio", icon: BookOpen },
        ...(experience.isStudent
          ? [{ id: "scholarships", label: "Scholarships", icon: GraduationCap }]
          : []),
      ]
    : [
        { id: "landing", label: "Home", icon: Home },
        { id: "jobs", label: "Explore gigs", icon: Briefcase },
        { id: "learn", label: "Skill Studio", icon: BookOpen },
        { id: "scholarships", label: "Scholarships", icon: GraduationCap },
      ];
  const accountItems = [
    {
      id: "profile",
      label: experience.isStudent ? "My profile & portfolio" : "My profile",
      icon: UserRound,
    },
    { id: "messages", label: "Project messages", icon: MessageCircle },
    ...(experience.canPost
      ? [{ id: "my-jobs", label: "My postings", icon: ClipboardList }]
      : [
          { id: "request-access", label: "Request posting access", icon: Plus },
        ]),
  ];
  const navigate = (id) => {
    setAccountOpen(false);
    setMobileOpen(false);
    setPage(id);
  };
  const logout = () => {
    setAccountOpen(false);
    setMobileOpen(false);
    onLogout();
  };
  useEffect(() => {
    const outside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target))
        setAccountOpen(false);
    };
    const escape = (event) => {
      if (event.key === "Escape") {
        if (accountOpen) {
          setAccountOpen(false);
          accountTrigger.current?.focus();
        }
        if (mobileOpen) {
          setMobileOpen(false);
          mobileTrigger.current?.focus();
        }
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [accountOpen, mobileOpen, setMobileOpen]);
  const active = (id) =>
    page === id ||
    (page === "job-detail" && id === "jobs") ||
    (experience.isAdmin && page === "dashboard" && id === "admin");
  const navButton = ({ id, label, icon: Icon }) => (
    <button
      key={id}
      aria-current={active(id) ? "page" : undefined}
      onClick={() => navigate(id)}
      className={`pro-nav-link ${active(id) ? "is-active" : ""}`}
    >
      <Icon size={19} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
  return (
    <header className="pro-header">
      <div className="pro-nav-shell">
        <button
          className="pro-brand"
          onClick={() => navigate("landing")}
          aria-label="GigGrad home"
        >
          <span className="pro-brand-mark">
            <Zap size={21} fill="currentColor" />
          </span>
          <span>
            GigGrad<small>THE CAMPUS NETWORK</small>
          </span>
        </button>
        <nav className="pro-nav-desktop" aria-label="Main navigation">
          {primary.map(navButton)}
        </nav>
        <div className="pro-nav-actions">
          {signedIn ? (
            <>
              {experience.canPost && (
                <button
                  className="pro-nav-cta"
                  onClick={() => navigate("post-job")}
                >
                  <Plus size={17} />
                  <span>Post a gig</span>
                </button>
              )}
              <div className="pro-notifications">
                <NotificationBell setPage={setPage} />
              </div>
              <div ref={accountRef} className="pro-account">
                <button
                  ref={accountTrigger}
                  className={`pro-account-trigger ${accountOpen ? "is-open" : ""}`}
                  aria-label="Account menu"
                  aria-expanded={accountOpen}
                  aria-controls="account-navigation"
                  onClick={() => {
                    setAccountOpen(!accountOpen);
                    setMobileOpen(false);
                  }}
                >
                  <Avatar
                    name={currentUser.name}
                    size="sm"
                    role={currentUser.role?.toLowerCase()}
                  />
                  <span className="pro-account-name">
                    {currentUser.name?.split(" ")[0]}
                    <small>
                      {experience.isAdmin
                        ? "Administrator"
                        : experience.kind === "faculty"
                          ? "Faculty"
                          : experience.kind === "staff"
                            ? "Campus staff"
                            : "Student"}
                    </small>
                  </span>
                  <ChevronDown size={15} />
                </button>
                {accountOpen && (
                  <div className="pro-account-panel" id="account-navigation">
                    <div className="pro-account-intro">
                      <strong>{currentUser.name}</strong>
                      <span>Your campus workspace</span>
                    </div>
                    <nav aria-label="Account navigation">
                      {accountItems.map(navButton)}
                    </nav>
                    <button onClick={logout} className="pro-logout">
                      <LogOut size={17} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button className="pro-signin" onClick={() => navigate("login")}>
              <LogIn size={17} />
              <span>Sign in</span>
              <ArrowUpRight size={15} />
            </button>
          )}
          <button
            ref={mobileTrigger}
            className="pro-mobile-trigger"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => {
              setMobileOpen(!mobileOpen);
              setAccountOpen(false);
            }}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <nav
          className="pro-mobile-panel"
          id="mobile-navigation"
          aria-label="Mobile navigation"
        >
          <span className="pro-mobile-label">EXPLORE GIGGRAD</span>
          {primary.map(navButton)}
          {signedIn && (
            <>
              <div className="pro-mobile-divider" />
              <span className="pro-mobile-label">YOUR WORKSPACE</span>
              {accountItems.map(navButton)}
              {experience.canPost &&
                navButton({ id: "post-job", label: "Post a gig", icon: Plus })}
              <button className="pro-logout" onClick={logout}>
                <LogOut size={17} />
                Sign out
              </button>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
