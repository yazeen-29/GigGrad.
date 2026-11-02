const { test } = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const mountWeb = require("../src/lib/web");
test("single-service hosting serves frontend routes without hiding API or asset errors", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "giggrad-web-"));
  await fs.mkdir(path.join(dir, "assets"));
  await fs.writeFile(
    path.join(dir, "index.html"),
    "<!doctype html><h1>GigGrad</h1>",
  );
  await fs.writeFile(
    path.join(dir, "assets", "app-123.js"),
    'console.log("app");',
  );
  const app = express();
  app.get("/api/example", (_, res) => res.json({ ok: true }));
  mountWeb(app, dir);
  app.use((_, res) => res.status(404).json({ error: "Route not found" }));
  const server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const route of ["/", "/profile", "/learn", "/job-detail/example"]) {
      const res = await fetch(base + route, {
        headers: { Accept: "text/html" },
      });
      assert.equal(res.status, 200);
      assert.match(await res.text(), /GigGrad/);
      assert.match(
        res.headers.get("content-security-policy"),
        /frame-ancestors 'none'/,
      );
      assert.equal(res.headers.get("cache-control"), "no-cache");
    }
    const asset = await fetch(base + "/assets/app-123.js");
    assert.equal(asset.status, 200);
    assert.match(asset.headers.get("cache-control"), /immutable/);
    assert.deepEqual(await (await fetch(base + "/api/example")).json(), {
      ok: true,
    });
    for (const route of [
      "/api",
      "/api/unknown",
      "/assets/missing.js",
      "/assets/missing",
      "/.env",
    ]) {
      const res = await fetch(base + route, {
        headers: { Accept: "text/html" },
      });
      assert.equal(res.status, 404, route);
      assert.doesNotMatch(await res.text(), /<h1>/);
    }
    assert.equal(
      (await fetch(base + "/profile", { method: "POST" })).status,
      404,
    );
  } finally {
    await new Promise((r) => server.close(r));
    await fs.rm(dir, { recursive: true, force: true });
  }
});
