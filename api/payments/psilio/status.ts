type PsilioWebhookPayload = {
  txn_id?: string;
  invoice_id?: string;
  order_number?: string;
  order_name?: string;
  source_currency?: string;
  source_amount?: string | number;
  amount?: string | number;
  currency?: string;
  status?: string;
  status_name?: string;
  tx_url?: string;
  verify_hash?: string;
  [key: string]: unknown;
};

import { fetchOrderById, patchOrderShippingAddress, patchOrderStatus } from '../../_lib/supabaseOrders.js';
import { handleOrderStatus } from '../../_lib/orderEmailHandlers.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readBody(req: any): PsilioWebhookPayload {
  if (req?.body && typeof req.body === 'object') {
    return req.body as PsilioWebhookPayload;
  }
  return {} as PsilioWebhookPayload;
}

function toText(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

function mapPsilioStatusToOrderStatus(status: string): string | null {
  const s = status.trim().toLowerCase();
  if (!s) return null;

  if (['completed', 'mismatch', 'confirmed', 'paid', 'success', 'done'].includes(s)) {
    return 'paid';
  }
  if (['expired', 'cancelled', 'canceled', 'failed', 'error'].includes(s)) {
    return 'cancelled';
  }
  if (['new', 'pending', 'waiting', 'in_process', 'processing'].includes(s)) {
    return 'pending';
  }
  return null;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const body = readBody(req);
    const query = (req?.query || {}) as Record<string, unknown>;

    // Plisio may send callback values via form body and/or query string.
    const merged: PsilioWebhookPayload = {
      ...query,
      ...body,
    };

    const orderNumber = toText(merged.order_number);
    const invoiceId = toText(merged.invoice_id);
    const txnId = toText(merged.txn_id);
    const status = toText(merged.status_name) || toText(merged.status) || 'unknown';
    const sourceAmount = toText(merged.source_amount) || toText(merged.amount);
    const sourceCurrency = toText(merged.source_currency) || toText(merged.currency);
    const txUrl = toText(merged.tx_url);
    const hasVerifyHash = Boolean(toText(merged.verify_hash));

    const mappedOrderStatus = mapPsilioStatusToOrderStatus(status);

    console.log('psilio status webhook received', {
      orderNumber,
      invoiceId,
      txnId,
      status,
      sourceAmount,
      sourceCurrency,
      txUrl,
      hasVerifyHash,
      mappedOrderStatus,
    });

    if (!orderNumber || !UUID_RE.test(orderNumber)) {
      return res.status(200).json({
        success: true,
        received: true,
        orderNumber: orderNumber || null,
        status,
        skipped: 'missing-or-invalid-order-number',
      });
    }

    const order = await fetchOrderById(orderNumber);
    if (!order) {
      return res.status(200).json({
        success: true,
        received: true,
        orderNumber,
        status,
        skipped: 'order-not-found',
      });
    }

    const shipping = (order.shipping_address || {}) as Record<string, unknown>;
    const paymentWebhook = {
      provider: 'plisio',
      received_at: new Date().toISOString(),
      status,
      mapped_order_status: mappedOrderStatus,
      invoice_id: invoiceId || null,
      txn_id: txnId || null,
      source_amount: sourceAmount || null,
      source_currency: sourceCurrency || null,
      tx_url: txUrl || null,
      has_verify_hash: hasVerifyHash,
    };

    await patchOrderShippingAddress(orderNumber, {
      ...shipping,
      payment_provider: 'plisio',
      payment_status: status,
      payment_invoice_id: invoiceId || shipping.payment_invoice_id || null,
      payment_txn_id: txnId || shipping.payment_txn_id || null,
      payment_tx_url: txUrl || shipping.payment_tx_url || null,
      payment_webhook: paymentWebhook,
    });

    let statusEmailResult: unknown = null;
    if (mappedOrderStatus && mappedOrderStatus !== order.status) {
      await patchOrderStatus(orderNumber, mappedOrderStatus);
      try {
        statusEmailResult = await handleOrderStatus(orderNumber, mappedOrderStatus);
      } catch (emailError) {
        console.error('psilio status email trigger failed:', emailError);
      }
    }

    return res.status(200).json({
      success: true,
      received: true,
      orderNumber,
      status,
      mappedOrderStatus,
      statusEmailResult,
    });
  } catch (error: any) {
    console.error('psilio status webhook error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to process Psilio status webhook',
    });
  }
}
