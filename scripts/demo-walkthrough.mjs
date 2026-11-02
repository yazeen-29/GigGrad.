import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { browserSession } from "./browser-session.mjs";
if (!process.env.TEST_DATABASE_URL)
  throw new Error("Use an isolated TEST_DATABASE_URL");
const originalUrl = process.env.TEST_DATABASE_URL;
const schema = `role_walkthrough_${Date.now()}`;
const isolatedUrl = new URL(originalUrl);
isolatedUrl.searchParams.set("schema", schema);
process.env.TEST_DATABASE_URL = isolatedUrl.toString();
execFileSync("npm", ["--prefix", "Gig-Grad-Server", "run", "db:migrate"], {
  env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
  stdio: "inherit",
});
execFileSync("node", ["Gig-Grad-Server/scripts/seed-demo.js"], {
  env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
  stdio: "inherit",
});
const { password } = JSON.parse(
  await readFile(".demo-credentials.local.json", "utf8"),
);
const browser = await browserSession();
const { evaluate, visit, text, click, fill, screenshot, call, errors, pause } =
  browser;
const passed = [];
async function login(key) {
  await visit("/");
  await text("GigGrad");
  await evaluate(
    `localStorage.removeItem('gg_token');localStorage.removeItem('gg_user')`,
  );
  await visit(key === "admin" ? "/admin-login" : "/login");
  await text(key === "admin" ? "Administrator sign-in" : "Sign In");
  await fill("input[type=email]", `${key}@demo.giggrad.invalid`);
  await fill("input[type=password]", password);
  await evaluate(`document.querySelector('form button[type=submit]').click()`);
  try {
    await text(
      key === "admin" ? "CAMPUS ADMINISTRATION" : "YOUR CAMPUS WORKSPACE",
    );
  } catch (error) {
    await screenshot(`failed-login-${key}`);
    const formState = await evaluate(`({
      path: location.pathname,
      emailPresent: Boolean(document.querySelector('input[type=email]')?.value),
      passwordPresent: Boolean(document.querySelector('input[type=password]')?.value),
      valid: document.querySelector('form')?.checkValidity(),
      disabled: document.querySelector('form button[type=submit]')?.disabled
    })`);
    throw new Error(
      `Login walkthrough failed for ${key}: ${JSON.stringify(formState)}`,
      { cause: error },
    );
  }
}
try {
  await visit("/");
  await text("Big talent.");
  await pause(900);
  await screenshot("landing");
  assert.equal(
    await evaluate("document.documentElement.scrollWidth <= innerWidth"),
    true,
  );
  await evaluate(
    `document.querySelector('[aria-label="Choose your perspective"]').scrollIntoView({block:'center'})`,
  );
  await pause(500);
  await click("I need a hand");
  await text("Put a clear brief into the world.");
  await screenshot("landing-journey");
  await call("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  assert.equal(
    await evaluate(
      `getComputedStyle(document.querySelector('.skill-ribbon-track')).animationName`,
    ),
    "none",
  );
  await call("Emulation.setEmulatedMedia", { features: [] });
  passed.push("animated landing, perspective switch, reduced motion");
  await visit("/demo");
  await text("Every perspective.");
  await screenshot("demo-hub");
  await login("student");
  await visit("/profile");
  await text("Aarav Menon");
  await text("Words from collaborators.");
  assert.equal(await evaluate('document.querySelectorAll("form").length'), 0);
  await screenshot("student-profile");
  await click("Edit profile");
  await text("Make it yours.");
  await fill(
    "textarea",
    "[DEMO] Profile edits persist after saving and reloading.",
  );
  await click("Save changes");
  await text("Profile updated. Looking good.");
  await visit("/profile");
  await text("Profile edits persist after saving and reloading.");
  assert.equal(await evaluate('document.querySelectorAll("form").length'), 0);
  await visit("/dashboard");
  await text("View your profile");
  passed.push(
    "student profile overview, editing, reload persistence and accurate completion prompt",
  );
  await visit("/jobs");
  await text("campus arts festival");
  await evaluate(
    `document.querySelector('button[aria-label^="Save job:"]').click()`,
  );
  await text("Saved (1)");
  await visit("/job-detail/giggrad-demo-job-open-design");
  await text("Apply Now");
  await click("Apply Now");
  await fill(
    "textarea",
    "I enjoy campus design and can deliver a clear, accessible poster.",
  );
  await click("Submit Application");
  await text("Application submitted!");
  passed.push("discovery, saved jobs and real application");
  await visit("/messages/giggrad-demo-job-active");
  await text("Welcome aboard!");
  await fill("#message-draft", "Hello from the student walkthrough.");
  await evaluate(
    `document.querySelector('[aria-label="Send message"]').click()`,
  );
  await text("Hello from the student walkthrough.");
  await screenshot("student-chat");
  passed.push("student project chat");
  await login("teacher");
  assert.equal(
    (await evaluate("document.body.innerText")).includes("My applications"),
    false,
  );
  await text("Bring your academic projects forward.");
  await text("Student funding resources to share.");
  await screenshot("faculty-dashboard");
  await visit("/scholarships");
  await text("Help students find");
  await text("Check student criteria");
  await screenshot("faculty-funding-reference");
  await visit("/applicants/giggrad-demo-job-open-research");
  await text("Hire");
  await click("Hire");
  await text("Hired for this job");
  await screenshot("teacher-hire");
  await visit("/job-detail/giggrad-demo-job-approval");
  await text("Approve & Complete");
  await click("Approve & Complete");
  await text("Leave a Review");
  await evaluate(
    `document.querySelector('[aria-label="Rate 5 stars"]').click()`,
  );
  await fill(
    "textarea",
    "Clear work and excellent communication during the demo.",
  );
  await click("Submit Review");
  await text("Review submitted!");
  passed.push("faculty applicant review, hire, approval and review");
  await visit("/post-job");
  await text("Job Title");
  await fill(
    'input[placeholder^="e.g."]',
    "[DEMO] A new workshop brief from the walkthrough",
  );
  await fill("select", "Design");
  await fill(
    "textarea",
    "Create an accessible campus workshop poster and a matching social media layout.",
  );
  await click("Continue");
  await fill("input[type=number]", "600");
  await fill(
    "input[type=date]",
    new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  );
  await click("Continue");
  await text("Review your job");
  await click("Post Job");
  await text("Job Posted!");
  passed.push("faculty creates a gig through the complete form");
  await login("club");
  await visit("/dashboard");
  await text("My postings");
  await click("My applications");
  await screenshot("club-dual-role");
  await visit("/messages/giggrad-demo-job-active");
  await text("Hello from the student walkthrough.");
  await screenshot("club-chat");
  passed.push("club posting and worker views, counterpart chat");
  await visit("/applicants/giggrad-demo-job-open-design");
  await text("Hire");
  await click("Reject");
  await text("Rejected");
  passed.push("club rejects an application");
  await login("staff");
  await text("Keep campus operations moving.");
  assert.equal(
    (await evaluate("document.body.innerText")).includes("My applications"),
    false,
  );
  await screenshot("staff-dashboard");
  await visit("/my-jobs");
  await text("registration desk");
  await screenshot("staff-postings");
  await visit("/job-detail/giggrad-demo-job-disputed");
  await text("Disputed");
  passed.push("staff postings and disputed project");
  await login("pending-club");
  await visit("/post-job");
  await text("Request under review");
  await screenshot("pending-access");
  await login("admin");
  await text("Keep campus work fair and moving.");
  assert.equal(
    (await evaluate("document.body.innerText")).includes("My applications"),
    false,
  );
  await screenshot("administrator-dashboard");
  await visit("/admin");
  await text("Nova Robotics Club");
  await screenshot("admin-queues");
  await click("Approve access");
  await text("Complete job");
  await fill(
    "textarea[id^=decision-]",
    "Reviewed the changed scope and completed work with both participants.",
  );
  await click("Complete job");
  await pause(500);
  passed.push("administrator access approval and dispute resolution");
  await login("pending-club");
  await visit("/post-job");
  await text("Job Title");
  passed.push("approved club gains posting access on the same account");
  await evaluate(
    `localStorage.removeItem('gg_token');localStorage.removeItem('gg_user')`,
  );
  await visit("/profile/giggrad-demo-user-student");
  await text("Aarav Menon");
  assert.equal(
    (await evaluate("document.body.innerText")).includes(
      "student@demo.giggrad.invalid",
    ),
    false,
  );
  assert.equal(await evaluate('document.querySelectorAll("form").length'), 0);
  passed.push("public profile excludes email and edit controls");
  await call("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await visit("/");
  await text("Big talent.");
  assert.equal(
    await evaluate("document.documentElement.scrollWidth <= innerWidth"),
    true,
  );
  await screenshot("landing-mobile");
  assert.deepEqual(errors, []);
  await writeFile(
    "/tmp/giggrad-role-demo/report.json",
    JSON.stringify({ passed, browserErrors: errors }, null, 2),
  );
  console.log(
    `Role walkthrough passed: ${passed.length} scenarios across all six accounts. Screenshots and report: /tmp/giggrad-role-demo/`,
  );
} finally {
  await browser.close();
  const require = createRequire(
    `${process.cwd()}/Gig-Grad-Server/package.json`,
  );
  const { PrismaClient } = require("@prisma/client");
  const cleanup = new PrismaClient({
    datasources: { db: { url: originalUrl } },
  });
  try {
    if (!/^role_walkthrough_\d+$/.test(schema))
      throw new Error("Invalid temporary schema");
    await cleanup.$executeRawUnsafe(`DROP SCHEMA "${schema}" CASCADE`);
  } finally {
    await cleanup.$disconnect();
  }
}
