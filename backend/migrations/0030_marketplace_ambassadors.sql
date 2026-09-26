-- Marketplace de vendedores locales y programa de embajadores (docs §5.9 y §5.11).

-- ---------- Vendedores ----------
CREATE TABLE IF NOT EXISTS marketplace_vendors (
  id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  bio text,
  logo_url text,
  cover_url text,
  province_id uuid REFERENCES provinces(id) ON DELETE SET NULL,
  city text,
  phone text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'rejected')),
  status_note text,
  commission_rate numeric(5,2) NOT NULL DEFAULT 15 CHECK (commission_rate BETWEEN 0 AND 60),
  payout_method text,
  payout_details text,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marketplace_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES marketplace_vendors(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  kind text NOT NULL DEFAULT 'product' CHECK (kind IN ('product', 'experience')),
  description text,
  price numeric(12,2) NOT NULL CHECK (price >= 0),
  currency text NOT NULL DEFAULT 'DOP',
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),      -- en experiencias son los cupos disponibles
  images text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending_review' CHECK (status IN ('draft', 'pending_review', 'published', 'rejected', 'archived')),
  review_note text,
  published_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mp_products_catalog ON marketplace_products (category, created_at DESC) WHERE status = 'published' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_mp_products_vendor ON marketplace_products (vendor_id) WHERE deleted_at IS NULL;

-- ---------- Pedidos ----------
ALTER TABLE marketplace_orders DROP CONSTRAINT IF EXISTS marketplace_orders_status_check;
ALTER TABLE marketplace_orders ADD CONSTRAINT marketplace_orders_status_check CHECK (status IN ('pending', 'paid', 'processing', 'completed', 'cancelled', 'refunded'));
ALTER TABLE marketplace_orders
  ADD COLUMN IF NOT EXISTS customer_name text,
  ADD COLUMN IF NOT EXISTS customer_email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS province text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'DOP',
  ADD COLUMN IF NOT EXISTS fx_rate numeric(10,4),
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'partial', 'refunded')),
  ADD COLUMN IF NOT EXISTS amount_paid numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS refund_amount numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS access_hash text,
  ADD COLUMN IF NOT EXISTS idempotency_key text,
  ADD COLUMN IF NOT EXISTS ref_code text,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancel_reason text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE marketplace_orders ALTER COLUMN payment_method DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_mp_orders_idem ON marketplace_orders ((coalesce(user_id::text, lower(customer_email))), idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mp_orders_user ON marketplace_orders (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mp_orders_status ON marketplace_orders (status, created_at);

ALTER TABLE marketplace_order_items DROP CONSTRAINT IF EXISTS marketplace_order_items_item_type_check;
ALTER TABLE marketplace_order_items
  ADD COLUMN IF NOT EXISTS vendor_id uuid REFERENCES marketplace_vendors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES marketplace_products(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS name text,                                   -- instantánea del producto
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'product',
  ADD COLUMN IF NOT EXISTS line_total numeric(12,2),
  ADD COLUMN IF NOT EXISTS commission_rate numeric(5,2),
  ADD COLUMN IF NOT EXISTS commission numeric(12,2),
  ADD COLUMN IF NOT EXISTS vendor_net numeric(12,2),
  ADD COLUMN IF NOT EXISTS fulfillment_status text NOT NULL DEFAULT 'pending' CHECK (fulfillment_status IN ('pending', 'shipped', 'delivered', 'cancelled')),
  ADD COLUMN IF NOT EXISTS courier_name text,
  ADD COLUMN IF NOT EXISTS tracking_number text,
  ADD COLUMN IF NOT EXISTS shipped_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS refunded boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS payout_id uuid;
ALTER TABLE marketplace_order_items ALTER COLUMN item_id DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mp_items_order ON marketplace_order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_mp_items_vendor ON marketplace_order_items (vendor_id, fulfillment_status);

CREATE TABLE IF NOT EXISTS marketplace_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES marketplace_orders(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('full', 'refund')),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  charged_amount numeric(12,2),
  charged_currency text,
  provider text NOT NULL,
  provider_ref text,
  status text NOT NULL DEFAULT 'succeeded',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_mp_payments_provider_ref ON marketplace_payments (provider, provider_ref) WHERE provider_ref IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mp_payments_order ON marketplace_payments (order_id);

-- ---------- Liquidaciones a vendedores ----------
ALTER TABLE vendor_payments
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'DOP',
  ADD COLUMN IF NOT EXISTS gross numeric(12,2),
  ADD COLUMN IF NOT EXISTS commission numeric(12,2),
  ADD COLUMN IF NOT EXISTS item_count integer NOT NULL DEFAULT 0;
DO $$ BEGIN ALTER TABLE marketplace_order_items ADD CONSTRAINT fk_mp_items_payout FOREIGN KEY (payout_id) REFERENCES vendor_payments(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- Embajadores ----------
ALTER TABLE ambassadors
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  ADD COLUMN IF NOT EXISTS motivation text,
  ADD COLUMN IF NOT EXISTS audience text,
  ADD COLUMN IF NOT EXISTS social_links jsonb NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS status_note text,
  ADD COLUMN IF NOT EXISTS commission_override numeric(5,2) CHECK (commission_override IS NULL OR commission_override BETWEEN 0 AND 40),
  ADD COLUMN IF NOT EXISTS payout_method text,
  ADD COLUMN IF NOT EXISTS payout_details text,
  ADD COLUMN IF NOT EXISTS clicks integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
UPDATE ambassadors SET status = 'approved' WHERE is_active AND status = 'pending';
ALTER TABLE ambassadors ALTER COLUMN is_active SET DEFAULT false;

ALTER TABLE ambassador_referrals DROP CONSTRAINT IF EXISTS ambassador_referrals_status_check;
ALTER TABLE ambassador_referrals ADD CONSTRAINT ambassador_referrals_status_check CHECK (status IN ('pending', 'approved', 'requested', 'paid', 'reversed'));
ALTER TABLE ambassador_referrals
  ADD COLUMN IF NOT EXISTS source_type text,
  ADD COLUMN IF NOT EXISTS source_id text,
  ADD COLUMN IF NOT EXISTS rate numeric(5,2),
  ADD COLUMN IF NOT EXISTS hold_until timestamptz,
  ADD COLUMN IF NOT EXISTS payout_id uuid REFERENCES ambassador_payouts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE ambassador_referrals ALTER COLUMN id SET DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS uq_ambassador_referral_source ON ambassador_referrals (source_type, source_id) WHERE source_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ambassador_referrals_amb ON ambassador_referrals (ambassador_id, status);

ALTER TABLE ambassador_payouts DROP CONSTRAINT IF EXISTS ambassador_payouts_status_check;
ALTER TABLE ambassador_payouts ADD CONSTRAINT ambassador_payouts_status_check CHECK (status IN ('pending', 'paid', 'failed'));
ALTER TABLE ambassador_payouts
  ADD COLUMN IF NOT EXISTS reference text,
  ADD COLUMN IF NOT EXISTS note text;
ALTER TABLE ambassador_payouts ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Referencia de embajador en los pedidos de la tienda.
ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS ref_code text;
