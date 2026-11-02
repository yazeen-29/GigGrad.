const { test } = require("node:test");
const assert = require("node:assert/strict");
const { ready, deliver } = require("../src/lib/mail");
test("email setup fails closed and HTTPS delivery keeps tokens in URL fragments", async () => {
  const keys = [
    "NODE_ENV",
    "APP_ORIGIN",
    "MAIL_FROM",
    "RESEND_API_KEY",
    "SMTP_HOST",
    "SMTP_USER",
    "SMTP_PASS",
    "SMTP_FROM",
    "SMTP_PORT",
    "RENDER",
  ];
  const old = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
  const originalFetch = global.fetch;
  try {
    for (const key of keys) delete process.env[key];
    process.env.NODE_ENV = "production";
    assert.equal(ready(), false);
    process.env.APP_ORIGIN = "http://example.com";
    process.env.RESEND_API_KEY = "mock-key";
    process.env.MAIL_FROM = "Campus <hello@example.com>";
    assert.equal(ready(), false);
    process.env.APP_ORIGIN = "https://campus.example.com";
    assert.equal(ready(), true);
    let payload;
    global.fetch = async (url, options) => {
      assert.equal(url, "https://api.resend.com/emails");
      payload = JSON.parse(options.body);
      return { ok: true };
    };
    await deliver("student@campus.edu", "verify", "a".repeat(64));
    assert.deepEqual(payload.to, ["student@campus.edu"]);
    const url = new URL(payload.text.match(/https:\/\/\S+/)[0]);
    assert.equal(url.pathname, "/account");
    assert.equal(url.search, "");
    assert.match(url.hash, /kind=verify/);
    assert.match(url.hash, /token=aaaa/);
    global.fetch = async () => ({ ok: false });
    await assert.rejects(
      deliver("student@campus.edu", "reset", "b".repeat(64)),
      /unavailable/,
    );
    delete process.env.RESEND_API_KEY;
    Object.assign(process.env, {
      RENDER: "true",
      SMTP_HOST: "smtp.example.com",
      SMTP_USER: "user",
      SMTP_PASS: "mock",
      SMTP_FROM: "hello@example.com",
      SMTP_PORT: "587",
    });
    assert.equal(ready(), false);
  } finally {
    global.fetch = originalFetch;
    for (const key of keys) {
      if (old[key] === undefined) delete process.env[key];
      else process.env[key] = old[key];
    }
  }
});
