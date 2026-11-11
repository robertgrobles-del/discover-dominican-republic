-- Base 1 · Contenido. Territorio: provincia > municipio > destino (zona turística).
-- Cualquier contenido (playa, recinto, evento…) guarda province_id y, si se sabe, municipality_id y destination_id:
-- así sale en la página de la provincia, del municipio y del destino. La API comprueba que encajen entre sí.
CREATE TABLE IF NOT EXISTS municipalities (
  id                TEXT PRIMARY KEY,
  province_id       TEXT NOT NULL REFERENCES provinces(id),
  slug              TEXT NOT NULL,                         -- único dentro de su provincia: /provincia/<p>/<m>
  name              TEXT NOT NULL,
  kind              TEXT NOT NULL DEFAULT 'municipio' CHECK (kind IN ('municipio','distrito_municipal')),
  is_capital        INTEGER NOT NULL DEFAULT 0,             -- cabecera de la provincia
  short_description TEXT,
  description       TEXT,
  highlights        TEXT,                                  -- ["…"]
  image_url         TEXT,
  image_alt         TEXT,
  gallery           TEXT,                                  -- [{ url, alt }]
  latitude          REAL,
  longitude         REAL,
  population        INTEGER,
  seo_title         TEXT,
  seo_description   TEXT,
  status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  created_by        TEXT,
  created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (province_id, slug)
);
CREATE INDEX IF NOT EXISTS municipalities_province ON municipalities (province_id);

CREATE TABLE IF NOT EXISTS destinations (
  id                TEXT PRIMARY KEY,
  province_id       TEXT NOT NULL REFERENCES provinces(id),
  municipality_id   TEXT REFERENCES municipalities(id),
  slug              TEXT NOT NULL UNIQUE,                  -- /destino/<slug>
  name              TEXT NOT NULL,
  kind              TEXT NOT NULL DEFAULT 'zona_turistica' CHECK (kind IN ('zona_turistica','ciudad','pueblo','sector','isla')),
  is_popular        INTEGER NOT NULL DEFAULT 0,
  short_description TEXT,
  description       TEXT,
  highlights        TEXT,
  image_url         TEXT,
  image_alt         TEXT,
  gallery           TEXT,
  latitude          REAL,
  longitude         REAL,
  seo_title         TEXT,
  seo_description   TEXT,
  status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  created_by        TEXT,
  created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS destinations_province ON destinations (province_id);
CREATE INDEX IF NOT EXISTS destinations_municipality ON destinations (municipality_id);

-- Ubicación normalizada en el contenido que ya existe (el texto libre province/city se mantiene para lo escrito a mano).
ALTER TABLE venues ADD COLUMN province_id     TEXT;
ALTER TABLE venues ADD COLUMN municipality_id TEXT;
ALTER TABLE venues ADD COLUMN destination_id  TEXT;
ALTER TABLE events ADD COLUMN province_id     TEXT;
ALTER TABLE events ADD COLUMN municipality_id TEXT;
ALTER TABLE events ADD COLUMN destination_id  TEXT;
CREATE INDEX IF NOT EXISTS venues_location ON venues (province_id, municipality_id);
CREATE INDEX IF NOT EXISTS events_location ON events (province_id, municipality_id);
