import type { ReactNode } from 'react';
import { LocaleLink } from '../i18n/LocaleLink';

const MD_LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;
const BARE_URL = /(https?:\/\/[^\s<>"')\]]+)/g;

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href) || href.startsWith('mailto:');
}

function isInternalPath(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//');
}

function linkClassName(external: boolean): string {
  return external
    ? 'text-brand-700 underline underline-offset-2 hover:text-brand-800 break-all'
    : 'text-brand-700 underline underline-offset-2 hover:text-brand-800 font-medium';
}

/**
 * Render plain text with markdown links `[label](href)` and bare http(s) URLs.
 * Internal paths use LocaleLink; external URLs open in a new tab.
 */
export function renderLinkedText(text: string): ReactNode[] {
  if (!text) return [];

  const nodes: ReactNode[] = [];
  let cursor = 0;
  let key = 0;

  const pushPlain = (chunk: string) => {
    if (!chunk) return;
    // Split bare URLs inside remaining plain text
    let last = 0;
    let match: RegExpExecArray | null;
    const re = new RegExp(BARE_URL.source, 'g');
    while ((match = re.exec(chunk)) !== null) {
      if (match.index > last) {
        nodes.push(chunk.slice(last, match.index));
      }
      const url = match[1];
      nodes.push(
        <a
          key={`ext-${key++}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName(true)}
        >
          {url}
        </a>,
      );
      last = match.index + match[0].length;
    }
    if (last < chunk.length) nodes.push(chunk.slice(last));
  };

  const md = new RegExp(MD_LINK.source, 'g');
  let m: RegExpExecArray | null;
  while ((m = md.exec(text)) !== null) {
    if (m.index > cursor) pushPlain(text.slice(cursor, m.index));
    const label = m[1];
    const href = m[2];
    if (isInternalPath(href)) {
      nodes.push(
        <LocaleLink key={`in-${key++}`} to={href} className={linkClassName(false)}>
          {label}
        </LocaleLink>,
      );
    } else if (isExternalHref(href)) {
      nodes.push(
        <a
          key={`out-${key++}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName(true)}
        >
          {label}
        </a>,
      );
    } else {
      nodes.push(m[0]);
    }
    cursor = m.index + m[0].length;
  }

  if (cursor < text.length) pushPlain(text.slice(cursor));
  return nodes;
}
