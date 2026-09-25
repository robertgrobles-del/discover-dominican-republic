-- Eventos de la pasarela (webhooks) y unicidad de pagos por referencia del proveedor.

CREATE TABLE IF NOT EXISTS payment_events (
  id text NOT NULL,                       -- id del evento en el proveedor (evt_…)
  provider text NOT NULL,
  type text NOT NULL,
  payload jsonb NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  outcome text,
  error text,
  PRIMARY KEY (provider, id)
);
CREATE INDEX IF NOT EXISTS idx_payment_events_pending ON payment_events (received_at) WHERE processed_at IS NULL;

-- Un mismo cobro/reembolso de Stripe no puede registrarse dos veces (webhook y respuesta directa compiten).
CREATE UNIQUE INDEX IF NOT EXISTS uq_booking_payments_stripe_ref ON booking_payments (provider, provider_ref) WHERE provider = 'stripe' AND provider_ref IS NOT NULL;
