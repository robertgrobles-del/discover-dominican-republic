-- Migration: Add New Tables for Specialized Pages Admin Dashboard

-- 1. Add columns to tour_guides for eco-guides management
ALTER TABLE public.tour_guides ADD COLUMN IF NOT EXISTS is_eco_guide BOOLEAN DEFAULT false;
ALTER TABLE public.tour_guides ADD COLUMN IF NOT EXISTS eco_license TEXT;

-- 2. CREATE TABLE public.protected_areas
CREATE TABLE IF NOT EXISTS public.protected_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('Parque Nacional', 'Santuario', 'Reserva Científica')),
    location TEXT NOT NULL,
    size TEXT NOT NULL,
    fee TEXT NOT NULL,
    hours TEXT NOT NULL,
    attractions TEXT[] NOT NULL,
    rules TEXT[] NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CREATE TABLE public.bird_species
CREATE TABLE IF NOT EXISTS public.bird_species (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    scientific_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Endémica', 'Residente', 'Migratoria')),
    conservation TEXT NOT NULL CHECK (conservation IN ('Preocupación Menor', 'Vulnerable', 'En Peligro Crítico')),
    description TEXT NOT NULL,
    best_locations TEXT[] NOT NULL,
    avatar TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CREATE TABLE public.hot_springs
CREATE TABLE IF NOT EXISTS public.hot_springs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    province TEXT NOT NULL,
    temp_celsius NUMERIC(4,1) NOT NULL,
    properties TEXT[] NOT NULL,
    description TEXT NOT NULL,
    access TEXT NOT NULL CHECK (access IN ('Fácil', 'Moderado', 'Aventura (Difícil)')),
    price TEXT NOT NULL,
    avatar TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. CREATE TABLE public.offset_projects
CREATE TABLE IF NOT EXISTS public.offset_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    cost_info TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. CREATE TABLE public.toll_routes
CREATE TABLE IF NOT EXISTS public.toll_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    tolls_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. CREATE TABLE public.marine_reports
CREATE TABLE IF NOT EXISTS public.marine_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location TEXT NOT NULL,
    wind_speed NUMERIC(4,1) NOT NULL,
    wind_direction TEXT NOT NULL,
    wave_height NUMERIC(3,1) NOT NULL,
    wave_period INTEGER NOT NULL,
    water_temp NUMERIC(3,1) NOT NULL,
    condition_rating TEXT NOT NULL CHECK (condition_rating IN ('Excelente', 'Buena', 'Regular', 'Mala')),
    recommendation TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. ENABLE ROW LEVEL SECURITY (RLS) FOR ALL NEW TABLES
ALTER TABLE public.protected_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bird_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hot_springs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offset_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toll_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marine_reports ENABLE ROW LEVEL SECURITY;

-- 9. CREATE SELECT/ALL ACCESS POLICIES
CREATE POLICY "Allow public read of protected_areas" ON public.protected_areas FOR SELECT USING (true);
CREATE POLICY "Allow public read of bird_species" ON public.bird_species FOR SELECT USING (true);
CREATE POLICY "Allow public read of hot_springs" ON public.hot_springs FOR SELECT USING (true);
CREATE POLICY "Allow public read of offset_projects" ON public.offset_projects FOR SELECT USING (true);
CREATE POLICY "Allow public read of toll_routes" ON public.toll_routes FOR SELECT USING (true);
CREATE POLICY "Allow public read of marine_reports" ON public.marine_reports FOR SELECT USING (true);

CREATE POLICY "Allow admin manage of protected_areas" ON public.protected_areas FOR ALL USING (true);
CREATE POLICY "Allow admin manage of bird_species" ON public.bird_species FOR ALL USING (true);
CREATE POLICY "Allow admin manage of hot_springs" ON public.hot_springs FOR ALL USING (true);
CREATE POLICY "Allow admin manage of offset_projects" ON public.offset_projects FOR ALL USING (true);
CREATE POLICY "Allow admin manage of toll_routes" ON public.toll_routes FOR ALL USING (true);
CREATE POLICY "Allow admin manage of marine_reports" ON public.marine_reports FOR ALL USING (true);

-- 10. SEED DEFAULT DATA TO SYNC WITH WEBSITES
INSERT INTO public.protected_areas (name, slug, category, location, size, fee, hours, attractions, rules, description) VALUES
('Parque Nacional Los Haitises', 'los-haitises', 'Parque Nacional', 'Samaná / Hato Mayor', '601 km²', 'RD$ 150 (Nacionales) / RD$ 250 (Extranjeros)', '8:00 AM - 5:00 PM', ARRAY['Cayos de piedra caliza', 'Cueva de la Arena', 'Manglares vírgenes'], ARRAY['Solo barcos con licencia autorizada', 'Prohibido arrojar basura', 'Uso obligatorio de chalecos salvavidas'], 'Una de las joyas ecológicas de RD. Famoso por sus mogotes, densos bosques de manglares y cuevas que conservan pictografías taínas.'),
('Santuario de Mamíferos Marinos', 'santuario-mamiferos', 'Santuario', 'Bahía de Samaná / Banco de la Plata', '3,500 km²', 'RD$ 150 por persona', 'Variado (Especialmente en época de ballenas)', ARRAY['Avistamiento de Ballenas Jorobadas', 'Cayo Levantado'], ARRAY['Distancia mínima de barcos a ballenas: 80m', 'Tiempo límite de observación: 30 mins'], 'Establecido para proteger a las miles de ballenas jorobadas que migran cada invierno desde el Atlántico Norte para dar a luz y aparearse.'),
('Reserva Científica Ébano Verde', 'ebano-verde', 'Reserva Científica', 'Constanza / Cordillera Central', '23 km²', 'RD$ 100 por persona', '8:30 AM - 4:30 PM', ARRAY['Sendero Baño de Nubes', 'Arroyo El Arroyazo', 'Ébano Verde (árbol endémico)'], ARRAY['Prohibido extraer especímenes de flora/fauna', 'Senderismo solo por caminos marcados'], 'Un bosque nublado montañoso de alta pluviosidad, hogar del ébano verde y de más de 80 especies de orquídeas salvajes.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.bird_species (name, scientific_name, status, conservation, description, best_locations, avatar) VALUES
('Cigua Palmera', 'Dulus dominicus', 'Endémica', 'Preocupación Menor', 'El ave nacional de la República Dominicana. Construye enormes nidos comunales en la copa de palmas reales.', ARRAY['Santo Domingo', 'Jarabacoa', 'Punta Cana', 'Los Haitises'], '🐤'),
('Barrancolí', 'Todus subulatus', 'Endémica', 'Preocupación Menor', 'Una pequeña joya alada de color verde brillante con garganta roja intensa.', ARRAY['Sierra de Bahoruco', 'Los Haitises', 'Constanza'], '🐦'),
('Gavilán de la Española', 'Buteo ridgwayi', 'Endémica', 'En Peligro Crítico', 'Una de las rapaces más amenazadas del mundo. Su población se limita al Parque Nacional Los Haitises.', ARRAY['Los Haitises', 'Loma Quita Espuela'], '🦅'),
('Papagayo (Tocororo)', 'Priotelus roseigaster', 'Endémica', 'Vulnerable', 'Hermosa ave de colores vibrantes que habita en los bosques nublados de montaña.', ARRAY['Sierra de Bahoruco', 'Valle Nuevo', 'Pico Duarte'], '🦜');

INSERT INTO public.hot_springs (name, location, province, temp_celsius, properties, description, access, price, avatar) VALUES
('Aguas Calientes (San José de las Matas)', 'Los Montones, San José de las Matas (SAJOMA)', 'Santiago', 38.0, ARRAY['Relajación muscular', 'Alivio del estrés', 'Estimulación circulatoria'], 'Cuenta con dos piscinas alimentadas por un manantial de aguas termales azufradas junto al hermoso Río Bao.', 'Fácil', 'RD$ 150 (Acceso al parque)', '♨️'),
('Balneario La Azufrada (Canoa)', 'Canoa, Vicente Noble', 'Barahona', 34.0, ARRAY['Salud dermatológica (Azufrada)', 'Problemas de articulaciones'], 'Famoso balneario natural de aguas azufradas conocido popularmente por sus propiedades medicinales.', 'Fácil', 'Gratuito / Contribución comunitaria', '🧖'),
('La Azufrada del Lago Enriquillo', 'Duvergé, Parque Nacional Lago Enriquillo', 'Independencia', 32.0, ARRAY['Exfoliación natural', 'Desintoxicación cutánea'], 'Ubicado a orillas del Lago Enriquillo, este manantial azufrado brota de la roca caliza.', 'Moderado', 'RD$ 100 (Entrada al Parque Nacional)', '💧');

INSERT INTO public.offset_projects (title, location, category, description, cost_info) VALUES
('Reforestación en Valle Nuevo', 'Constanza • Cordillera Central', 'Alta Prioridad Hídrica', 'Siembre de pino criollo y especies nativas en la Madre de las Aguas.', 'Costo por Árbol: RD$ 250'),
('Restauración de Manglares en Los Haitises', 'Bahía de Samaná', 'Carbono Azul', 'Los manglares capturan hasta 4 veces más carbono que los bosques tropicales terrestres.', 'Costo por M²: RD$ 300');

INSERT INTO public.toll_routes (name, description, tolls_data) VALUES
('Autovía del Este (Santo Domingo - Punta Cana)', 'Ruta desde la capital hacia los polos turísticos de La Romana, Bayahibe, Bávaro y Punta Cana.', '[{"name": "Peaje Las Américas", "cat1Price": 60, "cat2Price": 120, "cat3Price": 180, "cat4Price": 240}, {"name": "Peaje Coral I (La Romana)", "cat1Price": 100, "cat2Price": 200, "cat3Price": 300, "cat4Price": 400}, {"name": "Peaje Coral II (Punta Cana)", "cat1Price": 100, "cat2Price": 200, "cat3Price": 300, "cat4Price": 400}]'::jsonb),
('Autopista Duarte (Santo Domingo - Santiago)', 'Vía de conexión principal hacia la región del Cibao.', '[{"name": "Peaje Duarte (Km 25)", "cat1Price": 60, "cat2Price": 120, "cat3Price": 180, "cat4Price": 240}]'::jsonb),
('Autopista del Nordeste (Santo Domingo - Samaná)', 'La famosa autovía Juan Pablo II que cruza el parque nacional Los Haitises hacia Las Terrenas.', '[{"name": "Peaje Marbella", "cat1Price": 60, "cat2Price": 120, "cat3Price": 180, "cat4Price": 240}, {"name": "Peaje Naranjal", "cat1Price": 200, "cat2Price": 400, "cat3Price": 600, "cat4Price": 800}, {"name": "Peaje Guaraguao", "cat1Price": 230, "cat2Price": 460, "cat3Price": 690, "cat4Price": 920}, {"name": "Peaje El Catey", "cat1Price": 580, "cat2Price": 1150, "cat3Price": 1720, "cat4Price": 2300}]'::jsonb),
('Autopista Sánchez (Santo Domingo - San Cristóbal / Baní / Sur)', 'Conexión hacia el Sur Profundo.', '[{"name": "Peaje Sánchez (Km 12)", "cat1Price": 60, "cat2Price": 120, "cat3Price": 180, "cat4Price": 240}]'::jsonb);

INSERT INTO public.marine_reports (location, wind_speed, wind_direction, wave_height, wave_period, water_temp, condition_rating, recommendation) VALUES
('Cabarete (Playa Encuentro)', 18.5, 'ENE', 1.8, 8, 27.5, 'Excelente', 'Ideal para Surf en la mañana y Kitesurf en la tarde con ráfagas constantes de viento.'),
('Las Terrenas (Playa Bonita)', 12.0, 'NE', 1.2, 7, 28.0, 'Buena', 'Buenas condiciones para Surfistas principiantes e intermedios. Vientos moderados.'),
('Punta Cana (Macao)', 14.5, 'E', 1.5, 9, 27.8, 'Buena', 'Viento onshore moderado, olas estables y limpias en la zona de rompiente.');
