import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { resolveIdentity, canPostJobs } from "../utils/verification";

const AuthContext = createContext(null);
const STORAGE_KEY = "giggrad_user";

// Read the persisted user synchronously so the first render is already correct —
// prevents a logged-in user from flashing the login screen on refresh.
function readPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persist(user) {
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  } catch { /* storage blocked */ }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readPersisted);

  // login(email, overrides) resolves the full identity + posting capability
  // from the email (mock verification). When Firebase Auth lands, replace the
  // resolve call with the real users/{uid} record — call sites don't change.
  const login = useCallback((email, overrides = {}) => {
    const nextUser = { ...resolveIdentity(email), ...overrides };
    persist(nextUser);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    persist(null);
    setUser(null);
  }, []);

  // Patch the current user (e.g. requesting posting access → posterStatus).
  const updateUser = useCallback((patch) => {
    setUser(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      persist(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ user, isLoggedIn: !!user, canPostJobs: canPostJobs(user), login, logout, updateUser }),
    [user, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook colocated with its provider by design
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
