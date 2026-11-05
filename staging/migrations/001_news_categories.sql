-- Categorías de noticias (mantenimiento desde el panel) y campos editoriales de la noticia.

CREATE TABLE IF NOT EXISTS news_categories (
  id         TEXT PRIMARY KEY,
  slug       TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

INSERT OR IGNORE INTO news_categories (id, slug, name, sort_order) VALUES
  ('cat-turismo',        'turismo',                      'Turismo',                       10),
  ('cat-eventos',        'eventos',                      'Eventos',                       20),
  ('cat-cultura',        'cultura',                      'Cultura',                       30),
  ('cat-gastronomia',    'gastronomia',                  'Gastronomía',                   40),
  ('cat-naturaleza',     'naturaleza',                   'Naturaleza',                    50),
  ('cat-infraestructura','infraestructura-y-transporte', 'Infraestructura y transporte',  60),
  ('cat-avisos',         'avisos-al-viajero',            'Avisos al viajero',             70);

ALTER TABLE news ADD COLUMN category_id  TEXT REFERENCES news_categories(id) ON DELETE SET NULL;
ALTER TABLE news ADD COLUMN image_alt    TEXT;
ALTER TABLE news ADD COLUMN image_credit TEXT;
ALTER TABLE news ADD COLUMN author       TEXT;
ALTER TABLE news ADD COLUMN source_url   TEXT;
ALTER TABLE news ADD COLUMN featured     INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS news_category ON news (category_id);
