import {
  fetchOrderById,
  patchOrderFields,
} from '../_lib/supabaseOrders.js';
import { renderBtcPaymentDeclaredAdminEmail } from '../_lib/emailTemplates.js';
import { isCryptoPaymentMethod } from '../_lib/paymentConfig.js';
import { sendTransactionalEmail } from '../_lib/resendSend.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getAdminRecipient() {
  return process.env.EMAIL_ADMIN_TO || process.env.EMAIL_SUPPORT_ADDRESS || 'info@researchpeptide.eu';
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { order_id } = req.body || {};
    if (!order_id || typeof order_id !== 'string') {
      return res.status(400).json({ success: false, error: 'Missing order_id' });
    }
    if (!UUID_RE.test(order_id)) {
      return res.status(400).json({ success: false, error: 'Invalid order_id' });
    }

    const row = await fetchOrderById(order_id);
    if (!row) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const shipping = row.shipping_address || {};
    if (!isCryptoPaymentMethod(shipping.payment_method)) {
      return res.status(400).json({
        success: false,
        error: 'This order is not a Bitcoin payment order.',
      });
    }

    if (shipping.payment_declared_at) {
      return res.status(200).json({
        success: true,
        result: { skipped: true, reason: 'already-declared' },
      });
    }

    const declaredAt = new Date().toISOString();
    const nextShipping = {
      ...shipping,
      payment_declared_at: declaredAt,
      payment_declared_method: 'btc',
    };

    await patchOrderFields(order_id, {
      status: 'processing',
      shipping_address: nextShipping,
    });

    try {
      const adminTemplate = renderBtcPaymentDeclaredAdminEmail({
        orderId: row.id,
        customerName: shipping.fullName || 'Guest',
        customerEmail: shipping.email || '',
        totalAmount: Number(row.total_amount || 0),
      });

      await sendTransactionalEmail({
        to: getAdminRecipient(),
        subject: adminTemplate.subject,
        html: adminTemplate.html,
        text: adminTemplate.text,
      });
    } catch (emailError) {
      console.error('btc-paid admin email failed:', emailError);
    }

    return res.status(200).json({
      success: true,
      result: { declared: true, status: 'processing', declaredAt },
    });
  } catch (error: unknown) {
    console.error('btc-paid handler:', error);
    const msg =
      error instanceof Error ? error.message : typeof error === 'string' ? error : JSON.stringify(error);
    return res.status(500).json({ success: false, error: msg || 'btc-paid failed' });
  }
}
