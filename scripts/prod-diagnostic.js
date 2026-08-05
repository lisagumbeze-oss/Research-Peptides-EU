/* Debug session dc5935 — paste into the DevTools console on the live site.
   Collects runtime evidence, then run __dumpDebug() to save a file. */
(() => {
  const log = [];
  const add = (hypothesisId, message, data) => {
    log.push({ sessionId: 'dc5935', hypothesisId, message, data, t: Date.now(), path: location.pathname });
  };
  const t0 = Date.now();
  add('boot', 'probe installed', { href: location.href, ua: navigator.userAgent });

  // C: main-thread blocking
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        if (e.duration >= 150) add('C', 'long task', { durationMs: Math.round(e.duration), startMs: Math.round(e.startTime) });
      }
    }).observe({ type: 'longtask', buffered: true });
  } catch { /* unsupported */ }

  // D2: requests that never settle
  const pending = new Map();
  const origFetch = window.fetch;
  window.fetch = function (...args) {
    const url = String(args[0]?.url ?? args[0] ?? '');
    const started = Date.now();
    const key = Symbol();
    pending.set(key, { url, started });
    return origFetch.apply(this, args).then(
      (res) => { pending.delete(key); const ms = Date.now() - started; if (ms > 1500) add('D2', 'slow fetch', { url, ms, status: res.status }); return res; },
      (err) => { pending.delete(key); add('D2', 'fetch failed', { url, ms: Date.now() - started, error: String(err) }); throw err; },
    );
  };

  // F: spinner/skeleton that never resolves
  let spinnerSince = null;
  setInterval(() => {
    const spinner = document.querySelector('.animate-spin, [role="status"], .animate-pulse');
    if (spinner) {
      if (spinnerSince === null) spinnerSince = Date.now();
      const stuckMs = Date.now() - spinnerSince;
      if (stuckMs > 4000 && stuckMs % 4000 < 1100) {
        add('F', 'loading indicator still visible', {
          stuckMs,
          cls: spinner.className?.toString().slice(0, 120),
          rootChildren: document.getElementById('root')?.childElementCount ?? -1,
          pendingRequests: [...pending.values()].map((p) => ({ url: p.url, ageMs: Date.now() - p.started })),
        });
      }
    } else {
      spinnerSince = null;
    }
  }, 1000);

  // A/B: scroll position across route changes
  const sampleScroll = (why) => {
    add('A,B', `scroll ${why}`, {
      scrollY: window.scrollY,
      docHeight: document.documentElement.scrollHeight,
      scrollRestoration: history.scrollRestoration,
    });
    [400, 1500].forEach((d) => setTimeout(() => add('A,B', `scroll +${d}ms after ${why}`, {
      scrollY: window.scrollY, docHeight: document.documentElement.scrollHeight,
    }), d));
  };
  ['pushState', 'replaceState'].forEach((fn) => {
    const orig = history[fn];
    history[fn] = function (...a) { const r = orig.apply(this, a); sampleScroll(fn); return r; };
  });
  addEventListener('popstate', () => sampleScroll('popstate'));

  // E/G: uncaught errors
  addEventListener('error', (e) => add('G', 'window error', { msg: String(e.message), src: e.filename }));
  addEventListener('unhandledrejection', (e) => add('G', 'unhandled rejection', { reason: String(e.reason).slice(0, 300) }));

  window.__dumpDebug = () => {
    add('boot', 'probe dump', { sessionDurationMs: Date.now() - t0, entries: log.length });
    const ndjson = log.map((l) => JSON.stringify(l)).join('\n');
    const blob = new Blob([ndjson], { type: 'application/x-ndjson' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'debug-dc5935.log';
    a.click();
    console.log('===== COPY EVERYTHING BELOW THIS LINE =====');
    console.log(ndjson);
    console.log('===== COPY EVERYTHING ABOVE THIS LINE =====');
    navigator.clipboard?.writeText(ndjson).catch(() => {});
    return `${log.length} entries: downloaded, printed above, and copied to clipboard if permitted`;
  };

  console.log('%cdebug probe dc5935 active — reproduce the issue, then run __dumpDebug()', 'color:#0a7');
})();
