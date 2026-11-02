import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const server = fileURLToPath(new URL("../Gig-Grad-Server/", import.meta.url));
if (
  !process.env.DATABASE_URL ||
  !process.env.JWT_SECRET ||
  process.env.JWT_SECRET.length < 32
) {
  throw new Error(
    "Set DATABASE_URL and a JWT_SECRET of at least 32 characters in the hosting environment.",
  );
}
process.env.NODE_ENV ||= "production";
process.env.SERVE_WEB = "1";
// Free services have no separate pre-deploy job. Deploy only additive migrations
// on this single instance; never use schema push/reset or seed demo accounts.
execFileSync(
  process.execPath,
  [
    fileURLToPath(
      new URL(
        "../Gig-Grad-Server/node_modules/prisma/build/index.js",
        import.meta.url,
      ),
    ),
    "migrate",
    "deploy",
  ],
  { cwd: server, env: process.env, stdio: "inherit" },
);
process.chdir(server);
await import(new URL("../Gig-Grad-Server/src/index.js", import.meta.url));
