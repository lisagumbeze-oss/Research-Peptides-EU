import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

function hasSmtpConfig() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM
  );
}

function getTransporter() {
  if (transporter) return transporter;
  if (!hasSmtpConfig()) return null;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  return transporter;
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}) {
  const dryRun = String(process.env.EMAIL_DRY_RUN || 'false').toLowerCase() === 'true';
  const tx = getTransporter();

  if (!tx || dryRun) {
    console.log('[email] dry-run/disabled', {
      to: params.to,
      subject: params.subject,
      dryRun,
      hasTransport: Boolean(tx)
    });
    return { sent: false, reason: 'dry-run-or-disabled' as const };
  }

  await tx.sendMail({
    from: process.env.SMTP_FROM,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
    replyTo: params.replyTo || process.env.SMTP_REPLY_TO
  });

  return { sent: true as const };
}
