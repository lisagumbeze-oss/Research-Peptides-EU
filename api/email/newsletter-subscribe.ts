import {
  renderNewsletterSubscribeAdminEmail,
  renderNewsletterSubscribeCustomerEmail
} from '../lib/emailTemplates.js';
import { sendTransactionalEmail } from '../lib/resendSend.js';

function getAdminRecipient() {
  return process.env.EMAIL_ADMIN_TO || process.env.EMAIL_SUPPORT_ADDRESS || 'info@researchpeptide.eu';
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const emailRaw = req.body?.email;
    const email = typeof emailRaw === 'string' ? emailRaw.trim().toLowerCase() : '';

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email address' });
    }

    const payload = { email };
    const adminTemplate = renderNewsletterSubscribeAdminEmail(payload);
    const customerTemplate = renderNewsletterSubscribeCustomerEmail(payload);

    const results = await Promise.allSettled([
      sendTransactionalEmail({
        to: getAdminRecipient(),
        subject: adminTemplate.subject,
        html: adminTemplate.html,
        text: adminTemplate.text,
        replyTo: payload.email
      }),
      sendTransactionalEmail({
        to: payload.email,
        subject: customerTemplate.subject,
        html: customerTemplate.html,
        text: customerTemplate.text
      })
    ]);

    const failures = results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];
    if (failures.length > 0) {
      const reasons = failures
        .map((f) => {
          const reason = f.reason;
          if (reason instanceof Error) return reason.message;
          if (typeof reason === 'string') return reason;
          return JSON.stringify(reason);
        })
        .join(' | ');
      throw new Error(`Newsletter email dispatch failed: ${reasons}`);
    }

    const successes = results.filter((r) => r.status === 'fulfilled') as PromiseFulfilledResult<any>[];
    const dryRun = successes.some((s) => s.value.dryRun);

    return res.status(200).json({
      success: true,
      dryRun,
      recipients: ['admin', 'customer']
    });
  } catch (error: unknown) {
    console.error('newsletter-subscribe handler:', error);
    const msg =
      error instanceof Error ? error.message : typeof error === 'string' ? error : JSON.stringify(error);
    return res.status(500).json({
      success: false,
      error: msg || 'Newsletter subscribe failed — check Vercel logs and RESEND_* env vars.'
    });
  }
}
