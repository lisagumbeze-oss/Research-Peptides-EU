/**
 * TEMPORARY debug log sink for session dc5935. Delete once the hang is fixed.
 *
 * POST /api/debug-log?k=dc5935  → appends one NDJSON entry
 * GET  /api/debug-log?k=dc5935  → returns collected entries (newest last)
 *
 * Entries are buffered in the function instance (/tmp), so they survive between
 * requests hitting the same warm instance and are also emitted to Vercel logs.
 */
import { appendFileSync, existsSync, readFileSync, unlinkSync } from 'node:fs';

const TOKEN = 'dc5935';
const BUFFER_PATH = '/tmp/debug-dc5935.log';
const MAX_BYTES = 2_000_000;

export default async function handler(req: any, res: any) {
  if (req.query?.k !== TOKEN) {
    return res.status(404).json({ error: 'Not found' });
  }

  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    if (req.query?.clear === '1') {
      try {
        if (existsSync(BUFFER_PATH)) unlinkSync(BUFFER_PATH);
      } catch {
        /* ignore */
      }
      return res.status(200).json({ cleared: true });
    }
    let body = '';
    try {
      if (existsSync(BUFFER_PATH)) body = readFileSync(BUFFER_PATH, 'utf8');
    } catch {
      /* ignore */
    }
    const lines = body.split('\n').filter(Boolean);
    return res.status(200).json({ count: lines.length, entries: lines });
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
    return res.status(204).end();
  } catch {
    return res.status(400).json({ error: 'Bad payload' });
  }
}
