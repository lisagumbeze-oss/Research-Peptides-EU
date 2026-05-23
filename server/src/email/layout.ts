const safe = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export function formatCurrency(value: number, locale = 'en-IE', currency = 'EUR') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value || 0);
}

export function renderBrandLayout(params: { title: string; preheader: string; bodyHtml: string }) {
  const brandName = process.env.EMAIL_BRAND_NAME || 'Research Peptides EU';
  const supportAddress = process.env.EMAIL_SUPPORT_ADDRESS || 'info@researchpeptide.eu';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safe(params.title)}</title>
</head>
<body style="margin:0;padding:0;background:#f3f6fb;font-family:Inter,Arial,sans-serif;color:#0f172a;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${safe(params.preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr>
            <td style="background:linear-gradient(120deg,#0f2744,#2db5a3 55%,#1a365d);padding:24px;">
              <h1 style="margin:0;font-size:20px;line-height:1.2;color:#ffffff;font-weight:800;">${safe(brandName)}</h1>
              <p style="margin:6px 0 0;color:#c8f2eb;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;">Research Operations</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              ${params.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px;border-top:1px solid #e2e8f0;background:#f8fafc;">
              <p style="margin:0;font-size:12px;color:#475569;line-height:1.6;">
                Need help? Reply to this email or contact <strong>${safe(supportAddress)}</strong>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function stripHtml(input: string) {
  return input
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
