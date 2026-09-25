-- Datos vivos y búsqueda (docs §5.4 y §5.5).

-- Clima actual y pronóstico por ciudad (lo llenan el trabajo `weather.refresh` o el equipo editorial).
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
  forecast jsonb NOT NULL DEFAULT '[]',        -- [{date, min_c, max_c, condition, rain_probability}]
  source text NOT NULL DEFAULT 'manual',
  observed_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webcams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text,
  stream_url text NOT NULL,
  thumbnail_url text,
  province text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Historial y consultas por fecha.
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currency_date ON exchange_rates (currency_code, rate_date DESC);
CREATE INDEX IF NOT EXISTS idx_lottery_results_date ON lottery_results (draw_date DESC);
CREATE INDEX IF NOT EXISTS idx_marine_reports_created ON marine_reports (location, created_at DESC);
-- Búsquedas frecuentes (se registran como eventos `search` sin datos personales).
CREATE INDEX IF NOT EXISTS idx_analytics_events_search ON analytics_events (created_at DESC) WHERE event_type = 'search';
