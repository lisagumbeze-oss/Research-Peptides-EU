import { slugifyProductName } from './productUrl';

export type BlogPostLike = {
  id: string;
  title?: string | null;
  slug?: string | null;
};

export function looksLikeUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

/** Prefer explicit slug; then stable non-UUID ids; otherwise derive from title + short id. */
export function blogSlug(post: BlogPostLike): string {
  const explicit = post.slug && String(post.slug).trim();
  if (explicit) return explicit;
  const id = String(post.id || '').trim();
  // Seeded and CMS posts often use the public path segment as the primary key.
  if (id && !looksLikeUuid(id)) return id;
  const base = slugifyProductName(String(post.title || 'post'));
  const shortId = id.replace(/-/g, '').slice(0, 8);
  return shortId ? `${base}-${shortId}` : base;
}

export function blogPath(post: BlogPostLike): string {
  return `/blog/${blogSlug(post)}`;
}

/** Plain excerpt for listing cards — strips markdown links, emphasis, and headings. */
export function blogExcerpt(content: string, max = 150): string {
  const plain = String(content || '')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max).trimEnd()}…`;
}
