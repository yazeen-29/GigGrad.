import {
  Award,
  ArrowUpRight,
  FileText,
  Code2,
  Globe,
  ContactRound,
  Plus,
  FolderGit2,
  Trash2,
} from "lucide-react";
const linkFields = [
  ["portfolioUrl", "Portfolio website", "https://your-portfolio.com", Globe],
  ["resumeUrl", "CV / résumé link", "https://drive.google.com/…", FileText],
  ["githubUrl", "GitHub profile", "https://github.com/username", Code2],
  [
    "linkedinUrl",
    "LinkedIn profile",
    "https://www.linkedin.com/in/username",
    ContactRound,
  ],
];
export function StudentShowcaseEditor({ form, setForm, busy }) {
  const change = (key, value) =>
    setForm((previous) => ({ ...previous, [key]: value }));
  const update = (key, index, field, value) =>
    change(
      key,
      form[key].map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  return (
    <fieldset className="showcase-editor" disabled={busy}>
      <legend>Your student showcase</legend>
      <p className="showcase-hint">
        Help posters see what you can do. These optional details appear on your
        public profile. Share a view-only CV link and leave out private contact
        or identity details.
      </p>
      <label className="showcase-field">
        Professional headline
        <input
          className="form-input"
          value={form.headline}
          maxLength={120}
          placeholder="Computer science student · Frontend developer"
          onChange={(e) => change("headline", e.target.value)}
        />
      </label>
      <div className="showcase-link-grid">
        {linkFields.map(([key, label, placeholder]) => (
          <label className="showcase-field" key={key}>
            {label}
            <input
              type="url"
              className="form-input"
              value={form[key]}
              maxLength={500}
              placeholder={placeholder}
              onChange={(e) => change(key, e.target.value)}
            />
          </label>
        ))}
      </div>
      <p className="showcase-hint">
        Use complete HTTPS links. CVs and portfolios open on the hosting service
        you choose; check that viewers have access.
      </p>
      {[
        ["projects", "Projects", FolderGit2],
        ["achievements", "Achievements", Award],
      ].map(([key, label, Icon]) => (
        <section className="showcase-edit-group" key={key}>
          <div className="showcase-section-heading">
            <h3>
              <Icon size={19} />
              {label}
            </h3>
            <span>{form[key].length} / 8</span>
          </div>
          {form[key].map((item, index) => (
            <div className="showcase-edit-card" key={index}>
              <div className="showcase-section-heading">
                <strong>
                  {key === "projects" ? "Project" : "Achievement"} {index + 1}
                </strong>
                <button
                  type="button"
                  aria-label={`Remove ${key === "projects" ? "project" : "achievement"} ${index + 1}`}
                  onClick={() =>
                    change(
                      key,
                      form[key].filter((_, i) => i !== index),
                    )
                  }
                >
                  <Trash2 size={17} />
                </button>
              </div>
              <label className="showcase-field">
                Title
                <input
                  required
                  minLength={2}
                  maxLength={120}
                  className="form-input"
                  value={item.title}
                  placeholder={
                    key === "projects"
                      ? "Campus event registration website"
                      : "Hackathon finalist"
                  }
                  onChange={(e) => update(key, index, "title", e.target.value)}
                />
              </label>
              {key === "projects" ? (
                <label className="showcase-field">
                  What you built
                  <textarea
                    className="form-input"
                    rows={3}
                    maxLength={600}
                    value={item.description}
                    placeholder="Your contribution, tools used and the result."
                    onChange={(e) =>
                      update(key, index, "description", e.target.value)
                    }
                  />
                </label>
              ) : (
                <div className="showcase-link-grid">
                  <label className="showcase-field">
                    Organization / issuer
                    <input
                      className="form-input"
                      maxLength={120}
                      value={item.issuer}
                      onChange={(e) =>
                        update(key, index, "issuer", e.target.value)
                      }
                    />
                  </label>
                  <label className="showcase-field">
                    Year
                    <input
                      className="form-input"
                      inputMode="numeric"
                      pattern="(19|20)[0-9]{2}"
                      maxLength={4}
                      placeholder="2026"
                      value={item.year}
                      onChange={(e) =>
                        update(key, index, "year", e.target.value)
                      }
                    />
                  </label>
                </div>
              )}
              <label className="showcase-field">
                {key === "projects"
                  ? "Project / repository link"
                  : "Certificate / evidence link (optional)"}
                <input
                  type="url"
                  required={key === "projects"}
                  className="form-input"
                  maxLength={500}
                  placeholder="https://…"
                  value={item.url}
                  onChange={(e) => update(key, index, "url", e.target.value)}
                />
              </label>
            </div>
          ))}
          <button
            type="button"
            className="showcase-add"
            disabled={form[key].length >= 8}
            onClick={() =>
              change(key, [
                ...form[key],
                key === "projects"
                  ? { title: "", description: "", url: "" }
                  : { title: "", issuer: "", year: "", url: "" },
              ])
            }
          >
            <Plus size={16} /> Add{" "}
            {key === "projects" ? "project" : "achievement"}
          </button>
        </section>
      ))}
    </fieldset>
  );
}
function External({ url, children, className }) {
  if (!/^https:\/\//i.test(url || "")) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
      <ArrowUpRight size={16} aria-hidden="true" />
    </a>
  );
}
export default function StudentShowcase({ user, own, onEdit }) {
  const projects = Array.isArray(user.projects) ? user.projects : [];
  const achievements = Array.isArray(user.achievements)
    ? user.achievements
    : [];
  const links = linkFields.filter(([key]) => user[key]);
  return (
    <>
      <section className="profile-section student-showcase">
        <div className="showcase-section-heading">
          <h2>
            <Globe size={20} />
            Portfolio & professional links
          </h2>
          {own && (
            <button onClick={onEdit} className="showcase-edit-link">
              Edit showcase
            </button>
          )}
        </div>
        <p className="showcase-hint">
          A closer look at the work, experience and skills behind the profile.
        </p>
        {links.length ? (
          <div className="showcase-public-links">
            {links.map(([key, label, , Icon]) => (
              <External
                key={key}
                url={user[key]}
                className="showcase-public-link"
              >
                <Icon size={21} />
                <span>
                  <strong>{label}</strong>
                  <small>{new URL(user[key]).hostname}</small>
                </span>
              </External>
            ))}
          </div>
        ) : (
          <div className="showcase-empty">
            <Globe size={24} />
            <p>
              {own
                ? "Bring your work together. Add your portfolio, CV, GitHub or LinkedIn."
                : "No professional links shared yet."}
            </p>
            {own && <button onClick={onEdit}>Add professional links →</button>}
          </div>
        )}
      </section>
      <section className="profile-section student-showcase">
        <div className="showcase-section-heading">
          <h2>
            <FolderGit2 size={20} />
            Featured projects
          </h2>
          <span>{projects.length} projects</span>
        </div>
        <p className="showcase-hint">
          Independent work, coursework and side projects, shared by this
          student.
        </p>
        {projects.length ? (
          <div className="showcase-project-grid">
            {projects.map((project, i) => (
              <article className="showcase-project" key={i}>
                <span className="showcase-project-index">
                  PROJECT {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{project.title}</h3>
                {project.description && <p>{project.description}</p>}
                <External url={project.url} className="showcase-project-open">
                  View project
                </External>
              </article>
            ))}
          </div>
        ) : (
          <div className="showcase-empty">
            <FolderGit2 size={24} />
            <p>
              {own
                ? "Your experience starts before your first gig. Share a project you are proud of."
                : "No independent projects shared yet."}
            </p>
            {own && <button onClick={onEdit}>Add your first project →</button>}
          </div>
        )}
      </section>
      <section className="profile-section student-showcase">
        <div className="showcase-section-heading">
          <h2>
            <Award size={20} />
            Achievements & credentials
          </h2>
          <span>Student-provided</span>
        </div>
        {achievements.length ? (
          <div className="showcase-achievements">
            {achievements.map((item, i) => (
              <article key={i}>
                <div className="showcase-award">
                  <Award size={22} />
                </div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{[item.issuer, item.year].filter(Boolean).join(" · ")}</p>
                  {item.url && (
                    <External url={item.url} className="showcase-project-open">
                      View credential
                    </External>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="showcase-empty">
            <Award size={24} />
            <p>
              {own
                ? "Celebrate a competition, certification, leadership role or academic milestone."
                : "No achievements shared yet."}
            </p>
            {own && <button onClick={onEdit}>Add an achievement →</button>}
          </div>
        )}
      </section>
    </>
  );
}
