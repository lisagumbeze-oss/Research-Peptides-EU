import { renderBrandLayout, stripHtml, formatCurrency } from '../layout.js';
import type { EmailRenderResult, OrderEmailPayload } from '../types.js';
import { CRYPTO_WALLETS, cryptoWalletLabel, isCryptoPaymentMethod, CRYPTO_PAYMENT_DISCOUNT_PERCENT } from '../paymentConfig.js';

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

  const btcBlock = isCryptoPaymentMethod(payload.paymentMethod)
    ? `
    <div style="margin:18px 0 0;padding:16px;border:1px solid #fdba74;background:#fff7ed;border-radius:12px;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#c2410c;font-weight:800;">Cryptocurrency Payment Details Sent to Customer</p>
      <p style="margin:0 0 10px;font-size:13px;color:#9a3412;line-height:1.7;">
        Customer was instructed to send <strong>one</strong> of the exact amounts below for an order total of <strong>${formatCurrency(payload.totalAmount)}</strong> (includes a ${CRYPTO_PAYMENT_DISCOUNT_PERCENT}% cryptocurrency discount on the product subtotal):
      </p>
      ${CRYPTO_WALLETS.map((wallet) => {
        const siteUrl = (process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://www.researchpeptide.eu').replace(/\/+$/, '');
        const qrUrl = wallet.qrSrc
          ? /^https?:\/\//i.test(wallet.qrSrc)
            ? wallet.qrSrc
            : `${siteUrl}${wallet.qrSrc.startsWith('/') ? wallet.qrSrc : `/${wallet.qrSrc}`}`
          : '';
        const quote = payload.cryptoQuotes?.[wallet.id];
        return `
      <p style="margin:12px 0 4px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#9a3412;font-weight:800;">${cryptoWalletLabel(wallet)}</p>
      ${quote ? `<p style="margin:0 0 4px;font-size:16px;font-weight:800;color:#0f172a;">Send exactly ${quote.amount} ${wallet.symbol}</p><p style="margin:0 0 8px;font-size:12px;color:#9a3412;">${formatCurrency(quote.eurPerCoin)} per ${wallet.symbol}</p>` : ''}
      ${qrUrl ? `<p style="margin:0 0 8px;"><img src="${qrUrl}" alt="${cryptoWalletLabel(wallet)} QR code" width="176" height="176" style="display:block;width:176px;height:176px;border:1px solid #fed7aa;border-radius:12px;background:#ffffff;" /></p>` : ''}
      <p style="margin:0;padding:12px;background:#ffffff;border:1px solid #fed7aa;border-radius:10px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:13px;color:#0f172a;word-break:break-all;font-weight:700;">
        ${wallet.address}
      </p>`;
      }).join('')}
    </div>`
    : '';

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
        <td style="font-size:13px;color:#64748b;padding:4px 0;">Shipping Method</td>
        <td style="font-size:13px;color:#0f172a;text-align:right;padding:4px 0;font-weight:700;">${payload.shippingMethod || 'Standard Delivery'}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#64748b;padding:4px 0;">Shipping Cost</td>
        <td style="font-size:13px;color:#0f172a;text-align:right;padding:4px 0;font-weight:700;">${payload.shippingCost > 0 ? formatCurrency(payload.shippingCost) : 'Free (€0.00)'}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#64748b;padding:4px 0;">Payment Method</td>
        <td style="font-size:13px;color:#0f172a;text-align:right;padding:4px 0;font-weight:700;text-transform:capitalize;">${payload.paymentMethod}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#64748b;padding:4px 0;">Total</td>
        <td style="font-size:13px;color:#249688;text-align:right;padding:4px 0;font-weight:800;">${formatCurrency(payload.totalAmount)}</td>
      </tr>
    </table>
    ${btcBlock}`;

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
