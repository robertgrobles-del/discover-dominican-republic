
-- Crear tabla de playas
CREATE TABLE public.beaches (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  destination_id uuid REFERENCES public.destinations(id),
  province_id uuid REFERENCES public.provinces(id),
  name text NOT NULL,
  slug text,
  beach_type text, -- 'arena-blanca', 'arena-dorada', 'virgen', 'bahia', 'deportiva', 'urbana'
  description text,
  short_description text,
  image_url text,
  gallery text[],
  activities text[],
  amenities text[],
  water_color text,
  sand_type text,
  wave_intensity text, -- 'calma', 'moderada', 'fuerte'
  crowd_level text, -- 'baja', 'media', 'alta'
  access_type text, -- 'publico', 'semi-privado', 'privado'
  parking_available boolean DEFAULT false,
  lifeguard_on_duty boolean DEFAULT false,
  how_to_get_there text,
  best_time_to_visit text,
  address text,
  latitude numeric,
  longitude numeric,
  rating numeric,
  review_count integer DEFAULT 0,
  is_popular boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.beaches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active beaches"
  ON public.beaches FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage beaches"
  ON public.beaches FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger updated_at
CREATE TRIGGER update_beaches_updated_at
  BEFORE UPDATE ON public.beaches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Crear tabla de spas/wellness
CREATE TABLE public.spas_wellness (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  destination_id uuid REFERENCES public.destinations(id),
  name text NOT NULL,
  slug text,
  spa_type text, -- 'spa', 'wellness-retreat', 'holistic-center', 'yoga-retreat'
  description text,
  short_description text,
  image_url text,
  gallery text[],
  services text[],
  treatments text[],
  amenities text[],
  address text,
  phone text,
  email text,
  website text,
  opening_hours text,
  price_range text,
  latitude numeric,
  longitude numeric,
  rating numeric,
  review_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.spas_wellness ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active spas"
  ON public.spas_wellness FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage spas"
  ON public.spas_wellness FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger updated_at
CREATE TRIGGER update_spas_wellness_updated_at
  BEFORE UPDATE ON public.spas_wellness
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar realtime para ambas tablas
ALTER PUBLICATION supabase_realtime ADD TABLE public.beaches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.spas_wellness;
