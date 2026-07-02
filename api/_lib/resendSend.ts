/** Send via Resend HTTP API — avoids relying on the resend npm package inside Vercel's serverless bundle. */

function getFrom() {
  return process.env.RESEND_FROM || process.env.EMAIL_FROM || '';
}

const RESEND_BASE = () => process.env.RESEND_BASE_URL || 'https://api.resend.com';

export type TransactionalSendResult = { sent: true } | { sent: false; dryRun: true };

type ResendErrorBody = {
  message?: string;
  name?: string;
  errors?: unknown;
};

function formatResendFailure(status: number, body: unknown, rawText: string): string {
  const b = body as ResendErrorBody;
  if (typeof b?.message === 'string') return `${status}: ${b.message}`;
  if (typeof rawText === 'string' && rawText.length > 0 && rawText.length < 600) return `${status}: ${rawText}`;
  return `${status}: Resend request failed`;
}

export async function sendTransactionalEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<TransactionalSendResult> {
  const dryRun = String(process.env.EMAIL_DRY_RUN || 'false').toLowerCase() === 'true';
  const apiKey = process.env.RESEND_API_KEY;
  const from = getFrom();

  if (dryRun) {
    console.log('[resend dry-run]', {
      to: params.to,
      subject: params.subject,
      from,
      hasApiKey: !!apiKey
    });
    return { sent: false as const, dryRun: true as const };
  }

  if (!apiKey || !from) {
    const missing = [!apiKey && 'RESEND_API_KEY', !from && 'RESEND_FROM'].filter(Boolean).join(' and ');
    console.error(`Email sending failed: ${missing} is not configured.`);
    throw new Error(`${missing} must be set in Environment Variables (Vercel Dashboard or .env)`);
  }

  const payload: Record<string, unknown> = {
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text
  };

  if (params.replyTo) {
    payload.reply_to = params.replyTo;
  }

  const response = await fetch(`${RESEND_BASE()}/emails`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const rawText = await response.text();
  let parsed: unknown = {};
  try {
    parsed = rawText ? JSON.parse(rawText) : {};
  } catch {
    parsed = {};
  }

  if (!response.ok) {
    throw new Error(`Resend ${formatResendFailure(response.status, parsed, rawText)}`);
  }

  return { sent: true as const };
}
