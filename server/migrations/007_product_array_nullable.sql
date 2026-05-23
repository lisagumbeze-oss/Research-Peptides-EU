-- Legacy imports (CSV / Supabase Table Editor) often send explicit NULL for array columns.
-- PostgreSQL defaults do not apply when NULL is supplied, which breaks NOT NULL constraints.

ALTER TABLE public.products
  ALTER COLUMN specifications DROP NOT NULL,
  ALTER COLUMN specifications SET DEFAULT '{}';

ALTER TABLE public.products
  ALTER COLUMN images DROP NOT NULL,
  ALTER COLUMN images SET DEFAULT '{}';

ALTER TABLE public.products
  ALTER COLUMN categories DROP NOT NULL,
  ALTER COLUMN categories SET DEFAULT '{}';

UPDATE public.products SET specifications = '{}' WHERE specifications IS NULL;
UPDATE public.products SET images = '{}' WHERE images IS NULL;
UPDATE public.products SET categories = '{}' WHERE categories IS NULL;

COMMENT ON COLUMN public.products.specifications IS 'Product spec lines; use {} when none (legacy rows may be NULL).';
