/** Calls Vercel serverless routes (same-origin on prod). Same shape as legacy backend email API. */

function parseErrorBody(text: string, status: number): string {
  const t = text.trim();
  if (!t) return `Request failed (${status})`;
  if (t.startsWith('<!') || t.includes('<!DOCTYPE')) {
    return (
      'Email API is not reachable (got a web page instead of JSON). ' +
      'On Vercel, confirm the `/api` folder is deployed and Environment Variables include RESEND_API_KEY and RESEND_FROM.'
    );
  }
  try {
    const j = JSON.parse(text);
    if (typeof j.error === 'string') return j.error;
    if (j?.error && typeof j.error.message === 'string') return j.error.message;
    if (typeof j.message === 'string') return j.message;
  } catch {
    /* plain text body */
  }
  return t.length > 280 ? `${t.slice(0, 280)}…` : t;
}

async function readJsonResponse<T>(
  response: Response
): Promise<T> {
  const text = await response.text();
  const trimmed = text.trim();
  const ctype = response.headers.get('content-type') || '';

  if (!response.ok) {
    throw new Error(parseErrorBody(text, response.status));
  }

  const looksJson =
    ctype.includes('application/json') ||
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'));

  if (!looksJson) {
    throw new Error(parseErrorBody(text, response.status));
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    throw new Error(parseErrorBody(text, response.status));
  }
}

export async function postOrderCreatedEmail(orderId: string) {
  const response = await fetch('/api/email/order-created', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ order_id: orderId })
  });
  return readJsonResponse<{ success: boolean; result?: unknown }>(response);
}

export async function postOrderStatusEmail(orderId: string, status: string) {
  const response = await fetch('/api/email/order-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ order_id: orderId, status })
  });
  return readJsonResponse<{ success: boolean; result?: unknown }>(response);
}

export async function postContactEmail(payload: {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}) {
  const response = await fetch('/api/email/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload)
  });
  return readJsonResponse<{ success: boolean; dryRun?: boolean }>(response);
}
