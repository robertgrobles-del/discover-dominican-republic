-- ==============================================================================
-- Migración 0088: un voto por persona en las reacciones de artículos
-- El contador de articles.reactions_count era anónimo: cualquiera podía sumar o restar
-- sin límite. Cada reacción queda ahora anotada con quién la dio (la cuenta, o una
-- huella de la IP si no hay sesión) y el contador sólo cambia cuando el voto es propio.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS article_reactions (
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  voter text NOT NULL,
  reaction text NOT NULL CHECK (reaction IN ('likes', 'love', 'fire')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (article_id, voter, reaction)
);
