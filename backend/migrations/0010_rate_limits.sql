-- Almacén de límites de tasa compartido entre instancias (alternativa a Redis; docs §3.5).
-- UNLOGGED: no se escribe al WAL (se pierde tras un fallo del servidor, lo cual es aceptable para contadores de ventana corta).
CREATE UNLOGGED TABLE IF NOT EXISTS rate_limits (
  key text PRIMARY KEY,
  count integer NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON rate_limits (expires_at);
