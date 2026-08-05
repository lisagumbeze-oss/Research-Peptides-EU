-- Adds the crypto transaction reference the admin order editor and the
-- CoinPayments IPN handler both write to (server/src/index.ts).
--
-- Run in the Supabase SQL editor (or `npm run db:migrate`) after 000_storefront_schema.sql.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS crypto_tx_hash TEXT;

COMMENT ON COLUMN public.orders.crypto_tx_hash IS 'Crypto TXID / transaction hash or explorer URL for the payment settling this order.';

CREATE INDEX IF NOT EXISTS idx_orders_crypto_tx_hash
  ON public.orders(crypto_tx_hash)
  WHERE crypto_tx_hash IS NOT NULL;

NOTIFY pgrst, 'reload schema';
