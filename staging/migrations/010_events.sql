-- Agenda de eventos que se gestiona desde el panel (/eventos y /evento/:slug muestran los publicados).
CREATE TABLE IF NOT EXISTS events (
  id                TEXT PRIMARY KEY,
  slug              TEXT NOT NULL UNIQUE,
  name              TEXT NOT NULL,
  event_type        TEXT,
  short_description TEXT,
  description       TEXT,
  image_url         TEXT,
  start_date        TEXT,
  end_date          TEXT,
  start_time        TEXT,
  end_time          TEXT,
  venue             TEXT,
  address           TEXT,
  province          TEXT,
  price_range       TEXT,
  ticket_url        TEXT,
  organizer         TEXT,
  is_featured       INTEGER NOT NULL DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'draft',
  created_by        TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS events_start ON events (status, start_date);
