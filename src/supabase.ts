import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://cdpwpggnjdknryhkjccd.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkcHdwZ2duamRrbnJ5aGtqY2NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0ODgwMjMsImV4cCI6MjA5NTA2NDAyM30.bfIb6kURk3B7R1fUgt99PdDmHatPnTYmGpL7yDliM3g';

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ||
  DEFAULT_SUPABASE_URL;

const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ||
  DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
