-- Punto 76 del plan: permitir reclamar una reserva de invitado y vincularla a una cuenta tras verificar el
-- email de contacto con un token limitado, de un solo uso y con expiración (docs §5.8).
-- Del token sólo se guarda su hash SHA-256: el enlace viaja por correo, vence en 1 hora y sirve una única vez.
CREATE TABLE IF NOT EXISTS booking_claim_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  email text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  requested_ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  claimed_by uuid REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_booking_claim_tokens_booking ON booking_claim_tokens (booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_claim_tokens_email ON booking_claim_tokens (lower(email));
CREATE INDEX IF NOT EXISTS idx_booking_claim_tokens_pending ON booking_claim_tokens (expires_at) WHERE used_at IS NULL;

-- La reserva recuerda cuándo se vinculó a una cuenta (el token ya quemado no es la única prueba).
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS claimed_at timestamptz;

DO $$ BEGIN
  ALTER TABLE booking_claim_tokens ADD CONSTRAINT chk_booking_claim_tokens_expires CHECK (expires_at > created_at);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
