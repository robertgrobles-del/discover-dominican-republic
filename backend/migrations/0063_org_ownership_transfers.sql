-- Plan de accesos por perfil, punto 82: transferencia de propiedad de una organización.
-- El propietario propone, el nuevo propietario acepta y el cambio de roles ocurre en una sola
-- transacción: la organización nunca queda sin responsable ni con dos.
CREATE TABLE IF NOT EXISTS org_ownership_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES partner_profiles(id) ON DELETE CASCADE,
  from_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'expired')),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '7 days',
  created_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz,
  CONSTRAINT chk_ownership_transfer_distinct CHECK (from_user_id <> to_user_id)
);
-- Una sola transferencia abierta por organización.
CREATE UNIQUE INDEX IF NOT EXISTS uq_ownership_transfer_open ON org_ownership_transfers (org_id) WHERE status = 'pending';
