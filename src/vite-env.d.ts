/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_TAWK_PROPERTY_ID?: string
  readonly VITE_TAWK_WIDGET_ID?: string
  readonly VITE_TAWK_EMBED_ID?: string
  readonly VITE_TAWK_MOBILE_OFFSET_Y?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
