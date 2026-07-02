export async function fetchOrderById(orderId: string): Promise<Record<string, any> | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured');

  const res = await fetch(
    `${url}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&select=*`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      }
    }
  );
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Supabase orders read failed: ${res.status} ${t}`);
  }
  const rows = (await res.json()) as Record<string, any>[];
  return rows[0] || null;
}

export async function patchOrderShippingAddress(orderId: string, shipping_address: Record<string, unknown>) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured');

  const res = await fetch(`${url}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`, {
    method: 'PATCH',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify({ shipping_address })
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Supabase orders patch failed: ${res.status} ${t}`);
  }
}

export async function patchOrderStatus(orderId: string, status: string) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured');

  const res = await fetch(`${url}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`, {
    method: 'PATCH',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify({ status })
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Supabase orders status patch failed: ${res.status} ${t}`);
  }
}
