import { useEffect, useState } from "react";

import { getUser, clearAuth } from "./lib/api";

import Navbar from "./components/Navbar";
import MyJobsPage from "./pages/MyJobsPage";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import JobsPage from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";
import PostJobPage from "./pages/PostJobPage";
import DashboardPage from "./pages/DashboardPage";


const PUBLIC_PAGES = ["landing", "login"];


export default function App() {
  const savedUser = getUser();

  const [page, setPageState] = useState("landing");
  const [selectedJob, setSelectedJob] = useState(null);

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!savedUser
  );

  const [currentUser, setCurrentUser] = useState(
    savedUser
  );

  const [intendedPage, setIntendedPage] =
    useState("landing");

  const [mobileOpen, setMobileOpen] =
    useState(false);


  // ─────────────────────────────────────────────
  // Browser Back / Forward
  // ─────────────────────────────────────────────

  useEffect(() => {
    const handlePopState = (event) => {
      const state = event.state;

      if (!state) {
        setPageState("landing");
        setSelectedJob(null);
        return;
      }

      setPageState(state.page || "landing");
      setSelectedJob(state.selectedJob || null);
      setMobileOpen(false);

      window.scrollTo(0, 0);
    };

    window.addEventListener(
      "popstate",
      handlePopState
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handlePopState
      );
    };
  }, []);


  // ─────────────────────────────────────────────
  // Navigation
  // ─────────────────────────────────────────────

  const navigate = (
    nextPage,
    nextSelectedJob = null
  ) => {
    setMobileOpen(false);

    // Protected page
    if (
      !isLoggedIn &&
      !PUBLIC_PAGES.includes(nextPage)
    ) {
      setIntendedPage(nextPage);

      setPageState("login");
      setSelectedJob(null);

      window.history.pushState(
        {
          page: "login",
          selectedJob: null,
        },
        "",
        window.location.pathname
      );

      window.scrollTo(0, 0);
      return;
    }

    // IMPORTANT:
    // If a job is supplied, store it BEFORE rendering
    // JobDetailPage.
    if (nextSelectedJob) {
      setSelectedJob(nextSelectedJob);
    } else if (nextPage !== "job-detail") {
      setSelectedJob(null);
    }

    setPageState(nextPage);

    window.history.pushState(
      {
        page: nextPage,
        selectedJob: nextSelectedJob,
      },
      "",
      window.location.pathname
    );

    window.scrollTo(0, 0);
  };


  // ─────────────────────────────────────────────
  // Login
  // ─────────────────────────────────────────────

  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setCurrentUser(user);

    const destination =
      intendedPage === "login"
        ? "landing"
        : intendedPage;

    setPageState(destination);
    setSelectedJob(null);

    window.history.replaceState(
      {
        page: destination,
        selectedJob: null,
      },
      "",
      window.location.pathname
    );

    window.scrollTo(0, 0);
  };


  // ─────────────────────────────────────────────
  // Logout
  // ─────────────────────────────────────────────

  const handleLogout = () => {
    clearAuth();

    setIsLoggedIn(false);
    setCurrentUser(null);
    setSelectedJob(null);
    setMobileOpen(false);

    setPageState("landing");

    window.history.replaceState(
      {
        page: "landing",
        selectedJob: null,
      },
      "",
      window.location.pathname
    );

    window.scrollTo(0, 0);
  };


  // ─────────────────────────────────────────────
  // Browser history initial state
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (!window.history.state) {
      window.history.replaceState(
        {
          page: "landing",
          selectedJob: null,
        },
        "",
        window.location.pathname
      );
    }
  }, []);


  // ─────────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────────

  if (page === "login") {
    return (
      <LoginPage
        onLogin={handleLogin}
      />
    );
  }


  // ─────────────────────────────────────────────
  // APP
  // ─────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">

      <Navbar
        page={page}
        setPage={navigate}
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        onLogout={handleLogout}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className="pt-14">

        {/* HOME */}

        {page === "landing" && (
          <LandingPage
            setPage={navigate}
          />
        )}


        {/* JOBS */}

        {page === "jobs" && (
          <JobsPage
            setPage={navigate}
            setSelectedJob={setSelectedJob}
          />
        )}


        {/* JOB DETAIL */}

        {page === "job-detail" && (
          selectedJob ? (
            <JobDetailPage
              job={selectedJob}
              setPage={navigate}
              currentUser={currentUser}
            />
          ) : (
            <div className="max-w-xl mx-auto px-4 py-20 text-center">

              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Job not selected
              </h2>

              <p className="text-sm text-slate-500 mb-5">
                The selected job could not be loaded.
              </p>

              <button
                onClick={() => navigate("jobs")}
                className="text-sm font-semibold text-blue-700 hover:underline"
              >
                ← Back to Jobs
              </button>

            </div>
          )
        )}


        {/* POST JOB */}

        {page === "post-job" && (
          <PostJobPage
            setPage={navigate}
          />
        )}

        {page === "my-jobs" && <MyJobsPage setPage={navigate} setSelectedJob={setSelectedJob} currentUser={currentUser} />}
        {/* DASHBOARD */}

        {page === "dashboard" && (
          <DashboardPage
            setPage={navigate}
            setSelectedJob={setSelectedJob}
            currentUser={currentUser}
          />
        )}

      </main>
    </div>
  );
}