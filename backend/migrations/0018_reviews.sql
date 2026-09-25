-- Reseñas del portal (docs §5.6): una por persona y entidad, con moderación, votos útiles, reportes y respuesta oficial.

ALTER TABLE reviews ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS visit_date date,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS helpful_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS report_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS moderation_note text,
  ADD COLUMN IF NOT EXISTS reply text,
  ADD COLUMN IF NOT EXISTS replied_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
UPDATE reviews SET status = CASE WHEN is_approved THEN 'approved' ELSE 'pending' END;

-- Si hubiera reseñas duplicadas anteriores se conserva la más reciente de cada persona y entidad.
DELETE FROM reviews a USING reviews b WHERE a.user_id = b.user_id AND a.entity_type = b.entity_type AND a.entity_id = b.entity_id AND (a.created_at, a.id) < (b.created_at, b.id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_reviews_user_entity ON reviews (user_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_reviews_entity ON reviews (entity_type, entity_id) WHERE is_approved;
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews (status, created_at);

CREATE TABLE IF NOT EXISTS review_votes (
  review_id uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (review_id, user_id)
);

CREATE TABLE IF NOT EXISTS review_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason text NOT NULL CHECK (reason IN ('spam', 'offensive', 'fake', 'irrelevant', 'other')),
  detail text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (review_id, user_id)
);
