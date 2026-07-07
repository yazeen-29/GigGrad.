import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Gates routes by capability:
//   need="auth"   → must be logged in (default)
//   need="poster" → must have posting rights (else → request access)
//   need="admin"  → must be an admin (else → home)
// Not-logged-in always goes to /login, remembering where they were headed.
export default function ProtectedRoute({ children, need = "auth" }) {
  const { user, isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (need === "poster" && user.posterStatus !== "approved") {
    return <Navigate to="/request-access" replace />;
  }
  if (need === "admin" && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}
