-- Perfil, preferencias, favoritos, captación (newsletter, contacto, leads, alta de establecimientos) y borrado de cuenta (docs §5.2, §5.6).

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS birth_year integer CHECK (birth_year IS NULL OR birth_year BETWEEN 1900 AND 2100),
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'DOP')),
  ADD COLUMN IF NOT EXISTS analytics_consent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notification_prefs jsonb NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS deletion_requested_at timestamptz;

-- Los favoritos también pueden ser servicios de operadores (ids de texto), no sólo filas con uuid.
ALTER TABLE favorites ALTER COLUMN entity_id TYPE text USING entity_id::text;
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites (user_id, entity_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, created_at DESC);

ALTER TABLE newsletter_subscribers
  ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'es',
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS lists text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS confirm_hash text,
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS unsubscribed_at timestamptz;
-- Los suscriptores anteriores a esta migración se consideran confirmados.
UPDATE newsletter_subscribers SET confirmed_at = created_at WHERE confirmed_at IS NULL AND is_active;

ALTER TABLE support_tickets
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'support',
  ADD COLUMN IF NOT EXISTS contact_name text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket ON support_messages (ticket_id, created_at);

ALTER TABLE marketing_leads
  ADD COLUMN IF NOT EXISTS interest text,
  ADD COLUMN IF NOT EXISTS consent boolean NOT NULL DEFAULT false;

ALTER TABLE establishment_registrations
  ADD COLUMN IF NOT EXISTS access_hash text,
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'es',
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS review_note text;
