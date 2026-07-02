import { handleOrderCreated } from '../_lib/orderEmailHandlers.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

    const result = await handleOrderCreated(order_id);
    return res.status(200).json({ success: true, result });
  } catch (error: unknown) {
    console.error('order-created handler:', error);
    const msg =
      error instanceof Error ? error.message : typeof error === 'string' ? error : JSON.stringify(error);
    return res.status(500).json({ success: false, error: msg || 'order-created failed' });
  }
}
