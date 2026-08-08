import { useState } from "react";

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
      <label className="text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon size={15} />
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full ${
            Icon ? "pl-9" : "pl-3"
          } ${
            rightElement ? "pr-10" : "pr-3"
          } py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            error
              ? "border-red-300 bg-red-50"
              : "border-slate-200"
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
export default function LoginPage({ onLogin }) {
  const [tab, setTab] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
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

    if (!email.trim()) {
      e.email = "Email is required";
    } else if (!email.includes("@")) {
      e.email = "Enter a valid email address";
    } else if (
      !email.endsWith(".ac.in") &&
      !email.endsWith(".edu")
    ) {
      e.email =
        "Use your college email (e.g. name@college.ac.in)";
    }

    if (!password) {
      e.password = "Password is required";
    } else if (password.length < 6) {
      e.password = "Password must be at least 6 characters";
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
        result = await authAPI.login({
          email,
          password,
        });
      } else {
        result = await authAPI.signup({
          name,
          email,
          password,
          role: role.toUpperCase(),
          college: "Amrita Vishwa Vidyapeetham",
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div
            className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{
              animation:
                "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
            }}
          >
            <CheckCircle
              size={32}
              className="text-emerald-600"
            />
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
    <div className="min-h-screen bg-slate-50 flex">

      {/* ── Left panel ─────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-700 flex-col justify-between p-12">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Zap
              size={18}
              className="text-white fill-white"
            />
          </div>

          <span className="font-extrabold text-white text-xl tracking-tight">
            GigGrad
          </span>
        </div>

        {/* Main copy */}
        <div>
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Earn money on campus.
            <br />
            <span className="text-blue-200">
              No WhatsApp needed.
            </span>
          </h1>

          <p className="text-blue-200 text-base leading-relaxed mb-8">
            A trusted platform connecting students who want
            to earn with teachers who need quick help — all
            within your college network.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "200+", label: "Jobs Posted" },
              { value: "450+", label: "Students Earning" },
              { value: "4.8★", label: "Avg Rating" },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="bg-white/10 rounded-xl p-4 text-center"
              >
                <p className="text-2xl font-extrabold text-white">
                  {value}
                </p>

                <p className="text-blue-200 text-xs mt-1">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-300 text-xs">
          🔒 Only verified college email holders can sign in.
        </p>
      </div>

      {/* ── Right panel ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">

        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
            <Zap
              size={15}
              className="text-white fill-white"
            />
          </div>

          <span className="font-extrabold text-slate-900 text-lg">
            GigGrad
          </span>
        </div>

        <div className="w-full max-w-sm">

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
              {tab === "login"
                ? "Welcome back"
                : "Create your account"}
            </h2>

            <p className="text-sm text-slate-500">
              {tab === "login"
                ? "Sign in with your college email to continue."
                : "Join GigGrad and start earning on campus."}
            </p>
          </div>

          {/* Tab switcher */}
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

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >

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

                <div className="grid grid-cols-2 gap-2">
                  {["student", "teacher"].map((r) => (
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
                        ? "🎓 Student"
                        : "📋 Teacher / Staff"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Email */}
            <InputField
              label="College Email"
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
                tab === "signup"
                  ? "Min. 6 characters"
                  : "Enter your password"
              }
              icon={Lock}
              error={errors.password}
              rightElement={
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((s) => !s)
                  }
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff size={15} />
                  ) : (
                    <Eye size={15} />
                  )}
                </button>
              }
            />

            {/* Forgot password */}
            {tab === "login" && (
              <div className="text-right -mt-2">
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}

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
                      animation:
                        "spin 0.7s linear infinite",
                    }}
                  />

                  {tab === "login"
                    ? "Signing in…"
                    : "Creating account…"}
                </>
              ) : (
                <>
                  {tab === "login"
                    ? "Sign In"
                    : "Create Account"}

                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200" />

            <span className="text-xs text-slate-400 font-medium">
              or continue with
            </span>

            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Google */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-sm font-semibold text-slate-700 shadow-sm cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>

            Sign in with Google
          </button>

          {/* College email note */}
          <div className="mt-5 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <AlertCircle
              size={13}
              className="text-amber-500 mt-0.5 flex-shrink-0"
            />

            <p className="text-xs text-amber-700 leading-relaxed">
              Only <strong>college email addresses</strong>{" "}
              are accepted (e.g.{" "}
              <code className="bg-amber-100 px-1 rounded">
                name@college.ac.in
              </code>
              ). Personal Gmail accounts will be rejected.
            </p>
          </div>

          {/* Switch tab */}
          <p className="text-center text-xs text-slate-500 mt-5">
            {tab === "login"
              ? "Don't have an account? "
              : "Already have an account? "}

            <button
              type="button"
              onClick={() => {
                setTab(
                  tab === "login" ? "signup" : "login"
                );
                setErrors({});
              }}
              className="text-blue-600 font-semibold hover:underline"
            >
              {tab === "login"
                ? "Sign Up"
                : "Sign In"}
            </button>
          </p>
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