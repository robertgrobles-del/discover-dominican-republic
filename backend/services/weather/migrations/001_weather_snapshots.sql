-- Esquema propietario del servicio weather. No incluir en el migrador del monolito.
CREATE TABLE IF NOT EXISTS weather_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_slug text NOT NULL UNIQUE,
  location_name text NOT NULL,
  temperature_c numeric(4,1) NOT NULL,
  feels_like_c numeric(4,1),
  humidity integer CHECK (humidity BETWEEN 0 AND 100),
  wind_kmh numeric(5,1),
  condition text NOT NULL,
  icon text,
  forecast jsonb NOT NULL DEFAULT '[]',
  source text NOT NULL DEFAULT 'manual',
  observed_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_weather_snapshots_observed_at
  ON weather_snapshots (observed_at DESC);

-- Nonces de un solo uso para comandos firmados facade → servicio.
CREATE TABLE IF NOT EXISTS weather_internal_nonces (
  jti uuid PRIMARY KEY,
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_weather_internal_nonces_expires_at ON weather_internal_nonces (expires_at);
