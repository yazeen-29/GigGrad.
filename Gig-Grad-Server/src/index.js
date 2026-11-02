require("dotenv").config();
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)
  throw new Error("JWT_SECRET must contain at least 32 characters");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const app = require("./app");
const prisma = require("./lib/prisma");
const server = app.listen(process.env.PORT || 5000, () =>
  console.log("GigGrad API started"),
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  });
