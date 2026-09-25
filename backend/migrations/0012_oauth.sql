-- Inicio de sesión social (OIDC) — docs §5.1.

-- Cuentas creadas sólo con un proveedor no tienen contraseña utilizable.
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_set boolean NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS oauth_identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  subject text NOT NULL,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz,
  UNIQUE (provider, subject),
  UNIQUE (user_id, provider)
);
CREATE INDEX IF NOT EXISTS idx_oauth_identities_user ON oauth_identities (user_id);

-- Estado de cada intento (anti-CSRF + PKCE + nonce). De un solo uso y de corta vida; sólo se guarda el hash del state.
CREATE TABLE IF NOT EXISTS oauth_states (
  state_hash text PRIMARY KEY,
  provider text NOT NULL,
  code_verifier text NOT NULL,
  nonce text NOT NULL,
  redirect_to text NOT NULL,
  mode text NOT NULL CHECK (mode IN ('login', 'link')),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires ON oauth_states (expires_at);

-- Código de un solo uso (60 s) con el que el frontend canjea el resultado sin exponer tokens en la URL.
CREATE TABLE IF NOT EXISTS oauth_login_codes (
  code_hash text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz
);
