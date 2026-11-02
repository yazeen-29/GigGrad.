import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const cwd = process.cwd();
const require = createRequire(`${cwd}/Gig-Grad-Server/package.json`);
if (!process.env.TEST_DATABASE_URL)
  throw new Error(
    "Set TEST_DATABASE_URL to an isolated, migrated test database",
  );
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.JWT_SECRET =
  "browser-smoke-test-secret-with-at-least-32-characters";
const prisma = require("./src/lib/prisma");
const children = [];
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const suffix = Date.now();
let socket, userId, posterId, jobId;
const errors = [];
function start(cmd, args, env = {}) {
  const child = spawn(cmd, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: "ignore",
  });
  children.push(child);
  return child;
}
async function ready(url) {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return r;
    } catch {}
    await pause(200);
  }
  throw new Error(`Not ready: ${url}`);
}
try {
  start("node", ["Gig-Grad-Server/src/index.js"], { PORT: "5501" });
  start(
    "node",
    [
      "node_modules/vite/bin/vite.js",
      "--host",
      "127.0.0.1",
      "--port",
      "5517",
      "--strictPort",
    ],
    { API_PROXY_TARGET: "http://127.0.0.1:5501" },
  );
  await ready("http://127.0.0.1:5501/health");
  await ready("http://127.0.0.1:5517");
  const signup = async (name) => {
    const res = await fetch("http://127.0.0.1:5501/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email: `${name}${suffix}@campus.edu`,
        password: "BrowserTest123!",
        college: "Test Campus",
      }),
    });
    assert.equal(res.status, 201);
    return res.json();
  };
  const student = await signup("BrowserStudent");
  userId = student.user.id;
  const poster = await signup("BrowserPoster");
  posterId = poster.user.id;
  await prisma.user.update({
    where: { id: posterId },
    data: { posterStatus: "approved" },
  });
  const job = await prisma.job.create({
    data: {
      title: "Design a poster for campus festival",
      description:
        "Create a colorful event poster with all the details for our campus festival.",
      category: "Design",
      amount: 350,
      deadline: new Date(Date.now() + 86400000),
      postedById: posterId,
    },
  });
  jobId = job.id;
  start("/usr/bin/google-chrome-stable", [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--remote-debugging-port=9237",
    `--user-data-dir=/tmp/giggrad-chrome-${suffix}`,
    "about:blank",
  ]);
  const list = await (await ready("http://127.0.0.1:9237/json/list")).json();
  socket = new WebSocket(
    list.find((x) => x.type === "page").webSocketDebuggerUrl,
  );
  await new Promise((r) => socket.addEventListener("open", r, { once: true }));
  let seq = 0;
  const pending = new Map();
  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    if (data.id) {
      const p = pending.get(data.id);
      pending.delete(data.id);
      data.error ? p.reject(data.error) : p.resolve(data.result);
    }
    if (data.method === "Runtime.exceptionThrown")
      errors.push(
        data.params.exceptionDetails.text +
          " " +
          (data.params.exceptionDetails.exception?.description || ""),
      );
  });
  const call = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++seq;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  const evaluate = async (expression) => {
    const r = await call("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
    return r.result.value;
  };
  await call("Page.enable");
  await call("Runtime.enable");
  async function visit(path) {
    await call("Page.navigate", { url: `http://127.0.0.1:5517${path}` });
    await pause(1200);
  }
  async function waitForText(value) {
    for (let i = 0; i < 150; i++) {
      try {
        if ((await evaluate("document.body.innerText")).includes(value)) return;
      } catch {
        /* navigation can replace the execution context */
      }
      await pause(100);
    }
    throw new Error(
      `Expected text ${value}. Page: ${await evaluate("document.body.innerText")}. Browser errors: ${JSON.stringify(errors)}`,
    );
  }
  async function shot(name) {
    const result = await call("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: false,
    });
    await writeFile(
      `/tmp/giggrad-${name}.png`,
      Buffer.from(result.data, "base64"),
    );
  }
  await call("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await visit("/");
  await waitForText("Big talent.");
  assert.ok(
    (await evaluate("document.body.innerText")).includes("Big talent."),
  );
  await shot("desktop");
  await visit("/jobs");
  await waitForText(job.title);
  assert.ok((await evaluate("document.body.innerText")).includes(job.title));
  await evaluate(
    `document.querySelector('button[aria-label^="Save job:"]').click()`,
  );
  assert.ok((await evaluate("document.body.innerText")).includes("Saved (1)"));
  await visit(`/job-detail/${jobId}`);
  await waitForText("Sign in to apply");
  assert.ok(
    (await evaluate("document.body.innerText")).includes("Sign in to apply"),
  );
  await visit("/login");
  await waitForText("Sign In");
  await evaluate(`(() => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    const email = document.querySelector('input[type="email"]'); setter.call(email, ${JSON.stringify(student.user.email.toUpperCase())}); email.dispatchEvent(new Event('input', { bubbles: true }));
    const password = document.querySelector('input[type="password"]'); setter.call(password, 'BrowserTest123!'); password.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await pause(150);
  await evaluate(
    `document.querySelector('form button[type="submit"]').click()`,
  );
  await waitForText("YOUR CAMPUS WORKSPACE");
  await visit(`/job-detail/${jobId}`);
  await waitForText("Apply Now");
  assert.ok((await evaluate("document.body.innerText")).includes("Apply Now"));
  await evaluate(
    `[...document.querySelectorAll('button')].find(x=>x.innerText==='Apply Now').click()`,
  );
  await pause(100);
  await evaluate(
    `(()=>{const el=document.querySelector('textarea');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(el,'I would love to create the poster for your festival.');el.dispatchEvent(new Event('input',{bubbles:true}));})()`,
  );
  await pause(100);
  await evaluate(
    `[...document.querySelectorAll('button')].find(x=>x.innerText==='Submit Application').click()`,
  );
  await waitForText("Application submitted!");
  assert.ok(
    (await evaluate("document.body.innerText")).includes(
      "Application submitted!",
    ),
  );
  await visit("/dashboard");
  await waitForText(job.title);
  assert.ok((await evaluate("document.body.innerText")).includes(job.title));
  await shot("dashboard");
  async function loginAs(account) {
    await evaluate(
      `localStorage.removeItem('gg_token');localStorage.removeItem('gg_user')`,
    );
    await visit("/login");
    await waitForText("Sign In");
    await evaluate(`(() => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      const email = document.querySelector('input[type="email"]'); setter.call(email, ${JSON.stringify(account.user.email)}); email.dispatchEvent(new Event('input', { bubbles: true }));
      const password = document.querySelector('input[type="password"]'); setter.call(password, 'BrowserTest123!'); password.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
    await pause(100);
    await evaluate(
      `document.querySelector('form button[type="submit"]').click()`,
    );
    await waitForText("YOUR CAMPUS WORKSPACE");
  }
  await loginAs(poster);
  await visit(`/applicants/${jobId}`);
  await waitForText("Hire");
  await evaluate(
    `[...document.querySelectorAll('button')].find(button => button.innerText === 'Hire').click()`,
  );
  await waitForText("Hired for this job");
  await visit(`/messages/${jobId}`);
  await waitForText("Say hello");
  await evaluate(
    `(() => { const input = document.querySelector('#message-draft'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(input, 'Hello, welcome to the campus project!'); input.dispatchEvent(new Event('input', { bubbles: true })); })()`,
  );
  await pause(100);
  await evaluate(
    `document.querySelector('[aria-label="Send message"]').click()`,
  );
  await waitForText("Hello, welcome to the campus project!");
  await shot("chat");
  await loginAs(student);
  await visit(`/messages/${jobId}`);
  await waitForText("Hello, welcome to the campus project!");
  assert.equal(
    await evaluate("document.documentElement.scrollWidth <= window.innerWidth"),
    true,
    "desktop chat overflow",
  );
  await call("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await visit("/");
  assert.equal(
    await evaluate("document.documentElement.scrollWidth <= window.innerWidth"),
    true,
    "mobile overflow",
  );
  await shot("mobile");
  await evaluate(
    `document.querySelector('[aria-label="Toggle navigation"]').click()`,
  );
  await pause(100);
  assert.ok((await evaluate("document.body.innerText")).includes("My profile"));
  assert.deepEqual(errors, []);
  console.log(
    "Browser checks passed: desktop/mobile layouts, job discovery, bookmarks, direct links, public sign-in, login form, application submission, hiring, two-account chat, dashboard, mobile navigation. No uncaught browser exceptions.",
  );
} finally {
  if (socket) socket.close();
  for (const child of children) child.kill("SIGTERM");
  if (jobId) {
    await prisma.message.deleteMany({ where: { jobId } });
    await prisma.application.deleteMany({ where: { jobId } });
    await prisma.job.delete({ where: { id: jobId } });
  }
  await prisma.user.deleteMany({
    where: { id: { in: [userId, posterId].filter(Boolean) } },
  });
  await prisma.$disconnect();
}
