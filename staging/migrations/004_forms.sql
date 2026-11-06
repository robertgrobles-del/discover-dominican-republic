-- Formularios públicos de la landing: participantes del sorteo y solicitudes de registro de negocios.
-- ip_hash: huella HMAC de la IP (no la IP) para frenar envíos masivos sin guardar un dato personal.

CREATE TABLE IF NOT EXISTS leads (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL COLLATE NOCASE,
  interest   TEXT,
  message    TEXT,
  source     TEXT NOT NULL,
  consent    INTEGER NOT NULL CHECK (consent = 1),
  ip_hash    TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (email, source)
);
CREATE INDEX IF NOT EXISTS leads_source_created ON leads (source, created_at);

CREATE TABLE IF NOT EXISTS establishment_requests (
  id           TEXT PRIMARY KEY,
  type         TEXT NOT NULL,
  name         TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email        TEXT NOT NULL COLLATE NOCASE,
  phone        TEXT NOT NULL,
  address      TEXT,
  province     TEXT,
  website      TEXT,
  photo_url    TEXT,
  description  TEXT,
  rnc          TEXT,
  schedule     TEXT,
  details      TEXT,                                -- JSON con los datos propios de cada tipo
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  ip_hash      TEXT,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS establishment_requests_status ON establishment_requests (status, created_at);
