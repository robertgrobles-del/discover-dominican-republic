-- Operadores RD (reservas directas) + Tienda oficial.
-- Esquema de referencia para el backend real / CMS. En modo mock estas tablas
-- viven en src/integrations/supabase/mockDb.json con persistencia local.

-- Organización del operador: se amplía partner_profiles (ya existente).
ALTER TABLE public.partner_profiles
  ADD COLUMN IF NOT EXISTS slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS verification text NOT NULL DEFAULT 'unverified'
    CHECK (verification IN ('unverified','pending','verified','rejected')),
  ADD COLUMN IF NOT EXISTS commission_rate numeric(5,2) NOT NULL DEFAULT 8,
  ADD COLUMN IF NOT EXISTS payout_method text,
  ADD COLUMN IF NOT EXISTS website_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS cover_url text,
  ADD COLUMN IF NOT EXISTS province text;

CREATE TABLE IF NOT EXISTS public.operator_listings (
  id text PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('experiencia','voluntariado','alojamiento','transporte')),
  title text NOT NULL,
  slug text NOT NULL,
  summary text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  destination text,
  price numeric(12,2) NOT NULL CHECK (price >= 0),
  currency text NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD','DOP')),
  duration text,
  capacity integer NOT NULL DEFAULT 1 CHECK (capacity >= 1),
  min_age integer DEFAULT 0,
  languages text[] NOT NULL DEFAULT '{}',
  includes text[] NOT NULL DEFAULT '{}',
  meeting_point text,
  cancellation_policy text NOT NULL DEFAULT 'flexible' CHECK (cancellation_policy IN ('flexible','moderada','estricta')),
  images text[] NOT NULL DEFAULT '{}',
  time_slots text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','paused')),
  rating numeric(2,1),
  reviews_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_operator_listings_org ON public.operator_listings(org_id);
CREATE INDEX IF NOT EXISTS idx_operator_listings_status ON public.operator_listings(status);

-- Las reservas usan la tabla existente `reservations`.
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.partner_profiles(id),
  ADD COLUMN IF NOT EXISTS listing_id text REFERENCES public.operator_listings(id),
  ADD COLUMN IF NOT EXISTS listing_title text,
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS date date,
  ADD COLUMN IF NOT EXISTS time text,
  ADD COLUMN IF NOT EXISTS guests integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid','partial','paid','refunded')),
  ADD COLUMN IF NOT EXISTS promo_code text,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'web' CHECK (source IN ('web','manual','marketplace')),
  ADD COLUMN IF NOT EXISTS review_pending boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_reservations_org_date ON public.reservations(org_id, date);

CREATE TABLE IF NOT EXISTS public.operator_messages (
  id text PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  thread_id text NOT NULL,
  traveler_name text NOT NULL,
  sender text NOT NULL CHECK (sender IN ('traveler','operator')),
  channel text NOT NULL CHECK (channel IN ('web','whatsapp','instagram','email')),
  body text NOT NULL,
  booking_id text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_operator_messages_thread ON public.operator_messages(org_id, thread_id);

CREATE TABLE IF NOT EXISTS public.operator_promotions (
  id text PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  code text NOT NULL,
  type text NOT NULL CHECK (type IN ('percent','fixed')),
  value numeric(10,2) NOT NULL CHECK (value > 0),
  listing_id text REFERENCES public.operator_listings(id) ON DELETE SET NULL,
  starts_at date,
  ends_at date,
  max_uses integer,
  uses integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, code)
);

CREATE TABLE IF NOT EXISTS public.operator_reviews (
  id text PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  listing_id text REFERENCES public.operator_listings(id) ON DELETE CASCADE,
  author text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  reply text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Tienda oficial
CREATE TABLE IF NOT EXISTS public.store_products (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('poster','ropa','accesorios','hogar','bolsos')),
  price numeric(12,2) NOT NULL CHECK (price >= 0),
  currency text NOT NULL DEFAULT 'DOP',
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  active boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  emoji text,
  tone text,
  sizes text[] NOT NULL DEFAULT '{}',
  colors text[] NOT NULL DEFAULT '{}',
  tagline text,
  description text,
  includes text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.store_orders (
  id text PRIMARY KEY,
  user_id uuid,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  phone text,
  address text NOT NULL,
  city text NOT NULL,
  items jsonb NOT NULL,
  subtotal numeric(12,2) NOT NULL,
  shipping numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','shipped','delivered','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: cada operador solo ve y edita lo suyo; el público lee servicios publicados
-- de organizaciones verificadas; los administradores gestionan todo.
ALTER TABLE public.operator_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "listings_public_read" ON public.operator_listings FOR SELECT
  USING (status = 'published' AND EXISTS (SELECT 1 FROM public.partner_profiles p WHERE p.id = org_id AND p.verification = 'verified'));
CREATE POLICY "listings_owner_all" ON public.operator_listings FOR ALL
  USING (org_id = auth.uid()) WITH CHECK (org_id = auth.uid());
CREATE POLICY "messages_owner_all" ON public.operator_messages FOR ALL
  USING (org_id = auth.uid()) WITH CHECK (org_id = auth.uid());
CREATE POLICY "promotions_owner_all" ON public.operator_promotions FOR ALL
  USING (org_id = auth.uid()) WITH CHECK (org_id = auth.uid());
CREATE POLICY "reviews_public_read" ON public.operator_reviews FOR SELECT USING (true);
CREATE POLICY "reviews_owner_reply" ON public.operator_reviews FOR UPDATE USING (org_id = auth.uid());
CREATE POLICY "products_public_read" ON public.store_products FOR SELECT USING (active);
CREATE POLICY "orders_owner_read" ON public.store_orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "admin_all_listings" ON public.operator_listings FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_all_products" ON public.store_products FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_all_orders" ON public.store_orders FOR ALL USING (public.has_role(auth.uid(), 'admin'));
