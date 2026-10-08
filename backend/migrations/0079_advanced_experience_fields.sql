-- ==============================================================================
-- Migración 0079: Extensión de campos avanzados para Destinos, Establecimientos y Aeropuertos
-- Permite gobernar desde el CMS y base de datos:
-- 1. Destinos: altitud, clima, joyas ocultas (hidden_gems), itinerarios recomendados.
-- 2. Establecimientos (Hoteles/Restaurantes): galería 360, amenidades bento, timeline de huésped, reglas de reserva.
-- 3. Aeropuertos: estado de vuelos en vivo, asistencia E-Ticket y traslados terrestres regulados.
-- 4. Banners Publicitarios: soporte para patrocinio de sección/portal completo (Takeover), UTMs y tracking.
-- ==============================================================================

-- 1. Ampliación de Destinos y Provincias
ALTER TABLE destinations
  ADD COLUMN IF NOT EXISTS altitude_m numeric(7,2),
  ADD COLUMN IF NOT EXISTS hidden_gems jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS itineraries jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS seasonal_highlights jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS transit_options jsonb NOT NULL DEFAULT '[]';

ALTER TABLE provinces
  ADD COLUMN IF NOT EXISTS emergency_contacts jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS weather_forecast jsonb NOT NULL DEFAULT '{}';

-- 2. Ampliación de Hoteles y Alojamientos
ALTER TABLE hotels
  ADD COLUMN IF NOT EXISTS tour_360_url text,
  ADD COLUMN IF NOT EXISTS guest_timeline jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS room_types jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS whatsapp_phone text,
  ADD COLUMN IF NOT EXISTS direct_booking_url text,
  ADD COLUMN IF NOT EXISTS eco_guidelines jsonb NOT NULL DEFAULT '[]';

-- 3. Ampliación de Restaurantes
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS menu_highlights jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS dietary_options jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS chef_recommendations jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS reservation_phone text;

-- 4. Ampliación de Aeropuertos
ALTER TABLE airports
  ADD COLUMN IF NOT EXISTS live_flights_config jsonb NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS eticket_guide_url text DEFAULT 'https://eticket.migracion.gob.do',
  ADD COLUMN IF NOT EXISTS ground_transit_fares jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS daily_flights_count integer DEFAULT 0;

-- 5. Ampliación de Banners Publicitarios (Sponsorship & Takeover)
ALTER TABLE ad_banners
  ADD COLUMN IF NOT EXISTS sponsorship_scope text DEFAULT 'slot' CHECK (sponsorship_scope IN ('slot', 'section', 'global')),
  ADD COLUMN IF NOT EXISTS is_takeover boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_content text,
  ADD COLUMN IF NOT EXISTS target_section text,
  ADD COLUMN IF NOT EXISTS target_page text;

-- Índices de consulta de alto rendimiento
CREATE INDEX IF NOT EXISTS idx_ad_banners_scope ON ad_banners (sponsorship_scope, is_takeover) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_airports_code_upper ON airports (upper(code));
