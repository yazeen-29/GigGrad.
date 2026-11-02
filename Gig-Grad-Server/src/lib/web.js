const express = require("express");
const path = require("node:path");
const fs = require("node:fs");

// The same build can run behind nginx or serve its frontend directly on Render.
module.exports = function mountWeb(app, directory) {
  const index = path.join(directory, "index.html");
  if (!fs.existsSync(index))
    throw new Error(
      "Frontend build missing. Run npm run build before starting with SERVE_WEB=1.",
    );
  const assets = express.static(directory, {
    dotfiles: "ignore",
    index: false,
    redirect: false,
    setHeaders(res, file) {
      res.setHeader(
        "Cache-Control",
        file.startsWith(path.join(directory, "assets") + path.sep)
          ? "public, max-age=31536000, immutable"
          : "no-cache",
      );
    },
  });
  app.use((req, res, next) => {
    if (req.path === "/api" || req.path.startsWith("/api/")) return next();
    res.set({
      "X-Frame-Options": "DENY",
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    });
    assets(req, res, (error) => {
      if (error) return next(error);
      // Browser routes reload correctly; missing assets and API routes stay 404s.
      if (
        !["GET", "HEAD"].includes(req.method) ||
        req.path.split("/").some((part) => part.startsWith(".")) ||
        req.path.startsWith("/assets/") ||
        path.extname(req.path) ||
        !req.accepts("html")
      )
        return next();
      res.set("Cache-Control", "no-cache");
      res.sendFile(index);
    });
  });
};
