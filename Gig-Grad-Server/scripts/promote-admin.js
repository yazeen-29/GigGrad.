require("dotenv").config();
const prisma = require("../src/lib/prisma");
const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error(
    "Usage: node scripts/promote-admin.js existing-user@college.edu",
  );
  process.exit(1);
}
prisma.user
  .update({
    where: { email },
    data: { role: "ADMIN", posterStatus: "approved" },
    select: { id: true, email: true },
  })
  .then((user) => console.log(`Administrator access granted to ${user.email}`))
  .catch(() => {
    console.error(
      "Could not promote user. Confirm the account exists and DATABASE_URL is reachable.",
    );
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
