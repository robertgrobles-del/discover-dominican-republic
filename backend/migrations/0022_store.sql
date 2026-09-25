-- Tienda oficial (docs §5.9): catálogo, carrito compartido (invitado + cuenta), cupones, pedidos con stock bloqueado y pagos.

ALTER TABLE store_products
  ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS idx_store_products_catalog ON store_products (category, sort_order, name) WHERE active AND deleted_at IS NULL;

-- ---------- Carrito ----------
CREATE TABLE IF NOT EXISTS store_carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  guest_hash text,                       -- sha256 del token del invitado (el token sólo lo conoce el navegador)
  coupon_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (user_id IS NOT NULL OR guest_hash IS NOT NULL)
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_store_carts_user ON store_carts (user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_store_carts_guest ON store_carts (guest_hash) WHERE guest_hash IS NOT NULL;

CREATE TABLE IF NOT EXISTS store_cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES store_carts(id) ON DELETE CASCADE,
  product_id text NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
  size text NOT NULL DEFAULT '',
  color text NOT NULL DEFAULT '',
  quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 20),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cart_id, product_id, size, color)
);

-- ---------- Cupones ----------
ALTER TABLE discount_coupons
  ADD COLUMN IF NOT EXISTS min_subtotal numeric(12,2),
  ADD COLUMN IF NOT EXISTS per_user_limit integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS description text;
CREATE UNIQUE INDEX IF NOT EXISTS uq_discount_coupons_code_ci ON discount_coupons (upper(code));

-- ---------- Pedidos ----------
ALTER TABLE store_orders DROP CONSTRAINT IF EXISTS store_orders_status_check;
ALTER TABLE store_orders ADD CONSTRAINT store_orders_status_check
  CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'return_requested'));
ALTER TABLE store_orders
  ADD COLUMN IF NOT EXISTS discount numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coupon_code text,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'DOP',
  ADD COLUMN IF NOT EXISTS fx_rate numeric(10,4),                       -- DOP por USD al crear el pedido (para cobrar en USD con Stripe)
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'partial', 'refunded')),
  ADD COLUMN IF NOT EXISTS amount_paid numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS province text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS access_hash text,
  ADD COLUMN IF NOT EXISTS idempotency_key text,
  ADD COLUMN IF NOT EXISTS courier_name text,
  ADD COLUMN IF NOT EXISTS tracking_number text,
  ADD COLUMN IF NOT EXISTS shipped_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancel_reason text,
  ADD COLUMN IF NOT EXISTS return_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS return_reason text,
  ADD COLUMN IF NOT EXISTS refund_amount numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE store_orders ALTER COLUMN items SET DEFAULT '[]';
CREATE UNIQUE INDEX IF NOT EXISTS uq_store_orders_idem ON store_orders ((coalesce(user_id::text, lower(customer_email))), idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_store_orders_user ON store_orders (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_store_orders_status ON store_orders (status, created_at);

CREATE TABLE IF NOT EXISTS store_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL REFERENCES store_orders(id) ON DELETE CASCADE,
  product_id text REFERENCES store_products(id) ON DELETE SET NULL,
  name text NOT NULL,                    -- instantánea: el precio y el nombre no cambian aunque el catálogo sí
  size text,
  color text,
  unit_price numeric(12,2) NOT NULL CHECK (unit_price >= 0),
  quantity integer NOT NULL CHECK (quantity > 0),
  line_total numeric(12,2) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_store_order_items_order ON store_order_items (order_id);

CREATE TABLE IF NOT EXISTS store_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL REFERENCES store_orders(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('full', 'refund')),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),   -- en la moneda del pedido (DOP)
  charged_amount numeric(12,2),                        -- lo que se movió en la pasarela (USD con Stripe)
  charged_currency text,
  status text NOT NULL DEFAULT 'succeeded' CHECK (status IN ('succeeded', 'failed')),
  provider text,
  provider_ref text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_store_payments_order ON store_payments (order_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_store_payments_stripe_ref ON store_payments (provider, provider_ref) WHERE provider = 'stripe' AND provider_ref IS NOT NULL;

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES discount_coupons(id) ON DELETE CASCADE,
  order_id text NOT NULL REFERENCES store_orders(id) ON DELETE CASCADE,
  user_key text NOT NULL,                -- user_id o correo en minúsculas
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_id)
);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user ON coupon_redemptions (coupon_id, user_key);
