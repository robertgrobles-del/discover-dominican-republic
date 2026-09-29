# 📋 Plan Maestro de Ejecución: Ecosistema Descubre RD (Fases, Ramas & 100+ Mejoras)

Este plan estructura las **100+ mejoras y pilares de seguridad, frontend, backend y arquitectura de base de datos** organizados por **Fases y Sprints**, aplicando una política de **control de versiones por ramas (Feature Branches)** y **commits fragmentados atómicos por dominio**.

---

## 🌿 Estrategia de Ramas & Git Workflow

De ahora en adelante, **cada etapa se desarrollará en una o varias ramas dedicadas**, evitando commits masivos y garantizando revisiones aisladas:

- **Política de Ramas:**
  - `main`: Rama de producción (borrador de ideas e integración validada).
  - `dev`: Rama principal de desarrollo donde convergen las características probadas.
  - `feature/*`: Funcionalidades nuevas (ej. `feature/seo-dinamico`, `feature/mcp-fastify`, `feature/marketplace-decoupling`).
  - `refactor/*`: Refactorizaciones de código (ej. `refactor/god-objects-src-features`).
  - `security/*`: Tareas de hardening e higiene (ej. `security/git-history-purge`).
  - `infra/*`: CI/CD y gestores de paquetes (ej. `infra/npm-ci-unification`).

- **Regla de Commits Fragmentados:**
  - Prohibidos los commits masivos de más de 500 líneas.
  - Commits atómicos prefijados según convención: `feat:`, `fix:`, `refactor:`, `security:`, `docs:`, `chore:`.
  - Agrupación estricta por dominio (ej: *"feat(store): migraciones DB tienda"*, *"refactor(frontend): desacoplar MarketplaceCatalog"*, *"ci: setup backend workflow"*).

---

## 🧭 Visión General de Fases

```mermaid
gantt
    title Plan Maestro de Implementación - Descubre RD
    dateFormat  YYYY-MM-DD
    section Fases Iniciales (Frontend & MVP)
    Fase 1: Monetización & UX Frontend              :done, f1, 2026-09-01, 10d
    Fase 2: Confianza, MITUR & Contenido             :done, f2, after f1, 10d
    Fase 3: Backend, RLS, NCF & Merchant Dashboard    :done, f3, after f2, 10d
    Fase 4: App Móvil, IA Avanzada & Offline         :done, f4, after f3, 8d
    Fase 5: Monetización Creadores & 21 Modelos      :done, f5, after f4, 10d
    section Fases de Consolidación & Ramas
    Fase 6: SEO Dinámico, Robots & Desmontaje Lovable :done, f6, 2026-09-28, 5d
    Fase 7: Componentización Frontend & God Objects  :f7, after f6, 7d
    Fase 8: Gran Integración (Frontend ↔ Fastify)    :f8, after f7, 10d
    Fase 9: Arquitectura DB Avanzada, Workers & Sec  :done, f9, after f8, 8d
    Fase 10: 50 Medidas Industriales & CI/CD Hardening:active, f10, after f9, 10d
    section Auditoría Técnica & Diseño/Monetización
    Fase 11: Auditoría 100 Frontend + 100 Backend     :f11, after f10, 12d
    Fase 12: Diseño, Rutas & 50 Nuevos Modelos Ingreso:f12, after f11, 12d
```

---

## ⚡ FASE 1: Monetización Rápida, Atributos de Fichas & Experiencia Frontend
- [x] **★ 1. Página `/para-empresas` (`/planes`):** Tabla con Gratis, Premium y Destacado con FAQ fiscal NCF.
- [x] **★ 2. Botón "¿Es tu negocio? Reclama tu ficha":** Modal universal `ClaimBusinessModal`.
- [x] **★ 79. Botón de WhatsApp con mensaje prellenado:** Integración directa con 1 clic en fichas.
- [x] **★ 101–112. Atributos ricos:** Day Pass en hoteles, menús dietéticos en restaurantes, dress code en bares, precios de entradas a museos, cálculo reactivo de estado "Abierto Ahora" (`America/Santo_Domingo`).
- [x] **113–122. Ad Server Frontend:** 8 formatos core de banners con Lazy loading y bloqueo de competidores para fichas Premium.

---

## 🛡️ FASE 2: Confianza, Validación MITUR & Contenido de Alta Conversión
- [x] **★ 23–30. Verificación MITUR / SIGTUR:** Sello "Verificado MITUR", badge para rentas cortas Airbnb, sello con fecha de última verificación y botón "Reportar dato incorrecto".
- [x] **★ 65–78. Directorio de Transportes & Guías:** `/vuelos-aerolineas`, traslados aeropuerto-hotel, guías "Qué hacer en 8 Horas" para cruceristas (Amber Cove, Taino Bay, Port Cabo Rojo, Sans Souci) y multi-idioma (6 idiomas).
- [x] **★ 31–42. SEO Estructurado:** Redirecciones 301 de rutas redundantes, Schema.org (Hotel, Restaurant, TouristAttraction) y archivo `llms.txt`.

---

## 💳 FASE 3: Backend, RLS, NCF & Panel Merchant
- [x] **★ 324–338. RLS al 100% & Security Hardening:** RLS en 18 tablas Supabase, triggers definer para gamificación atómica (200 XP/acción, 1500 XP/día) y whitelist de URLs de auth.
- [x] **★ 3–4, 389. Pasarela & Facturación Fiscal NCF:** Soporte para e-CF DGII (B01, B02, E31, E32), hash SHA-256 y tabla `payment_events` idempotente.
- [x] **★ 13–22. Panel Unificado de Negocios (`/panel-empresa`):** Módulos para hoteles, restaurantes, operadores y guías con métricas de leads (WhatsApp, llamadas, GPS).

---

## 📱 FASE 4: App Móvil, IA Avanzada & Escala Masiva
- [x] **★ 123–132. Chatbot IA RAG & Priorización:** Streaming SSE (`POST /ai/chat`), priorización de negocios verificados/patrocinados e itinerarios exportables a "Mi Viaje".
- [x] **★ 219–226. App Móvil & Offline:** Envoltorio Capacitor, escaneo de QR para sellos de pasaporte digital y paquete offline de emergencia (`GET /content/offline-bundle`).

---

## 💰 FASE 5: Monetización de Creadores + 21 Modelos Backend
- [x] **Fase 1B — Quick Wins:** Marketplace de experiencias, niveles de suscripción de operadores, misiones patrocinadas, sellos auditados y API Keys B2B SHA-256 (`/api/v1/b2b/analytics/aggregate`).
- [x] **Fase 2B — Motor `sponsorship`:** Slots publicitaros unificados, telemetría CPC/CPM y geosegmentación (`POST /sponsorship/telemetry`).
- [x] **Fase 3B — UGC Creadores:** Perfiles, licenciamiento, feed de video y payouts administrativos.
- [x] **Fase 4B — Productos Transaccionales:** Seguros de viaje (`travel_insurance_policies`), traslados privados y paquetes dinámicos multidestino.
- [x] **Fase 5B — Membresías VIP & Eventos:** Pasaporte RD recurrente, ticketing con verificación QR y ledger de puntos atómico.

---

## 🚀 FASE 6: SEO Dinámico, Rescate de Assets, Desmontaje de Lovable.dev & Git Clean (Completada)
> **Rama de Trabajo:** `feature/seo-mcp-git-clean`

- [x] **★ 6.1 SEO Dinámico en Backend (Fastify + Postgres):**
  - Endpoint `GET /sitemap.xml` y `GET /api/v1/sitemap.xml` en `backend/src/modules/seo/routes.ts`.
  - Consulta PostgreSQL real recorriendo `COLLECTIONS` (`slug`, `updated_at`/`created_at`) por cada colección registrada, sin regex sobre `App.tsx`.
  - XML generado con `Content-Type: application/xml; charset=utf-8` y `Cache-Control` de 1h/24h.
- [x] **★ 6.2 Rescate de Reglas SEO & Rastreadores IA:**
  - `public/robots.txt` y `public/llms.txt` presentes en `dev`.
  - Bloquea `/admin`, `/login`, `/registro`, `/reset-password`, `/perfil`, `/reservas`, `/panel-empresa`; permite explícitamente **GPTBot**, **ClaudeBot**, **PerplexityBot**, **ByteSpider**, Googlebot, Bingbot, Twitterbot y facebookexternalhit.
- [x] **★ 6.3 Desmontaje completo de la plataforma Lovable.dev y su MCP (decisión 2026-09-29: eliminar, no adaptar):**
  - Eliminado `.lovable/mcp/manifest.json` — el manifiesto declaraba herramientas (`search_destinations`, `search_places`, `add_favorite`) contra rutas que **nunca existieron** en el backend real (`/content/destinations`, `/trips/favorites`) y no estaba servido por ningún servidor MCP real ni referenciado por el código: era un archivo muerto.
  - Quitado `lovable-tagger` de `vite.config.ts` (import y `componentTagger()`) y de `package.json`/`package-lock.json` — solo aportaba atributos `data-lov-*` en modo desarrollo para el editor visual de Lovable; nada del código dependía de él.
  - Reemplazado el "AI Gateway" de Lovable (`ai.gateway.lovable.dev`, variable `LOVABLE_API_KEY`) por llamadas directas a la API de Gemini (`generativelanguage.googleapis.com/v1beta/openai/...`, variable `GEMINI_API_KEY`) en las tres funciones Supabase que lo usaban como proveedor de IA: `chat-turistico`, `ai-recommendations`, `admin-ai-operations`.
  - Corregidas menciones sueltas en `docs/BACKEND_API.md`, `docs/referencias_gran_santo_domingo/AGENTS.md` y dominio `descubrerd.lovable.app` → `descubrerd.do` en `public/sitemap.xml`.
  - Verificado con barrido `grep -rli lovable` sobre todo el repo (excluyendo `node_modules`/`.git`/`dist`): **cero referencias** restantes fuera de este historial del plan.
- [x] **★ 6.4 Higiene de Dependencias:**
  - `package.json`/`package-lock.json` regenerados sin `lovable-tagger`; Zod se mantiene en `^3.25.76` (frontend) y `^4.6.5` (backend), ambas fijas y sin cambios caóticos.
  - No hay `bun.lock`/`bun.lockb` en el repo.
- [x] **★ 6.5 Higiene de Git (parcial — ver nota):**
  - `.env` retirado del índice de Git (`git rm --cached .env`); ya estaba en `.gitignore`. Contenido verificado: solo `VITE_SUPABASE_PROJECT_ID/PUBLISHABLE_KEY/URL` (claves públicas del cliente, no secretos privados) — riesgo real bajo, pero igual no debe versionarse.
  - **Pendiente y requiere confirmación explícita antes de ejecutar:** purgar el historial completo de Git (`git filter-repo`/BFG) para borrar el `.env` de commits pasados y mover los binarios pesados (`.docx`/`.zip` de `public/cosas nuevas/`) fuera del repo — es una operación destructiva que reescribe el historial compartido en `origin` (GitHub) y exige forzar el push; no se ejecuta sin autorización explícita del usuario.

---

## 🧩 FASE 7: Componentización Frontend & Desacople de God Objects (Completado)
> **Rama de Trabajo:** `refactor/god-objects-src-features` (fusionada a `dev`)

- [x] **7.1 Desacoplamiento de `Marketplace.tsx` (704 líneas):**
  - Creados componentes modulares en `src/features/marketplace/`:
    - `<MarketplaceCatalog />` (grilla interactiva de productos y servicios).
    - `<VendorProfile />` (información del vendedor / artesano local).
    - `<FilterSidebar />` (filtro por categorías, precios y ubicaciones).
- [x] **7.2 Desacoplamiento de `ForoDestino.tsx` (361 líneas):**
  - Creados componentes modulares en `src/features/forum/`:
    - `<ThreadList />` (lista paginada de hilos de discusión).
    - `<ReplyEditor />` (editor de respuestas con validación Zod).
    - `<ReportModal />` (lógica de moderación de contenido).
- [x] **7.3 Erradicación de Datos Quemados (Hardcoding):**
  - Refactorizados `SuscripcionesSabores.tsx` y `MonorielSantiago.tsx` para dejarlos limpios y listos para props/hooks dinámicos.

---

## 🔗 FASE 8: La Gran Integración (Frontend ↔ Backend Fastify) (Completado)
> **Rama de Trabajo:** `feature/frontend-fastify-integration` (fusionada a `dev`)

- [x] **8.1 Cliente Unificado de API (`src/lib/fastifyClient.ts`):** Peticiones tipadas conectadas a `/api/v1/content/...`, `/api/v1/store/...`.
- [x] **8.2 Hooks Asíncronos con TanStack Query (`src/hooks/useFastifyContent.ts`):** Gestión de caché (5 min stale time), reintentos automáticos y deduplicación.
- [x] **8.3 Cálculos Críticos Aislados en Backend (`calculateCartTotal`):** Prohibido el cálculo de subtotales o ITBIS (18%) en React; cálculo atómico servido por Fastify/PostgreSQL.

---

## ⚙️ FASE 9: Optimización de Arquitectura, DB & Infraestructura (Completada)
> **Rama de Trabajo:** `infra/architecture-db-workers`

- [x] **9.1 Delegación de Telemetría a Redis:**
  - `TelemetryQueue` (`src/lib/telemetry-queue.ts`): con `REDIS_URL` configurado, `POST /analytics/events` encola (`LPUSH`) en vez de insertar directo; el job `analytics.flush_queue` (cada 30s) vacía en lotes de hasta 500 (`RPOP ... COUNT`). Sin `REDIS_URL`, o si falla encolar, inserta directo como antes — cambio 100% retrocompatible.
  - `sponsorship_events` se deja **deliberadamente síncrono**: su inserción comparte transacción con la validación de campaña y el descuento de presupuesto (`budget_spent`), dinero real — encolarlo cambiaría cuándo se confirma el gasto. Documentado en `backend/README.md`.
- [x] **9.2 Bloqueo entre instancias en Cron Jobs:** ya resuelto de fondo — `JobRunner.execute()` reclama cada trabajo con un único `UPDATE system_cron_jobs SET status='running' WHERE status IS DISTINCT FROM 'running' ... RETURNING id`, atómico a nivel de fila en PostgreSQL: con varias instancias sólo una obtiene la fila. Cumple el mismo objetivo que `pg_advisory_lock`/Redlock sin infraestructura adicional y deja el estado visible/editable desde el panel admin. Documentado en `backend/README.md`.
- [x] **9.3 Verificación de Magic Bytes en Subida de Archivos:** ya resuelto de fondo — `readImage`/`sniffMime` (`src/modules/media/images.ts`) detectan el formato real por la firma de los primeros bytes (PNG/JPEG/WebP/GIF), no por `Content-Type` ni extensión; rechaza cualquier archivo cuyos bytes no correspondan antes de procesarlo con `sharp` o pasarlo al antivirus.

**Hallazgos de seguridad encontrados y corregidos al correr la suite completa (ver nota más abajo sobre `vitest.config.ts`):**
- `POST /memberships/subscribe`, `GET /memberships/me` y `POST /events/:id/tickets/purchase` no exigían sesión y, peor, caían a un usuario demo hardcodeado (`usr_demo_vip_traveler`) si no había token — cualquiera podía crear suscripciones/tickets a nombre de esa cuenta compartida. Corregido: las tres exigen `onRequest: app.authenticate` y usan `request.user!.id`.
- `POST /events/tickets/verify` (check-in de ticket en la puerta) tampoco exigía sesión; ahora exige `app.authenticate`, igual que el `POST /tickets/verify` ya existente en `trips`.
- `POST /invoices/issue` (emisión de comprobante fiscal NCF) era una ruta pública sin ninguna protección: cualquiera podía emitir un NCF válido con nombre de comprador y montos arbitrarios, y no estaba conectada a ningún flujo de pago real. Corregido: exige `app.requireRole("admin")`. `GET /invoices/:ncf` y `GET /invoices` (exponen nombre/RNC/cédula del comprador) ahora exigen sesión.

**Nota — `vitest.config.ts` sólo ejecutaba 9 de 47 archivos de test:** el `include` de los dos proyectos (integración/unitario) listaba nombres de archivo obsoletos (`travels.test.ts`, `gamification.test.ts`, `billing.test.ts`, que ya no existen) y omitía 38 archivos reales sin que nada lo señalara — `npx vitest run` "pasaba" en verde reportando sólo 118 de 619 pruebas. Corregido: el `include` ahora lista los 47 archivos reales, correctamente repartidos entre el proyecto con DB (39) y el de mocks puros (8). Al correr la suite completa por primera vez en mucho tiempo aparecieron, además de los hallazgos de seguridad de arriba: dos migraciones con bugs reales (`0043` referenciaba una columna `status` inexistente en vez de `subscription_status`; `0046` tipaba `tour_listing_id` como `uuid` cuando `operator_listings.id` es `text`), una migración (`0047`) que reusaba el nombre `event_tickets` ya ocupado por la tabla base de e-tickets de reservas (renombrada a `live_event_tickets`), y `0050` con BOM UTF-8, `CREATE INDEX CONCURRENTLY` (incompatible con que el migrador envuelve cada archivo en una transacción) y tres índices sobre columnas que no existen — todo corregido. **Verificación final: 47/47 archivos y 618/619 pruebas en verde (1 skip de Redis) en una corrida limpia y aislada.**

---

## 🏢 FASE 10: 50 Medidas de Producción Industrial (Seguridad, UX, DB & DevOps)
> **Ramas por Categoría:** `security/*`, `perf/*`, `db/*`, `devops/*`
> **Auditoría 2026-09-29:** antes de marcar cada ítem se verificó el código real (no se asume nada por el nombre de la fase). La Categoría 1 (Seguridad) resultó ya estar prácticamente completa de fases anteriores — se documenta aquí con su referencia exacta. Las categorías 2 (Frontend), 5 (Negocio) y 6 (DX/DevOps) restantes **no se han auditado todavía** ítem por ítem; quedan `[ ]` a propósito hasta hacerlo, no se asume que falten ni que estén.

### 🔒 1. Seguridad y Autenticación (Auditada — 9/10 ya existían de fases previas, 1 implementado ahora)
- [x] **1. Content Security Policy (CSP):** `@fastify/helmet` en `registerSecurity` (`src/plugins/security.ts`) con `contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } }` (se desactiva sólo si `/docs` está habilitado, que necesita sus propios scripts).
- [x] **2. Sanitización Zod + Fastify:** ya es el patrón de todo el proyecto — cada ruta define `body`/`querystring`/`params` con Zod vía `fastify-type-provider-zod`; entradas fuera de esquema se rechazan antes de tocar la DB.
- [x] **3. Ocultar Header `Server`/`X-Powered-By`:** Fastify no envía ninguno de los dos por defecto (a diferencia de Express); nada en el código los añade. No requiere acción.
- [x] **4. Cookies HttpOnly & Secure:** refresh token y estado OAuth se fijan con `httpOnly: true, secure: NODE_ENV === "production", sameSite: "lax"` (`src/modules/auth/routes.ts`).
- [x] **5. Auditoría de Dependencias Bloqueante:** `npm run audit` (`npm audit --omit=dev --audit-level=high`) ya es un paso del workflow `.github/workflows/backend.yml`, después de los tests y antes del build Docker.
- [x] **6. Escáner de Malware para Uploads:** `ClamdScanner` (`src/modules/media/antivirus.ts`, Fase de S3/antivirus) — protocolo INSTREAM de clamd, fail-closed (un timeout/error deja el archivo sin aprobar, nunca "limpio" por defecto).
- [x] **7. Rate Limiting Específico:** login y registro usan `limit(10, "1 hour")` propio (`src/modules/auth/routes.ts`); cada ruta sensible (OTP, reset, 2FA) tiene su propia cuota vía el helper `limit()`.
- [x] **8. Rotación Forzada de Sesiones:** `resetPassword`/`updatePassword` revocan **todos** los `refresh_tokens` del usuario (`UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1`); activar/desactivar 2FA revoca todas las sesiones salvo la actual (`src/modules/auth/service.ts`).
- [x] **9. Doble Factor (2FA) para Staff:** `REQUIRE_2FA_FOR_STAFF` se aplica como middleware (`src/plugins/auth.ts:73`), no sólo informativo: cualquier ruta de un rol en `STAFF_ROLES` exige `req.user.mfa` cuando está activado; además no se puede desactivar 2FA en una cuenta staff mientras la bandera esté prendida.
- [x] **10. Validar URLs de Redirección OAuth:** `checkRedirect()` en `src/modules/auth/oauth.ts` exige protocolo `http`/`https` y origen dentro de `allowedOrigins()` (whitelist cerrada) antes de aceptar cualquier `redirect_to`.

### 🎨 2. Arquitectura Frontend (React, Vite & UX)
> **Fuera de esta auditoría (2026-09-29):** hay una sesión de Gemini trabajando en paralelo sobre el frontend (confirmado por el usuario); esta categoría, el ítem 48 (Schema LocalBusiness) y el 49 (PWA) no se tocan desde este lado para no chocar con ese trabajo. Quedan `[ ]` porque no se auditaron, no porque se hayan descartado.
- [ ] **11. Code Splitting / Lazy Loading:** `React.lazy()` en rutas pesadas (`<Marketplace/>`, `<ForoDestino/>`).
- [ ] **12. Error Boundaries:** Componente `<ErrorBoundary>` para aislar fallas en secciones críticas.
- [ ] **13. Virtualización de Listas:** `react-window` o `react-virtuoso` en feed del Foro y Marketplace.
- [ ] **14. Pre-carga de Fuentes (`<link rel="preload">`):** Evitar parpadeo FOUC en `index.html`.
- [ ] **15. Sincronización Optimista:** Actualizar likes en UI al instante y revertir si el servidor responde error.
- [ ] **16. Accesibilidad (a11y) Automatizada:** Linting obligatorio con `eslint-plugin-jsx-a11y`.
- [ ] **17. Imágenes Responsivas (`<picture>`):** WebP/AVIF adaptativos según resolución.
- [ ] **18. Eliminación de Lodash Global:** Importación modular (`import debounce from 'lodash/debounce'`).
- [ ] **19. Migas de Pan (Breadcrumbs) con Schema.org:** JSON-LD dinámico (Inicio > Destinos > Santiago > Monorriel).
- [ ] **20. Skeleton Loaders:** Reemplazar spinners genéricos con componentes Skeleton de Shadcn.

### ⚡ 3. Arquitectura Backend (Fastify & Escalabilidad) (Auditada — 8/10 ya existían, 1 implementado ahora, 1 pendiente real)
- [ ] **21. Paginación por Cursores (Keyset Pagination):** confirmado **pendiente de verdad** — `src/lib/pagination.ts` (`listQuery`) es 100% `page`/`per_page` → `OFFSET`/`LIMIT` en todos los listados. Migrar a keyset es un cambio grande (toca cada endpoint de listado); no se hizo en esta pasada para no arriesgar la suite en verde. Candidato para una rama propia (`perf/keyset-pagination`).
- [x] **22. Compresión de Respuestas:** implementado ahora — `@fastify/compress` registrado en `registerSecurity` (`src/plugins/security.ts`), Brotli/gzip global; ver `backend/README.md`.
- [x] **23. Trazabilidad con Request ID:** ya en `src/app.ts` (cabecera `X-Request-Id` propagada y expuesta por CORS).
- [x] **24. Graceful Shutdown:** `src/server.ts` captura `SIGINT`/`SIGTERM` y cierra el pool de Postgres limpiamente.
- [x] **25. Timeouts en Peticiones Externas:** `defaultFetch` en `src/modules/live/service.ts` usa `AbortSignal.timeout(10_000)` en toda llamada externa (tasas de cambio, etc.).
- [x] **26. Healthchecks Inteligentes:** `src/modules/health/routes.ts` verifica Postgres (`SELECT 1`), la cola de correo y Redis cuando está configurado; `/health/detailed` unifica todo con 200/206/503 según severidad.
- [x] **27. Generación de OpenAPI Automática:** `src/plugins/openapi.ts` genera el esquema desde los `schema` de Zod de cada ruta (`@fastify/swagger` + `fastify-type-provider-zod`); `npm run docs:api` lo consume para `docs/BACKEND_API_IMPLEMENTADO.md`.
- [x] **28. Manejo Centralizado de Errores:** `src/plugins/errors.ts` (`registerErrorHandling`) mapea `AppError`, violaciones de constraint de Postgres y errores de validación Zod a respuestas HTTP estándar con `request_id`.
- [x] **29. Caché ETag para Contenido Estático:** `src/plugins/etag.ts` (`registerEtag`) ya aplicado a las rutas públicas de contenido.
- [x] **30. WebSockets / SSE para Notificaciones:** `src/modules/notifications/routes.ts` sirve `text/event-stream` (con ticket de 60s para `EventSource` del navegador, según diferencia documentada en `BACKEND_API_IMPLEMENTADO.md`).

### 🗄️ 4. Base de Datos & SQL (PostgreSQL Avanzado) (Auditada parcialmente — 3/10 confirmados, resto sin verificar todavía)
- [~] **31. Vistas Materializadas para Reportes:** equivalente funcional, no `MATERIALIZED VIEW` literal — `analytics_daily` (`migrations/0026_analytics.sql`) es una tabla de agregados por día/tipo/página que el job `analytics.rollup` (cada 24h) llena con `INSERT ... ON CONFLICT DO UPDATE`, el mismo patrón que un `REFRESH MATERIALIZED VIEW` pero con control fino de qué se agrega y sin bloquear lecturas durante el refresco. No se creó una vista materializada literal aparte porque duplicaría esto.
- [x] **32. Índices Compuestos:** `bookings` tiene `(org_id, date)`, `(user_id, created_at)`, `(listing_id, date, time)` y `(room_id, date, check_out)` (`migrations/0013`); `store_orders` tiene `(user_id, created_at)` y `(status, created_at)` (`migrations/0022`); más 28 índices adicionales en `migrations/0050_performance_indexes.sql`.
- [x] **33. Índices GIN sobre JSONB/texto:** `migrations/0008_content_search.sql` crea `gin (lower(f_unaccent(col)) gin_trgm_ops)` por cada columna de búsqueda registrada.
- [x] **34. Purgado de Registros Huérfanos:** job `maintenance.purge` (`src/routes.ts`) corre cada 24h y borra tokens expirados, `email_log` viejo, `payment_events` procesados, notificaciones leídas y `store_carts` de invitado abandonados (>30 días).
- [ ] **35. Connection Pooling con PgBouncer:** no verificado.
- [ ] **36. UUIDv7 (Ordenables):** confirmado pendiente — 56 columnas usan `gen_random_uuid()` (v4, no ordenable) en `migrations/0001_baseline.sql`; migrar a v7 requeriría una extensión/función propia y tocar el `DEFAULT` de cada tabla. No se hizo por ser un cambio ancho de superficie para esta pasada.
- [ ] **37. Particionado de Tablas:** no verificado.
- [x] **38. Autovacuum Tuning:** implementado ahora — `migrations/0051_autovacuum_tuning.sql` baja `autovacuum_vacuum_scale_factor`/`autovacuum_analyze_scale_factor` (2% en `rate_limits`, la tabla de más escritura de todo el sistema; 5% en `analytics_events` y `sponsorship_events`) frente al 20%/10% por defecto de Postgres.
- [~] **39. Diccionarios Full-Text en Español:** decisión de arquitectura, no pendiente por descuido — la búsqueda del proyecto usa **trigramas** (`pg_trgm` + `f_unaccent`, ítem 33), no `tsvector`. Es una elección válida y distinta: trigramas toleran errores de tipeo y coincidencias parciales sin necesitar diccionario de idioma; `tsvector` con `spanish` aportaría stemming/ranking pero es un sistema de búsqueda paralelo (columnas, triggers para mantenerlo sincronizado, reescribir las consultas de `discover/routes.ts`) — no se implementó por ser una expansión de función, no una corrección.
- [x] **40. Bloqueo por Fila (Row-Level Lock):** `FOR UPDATE`/`FOR UPDATE OF` ya se usa en `operators/bookings.ts` (cuartos y reservas), `store/service.ts` (carrito, cupones, stock) y `marketplace/service.ts` (stock de productos) para evitar condiciones de carrera y sobreventa.

### 💰 5. Negocio, Monetización e Integraciones (Auditada parcialmente — 4/10 confirmados)
- [~] **41. Desglose Fiscal ITBIS (18%):** parcial — `src/modules/tools/calculators.ts` (`TAX_DEFAULTS`, 18%) expone una calculadora pública de ITBIS/propina legal, y `billing/invoicing.ts` desglosa `itbis` en el comprobante NCF final; no se confirmó que `store_orders`/`bookings` guarden el desglose como campo propio antes de facturar — pendiente de revisar.
- [x] **42. Manejo de Monedas Múltiples:** tabla `exchange_rates` (compra/venta por moneda y fecha) con historial, gestionada desde `live/service.ts` y expuesta al público (`src/modules/live/routes.ts`).
- [x] **43. Guest Checkout:** `store_carts.guest_hash` permite comprar sin cuenta (`src/modules/store/service.ts`); el carrito de invitado se vincula por token, no por sesión.
- [x] **44. Webhooks Seguros con Firma:** `verifyStripeSignature()` en `src/modules/payments/webhooks.ts` valida `stripe-signature` contra el cuerpo crudo antes de procesar cualquier evento.
- [x] **45. Idempotencia de Pagos:** `idempotency_key` en `bookings` (`src/modules/operators/bookings.ts`) evita reservas duplicadas por reintento; los webhooks de Stripe también deduplican por `event_id` (confirmado por test: reenviar el mismo evento no reprocesa el cobro).
- [x] **46. Correos Transaccionales Responsivos:** `src/modules/mailer/templates.ts` usa maquetado por tablas (`role="presentation"`, `max-width`) — el patrón estándar seguro para clientes de correo, equivalente a lo que generaría MJML.
- [x] **47. Manejo de Soft-Bounces de Correo:** `src/modules/mailer/routes.ts` (webhook del proveedor) distingue rebote blando de duro — el blando se registra (`bounce_type = 'soft'`) pero **no** suprime la dirección, a diferencia del rebote duro/queja, que sí.
- [ ] **48. SEO Local (LocalBusiness Schema):** Microdatos estructurados por establecimiento para Google Maps.
- [ ] **49. Re-habilitación Controlada de PWA:** Workbox con estrategia `NetworkFirst` para HTML/datos y `CacheFirst` para assets.
- [~] **50. Página de Estatus Pública:** los datos ya existen (`GET /health/detailed` unifica DB/cola/caché/Redis con 200/206/503), pero falta la página pública en sí que los presente — es trabajo de presentación, no de datos.

### 🛠️ 6. DX, Testing & DevOps (Auditada — 2 implementados ahora, 1 ya cubierto de forma equivalente, 7 pendientes reales)
- [ ] **51. Convención de Commits:** confirmado pendiente — no hay Husky ni `commitlint` en el repo.
- [ ] **52. Pre-commit Hooks con `lint-staged`:** confirmado pendiente.
- [x] **53. Plantilla de Pull Request:** implementado ahora — `.github/pull_request_template.md` con checklist (typecheck, suite completa, `docs:api`, migración probada desde cero, autenticación en rutas nuevas, sin secretos, plan maestro actualizado).
- [ ] **54. Data Seeders Realistas con Faker.js:** parcial — existen `backend/scripts/seed-demo.ts` y `seed-from-mock.ts`, pero con fixtures escritos a mano, no generación masiva con Faker.js. Confirmado pendiente tal como se pidió.
- [ ] **55. Caché Multicapa en Docker:** confirmado pendiente — `backend/Dockerfile` no usa `--mount=type=cache`.
- [x] **56. Actualizaciones Automáticas:** implementado ahora — `.github/dependabot.yml` cubre npm (raíz y `backend/`, agrupado por minor/patch), Docker (`backend/Dockerfile`) y GitHub Actions, todos semanales.
- [ ] **57. Entornos de Staging Efímeros:** confirmado pendiente (requiere infraestructura de despliegue que no existe todavía en este repo).
- [x] **58. Documentación viva de la API (equivalente a colección Postman/Bruno):** ya cubierto de otra forma — `npm run docs:api` genera `docs/BACKEND_API_IMPLEMENTADO.md` desde las rutas reales (CI lo verifica con `-- --check`), y `/docs` sirve Swagger UI interactivo desde el mismo esquema OpenAPI. No se creó una colección Postman aparte porque duplicaría esta fuente ya autogenerada y sincronizada; si se prefiere específicamente Postman/Bruom, es un paso adicional de exportar el JSON de `/docs/json`.
- [ ] **59. Tests End-to-End (Playwright):** confirmado pendiente — no hay Playwright en `backend/` ni en la raíz (fuera del alcance backend de todas formas; es sobre el frontend).
- [ ] **60. Cobertura de Código (Codecov):** confirmado pendiente — no hay `--coverage` en CI ni integración con Codecov.

---

## 🔎 FASE 11: Auditoría Técnica — 100 Mejoras Frontend + 100 Mejoras Backend
> **Origen:** unificado desde `PLAN_200_MEJORAS_FRONTEND_BACKEND.md` (fusionado en este documento el 2026-09-29).

### Propósito y criterio de finalización

Convierte la revisión estática del proyecto Descubre RD en trabajo priorizable y verificable: **100 mejoras de frontend y 100 de `backend/`**. Son objetivos de implementación; no afirman que las mejoras estén aplicadas.

"Perfecto" se interpreta como meta operativa: comportamiento correcto, accesible, seguro, observable, rápido y mantenible, con los criterios de aceptación de cada cambio satisfechos.

**Prioridades:** P0 = riesgo de seguridad/integridad/bloqueo funcional (antes de tráfico real) · P1 = calidad/resiliencia/experiencia (antes de escalar) · P2 = optimización y mantenimiento continuo.

**Orden sugerido:** Fase 0 Contención (P0, fuentes de verdad, config de producción, cierre de endpoints peligrosos) → Fase 1 Fundamentos (contratos tipados, autorización, validación, a11y, errores, CI) → Fase 2 Rendimiento y producto (carga, cache, consultas, medios, flujos) → Fase 3 Operación continua (observabilidad, documentación, pruebas, actualización periódica).

### A. Frontend — 100 mejoras

#### A1. Seguridad del cliente y configuración (1–10)
1. **[P0] Unificar el nombre de la publishable key Supabase.** Aceptación: `.env.example`, variables de despliegue y chatbot usan una sola variable documentada; ausencia produce error controlado.
2. **[P0] Retirar secretos y dumps ya rastreados de Git.** Aceptación: `.env` y dumps no figuran en el índice; se revisa el historial y se rotan credenciales privadas si las hubo.
3. **[P0] Inventariar las variables `VITE_*`.** Aceptación: cada variable se marca pública o se mueve al servidor; ninguna clave privada llega al bundle.
4. **[P0] Eliminar cualquier credencial de servicio del código cliente.** Aceptación: escaneo de build confirma que solo aparecen claves expresamente públicas.
5. **[P0] Revisar el uso de `localStorage` para sesión.** Aceptación: tokens no quedan disponibles a JS si el flujo soporta cookies HttpOnly; amenazas XSS/CSRF documentadas y mitigadas.
6. **[P1] Aplicar una política CSP compatible con el sitio.** Aceptación: orígenes de scripts, estilos, fuentes e imágenes limitados y validados en staging antes de endurecer.
7. **[P1] Añadir `Referrer-Policy`, `Permissions-Policy` y `X-Content-Type-Options`.** Aceptación: cabeceras verificadas en producción y staging.
8. **[P1] Evitar navegación a URL arbitraria desde datos del usuario.** Aceptación: enlaces externos validan protocolo/host; `javascript:` y esquemas desconocidos se rechazan.
9. **[P1] Sanitizar contenido enriquecido antes de renderizarlo.** Aceptación: contenido CMS/UGC no admite HTML ejecutable; sin `dangerouslySetInnerHTML` sin sanitizador.
10. **[P2] Configurar privacidad y expiración de datos locales.** Aceptación: cada clave persistida tiene finalidad, ciclo de vida y borrado documentado.

#### A2. Tipos, arquitectura y calidad de código (11–20)
11. **[P1] Activar TypeScript `strict` por etapas.** 12. **[P1] Detección de imports y parámetros sin uso en CI.** 13. **[P1] Sustituir `any` en contratos de API por Zod/tipos generados.** 14. **[P1] Separar componentes de página, dominio y presentación.** 15. **[P1] Definir fronteras por dominio sin ciclos.** 16. **[P1] Crear una única capa de cliente HTTP.** 17. **[P1] Generar tipos del cliente desde OpenAPI.** 18. **[P1] Corregir `StrapiQueryParams` o retirar parámetros sin serializar.** 19. **[P1] Eliminar utilidades duplicadas y traducciones sin uso.** 20. **[P2] Documentar convenciones de nombres y estructura.**

#### A3. Estado, datos y navegación (21–30)
21. **[P0] Distinguir mock de producción en build.** 22. **[P0] Migrar reservas/pedidos del `localStorage` a persistencia del servidor.** 23. **[P1] TanStack Query como dueño del estado remoto.** 24. **[P1] Políticas de stale time e invalidación por entidad.** 25. **[P1] Cancelar solicitudes al desmontar/cambiar de ruta.** 26. **[P1] Reintentos por política de error (no 4xx ni escrituras no idempotentes).** 27. **[P1] Normalizar estados de carga, vacío, error y reintento.** 28. **[P1] Guardar filtros/paginación relevantes en la URL.** 29. **[P1] Revisar rutas protegidas y permisos en UI (servidor sigue siendo autoridad).** 30. **[P2] Evitar persistir en cliente datos sensibles o innecesarios.**

#### A4. Accesibilidad e inclusión (31–40)
31. **[P1] Auditar navegación completa con teclado.** 32. **[P1] Corregir orden de foco y foco visible.** 33. **[P1] Nombres accesibles a botones solo con icono.** 34. **[P1] Asociar etiquetas/instrucciones a formularios.** 35. **[P1] Verificar contraste WCAG 2.2 AA en ambos temas.** 36. **[P1] Respetar `prefers-reduced-motion`.** 37. **[P1] Semántica y encabezados por página.** 38. **[P1] Texto alternativo útil, imágenes decorativas marcadas.** 39. **[P1] Accesibilidad de mapas y gráficos (alternativa textual).** 40. **[P2] Probar flujos con lector de pantalla.**

#### A5. Rendimiento y carga (41–50)
41. **[P0] Desactivar mapas de fuente públicos en builds de producción.** 42. **[P1] Presupuesto de JS inicial y por ruta en CI.** 43. **[P1] Revisar división manual de chunks.** 44. **[P1] Lazy loading en rutas y widgets secundarios.** 45. **[P1] Optimizar imágenes a AVIF/WebP responsivas.** 46. **[P1] Diferir imágenes fuera de pantalla; priorizar LCP.** 47. **[P1] Reducir fuentes y variantes tipográficas.** 48. **[P1] Virtualizar listas extensas.** 49. **[P1] Evitar renders repetidos en contextos globales.** 50. **[P2] Medir Core Web Vitals por plantilla.**

#### A6. Experiencia, resiliencia y seguridad de formularios (51–60)
51. **[P1] Validar formularios en cliente y servidor con reglas compartidas.** 52. **[P1] Evitar doble envío.** 53. **[P1] Preservar entradas ante errores recuperables.** 54. **[P1] Mensajes de error accionables y localizados.** 55. **[P1] Límite de longitud y feedback en entradas extensas.** 56. **[P1] Detectar conectividad y explicar modo offline.** 57. **[P1] Diseñar reanudación para cargas de archivos.** 58. **[P1] Revisar previsualización de Markdown/UGC (HTML sanitizado, rel seguro).** 59. **[P2] Confirmaciones estandarizadas para acciones destructivas.** 60. **[P2] Feedback de éxito consistente (no solo color).**

#### A7. SEO, contenido e internacionalización (61–70)
61. **[P1] Prerender/SSR o estrategia indexable para páginas prioritarias.** 62. **[P1] Metadatos por ruta y entidad.** 63. **[P1] Verificar Open Graph y tarjetas sociales por idioma.** 64. **[P1] Sitemap y reglas de rastreo (borradores/rutas privadas fuera).** 65. **[P1] Validar JSON-LD (tipos, escape, sin propiedades inventadas).** 66. **[P1] Unificar selección de idioma y locale.** 67. **[P1] Detectar claves de traducción ausentes en CI.** 68. **[P1] Formato regional de moneda/fecha/números.** 69. **[P2] Revisar calidad de traducción y fallbacks.** 70. **[P2] Evitar saltos de layout al cambiar idioma.**

#### A8. Privacidad, analítica y mapas (71–80)
71. **[P0] Corregir consentimiento antes de cargar analítica no esencial.** 72. **[P1] Minimizar datos de telemetría.** 73. **[P1] Mecanismo de revocación y borrado de preferencias.** 74. **[P1] Revisar dependencias de terceros y sus dominios.** 75. **[P1] Restringir mapas a proveedores/claves públicas limitadas por dominio.** 76. **[P1] Evitar geolocalización sin acción y contexto claros.** 77. **[P1] Aplicar retención a eventos de frontend.** 78. **[P1] Anonimizar identificadores de analítica.** 79. **[P2] Evitar precargar widgets externos costosos.** 80. **[P2] Publicar estados de disponibilidad de servicios externos.**

#### A9. Pruebas y calidad de entrega (81–90)
81. **[P0] Prueba automatizada del nombre de clave del chatbot.** 82. **[P1] Pruebas unitarias de lógica de dominio del cliente.** 83. **[P1] Pruebas de componentes accesibles (por roles/nombres).** 84. **[P1] Pruebas de integración con API simulada por contrato.** 85. **[P1] Cubrir rutas prioritarias con pruebas E2E.** 86. **[P1] Regresión visual selectiva (móvil/escritorio).** 87. **[P1] Typecheck y lint en CI del frontend.** 88. **[P1] Auditar dependencias y publicar SBOM.** 89. **[P2] Definir política de navegadores soportados.** 90. **[P2] Revisión de bundle y Lighthouse periódica.**

#### A10. Operación frontend y migración de mocks (91–100)
91. **[P0] Bandera de build que impida distribuir el mock en producción.** 92. **[P0] Migrar escrituras de reservas/checkout/pedidos al backend autoritativo.** 93. **[P1] Definir comportamiento para sesiones vencidas.** 94. **[P1] Manejo global de errores de render y navegación.** 95. **[P1] Reporte de errores con redacción de información sensible.** 96. **[P1] Despliegue atómico y rollback del frontend.** 97. **[P1] Versionado de assets y política de cache.** 98. **[P1] Retirar registros de service worker/cache no necesarios.** 99. **[P2] Medir errores de API y abandono por flujo.** 100. **[P2] Catálogo de deuda frontend con responsable y fecha.**

### B. `backend/` — 100 mejoras

#### B1. Configuración, secretos y despliegue seguro (1–10)
1. **[P0] Secretos críticos obligatorios en producción.** 2. **[P0] Rotar y custodiar secretos fuera de Git.** 3. **[P0] Prohibir proveedores `fake`/`log` en producción.** 4. **[P0] Configuración de producción validada y documentada (env Zod).** 5. **[P0] Restringir `TRUST_PROXY` a proxies conocidos.** 6. **[P1] Desactivar documentación pública en producción salvo autorización.** 7. **[P1] Separar secretos de build y runtime.** 8. **[P1] Fijar Node soportado en backend y CI.** 9. **[P1] Ejecutar el proceso sin privilegios y con FS de solo lectura.** 10. **[P2] Añadir SBOM y procedencia de imagen.**

#### B2. Autenticación, sesiones y autorización (11–20)
11. **[P0] Revisar autorización de cada ruta contra matriz de roles.** 12. **[P0] Autorización por objeto en todo acceso a recursos.** 13. **[P0] RS256 y validación estricta de `iss`/`aud`/`exp`/`kid`.** 14. **[P0] Refresh tokens opacos, rotatorios y hasheados.** 15. **[P0] Exigir 2FA para acciones sensibles de personal.** 16. **[P1] Revisar TTL e invalidación de caché de sesiones.** 17. **[P1] Completar política de bloqueo y recuperación de cuenta.** 18. **[P1] Asegurar cookies de refresh en despliegue.** 19. **[P1] Revisar protección CSRF de toda autenticación por cookie.** 20. **[P1] Limitar uso y auditoría de impersonación.**

#### B3. API, validación y límites (21–30)
21. **[P0] Reemplazar o retirar la API genérica de `server/`.** 22. **[P0] Validar todos los cuerpos/parámetros/cabeceras con esquemas estrictos.** 23. **[P0] Límites por usuario/IP/operación sensible.** 24. **[P0] Límites de tamaño para body/archivos/campos.** 25. **[P1] Normalizar errores sin filtrar SQL ni stack.** 26. **[P1] Versionar y gobernar compatibilidad del API.** 27. **[P1] Paginación máxima en toda colección/subrecurso.** 28. **[P1] Validar `Content-Type`/`Accept`/codificación.** 29. **[P1] Idempotency keys en pago y reserva.** 30. **[P2] Estandarizar headers de caché por clase de respuesta.**

#### B4. Base de datos e integridad (31–40)
31. **[P0] Revisar restricciones únicas e integridad referencial.** 32. **[P0] Auditar transacciones de compra, recompensa y reserva.** 33. **[P0] Probar carreras de operaciones concurrentes.** 34. **[P1] Bloqueos por fila u `ON CONFLICT` para invariantes concurrentes.** 35. **[P1] Migradores seguros ante doble ejecución.** 36. **[P1] Timeouts de lock e idle transaction.** 37. **[P1] Revisar índices con planes de consultas reales.** 38. **[P1] Estrategia de pool por instancia bajo autoscaling.** 39. **[P1] Evitar conversión insegura de tipos numéricos.** 40. **[P2] Automatizar backup y restauración de ensayo.**

#### B5. Seguridad de datos y archivos (41–50)
41. **[P0] Revisar PII y secretos por tabla/endpoint/log.** 42. **[P0] Verificar firmas de webhooks con el cuerpo original.** 43. **[P0] Protección contra replay a webhooks y callbacks.** 44. **[P1] Validar carga de archivos por tamaño/MIME/contenido real.** 45. **[P1] Mantener escaneo antimalware fail-closed cuando esté habilitado.** *(→ cubierto: [[ClamAV/antivirus]] ya implementado en `media/antivirus.ts`.)* 46. **[P1] Generar nombres y rutas de archivos en servidor (sin path traversal).** 47. **[P1] Servir contenido subido desde origen aislado.** 48. **[P1] Autorización y expiración a URLs firmadas.** 49. **[P1] Cifrar secretos TOTP y datos sensibles en reposo.** 50. **[P2] Definir borrado/anonimización para solicitudes de privacidad.**

#### B6. Resiliencia e integraciones externas (51–60)
51. **[P0] Validar URLs configurables/suministradas para evitar SSRF.** 52. **[P0] Timeout, límite de respuesta y cancelación en cada integración externa.** 53. **[P1] Circuit breaker para proveedores inestables.** 54. **[P1] Evitar reintentar escrituras no idempotentes.** 55. **[P1] Cola durable para trabajos costosos y correo.** 56. **[P1] Jobs programados idempotentes.** 57. **[P1] Límites de concurrencia y gasto de IA.** 58. **[P1] Validar redirect URI y estado de OAuth.** 59. **[P1] Revisar almacenamiento de secretos de calendario iCal.** 60. **[P2] Fallback explícito por proveedor.**

#### B7. Rendimiento y escalabilidad (61–70)
61. **[P1] SLO de latencia y disponibilidad por endpoint.** 62. **[P1] Identificar N+1 en módulos y servicios.** 63. **[P1] Revisar consultas lentas con `EXPLAIN (ANALYZE, BUFFERS)`.** 64. **[P1] Cachear contenido público con invalidación por publicación.** 65. **[P1] Claves y límites de cache por tenant/locale/filtros.** 66. **[P1] Compresión y límites de respuesta.** 67. **[P1] Revisar cómputos de facetas y búsquedas.** 68. **[P1] Evitar conversiones de fecha que inutilicen índices.** 69. **[P2] Dimensionar pool, Redis y workers con métricas.** 70. **[P2] Pruebas de carga con perfiles representativos.**

#### B8. Observabilidad y operación (71–80)
71. **[P0] Redactar secretos de logs de request, SQL y proveedor.** 72. **[P1] Propagar `request_id` por jobs y servicios externos.** 73. **[P1] Métricas de errores, latencia, conexiones y colas.** 74. **[P1] Separar liveness de readiness.** 75. **[P1] Alertas accionables y rotación.** 76. **[P1] Auditoría de acciones administrativas firmada/inalterable.** 77. **[P1] Vigilar agotamiento de rate limit store.** 78. **[P1] Medir fallos de correo y entregas atascadas.** 79. **[P2] Runbooks de migración, rotación de claves y restauración.** 80. **[P2] Tablero de costo por proveedor.**

#### B9. Pruebas, CI y cadena de suministro (81–90)
81. **[P0] Pruebas de autorización negativas por grupo de rutas.** 82. **[P0] Cubrir IDOR/BOLA y escalada de roles.** 83. **[P0] Pruebas de inyección en filtros/orden/campos.** 84. **[P1] Prueba de abuso de rate limit con IP spoofing.** 85. **[P1] Pruebas de concurrencia y doble envío.** 86. **[P1] Separar pruebas unitarias, integración y contrato.** 87. **[P1] Pruebas de restauración de backup y migración desde versión anterior.** 88. **[P1] Ampliar escaneo de dependencias a todos los proyectos.** 89. **[P1] Revisar permisos y acciones de GitHub Actions.** 90. **[P2] Análisis estático y escaneo de contenedores/secrets.**

#### B10. Arquitectura, contratos y retiro de legado (91–100)
91. **[P0] Declarar oficialmente fuente de verdad por dominio.** 92. **[P0] Retirar el servidor `server/` o aislarlo de red y credenciales.** 93. **[P1] Definir contrato de transición del frontend mock a Fastify.** 94. **[P1] Mantener OpenAPI sincronizado con esquemas reales (CI bloquea drift).** *(→ ya implementado: `docs:api -- --check`.)* 95. **[P1] Separar rutas, servicios y repositorios consistentemente.** 96. **[P1] Hacer explícitas las dependencias de módulos.** 97. **[P1] Patrón outbox para eventos de negocio críticos.** 98. **[P1] Acordar estrategia de consistencia y saga para checkout.** 99. **[P2] Catálogo de módulos, rutas, jobs y propietarios.** 100. **[P2] Proceso periódico de revisión técnica y cierre de deuda.**

### Seguimiento recomendado (Fase 11)
Crear tareas separadas por ítem, asignar responsable y release, registrar evidencia de aceptación. No iniciar migraciones amplias de arquitectura hasta completar el inventario de consumidores y definir fuentes de verdad. Para P0 de seguridad, registrar riesgo residual y fecha de mitigación; las excepciones deben tener vencimiento.

---

## 🎨 FASE 12: Diseño, Estructura de Páginas y 50 Nuevos Modelos de Monetización
> **Origen:** unificado desde `PLAN_200_MEJORAS_DISENO_PAGINAS_MONETIZACION.md` (fusionado en este documento el 2026-09-29).

### Objetivo y límites
Hasta 200 mejoras enfocadas en presentación visual, ubicación de páginas, nuevas secciones y fuentes de ingreso, basadas en el inventario de rutas de `src/App.tsx`. **La Fase 5 de este mismo documento ya cubre:** marketplace de experiencias, suscripciones de operadores, misiones patrocinadas, espacios publicitarios (`sponsorship`), licenciamiento/payouts de creadores UGC, membresía VIP, ticketing, seguros, traslados, paquetes multidestino y analítica B2B — los modelos de este bloque D priorizan segmentos y productos **distintos** a los ya cubiertos. Cada modelo debe validarse (demanda, margen, encaje legal) antes de implementarse.

**Fases sugeridas de ejecución:** Descubrimiento (1–2 sem: analítica, entrevistas, inventario, viabilidad) → Diseño del sistema (2–4 sem: IA, prototipos, pruebas con usuarios, métricas) → Pilotos (4–8 sem: cambios reversibles y modelos de coste/alcance limitado primero) → Escala (solo pilotos con métricas y operación sostenibles).

### A. Diseño visual y experiencia (1–50)

**Identidad, jerarquía y consistencia (1–10):** 1. Dirección visual unificada portal/tienda/panel empresa. 2. Tokens de color/tipografía/radio/sombra/espaciado. 3. Jerarquías tipográficas por rol editorial. 4. Guías de fotografía por categoría turística. 5. Sistema de iconos/ilustraciones coherente. 6. Unificar encabezados/pies entre experiencias públicas. 7. Variantes visuales para contenido editorial vs. comercial (patrocinio diferenciado). 8. Estandarizar tarjetas por tipo (destino/negocio/evento/experiencia). 9. Alinear estados hover/foco/selección/deshabilitado. 10. Guía de composición para páginas largas.

**Portada y exploración (11–20):** 11. Rediseñar hero según intención de viaje. 12. Selector visual por tipo de viajero. 13. Búsqueda global como punto de entrada dominante. 14. Colecciones editoriales estacionales. 15. Franja de alertas útiles de viaje (clima/transporte). 16. Accesos a destinos/regiones más reconocibles. 17. Reorganizar portada por tareas del viajero. 18. Módulos de inspiración por estación. 19. Mapa de descubrimiento progresivo (no bloqueante). 20. Replantear accesos rápidos por datos de uso.

**Plantillas de contenido (21–30):** 21. Ficha de destino orientada a decisión. 22. Ficha de hotel alrededor de reserva. 23. Ficha de restaurante para decidir visita. 24. Plantilla consistente playa/río/parque. 25. Detalle de evento con agenda y logística. 26. Resumen escaneable en artículos de guía. 27. Perfil verificable de proveedor local. 28. Fichas de experiencias comparables. 29. Páginas de provincia con jerarquía territorial clara. 30. Ficha compacta para lugares de paso (aeropuertos/puertos).

**Interacción, presentación y lectura (31–40):** 31. Filtros visibles y editables individualmente. 32. Comparación visual de destinos/experiencias. 33. Planificador visual de viaje por días. 34. Galerías con contexto y créditos de imagen. 35. Mapas con controles explícitos. 36. Microinteracciones en acciones confirmadas. 37. Skeletons que respetan la forma final. 38. Vistas alternativas tarjeta/lista. 39. Experiencias visuales para baja conectividad. 40. Componentes de datos de temporada/condiciones con fuente.

**Accesibilidad visual y sistemas adaptativos (41–50):** 41. Contraste y legibilidad en fotografías. 42. Foco visible con identidad de marca. 43. Componentes táctiles cómodos. 44. Diseño adaptable a zoom/texto ampliado. 45. Modo de alto contraste. 46. Visualización de precios por moneda. 47. Formato bilingüe lado a lado. 48. Guías de movimiento para animaciones. 49. Firma gráfica para contenido oficial (sin confundir con patrocinio). 50. Revisión visual previa a publicación CMS.

### B. Reorganización y movimiento de páginas (51–100)

**Navegación principal propuesta (51–60):** 51. Reducir menú a cinco tareas (Explorar, Planificar, Qué hacer, Guías, Empresas). 52. Agrupar destinos/regiones/provincias bajo "Explorar → Destinos". 53. Agrupar playas/ríos/parques/ecoturismo bajo "Explorar → Naturaleza". 54. Agrupar alojamiento/restaurante/vida nocturna/compras bajo "Explorar → Servicios". 55. Agrupar experiencias/actividades/eventos/deportivo bajo "Qué hacer". 56. Mover planifica/mi-viaje/planificador-grupal/presupuesto bajo "Planificar". 57. Agrupar llegada y movilidad bajo "Planificar → Llegada y movilidad". 58. Mover info práctica (seguridad/transporte/e-ticket/clima) a sección propia. 59. Centro de cuenta unificado (login/perfil/pasaporte/favoritos). 60. Separar navegación empresarial de la de viajeros.

**Canonicalización y limpieza de rutas (61–70) — todas [P0]:** 61. Unificar `/playa` y `/playas`. 62. Unificar `/restaurante` y catálogo plural. 63. Unificar `/eventos`, `/evento/:slug`, `/eventos/:slug` y rutas por ID. 64. Consolidar `/aerolineas`, `/vuelos-aerolineas`, `/rutas-aereas`. 65. Resolver duplicado `/wellness`. 66. Unificar `/agencias` y `/directorio-agencias`. 67. Resolver `/ayuda`, `/centro-ayuda`, `/asistencia`. 68. Canonicalizar `/nautica`, `/cruceros`, `/nautica-cruceros`. 69. Reducir alias de gamificación/trivia. 70. Mapa de rutas canónicas y alias con redirects trazables.

**Reubicación de áreas secundarias (71–80):** 71. Revista/artículo/podcast/cine-rd → "Revista y cultura". 72. Patrimonio/historia/turismo religioso → "Cultura e historia". 73. Gastronomía/rutas del sabor/café/tabaco → "Sabores y oficios". 74. Sostenible/biodiversidad/volunturismo → "Naturaleza y comunidad". 75. Wellness/turismo médico con etiquetado claro (no consejo médico). 76. Bodas/MICE/inversión → "Viajes y eventos de negocio". 77. Academia/empleo/sello-calidad → "Desarrollo del sector". 78. Prensa/newsletter → centro institucional. 79. Estadísticas/inversión fuera de nav turística principal. 80. Encuesta/opiniones/sugerencias como feedback contextual.

**Experiencia de navegación y contextualidad (81–90):** 81. Migas de pan por jerarquía real. 82. Navegación lateral en guías largas. 83. Panel "En esta zona" por destino. 84. Navegación por colección en resultados. 85. Herramientas reubicadas en la etapa del viaje donde se necesitan. 86. Enlaces desde editorial a fichas relacionadas. 87. Acceso a carrito/checkout solo donde aplica. 88. `/ofertas` bajo "Planifica y ahorra" con proveedor/vigencia visibles. 89. Página de "Colecciones" editoriales temáticas. 90. Navegación por temporada y duración de viaje.

**Migración y gobierno de información (91–100):** 91. Redirects 301 por cada URL movida. 92. Revisar sitemap/canonical tras cada movimiento. 93. Medir uso del menú antes/después. 94. Validar nombres del menú con card sorting. 95. Tree testing del árbol de navegación. 96. Propietarios editoriales por sección. 97. Retirar/fusionar páginas vacías o duplicadas. 98. Estado de vigencia para páginas temporales. 99. Índice público del ecosistema de contenidos. 100. Auditoría trimestral de arquitectura de información.

### C. Nuevas secciones y productos editoriales (101–150)

**Planificación personalizada (101–110):** 101. "Primera vez en RD". 102. Itinerarios por duración (24h/finde/5d/10d). 103. Itinerarios por presupuesto. 104. Guías de viaje sin auto. 105. Centro de preparación del viaje. 106. Guías de viajes accesibles. 107. Colecciones familiares por rango de edad. 108. Viajes multigeneracionales. 109. Planificador de escalas aeroportuarias. 110. Guías de viaje responsable.

**Descubrimiento local y comunidad (111–120):** 111. Agenda de eventos verificados por provincia. 112. "Qué pasa esta semana". 113. Rutas urbanas caminables por barrio. 114. Rutas de transporte público local. 115. Directorio de guías locales por especialidad. 116. Artesanía con historias de productores. 117. "Hecho en RD" (catálogo editorial de origen). 118. Guía de mercados y ferias. 119. Calendario de naturaleza y observación responsable. 120. Historias orales por territorio.

**Contenido de viaje especializado (121–130):** 121. Centro de playas con condiciones/servicios. 122. Excursiones de un día por región. 123. Guías de temporada de lluvia/huracanes. 124. Centro de salud útil para viajeros (sin diagnóstico). 125. Gastronomía por provincia. 126. Diccionario situacional para visitantes. 127. Accesos a parques nacionales (permisos/cupos). 128. Hub de turismo náutico por puerto/marina. 129. Guía de observación astronómica. 130. Centro de turismo de reuniones y eventos (conecta con fichas B2B).

**Herramientas y servicios digitales (131–140):** 131. Ficha compartible de viaje en grupo. 132. Lista de gastos compartidos (sin custodiar dinero). 133. Asistente de elección de destino. 134. Comparador de temporadas. 135. Monitor de presupuesto de viaje. 136. Checklist colaborativo pre-viaje. 137. Modo kiosco para centros de visitantes. 138. Mapas temáticos descargables. 139. Audioguías editoriales por recorrido. 140. Catálogo de experiencias de temporada baja.

**Comunidad, confianza y sostenibilidad (141–150):** 141. Criterios de verificación de proveedores. 142. Fichas de sostenibilidad con indicadores verificables. 143. Mapa de iniciativas comunitarias. 144. Centro de seguridad de actividades al aire libre. 145. Ficha de accesibilidad aportada por usuarios y verificada. 146. Formato de reseña centrado en utilidad de viaje. 147. Página "Correcciones y fuentes". 148. Colección de relatos de residentes (con consentimiento). 149. Indicadores de impacto turístico local. 150. Panel de transparencia editorial y patrocinio.

### D. Nuevas formas de monetización (151–200)
> No activar todas. Por piloto: estimar margen neto, coste de atención, impacto en confianza, impuestos/contratos y carga de soporte. Mantener separados resultados orgánicos y pagados.

**Productos digitales y utilidades premium (151–160):** 151. Guías digitales descargables por interés/región. 152. Mapas premium offline de rutas verificadas. 153. Audioguías individuales o por paquete temático. 154. Plantillas descargables de planificación profesional. 155. Informes de viaje personalizados de pago. 156. Herramientas avanzadas de colaboración grupal (de pago). 157. Packs de contenido licenciado para centros de visitantes. 158. Paquetes de aprendizaje sobre cultura local. 159. Personalización avanzada del plan de viaje (de pago). 160. Acceso a actualizaciones de temporada especializadas.

**Servicios transaccionales nuevos (161–170):** 161. Comisión por reservas de transporte interurbano de terceros. 162. Comisión por alquiler de vehículos con comparación neutral. 163. Excursiones de conservación con aporte transparente. 164. Experiencias culinarias con cupo limitado. 165. Venta de entradas para atracciones culturales independientes. 166. Reservas de guías certificados por franja horaria. 167. Reservas de estacionamiento/traslados en puntos de acceso. 168. Paquetes de conectividad (SIM/eSIM afiliada). 169. Entrega local de compras a hotel/punto turístico. 170. Reservas de actividades de temporada con cupos.

**Monetización B2B e institucional (171–180):** 171. Producción de páginas de campaña territorial. 172. Auditorías de presencia digital a negocios turísticos. 173. Fotografía y contenido licenciado para negocios. 174. Capacitación remunerada de hospitalidad digital. 175. Catálogo de proveedores de producción local para eventos. 176. Estudios agregados de demanda turística (anonimizados). 177. Licencias de fotografía editorial a medios/operadores. 178. Integración técnica de catálogo a cadenas regionales (SLA propio, distinto de la API B2B ya existente). 179. Gestión de contenido multilingüe para negocios. 180. Formación de datos y distribución para entidades turísticas.

**Comercio, afiliación y productos de marca (181–190):** 181. Afiliación editorial a equipamiento de viaje pertinente. 182. Enlaces de afiliado a alojamiento con atribución clara. 183. Catálogo afiliado de libros y material cultural dominicano. 184. Mapas impresos y guías de bolsillo (bajo demanda). 185. Colecciones colaborativas de artesanía con reparto transparente. 186. Licencias de diseños turísticos con artistas locales. 187. Cajas temáticas de productos dominicanos. 188. Souvenirs personalizados vinculados a ruta completada. 189. Impresión bajo demanda de fotografía con derechos confirmados. 190. Certificados/regalos digitales de experiencias locales.

**Ingresos recurrentes y experimentos de mercado (191–200):** 191. Paquetes de temporada con múltiples proveedores. 192. Pases de acceso agrupado a atracciones independientes. 193. Licencia anual del planificador para organizaciones de viaje. 194. Programa de apoyo recurrente a contenido local (sin influir rankings). 195. Donaciones voluntarias a conservación con socio verificado. 196. Pases de temporada para eventos culturales participantes. 197. Patrocinios de contenido audiovisual educativo. 198. Marketplace de servicios de pre-viaje con tarifa de referencia. 199. Pruebas A/B de precio y formato de producto digital. 200. Comité de aprobación de nuevos ingresos.

### Matriz para elegir pilotos (Fase 12)
| Criterio | Pregunta |
|---|---|
| Valor al viajero | ¿Resuelve una tarea o fricción real? |
| Diferenciación | ¿Aporta algo no cubierto ya por una función o modelo existente (Fase 5)? |
| Confianza | ¿Se entiende quién paga, quién presta el servicio y cómo se selecciona? |
| Viabilidad | ¿Hay proveedor, contenido, permisos, soporte y operación disponibles? |
| Economía unitaria | ¿El ingreso cubre pagos, soporte, adquisición, devolución e impuestos? |
| Impacto local | ¿Beneficia de forma verificable a empresas y comunidades del destino? |

Comenzar con los pilotos de mayor valor y confianza, detener los que no alcancen sus métricas y publicar claramente patrocinios, afiliaciones y criterios de ranking.

---

## 📈 Protocolo de Actualización del README.md
Cada vez que una rama o sprint de este plan sea completado y fusionado a `dev` / `main`:
1. Se marcará la casilla correspondiente `- [x]` en este documento.
2. Se actualizará la sección correspondiente en [README.md](file:///c:/Users/Ro.Guzman/OneDrive%20-%20sectur.gov.do/Escritorio/Sitios%20web/Desarrollo/Descubre%20RD/README.md) reflejando las nuevas rutas, componentes y capacidades activas en el repositorio.
