-- Imágenes subidas desde el panel (portadas y fotos del cuerpo de las noticias), ya convertidas a WebP.
-- Provisional: viven en Turso hasta elegir un almacenamiento de archivos; se sirven en /api/v1/media/<id>.webp,
-- así que mudarlas solo cambia ese endpoint, no las URLs guardadas en las noticias.

CREATE TABLE IF NOT EXISTS media (
  id         TEXT PRIMARY KEY,
  mime       TEXT NOT NULL CHECK (mime = 'image/webp'),
  bytes      BLOB NOT NULL,
  size       INTEGER NOT NULL,
  width      INTEGER,
  height     INTEGER,
  alt        TEXT,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
