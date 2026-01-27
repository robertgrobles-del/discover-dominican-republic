
-- Create theme_parks table
CREATE TABLE public.theme_parks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    destination_id UUID REFERENCES public.destinations(id),
    park_type TEXT, -- parque acuático, parque temático, parque de aventuras, zoológico
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    gallery TEXT[],
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    price_adult DECIMAL(10, 2),
    price_child DECIMAL(10, 2),
    price_range TEXT,
    opening_hours TEXT,
    attractions TEXT[],
    services TEXT[],
    includes TEXT[],
    age_restrictions TEXT,
    duration_recommended TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    rating DECIMAL(2, 1),
    review_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.theme_parks ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY "Public can view active theme_parks" ON public.theme_parks 
    FOR SELECT USING (is_active = true);

-- Admin write policy
CREATE POLICY "Admins can manage theme_parks" ON public.theme_parks 
    FOR ALL TO authenticated 
    USING (public.has_role(auth.uid(), 'admin')) 
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger
CREATE TRIGGER update_theme_parks_updated_at 
    BEFORE UPDATE ON public.theme_parks 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();
