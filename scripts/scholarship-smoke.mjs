import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { browserSession } from "./browser-session.mjs";
const browser = await browserSession();
const { visit, text, click, fill, evaluate, call, screenshot, errors, pause } =
  browser;
const require = createRequire(`${process.cwd()}/Gig-Grad-Server/package.json`);
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.TEST_DATABASE_URL } },
});
let userId;
try {
  await visit("/");
  await text("Big talent.");
  await pause(800);
  assert.equal(
    await evaluate('!!document.querySelector(".campus-canvas")'),
    true,
  );
  await click("Pause motion");
  assert.equal(
    await evaluate("document.documentElement.dataset.motion"),
    "paused",
  );
  await screenshot("creative-background");
  await click("Play background");
  await visit("/scholarships");
  await text("PM-USP Central Sector Scholarship");
  await screenshot("scholarships");
  await fill('input[aria-label="Search scholarships"]', "Pragati");
  await text("AICTE Pragati");
  assert.equal(
    (await evaluate("document.body.innerText")).includes(
      "PM-USP Central Sector Scholarship",
    ),
    false,
  );
  await fill('input[aria-label="Search scholarships"]', "");
  await click("Check eligibility");
  for (const [key, value] of Object.entries({
    indianCitizen: "true",
    course: "general_degree",
    entry: "first_year",
    regularCourse: "true",
    institutionApproved: "true",
    gender: "female",
    gapAfter12: "false",
    otherScholarship: "false",
    udid: "true",
    annualIncome: "300000",
    boardPercentile: "90",
    age: "18",
    disabilityPercent: "0",
  }))
    await fill(`#eligibility-${key}`, value);
  await click("Check listed criteria");
  await text("Your preliminary results");
  await text("Potential match");
  await screenshot("eligibility");
  await evaluate(
    `document.querySelector('[aria-label="Open Campus Companion"]').click()`,
  );
  await text("Campus Companion");
  await fill(
    "#assistant-message",
    "How do scholarship eligibility checks work?",
  );
  await evaluate(
    `document.querySelector('[aria-label="Send assistant message"]').click()`,
  );
  await text("A board percentile is not percentage marks.");
  assert.equal(
    (await evaluate("document.body.innerText")).includes("Built-in guidance"),
    true,
  );
  await screenshot("scholarship-assistant");
  await evaluate(
    `document.querySelector('[aria-label="Close assistant"]').click()`,
  );
  const email = `scholar-browser-${Date.now()}@campus.edu`,
    password = "ScholarshipBrowser123!";
  const response = await fetch("http://127.0.0.1:5601/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Scholarship browser test",
      email,
      password,
      college: "Isolated test campus",
    }),
  });
  assert.equal(response.status, 201);
  userId = (await response.json()).user.id;
  await visit("/login");
  await text("Sign In");
  await fill("input[type=email]", email);
  await fill("input[type=password]", password);
  await evaluate(`document.querySelector('form button[type=submit]').click()`);
  await text("YOUR CAMPUS WORKSPACE");
  await visit("/scholarships");
  await text("PM-USP Central Sector Scholarship");
  await click("Save to tracker");
  await text("Scholarship saved to your tracker.");
  await evaluate(
    `[...document.querySelectorAll('button')].find(button=>button.innerText.startsWith('My tracker')).click()`,
  );
  await text("Document preparation checklist");
  await fill("select", "PREPARING");
  await fill(
    "textarea",
    "Ask the college office for an enrolment certificate.",
  );
  await fill("input[type=date]", "2026-12-20");
  await evaluate(`document.querySelector('input[type=checkbox]').click()`);
  await click("Save progress");
  await text("Progress saved");
  await visit("/scholarships");
  await text("My tracker (1)");
  await evaluate(
    `[...document.querySelectorAll('button')].find(button=>button.innerText.startsWith('My tracker')).click()`,
  );
  await text("Document preparation checklist");
  assert.equal(
    await evaluate('document.querySelector("textarea").value'),
    "Ask the college office for an enrolment certificate.",
  );
  assert.equal(
    await evaluate('document.querySelector("input[type=checkbox]").checked'),
    true,
  );
  await screenshot("scholarship-tracker");
  await call("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await visit("/scholarships");
  await text("PM-USP Central Sector Scholarship");
  assert.equal(
    await evaluate("document.documentElement.scrollWidth<=innerWidth"),
    true,
  );
  await screenshot("scholarship-mobile");
  await call("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  assert.equal(
    await evaluate(
      'getComputedStyle(document.querySelector(".canvas-wash")).animationName',
    ),
    "none",
  );
  assert.deepEqual(errors, []);
  console.log(
    "Scholarship browser checks passed: creative background, motion controls, official catalogue search, explained eligibility, guided assistant, private tracker persistence/checklists, mobile layout and reduced motion.",
  );
} finally {
  if (userId) await prisma.user.delete({ where: { id: userId } });
  await prisma.$disconnect();
  await browser.close();
}
