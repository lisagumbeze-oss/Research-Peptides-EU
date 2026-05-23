import { useEffect } from 'react';

const SCRIPT_ATTR = 'data-rp-jsonld';

export function JsonLd({ data }: { data: Record<string, unknown>[] }) {
  const serialized = JSON.stringify(data);

  useEffect(() => {
    const blocks = JSON.parse(serialized) as Record<string, unknown>[];
    const scripts: HTMLScriptElement[] = [];
    for (const block of blocks) {
      const el = document.createElement('script');
      el.type = 'application/ld+json';
      el.setAttribute(SCRIPT_ATTR, '1');
      el.textContent = JSON.stringify(block);
      document.head.appendChild(el);
      scripts.push(el);
    }
    return () => {
      scripts.forEach((el) => el.remove());
    };
  }, [serialized]);

  return null;
}
