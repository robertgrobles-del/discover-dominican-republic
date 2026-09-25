-- Integración con el CMS headless (Strapi): columnas que el CMS gestiona, vínculo entre entradas del CMS y filas propias,
-- y bitácora de sincronización. docs §4.3 (opción B). El CMS es la fuente editorial; esta base sólo refleja lo publicado.

-- Campos editoriales que el CMS aporta y las tablas aún no tenían.
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS region text;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS rating numeric(3,2);
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS average_temperature text;
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS price_from_usd numeric(10,2);
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS booking_url text;
CREATE INDEX IF NOT EXISTS idx_destinations_region ON destinations (region) WHERE deleted_at IS NULL;

-- Aeropuertos (antes en src/data/airports.ts).
CREATE TABLE IF NOT EXISTS airports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  name text NOT NULL,
  iata_code text,
  airport_type text CHECK (airport_type IN ('internacional', 'domestico')),
  city text,
  description text,
  airlines jsonb NOT NULL DEFAULT '[]',
  services jsonb NOT NULL DEFAULT '[]',
  transport jsonb NOT NULL DEFAULT '[]',
  image_url text,
  latitude numeric(10,8),
  longitude numeric(11,8),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'published', 'archived')),
  published_at timestamptz,
  unpublished_at timestamptz,
  slug_history text[] NOT NULL DEFAULT '{}',
  seo_title text,
  seo_description text,
  og_image_url text,
  canonical_url text,
  noindex boolean NOT NULL DEFAULT false,
  locale_default text NOT NULL DEFAULT 'es',
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1,
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_airports_status ON airports (status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_airports_iata ON airports (iata_code);
DROP TRIGGER IF EXISTS trg_set_updated_at ON airports;
CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON airports FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Vínculo entrada del CMS (documentId + idioma) ↔ fila propia. `cms_updated_at` evita que un evento atrasado pise a uno más nuevo.
CREATE TABLE IF NOT EXISTS cms_entries (
  cms_uid text NOT NULL,
  document_id text NOT NULL,
  locale text NOT NULL,
  table_name text NOT NULL,
  entity_id uuid NOT NULL,
  cms_updated_at timestamptz,
  last_synced_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (cms_uid, document_id, locale)
);
CREATE INDEX IF NOT EXISTS idx_cms_entries_entity ON cms_entries (table_name, entity_id);

CREATE TABLE IF NOT EXISTS cms_sync_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  received_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL CHECK (source IN ('webhook', 'backfill')),
  event text NOT NULL,
  model text,
  document_id text,
  locale text,
  outcome text NOT NULL CHECK (outcome IN ('applied', 'ignored', 'error')),
  detail text
);
CREATE INDEX IF NOT EXISTS idx_cms_sync_log_received ON cms_sync_log (received_at DESC);
