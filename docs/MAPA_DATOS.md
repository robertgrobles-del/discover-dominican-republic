# Mapa de datos: todo el contenido de las ramas, agrupado por base de datos

Fuentes revisadas (10-11-2026):
- `staging/migrations` (Turso, en uso),
- `backend/migrations` (Postgres, 104 migraciones; las ramas `staging` y `feature/nueva-arquitectura-optimizada` tienen el juego completo),
- `supabase/migrations` (esquema antiguo; casi todo está repetido en el backend),
- los content types de Strapi en `cms/` (dev y otras ramas; descartado por el usuario),
- los datos fijos de `src/data`.

**Regla para agrupar:** lo que se consulta junto (JOIN), se guarda en la misma operación, o depende de provincias y fichas, va en la misma base. Solo se separa lo que crece mucho, se escribe a cada clic, o debe estar aislado por seguridad o por dinero.

Hoy en Turso: `news`, `news_categories`, `provinces` (con todos los componentes de su página), `municipalities`, `destinations`, `beaches`, `media`, `content_translations`, `events`, `venues`, `leads`, `contact_messages`, `establishment_requests`, `establishment_files` y usuarios. Todo lo demás está en Postgres (`backend/`), en Supabase o en `src/data`.

---

## Base 1 · Contenido (catálogo turístico): la principal

Todo lo que se publica y se cruza con provincias. Va junto para poder filtrar por provincia, destino o tipo con un JOIN.

| Grupo | Tablas o datos |
|---|---|
| Territorio | `provinces`, `municipalities`, `destinations`; `src/data`: dominicanTerritory, provinceIdentity, provinceEnrichment, destinosData |
| Naturaleza | `beaches` (Turso), `parks`, `protected_areas`, `rivers`, `caves`, `mountains`, `hot_springs`, `bird_species`, `marine_reports`; `src/data`: beaches, parquesNacionalesData, riosData, nauticaData |
| Alojamiento | `hotels`, `airbnb_listings`, `operator_rooms`; `src/data`: hotels, hotelDetailData, fallbackAccommodations |
| Comer y salir | `restaurants`, `bars`, `coffee_experiences`, `recipes`, `shopping_centers`, `souvenirs`, `spas_wellness`; `src/data`: restaurants, bars, recipesData, criolloRecipesData, rutasSaborData, shopping-malls |
| Cultura e historia | `monuments`, `historical_events`, `historical_figures`, `artisanal_workshops`, `audio_guides`, `travel_phrases`, `dictionary_terms`; `src/data`: historyArticles |
| Ocio y deporte | `stadiums`, `golf_courses`, `theme_parks`, `venues` (Turso), `events` (Turso), `experiences`, `tour_packages`, `dynamic_packages`; `src/data`: venuesData, eventosData, experiences, lidomData |
| Llegar y moverse | `airports`, `ports_marinas`, `flight_routes`, `toll_routes`, `fuel_prices`, `exchange_rates`, `entry_requirements`, `emergency_contacts`, `clinics`, `webcams`; `src/data`: airports, airlinesData, portsData, puertosDetalleData, marinasDetalleData, transporteData, comoLlegarData, healthCenters, monedaData |
| Editorial | `news`, `news_categories` (Turso), `articles`, `blog_posts`, `article_translations`, `entity_translations`, `content_translations` (Turso), `media` / `media_assets`, `content_revisions`, `content_rights`, `seo_redirections`, `ui_strings`, `site_settings` |
| Rutas | `routes`, `route_stops`, `gamified_routes`, `route_checkpoints`; `src/data`: itinerariosData |
| Directorio | `establecimientos`, `establishment_requests`, `establishment_files`, `establishment_registrations`, `tour_operators`, `tour_guides`, `travel_agencies`, `partner_profiles`, `operator_listings`; `src/data`: agenciasToursRNT |

Es la base que más se lee y la que más necesita JOIN: «hoteles y playas de Samaná», «eventos en recintos de La Romana». **No conviene partirla.**

## Base 2 · Usuarios, comunidad y gamificación

Se cruza con el contenido por ID o slug, pero casi siempre se consulta por usuario.

- **Cuentas:** `users`, `profiles`, `user_roles`, `auth_tokens`, `refresh_tokens`, `oauth_*`, `user_flags`, `user_suspensions`, `push_subscriptions`, `notifications`.
- **Actividad:** `favorites`, `reviews`, `review_votes`, `review_reports`, `province_visits`, `trips` y `trip_*`, `trip_diary_entries`, `traveler_spots`.
- **Social:** `social_posts`, `social_comments`, `social_likes`, `post_comments`, `post_likes`, `article_reactions`, `ugc_media`, `ugc_reports`, `photo_challenges`, `photo_submissions`, `photo_votes`, `explorer_follows`, `explorer_guilds`, `guild_members`.
- **Gamificación:** `gamification_*`, `user_gamification`, `user_missions`, `user_league_stats`, `user_xp_milestones`, `xp_milestones`, `achievements`, `user_achievements`, `passport_stamps`, `passport_qr_codes`, `place_qr_codes`, `mission_validation_codes`, `digital_collectibles`, `user_collectibles`, `points_transactions`, `loyalty_points_ledger`, `rewards`, `reward_inventory`, `reward_shipments`, `user_prize_redemptions`, `trivia_*`, `user_route_progress`, `user_checkpoint_completions`.
- **Sorteos y concursos:** `contests`, `contest_registrations`, `vacation_registrations`, `lotteries`, `lottery_draws`, `lottery_results`, `lottery_hero_slides` (carrusel del hero de /loterias; vive con las demás tablas de loterías en la base de `TURSO_DB_LOTERY_URL`); `src/data`: sorteosData, loteriasData, rewardsData, gamificacion*.

Se puede separar del contenido. Las consultas cruzadas (por ejemplo, «mis favoritos con su foto») se hacen en dos pasos con `Promise.all`.

## Base 3 · Negocio y dinero (aislada)

Pagos, facturas y contratos. Se separa por seguridad, por copias de seguridad propias y porque necesita transacciones entre sus propias tablas, no con el contenido.

- **Reservas:** `bookings`, `booking_payments`, `booking_claim_tokens`, `reservations`, `room_blocks`, `room_calendar_links`, `room_rate_seasons`, `transport_bookings`, `event_tickets`, `live_event_tickets`, `travel_insurance_policies`.
- **Tiendas:** `marketplace_*`, `store_*`, `cart_items`, `vendor_payments`.
- **Pagos y facturas:** `payment_events`, `payouts`, `payout_items`, `payout_adjustments`, `fiscal_invoices`, `fiscal_sequences`, `pricing_history`.
- **Suscripciones y ofertas:** `membership_plans`, `user_memberships`, `operator_subscriptions`, `discount_coupons`, `coupon_redemptions`, `offers`, `offer_redemptions`.
- **Operadores y organizaciones:** `business_contracts`, `business_verification_audits`, `org_*`, `staff_invitations`, `operator_messages`, `operator_promotions`, `operator_reviews`, `operator_sponsored_*`, `b2b_api_keys`.
- **Publicidad:** `ad_banners`, `ad_clients`, `ad_slots`, `ad_postback_keys`, `sponsorship_*`, `marketing_campaigns`, `campaign_deliveries`.
- **Creadores y embajadores:** `creator_*`, `ambassadors`, `ambassador_*`, `affiliate_offers`, `referral_codes`, `referral_uses`, `media_license_*`.
- **Huella de carbono:** `offset_projects`; `src/data`: carbonoData, pricingPlansData, marketplaceData.

## Base 4 · Registros y analítica (mucha escritura, se puede borrar)

Se escriben a cada visita o clic y no se cruzan con nada. Separarlos evita que llenen o frenen la base de contenido.

- **Analítica:** `analytics_events`, `analytics_daily`, `ad_clicks`, `ad_seen`, `ad_stats`, `ad_conversions`, `user_geo_events`, `org_contact_daily`, `creator_video_events`.
- **Registros:** `audit_log`, `admin_activity_logs`, `email_log`, `org_webhook_deliveries`, `job_marks`, `import_jobs`, `system_cron_jobs`, `system_webhooks`.
- **Caché y datos externos:** `ai_cache`, `ai_usage`, `weather_snapshots`, `weather_alerts`, `weather_internal_nonces`.
- **Seguridad:** `ip_rules`, `access_reviews`, `access_review_items`, `approval_requests`, `capability_grants`, `feature_flags`.

## Formularios y correo

Por ejemplo: `leads`, `contact_messages`, `marketing_leads`, `newsletter_subscribers`, `support_tickets`, `support_messages`, `support_sessions`, `survey_*`, `job_vacancies`, `email_templates`, `email_template_versions`, `email_suppressions`.

Su lugar depende del uso:
- **Mientras haya poco volumen:** en la Base 1. Es lo que se hace hoy en Turso.
- **Si se usan para ventas o soporte:** en la Base 2 o la 3.

---

## Recomendación por fases

1. **Ahora (Turso, staging):** una sola base con la Base 1 más formularios y usuarios. Cada sección nueva que se active (playas, hoteles, puertos…) se añade aquí.
2. **Cuando se active la analítica propia o haya mucho tráfico:** sacar la Base 4 a otra base de Turso, en el mismo grupo y región. Es la separación más barata, porque no tiene JOIN.
3. **Cuando haya pagos reales:** la Base 3, mejor en Postgres (el VPS). Necesita transacciones serias y auditoría.
4. **La Base 2** se separa solo si la comunidad crece mucho. Mientras tanto, puede convivir con la Base 1.

**Para que la separación no duela:** las tablas de las bases 2, 3 y 4 guardan el **slug** (`province_slug`, `entity_slug`), además del ID. Así se consultan en paralelo sin depender de la Base 1. Ver la explicación en la conversación sobre provincias y establecimientos.

## Regla para crear una tabla nueva (obligatoria, también para otros agentes)

Antes de crear una tabla o una migración, decide su base con esta tabla y anótala aquí, en el grupo que le toca.

| Si la tabla… | Va en |
|---|---|
| se publica en la web o se filtra por provincia, destino o tipo | **Base 1 · Contenido** |
| pertenece a un visitante con cuenta (perfil, favoritos, reseñas, puntos, viajes, social) | **Base 2 · Usuarios** |
| mueve dinero, contratos o facturas | **Base 3 · Dinero** |
| se escribe en cada visita o clic, o es un registro o caché que se puede borrar | **Base 4 · Registros** |

En caso de duda: si se cruza con contenido en casi todas las consultas, va en la Base 1.

Además:
- Las tablas de las bases 2, 3 y 4 que apunten a contenido guardan el `slug` (por ejemplo `province_slug`, `entity_type` + `entity_slug`), no solo el ID.
- Ninguna consulta une con JOIN tablas de bases distintas: se hacen dos consultas en paralelo.
- Los usuarios del panel (admin y editores: `users`, `login_attempts`, hoy en la Base 1 de Turso) no son los visitantes. Si se separa la Base 2, las cuentas de visitantes van allí. El equipo del panel puede quedarse en la Base 1 o moverse con ellas, pero sin mezclar roles: un visitante nunca recibe `admin` ni `editor`.

## Tipos de usuario

Una persona tiene **una sola cuenta** (`users`, Base 2), aunque cumpla varios papeles. Por ejemplo, una dueña de hotel que también es influencer y juega a la gamificación. Los papeles son roles (`user_roles`) más un perfil propio por tipo. No se crea una tabla de usuarios distinta por tipo.

| Tipo | Cuenta y perfil (Base 2) | Lo que publica (Base 1) | Dinero (Base 3) |
|---|---|---|---|
| Visitante o jugador | `profiles`, favoritos, reseñas, viajes, `user_gamification`, misiones, puntos | — | canjes con valor, si los hay |
| Dueño de empresa u operador | perfil, miembro de una organización (`org_members`) | ficha del establecimiento (`establecimientos`, `operator_listings`, habitaciones) | suscripciones, reservas, pagos, facturas, `org_*` de contratos |
| Guía turístico | perfil y certificaciones | ficha pública del guía (`tour_guides`) y sus tours | reservas y cobros |
| Vendedor del marketplace | perfil | — | `marketplace_vendors`, productos, pedidos y pagos |
| Tienda propia (Descubre RD) | — (la gestiona el equipo del panel) | — | `store_*`, pedidos y pagos |
| Influencer o creador | `creator_profiles`, sellos | vídeos o contenido publicado, si sale en la web | campañas, contratos, `creator_ledger`, pagos |
| Embajador o referido | perfil y códigos de referido | — | comisiones y pagos |
| Equipo del panel (admin, editor) | hoy `users` en la Base 1 de Turso | — | — |

Además:
- **Las cuentas de empresa, guía, vendedor e influencer necesitan verificación** antes de publicar o cobrar, por ejemplo con `business_verification_audits`. Un rol de negocio no da acceso al panel del equipo.
- **El dato público** (la ficha que se ve en la web) va en la Base 1. **El dato de la persona** (correo, teléfono, documentos) va en la Base 2. **El dato de cobro** (banco, facturas) va en la Base 3. La ficha guarda el `slug` o el ID del dueño, nunca sus datos personales copiados.

## Estado actual de Supabase frente a Postgres

Todas las tablas de `supabase/migrations` existen también en `backend/migrations`: no queda ninguna solo en Supabase. Se comparan los nombres, no las columnas. Supabase se puede tratar como histórico.

## Avisos encontrados

- Hay dos migraciones de Turso con el mismo número: `014_establishment_files.sql` y `014_event_venue_type.sql`. Funciona, porque se ordenan por nombre completo. No hay que renombrarlas: ya están aplicadas, y con otro nombre volverían a ejecutarse. La próxima migración tras `020_beaches.sql` será la `021`.
- Supabase y Postgres repiten casi todas las tablas. Supabase es el esquema viejo y no debería ser la fuente de verdad.
- Muchas secciones existen solo como archivos de `src/data`, sin tabla (lidomData, sorteosData, socialData…). Al pasar cada una a Turso, entra en el grupo que indica este documento.
