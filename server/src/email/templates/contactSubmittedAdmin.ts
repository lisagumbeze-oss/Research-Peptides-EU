import { renderBrandLayout, stripHtml } from '../layout.js';
import type { ContactEmailPayload, EmailRenderResult } from '../types.js';

export function renderContactSubmittedAdminEmail(payload: ContactEmailPayload): EmailRenderResult {
  const bodyHtml = `
    <p style="margin:0 0 14px;font-size:14px;color:#334155;line-height:1.7;">
      A new contact submission was received from the website.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td style="font-size:13px;color:#64748b;padding:6px 0;">Name</td>
        <td style="font-size:13px;color:#0f172a;text-align:right;padding:6px 0;font-weight:700;">${payload.fullName}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#64748b;padding:6px 0;">Email</td>
        <td style="font-size:13px;color:#0f172a;text-align:right;padding:6px 0;font-weight:700;">${payload.email}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#64748b;padding:6px 0;">Subject</td>
        <td style="font-size:13px;color:#0f172a;text-align:right;padding:6px 0;font-weight:700;">${payload.subject}</td>
      </tr>
    </table>
    <div style="margin-top:18px;padding:14px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;">
      <p style="margin:0;font-size:13px;color:#334155;line-height:1.8;white-space:pre-wrap;">${payload.message}</p>
    </div>`;

  const html = renderBrandLayout({
    title: 'New Contact Submission',
    preheader: `New contact message from ${payload.fullName}`,
    bodyHtml
  });

  return {
    subject: `Contact Submission • ${payload.subject}`,
    html,
    text: stripHtml(bodyHtml)
  };
}
