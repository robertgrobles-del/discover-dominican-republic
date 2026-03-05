
-- Mark some hotels as sponsored
UPDATE hotels SET is_sponsored = true WHERE slug IN ('sanctuary-cap-cana', 'amanera-plata-grande');

-- Mark some restaurants as sponsored
UPDATE restaurants SET is_sponsored = true WHERE slug IN ('jellyfish-punta-cana', 'la-cassina');

-- Seed beaches
INSERT INTO beaches (name, slug, short_description, image_url, beach_type, sand_type, water_color, wave_intensity, crowd_level, activities, amenities, rating, is_featured, is_active, best_time_to_visit, address)
VALUES
('Playa Bávaro', 'playa-bavaro', 'Icónica playa de arena blanca y aguas turquesas en Punta Cana, perfecta para deportes acuáticos y relajación.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', 'tropical', 'Blanca fina', 'Turquesa', 'Baja', 'Moderado', ARRAY['Snorkel', 'Kayak', 'Paddleboard', 'Banana boat'], ARRAY['Sombrillas', 'Restaurantes', 'Baños', 'Duchas'], 4.8, true, true, 'Diciembre - Abril', 'Bávaro, Punta Cana'),
('Playa Rincón', 'playa-rincon-samana', 'Una de las playas más vírgenes y espectaculares del Caribe, rodeada de montañas y cocoteros.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', 'virgen', 'Blanca', 'Cristalina', 'Baja', 'Bajo', ARRAY['Natación', 'Snorkel', 'Senderismo'], ARRAY['Restaurantes locales'], 4.9, true, true, 'Todo el año', 'Las Galeras, Samaná'),
('Playa Macao', 'playa-macao', 'Playa salvaje ideal para el surf y el boogie board, con olas perfectas y arena dorada.', 'https://images.unsplash.com/photo-1476673160081-cf065607f449?w=800', 'surf', 'Dorada', 'Azul intenso', 'Alta', 'Moderado', ARRAY['Surf', 'Boogie board', 'Cuatrimoto'], ARRAY['Estacionamiento', 'Vendedores locales'], 4.7, true, true, 'Noviembre - Marzo', 'Macao, Punta Cana'),
('Bahía de las Águilas', 'bahia-aguilas', 'Paraíso virgen de 8km con las aguas más cristalinas del país, dentro del Parque Nacional Jaragua.', 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800', 'virgen', 'Blanca coralina', 'Cristalina turquesa', 'Muy baja', 'Bajo', ARRAY['Natación', 'Snorkel', 'Paseo en bote'], ARRAY['Ninguna - playa virgen'], 5.0, true, true, 'Todo el año', 'Pedernales'),
('Playa Sosúa', 'playa-sosua', 'Bahía protegida con arrecifes de coral, ideal para snorkel y buceo, con vibrante vida marina.', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', 'bahía', 'Dorada', 'Turquesa', 'Baja', 'Alto', ARRAY['Snorkel', 'Buceo', 'Kayak'], ARRAY['Restaurantes', 'Tiendas', 'Duchas', 'Alquiler equipo'], 4.5, false, true, 'Todo el año', 'Sosúa, Puerto Plata'),
('Playa Dorada', 'playa-dorada', 'Playa de resort con campo de golf adyacente, arena dorada y aguas tranquilas.', 'https://images.unsplash.com/photo-1520454974749-611b7248ffdb?w=800', 'resort', 'Dorada', 'Azul turquesa', 'Baja', 'Moderado', ARRAY['Golf', 'Windsurf', 'Vela'], ARRAY['Resorts', 'Spa', 'Restaurantes', 'Campo de golf'], 4.4, false, true, 'Diciembre - Abril', 'Puerto Plata')
ON CONFLICT DO NOTHING;

-- Seed experiences
INSERT INTO experiences (name, slug, category, experience_type, short_description, image_url, duration, difficulty, price_range, rating, is_featured, is_active, best_season, highlights)
VALUES
('Avistamiento de Ballenas', 'avistamiento-ballenas', 'naturaleza', 'tour', 'Observa las majestuosas ballenas jorobadas en la Bahía de Samaná durante su temporada de apareamiento.', 'https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=800', '4-5 horas', 'Fácil', '$$', 4.9, true, true, 'Enero - Marzo', ARRAY['Ballenas jorobadas', 'Bahía de Samaná', 'Guía experto', 'Snack incluido']),
('Rafting Río Yaque del Norte', 'rafting-yaque-norte', 'aventura', 'actividad', 'Desciende los rápidos del río más largo del Caribe en una aventura llena de adrenalina en Jarabacoa.', 'https://images.unsplash.com/photo-1530866495561-507c83d7eb80?w=800', '3 horas', 'Moderado', '$$', 4.7, true, true, 'Todo el año', ARRAY['Rápidos clase III', 'Equipo incluido', 'Guía certificado', 'Paisajes montañosos']),
('Tour Zona Colonial', 'tour-zona-colonial', 'cultura', 'tour', 'Recorre las calles más antiguas de América, visitando las primeras construcciones europeas del Nuevo Mundo.', 'https://images.unsplash.com/photo-1583531172005-814f5bb2db5f?w=800', '3 horas', 'Fácil', '$', 4.8, true, true, 'Todo el año', ARRAY['Catedral Primada', 'Alcázar de Colón', 'Fortaleza Ozama', 'Calle Las Damas']),
('Buggy Adventure Punta Cana', 'buggy-adventure-pc', 'aventura', 'actividad', 'Recorre caminos de tierra, cenotes y plantaciones a bordo de un buggy en la selva de Punta Cana.', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800', '4 horas', 'Moderado', '$$', 4.6, false, true, 'Todo el año', ARRAY['Cenote', 'Plantación de cacao', 'Playa remota', 'Pueblo local'])
ON CONFLICT DO NOTHING;
