-- Plan de accesos por perfil, puntos 17, 53 y 97: doble aprobación de operaciones críticas.
-- Quien solicita y quien aprueba deben ser personas distintas; la restricción lo garantiza aunque
-- alguien escriba directamente en la tabla.
CREATE TABLE IF NOT EXISTS approval_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('grant_admin', 'reset_2fa', 'payout_mark_paid')),
  target_id uuid NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'expired', 'failed')),
  requested_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  decided_by uuid REFERENCES users(id) ON DELETE SET NULL,
  decided_at timestamptz,
  decision_note text,
  expires_at timestamptz NOT NULL DEFAULT now() + interval '24 hours',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_approval_distinct_people CHECK (decided_by IS NULL OR decided_by <> requested_by OR status = 'cancelled')
);
-- Una sola solicitud abierta por operación y destino.
CREATE UNIQUE INDEX IF NOT EXISTS uq_approval_open ON approval_requests (kind, target_id) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_approval_status ON approval_requests (status, created_at DESC);
