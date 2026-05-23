import {
  renderContactSubmittedAdminEmail,
  renderContactSubmittedCustomerEmail
} from '../lib/emailTemplates.js';
import { sendTransactionalEmail } from '../lib/resendSend.js';

function getAdminRecipient() {
  return process.env.EMAIL_ADMIN_TO || process.env.EMAIL_SUPPORT_ADDRESS || 'info@researchpeptide.eu';
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { fullName, email, subject, message } = req.body || {};
    if (!fullName || !email || !subject || !message) {
      return res.status(400).json({ success: false, error: 'Missing required contact fields' });
    }

    const payload = { fullName, email, subject, message };
    const adminTemplate = renderContactSubmittedAdminEmail(payload);
    const customerTemplate = renderContactSubmittedCustomerEmail(payload);

    // Both admin + customer emails are required for a successful submit.
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
      throw new Error(`Contact email dispatch failed: ${reasons}`);
    }

    const successes = results.filter((r) => r.status === 'fulfilled') as PromiseFulfilledResult<any>[];
    const dryRun = successes.some((s) => s.value.dryRun);
    
    return res.status(200).json({ 
      success: true, 
      dryRun,
      recipients: ['admin', 'customer']
    });
  } catch (error: unknown) {
    console.error('contact handler:', error);
    const msg =
      error instanceof Error ? error.message : typeof error === 'string' ? error : JSON.stringify(error);
    return res.status(500).json({
      success: false,
      error: msg || 'Contact email handler failed — check Vercel function logs and RESEND_* env vars.'
    });
  }
}
