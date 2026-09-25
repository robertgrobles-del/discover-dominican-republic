-- Motor de reservas de Operadores RD (docs §5.8 y §5.10): habitaciones, tarifas, bloqueos, equipo, reservas y pagos normalizados.
-- Reemplaza el uso de la tabla `reservations` heredada (pensada para el checkout de catálogo del portal) por `bookings`,
-- que admite invitados, habitaciones, depósitos, extras y precios por tipo de persona.

-- Los anuncios ya existen (operator_listings, ids de texto); se completan y endurecen los campos que la etapa 1-8 del frontend usaba sólo en JSON.
ALTER TABLE operator_listings ALTER COLUMN child_price TYPE numeric(12,2);
ALTER TABLE operator_listings ALTER COLUMN infants_free SET DEFAULT false;
UPDATE operator_listings SET infants_free = false WHERE infants_free IS NULL;
ALTER TABLE operator_listings ALTER COLUMN infants_free SET NOT NULL;
UPDATE operator_listings SET deposit_percent = NULL WHERE deposit_percent IS NOT NULL AND (deposit_percent < 1 OR deposit_percent > 90);
ALTER TABLE operator_listings DROP CONSTRAINT IF EXISTS operator_listings_deposit_check;
ALTER TABLE operator_listings ADD CONSTRAINT operator_listings_deposit_check CHECK (deposit_percent IS NULL OR deposit_percent BETWEEN 1 AND 90);
ALTER TABLE operator_listings ALTER COLUMN extras SET DEFAULT '[]';
ALTER TABLE operator_listings ALTER COLUMN itinerary SET DEFAULT '[]';
ALTER TABLE operator_listings ALTER COLUMN components SET DEFAULT '[]';
ALTER TABLE operator_listings ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
DROP TRIGGER IF EXISTS trg_set_updated_at ON operator_listings;
CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON operator_listings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE UNIQUE INDEX IF NOT EXISTS uq_operator_listings_org_slug ON operator_listings (org_id, slug);
CREATE INDEX IF NOT EXISTS idx_operator_listings_org ON operator_listings (org_id, status);
ALTER TABLE operator_listings DROP COLUMN IF EXISTS rooms; -- las habitaciones pasan a su propia tabla

-- Equipo de la organización (docs §7.3). El propietario también es un miembro con rol 'owner'.
CREATE TABLE IF NOT EXISTS org_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES partner_profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'recepcion', 'guia')),
  listing_ids text[] NOT NULL DEFAULT '{}', -- guías: sólo estos anuncios
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON org_members (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_org_one_owner ON org_members (org_id) WHERE role = 'owner';

-- La organización deja de ser "un perfil por usuario": su id ya no tiene que ser el de un usuario y el dueño es un miembro más.
ALTER TABLE partner_profiles DROP CONSTRAINT IF EXISTS fk_partner_profiles_id;
INSERT INTO org_members (org_id, user_id, role) SELECT p.id, p.id, 'owner' FROM partner_profiles p JOIN users u ON u.id = p.id ON CONFLICT DO NOTHING;

-- Habitaciones de un alojamiento (cada una con su enlace: /operador/{slug}/{anuncio}?habitacion={id}).
CREATE TABLE IF NOT EXISTS operator_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id text NOT NULL REFERENCES operator_listings(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric(12,2) NOT NULL CHECK (price > 0),          -- por noche
  weekend_price numeric(12,2) CHECK (weekend_price IS NULL OR weekend_price > 0), -- noches de viernes y sábado
  min_nights integer NOT NULL DEFAULT 1 CHECK (min_nights >= 1),
  guests integer NOT NULL DEFAULT 2 CHECK (guests >= 1),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  beds text,
  amenities text[] NOT NULL DEFAULT '{}',
  image text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_operator_rooms_listing ON operator_rooms (listing_id);
DROP TRIGGER IF EXISTS trg_set_updated_at ON operator_rooms;
CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON operator_rooms FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS room_rate_seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES operator_rooms(id) ON DELETE CASCADE,
  name text NOT NULL,
  from_date date NOT NULL,
  to_date date NOT NULL,  -- inclusive
  price numeric(12,2) NOT NULL CHECK (price > 0),
  CHECK (to_date >= from_date)
);
CREATE INDEX IF NOT EXISTS idx_room_seasons_room ON room_rate_seasons (room_id, from_date);

CREATE TABLE IF NOT EXISTS room_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES operator_rooms(id) ON DELETE CASCADE,
  from_date date NOT NULL,
  to_date date NOT NULL,  -- inclusive
  reason text,
  link_id uuid,           -- bloqueo importado de un calendario externo (iCal)
  CHECK (to_date >= from_date)
);
CREATE INDEX IF NOT EXISTS idx_room_blocks_room ON room_blocks (room_id, from_date);

-- Reservas. La cantidad ocupada se calcula desde aquí (no hay contadores que se desincronicen).
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  org_id uuid NOT NULL REFERENCES partner_profiles(id),
  listing_id text NOT NULL REFERENCES operator_listings(id),
  room_id uuid REFERENCES operator_rooms(id) ON DELETE SET NULL,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  access_hash text,                 -- hash del token con el que un invitado consulta/cancela su reserva
  listing_title text NOT NULL,      -- instantáneas: no cambian si el anuncio se edita después
  room_name text,
  category text NOT NULL,
  date date NOT NULL,               -- inicio / llegada
  check_out date,                   -- alojamientos (salida) y paquetes (último día)
  time text,
  guests integer NOT NULL CHECK (guests >= 1),  -- plazas que ocupa (adultos + niños; los bebés no ocupan)
  adults integer NOT NULL DEFAULT 1,
  children integer NOT NULL DEFAULT 0,
  infants integer NOT NULL DEFAULT 0,
  currency text NOT NULL CHECK (currency IN ('USD', 'DOP')),
  subtotal numeric(12,2) NOT NULL,
  discount numeric(12,2) NOT NULL DEFAULT 0,
  total_price numeric(12,2) NOT NULL CHECK (total_price >= 0),
  deposit_amount numeric(12,2),
  promo_code text,
  quote jsonb NOT NULL DEFAULT '{}',  -- desglose completo tal como se cotizó
  extras jsonb NOT NULL DEFAULT '[]',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  payment_status text NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded')),
  amount_paid numeric(12,2) NOT NULL DEFAULT 0,
  source text NOT NULL DEFAULT 'web' CHECK (source IN ('web', 'manual', 'marketplace')),
  cancellation_policy text NOT NULL DEFAULT 'flexible',
  cancelled_at timestamptz,
  cancelled_by text CHECK (cancelled_by IN ('traveler', 'operator', 'system')),
  cancel_reason text,
  refund_amount numeric(12,2) NOT NULL DEFAULT 0,
  notes text,
  review_pending boolean NOT NULL DEFAULT false,
  notified jsonb NOT NULL DEFAULT '{}',
  idempotency_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (check_out IS NULL OR check_out >= date)
);
CREATE INDEX IF NOT EXISTS idx_bookings_org_date ON bookings (org_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_listing_slot ON bookings (listing_id, date, time) WHERE status <> 'cancelled';
CREATE INDEX IF NOT EXISTS idx_bookings_room_dates ON bookings (room_id, date, check_out) WHERE status <> 'cancelled';
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings (lower(contact_email));
CREATE UNIQUE INDEX IF NOT EXISTS uq_bookings_idempotency ON bookings (org_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
DROP TRIGGER IF EXISTS trg_set_updated_at ON bookings;
CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS booking_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('full', 'deposit', 'balance', 'manual', 'refund')),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),  -- siempre positivo; el tipo 'refund' resta
  currency text NOT NULL,
  status text NOT NULL DEFAULT 'succeeded' CHECK (status IN ('succeeded', 'failed')),
  method text NOT NULL DEFAULT 'card',
  provider text,
  provider_ref text,
  failure text,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_booking_payments_booking ON booking_payments (booking_id);

-- Un cliente nunca puede pasar de las plazas del anuncio por dos solicitudes simultáneas: el código bloquea la fila del anuncio/habitación,
-- y esta restricción impide además duplicar la misma reserva por reintento.
