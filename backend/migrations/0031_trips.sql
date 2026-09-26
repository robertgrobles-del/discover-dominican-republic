-- Mi viaje e itinerarios (docs §5.7): viajes, actividades por día, planificación en grupo, diario, lista de empaque, e-tickets y reto Top 100.

CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  start_date date,
  end_date date,
  party_size integer NOT NULL DEFAULT 1 CHECK (party_size BETWEEN 1 AND 100),
  budget numeric(12,2) CHECK (budget IS NULL OR budget >= 0),
  currency text NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'DOP')),
  notes text,
  packing jsonb NOT NULL DEFAULT '[]',
  share_hash text UNIQUE,                     -- hash del enlace público de sólo lectura (el enlace se muestra una vez)
  shared_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);
CREATE INDEX IF NOT EXISTS idx_trips_owner ON trips (owner_id, created_at DESC);

CREATE TABLE IF NOT EXISTS trip_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day integer NOT NULL CHECK (day BETWEEN 1 AND 60),
  position integer NOT NULL DEFAULT 0,
  time text CHECK (time IS NULL OR time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  entity_type text,
  entity_id uuid,
  title text NOT NULL,
  notes text,
  cost numeric(12,2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
  image_url text,                             -- instantáneas del lugar al agregarlo
  lat double precision,
  lng double precision,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_trip_items_trip ON trip_items (trip_id, day, position);

CREATE TABLE IF NOT EXISTS trip_members (
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('viewer', 'editor')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (trip_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_trip_members_user ON trip_members (user_id);

-- Invitaciones por enlace (no se invita por correo: así no se revela quién tiene cuenta).
CREATE TABLE IF NOT EXISTS trip_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('viewer', 'editor')),
  expires_at timestamptz NOT NULL,
  max_uses integer NOT NULL DEFAULT 5,
  uses integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trip_votes (
  item_id uuid NOT NULL REFERENCES trip_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  value smallint NOT NULL CHECK (value IN (-1, 1)),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (item_id, user_id)
);

CREATE TABLE IF NOT EXISTS trip_diary_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_date date NOT NULL,
  title text NOT NULL,
  body text,
  location text,
  photos text[] NOT NULL DEFAULT '{}',
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_trip_diary_trip ON trip_diary_entries (trip_id, entry_date);

-- Reto Top 100: lugares visitados y deseados (los identificadores vienen del catálogo del Top 100).
CREATE TABLE IF NOT EXISTS traveler_spots (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  spot_id text NOT NULL CHECK (spot_id ~ '^[a-z0-9][a-z0-9_-]{0,79}$'),
  status text NOT NULL CHECK (status IN ('visited', 'wishlist')),
  visited_at timestamptz,
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, spot_id)
);

INSERT INTO gamification_rules (action, description, xp, coins, daily_cap, cooldown_seconds, unique_per_ref, client_allowed) VALUES
  ('trip_checkin', 'Check-in digital de una reserva',  30, 5, NULL, 0, true, false),
  ('top100_10',    'Top 100: 10 lugares visitados',    100, 20, NULL, 0, true, false),
  ('top100_25',    'Top 100: 25 lugares visitados',    250, 50, NULL, 0, true, false),
  ('top100_50',    'Top 100: 50 lugares visitados',    500, 100, NULL, 0, true, false),
  ('top100_100',   'Top 100: los 100 lugares',        1500, 300, NULL, 0, true, false)
ON CONFLICT (action) DO NOTHING;
