-- =============================================================================
-- Migration 0050: Indices de Performance para Produccion (Fase 6 - Sprint 6.5)
-- Fecha: 2026-09-27
-- Objetivo: Cubrir los patrones de query de mayor frecuencia identificados
--           en los modulos de las fases 1B-5B (marketplace, sponsorship,
--           creators, memberships, products, gamification, billing).
-- =============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- SPONSORSHIP / AD SERVER (Fase 2B)
-- Patron: serveSlot filtra por slot_id + status + targeting + presupuesto
-- ──────────────────────────────────────────────────────────────────────────────
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sponsorship_creatives_slot_status
  ON sponsorship_creatives (slot_id, status)
  WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sponsorship_creatives_targeting
  ON sponsorship_creatives (slot_id, category_target, destination_target)
  WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sponsorship_campaigns_active_dates
  ON sponsorship_campaigns (status, starts_at, ends_at)
  WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sponsorship_events_creative_type
  ON sponsorship_events (creative_id, event_type, created_at DESC);

-- ──────────────────────────────────────────────────────────────────────────────
-- CREATORS / UGC (Fase 3B)
-- Patron: feed paginado por categoria/destino, perfil por handle
-- ──────────────────────────────────────────────────────────────────────────────
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_creator_profiles_handle
  ON creator_profiles (lower(handle))
  WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_creator_videos_feed
  ON creator_videos (status, created_at DESC, id)
  WHERE status = 'published';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_creator_videos_category
  ON creator_videos (category, created_at DESC)
  WHERE status = 'published';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_creator_videos_destination
  ON creator_videos (destination_name, created_at DESC)
  WHERE status = 'published';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_creator_videos_creator_id
  ON creator_videos (creator_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_creator_video_events_video
  ON creator_video_events (video_id, event_type, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_creator_payouts_creator_status
  ON creator_payouts (creator_id, status, created_at DESC);

-- ──────────────────────────────────────────────────────────────────────────────
-- MEMBERSHIPS & TICKETING (Fase 5B)
-- Patron: membresía activa vigente por usuario, balance de puntos
-- ──────────────────────────────────────────────────────────────────────────────
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_memberships_active
  ON user_memberships (user_id, status, valid_until)
  WHERE status = 'ACTIVE';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_loyalty_points_user
  ON loyalty_points_ledger (user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_event_tickets_qr
  ON event_tickets (qr_code_hash)
  WHERE status = 'ISSUED';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_event_tickets_user_event
  ON event_tickets (user_id, event_id, status);

-- ──────────────────────────────────────────────────────────────────────────────
-- TRANSACTIONAL PRODUCTS (Fase 4B)
-- Patron: busqueda de polizas y traslados por usuario y estado
-- ──────────────────────────────────────────────────────────────────────────────
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_travel_insurance_user
  ON travel_insurance_policies (user_id, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_travel_insurance_policy_number
  ON travel_insurance_policies (policy_number);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transport_bookings_user_status
  ON transport_bookings (user_id, status, pickup_datetime);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dynamic_packages_featured
  ON dynamic_packages (status, is_featured DESC, created_at DESC)
  WHERE status = 'active';

-- ──────────────────────────────────────────────────────────────────────────────
-- FISCAL INVOICING / NCF (Fase 3)
-- Patron: busqueda por NCF, por referencia, listado por fecha
-- ──────────────────────────────────────────────────────────────────────────────
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_fiscal_invoices_ncf_unique
  ON fiscal_invoices (ncf);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fiscal_invoices_reference
  ON fiscal_invoices (reference_type, reference_id, issued_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fiscal_invoices_issued_at
  ON fiscal_invoices (issued_at DESC);

-- ──────────────────────────────────────────────────────────────────────────────
-- GAMIFICATION / GAME ENGINE (Fase 3-4)
-- Patron: transacciones diarias para cap check, misiones por usuario
-- ──────────────────────────────────────────────────────────────────────────────
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_transactions_daily_cap
  ON gamification_transactions (user_id, action, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_transactions_cooldown
  ON gamification_transactions (user_id, action, created_at DESC)
  WHERE xp_amount > 0 OR coin_amount > 0;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_missions_period
  ON user_missions (user_id, mission_id, period_key);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_achievements_user
  ON user_achievements (user_id, unlocked_at DESC)
  WHERE unlocked_at IS NOT NULL;

-- ──────────────────────────────────────────────────────────────────────────────
-- MARKETPLACE EXTENSIONES (Fase 1B)
-- Patron: catalogo filtrado por categoria de tour/experiencia
-- ──────────────────────────────────────────────────────────────────────────────
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_products_category_status
  ON marketplace_products (category, status, created_at DESC)
  WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_marketplace_products_operator_featured
  ON marketplace_products (operator_id, is_featured DESC, created_at DESC);

-- ──────────────────────────────────────────────────────────────────────────────
-- B2B API KEYS (Fase 1B)
-- Patron: lookup rapido de clave activa en cada request B2B autenticado
-- ──────────────────────────────────────────────────────────────────────────────
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_b2b_api_keys_key_hash
  ON b2b_api_keys (key_hash)
  WHERE is_active = TRUE;

-- ──────────────────────────────────────────────────────────────────────────────
-- BUSINESS VERIFICATION AUDITS (Fase 1B)
-- Patron: listado por estado para workflow del equipo de verificacion
-- ──────────────────────────────────────────────────────────────────────────────
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_business_verifications_status
  ON business_verification_audits (status, submitted_at DESC);

-- ──────────────────────────────────────────────────────────────────────────────
-- ANALYTICS: COMMENT con EXPLAIN de referencia
-- Ejecutar en staging antes de produccion:
--   EXPLAIN (ANALYZE, BUFFERS)
--   SELECT * FROM sponsorship_creatives c
--   JOIN sponsorship_campaigns camp ON camp.id = c.campaign_id
--   WHERE c.slot_id = 'slot-banner-top' AND c.status = 'active' AND camp.status = 'active'
--   ORDER BY (random() * c.weight) DESC LIMIT 3;
-- Expected: Index Scan on idx_sponsorship_creatives_slot_status (cost < 50)
-- ──────────────────────────────────────────────────────────────────────────────
