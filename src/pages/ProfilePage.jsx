import { useEffect, useState } from "react";
import { getExperience } from "../utils/experience";
import { usersAPI } from "../lib/api";
import Avatar from "../components/ui/Avatar";
import Loading from "../components/ui/Loading";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle,
  GraduationCap,
  Pencil,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from "lucide-react";

export default function ProfilePage({
  currentUser,
  profileId,
  onUpdate,
  setPage,
}) {
  const own = !!currentUser && (!profileId || profileId === currentUser.id);
  const [data, setData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const result = await (own
          ? usersAPI.myProfile()
          : usersAPI.getProfile(profileId));
        if (active) {
          setData(result);
          setError("");
        }
      } catch (err) {
        if (active) setError(err.message);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [own, profileId, retry]);
  function edit() {
    setForm({
      name: data.user.name,
      college: data.user.college,
      bio: data.user.bio || "",
      skills: data.user.skills.join(", "),
    });
    setMessage("");
    setError("");
    setEditing(true);
  }
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const user = await usersAPI.updateMe({
        ...form,
        skills: [
          ...new Set(
            form.skills
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean),
          ),
        ],
      });
      onUpdate(user);
      setData((previous) => ({
        ...previous,
        user: { ...previous.user, ...user },
      }));
      setEditing(false);
      setMessage("Profile updated. Looking good.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  if (!data)
    return error ? (
      <div role="alert" className="max-w-xl mx-auto py-20 px-5 text-center">
        <p className="text-red-700">{error}</p>
        <button
          onClick={() => setRetry(retry + 1)}
          className="mt-4 text-blue-700 font-bold"
        >
          Try again
        </button>
      </div>
    ) : (
      <Loading label="Loading profile…" />
    );
  const { user, stats, portfolio, reviews } = data;
  const experience = getExperience(user);
  const type =
    user.posterType === "club"
      ? "Campus club"
      : user.posterType === "council"
        ? "Student council"
        : user.role === "ADMIN"
          ? "Administrator"
          : user.posterType === "staff"
            ? "Campus staff"
            : user.role === "TEACHER"
              ? "Faculty"
              : "Student";
  const complete = [
    user.name,
    user.college,
    user.bio?.trim(),
    user.skills.length,
  ].filter(Boolean).length;
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <span className="eyebrow">
        {own ? experience.profileTitle : "MEET YOUR CAMPUS COMMUNITY"}
      </span>
      <section className="mt-5 bg-white border border-slate-200 rounded-3xl overflow-hidden">
        <div className="profile-cover h-32 sm:h-40 relative">
          <Sparkles
            className="absolute top-8 right-10 text-white/30"
            size={68}
          />
          <span className="absolute bottom-5 right-6 text-blue-100 text-sm font-medium">
            Small gigs. Real growth.
          </span>
        </div>
        <div className="px-6 sm:px-8 pb-8">
          <div className="flex items-end justify-between gap-3 -mt-9 relative">
            <div className="p-1.5 bg-white rounded-full">
              <Avatar
                name={user.name}
                size="xl"
                role={user.role.toLowerCase()}
              />
            </div>
            {own && !editing && (
              <button
                onClick={edit}
                className="inline-flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold bg-white hover:bg-slate-50"
              >
                <Pencil size={16} />
                Edit profile
              </button>
            )}
          </div>
          <div className="mt-5 flex flex-wrap gap-2 items-center">
            <span className="text-xs rounded-full bg-blue-50 text-blue-700 px-3 py-1.5 font-semibold">
              {type}
            </span>
            {user.posterStatus === "approved" && (
              <span className="text-xs flex gap-1.5 items-center text-emerald-700 bg-emerald-50 rounded-full px-3 py-1.5">
                <ShieldCheck size={13} />
                Approved poster
              </span>
            )}
            {user.email?.endsWith("@demo.giggrad.invalid") && (
              <span className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full">
                Demo account
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mt-4">
            {user.name}
          </h1>
          <p className="flex items-center gap-2 text-slate-500 mt-3">
            <GraduationCap size={18} />
            {user.college}
          </p>
          <p className="text-sm text-slate-400 mt-2">
            On GigGrad since{" "}
            {new Date(user.createdAt).toLocaleDateString("en-IN", {
              month: "long",
              year: "numeric",
            })}
          </p>
          <div className="flex flex-wrap gap-7 sm:gap-12 mt-7 pt-6 border-t border-slate-100">
            {[
              [
                stats.completedJobs,
                experience.isStudent ? "Completed gigs" : "Completed projects",
              ],
              [stats.postedJobs, "Gigs posted"],
              [
                stats.reviewCount
                  ? `${stats.averageRating.toFixed(1)} / 5`
                  : "New here",
                `${stats.reviewCount} ${stats.reviewCount === 1 ? "review" : "reviews"}`,
              ],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-sm text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {message && (
        <p
          role="status"
          className="mt-5 rounded-xl bg-emerald-50 text-emerald-700 p-4 flex items-center gap-2"
        >
          <CheckCircle size={18} />
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-5 text-red-700 bg-red-50 p-4 rounded-xl">
          {error}
        </p>
      )}
      {editing ? (
        <form
          onSubmit={save}
          className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 mt-7 space-y-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Make it yours.</h2>
            <button
              type="button"
              aria-label="Cancel editing"
              disabled={busy}
              onClick={() => {
                setEditing(false);
                setError("");
              }}
            >
              <X size={20} />
            </button>
          </div>
          {[
            ["name", "Full name", 100],
            ["college", "College", 160],
            ["bio", "About you", 2000],
            ["skills", "Skills — comma separated, up to 10", 500],
          ].map(([key, label, max]) => (
            <label
              className="block font-semibold text-sm text-slate-700"
              key={key}
            >
              {label}
              {key === "bio" ? (
                <textarea
                  rows={5}
                  maxLength={max}
                  className="form-input mt-2"
                  value={form[key]}
                  onChange={(event) =>
                    setForm({ ...form, [key]: event.target.value })
                  }
                />
              ) : (
                <input
                  required={key === "name" || key === "college"}
                  maxLength={max}
                  className="form-input mt-2"
                  value={form[key]}
                  onChange={(event) =>
                    setForm({ ...form, [key]: event.target.value })
                  }
                />
              )}
            </label>
          ))}
          <p className="text-xs text-slate-500">
            Your account email stays private: {user.email}
          </p>
          <div className="flex gap-3">
            <button
              disabled={busy}
              className="bg-blue-700 text-white rounded-xl px-5 py-3 text-sm font-bold disabled:opacity-50"
            >
              {busy ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setEditing(false);
                setError("");
              }}
              className="px-5 py-3 text-sm text-slate-600 font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="grid lg:grid-cols-[1fr_320px] gap-7 mt-7">
          <div className="space-y-7">
            <section className="profile-section">
              <h2>About {own ? "you" : user.name.split(" ")[0]}</h2>
              <p className="mt-4 text-slate-600 leading-relaxed whitespace-pre-wrap">
                {user.bio ||
                  (own
                    ? experience.isStudent
                      ? "Your story belongs here. Add a short introduction so people know what you bring to a project."
                      : experience.isAdmin
                        ? "Add your campus administration responsibilities and support contact context."
                        : "Introduce your department, areas of work, and how students can collaborate with you."
                    : "This person is still putting their introduction together.")}
              </p>
              <h3 className="font-bold mt-7 mb-3">{experience.skillsLabel}</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills.length ? (
                  user.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-semibold"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No skills added yet.</p>
                )}
              </div>
            </section>
            <section className="profile-section">
              <h2>{experience.portfolioTitle}</h2>
              <p className="text-sm text-slate-500 mt-2">
                {experience.isStudent
                  ? "Completed projects become part of your campus portfolio."
                  : "A history of the campus projects you have coordinated."}
              </p>
              {portfolio.length ? (
                <div className="mt-5 space-y-3">
                  {portfolio.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => setPage("job-detail", job)}
                      className="flex items-center justify-between gap-3 text-left w-full border border-slate-200 rounded-xl p-4 hover:border-blue-300"
                    >
                      <div>
                        <p className="font-bold">{job.title}</p>
                        <p className="text-sm text-slate-500 mt-1">
                          {job.category} ·{" "}
                          {job.postedById === user.id
                            ? "Posted this gig"
                            : "Completed this gig"}
                        </p>
                      </div>
                      <ArrowUpRight
                        size={18}
                        className="text-blue-600 shrink-0"
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-5 bg-slate-50 rounded-xl p-6 text-slate-500 text-sm">
                  <BookOpen size={24} className="text-slate-300 mb-3" />
                  {experience.isStudent
                    ? "Every first project starts somewhere. Completed work will appear here."
                    : experience.isAdmin
                      ? "No completed campus tasks are associated with this account."
                      : "Completed projects you coordinate will appear here."}
                </div>
              )}
            </section>
            <section className="profile-section">
              <h2>Words from collaborators.</h2>
              {reviews.length ? (
                <div className="mt-5 space-y-5">
                  {reviews.map((review) => (
                    <article
                      key={review.id}
                      className="border-b border-slate-100 pb-5 last:border-0"
                    >
                      <div
                        className="flex gap-1 text-amber-500"
                        aria-label={`${review.rating} out of 5 stars`}
                      >
                        {Array.from({ length: review.rating }, (_, i) => (
                          <Star key={i} size={15} fill="currentColor" />
                        ))}
                      </div>
                      <p className="mt-3 text-slate-600">
                        {review.comment ||
                          "A rating from a completed collaboration."}
                      </p>
                      <button
                        onClick={() => setPage("profile", review.reviewer)}
                        className="mt-3 text-sm font-bold text-slate-800 hover:text-blue-700"
                      >
                        {review.reviewer.name}
                      </button>
                      <p className="text-xs text-slate-400 mt-1">
                        {review.job.title}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm mt-4">
                  Reviews will appear after completed collaborations.
                </p>
              )}
            </section>
          </div>
          <aside className="space-y-5">
            {own && (
              <section className="profile-section">
                <span className="eyebrow">
                  {experience.isAdmin
                    ? "ACCOUNT OVERVIEW"
                    : experience.isStudent
                      ? "A STRONG FIRST IMPRESSION"
                      : "YOUR PROFESSIONAL PROFILE"}
                </span>
                <h2 className="mt-3">
                  {complete === 4
                    ? "You’re ready to go."
                    : "A little more you."}
                </h2>
                <div className="h-2 bg-slate-100 rounded-full mt-5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${complete * 25}%` }}
                  />
                </div>
                <p className="text-sm text-slate-500 mt-3">
                  {complete * 25}% profile complete
                </p>
                <ul className="mt-5 space-y-3 text-sm">
                  {[
                    ["Name", user.name],
                    ["College", user.college],
                    ["Introduction", user.bio?.trim()],
                    ["Skills", user.skills.length],
                  ].map(([label, value]) => (
                    <li key={label} className="flex gap-2 items-center">
                      <Check
                        size={15}
                        className={
                          value ? "text-emerald-600" : "text-slate-300"
                        }
                      />
                      {label}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={
                    complete === 4
                      ? () =>
                          setPage(
                            experience.isAdmin
                              ? "admin"
                              : experience.isStudent
                                ? "jobs"
                                : "dashboard",
                          )
                      : edit
                  }
                  className="mt-6 text-blue-700 font-bold text-sm"
                >
                  {complete === 4
                    ? experience.isAdmin
                      ? "Open administration →"
                      : experience.isStudent
                        ? "Find your next opportunity →"
                        : "Open project dashboard →"
                    : "Finish your profile →"}
                </button>
              </section>
            )}
            <section className="rounded-3xl bg-slate-900 text-white p-6">
              <Sparkles size={24} className="text-blue-300" />
              <h3 className="font-bold text-xl mt-4">Experience speaks.</h3>
              <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                {experience.isAdmin
                  ? "Student access and conflict decisions are managed through your administrator workspace."
                  : experience.isStudent
                    ? "Clear skills, thoughtful introductions, and good work build a reputation that stays with you."
                    : "A clear professional profile helps students understand your projects and how you work."}
              </p>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
