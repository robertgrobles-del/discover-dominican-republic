-- Importaciones masivas con estado (docs §5.17): trabajos que se procesan en segundo plano y se consultan por su identificador.

CREATE TABLE IF NOT EXISTS import_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'done', 'failed')),
  dry_run boolean NOT NULL DEFAULT false,
  file_name text,
  delimiter text,
  payload text,                                     -- el archivo, hasta terminar (luego se borra)
  total integer NOT NULL DEFAULT 0,
  processed integer NOT NULL DEFAULT 0,
  inserted integer NOT NULL DEFAULT 0,
  updated integer NOT NULL DEFAULT 0,
  skipped integer NOT NULL DEFAULT 0,
  errors jsonb NOT NULL DEFAULT '[]',               -- [{ row, reason }] (máximo 200)
  warnings jsonb NOT NULL DEFAULT '[]',             -- [{ row, reason }] (máximo 200): filas guardadas con algún dato descartado
  error text,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_import_jobs_kind ON import_jobs (kind, created_at DESC);

-- Llave natural para repetir la importación sin duplicar (identificación, RUT o nombre + zona).
ALTER TABLE establecimientos ADD COLUMN IF NOT EXISTS import_key text;
CREATE UNIQUE INDEX IF NOT EXISTS uq_establecimientos_import_key ON establecimientos (import_key) WHERE import_key IS NOT NULL;
