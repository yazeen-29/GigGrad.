const fs = require("node:fs");
const path = require("node:path");
const { randomBytes } = require("node:crypto");
require("dotenv").config({
  path: path.join(__dirname, "../.env"),
  quiet: true,
});
const bcrypt = require("bcryptjs");
const prisma = require("../src/lib/prisma");
const root = path.resolve(__dirname, "../.."),
  file = path.join(root, ".admin-credentials.local.json");
(async () => {
  const existingCredentials = fs.existsSync(file)
    ? JSON.parse(fs.readFileSync(file, "utf8"))
    : null;
  const email = "admin@giggrad.invalid",
    id = "giggrad-operator-admin",
    password =
      existingCredentials?.password ||
      `Admin!${randomBytes(20).toString("base64url")}`;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== id)
    throw new Error(
      "The administrator email is already used. No existing account was changed.",
    );
  if (existing && !existingCredentials)
    throw new Error(
      "Restore the private administrator credential file before rerunning.",
    );
  await prisma.user.upsert({
    where: { id },
    update: {},
    create: {
      id,
      email,
      name: "GigGrad Administrator",
      college: "Campus Administration",
      role: "ADMIN",
      posterStatus: "approved",
      posterType: "staff",
      bio: "Campus administrator for student posting access and project conflict resolution.",
      password: await bcrypt.hash(password, 12),
    },
  });
  fs.writeFileSync(file, JSON.stringify({ email, password }, null, 2), {
    mode: 0o600,
  });
  fs.chmodSync(file, 0o600);
  const guide = path.join(root, "ADMIN_LOGIN.local.md");
  fs.writeFileSync(
    guide,
    `# GigGrad administrator login\n\nSign in at http://127.0.0.1:5173/admin-login\n\nEmail: \`${email}\`\n\nPassword: \`${password}\`\n\nThis is an operator-provisioned administrator, separate from the demo administrator. Keep this file private. Public signup cannot grant administrator access. Use the dashboard to review student posting requests and resolve conflicts with saved decision notes. Replace the reserved local login with your institution's verified operator identity before public deployment.\n`,
    { mode: 0o600 },
  );
  fs.chmodSync(guide, 0o600);
  console.log(
    "Administrator account ready. Private login guide: ADMIN_LOGIN.local.md. No existing non-operator accounts changed.",
  );
})()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
