import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
export async function browserSession() {
  if (!process.env.TEST_DATABASE_URL)
    throw new Error(
      "TEST_DATABASE_URL must reference an isolated, migrated test database",
    );
  const children = [],
    errors = [];
  const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const env = {
    ...process.env,
    DATABASE_URL: process.env.TEST_DATABASE_URL,
    JWT_SECRET: "role-walkthrough-isolated-secret-at-least-32-characters",
  };
  function start(command, args, extra = {}) {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: { ...env, ...extra },
      stdio: "ignore",
    });
    children.push(child);
  }
  async function ready(url) {
    for (let i = 0; i < 80; i++) {
      try {
        const response = await fetch(url);
        if (response.ok) return response;
      } catch {}
      await pause(150);
    }
    throw new Error(`Server not ready: ${url}`);
  }
  let socket;
  async function close() {
    socket?.close();
    children.forEach((child) => child.kill("SIGTERM"));
  }
  try {
    start("node", ["Gig-Grad-Server/src/index.js"], { PORT: "5601" });
    start(
      "node",
      [
        "node_modules/vite/bin/vite.js",
        "--host",
        "127.0.0.1",
        "--port",
        "5617",
        "--strictPort",
      ],
      { API_PROXY_TARGET: "http://127.0.0.1:5601" },
    );
    await ready("http://127.0.0.1:5601/ready");
    await ready("http://127.0.0.1:5617");
    start("/usr/bin/google-chrome-stable", [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--remote-debugging-port=9247",
      `--user-data-dir=/tmp/giggrad-role-chrome-${Date.now()}`,
      "about:blank",
    ]);
    const pages = await (await ready("http://127.0.0.1:9247/json/list")).json();
    socket = new WebSocket(
      pages.find((page) => page.type === "page").webSocketDebuggerUrl,
    );
    await new Promise((resolve) =>
      socket.addEventListener("open", resolve, { once: true }),
    );
    let sequence = 0;
    const pending = new Map();
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const task = pending.get(message.id);
        if (!task) return;
        pending.delete(message.id);
        clearTimeout(task.timer);
        message.error
          ? task.reject(message.error)
          : task.resolve(message.result);
      }
      if (message.method === "Runtime.exceptionThrown")
        errors.push(
          message.params.exceptionDetails.exception?.description ||
            message.params.exceptionDetails.text,
        );
    });
    const call = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const id = ++sequence;
        const timer = setTimeout(() => {
          pending.delete(id);
          reject(new Error(`Browser command timed out: ${method}`));
        }, 15000);
        pending.set(id, { resolve, reject, timer });
        socket.send(JSON.stringify({ id, method, params }));
      });
    const evaluate = async (expression) => {
      const response = await call("Runtime.evaluate", {
        expression,
        awaitPromise: true,
        returnByValue: true,
      });
      if (response.exceptionDetails)
        throw new Error(response.exceptionDetails.text);
      return response.result.value;
    };
    await call("Page.enable");
    await call("Runtime.enable");
    await call("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 1100,
      deviceScaleFactor: 1,
      mobile: false,
    });
    async function visit(path) {
      await call("Page.navigate", { url: `http://127.0.0.1:5617${path}` });
      await pause(400);
    }
    async function text(value) {
      for (let i = 0; i < 180; i++) {
        try {
          if (
            (await evaluate("document.body.innerText"))
              .toLowerCase()
              .includes(value.toLowerCase())
          )
            return;
        } catch {}
        await pause(100);
      }
      throw new Error(
        `Expected ${value}: ${await evaluate("document.body.innerText")}`,
      );
    }
    async function click(label) {
      await evaluate(
        `(() => { const button = [...document.querySelectorAll('button')].find(element => element.innerText.trim() === ${JSON.stringify(label)}); if (!button) throw new Error('Button missing'); button.click(); })()`,
      );
    }
    async function fill(selector, value) {
      await evaluate(
        `(() => { const input = document.querySelector(${JSON.stringify(selector)}); const prototype = input.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : input.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(prototype, 'value').set.call(input, ${JSON.stringify(value)}); input.dispatchEvent(new Event(input.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); })()`,
      );
      await pause(80);
    }
    async function screenshot(name) {
      await mkdir("/tmp/giggrad-role-demo", { recursive: true });
      const result = await call("Page.captureScreenshot", {
        format: "png",
        fromSurface: false,
        captureBeyondViewport: false,
      });
      await writeFile(
        `/tmp/giggrad-role-demo/${name}.png`,
        Buffer.from(result.data, "base64"),
      );
    }
    return {
      call,
      evaluate,
      visit,
      text,
      click,
      fill,
      screenshot,
      close,
      errors,
      pause,
    };
  } catch (error) {
    await close();
    throw error;
  }
}
