/**
 * TEMPORARY debug log sink for session dc5935. Delete once the hang is fixed.
 *
 * POST /api/debug-log?k=dc5935  → persists one NDJSON entry
 * GET  /api/debug-log?k=dc5935  → returns collected entries (plus sink diagnostics)
 * GET  /api/debug-log?k=dc5935&clear=1 → drops collected entries
 *
 * Entries go to Supabase Storage so they survive serverless instance recycling,
 * with a /tmp buffer as a fast path and Vercel function logs as a last resort.
 */
import { appendFileSync, existsSync, readFileSync, unlinkSync } from 'node:fs';

const TOKEN = 'dc5935';
const BUFFER_PATH = '/tmp/debug-dc5935.log';
const BUCKET = 'debug-dc5935';
const MAX_BYTES = 2_000_000;

function storageConfig() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { base: `${url.replace(/\/+$/, '')}/storage/v1`, key };
}

function authHeaders(key: string) {
  return { apikey: key, Authorization: `Bearer ${key}` };
}

async function ensureBucket(cfg: { base: string; key: string }) {
  await fetch(`${cfg.base}/bucket`, {
    method: 'POST',
    headers: { ...authHeaders(cfg.key), 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: BUCKET, id: BUCKET, public: false }),
  }).catch(() => undefined);
}

async function persistRemote(cfg: { base: string; key: string }, line: string) {
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`;
  const put = () =>
    fetch(`${cfg.base}/object/${BUCKET}/${name}`, {
      method: 'POST',
      headers: { ...authHeaders(cfg.key), 'Content-Type': 'application/json' },
      body: line,
    });

  let res = await put().catch(() => undefined);
  if (!res || res.status === 404 || res.status === 400) {
    await ensureBucket(cfg);
    res = await put().catch(() => undefined);
  }
  return res?.status ?? 0;
}

async function readRemote(cfg: { base: string; key: string }) {
  const listRes = await fetch(`${cfg.base}/object/list/${BUCKET}`, {
    method: 'POST',
    headers: { ...authHeaders(cfg.key), 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix: '', limit: 1000, sortBy: { column: 'name', order: 'asc' } }),
  }).catch(() => undefined);

  if (!listRes || !listRes.ok) return { entries: [] as string[], listStatus: listRes?.status ?? 0 };

  const objects = (await listRes.json().catch(() => [])) as Array<{ name: string }>;
  const entries = await Promise.all(
    objects.map(async (o) => {
      const r = await fetch(`${cfg.base}/object/${BUCKET}/${o.name}`, {
        headers: authHeaders(cfg.key),
      }).catch(() => undefined);
      return r && r.ok ? r.text() : null;
    }),
  );
  return {
    entries: entries.filter((e): e is string => Boolean(e)),
    listStatus: listRes.status,
    objectCount: objects.length,
  };
}

async function clearRemote(cfg: { base: string; key: string }) {
  const { entries: _ignored, ...rest } = await readRemote(cfg);
  const listRes = await fetch(`${cfg.base}/object/list/${BUCKET}`, {
    method: 'POST',
    headers: { ...authHeaders(cfg.key), 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix: '', limit: 1000 }),
  }).catch(() => undefined);
  if (!listRes || !listRes.ok) return rest;
  const objects = (await listRes.json().catch(() => [])) as Array<{ name: string }>;
  await fetch(`${cfg.base}/object/${BUCKET}`, {
    method: 'DELETE',
    headers: { ...authHeaders(cfg.key), 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefixes: objects.map((o) => o.name) }),
  }).catch(() => undefined);
  return rest;
}

export default async function handler(req: any, res: any) {
  if (req.query?.k !== TOKEN) {
    return res.status(404).json({ error: 'Not found' });
  }

  res.setHeader('Cache-Control', 'no-store');
  const cfg = storageConfig();

  if (req.method === 'GET') {
    if (req.query?.clear === '1') {
      try {
        if (existsSync(BUFFER_PATH)) unlinkSync(BUFFER_PATH);
      } catch {
        /* ignore */
      }
      const diag = cfg ? await clearRemote(cfg) : null;
      return res.status(200).json({ cleared: true, remote: diag });
    }

    let local: string[] = [];
    try {
      if (existsSync(BUFFER_PATH)) local = readFileSync(BUFFER_PATH, 'utf8').split('\n').filter(Boolean);
    } catch {
      /* ignore */
    }

    const remote = cfg ? await readRemote(cfg) : { entries: [] as string[] };
    const merged = [...new Set([...remote.entries, ...local])];

    return res.status(200).json({
      count: merged.length,
      entries: merged,
      diagnostics: {
        hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        hasSupabaseUrl: Boolean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
        localBufferCount: local.length,
        remote,
        instanceStartedAt: INSTANCE_STARTED_AT,
      },
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const entry = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const line = JSON.stringify({
      ...entry,
      serverReceivedAt: Date.now(),
      ua: req.headers?.['user-agent'] ?? null,
    });
    console.log(`[debug-dc5935] ${line}`);
    try {
      if (!existsSync(BUFFER_PATH) || readFileSync(BUFFER_PATH).byteLength < MAX_BYTES) {
        appendFileSync(BUFFER_PATH, `${line}\n`);
      }
    } catch {
      /* buffer is best effort */
    }
    if (cfg) await persistRemote(cfg, line);
    return res.status(204).end();
  } catch {
    return res.status(400).json({ error: 'Bad payload' });
  }
}

const INSTANCE_STARTED_AT = Date.now();
