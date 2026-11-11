/**
 * Order reads/writes against Neon Postgres (canonical orders store).
 */
import { getNeonSql } from './neonSql.js';

const ALLOWED_PATCH_KEYS = new Set([
  'status',
  'shipping_address',
  'crypto_tx_hash',
  'total_amount',
  'currency',
  'payment_status',
]);

function normalizeRow(row: Record<string, any> | null | undefined): Record<string, any> | null {
  if (!row) return null;
  return {
    ...row,
    items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
    shipping_address:
      typeof row.shipping_address === 'string'
        ? JSON.parse(row.shipping_address)
        : row.shipping_address,
    total_amount: Number(row.total_amount ?? 0),
  };
}

export async function fetchOrderById(orderId: string): Promise<Record<string, any> | null> {
  const sql = getNeonSql();
  const rows = await sql`
    SELECT *
    FROM orders
    WHERE id = ${orderId}::uuid
    LIMIT 1
  `;
  return normalizeRow((rows[0] as Record<string, any>) || null);
}

export async function listOrders(opts?: {
  userId?: string | null;
  limit?: number;
}): Promise<Record<string, any>[]> {
  const sql = getNeonSql();
  const limit = Math.min(Math.max(opts?.limit ?? 200, 1), 500);
  if (opts?.userId) {
    const rows = await sql`
      SELECT *
      FROM orders
      WHERE user_id = ${opts.userId}::uuid
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return (rows as Record<string, any>[]).map((r) => normalizeRow(r)!);
  }
  const rows = await sql`
    SELECT *
    FROM orders
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return (rows as Record<string, any>[]).map((r) => normalizeRow(r)!);
}

export async function insertOrder(input: {
  id: string;
  user_id?: string | null;
  items: unknown;
  total_amount: number;
  currency?: string;
  status?: string;
  shipping_address?: unknown;
  crypto_tx_hash?: string | null;
}): Promise<Record<string, any>> {
  const sql = getNeonSql();
  const rows = await sql`
    INSERT INTO orders (
      id, user_id, items, total_amount, currency, status, shipping_address, crypto_tx_hash
    ) VALUES (
      ${input.id}::uuid,
      ${input.user_id || null}::uuid,
      ${JSON.stringify(input.items ?? [])}::jsonb,
      ${Number(input.total_amount || 0)},
      ${input.currency || 'EUR'},
      ${input.status || 'pending'},
      ${JSON.stringify(input.shipping_address ?? {})}::jsonb,
      ${input.crypto_tx_hash || null}
    )
    RETURNING *
  `;
  return normalizeRow(rows[0] as Record<string, any>)!;
}

export async function patchOrderShippingAddress(
  orderId: string,
  shipping_address: Record<string, unknown>,
) {
  return patchOrderFields(orderId, { shipping_address });
}

export async function patchOrderStatus(orderId: string, status: string) {
  return patchOrderFields(orderId, { status });
}

export async function patchOrderFields(orderId: string, fields: Record<string, unknown>) {
  const sql = getNeonSql();
  const entries = Object.entries(fields).filter(([key]) => ALLOWED_PATCH_KEYS.has(key));
  if (!entries.length) return;

  for (const [key, value] of entries) {
    if (key === 'status') {
      await sql`
        UPDATE orders
        SET status = ${String(value)}, updated_at = NOW()
        WHERE id = ${orderId}::uuid
      `;
      continue;
    }
    if (key === 'crypto_tx_hash') {
      await sql`
        UPDATE orders
        SET crypto_tx_hash = ${value == null ? null : String(value)}, updated_at = NOW()
        WHERE id = ${orderId}::uuid
      `;
      continue;
    }
    if (key === 'currency') {
      await sql`
        UPDATE orders
        SET currency = ${String(value)}, updated_at = NOW()
        WHERE id = ${orderId}::uuid
      `;
      continue;
    }
    if (key === 'total_amount') {
      await sql`
        UPDATE orders
        SET total_amount = ${Number(value)}, updated_at = NOW()
        WHERE id = ${orderId}::uuid
      `;
      continue;
    }
    if (key === 'shipping_address') {
      const json = JSON.stringify(value ?? {});
      await sql`
        UPDATE orders
        SET shipping_address = ${json}::jsonb, updated_at = NOW()
        WHERE id = ${orderId}::uuid
      `;
    }
  }
}

export async function deleteOrderById(orderId: string): Promise<boolean> {
  const sql = getNeonSql();
  const rows = await sql`
    DELETE FROM orders
    WHERE id = ${orderId}::uuid
    RETURNING id
  `;
  return rows.length > 0;
}
