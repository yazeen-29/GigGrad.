import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import Avatar from "./ui/Avatar";
import NotificationBell from "./NotificationBell";
import { useAuth } from "../context/AuthContext";

import {
  Home,
  Briefcase,
  Plus,
  ClipboardList,
  ShieldCheck,
  LayoutDashboard,
  LogOut,
  LogIn,
  Menu,
  X,
  Zap
} from "lucide-react";

// Build the nav for the current user. `end` on Home so "/" only matches exactly.
function navFor({ isLoggedIn, canPostJobs, user }) {
  const items = [{ to: "/", label: "Home", icon: Home, end: true }];
  if (!isLoggedIn) return items;

  items.push({ to: "/jobs", label: "Browse Jobs", icon: Briefcase });
  if (canPostJobs) {
    items.push({ to: "/post-job", label: "Post a Job", icon: Plus });
    items.push({ to: "/my-jobs",  label: "My Jobs",    icon: ClipboardList });
  }
  if (user?.role === "admin") {
    items.push({ to: "/admin", label: "Admin", icon: ShieldCheck });
  }
  items.push({ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard });
  return items;
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isLoggedIn, canPostJobs, logout } = useAuth();

  const navItems = navFor({ isLoggedIn, canPostJobs, user });

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/", { replace: true });
  };

  const linkClass = (base) => ({ isActive }) =>
    `${base} ${isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-700 rounded-lg flex items-center justify-center">
              <Zap size={14} className="text-white fill-white" />
            </div>
            <span className="font-extrabold text-slate-900 text-lg tracking-tight">GigGrad</span>
          </NavLink>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={linkClass("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors")}
              >
                <Icon size={14} />
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <NotificationBell />
                <NavLink to="/dashboard" className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-50 border border-slate-200 transition-colors">
                  <Avatar name={user.name} size="sm" role={user.role} />
                  <span className="hidden sm:block text-xs font-semibold text-slate-700">{user.name.split(" ")[0]}</span>
                </NavLink>
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="hidden md:flex p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-700 text-white hover:bg-blue-800 transition-colors"
              >
                <LogIn size={14} /> Sign In
              </NavLink>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg"
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 pt-14 bg-white md:hidden">
          <div className="p-4 flex flex-col gap-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                <Icon size={16} /> {label}
              </NavLink>
            ))}
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-2"
              >
                <LogOut size={16} /> Log out
              </button>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors mt-2"
              >
                <LogIn size={16} /> Sign In
              </NavLink>
            )}
          </div>
        </div>
      )}
    </>
  );
}
