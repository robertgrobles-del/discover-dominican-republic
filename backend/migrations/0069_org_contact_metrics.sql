-- Plan de 150 mejoras, puntos 23 y 102: clics de contacto por operador (WhatsApp, llamada, ruta, sitio web)
-- y reporte semanal por correo. Sólo se guardan contadores diarios: ni sesión, ni usuario, ni IP.

CREATE TABLE IF NOT EXISTS org_contact_daily (
  org_id uuid NOT NULL REFERENCES partner_profiles(id) ON DELETE CASCADE,
  listing_id text NOT NULL DEFAULT '',  -- '' = clic en el sitio del operador, sin servicio concreto
  channel text NOT NULL CHECK (channel IN ('whatsapp', 'call', 'directions', 'website')),
  day date NOT NULL,
  clicks integer NOT NULL DEFAULT 0 CHECK (clicks >= 0),
  PRIMARY KEY (org_id, listing_id, channel, day)
);
CREATE INDEX IF NOT EXISTS idx_org_contact_daily_day ON org_contact_daily (org_id, day);

ALTER TABLE partner_profiles ADD COLUMN IF NOT EXISTS weekly_report_enabled boolean NOT NULL DEFAULT true;
