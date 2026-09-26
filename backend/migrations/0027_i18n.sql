-- Traducciones (docs §5.15): cadenas de la interfaz editables sin redeploy y estado de cada traducción de contenido.

CREATE TABLE IF NOT EXISTS ui_strings (
  locale text NOT NULL CHECK (locale IN ('es', 'en', 'fr', 'de', 'pt', 'it')),
  namespace text NOT NULL CHECK (namespace ~ '^[a-z][a-zA-Z0-9_-]{0,39}$'),
  key text NOT NULL CHECK (char_length(key) BETWEEN 1 AND 200),
  value text NOT NULL CHECK (char_length(value) <= 2000),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (locale, namespace, key)
);
CREATE INDEX IF NOT EXISTS idx_ui_strings_locale_ns ON ui_strings (locale, namespace);

-- machine: traducción automática sin revisar · human: escrita por una persona · reviewed: automática revisada
ALTER TABLE entity_translations
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'human' CHECK (status IN ('machine', 'human', 'reviewed')),
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_entity_translations_entity ON entity_translations (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_translations_status ON entity_translations (status, language);
