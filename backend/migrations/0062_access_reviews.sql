-- Plan de accesos por perfil, punto 99: revisiones periódicas de acceso.
-- Una revisión es una foto de los roles del personal en el momento de abrirla; cada elemento guarda
-- quién decidió, cuándo, qué decidió y por qué.
CREATE TABLE IF NOT EXISTS access_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL DEFAULT 'staff' CHECK (scope IN ('staff')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  opened_by uuid REFERENCES users(id) ON DELETE SET NULL, -- null: la abrió el trabajo programado
  closed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  due_at timestamptz NOT NULL,
  reminded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);
-- Sólo una revisión abierta a la vez.
CREATE UNIQUE INDEX IF NOT EXISTS uq_access_review_open ON access_reviews (scope) WHERE status = 'open';

CREATE TABLE IF NOT EXISTS access_review_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES access_reviews(id) ON DELETE CASCADE,
  subject_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL,
  expires_at timestamptz,
  decision text CHECK (decision IN ('keep', 'revoke')),
  justification text,
  decided_by uuid REFERENCES users(id) ON DELETE SET NULL,
  decided_at timestamptz,
  UNIQUE (review_id, subject_user_id, role),
  -- Nadie revisa sus propios accesos, ni siquiera escribiendo directo en la tabla.
  CONSTRAINT chk_access_review_not_self CHECK (decided_by IS NULL OR decided_by <> subject_user_id),
  CONSTRAINT chk_access_review_justified CHECK (decision IS NULL OR justification IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_access_review_items_pending ON access_review_items (review_id) WHERE decision IS NULL;
