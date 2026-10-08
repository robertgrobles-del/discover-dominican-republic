-- ==============================================================================
-- Migración 0086: Limpieza de tablas no utilizadas y alineación de publication_type
-- 1. Retira tablas huérfanas vacías post_comments, post_likes y blog_posts (reemplazadas
--    por la colección articles unificada y el módulo de reseñas).
-- 2. Alínea el campo publication_type de articles según su categoría real.
-- ==============================================================================

-- 1. Retiro seguro de tablas no utilizadas
DROP TABLE IF EXISTS post_comments CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;

-- 2. Diferenciación de publication_type según categoría editorial
UPDATE articles
SET publication_type = CASE
  WHEN lower(category) = 'noticias' THEN 'noticia'
  WHEN lower(category) = 'prensa' THEN 'prensa'
  WHEN lower(category) = 'invitados' THEN 'invitado'
  WHEN lower(category) = 'experiencias' THEN 'experiencia'
  WHEN lower(category) LIKE 'historia%' THEN 'historia'
  ELSE COALESCE(publication_type, 'magazine')
END
WHERE publication_type IS NULL OR publication_type = 'magazine';
