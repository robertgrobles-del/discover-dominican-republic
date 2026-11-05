-- Título y descripción para buscadores (opcionales: si faltan se usan el título y el antetítulo).
ALTER TABLE news ADD COLUMN seo_title       TEXT;
ALTER TABLE news ADD COLUMN seo_description TEXT;
