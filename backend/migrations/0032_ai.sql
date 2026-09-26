-- Asistente de IA (docs §5.4/§5.17): consumo por usuario (cuotas y costos) y caché de traducciones.
CREATE TABLE IF NOT EXISTS ai_usage (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,   -- null = visitante anónimo
  kind text NOT NULL,                                       -- chat | itinerary | recommendations | translate | generate
  model text,
  input_tokens integer NOT NULL DEFAULT 0,
  output_tokens integer NOT NULL DEFAULT 0,
  cost_usd numeric(10,6) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ok', 'error')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_day ON ai_usage (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_day ON ai_usage (created_at DESC);

CREATE TABLE IF NOT EXISTS ai_cache (
  key text PRIMARY KEY,                                     -- sha256 de (tipo, idioma, texto)
  output text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
