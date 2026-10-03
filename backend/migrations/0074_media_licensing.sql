-- Plan de 150 mejoras, punto 40: licenciamiento de imágenes del banco oficial.
-- Una imagen ofertada sólo entrega su original a quien tenga una licencia vigente; las vistas reducidas siguen públicas.

ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS license_restricted boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS media_license_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL UNIQUE REFERENCES media_assets(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  price_editorial numeric(12,2) NOT NULL CHECK (price_editorial >= 0),
  price_commercial numeric(12,2) NOT NULL CHECK (price_commercial >= 0),
  currency text NOT NULL DEFAULT 'DOP',
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media_license_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES media_license_offers(id) ON DELETE RESTRICT,
  asset_id uuid NOT NULL REFERENCES media_assets(id) ON DELETE RESTRICT,
  buyer_id uuid REFERENCES users(id) ON DELETE SET NULL,
  licensee_name text NOT NULL,
  license_type text NOT NULL CHECK (license_type IN ('editorial', 'commercial')),
  intended_use text NOT NULL,
  price numeric(12,2) NOT NULL,          -- precio al momento de pedirla
  currency text NOT NULL,
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'rejected')),
  payment_reference text,                -- comprobante del pago, registrado por quien aprueba
  decision_note text,
  decided_by uuid REFERENCES users(id) ON DELETE SET NULL,
  decided_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_media_license_orders_buyer ON media_license_orders (buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_license_orders_status ON media_license_orders (status, created_at);
