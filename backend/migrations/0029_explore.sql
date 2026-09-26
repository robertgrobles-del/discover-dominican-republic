-- Pasaporte, rutas gamificadas, coleccionables, retos de foto, gremios y provincias (docs §5.11). La ubicación se verifica en el servidor.

-- Códigos QR de lugares: sólo se guarda el hash (el código en claro se muestra una vez al generarlo, para imprimirlo).
CREATE TABLE IF NOT EXISTS place_qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  code_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id)
);
ALTER TABLE route_checkpoints ADD COLUMN IF NOT EXISTS radius_m integer NOT NULL DEFAULT 150 CHECK (radius_m BETWEEN 20 AND 5000);
ALTER TABLE route_checkpoints ADD COLUMN IF NOT EXISTS qr_hash text;
CREATE UNIQUE INDEX IF NOT EXISTS uq_route_checkpoint_order ON route_checkpoints (route_id, checkpoint_order);
ALTER TABLE gamified_routes ADD COLUMN IF NOT EXISTS sequential boolean NOT NULL DEFAULT true;   -- los puntos obligatorios se completan en orden

-- Un sello por persona y lugar.
CREATE UNIQUE INDEX IF NOT EXISTS uq_passport_place ON passport_stamps (user_id, stamp_type, ((verification_data ->> 'entity_id'))) WHERE verification_data ? 'entity_id';
CREATE INDEX IF NOT EXISTS idx_passport_stamps_user ON passport_stamps (user_id, visited_at DESC);

-- Posiciones verificadas recientes: permiten detectar desplazamientos imposibles (GPS falseado).
CREATE TABLE IF NOT EXISTS user_geo_events (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  source text NOT NULL,
  at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_geo_events_user ON user_geo_events (user_id, at DESC);

-- Retos de foto: la foto es un medio propio ya subido; se modera antes de mostrarse.
ALTER TABLE photo_submissions ADD COLUMN IF NOT EXISTS media_id uuid REFERENCES media_assets(id) ON DELETE SET NULL;
ALTER TABLE photo_submissions ADD COLUMN IF NOT EXISTS moderation_note text;
ALTER TABLE photo_challenges ADD COLUMN IF NOT EXISTS closed_at timestamptz;

-- Gremios: XP acumulado y máximo de miembros.
ALTER TABLE explorer_guilds ADD COLUMN IF NOT EXISTS max_members integer NOT NULL DEFAULT 100 CHECK (max_members BETWEEN 2 AND 1000);
CREATE UNIQUE INDEX IF NOT EXISTS uq_guild_one_per_user ON guild_members (user_id);
ALTER TABLE province_visits ADD COLUMN IF NOT EXISTS verification text;

-- Recompensas por explorar (las cifras las fija esta tabla; lo que dependa del punto o del reto viaja como override del servidor).
INSERT INTO gamification_rules (action, description, xp, coins, daily_cap, cooldown_seconds, unique_per_ref, client_allowed) VALUES
  ('passport_stamp',      'Sello del pasaporte verificado',   20, 3, 10, 0, true, false),
  ('province_visit',      'Primera visita a una provincia',   25, 5, NULL, 0, true, false),
  ('route_checkpoint',    'Punto de una ruta completado',     10, 0, 40, 0, true, false),
  ('route_completed',     'Ruta completada',                   0, 0, NULL, 0, true, false),
  ('collectible_claimed', 'Coleccionable reclamado',          0, 0, NULL, 0, true, false),
  ('photo_challenge_win', 'Ganador de un reto de foto',       0, 0, NULL, 0, true, false),
  ('photo_approved',      'Foto de un reto aprobada',         10, 2, 5, 0, true, false)
ON CONFLICT (action) DO NOTHING;
