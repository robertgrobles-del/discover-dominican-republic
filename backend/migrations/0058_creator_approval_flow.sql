-- ==============================================================================
-- Migración 0058: Punto 14 — Flujo de aprobación del perfil de creador
--
-- 14) `creator_profile` pasa a tener ciclo de vida explícito con cinco estados
--     —borrador (`draft`), pendiente (`pending`), aprobado (`approved`), rechazado
--     (`rejected`) y suspendido (`suspended`)— con motivo, actor de la revisión,
--     marcas de tiempo y auditoría (`audit_log`, acción `creator.review`).
--
--     El registro nace en `draft` (`registerCreator`), el dueño lo envía a revisión
--     (`submitForReview` → `pending`) y un moderador o administrador decide
--     (`reviewCreator`). Sólo `approved` publica el perfil público y el estado de la
--     cuenta de usuario (`users.status`) no se toca: son ejes distintos.
--
-- Todo es aditivo e idempotente: primero se migran los valores existentes, después se
-- recrea la restricción y por último se añaden las columnas de auditoría.
-- ==============================================================================

-- ── 1. Migrar los estados existentes antes de recrear la restricción ───────────
-- `active` (único estado de alta hasta hoy) pasa a `approved`; `under_review` a `pending`.
-- La restricción antigua se retira primero para que los valores nuevos sean aceptados.
ALTER TABLE creator_profiles DROP CONSTRAINT IF EXISTS creator_profiles_status_check;
ALTER TABLE creator_profiles DROP CONSTRAINT IF EXISTS chk_creator_profiles_status;

UPDATE creator_profiles SET status = 'approved' WHERE status = 'active';
UPDATE creator_profiles SET status = 'pending' WHERE status = 'under_review';

-- ── 2. Ciclo de vida nuevo: cinco estados y borrador por defecto ────────────────
ALTER TABLE creator_profiles ALTER COLUMN status SET DEFAULT 'draft';

DO $$ BEGIN
  ALTER TABLE creator_profiles ADD CONSTRAINT chk_creator_profiles_status
    CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'suspended'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- `approved_at` sólo tiene sentido cuando la revisión aprueba el perfil: se retira el
-- `DEFAULT now()` heredado de 0045 para que un borrador no nazca con fecha de aprobación.
ALTER TABLE creator_profiles ALTER COLUMN approved_at DROP DEFAULT;

-- ── 3. Motivo, marcas de tiempo y actor de la revisión (auditoría de dominio) ──
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS status_reason text;
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS status_changed_at timestamptz;
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS submitted_at timestamptz;

-- Rellena la marca de tiempo de los perfiles heredados (idempotente: sólo si está vacía).
UPDATE creator_profiles SET status_changed_at = updated_at WHERE status_changed_at IS NULL;

-- ── 4. Cola de revisión (`GET /admin/creators/pending`) ────────────────────────
-- Índice parcial: la cola sólo consulta los perfiles que esperan decisión, ordenados
-- por antigüedad de envío.
CREATE INDEX IF NOT EXISTS idx_creator_profiles_pending
  ON creator_profiles (status, submitted_at) WHERE status = 'pending';
