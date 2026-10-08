-- ==============================================================================
-- Migración 0081: Publicaciones Unificadas (Magazine, Noticias, Notas de Prensa, Blogs)
-- Consolida en la tabla `articles` los tipos editoriales:
-- 'magazine' | 'noticia' | 'reportaje' | 'prensa' | 'experiencia' | 'invitado'
-- ==============================================================================

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS publication_type text DEFAULT 'magazine',
  ADD COLUMN IF NOT EXISTS read_time_min integer DEFAULT 5,
  ADD COLUMN IF NOT EXISTS author_name text,
  ADD COLUMN IF NOT EXISTS author_role text,
  ADD COLUMN IF NOT EXISTS author_avatar text,
  ADD COLUMN IF NOT EXISTS is_trending boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reactions_count jsonb NOT NULL DEFAULT '{"likes": 0, "love": 0, "fire": 0}',
  ADD COLUMN IF NOT EXISTS press_partner_name text,
  ADD COLUMN IF NOT EXISTS press_contact_email text,
  ADD COLUMN IF NOT EXISTS press_source_url text;

CREATE INDEX IF NOT EXISTS idx_articles_publication_type ON articles (publication_type, is_published);
CREATE INDEX IF NOT EXISTS idx_articles_trending ON articles (is_trending) WHERE is_published = true;
