// #region agent log
/** Temporary debug instrumentation sink (session dc5935). Removed after verification. */
const isLocalhost = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname);

const SINKS = isLocalhost
  ? [
      'http://127.0.0.1:7531/ingest/5d07bd36-eb65-4536-846e-5a6ed3c1155a',
      'http://127.0.0.1:7532/ingest/5d07bd36-eb65-4536-846e-5a6ed3c1155a',
    ]
  : ['/api/debug-log?k=dc5935'];

export function agentLog(
  hypothesisId: string,
  location: string,
  message: string,
  data: Record<string, unknown>,
) {
  const payload = JSON.stringify({
    sessionId: 'dc5935',
    runId: 'run1',
    hypothesisId,
    location,
    message,
    data,
    path: window.location.pathname,
    timestamp: Date.now(),
  });
  console.debug('[agent-log dc5935]', location, message, data);
  for (const url of SINKS) {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'dc5935' },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }
}

/** Tracks in-flight requests so a stuck loading state can name what it is waiting on. */
const pendingRequests = new Map<number, { url: string; started: number }>();
let requestSeq = 0;

export function installRequestTracker() {
  if ((window as unknown as { __agentTracker?: boolean }).__agentTracker) return;
  (window as unknown as { __agentTracker?: boolean }).__agentTracker = true;

  const originalFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String((input as Request)?.url ?? input ?? '');
    if (url.includes('/api/debug-log') || url.includes('127.0.0.1:753')) {
      return originalFetch(input, init);
    }
    const key = ++requestSeq;
    const started = Date.now();
    pendingRequests.set(key, { url, started });
    return originalFetch(input, init).then(
      (res) => {
        pendingRequests.delete(key);
        const ms = Date.now() - started;
        if (ms > 2000) agentLog('D2', 'agentLog.ts:60', 'slow request', { url, ms, status: res.status });
        return res;
      },
      (error: unknown) => {
        pendingRequests.delete(key);
        agentLog('D2', 'agentLog.ts:66', 'request failed', {
          url,
          ms: Date.now() - started,
          error: String(error),
        });
        throw error;
      },
    );
  };

  window.addEventListener('error', (event) =>
    agentLog('G', 'agentLog.ts:76', 'uncaught window error', {
      message: String(event.message),
      source: event.filename,
    }),
  );
  window.addEventListener('unhandledrejection', (event) =>
    agentLog('G', 'agentLog.ts:82', 'unhandled promise rejection', {
      reason: String(event.reason).slice(0, 300),
    }),
  );
}

export function pendingRequestSnapshot() {
  const now = Date.now();
  return [...pendingRequests.values()].map((r) => ({ url: r.url, ageMs: now - r.started }));
}
// #endregion
