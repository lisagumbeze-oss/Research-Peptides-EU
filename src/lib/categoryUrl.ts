/** Canonical path for a category landing (no locale prefix). */
export function categoryPath(slug: string): string {
  const clean = String(slug || '')
    .trim()
    .replace(/^\/+|\/+$/g, '');
  return `/category/${clean}`;
}
