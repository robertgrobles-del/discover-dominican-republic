-- ==============================================================================
-- Migración 0089: ajustes de liquidaciones a operadores
-- Un reembolso o contracargo posterior a la liquidación de una reserva no se descontaba.
-- Ahora cada corrida de liquidaciones compara lo cobrado hoy con lo ya liquidado y anota
-- la diferencia como ajuste negativo, que se descuenta del siguiente pago del operador.
-- Mientras el saldo sea negativo no se paga nada y el ajuste queda pendiente (payout_id NULL).
-- ==============================================================================

CREATE TABLE IF NOT EXISTS payout_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES partner_profiles(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  currency text NOT NULL,
  gross numeric(12,2) NOT NULL CHECK (gross < 0),
  commission numeric(12,2) NOT NULL CHECK (commission <= 0),
  net numeric(12,2) NOT NULL CHECK (net <= 0),
  reason text NOT NULL DEFAULT 'refund_after_payout',
  payout_id uuid REFERENCES payouts(id) ON DELETE SET NULL,
  alerted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payout_adjustments_pending_idx ON payout_adjustments (org_id, currency) WHERE payout_id IS NULL;
CREATE INDEX IF NOT EXISTS payout_adjustments_booking_idx ON payout_adjustments (booking_id);
