
-- Create tour_packages table for curated travel packages
CREATE TABLE public.tour_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  category TEXT DEFAULT 'adventure',
  duration TEXT,
  difficulty TEXT DEFAULT 'moderado',
  description TEXT,
  short_description TEXT,
  image_url TEXT,
  gallery TEXT[],
  destinations TEXT[],
  highlights TEXT[],
  included TEXT[],
  not_included TEXT[],
  itinerary JSONB DEFAULT '[]'::jsonb,
  price_from NUMERIC,
  price_currency TEXT DEFAULT 'USD',
  max_group_size INTEGER DEFAULT 12,
  min_age INTEGER,
  languages TEXT[],
  meeting_point TEXT,
  start_times TEXT[],
  rating NUMERIC,
  review_count INTEGER DEFAULT 0,
  destination_id UUID REFERENCES public.destinations(id),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_sponsored BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tour_packages ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can view active tour_packages" ON public.tour_packages FOR SELECT USING (is_active = true);

-- Admin management
CREATE POLICY "Admins can manage tour_packages" ON public.tour_packages FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Updated_at trigger
CREATE TRIGGER set_tour_packages_updated_at BEFORE UPDATE ON public.tour_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed data
INSERT INTO public.tour_packages (name, slug, category, duration, difficulty, short_description, description, price_from, max_group_size, languages, highlights, included, not_included, is_featured, itinerary, image_url) VALUES
('Aventura en Samaná: Ballenas y Cascadas', 'aventura-samana-ballenas', 'adventure', '3 días / 2 noches', 'moderado',
 'Vive la experiencia única de avistar ballenas jorobadas y explora las cascadas más impresionantes del Caribe.',
 'Un paquete completo que combina el avistamiento de ballenas jorobadas en la Bahía de Samaná con la exploración del Salto El Limón y las playas vírgenes de Las Galeras. Incluye alojamiento en eco-lodge, guías bilingües certificados y transporte privado.',
 299, 8, ARRAY['Español','Inglés','Francés'],
 ARRAY['Avistamiento de ballenas jorobadas','Cascada El Limón a caballo','Playa Rincón en lancha','Cena de mariscos en Las Galeras'],
 ARRAY['Alojamiento 2 noches','Desayunos y cenas','Transporte privado desde Santo Domingo','Guía bilingüe certificado','Equipo de snorkel','Seguro de viaje'],
 ARRAY['Vuelos internacionales','Almuerzos','Propinas','Gastos personales'],
 true,
 '[{"day":1,"title":"Llegada y Playa Rincón","activities":["Traslado desde Santo Domingo","Almuerzo en Las Galeras","Tarde libre en Playa Rincón","Cena de bienvenida"]},{"day":2,"title":"Ballenas y Cascada","activities":["Avistamiento de ballenas (6:30 AM)","Almuerzo en Samaná pueblo","Cabalgata a Cascada El Limón","Cena y fogata en la playa"]},{"day":3,"title":"Snorkel y Regreso","activities":["Snorkel en Cayo Levantado","Almuerzo libre","Regreso a Santo Domingo"]}]'::jsonb,
 null),

('Ruta Colonial y Gastronómica', 'ruta-colonial-gastronomica', 'cultural', '2 días / 1 noche', 'fácil',
 'Descubre 500 años de historia en la Zona Colonial mientras disfrutas de la mejor gastronomía dominicana.',
 'Recorre las calles empedradas de la primera ciudad del Nuevo Mundo con un historiador local. Visita la Catedral Primada, el Alcázar de Colón y la Fortaleza Ozama mientras pruebas platos tradicionales en restaurantes galardonados.',
 189, 12, ARRAY['Español','Inglés'],
 ARRAY['Tour privado Zona Colonial','Clase de cocina dominicana','Degustación de rones premium','Cena en restaurante con estrella Michelin'],
 ARRAY['Alojamiento boutique en Zona Colonial','Desayuno gourmet','Guía historiador','Clase de cocina','Degustación de ron','Cena gourmet'],
 ARRAY['Vuelos','Almuerzos','Propinas'],
 true,
 '[{"day":1,"title":"Historia y Sabores","activities":["Check-in hotel boutique","Tour guiado Zona Colonial (3h)","Almuerzo en Pat''e Palo","Clase de cocina dominicana","Degustación de rones en Brugal Center","Cena gourmet"]},{"day":2,"title":"Mercados y Despedida","activities":["Desayuno en el hotel","Visita Mercado Modelo","Compras de souvenirs artesanales","Check-out y traslado"]}]'::jsonb,
 null),

('Expedición Montañas del Cibao', 'expedicion-montanas-cibao', 'adventure', '4 días / 3 noches', 'difícil',
 'Conquista el Pico Duarte, el techo del Caribe, y explora los valles esmeralda de Jarabacoa y Constanza.',
 'La aventura definitiva para amantes del senderismo. Escala el Pico Duarte (3,098m), haz rafting en el Río Yaque del Norte y descubre los campos de fresas y flores de Constanza. Una experiencia que combina adrenalina con paisajes que parecen de otro mundo.',
 449, 6, ARRAY['Español','Inglés'],
 ARRAY['Cumbre del Pico Duarte','Rafting Río Yaque del Norte','Campos de fresas de Constanza','Aguas termales naturales'],
 ARRAY['Alojamiento 3 noches','Todas las comidas en ruta','Guía de montaña certificado','Mulas de carga','Equipo de camping','Transporte 4x4','Seguro de montaña'],
 ARRAY['Vuelos','Equipo personal de senderismo','Propinas','Bebidas alcohólicas'],
 true,
 '[{"day":1,"title":"Jarabacoa - Base Camp","activities":["Llegada a Jarabacoa","Rafting Río Yaque del Norte","Preparación de equipo","Cena y briefing"]},{"day":2,"title":"Ascenso Pico Duarte","activities":["Inicio caminata (5:00 AM)","Almuerzo en ruta","Campamento base La Compartición","Noche estrellada a 2,800m"]},{"day":3,"title":"Cumbre y Descenso","activities":["Cumbre al amanecer (3,098m)","Descenso","Traslado a Constanza","Aguas termales"]},{"day":4,"title":"Constanza y Regreso","activities":["Tour campos de fresas","Valle Nuevo","Almuerzo típico","Regreso"]}]'::jsonb,
 null),

('Relax Total: Playas y Spa', 'relax-playas-spa', 'wellness', '5 días / 4 noches', 'fácil',
 'El escape perfecto: playas paradisíacas, tratamientos de spa y gastronomía gourmet en Punta Cana.',
 'Déjate consentir en uno de los mejores resorts del Caribe. Disfruta de playas de arena blanca, tratamientos de spa con productos locales, yoga al amanecer y cenas románticas frente al mar.',
 699, 2, ARRAY['Español','Inglés','Francés','Alemán'],
 ARRAY['Suite frente al mar','Spa ilimitado','Yoga al amanecer','Cena privada en la playa'],
 ARRAY['Alojamiento all-inclusive','Todos los tratamientos de spa','Clases de yoga diarias','Cena romántica en la playa','Excursión a Isla Saona','Traslados aeropuerto'],
 ARRAY['Vuelos internacionales','Propinas','Compras personales'],
 false,
 '[]'::jsonb,
 null);
