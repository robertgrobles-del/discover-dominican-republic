-- Plan de accesos por perfil, puntos 85, 95 y 96: capacidades acotadas.
-- Un permiso concreto para una persona, con alcance y motivo, sin concederle un rol global:
--   catalog.manage  mantener ciertas colecciones del catálogo (o sólo ciertos registros, p. ej. un evento)
--   analytics.read  ver métricas agregadas, sin datos personales ni exportaciones
CREATE TABLE IF NOT EXISTS capability_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  capability text NOT NULL CHECK (capability IN ('catalog.manage', 'analytics.read')),
  collections text[] NOT NULL DEFAULT '{}', -- rutas de colección que cubre (vacío en analytics.read)
  record_ids uuid[] NOT NULL DEFAULT '{}',  -- si no está vacío, sólo esos registros
  reason text NOT NULL,
  granted_by uuid REFERENCES users(id) ON DELETE SET NULL,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  -- Delegar registros concretos (un evento, un reto) es siempre temporal.
  CONSTRAINT chk_grant_record_scope_expires CHECK (cardinality(record_ids) = 0 OR expires_at IS NOT NULL),
  CONSTRAINT chk_grant_catalog_has_collections CHECK (capability <> 'catalog.manage' OR cardinality(collections) > 0)
);
CREATE INDEX IF NOT EXISTS idx_capability_grants_user ON capability_grants (user_id, capability) WHERE revoked_at IS NULL;
