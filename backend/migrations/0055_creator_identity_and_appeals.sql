-- ==============================================================================
-- Migración 0055: Punto 41 — Centro de identidad y reputación del creador
--                  Punto 44 — Moderación y apelación de contenido de creador
--
-- 41) El creador declara su identidad pública (categorías, idiomas, visibilidad), la
--     plataforma le otorga sellos con criterios publicados (creator_seals) y calcula su
--     reputación (creator_profiles.reputation_score). La audiencia verificada y sus métricas
--     agregadas son parte del perfil público.
-- 44) Las publicaciones de creador entran en la cola de moderación (moderation_rule,
--     moderated_at, moderated_by) y el creador puede apelar por una vía formal
--     (creator_video_appeals): una sola apelación abierta por publicación.
--
-- Todo es aditivo e idempotente (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).
-- ==============================================================================

-- ── 41. Identidad y reputación del creador ─────────────────────────────────────
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS categories text[] NOT NULL DEFAULT '{}';
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS languages text[] NOT NULL DEFAULT '{}';
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS audience_verified boolean NOT NULL DEFAULT false;
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS audience_verified_at timestamptz;
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS audience_metrics jsonb NOT NULL DEFAULT '{}';
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS public_profile boolean NOT NULL DEFAULT true;
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS reputation_score numeric(5,2) NOT NULL DEFAULT 0;

DO $$ BEGIN ALTER TABLE creator_profiles ADD CONSTRAINT chk_creator_reputation_range CHECK (reputation_score BETWEEN 0 AND 100); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Sellos otorgados por la plataforma. `seal_key` referencia el catálogo publicado en
-- `src/modules/creators/reputation.ts`; la evidencia es el respaldo interno de cada sello.
CREATE TABLE IF NOT EXISTS creator_seals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  seal_key text NOT NULL,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  evidence jsonb NOT NULL DEFAULT '{}',
  UNIQUE (creator_id, seal_key)
);
CREATE INDEX IF NOT EXISTS idx_creator_seals_creator ON creator_seals (creator_id, awarded_at DESC);
CREATE INDEX IF NOT EXISTS idx_creator_seals_key ON creator_seals (seal_key, awarded_at DESC);

-- ── 44. Moderación del contenido de creador ────────────────────────────────────
-- Comprobación defensiva: en instalaciones que ya las tuvieran (por ejemplo un fork que las
-- adelantó) no se duplican; `ADD COLUMN IF NOT EXISTS` ya lo garantiza, se dejan ambas por claridad.
ALTER TABLE creator_videos ADD COLUMN IF NOT EXISTS moderation_rule text;
ALTER TABLE creator_videos ADD COLUMN IF NOT EXISTS moderated_at timestamptz;
ALTER TABLE creator_videos ADD COLUMN IF NOT EXISTS moderated_by uuid REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_creator_videos_moderation ON creator_videos (status, moderated_at DESC);

-- Apelaciones del creador sobre una publicación moderada.
CREATE TABLE IF NOT EXISTS creator_video_appeals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES creator_videos(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  rule_code text,
  resolution_note text,
  resolved_by uuid REFERENCES users(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Una sola apelación abierta por publicación: la segunda se rechaza como regla de negocio.
CREATE UNIQUE INDEX IF NOT EXISTS uq_creator_appeal_open ON creator_video_appeals (video_id) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_creator_appeals_creator ON creator_video_appeals (creator_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_creator_appeals_status ON creator_video_appeals (status, created_at);
