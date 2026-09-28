# 📋 Plan Maestro de Ejecución: 100 Mejoras del Ecosistema Descubre RD

Este plan estructura las **100 mejoras y pilares de seguridad/arquitectura** organizados cronológicamente por **Sprints y Fases de Impacto**, priorizando las tareas marcadas con **★ (Alto Impacto / Retorno Inmediato)**, manteniendo los mockups visuales intactos hasta finalizar la fase de diseño y coordinando la futura API de verificación con MITUR/SIGTUR.

---

## 🧭 Visión General de Fases y Sprints

```mermaid
gantt
    title Plan Maestro de Implementación - 100 Mejoras Descubre RD
    dateFormat  YYYY-MM-DD
    section Fase 1: Monetización & UX (Frontend)
    Página /para-empresas y Reclamo de Fichas        :done, f1_1, 2026-09-20, 2d
    Botón WhatsApp con mensaje prellenado             :done, f1_2, after f1_1, 3d
    Filtros y Buscador Global Unificado             :done, f1_3, after f1_2, 3d
    Atributos ricos en Fichas (Day pass, dietas)      :done, f1_4, after f1_3, 3d
    Banners Ad Server (Reducción a 8 formatos core)   :done, f1_5, after f1_4, 3d
    section Fase 2: Confianza, MITUR & Contenido
    Integración API SIGTUR & Sello Verificado         :done, f2_1, after f1_5, 3d
    Líneas Aéreas, Vuelos Directos & Traslados       :done, f2_2, after f2_1, 3d
    Consolidación y Redirección 301 de Rutas          :done, f2_3, after f2_2, 2d
    Guías de Cruceros (8 Horas en Puerto)             :done, f2_4, after f2_3, 3d
    section Fase 3: Seguridad, Backend & Pagos
    Políticas RLS al 100% y Hardening de Seguridad    :done, f3_1, after f2_4, 4d
    Pasarela Pagos Recurrentes & Facturación NCF      :done, f3_2, after f3_1, 4d
    Panel Unificado de Empresa (Merchant Dashboard)   :done, f3_3, after f3_2, 4d
    section Fase 4: Escalabilidad, IA & App
    Chatbot IA conectado a DB con RAG & Priorización :done, f4_1, after f3_3, 3d
    App Móvil PWA/Capacitor, QR Stamps & Offline     :done, f4_2, after f4_1, 3d
    section Fase 5: Monetización & Creadores (21 Modelos)
    Fase 1B: Quick Wins (Marketplace, Subscripciones):done, f5_1, after f4_2, 2d
    Fase 2B: Ad Server & Slots Patrocinados          :done, f5_2, after f5_1, 2d
    Fase 3B: Creadores UGC & Video Pipeline          :done, f5_3, after f5_2, 2d
    Fase 4B: Nuevos Productos (Seguros, Traslados)   :done, f5_4, after f5_3, 2d
    Fase 5B: Membresías VIP, Puntos & Ticketing      :done, f5_5, after f5_4, 2d
```

---

## ⚡ FASE 1: Monetización Rápida, Atributos de Fichas & Experiencia Frontend (Inmediato)
> **Objetivo:** Completar el diseño y la captación sin alterar los mockups estáticos actuales, maximizando el CTR y la captación de leads.

### Sprint 1.1: Reclamo y Captación Comercial (★ Completado / Refinado)
- [x] **★ 1. Página `/para-empresas` (`/planes`):** Tabla con Gratis, Premium ($39–$49/mo) y Destacado ($149–$189/mo), conmutador mensual/anual y FAQ fiscal NCF.
- [x] **★ 2. Botón "¿Es tu negocio? Reclama tu ficha":** Modal universal `ClaimBusinessModal` en hoteles, restaurantes, bares y centros de salud con campo para RNC y Licencia MITUR.
- [x] **★ 79. Botón de WhatsApp con mensaje prellenado:**
  - Formato: `"Hola [Nombre del Negocio], vi su ficha en Descubre República Dominicana y deseo consultar disponibilidad para..."`.
  - Integrado con 1 clic en fichas de Alojamiento (`AccommodationBookingCard`), Restaurantes (`RestaurantReservationCard`) y Bares (`BarVipBookingCard`).
- [x] **★ 6. Descuento por pago anual:** 2 meses gratis (20% de ahorro) resaltado en UI (`PricingPlan.tsx`).
- [x] **7. Cupos limitados de Destacado:** Badge "Cupos limitados por destino" en planes para generar urgencia de compra.

### Sprint 1.2: Enriquecimiento de Fichas por Categoría (101–112)
- [x] **★ 101. Hoteles con Day Pass:** Badge e indicador de Day Pass con horario (09:30 - 18:00), precio en DOP/USD y amenidades en [AlojamientoDetalle.tsx](file:///c:/Users/Ro.Guzman/OneDrive%20-%20sectur.gov.do/Escritorio/Sitios%20web/Desarrollo/Descubre%20RD/src/pages/AlojamientoDetalle.tsx).
- [x] **102. Política de niños en hoteles:** Indicador de hasta 2 niños gratis (0-5 años) y 50% de descuento (6-12 años) en [AlojamientoDetalle.tsx](file:///c:/Users/Ro.Guzman/OneDrive%20-%20sectur.gov.do/Escritorio/Sitios%20web/Desarrollo/Descubre%20RD/src/pages/AlojamientoDetalle.tsx).
- [x] **103. Restaurantes con etiquetas dietéticas:** Badges de Vegano, Sin Gluten y opciones criollas en [RestauranteDetalle.tsx](file:///c:/Users/Ro.Guzman/OneDrive%20-%20sectur.gov.do/Escritorio/Sitios%20web/Desarrollo/Descubre%20RD/src/pages/RestauranteDetalle.tsx).
- [x] **104. Rango de consumo promedio:** Estimación por persona en DOP y USD (`RD$ 750 – 1,500 (~$12–$25 USD)` / `RD$ 2,800 – 4,500`) en [RestauranteDetalle.tsx](file:///c:/Users/Ro.Guzman/OneDrive%20-%20sectur.gov.do/Escritorio/Sitios%20web/Desarrollo/Descubre%20RD/src/pages/RestauranteDetalle.tsx).
- [x] **105. Bares y Vida Nocturna:** Código de vestimenta (*Smart Casual*), edad mínima (18+ Exclusivo) y noches con DJ / orquesta en vivo en [BarDetalle.tsx](file:///c:/Users/Ro.Guzman/OneDrive%20-%20sectur.gov.do/Escritorio/Sitios%20web/Desarrollo/Descubre%20RD/src/pages/BarDetalle.tsx).
- [x] **106. Playas y Ríos:** Infraestructura detallada (parqueo vigilado, baños públicos, alquiler de sombrillas y puestos de comida) en [PlayaDetalle.tsx](file:///c:/Users/Ro.Guzman/OneDrive%20-%20sectur.gov.do/Escritorio/Sitios%20web/Desarrollo/Descubre%20RD/src/pages/PlayaDetalle.tsx).
- [x] **107. Acceso a Playas/Ríos:** Indicador de transporte (Guagua / Carro estándar o 4x4) en [PlayaDetalle.tsx](file:///c:/Users/Ro.Guzman/OneDrive%20-%20sectur.gov.do/Escritorio/Sitios%20web/Desarrollo/Descubre%20RD/src/pages/PlayaDetalle.tsx).
- [x] **108. Museos y Monumentos:** Tarifas diferenciadas nacionales (RD$ 75-100) vs extranjeros ($5 USD) y días de entrada libre (domingos gratis) en [MuseosMonumentos.tsx](file:///c:/Users/Ro.Guzman/OneDrive%20-%20sectur.gov.do/Escritorio/Sitios%20web/Desarrollo/Descubre%20RD/src/pages/MuseosMonumentos.tsx).
- [x] **112. Estado "Abierto Ahora":** Cálculo reactivo en tiempo real con zona horaria de República Dominicana (`America/Santo_Domingo`) en [src/lib/openStatus.ts](file:///c:/Users/Ro.Guzman/OneDrive%20-%20sectur.gov.do/Escritorio/Sitios%20web/Desarrollo/Descubre%20RD/src/lib/openStatus.ts), integrado en restaurantes y bares.

### Sprint 1.3: Ad Server y Optimización de Banners (113–122)
- [x] **Reducción a 8 Formatos Core:**
  1. *Billboard Desktop* (980x120)
  2. *Full-Width Panorámico* (1920x250)
  3. *Skyscraper Lateral* (120x600 y 160x600)
  4. *Leaderboard Estándar* (728x90)
  5. *Medium Rectangle / MPU* (300x250)
  6. *Half-Page* (300x600)
  7. *Mobile Sticky Footer* (320x50)
  8. *Mobile Large Banner* (320x100)
- [x] **Lazy Loading:** `loading="lazy"` y `decoding="async"` implementados de forma nativa en [BannerContentImage.tsx](file:///c:/Users/Ro.Guzman/OneDrive%20-%20sectur.gov.do/Escritorio/Sitios%20web/Desarrollo/Descubre%20RD/src/components/promo/BannerContentImage.tsx).
- [x] **Bloqueo de competidores:** Propiedad `isPremiumListing` añadida en [BannerAd.tsx](file:///c:/Users/Ro.Guzman/OneDrive%20-%20sectur.gov.do/Escritorio/Sitios%20web/Desarrollo/Descubre%20RD/src/components/promo/BannerAd.tsx) que bloquea y oculta automáticamente anuncios de competidores en fichas con Plan Premium.

---

## 🛡️ FASE 2: Confianza, Validación MITUR & Contenido de Alta Conversión
> **Objetivo:** Convertir el portal en la fuente de mayor autoridad y transparencia turística del país.

### Sprint 2.1: Verificación MITUR / SIGTUR & Confianza (23–30)
- [x] **★ 23. Conexión con API de Verificación MITUR:** Preparación de campo de licencia y sello "Verificado MITUR" en fichas; validación en vivo conectada con endpoint mock / backend de verificación.
- [x] **24. Registro de Rentas Cortas:** Campo obligatorio y badge visual de registro MITUR para alojamientos vacacionales tipo Airbnb (`/airbnb/:slug`).
- [x] **25. Fecha de "Última Verificación":** Sello visible con fecha en centros de salud 24h, clínicas, farmacias y trámites aduanales.
- [x] **26. Etiqueta "Patrocinado":** Transparencia estricta en banners y fichas destacadas para cumplimiento de Pro Consumidor en `BannerAd.tsx`.
- [x] **27. Política pública de opiniones:** Cláusula visible en `ReviewCard.tsx`: *“Los planes comerciales no permiten ocultar ni alterar reseñas de usuarios”*.
- [x] **29. Botón "Reportar dato incorrecto":** Componente de reporte rápido para corrección colaborativa de teléfonos, horarios o direcciones.

### Sprint 2.2: Contenido Nuevo con Mayor Intención de Compra (65–78)
- [x] **★ 65. Directorio de Líneas Aéreas & Vuelos Directos:**
  - Nueva página y ruta `/vuelos-aerolineas` y `/aerolineas`.
  - Directorio completo de aerolíneas nacionales e internacionales (Arajet, Air Century, American, Delta, JetBlue, Iberia, Air Europa, Air Canada, Copa).
- [x] **★ 66. Traslados Aeropuerto–Hotel:**
  - Sección y banner de traslados certificados (taxis oficiales, transfer privados y rent-a-car) integrado en `/vuelos-aerolineas` y `/aeropuerto`.
- [x] **67. Guías "Dónde quedarse en…":** Artículos editoriales comparativos por destino (Bávaro vs Cap Cana; Las Terrenas vs Las Galeras; Jarabacoa vs Constanza) en [ItinerariosRecomendados.tsx](file:///c:/Users/Ro.Guzman/OneDrive%20-%20sectur.gov.do/Escritorio/Sitios%20web/Desarrollo/Descubre%20RD/src/pages/ItinerariosRecomendados.tsx).
- [x] **69. "Qué hacer en 8 Horas" para Cruceristas:**
  - Landings y guías dedicadas para pasajeros de **Amber Cove**, **Taino Bay**, **Port Cabo Rojo**, **Sans Souci** y **La Romana** en `PuertoDetalle.tsx` y `PuertosMarinas.tsx`.
- [x] **71. Calendario de Fiestas Patronales:** Directorio mensual de celebraciones patronales y culturales por municipio integrado en [CalendarioMensual.tsx](file:///c:/Users/Ro.Guzman/OneDrive%20-%20sectur.gov.do/Escritorio/Sitios%20web/Desarrollo/Descubre%20RD/src/pages/CalendarioMensual.tsx).
- [x] **76. Soporte Multi-idioma con Francés:** Soporte completo en 6 idiomas (Español, Inglés, Francés, Alemán, Italiano, Portugués) integrado en `src/i18n/translations/`.

### Sprint 2.3: Consolidación y Limpieza SEO de Rutas (31–42)
- [x] **★ 36. Redirecciones 301 de rutas redundantes:**
  - `/mice-bodas` -> `/bodas` y `/mice` (con alias activos)
  - `/wellness` -> `/spas-wellness`
  - `/historia-rd` -> `/historia`
- [x] **34. Schema.org estructurado:** JSON-LD específico implementado para `Hotel`, `Restaurant`, `TouristAttraction`, `Event` y `FAQPage` en `SEOHead.tsx` e inyectado en páginas de detalle correspondientes.
- [x] **39. Archivo `llms.txt` y FAQs citables:** Archivo estándar `/public/llms.txt` generado para rastreadores de IA (ChatGPT Search, Gemini, Perplexity).

---

## 💳 FASE 3: Backend, Pagos Recurrentes, Panel Merchant & Seguridad
> **Objetivo:** Activar el motor de ingresos automatizado y blindar la infraestructura en la nube.

### Sprint 3.1: Seguridad y Arquitectura de Datos (324–338, 301–315)
- [x] **★ 324. RLS al 100% en Supabase:** Activación estricta de Row Level Security con corrección `TO authenticated` en 18 tablas y cierre de 12 tablas con `USING (true)` en `20260927000000_security_hardening.sql`.
- [x] **★ 325. Protección de claves y Edge Functions:** Verificación estricta de JWT y rol de administrador en `import-establecimientos`, sanitización en `chat-turistico` y `ai-recommendations`.
- [x] **★ 326. Gamificación Blindada (RPC definer):** Topes de 200 XP por acción y 1500 XP por día con cálculo atómico de nivel y canje de premios en el servidor (`award_points` y `redeem_prize`).
- [x] **★ 330. Roles seguros y triggers de integridad:** Triggers para reseñas no auto-verificadas (`guard_review_fields`), reservas protegidas (`guard_reservation_fields`) y contadores sociales.
- [x] **★ 301. Anonimización de perfiles y privacidad:** Protección de correo local en `handle_new_user`, supresión de RNC/cédula en consultas públicas de establecimientos y bucket `csv-imports` privado.
- [x] **★ 308. URLs de retorno permitidas:** Whitelist cerrada de redirecciones en Supabase Auth (`supabase/config.toml` con `site_url`, wildcard de subdominios oficiales y localhost) y longitud mínima de contraseña de 8 caracteres.

### Sprint 3.2: Motor de Pagos Recurrentes & Facturación Fiscal (3, 4, 389–393)
- [x] **★ 3. Integración de Pasarelas de Pago:**
  - Mockup visual y soporte contractual para pasarelas locales (Azul del Banco Popular y CardNet en DOP) y Stripe Billing internacional en USD visible en `/para-empresas`.
- [x] **★ 4. Facturación con NCF:** Módulo `fiscal_invoices` y `fiscal_sequences` en backend con soporte de comprobantes electrónicos (e-CF DGII: B01 crédito fiscal, B02 consumidor final, E31 y E32), código de seguridad criptográfico SHA-256 y endpoints `POST /invoices/issue`, `GET /invoices/:ncf` y `GET /invoices`.
- [x] **★ 389. Validación de montos en servidor e idempotencia:** Validación de precios atómica en base de datos (`bookings`, `store`, `marketplace`, `memberships`) y tabla `payment_events` idempotente con conciliación de webhooks.

### Sprint 3.3: Panel Unificado de Negocios (13–22)
- [x] **★ 13. Panel de Empresa Centralizado (`/panel-empresa`):**
  - Módulos de gestión UI: Habitaciones para hoteles (`HotelToolsModule`), Menú para restaurantes (`RestaurantToolsModule`), Excursiones para operadores (`OperatorToolsModule`) y Guías (`GuideToolsModule`).
- [x] **★ 14. Estadísticas de Leads:**
  - Visualización en panel de clics a WhatsApp, llamadas directas iniciadas y rutas abiertas en GPS integrado en [PartnerKpiCards.tsx](file:///c:/Users/Ro.Guzman/OneDrive%20-%20sectur.gov.do/Escritorio/Sitios%20web/Desarrollo/Descubre%20RD/src/components/partner/PartnerKpiCards.tsx) (con soporte para telemetría real).
- [x] **17. Editor de Menús y Precios:** Interfaz visual para actualizar platos del día, precios en DOP/USD y platos estrella.
- [x] **18. Gestor de Habitaciones y Temporadas:** Editor de tarifas de cuartos, Day Pass y disponibilidad en tiempo real.
- [x] **20. Respuestas públicas a reseñas:** Los establecimientos verificados pueden responder comentarios de usuarios mediante `PartnerReviewsManager.tsx`.

---

## 📱 FASE 4: App Móvil, IA Avanzada & Escala Masiva
> **Objetivo:** Omnicanalidad, experiencia sin conexión y fidelización del viajero.

### Sprint 4.1: Chatbot con IA Conectado a Datos Reales (123–132)
- [x] **★ 123. Chatbot con RAG y Base de Datos:** Recomendaciones con enlaces y metadatos directos a las fichas del catálogo (`places: {type, ref, name, is_verified, is_sponsored}`) vía SSE streaming (`POST /ai/chat`).
- [x] **124. Priorización de negocios verificados:** Motor de candidatos en `AiService` con ordenamiento prioritario `is_sponsored DESC, is_verified DESC, score DESC` e inyección de sellos `[Verificado Oficial MITUR]` y `[Destacado]` en el contexto del LLM.
- [x] **125. Planificador de itinerario guardable:** Rutas en el mapa y planes de días (`POST /ai/itinerary`) exportables y guardables directamente en "Mi Viaje" (`POST /me/trips/:id/from-itinerary`).

### Sprint 4.2: App Móvil PWA / Capacitor (219–226)
- [x] **★ 219. Envoltorio Capacitor & Arquitectura Móvil:** Arquitectura de API REST bilingüe y desacoplada lista para consumo tanto de PWA como de contenedores nativos iOS/Android.
- [x] **220. Escaneo de QR para Sellos:** Sellos del pasaporte digital validados por código QR en el establecimiento o atractivo (`passport_qr_codes` y `POST /gamification/passport/scan-qr`) con adjudicación atómica de puntos XP y monedas.
- [x] **222. Modo Sin Conexión:** Endpoint de paquete consolidado de emergencia (`GET /content/offline-bundle`) con clínicas, embajadas, peajes y contactos 24h (911, POLITUR, MOPC, Cruz Roja) para caché local y consulta offline.

---

## 💰 FASE 5: Monetización de Creadores + 20 Modelos de Negocio
> **Estrategia Dual:** 
> - **Pista Backend:** Implementación activa en `backend/` con datos reales, modelos PostgreSQL, contratos versionados (`/api/v1`) y suite de pruebas, sin tocar el frontend.
> - **Pista Frontend (Backlog/Especificación):** Queda en especificación técnica estricta con contratos de API definidos para cuando se solicite su conexión. No se tocan ni modifican componentes en `src/`.

### Matriz de los 21 Ítems (Creadores + 20 Modelos)

| Grupo | Ítems | Backend Necesario | Frontend Necesario (Futuro Backlog) |
|---|---|---|---|
| **A. Extensión Inmediata** | **#1** Marketplace experiencias, **#3** Suscripción operadores, **#6** Misiones patrocinadas, **#16** API B2B | **Bajo:** Extender `marketplace`, `operators`, `game`, exponer endpoint de API keys | **Bajo:** Paneles ya existentes en mockup, solo nuevos campos |
| **B. Publicidad & Patrocinio** | **#2** Posiciones patrocinadas, **#8** Banners, **#9** Contenido patrocinado, **#10** Email patrocinado, **#11** Push patrocinado | **Medio:** Motor de "slots" pagados (`sponsorship`), tracking de impresiones/clics | **Medio:** Nuevos componentes de banner/badge "patrocinado" |
| **C. Nuevos Productos Transaccionales** | **#12** Seguros, **#13** Traslados / Rent-a-car, **#14** Tienda ampliada, **#17** Paquetes dinámicos | **Medio-Alto:** Nuevas categorías en `marketplace`/`store`, integraciones de proveedores externos | **Medio-Alto:** Nuevos flujos de checkout |
| **D. Fidelización & Membresía** | **#18** Puntos canjeables, **#19** Pasaporte RD (membresía anual) | **Alto:** Nuevo módulo `memberships`, extensión de `game`, cobro recurrente | **Alto:** Nueva sección completa de membresías |
| **E. Datos & Certificación B2B** | **#5** Venta de datos agregados, **#15** Sello "verificado" | **Medio:** Anonimización de `analytics`, flujo de auditoría en admin | **Bajo:** Badge oficial + panel admin |
| **F. Eventos en Vivo** | **#20** Streaming patrocinado + entradas | **Medio:** Extender `live` + `payments` para ticketing | **Alto:** Reproductor / checkout de evento |
| **G. Creadores UGC** | Módulo `creators` completo (3 capas: comisión, licencia, fondo) | **Alto:** Nuevo módulo `creators`, video en `media`, atribución, liquidaciones | **Alto:** Subida de video, perfil de creador, reproductor |

---

### Orden Cronológico de Ejecución Backend

#### Fase 1B — Quick Wins sobre Módulos Existentes (Grupos A + E)
- [x] **Marketplace de Experiencias & Tours (#1):** Extendido `marketplace` con categorías de tours/experiencias (`tour-aventura`, `tour-cultural`, `deportes-acuaticos`, `ecoturismo`) reutilizando motor de catálogo y liquidaciones.
- [x] **Niveles de Suscripción para Operadores (#3):** Niveles destacados (`destacado`, `premium_partner`, `corporativo`), ordenamiento por prioridad y rutas `GET /org/subscription`, `POST /org/subscription/upgrade` y `POST /org/subscription/cancel`.
- [x] **Misiones Patrocinadas (#6):** Soporte en `gamification_missions` para `sponsor_id`, `sponsor_name`, `sponsor_logo_url`, `sponsor_reward_text`, `is_sponsored` y endpoint de creación administrativa.
- [x] **Flujo de Sello "Verificado" (#15):** Tabla `business_verification_audits`, listado con filtros, y endpoints administrativos `POST /admin/verifications/:id/approve` y `POST /admin/verifications/:id/reject` con auto-aprobación institucional.
- [x] **Datos Agregados & API B2B (#5, #16):** Tabla `b2b_api_keys`, generación/revocación de claves SHA-256 (`/b2b/api-keys`), y endpoint B2B seguro anonimizado `GET /api/v1/b2b/analytics/aggregate`.

#### Fase 2B — Motor de Patrocinio Genérico (Grupo B)
- [x] **Módulo `sponsorship` Unificado:** Abstracción unificada de "slot pagado" (posiciones de búsqueda #2, banners #8, contenido #9, emails #10, push #11) con modelos `sponsorship_campaigns`, `sponsorship_slots` y `sponsorship_creatives`.
- [x] **Telemetría de Ad Server:** Tracking de impresiones, clics y conversiones (`POST /sponsorship/telemetry`), rotación ponderada por peso y geosegmentación (`GET /sponsorship/serve/:slot_id`), y cálculo de gasto publicitario en tiempo real (CPC/CPM).

#### Fase 3B — Módulo de Creadores UGC (Grupo G)
- [x] **Arquitectura de Creadores:** Tablas `creator_profiles`, `creator_videos`, `creator_video_events` y `creator_payouts` con soporte de monetización en 3 capas (comisiones por venta vinculada, licenciamiento a operadores y fondo de creadores).
- [x] **Pipeline y Endpoints de Creador:** Registro y onboarding (`POST /creators/onboarding`), feed público (`GET /creators/feed`), perfil de métricas (`GET /creators/me`), publicación de videos con slug único (`POST /creators/videos`), telemetría de engagement (`POST /creators/videos/:id/events`) y liquidación administrativa de payouts (`POST /admin/creators/:id/payout`).

#### Fase 4B — Nuevos Productos Transaccionales (Grupo C)
- [x] **Nuevas Líneas de Producto:** Conectores y modelos para seguros de viaje con cobertura médica y cancelación (#12, tabla `travel_insurance_policies`), traslados privados / chofer / rent-a-car (#13, tabla `transport_bookings`), y paquetes turísticos dinámicos multidestino (#17, tabla `dynamic_packages`).
- [x] **Endpoints Transaccionales:** Emisión de pólizas (`POST /insurance/quote-and-issue`), reservas de transporte con comisión de plataforma (`POST /transport/book`), y catálogo de paquetes dinámicos (`GET /packages/dynamic`).

#### Fase 5B — Membresías y Eventos en Vivo (Grupos D + F)
- [x] **Módulo `memberships` & Pasaporte VIP (#19):** Motor de membresía anual recurrente (`membership_plans`, `user_memberships`), beneficios y niveles de fidelización con ledger de puntos (#18, `loyalty_points_ledger`) con endpoints `/memberships/plans`, `/memberships/subscribe` y `/memberships/me`.
- [x] **Ticketing de Eventos en Vivo (#20):** Emisión de entradas con código QR único (`event_tickets`), acreditación automática de puntos de fidelidad por compra (`POST /events/:id/tickets/purchase`) y control de acceso/check-in con verificación criptográfica (`POST /events/tickets/verify`).

---

## 📈 Protocolo de Actualización del README.md
Cada vez que un sprint o tarea del plan sea implementado:
1. Se marcará la tarea completada en la documentación técnica interna.
2. Se actualizará la sección correspondiente en [README.md](file:///c:/Users/Ro.Guzman/OneDrive%20-%20sectur.gov.do/Escritorio/Sitios%20web/Desarrollo/Descubre%20RD/README.md) reflejando las nuevas rutas, componentes y capacidades activas.
