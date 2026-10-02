-- Plan de accesos por perfil, punto 17: invitaciones para personal interno.
-- Un administrador invita por correo a un editor o moderador; el rol se concede sólo cuando la persona
-- acepta con la cuenta de ese correo. `admin` no se invita por aquí: exige doble aprobación.
CREATE TABLE IF NOT EXISTS staff_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('editor', 'moderator')),
  token_hash text NOT NULL UNIQUE,
  invited_by uuid REFERENCES users(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  accepted_by uuid REFERENCES users(id) ON DELETE SET NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- Una sola invitación abierta por correo.
CREATE UNIQUE INDEX IF NOT EXISTS uq_staff_invitation_open ON staff_invitations (lower(email)) WHERE accepted_at IS NULL AND revoked_at IS NULL;
