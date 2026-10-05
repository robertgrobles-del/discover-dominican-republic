-- Favoritos: lo que el sitio necesita para volver a pintarlos sin consultar el catálogo.
-- La tabla sólo guardaba tipo e identificador; al leerlos de vuelta se perdían el nombre, la imagen y la clase
-- exacta de ficha (el sitio distingue más clases —clínica, guía, cueva…— que tipos tiene el backend).
ALTER TABLE favorites ADD COLUMN IF NOT EXISTS meta jsonb NOT NULL DEFAULT '{}'::jsonb;
