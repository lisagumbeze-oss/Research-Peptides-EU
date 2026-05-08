-- Optional strike-through / list price for storefront cards (must be > current price to display).
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS compare_at_price numeric(10, 2);

COMMENT ON COLUMN public.products.compare_at_price IS 'Optional RRP or “was” price; UI shows struck-through when greater than the active price.';
