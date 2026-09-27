-- Administración del portal (docs §5.17): soporte, banderas de usuario, reglas de IP y banderas de funciones.

-- Soporte: tiempos de respuesta y notas internas (el usuario nunca ve las internas).
ALTER TABLE support_tickets
  ADD COLUMN IF NOT EXISTS first_response_at timestamptz,
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz;
ALTER TABLE support_messages ADD COLUMN IF NOT EXISTS internal boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets (status, priority, created_at);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket ON support_messages (ticket_id, created_at);

-- Banderas antifraude de usuarios (gps_suspect, xp_farming…).
ALTER TABLE user_flags ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE user_flags
  ADD COLUMN IF NOT EXISTS note text,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_user_flags_name ON user_flags (flag_name, created_at DESC);

-- Reglas de IP: `deny` bloquea a una IP o rango en todo el API; `allow` con alcance `admin` restringe /admin a esas direcciones.
-- La tabla del esquema original (ip_address / rule_type) se reemplaza conservando sus filas: blacklist → deny en todo el API; whitelist → allow del panel.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ip_rules' AND column_name = 'ip_address') THEN
    ALTER TABLE ip_rules RENAME TO ip_rules_legacy;
  END IF;
END $$;
CREATE TABLE IF NOT EXISTS ip_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cidr cidr NOT NULL,
  action text NOT NULL CHECK (action IN ('allow', 'deny')),
  scope text NOT NULL DEFAULT 'all' CHECK (scope IN ('all', 'admin')),
  note text,
  expires_at timestamptz,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (action = 'deny' OR scope = 'admin')       -- un `allow` sólo tiene sentido como lista de permitidos del panel
);
CREATE INDEX IF NOT EXISTS idx_ip_rules_active ON ip_rules (action, scope, expires_at);

-- Banderas de funciones: se apagan o encienden sin desplegar.
CREATE TABLE IF NOT EXISTS feature_flags (
  key text PRIMARY KEY CHECK (key ~ '^[a-z][a-z0-9_]{1,59}$'),
  enabled boolean NOT NULL DEFAULT true,
  description text,
  is_public boolean NOT NULL DEFAULT false,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO feature_flags (key, enabled, description, is_public) VALUES
  ('registration_enabled', true, 'Permite crear cuentas nuevas', true),
  ('checkout_enabled', true, 'Permite comprar: reservas con pago, tienda y marketplace', true),
  ('marketplace_orders_enabled', true, 'Permite pedidos nuevos en el marketplace', true),
  ('ai_chat_enabled', true, 'Asistente «Guía RD» (chat)', true),
  ('ai_planner_enabled', true, 'Itinerarios y recomendaciones con IA', true)
ON CONFLICT (key) DO NOTHING;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ip_rules_legacy') THEN
    INSERT INTO ip_rules (cidr, action, scope, note, created_at)
      SELECT ip_address::cidr, CASE WHEN rule_type = 'whitelist' THEN 'allow' ELSE 'deny' END, CASE WHEN rule_type = 'whitelist' THEN 'admin' ELSE 'all' END, notes, created_at
        FROM ip_rules_legacy WHERE ip_address ~ '^[0-9a-fA-F:.]+(/[0-9]+)?$';
    DROP TABLE ip_rules_legacy;
  END IF;
END $$;
