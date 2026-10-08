-- Seguimiento servidor a servidor (postback) de banners: cada clic a un anunciante lleva un `click_id` único y
-- aleatorio; cuando el anunciante registra una compra, avisa a `POST|GET /api/v1/ads/postback` con ese `click_id`,
-- firmado con la clave del banner. Complementa (no reemplaza) el enlace con UTM.

-- Nombre del parámetro con el que cada anunciante espera recibir el identificador (p. ej. click_id, subid, aff_sub).
ALTER TABLE ad_banners ADD COLUMN IF NOT EXISTS click_id_param text NOT NULL DEFAULT 'click_id';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ad_banners_click_id_param_chk') THEN
    ALTER TABLE ad_banners ADD CONSTRAINT ad_banners_click_id_param_chk CHECK (click_id_param ~ '^[A-Za-z][A-Za-z0-9_]{0,30}$');
  END IF;
END $$;

-- Clave de firma por banner. Va en su propia tabla para que el CRUD genérico de banners nunca la devuelva.
CREATE TABLE IF NOT EXISTS ad_postback_keys (
  banner_id uuid PRIMARY KEY REFERENCES ad_banners(id) ON DELETE CASCADE,
  secret text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  rotated_at timestamptz
);

-- Un registro por clic hacia un destino externo (https). El identificador no se puede adivinar.
CREATE TABLE IF NOT EXISTS ad_clicks (
  click_id text PRIMARY KEY CHECK (length(click_id) BETWEEN 16 AND 64),
  banner_id uuid NOT NULL REFERENCES ad_banners(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_banner ON ad_clicks (banner_id, created_at);

-- Compras notificadas. (banner, pedido del anunciante) es único: reenviar el mismo aviso no duplica la venta.
CREATE TABLE IF NOT EXISTS ad_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  click_id text NOT NULL REFERENCES ad_clicks(click_id) ON DELETE CASCADE,
  banner_id uuid NOT NULL REFERENCES ad_banners(id) ON DELETE CASCADE,
  external_order_id text NOT NULL CHECK (length(external_order_id) BETWEEN 1 AND 100),
  value numeric(12, 2) NOT NULL CHECK (value >= 0),
  currency text NOT NULL DEFAULT 'USD' CHECK (currency ~ '^[A-Z]{3}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (banner_id, external_order_id)
);
CREATE INDEX IF NOT EXISTS idx_ad_conversions_banner ON ad_conversions (banner_id, created_at);
