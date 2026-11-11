import { supabase } from '../supabase';

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  let parsed: any = {};
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = {};
  }
  if (!response.ok) {
    throw new Error(parsed?.error || text || `Request failed (${response.status})`);
  }
  return parsed as T;
}

export async function createOrder(payload: {
  id: string;
  user_id?: string | null;
  items: unknown[];
  total_amount: number;
  currency?: string;
  status?: string;
  shipping_address?: Record<string, unknown>;
}) {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  return readJson<{ success: boolean; order: any }>(response);
}

export async function listOrders() {
  const response = await fetch('/api/orders', {
    method: 'GET',
    headers: await authHeaders(),
  });
  return readJson<{ success: boolean; orders: any[] }>(response);
}

export async function updateOrder(
  orderId: string,
  fields: {
    status?: string;
    crypto_tx_hash?: string | null;
    total_amount?: number;
    shipping_address?: Record<string, unknown>;
  },
) {
  const response = await fetch(`/api/orders/${orderId}`, {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify(fields),
  });
  return readJson<{ success: boolean; order: any }>(response);
}

export async function deleteOrder(orderId: string) {
  const response = await fetch(`/api/orders/${orderId}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  return readJson<{ success: boolean }>(response);
}
