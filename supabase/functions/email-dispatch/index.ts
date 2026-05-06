import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import nodemailer from 'npm:nodemailer@6.9.16';

type EmailEventRow = {
  id: string;
  event_type: 'order_created' | 'order_status' | 'contact_submitted';
  payload: Record<string, any>;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const safe = (value: string) =>
  (value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value || 0);

function renderLayout(title: string, preheader: string, bodyHtml: string) {
  const brandName = Deno.env.get('EMAIL_BRAND_NAME') || 'PeptiStore';
  const supportAddress = Deno.env.get('EMAIL_SUPPORT_ADDRESS') || 'info@researchpeptide.uk';
  return `<!doctype html><html><head><meta charset="UTF-8" /><title>${safe(title)}</title></head><body style="margin:0;padding:0;background:#f3f6fb;font-family:Inter,Arial,sans-serif;color:#0f172a;"><div style="display:none;max-height:0;overflow:hidden;opacity:0;">${safe(preheader)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;"><tr><td style="background:linear-gradient(120deg,#0f172a,#1d4ed8);padding:24px;"><h1 style="margin:0;font-size:20px;line-height:1.2;color:#ffffff;font-weight:800;">${safe(brandName)}</h1><p style="margin:6px 0 0;color:#bfdbfe;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;">Research Operations</p></td></tr><tr><td style="padding:28px;">${bodyHtml}</td></tr><tr><td style="padding:20px 28px;border-top:1px solid #e2e8f0;background:#f8fafc;"><p style="margin:0;font-size:12px;color:#475569;line-height:1.6;">Need help? Reply to this email or contact <strong>${safe(supportAddress)}</strong>.</p></td></tr></table></td></tr></table></body></html>`;
}

function stripHtml(input: string) {
  return input.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function createTransporter() {
  const host = Deno.env.get('SMTP_HOST');
  const port = Number(Deno.env.get('SMTP_PORT') || '587');
  const user = Deno.env.get('SMTP_USER');
  const pass = Deno.env.get('SMTP_PASS');
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: String(Deno.env.get('SMTP_SECURE') || 'false').toLowerCase() === 'true',
    auth: { user, pass }
  });
}

async function sendEmail(to: string, subject: string, html: string, text: string, replyTo?: string) {
  const transporter = createTransporter();
  if (!transporter) throw new Error('SMTP transport is not configured');
  await transporter.sendMail({
    from: Deno.env.get('SMTP_FROM') || 'PeptiStore <no-reply@researchpeptide.uk>',
    to,
    subject,
    html,
    text,
    replyTo: replyTo || Deno.env.get('SMTP_REPLY_TO') || undefined
  });
}

function renderOrderCreated(payload: Record<string, any>) {
  const orderId = payload.orderId;
  const body = `<p style="margin:0 0 12px;font-size:14px;color:#334155;">Hi ${safe(payload.customerName || 'Researcher')},</p>
  <p style="margin:0 0 16px;font-size:14px;color:#334155;line-height:1.7;">Your order has been received and queued for processing.</p>
  <p style="margin:0 0 8px;font-size:12px;color:#64748b;">Order ID</p><p style="margin:0 0 16px;font-size:18px;color:#1e3a8a;font-weight:800;">${safe(orderId)}</p>
  <p style="margin:0;font-size:14px;color:#334155;">Total: <strong>${formatCurrency(Number(payload.totalAmount || 0))}</strong></p>`;
  return {
    subject: `Order Received • #${String(orderId).slice(0, 8)}`,
    html: renderLayout('Order Received', 'Order received confirmation', body),
    text: stripHtml(body)
  };
}

function renderOrderStatus(payload: Record<string, any>) {
  const orderId = payload.orderId;
  const status = String(payload.status || 'pending');
  const body = `<p style="margin:0 0 12px;font-size:14px;color:#334155;">Hi ${safe(payload.customerName || 'Researcher')},</p>
  <p style="margin:0 0 16px;font-size:14px;color:#334155;line-height:1.7;">Your order status is now <strong style="text-transform:capitalize;">${safe(status)}</strong>.</p>
  <p style="margin:0;font-size:14px;color:#334155;">Order ID: <strong>${safe(orderId)}</strong></p>`;
  return {
    subject: `Order Update • #${String(orderId).slice(0, 8)} • ${status.toUpperCase()}`,
    html: renderLayout('Order Status Updated', `Order is now ${status}`, body),
    text: stripHtml(body)
  };
}

function renderContactAdmin(payload: Record<string, any>) {
  const body = `<p style="margin:0 0 12px;font-size:14px;color:#334155;">New contact submission received.</p>
  <p style="margin:0;font-size:13px;color:#334155;">Name: <strong>${safe(payload.fullName)}</strong></p>
  <p style="margin:6px 0 0;font-size:13px;color:#334155;">Email: <strong>${safe(payload.email)}</strong></p>
  <p style="margin:6px 0 0;font-size:13px;color:#334155;">Subject: <strong>${safe(payload.subject)}</strong></p>
  <div style="margin-top:14px;padding:12px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc;font-size:13px;color:#334155;white-space:pre-wrap;">${safe(payload.message)}</div>`;
  return {
    subject: `Contact Submission • ${payload.subject}`,
    html: renderLayout('New Contact Submission', `New message from ${payload.fullName}`, body),
    text: stripHtml(body)
  };
}

function renderContactCustomer(payload: Record<string, any>) {
  const body = `<p style="margin:0 0 12px;font-size:14px;color:#334155;">Hi ${safe(payload.fullName)},</p>
  <p style="margin:0;font-size:14px;color:#334155;line-height:1.7;">We received your message and will reply shortly.</p>`;
  return {
    subject: 'We Received Your Message',
    html: renderLayout('We Received Your Message', 'Thanks for contacting us', body),
    text: stripHtml(body)
  };
}

async function processEvent(event: EmailEventRow) {
  const adminTo = Deno.env.get('EMAIL_ADMIN_TO') || 'info@researchpeptide.uk';

  if (event.event_type === 'order_created') {
    const tpl = renderOrderCreated(event.payload);
    await Promise.all([
      sendEmail(String(event.payload.customerEmail), tpl.subject, tpl.html, tpl.text),
      sendEmail(adminTo, `New ${tpl.subject}`, tpl.html, tpl.text)
    ]);
    return;
  }

  if (event.event_type === 'order_status') {
    const tpl = renderOrderStatus(event.payload);
    await sendEmail(String(event.payload.customerEmail || ''), tpl.subject, tpl.html, tpl.text);
    return;
  }

  if (event.event_type === 'contact_submitted') {
    const adminTpl = renderContactAdmin(event.payload);
    const customerTpl = renderContactCustomer(event.payload);
    await Promise.all([
      sendEmail(adminTo, adminTpl.subject, adminTpl.html, adminTpl.text, String(event.payload.email)),
      sendEmail(String(event.payload.email), customerTpl.subject, customerTpl.html, customerTpl.text)
    ]);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: events, error } = await supabase
      .from('email_events')
      .select('id,event_type,payload')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(20);

    if (error) throw error;
    const rows = (events || []) as EmailEventRow[];

    for (const event of rows) {
      await supabase
        .from('email_events')
        .update({ status: 'processing', attempts: 1 })
        .eq('id', event.id);

      try {
        await processEvent(event);
        await supabase
          .from('email_events')
          .update({ status: 'sent', processed_at: new Date().toISOString(), last_error: null })
          .eq('id', event.id);
      } catch (sendError: any) {
        await supabase
          .from('email_events')
          .update({ status: 'failed', last_error: String(sendError?.message || sendError), processed_at: new Date().toISOString() })
          .eq('id', event.id);
      }
    }

    return new Response(JSON.stringify({ success: true, processed: rows.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
