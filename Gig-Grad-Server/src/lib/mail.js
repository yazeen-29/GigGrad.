const nodemailer = require("nodemailer");
function ready() {
  if (process.env.NODE_ENV === "test") return true;
  try {
    const origin = new URL(process.env.APP_ORIGIN);
    if (
      origin.username ||
      origin.password ||
      (process.env.NODE_ENV === "production" && origin.protocol !== "https:")
    )
      return false;
  } catch {
    return false;
  }
  return (
    Boolean(process.env.MAIL_FROM && process.env.RESEND_API_KEY) ||
    Boolean(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM &&
      (!process.env.RENDER ||
        ![25, 465, 587].includes(Number(process.env.SMTP_PORT || 587))),
    )
  );
}
async function deliver(to, kind, token) {
  if (!ready()) throw new Error("Email delivery is not configured");
  const origin = process.env.APP_ORIGIN || "http://localhost:5173";
  const url = new URL("/account", origin);
  url.hash = new URLSearchParams({ kind, token }).toString();
  if (process.env.RESEND_API_KEY && process.env.NODE_ENV !== "test") {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM,
        to: [to],
        subject:
          kind === "verify"
            ? "Verify your GigGrad email"
            : "Reset your GigGrad password",
        text: `Open this link to ${kind === "verify" ? "verify your email" : "reset your password"}:\n${url.href}\nThis single-use link expires ${kind === "verify" ? "in 24 hours" : "in 30 minutes"}. Ignore it if you did not request it.`,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Email provider unavailable");
    return;
  }
  const transport = nodemailer.createTransport(
    process.env.NODE_ENV === "test"
      ? { streamTransport: true, buffer: true }
      : {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_PORT === "465",
          requireTLS: true,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
          connectionTimeout: 10000,
          socketTimeout: 10000,
        },
  );
  return transport.sendMail({
    from: process.env.SMTP_FROM || "test@example.invalid",
    to,
    subject:
      kind === "verify"
        ? "Verify your GigGrad email"
        : "Reset your GigGrad password",
    text: `Open this link to ${kind === "verify" ? "verify your email" : "reset your password"}:\n${url.href}\nThis link expires ${kind === "verify" ? "in 24 hours" : "in 30 minutes"}. If you did not request it, ignore this email.`,
  });
}
module.exports = { ready, deliver };
