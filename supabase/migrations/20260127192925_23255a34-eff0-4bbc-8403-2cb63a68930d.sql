-- Create rivers table
CREATE TABLE public.rivers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT,
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    gallery TEXT[],
    address TEXT,
    destination_id UUID REFERENCES public.destinations(id),
    latitude NUMERIC,
    longitude NUMERIC,
    difficulty TEXT, -- 'Fácil', 'Moderado', 'Difícil', 'Extremo'
    adrenaline_level INTEGER CHECK (adrenaline_level >= 1 AND adrenaline_level <= 5),
    activities TEXT[],
    best_season TEXT,
    duration TEXT,
    price_range TEXT,
    safety_tips TEXT[],
    certified_guides BOOLEAN DEFAULT false,
    rating NUMERIC,
    review_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create caves table
CREATE TABLE public.caves (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT,
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    gallery TEXT[],
    address TEXT,
    destination_id UUID REFERENCES public.destinations(id),
    latitude NUMERIC,
    longitude NUMERIC,
    cave_type TEXT, -- 'Sumergida', 'Seca', 'Mixta'
    difficulty TEXT,
    tour_duration TEXT,
    price_adult NUMERIC,
    price_child NUMERIC,
    opening_hours TEXT,
    highlights TEXT[],
    flora_fauna TEXT[],
    historical_info TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    rating NUMERIC,
    review_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create artisanal workshops table
CREATE TABLE public.artisanal_workshops (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT,
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    gallery TEXT[],
    address TEXT,
    destination_id UUID REFERENCES public.destinations(id),
    latitude NUMERIC,
    longitude NUMERIC,
    workshop_type TEXT, -- 'Larimar', 'Ámbar', 'Cerámica Taína', 'Tejidos', 'Madera'
    craft_types TEXT[],
    duration TEXT,
    price_range TEXT,
    includes TEXT[],
    skill_level TEXT, -- 'Principiante', 'Intermedio', 'Avanzado'
    max_participants INTEGER,
    languages TEXT[],
    phone TEXT,
    email TEXT,
    website TEXT,
    opening_hours TEXT,
    rating NUMERIC,
    review_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coffee shops/routes table
CREATE TABLE public.coffee_experiences (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT,
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    gallery TEXT[],
    address TEXT,
    destination_id UUID REFERENCES public.destinations(id),
    latitude NUMERIC,
    longitude NUMERIC,
    experience_type TEXT, -- 'Finca', 'Tour', 'Café', 'Museo'
    coffee_varieties TEXT[],
    altitude TEXT,
    tour_duration TEXT,
    price_range TEXT,
    includes TEXT[],
    tasting_notes TEXT,
    production_process TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    opening_hours TEXT,
    rating NUMERIC,
    review_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.rivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artisanal_workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coffee_experiences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for rivers
CREATE POLICY "Public can view active rivers" ON public.rivers FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage rivers" ON public.rivers FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policies for caves
CREATE POLICY "Public can view active caves" ON public.caves FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage caves" ON public.caves FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policies for artisanal_workshops
CREATE POLICY "Public can view active artisanal_workshops" ON public.artisanal_workshops FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage artisanal_workshops" ON public.artisanal_workshops FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policies for coffee_experiences
CREATE POLICY "Public can view active coffee_experiences" ON public.coffee_experiences FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage coffee_experiences" ON public.coffee_experiences FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_rivers_updated_at BEFORE UPDATE ON public.rivers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_caves_updated_at BEFORE UPDATE ON public.caves FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_artisanal_workshops_updated_at BEFORE UPDATE ON public.artisanal_workshops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_coffee_experiences_updated_at BEFORE UPDATE ON public.coffee_experiences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();