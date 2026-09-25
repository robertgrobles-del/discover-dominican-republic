-- Fase B de Operadores RD: equipo e invitaciones, calendarios iCal, reseñas verificadas y auditoría.

CREATE TABLE IF NOT EXISTS org_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES partner_profiles(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'recepcion', 'guia')),
  listing_ids text[] NOT NULL DEFAULT '{}',
  token_hash text NOT NULL UNIQUE,
  invited_by uuid REFERENCES users(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- Una sola invitación abierta por correo y organización.
CREATE UNIQUE INDEX IF NOT EXISTS uq_org_invitation_open ON org_invitations (org_id, lower(email)) WHERE accepted_at IS NULL AND revoked_at IS NULL;

ALTER TABLE operator_rooms ADD COLUMN IF NOT EXISTS ical_token text NOT NULL DEFAULT encode(gen_random_bytes(18), 'hex');
CREATE UNIQUE INDEX IF NOT EXISTS uq_operator_rooms_ical_token ON operator_rooms (ical_token);

CREATE TABLE IF NOT EXISTS room_calendar_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES operator_rooms(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  last_synced_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_room_calendar_links_room ON room_calendar_links (room_id);
DELETE FROM room_blocks WHERE link_id IS NOT NULL;
DO $$ BEGIN ALTER TABLE room_blocks ADD CONSTRAINT fk_room_blocks_link FOREIGN KEY (link_id) REFERENCES room_calendar_links (id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Reseñas verificadas: sólo de una reserva completada, una por reserva.
ALTER TABLE operator_reviews ADD COLUMN IF NOT EXISTS booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL;
ALTER TABLE operator_reviews ADD COLUMN IF NOT EXISTS replied_at timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS uq_operator_reviews_booking ON operator_reviews (booking_id) WHERE booking_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS audit_log (
  id bigserial PRIMARY KEY,
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  org_id uuid,
  meta jsonb NOT NULL DEFAULT '{}',
  ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log (entity_type, entity_id);
