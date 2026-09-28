-- Migration 0049: Facturación Fiscal Electrónica con NCF (DGII)
-- Requerimiento ★ 4 del Sprint 3.2: Estructura de Comprobantes Fiscales Electrónicos (e-CF)
-- Tipos soportados: B01 (Crédito Fiscal), B02 (Consumidor Final), B14 (Régimen Especial), B15 (Gubernamental)

CREATE TABLE IF NOT EXISTS fiscal_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number varchar(64) UNIQUE NOT NULL,
  ncf varchar(19) UNIQUE NOT NULL, -- e.g. E310000000001 (e-CF) o B0100000001 (tradicional)
  ncf_type varchar(4) NOT NULL CHECK (ncf_type IN ('B01', 'B02', 'B14', 'B15', 'E31', 'E32', 'E44', 'E45')),
  buyer_rnc_cedula varchar(20),
  buyer_name varchar(200) NOT NULL,
  subtotal numeric(12, 2) NOT NULL CHECK (subtotal >= 0),
  itbis numeric(12, 2) NOT NULL DEFAULT 0.00 CHECK (itbis >= 0),
  total numeric(12, 2) NOT NULL CHECK (total >= 0),
  currency varchar(10) NOT NULL DEFAULT 'DOP',
  exchange_rate numeric(8, 4) NOT NULL DEFAULT 1.0000,
  reference_type varchar(40) NOT NULL, -- 'membership', 'booking', 'store_order', 'sponsorship', 'ticket'
  reference_id varchar(128) NOT NULL,
  payment_method varchar(40) NOT NULL DEFAULT 'credit_card',
  security_code_dgii varchar(64), -- Código de seguridad generado para e-CF DGII
  qr_url text,
  status varchar(32) NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'delivered', 'cancelled', 'rejected')),
  issued_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fiscal_invoices_ncf ON fiscal_invoices(ncf);
CREATE INDEX IF NOT EXISTS idx_fiscal_invoices_reference ON fiscal_invoices(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_invoices_buyer ON fiscal_invoices(buyer_rnc_cedula);

-- Secuencias controladas por tipo de comprobante fiscal para emisión correlativa
CREATE TABLE IF NOT EXISTS fiscal_sequences (
  ncf_type varchar(4) PRIMARY KEY,
  prefix varchar(3) NOT NULL,
  current_number integer NOT NULL DEFAULT 1,
  max_number integer NOT NULL DEFAULT 99999999,
  expires_at date NOT NULL DEFAULT '2027-12-31',
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO fiscal_sequences (ncf_type, prefix, current_number, max_number)
VALUES
  ('B01', 'B01', 1, 1000000),
  ('B02', 'B02', 1, 1000000),
  ('E31', 'E31', 1, 5000000),
  ('E32', 'E32', 1, 5000000)
ON CONFLICT (ncf_type) DO NOTHING;
