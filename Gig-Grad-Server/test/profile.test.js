const { test } = require("node:test");
const assert = require("node:assert/strict");
const { showcase } = require("../src/lib/profile");
test("student showcase validates links, strips extra fields and supports clearing", () => {
  const data = showcase({
    headline: "  Frontend developer ",
    githubUrl: "https://github.com/student",
    resumeUrl: "https://example.com/cv.pdf",
    projects: [
      {
        title: "Campus app",
        description: "Built in React",
        url: "https://example.com/app",
        admin: true,
      },
    ],
    achievements: [
      {
        title: "Hackathon finalist",
        issuer: "Campus club",
        year: "2026",
        url: "",
      },
    ],
    role: "ADMIN",
  });
  assert.equal(data.headline, "Frontend developer");
  assert.equal(data.role, undefined);
  assert.equal(data.projects[0].admin, undefined);
  assert.equal(data.achievements[0].year, "2026");
  assert.deepEqual(
    showcase({ projects: [], achievements: [], resumeUrl: "" }),
    { projects: [], achievements: [], resumeUrl: "" },
  );
});
test("student showcase rejects unsafe links, invalid years and oversized collections", () => {
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,hello",
    "http://example.com",
    "https://user:password@example.com",
    "not-a-url",
  ])
    assert.throws(() => showcase({ portfolioUrl: url }));
  assert.throws(() =>
    showcase({ githubUrl: "https://github.com.evil.example/student" }),
  );
  assert.throws(() =>
    showcase({
      projects: Array(9).fill({ title: "Project", url: "https://example.com" }),
    }),
  );
  assert.throws(() => showcase({ projects: [{ title: "Project", url: "" }] }));
  assert.throws(() =>
    showcase({ achievements: [{ title: "Award", year: "oops" }] }),
  );
  assert.throws(() => showcase({ achievements: [null] }));
  assert.throws(() => showcase({ headline: { text: "bad" } }));
});
