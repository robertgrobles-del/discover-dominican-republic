-- RD Social, contenido de usuarios (UGC), encuestas, concursos y registros de vacaciones (docs §5.6).

-- ---------- RD Social ----------
ALTER TABLE social_posts
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS entity_ref jsonb,
  ADD COLUMN IF NOT EXISTS report_count integer NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_social_posts_feed ON social_posts (created_at DESC, id DESC) WHERE is_active AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_social_posts_user ON social_posts (user_id, created_at DESC);
ALTER TABLE social_comments ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
DO $$ BEGIN ALTER TABLE social_comments ADD CONSTRAINT chk_social_comments_len CHECK (char_length(content) BETWEEN 1 AND 500); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_social_comments_post ON social_comments (post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_social_comments_user ON social_comments (user_id, created_at DESC);

-- ---------- Reportes y medios de usuarios ----------
ALTER TABLE ugc_reports ADD COLUMN IF NOT EXISTS detail text;
DELETE FROM ugc_reports a USING ugc_reports b WHERE a.user_id = b.user_id AND a.target_type = b.target_type AND a.target_id = b.target_id AND (a.created_at, a.id) < (b.created_at, b.id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_ugc_reports_once ON ugc_reports (user_id, target_type, target_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ugc_reports_status ON ugc_reports (status, created_at);
CREATE INDEX IF NOT EXISTS idx_ugc_media_entity ON ugc_media (associated_entity_type, associated_entity_id) WHERE status = 'approved';

-- ---------- Encuestas ----------
ALTER TABLE survey_templates
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'general' CHECK (kind IN ('general', 'post_trip', 'nps')),
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
UPDATE survey_templates SET slug = 'encuesta-' || substr(id::text, 1, 8) WHERE slug IS NULL;
ALTER TABLE survey_templates ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_survey_templates_slug ON survey_templates (slug);
-- Una persona con cuenta responde cada encuesta una vez; los invitados se limitan por tasa.
CREATE UNIQUE INDEX IF NOT EXISTS uq_survey_responses_user ON survey_responses (template_id, user_id) WHERE user_id IS NOT NULL;

-- ---------- Concursos y sorteos ----------
CREATE TABLE IF NOT EXISTS contests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  rules text,
  prize text,
  image_url text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL CHECK (ends_at > starts_at),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  max_entries integer CHECK (max_entries IS NULL OR max_entries > 0),
  min_age integer,
  winners uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE contest_registrations
  ADD COLUMN IF NOT EXISTS contest_id uuid REFERENCES contests(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES users(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_contest_reg_user ON contest_registrations (contest_id, user_id) WHERE contest_id IS NOT NULL AND user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_contest_reg_email ON contest_registrations (contest_id, lower(email)) WHERE contest_id IS NOT NULL;

-- ---------- Vacaciones ("Vuelve a casa"): también para visitantes sin cuenta ----------
ALTER TABLE vacation_registrations ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE vacation_registrations
  ADD COLUMN IF NOT EXISTS contact_name text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS travelers integer NOT NULL DEFAULT 1 CHECK (travelers BETWEEN 1 AND 50);
