-- Email event queue for Supabase-native transactional email dispatch
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.email_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  idempotency_key TEXT UNIQUE,
  order_id UUID NULL REFERENCES public.orders(id) ON DELETE SET NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT email_events_status_check CHECK (status IN ('pending', 'processing', 'sent', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_email_events_status_created_at ON public.email_events(status, created_at);
CREATE INDEX IF NOT EXISTS idx_email_events_order_id ON public.email_events(order_id);

CREATE OR REPLACE FUNCTION public.set_email_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_email_events_updated_at ON public.email_events;
CREATE TRIGGER trg_email_events_updated_at
  BEFORE UPDATE ON public.email_events
  FOR EACH ROW
  EXECUTE FUNCTION public.set_email_events_updated_at();

ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

-- Allow client writes for queueing events from checkout/contact/admin actions.
DROP POLICY IF EXISTS "email_events_insert_all" ON public.email_events;
CREATE POLICY "email_events_insert_all"
ON public.email_events
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Read policy only for authenticated users (useful for admin/debug UI if needed later).
DROP POLICY IF EXISTS "email_events_select_authenticated" ON public.email_events;
CREATE POLICY "email_events_select_authenticated"
ON public.email_events
FOR SELECT
TO authenticated
USING (true);
