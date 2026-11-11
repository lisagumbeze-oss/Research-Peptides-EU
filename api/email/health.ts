/**
 * Email/order API env health — booleans only, no secrets.
 * GET /api/email/health
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED);
  const hasSupabaseUrl = Boolean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const hasAnonKey = Boolean(process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY);
  const hasResendKey = Boolean(process.env.RESEND_API_KEY);
  const hasResendFrom = Boolean(process.env.RESEND_FROM || process.env.EMAIL_FROM);
  const hasAdminTo = Boolean(process.env.EMAIL_ADMIN_TO || process.env.EMAIL_SUPPORT_ADDRESS);
  const dryRun = String(process.env.EMAIL_DRY_RUN || 'false').toLowerCase() === 'true';

  // Orders live on Neon; Supabase is still required for auth (JWT + admin role).
  const ready =
    hasDatabaseUrl && hasSupabaseUrl && hasAnonKey && hasResendKey && hasResendFrom;

  const body = {
    success: true,
    ready,
    ordersStore: 'neon',
    hasDatabaseUrl,
    hasSupabaseUrl,
    hasServiceRole,
    hasAnonKey,
    hasResendKey,
    hasResendFrom,
    hasAdminTo,
    dryRun,
  };

  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'HEAD') {
    return res.status(ready ? 200 : 503).end();
  }
  return res.status(ready ? 200 : 503).json(body);
}
