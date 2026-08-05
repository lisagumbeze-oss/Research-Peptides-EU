import { createServer } from 'node:http';
import { appendFileSync } from 'node:fs';
import path from 'node:path';

const PORT = 7532;
const LOG_PATH = path.resolve(process.cwd(), 'debug-dc5935.log');

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Debug-Session-Id',
};

createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors);
    res.end();
    return;
  }
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });
  req.on('end', () => {
    try {
      const parsed = JSON.parse(body);
      appendFileSync(LOG_PATH, `${JSON.stringify(parsed)}\n`);
    } catch {
      appendFileSync(LOG_PATH, `${JSON.stringify({ raw: body })}\n`);
    }
    res.writeHead(204, cors);
    res.end();
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log(`agent debug collector listening on http://127.0.0.1:${PORT} -> ${LOG_PATH}`);
});
