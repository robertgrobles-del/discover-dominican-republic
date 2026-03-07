
-- Create ad_banners table for dynamic banner management
CREATE TABLE public.ad_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  
  -- Banner content
  image_url text,
  alt_text text DEFAULT 'Publicidad',
  target_url text DEFAULT '/partners',
  headline text,
  subtext text,
  cta_text text DEFAULT 'Ver más',
  sponsor text,
  
  -- Type & placement
  banner_type text NOT NULL DEFAULT 'billboard',
  placement text NOT NULL DEFAULT 'between-sections',
  section text DEFAULT 'global',
  page text,
  
  -- Scheduling
  start_date timestamptz,
  end_date timestamptz,
  
  -- Metrics
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  
  -- Status
  priority integer DEFAULT 0,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ad_banners ENABLE ROW LEVEL SECURITY;

-- Public can view active banners
CREATE POLICY "Public can view active ad_banners"
  ON public.ad_banners FOR SELECT
  USING (is_active = true);

-- Admins can manage all banners
CREATE POLICY "Admins can manage ad_banners"
  ON public.ad_banners FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_ad_banners_updated_at
  BEFORE UPDATE ON public.ad_banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed sample banners
INSERT INTO public.ad_banners (name, slug, banner_type, placement, section, headline, subtext, cta_text, sponsor, priority, is_active, is_featured)
VALUES
('Banner Principal Home', 'banner-principal-home', 'billboard', 'between-sections', 'home-hero', '🌴 República Dominicana, El Mejor Destino del Caribe', 'Tu hotel, restaurante o agencia podría estar aquí', 'Anúnciate con nosotros', 'Visit DR', 10, true, true),
('Header Leaderboard', 'header-leaderboard', 'leaderboard', 'header', 'global', '✨ Promociona tu negocio turístico', 'Llega a miles de viajeros cada día', 'Contáctanos', null, 5, true, false),
('Sidebar Destinos', 'sidebar-destinos', 'wide-skyscraper', 'sidebar', 'destinos', '🌊 Tu negocio en el paraíso', 'Promociona tu establecimiento', 'Contactar', null, 5, true, false),
('Sidebar Derecho Global', 'sidebar-derecho-global', 'skyscraper', 'sidebar', 'global', '🏝️ Destino #1 del Caribe', 'Anuncia aquí', 'Ver más', null, 3, true, false),
('Banner Móvil Footer', 'banner-movil-footer', 'mobile-banner', 'sticky', 'global', '🌅 RD te espera', 'El paraíso del Caribe', 'Explorar', null, 5, true, false),
('Inline Resultados Búsqueda', 'inline-resultados-busqueda', 'leaderboard', 'inline', 'search', '🔍 Promociona tu negocio', 'Aparece en las búsquedas', 'Anunciar', null, 4, true, false),
('Banner Entre Secciones Home', 'banner-entre-secciones-home', 'panorama', 'between-sections', 'home-middle', '🏖️ República Dominicana te espera', 'Promociona tu establecimiento turístico aquí', 'Contáctanos', null, 7, true, false),
('Sidebar Detalle Hotel', 'sidebar-detalle-hotel', 'medium-rect', 'sidebar', 'hotel-detail', '🏨 Espacio Premium', 'Tu marca junto a los mejores hoteles', 'Anunciarse', null, 6, true, false),
('Square Playas', 'square-playas', 'square-large', 'inline', 'playas', '🏖️ Playas Premium', 'Promociona tu establecimiento de playa', 'Contactar', null, 4, true, false),
('Mobile Experiencias', 'mobile-experiencias', 'mobile-large', 'inline', 'experiencias', '🎯 Experiencias únicas', 'Promociona tus tours y actividades', 'Anunciar', null, 4, true, false);
