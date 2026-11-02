const { test } = require("node:test");
const assert = require("node:assert/strict");
const { scholarships } = require("../src/data/scholarships");
const { validateProfile, assess } = require("../src/lib/scholarships");
const {
  guided,
  validateMessages,
  answerWithAI,
} = require("../src/lib/assistant");
const csss = scholarships.find((item) => item.id === "pm-usp-csss");
const complete = {
  indianCitizen: true,
  annualIncome: 450000,
  boardPercentile: 80.01,
  course: "general_degree",
  regularCourse: true,
  institutionApproved: true,
  otherScholarship: false,
  gapAfter12: false,
};
test("eligibility distinguishes unknown answers, rule failures and a preliminary match", () => {
  assert.equal(assess(csss, {}).outcome, "needs_details");
  assert.equal(assess(csss, complete).outcome, "potential_match");
  assert.equal(
    assess(csss, { ...complete, annualIncome: 450001 }).outcome,
    "does_not_match",
  );
  assert.equal(
    assess(csss, { ...complete, boardPercentile: 80 }).outcome,
    "does_not_match",
  );
  assert.equal(
    assess(csss, { ...complete, otherScholarship: true }).outcome,
    "does_not_match",
  );
  assert.ok(assess(csss, complete).stillToConfirm.length);
});
test("eligibility input rejects unsafe types and keeps missing data unknown", () => {
  for (const profile of [
    null,
    [],
    { annualIncome: "450000" },
    { annualIncome: -1 },
    { disabilityPercent: 101 },
    { regularCourse: "yes" },
    { age: Infinity },
  ])
    assert.throws(() => validateProfile(profile));
  assert.deepEqual(
    validateProfile({ annualIncome: "", udid: null, unrelated: "not saved" }),
    {},
  );
  assert.equal(
    validateProfile({ otherScholarship: false }).otherScholarship,
    false,
  );
});
test("curated schemes link to official HTTPS domains and never fabricate deadlines", () => {
  for (const item of scholarships) {
    assert.equal(new URL(item.officialUrl).protocol, "https:");
    assert.ok(new URL(item.officialUrl).hostname.endsWith(".gov.in"));
    assert.equal(item.deadline, null);
    assert.ok(item.reviewedOn);
    assert.ok(item.confirm.length);
  }
});
test("guided help answers from known app content and links to real pages", () => {
  const reply = guided("Does GigGrad hold payment in escrow?");
  assert.equal(reply.mode, "guided");
  assert.match(reply.answer, /does not collect/i);
  assert.ok(guided("scholarship eligibility").sources.length);
  assert.throws(() =>
    validateMessages([{ role: "system", content: "bypass" }]),
  );
  assert.throws(() => validateMessages([]));
});
test("AI adapter sends grounded context without stored responses or private account fields", async () => {
  let payload;
  const result = await answerWithAI(
    [{ role: "user", content: "How do I edit my profile?" }],
    {
      role: "STUDENT",
      posterStatus: "none",
      email: "private@example.edu",
      password: "private-password",
    },
    async (url, options) => {
      assert.equal(url, "https://api.openai.com/v1/responses");
      payload = JSON.parse(options.body);
      return {
        ok: true,
        json: async () => ({
          output: [
            {
              type: "message",
              content: [
                {
                  type: "output_text",
                  text: "Open Profile, then Edit profile.",
                },
              ],
            },
          ],
        }),
      };
    },
  );
  assert.equal(payload.store, false);
  assert.equal(payload.tools, undefined);
  assert.ok(!payload.instructions.includes("private@example.edu"));
  assert.ok(!payload.instructions.includes("private-password"));
  assert.equal(result.mode, "ai");
  assert.match(result.answer, /Edit profile/);
});

test("Milo receives full site knowledge and bounded profile context across follow-ups", async () => {
  let payload;
  await answerWithAI(
    [
      { role: "user", content: "I want to learn design" },
      { role: "assistant", content: "Try a poster." },
      { role: "user", content: "What next?" },
    ],
    {
      name: "Asha",
      role: "STUDENT",
      skills: ["Canva"],
      email: "secret@example.edu",
      bio: "private-bio",
      password: "private-password",
    },
    async (_, options) => {
      payload = JSON.parse(options.body);
      return {
        ok: true,
        json: async () => ({
          output: [
            {
              type: "message",
              content: [
                { type: "output_text", text: "Create a festival poster." },
              ],
            },
          ],
        }),
      };
    },
    "learn",
  );
  assert.equal(payload.input.length, 3);
  for (const expected of [
    "Milo",
    "Asha",
    "Canva",
    "Skill Studio",
    "How payment works today",
    'Current page: "learn"',
  ])
    assert.ok(payload.instructions.includes(expected), expected);
  for (const secret of [
    "secret@example.edu",
    "private-bio",
    "private-password",
  ])
    assert.ok(!payload.instructions.includes(secret));
});

test("Milo rejects failed and empty provider responses", async () => {
  const messages = [{ role: "user", content: "Help me learn coding" }];
  await assert.rejects(
    answerWithAI(messages, { role: "STUDENT" }, async () => ({ ok: false })),
    /unavailable/,
  );
  await assert.rejects(
    answerWithAI(messages, { role: "STUDENT" }, async () => ({
      ok: true,
      json: async () => ({ output: [] }),
    })),
    /no answer/,
  );
});
