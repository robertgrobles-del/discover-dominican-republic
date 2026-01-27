
-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create provinces table
CREATE TABLE public.provinces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    region TEXT,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create destinations table
CREATE TABLE public.destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    province_id UUID REFERENCES public.provinces(id),
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    gallery TEXT[],
    highlights TEXT[],
    typical_dishes TEXT[],
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    weather_info TEXT,
    best_time_to_visit TEXT,
    how_to_get_there TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hotels table
CREATE TABLE public.hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    destination_id UUID REFERENCES public.destinations(id),
    category TEXT,
    stars INTEGER CHECK (stars >= 1 AND stars <= 5),
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
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    rating DECIMAL(2, 1),
    review_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create restaurants table
CREATE TABLE public.restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    destination_id UUID REFERENCES public.destinations(id),
    category TEXT,
    cuisine_type TEXT,
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
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    rating DECIMAL(2, 1),
    review_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bars table
CREATE TABLE public.bars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    destination_id UUID REFERENCES public.destinations(id),
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
    minimum_age INTEGER,
    services TEXT[],
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    rating DECIMAL(2, 1),
    review_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tour_guides table
CREATE TABLE public.tour_guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    destination_id UUID REFERENCES public.destinations(id),
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
    rating DECIMAL(2, 1),
    review_count INTEGER DEFAULT 0,
    is_certified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create travel_agencies table
CREATE TABLE public.travel_agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    destination_id UUID REFERENCES public.destinations(id),
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
    rating DECIMAL(2, 1),
    review_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tour_operators table
CREATE TABLE public.tour_operators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    destination_id UUID REFERENCES public.destinations(id),
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
    rating DECIMAL(2, 1),
    review_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create experiences table
CREATE TABLE public.experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    destination_id UUID REFERENCES public.destinations(id),
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
    rating DECIMAL(2, 1),
    review_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    destination_id UUID REFERENCES public.destinations(id),
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
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clinics table
CREATE TABLE public.clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    destination_id UUID REFERENCES public.destinations(id),
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
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    rating DECIMAL(2, 1),
    review_count INTEGER DEFAULT 0,
    is_24_hours BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ports_marinas table
CREATE TABLE public.ports_marinas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    destination_id UUID REFERENCES public.destinations(id),
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
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    rating DECIMAL(2, 1),
    review_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stadiums table
CREATE TABLE public.stadiums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    destination_id UUID REFERENCES public.destinations(id),
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
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    rating DECIMAL(2, 1),
    review_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ports_marinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stadiums ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles (only admins can manage)
CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Public read policies for all content tables
CREATE POLICY "Public can view active provinces" ON public.provinces FOR SELECT USING (true);
CREATE POLICY "Public can view active destinations" ON public.destinations FOR SELECT USING (true);
CREATE POLICY "Public can view active hotels" ON public.hotels FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active restaurants" ON public.restaurants FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active bars" ON public.bars FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active tour_guides" ON public.tour_guides FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active travel_agencies" ON public.travel_agencies FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active tour_operators" ON public.tour_operators FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active experiences" ON public.experiences FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active events" ON public.events FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active clinics" ON public.clinics FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active ports_marinas" ON public.ports_marinas FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active stadiums" ON public.stadiums FOR SELECT USING (is_active = true);

-- Admin write policies for all content tables
CREATE POLICY "Admins can manage provinces" ON public.provinces FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage destinations" ON public.destinations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage hotels" ON public.hotels FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage restaurants" ON public.restaurants FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage bars" ON public.bars FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage tour_guides" ON public.tour_guides FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage travel_agencies" ON public.travel_agencies FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage tour_operators" ON public.tour_operators FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage experiences" ON public.experiences FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage events" ON public.events FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage clinics" ON public.clinics FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage ports_marinas" ON public.ports_marinas FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage stadiums" ON public.stadiums FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create updated_at triggers
CREATE TRIGGER update_provinces_updated_at BEFORE UPDATE ON public.provinces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON public.destinations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON public.hotels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON public.restaurants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bars_updated_at BEFORE UPDATE ON public.bars FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tour_guides_updated_at BEFORE UPDATE ON public.tour_guides FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_travel_agencies_updated_at BEFORE UPDATE ON public.travel_agencies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tour_operators_updated_at BEFORE UPDATE ON public.tour_operators FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_experiences_updated_at BEFORE UPDATE ON public.experiences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON public.clinics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ports_marinas_updated_at BEFORE UPDATE ON public.ports_marinas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_stadiums_updated_at BEFORE UPDATE ON public.stadiums FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
