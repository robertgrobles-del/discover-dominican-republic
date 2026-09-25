-- Administración del portal (docs §4.1 y §5.17): revisiones de contenido y ajustes públicos/privados.

CREATE TABLE IF NOT EXISTS content_revisions (
  id bigserial PRIMARY KEY,
  entity_type text NOT NULL,          -- nombre de la tabla
  entity_id uuid NOT NULL,
  version integer NOT NULL,
  action text NOT NULL,               -- create | update | submit_review | publish | unpublish | archive | restore | delete | import
  snapshot jsonb NOT NULL,
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id, version)
);
CREATE INDEX IF NOT EXISTS idx_content_revisions_entity ON content_revisions (entity_type, entity_id, version DESC);

ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE seo_redirections ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES users(id) ON DELETE SET NULL;
