-- Plan de accesos por perfil, puntos 87 a 93: campañas con creadores, derechos por pieza,
-- libro de ingresos por concepto y disputas.

-- 87) Campaña y sus términos. Los términos viven aparte y por versión: nunca se editan.
CREATE TABLE IF NOT EXISTS creator_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  sponsor text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed')),
  current_version integer NOT NULL DEFAULT 1,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);

CREATE TABLE IF NOT EXISTS creator_campaign_terms (
  campaign_id uuid NOT NULL REFERENCES creator_campaigns(id) ON DELETE CASCADE,
  version integer NOT NULL,
  terms jsonb NOT NULL,
  terms_hash text NOT NULL, -- SHA-256 del texto canónico: prueba de qué se aceptó
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (campaign_id, version)
);

CREATE OR REPLACE FUNCTION creator_campaign_terms_immutable() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'creator_campaign_terms es inmutable: cada cambio es una versión nueva';
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS creator_campaign_terms_immutable ON creator_campaign_terms;
CREATE TRIGGER creator_campaign_terms_immutable BEFORE UPDATE ON creator_campaign_terms FOR EACH ROW EXECUTE FUNCTION creator_campaign_terms_immutable();

-- 88) Aceptación versionada: quién aceptó qué versión, cuándo y desde dónde. Se conserva aunque los términos cambien.
CREATE TABLE IF NOT EXISTS creator_campaign_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL,
  version integer NOT NULL,
  creator_id uuid NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  terms_hash text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  ip text,
  FOREIGN KEY (campaign_id, version) REFERENCES creator_campaign_terms(campaign_id, version) ON DELETE CASCADE,
  UNIQUE (campaign_id, version, creator_id)
);

CREATE TABLE IF NOT EXISTS creator_campaign_deliverables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES creator_campaigns(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES creator_videos(id) ON DELETE CASCADE,
  accepted_version integer NOT NULL,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected')),
  review_note text,
  reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, video_id)
);

-- 89) Registro de derechos por pieza. El titular es siempre el autor; lo que se registra es la licencia concedida.
CREATE TABLE IF NOT EXISTS content_rights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES creator_videos(id) ON DELETE CASCADE,
  holder_creator_id uuid NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES creator_campaigns(id) ON DELETE SET NULL,
  license_type text NOT NULL CHECK (license_type IN ('platform', 'campaign')),
  media text[] NOT NULL DEFAULT '{}',
  territory text NOT NULL DEFAULT 'DO',
  exclusive boolean NOT NULL DEFAULT false,
  approved_uses text[] NOT NULL DEFAULT '{}',
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  revoked_at timestamptz,
  revoked_by uuid REFERENCES users(id) ON DELETE SET NULL,
  revoked_reason text,
  expiry_notified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_content_rights_video ON content_rights (video_id, status);
CREATE INDEX IF NOT EXISTS idx_content_rights_expiring ON content_rights (expires_at) WHERE status = 'active' AND expires_at IS NOT NULL;

-- 90 y 91) Libro de ingresos por concepto. Cada movimiento dice de dónde sale, en qué estado está y,
-- si se revirtió, por qué. Un reverso es un movimiento negativo aparte que apunta al original.
CREATE TABLE IF NOT EXISTS creator_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  source text NOT NULL CHECK (source IN ('affiliate_commission', 'content_payment', 'creator_fund', 'bonus', 'tip', 'reversal', 'adjustment')),
  amount numeric(12,2) NOT NULL CHECK (amount <> 0),
  currency text NOT NULL DEFAULT 'DOP',
  status text NOT NULL CHECK (status IN ('estimated', 'confirmed', 'reversed')),
  origin text NOT NULL,            -- de dónde sale: "video:<id> pedido web", "campaña <título>"…
  campaign_id uuid REFERENCES creator_campaigns(id) ON DELETE SET NULL,
  video_id uuid REFERENCES creator_videos(id) ON DELETE SET NULL,
  attribution_window_days integer, -- días tras los que una estimación pasa a confirmada
  reverses_entry_id uuid REFERENCES creator_ledger(id) ON DELETE SET NULL,
  reason text,                     -- obligatorio en reversos y ajustes
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz,
  CONSTRAINT chk_ledger_reason CHECK (source NOT IN ('reversal', 'adjustment') OR reason IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_creator_ledger_creator ON creator_ledger (creator_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_creator_ledger_estimated ON creator_ledger (created_at) WHERE status = 'estimated';

-- 92) Disputas de campaña o de liquidación, con acceso restringido al caso.
CREATE TABLE IF NOT EXISTS creator_disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  subject_type text NOT NULL CHECK (subject_type IN ('campaign', 'ledger_entry')),
  subject_id uuid NOT NULL,
  reason text NOT NULL,
  evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved_accepted', 'resolved_rejected', 'withdrawn')),
  due_at timestamptz NOT NULL,     -- plazo del personal para responder
  resolved_by uuid REFERENCES users(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  resolution_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_creator_dispute_open ON creator_disputes (creator_id, subject_type, subject_id) WHERE status = 'open';
