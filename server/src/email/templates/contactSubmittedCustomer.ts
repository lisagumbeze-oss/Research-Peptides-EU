import { renderBrandLayout, stripHtml } from '../layout.js';
import type { ContactEmailPayload, EmailRenderResult } from '../types.js';

export function renderContactSubmittedCustomerEmail(payload: ContactEmailPayload): EmailRenderResult {
  const bodyHtml = `
    <p style="margin:0 0 12px;font-size:14px;color:#334155;">Hi ${payload.fullName},</p>
    <p style="margin:0 0 16px;font-size:14px;color:#334155;line-height:1.7;">
      We received your message and our team will reply as soon as possible.
    </p>
    <div style="padding:16px;border:1px solid #dbeafe;background:#eff6ff;border-radius:12px;">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#2563eb;font-weight:800;">Subject</p>
      <p style="margin:0;font-size:14px;color:#1e3a8a;font-weight:700;">${payload.subject}</p>
    </div>`;

  const html = renderBrandLayout({
    title: 'We Received Your Message',
    preheader: `Thanks for contacting ${process.env.EMAIL_BRAND_NAME || 'Research Peptides EU'}`,
    bodyHtml
  });

  return {
    subject: 'We Received Your Message',
    html,
    text: stripHtml(bodyHtml)
  };
}
