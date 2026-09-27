-- Sesiones de soporte de sólo lectura (docs §5.17): quién miró la cuenta de quién, por qué y cuánto.
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS impersonated_by uuid REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS support_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  sid uuid NOT NULL,
  ip text,
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  ended_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_support_sessions_target ON support_sessions (target_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_sessions_admin ON support_sessions (admin_id, started_at DESC);
