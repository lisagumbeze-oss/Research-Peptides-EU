import { pool } from '../db.js';
import { sendEmail } from './mailer.js';
import { renderOrderCreatedAdminEmail } from './templates/orderCreatedAdmin.js';
import { renderOrderCreatedCustomerEmail } from './templates/orderCreatedCustomer.js';
import { renderOrderStatusCustomerEmail } from './templates/orderStatusCustomer.js';
import { renderContactSubmittedAdminEmail } from './templates/contactSubmittedAdmin.js';
import { renderContactSubmittedCustomerEmail } from './templates/contactSubmittedCustomer.js';
import type { ContactEmailPayload, OrderEmailPayload } from './types.js';

function getAdminRecipient() {
  return process.env.EMAIL_ADMIN_TO || process.env.EMAIL_SUPPORT_ADDRESS || 'info@researchpeptide.eu';
}

function buildOrderPayload(row: any): OrderEmailPayload | null {
  const shipping = row.shipping_address || {};
  const email = shipping.email;
  if (!email) return null;

  const items = Array.isArray(row.items)
    ? row.items.map((item: any) => ({
        title: item.title || 'Product',
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0),
        specification: item.specification || ''
      }))
    : [];

  return {
    orderId: row.id,
    status: row.status || 'pending',
    customerEmail: email,
    customerName: shipping.fullName || 'Researcher',
    totalAmount: Number(row.total_amount || 0),
    shippingCost: Number(shipping.shipping_cost || 0),
    paymentMethod: shipping.payment_method || 'unknown',
    createdAt: row.created_at,
    items
  };
}

async function markOrderEvent(orderId: string, eventKey: string) {
  const { rows } = await pool.query('SELECT shipping_address FROM orders WHERE id = $1', [orderId]);
  if (!rows[0]) return;
  const shipping = rows[0].shipping_address || {};
  const sentEmailEvents = shipping.sent_email_events || {};
  sentEmailEvents[eventKey] = new Date().toISOString();

  await pool.query('UPDATE orders SET shipping_address = $1 WHERE id = $2', [
    { ...shipping, sent_email_events: sentEmailEvents },
    orderId
  ]);
}

function hasOrderEvent(shippingAddress: any, eventKey: string) {
  const sentEmailEvents = shippingAddress?.sent_email_events || {};
  return Boolean(sentEmailEvents[eventKey]);
}

export async function sendOrderCreatedEmails(orderId: string) {
  const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
  const row = rows[0];
  if (!row) throw new Error('Order not found');

  if (hasOrderEvent(row.shipping_address, 'order_created')) {
    return { skipped: true, reason: 'already-sent' as const };
  }

  const payload = buildOrderPayload(row);
  if (!payload) return { skipped: true, reason: 'missing-customer-email' as const };

  const adminTemplate = renderOrderCreatedAdminEmail(payload);
  const customerTemplate = renderOrderCreatedCustomerEmail(payload);

  await Promise.all([
    sendEmail({
      to: getAdminRecipient(),
      subject: adminTemplate.subject,
      html: adminTemplate.html,
      text: adminTemplate.text
    }),
    sendEmail({
      to: payload.customerEmail,
      subject: customerTemplate.subject,
      html: customerTemplate.html,
      text: customerTemplate.text
    })
  ]);

  await markOrderEvent(orderId, 'order_created');
  return { sent: true as const };
}

export async function sendOrderStatusEmail(orderId: string, status: string) {
  const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
  const row = rows[0];
  if (!row) throw new Error('Order not found');

  const eventKey = `status_${status}`;
  if (hasOrderEvent(row.shipping_address, eventKey)) {
    return { skipped: true, reason: 'already-sent' as const };
  }

  const payload = buildOrderPayload({ ...row, status });
  if (!payload) return { skipped: true, reason: 'missing-customer-email' as const };

  const template = renderOrderStatusCustomerEmail(payload);
  await sendEmail({
    to: payload.customerEmail,
    subject: template.subject,
    html: template.html,
    text: template.text
  });

  await markOrderEvent(orderId, eventKey);
  return { sent: true as const };
}

export async function sendContactEmails(payload: ContactEmailPayload) {
  const adminTemplate = renderContactSubmittedAdminEmail(payload);
  const customerTemplate = renderContactSubmittedCustomerEmail(payload);

  await Promise.all([
    sendEmail({
      to: getAdminRecipient(),
      subject: adminTemplate.subject,
      html: adminTemplate.html,
      text: adminTemplate.text,
      replyTo: payload.email
    }),
    sendEmail({
      to: payload.email,
      subject: customerTemplate.subject,
      html: customerTemplate.html,
      text: customerTemplate.text
    })
  ]);

  return { sent: true as const };
}
