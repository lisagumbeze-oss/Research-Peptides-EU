import { deleteOrderById, fetchOrderById, patchOrderFields } from '../_lib/neonOrders.js';
import { getUserFromRequest, isAdminUser, requireAdmin } from '../_lib/auth.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function httpError(error: unknown) {
  const status = typeof (error as any)?.status === 'number' ? (error as any).status : 500;
  const msg = error instanceof Error ? error.message : String(error);
  return { status, msg };
}

export default async function handler(req: any, res: any) {
  const id = String(req.query?.id || req.params?.id || '');
  if (!UUID_RE.test(id)) {
    return res.status(400).json({ success: false, error: 'Invalid order id' });
  }

  if (req.method === 'GET') {
    try {
      const user = await getUserFromRequest(req);
      if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' });
      const order = await fetchOrderById(id);
      if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
      const admin = await isAdminUser(user);
      if (!admin && order.user_id !== user.id) {
        return res.status(403).json({ success: false, error: 'Forbidden' });
      }
      return res.status(200).json({ success: true, order });
    } catch (error: unknown) {
      const { status, msg } = httpError(error);
      return res.status(status).json({ success: false, error: msg });
    }
  }

  if (req.method === 'PATCH') {
    try {
      await requireAdmin(req);
      const existing = await fetchOrderById(id);
      if (!existing) return res.status(404).json({ success: false, error: 'Order not found' });

      const body = req.body || {};
      const fields: Record<string, unknown> = {};
      if (typeof body.status === 'string') fields.status = body.status;
      if ('crypto_tx_hash' in body) {
        fields.crypto_tx_hash =
          body.crypto_tx_hash == null || body.crypto_tx_hash === ''
            ? null
            : String(body.crypto_tx_hash);
      }
      if (body.total_amount != null && Number.isFinite(Number(body.total_amount))) {
        fields.total_amount = Number(body.total_amount);
      }
      if (body.shipping_address && typeof body.shipping_address === 'object') {
        fields.shipping_address = body.shipping_address;
      }

      await patchOrderFields(id, fields);
      const order = await fetchOrderById(id);
      return res.status(200).json({ success: true, order });
    } catch (error: unknown) {
      const { status, msg } = httpError(error);
      return res.status(status).json({ success: false, error: msg });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await requireAdmin(req);
      const ok = await deleteOrderById(id);
      if (!ok) return res.status(404).json({ success: false, error: 'Order not found' });
      return res.status(200).json({ success: true });
    } catch (error: unknown) {
      const { status, msg } = httpError(error);
      return res.status(status).json({ success: false, error: msg });
    }
  }

  res.setHeader('Allow', 'GET, PATCH, DELETE');
  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
