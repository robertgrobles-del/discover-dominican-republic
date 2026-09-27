-- Administración del correo (docs §5.13): supresiones, plantillas editables con historial y datos de entrega.

ALTER TABLE email_log DROP CONSTRAINT IF EXISTS email_log_status_check;
ALTER TABLE email_log ADD CONSTRAINT email_log_status_check
  CHECK (status IN ('queued', 'sending', 'sent', 'delivered', 'bounced', 'complained', 'failed', 'suppressed'));
ALTER TABLE email_log
  ADD COLUMN IF NOT EXISTS resent_from uuid REFERENCES email_log(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS opened_at timestamptz,
  ADD COLUMN IF NOT EXISTS bounce_type text;
CREATE INDEX IF NOT EXISTS idx_email_log_provider ON email_log (provider_id) WHERE provider_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_email_log_status_created ON email_log (status, created_at DESC);

-- Direcciones a las que no se envía: rebote duro y queja valen para todo; la baja sólo para marketing.
CREATE TABLE IF NOT EXISTS email_suppressions (
  email text PRIMARY KEY CHECK (email = lower(email)),
  reason text NOT NULL CHECK (reason IN ('hard_bounce', 'complaint', 'unsubscribe', 'manual')),
  note text,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Plantillas editadas desde el panel (lo que no esté aquí sale de las plantillas del código).
CREATE TABLE IF NOT EXISTS email_templates (
  key text NOT NULL,
  locale text NOT NULL CHECK (locale IN ('es', 'en', 'fr', 'de', 'pt', 'it')),
  subject text NOT NULL CHECK (char_length(subject) BETWEEN 1 AND 200),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  body_html text NOT NULL CHECK (char_length(body_html) BETWEEN 1 AND 20000),
  body_text text CHECK (body_text IS NULL OR char_length(body_text) <= 20000),
  cta_label text CHECK (cta_label IS NULL OR char_length(cta_label) <= 80),
  cta_var text,
  version integer NOT NULL DEFAULT 1,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (key, locale)
);
CREATE TABLE IF NOT EXISTS email_template_versions (
  id bigserial PRIMARY KEY,
  key text NOT NULL,
  locale text NOT NULL,
  version integer NOT NULL,
  subject text NOT NULL,
  title text NOT NULL,
  body_html text NOT NULL,
  body_text text,
  cta_label text,
  cta_var text,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (key, locale, version)
);
