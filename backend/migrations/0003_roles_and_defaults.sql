-- Roles ampliados (docs/BACKEND_API.md §6.2 y §7.3) y valores por defecto comunes.

DO $$ BEGIN
  CREATE TYPE app_role AS ENUM ('admin', 'editor', 'moderator', 'partner', 'ambassador', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE user_roles ALTER COLUMN role TYPE app_role USING role::app_role;

CREATE OR REPLACE FUNCTION has_role(_user_id uuid, _role app_role) RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION is_admin_user(_user_id uuid) RETURNS boolean
LANGUAGE sql STABLE AS $$ SELECT has_role(_user_id, 'admin'); $$;

-- Toda clave primaria `id uuid` sin valor por defecto genera su propio UUID.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT c.table_name FROM information_schema.columns c
    JOIN information_schema.tables t ON t.table_name = c.table_name AND t.table_schema = c.table_schema AND t.table_type = 'BASE TABLE'
    WHERE c.table_schema = 'public' AND c.column_name = 'id' AND c.data_type = 'uuid' AND c.column_default IS NULL
  LOOP
    EXECUTE format('ALTER TABLE %I ALTER COLUMN id SET DEFAULT gen_random_uuid()', r.table_name);
  END LOOP;
END $$;
