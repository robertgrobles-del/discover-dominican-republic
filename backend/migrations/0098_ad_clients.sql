-- Clientes publicitarios: cada banner pertenece a una empresa o persona registrada, a la que se le factura desde el admin.
-- Las diapositivas de carrusel (hero-slide) guardan además los datos de portada que un banner normal no tiene.

CREATE TABLE IF NOT EXISTS ad_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'empresa' CHECK (kind IN ('empresa', 'persona')),
  legal_name text NOT NULL CHECK (length(legal_name) BETWEEN 2 AND 200),   -- razón social o nombre completo (sale en la factura)
  trade_name text,                                                         -- nombre comercial / marca
  rnc_cedula text CHECK (rnc_cedula IS NULL OR rnc_cedula ~ '^\d{9}(\d{2})?$'), -- RNC (9) o cédula (11), sin guiones
  email text NOT NULL CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text,
  address text,
  contact_name text,
  partner_profile_id uuid REFERENCES partner_profiles(id) ON DELETE SET NULL, -- si además es un negocio del directorio
  default_ncf_type varchar(4) NOT NULL DEFAULT 'B01' CHECK (default_ncf_type IN ('B01', 'B02', 'B14', 'B15', 'E31', 'E32', 'E44', 'E45')),
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_ad_clients_rnc ON ad_clients (rnc_cedula) WHERE rnc_cedula IS NOT NULL AND deleted_at IS NULL;

ALTER TABLE ad_banners ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES ad_clients(id) ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS idx_ad_banners_client ON ad_banners (client_id) WHERE deleted_at IS NULL;

-- Datos de portada de una diapositiva: { tag, location, season, rating, badge, stats: [{ value, label }] }.
ALTER TABLE ad_banners ADD COLUMN IF NOT EXISTS slide_details jsonb;

-- Un banner sólo puede estar activo con cliente asignado (los antiguos sin cliente quedan, pero no se pueden activar).
CREATE OR REPLACE FUNCTION ad_banners_require_client() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.deleted_at IS NULL AND coalesce(NEW.is_active, true) AND NEW.client_id IS NULL THEN
    RAISE EXCEPTION 'Asigna el cliente al que se factura este banner antes de activarlo'
      USING ERRCODE = '23502', COLUMN = 'client_id';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_ad_banners_require_client ON ad_banners;
CREATE TRIGGER trg_ad_banners_require_client BEFORE INSERT OR UPDATE ON ad_banners
  FOR EACH ROW EXECUTE FUNCTION ad_banners_require_client();
