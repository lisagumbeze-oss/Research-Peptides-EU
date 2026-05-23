import { renderBrandLayout, stripHtml, formatCurrency } from '../layout.js';
import type { EmailRenderResult, OrderEmailPayload } from '../types.js';

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
    <p style="margin:0 0 12px;font-size:14px;color:#334155;">Hi ${payload.customerName || 'Researcher'},</p>
    <p style="margin:0 0 18px;font-size:14px;color:#334155;line-height:1.7;">${message}</p>
    <div style="padding:16px;border:1px solid #dbeafe;background:#eff6ff;border-radius:12px;margin-bottom:18px;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#2db5a3;font-weight:800;">Order ID</p>
      <p style="margin:0;font-size:18px;color:#1a365d;font-weight:800;">${payload.orderId}</p>
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td style="font-size:13px;color:#64748b;padding:4px 0;">Current Status</td>
        <td style="font-size:13px;color:#0f172a;text-align:right;padding:4px 0;font-weight:700;text-transform:capitalize;">${payload.status}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#64748b;padding:4px 0;">Total</td>
        <td style="font-size:13px;color:#249688;text-align:right;padding:4px 0;font-weight:800;">${formatCurrency(payload.totalAmount)}</td>
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
