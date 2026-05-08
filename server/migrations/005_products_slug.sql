-- Add SEO-friendly product slug support
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS slug TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique_idx
ON public.products(slug);

COMMENT ON COLUMN public.products.slug IS 'SEO-friendly product slug derived from title.';
