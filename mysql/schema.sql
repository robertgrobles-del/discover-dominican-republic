-- ============================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS PARA MYSQL 8.x
-- PROYECTO: Descubre República Dominicana
-- ============================================================

CREATE DATABASE IF NOT EXISTS `public`;
USE `public`;

-- ─── 0. TABLA DE USUARIOS DE SISTEMA (REEMPLAZO DE auth.users) ─────────────
CREATE TABLE IF NOT EXISTS `users` (
    `id` VARCHAR(36) PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── 1. SEGURIDAD Y PERFILES DE USUARIO ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS `profiles` (
    `id` VARCHAR(36) PRIMARY KEY,
    `display_name` VARCHAR(255) NULL,
    `avatar_url` VARCHAR(512) NULL,
    `bio` TEXT NULL,
    `role` VARCHAR(50) DEFAULT 'user',
    `is_suspended` BOOLEAN DEFAULT FALSE,
    `suspension_reason` TEXT NULL,
    `travel_interests` JSON NULL, -- Reemplaza TEXT[]
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `user_roles` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `role` ENUM('admin', 'moderator', 'user') NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `idx_user_role` (`user_id`, `role`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `partner_profiles` (
    `id` VARCHAR(36) PRIMARY KEY,
    `business_name` VARCHAR(255) NOT NULL,
    `business_type` ENUM('hotel', 'restaurant', 'bar', 'tour', 'spa', 'shop', 'operador', 'agencia', 'guia') NOT NULL,
    `phone` VARCHAR(50) NULL,
    `email` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `rating` DECIMAL(3,2) DEFAULT 5.00,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

-- ─── 2. GEOGRAFÍA Y DESTINOS ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `provinces` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL UNIQUE,
    `region` VARCHAR(100) NULL,
    `description` TEXT NULL,
    `image_url` VARCHAR(512) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `province_visits` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `province` VARCHAR(255) NOT NULL,
    `visited_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `idx_user_province_visit` (`user_id`, `province`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `destinations` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `province_id` VARCHAR(36) NULL,
    `description` TEXT NULL,
    `short_description` TEXT NULL,
    `image_url` VARCHAR(512) NULL,
    `gallery` JSON NULL,
    `highlights` JSON NULL,
    `typical_dishes` JSON NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `weather_info` TEXT NULL,
    `best_time_to_visit` VARCHAR(255) NULL,
    `how_to_get_there` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`province_id`) REFERENCES `provinces` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `municipalities` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `province_id` VARCHAR(36) NOT NULL,
    `municipality_type` VARCHAR(100) NULL,
    `description` TEXT NULL,
    `short_description` TEXT NULL,
    `image_url` VARCHAR(512) NULL,
    `gallery` JSON NULL,
    `highlights` JSON NULL,
    `population` INT NULL,
    `area_km2` DECIMAL(10, 2) NULL,
    `is_tourist_destination` BOOLEAN DEFAULT FALSE,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`province_id`) REFERENCES `provinces` (`id`) ON DELETE CASCADE
);

-- ─── 3. ALOJAMIENTO Y ESTABLECIMIENTOS ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS `hotels` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `destination_id` VARCHAR(36) NULL,
    `category` VARCHAR(100) NULL,
    `stars` INT NULL CHECK (`stars` BETWEEN 1 AND 5),
    `description` TEXT NULL,
    `short_description` TEXT NULL,
    `image_url` VARCHAR(512) NULL,
    `gallery` JSON NULL,
    `address` VARCHAR(512) NULL,
    `phone` VARCHAR(50) NULL,
    `email` VARCHAR(255) NULL,
    `website` VARCHAR(255) NULL,
    `price_range` VARCHAR(100) NULL,
    `amenities` JSON NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `rating` DECIMAL(3,2) DEFAULT 0.00,
    `is_featured` BOOLEAN DEFAULT FALSE,
    `is_sponsored` BOOLEAN DEFAULT FALSE,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `airbnb_listings` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `destination_id` VARCHAR(36) NULL,
    `property_type` VARCHAR(100) NULL,
    `description` TEXT NULL,
    `short_description` TEXT NULL,
    `image_url` VARCHAR(512) NULL,
    `gallery` JSON NULL,
    `address` VARCHAR(512) NULL,
    `guests` INT NULL,
    `bedrooms` INT NULL,
    `beds` INT NULL,
    `bathrooms` INT NULL,
    `price_per_night` DECIMAL(10, 2) NULL,
    `cleaning_fee` DECIMAL(10, 2) DEFAULT 0.00,
    `service_fee` DECIMAL(10, 2) DEFAULT 0.00,
    `amenities` JSON NULL,
    `house_rules` JSON NULL,
    `check_in_time` VARCHAR(50) NULL,
    `check_out_time` VARCHAR(50) NULL,
    `cancellation_policy` TEXT NULL,
    `host_name` VARCHAR(255) NULL,
    `host_image` VARCHAR(512) NULL,
    `host_description` TEXT NULL,
    `is_superhost` BOOLEAN DEFAULT FALSE,
    `min_nights` INT DEFAULT 1,
    `max_nights` INT DEFAULT 1125,
    `instant_book` BOOLEAN DEFAULT FALSE,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `rating` DECIMAL(3,2) DEFAULT 0.00,
    `is_featured` BOOLEAN DEFAULT FALSE,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `restaurants` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `destination_id` VARCHAR(36) NULL,
    `cuisine_type` JSON NULL,
    `price_range` VARCHAR(50) NULL,
    `description` TEXT NULL,
    `short_description` TEXT NULL,
    `image_url` VARCHAR(512) NULL,
    `gallery` JSON NULL,
    `address` VARCHAR(512) NULL,
    `phone` VARCHAR(50) NULL,
    `website` VARCHAR(255) NULL,
    `opening_hours` JSON NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `rating` DECIMAL(3,2) DEFAULT 0.00,
    `is_featured` BOOLEAN DEFAULT FALSE,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `bars` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `destination_id` VARCHAR(36) NULL,
    `bar_type` JSON NULL,
    `price_range` VARCHAR(50) NULL,
    `description` TEXT NULL,
    `short_description` TEXT NULL,
    `image_url` VARCHAR(512) NULL,
    `gallery` JSON NULL,
    `address` VARCHAR(512) NULL,
    `phone` VARCHAR(50) NULL,
    `opening_hours` JSON NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `rating` DECIMAL(3,2) DEFAULT 0.00,
    `is_featured` BOOLEAN DEFAULT FALSE,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `analytics_events` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `event_type` VARCHAR(100) NOT NULL,
    `page` VARCHAR(255) NULL,
    `session_id` VARCHAR(100) NULL,
    `metadata` JSON NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `ad_banners` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NULL UNIQUE,
    `image_url` VARCHAR(512) NULL,
    `alt_text` VARCHAR(255) NULL,
    `target_url` VARCHAR(512) NULL,
    `headline` VARCHAR(255) NULL,
    `subtext` TEXT NULL,
    `cta_text` VARCHAR(100) NULL,
    `sponsor` VARCHAR(255) NULL,
    `banner_type` VARCHAR(100) NULL,
    `placement` VARCHAR(100) NULL,
    `section` VARCHAR(100) NULL,
    `page` VARCHAR(100) NULL,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `priority` INT DEFAULT 0,
    `is_active` BOOLEAN DEFAULT TRUE,
    `is_featured` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `tour_guides` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `languages` JSON NULL,
    `bio` TEXT NULL,
    `avatar_url` VARCHAR(512) NULL,
    `rating` DECIMAL(3,2) DEFAULT 5.00,
    `price_per_day` DECIMAL(10, 2) NULL,
    `phone` VARCHAR(50) NULL,
    `email` VARCHAR(255) NULL,
    `specialties` JSON NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `is_eco_guide` BOOLEAN DEFAULT FALSE,
    `eco_license` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `travel_agencies` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `description` TEXT NULL,
    `logo_url` VARCHAR(512) NULL,
    `address` VARCHAR(512) NULL,
    `phone` VARCHAR(50) NULL,
    `email` VARCHAR(255) NULL,
    `website` VARCHAR(255) NULL,
    `services` JSON NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `is_verified` BOOLEAN DEFAULT FALSE,
    `verification_status` VARCHAR(50) DEFAULT 'pending',
    `verified_at` TIMESTAMP NULL,
    `verification_notes` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `tour_operators` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `description` TEXT NULL,
    `logo_url` VARCHAR(512) NULL,
    `address` VARCHAR(512) NULL,
    `phone` VARCHAR(50) NULL,
    `email` VARCHAR(255) NULL,
    `website` VARCHAR(255) NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `is_verified` BOOLEAN DEFAULT FALSE,
    `verification_status` VARCHAR(50) DEFAULT 'pending',
    `verified_at` TIMESTAMP NULL,
    `verification_notes` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `experiences` (
    `id` VARCHAR(36) PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `destination_id` VARCHAR(36) NULL,
    `category` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `short_description` TEXT NULL,
    `image_url` VARCHAR(512) NULL,
    `gallery` JSON NULL,
    `duration` VARCHAR(100) NULL,
    `price` DECIMAL(10,2) NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `events` (
    `id` VARCHAR(36) PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `destination_id` VARCHAR(36) NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NULL,
    `location` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `image_url` VARCHAR(512) NULL,
    `category` VARCHAR(100) NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `clinics` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `destination_id` VARCHAR(36) NULL,
    `address` VARCHAR(512) NULL,
    `phone` VARCHAR(50) NULL,
    `email` VARCHAR(255) NULL,
    `website` VARCHAR(255) NULL,
    `specialties` JSON NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `ports_marinas` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `destination_id` VARCHAR(36) NULL,
    `port_type` ENUM('port', 'marina', 'both') NOT NULL,
    `description` TEXT NULL,
    `image_url` VARCHAR(512) NULL,
    `capacity_slips` INT NULL,
    `max_draft_feet` DECIMAL(5,2) NULL,
    `services` JSON NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `golf_courses` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `destination_id` VARCHAR(36) NULL,
    `holes` INT NOT NULL,
    `par` INT NOT NULL,
    `designer` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `image_url` VARCHAR(512) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `spas_wellness` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `destination_id` VARCHAR(36) NULL,
    `description` TEXT NULL,
    `address` VARCHAR(512) NULL,
    `phone` VARCHAR(50) NULL,
    `website` VARCHAR(255) NULL,
    `image_url` VARCHAR(512) NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `shopping_centers` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `destination_id` VARCHAR(36) NULL,
    `address` VARCHAR(512) NULL,
    `phone` VARCHAR(50) NULL,
    `website` VARCHAR(255) NULL,
    `image_url` VARCHAR(512) NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `souvenirs` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `typical_price` VARCHAR(100) NULL,
    `image_url` VARCHAR(512) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── 4. TRANSACCIONES Y RESERVAS ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `reservations` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `partner_id` VARCHAR(36) NOT NULL,
    `entity_type` VARCHAR(100) NOT NULL,
    `entity_id` VARCHAR(36) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NULL,
    `total_price` DECIMAL(10, 2) DEFAULT 0.00,
    `status` VARCHAR(50) DEFAULT 'pending',
    `contact_name` VARCHAR(255) NOT NULL,
    `contact_phone` VARCHAR(50) NULL,
    `contact_email` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `reviews` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `entity_type` VARCHAR(100) NOT NULL,
    `entity_id` VARCHAR(36) NOT NULL,
    `rating` INT NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
    `comment` TEXT NULL,
    `is_approved` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `favorites` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `entity_type` VARCHAR(100) NOT NULL,
    `entity_id` VARCHAR(36) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `idx_user_favorite_entity` (`user_id`, `entity_type`, `entity_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

-- ─── 5. GAMIFICACIÓN Y RECOMPENSAS ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `gamification_levels` (
    `id` VARCHAR(36) PRIMARY KEY,
    `level_number` INT NOT NULL UNIQUE,
    `title` VARCHAR(255) NOT NULL,
    `xp_required` INT NOT NULL,
    `icon` VARCHAR(50) NOT NULL DEFAULT '🌱',
    `color` VARCHAR(50) NOT NULL DEFAULT '#8B5CF6',
    `marketplace_discount` INT DEFAULT 0,
    `perks` JSON NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `achievements` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `short_description` VARCHAR(255) NULL,
    `icon` VARCHAR(50) NOT NULL DEFAULT '🏆',
    `xp_reward` INT DEFAULT 0,
    `coin_reward` INT DEFAULT 0,
    `category` VARCHAR(100) NOT NULL,
    `display_order` INT DEFAULT 0,
    `is_active` BOOLEAN DEFAULT TRUE,
    `season` VARCHAR(100) NULL,
    `available_from` DATE NULL,
    `available_until` DATE NULL,
    `is_secret` BOOLEAN DEFAULT FALSE,
    `rarity` VARCHAR(50) DEFAULT 'common',
    `progress_max` INT DEFAULT 1,
    `total_unlocked` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `user_achievements` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `achievement_id` VARCHAR(36) NOT NULL,
    `progress` INT DEFAULT 0,
    `unlocked_at` TIMESTAMP NULL,
    UNIQUE KEY `idx_user_achievement` (`user_id`, `achievement_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`achievement_id`) REFERENCES `achievements` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `user_gamification` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL UNIQUE,
    `total_xp` INT DEFAULT 0,
    `coins` INT DEFAULT 0,
    `current_level` INT DEFAULT 1,
    `streak_days` INT DEFAULT 0,
    `total_missions_completed` INT DEFAULT 0,
    `total_purchases` INT DEFAULT 0,
    `total_referrals` INT DEFAULT 0,
    `last_activity_date` DATE NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `gamification_prizes` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `short_description` VARCHAR(255) NULL,
    `image_url` VARCHAR(512) NULL,
    `prize_type` VARCHAR(100) NOT NULL DEFAULT 'experience',
    `coin_cost` INT NOT NULL DEFAULT 100,
    `min_level` INT DEFAULT 1,
    `quantity_available` INT NULL,
    `quantity_redeemed` INT DEFAULT 0,
    `is_active` BOOLEAN DEFAULT TRUE,
    `is_featured` BOOLEAN DEFAULT FALSE,
    `sponsor` VARCHAR(255) NULL,
    `valid_until` DATE NULL,
    `terms` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `user_prize_redemptions` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `prize_id` VARCHAR(36) NOT NULL,
    `coins_spent` INT NOT NULL,
    `status` VARCHAR(50) DEFAULT 'pending',
    `redemption_code` VARCHAR(100) NULL,
    `redeemed_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`prize_id`) REFERENCES `gamification_prizes` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `referral_codes` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL UNIQUE,
    `code` VARCHAR(50) NOT NULL UNIQUE,
    `total_referrals` INT DEFAULT 0,
    `total_earnings_coins` INT DEFAULT 0,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `referral_uses` (
    `id` VARCHAR(36) PRIMARY KEY,
    `referral_code_id` VARCHAR(36) NOT NULL,
    `referred_user_id` VARCHAR(36) NOT NULL UNIQUE,
    `xp_awarded` INT DEFAULT 0,
    `coins_awarded` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`referral_code_id`) REFERENCES `referral_codes` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`referred_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `gamification_transactions` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `transaction_type` VARCHAR(50) NOT NULL,
    `xp_amount` INT DEFAULT 0,
    `coin_amount` INT DEFAULT 0,
    `description` VARCHAR(255) NULL,
    `source_type` VARCHAR(100) NULL,
    `source_id` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

-- Passport digital (pasaporte-digital): sellos, rutas gamificadas, coleccionables.
-- Reemplaza la definición anterior de user_checkpoint_completions/user_collectibles,
-- que no coincidía con lo que consulta src/hooks/usePassport.tsx.
CREATE TABLE IF NOT EXISTS `passport_stamps` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `user_id` VARCHAR(36) NOT NULL,
    `destination_id` VARCHAR(36),
    `beach_id` VARCHAR(36),
    `hotel_id` VARCHAR(36),
    `restaurant_id` VARCHAR(36),
    `experience_id` VARCHAR(36),
    `stamp_type` VARCHAR(50) NOT NULL,
    `stamp_name` TEXT NOT NULL,
    `stamp_location` TEXT,
    `stamp_image` TEXT,
    `visited_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `verification_method` VARCHAR(50),
    `verification_data` JSON,
    `xp_earned` INT DEFAULT 0,
    `coins_earned` INT DEFAULT 0,
    `notes` TEXT,
    `photos` JSON,
    `rating` INT,
    `is_verified` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`beach_id`) REFERENCES `beaches` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`experience_id`) REFERENCES `experiences` (`id`) ON DELETE CASCADE
);
CREATE INDEX `idx_passport_stamps_user_id` ON `passport_stamps` (`user_id`);

CREATE TABLE IF NOT EXISTS `gamified_routes` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `name` TEXT NOT NULL,
    `slug` VARCHAR(255) UNIQUE,
    `description` TEXT,
    `short_description` TEXT,
    `route_type` VARCHAR(50) NOT NULL DEFAULT 'adventure',
    `difficulty` VARCHAR(50),
    `duration_days` INT,
    `distance_km` DECIMAL(12,2),
    `total_xp_reward` INT DEFAULT 0,
    `total_coin_reward` INT DEFAULT 0,
    `completion_badge_id` VARCHAR(36),
    `image_url` TEXT,
    `gallery` JSON,
    `min_level` INT DEFAULT 1,
    `is_featured` BOOLEAN DEFAULT FALSE,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (`completion_badge_id`) REFERENCES `gamification_prizes` (`id`)
);

CREATE TABLE IF NOT EXISTS `route_checkpoints` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `route_id` VARCHAR(36) NOT NULL,
    `checkpoint_order` INT NOT NULL,
    `checkpoint_name` TEXT NOT NULL,
    `checkpoint_description` TEXT,
    `checkpoint_type` VARCHAR(50) NOT NULL,
    `destination_id` VARCHAR(36),
    `beach_id` VARCHAR(36),
    `hotel_id` VARCHAR(36),
    `restaurant_id` VARCHAR(36),
    `experience_id` VARCHAR(36),
    `latitude` DECIMAL(10,8),
    `longitude` DECIMAL(11,8),
    `xp_reward` INT DEFAULT 10,
    `coin_reward` INT DEFAULT 0,
    `challenge_task` TEXT,
    `photo_required` BOOLEAN DEFAULT FALSE,
    `is_mandatory` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (`route_id`) REFERENCES `gamified_routes` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`),
    FOREIGN KEY (`beach_id`) REFERENCES `beaches` (`id`),
    FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`),
    FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`),
    FOREIGN KEY (`experience_id`) REFERENCES `experiences` (`id`)
);
CREATE INDEX `idx_route_checkpoints_route_id` ON `route_checkpoints` (`route_id`);

CREATE TABLE IF NOT EXISTS `user_route_progress` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `user_id` VARCHAR(36) NOT NULL,
    `route_id` VARCHAR(36) NOT NULL,
    `started_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `completed_at` TIMESTAMP NULL,
    `current_checkpoint` INT DEFAULT 0,
    `checkpoints_completed` INT DEFAULT 0,
    `total_checkpoints` INT DEFAULT 0,
    `total_xp_earned` INT DEFAULT 0,
    `total_coins_earned` INT DEFAULT 0,
    `is_completed` BOOLEAN DEFAULT FALSE,
    `completion_percentage` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (`user_id`, `route_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`route_id`) REFERENCES `gamified_routes` (`id`) ON DELETE CASCADE
);
CREATE INDEX `idx_user_route_progress_user_id` ON `user_route_progress` (`user_id`);

CREATE TABLE IF NOT EXISTS `user_checkpoint_completions` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `user_id` VARCHAR(36) NOT NULL,
    `route_id` VARCHAR(36) NOT NULL,
    `checkpoint_id` VARCHAR(36) NOT NULL,
    `completed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `photo_url` TEXT,
    `notes` TEXT,
    `verification_data` JSON,
    `xp_earned` INT DEFAULT 0,
    `coins_earned` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (`user_id`, `checkpoint_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`route_id`) REFERENCES `gamified_routes` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`checkpoint_id`) REFERENCES `route_checkpoints` (`id`) ON DELETE CASCADE
);
CREATE INDEX `idx_user_checkpoint_completions_user_route` ON `user_checkpoint_completions` (`user_id`, `route_id`);

CREATE TABLE IF NOT EXISTS `digital_collectibles` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `name` TEXT NOT NULL,
    `slug` VARCHAR(255) UNIQUE,
    `description` TEXT,
    `short_description` TEXT,
    `collectible_type` VARCHAR(50) NOT NULL,
    `rarity` VARCHAR(50) NOT NULL DEFAULT 'common',
    `image_url` TEXT,
    `animated_url` TEXT,
    `thumbnail_url` TEXT,
    `unlock_condition` TEXT,
    `unlock_requirement` JSON,
    `total_supply` INT,
    `current_supply` INT DEFAULT 0,
    `xp_value` INT DEFAULT 0,
    `coin_value` INT DEFAULT 0,
    `is_tradeable` BOOLEAN DEFAULT FALSE,
    `is_active` BOOLEAN DEFAULT TRUE,
    `season` VARCHAR(100),
    `event_id` VARCHAR(36),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (`event_id`) REFERENCES `events` (`id`)
);
CREATE INDEX `idx_digital_collectibles_rarity` ON `digital_collectibles` (`rarity`);

CREATE TABLE IF NOT EXISTS `user_collectibles` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `user_id` VARCHAR(36) NOT NULL,
    `collectible_id` VARCHAR(36) NOT NULL,
    `acquired_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `acquisition_method` VARCHAR(50),
    `is_favorite` BOOLEAN DEFAULT FALSE,
    `display_order` INT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (`user_id`, `collectible_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`collectible_id`) REFERENCES `digital_collectibles` (`id`) ON DELETE CASCADE
);
CREATE INDEX `idx_user_collectibles_user_id` ON `user_collectibles` (`user_id`);

CREATE TABLE IF NOT EXISTS `trivia_questions` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `question` TEXT NOT NULL,
    `options` JSON NOT NULL,
    `correct_index` INT NOT NULL,
    `category` VARCHAR(100) NOT NULL DEFAULT 'general',
    `difficulty` VARCHAR(50) NOT NULL DEFAULT 'medium',
    `explanation` TEXT,
    `xp_reward` INT NOT NULL DEFAULT 10,
    `image_url` TEXT,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `times_answered` INT NOT NULL DEFAULT 0,
    `times_correct` INT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS `trivia_sessions` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `user_id` VARCHAR(36) NOT NULL,
    `score` INT NOT NULL DEFAULT 0,
    `total_questions` INT NOT NULL DEFAULT 0,
    `correct_answers` INT NOT NULL DEFAULT 0,
    `xp_earned` INT NOT NULL DEFAULT 0,
    `coins_earned` INT NOT NULL DEFAULT 0,
    `max_streak` INT NOT NULL DEFAULT 0,
    `duration_seconds` INT,
    `completed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

-- ─── 6. CONTENIDO UGC Y COMUNIDAD ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `blog_posts` (
    `id` VARCHAR(36) PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `content` TEXT NOT NULL,
    `summary` VARCHAR(512) NULL,
    `image_url` VARCHAR(512) NULL,
    `author_id` VARCHAR(36) NULL,
    `category` VARCHAR(100) NULL,
    `published_at` TIMESTAMP NULL,
    `is_featured` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `post_comments` (
    `id` VARCHAR(36) PRIMARY KEY,
    `post_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `content` TEXT NOT NULL CHECK (CHAR_LENGTH(`content`) BETWEEN 3 AND 500),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`post_id`) REFERENCES `blog_posts` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `post_likes` (
    `id` VARCHAR(36) PRIMARY KEY,
    `post_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `idx_post_user_like` (`post_id`, `user_id`),
    FOREIGN KEY (`post_id`) REFERENCES `blog_posts` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `social_posts` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `content` TEXT NULL,
    `image_url` VARCHAR(512) NULL,
    `gallery` JSON NULL,
    `location` VARCHAR(255) NULL,
    `destination_id` VARCHAR(36) NULL,
    `likes_count` INT DEFAULT 0,
    `comments_count` INT DEFAULT 0,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `social_likes` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `post_id` VARCHAR(36) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `idx_social_user_like` (`user_id`, `post_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`post_id`) REFERENCES `social_posts` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `social_comments` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `post_id` VARCHAR(36) NOT NULL,
    `content` TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`post_id`) REFERENCES `social_posts` (`id`) ON DELETE CASCADE
);

-- ─── 7. AFILIADOS Y EMBAJADORES ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `ambassadors` (
    `id` VARCHAR(36) PRIMARY KEY,
    `referral_code` VARCHAR(50) NOT NULL UNIQUE,
    `sales_count` INT DEFAULT 0,
    `total_earned` DECIMAL(12, 2) DEFAULT 0.00,
    `pending_payout` DECIMAL(12, 2) DEFAULT 0.00,
    `tier` VARCHAR(50) DEFAULT 'bronze',
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `ambassador_referrals` (
    `id` VARCHAR(36) PRIMARY KEY,
    `ambassador_id` VARCHAR(36) NOT NULL,
    `referred_email` VARCHAR(255) NOT NULL,
    `sale_amount` DECIMAL(10, 2) NOT NULL,
    `commission_earned` DECIMAL(10, 2) NOT NULL,
    `status` VARCHAR(50) DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`ambassador_id`) REFERENCES `ambassadors` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `ambassador_payouts` (
    `id` VARCHAR(36) PRIMARY KEY,
    `ambassador_id` VARCHAR(36) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `status` VARCHAR(50) DEFAULT 'pending',
    `payout_method` VARCHAR(100) NOT NULL,
    `payout_details` TEXT NULL,
    `processed_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`ambassador_id`) REFERENCES `ambassadors` (`id`) ON DELETE CASCADE
);

-- ─── 8. PANEL DE ADMINISTRACIÓN Y AUDITORÍA ───────────────────────────────

CREATE TABLE IF NOT EXISTS `admin_activity_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `admin_id` VARCHAR(36) NULL,
    `action_type` VARCHAR(50) NOT NULL,
    `entity_name` VARCHAR(100) NOT NULL,
    `entity_id` VARCHAR(36) NULL,
    `old_data` JSON NULL,
    `new_data` JSON NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
);

-- ─── 9. ENCUESTAS Y VALORACIONES ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `survey_templates` (
    `id` VARCHAR(36) PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `questions` JSON NOT NULL,
    `is_active` BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS `survey_responses` (
    `id` VARCHAR(36) PRIMARY KEY,
    `template_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NULL,
    `responses` JSON NOT NULL,
    `nps_score` INT NULL CHECK (`nps_score` BETWEEN 0 AND 10),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`template_id`) REFERENCES `survey_templates` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `vacation_registrations` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `destination_id` VARCHAR(36) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `notes` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE CASCADE
);

-- ─── 10. ESPECIALES, CLIMA, SARGAZO, PEAJES ───────────────────────────────

CREATE TABLE IF NOT EXISTS `protected_areas` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) UNIQUE,
    `category` ENUM('Parque Nacional', 'Santuario', 'Reserva Científica') NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `size` VARCHAR(100) NOT NULL,
    `fee` VARCHAR(255) NOT NULL,
    `hours` VARCHAR(100) NOT NULL,
    `attractions` JSON NOT NULL,
    `rules` JSON NOT NULL,
    `description` TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `bird_species` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `scientific_name` VARCHAR(255) NOT NULL,
    `status` ENUM('Endémica', 'Residente', 'Migratoria') NOT NULL,
    `conservation` ENUM('Preocupación Menor', 'Vulnerable', 'En Peligro Crítico') NOT NULL,
    `description` TEXT NOT NULL,
    `best_locations` JSON NOT NULL,
    `avatar` VARCHAR(50) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `hot_springs` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `province` VARCHAR(255) NOT NULL,
    `temp_celsius` DECIMAL(4,1) NOT NULL,
    `properties` JSON NOT NULL,
    `description` TEXT NOT NULL,
    `access` ENUM('Fácil', 'Moderado', 'Aventura (Difícil)') NOT NULL,
    `price` VARCHAR(255) NOT NULL,
    `avatar` VARCHAR(50) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `offset_projects` (
    `id` VARCHAR(36) PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `category` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `cost_info` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `toll_routes` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `tolls_data` JSON NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `marine_reports` (
    `id` VARCHAR(36) PRIMARY KEY,
    `location` VARCHAR(255) NOT NULL,
    `wind_speed` DECIMAL(4,1) NOT NULL,
    `wind_direction` VARCHAR(20) NOT NULL,
    `wave_height` DECIMAL(3,1) NOT NULL,
    `wave_period` INT NOT NULL,
    `water_temp` DECIMAL(3,1) NOT NULL,
    `condition_rating` ENUM('Excelente', 'Buena', 'Regular', 'Mala') NOT NULL,
    `recommendation` TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `event_tickets` (
    `id` VARCHAR(36) PRIMARY KEY,
    `reservation_id` VARCHAR(36) NULL,
    `ticket_code` VARCHAR(255) UNIQUE NOT NULL,
    `status` ENUM('unused', 'scanned', 'cancelled') DEFAULT 'unused',
    `scanned_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `explorer_follows` (
    `id` VARCHAR(36) PRIMARY KEY,
    `follower_id` VARCHAR(36) NOT NULL,
    `following_id` VARCHAR(36) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `idx_explorer_follow` (`follower_id`, `following_id`),
    FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`following_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

-- ─── 11. GAMIFICACIÓN AVANZADA Y LIGAS ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `gamification_seasons` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `number` INT NOT NULL,
    `starts_at` TIMESTAMP NOT NULL,
    `ends_at` TIMESTAMP NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT FALSE,
    `top_rewards` JSON NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `gamification_leagues` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `icon` VARCHAR(50) NOT NULL DEFAULT '🏅',
    `min_xp_week` INT NOT NULL DEFAULT 0,
    `max_xp_week` INT NULL,
    `color` VARCHAR(50) NOT NULL DEFAULT '#6B7280',
    `bg_color` VARCHAR(50) NOT NULL DEFAULT '#F3F4F6',
    `coin_reward` INT NOT NULL DEFAULT 0,
    `display_order` INT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `user_league_stats` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `season_id` VARCHAR(36) NOT NULL,
    `league_slug` VARCHAR(255) NOT NULL DEFAULT 'bronze',
    `xp_this_week` INT NOT NULL DEFAULT 0,
    `xp_this_season` INT NOT NULL DEFAULT 0,
    `week_rank` INT NULL,
    `season_rank` INT NULL,
    `last_updated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `idx_user_season_league` (`user_id`, `season_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`season_id`) REFERENCES `gamification_seasons` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `photo_challenges` (
    `id` VARCHAR(36) PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `theme` VARCHAR(255) NOT NULL,
    `destination` VARCHAR(255) NULL,
    `starts_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `ends_at` TIMESTAMP NULL,
    `xp_reward` INT NOT NULL DEFAULT 100,
    `coin_reward` INT NOT NULL DEFAULT 50,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `photo_submissions` (
    `id` VARCHAR(36) PRIMARY KEY,
    `challenge_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `image_url` VARCHAR(512) NOT NULL,
    `caption` TEXT NULL,
    `votes` INT NOT NULL DEFAULT 0,
    `is_approved` BOOLEAN NOT NULL DEFAULT FALSE,
    `is_winner` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `idx_challenge_user` (`challenge_id`, `user_id`),
    FOREIGN KEY (`challenge_id`) REFERENCES `photo_challenges` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `photo_votes` (
    `id` VARCHAR(36) PRIMARY KEY,
    `submission_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `idx_submission_user` (`submission_id`, `user_id`),
    FOREIGN KEY (`submission_id`) REFERENCES `photo_submissions` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `explorer_guilds` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `description` TEXT NULL,
    `icon` VARCHAR(50) NOT NULL DEFAULT '🏴',
    `region` VARCHAR(255) NOT NULL,
    `member_count` INT NOT NULL DEFAULT 0,
    `total_xp` BIGINT NOT NULL DEFAULT 0,
    `is_official` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_by` VARCHAR(36) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `guild_members` (
    `id` VARCHAR(36) PRIMARY KEY,
    `guild_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `role` VARCHAR(100) NOT NULL DEFAULT 'member',
    `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `idx_guild_user` (`guild_id`, `user_id`),
    FOREIGN KEY (`guild_id`) REFERENCES `explorer_guilds` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `xp_milestones` (
    `id` VARCHAR(36) PRIMARY KEY,
    `xp_threshold` INT NOT NULL UNIQUE,
    `badge_icon` VARCHAR(50) NOT NULL,
    `badge_name` VARCHAR(255) NOT NULL,
    `coin_reward` INT NOT NULL DEFAULT 0,
    `description` TEXT NULL
);

CREATE TABLE IF NOT EXISTS `user_xp_milestones` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `milestone_id` VARCHAR(36) NOT NULL,
    `achieved_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `idx_user_milestone` (`user_id`, `milestone_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`milestone_id`) REFERENCES `xp_milestones` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `user_flags` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `flag_name` VARCHAR(255) NOT NULL,
    `value` TEXT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `idx_user_flag` (`user_id`, `flag_name`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `routes` (
    `id` VARCHAR(36) PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) UNIQUE NOT NULL,
    `description` TEXT NULL,
    `duration_hours` DECIMAL(4, 2) NULL,
    `distance_km` DECIMAL(6, 2) NULL,
    `difficulty` ENUM('facil', 'moderado', 'dificil') NULL,
    `gpx_track_url` VARCHAR(512) NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `route_stops` (
    `id` VARCHAR(36) PRIMARY KEY,
    `route_id` VARCHAR(36) NOT NULL,
    `stop_order` INT NOT NULL,
    `destination_id` VARCHAR(36) NOT NULL,
    `place_name` VARCHAR(255) NOT NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `notes` TEXT NULL,
    FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `audio_guides` (
    `id` VARCHAR(36) PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `audio_url` VARCHAR(512) NOT NULL,
    `language` VARCHAR(10) DEFAULT 'es',
    `associated_entity_type` VARCHAR(100) NOT NULL,
    `associated_entity_id` VARCHAR(36) NOT NULL,
    `duration_seconds` INT NULL
);

CREATE TABLE IF NOT EXISTS `ugc_reports` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NULL,
    `target_type` VARCHAR(100) NOT NULL,
    `target_id` VARCHAR(36) NOT NULL,
    `reason` VARCHAR(255) NOT NULL,
    `status` VARCHAR(50) DEFAULT 'pendiente' CHECK (`status` IN ('pendiente', 'revisado', 'ignorado')),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `reward_inventory` (
    `id` VARCHAR(36) PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `coins_cost` INT NOT NULL,
    `stock` INT DEFAULT 0,
    `is_physical` BOOLEAN DEFAULT FALSE,
    `image_url` VARCHAR(512) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `reward_shipments` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NULL,
    `reward_id` VARCHAR(36) NULL,
    `recipient_name` VARCHAR(255) NOT NULL,
    `recipient_phone` VARCHAR(50) NOT NULL,
    `shipping_address` TEXT NOT NULL,
    `courier_name` VARCHAR(100) NULL,
    `tracking_number` VARCHAR(100) NULL,
    `status` ENUM('pending', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    `shipped_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    FOREIGN KEY (`reward_id`) REFERENCES `reward_inventory` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `gamification_missions` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `target_action` VARCHAR(100) NOT NULL,
    `target_count` INT NOT NULL DEFAULT 1,
    `xp_reward` INT NOT NULL DEFAULT 0,
    `coin_reward` INT NOT NULL DEFAULT 0,
    `mission_type` ENUM('daily', 'weekly', 'story', 'onboarding') NOT NULL DEFAULT 'daily',
    `is_featured` BOOLEAN DEFAULT FALSE,
    `is_active` BOOLEAN DEFAULT TRUE,
    `min_level` INT DEFAULT 1,
    `icon` VARCHAR(50) DEFAULT '🎯',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `user_missions` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `mission_id` VARCHAR(36) NOT NULL,
    `progress` INT NOT NULL DEFAULT 0,
    `is_completed` BOOLEAN DEFAULT FALSE,
    `completed_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `idx_user_mission` (`user_id`, `mission_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`mission_id`) REFERENCES `gamification_missions` (`id`) ON DELETE CASCADE
);

-- ─── 12. TRIGGERS DE AUDITORÍA (MYSQL STYLE) ─────────────────────────────────

DELIMITER $$

CREATE TRIGGER `trg_audit_partner_profiles_insert`
AFTER INSERT ON `partner_profiles`
FOR EACH ROW
BEGIN
    INSERT INTO `admin_activity_logs` (action_type, entity_name, entity_id, new_data)
    VALUES ('INSERT', 'partner_profiles', NEW.id, JSON_OBJECT('id', NEW.id, 'business_name', NEW.business_name));
END$$

CREATE TRIGGER `trg_audit_partner_profiles_update`
AFTER UPDATE ON `partner_profiles`
FOR EACH ROW
BEGIN
    INSERT INTO `admin_activity_logs` (action_type, entity_name, entity_id, old_data, new_data)
    VALUES ('UPDATE', 'partner_profiles', NEW.id, JSON_OBJECT('id', OLD.id, 'business_name', OLD.business_name), JSON_OBJECT('id', NEW.id, 'business_name', NEW.business_name));
END$$

CREATE TRIGGER `trg_audit_partner_profiles_delete`
AFTER DELETE ON `partner_profiles`
FOR EACH ROW
BEGIN
    INSERT INTO `admin_activity_logs` (action_type, entity_name, entity_id, old_data)
    VALUES ('DELETE', 'partner_profiles', OLD.id, JSON_OBJECT('id', OLD.id, 'business_name', OLD.business_name));
END$$

-- Ambassadors Audit
CREATE TRIGGER `trg_audit_ambassadors_insert`
AFTER INSERT ON `ambassadors`
FOR EACH ROW
BEGIN
    INSERT INTO `admin_activity_logs` (action_type, entity_name, entity_id, new_data)
    VALUES ('INSERT', 'ambassadors', NEW.id, JSON_OBJECT('id', NEW.id, 'referral_code', NEW.referral_code));
END$$

CREATE TRIGGER `trg_audit_ambassadors_update`
AFTER UPDATE ON `ambassadors`
FOR EACH ROW
BEGIN
    INSERT INTO `admin_activity_logs` (action_type, entity_name, entity_id, old_data, new_data)
    VALUES ('UPDATE', 'ambassadors', NEW.id, JSON_OBJECT('id', OLD.id, 'referral_code', OLD.referral_code), JSON_OBJECT('id', NEW.id, 'referral_code', NEW.referral_code));
END$$

CREATE TRIGGER `trg_audit_ambassadors_delete`
AFTER DELETE ON `ambassadors`
FOR EACH ROW
BEGIN
    INSERT INTO `admin_activity_logs` (action_type, entity_name, entity_id, old_data)
    VALUES ('DELETE', 'ambassadors', OLD.id, JSON_OBJECT('id', OLD.id, 'referral_code', OLD.referral_code));
END$$

-- Event Tickets Audit
CREATE TRIGGER `trg_audit_event_tickets_insert`
AFTER INSERT ON `event_tickets`
FOR EACH ROW
BEGIN
    INSERT INTO `admin_activity_logs` (action_type, entity_name, entity_id, new_data)
    VALUES ('INSERT', 'event_tickets', NEW.id, JSON_OBJECT('id', NEW.id, 'ticket_code', NEW.ticket_code));
END$$

CREATE TRIGGER `trg_audit_event_tickets_update`
AFTER UPDATE ON `event_tickets`
FOR EACH ROW
BEGIN
    INSERT INTO `admin_activity_logs` (action_type, entity_name, entity_id, old_data, new_data)
    VALUES ('UPDATE', 'event_tickets', NEW.id, JSON_OBJECT('id', OLD.id, 'ticket_code', OLD.ticket_code), JSON_OBJECT('id', NEW.id, 'ticket_code', NEW.ticket_code));
END$$

CREATE TRIGGER `trg_audit_event_tickets_delete`
AFTER DELETE ON `event_tickets`
FOR EACH ROW
BEGIN
    INSERT INTO `admin_activity_logs` (action_type, entity_name, entity_id, old_data)
    VALUES ('DELETE', 'event_tickets', OLD.id, JSON_OBJECT('id', OLD.id, 'ticket_code', OLD.ticket_code));
END$$

-- Reservations Audit
CREATE TRIGGER `trg_audit_reservations_insert`
AFTER INSERT ON `reservations`
FOR EACH ROW
BEGIN
    INSERT INTO `admin_activity_logs` (action_type, entity_name, entity_id, new_data)
    VALUES ('INSERT', 'reservations', NEW.id, JSON_OBJECT('id', NEW.id, 'status', NEW.status));
END$$

CREATE TRIGGER `trg_audit_reservations_update`
AFTER UPDATE ON `reservations`
FOR EACH ROW
BEGIN
    INSERT INTO `admin_activity_logs` (action_type, entity_name, entity_id, old_data, new_data)
    VALUES ('UPDATE', 'reservations', NEW.id, JSON_OBJECT('id', OLD.id, 'status', OLD.status), JSON_OBJECT('id', NEW.id, 'status', NEW.status));
END$$

CREATE TRIGGER `trg_audit_reservations_delete`
AFTER DELETE ON `reservations`
FOR EACH ROW
BEGIN
    INSERT INTO `admin_activity_logs` (action_type, entity_name, entity_id, old_data)
    VALUES ('DELETE', 'reservations', OLD.id, JSON_OBJECT('id', OLD.id, 'status', OLD.status));
END$$

DELIMITER ;

-- ─── 13. INDEXACIÓN COMPUESTA Y OPTIMIZADA (1-10) ───────────────────────────

CREATE INDEX `idx_partner_profiles_type` ON `partner_profiles` (`business_type`);
CREATE INDEX `idx_ambassadors_code` ON `ambassadors` (`referral_code`);
CREATE INDEX `idx_event_tickets_code` ON `event_tickets` (`ticket_code`);
CREATE INDEX `idx_reservations_status` ON `reservations` (`partner_id`, `status`);
CREATE INDEX `idx_user_missions_completed` ON `user_missions` (`user_id`, `is_completed`);
CREATE INDEX `idx_photo_submissions_challenge_approved` ON `photo_submissions` (`challenge_id`, `is_approved`);

-- ============================================================
-- RECONCILIACIÓN CON EL SCHEMA ORIGINAL DE SUPABASE/POSTGRES
-- Tablas que el frontend consulta (supabase/schema.sql) pero que
-- faltaban en esta traducción a MySQL. Generadas y verificadas
-- contra un MySQL 8 real el 2026-09-17.
-- ============================================================

CREATE TABLE IF NOT EXISTS `artisanal_workshops` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `name` TEXT NOT NULL,
    `slug` TEXT NOT NULL,
    `destination_id` VARCHAR(36),
    `workshop_type` TEXT,
    `description` TEXT,
    `short_description` TEXT,
    `image_url` TEXT,
    `gallery` JSON,
    `address` TEXT,
    `phone` TEXT,
    `email` TEXT,
    `website` TEXT,
    `craft_types` JSON,
    `duration` TEXT,
    `price_range` TEXT,
    `includes` JSON,
    `skill_level` TEXT,
    `languages` JSON,
    `max_participants` INT,
    `opening_hours` TEXT,
    `latitude` DECIMAL(10, 8),
    `longitude` DECIMAL(11, 8),
    `rating` DECIMAL(3,2) DEFAULT 0.00,
    `review_count` INT DEFAULT 0,
    `is_featured` BOOLEAN DEFAULT FALSE,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `beaches` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `destination_id` VARCHAR(36),
    `province_id` VARCHAR(36),
    `name` TEXT NOT NULL,
    `slug` VARCHAR(255) UNIQUE,
    `beach_type` TEXT,
    `description` TEXT,
    `short_description` TEXT,
    `image_url` TEXT,
    `gallery` JSON,
    `activities` JSON,
    `amenities` JSON,
    `water_color` TEXT,
    `sand_type` TEXT,
    `wave_intensity` TEXT,
    `crowd_level` TEXT,
    `access_type` TEXT,
    `parking_available` BOOLEAN DEFAULT FALSE,
    `lifeguard_on_duty` BOOLEAN DEFAULT FALSE,
    `how_to_get_there` TEXT,
    `best_time_to_visit` TEXT,
    `address` TEXT,
    `latitude` DECIMAL(10, 8),
    `longitude` DECIMAL(11, 8),
    `rating` DECIMAL(3,2) DEFAULT 0.00,
    `review_count` INT DEFAULT 0,
    `is_popular` BOOLEAN DEFAULT FALSE,
    `is_featured` BOOLEAN DEFAULT FALSE,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE SET NULL,
        FOREIGN KEY (`province_id`) REFERENCES `provinces` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `caves` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `name` TEXT NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `destination_id` VARCHAR(36),
    `cave_type` TEXT,
    `description` TEXT,
    `short_description` TEXT,
    `image_url` TEXT,
    `gallery` JSON,
    `address` TEXT,
    `phone` TEXT,
    `email` TEXT,
    `website` TEXT,
    `difficulty` TEXT,
    `tour_duration` TEXT,
    `opening_hours` TEXT,
    `highlights` JSON,
    `flora_fauna` JSON,
    `historical_info` TEXT,
    `price_adult` DECIMAL(10, 2),
    `price_child` DECIMAL(10, 2),
    `latitude` DECIMAL(10, 8),
    `longitude` DECIMAL(11, 8),
    `rating` DECIMAL(3,2) DEFAULT 0.00,
    `is_featured` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `coffee_experiences` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `name` TEXT NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `destination_id` VARCHAR(36),
    `experience_type` TEXT,
    `description` TEXT,
    `short_description` TEXT,
    `image_url` TEXT,
    `gallery` JSON,
    `address` TEXT,
    `phone` TEXT,
    `email` TEXT,
    `website` TEXT,
    `coffee_varieties` JSON,
    `altitude` TEXT,
    `tour_duration` TEXT,
    `price_range` TEXT,
    `includes` JSON,
    `production_process` TEXT,
    `tasting_notes` JSON,
    `opening_hours` TEXT,
    `latitude` DECIMAL(10, 8),
    `longitude` DECIMAL(11, 8),
    `rating` DECIMAL(3,2) DEFAULT 0.00,
    `is_featured` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `discount_coupons` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `code` VARCHAR(255) UNIQUE NOT NULL,
    `discount_percentage` DECIMAL(5, 2),
    `discount_amount` DECIMAL(10, 2),
    `expires_at` TIMESTAMP,
    `max_uses` INT,
    `uses_count` INT DEFAULT 0,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS `emergency_contacts` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `province_id` VARCHAR(36),
    `institution` TEXT NOT NULL,
    `phone_number` TEXT NOT NULL,
    `address` TEXT,
    `latitude` DECIMAL(10, 8),
    `longitude` DECIMAL(11, 8),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (`province_id`) REFERENCES `provinces` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `entity_translations` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `entity_type` VARCHAR(50) NOT NULL,
    `entity_id` VARCHAR(36) NOT NULL,
    `language` VARCHAR(10) NOT NULL,
    `field_name` VARCHAR(100) NOT NULL,
    `translation_text` TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (entity_type, entity_id, language, field_name)
);

CREATE TABLE IF NOT EXISTS `establishment_registrations` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `tipo_establecimiento` TEXT NOT NULL CHECK (tipo_establecimiento IN ('general', 'restaurante', 'bar', 'hotel', 'tour', 'spa', 'tienda')),
    `nombre` TEXT NOT NULL,
    `responsable` TEXT NOT NULL,
    `email` TEXT NOT NULL,
    `telefono` TEXT NOT NULL,
    `direccion` TEXT NOT NULL,
    `provincia` TEXT NOT NULL,
    `website` TEXT,
    `foto_url` TEXT,
    `descripcion` TEXT NOT NULL,
    `rnc` TEXT,
    `horario` TEXT,
    `detalles` JSON,
    `status` VARCHAR(100) DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aprobado', 'rechazado')),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS `exchange_rates` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `rate_date` DATE NOT NULL,
    `currency_code` VARCHAR(255) NOT NULL CHECK (currency_code IN ('USD', 'EUR', 'GBP', 'CAD', 'MXN')),
    `buy_rate` DECIMAL(10, 4) NOT NULL,
    `sell_rate` DECIMAL(10, 4) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (rate_date, currency_code)
);

CREATE TABLE IF NOT EXISTS `fuel_prices` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `effective_date` DATE NOT NULL UNIQUE,
    `gasolina_premium` DECIMAL(10, 2) NOT NULL,
    `gasolina_regular` DECIMAL(10, 2) NOT NULL,
    `gasoil_optimo` DECIMAL(10, 2) NOT NULL,
    `gasoil_regular` DECIMAL(10, 2) NOT NULL,
    `glp` DECIMAL(10, 2) NOT NULL,
    `gnv` DECIMAL(10, 2) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS `historical_events` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `name` TEXT NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `event_date` DATE,
    `end_date` DATE,
    `year` INT,
    `era` TEXT,
    `category` TEXT,
    `location` TEXT,
    `short_description` TEXT,
    `description` TEXT,
    `significance` TEXT,
    `key_figures` JSON,
    `consequences` JSON,
    `image_url` TEXT,
    `gallery` JSON,
    `sources` JSON,
    `is_featured` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS `historical_figures` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `name` TEXT NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `title` TEXT,
    `birth_date` DATE,
    `death_date` DATE,
    `birth_place` TEXT,
    `era` TEXT,
    `category` TEXT,
    `short_description` TEXT,
    `description` TEXT,
    `biography` TEXT,
    `achievements` JSON,
    `quotes` JSON,
    `image_url` TEXT,
    `gallery` JSON,
    `is_featured` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS `ip_rules` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `ip_address` VARCHAR(255) UNIQUE NOT NULL,
    `rule_type` TEXT CHECK (rule_type IN ('blacklist', 'whitelist')),
    `notes` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS `job_vacancies` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `title` TEXT NOT NULL,
    `slug` TEXT NOT NULL,
    `company_name` TEXT NOT NULL,
    `company_logo` TEXT,
    `company_description` TEXT,
    `description` TEXT,
    `short_description` TEXT,
    `location` TEXT,
    `address` TEXT,
    `province` TEXT,
    `salary_range` TEXT,
    `salary_min` DECIMAL(10, 2),
    `salary_max` DECIMAL(10, 2),
    `job_type` TEXT,
    `experience_level` TEXT,
    `education` TEXT,
    `category` TEXT,
    `department` TEXT,
    `languages` JSON,
    `responsibilities` JSON,
    `requirements` JSON,
    `benefits` JSON,
    `skills` JSON,
    `application_url` TEXT,
    `application_email` TEXT,
    `deadline` DATE,
    `is_urgent` BOOLEAN DEFAULT FALSE,
    `is_remote` BOOLEAN DEFAULT FALSE,
    `is_featured` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS `lotteries` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `name` TEXT NOT NULL,
    `country` VARCHAR(100) NOT NULL DEFAULT 'República Dominicana',
    `logo_url` TEXT,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS `lottery_draws` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `lottery_id` VARCHAR(36),
    `name` TEXT NOT NULL,
    `draw_days` JSON NOT NULL,
    `draw_time` TIME NOT NULL,
    `ball_range_min` INT DEFAULT 1,
    `ball_range_max` INT DEFAULT 100,
    `number_of_balls` INT DEFAULT 3,
    `tombolas_count` INT DEFAULT 3,
    `has_bonus` BOOLEAN DEFAULT FALSE,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (`lottery_id`) REFERENCES `lotteries` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `lottery_results` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `draw_id` VARCHAR(36),
    `draw_date` DATE NOT NULL,
    `winning_numbers` JSON NOT NULL,
    `bonus_number` INT,
    `jackpot_amount` TEXT,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (draw_id, draw_date),
        FOREIGN KEY (`draw_id`) REFERENCES `lottery_draws` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `marketing_campaigns` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `title` TEXT NOT NULL,
    `subject` TEXT NOT NULL,
    `body_template` TEXT NOT NULL,
    `segment_interests` JSON,
    `sent_count` INT DEFAULT 0,
    `status` VARCHAR(100) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
    `scheduled_for` TIMESTAMP,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS `marketing_leads` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `nombre` TEXT NOT NULL,
    `email` TEXT NOT NULL,
    `telefono` TEXT,
    `empresa` TEXT,
    `mensaje` TEXT,
    `source` TEXT,
    `status` VARCHAR(100) DEFAULT 'nuevo' CHECK (status IN ('nuevo', 'contactado', 'calificado', 'perdido')),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS `marketplace_orders` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `user_id` VARCHAR(36),
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `status` VARCHAR(100) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded')),
    `payment_method` TEXT,
    `payment_intent_id` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `marketplace_order_items` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `order_id` VARCHAR(36),
    `item_type` TEXT CHECK (item_type IN ('experience', 'tour_package', 'ticket')),
    `item_id` VARCHAR(36) NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `price_unit` DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (`order_id`) REFERENCES `marketplace_orders` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `newsletter_subscribers` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `nombre` TEXT,
    `intereses` JSON,
    `frecuencia` VARCHAR(100) DEFAULT 'biweekly',
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS `offers` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `title` TEXT NOT NULL,
    `description` TEXT,
    `discount_code` TEXT,
    `discount_percentage` DECIMAL(12,2),
    `original_price` DECIMAL(12,2) NOT NULL,
    `price` DECIMAL(12,2) NOT NULL,
    `start_time` TIMESTAMP,
    `end_time` TIMESTAMP,
    `latitude` DECIMAL(10, 8),
    `longitude` DECIMAL(11, 8),
    `radius_meters` INT DEFAULT 500,
    `is_flash` BOOLEAN DEFAULT FALSE,
    `image_url` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS `points_transactions` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `user_id` VARCHAR(36),
    `transaction_type` TEXT CHECK (transaction_type IN ('earn_coins', 'spend_coins', 'earn_xp')),
    `amount` INT NOT NULL,
    `reason` TEXT NOT NULL,
    `reference_entity_type` TEXT,
    `reference_entity_id` VARCHAR(36),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `rivers` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `name` TEXT NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `destination_id` VARCHAR(36),
    `description` TEXT,
    `short_description` TEXT,
    `image_url` TEXT,
    `gallery` JSON,
    `address` TEXT,
    `difficulty` TEXT,
    `activities` JSON,
    `best_season` TEXT,
    `duration` TEXT,
    `price_range` TEXT,
    `safety_tips` JSON,
    `adrenaline_level` INT,
    `certified_guides` BOOLEAN DEFAULT FALSE,
    `latitude` DECIMAL(10, 8),
    `longitude` DECIMAL(11, 8),
    `rating` DECIMAL(3,2) DEFAULT 0.00,
    `is_featured` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `seo_redirections` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `source_path` VARCHAR(255) UNIQUE NOT NULL,
    `target_path` TEXT NOT NULL,
    `redirect_type` INT DEFAULT 301 CHECK (redirect_type IN (301, 302)),
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS `site_settings` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `key` VARCHAR(255) UNIQUE NOT NULL,
    `value` JSON NOT NULL,
    `description` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS `stadiums` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `name` TEXT NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `destination_id` VARCHAR(36),
    `stadium_type` TEXT,
    `sport_types` JSON,
    `description` TEXT,
    `short_description` TEXT,
    `image_url` TEXT,
    `gallery` JSON,
    `address` TEXT,
    `phone` TEXT,
    `email` TEXT,
    `website` TEXT,
    `capacity` INT,
    `home_teams` JSON,
    `facilities` JSON,
    `services` JSON,
    `latitude` DECIMAL(10, 8),
    `longitude` DECIMAL(11, 8),
    `rating` DECIMAL(3,2) DEFAULT 0.00,
    `is_featured` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `support_tickets` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `user_id` VARCHAR(36),
    `subject` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `status` VARCHAR(100) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    `priority` VARCHAR(100) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    `assigned_to` VARCHAR(36),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
        FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `support_messages` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `ticket_id` VARCHAR(36),
    `sender_id` VARCHAR(36),
    `message` TEXT NOT NULL,
    `is_admin_reply` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets` (`id`) ON DELETE CASCADE,
        FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `system_cron_jobs` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `job_name` VARCHAR(255) UNIQUE NOT NULL,
    `schedule_cron` TEXT NOT NULL,
    `last_run_at` TIMESTAMP,
    `next_run_at` TIMESTAMP,
    `status` TEXT CHECK (status IN ('idle', 'running', 'success', 'failed')),
    `error_log` TEXT
);

CREATE TABLE IF NOT EXISTS `system_webhooks` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `url` TEXT NOT NULL,
    `event_type` TEXT NOT NULL,
    `secret_token` TEXT,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS `theme_parks` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `name` TEXT NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `destination_id` VARCHAR(36),
    `park_type` TEXT,
    `description` TEXT,
    `short_description` TEXT,
    `image_url` TEXT,
    `gallery` JSON,
    `address` TEXT,
    `phone` TEXT,
    `email` TEXT,
    `website` TEXT,
    `price_adult` DECIMAL(10, 2),
    `price_child` DECIMAL(10, 2),
    `price_range` TEXT,
    `opening_hours` TEXT,
    `attractions` JSON,
    `services` JSON,
    `includes` JSON,
    `age_restrictions` TEXT,
    `duration_recommended` TEXT,
    `latitude` DECIMAL(10, 8),
    `longitude` DECIMAL(11, 8),
    `rating` DECIMAL(3,2) DEFAULT 0.00,
    `is_featured` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `tour_packages` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `name` TEXT NOT NULL,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `destination_id` VARCHAR(36),
    `description` TEXT,
    `short_description` TEXT,
    `image_url` TEXT,
    `gallery` JSON,
    `duration` TEXT,
    `difficulty` TEXT,
    `price_from` DECIMAL(10, 2),
    `price_range` TEXT,
    `max_group_size` INT,
    `min_age` INT,
    `included` JSON,
    `not_included` JSON,
    `highlights` JSON,
    `requirements` JSON,
    `languages` JSON,
    `departure_point` TEXT,
    `best_season` TEXT,
    `category` TEXT,
    `rating` DECIMAL(3,2) DEFAULT 0.00,
    `is_featured` BOOLEAN DEFAULT FALSE,
    `is_sponsored` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `ugc_media` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `user_id` VARCHAR(36),
    `media_url` TEXT NOT NULL,
    `media_type` TEXT CHECK (media_type IN ('photo', 'video')),
    `associated_entity_type` TEXT NOT NULL,
    `associated_entity_id` VARCHAR(36) NOT NULL,
    `status` VARCHAR(100) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `user_suspensions` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `user_id` VARCHAR(36),
    `reason` TEXT NOT NULL,
    `suspended_by` VARCHAR(36),
    `expires_at` TIMESTAMP,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
        FOREIGN KEY (`suspended_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `vendor_payments` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `partner_id` VARCHAR(36),
    `amount` DECIMAL(10, 2) NOT NULL,
    `status` VARCHAR(100) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
    `payout_method` TEXT,
    `payout_reference` TEXT,
    `paid_at` TIMESTAMP,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (`partner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `weather_alerts` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `province_id` VARCHAR(36),
    `alert_type` TEXT CHECK (alert_type IN ('sargazo', 'clima_adverso', 'oleaje_alto', 'huracan', 'otro')),
    `severity` TEXT CHECK (severity IN ('informativa', 'moderada', 'grave', 'extrema')),
    `title` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `expires_at` TIMESTAMP,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (`province_id`) REFERENCES `provinces` (`id`) ON DELETE SET NULL
);

-- ── Columnas que existían en Supabase pero faltaban en las tablas ya
--    creadas arriba. No son idempotentes (igual que los CREATE TRIGGER
--    de este archivo): en una instalación nueva desde cero, aplicar
--    una sola vez.
ALTER TABLE `achievements` ADD COLUMN `achievement_type` TEXT;
ALTER TABLE `achievements` ADD COLUMN `badge_color` TEXT;
ALTER TABLE `achievements` ADD COLUMN `is_hidden` BOOLEAN DEFAULT FALSE;
ALTER TABLE `achievements` ADD COLUMN `min_level` INT DEFAULT 1;
ALTER TABLE `achievements` ADD COLUMN `slug` TEXT;
ALTER TABLE `achievements` ADD COLUMN `unlock_condition` TEXT;
ALTER TABLE `achievements` ADD COLUMN `unlock_requirement` JSON;
ALTER TABLE `achievements` ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE `ad_banners` ADD COLUMN `clicks` INT DEFAULT 0;
ALTER TABLE `ad_banners` ADD COLUMN `impressions` INT DEFAULT 0;
ALTER TABLE `ad_banners` ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE `ad_banners` ADD COLUMN `video_url` TEXT;
ALTER TABLE `admin_activity_logs` ADD COLUMN `ip_address` TEXT;
ALTER TABLE `admin_activity_logs` ADD COLUMN `user_agent` TEXT;
ALTER TABLE `airbnb_listings` ADD COLUMN `is_sponsored` BOOLEAN DEFAULT FALSE;
ALTER TABLE `airbnb_listings` ADD COLUMN `review_count` INT DEFAULT 0;
ALTER TABLE `airbnb_listings` ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE `ambassadors` ADD COLUMN `clicks_count` INT DEFAULT 0;
ALTER TABLE `bars` ADD COLUMN `ambiance` TEXT;
ALTER TABLE `bars` ADD COLUMN `dress_code` TEXT;
ALTER TABLE `bars` ADD COLUMN `email` TEXT;
ALTER TABLE `bars` ADD COLUMN `is_sponsored` BOOLEAN DEFAULT FALSE;
ALTER TABLE `bars` ADD COLUMN `minimum_age` INT DEFAULT 18;
ALTER TABLE `bars` ADD COLUMN `music_style` TEXT;
ALTER TABLE `bars` ADD COLUMN `review_count` INT DEFAULT 0;
ALTER TABLE `bars` ADD COLUMN `services` JSON;
ALTER TABLE `bars` ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE `bars` ADD COLUMN `website` TEXT;
ALTER TABLE `clinics` ADD COLUMN `certifications` JSON;
ALTER TABLE `clinics` ADD COLUMN `clinic_type` TEXT;
ALTER TABLE `clinics` ADD COLUMN `description` TEXT;
ALTER TABLE `clinics` ADD COLUMN `emergency_phone` TEXT;
ALTER TABLE `clinics` ADD COLUMN `gallery` JSON;
ALTER TABLE `clinics` ADD COLUMN `image_url` TEXT;
ALTER TABLE `clinics` ADD COLUMN `insurance_accepted` JSON;
ALTER TABLE `clinics` ADD COLUMN `is_24_hours` BOOLEAN DEFAULT FALSE;
ALTER TABLE `clinics` ADD COLUMN `is_featured` BOOLEAN DEFAULT FALSE;
ALTER TABLE `clinics` ADD COLUMN `languages` JSON;
ALTER TABLE `clinics` ADD COLUMN `latitude` DECIMAL(10, 8);
ALTER TABLE `clinics` ADD COLUMN `longitude` DECIMAL(11, 8);
ALTER TABLE `clinics` ADD COLUMN `opening_hours` TEXT;
ALTER TABLE `clinics` ADD COLUMN `rating` DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE `clinics` ADD COLUMN `services` JSON;
ALTER TABLE `clinics` ADD COLUMN `short_description` TEXT;
ALTER TABLE `clinics` ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE `events` ADD COLUMN `address` TEXT;
ALTER TABLE `events` ADD COLUMN `end_time` TIME;
ALTER TABLE `events` ADD COLUMN `event_type` TEXT;
ALTER TABLE `events` ADD COLUMN `gallery` JSON;
ALTER TABLE `events` ADD COLUMN `is_featured` BOOLEAN DEFAULT FALSE;
ALTER TABLE `events` ADD COLUMN `is_recurring` BOOLEAN DEFAULT FALSE;
ALTER TABLE `events` ADD COLUMN `name` TEXT;
ALTER TABLE `events` ADD COLUMN `organizer` TEXT;
ALTER TABLE `events` ADD COLUMN `price_range` TEXT;
ALTER TABLE `events` ADD COLUMN `recurrence_pattern` TEXT;
ALTER TABLE `events` ADD COLUMN `short_description` TEXT;
ALTER TABLE `events` ADD COLUMN `start_time` TIME;
ALTER TABLE `events` ADD COLUMN `ticket_url` TEXT;
ALTER TABLE `events` ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE `events` ADD COLUMN `venue` TEXT;
ALTER TABLE `experiences` ADD COLUMN `best_season` TEXT;
ALTER TABLE `experiences` ADD COLUMN `difficulty` TEXT;
ALTER TABLE `experiences` ADD COLUMN `experience_type` TEXT;
ALTER TABLE `experiences` ADD COLUMN `highlights` JSON;
ALTER TABLE `experiences` ADD COLUMN `included` JSON;
ALTER TABLE `experiences` ADD COLUMN `is_featured` BOOLEAN DEFAULT FALSE;
ALTER TABLE `experiences` ADD COLUMN `name` TEXT;
ALTER TABLE `experiences` ADD COLUMN `price_range` TEXT;
ALTER TABLE `experiences` ADD COLUMN `rating` DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE `experiences` ADD COLUMN `requirements` JSON;
ALTER TABLE `experiences` ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE `ports_marinas` ADD COLUMN `address` TEXT;
ALTER TABLE `ports_marinas` ADD COLUMN `capacity` INT;
ALTER TABLE `ports_marinas` ADD COLUMN `cruise_lines` JSON;
ALTER TABLE `ports_marinas` ADD COLUMN `email` TEXT;
ALTER TABLE `ports_marinas` ADD COLUMN `facilities` JSON;
ALTER TABLE `ports_marinas` ADD COLUMN `gallery` JSON;
ALTER TABLE `ports_marinas` ADD COLUMN `is_featured` BOOLEAN DEFAULT FALSE;
ALTER TABLE `ports_marinas` ADD COLUMN `phone` TEXT;
ALTER TABLE `ports_marinas` ADD COLUMN `rating` DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE `ports_marinas` ADD COLUMN `short_description` TEXT;
ALTER TABLE `ports_marinas` ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE `ports_marinas` ADD COLUMN `website` TEXT;
ALTER TABLE `reservations` ADD COLUMN `notes` TEXT;
ALTER TABLE `restaurants` ADD COLUMN `category` TEXT;
ALTER TABLE `restaurants` ADD COLUMN `email` TEXT;
ALTER TABLE `restaurants` ADD COLUMN `is_sponsored` BOOLEAN DEFAULT FALSE;
ALTER TABLE `restaurants` ADD COLUMN `services` JSON;
ALTER TABLE `restaurants` ADD COLUMN `signature_dishes` JSON;
ALTER TABLE `restaurants` ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE `spas_wellness` ADD COLUMN `amenities` JSON;
ALTER TABLE `spas_wellness` ADD COLUMN `email` TEXT;
ALTER TABLE `spas_wellness` ADD COLUMN `gallery` JSON;
ALTER TABLE `spas_wellness` ADD COLUMN `is_featured` BOOLEAN DEFAULT FALSE;
ALTER TABLE `spas_wellness` ADD COLUMN `latitude` DECIMAL(10, 8);
ALTER TABLE `spas_wellness` ADD COLUMN `longitude` DECIMAL(11, 8);
ALTER TABLE `spas_wellness` ADD COLUMN `opening_hours` TEXT;
ALTER TABLE `spas_wellness` ADD COLUMN `price_range` TEXT;
ALTER TABLE `spas_wellness` ADD COLUMN `rating` DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE `spas_wellness` ADD COLUMN `review_count` INT DEFAULT 0;
ALTER TABLE `spas_wellness` ADD COLUMN `services` JSON;
ALTER TABLE `spas_wellness` ADD COLUMN `short_description` TEXT;
ALTER TABLE `spas_wellness` ADD COLUMN `spa_type` TEXT;
ALTER TABLE `spas_wellness` ADD COLUMN `treatments` JSON;
ALTER TABLE `spas_wellness` ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE `survey_responses` ADD COLUMN `answers` JSON;
ALTER TABLE `survey_responses` ADD COLUMN `reservation_id` VARCHAR(36);
ALTER TABLE `tour_guides` ADD COLUMN `certifications` JSON;
ALTER TABLE `tour_guides` ADD COLUMN `description` TEXT;
ALTER TABLE `tour_guides` ADD COLUMN `destination_id` VARCHAR(36);
ALTER TABLE `tour_guides` ADD COLUMN `image_url` TEXT;
ALTER TABLE `tour_guides` ADD COLUMN `is_certified` BOOLEAN DEFAULT TRUE;
ALTER TABLE `tour_guides` ADD COLUMN `price_range` TEXT;
ALTER TABLE `tour_guides` ADD COLUMN `slug` TEXT;
ALTER TABLE `tour_guides` ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE `tour_guides` ADD COLUMN `website` TEXT;
ALTER TABLE `tour_guides` ADD COLUMN `years_experience` INT;
ALTER TABLE `tour_operators` ADD COLUMN `certifications` JSON;
ALTER TABLE `tour_operators` ADD COLUMN `destination_id` VARCHAR(36);
ALTER TABLE `tour_operators` ADD COLUMN `image_url` TEXT;
ALTER TABLE `tour_operators` ADD COLUMN `is_featured` BOOLEAN DEFAULT FALSE;
ALTER TABLE `tour_operators` ADD COLUMN `languages` JSON;
ALTER TABLE `tour_operators` ADD COLUMN `operator_type` TEXT;
ALTER TABLE `tour_operators` ADD COLUMN `rating` DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE `tour_operators` ADD COLUMN `services` JSON;
ALTER TABLE `tour_operators` ADD COLUMN `short_description` TEXT;
ALTER TABLE `tour_operators` ADD COLUMN `tour_types` JSON;
ALTER TABLE `tour_operators` ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE `travel_agencies` ADD COLUMN `agency_type` TEXT;
ALTER TABLE `travel_agencies` ADD COLUMN `certifications` JSON;
ALTER TABLE `travel_agencies` ADD COLUMN `destination_id` VARCHAR(36);
ALTER TABLE `travel_agencies` ADD COLUMN `image_url` TEXT;
ALTER TABLE `travel_agencies` ADD COLUMN `is_featured` BOOLEAN DEFAULT FALSE;
ALTER TABLE `travel_agencies` ADD COLUMN `languages` JSON;
ALTER TABLE `travel_agencies` ADD COLUMN `rating` DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE `travel_agencies` ADD COLUMN `short_description` TEXT;
ALTER TABLE `travel_agencies` ADD COLUMN `specialties` JSON;
ALTER TABLE `travel_agencies` ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE `user_achievements` ADD COLUMN `earned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE `user_gamification` ADD COLUMN `referral_code` TEXT;

-- Column type fixes: these were declared JSON in the original translation but
-- src/integrations/supabase/types.ts (the real generated Supabase types) says
-- they are plain strings, not arrays.
ALTER TABLE `restaurants` MODIFY COLUMN `cuisine_type` VARCHAR(255);
ALTER TABLE `restaurants` MODIFY COLUMN `opening_hours` VARCHAR(255);
ALTER TABLE `bars` MODIFY COLUMN `bar_type` VARCHAR(100);
ALTER TABLE `bars` MODIFY COLUMN `opening_hours` VARCHAR(255);
ALTER TABLE `hotels` ADD COLUMN `review_count` INT DEFAULT 0;
ALTER TABLE `restaurants` ADD COLUMN `review_count` INT DEFAULT 0;
ALTER TABLE `experiences` ADD COLUMN `review_count` INT DEFAULT 0;

-- `id` columns across most of the originally-translated tables had no default,
-- unlike Postgres' gen_random_uuid(). Any INSERT that (correctly) omits `id`
-- was landing every row on the same empty-string primary key, so only the
-- first row of any multi-row insert ever survived. profiles/users are
-- excluded on purpose: their id is always supplied explicitly by the backend
-- (it must match auth identity), never generated.
ALTER TABLE `achievements` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `ad_banners` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `airbnb_listings` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `ambassador_payouts` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `ambassador_referrals` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `ambassadors` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `audio_guides` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `bars` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `bird_species` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `blog_posts` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `clinics` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `destinations` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `event_tickets` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `events` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `experiences` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `explorer_follows` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `explorer_guilds` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `favorites` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `gamification_leagues` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `gamification_levels` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `gamification_missions` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `gamification_prizes` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `gamification_seasons` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `gamification_transactions` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `golf_courses` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `guild_members` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `hot_springs` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `hotels` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `marine_reports` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `municipalities` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `offset_projects` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `partner_profiles` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `photo_challenges` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `photo_submissions` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `photo_votes` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `ports_marinas` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `post_comments` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `post_likes` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `protected_areas` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `province_visits` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `provinces` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `referral_codes` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `referral_uses` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `reservations` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `restaurants` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `reviews` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `reward_inventory` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `reward_shipments` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `route_stops` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `routes` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `shopping_centers` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `social_comments` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `social_likes` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `social_posts` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `souvenirs` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `spas_wellness` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `survey_responses` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `survey_templates` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `toll_routes` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `tour_guides` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `tour_operators` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `travel_agencies` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `ugc_reports` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `user_achievements` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `user_flags` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `user_gamification` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `user_league_stats` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `user_missions` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `user_prize_redemptions` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `user_roles` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `user_xp_milestones` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `vacation_registrations` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
ALTER TABLE `xp_milestones` MODIFY COLUMN `id` VARCHAR(36) NOT NULL DEFAULT (UUID());
