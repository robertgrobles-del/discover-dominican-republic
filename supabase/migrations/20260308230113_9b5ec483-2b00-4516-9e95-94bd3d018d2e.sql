
-- ============================================================
-- DESTINATIONS SEEDING - All provinces
-- ============================================================

-- Azua
INSERT INTO destinations (name, slug, province_id, short_description, highlights) VALUES
('Playa Monte Río', 'playa-monte-rio', '91c02c16-79ab-4d97-bac7-2c2a3d6187e9', 'Playa tranquila en la costa de Azua con aguas cálidas y ambiente relajado.', ARRAY['Playa', 'Naturaleza', 'Tranquilidad']),
('Playa Blanca (Azua)', 'playa-blanca-azua', '91c02c16-79ab-4d97-bac7-2c2a3d6187e9', 'Arena blanca y aguas cristalinas en la costa sur dominicana.', ARRAY['Playa virgen', 'Snorkel', 'Paisaje']),
('Valle de Peralta', 'valle-de-peralta', '91c02c16-79ab-4d97-bac7-2c2a3d6187e9', 'Valle fértil rodeado de montañas con paisajes impresionantes.', ARRAY['Valle', 'Agricultura', 'Montañas']),
('Sabana Yegua', 'sabana-yegua-destino', '91c02c16-79ab-4d97-bac7-2c2a3d6187e9', 'Zona de embalse y naturaleza con oportunidades de ecoturismo.', ARRAY['Embalse', 'Ecoturismo', 'Naturaleza']),

-- Bahoruco
('Laguna Rincón', 'laguna-rincon', '4bc1945f-6424-4def-9725-f89033968381', 'La laguna de agua dulce más grande del Caribe, hogar de fauna endémica.', ARRAY['Laguna', 'Biodiversidad', 'Aves']),
('Valle de Neiba', 'valle-de-neiba', '4bc1945f-6424-4def-9725-f89033968381', 'Valle extenso entre la Sierra de Bahoruco y la Sierra de Neiba.', ARRAY['Valle', 'Agricultura', 'Paisaje']),
('Sierra de Bahoruco', 'sierra-de-bahoruco', '4bc1945f-6424-4def-9725-f89033968381', 'Parque nacional con biodiversidad única y bosques nublados.', ARRAY['Senderismo', 'Bosque nublado', 'Orquídeas']),
('Las Marías', 'las-marias', '4bc1945f-6424-4def-9725-f89033968381', 'Zona ecoturística con naturaleza virgen y senderos de montaña.', ARRAY['Ecoturismo', 'Senderismo', 'Naturaleza']),

-- Barahona
('Bahía de Barahona', 'bahia-de-barahona', '8f897a0e-1223-4eb4-a889-a875b2ee41a9', 'Bahía espectacular con vistas al mar Caribe y montañas.', ARRAY['Bahía', 'Paisaje', 'Pesca']),
('Polo', 'polo-barahona', '8f897a0e-1223-4eb4-a889-a875b2ee41a9', 'Conocido por el fenómeno del Polo Magnético y sus cafetales.', ARRAY['Café', 'Polo Magnético', 'Montaña']),
('Los Patos', 'los-patos', '8f897a0e-1223-4eb4-a889-a875b2ee41a9', 'Río más corto del mundo que desemboca en una playa paradisíaca.', ARRAY['Río', 'Playa', 'Naturaleza']),
('Paraíso', 'paraiso-destino', '8f897a0e-1223-4eb4-a889-a875b2ee41a9', 'Pueblo costero con playas vírgenes y paisajes de ensueño.', ARRAY['Playa', 'Pueblo costero', 'Tranquilidad']),
('San Rafael', 'san-rafael-barahona', '8f897a0e-1223-4eb4-a889-a875b2ee41a9', 'Balneario natural de aguas cristalinas entre montañas y mar.', ARRAY['Balneario', 'Cascada', 'Aguas cristalinas']),
('Bahoruco Costero', 'bahoruco-costero', '8f897a0e-1223-4eb4-a889-a875b2ee41a9', 'Franja costera con playas de piedra, larimar y paisajes dramáticos.', ARRAY['Costa', 'Larimar', 'Paisaje']),

-- Dajabón
('Restauración', 'restauracion-destino', '90c95bd8-ac2e-4c78-9b0a-ff0bbc0d69c3', 'Pueblo fronterizo con naturaleza exuberante y ríos cristalinos.', ARRAY['Frontera', 'Naturaleza', 'Ríos']),
('Río Masacre', 'rio-masacre', '90c95bd8-ac2e-4c78-9b0a-ff0bbc0d69c3', 'Río fronterizo con historia y paisajes naturales impresionantes.', ARRAY['Río', 'Historia', 'Frontera']),
('Loma de Cabrera', 'loma-de-cabrera-destino', '90c95bd8-ac2e-4c78-9b0a-ff0bbc0d69c3', 'Zona montañosa con clima fresco y vistas panorámicas.', ARRAY['Montaña', 'Clima fresco', 'Panorámica']),
('Cordillera Central Norte', 'cordillera-central-norte-dajabon', '90c95bd8-ac2e-4c78-9b0a-ff0bbc0d69c3', 'Acceso norte a la Cordillera Central con senderos y cascadas.', ARRAY['Cordillera', 'Senderismo', 'Cascadas']),

-- Duarte
('Valle del Bajo Yuna', 'valle-bajo-yuna', 'f5ef7575-8625-45bd-a9fe-22362a182a02', 'Valle fértil con arrozales y paisajes agrícolas impresionantes.', ARRAY['Valle', 'Arroz', 'Agricultura']),
('Presa de Hatillo', 'presa-de-hatillo-norte', 'f5ef7575-8625-45bd-a9fe-22362a182a02', 'Mayor embalse del Caribe con oportunidades de pesca y navegación.', ARRAY['Embalse', 'Pesca', 'Navegación']),
('Loma Quita Espuela', 'loma-quita-espuela', 'f5ef7575-8625-45bd-a9fe-22362a182a02', 'Reserva científica con bosque húmedo y biodiversidad endémica.', ARRAY['Reserva', 'Bosque húmedo', 'Biodiversidad']),

-- Elías Piña
('Hondo Valle', 'hondo-valle-destino', '454f66c4-3318-4c8b-9e10-fb2b4ee8e34c', 'Valle de montaña con clima fresco y producción agrícola.', ARRAY['Valle', 'Montaña', 'Clima fresco']),
('Sabana Mula', 'sabana-mula', '454f66c4-3318-4c8b-9e10-fb2b4ee8e34c', 'Zona de sabana con paisajes abiertos y cultura rural.', ARRAY['Sabana', 'Naturaleza', 'Rural']),
('Cordillera Central Oeste', 'cordillera-central-oeste', '454f66c4-3318-4c8b-9e10-fb2b4ee8e34c', 'Sección oeste de la Cordillera Central con picos y valles.', ARRAY['Cordillera', 'Montañismo', 'Paisaje']),

-- El Seibo
('Miches', 'miches-destino', '55311b67-bf3d-45e1-838f-eb923872d8b2', 'Paraíso emergente con playas vírgenes y montañas junto al mar.', ARRAY['Playa virgen', 'Montaña', 'Ecoturismo']),
('Costa Esmeralda', 'costa-esmeralda', '55311b67-bf3d-45e1-838f-eb923872d8b2', 'Costa de aguas turquesa y arenas doradas aún por descubrir.', ARRAY['Costa', 'Playa', 'Turquesa']),
('Playa Esmeralda', 'playa-esmeralda', '55311b67-bf3d-45e1-838f-eb923872d8b2', 'Playa de arena blanca con aguas color esmeralda y cocoteros.', ARRAY['Playa', 'Arena blanca', 'Cocoteros']),
('Montaña Redonda', 'montana-redonda', '55311b67-bf3d-45e1-838f-eb923872d8b2', 'Mirador icónico con vistas 360° al mar y las montañas.', ARRAY['Mirador', 'Swing', 'Fotografía']),

-- Espaillat
('Gaspar Hernández', 'gaspar-hernandez-destino', '1ffad9f2-fdc8-4e8a-bc75-c47722e86c3f', 'Pueblo costero con playas tranquilas y tradición pesquera.', ARRAY['Playa', 'Pesca', 'Pueblo']),
('Jamao al Norte', 'jamao-al-norte-destino', '1ffad9f2-fdc8-4e8a-bc75-c47722e86c3f', 'Zona de montaña con cacao, café y naturaleza virgen.', ARRAY['Cacao', 'Café', 'Montaña']),
('Playa Rogelio', 'playa-rogelio', '1ffad9f2-fdc8-4e8a-bc75-c47722e86c3f', 'Playa local poco conocida con encanto caribeño auténtico.', ARRAY['Playa', 'Local', 'Tranquilidad']),
('Río Jamao', 'rio-jamao', '1ffad9f2-fdc8-4e8a-bc75-c47722e86c3f', 'Río con pozas naturales ideal para baño y aventura.', ARRAY['Río', 'Pozas naturales', 'Aventura']),

-- Hato Mayor
('Sabana de la Mar', 'sabana-de-la-mar-destino', '3164070c-47b3-4728-b0bd-a19e4aff968f', 'Puerta de entrada al Parque Nacional Los Haitises.', ARRAY['Los Haitises', 'Naturaleza', 'Manglares']),
('Los Haitises Exterior', 'los-haitises-exterior', '3164070c-47b3-4728-b0bd-a19e4aff968f', 'Zona exterior del parque con mogotes, cuevas y manglares.', ARRAY['Parque Nacional', 'Cuevas', 'Manglares']),
('El Valle', 'el-valle-destino', '3164070c-47b3-4728-b0bd-a19e4aff968f', 'Comunidad rural con paisajes verdes y tradiciones dominicanas.', ARRAY['Rural', 'Tradiciones', 'Paisaje']),
('Costa de Sabana de la Mar', 'costa-sabana-mar', '3164070c-47b3-4728-b0bd-a19e4aff968f', 'Costa con vistas a la bahía de Samaná y manglares.', ARRAY['Costa', 'Bahía', 'Manglares']),

-- Hermanas Mirabal
('Salcedo', 'salcedo-destino', '2c189424-11db-442f-b572-96f52557bb7f', 'Ciudad conocida por su historia patriótica y cultura.', ARRAY['Historia', 'Cultura', 'Hermanas Mirabal']),
('Tenares', 'tenares-destino', '2c189424-11db-442f-b572-96f52557bb7f', 'Pueblo con tradición agrícola y paisajes del Cibao.', ARRAY['Agricultura', 'Cibao', 'Tradición']),
('Zona Cafetalera de Villa Tapia', 'zona-cafetalera-villa-tapia', '2c189424-11db-442f-b572-96f52557bb7f', 'Región cafetalera con fincas y experiencias de café.', ARRAY['Café', 'Fincas', 'Agroturismo']),

-- Independencia
('Lago Enriquillo', 'lago-enriquillo', 'e43e193a-df2f-4939-a86d-31d7e87f6b0e', 'Lago salado más grande del Caribe, hogar de cocodrilos e iguanas.', ARRAY['Lago', 'Cocodrilos', 'Iguanas']),
('Sierra de Neiba', 'sierra-de-neiba', 'e43e193a-df2f-4939-a86d-31d7e87f6b0e', 'Cadena montañosa con bosques de pinos y clima fresco.', ARRAY['Sierra', 'Pinos', 'Senderismo']),
('La Descubierta', 'la-descubierta-destino', 'e43e193a-df2f-4939-a86d-31d7e87f6b0e', 'Pueblo junto al Lago Enriquillo con balnearios naturales.', ARRAY['Balneario', 'Lago', 'Naturaleza']),

-- La Altagracia
('Punta Cana', 'punta-cana', 'bcdd9a38-ed02-4bb1-852a-261869e628b4', 'Destino turístico #1 del Caribe con playas de ensueño y resorts de clase mundial.', ARRAY['Playas', 'Resorts', 'Golf']),
('Bávaro', 'bavaro', 'bcdd9a38-ed02-4bb1-852a-261869e628b4', 'Zona hotelera premium con playas interminables y vida nocturna.', ARRAY['Hoteles', 'Playa', 'Nightlife']),
('Uvero Alto', 'uvero-alto', 'bcdd9a38-ed02-4bb1-852a-261869e628b4', 'Costa norte de La Altagracia con resorts exclusivos y playas tranquilas.', ARRAY['Resorts', 'Exclusividad', 'Playa']),
('Macao', 'macao', 'bcdd9a38-ed02-4bb1-852a-261869e628b4', 'Playa pública espectacular con olas para surf y buggy tours.', ARRAY['Surf', 'Buggy', 'Playa pública']),
('Bayahíbe', 'bayahibe', 'bcdd9a38-ed02-4bb1-852a-261869e628b4', 'Pueblo pesquero con acceso a Isla Saona y los mejores arrecifes.', ARRAY['Buceo', 'Isla Saona', 'Pueblo pesquero']),

-- La Romana
('La Romana', 'la-romana', '1e194ab4-f174-4e2f-ab14-1a0d4af0d1af', 'Ciudad con Casa de Campo, Altos de Chavón y puerto de cruceros.', ARRAY['Casa de Campo', 'Altos de Chavón', 'Golf']),
('Dominicus', 'dominicus', '1e194ab4-f174-4e2f-ab14-1a0d4af0d1af', 'Zona turística con playa de arena blanca y resorts todo incluido.', ARRAY['Playa', 'Resorts', 'Buceo']),
('Cumayasa', 'cumayasa', '1e194ab4-f174-4e2f-ab14-1a0d4af0d1af', 'Río y cuevas naturales con paisajes espectaculares.', ARRAY['Río', 'Cuevas', 'Naturaleza']),

-- La Vega
('Jarabacoa', 'jarabacoa', 'ae914500-6343-4daf-989b-9e07acd542b6', 'Ciudad de la eterna primavera con aventura, rafting y montañas.', ARRAY['Rafting', 'Montañas', 'Aventura']),
('Constanza', 'constanza', 'ae914500-6343-4daf-989b-9e07acd542b6', 'Valle más alto del Caribe con clima templado y agricultura.', ARRAY['Valle', 'Fresas', 'Clima templado']),
('Valle de Constanza', 'valle-de-constanza', 'ae914500-6343-4daf-989b-9e07acd542b6', 'Valle agrícola con vistas espectaculares y aguas termales.', ARRAY['Valle', 'Agricultura', 'Aguas termales']),
('Valle de Jarabacoa', 'valle-de-jarabacoa', 'ae914500-6343-4daf-989b-9e07acd542b6', 'Valle verde con ríos, cascadas y actividades de aventura.', ARRAY['Valle', 'Cascadas', 'Ríos']),

-- María Trinidad Sánchez
('Cabrera', 'cabrera-destino', 'c42b2736-6498-4308-9183-5a942839c99e', 'Pueblo costero con el Laguna Dudú y playas impresionantes.', ARRAY['Laguna Dudú', 'Playas', 'Cenotes']),
('Río San Juan', 'rio-san-juan-destino', 'c42b2736-6498-4308-9183-5a942839c99e', 'Pueblo de la Laguna Gri-Gri con manglares y playa Caletón.', ARRAY['Laguna Gri-Gri', 'Manglares', 'Playa Caletón']),
('Nagua', 'nagua-destino', 'c42b2736-6498-4308-9183-5a942839c99e', 'Ciudad costera con playas, gastronomía y tradición pesquera.', ARRAY['Costa', 'Gastronomía', 'Pesca']),
('Playa Grande', 'playa-grande-mts', 'c42b2736-6498-4308-9183-5a942839c99e', 'Una de las playas más espectaculares del Caribe con arena dorada.', ARRAY['Playa top', 'Arena dorada', 'Surf']),

-- Monseñor Nouel
('Bonao', 'bonao-destino', 'e638450b-054a-4c85-89aa-cbc862bcef9c', 'Ciudad del Yuna con arte, carnaval y naturaleza de montaña.', ARRAY['Carnaval', 'Arte', 'Río Yuna']),
('Blanco', 'blanco-destino', 'e638450b-054a-4c85-89aa-cbc862bcef9c', 'Zona rural con paisajes verdes y tradiciones campesinas.', ARRAY['Rural', 'Paisaje', 'Tradiciones']),
('Valle del Yuna Alto', 'valle-yuna-alto', 'e638450b-054a-4c85-89aa-cbc862bcef9c', 'Valle alto del río Yuna con agricultura y naturaleza.', ARRAY['Valle', 'Río Yuna', 'Agricultura']),

-- Monte Cristi
('Monte Cristi', 'monte-cristi-destino', '0a294bfa-ecf0-498a-9e59-8a42c848b171', 'Ciudad histórica con El Morro y cayos paradisíacos.', ARRAY['El Morro', 'Cayos', 'Historia']),
('Buen Hombre', 'buen-hombre', '0a294bfa-ecf0-498a-9e59-8a42c848b171', 'Pueblo de kitesurf con playas vírgenes y vientos perfectos.', ARRAY['Kitesurf', 'Playa virgen', 'Viento']),
('Villa Vásquez', 'villa-vasquez-destino', '0a294bfa-ecf0-498a-9e59-8a42c848b171', 'Pueblo con tradición ganadera y acceso a la línea noroeste.', ARRAY['Ganadería', 'Tradición', 'Línea noroeste']),
('Cayo Arena', 'cayo-arena', '0a294bfa-ecf0-498a-9e59-8a42c848b171', 'Islote de arena blanca en medio del mar, perfecto para snorkel.', ARRAY['Islote', 'Snorkel', 'Arena blanca']),

-- Monte Plata
('Bayaguana', 'bayaguana-destino', '9239a98d-07bd-40de-9de1-7acbdbc1c773', 'Pueblo con naturaleza tropical y tradiciones ganaderas.', ARRAY['Naturaleza', 'Ganadería', 'Tradición']),
('Yamasá', 'yamasa-destino', '9239a98d-07bd-40de-9de1-7acbdbc1c773', 'Zona de cacao y chocolate con experiencias agroturísticas.', ARRAY['Cacao', 'Chocolate', 'Agroturismo']),
('Los Hidalgos del Yuna', 'los-hidalgos-del-yuna', '9239a98d-07bd-40de-9de1-7acbdbc1c773', 'Zona ribereña con paisajes del río Yuna y naturaleza.', ARRAY['Río Yuna', 'Naturaleza', 'Paisaje']),

-- Pedernales
('Bahía de las Águilas', 'bahia-de-las-aguilas', '9dc8e17f-6654-4dd8-add5-a7b035c5d5ab', 'La playa más prístina del Caribe con 8 km de arena virgen.', ARRAY['Playa virgen', 'Arena blanca', 'Naturaleza']),
('Pedernales', 'pedernales-destino', '9dc8e17f-6654-4dd8-add5-a7b035c5d5ab', 'Frontera suroeste con ecoturismo y paisajes únicos.', ARRAY['Frontera', 'Ecoturismo', 'Naturaleza']),
('Cabo Rojo', 'cabo-rojo', '9dc8e17f-6654-4dd8-add5-a7b035c5d5ab', 'Zona de desarrollo turístico con playas espectaculares.', ARRAY['Playa', 'Desarrollo', 'Costa']),
('Oviedo', 'oviedo-destino', '9dc8e17f-6654-4dd8-add5-a7b035c5d5ab', 'Puerta de entrada a Bahía de las Águilas y laguna de Oviedo.', ARRAY['Laguna', 'Flamencos', 'Ecoturismo']),

-- Peravia
('Baní', 'bani-destino', '66636234-b534-4c92-bc0e-ce1e65da5938', 'Ciudad del mango, las salinas y tradición cultural sureña.', ARRAY['Mango', 'Salinas', 'Cultura']),
('Salinas de Baní', 'salinas-de-bani', '66636234-b534-4c92-bc0e-ce1e65da5938', 'Dunas costeras únicas en el Caribe con paisaje desértico.', ARRAY['Dunas', 'Salinas', 'Paisaje único']),
('Playa Palenque', 'playa-palenque', '66636234-b534-4c92-bc0e-ce1e65da5938', 'Playa popular del sur con restaurantes y ambiente familiar.', ARRAY['Playa', 'Familiar', 'Gastronomía']),

-- Puerto Plata
('Puerto Plata', 'puerto-plata', '011fc86b-4067-4ebd-a0eb-043d9d1e606f', 'La Costa del Ámbar con teleférico, fortaleza y playas doradas.', ARRAY['Teleférico', 'Ámbar', 'Fortaleza']),
('Sosúa', 'sosua', '011fc86b-4067-4ebd-a0eb-043d9d1e606f', 'Bahía espectacular con snorkel, historia judía y vida nocturna.', ARRAY['Snorkel', 'Bahía', 'Historia']),
('Cabarete', 'cabarete', '011fc86b-4067-4ebd-a0eb-043d9d1e606f', 'Capital mundial del kitesurf y windsurf con ambiente bohemio.', ARRAY['Kitesurf', 'Windsurf', 'Vida nocturna']),
('Cofresí', 'cofresi', '011fc86b-4067-4ebd-a0eb-043d9d1e606f', 'Playa con Ocean World y resorts familiares.', ARRAY['Ocean World', 'Resorts', 'Playa']),
('Luperón', 'luperon-destino', '011fc86b-4067-4ebd-a0eb-043d9d1e606f', 'Bahía protegida favorita de veleros con naturaleza virgen.', ARRAY['Veleros', 'Bahía', 'Naturaleza']),

-- Samaná
('Samaná', 'samana', '9fd82b5a-80fc-4f0d-b30e-4d65f1b3ecb3', 'Península tropical con ballenas jorobadas y cascadas.', ARRAY['Ballenas', 'Cascadas', 'Naturaleza']),
('Las Terrenas', 'las-terrenas', '9fd82b5a-80fc-4f0d-b30e-4d65f1b3ecb3', 'Pueblo cosmopolita con playas de cocoteros y gastronomía francesa.', ARRAY['Cocoteros', 'Gastronomía', 'Cosmopolita']),
('El Limón', 'el-limon', '9fd82b5a-80fc-4f0d-b30e-4d65f1b3ecb3', 'Cascada icónica de 40 metros en medio de la selva tropical.', ARRAY['Cascada', 'Senderismo', 'Selva']),
('Las Galeras', 'las-galeras', '9fd82b5a-80fc-4f0d-b30e-4d65f1b3ecb3', 'Pueblo tranquilo con Playa Rincón y ambiente relajado.', ARRAY['Playa Rincón', 'Tranquilidad', 'Buceo']),

-- San Cristóbal
('Villa Altagracia', 'villa-altagracia-destino', '62497a8a-a540-4983-b781-aff3bab84eb4', 'Pueblo con acceso a ríos, cascadas y naturaleza de montaña.', ARRAY['Ríos', 'Cascadas', 'Montaña']),
('Los Cacaos', 'los-cacaos-destino', '62497a8a-a540-4983-b781-aff3bab84eb4', 'Zona de montaña con cacao y experiencias agroturísticas.', ARRAY['Cacao', 'Montaña', 'Agroturismo']),
('Playa Palenque SC', 'playa-palenque-sc', '62497a8a-a540-4983-b781-aff3bab84eb4', 'Playa del sur con ambiente familiar y gastronomía local.', ARRAY['Playa', 'Familiar', 'Gastronomía']),

-- San José de Ocoa
('Ocoa', 'ocoa-destino', '5d5efb5e-989c-4b61-9573-37bb0547486f', 'Valle de montaña con clima fresco, café y paisajes espectaculares.', ARRAY['Café', 'Montaña', 'Valle']),
('Rancho Arriba', 'rancho-arriba-destino', '5d5efb5e-989c-4b61-9573-37bb0547486f', 'Zona de montaña con naturaleza y agricultura tradicional.', ARRAY['Montaña', 'Agricultura', 'Naturaleza']),
('Valle de Ocoa', 'valle-de-ocoa', '5d5efb5e-989c-4b61-9573-37bb0547486f', 'Valle fértil rodeado de montañas con producción agrícola.', ARRAY['Valle', 'Agricultura', 'Paisaje']),

-- San Juan
('Valle de San Juan', 'valle-de-san-juan', '819744b0-7047-4cf8-8b2b-79d127ffd2da', 'Uno de los valles más extensos y fértiles del país.', ARRAY['Valle', 'Agricultura', 'Extenso']),
('Presa de Sabaneta', 'presa-de-sabaneta', '819744b0-7047-4cf8-8b2b-79d127ffd2da', 'Embalse con paisajes naturales y oportunidades recreativas.', ARRAY['Embalse', 'Naturaleza', 'Recreación']),
('Cordillera Central Sur', 'cordillera-central-sur', '819744b0-7047-4cf8-8b2b-79d127ffd2da', 'Zona sur de la Cordillera Central con picos y senderos.', ARRAY['Cordillera', 'Senderismo', 'Montañismo']),

-- San Pedro de Macorís
('Juan Dolio', 'juan-dolio', 'b5605bce-6c02-43ff-873d-10deddcc6159', 'Zona turística con playas, golf y cercanía a Santo Domingo.', ARRAY['Playa', 'Golf', 'Resorts']),
('Guayacanes', 'guayacanes-destino', 'b5605bce-6c02-43ff-873d-10deddcc6159', 'Playa popular con ambiente local y gastronomía de mar.', ARRAY['Playa', 'Local', 'Mariscos']),
('San Pedro', 'san-pedro-destino', 'b5605bce-6c02-43ff-873d-10deddcc6159', 'Ciudad del béisbol con patrimonio azucarero y cultura.', ARRAY['Béisbol', 'Azúcar', 'Cultura']),

-- Sánchez Ramírez
('Cotuí', 'cotui-destino', '76f84651-f60b-4a37-a159-5ea608bec0ed', 'Ciudad con tradiciones mineras y acceso a la Presa de Hatillo.', ARRAY['Minería', 'Tradición', 'Naturaleza']),
('Presa de Hatillo', 'presa-de-hatillo', '76f84651-f60b-4a37-a159-5ea608bec0ed', 'Mayor embalse del Caribe con pesca deportiva y paisajes.', ARRAY['Embalse', 'Pesca', 'Paisaje']),
('Valle del Yuna', 'valle-del-yuna', '76f84651-f60b-4a37-a159-5ea608bec0ed', 'Valle del río Yuna con arrozales y paisajes agrícolas.', ARRAY['Valle', 'Arroz', 'Río Yuna']),

-- Santiago
('Santiago', 'santiago', '2e2743bd-0d04-4d4e-baf1-384cd3734558', 'Segunda ciudad del país con el Monumento a los Héroes y cultura cibaeña.', ARRAY['Monumento', 'Cultura', 'Gastronomía']),
('San José de las Matas', 'san-jose-de-las-matas-destino', '2e2743bd-0d04-4d4e-baf1-384cd3734558', 'Pueblo de montaña con café, ríos y clima primaveral.', ARRAY['Café', 'Ríos', 'Montaña']),
('Jánico', 'janico-destino', '2e2743bd-0d04-4d4e-baf1-384cd3734558', 'Municipio de montaña con naturaleza y tradiciones rurales.', ARRAY['Montaña', 'Rural', 'Naturaleza']),
('Cordillera Central Norte Santiago', 'cordillera-central-norte-santiago', '2e2743bd-0d04-4d4e-baf1-384cd3734558', 'Acceso a la Cordillera Central desde Santiago con senderos.', ARRAY['Cordillera', 'Senderismo', 'Aventura']),

-- Santiago Rodríguez
('Presa de Monción', 'presa-de-moncion', '42abf568-49fb-45f6-9ce1-6a9ff1c0d6c2', 'Embalse con paisajes naturales y oportunidades de pesca.', ARRAY['Embalse', 'Pesca', 'Naturaleza']),
('Sabaneta', 'sabaneta-destino', '42abf568-49fb-45f6-9ce1-6a9ff1c0d6c2', 'Cabecera provincial con tradiciones y naturaleza de la línea noroeste.', ARRAY['Tradición', 'Naturaleza', 'Línea noroeste']),

-- Santo Domingo
('Playa de Boca Chica', 'playa-boca-chica', '59d66745-16f6-4302-84d7-a0c5e0241033', 'Playa más cercana a la capital con aguas tranquilas y arrecife natural.', ARRAY['Playa', 'Arrecife', 'Cercana a la capital']),

-- Valverde
('Valle del Yaque del Norte', 'valle-yaque-del-norte', '241d725c-37e3-40fe-ac80-186bc2d5b2ff', 'Valle fértil del río más largo del país con agricultura y paisajes.', ARRAY['Valle', 'Río Yaque', 'Agricultura']),

-- Distrito Nacional
('Zona Colonial', 'zona-colonial', 'e2e82941-73d9-4b15-9083-3ca94c6e06da', 'Primera ciudad del Nuevo Mundo, Patrimonio de la Humanidad por la UNESCO.', ARRAY['UNESCO', 'Historia', 'Arquitectura']),
('Malecón de Santo Domingo', 'malecon-santo-domingo', 'e2e82941-73d9-4b15-9083-3ca94c6e06da', 'Icónico paseo marítimo de la capital con vida nocturna y vistas al mar.', ARRAY['Malecón', 'Vida nocturna', 'Mar Caribe'])

ON CONFLICT DO NOTHING;
