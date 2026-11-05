-- Retos más completos y validación presencial por el patrocinador.
--  * Vigencia (starts_on/ends_on, días de RD), cupo de personas, imagen, lugar, dificultad y duración estimada.
--  * requires_validation: el reto no avanza solo; lo completa la empresa patrocinadora (sponsor_id, una organización del
--    panel de Operadores) al escanear el QR que el viajero muestra en la app.
ALTER TABLE gamification_missions
  ADD COLUMN IF NOT EXISTS starts_on date,
  ADD COLUMN IF NOT EXISTS ends_on date,
  ADD COLUMN IF NOT EXISTS max_completions integer CHECK (max_completions IS NULL OR max_completions > 0),
  ADD COLUMN IF NOT EXISTS completions_count integer NOT NULL DEFAULT 0 CHECK (completions_count >= 0),
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS place_name text,
  ADD COLUMN IF NOT EXISTS province text,
  ADD COLUMN IF NOT EXISTS difficulty text CHECK (difficulty IS NULL OR difficulty IN ('facil', 'media', 'exigente')),
  ADD COLUMN IF NOT EXISTS estimated_minutes integer CHECK (estimated_minutes IS NULL OR estimated_minutes > 0),
  ADD COLUMN IF NOT EXISTS requires_validation boolean NOT NULL DEFAULT false;

DO $$ BEGIN
  ALTER TABLE gamification_missions ADD CONSTRAINT chk_mission_dates CHECK (starts_on IS NULL OR ends_on IS NULL OR ends_on >= starts_on);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE gamification_missions ADD CONSTRAINT chk_mission_validation_sponsor CHECK (NOT requires_validation OR sponsor_id IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Acción interna de los retos que valida el patrocinador (no se reclama desde el cliente; sus puntos son los del reto).
INSERT INTO gamification_rules (action, description, xp, coins, daily_cap, cooldown_seconds, unique_per_ref, client_allowed)
VALUES ('sponsor_validated', 'Validado por el patrocinador', 0, 0, NULL, 0, true, false)
ON CONFLICT (action) DO NOTHING;

-- Código que el viajero muestra (como QR) para que la empresa valide su reto. Uno vigente por persona, reto y período.
CREATE TABLE IF NOT EXISTS mission_validation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid NOT NULL REFERENCES gamification_missions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_key text NOT NULL,
  code text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  validated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  org_id uuid REFERENCES partner_profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, mission_id, period_key)
);
CREATE INDEX IF NOT EXISTS idx_mission_validation_org ON mission_validation_codes (org_id, used_at DESC) WHERE used_at IS NOT NULL;
