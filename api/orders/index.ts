import { insertOrder, listOrders } from '../_lib/neonOrders.js';
import { getUserFromRequest, isAdminUser } from '../_lib/auth.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const user = await getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      const admin = await isAdminUser(user);
      const orders = admin
        ? await listOrders({ limit: 300 })
        : await listOrders({ userId: user.id, limit: 100 });
      return res.status(200).json({ success: true, orders });
    } catch (error: unknown) {
      console.error('orders GET:', error);
      const msg = error instanceof Error ? error.message : String(error);
      return res.status(500).json({ success: false, error: msg });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const id = typeof body.id === 'string' ? body.id : crypto.randomUUID();
      if (!UUID_RE.test(id)) {
        return res.status(400).json({ success: false, error: 'Invalid order id' });
      }

      // Prefer authenticated user id when present; allow guest (null).
      const authUser = await getUserFromRequest(req);
      const userId =
        authUser?.id ||
        (typeof body.user_id === 'string' && UUID_RE.test(body.user_id) ? body.user_id : null);

      if (!Array.isArray(body.items)) {
        return res.status(400).json({ success: false, error: 'items must be an array' });
      }
      const total = Number(body.total_amount);
      if (!Number.isFinite(total) || total < 0) {
        return res.status(400).json({ success: false, error: 'Invalid total_amount' });
      }

      const order = await insertOrder({
        id,
        user_id: userId,
        items: body.items,
        total_amount: total,
        currency: typeof body.currency === 'string' ? body.currency : 'EUR',
        status: typeof body.status === 'string' ? body.status : 'pending',
        shipping_address: body.shipping_address || {},
        crypto_tx_hash: body.crypto_tx_hash || null,
      });

      return res.status(201).json({ success: true, order });
    } catch (error: unknown) {
      console.error('orders POST:', error);
      const msg = error instanceof Error ? error.message : String(error);
      return res.status(500).json({ success: false, error: msg });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
