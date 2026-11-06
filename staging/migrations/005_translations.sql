-- Traducciones del contenido del CMS. El español vive en la propia fila (news, provinces, news_categories);
-- aquí, un JSON por registro e idioma con los campos traducidos. Lo que falte se muestra en español.
CREATE TABLE IF NOT EXISTS content_translations (
  entity     TEXT NOT NULL CHECK (entity IN ('news','provinces','news_categories')),
  entity_id  TEXT NOT NULL,
  lang       TEXT NOT NULL CHECK (lang IN ('en','fr','de','it','pt')),
  data       TEXT NOT NULL,             -- JSON: { title, excerpt, body, … }
  updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (entity, entity_id, lang)
);
