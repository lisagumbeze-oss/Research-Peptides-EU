/**
 * Resolve the calling user from a Supabase access token (auth stays on Supabase).
 */
export type AuthUser = {
  id: string;
  email: string | null;
};

function supabaseUrl() {
  return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
}

function supabaseAnonKey() {
  return process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
}

function supabaseServiceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

export async function getUserFromRequest(req: any): Promise<AuthUser | null> {
  const header = String(req?.headers?.authorization || req?.headers?.Authorization || '');
  if (!header.toLowerCase().startsWith('bearer ')) return null;
  const token = header.slice(7).trim();
  if (!token) return null;

  const url = supabaseUrl();
  const anon = supabaseAnonKey();
  if (!url || !anon) return null;

  const res = await fetch(`${url}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: anon,
    },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { id?: string; email?: string };
  if (!data?.id) return null;
  return { id: data.id, email: data.email || null };
}

function configuredAdminEmails(): string[] {
  return (process.env.VITE_ADMIN_EMAILS || process.env.EMAIL_ADMIN_TO || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Admin if users.role = admin (Supabase) or email is in VITE_ADMIN_EMAILS / EMAIL_ADMIN_TO. */
export async function isAdminUser(user: AuthUser): Promise<boolean> {
  const email = (user.email || '').toLowerCase();
  if (email && configuredAdminEmails().includes(email)) return true;

  const url = supabaseUrl();
  const key = supabaseServiceKey() || supabaseAnonKey();
  if (!url || !key) return false;

  const res = await fetch(
    `${url}/rest/v1/users?id=eq.${encodeURIComponent(user.id)}&select=role,email&limit=1`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    },
  );
  if (!res.ok) return false;
  const rows = (await res.json()) as { role?: string; email?: string }[];
  const row = rows[0];
  if (!row) return false;
  if (String(row.role || '').toLowerCase() === 'admin') return true;
  const rowEmail = String(row.email || '').toLowerCase();
  return Boolean(rowEmail && configuredAdminEmails().includes(rowEmail));
}

export async function requireAdmin(req: any): Promise<AuthUser> {
  const user = await getUserFromRequest(req);
  if (!user) {
    const err = new Error('Unauthorized');
    (err as any).status = 401;
    throw err;
  }
  if (!(await isAdminUser(user))) {
    const err = new Error('Forbidden');
    (err as any).status = 403;
    throw err;
  }
  return user;
}
