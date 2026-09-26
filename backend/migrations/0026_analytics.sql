-- Analítica (docs §5.14): eventos anónimos, agregado diario y retención de 13 meses.

ALTER TABLE analytics_events
  ADD COLUMN IF NOT EXISTS country text,       -- sólo país (de la cabecera del proxy); nunca se guarda la IP
  ADD COLUMN IF NOT EXISTS source text;        -- host de origen (referrer) sin ruta ni parámetros
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events (created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created ON analytics_events (event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_page ON analytics_events (page, created_at) WHERE event_type = 'page_view';

CREATE TABLE IF NOT EXISTS analytics_daily (
  day date NOT NULL,
  event_type text NOT NULL,
  page text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT '',
  events integer NOT NULL,
  sessions integer NOT NULL,
  PRIMARY KEY (day, event_type, page, country, source)
);
