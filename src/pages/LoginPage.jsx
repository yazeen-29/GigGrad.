import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Zap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import { authAPI, saveAuth } from "../lib/api";

// ─── Reusable input component ────────────────────────────────────────────────
function InputField({
  label,
  type,
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  rightElement,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={`auth-${label}`}
        className="text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon size={15} />
          </div>
        )}

        <input
          id={`auth-${label}`}
          autoComplete={
            type === "email"
              ? "email"
              : label === "Password"
                ? "current-password"
                : "name"
          }
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full ${Icon ? "pl-9" : "pl-3"} ${
            rightElement ? "pr-10" : "pr-3"
          } py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            error ? "border-red-300 bg-red-50" : "border-slate-200"
          }`}
        />

        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── LOGIN PAGE ──────────────────────────────────────────────────────────────
export default function LoginPage({
  onLogin,
  initialEmail = "",
  adminOnly = false,
}) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [role, setRole] = useState("student");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // ── Validation ───────────────────────────────────────────────────────────
  function validate() {
    const e = {};

    if (tab === "signup" && !name.trim()) {
      e.name = "Full name is required";
    }

    if (tab === "signup" && college.trim().length < 2)
      e.college = "College name is required";

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      e.email = "Email is required";
    } else if (!normalizedEmail.includes("@")) {
      e.email = "Enter a valid email address";
    } else if (
      tab === "signup" &&
      !/^[^\s@]+@[^\s@]+\.(edu|ac\.in)$/.test(normalizedEmail)
    ) {
      e.email = "Use your college email (e.g. name@college.ac.in)";
    }

    if (!password) {
      e.password = "Password is required";
    } else if (tab === "signup" && password.length < 10) {
      e.password = "Password must be at least 10 characters";
    }

    return e;
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();

    const errs = validate();

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      let result;

      if (tab === "login") {
        result = await (adminOnly ? authAPI.adminLogin : authAPI.login)({
          email: email.trim().toLowerCase(),
          password,
        });
      } else {
        result = await authAPI.signup({
          name,
          email: email.trim().toLowerCase(),
          password,
          role: role.toUpperCase(),
          college: college.trim(),
        });
      }

      // Save JWT + user to frontend localStorage
      saveAuth(result.token, result.user);

      // Show success screen briefly
      setSuccess(true);

      // IMPORTANT:
      // Give App.jsx the authenticated user.
      // App.jsx will then update isLoggedIn/currentUser/page.
      setTimeout(() => {
        if (typeof onLogin === "function") {
          onLogin(result.user);
        }
      }, 600);
    } catch (err) {
      setErrors({
        submit: err.message || "Authentication failed",
      });
      setLoading(false);
    }
  }

  // ── Success state ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center px-4">
        <div className="text-center">
          <div
            className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{
              animation: "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
            }}
          >
            <CheckCircle size={32} className="text-emerald-600" />
          </div>

          <p className="font-bold text-slate-900 text-lg">
            Welcome to GigGrad!
          </p>

          <p className="text-sm text-slate-400 mt-1">
            Taking you to the platform…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex">
      {/* ── Left panel ─────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-700 flex-col justify-between p-12">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Zap size={18} className="text-white fill-white" />
          </div>

          <span className="font-extrabold text-white text-xl tracking-tight">
            GigGrad
          </span>
        </div>

        {/* Main copy */}
        <div>
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            {adminOnly
              ? "A fairer campus"
              : tab === "signup" && role !== "student"
                ? "Bring campus projects"
                : "Your campus."}
            <br />
            <span className="text-blue-200">
              {adminOnly
                ? "starts with you."
                : tab === "signup" && role !== "student"
                  ? "to the right students."
                  : "A place to contribute."}
            </span>
          </h1>

          <p className="text-blue-200 text-base leading-relaxed mb-8">
            {adminOnly
              ? "A dedicated workspace for student access reviews, project conflicts, and campus oversight."
              : "Students build experience. Faculty and staff find reliable help. Administrators keep the community moving fairly."}
          </p>

          <div className="space-y-3 text-blue-100 text-sm">
            {(adminOnly
              ? [
                  "Review student posting requests",
                  "Resolve project conflicts",
                  "Monitor campus activity",
                ]
              : [
                  "Students discover work and scholarship support",
                  "Faculty and staff coordinate projects directly",
                  "Student posting is reviewed by an administrator",
                ]
            ).map((text) => (
              <p key={text}>✓ {text}</p>
            ))}
          </div>
        </div>

        <p className="text-blue-300 text-xs">
          Campus accounts · Role-based workflows
        </p>
      </div>

      {/* ── Right panel ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
            <Zap size={15} className="text-white fill-white" />
          </div>

          <span className="font-extrabold text-slate-900 text-lg">GigGrad</span>
        </div>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
              {adminOnly
                ? "Administrator sign-in"
                : tab === "login"
                  ? "Welcome back"
                  : "Create your account"}
            </h2>

            <p className="text-sm text-slate-500">
              {adminOnly
                ? "Sign in with an administrator account to review requests and resolve conflicts."
                : tab === "login"
                  ? "Sign in to your role-specific campus workspace."
                  : role === "student"
                    ? "Find campus work and support for your studies."
                    : "Coordinate student help for your academic or campus projects."}
            </p>
          </div>

          {/* Tab switcher */}
          {!adminOnly && (
            <div className="flex bg-slate-100 rounded-lg p-1 mb-6">
              {["login", "signup"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTab(t);
                    setErrors({});
                  }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-150 ${
                    tab === t
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t === "login" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>
          )}
          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Name */}
            {tab === "signup" && (
              <InputField
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Muhammad Yazeen"
                error={errors.name}
              />
            )}

            {/* Role */}
            {tab === "signup" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  I am a
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {["student", "teacher", "staff"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                        role === r
                          ? r === "student"
                            ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                            : "bg-blue-50 border-blue-400 text-blue-700"
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {r === "student"
                        ? "Student"
                        : r === "teacher"
                          ? "Faculty"
                          : "Staff"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tab === "signup" && (
              <InputField
                label="College"
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="Your college or university"
                error={errors.college}
              />
            )}
            {tab === "signup" && (
              <p className="text-xs text-slate-500">
                {role === "student"
                  ? "Student posting requires administrator approval. You can browse and apply right away."
                  : "Faculty and staff can post directly without an access request."}
              </p>
            )}
            {/* Email */}
            <InputField
              label={adminOnly ? "Administrator Email" : "College Email"}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@college.ac.in"
              icon={Mail}
              error={errors.email}
            />

            {/* Password */}
            <InputField
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                tab === "signup" ? "Min. 10 characters" : "Enter your password"
              }
              icon={Lock}
              error={errors.password}
              rightElement={
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            {/* Error */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600 font-medium">
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold text-white transition-all duration-150 border-0 mt-1 ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-700 hover:bg-blue-800 active:scale-95 shadow-sm cursor-pointer"
              }`}
            >
              {loading ? (
                <>
                  <span
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    style={{
                      animation: "spin 0.7s linear infinite",
                    }}
                  />

                  {tab === "login" ? "Signing in…" : "Creating account…"}
                </>
              ) : (
                <>
                  {tab === "login" ? "Sign In" : "Create Account"}

                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-xs text-slate-500">
            {adminOnly
              ? "Administrator accounts are provisioned by an operator. Public signup cannot grant administrator permissions."
              : "Faculty and staff post directly. Students request approval only when they want to publish gigs."}
          </p>
          {/* Switch tab */}
          {!adminOnly && (
            <p className="text-center text-xs text-slate-500 mt-5">
              {tab === "login"
                ? "Don't have an account? "
                : "Already have an account? "}

              <button
                type="button"
                onClick={() => {
                  setTab(tab === "login" ? "signup" : "login");
                  setErrors({});
                }}
                className="text-blue-600 font-semibold hover:underline"
              >
                {tab === "login" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          )}
          <button
            type="button"
            onClick={() => navigate(adminOnly ? "/login" : "/admin-login")}
            className="mt-5 text-center w-full text-xs text-blue-700 font-semibold"
          >
            {adminOnly
              ? "Back to campus sign-in"
              : "Campus administrator? Admin sign-in →"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes popIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }

          70% {
            transform: scale(1.15);
          }

          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
