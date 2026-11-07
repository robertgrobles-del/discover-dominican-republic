-- Fotos (WebP) y menú (PDF) que se suben en el formulario público de registro de negocios.
-- Se suben antes de enviar la solicitud (request_id NULL) y quedan ligadas a ella al enviarla.
-- Provisional como media: viven en Turso; se sirven en /api/v1/establishment-files/<id>.webp|.pdf.

CREATE TABLE IF NOT EXISTS establishment_files (
  id         TEXT PRIMARY KEY,
  request_id TEXT REFERENCES establishment_requests(id) ON DELETE CASCADE,
  kind       TEXT NOT NULL CHECK (kind IN ('photo','menu')),
  mime       TEXT NOT NULL CHECK (mime IN ('image/webp','application/pdf')),
  bytes      BLOB NOT NULL,
  size       INTEGER NOT NULL,
  ip_hash    TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS establishment_files_request ON establishment_files (request_id);
CREATE INDEX IF NOT EXISTS establishment_files_ip ON establishment_files (ip_hash, created_at);
