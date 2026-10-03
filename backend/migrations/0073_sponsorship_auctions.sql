-- Plan de 150 mejoras, punto 28: subasta de posiciones patrocinadas por semana.
-- Además, las campañas pasan a tener dueño: sin él cualquier cuenta podía añadir anuncios a una campaña ajena.

ALTER TABLE sponsorship_campaigns ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_spons_camp_owner ON sponsorship_campaigns (created_by);

ALTER TABLE sponsorship_slots
  ADD COLUMN IF NOT EXISTS auction_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS auction_reserve numeric(12,2) NOT NULL DEFAULT 0 CHECK (auction_reserve >= 0);
UPDATE sponsorship_slots SET auction_enabled = true WHERE id IN ('home_hero_banner', 'search_top');

CREATE TABLE IF NOT EXISTS sponsorship_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id text NOT NULL REFERENCES sponsorship_slots(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES sponsorship_campaigns(id) ON DELETE CASCADE,
  creative_id uuid NOT NULL REFERENCES sponsorship_creatives(id) ON DELETE CASCADE,
  bidder_id uuid REFERENCES users(id) ON DELETE SET NULL,
  period_start date NOT NULL CHECK (extract(isodow FROM period_start) = 1),  -- la semana empieza en lunes
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'DOP',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost', 'withdrawn')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (slot_id, period_start, campaign_id)
);
CREATE INDEX IF NOT EXISTS idx_spons_bids_period ON sponsorship_bids (slot_id, period_start, status);

-- Una subasta se cierra una sola vez por espacio y semana.
CREATE TABLE IF NOT EXISTS sponsorship_auction_results (
  slot_id text NOT NULL REFERENCES sponsorship_slots(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  winners integer NOT NULL,
  closed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  closed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (slot_id, period_start)
);
