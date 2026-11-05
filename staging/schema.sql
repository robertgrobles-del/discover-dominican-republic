-- Esquema de la base de staging (Turso / SQLite). Solo cubre lo que staging expone:
-- acceso al panel, provincias y noticias. El backend completo (PostgreSQL) no usa este archivo.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,                 -- UUID
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,                    -- scrypt$<sal hex>$<hash hex>
  display_name  TEXT,
  roles         TEXT NOT NULL DEFAULT '["editor"]', -- JSON: "admin" | "editor"
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Intentos de acceso fallidos, para frenar ataques de fuerza bruta.
CREATE TABLE IF NOT EXISTS login_attempts (
  email      TEXT NOT NULL COLLATE NOCASE,
  ip         TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS login_attempts_email_at ON login_attempts (email, created_at);

CREATE TABLE IF NOT EXISTS provinces (
  id                TEXT PRIMARY KEY,
  slug              TEXT NOT NULL UNIQUE,
  name              TEXT NOT NULL,
  region            TEXT NOT NULL CHECK (region IN ('norte','sur','este','santo-domingo')),
  capital           TEXT,
  short_description TEXT,
  description       TEXT,
  image_url         TEXT,
  latitude          REAL,
  longitude         REAL,
  status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  created_by        TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS news (
  id           TEXT PRIMARY KEY,
  slug         TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  excerpt      TEXT,
  body         TEXT,
  cover_url    TEXT,
  province_id  TEXT REFERENCES provinces(id) ON DELETE SET NULL,
  status       TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  published_at TEXT,
  created_by   TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS news_status_published ON news (status, published_at);
