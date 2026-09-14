import { slugifyProductName } from './productUrl';

export type BlogPostLike = {
  id: string;
  title?: string | null;
  slug?: string | null;
};

/** Prefer explicit slug; otherwise derive a stable SEO slug from title + short id. */
export function blogSlug(post: BlogPostLike): string {
  const explicit = post.slug && String(post.slug).trim();
  if (explicit) return explicit;
  const base = slugifyProductName(String(post.title || 'post'));
  const shortId = String(post.id || '').replace(/-/g, '').slice(0, 8);
  return shortId ? `${base}-${shortId}` : base;
}

export function blogPath(post: BlogPostLike): string {
  return `/blog/${blogSlug(post)}`;
}

export function looksLikeUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
