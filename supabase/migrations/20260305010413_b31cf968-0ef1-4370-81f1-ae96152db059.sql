
-- Add unique index on destinations.slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_destinations_slug_unique ON public.destinations (slug) WHERE slug IS NOT NULL;

-- Seed key destinations
INSERT INTO public.destinations (name, slug, short_description, image_url, description)
VALUES
  ('Punta Cana', 'punta-cana', 'Playas de arena blanca y aguas cristalinas con resorts de clase mundial.', 'https://images.unsplash.com/photo-1588416936097-41850ab3d86d?w=800', 'Punta Cana es el destino turístico más visitado del Caribe, famoso por sus playas de arena blanca, aguas turquesas y resorts todo incluido de clase mundial.'),
  ('Santo Domingo', 'santo-domingo', 'La ciudad colonial más antigua de América, rica en historia y cultura.', 'https://images.unsplash.com/photo-1626170874616-ef17d5278609?w=800', 'Santo Domingo, capital de República Dominicana, alberga la Zona Colonial, Patrimonio de la Humanidad por la UNESCO, con la primera catedral, universidad y hospital del Nuevo Mundo.'),
  ('Samaná', 'samana', 'Naturaleza virgen, ballenas jorobadas y cascadas impresionantes.', 'https://images.unsplash.com/photo-1580237072617-771c3ecc4a24?w=800', 'La Península de Samaná es un paraíso natural con cascadas como El Limón, avistamiento de ballenas jorobadas y playas vírgenes como Playa Rincón.'),
  ('Puerto Plata', 'puerto-plata', 'La Costa del Ámbar con teleférico, playas doradas y 27 Charcos.', 'https://images.unsplash.com/photo-1590071089561-7f58f2e0f82c?w=800', 'Puerto Plata ofrece una combinación única de playas, historia y aventura con su teleférico, la Fortaleza San Felipe y los famosos 27 Charcos de Damajagua.'),
  ('La Romana', 'la-romana', 'Casa de Campo, Altos de Chavón y playas exclusivas del sureste.', 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800', 'La Romana es hogar de Casa de Campo, uno de los resorts más exclusivos del Caribe, y Altos de Chavón, una réplica de villa mediterránea del siglo XVI.'),
  ('Jarabacoa', 'jarabacoa', 'La ciudad de la eterna primavera, rafting, montañas y aventura.', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800', 'Jarabacoa es el centro de ecoturismo y aventura de República Dominicana, rodeada de montañas, ríos y cascadas en el corazón de la Cordillera Central.'),
  ('Bayahíbe', 'bayahibe', 'Pueblo pesquero con las mejores playas e islas vírgenes del Caribe.', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', 'Bayahíbe es un encantador pueblo pesquero conocido como puerta de entrada a la Isla Saona y al Parque Nacional del Este.')
ON CONFLICT (slug) DO NOTHING;
