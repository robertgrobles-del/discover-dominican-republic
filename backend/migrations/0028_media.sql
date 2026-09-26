-- Archivos y medios (docs §5.16): metadatos de imágenes subidas con URL firmada; el binario vive en el almacenamiento configurado.

CREATE TABLE IF NOT EXISTS media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  kind text NOT NULL DEFAULT 'image' CHECK (kind IN ('image')),
  purpose text NOT NULL CHECK (purpose IN ('avatar', 'review_photo', 'ugc', 'listing_image', 'cms')),
  mime text NOT NULL CHECK (mime IN ('image/jpeg', 'image/png', 'image/webp', 'image/gif')),
  declared_size integer NOT NULL CHECK (declared_size > 0),
  size integer,
  width integer,
  height integer,
  alt text,
  credit text,
  sha256 text,
  storage_key text,
  source_url text,                                  -- si se importó de una URL externa
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'uploaded', 'ready', 'in_review', 'rejected')),
  moderation_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_media_assets_owner ON media_assets (owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_assets_status ON media_assets (status, created_at);
