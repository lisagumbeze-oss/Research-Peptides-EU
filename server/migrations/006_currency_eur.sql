-- Canonical currency: EUR for Research Peptides EU storefront (Supabase public.products / public.orders)
-- Apply in Supabase SQL editor (or your migration runner for the Supabase Postgres instance).

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS currency CHAR(3) NOT NULL DEFAULT 'EUR';

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS currency CHAR(3) NOT NULL DEFAULT 'EUR';

COMMENT ON COLUMN public.products.currency IS 'ISO 4217 code; price and compare_at_price are stored in this currency (EUR).';
COMMENT ON COLUMN public.products.price IS 'Unit price in products.currency (EUR).';
COMMENT ON COLUMN public.orders.currency IS 'ISO 4217 code for total_amount and line items at time of purchase.';

-- Optional one-time conversion when legacy rows were stored as GBP amounts.
-- Safe to run once: only touches rows still marked GBP.
-- Rate documented: 1 GBP = 1.17 EUR (migration May 2026).
UPDATE public.products
SET
  price = ROUND((price * 1.17)::numeric, 2),
  compare_at_price = CASE
    WHEN compare_at_price IS NOT NULL AND compare_at_price > 0
      THEN ROUND((compare_at_price * 1.17)::numeric, 2)
    ELSE compare_at_price
  END,
  currency = 'EUR'
WHERE currency = 'GBP';

UPDATE public.orders
SET currency = 'EUR'
WHERE currency IS NULL OR currency = 'GBP';
