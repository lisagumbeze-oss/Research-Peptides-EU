# Blog URL slug plan

## Current (Phase D)

- Public links use SEO slugs via `src/lib/blogUrl.ts`:
  - Prefer `blog_posts.slug` when present
  - Else `{slugified-title}-{first8OfUuid}`
- Route param remains `blog/:id` but accepts **UUID or slug**
- UUID URLs still resolve, then `replace` to the canonical slug path
- Sitemap emits slug URLs (not raw UUIDs)

## Follow-up (optional DB)

1. Add nullable unique `blog_posts.slug TEXT`
2. Backfill from titles
3. Prefer DB slug only; keep derived fallback for legacy rows
4. Admin UI: editable slug field

No migration required for Phase D to ship.
