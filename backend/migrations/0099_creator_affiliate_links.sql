-- Enlaces de afiliado de los creadores. Cada enlace tiene su propio código, que viaja por el mismo `?ref=` que usan los
-- embajadores: el sitio lo valida y lo guarda (AffiliateReferralCapture) y el checkout lo envía como `ref_code`. Así cada
-- enlace tiene sus propios clics y ventas, y la comisión se calcula en el servidor a partir del pedido pagado.
CREATE TABLE IF NOT EXISTS creator_affiliate_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE CHECK (code ~ '^CR-[A-Z0-9]{6,12}$'),
  target_path text NOT NULL CHECK (target_path ~ '^/[^/]' OR target_path = '/'),
  label text,
  clicks integer NOT NULL DEFAULT 0 CHECK (clicks >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_creator_affiliate_links_creator ON creator_affiliate_links (creator_id, created_at DESC);
-- Un mismo destino no se repite entre los enlaces activos de un creador.
CREATE UNIQUE INDEX IF NOT EXISTS uq_creator_affiliate_link_target ON creator_affiliate_links (creator_id, target_path) WHERE archived_at IS NULL;

-- Comisión por pedido: una sola fila del libro por pedido atribuido (idempotente) y, si ya estaba confirmada y el pedido se
-- reembolsa, un reverso aparte.
ALTER TABLE creator_ledger
  ADD COLUMN IF NOT EXISTS affiliate_link_id uuid REFERENCES creator_affiliate_links(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_ref text;
CREATE UNIQUE INDEX IF NOT EXISTS uq_creator_ledger_source_ref ON creator_ledger (source_ref) WHERE source_ref IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_creator_ledger_link ON creator_ledger (affiliate_link_id) WHERE affiliate_link_id IS NOT NULL;
