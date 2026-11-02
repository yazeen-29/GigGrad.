import { lazy, Suspense, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authAPI, getUser, getToken, saveAuth, clearAuth } from "./lib/api";
import Navbar from "./components/Navbar";
import CampusCanvas from "./components/CampusCanvas";
import { canPostJobs } from "./utils/verification";
const CampusAssistant = lazy(() => import("./components/CampusAssistant"));
const LearnPage = lazy(() => import("./pages/LearnPage"));
const ScholarshipsPage = lazy(() => import("./pages/ScholarshipsPage"));
import Loading from "./components/ui/Loading";
const DemoPage = import.meta.env.DEV
  ? lazy(() => import("./pages/DemoPage"))
  : null;
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const JobsPage = lazy(() => import("./pages/JobsPage"));
const JobDetailPage = lazy(() => import("./pages/JobDetailPage"));
const PostJobPage = lazy(() => import("./pages/PostJobPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const MyJobsPage = lazy(() => import("./pages/MyJobsPage"));
const ApplicantsPage = lazy(() => import("./pages/ApplicantsPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const RequestAccessPage = lazy(() => import("./pages/RequestAccessPage"));
const MessagesPage = lazy(() => import("./pages/MessagesPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const publicPages = [
  ...(import.meta.env.DEV ? ["demo"] : []),
  "landing",
  "login",
  "admin-login",
  "jobs",
  "job-detail",
  "profile",
  "scholarships",
  "learn",
];
export default function App() {
  const location = useLocation();
  const route = useNavigate();
  const [currentUser, setCurrentUser] = useState(getUser);
  const [mobileOpen, setMobileOpen] = useState(false);
  const rawPage = location.pathname.split("/")[1] || "landing";
  const canPost = canPostJobs(currentUser);
  const page =
    !currentUser && !publicPages.includes(rawPage)
      ? "login"
      : ["post-job", "my-jobs", "applicants"].includes(rawPage) && !canPost
        ? "request-access"
        : rawPage;
  const selectedJob =
    location.state?.job ||
    (location.pathname.split("/")[2]
      ? { id: location.pathname.split("/")[2] }
      : null);
  const navigate = (next, job) => {
    setMobileOpen(false);
    route(
      next === "landing"
        ? "/"
        : `/${next}${job?.id && ["job-detail", "applicants", "messages", "profile"].includes(next) ? `/${job.id}` : ""}`,
      {
        state: {
          job: job || null,
          returnTo: next === "login" ? location.pathname : null,
        },
      },
    );
    window.scrollTo(0, 0);
  };
  const logout = () => {
    clearAuth();
    setCurrentUser(null);
    route("/", { replace: true });
  };
  useEffect(() => {
    const expire = () => {
      setCurrentUser(null);
    };
    window.addEventListener("giggrad:logout", expire);
    const syncSession = (event) => {
      if (event.key === "gg_user" || (event.key === "gg_token" && !getToken()))
        setCurrentUser(getUser());
    };
    window.addEventListener("storage", syncSession);
    let active = true;
    const sessionToken = getToken();
    if (sessionToken)
      authAPI
        .me()
        .then((user) => {
          if (active && getToken() === sessionToken) {
            saveAuth(getToken(), user);
            setCurrentUser(user);
          }
        })
        .catch(() => {});
    return () => {
      active = false;
      window.removeEventListener("giggrad:logout", expire);
      window.removeEventListener("storage", syncSession);
    };
  }, []);
  const updateUser = (user) => {
    saveAuth(getToken(), user);
    setCurrentUser(user);
  };
  const props = { setPage: navigate, currentUser, setSelectedJob: () => {} };
  let content;
  switch (page) {
    case "demo":
      content = DemoPage ? (
        <DemoPage />
      ) : (
        <p className="p-12 text-center">Page not found</p>
      );
      break;
    case "landing":
      content = <LandingPage {...props} />;
      break;
    case "admin-login":
    case "login":
      content = (
        <LoginPage
          key={`${rawPage}:${location.state?.email || "login"}`}
          adminOnly={rawPage === "admin-login"}
          initialEmail={location.state?.email || ""}
          onLogin={(user) => {
            setCurrentUser(user);
            route(
              user.role === "ADMIN"
                ? "/admin"
                : (location.state?.returnTo === "/login"
                    ? "/dashboard"
                    : location.state?.returnTo) ||
                    (publicPages.includes(rawPage)
                      ? "/dashboard"
                      : location.pathname),
              { replace: true },
            );
          }}
        />
      );
      break;
    case "jobs":
      content = <JobsPage {...props} />;
      break;
    case "job-detail":
      content = selectedJob ? (
        <JobDetailPage key={selectedJob.id} {...props} job={selectedJob} />
      ) : (
        <JobsPage {...props} />
      );
      break;
    case "post-job":
      content = <PostJobPage {...props} />;
      break;
    case "my-jobs":
      content = <MyJobsPage {...props} />;
      break;
    case "applicants":
      content = (
        <ApplicantsPage
          key={selectedJob?.id}
          {...props}
          jobId={selectedJob?.id}
        />
      );
      break;
    case "dashboard":
      content = <DashboardPage {...props} />;
      break;
    case "request-access":
      content = <RequestAccessPage {...props} onUpdate={updateUser} />;
      break;
    case "messages":
      content = (
        <MessagesPage
          key={selectedJob?.id || "inbox"}
          {...props}
          jobId={selectedJob?.id}
        />
      );
      break;
    case "learn":
      content = <LearnPage key={currentUser?.id || "guest"} {...props} />;
      break;
    case "scholarships":
      content = (
        <ScholarshipsPage key={currentUser?.id || "guest"} {...props} />
      );
      break;
    case "profile":
      content =
        currentUser || selectedJob?.id ? (
          <ProfilePage
            key={selectedJob?.id || currentUser.id}
            {...props}
            profileId={selectedJob?.id}
            onUpdate={updateUser}
          />
        ) : (
          <LoginPage
            onLogin={(user) => {
              setCurrentUser(user);
              route("/profile", { replace: true });
            }}
          />
        );
      break;
    case "admin":
      content =
        currentUser?.role === "ADMIN" ? (
          <AdminPage {...props} />
        ) : (
          <p className="p-12 text-center">Administrator access required.</p>
        );
      break;
    default:
      content = (
        <div className="p-16 text-center">
          <h1 className="text-2xl font-bold">Page not found</h1>
          <button
            onClick={() => navigate("jobs")}
            className="mt-4 text-blue-700"
          >
            Explore jobs →
          </button>
        </div>
      );
  }
  return (
    <div className="min-h-screen app-world">
      <CampusCanvas />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {!["login", "admin-login"].includes(page) && (
        <Navbar
          page={page}
          setPage={navigate}
          currentUser={currentUser}
          isLoggedIn={!!currentUser}
          onLogout={logout}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
      )}
      <main
        id="main"
        className={["login", "admin-login"].includes(page) ? "" : "pt-[76px]"}
      >
        <Suspense fallback={<Loading label="Loading…" />}>{content}</Suspense>
      </main>
      <Suspense fallback={null}>
        <CampusAssistant
          key={currentUser?.id || "guest"}
          setPage={navigate}
          currentUser={currentUser}
          currentPage={page}
        />
      </Suspense>
    </div>
  );
}
