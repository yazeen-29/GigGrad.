import { useEffect, useState } from "react";
import { authAPI, getUser, clearAuth } from "../lib/api";
export default function AccountPage() {
  const [link] = useState(() =>
    Object.fromEntries(new URLSearchParams(location.hash.slice(1))),
  );
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    history.replaceState(null, "", location.pathname);
  }, []);
  async function action(kind) {
    setBusy(true);
    setError("");
    try {
      const result =
        kind === "consume"
          ? await authAPI.consume({ ...link, password })
          : kind === "resend"
            ? await authAPI.resend()
            : await authAPI.forgot(email);
      if (kind === "consume" && link.kind === "reset") {
        clearAuth();
        window.dispatchEvent(new Event("giggrad:logout"));
      }
      setMessage(result.message);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="max-w-lg mx-auto px-5 py-16">
      <span className="eyebrow">YOUR CAMPUS ACCOUNT</span>
      <h1 className="text-3xl font-bold mt-4">
        {link.kind === "verify"
          ? "Verify your email"
          : link.kind === "reset"
            ? "Choose a new password"
            : "Account help"}
      </h1>
      <p className="text-slate-500 mt-4 mb-6">
        Verification confirms your email address. Teachers and staff post
        directly after verification; student posting approval is separate.
      </p>
      {link.token ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            action("consume");
          }}
        >
          {link.kind === "reset" && (
            <label className="block">
              New password
              <input
                type="password"
                className="form-input mt-2 mb-4"
                autoComplete="new-password"
                minLength={10}
                maxLength={72}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          )}
          <button disabled={busy || !!message} className="studio-primary">
            {busy
              ? "Working…"
              : link.kind === "verify"
                ? "Verify my email"
                : "Update password"}
          </button>
        </form>
      ) : (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              action("forgot");
            }}
          >
            <label>
              Registered email
              <input
                required
                type="email"
                autoComplete="email"
                className="form-input mt-2 mb-4"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <button disabled={busy} className="studio-primary">
              Send password reset
            </button>
          </form>
          {getUser() && (
            <button
              disabled={busy}
              className="studio-secondary mt-4"
              onClick={() => action("resend")}
            >
              Resend verification email
            </button>
          )}
        </>
      )}
      {error && (
        <p role="alert" className="text-red-700 mt-5">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="text-emerald-700 mt-5">
          {message}
        </p>
      )}
      {message && link.kind === "verify" && (
        <a href="/dashboard" className="block text-blue-700 mt-6">
          Continue to my workspace →
        </a>
      )}
      <a href="/login" className="block text-blue-700 mt-6">
        Back to sign in →
      </a>
    </div>
  );
}
