import { createContext, useContext, useState } from "react";
import { authAPI, getUser, saveAuth, clearAuth, getToken } from "../lib/api";
import { canPostJobs } from "../utils/verification";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(getUser);
  async function login(credentials) {
    const result = await authAPI.login(credentials);
    saveAuth(result.token, result.user);
    setUser(result.user);
    return result.user;
  }
  function logout() {
    clearAuth();
    setUser(null);
  }
  function updateUser(next) {
    saveAuth(getToken(), next);
    setUser(next);
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        canPostJobs: canPostJobs(user),
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("AuthProvider is required");
  return value;
}
