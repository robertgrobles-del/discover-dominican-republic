/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_STRAPI_URL?: string;
  readonly VITE_SUPABASE_URL?: string;
  /** Public browser key only. Never put service-role or private credentials in VITE_* variables. */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  /** "mock" (default) or "api"; validated at runtime in src/lib/dataSource.ts. */
  readonly VITE_DATA_SOURCE?: string;
  readonly VITE_CATALOG_SOURCE?: string;
  /** Identificador del píxel de Meta (sólo dígitos). Vacío: no se carga. */
  readonly VITE_META_PIXEL_ID?: string;
  /** Identificador del píxel de TikTok. Vacío: no se carga. */
  readonly VITE_TIKTOK_PIXEL_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
