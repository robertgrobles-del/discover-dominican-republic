-- Plan de accesos por perfil, puntos 86 y 100: accesos con vencimiento.
--
-- 100) Un rol global puede concederse por tiempo limitado, con motivo y responsable. Las filas sin
--      `expires_at` siguen siendo permanentes, así que nada de lo existente cambia.
-- 86)  Una membresía de organización puede tener fecha de fin (contrato, temporada). El propietario
--      nunca vence: la organización no puede quedar sin responsable.
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS expires_at timestamptz;
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS granted_by uuid REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS grant_reason text;
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS expiry_notified_at timestamptz;
CREATE INDEX IF NOT EXISTS idx_user_roles_expiring ON user_roles (expires_at) WHERE expires_at IS NOT NULL;

ALTER TABLE org_members ADD COLUMN IF NOT EXISTS expires_at timestamptz;
CREATE INDEX IF NOT EXISTS idx_org_members_expiring ON org_members (expires_at) WHERE expires_at IS NOT NULL;

DO $$ BEGIN
  ALTER TABLE org_members ADD CONSTRAINT chk_org_owner_never_expires CHECK (role <> 'owner' OR expires_at IS NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
