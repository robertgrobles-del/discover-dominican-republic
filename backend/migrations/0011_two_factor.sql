-- Verificación en dos pasos (TOTP, RFC 6238) — docs §7.2. El secreto se guarda cifrado (AES-256-GCM) y los códigos de recuperación como hash.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS totp_secret_enc text,
  ADD COLUMN IF NOT EXISTS totp_enabled_at timestamptz,
  ADD COLUMN IF NOT EXISTS totp_recovery_hashes text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS totp_last_step bigint;

-- La sesión recuerda si se completó el segundo factor, para conservarlo al rotar el token de refresco.
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS mfa boolean NOT NULL DEFAULT false;
