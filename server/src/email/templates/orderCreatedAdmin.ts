import { renderBrandLayout, stripHtml, formatCurrency } from '../layout.js';
import type { EmailRenderResult, OrderEmailPayload } from '../types.js';

export function renderOrderCreatedAdminEmail(payload: OrderEmailPayload): EmailRenderResult {
  const itemRows = payload.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;font-size:14px;color:#0f172a;font-weight:600;">${item.title}${item.specification ? ` (${item.specification})` : ''}</td>
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
      <p style="margin:0;font-size:18px;color:#78350f;font-weight:800;">${payload.orderId}</p>
    </div>
    <p style="margin:0 0 12px;font-size:13px;color:#334155;">
      Customer: <strong>${payload.customerName || 'Guest'}</strong> (${payload.customerEmail})
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:18px;">
      ${itemRows}
    </table>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td style="font-size:13px;color:#64748b;padding:4px 0;">Status</td>
        <td style="font-size:13px;color:#0f172a;text-align:right;padding:4px 0;font-weight:700;text-transform:capitalize;">${payload.status}</td>
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
