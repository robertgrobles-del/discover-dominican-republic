
-- Create job_vacancies table
CREATE TABLE public.job_vacancies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid REFERENCES public.hotels(id) ON DELETE SET NULL,
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE SET NULL,
  company_name text NOT NULL,
  company_logo text,
  company_description text,
  title text NOT NULL,
  slug text UNIQUE,
  description text,
  short_description text,
  location text,
  address text,
  province text,
  salary_range text,
  salary_min numeric,
  salary_max numeric,
  salary_currency text DEFAULT 'DOP',
  job_type text DEFAULT 'full-time',
  experience_level text DEFAULT 'mid',
  education text,
  category text DEFAULT 'hoteleria',
  department text,
  languages text[] DEFAULT '{}',
  responsibilities text[] DEFAULT '{}',
  requirements text[] DEFAULT '{}',
  benefits text[] DEFAULT '{}',
  skills text[] DEFAULT '{}',
  is_urgent boolean DEFAULT false,
  is_remote boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  application_url text,
  application_email text,
  deadline date,
  applicants_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_vacancies ENABLE ROW LEVEL SECURITY;

-- Public can view active vacancies
CREATE POLICY "Public can view active job_vacancies"
  ON public.job_vacancies FOR SELECT
  USING (is_active = true);

-- Admins can manage all
CREATE POLICY "Admins can manage job_vacancies"
  ON public.job_vacancies FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Updated_at trigger
CREATE TRIGGER update_job_vacancies_updated_at
  BEFORE UPDATE ON public.job_vacancies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed initial vacancies
INSERT INTO public.job_vacancies (company_name, company_logo, company_description, title, slug, description, short_description, location, address, province, salary_range, salary_min, salary_max, job_type, experience_level, education, category, department, languages, responsibilities, requirements, benefits, skills, is_urgent, is_remote, is_featured, deadline, applicants_count, views_count)
VALUES
(
  'Sanctuary Cap Cana', 
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&h=100&fit=crop',
  'Resort de lujo todo incluido en Cap Cana, reconocido como uno de los mejores del Caribe con servicio 5 estrellas.',
  'Gerente de Recepción',
  'gerente-recepcion-sanctuary',
  'Buscamos un profesional dinámico y orientado al servicio para liderar nuestro equipo de recepción. El candidato ideal tendrá pasión por la hospitalidad y experiencia comprobada en gestión de equipos en hoteles 5 estrellas.',
  'Lidera el equipo de recepción en uno de los resorts más exclusivos del Caribe.',
  'Cap Cana, Punta Cana',
  'Bulevar Turístico del Este, Cap Cana',
  'La Altagracia',
  'RD$ 85,000 - 120,000 / mes',
  85000, 120000, 'full-time', 'senior', 'Licenciatura en Hotelería o Turismo',
  'hoteleria', 'Recepción',
  ARRAY['Español (Nativo)', 'Inglés (Avanzado)', 'Francés (Deseable)'],
  ARRAY['Supervisar operaciones de recepción 24/7', 'Gestionar equipo de 15+ recepcionistas', 'Asegurar satisfacción del huésped', 'Coordinar con Housekeeping y otros departamentos', 'Manejar quejas y resolver conflictos', 'Preparar reportes de ocupación y revenue'],
  ARRAY['3+ años en posiciones similares', 'Experiencia en Opera PMS', 'Inglés avanzado', 'Disponibilidad horarios rotativos', 'Licenciatura en Hotelería'],
  ARRAY['Salario competitivo + bonos', 'Seguro médico completo', 'Alimentación incluida', 'Descuentos en servicios del resort', 'Programa de desarrollo profesional', 'Transporte desde Santo Domingo'],
  ARRAY['Liderazgo', 'Opera PMS', 'Revenue Management', 'Atención al Cliente', 'Resolución de Conflictos'],
  true, false, true, '2026-04-30', 47, 1250
),
(
  'Eden Roc Cap Cana',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=100&h=100&fit=crop',
  'Hotel boutique de lujo en Cap Cana con suites frente al mar y servicio personalizado.',
  'Chef Ejecutivo',
  'chef-ejecutivo-eden-roc',
  'Buscamos un Chef Ejecutivo creativo y apasionado para liderar nuestra cocina. El candidato ideal combinará técnicas culinarias internacionales con los sabores auténticos del Caribe dominicano.',
  'Lidera la cocina de un hotel boutique de lujo en Cap Cana.',
  'Cap Cana, Punta Cana',
  'Cap Cana, Juanillo',
  'La Altagracia',
  'RD$ 120,000 - 180,000 / mes',
  120000, 180000, 'full-time', 'senior', 'Título en Artes Culinarias',
  'gastronomia', 'Cocina',
  ARRAY['Español (Nativo)', 'Inglés (Intermedio)'],
  ARRAY['Diseñar y actualizar menús estacionales', 'Liderar equipo de 12 cocineros', 'Gestionar inventario y costos', 'Mantener estándares de higiene', 'Crear experiencias gastronómicas memorables'],
  ARRAY['5+ años de experiencia como Chef', 'Formación culinaria reconocida', 'Conocimiento de cocina caribeña', 'Certificación HACCP', 'Capacidad bajo presión'],
  ARRAY['Salario competitivo + participación', 'Seguro médico privado', 'Libertad creativa en menú', 'Capacitación internacional', 'Alimentación incluida'],
  ARRAY['Cocina Fusión', 'Gestión de Cocina', 'Creatividad', 'HACCP', 'Liderazgo'],
  false, false, true, '2026-05-15', 23, 890
),
(
  'Tortuga Bay Puntacana',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=100&h=100&fit=crop',
  'Hotel boutique diseñado por Oscar de la Renta, parte de Puntacana Resort & Club.',
  'Concierge Bilingüe',
  'concierge-bilingue-tortuga-bay',
  'Buscamos un Concierge excepcional para brindar servicio personalizado a nuestros huéspedes VIP. Debe tener pasión por el servicio de lujo y conocimiento profundo de República Dominicana.',
  'Servicio personalizado VIP en hotel boutique de Oscar de la Renta.',
  'Puntacana Resort, Punta Cana',
  'Puntacana Resort & Club',
  'La Altagracia',
  'RD$ 45,000 - 65,000 / mes + propinas',
  45000, 65000, 'full-time', 'mid', 'Carrera técnica en Turismo',
  'hoteleria', 'Guest Services',
  ARRAY['Español (Nativo)', 'Inglés (Fluido)', 'Francés (Plus)'],
  ARRAY['Gestionar solicitudes de huéspedes VIP', 'Coordinar reservas en restaurantes y tours', 'Organizar transporte y logística', 'Recomendar experiencias personalizadas', 'Mantener relaciones con proveedores locales'],
  ARRAY['2+ años en concierge o guest relations', 'Inglés fluido obligatorio', 'Conocimiento turístico de RD', 'Excelente presentación personal', 'Disponibilidad horarios flexibles'],
  ARRAY['Propinas generosas', 'Seguro médico', 'Alimentación incluida', 'Acceso a instalaciones del resort', 'Descuentos para familiares'],
  ARRAY['Servicio VIP', 'Idiomas', 'Comunicación', 'Organización', 'Conocimiento Local'],
  false, false, true, '2026-04-15', 18, 560
),
(
  'Casa Colonial Beach & Spa',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&h=100&fit=crop',
  'Resort boutique colonial de cinco estrellas en Puerto Plata.',
  'Terapeuta de Spa Senior',
  'terapeuta-spa-casa-colonial',
  'Únete a nuestro premiado spa como Terapeuta Senior. Ofrecemos tratamientos de clase mundial utilizando productos orgánicos locales en un entorno colonial único.',
  'Terapeuta de spa en resort boutique 5 estrellas en Puerto Plata.',
  'Playa Dorada, Puerto Plata',
  'Playa Dorada, Puerto Plata',
  'Puerto Plata',
  'RD$ 35,000 - 50,000 / mes',
  35000, 50000, 'full-time', 'mid', 'Certificación en terapias corporales',
  'wellness', 'Spa & Bienestar',
  ARRAY['Español (Nativo)', 'Inglés (Intermedio)'],
  ARRAY['Realizar masajes terapéuticos y relajantes', 'Aplicar tratamientos faciales y corporales', 'Asesorar a huéspedes sobre tratamientos', 'Mantener higiene y estándares del spa', 'Gestionar inventario de productos'],
  ARRAY['Certificación en masoterapia', '2+ años de experiencia', 'Conocimiento de aromaterapia', 'Excelente trato al cliente', 'Disponibilidad fines de semana'],
  ARRAY['Seguro médico', 'Propinas', 'Capacitación continua', 'Productos de spa gratis', 'Ambiente relajado'],
  ARRAY['Masoterapia', 'Aromaterapia', 'Servicio al Cliente', 'Wellness', 'Trabajo en Equipo'],
  false, false, false, '2026-04-01', 12, 340
),
(
  'Sublime Samaná',
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=100&h=100&fit=crop',
  'Resort eco-chic con villas de piscina privada en la península de Samaná.',
  'Guía de Ecoturismo',
  'guia-ecoturismo-sublime-samana',
  'Buscamos un apasionado de la naturaleza para guiar a nuestros huéspedes por las maravillas naturales de Samaná: ballenas jorobadas, cascadas, manglares y playas vírgenes.',
  'Guía naturalista en resort eco-chic en Samaná.',
  'Las Terrenas, Samaná',
  'Carretera Las Terrenas-El Limón',
  'Samaná',
  'RD$ 30,000 - 45,000 / mes + propinas',
  30000, 45000, 'full-time', 'junior', 'Bachillerato o técnico en Turismo',
  'tours', 'Experiencias',
  ARRAY['Español (Nativo)', 'Inglés (Avanzado)', 'Francés (Deseable)'],
  ARRAY['Guiar tours de avistamiento de ballenas', 'Conducir excursiones a El Limón', 'Informar sobre flora y fauna local', 'Asegurar seguridad de visitantes', 'Promover turismo sostenible'],
  ARRAY['Inglés fluido', 'Conocimiento de zona Samaná', 'Certificación primeros auxilios', 'Licencia de conducir', 'Excelente condición física'],
  ARRAY['Propinas generosas', 'Uniforme proporcionado', 'Capacitación continua', 'Trabajo al aire libre', 'Alojamiento subsidiado'],
  ARRAY['Comunicación', 'Idiomas', 'Primeros Auxilios', 'Naturaleza', 'Ecoturismo'],
  true, false, true, '2026-03-31', 35, 780
),
(
  'Zoëtry Agua Punta Cana',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=100&h=100&fit=crop',
  'Resort all-inclusive de lujo boutique con enfoque en bienestar.',
  'Community Manager & Marketing Digital',
  'community-manager-zoetry',
  'Gestiona las redes sociales y estrategia digital de nuestro resort. Crea contenido visual atractivo que capture la esencia del lujo caribeño y el bienestar.',
  'Marketing digital para resort de lujo all-inclusive.',
  'Uvero Alto, Punta Cana',
  'Playa Uvero Alto',
  'La Altagracia',
  'RD$ 50,000 - 70,000 / mes',
  50000, 70000, 'full-time', 'mid', 'Licenciatura en Marketing o Comunicación',
  'marketing', 'Marketing',
  ARRAY['Español (Nativo)', 'Inglés (Avanzado)'],
  ARRAY['Gestionar redes sociales del resort', 'Crear contenido visual y escrito', 'Planificar campañas de marketing digital', 'Analizar métricas y KPIs', 'Coordinar con influencers y medios', 'Mantener reputación online'],
  ARRAY['2+ años en marketing digital', 'Dominio de herramientas de diseño', 'Experiencia en sector hotelero', 'Inglés avanzado', 'Portfolio de trabajo previo'],
  ARRAY['Salario competitivo', 'Seguro médico', 'Alojamiento con descuento', 'Acceso a instalaciones', 'Home office parcial', 'Equipo de trabajo moderno'],
  ARRAY['Redes Sociales', 'Fotografía', 'Copywriting', 'Google Analytics', 'Canva/Adobe'],
  false, true, false, '2026-04-20', 56, 1430
);
