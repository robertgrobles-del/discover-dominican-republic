-- Ejecutor de trabajos programados (docs §9) y liquidaciones a operadores (docs §5.10/§5.18).

ALTER TABLE system_cron_jobs
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS interval_seconds integer NOT NULL DEFAULT 3600 CHECK (interval_seconds >= 30),
  ADD COLUMN IF NOT EXISTS enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_duration_ms integer,
  ADD COLUMN IF NOT EXISTS last_result jsonb;
UPDATE system_cron_jobs SET status = 'idle' WHERE status IS NULL;

-- Marcas de "ya se hizo/avisó" para trabajos que no cuelgan de una fila propia (p. ej. una salida que no llegó al mínimo).
CREATE TABLE IF NOT EXISTS job_marks (
  key text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_mode text CHECK (payment_mode IN ('pay_now', 'deposit', 'pay_later', 'manual'));
CREATE INDEX IF NOT EXISTS idx_bookings_expiry ON bookings (created_at) WHERE status = 'pending' AND payment_status = 'unpaid';

CREATE TABLE IF NOT EXISTS payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES partner_profiles(id) ON DELETE RESTRICT,
  currency text NOT NULL CHECK (currency IN ('USD', 'DOP')),
  gross numeric(12,2) NOT NULL,
  commission numeric(12,2) NOT NULL,
  net numeric(12,2) NOT NULL CHECK (net > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  method text,          -- copia de partner_profiles.payout_method al generarse
  reference text,       -- comprobante de la transferencia
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  paid_by uuid REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_payouts_org ON payouts (org_id, created_at DESC);

-- Cada reserva se liquida una sola vez (unique), aunque el trabajo corra dos veces o en dos instancias.
CREATE TABLE IF NOT EXISTS payout_items (
  payout_id uuid NOT NULL REFERENCES payouts(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE RESTRICT,
  gross numeric(12,2) NOT NULL,
  commission numeric(12,2) NOT NULL,
  net numeric(12,2) NOT NULL,
  PRIMARY KEY (payout_id, booking_id)
);
