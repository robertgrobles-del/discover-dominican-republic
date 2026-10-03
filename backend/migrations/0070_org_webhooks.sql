-- Plan de 150 mejoras, punto 139: webhooks salientes hacia sistemas del operador, firmados con HMAC-SHA256 (`X-Signature`).

CREATE TABLE IF NOT EXISTS org_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES partner_profiles(id) ON DELETE CASCADE,
  url text NOT NULL,
  secret text NOT NULL,                 -- sólo se muestra al crearlo; firma cada entrega
  events text[] NOT NULL,
  active boolean NOT NULL DEFAULT true,
  consecutive_failures integer NOT NULL DEFAULT 0,
  disabled_reason text,
  cursor_at timestamptz NOT NULL DEFAULT now(),  -- hasta dónde se han recogido los eventos de reservas
  last_delivery_at timestamptz,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_org_webhooks_org ON org_webhooks (org_id);

CREATE TABLE IF NOT EXISTS org_webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id uuid NOT NULL REFERENCES org_webhooks(id) ON DELETE CASCADE,
  event text NOT NULL,
  subject_id text NOT NULL,             -- la reserva (o 'test'): junto con el evento evita entregar dos veces lo mismo
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed')),
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  response_status integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_org_webhook_deliveries_subject ON org_webhook_deliveries (webhook_id, event, subject_id) WHERE subject_id <> 'test';
CREATE INDEX IF NOT EXISTS idx_org_webhook_deliveries_due ON org_webhook_deliveries (next_attempt_at) WHERE status = 'pending';
