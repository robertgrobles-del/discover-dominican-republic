-- Plan de accesos por perfil, punto 81: solicitudes para unirse a una organización.
-- La persona pide entrar con un rol y un mensaje; el dueño o un administrador de la organización
-- revisa quién es y qué pide antes de aprobar o rechazar. Aprobar crea la membresía.
CREATE TABLE IF NOT EXISTS org_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES partner_profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requested_role text NOT NULL CHECK (requested_role IN ('admin', 'recepcion', 'guia')),
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  granted_role text CHECK (granted_role IN ('admin', 'recepcion', 'guia')),
  decided_by uuid REFERENCES users(id) ON DELETE SET NULL,
  decided_at timestamptz,
  decision_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- Una sola solicitud abierta por persona y organización.
CREATE UNIQUE INDEX IF NOT EXISTS uq_org_join_request_open ON org_join_requests (org_id, user_id) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_org_join_requests_org ON org_join_requests (org_id, status, created_at DESC);
