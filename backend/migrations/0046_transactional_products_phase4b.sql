-- ==============================================================================
-- Migración 0046: Fase 4B — Nuevos Productos Transaccionales (Grupo C)
-- #12 Seguros de Viaje y Asistencia al Turista
-- #13 Traslados Privados, Transfers & Rent-a-car
-- #14 Merchandising Ampliado & Tienda Oficial
-- #17 Paquetes Turísticos Dinámicos Multidestino
-- ==============================================================================

-- 1. Pólizas y Cotizaciones de Seguros de Viaje (#12)
CREATE TABLE IF NOT EXISTS travel_insurance_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  provider_name text NOT NULL DEFAULT 'Seguros Banreservas / MITUR Shield',
  policy_number text NOT NULL UNIQUE,
  plan_tier text NOT NULL CHECK (plan_tier IN ('basico_medico', 'integral_aventura', 'cancelacion_total')),
  coverage_amount numeric(12,2) NOT NULL CHECK (coverage_amount > 0),
  premium_amount numeric(10,2) NOT NULL CHECK (premium_amount > 0),
  commission_amount numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'DOP',
  traveler_name text NOT NULL,
  traveler_passport_or_id text NOT NULL,
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'claimed', 'expired', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_insurance_user ON travel_insurance_policies (user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_dates ON travel_insurance_policies (starts_on, ends_on);

-- 2. Cotizaciones y Reservas de Traslados & Rent-a-Car (#13)
CREATE TABLE IF NOT EXISTS transport_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  partner_id uuid REFERENCES partner_profiles(id) ON DELETE SET NULL,
  service_type text NOT NULL CHECK (service_type IN ('airport_transfer', 'private_driver', 'rental_car', 'intercity_shuttle')),
  pickup_location text NOT NULL,
  dropoff_location text NOT NULL,
  pickup_datetime timestamptz NOT NULL,
  return_datetime timestamptz,
  passengers integer NOT NULL DEFAULT 1 CHECK (passengers > 0),
  vehicle_category text NOT NULL CHECK (vehicle_category IN ('sedan', 'suv', 'van_familiar', 'minibus_turistico', 'jeep_4x4')),
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  commission_amount numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'DOP',
  driver_contact jsonb, -- { name, phone, plate }
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_transport_datetime ON transport_bookings (pickup_datetime, status);

-- 3. Paquetes Dinámicos (#17)
CREATE TABLE IF NOT EXISTS dynamic_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  destination_id uuid REFERENCES destinations(id) ON DELETE SET NULL,
  duration_days integer NOT NULL CHECK (duration_days > 0),
  hotel_partner_id uuid REFERENCES partner_profiles(id) ON DELETE SET NULL,
  tour_listing_id uuid REFERENCES operator_listings(id) ON DELETE SET NULL,
  transport_type text CHECK (transport_type IN ('airport_transfer', 'rental_car', 'none')),
  base_price numeric(12,2) NOT NULL CHECK (base_price >= 0),
  currency text NOT NULL DEFAULT 'DOP',
  discount_percentage numeric(5,2) NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dynamic_packages_status ON dynamic_packages (status, is_featured);
