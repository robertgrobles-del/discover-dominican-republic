-- Migración completa del contenido del frontend a la base (docs/FUENTE_DE_VERDAD.md).
--
-- 1. `extras`: los campos de una ficha que no tienen columna propia (consejos, categorías, especificaciones,
--    bloques de texto…). Con ellos una fila guarda la ficha completa y el frontend ya no depende de su archivo
--    local para pintarla. Se editan desde el CMS como cualquier otra columna.
-- 2. `content_datasets`: el contenido que no es una colección de fichas (transporte, itinerarios, náutica,
--    loterías, tasas de referencia…). Un documento JSON por archivo de datos, editable desde el CMS.

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'destinations', 'beaches', 'mountains', 'rivers', 'protected_areas', 'hotels', 'restaurants', 'bars',
    'shopping_centers', 'clinics', 'experiences', 'theme_parks', 'stadiums', 'golf_courses', 'ports_marinas',
    'events', 'recipes', 'airports', 'articles', 'offset_projects', 'routes'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS extras jsonb NOT NULL DEFAULT ''{}''::jsonb', t);
  END LOOP;
END $$;

CREATE TABLE IF NOT EXISTS content_datasets (
  key text PRIMARY KEY CHECK (key ~ '^[a-z][a-z0-9-]{1,63}$'),
  value jsonb NOT NULL,
  description text,
  -- 0 mientras el documento es el que cargó `db:import-static`; cada edición desde el CMS lo incrementa.
  -- El frontend sólo descarga los documentos editados: los demás coinciden con lo que ya trae.
  revision integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL
);
