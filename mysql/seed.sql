-- ============================================================
-- DATA SEMILLA PARA MYSQL 8.x
-- PROYECTO: Descubre República Dominicana
-- ============================================================

USE `public`;

-- 1. PROVINCIAS
INSERT INTO `provinces` (`id`, `name`, `region`, `description`, `image_url`) VALUES
('p-santiago', 'Santiago', 'Cibao Norte', 'Cuna del ron y el tabaco, corazón del Cibao.', 'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?w=600'),
('p-samana', 'Samaná', 'Noreste', 'El paraíso de las ballenas jorobadas y cocoteros.', 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600'),
('p-santo-domingo', 'Santo Domingo', 'Metropolitana', 'La ciudad primada de América, historia viva.', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'),
('p-la-altagracia', 'La Altagracia', 'Este', 'Hogar del polo turístico más visitado, Punta Cana.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600');

-- 2. DESTINOS
INSERT INTO `destinations` (`id`, `name`, `slug`, `province_id`, `description`, `short_description`, `image_url`, `gallery`, `highlights`, `typical_dishes`, `latitude`, `longitude`, `weather_info`, `best_time_to_visit`, `how_to_get_there`) VALUES
('d-sajoma', 'San José de las Matas (SAJOMA)', 'sajoma', 'p-santiago', 'Municipio enclavado en la Cordillera Central, ideal para el ecoturismo.', 'El corazón ecoturístico de Santiago.', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600', '["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600"]', '["Río Bao", "Aguas Calientes", "Iglesia de La Altagracia"]', '["Chivo liniero", "Moro de guandules"]', 19.3386, -70.9388, 'Cálido en el día, fresco en la noche (20-28°C)', 'Diciembre a Marzo', 'Tomar la carretera de SAJOMA desde Santiago de los Caballeros.'),
('d-las-terrenas', 'Las Terrenas', 'las-terrenas', 'p-samana', 'Antiguo pueblo de pescadores convertido en un destino vibrante de playas paradisíacas y gastronomía internacional.', 'Playas turquesas y cocoteros.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', '["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600"]', '["Playa Bonita", "Playa Cosón", "Pueblo de los Pescadores"]', '["Pescado con coco", "Pan de coco"]', 19.3174, -69.5422, 'Cálido tropical (24-30°C)', 'Diciembre a Abril', 'Tomar la Autopista del Nordeste desde Santo Domingo.'),
('d-zona-colonial', 'Zona Colonial de Santo Domingo', 'zona-colonial', 'p-santo-domingo', 'El casco histórico de la capital que alberga los primeros monumentos construidos por los españoles en América.', 'La primera ciudad del Nuevo Mundo.', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600', '["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600"]', '["Alcázar de Colón", "Catedral Primada", "Calle Las Damas"]', '["Sancocho", "Mofongo"]', 18.4735, -69.8858, 'Cálido y húmedo (23-31°C)', 'Todo el año (preferiblemente meses secos)', 'Ubicada en el centro histórico de Santo Domingo.');

-- 3. ÁREAS PROTEGIDAS
INSERT INTO `protected_areas` (`id`, `name`, `slug`, `category`, `location`, `size`, `fee`, `hours`, `attractions`, `rules`, `description`) VALUES
('pa-haitises', 'Parque Nacional Los Haitises', 'los-haitises', 'Parque Nacional', 'Samaná / Hato Mayor', '601 km²', 'RD$ 150 (Nacionales) / RD$ 250 (Extranjeros)', '8:00 AM - 5:00 PM', '["Cayos de piedra caliza", "Cueva de la Arena", "Manglares vírgenes"]', '["Solo barcos con licencia autorizada", "Prohibido arrojar basura", "Uso obligatorio de chalecos salvavidas"]', 'Una de las joyas ecológicas de RD. Famoso por sus mogotes, densos bosques de manglares y cuevas que conservan pictografías taínas.'),
('pa-mamiferos', 'Santuario de Mamíferos Marinos', 'santuario-mamiferos', 'Santuario', 'Bahía de Samaná', '3,500 km²', 'RD$ 150 por persona', '8:00 AM - 5:00 PM', '["Avistamiento de Ballenas Jorobadas", "Cayo Levantado"]', '["Distancia mínima de barcos a ballenas: 80m", "Tiempo límite de observación: 30 mins"]', 'Establecido para proteger a las miles de ballenas jorobadas que migran cada invierno desde el Atlántico Norte para dar a luz y aparearse.');

-- 4. ESPECIES DE AVES
INSERT INTO `bird_species` (`id`, `name`, `scientific_name`, `status`, `conservation`, `description`, `best_locations`, `avatar`) VALUES
('bs-cigua', 'Cigua Palmera', 'Dulus dominicus', 'Endémica', 'Preocupación Menor', 'El ave nacional de la República Dominicana. Construye enormes nidos comunales en la copa de palmas reales.', '["Santo Domingo", "Jarabacoa", "Punta Cana"]', '🐤'),
('bs-barrancoli', 'Barrancolí', 'Todus subulatus', 'Endémica', 'Preocupación Menor', 'Una pequeña joya alada de color verde brillante con garganta roja intensa.', '["Sierra de Bahoruco", "Los Haitises", "Constanza"]', '🐦');

-- 5. AGUAS TERMALES
INSERT INTO `hot_springs` (`id`, `name`, `location`, `province`, `temp_celsius`, `properties`, `description`, `access`, `price`, `avatar`) VALUES
('hs-sajoma', 'Aguas Calientes (San José de las Matas)', 'Los Montones, SAJOMA', 'Santiago', 38.0, '["Relajación muscular", "Alivio del estrés", "Estimulación circulatoria"]', 'Cuenta con dos piscinas alimentadas por un manantial de aguas termales azufradas junto al hermoso Río Bao.', 'Fácil', 'RD$ 150', '♨️'),
('hs-vicente', 'Balneario La Azufrada (Canoa)', 'Canoa, Vicente Noble', 'Barahona', 34.0, '["Salud dermatológica", "Problemas de articulaciones"]', 'Famoso balneario natural de aguas azufradas conocido popularmente por sus propiedades medicinales.', 'Fácil', 'Gratuito', '🧖');

-- 6. RUTAS DE PEAJES
INSERT INTO `toll_routes` (`id`, `name`, `description`, `tolls_data`) VALUES
('tr-este', 'Autovía del Este (Santo Domingo - Punta Cana)', 'Ruta desde la capital hacia los polos turísticos de La Romana, Bayahibe, Bávaro y Punta Cana.', '[{"name": "Peaje Las Américas", "cat1Price": 60, "cat2Price": 120, "cat3Price": 180, "cat4Price": 240}, {"name": "Peaje Coral I (La Romana)", "cat1Price": 100, "cat2Price": 200, "cat3Price": 300, "cat4Price": 400}]'),
('tr-duarte', 'Autopista Duarte (Santo Domingo - Santiago)', 'Vía de conexión principal hacia la región del Cibao.', '[{"name": "Peaje Duarte (Km 25)", "cat1Price": 60, "cat2Price": 120, "cat3Price": 180, "cat4Price": 240}]');

-- 7. REPORTES MARINOS
INSERT INTO `marine_reports` (`id`, `location`, `wind_speed`, `wind_direction`, `wave_height`, `wave_period`, `water_temp`, `condition_rating`, `recommendation`) VALUES
('mr-encuentro', 'Cabarete (Playa Encuentro)', 18.5, 'ENE', 1.8, 8, 27.5, 'Excelente', 'Ideal para Surf en la mañana y Kitesurf en la tarde con ráfagas constantes de viento.'),
('mr-bonita', 'Las Terrenas (Playa Bonita)', 12.0, 'NE', 1.2, 7, 28.0, 'Buena', 'Buenas condiciones para Surfistas principiantes e intermedios.');

-- 8. LIGAS DE GAMIFICACIÓN
INSERT INTO `gamification_leagues` (`id`, `name`, `slug`, `icon`, `min_xp_week`, `max_xp_week`, `color`, `bg_color`, `coin_reward`, `display_order`) VALUES
('l-bronze', 'Bronce', 'bronze', '🥉', 0, 199, '#CD7F32', '#FEF3C7', 10, 1),
('l-silver', 'Plata', 'silver', '🥈', 200, 499, '#9CA3AF', '#F1F5F9', 25, 2),
('l-gold', 'Oro', 'gold', '🥇', 500, 999, '#F59E0B', '#FFFBEB', 50, 3),
('l-platinum', 'Platino', 'platinum', '💎', 1000, 2499, '#06B6D4', '#ECFEFF', 100, 4),
('l-diamond', 'Diamante', 'diamond', '👑', 2500, NULL, '#8B5CF6', '#F5F3FF', 200, 5);

-- 9. NIVELES DE GAMIFICACIÓN
INSERT INTO `gamification_levels` (`id`, `level_number`, `title`, `xp_required`, `icon`, `color`, `marketplace_discount`, `perks`) VALUES
('lvl-1', 1, 'Explorador Novato', 0, '🌱', '#8B5CF6', 0, '["Acceso a retos diarios"]'),
('lvl-2', 2, 'Caminante del Sendero', 100, '🚶', '#3B82F6', 5, '["Acceso a retos semanales", "Descuento del 5% en marketplace"]'),
('lvl-3', 3, 'Descubridor Costero', 300, '🏖️', '#10B981', 10, '["Acceso a trivias avanzadas", "Descuento del 10% en marketplace"]');

-- 10. MISIONES DE GAMIFICACIÓN
INSERT INTO `gamification_missions` (`id`, `name`, `description`, `target_action`, `target_count`, `xp_reward`, `coin_reward`, `mission_type`, `is_featured`, `is_active`, `min_level`, `icon`) VALUES
('m-daily-checkin', 'Fiel Viajero', 'Realiza tu check-in diario para mantener tu racha.', 'daily_checkin', 1, 15, 5, 'daily', TRUE, TRUE, 1, '🔥'),
('m-read-article', 'Turista Culto', 'Lee un artículo informativo del blog por al menos 2 minutos.', 'article_read', 1, 25, 10, 'daily', FALSE, TRUE, 1, '📖'),
('m-share-content', 'Embajador Digital', 'Comparte destinos del portal con tus amigos.', 'share_content', 1, 20, 5, 'daily', FALSE, TRUE, 1, '🔗');

-- 11. HITOS DE XP (XP MILESTONES)
INSERT INTO `xp_milestones` (`id`, `xp_threshold`, `badge_icon`, `badge_name`, `coin_reward`, `description`) VALUES
('mil-1', 500, '⚡', 'Primer Rayo', 25, 'Alcanzaste 500 XP'),
('mil-2', 1000, '🌟', 'Estrella Naciente', 50, 'Alcanzaste 1,000 XP'),
('mil-3', 2500, '💫', 'Astro RD', 75, 'Alcanzaste 2,500 XP');

-- 12. LOGROS (ACHIEVEMENTS)
INSERT INTO `achievements` (`id`, `name`, `description`, `short_description`, `icon`, `xp_reward`, `coin_reward`, `category`, `display_order`, `is_active`, `rarity`) VALUES
('ach-carnaval', 'Espíritu de Carnaval', 'Participa activamente durante el Carnaval dominicano', 'Activo en Carnaval', '🎭', 200, 100, 'seasonal', 100, TRUE, 'epic'),
('ach-ambar', 'Ámbar Dominicano', 'Descubre el origen del ámbar dominicano en Santiago', 'Coleccionista de ámbar', '💎', 175, 75, 'culture', 111, TRUE, 'rare');

-- 13. PREMIOS DE CANJE (GAMIFICATION PRIZES)
INSERT INTO `gamification_prizes` (`id`, `name`, `description`, `short_description`, `prize_type`, `coin_cost`, `min_level`, `quantity_available`, `is_featured`, `sponsor`) VALUES
('prz-daypass', 'Daypass Resort', 'Disfruta un día completo en un resort all-inclusive de Punta Cana', 'Día en resort all-inclusive', 'experience', 500, 4, 10, TRUE, 'Resorts RD'),
('prz-cena', 'Cena para 2', 'Cena romántica en restaurante gourmet de Santo Domingo', 'Cena romántica gourmet', 'experience', 300, 3, 20, TRUE, 'Gastro RD'),
('prz-ballenas', 'Tour de Ballenas', 'Excursión de avistamiento de ballenas en Samaná', 'Tour ballenas Samaná', 'experience', 400, 3, 15, TRUE, 'Whale Samaná'),
('prz-cafe', 'Kit Café Premium', 'Set de café orgánico de Jarabacoa + taza artesanal', 'Kit café artesanal', 'product', 150, 2, 50, FALSE, 'Café RD');

-- 14. TEMPORADAS DE LIGAS (GAMIFICATION SEASONS)
INSERT INTO `gamification_seasons` (`id`, `name`, `number`, `starts_at`, `ends_at`, `is_active`) VALUES
('s-current', 'Temporada de Verano 2026', 1, '2026-06-01 00:00:00', '2026-08-31 23:59:59', TRUE);
