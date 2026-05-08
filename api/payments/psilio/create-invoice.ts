type CreateInvoiceBody = {
  order_id?: string;
  amount?: number;
  currency?: string;
  email?: string;
  name?: string;
};

function firstDefined(...values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

function pickPaymentUrl(payload: any): string | null {
  if (!payload || typeof payload !== 'object') return null;

  const candidates = [
    payload.payment_url,
    payload.paymentUrl,
    payload.invoice_url,
    payload.invoiceUrl,
    payload.checkout_url,
    payload.checkoutUrl,
    payload.url,
    payload.hosted_url,
    payload.hostedUrl,
    payload?.data?.payment_url,
    payload?.data?.paymentUrl,
    payload?.data?.invoice_url,
    payload?.data?.invoiceUrl,
    payload?.data?.checkout_url,
    payload?.data?.checkoutUrl,
    payload?.data?.url,
  ];

  for (const value of candidates) {
    if (typeof value === 'string' && /^https?:\/\//i.test(value)) return value;
  }

  return null;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const apiUrl = firstDefined(process.env.PSILIO_CREATE_INVOICE_URL, process.env.PLISIO_CREATE_INVOICE_URL);
  const secret = firstDefined(process.env.PSILIO_SECRET_KEY, process.env.PLISIO_SECRET_KEY);
  const successUrl = firstDefined(process.env.PSILIO_SUCCESS_URL, process.env.PLISIO_SUCCESS_URL);
  const failedUrl = firstDefined(process.env.PSILIO_FAILED_URL, process.env.PLISIO_FAILED_URL);
  const statusUrl = firstDefined(process.env.PSILIO_STATUS_URL, process.env.PLISIO_STATUS_URL);

  if (!apiUrl || !secret) {
    return res.status(500).json({
      success: false,
      error:
        'Plisio is not configured. Missing PSILIO_CREATE_INVOICE_URL/PLISIO_CREATE_INVOICE_URL or PSILIO_SECRET_KEY/PLISIO_SECRET_KEY.',
    });
  }

  try {
    const body = (req.body || {}) as CreateInvoiceBody;
    const orderId = String(body.order_id || '').trim();
    const amount = Number(body.amount || 0);
    const currency = String(body.currency || 'GBP').toUpperCase();
    const email = String(body.email || '').trim();
    const name = String(body.name || '').trim();

    if (!orderId || !Number.isFinite(amount) || amount <= 0 || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: order_id, amount (>0), email.',
      });
    }

    // Plisio expects api_key + invoice fields as query/form params.
    // Works with endpoint like: https://api.plisio.net/api/v1/invoices/new
    const params = new URLSearchParams();
    params.set('api_key', secret);
    params.set('order_number', orderId);
    params.set('order_name', name || `Order ${orderId}`);
    params.set('source_amount', amount.toFixed(2));
    params.set('source_currency', currency);
    params.set('email', email);
    params.set('plugin', 'peptistore');
    if (statusUrl) params.set('callback_url', statusUrl);
    if (successUrl) params.set('success_callback_url', successUrl);
    if (failedUrl) params.set('fail_callback_url', failedUrl);

    const postAttempt = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: params.toString(),
    });

    const postText = await postAttempt.text();
    let postJson: any = {};
    try {
      postJson = postText ? JSON.parse(postText) : {};
    } catch {
      postJson = {};
    }

    let paymentUrl = null as string | null;
    let finalStatusCode = postAttempt.status;
    let finalJson = postJson;
    let finalText = postText;
    let finalError =
      typeof postJson?.data?.message === 'string'
        ? postJson.data.message
        : typeof postJson?.message === 'string'
          ? postJson.message
          : postText;

    if (postAttempt.ok && postJson?.status !== 'error') {
      paymentUrl = pickPaymentUrl(postJson);
    }

    // Plisio integrations can vary by method; fall back to GET if POST did not yield a usable URL.
    if (!paymentUrl) {
      const join = apiUrl.includes('?') ? '&' : '?';
      const getAttempt = await fetch(`${apiUrl}${join}${params.toString()}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      const getText = await getAttempt.text();
      let getJson: any = {};
      try {
        getJson = getText ? JSON.parse(getText) : {};
      } catch {
        getJson = {};
      }

      finalStatusCode = getAttempt.status;
      finalJson = getJson;
      finalText = getText;
      finalError =
        typeof getJson?.data?.message === 'string'
          ? getJson.data.message
          : typeof getJson?.message === 'string'
            ? getJson.message
            : getText;

      if (getAttempt.ok && getJson?.status !== 'error') {
        paymentUrl = pickPaymentUrl(getJson);
      }
    }

    if (!paymentUrl) {
      return res.status(502).json({
        success: false,
        error: `Plisio invoice request failed (${finalStatusCode}). ${
          typeof finalError === 'string' && finalError.trim()
            ? finalError
            : 'No payment URL was returned.'
        }`,
        response: finalJson || finalText,
      });
    }

    return res.status(200).json({
      success: true,
      paymentUrl,
      raw: finalJson,
    });
  } catch (error: any) {
    console.error('psilio create-invoice handler:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to create Psilio invoice',
    });
  }
}
