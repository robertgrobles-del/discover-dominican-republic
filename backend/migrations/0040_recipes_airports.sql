-- Colecciones nuevas del CMS para contenido que vivía sólo en el frontend: recetas criollas y aeropuertos (docs, Apéndice D).

CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text,
  region text,
  difficulty text,
  prep_time text,
  cook_time text,
  total_time text,
  servings text,
  calories text,
  short_description text,
  description text,
  history text,
  quote text,
  maridaje text,
  badges jsonb NOT NULL DEFAULT '[]',
  ingredients jsonb NOT NULL DEFAULT '[]',        -- lista, o grupos { "Sofrito": [...] }
  steps jsonb NOT NULL DEFAULT '[]',
  image_url text,
  video_image_url text,
  gallery jsonb,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','in_review','published','archived')),
  published_at timestamptz,
  unpublished_at timestamptz,
  slug_history text[] NOT NULL DEFAULT '{}',
  seo_title text,
  seo_description text,
  og_image_url text,
  canonical_url text,
  noindex boolean NOT NULL DEFAULT false,
  locale_default text NOT NULL DEFAULT 'es',
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1,
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_recipes_status ON recipes (status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes (category);

CREATE TABLE IF NOT EXISTS airports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  code text,                                        -- IATA (PUJ, SDQ…)
  icao text,
  city text,
  province_id uuid REFERENCES provinces(id) ON DELETE SET NULL,
  airport_type text,
  short_description text,
  description text,
  image_url text,
  gallery jsonb,
  latitude numeric(9,6),
  longitude numeric(9,6),
  terminals jsonb NOT NULL DEFAULT '[]',
  airlines jsonb NOT NULL DEFAULT '[]',
  destinations jsonb NOT NULL DEFAULT '[]',
  services jsonb NOT NULL DEFAULT '[]',
  transportation jsonb NOT NULL DEFAULT '[]',
  nearby_destinations jsonb NOT NULL DEFAULT '[]',
  phone text,
  website text,
  rating numeric(3,2),
  review_count integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','in_review','published','archived')),
  published_at timestamptz,
  unpublished_at timestamptz,
  slug_history text[] NOT NULL DEFAULT '{}',
  seo_title text,
  seo_description text,
  og_image_url text,
  canonical_url text,
  noindex boolean NOT NULL DEFAULT false,
  locale_default text NOT NULL DEFAULT 'es',
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1,
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_airports_status ON airports (status) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_airports_code ON airports (upper(code)) WHERE code IS NOT NULL;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['recipes', 'airports'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_set_updated_at ON %I', t);
    EXECUTE format('CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t);
  END LOOP;
END $$;
