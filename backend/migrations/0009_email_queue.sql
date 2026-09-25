-- Cola de correo durable en PostgreSQL (outbox): sobrevive a reinicios, funciona con varias instancias
-- (FOR UPDATE SKIP LOCKED) y reintenta con espera creciente. docs §5.13.

ALTER TABLE email_log
  ADD COLUMN IF NOT EXISTS payload jsonb,
  ADD COLUMN IF NOT EXISTS attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_attempt_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS locked_at timestamptz;

ALTER TABLE email_log DROP CONSTRAINT IF EXISTS email_log_status_check;
ALTER TABLE email_log ADD CONSTRAINT email_log_status_check
  CHECK (status IN ('queued', 'sending', 'sent', 'delivered', 'bounced', 'complained', 'failed'));

CREATE INDEX IF NOT EXISTS idx_email_log_due ON email_log (next_attempt_at) WHERE status = 'queued';
CREATE INDEX IF NOT EXISTS idx_email_log_stuck ON email_log (locked_at) WHERE status = 'sending';
