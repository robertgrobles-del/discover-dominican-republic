-- Tipos de producto locales para la tienda: joyería (ámbar, larimar), muñecas sin rostro y gastronomía.

INSERT INTO store_product_categories (slug, name, sort_order) VALUES
  ('joyeria', 'Joyería', 6), ('munecas-sin-rostro', 'Muñecas sin rostro', 7), ('gastronomia', 'Gastronomía', 8)
ON CONFLICT (slug) DO NOTHING;

-- Productos de esos tipos y de marca útiles para el viajero que aún no estaban en el catálogo. Entran inactivos y sin
-- existencias: el admin les sube fotos, fija el stock y los activa desde el panel (no se vende inventario que no existe).
INSERT INTO store_products (id, slug, name, category, price, stock, active, emoji, tagline, sort_order) VALUES
  ('prd_pulsera_larimar', 'pulsera-larimar', 'Pulsera de larimar • Barahona', 'joyeria', 1450, 0, false, '💎', 'La piedra azul que sólo existe en RD.', 60),
  ('prd_colgante_ambar', 'colgante-ambar', 'Colgante de ámbar dominicano', 'joyeria', 1650, 0, false, '🟠', 'Ámbar de la Cordillera Septentrional.', 61),
  ('prd_llavero_larimar', 'llavero-larimar-logo', 'Llavero de larimar • Logo Descubre RD', 'joyeria', 590, 0, false, '🔑', 'Un pedacito de RD en tus llaves.', 62),
  ('prd_muneca_clasica', 'muneca-sin-rostro-clasica', 'Muñeca sin rostro • Clásica', 'munecas-sin-rostro', 1200, 0, false, '🪆', 'Artesanía de Higüerito, Moca.', 70),
  ('prd_muneca_mini', 'muneca-sin-rostro-mini', 'Muñeca sin rostro • Mini', 'munecas-sin-rostro', 650, 0, false, '🪆', 'Tamaño maleta, ideal para regalar.', 71),
  ('prd_cafe_jarabacoa', 'cafe-jarabacoa', 'Café de Jarabacoa • 454 g', 'gastronomia', 690, 0, false, '☕', 'Café de altura tostado en RD.', 80),
  ('prd_chocolate_cacao', 'chocolate-cacao-dominicano', 'Chocolate de cacao dominicano', 'gastronomia', 450, 0, false, '🍫', 'Cacao fino de San Francisco de Macorís.', 81),
  ('prd_kit_mamajuana', 'kit-mamajuana', 'Kit de mamajuana • Hierbas para curar', 'gastronomia', 850, 0, false, '🌿', 'Sólo las hierbas: tú pones el resto.', 82),
  ('prd_dulces_criollos', 'dulces-criollos', 'Caja de dulces criollos', 'gastronomia', 750, 0, false, '🍬', 'Dulce de leche, coco y más.', 83),
  ('prd_pasaporte_rd', 'pasaporte-descubre-rd', 'Pasaporte Descubre RD • Libreta de sellos', 'accesorios', 490, 0, false, '📘', 'Un sello por cada provincia que visites.', 90),
  ('prd_funda_pasaporte', 'funda-pasaporte', 'Funda para pasaporte personalizada', 'accesorios', 750, 0, false, '🛂', 'Con tu nombre grabado.', 91),
  ('prd_etiqueta_equipaje', 'etiquetas-equipaje', 'Etiquetas de equipaje personalizadas • Par', 'accesorios', 450, 0, false, '🏷️', 'Encuentra tu maleta a la primera.', 92),
  ('prd_toalla_playa', 'toalla-microfibra-playa', 'Toalla de playa microfibra • Ilustrada', 'hogar', 1350, 0, false, '🏖️', 'Seca rápido, ocupa poco.', 93),
  ('prd_rinonera', 'rinonera-antirrobo', 'Riñonera antirrobo • Descubre RD', 'bolsos', 990, 0, false, '👝', 'Lo importante, siempre a mano.', 94),
  ('prd_kit_viaje', 'kit-viajero', 'Kit del viajero • Protector, repelente y bálsamo', 'bolsos', 1250, 0, false, '🧴', 'Protector biodegradable incluido.', 95),
  ('prd_abanico_guano', 'abanico-guano', 'Abanico de guano pintado', 'accesorios', 390, 0, false, '🪭', 'Artesanía para el calor caribeño.', 96),
  ('prd_cargador', 'cargador-portatil', 'Cargador portátil 10 000 mAh • Descubre RD', 'accesorios', 1490, 0, false, '🔋', 'Batería para todo el día de excursión.', 97)
ON CONFLICT (slug) DO NOTHING;
