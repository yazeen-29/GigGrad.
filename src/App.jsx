import { useEffect } from "react";
import { Routes, Route, Outlet, Navigate, useLocation } from "react-router-dom";

import Navbar         from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage         from "./pages/LoginPage";
import LandingPage       from "./pages/LandingPage";
import JobsPage          from "./pages/JobsPage";
import JobDetailPage     from "./pages/JobDetailPage";
import PostJobPage       from "./pages/PostJobPage";
import DashboardPage     from "./pages/DashboardPage";
import MyJobsPage        from "./pages/MyJobsPage";
import ApplicantsPage    from "./pages/ApplicantsPage";
import RequestAccessPage from "./pages/RequestAccessPage";
import AdminPage         from "./pages/AdminPage";

// Scroll to top on every route change (replaces the old manual window.scrollTo)
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Shared shell: navbar + main. Login renders outside this (no navbar).
function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-14">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Standalone — no navbar */}
        <Route path="/login" element={<LoginPage />} />

        {/* Everything else shares the navbar shell */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<LandingPage />} />

          {/* Worker side */}
          <Route path="/jobs"      element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
          <Route path="/jobs/:id"  element={<ProtectedRoute><JobDetailPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/request-access" element={<ProtectedRoute><RequestAccessPage /></ProtectedRoute>} />

          {/* Poster side — requires posting rights */}
          <Route path="/post-job" element={<ProtectedRoute need="poster"><PostJobPage /></ProtectedRoute>} />
          <Route path="/my-jobs"  element={<ProtectedRoute need="poster"><MyJobsPage /></ProtectedRoute>} />
          <Route path="/my-jobs/:id/applicants" element={<ProtectedRoute need="poster"><ApplicantsPage /></ProtectedRoute>} />

          {/* Admin side */}
          <Route path="/admin" element={<ProtectedRoute need="admin"><AdminPage /></ProtectedRoute>} />

          {/* Unknown URL → landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  );
}
