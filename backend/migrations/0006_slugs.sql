-- Slugs legibles y únicos para el contenido público (docs §3.1: los endpoints aceptan {idOrSlug}).

CREATE OR REPLACE FUNCTION slugify(input text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT trim(both '-' from regexp_replace(lower(translate(input,
    'áàäâãéèëêíìïîóòöôõúùüûñçÁÀÄÂÃÉÈËÊÍÌÏÎÓÒÖÔÕÚÙÜÛÑÇ',
    'aaaaaeeeeiiiiooooouuuuncaaaaaeeeeiiiiooooouuuunc')), '[^a-z0-9]+', '-', 'g'));
$$;

-- Rellena los slugs que faltan a partir de `name` o `title`; ante colisiones añade un sufijo corto del id.
DO $$
DECLARE
  r record;
  base_col text;
BEGIN
  FOR r IN
    SELECT c.table_name FROM information_schema.columns c
    JOIN information_schema.tables t ON t.table_schema = c.table_schema AND t.table_name = c.table_name AND t.table_type = 'BASE TABLE'
    WHERE c.table_schema = 'public' AND c.column_name = 'slug' AND c.data_type = 'text'
  LOOP
    SELECT column_name INTO base_col FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = r.table_name AND column_name IN ('name', 'title')
      ORDER BY CASE column_name WHEN 'name' THEN 0 ELSE 1 END LIMIT 1;
    CONTINUE WHEN base_col IS NULL;
    EXECUTE format($f$
      UPDATE %1$I t SET slug = CASE
        WHEN EXISTS (SELECT 1 FROM %1$I o WHERE o.slug = slugify(t.%2$I) AND o.id <> t.id) THEN slugify(t.%2$I) || '-' || left(t.id::text, 6)
        ELSE slugify(t.%2$I) END
      WHERE t.slug IS NULL AND t.%2$I IS NOT NULL AND slugify(t.%2$I) <> ''
    $f$, r.table_name, base_col);
  END LOOP;
END $$;

-- Unicidad de slug entre filas no eliminadas (sólo en tablas de contenido que ya tienen la columna).
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT c.table_name FROM information_schema.columns c
    WHERE c.table_schema = 'public' AND c.column_name = 'slug'
      AND EXISTS (SELECT 1 FROM information_schema.columns d WHERE d.table_schema = 'public' AND d.table_name = c.table_name AND d.column_name = 'deleted_at')
  LOOP
    BEGIN
      EXECUTE format('CREATE UNIQUE INDEX IF NOT EXISTS %I ON %I (slug) WHERE slug IS NOT NULL AND deleted_at IS NULL', 'uq_' || r.table_name || '_slug', r.table_name);
    EXCEPTION WHEN unique_violation THEN
      RAISE NOTICE 'Slugs duplicados en %: se omite el índice único', r.table_name;
    END;
  END LOOP;
END $$;
