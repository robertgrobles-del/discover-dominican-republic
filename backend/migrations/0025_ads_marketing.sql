-- Servidor de anuncios, canje de ofertas y campañas de correo (docs §5.12).

CREATE TABLE IF NOT EXISTS ad_slots (
  placement text PRIMARY KEY CHECK (placement ~ '^[a-z][a-z0-9_]{1,50}$'),
  label text NOT NULL,
  width_pct integer NOT NULL DEFAULT 100 CHECK (width_pct BETWEEN 1 AND 100),
  height_px integer NOT NULL DEFAULT 250 CHECK (height_px > 0),
  max_items integer NOT NULL DEFAULT 1 CHECK (max_items BETWEEN 1 AND 10),
  is_active boolean NOT NULL DEFAULT true
);
INSERT INTO ad_slots (placement, label, width_pct, height_px, max_items) VALUES
  ('home_hero', 'Portada: cabecera', 100, 420, 3), ('home_between', 'Portada: entre secciones', 100, 200, 1), ('destination_sponsor_1', 'Destino: patrocinador 1', 100, 160, 1),
  ('destination_sponsor_2', 'Destino: patrocinador 2', 100, 160, 1), ('sidebar_left', 'Lateral izquierdo', 15, 600, 1), ('sidebar_right', 'Lateral derecho', 15, 600, 1), ('article_inline', 'Artículo: entre párrafos', 100, 180, 1)
ON CONFLICT DO NOTHING;

-- Contadores diarios por banner (baratos de leer en reportes) y deduplicación por sesión y hora (sin IP: sólo un hash truncado de la sesión).
CREATE TABLE IF NOT EXISTS ad_stats (
  banner_id uuid NOT NULL REFERENCES ad_banners(id) ON DELETE CASCADE,
  day date NOT NULL,
  impressions integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  PRIMARY KEY (banner_id, day)
);
CREATE TABLE IF NOT EXISTS ad_seen (
  banner_id uuid NOT NULL REFERENCES ad_banners(id) ON DELETE CASCADE,
  session_hash text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('impression', 'click')),
  hour timestamptz NOT NULL,
  PRIMARY KEY (banner_id, session_hash, kind, hour)
);
CREATE INDEX IF NOT EXISTS idx_ad_seen_hour ON ad_seen (hour);

CREATE TABLE IF NOT EXISTS offer_redemptions (
  offer_id uuid NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (offer_id, user_id)
);

ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS sent_at timestamptz;
CREATE TABLE IF NOT EXISTS campaign_deliveries (
  campaign_id uuid NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (campaign_id, email)
);
