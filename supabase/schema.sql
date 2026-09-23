-- ==========================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS (SCHEMA)
-- PROYECTO: Descubre República Dominicana
-- ==========================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 1. SEGURIDAD Y PERFILES DE USUARIO ──────────────────────────────────────

-- Tabla: profiles (Perfiles de usuario general / viajeros)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    travel_interests TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: partner_profiles (Perfiles comerciales B2B)
CREATE TABLE IF NOT EXISTS public.partner_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_type TEXT NOT NULL CHECK (business_type IN ('hotel', 'restaurant', 'bar', 'tour', 'spa', 'shop')),
    phone TEXT,
    email TEXT NOT NULL,
    description TEXT,
    rating NUMERIC(3,2) DEFAULT 5.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 2. GEOGRAFÍA Y DESTINOS ───────────────────────────────────────────────

-- Tabla: provinces (Provincias de República Dominicana)
CREATE TABLE IF NOT EXISTS public.provinces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    region TEXT,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: destinations (Destinos turísticos y municipios)
CREATE TABLE IF NOT EXISTS public.destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    province_id UUID REFERENCES public.provinces(id) ON DELETE SET NULL,
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    gallery TEXT[],
    highlights TEXT[],
    typical_dishes TEXT[],
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    weather_info TEXT,
    best_time_to_visit TEXT,
    how_to_get_there TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: municipalities (Municipios)
CREATE TABLE IF NOT EXISTS public.municipalities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    province_id UUID REFERENCES public.provinces(id) ON DELETE CASCADE,
    municipality_type TEXT,
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    gallery TEXT[],
    highlights TEXT[],
    population INTEGER,
    area_km2 NUMERIC(10, 2),
    is_tourist_destination BOOLEAN DEFAULT false,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 3. ALOJAMIENTO Y ESTABLECIMIENTOS ──────────────────────────────────────

-- Tabla: hotels (Hoteles y resorts)
CREATE TABLE IF NOT EXISTS public.hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    category TEXT,
    stars INTEGER CHECK (stars BETWEEN 1 AND 5),
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    gallery TEXT[],
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    price_range TEXT,
    amenities TEXT[],
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    rating NUMERIC(3,2) DEFAULT 0.00,
    is_featured BOOLEAN DEFAULT false,
    is_sponsored BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: airbnb_listings (Apartamentos y villas de renta corta)
CREATE TABLE IF NOT EXISTS public.airbnb_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    property_type TEXT,
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    gallery TEXT[],
    address TEXT,
    guests INTEGER,
    bedrooms INTEGER,
    beds INTEGER,
    bathrooms INTEGER,
    price_per_night NUMERIC(10, 2),
    cleaning_fee NUMERIC(10, 2) DEFAULT 0.00,
    service_fee NUMERIC(10, 2) DEFAULT 0.00,
    amenities TEXT[],
    house_rules TEXT[],
    check_in_time TEXT,
    check_out_time TEXT,
    cancellation_policy TEXT,
    host_name TEXT,
    host_image TEXT,
    host_description TEXT,
    is_superhost BOOLEAN DEFAULT false,
    min_nights INTEGER DEFAULT 1,
    max_nights INTEGER DEFAULT 1125,
    instant_book BOOLEAN DEFAULT false,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    rating NUMERIC(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_sponsored BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: restaurants (Restaurantes)
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    category TEXT,
    cuisine_type TEXT[],
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    gallery TEXT[],
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    price_range TEXT,
    opening_hours TEXT,
    services TEXT[],
    signature_dishes TEXT[],
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    rating NUMERIC(3,2) DEFAULT 0.00,
    is_featured BOOLEAN DEFAULT false,
    is_sponsored BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: bars (Bares y vida nocturna)
CREATE TABLE IF NOT EXISTS public.bars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    bar_type TEXT,
    ambiance TEXT,
    music_style TEXT,
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    gallery TEXT[],
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    price_range TEXT,
    opening_hours TEXT,
    dress_code TEXT,
    minimum_age INTEGER DEFAULT 18,
    services TEXT[],
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    rating NUMERIC(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_sponsored BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 4. BIENESTAR, COMPRAS Y SOCIOS ────────────────────────────────────────

-- Tabla: spas_wellness (Spas y centros de relajación)
CREATE TABLE IF NOT EXISTS public.spas_wellness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    spa_type TEXT,
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    gallery TEXT[],
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    services TEXT[],
    treatments TEXT[],
    rating NUMERIC(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_sponsored BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: artisanal_workshops (Talleres artesanales y tiendas de souvenirs)
CREATE TABLE IF NOT EXISTS public.artisanal_workshops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    workshop_type TEXT,
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    gallery TEXT[],
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    craft_types TEXT[],
    duration TEXT,
    price_range TEXT,
    includes TEXT[],
    skill_level TEXT,
    languages TEXT[],
    max_participants INTEGER,
    opening_hours TEXT,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    rating NUMERIC(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 5. ACTIVIDADES Y TOURS ───────────────────────────────────────────────

-- Tabla: tour_guides (Guías turísticos locales)
CREATE TABLE IF NOT EXISTS public.tour_guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    specialties TEXT[],
    languages TEXT[],
    description TEXT,
    image_url TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    years_experience INTEGER,
    certifications TEXT[],
    price_range TEXT,
    rating NUMERIC(3,2) DEFAULT 0.00,
    is_certified BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: travel_agencies (Agencias de viaje)
CREATE TABLE IF NOT EXISTS public.travel_agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    agency_type TEXT,
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    logo_url TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    services TEXT[],
    specialties TEXT[],
    languages TEXT[],
    certifications TEXT[],
    rating NUMERIC(3,2) DEFAULT 0.00,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: tour_operators (Tour operadores)
CREATE TABLE IF NOT EXISTS public.tour_operators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    operator_type TEXT,
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    logo_url TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    services TEXT[],
    tour_types TEXT[],
    languages TEXT[],
    certifications TEXT[],
    rating NUMERIC(3,2) DEFAULT 0.00,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: experiences (Experiencias de aventura o ecoturismo)
CREATE TABLE IF NOT EXISTS public.experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    category TEXT,
    experience_type TEXT,
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    gallery TEXT[],
    duration TEXT,
    difficulty TEXT,
    price_range TEXT,
    best_season TEXT,
    included TEXT[],
    requirements TEXT[],
    highlights TEXT[],
    rating NUMERIC(3,2) DEFAULT 0.00,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: tour_packages (Paquetes y excursiones agrupadas)
CREATE TABLE IF NOT EXISTS public.tour_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    gallery TEXT[],
    duration TEXT,
    difficulty TEXT,
    price_from NUMERIC(10, 2),
    price_range TEXT,
    max_group_size INTEGER,
    min_age INTEGER,
    included TEXT[],
    not_included TEXT[],
    highlights TEXT[],
    requirements TEXT[],
    languages TEXT[],
    departure_point TEXT,
    best_season TEXT,
    category TEXT,
    rating NUMERIC(3,2) DEFAULT 0.00,
    is_featured BOOLEAN DEFAULT false,
    is_sponsored BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: events (Eventos de agenda)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    event_type TEXT,
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    gallery TEXT[],
    start_date DATE,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    venue TEXT,
    address TEXT,
    price_range TEXT,
    ticket_url TEXT,
    organizer TEXT,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 6. INFRAESTRUCTURA Y SERVICIOS LOCALES ───────────────────────────────

-- Tabla: clinics (Hospitales y clínicas para turismo médico)
CREATE TABLE IF NOT EXISTS public.clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    clinic_type TEXT,
    specialties TEXT[],
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    gallery TEXT[],
    address TEXT,
    phone TEXT,
    emergency_phone TEXT,
    email TEXT,
    website TEXT,
    opening_hours TEXT,
    services TEXT[],
    certifications TEXT[],
    insurance_accepted TEXT[],
    languages TEXT[],
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    rating NUMERIC(3,2) DEFAULT 0.00,
    is_24_hours BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: ports_marinas (Puertos de crucero y marinas)
CREATE TABLE IF NOT EXISTS public.ports_marinas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    port_type TEXT,
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    gallery TEXT[],
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    cruise_lines TEXT[],
    facilities TEXT[],
    services TEXT[],
    capacity INTEGER,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    rating NUMERIC(3,2) DEFAULT 0.00,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: stadiums (Estadios deportivos)
CREATE TABLE IF NOT EXISTS public.stadiums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    stadium_type TEXT,
    sport_types TEXT[],
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    gallery TEXT[],
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    capacity INTEGER,
    home_teams TEXT[],
    facilities TEXT[],
    services TEXT[],
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    rating NUMERIC(3,2) DEFAULT 0.00,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: theme_parks (Parques de atracciones)
CREATE TABLE IF NOT EXISTS public.theme_parks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    park_type TEXT,
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    gallery TEXT[],
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    price_adult NUMERIC(10, 2),
    price_child NUMERIC(10, 2),
    price_range TEXT,
    opening_hours TEXT,
    attractions TEXT[],
    services TEXT[],
    includes TEXT[],
    age_restrictions TEXT,
    duration_recommended TEXT,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    rating NUMERIC(3,2) DEFAULT 0.00,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: caves (Cuevas y atractivos naturales)
CREATE TABLE IF NOT EXISTS public.caves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    cave_type TEXT,
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    gallery TEXT[],
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    difficulty TEXT,
    tour_duration TEXT,
    opening_hours TEXT,
    highlights TEXT[],
    flora_fauna TEXT[],
    historical_info TEXT,
    price_adult NUMERIC(10, 2),
    price_child NUMERIC(10, 2),
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    rating NUMERIC(3,2) DEFAULT 0.00,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: rivers (Ríos y cascadas)
CREATE TABLE IF NOT EXISTS public.rivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    gallery TEXT[],
    address TEXT,
    difficulty TEXT,
    activities TEXT[],
    best_season TEXT,
    duration TEXT,
    price_range TEXT,
    safety_tips TEXT[],
    adrenaline_level INTEGER,
    certified_guides BOOLEAN DEFAULT false,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    rating NUMERIC(3,2) DEFAULT 0.00,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: coffee_experiences (Tours de café e historia del café)
CREATE TABLE IF NOT EXISTS public.coffee_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    experience_type TEXT,
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    gallery TEXT[],
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    coffee_varieties TEXT[],
    altitude TEXT,
    tour_duration TEXT,
    price_range TEXT,
    includes TEXT[],
    production_process TEXT,
    tasting_notes TEXT[],
    opening_hours TEXT,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    rating NUMERIC(3,2) DEFAULT 0.00,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 7. HISTORIA Y PATRIMONIO ──────────────────────────────────────────────

-- Tabla: historical_figures (Personajes históricos dominicanos)
CREATE TABLE IF NOT EXISTS public.historical_figures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    title TEXT,
    birth_date DATE,
    death_date DATE,
    birth_place TEXT,
    era TEXT,
    category TEXT,
    short_description TEXT,
    description TEXT,
    biography TEXT,
    achievements TEXT[],
    quotes TEXT[],
    image_url TEXT,
    gallery TEXT[],
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: historical_events (Eventos e hitos de la historia dominicana)
CREATE TABLE IF NOT EXISTS public.historical_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    event_date DATE,
    end_date DATE,
    year INTEGER,
    era TEXT,
    category TEXT,
    location TEXT,
    short_description TEXT,
    description TEXT,
    significance TEXT,
    key_figures TEXT[],
    consequences TEXT[],
    image_url TEXT,
    gallery TEXT[],
    sources TEXT[],
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 8. GAMIFICACIÓN Y LOGROS ──────────────────────────────────────────────

-- Tabla: gamification_levels (Niveles del club de recompensas)
CREATE TABLE IF NOT EXISTS public.gamification_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_number INTEGER NOT NULL UNIQUE,
    title TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    xp_required INTEGER NOT NULL,
    marketplace_discount NUMERIC(4, 2) DEFAULT 0.00,
    perks TEXT[] DEFAULT '{}'::text[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: user_gamification (Rendimiento y saldo de gamificación del viajero)
CREATE TABLE IF NOT EXISTS public.user_gamification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    total_xp INTEGER DEFAULT 0 NOT NULL,
    current_level INTEGER DEFAULT 1 NOT NULL,
    coins INTEGER DEFAULT 0 NOT NULL,
    streak_days INTEGER DEFAULT 0 NOT NULL,
    last_activity_date DATE,
    total_missions_completed INTEGER DEFAULT 0 NOT NULL,
    total_referrals INTEGER DEFAULT 0 NOT NULL,
    referral_code TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: achievements (Logros / Medallas disponibles)
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    short_description TEXT,
    icon TEXT,
    badge_color TEXT,
    category TEXT NOT NULL,
    achievement_type TEXT NOT NULL,
    xp_reward INTEGER DEFAULT 0,
    coin_reward INTEGER DEFAULT 0,
    min_level INTEGER DEFAULT 1,
    unlock_condition TEXT,
    unlock_requirement JSONB,
    display_order INTEGER,
    total_unlocked INTEGER DEFAULT 0,
    is_hidden BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: user_achievements (Medallas unlocked por usuario)
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, achievement_id)
);

-- Tabla: gamification_transactions (Log de transacciones de monedas y XP)
CREATE TABLE IF NOT EXISTS public.gamification_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earning', 'redemption', 'bonus')),
    xp_amount INTEGER DEFAULT 0,
    coin_amount INTEGER DEFAULT 0,
    description TEXT,
    source_type TEXT,
    source_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 9. NEGOCIO, RESERVAS Y SOLICITUDES B2B ────────────────────────────────

-- Tabla: reservations (Reservas de los viajeros)
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    check_in TIMESTAMP WITH TIME ZONE NOT NULL,
    check_out TIMESTAMP WITH TIME ZONE,
    total_price NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending'::text CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded', 'completed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: establishment_registrations (Solicitudes de registro de nuevos negocios)
CREATE TABLE IF NOT EXISTS public.establishment_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_establecimiento TEXT NOT NULL CHECK (tipo_establecimiento IN ('restaurante', 'bar', 'hotel', 'tour', 'spa', 'tienda')),
    nombre TEXT NOT NULL,
    responsable TEXT NOT NULL,
    email TEXT NOT NULL,
    telefono TEXT NOT NULL,
    direccion TEXT NOT NULL,
    provincia TEXT NOT NULL,
    website TEXT,
    foto_url TEXT,
    descripcion TEXT NOT NULL,
    rnc TEXT,
    horario TEXT,
    detalles JSONB,
    status TEXT DEFAULT 'pendiente'::text CHECK (status IN ('pendiente', 'aprobado', 'rechazado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: ad_banners (Gestión de publicidad y banners patrocinados)
CREATE TABLE IF NOT EXISTS public.ad_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT,
    image_url TEXT,
    video_url TEXT,
    alt_text TEXT,
    target_url TEXT,
    headline TEXT,
    subtext TEXT,
    cta_text TEXT,
    sponsor TEXT,
    banner_type TEXT NOT NULL,
    placement TEXT NOT NULL,
    section TEXT,
    page TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: job_vacancies (Bolsa de trabajo / Empleo turístico)
CREATE TABLE IF NOT EXISTS public.job_vacancies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    company_name TEXT NOT NULL,
    company_logo TEXT,
    company_description TEXT,
    description TEXT,
    short_description TEXT,
    location TEXT,
    address TEXT,
    province TEXT,
    salary_range TEXT,
    salary_min NUMERIC(10, 2),
    salary_max NUMERIC(10, 2),
    job_type TEXT,
    experience_level TEXT,
    education TEXT,
    category TEXT,
    department TEXT,
    languages TEXT[],
    responsibilities TEXT[],
    requirements TEXT[],
    benefits TEXT[],
    skills TEXT[],
    application_url TEXT,
    application_email TEXT,
    deadline DATE,
    is_urgent BOOLEAN DEFAULT false,
    is_remote BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 10. MARKETING, PUBLICIDAD, AFILIADOS Y CONFIGURACIÓN ────────────────────

-- Tabla: site_settings (Configuración general del portal)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: newsletter_subscribers (Suscriptores del boletín de noticias)
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    nombre TEXT,
    intereses TEXT[],
    frecuencia TEXT DEFAULT 'biweekly',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: marketing_leads (Leads y contactos de marketing)
CREATE TABLE IF NOT EXISTS public.marketing_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    telefono TEXT,
    empresa TEXT,
    mensaje TEXT,
    source TEXT,
    status TEXT DEFAULT 'nuevo'::text CHECK (status IN ('nuevo', 'contactado', 'calificado', 'perdido')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: offers (Ofertas y descuentos de marketing geolocalizados)
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    discount_code TEXT,
    discount_percentage NUMERIC,
    original_price NUMERIC NOT NULL,
    price NUMERIC NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    radius_meters INTEGER DEFAULT 500,
    is_flash BOOLEAN DEFAULT false,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: ambassadors (Afiliados / Embajadores oficiales)
CREATE TABLE IF NOT EXISTS public.ambassadors (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code TEXT UNIQUE NOT NULL,
    clicks_count INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    total_earned NUMERIC(10, 2) DEFAULT 0.00,
    pending_payout NUMERIC(10, 2) DEFAULT 0.00,
    tier TEXT DEFAULT 'Bronce',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: ambassador_referrals (Comisiones y conversiones de afiliados)
CREATE TABLE IF NOT EXISTS public.ambassador_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ambassador_id UUID REFERENCES public.ambassadors(id) ON DELETE CASCADE,
    referred_email TEXT,
    sale_amount NUMERIC(10, 2),
    commission_earned NUMERIC(10, 2),
    status TEXT DEFAULT 'pending'::text CHECK (status IN ('pending', 'approved', 'paid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: beaches (Playas dominicanas)
CREATE TABLE IF NOT EXISTS public.beaches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    province_id UUID REFERENCES public.provinces(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    beach_type TEXT,
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    gallery TEXT[],
    activities TEXT[],
    amenities TEXT[],
    water_color TEXT,
    sand_type TEXT,
    wave_intensity TEXT,
    crowd_level TEXT,
    access_type TEXT,
    parking_available BOOLEAN DEFAULT false,
    lifeguard_on_duty BOOLEAN DEFAULT false,
    how_to_get_there TEXT,
    best_time_to_visit TEXT,
    address TEXT,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    rating NUMERIC(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    is_popular BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: spas_wellness (Spas y centros de relajación)
CREATE TABLE IF NOT EXISTS public.spas_wellness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    spa_type TEXT,
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    gallery TEXT[],
    services TEXT[],
    treatments TEXT[],
    amenities TEXT[],
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    opening_hours TEXT,
    price_range TEXT,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    rating NUMERIC(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 11. RUTAS Y CIRCUITOS TURÍSTICOS ──────────────────────────────────────────

-- Tabla: routes (Circuitos turísticos sugeridos)
CREATE TABLE IF NOT EXISTS public.routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    duration_hours NUMERIC(4, 2),
    distance_km NUMERIC(6, 2),
    difficulty TEXT CHECK (difficulty IN ('facil', 'moderado', 'dificil')),
    gpx_track_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: route_stops (Paradas intermedias de las rutas)
CREATE TABLE IF NOT EXISTS public.route_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE,
    stop_order INTEGER NOT NULL,
    destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE,
    place_name TEXT NOT NULL,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    notes TEXT
);

-- Tabla: audio_guides (Librería de audioguías para monumentos)
CREATE TABLE IF NOT EXISTS public.audio_guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    audio_url TEXT NOT NULL,
    language TEXT DEFAULT 'es',
    associated_entity_type TEXT NOT NULL,
    associated_entity_id UUID NOT NULL,
    duration_seconds INTEGER
);

-- Tabla: ugc_reports (Denuncias de contenido y reviews falsas)
CREATE TABLE IF NOT EXISTS public.ugc_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    target_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pendiente'::text CHECK (status IN ('pendiente', 'revisado', 'ignorado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: event_tickets (Pases y entradas digitales)
CREATE TABLE IF NOT EXISTS public.event_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE,
    ticket_code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'unused'::text CHECK (status IN ('unused', 'scanned', 'cancelled')),
    scanned_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: reward_inventory (Premios y merchandising del club)
CREATE TABLE IF NOT EXISTS public.reward_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    coins_cost INTEGER NOT NULL,
    stock INTEGER DEFAULT 0,
    is_physical BOOLEAN DEFAULT false,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: reward_shipments (Logística de entrega de regalos físicos)
CREATE TABLE IF NOT EXISTS public.reward_shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reward_id UUID REFERENCES public.reward_inventory(id) ON DELETE SET NULL,
    recipient_name TEXT NOT NULL,
    recipient_phone TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    courier_name TEXT,
    tracking_number TEXT,
    status TEXT DEFAULT 'pending'::text CHECK (status IN ('pending', 'shipped', 'delivered', 'cancelled')),
    shipped_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: survey_templates (Configuración de encuestas de satisfacción)
CREATE TABLE IF NOT EXISTS public.survey_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    questions JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- Tabla: survey_responses (Respuestas de viajeros)
CREATE TABLE IF NOT EXISTS public.survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES public.survey_templates(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
    nps_score INTEGER CHECK (nps_score BETWEEN 0 AND 10),
    answers JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: admin_activity_logs (Historial de auditoría administrativa)
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    entity_id UUID,
    ip_address TEXT,
    user_agent TEXT,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: seo_redirections (Gestor de redirecciones 301/302)
CREATE TABLE IF NOT EXISTS public.seo_redirections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_path TEXT UNIQUE NOT NULL,
    target_path TEXT NOT NULL,
    redirect_type INTEGER DEFAULT 301 CHECK (redirect_type IN (301, 302)),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: system_webhooks (Integraciones con herramientas externas)
CREATE TABLE IF NOT EXISTS public.system_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    event_type TEXT NOT NULL,
    secret_token TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 12. MODERACIÓN UGC DE MEDIA Y CONTROL DE SUSPENSIONES (FASE 2) ─────────

CREATE TABLE IF NOT EXISTS public.ugc_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    media_url TEXT NOT NULL,
    media_type TEXT CHECK (media_type IN ('photo', 'video')),
    associated_entity_type TEXT NOT NULL,
    associated_entity_id UUID NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_suspensions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    suspended_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 13. ATENCIÓN AL CLIENTE Y SISTEMA DE TICKETS (FASE 2) ───────────────────

CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    is_admin_reply BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 14. AUTOMATIZACIÓN DE MARKETING Y CRM (FASE 2) ──────────────────────────

CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_template TEXT NOT NULL,
    segment_interests TEXT[],
    sent_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
    scheduled_for TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 15. CONTABILIDAD DE FIDELIZACIÓN Y RECOMPENSAS (FASE 2) ─────────────────

CREATE TABLE IF NOT EXISTS public.points_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type TEXT CHECK (transaction_type IN ('earn_coins', 'spend_coins', 'earn_xp')),
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    reference_entity_type TEXT,
    reference_entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 16. PEDIDOS, FACTURACIÓN E HISTORIAL DE VENTAS B2B/B2C (FASE 2) ─────────

CREATE TABLE IF NOT EXISTS public.marketplace_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded')),
    payment_method TEXT,
    payment_intent_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.marketplace_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.marketplace_orders(id) ON DELETE CASCADE,
    item_type TEXT CHECK (item_type IN ('experience', 'tour_package', 'ticket')),
    item_id UUID NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_unit NUMERIC(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.vendor_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
    payout_method TEXT,
    payout_reference TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.discount_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_percentage NUMERIC(5, 2),
    discount_amount NUMERIC(10, 2),
    expires_at TIMESTAMP WITH TIME ZONE,
    max_uses INTEGER,
    uses_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 17. ALERTAS DE CLIMA/SARGAZO Y CONTACTOS DE EMERGENCIA (FASE 2) ─────────

CREATE TABLE IF NOT EXISTS public.weather_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    province_id UUID REFERENCES public.provinces(id) ON DELETE SET NULL,
    alert_type TEXT CHECK (alert_type IN ('sargazo', 'clima_adverso', 'oleaje_alto', 'huracan', 'otro')),
    severity TEXT CHECK (severity IN ('informativa', 'moderada', 'grave', 'extrema')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    province_id UUID REFERENCES public.provinces(id) ON DELETE SET NULL,
    institution TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    address TEXT,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 18. TAREAS PROGRAMADAS Y SEGURIDAD DE RED (FASE 2) ──────────────────────

CREATE TABLE IF NOT EXISTS public.system_cron_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name TEXT UNIQUE NOT NULL,
    schedule_cron TEXT NOT NULL,
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    status TEXT CHECK (status IN ('idle', 'running', 'success', 'failed')),
    error_log TEXT
);

CREATE TABLE IF NOT EXISTS public.ip_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT UNIQUE NOT NULL,
    rule_type TEXT CHECK (rule_type IN ('blacklist', 'whitelist')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── 19. TRADUCCIONES POLIMÓRFICAS PARA SOPORTE MULTILINGÜE ────────────────
CREATE TABLE IF NOT EXISTS public.entity_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    language TEXT NOT NULL,
    field_name TEXT NOT NULL,
    translation_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (entity_type, entity_id, language, field_name)
);

-- ─── 20. LOTERÍAS RELACIONALES, TASAS DE CAMBIO Y PRECIOS DE COMBUSTIBLES ────
CREATE TABLE IF NOT EXISTS public.lotteries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'República Dominicana',
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.lottery_draws (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lottery_id UUID REFERENCES public.lotteries(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    draw_days TEXT[] NOT NULL,
    draw_time TIME NOT NULL,
    ball_range_min INT DEFAULT 1,
    ball_range_max INT DEFAULT 100,
    number_of_balls INT DEFAULT 3,
    tombolas_count INT DEFAULT 3,
    has_bonus BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.lottery_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_id UUID REFERENCES public.lottery_draws(id) ON DELETE CASCADE,
    draw_date DATE NOT NULL,
    winning_numbers INTEGER[] NOT NULL,
    bonus_number INTEGER,
    jackpot_amount TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (draw_id, draw_date)
);

CREATE TABLE IF NOT EXISTS public.exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rate_date DATE NOT NULL,
    currency_code TEXT NOT NULL CHECK (currency_code IN ('USD', 'EUR', 'GBP', 'CAD', 'MXN')),
    buy_rate NUMERIC(10, 4) NOT NULL,
    sell_rate NUMERIC(10, 4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (rate_date, currency_code)
);

CREATE TABLE IF NOT EXISTS public.fuel_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    effective_date DATE NOT NULL UNIQUE,
    gasolina_premium NUMERIC(10, 2) NOT NULL,
    gasolina_regular NUMERIC(10, 2) NOT NULL,
    gasoil_optimo NUMERIC(10, 2) NOT NULL,
    gasoil_regular NUMERIC(10, 2) NOT NULL,
    glp NUMERIC(10, 2) NOT NULL,
    gnv NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);





