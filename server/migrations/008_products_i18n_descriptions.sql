-- Optional localized product copy (titles/descriptions per locale).
-- UI falls back to products.title / products.description when a locale key is missing.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS title_i18n JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS description_i18n JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.products.title_i18n IS 'Map of locale code → localized product title, e.g. {"nl":"...","de":"..."}.';
COMMENT ON COLUMN public.products.description_i18n IS 'Map of locale code → localized description; canonical English remains in description column.';
