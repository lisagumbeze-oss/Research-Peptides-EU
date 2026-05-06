import { renderBrandLayout, stripHtml, formatCurrency } from '../layout.js';
import type { EmailRenderResult, OrderEmailPayload } from '../types.js';

export function renderOrderCreatedCustomerEmail(payload: OrderEmailPayload): EmailRenderResult {
  const itemRows = payload.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;font-size:14px;color:#0f172a;font-weight:600;">${item.title}${item.specification ? ` (${item.specification})` : ''}</td>
          <td style="padding:8px 0;font-size:14px;color:#64748b;text-align:right;">x${item.quantity}</td>
        </tr>`
    )
    .join('');

  const bodyHtml = `
    <p style="margin:0 0 12px;font-size:14px;color:#334155;">Hi ${payload.customerName || 'Researcher'},</p>
    <p style="margin:0 0 20px;font-size:14px;color:#334155;line-height:1.7;">
      Your order has been received and is now in our processing queue.
      We will notify you immediately when your status changes.
    </p>
    <div style="padding:16px;border:1px solid #dbeafe;background:#eff6ff;border-radius:12px;margin-bottom:18px;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#2563eb;font-weight:800;">Order ID</p>
      <p style="margin:0;font-size:18px;color:#1e3a8a;font-weight:800;">${payload.orderId}</p>
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:18px;">
      ${itemRows}
    </table>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td style="font-size:13px;color:#64748b;padding:4px 0;">Shipping</td>
        <td style="font-size:13px;color:#0f172a;text-align:right;padding:4px 0;font-weight:700;">${formatCurrency(payload.shippingCost)}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#64748b;padding:4px 0;">Payment Method</td>
        <td style="font-size:13px;color:#0f172a;text-align:right;padding:4px 0;font-weight:700;text-transform:capitalize;">${payload.paymentMethod}</td>
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
