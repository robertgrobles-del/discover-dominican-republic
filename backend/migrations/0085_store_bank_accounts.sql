-- Cuentas bancarias donde los clientes depositan o transfieren el pago de un pedido de la tienda. Las gestiona un
-- administrador desde el panel: se añaden, se editan, se desactivan o se borran sin tocar el código.

CREATE TABLE IF NOT EXISTS store_bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name text NOT NULL CHECK (length(bank_name) BETWEEN 2 AND 80),
  account_type text NOT NULL DEFAULT 'corriente' CHECK (account_type IN ('corriente', 'ahorros')),
  account_number text NOT NULL CHECK (length(account_number) BETWEEN 4 AND 40),
  holder_name text NOT NULL CHECK (length(holder_name) BETWEEN 2 AND 120),
  -- RNC o cédula del titular, si el banco la pide para transferir.
  holder_document text CHECK (holder_document IS NULL OR length(holder_document) <= 30),
  currency text NOT NULL DEFAULT 'DOP' CHECK (currency ~ '^[A-Z]{3}$'),
  notes text CHECK (notes IS NULL OR length(notes) <= 300),
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_store_bank_accounts_active ON store_bank_accounts (sort_order, bank_name) WHERE is_active;
