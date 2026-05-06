import { supabase } from '../supabase';

type QueueOrderCreatedInput = {
  orderId: string;
  customerEmail: string;
  customerName: string;
  status: string;
  totalAmount: number;
  shippingCost: number;
  paymentMethod: string;
  items: any[];
};

type QueueOrderStatusInput = {
  orderId: string;
  status: string;
};

type QueueContactInput = {
  fullName: string;
  email: string;
  subject: string;
  message: string;
};

export async function queueOrderCreatedEmail(input: QueueOrderCreatedInput) {
  const idempotencyKey = `order_created:${input.orderId}`;
  const { error } = await supabase.from('email_events').insert([
    {
      event_type: 'order_created',
      idempotency_key: idempotencyKey,
      order_id: input.orderId,
      payload: input
    }
  ]);
  if (error && error.code !== '23505') throw error;
}

export async function queueOrderStatusEmail(input: QueueOrderStatusInput & { customerEmail: string; customerName?: string; totalAmount?: number }) {
  const idempotencyKey = `order_status:${input.orderId}:${input.status}`;
  const { error } = await supabase.from('email_events').insert([
    {
      event_type: 'order_status',
      idempotency_key: idempotencyKey,
      order_id: input.orderId,
      payload: input
    }
  ]);
  if (error && error.code !== '23505') throw error;
}

export async function queueContactEmail(input: QueueContactInput) {
  const idempotencyKey = `contact:${input.email}:${Date.now()}`;
  const { error } = await supabase.from('email_events').insert([
    {
      event_type: 'contact_submitted',
      idempotency_key: idempotencyKey,
      payload: input
    }
  ]);
  if (error) throw error;
}
