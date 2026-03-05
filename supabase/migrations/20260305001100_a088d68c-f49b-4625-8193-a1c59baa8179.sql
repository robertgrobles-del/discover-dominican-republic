-- Add unique constraint on slug for restaurants and airbnb_listings
CREATE UNIQUE INDEX IF NOT EXISTS restaurants_slug_unique ON public.restaurants (slug);
CREATE UNIQUE INDEX IF NOT EXISTS airbnb_listings_slug_unique ON public.airbnb_listings (slug);

-- Seed restaurants
INSERT INTO public.restaurants (name, slug, short_description, description, cuisine_type, category, price_range, rating, review_count, address, phone, opening_hours, is_active, is_featured, signature_dishes)
VALUES
  ('Pat''e Palo', 'pat-e-palo', 'Gastronomía europea en la Zona Colonial', 'Restaurante emblemático de la Zona Colonial con cocina europea y dominicana fusionada.', 'Fusión Europea-Caribeña', 'fine-dining', '$$$', 4.7, 890, 'Calle Atarazana 25, Zona Colonial, Santo Domingo', '+1-809-687-8089', 'Lun-Dom 12:00-23:00', true, true, ARRAY['Churrasco Dominicano', 'Pulpo a la Parrilla', 'Risotto de Mariscos']),
  ('Jalao', 'jalao', 'Alta cocina dominicana contemporánea', 'Restaurante del JW Marriott que celebra la cocina dominicana elevada a nivel gourmet.', 'Dominicana Contemporánea', 'fine-dining', '$$$$', 4.8, 650, 'JW Marriott, Av. Winston Churchill, Santo Domingo', '+1-809-807-1717', 'Mar-Sáb 18:00-23:00', true, true, ARRAY['Chivo Guisado Gourmet', 'Mofongo Relleno', 'Flan de Coco']),
  ('El Conuco', 'el-conuco', 'Experiencia cultural y gastronómica dominicana', 'Restaurante temático con shows en vivo, folklore y platos tradicionales.', 'Dominicana Tradicional', 'themed', '$$', 4.4, 2100, 'Calle Casimiro de Moya 152, Santo Domingo', '+1-809-686-0129', 'Lun-Dom 12:00-24:00', true, true, ARRAY['Mangú con los Tres Golpes', 'Chivo Liniero', 'Habichuelas con Dulce'])
ON CONFLICT (slug) DO UPDATE SET short_description = EXCLUDED.short_description, updated_at = now();

-- Seed airbnb listings
INSERT INTO public.airbnb_listings (name, slug, short_description, description, property_type, price_per_night, rating, review_count, guests, bedrooms, bathrooms, beds, is_superhost, amenities, address, is_active, is_featured)
VALUES
  ('Villa Tropical con Piscina Privada', 'villa-tropical-piscina', 'Hermosa villa con piscina infinita y vistas al mar', 'Espectacular villa tropical con piscina privada infinita.', 'Villa', 350, 4.9, 120, 8, 3, 3, 4, true, ARRAY['Piscina Privada', 'WiFi', 'A/C', 'Cocina Completa', 'Vista al Mar'], 'Cap Cana, Punta Cana', true, true),
  ('Apartamento Colonial con Terraza', 'apartamento-colonial-terraza', 'Apartamento boutique en la Zona Colonial', 'Encantador apartamento restaurado en edificio del siglo XVI.', 'Apartamento', 95, 4.7, 85, 4, 2, 1, 2, true, ARRAY['WiFi', 'A/C', 'Cocina', 'Terraza', 'Lavadora'], 'Zona Colonial, Santo Domingo', true, true),
  ('Cabaña Eco en la Montaña', 'cabana-eco-montana', 'Refugio sostenible en Jarabacoa', 'Cabaña ecológica con chimenea y senderos privados.', 'Cabaña', 75, 4.8, 60, 4, 1, 1, 2, false, ARRAY['WiFi', 'Chimenea', 'Hiking Trails', 'Desayuno Incluido'], 'Jarabacoa, La Vega', true, false),
  ('Penthouse Frente al Mar', 'penthouse-frente-mar', 'Lujoso penthouse en Las Terrenas', 'Penthouse de diseño moderno con jacuzzi privado y acceso a la playa.', 'Penthouse', 280, 4.9, 45, 6, 3, 2, 3, true, ARRAY['Jacuzzi', 'WiFi', 'A/C', 'Vista 360°', 'Acceso Playa'], 'Las Terrenas, Samaná', true, true)
ON CONFLICT (slug) DO UPDATE SET short_description = EXCLUDED.short_description, updated_at = now();