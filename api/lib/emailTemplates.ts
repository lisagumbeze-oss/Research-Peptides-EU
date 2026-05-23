import { safeHtml } from './safeHtml.js';
import { formatCurrency } from './currency.js';

export { formatCurrency };

export function stripHtml(input: string) {
  return input
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function paymentMethodLabel(method: string | undefined) {
  const value = String(method || '').toLowerCase().trim();
  if (value === 'crypto' || value === 'cryptocurrency') return 'Cryptocurrency';
  if (value === 'card' || value === 'credit_card' || value === 'credit-card') return 'Credit / Debit Card';
  if (value === 'bank' || value === 'bank_transfer' || value === 'bank-transfer') return 'Bank Transfer';
  return method ? method : 'Unknown';
}

function renderBrandLayout(params: { title: string; preheader: string; bodyHtml: string }) {
  const brandName = process.env.EMAIL_BRAND_NAME || 'Research Peptides EU';
  const supportAddress = process.env.EMAIL_SUPPORT_ADDRESS || 'info@researchpeptide.eu';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeHtml(params.title)}</title>
</head>
<body style="margin:0;padding:0;background:#f3f6fb;font-family:Inter,Arial,sans-serif;color:#0f172a;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${safeHtml(params.preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr>
            <td style="background:linear-gradient(120deg,#0f172a,#1d4ed8);padding:24px;">
              <h1 style="margin:0;font-size:20px;line-height:1.2;color:#ffffff;font-weight:800;">${safeHtml(brandName)}</h1>
              <p style="margin:6px 0 0;color:#bfdbfe;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;">Research Operations</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              ${params.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px;border-top:1px solid #e2e8f0;background:#f8fafc;">
              <p style="margin:0;font-size:12px;color:#475569;line-height:1.6;">
                Need help? Reply to this email or contact <strong>${safeHtml(supportAddress)}</strong>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export type OrderLineItem = {
  title: string;
  quantity: number;
  price: number;
  specification?: string;
};

export type OrderEmailPayload = {
  orderId: string;
  status: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  shippingAddressLine1?: string;
  shippingCity?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  customerNotes?: string;
  totalAmount: number;
  shippingCost: number;
  paymentMethod: string;
  items: OrderLineItem[];
};

export type ContactEmailPayload = {
  fullName: string;
  email: string;
  subject: string;
  message: string;
};

export type NewsletterSubscribePayload = {
  email: string;
};

export type EmailRenderResult = {
  subject: string;
  html: string;
  text: string;
};

export function renderOrderCreatedCustomerEmail(payload: OrderEmailPayload): EmailRenderResult {
  const itemRows = payload.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;font-size:14px;color:#0f172a;font-weight:600;">${safeHtml(item.title)}${item.specification ? ` (${safeHtml(item.specification)})` : ''}</td>
          <td style="padding:8px 0;font-size:14px;color:#64748b;text-align:right;">x${item.quantity}</td>
        </tr>`
    )
    .join('');

  const bodyHtml = `
    <p style="margin:0 0 12px;font-size:14px;color:#334155;">Hi ${safeHtml(payload.customerName || 'Researcher')},</p>
    <p style="margin:0 0 20px;font-size:14px;color:#334155;line-height:1.7;">
      Your order has been received and is now in our processing queue.
      We will notify you immediately when your status changes.
    </p>
    <div style="padding:16px;border:1px solid #dbeafe;background:#eff6ff;border-radius:12px;margin-bottom:18px;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#2563eb;font-weight:800;">Order ID</p>
      <p style="margin:0;font-size:18px;color:#1e3a8a;font-weight:800;">${safeHtml(payload.orderId)}</p>
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:18px;">
      ${itemRows}
    </table>
    <div style="margin-bottom:18px;padding:14px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#475569;font-weight:800;">Shipping Details</p>
      <p style="margin:0;font-size:13px;color:#334155;line-height:1.8;">
        <strong>Name:</strong> ${safeHtml(payload.customerName || 'Researcher')}<br />
        <strong>Email:</strong> ${safeHtml(payload.customerEmail || '')}<br />
        <strong>Phone:</strong> ${safeHtml(payload.customerPhone || '')}<br />
        <strong>Address:</strong> ${safeHtml(payload.shippingAddressLine1 || '')}<br />
        <strong>City:</strong> ${safeHtml(payload.shippingCity || '')}<br />
        <strong>Postal Code:</strong> ${safeHtml(payload.shippingPostalCode || '')}<br />
        <strong>Country:</strong> ${safeHtml(payload.shippingCountry || '')}
      </p>
      ${payload.customerNotes ? `<p style="margin:10px 0 0;font-size:13px;color:#334155;line-height:1.7;"><strong>Notes:</strong> ${safeHtml(payload.customerNotes)}</p>` : ''}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td style="font-size:13px;color:#64748b;padding:4px 0;">Shipping</td>
        <td style="font-size:13px;color:#0f172a;text-align:right;padding:4px 0;font-weight:700;">${formatCurrency(payload.shippingCost)}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#64748b;padding:4px 0;">Payment Method</td>
        <td style="font-size:13px;color:#0f172a;text-align:right;padding:4px 0;font-weight:700;">${safeHtml(paymentMethodLabel(payload.paymentMethod))}</td>
      </tr>
      <tr>
        <td style="font-size:15px;color:#0f172a;padding:8px 0;font-weight:800;border-top:1px solid #e2e8f0;">Total</td>
        <td style="font-size:15px;color:#1d4ed8;text-align:right;padding:8px 0;font-weight:800;border-top:1px solid #e2e8f0;">${formatCurrency(payload.totalAmount)}</td>
      </tr>
    </table>`;

  const html = renderBrandLayout({
    title: `Order Confirmed • ${payload.orderId.slice(0, 8)}`,
    preheader: `Your order ${payload.orderId.slice(0, 8)} has been received`,
    bodyHtml
  });

  return {
    subject: `Order Received • #${payload.orderId.slice(0, 8)}`,
    html,
    text: stripHtml(bodyHtml)
  };
}

export function renderOrderCreatedAdminEmail(payload: OrderEmailPayload): EmailRenderResult {
  const itemRows = payload.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;font-size:14px;color:#0f172a;font-weight:600;">${safeHtml(item.title)}${item.specification ? ` (${safeHtml(item.specification)})` : ''}</td>
          <td style="padding:8px 0;font-size:14px;color:#64748b;text-align:right;">x${item.quantity}</td>
          <td style="padding:8px 0;font-size:14px;color:#0f172a;text-align:right;">${formatCurrency(item.price)}</td>
        </tr>`
    )
    .join('');

  const bodyHtml = `
    <p style="margin:0 0 14px;font-size:14px;color:#334155;line-height:1.7;">
      A new order has been submitted and requires admin tracking.
    </p>
    <div style="padding:16px;border:1px solid #fde68a;background:#fffbeb;border-radius:12px;margin-bottom:18px;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#92400e;font-weight:800;">Order ID</p>
      <p style="margin:0;font-size:18px;color:#78350f;font-weight:800;">${safeHtml(payload.orderId)}</p>
    </div>
    <p style="margin:0 0 12px;font-size:13px;color:#334155;">
      Customer: <strong>${safeHtml(payload.customerName || 'Guest')}</strong> (${safeHtml(payload.customerEmail)})
    </p>
    <div style="margin:0 0 16px;padding:14px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#475569;font-weight:800;">Shipping & Contact</p>
      <p style="margin:0;font-size:13px;color:#334155;line-height:1.8;">
        <strong>Name:</strong> ${safeHtml(payload.customerName || 'Guest')}<br />
        <strong>Email:</strong> ${safeHtml(payload.customerEmail || '')}<br />
        <strong>Phone:</strong> ${safeHtml(payload.customerPhone || '')}<br />
        <strong>Address:</strong> ${safeHtml(payload.shippingAddressLine1 || '')}<br />
        <strong>City:</strong> ${safeHtml(payload.shippingCity || '')}<br />
        <strong>Postal Code:</strong> ${safeHtml(payload.shippingPostalCode || '')}<br />
        <strong>Country:</strong> ${safeHtml(payload.shippingCountry || '')}
      </p>
      ${payload.customerNotes ? `<p style="margin:10px 0 0;font-size:13px;color:#334155;line-height:1.7;"><strong>Notes:</strong> ${safeHtml(payload.customerNotes)}</p>` : ''}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:18px;">
      ${itemRows}
    </table>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td style="font-size:13px;color:#64748b;padding:4px 0;">Status</td>
        <td style="font-size:13px;color:#0f172a;text-align:right;padding:4px 0;font-weight:700;text-transform:capitalize;">${safeHtml(payload.status)}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#64748b;padding:4px 0;">Payment Method</td>
        <td style="font-size:13px;color:#0f172a;text-align:right;padding:4px 0;font-weight:700;">${safeHtml(paymentMethodLabel(payload.paymentMethod))}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#64748b;padding:4px 0;">Total</td>
        <td style="font-size:13px;color:#1d4ed8;text-align:right;padding:4px 0;font-weight:800;">${formatCurrency(payload.totalAmount)}</td>
      </tr>
    </table>`;

  const html = renderBrandLayout({
    title: `New Order • ${payload.orderId.slice(0, 8)}`,
    preheader: `New order ${payload.orderId.slice(0, 8)} from ${payload.customerName || 'Guest'}`,
    bodyHtml
  });

  return {
    subject: `New Order • #${payload.orderId.slice(0, 8)}`,
    html,
    text: stripHtml(bodyHtml)
  };
}

const STATUS_COPY: Record<string, string> = {
  pending: 'Your order is pending initial verification.',
  processing: 'Your order is now being processed by our operations team.',
  paid: 'Payment has been confirmed and we are preparing dispatch.',
  shipped: 'Your order has shipped and is in transit.',
  delivered: 'Your order has been marked as delivered.',
  canceled: 'Your order has been canceled. Contact support if this was unexpected.'
};

export function renderOrderStatusCustomerEmail(payload: OrderEmailPayload): EmailRenderResult {
  const message = STATUS_COPY[payload.status] || 'Your order status was updated.';

  const bodyHtml = `
    <p style="margin:0 0 12px;font-size:14px;color:#334155;">Hi ${safeHtml(payload.customerName || 'Researcher')},</p>
    <p style="margin:0 0 18px;font-size:14px;color:#334155;line-height:1.7;">${safeHtml(message)}</p>
    <div style="padding:16px;border:1px solid #dbeafe;background:#eff6ff;border-radius:12px;margin-bottom:18px;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#2563eb;font-weight:800;">Order ID</p>
      <p style="margin:0;font-size:18px;color:#1e3a8a;font-weight:800;">${safeHtml(payload.orderId)}</p>
    </div>
    <div style="margin-bottom:18px;padding:14px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#475569;font-weight:800;">Shipping Details</p>
      <p style="margin:0;font-size:13px;color:#334155;line-height:1.8;">
        <strong>Name:</strong> ${safeHtml(payload.customerName || 'Researcher')}<br />
        <strong>Email:</strong> ${safeHtml(payload.customerEmail || '')}<br />
        <strong>Phone:</strong> ${safeHtml(payload.customerPhone || '')}<br />
        <strong>Address:</strong> ${safeHtml(payload.shippingAddressLine1 || '')}<br />
        <strong>City:</strong> ${safeHtml(payload.shippingCity || '')}<br />
        <strong>Postal Code:</strong> ${safeHtml(payload.shippingPostalCode || '')}<br />
        <strong>Country:</strong> ${safeHtml(payload.shippingCountry || '')}
      </p>
      ${payload.customerNotes ? `<p style="margin:10px 0 0;font-size:13px;color:#334155;line-height:1.7;"><strong>Notes:</strong> ${safeHtml(payload.customerNotes)}</p>` : ''}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td style="font-size:13px;color:#64748b;padding:4px 0;">Current Status</td>
        <td style="font-size:13px;color:#0f172a;text-align:right;padding:4px 0;font-weight:700;text-transform:capitalize;">${safeHtml(payload.status)}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#64748b;padding:4px 0;">Payment Method</td>
        <td style="font-size:13px;color:#0f172a;text-align:right;padding:4px 0;font-weight:700;">${safeHtml(paymentMethodLabel(payload.paymentMethod))}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#64748b;padding:4px 0;">Total</td>
        <td style="font-size:13px;color:#1d4ed8;text-align:right;padding:4px 0;font-weight:800;">${formatCurrency(payload.totalAmount)}</td>
      </tr>
    </table>`;

  const html = renderBrandLayout({
    title: `Order Status Updated • ${payload.orderId.slice(0, 8)}`,
    preheader: `Order ${payload.orderId.slice(0, 8)} is now ${payload.status}`,
    bodyHtml
  });

  return {
    subject: `Order Update • #${payload.orderId.slice(0, 8)} • ${payload.status.toUpperCase()}`,
    html,
    text: stripHtml(bodyHtml)
  };
}

export function renderContactSubmittedAdminEmail(payload: ContactEmailPayload): EmailRenderResult {
  const bodyHtml = `
    <p style="margin:0 0 14px;font-size:14px;color:#334155;line-height:1.7;">
      A new contact submission was received from the website.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td style="font-size:13px;color:#64748b;padding:6px 0;">Name</td>
        <td style="font-size:13px;color:#0f172a;text-align:right;padding:6px 0;font-weight:700;">${safeHtml(payload.fullName)}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#64748b;padding:6px 0;">Email</td>
        <td style="font-size:13px;color:#0f172a;text-align:right;padding:6px 0;font-weight:700;">${safeHtml(payload.email)}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#64748b;padding:6px 0;">Subject</td>
        <td style="font-size:13px;color:#0f172a;text-align:right;padding:6px 0;font-weight:700;">${safeHtml(payload.subject)}</td>
      </tr>
    </table>
    <div style="margin-top:18px;padding:14px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;">
      <p style="margin:0;font-size:13px;color:#334155;line-height:1.8;white-space:pre-wrap;">${safeHtml(payload.message)}</p>
    </div>`;

  const html = renderBrandLayout({
    title: 'New Contact Submission',
    preheader: `New contact message from ${payload.fullName}`,
    bodyHtml
  });

  return {
    subject: `Contact Submission • ${safeHtml(payload.subject).replace(/\r|\n/g, ' ')}`,
    html,
    text: stripHtml(bodyHtml)
  };
}

export function renderContactSubmittedCustomerEmail(payload: ContactEmailPayload): EmailRenderResult {
  const brandName = process.env.EMAIL_BRAND_NAME || 'Research Peptides EU';

  const bodyHtml = `
    <p style="margin:0 0 12px;font-size:14px;color:#334155;">Hi ${safeHtml(payload.fullName)},</p>
    <p style="margin:0 0 16px;font-size:14px;color:#334155;line-height:1.7;">
      We received your message and our team will reply as soon as possible.
    </p>
    <div style="padding:16px;border:1px solid #dbeafe;background:#eff6ff;border-radius:12px;">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#2563eb;font-weight:800;">Subject</p>
      <p style="margin:0;font-size:14px;color:#1e3a8a;font-weight:700;">${safeHtml(payload.subject)}</p>
    </div>`;

  const html = renderBrandLayout({
    title: 'We Received Your Message',
    preheader: `Thanks for contacting ${brandName}`,
    bodyHtml
  });

  return {
    subject: 'We Received Your Message',
    html,
    text: stripHtml(bodyHtml)
  };
}

export function renderNewsletterSubscribeAdminEmail(
  payload: NewsletterSubscribePayload
): EmailRenderResult {
  const bodyHtml = `
    <p style="margin:0 0 14px;font-size:14px;color:#334155;line-height:1.7;">
      A new newsletter subscription was received from the website footer.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td style="font-size:13px;color:#64748b;padding:6px 0;">Subscriber Email</td>
        <td style="font-size:13px;color:#0f172a;text-align:right;padding:6px 0;font-weight:700;">${safeHtml(payload.email)}</td>
      </tr>
    </table>`;

  const html = renderBrandLayout({
    title: 'New Newsletter Subscription',
    preheader: `New newsletter subscriber: ${payload.email}`,
    bodyHtml
  });

  return {
    subject: 'Newsletter Subscription • New Lead',
    html,
    text: stripHtml(bodyHtml)
  };
}

export function renderNewsletterSubscribeCustomerEmail(
  payload: NewsletterSubscribePayload
): EmailRenderResult {
  const brandName = process.env.EMAIL_BRAND_NAME || 'Research Peptides EU';
  const bodyHtml = `
    <p style="margin:0 0 12px;font-size:14px;color:#334155;">Hi Researcher,</p>
    <p style="margin:0 0 16px;font-size:14px;color:#334155;line-height:1.7;">
      Thanks for subscribing to the ${safeHtml(brandName)} newsletter.
      You will receive updates on supply chains, stability reports, and newly synthesized compounds.
    </p>
    <div style="padding:16px;border:1px solid #dbeafe;background:#eff6ff;border-radius:12px;">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#2563eb;font-weight:800;">Subscribed Email</p>
      <p style="margin:0;font-size:14px;color:#1e3a8a;font-weight:700;">${safeHtml(payload.email)}</p>
    </div>`;

  const html = renderBrandLayout({
    title: 'Newsletter Subscription Confirmed',
    preheader: `You are now subscribed to ${brandName} updates`,
    bodyHtml
  });

  return {
    subject: 'Subscription Confirmed',
    html,
    text: stripHtml(bodyHtml)
  };
}
