# Descubre RD — Documentación del Backend (API v1)

> **Estado:** propuesta técnica para construcción · **Versión del documento:** 1.0 · **Fecha:** 2026-09-25
> **Alcance:** todo el portal público, los paneles internos (Administración, Panel de Proveedor, Panel de Operadores RD) y las integraciones (correo, pagos, IA, CMS).
> **Cómo se generó:** se analizó el código del frontend (`src/`, 269 rutas estáticas + rutas dinámicas), los esquemas SQL existentes (`supabase/schema.sql`, `supabase/migrations/*`, `mysql/schema.sql`), las 5 funciones edge (`supabase/functions/*`), el prototipo Express (`server/server.js`) y el snapshot de datos (`src/integrations/supabase/mockDb.json`). Los apéndices A, B y C se generan automáticamente a partir de ese código, por lo que reflejan lo que el frontend realmente consume hoy.

---

## Contenido

0. [Resumen ejecutivo](#0-resumen-ejecutivo)
1. [Estado actual y hallazgos](#1-estado-actual-y-hallazgos)
2. [Arquitectura propuesta](#2-arquitectura-propuesta)
3. [Convenciones de la API](#3-convenciones-de-la-api)
4. [Contenido CMS vs. datos transaccionales](#4-contenido-cms-vs-datos-transaccionales)
5. [Catálogo de endpoints](#5-catálogo-de-endpoints)
   - 5.1 Autenticación y cuentas · 5.2 Perfil y preferencias · 5.3 Contenido público del portal · 5.4 Búsqueda, mapa y recomendaciones · 5.5 Datos vivos y utilidades · 5.6 Interacción del usuario · 5.7 Mi viaje e itinerarios · 5.8 Reservas y checkout · 5.9 Marketplace y Tienda oficial · 5.10 Proveedores y Operadores RD · 5.11 Gamificación · 5.12 Publicidad y marketing · 5.13 Correos y notificaciones · 5.14 Analítica · 5.15 Traducciones (i18n) · 5.16 Archivos y medios · 5.17 Administración del portal · 5.18 Administración de Operadores RD y Tienda · 5.19 Sistema
6. [Modelo de datos](#6-modelo-de-datos)
7. [Seguridad, roles y privacidad](#7-seguridad-roles-y-privacidad)
8. [Eventos de dominio y webhooks](#8-eventos-de-dominio-y-webhooks)
9. [Trabajos programados](#9-trabajos-programados)
10. [Integraciones externas](#10-integraciones-externas)
11. [Plan de migración y roadmap](#11-plan-de-migración-y-roadmap)
12. Apéndices: [A. Catálogo de tablas](#apéndice-a--catálogo-de-tablas) · [B. RPC y funciones edge → endpoints](#apéndice-b--rpc-y-funciones-edge--endpoints) · [C. Páginas del portal → endpoints](#apéndice-c--páginas-del-portal--endpoints) · [D. Datos estáticos a migrar](#apéndice-d--datos-estáticos-del-frontend-a-migrar)

---

## 0. Resumen ejecutivo

El portal **Descubre RD** es hoy un frontend React/Vite completo cuyas ~140 tablas de datos están simuladas en memoria (`mockDb.json` + persistencia parcial en `localStorage`). No existe un backend en producción: el prototipo Express+MySQL de `server/` es un *proxy genérico de consultas* (no una API), y quedó apagado (ver `MOCK_MIGRATION_NOTES.md`).

Este documento define el **backend definitivo**: una API REST versionada (`/api/v1`) sobre **PostgreSQL**, con autenticación JWT, control de acceso por roles, un **CMS** para el contenido editorial, motor transaccional para reservas/pagos/gamificación, correo transaccional y trabajos programados.

**Cifras del análisis**

| Elemento | Cantidad |
|---|---|
| Rutas estáticas del portal (`App.tsx`) | 269 (+ rutas dinámicas `:slug` / `:id`) |
| Tablas distintas en los esquemas SQL existentes | 138 |
| Tablas que el frontend consume directamente hoy | 75 (más las tablas administradas por el CMS genérico) |
| Funciones RPC invocadas por el frontend | 19 |
| Funciones edge existentes | 5 (`admin-entities`, `admin-ai-operations`, `ai-recommendations`, `chat-turistico`, `import-establecimientos`) |
| Entidades gestionables desde el panel admin (`entityConfigs`) | 76 |
| Pestañas del panel de administración | 14 (dashboard, usuarios, analytics, banners, gamificación, moderación, NPS, auditoría, IA, importación, route builder, stock, operadores, reservas directas) |
| Módulos de datos estáticos aún embebidos en el frontend (`src/data/*.ts`) | 42 archivos, ~16 000 líneas |

**Decisiones clave (resumen)**

1. **API REST propia (BFF) sobre PostgreSQL**, reutilizando el esquema y las políticas RLS de `supabase/` como base. Las reglas de negocio críticas (pagos, comisiones, XP, disponibilidad) viven en servicios de dominio con transacciones, no en el cliente.
2. **CMS integrado + headless opcional.** El contenido editorial (destinos, playas, artículos, eventos, banners…) se administra con el flujo *borrador → revisión → publicado*, multilenguaje y programación de publicación. La API pública **siempre lee de la misma fuente** sin importar si el editor usa el CMS integrado del panel admin o un CMS headless conectado por webhooks (sección 4).
3. **Contrato único para el frontend.** Cada `supabase.from(...)`, `supabase.rpc(...)` y `supabase.functions.invoke(...)` actual tiene un endpoint equivalente (Apéndice B), de modo que la migración se hace reemplazando la capa `src/integrations/supabase/client.ts` por un cliente HTTP sin reescribir las páginas.
4. **Seguridad por defecto:** ninguna tabla es accesible por nombre desde el cliente (a diferencia del prototipo), validación de esquema en cada endpoint, límites de tasa, auditoría de acciones administrativas y cumplimiento de la Ley 172-13 de protección de datos personales de RD.

---

## 1. Estado actual y hallazgos

### 1.1 Qué existe

| Pieza | Ubicación | Estado | Uso recomendado |
|---|---|---|---|
| Frontend con cliente Supabase simulado | `src/integrations/supabase/client.ts`, `mockDb.json` | Activo (mock) | Se reemplaza por cliente HTTP a `/api/v1` |
| Esquema PostgreSQL + RLS | `supabase/schema.sql`, `supabase/migrations/*.sql` (48 migraciones) | Base del modelo real | **Fuente de verdad del esquema** |
| Esquema MySQL (superset parcial) | `mysql/schema.sql` (124 tablas) | Prototipo | Sólo referencia de columnas; se migra a Postgres |
| RPC de gamificación / admin | migraciones `2026-06-16…` | SQL en Postgres | Se reimplementan como servicios transaccionales |
| Funciones edge (Deno) | `supabase/functions/*` | 5 funciones | Se convierten en endpoints (Apéndice B) |
| Prototipo Express + MySQL | `server/server.js` (1 124 líneas) | Apagado | **Descartar**: ver hallazgos de seguridad |
| Módulos Operadores RD y Tienda | `src/modules/operadores`, `src/modules/tienda`, migración `20260924…operator_hub_and_store.sql` | Frontend completo con datos mock | Definen el contrato de la sección 5.10 y 5.9 |

### 1.2 Hallazgos que condicionan el diseño

1. **El prototipo Express es inseguro para producción.** `POST /api/query` recibe el nombre de tabla, la acción y los filtros desde el cliente; cualquier tabla se puede leer o escribir con un token válido (o incluso sin token en `optionalAuthenticateToken`). El secreto JWT tiene valor por defecto `"secret"`. `POST /api/rpc/:name` mezcla lógica de gamificación con parámetros sin validar. → Todo esto se sustituye por endpoints con nombre y validación.
2. **Doble esquema.** Hay tablas sólo en Postgres (`cart_items`, `notifications`, `articles`, `article_translations`, `monuments`, `parks`, `explorer_follows`, `contest_registrations`, `establecimientos`, `operator_*`, `store_*`) y otras sólo en MySQL (`users`, `travel_agencies` con más columnas, `golf_courses`, `shopping_centers`, `souvenirs`…). El Apéndice A las unifica; la migración consolidada a Postgres es una tarea de la Fase 0.
3. **Tablas con datos pero sin CMS.** `mockDb.json` contiene datos reales de provincias, destinos, hoteles, restaurantes, bares, experiencias, alojamientos Airbnb, logros y niveles. Muchas secciones del frontend leen **archivos estáticos** (`src/data/*.ts`: playas, montañas, ríos, recetas, eventos, marketplace, LIDOM…) que hoy no están en base de datos (Apéndice D).
4. **Gamificación sin lógica real.** Los 19 RPC devuelven éxito genérico en el mock. La lógica existe parcialmente en `server.js` y en SQL (`award_user_xp`, `perform_daily_checkin`, `check_and_award_streak_bonus`…) y debe consolidarse en un único servicio con idempotencia y antifraude (sección 5.11).
5. **Pagos, correos y trabajos programados no existen.** El checkout y las reservas del frontend simulan el pago; los correos (confirmaciones, recordatorios, newsletter) sólo se prevén. Se diseñan en las secciones 5.8, 5.13 y 9.
6. **El frontend no hace ninguna llamada HTTP externa** (clima, tasas de cambio, combustibles, lotería, vuelos). Todo lo "vivo" debe entrar por el backend (sección 5.5 y 10).
7. **Roles.** El enum actual `app_role` sólo tiene `admin | moderator | user`. Se amplía (sección 7) con `editor`, `partner` y roles de organización de Operadores RD.

---

## 2. Arquitectura propuesta

```
                        ┌───────────────────────────────┐
  Portal web (React) ──►│  CDN / WAF (cache de GET)     │
  App móvil (futuro) ──►│  api.descubre.do  /api/v1     │
  Panel Admin / Partner └───────────────┬───────────────┘
                                        │ HTTPS · JWT · rate limit
                   ┌────────────────────▼─────────────────────┐
                   │              API (Node.js + TS)          │
                   │  Auth · Contenido · Reservas · Pagos ·   │
                   │  Gamificación · Marketplace · Admin      │
                   └───┬─────────┬──────────┬──────────┬──────┘
                       │         │          │          │
              ┌────────▼──┐ ┌────▼─────┐ ┌──▼──────┐ ┌─▼───────────┐
              │PostgreSQL │ │  Redis   │ │ Object  │ │ Cola/Worker │
              │ (datos +  │ │ cache,   │ │ storage │ │ (BullMQ):   │
              │  RLS,FTS, │ │ sesiones,│ │ (S3/R2) │ │ correo, iCal│
              │  PostGIS) │ │ límites  │ │ medios  │ │ cron, IA    │
              └───────────┘ └──────────┘ └─────────┘ └──────┬──────┘
                                                             │
        Proveedores externos: correo (SES/Resend), WhatsApp Business,
        pasarela de pago (Azul/CardNET/Stripe/PayPal), IA (Gemini/Claude),
        clima, tasas BCRD, mapas, CMS headless (opcional)
```

| Decisión | Elección | Motivo |
|---|---|---|
| Estilo de API | REST/JSON, versionada `/api/v1`, OpenAPI 3.1 como contrato | Encaja con el cliente actual; se genera SDK y documentación interactiva |
| Lenguaje / framework | Node.js 20 + TypeScript (Fastify o NestJS) | Mismo lenguaje que el frontend; ya hay `server/` en Node |
| Base de datos | PostgreSQL 15+ con extensiones `pgcrypto`, `pg_trgm`, `unaccent`, `postgis` | Esquema y RLS existentes; búsqueda de texto y geoespacial nativas |
| Búsqueda | Postgres FTS + `pg_trgm` en Fase 1; motor dedicado (Meilisearch/Typesense) si crece | Evita infraestructura extra al inicio |
| Cache | Redis: respuestas públicas (TTL 60–600 s), *rate limiting*, sesiones/refresh tokens revocados | GETs públicos son ~90 % del tráfico |
| Tareas asíncronas | Cola BullMQ + workers | Correo, recordatorios, sincronización iCal, IA, importaciones |
| Almacenamiento de medios | S3 compatible (URL firmadas) + transformación de imágenes | Hoy las imágenes son URLs externas (Unsplash) |
| Observabilidad | Logs JSON con `request_id`, métricas Prometheus, trazas OpenTelemetry, Sentry | Diagnóstico y auditoría |
| Entornos | `local` (docker-compose: Postgres+Redis+MailHog), `staging`, `production` | Migraciones automáticas en CI |

**Módulos del servicio** (cada uno con su router, servicios de dominio y pruebas): `auth`, `users`, `content` (CMS/lectura pública), `search`, `live-data`, `social`, `trips`, `bookings`, `payments`, `marketplace`, `partners`, `operators`, `store`, `gamification`, `ads`, `marketing`, `mailer`, `analytics`, `i18n`, `media`, `admin`, `system`.

---

## 3. Convenciones de la API

### 3.1 Generales

| Tema | Regla |
|---|---|
| Base URL | `https://api.descubre.do/api/v1` (staging: `https://api-staging.descubre.do/api/v1`) |
| Formato | `application/json; charset=utf-8`. Fechas ISO-8601 UTC (`2026-09-25T14:30:00Z`); fechas de calendario `YYYY-MM-DD` (zona `America/Santo_Domingo`) |
| Identificadores | UUID v4 en tablas transaccionales; `slug` único legible en contenido público (`/beaches/playa-rincon`). Los endpoints aceptan `{idOrSlug}` |
| Moneda | Importes como número decimal + campo `currency` (`USD` \| `DOP`). Los precios del catálogo se guardan en su moneda original |
| Idioma | `Accept-Language: es\|en\|fr\|de\|pt\|it` o `?lang=`. Falta de traducción → se devuelve `es` con `meta.fallback_locale` |
| Cabeceras | `X-Request-Id` (se genera si no viene), `Idempotency-Key` (POST de pagos/reservas), `If-None-Match` (ETag en GET públicos) |
| CORS | Sólo orígenes del portal, paneles y staging |

### 3.2 Autenticación

- **Access token** JWT (RS256) de 15 min en `Authorization: Bearer <token>`.
- **Refresh token** opaco rotatorio de 30 días (cookie `HttpOnly; Secure; SameSite=Lax` en web; cuerpo JSON en móvil). La reutilización de un refresh token revocado invalida toda la familia.
- Claims: `sub` (user id), `roles[]`, `org_id?` (Operadores RD), `org_role?`, `locale`.
- Endpoints **públicos** no requieren token; los marcados `Auth` lo exigen; los marcados con rol (`Admin`, `Editor`, `Partner`, `Org:owner`…) validan además el rol.

### 3.3 Respuestas y errores

```jsonc
// Éxito (colección)
{ "data": [ … ], "meta": { "page": 1, "per_page": 20, "total": 132, "locale": "es" },
  "links": { "next": "/beaches?page=2" } }
// Éxito (recurso)
{ "data": { … } }
// Error (RFC 7807 simplificado)
{ "error": { "code": "VALIDATION_ERROR", "message": "El correo no es válido",
             "details": [ { "field": "email", "issue": "invalid_format" } ],
             "request_id": "01J9…" } }
```

| HTTP | `code` | Cuándo |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Cuerpo/parámetros inválidos |
| 400 | `INVALID_TOKEN` | Enlace de verificación/restablecimiento inválido, vencido o ya usado |
| 401 | `UNAUTHENTICATED` / `TOKEN_EXPIRED` | Falta o expiró el token |
| 403 | `FORBIDDEN` / `ACCOUNT_SUSPENDED` | Sin permiso o cuenta suspendida |
| 404 | `NOT_FOUND` | Recurso inexistente o no publicado |
| 409 | `CONFLICT` (`SLOT_UNAVAILABLE`, `EMAIL_TAKEN`, `ALREADY_CLAIMED`) | Conflicto de estado |
| 422 | `BUSINESS_RULE` (`MIN_NIGHTS`, `DATE_BLOCKED`, `CAPACITY_EXCEEDED`…) | Regla de negocio incumplida |
| 429 | `RATE_LIMITED` | Límite de tasa (cabeceras `Retry-After`, `X-RateLimit-*`) |
| 5xx | `INTERNAL` / `UPSTREAM_ERROR` | Fallo interno o de un proveedor externo |

### 3.4 Listados: paginación, filtros, orden, campos

`GET /{recurso}?page=1&per_page=24&sort=-created_at&q=texto&filter[province]=samana&filter[is_featured]=true&fields=id,name,slug&include=province,gallery&lang=en`

- `per_page` máx. 100 (feeds infinitos usan `cursor=` + `limit=`).
- `sort`: lista separada por comas, prefijo `-` = descendente. Sólo columnas en lista blanca por recurso.
- `filter[campo]=valor` (igualdad), `filter[campo][gte|lte|in|like]=…`.
- `include=`: relaciones permitidas por recurso (equivale a las relaciones embebidas `tabla(cols)` que usa hoy el frontend).
- `q`: búsqueda de texto (FTS + trigram, insensible a acentos).
- Geo: `near=lat,lng&radius=5000` (metros) en recursos con coordenadas.

### 3.5 Cache, límites y otras reglas

| Tema | Regla |
|---|---|
| Cache público | `Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=600` + `ETag`; se purga por evento de publicación del CMS (sección 4.4) |
| Límites de tasa | Anónimo 120 req/min/IP · Usuario 300 req/min · Escritura anónima (newsletter, formularios) 10/min/IP · Login 5 intentos/15 min/cuenta+IP · Endpoints de IA 20/día/usuario |
| Idempotencia | `POST /payments/*`, `/bookings`, `/orders`, `/gamification/*` aceptan `Idempotency-Key` (24 h) |
| Borrado | Contenido: borrado lógico (`deleted_at`). Datos personales: eliminación real bajo solicitud del titular (5.2) |
| Auditoría | Toda escritura `Admin`/`Editor` registra `admin_activity_logs` (actor, entidad, antes/después, IP) |
| Versionado | Cambios incompatibles → `/api/v2`; `v1` se mantiene ≥ 12 meses. Campos nuevos son aditivos |
| Webhooks salientes | Firmados con HMAC-SHA256 (`X-Signature`), reintentos exponenciales (sección 8) |

---

## 4. Contenido CMS vs. datos transaccionales

El portal mezcla **contenido editorial** (lo escriben personas y cambia poco) con **datos generados por el uso** (usuarios, reservas, XP). Cada tabla se clasifica en una de cuatro categorías; la clasificación por tabla está en el Apéndice A.

| Categoría | Quién la escribe | Ejemplos | Acceso público | Origen |
|---|---|---|---|---|
| **CMS** — editorial | Editores/Admin (panel o CMS headless) | destinos, provincias, playas, hoteles, restaurantes, bares, experiencias, eventos, artículos, historia, recetas, rutas, banners, ofertas, textos del sitio (`site_settings`), SEO/redirecciones | Lectura pública (sólo `published`) | Panel Admin → API, o CMS headless → webhook → API |
| **Proveedor** — contenido de terceros | Proveedores/operadores verificados | anuncios de Operadores RD, habitaciones, tarifas, promociones, respuestas a reseñas, perfil del negocio | Lectura pública si `published` y organización verificada | Panel Partner / Operadores RD |
| **Transaccional** — generado por usuarios/sistema | Usuarios, sistema | usuarios, reservas, pedidos, pagos, XP, misiones, favoritos, reseñas, comentarios, notificaciones, tickets de soporte | Privado (dueño/roles); agregados públicos (rankings) | Endpoints de dominio |
| **Sistema / vivo** | Integraciones y cron | tasas de cambio, combustibles, lotería, clima, alertas, logs, cron jobs, webhooks, reglas IP | Lectura pública sólo de datos vivos | Trabajos programados e integraciones |

### 4.1 Modelo de contenido CMS

Todas las tablas CMS reciben las mismas columnas de gobierno (migración `cms_governance`):

| Columna | Descripción |
|---|---|
| `status` | `draft` → `in_review` → `published` → `archived` |
| `published_at` / `unpublished_at` | Programación de publicación y caducidad |
| `slug` | Único por colección; se conserva un historial (`slug_history`) que alimenta redirecciones 301 |
| `seo_title`, `seo_description`, `og_image_url`, `canonical_url`, `noindex` | Metadatos SEO |
| `locale_default` | Idioma base (normalmente `es`); las demás lenguas van en `entity_translations` |
| `created_by`, `updated_by`, `reviewed_by` | Trazabilidad de editores |
| `deleted_at` | Borrado lógico |
| `version` | Contador optimista (se rechaza la edición si el `version` enviado es obsoleto → `409`) |

Las **revisiones** se guardan en `content_revisions(entity_type, entity_id, version, snapshot jsonb, author_id, created_at)`; se puede restaurar cualquier versión.

Los campos que hoy el frontend llama `is_active` se mantienen por compatibilidad y se derivan de `status = 'published'`.

### 4.2 Flujo editorial

1. El **editor** crea/edita → estado `draft` (guardado automático, sin efecto público).
2. Envía a revisión (`in_review`) → notificación a moderadores.
3. El **revisor/admin** aprueba → `published` (inmediato o con `publish_at`).
4. La publicación dispara `content.published` → purga de cache CDN/Redis, reindexado de búsqueda, regeneración de `sitemap.xml`, cola de traducción automática (5.15).
5. Un contenido `published` editado vuelve a `draft` **sólo en su copia de trabajo**: la versión publicada sigue visible hasta aprobar la nueva (patrón *working copy*).

### 4.3 Dos formas de operar el CMS (misma API pública)

| Opción | Cómo funciona | Cuándo elegirla |
|---|---|---|
| **A. CMS integrado** (recomendada para arrancar) | El panel `/admin` ya tiene gestión genérica de 76 entidades (`AdminEntityConfigs`, formulario, importador CSV). Se apoya en `/admin/{coleccion}` (sección 5.17) con el flujo de estados anterior | Equipo editorial pequeño, cero dependencias extra |
| **B. CMS headless** (Strapi / Directus / Payload / Contentful) | El CMS es el editor; sincroniza hacia la base de la API mediante webhook `POST /webhooks/cms` (5.19) o se lee directamente vía adaptador. La API pública **no cambia** | Equipos editoriales grandes, flujos de aprobación complejos |

**Estado:** se eligió la opción B con **Strapi 5** (`cms/`). La API implementa la sincronización (`POST /webhooks/cms`, `npm run cms:sync`, `/admin/cms/*`) para `destino`, `playa`, `alojamiento`, `experiencia` y `aeropuerto`; detalle en `backend/README.md`. Con esta opción el panel `/admin/{entidad}` de la sección 5.17 queda como respaldo y no es la vía editorial principal.

En ambos casos: (1) las **relaciones** (provincia → destinos → hoteles) usan los mismos `id`/`slug`; (2) los **medios** viven en el almacenamiento de la sección 5.16; (3) los contenidos **no CMS** (reservas, usuarios…) nunca pasan por el CMS.

### 4.4 Invalidación de cache

`content.published|updated|unpublished` → `PURGE` de las URLs afectadas (`/beaches/{slug}`, listados que incluyen la colección) + `revalidate` de las páginas pre-renderizadas (si se adopta SSR/ISR) + reindexación.

### 4.5 Qué NO es CMS (aunque se vea como contenido)

Reseñas y comentarios de usuarios (moderación, no edición editorial), publicaciones de *RD Social*, fotos de retos, logros desbloqueados, anuncios de operadores (los administra el proveedor; el admin sólo **modera/verifica**), textos legales versionados (van en `site_settings` con historial).


---

## 5. Catálogo de endpoints

**Leyenda de acceso:** `Público` sin token · `Auth` usuario autenticado · `Dueño` sólo el propietario del recurso · `Partner` proveedor verificado · `Org:<rol>` rol dentro de una organización de Operadores RD (`owner`, `admin`, `recepcion`, `guia`) · `Editor` · `Moderador` · `Admin`.
Todas las rutas cuelgan de `/api/v1`. Salvo indicación, los cuerpos son JSON y las respuestas usan el envoltorio de la sección 3.3.

### 5.1 Autenticación y cuentas

Reemplaza a `supabase.auth.*` (`useAuth.tsx`), a `/api/auth/*` del prototipo y al trigger `handle_new_user`.

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/auth/register` | Público | Crea cuenta. Body: `email`, `password` (≥ 10 car.), `display_name?`, `locale?`, `accept_terms` (obligatorio), `referral_code?`, `marketing_opt_in?`. Crea `users` + `profiles` + `user_gamification` y envía correo de verificación. Si hay `referral_code`, registra `referral_uses` y otorga XP al referidor (5.11) |
| POST | `/auth/login` | Público | `email` + `password` → `{ access_token, refresh_token, user }`. Bloquea con `403 ACCOUNT_SUSPENDED` si `is_suspended` |
| POST | `/auth/refresh` | Público (refresh token) | Rota el refresh token |
| POST | `/auth/logout` | Auth | Revoca el refresh token de la sesión actual (`?all=true` cierra todas) |
| GET | `/auth/me` | Auth | Usuario + perfil + roles + organización (si es miembro de Operadores RD) + contadores (favoritos, notificaciones sin leer) |
| POST | `/auth/verify-email` | Público | Body: `token` (enlace del correo) |
| POST | `/auth/resend-verification` | Auth | Reenvía el correo de verificación (límite 3/hora) |
| POST | `/auth/forgot-password` | Público | Envía enlace de restablecimiento (respuesta siempre `202`, no revela si el correo existe) |
| POST | `/auth/reset-password` | Público | Body: `token`, `password` (página `/reset-password`) |
| POST | `/auth/update-password` | Auth | Body: `current_password`, `new_password` |
| GET | `/auth/oauth/{provider}` · GET `/auth/oauth/{provider}/callback` | Público | Inicio de sesión social (`google`, `apple`, `facebook`) — opcional, Fase 3 |
| GET | `/auth/sessions` · DELETE `/auth/sessions/{id}` | Auth | Lista y revoca dispositivos |
| POST | `/auth/partner/register` | Público | Alta de proveedor (equivale a `/partner/login` + `/registro`): crea usuario y `partner_profiles` en estado `unverified` |
| GET | `/auth/team-invitation/{token}` · POST `/auth/team-invitation/{token}/accept` | Público | Invitaciones de equipo de Operadores RD (5.10) |

**Implementado (`backend/`):** todos los endpoints de esta tabla salvo `/auth/partner/register` e invitaciones de equipo (van con Operadores RD); OAuth con Google (OIDC + PKCE; Apple y Facebook pendientes). Además: verificación en dos pasos TOTP (`/auth/2fa/*`, exigida al personal en producción), `GET /.well-known/jwks.json` con rotación de claves, cola de correo durable en PostgreSQL y límites de tasa compartidos (PostgreSQL o Redis). Detalle en `backend/README.md`. El refresco viaja en el cuerpo JSON (móvil/API) o en cookie `HttpOnly` cuando el cliente envía `X-Refresh-Transport: cookie` (esa cabecera también es la defensa CSRF). Un refresh token es de un solo uso: presentar uno ya rotado revoca toda la sesión. Tras 5 fallos de login la cuenta se bloquea 15 min. Ver `backend/README.md`.

Reglas: contraseñas con `argon2id`; verificación de correo obligatoria antes de reservar/pagar (no antes de navegar); bloqueo progresivo de intentos; `has_role` y `is_admin_user` pasan a ser comprobaciones en el middleware.

### 5.2 Perfil y preferencias

Tablas: `profiles`, `user_roles`, `user_suspensions`, `favorites`, `notifications`. Consumidores: `/perfil`, `/perfil-jugador`, `/mis-logros`, `Header`.

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/me/profile` · PATCH `/me/profile` | Auth | `display_name`, `bio`, `avatar_url`, `travel_interests[]`, `country`, `birth_year?`, `locale`, `currency` |
| POST | `/me/avatar` | Auth | Devuelve URL firmada de subida (5.16) |
| GET | `/me/preferences` · PUT `/me/preferences` | Auth | Idioma, moneda, consentimientos (analítica, marketing), preferencias de notificación por canal y tipo |
| GET | `/me/favorites?type=` | Auth | Lista de favoritos (`entity_type`, `entity_id`) con la entidad resumida (`include=entity`) |
| PUT | `/me/favorites/{entity_type}/{entity_id}` | Auth | Marca favorito (idempotente) — reemplaza el `insert` de `useFavorites` |
| DELETE | `/me/favorites/{entity_type}/{entity_id}` | Auth | Quita favorito |
| GET | `/me/notifications?unread=true` | Auth | Bandeja (`notifications`) — cursor |
| PATCH | `/me/notifications/{id}` · POST `/me/notifications/read-all` | Auth | Marcar leída(s) |
| GET | `/me/export` | Auth | Exporta todos los datos personales (JSON/ZIP; asíncrono, enlace por correo) — Ley 172-13 |
| DELETE | `/me` | Auth | Solicita eliminación de cuenta (30 días de gracia; anonimiza reseñas/pedidos que deban conservarse) |
| GET | `/users/{id}/public` | Público | Perfil público de explorador (`/explorador/:id`): nombre, avatar, nivel, insignias, seguidores |
| POST/DELETE | `/users/{id}/follow` | Auth | Seguir/dejar de seguir (`explorer_follows`) |

`entity_type` válidos en favoritos: `destination`, `beach`, `hotel`, `restaurant`, `bar`, `experience`, `event`, `airbnb`, `tour`, `river`, `mountain`, `park`, `article`, `route`, `operator_listing`, `store_product`.

### 5.3 Contenido público del portal

Reemplaza las lecturas `supabase.from(<tabla>).select(...)` y los datos estáticos de `src/data/*.ts`. Es contenido **CMS** (categoría 4) salvo indicación. Un único controlador genérico registra las rutas de la tabla siguiente.

**Rutas genéricas por colección** (sustituir `{col}` por la ruta de la tabla):

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/{col}` | Público | Listado paginado con `q`, `filter[…]`, `sort`, `near`, `include`, `fields` (3.4). Sólo `status = published` |
| GET | `/{col}/{idOrSlug}` | Público | Detalle completo (incluye `gallery[]`, `seo`, `coordinates`, traducción según idioma) |
| GET | `/{col}/{idOrSlug}/related` | Público | Relacionados (misma provincia/categoría, por afinidad) |
| GET | `/{col}/{idOrSlug}/nearby?radius=` | Público | Elementos cercanos de otras colecciones (`types=beach,restaurant,hotel`) |
| GET | `/{col}/{idOrSlug}/reviews` | Público | Reseñas aprobadas + resumen de calificación (5.6) |
| GET | `/{col}/facets` | Público | Conteos por filtro (provincia, categoría, precio, estrellas…) para los filtros de las páginas de listado |

**Catálogo de colecciones**

| Ruta `{col}` | Tabla | Páginas del portal que la usan | Filtros específicos |
|---|---|---|---|
| `provinces` | `provinces` | `/provincias`, `/provincia/:slug`, `/destinos-regiones` | `region` |
| `municipalities` | `municipalities` | `/municipio/:slug` | `province_id` |
| `destinations` | `destinations` | `/destinos`, `/destino/:slug`, `/destinos/:slug`, `/destinos/categoria/:categoria`, `/destinos/region/:region` (≈ 60 rutas fijas de destinos) | `region`, `type` (provincia/municipio/zona), `categories` |
| `beaches` | `beaches` | `/playas`, `/playa/:slug`, `/estado-playas` | `province`, `blue_flag`, `amenities` |
| `mountains` | `mountains` (nueva; hoy `data/mountains.ts`) | `/montanas`, `/montana/:slug`, `/pico-duarte` | `province`, `difficulty` |
| `rivers` | `rivers` | `/rios`, `/rio/:slug` | `province`, `activity` |
| `parks` | `parks` | `/parque/:slug`, `/parque-nacional/:slug` | `province` |
| `protected-areas` | `protected_areas` | `/areas-protegidas`, `/reservas-naturales` | `category` |
| `caves` | `caves` | `/cueva/:slug` | `province` |
| `hot-springs` | `hot_springs` | `/aguas-termales` | `province` |
| `monuments` | `monuments` | `/museos-monumentos`, `/museos`, `/patrimonio` | `province`, `type` |
| `bird-species` | `bird_species` | `/avistamiento-aves`, `/biodiversidad` | `endemic` |
| `hotels` | `hotels` | `/alojamientos`, `/alojamiento/:slug`, `/comparador-hoteles` | `stars`, `price`, `amenities`, `all_inclusive`, `province` |
| `airbnb-listings` | `airbnb_listings` | `/airbnb/:slug` | `price`, `beds` |
| `restaurants` | `restaurants` | `/restaurante`, `/restaurante/:slug`, `/guia-gastronomica` | `cuisine`, `price_level`, `province` |
| `bars` | `bars` | `/bar/:slug`, `/vida-nocturna` | `type`, `province` |
| `spas` | `spas_wellness` | `/spas`, `/spa/:slug`, `/wellness` | `province`, `treatments` |
| `experiences` | `experiences` | `/experiencias`, `/experiencia/:slug`, `/actividades`, `/actividad/:slug` | `category`, `duration`, `price` |
| `tours` | `tour_packages` | `/tours`, `/tour/:slug`, `/tours-360` | `duration`, `price`, `operator_id` |
| `events` | `events` | `/eventos`, `/evento/:slug`, `/calendario`, `/carnaval` | `from`, `to`, `category`, `province` |
| `clinics` | `clinics` | `/clinica/:slug`, `/centro-salud/:id`, `/salud-24h`, `/turismo-medico` | `province`, `open_24h`, `specialty` |
| `ports` | `ports_marinas` | `/puerto/:slug`, `/marina/:slug`, `/puertos-marinas`, `/nautica` | `type` |
| `stadiums` | `stadiums` | `/estadio/:slug`, `/lidom` | `sport` |
| `theme-parks` | `theme_parks` | `/parques-tematicos` | — |
| `golf-courses` | `golf_courses` | `/golf-rd` | `holes` |
| `shopping-centers` | `shopping_centers` | `/centro-comercial/:slug`, `/compras` | `province` |
| `souvenirs` | `souvenirs` | `/souvenirs-digitales`, `/hecho-en-rd` | `category` |
| `artisan-workshops` | `artisanal_workshops` | `/talleres-artesanales` | `province` |
| `coffee-experiences` | `coffee_experiences` | `/cultura-cafe` | `province` |
| `tour-guides` | `tour_guides` | `/guias-locales`, `/guias-ecologicos` | `language`, `specialty` |
| `travel-agencies` | `travel_agencies` | `/directorio-agencias`, `/agencia/:slug` | `province` |
| `tour-operators` | `tour_operators` | `/tours`, `/operadores` (directorio clásico) | `verified` |
| `historical-figures` | `historical_figures` | `/historia/personaje/:slug`, `/historia-rd` | `era` |
| `historical-events` | `historical_events` | `/historia/evento/:slug` | `era` |
| `articles` | `articles` (+ `blog_posts`) | `/blog`, `/articulo/:slug`, `/revista`, `/prensa`, `/autor-invitado` | `category`, `author_id`, `tag` |
| `recipes` | `recipes` (nueva; hoy `data/recipesData.ts`, `criolloRecipesData.ts`) | `/recetas-criollas`, `/receta/:slug` | `category`, `difficulty` |
| `routes` | `routes` + `route_stops` | `/itinerarios`, `/rutas-sabor`, `/ruta-larimar`, `/ruta-ron-tabaco`, `/ruta-hermanas-mirabal` | `theme`, `duration` |
| `audio-guides` | `audio_guides` | `/audio-guias`, `/silent-guide` | `language`, `route_id` |
| `job-vacancies` | `job_vacancies` | `/empleo`, `/empleo/:slug` | `province`, `type` |
| `airports` | `airports` (nueva; hoy `data/airports.ts`) | `/aeropuerto`, `/aeropuerto/:slug`, `/como-llegar` | `code` |
| `activities` | `activities` (nueva; hoy `data/activitiesData.ts`) | `/actividades` | `category` |
| `creators` | `creators` (nueva; hoy `data/creatorsData.ts`) | `/creadores`, `/gamificacion-turistica/creadores`, `/contratar-influencers` | `platform` |
| `offset-projects` | `offset_projects` | `/calculadora-carbono`, `/sostenible` | — |
| `toll-routes` | `toll_routes` | `/calculadora-peajes` | `from`, `to` |
| `emergency-contacts` | `emergency_contacts` | `/contactos-emergencia`, `/emergencias`, `/embajadas` | `type`, `province` |
| `faqs` | `faqs` (nueva) | `/centro-ayuda`, `/ayuda`, `/asistencia` | `category` |
| `legal-pages` | `site_settings` (clave `legal.*`) | `/terminos`, privacidad, `/leyes-turista` | — |

Rutas específicas adicionales (todas `Público`, `GET`):

| Ruta | Descripción |
|---|---|
| `/home` | Payload agregado de la portada: hero, destinos destacados, eventos próximos, restaurantes, bares, alojamientos, centros comerciales, transporte, testimonios, noticias, banners (`placement=home_*`). Cacheable 5 min |
| `/destinations/{slug}/page` | Página de destino completa: hero (100 vh, slider), 2 slots de patrocinio, secciones, mapa, galería, categorías cercanas, banners de la sección |
| `/provinces/{slug}/stats` · `/provinces/stats` | Estadísticas por provincia (`get_province_stats`) |
| `/regions` | Regiones (norte, sur, este…) con provincias y contadores |
| `/categories` · `/categories/{slug}` | Categorías de experiencias/destinos con sus elementos |
| `/itineraries/featured` | Itinerarios prediseñados (`/itinerarios`) |
| `/pages/{slug}` | Páginas editoriales de estructura libre (guías tipo `/guia-lgbtq`, `/viajar-con-mascotas`, `/sostenible`…): `blocks[]` tipados (texto, galería, tarjetas, FAQ, CTA). Son la vía para las ~80 páginas informativas que hoy son componentes con texto fijo |
| `/site/settings` | Ajustes públicos del sitio (`site_settings` con `is_public`): menú, pie, redes, contacto, textos globales, banderas de funciones |
| `/site/navigation` | Estructura de menú y mega-menú (editable desde el CMS) |
| `/sitemap.xml` · `/robots.txt` · `/rss/articles.xml` | Generados desde la base |
| `/redirects` | Reglas de `seo_redirections` para el edge/CDN |

**Ejemplo — `GET /beaches/playa-rincon?lang=en`**

```jsonc
{ "data": { "id": "9f3…", "slug": "playa-rincon", "name": "Rincón Beach",
    "province": { "id": "…", "slug": "samana", "name": "Samaná" },
    "short_description": "…", "description": "…",
    "coordinates": { "lat": 19.27, "lng": -69.24 },
    "image_url": "https://cdn.descubre.do/…", "gallery": ["…"],
    "amenities": ["parking","restaurants"], "rating": { "avg": 4.8, "count": 212 },
    "seo": { "title": "…", "description": "…", "og_image": "…" },
    "updated_at": "2026-09-01T10:00:00Z" },
  "meta": { "locale": "en" } }
```

### 5.4 Búsqueda, mapa y recomendaciones

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/search?q=&types=&lang=&limit=` | Público | Búsqueda global multi-colección (Header y `/comparador`): devuelve `{ type, id, slug, title, image, highlight }`, ordenada por relevancia |
| GET | `/search/suggest?q=` | Público | Autocompletado (≤ 8 sugerencias, ~50 ms, cacheado) |
| GET | `/search/popular` | Público | Búsquedas frecuentes (de `analytics_events`) |
| GET | `/map/layers` | Público | Capas disponibles del mapa interactivo (playas, hoteles, misiones, checkpoints…) |
| GET | `/map/features?layer=&bbox=&zoom=` | Público | GeoJSON por capa y *bounding box* (`/mapa-interactivo`, `/mapas`, `/mapa-misiones`, `/gamificacion-turistica/mapa`) |
| GET | `/geo/nearby?lat=&lng=&radius=&types=` | Público | "Cerca de mí" (`offers` con `radius_meters`, restaurantes, etc.) |
| GET | `/geo/reverse?lat=&lng=` | Público | Provincia/municipio de una coordenada |
| POST | `/ai/chat` | Público (limitado) / Auth | Asistente "Guía RD" — reemplaza la función `chat-turistico`. Body: `messages[]`, `locale`, `context?`. Respuesta en *streaming* (SSE). 10 msg/min anónimo |
| POST | `/ai/itinerary` | Auth | Genera itinerario (`/itinerario-ia`, `/planifica`): `days`, `budget`, `interests[]`, `party`, `start_date` → `{ days:[{title,items:[{type,ref,time,notes}]}] }`. Se puede guardar con `POST /me/trips` (5.7) |
| POST | `/ai/recommendations` | Auth | Reemplaza `ai-recommendations`: usa intereses + destinos visitados + favoritos |
| GET | `/recommendations/home` | Público / Auth | Recomendaciones de portada (personalizadas si hay sesión) |
| POST | `/ai/translate` | Auth (`Editor`) | Traducción asistida de un texto (5.15) |

Reglas de IA: el prompt de sistema vive en `site_settings` (editable), se filtran entradas con datos personales, se registra consumo por usuario y se aplica el límite diario de 3.5.

### 5.5 Datos vivos y utilidades

Datos actualizados por trabajos programados (sección 9) y expuestos en modo lectura. Sustituyen a `ExchangeRates`, `precios-combustible`, `loteria`, `clima`, `sargazo`, etc.

| Método | Ruta | Descripción | Fuente / frecuencia |
|---|---|---|---|
| GET | `/live/exchange-rates?base=USD` | Tasas por banco y oficial (`exchange_rates`) — `/tasas-cambio`, `/conversor-moneda`, widget de portada | BCRD + bancos · cada 30 min |
| GET | `/live/exchange-rates/history?pair=USD-DOP&days=30` | Serie histórica para gráficas | derivado |
| POST | `/utils/convert` | Conversión de moneda `{amount, from, to}` | usa tasa vigente |
| GET | `/live/fuel-prices` | Combustibles vigentes y variación (`fuel_prices`) — `/precios-combustible(s)` | MICM · semanal (viernes) |
| GET | `/live/lottery/results?game=&from=&to=` · GET `/lotteries` · GET `/lotteries/{slug}` | Resultados y ficha de cada lotería (`lotteries`, `lottery_draws`, `lottery_results`) — `/loteria(s)/:slug` | proveedor de resultados · por sorteo |
| GET | `/live/weather?province=` · `/live/weather/forecast?province=&days=7` | Clima actual y pronóstico (`/clima`, `/clima-temporadas`, widget "28 °C Santo Domingo" del Header) | OpenWeather/INDOMET · 30 min |
| GET | `/live/weather/alerts` | Alertas meteorológicas (`weather_alerts`) | ONAMET/COE · 10 min |
| GET | `/live/beach-status` | Estado de playas (oleaje, bandera, sargazo) — `/estado-playas`, `/reporte-olas-viento`, `/observatorio-sargazo`, `/sargazo` | reportes editoriales + marinos |
| GET | `/live/marine-reports` · POST `/live/marine-reports` | Lista y alta de reportes (`marine_reports`); POST requiere `Editor`/`Partner` | manual |
| GET | `/live/webcams` | Enlaces de webcams (`/webcams`) | CMS |
| GET | `/live/events-now` | Eventos en vivo (`/eventos-vivo`) | derivado de `events` |
| GET | `/live/time-zones` | Zonas horarias (`/zonas-horarias`) | estático |
| GET | `/live/flights?airport=&type=arrivals\|departures` | Vuelos (opcional; `/aeropuerto`) | proveedor de vuelos · 5 min — Fase 3 |

Calculadoras (lógica de negocio del lado servidor para que las reglas — tasas, topes — sean auditables y se editen en `site_settings`):

| Método | Ruta | Página | Body → Respuesta |
|---|---|---|---|
| POST | `/calculators/budget` | `/calculadora-presupuesto`, `/costos-viaje` | `days`, `party`, `style`, `region` → desglose por rubro |
| POST | `/calculators/tolls` | `/calculadora-peajes` | `from`, `to`, `vehicle` → peajes y total (`toll_routes`) |
| POST | `/calculators/carbon` | `/calculadora-carbono` | `transport`, `distance`, `nights` → CO₂ y proyectos de compensación (`offset_projects`) |
| POST | `/calculators/confotur` | `/calculadora-confotur`, `/confotur-calculadora` | `investment`, `sector` → beneficios fiscales Ley 158-01 |
| POST | `/calculators/tax` | `/calculadora-tributaria` | monto y régimen → impuestos |
| POST | `/calculators/packing-list` | `/lista-empaque` | `days`, `climate`, `activities[]` → lista |
| GET | `/tools/dictionary?q=` · `/tools/phrases?lang=` | `/diccionario`, `/espanol-viajero`, `/traductor` | glosario editable (colección `phrases`) |
| GET | `/tools/requirements?country=` | `/requisitos-viaje`, `/aduanas` | requisitos de entrada por país (CMS) |
| GET | `/tools/esim`, `/tools/insurance`, `/tools/prepaid-card` | `/esim`, `/seguro-viaje`, `/tarjeta-prepago` | catálogos de afiliados + `POST /tools/{x}/lead` |

### 5.6 Interacción del usuario

Tablas: `reviews`, `social_posts`, `social_likes`, `social_comments`, `post_comments`, `post_likes`, `ugc_media`, `ugc_reports`, `survey_templates`, `survey_responses`, `newsletter_subscribers`, `support_tickets`, `support_messages`, `contest_registrations`, `vacation_registrations`, `establishment_registrations`, `marketing_leads`.

**Reseñas y calificaciones** (reemplaza `reviews` en detalle de hoteles, restaurantes, etc. y `/opiniones`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/reviews?entity_type=&entity_id=&sort=&page=` | Público | Reseñas aprobadas + resumen (`avg`, `count`, distribución) |
| POST | `/reviews` | Auth | `entity_type`, `entity_id`, `rating` (1–5), `title`, `comment`, `visit_date`, `photos[]?`. Pasa a `pending` → moderación automática (antispam/lenguaje) + manual. Otorga XP al aprobarse (5.11) |
| PATCH/DELETE | `/reviews/{id}` | Dueño | Editar/eliminar la propia reseña (`useReviews` permite eliminar) |
| POST | `/reviews/{id}/helpful` · POST `/reviews/{id}/report` | Auth | Voto útil / reporte |
| POST | `/reviews/{id}/reply` | Partner / `Org:*` | Respuesta oficial del establecimiento |

**Red social "RD Social" (`/rd-social`, `/feed`)**

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/social/feed?cursor=&filter=following\|trending\|province` | Público | Publicaciones (`social_posts`) |
| POST | `/social/posts` | Auth | `content` (≤ 1 000), `media[]`, `location?`, `entity_ref?`. Límites: 10 posts/día. Filtro antispam |
| DELETE | `/social/posts/{id}` | Dueño / Moderador | Borrado lógico |
| PUT/DELETE | `/social/posts/{id}/like` | Auth | Like idempotente (`social_likes`) |
| GET | `/social/posts/{id}/comments` | Público | Comentarios paginados |
| POST | `/social/posts/{id}/comments` | Auth | Reemplaza el RPC `post_comment`: valida contenido, aplica el tope diario de comentarios que otorgan XP (`get_my_comment_stats`) y devuelve `{ comment, xp_awarded }` |
| GET | `/social/me/comment-stats` | Auth | `{ posts_today, total_comments }` (`get_my_comment_stats`) |
| POST | `/ugc/reports` | Auth | Reporta contenido (`ugc_reports`: `target_type`, `target_id`, `reason`) → cola de moderación (5.17) |
| POST | `/ugc/media` | Auth | Registra medio subido (tras `POST /media/upload-url`) — `ugc_media` en estado `pending` |

**Formularios y captación**

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/newsletter/subscribe` | Público | `email`, `lists[]`, `locale`, `source`. Doble opt-in por correo (`/newsletter`, `/newsletter-subscribe`) |
| GET/POST | `/newsletter/confirm?token=` · `/newsletter/unsubscribe?token=` | Público | Confirmación y baja con un clic |
| POST | `/contact` | Público | Formulario de contacto/sugerencias (`/sugerencias`, `/prensa`, `/creadores`, `/contratar-influencers`): crea `support_tickets` (`category`) + correo de acuse |
| POST | `/support/tickets` | Auth | Ticket con `subject`, `description`, `priority`, `attachments[]` |
| GET | `/support/tickets` · GET `/support/tickets/{id}` · POST `/support/tickets/{id}/messages` | Dueño | Conversación con soporte (`support_messages`) |
| POST | `/surveys/{template}/responses` | Público / Auth | Encuesta general, post-viaje (`/encuesta`, `/encuesta-post-viaje`) y NPS. `template` es un `survey_templates.slug`; `answers` validadas contra el esquema |
| GET | `/surveys/{template}` | Público | Estructura de la encuesta |
| POST | `/contests/{slug}/register` | Auth | Inscripción a concurso/sorteo (`/concursos`, `/sorteos`, `contest_registrations`): validación de elegibilidad y límite 1 por usuario |
| GET | `/contests` · GET `/contests/{slug}` · GET `/contests/{slug}/winners` | Público | Concursos vigentes y ganadores |
| POST | `/vacation-registrations` | Público | Registro de interés de vacaciones (`/vacaciones`, `/vuelve-a-casa`): `vacation_registrations` + lead |
| POST | `/leads` | Público | Lead genérico (`marketing_leads`): `source`, `interest`, `email/phone`, `consent` |
| POST | `/establishments/register` | Público / Auth | Solicitud de alta de establecimiento (`/registro`, modal `RegistroEstablecimientoModal`, `/afiliados`): `establishment_registrations` en `pending`; correo de acuse; el admin la aprueba y se crea `partner_profiles` |
| GET | `/establishments/registrations/{id}/status` | Dueño (token) | Consulta de estado |

Sugerencias y comentarios de contenido (`CommentSection`) usan `POST /reviews` con `entity_type` genérico o `/social/posts/{id}/comments` según el caso; el límite de longitud (`maxLength`) y la validación de correo del frontend se replican en el servidor.


### 5.7 Mi viaje e itinerarios

Hoy `/mi-viaje` sólo lee favoritos y `/planificador-grupal`, `/diario-viaje`, `/check-in`, `/e-ticket`, `/lista-empaque` no persisten nada en servidor. Se define el módulo `trips` (tablas nuevas `trips`, `trip_items`, `trip_members`, `trip_votes`, `trip_diary_entries`; y las placeholders `traveler_trips`, `traveler_spots`, `traveler_wishlist` del módulo Top 100).

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/me/trips` · POST `/me/trips` | Auth | Lista / crea viaje: `title`, `start_date`, `end_date`, `party_size`, `budget`, `currency` |
| GET | `/me/trips/{id}` · PATCH · DELETE | Dueño / miembro | Detalle del viaje con `items[]` por día |
| POST | `/me/trips/{id}/items` · PATCH/DELETE `/me/trips/{id}/items/{itemId}` | Dueño / miembro editor | Agrega actividad (`day`, `time`, `entity_type`, `entity_id` o texto libre, `notes`, `cost`) |
| POST | `/me/trips/{id}/reorder` | Dueño / miembro editor | Reordena elementos |
| POST | `/me/trips/{id}/from-itinerary` | Auth | Copia un itinerario prediseñado o el resultado de `/ai/itinerary` |
| GET | `/me/trips/{id}/summary` | Dueño / miembro | Presupuesto estimado, mapa (GeoJSON), reservas ligadas |
| POST | `/me/trips/{id}/share` | Dueño | Genera enlace público de sólo lectura (`/viaje/{token}`) |
| GET | `/trips/shared/{token}` | Público | Vista pública del viaje compartido |
| POST | `/me/trips/{id}/members` · DELETE `…/members/{userId}` | Dueño | Planificador grupal: invitar por correo/enlace (`role`: viewer/editor) |
| POST | `/me/trips/{id}/items/{itemId}/vote` | Miembro | Voto (+1/−1) para decidir en grupo |
| GET/POST | `/me/trips/{id}/diary` · PATCH/DELETE `…/diary/{entryId}` | Dueño | Diario de viaje (`/diario-viaje`): texto, fotos, ubicación, fecha; opcional público |
| GET | `/me/trips/{id}/packing-list` · PUT | Dueño | Lista de empaque (`/lista-empaque`) marcable |
| POST | `/me/trips/{id}/check-in` | Auth | Check-in digital (`/check-in`): confirma llegada a una reserva y suma XP (5.11) |
| GET | `/me/tickets` · GET `/me/tickets/{id}` | Dueño | E-tickets con QR (`/e-ticket`); `event_tickets` y vouchers de reservas |
| GET | `/tickets/verify?code=` | Org / `Admin` (escáner) | Valida un QR y lo marca usado |
| GET/PUT | `/me/spots` · `/me/spots/{spot_id}` (visitado) · `/me/wishlist/{spot_id}` (deseado) | Auth | Reto **Top 100** (`/top-100`): visitados y deseados. Al alcanzar 10/25/50/100 otorga XP y logros (sección 5.11) |

### 5.8 Reservas y checkout

Unifica tres orígenes de reserva sobre la tabla `reservations` (extendida en el módulo Operadores RD con `org_id`, `listing_id`, `room_id`, `check_out`, `guests`, `guest_mix`, `extras`, `payment_status`, `amount_paid`, `promo_code`, `source`, `notified`):

1. **Reserva de catálogo** del portal (`CheckoutModal`: hoteles, tours, experiencias, entradas) — `source = portal`.
2. **Reserva directa** en la página de un operador (`/operador/:slug/:listing`) — `source = web`.
3. **Reserva manual / marketplace** registrada por el operador — `source = manual | marketplace`.

> **Hallazgo de seguridad:** el `CheckoutModal` actual recoge número de tarjeta, vencimiento y CVV en el frontend y los usa para simular el cobro. **El backend nunca debe recibir datos de tarjeta.** Se usa el flujo de *campos alojados / redirección* de la pasarela: el navegador obtiene un `payment_method_token` directamente del proveedor y el backend sólo lo confirma. Así el sistema queda fuera del alcance PCI-DSS SAQ-D.

**Disponibilidad y cotización** (la lógica de las etapas 1–5 del panel de operadores vive aquí, no en el cliente)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/listings/{id}/availability?from=&to=` | Público | Cupos por fecha/horario (tours) o unidades libres por habitación (alojamientos) y fechas bloqueadas |
| POST | `/bookings/quote` | Público | Cotiza sin reservar. Body: `listing_id`, `room_id?`, `date`, `check_out?`, `time?`, `guests` \| `guest_mix{adults,children,infants}`, `extras[]`, `promo_code?`. Devuelve `lines[]` (tarifa base / fin de semana / temporada por noche, niños, extras, descuento), `total`, `deposit_amount?`, `issue?` (`MIN_NIGHTS`, `DATE_BLOCKED`, `MIN_GUESTS_NOT_REACHED`, `CAPACITY_EXCEEDED`). **Es la única fuente de precios**: el total que envía el cliente se ignora |
| POST | `/bookings` | Público (invitado) / Auth | Crea la reserva. `Idempotency-Key` obligatorio. Body = el de `quote` + `contact{name,email,phone}`, `notes`, `payment_mode` (`pay_now` \| `deposit` \| `pay_later`), `payment_method_token?`. Valida todo de nuevo dentro de una transacción con bloqueo de fila sobre el cupo. Respuesta: `{ booking, payment?, voucher_url }` |
| GET | `/bookings/{id}?token=` | Dueño / token de invitado / `Org:*` | Detalle de reserva (el invitado accede con el token del correo) |
| GET | `/me/bookings?status=` | Auth | Historial (`/reservas`) |
| POST | `/bookings/{id}/cancel` | Dueño / `Org:*` | Aplica la política de cancelación del anuncio (`flexible/moderada/estricta`) y calcula reembolso |
| POST | `/bookings/{id}/change-date` | Dueño | Solicita cambio de fecha (re-cotiza) |
| POST | `/bookings/{id}/pay-balance` | Dueño | Paga el saldo de una reserva con depósito |
| GET | `/bookings/{id}/voucher.pdf` | Dueño / `Org:*` | Voucher con QR |
| POST | `/promotions/validate` | Público | `code`, `org_id`/`listing_id`, `subtotal` → descuento aplicable |

**Pagos** (módulo `payments`; pasarela intercambiable: Azul, CardNET, Stripe, PayPal)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/payments/intents` | Público / Auth | Crea intención de pago para una reserva/pedido: `{ amount, currency, purpose, ref_id }` → `{ client_secret / redirect_url }` |
| POST | `/payments/{id}/confirm` | Público / Auth | Confirma tras el token del cliente (3-D Secure incluido) |
| GET | `/payments/{id}` | Dueño / `Admin` | Estado |
| POST | `/payments/{id}/refund` | `Org:owner` / `Admin` | Reembolso total o parcial (`amount`, `reason`) |
| POST | `/webhooks/payments/{provider}` | Firma del proveedor | Actualiza `payment_status` (`paid`, `partial`, `refunded`, `failed`) de forma asíncrona; es la fuente de verdad |

Reglas de negocio:
- **Comisión de plataforma** = `commission_rate` de la organización (8 % por defecto, `MARKETPLACE_TYPICAL_COMMISSION = 30 %` es sólo la referencia comparativa mostrada en la landing) **sólo sobre lo efectivamente cobrado en reservas `source = web`**. Los depósitos generan comisión proporcional; las reservas manuales no pagan comisión.
- Depósito: `deposit_percent` del anuncio (10–90 %); el saldo se cobra con `pay-balance` o se registra manualmente por el operador.
- Extras cobrados por persona cuentan adultos + niños (no bebés); por noche sólo en alojamientos.
- Bebés (0–2) gratis y sin cupo si el anuncio lo activa; niños (3–11) a `child_price`.
- `min_guests`: una salida con mínimo se marca `confirmed` cuando se alcanza el mínimo; si no, a la fecha límite el sistema propone otra fecha o reembolsa (job de la sección 9).
- Un mismo `(room_id, noche)` no puede exceder `quantity` unidades: se garantiza con restricción de exclusión / bloqueo transaccional.
- Los impuestos y donaciones opcionales del checkout (donación a Parques Nacionales, seguro de cancelación) son líneas separadas de la reserva.

### 5.9 Marketplace y Tienda oficial

Dos catálogos con carrito compartido (`cart_items`, hook `useCart`):

- **Marketplace** (`/marketplace`, `data/marketplaceData.ts`): productos y experiencias de vendedores locales → tablas `marketplace_products` (nueva), `marketplace_orders`, `marketplace_order_items`, `vendor_payments`, `discount_coupons`.
- **Tienda oficial** (`/tienda`, módulo `tienda`): mercancía propia de Descubre RD (pósters, ropa, gorras…) → `store_products`, `store_orders`.

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/store/products?category=&featured=&q=` · GET `/store/products/{slug}` | Público | Catálogo (tallas, colores, stock, precio en DOP; equivalencia USD calculada con la tasa vigente) |
| GET | `/marketplace/products?vendor=&category=` · GET `/marketplace/products/{slug}` · GET `/marketplace/vendors/{slug}` | Público | Catálogo de vendedores |
| GET | `/cart` | Público (cookie de invitado) / Auth | Carrito; al iniciar sesión se **fusiona** el carrito de invitado |
| POST | `/cart/items` · PATCH/DELETE `/cart/items/{id}` · DELETE `/cart` | Idem | `product_id`, `variant{size,color}`, `quantity` (valida stock) |
| POST | `/checkout/quote` | Idem | Subtotal, envío (**gratis desde RD$ 2 500, si no RD$ 250**), impuestos, descuentos → total en DOP y USD |
| POST | `/orders` | Idem | Crea pedido desde el carrito. `Idempotency-Key` obligatorio; descuenta stock con bloqueo; devuelve `payment intent` (5.8) |
| GET | `/me/orders` · GET `/orders/{id}?token=` | Dueño / token | Historial y detalle con seguimiento |
| POST | `/orders/{id}/return-request` | Dueño | Devolución dentro de 72 h |
| POST | `/coupons/validate` | Público | Cupón (`discount_coupons`) |
| GET | `/ambassadors/track?ref=` | Público | Registra el `affiliate_ref` (cookie 30 días) |

Pedido: estados `pending → paid → processing → shipped → delivered` (+ `cancelled`, `refunded`, `return_requested`). Cada cambio dispara correo (5.13). Las ventas con `ref_code` ejecutan `track_ambassador_sale` (5.11).

Vendedores del marketplace usan `Partner` (5.10) para gestionar sus productos: `GET/POST/PATCH/DELETE /partner/marketplace/products`, `GET /partner/marketplace/orders`, `GET /partner/payouts`.

### 5.10 Proveedores y Operadores RD

Dos paneles del mismo dominio:

- **Panel de proveedor clásico** (`/partner/login`, `/partner/dashboard`, `PartnerDashboard`): hoteles, restaurantes, agencias que gestionan su ficha y reservas → `partner_profiles`, `reservations`, `reviews`.
- **Operadores RD** (`/operadores`, `/operadores/panel/*`): plataforma de reserva directa para tours, hoteles, transportes y paquetes con sitio propio (`/operador/:slug`).

La organización es un `partner_profiles`. Toda ruta `/org/*` exige que el JWT tenga `org_id` y el rol adecuado (matriz de la sección 7.3).

**Alta, verificación y perfil**

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/orgs` | Auth | Crea organización (`business_name`, `business_type`, `email`, `phone`, `province`); estado `unverified`; `slug` único |
| GET | `/orgs/me` · PATCH `/orgs/me` | `Org:owner` (PATCH) / cualquier rol (GET, según permisos) | Perfil: logo, portada, descripción, `website_enabled`, `payout_method`, `commission_rate` (sólo lectura) |
| POST | `/orgs/me/verification` | `Org:owner` | Envía documentos (RNC, licencia MITUR, cédula/pasaporte) → `pending` |
| GET | `/orgs/me/dashboard` | Org | Resumen: reservas de hoy/próximas, solicitudes pendientes, mensajes sin leer, pasos de "Comienza tu travesía" |
| GET | `/orgs/me/team` · POST | `Org:owner` | Equipo: lista/invita (`name`, `email`, `role: admin\|recepcion\|guia`, `listing_ids[]` para guías) |
| PATCH/DELETE | `/orgs/me/team/{id}` | `Org:owner` | Cambia rol/asignaciones o retira acceso |

**Anuncios (servicios)** — categorías `experiencia`, `voluntariado`, `alojamiento`, `transporte`, `paquete`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/org/listings?status=` · POST | `Org:owner/admin` | Lista/crea. Campos: `title`, `summary`, `description`, `destination`, `price`, `currency`, `duration`, `capacity`, `min_age`, `languages[]`, `includes[]`, `meeting_point`, `cancellation_policy`, `images[]`, `time_slots[]`, `deposit_percent`, `child_price`, `infants_free`, `min_guests`, `extras[]`, y para paquetes `days`, `itinerary[]`, `components[]` |
| GET/PATCH/DELETE | `/org/listings/{id}` | `Org:owner/admin` | Publicar exige organización `verified`; si no, queda `draft` |
| POST | `/org/listings/{id}/publish` · `/pause` | `Org:owner/admin` | Cambia estado |
| POST | `/org/listings/{id}/duplicate` | `Org:owner/admin` | Duplica como borrador |
| GET/POST/PATCH/DELETE | `/org/listings/{id}/rooms[/{roomId}]` | `Org:owner/admin` | Habitaciones: `name`, `price`, `guests`, `quantity`, `beds`, `amenities[]`, `image`, `min_nights`, `weekend_price` |
| GET | `/org/listings/{id}/links` | `Org:*` | Enlaces públicos independientes: `…/operador/{slug}/{listing}` y, por habitación, `…?habitacion={roomId}` |

**Tarifas, calendario y sincronización** (etapas 1 y 6)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET/PUT | `/org/rooms/{roomId}/rates` | `Org:owner/admin` | `weekend_price`, `min_nights`, `seasons[{name,from,to,price}]` (prioridad: temporada > fin de semana > base) |
| GET/PUT | `/org/rooms/{roomId}/blocks` | `Org:owner/admin` | Rangos bloqueados (`from`, `to`, `reason`) |
| GET | `/org/calendar?from=&to=&listing_id=` | `Org:*` (guía: sólo sus anuncios, lectura) | Reservas y ocupación por día |
| GET | `/org/rooms/{roomId}/ical/export-token` · POST `/rotate` | `Org:owner/admin` | Token secreto del feed iCal saliente |
| GET | `/ical/{token}.ics` | Público (token secreto) | **Feed iCal** con las reservas de la habitación; Booking/Airbnb/Google lo consultan periódicamente |
| GET/POST | `/org/rooms/{roomId}/ical/imports` | `Org:owner/admin` | Calendarios externos vinculados (`name`, `url`); crea bloqueos con `link_id` |
| POST | `/org/rooms/{roomId}/ical/imports/{id}/sync` · DELETE | `Org:owner/admin` | Sincroniza ahora / desvincula y elimina bloqueos importados. Un job (sección 9) sincroniza cada 15 min; el navegador ya no lee URLs externas (se elimina el problema de CORS) |

**Reservas, solicitudes y cobros**

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/org/bookings?status=&from=&to=&listing_id=&q=&page=` | `Org:*` (guía: filtrado y sólo lectura) | Reservas |
| POST | `/org/bookings` | `Org:owner/admin/recepcion` | Reserva manual (`source = manual`, sin comisión) |
| PATCH | `/org/bookings/{id}` | `Org:owner/admin/recepcion` | Estado (`pending`, `confirmed`, `in_progress`, `completed`, `cancelled`), notas. Pasar a `completed` dispara la solicitud de reseña |
| POST | `/org/bookings/{id}/payments` | `Org:owner/admin/recepcion` | Registra cobro manual / cobra saldo (`amount`, `method`) → actualiza `payment_status` y `amount_paid` |
| GET | `/org/bookings/export.csv` | `Org:owner/admin/recepcion` | Exportación CSV |
| GET | `/org/requests` | `Org:*` | Solicitudes pendientes (badge del menú) |

**Mensajes, promociones, reseñas, información**

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/org/messages/threads` · GET `/org/messages/threads/{threadId}` | `Org:owner/admin/recepcion` | Bandeja unificada (`web`, `whatsapp`, `instagram`, `email`) |
| POST | `/org/messages/threads/{threadId}` | Idem | Responde (envía por el canal de origen) |
| POST | `/org/messages/threads/{threadId}/read` | Idem | Marca leído |
| GET/POST/PATCH/DELETE | `/org/promotions[/{id}]` | `Org:owner/admin` | Códigos: `code`, `type` (`percent`/`amount`), `value`, `starts_at`, `ends_at`, `max_uses`, `listing_ids[]` |
| GET | `/org/reviews` · POST `/org/reviews/{id}/reply` | `Org:owner/admin` | Reseñas y respuestas (`operator_reviews`) |
| GET | `/org/announcements` | `Org:*` | Novedades de la plataforma (CMS: `platform_announcements`) |

**Automatizaciones** (etapa 7)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET/PUT | `/org/automations` | `Org:owner/admin` | Reglas `confirmation`, `reminder` (24 h), `review`: `enabled`, `channels[]` (`email`, `whatsapp`), `subject`, `body` con variables `{nombre} {servicio} {fecha} {hora} {personas} {saldo} {referencia} {operador} {enlace}` |
| POST | `/org/automations/preview` | `Org:owner/admin` | Vista previa con una reserva real |
| GET | `/org/automations/log?page=` | `Org:owner/admin` | Historial de envíos (estado del proveedor: enviado/entregado/rebotado) |
| POST | `/org/automations/run-reminders` | `Org:owner/admin` | Envía ahora los recordatorios de mañana (además del job programado) |

Cada mensaje se envía **una sola vez** por reserva y tipo (`bookings.notified.{tipo}`), y queda en la bandeja del operador.

**Ingresos y reportes**

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/org/income?from=&to=` | `Org:owner/admin` | Ventas cobradas, comisión, ganancia neta, liquidado/retenido, serie mensual |
| GET | `/org/payouts` · POST `/org/payouts/request` | `Org:owner` | Liquidaciones al método de cobro (`payout_method`). Retenido hasta que la reserva pasa a `completed` |
| GET | `/org/reports/overview?from=&to=` | `Org:owner/admin` | Ventas por servicio, personas, ticket promedio, ocupación, origen de reservas (etapa 9) |
| GET | `/org/reports/listings` · `/org/reports/reviews` | `Org:owner/admin` | Desglose por anuncio y reseñas |

**Sitio público del operador** (`/operadores`, `/operadores/directorio`, `/operador/:slug`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/operators?q=&category=&destination=&verified=true` | Público | Directorio (sólo organizaciones `verified` con `website_enabled`) |
| GET | `/operators/{slug}` | Público | Sitio del operador con anuncios publicados agrupados por categoría |
| GET | `/operators/{slug}/listings/{listingSlug}` | Público | Ficha: descripción, fotos, habitaciones/tarifas, extras, política, reseñas, disponibilidad |
| GET | `/operators/{slug}/reviews` | Público | Reseñas del operador |
| GET | `/operators/features/{feature}` | Público | Contenido de `/operadores/funciones/:feature` (CMS: `operator_features`, 9 razones, FAQ) |

**Proveedor clásico** (`/partner/dashboard`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET/PATCH | `/partner/profile` | `Partner` | Ficha del establecimiento propio |
| GET | `/partner/reservations` · PATCH `/partner/reservations/{id}` | `Partner` | Reservas recibidas (`reservations.partner_id`) |
| GET | `/partner/analytics?range=` | `Partner` | Vistas, clics, reservas de su ficha (`analytics_events`) |
| GET | `/partner/reviews` · POST `…/{id}/reply` | `Partner` | Reseñas |
| POST | `/partner/banners` | `Partner` | Solicita un banner publicitario (5.12) |

### 5.11 Gamificación

Módulo `gamification` con **una sola puerta de escritura** (`GamificationService.grant()`), transaccional, idempotente y con antifraude. Reemplaza los 19 RPC y el código de `server.js`. Las páginas `/gamificacion`, `/gamificacion-turistica/*`, `/mis-logros`, `/badges`, `/retos`, `/trivia`, `/pasaporte-digital`, `/club-recompensas`, `/mapa-misiones` consumen estos endpoints. Tablas principales: `user_gamification`, `gamification_levels`, `gamification_transactions`, `points_transactions`, `achievements`, `user_achievements`, `gamification_missions`, `user_missions`, `gamification_prizes`, `user_prize_redemptions`, `reward_inventory`, `reward_shipments`, `referral_codes`, `referral_uses`, `passport_stamps`, `gamified_routes`, `route_checkpoints`, `user_route_progress`, `user_checkpoint_completions`, `digital_collectibles`, `user_collectibles`, `trivia_questions`, `trivia_sessions`, `photo_challenges`, `photo_submissions`, `photo_votes`, `gamification_seasons`, `gamification_leagues`, `user_league_stats`, `explorer_guilds`, `guild_members`, `explorer_follows`, `xp_milestones`, `user_xp_milestones`, `province_visits`, `user_flags`.

**Perfil de juego**

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/gamification/me` | Auth | XP total, monedas, nivel actual y siguiente (`gamification_levels`), racha, progreso al nivel, insignias, posición en liga |
| GET | `/gamification/me/transactions?cursor=` | Auth | Historial de XP/monedas (`gamification_transactions`) |
| GET | `/gamification/levels` · `/gamification/rules` | Público | Niveles y reglas de puntos (`/reglas-gamificacion`, `/requisitos-embajadores`, `formasGanarPuntos`) — CMS |
| POST | `/gamification/actions` | Auth | **Punto único** para acciones del usuario. Body: `action` (`review_created`, `favorite_added`, `page_visit`, `share`, `booking_completed`, `checkin`, `photo_upload`, `referral_signup`, `spot_visited`…), `ref_type`, `ref_id`. El servidor decide si otorga XP según `formasGanarPuntos` (límites diarios, cooldown, unicidad por `ref`). Respuesta: `{ granted: {xp, coins}, level_up?, achievements_unlocked[], missions_progress[] }` |
| POST | `/gamification/xp/award` | `Admin` | Reemplaza `award_user_xp` para uso interno/administrativo y `admin_award_xp_to_user` (`user_id`, `xp`, `coins`, `reason`); registra auditoría |

**Retención**

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/gamification/check-in` | Auth | Check-in diario (`perform_daily_checkin`): una vez por día (zona `America/Santo_Domingo`), actualiza racha; devuelve `{ success, xp, streak }` |
| POST | `/gamification/early-bird` | Auth | Bono madrugador (`perform_early_bird_bonus`) |
| POST | `/gamification/streak-bonus` | Auth | `check_and_award_streak_bonus`: multiplicador según `get_streak_multiplier(días)` |
| POST | `/gamification/milestones/check` | Auth | `check_xp_milestones`: entrega hitos de XP pendientes (`xp_milestones` → insignia + monedas) |

**Misiones, logros, premios**

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/gamification/missions` · GET `/gamification/missions/me` | Auth | Misiones activas y progreso (`gamification_missions`, `user_missions`) |
| POST | `/gamification/missions/{id}/progress` | Auth | Registra progreso (validado en servidor) y completa → XP (`useActionTracker`) |
| GET | `/gamification/achievements` · GET `/gamification/achievements/me` | Público / Auth | Catálogo e insignias del usuario (`achievements`, `user_achievements`) |
| POST | `/gamification/achievements/{id}/unlock` | Auth | `unlock_user_achievement`: valida la condición en servidor (no basta con la petición del cliente) |
| GET | `/gamification/prizes` | Público | Premios canjeables (`gamification_prizes`, stock de `reward_inventory`) |
| POST | `/gamification/prizes/{id}/redeem` | Auth | `redeem_user_prize`: descuenta monedas y stock en una transacción, devuelve código; crea `reward_shipments` si es físico |
| GET | `/gamification/redemptions/me` · GET `/gamification/shipments/me` | Auth | Canjes y envíos |
| GET | `/gamification/provinces` · POST `/gamification/provinces/{slug}/visit` | Auth | Visitas a provincias (`get_province_stats`, `record_province_visit`): `{ success, xp_awarded, total_provinces }` |

**Pasaporte, rutas y coleccionables**

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/passport/me` · POST `/passport/stamps` | Auth | Sellos (`passport_stamps`): para sellar se valida ubicación (`lat/lng` dentro del radio) o código QR del sitio |
| GET | `/gamification/routes` · `/gamification/routes/{id}` | Público | Rutas gamificadas con checkpoints |
| POST | `/gamification/routes/{id}/start` · POST `/gamification/routes/{id}/checkpoints/{cpId}/complete` | Auth | Progreso (`user_route_progress`, `user_checkpoint_completions`); verificación por GPS/QR |
| GET | `/collectibles` · GET `/collectibles/me` · PATCH `/collectibles/me/{id}` (equipar/mostrar) · DELETE | Público / Auth | `digital_collectibles`, `user_collectibles` |
| POST | `/collectibles/{id}/claim` | Auth | Reclamo con verificación |

**Trivia, retos de foto, ligas y gremios**

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/trivia/session` | Auth | Inicia una sesión con preguntas aleatorias **sin** la respuesta correcta |
| POST | `/trivia/session/{id}/answer` · POST `/trivia/session/{id}/finish` | Auth | Corrección en servidor; XP = aciertos × valor (hoy se calcula en el cliente y se envía con `award_user_xp`, lo que permite trampa) |
| GET | `/trivia/leaderboard` | Público | Ranking |
| GET | `/gamification/photo-challenges` · GET `…/{id}/submissions` | Público | Retos de fotografía activos y envíos aprobados |
| POST | `/gamification/photo-challenges/{id}/submissions` | Auth | Sube foto (moderación previa) |
| POST | `/gamification/photo-submissions/{id}/vote` | Auth | `vote_photo_submission`: 1 voto por usuario/foto, no auto-voto |
| GET | `/gamification/seasons/current` · GET `/gamification/leaderboard?scope=season\|league\|guild\|province&limit=` | Público | `get_season_leaderboard(p_limit)` |
| GET/POST | `/gamification/guilds` · POST `/gamification/guilds/{id}/join` · `/leave` | Auth | Gremios de exploradores (`explorer_guilds`, `guild_members`) |

**Referidos y embajadores**

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET/POST | `/referrals/me` | Auth | Código de referido propio (`referral_codes`) y estadísticas |
| POST | `/referrals/apply` | Auth | Aplica un código (sólo una vez por usuario, no propio) |
| GET | `/ambassadors/me` | `Ambassador` | Ventas, ganancias, comisión pendiente, nivel (`ambassadors`, `ambassador_referrals`) |
| POST | `/ambassadors/apply` | Auth | Solicitud (`/embajadores`, `/requisitos-embajadores`) |
| POST | `/ambassadors/track-sale` | Interno (checkout) | Reemplaza `track_ambassador_sale(ref_code, purchase_amount, buyer_email)`: se dispara desde el servicio de pedidos/reservas **al confirmarse el pago**, no desde el navegador |
| GET | `/ambassadors/me/payouts` · POST `/ambassadors/me/payouts/request` | `Ambassador` | Pagos de comisiones (`ambassador_payouts`) |

**Reglas antifraude obligatorias:** unicidad `(user_id, action, ref_id)`; topes diarios por acción; cooldown; verificación de ubicación/QR para acciones físicas; ninguna acción de XP se acepta con cifras del cliente (el cliente sólo informa *qué* hizo); bandera `user_flags` y revisión manual cuando se superan umbrales; todas las concesiones quedan en `gamification_transactions` con `source_type/source_id`.

### 5.12 Publicidad y marketing

Los banners publicitarios (`ad_banners`, hook `useAdBanners`, componentes `BannerAd`, `SectionWithSideAds`, mockups del admin) pasan a un servidor de anuncios sencillo.

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/ads?placement=&page=&section=&lang=` | Público | Devuelve los banners activos y vigentes (`start_date ≤ hoy ≤ end_date`, `is_active`) para un espacio, ordenados por `priority` con rotación ponderada. Ejemplos de `placement`: `home_hero`, `home_between`, `destination_sponsor_1/2`, `section_side_left/right`, `detail_sidebar`, `footer` |
| POST | `/ads/{id}/impression` · `/ads/{id}/click` | Público | Registro (lote, deduplicado por sesión) → `analytics_events`; `click` responde con redirección a `target_url` |
| GET | `/ads/slots` | Público | Definición de espacios y dimensiones (para "% ancho × alto" de los mockups) |
| POST | `/advertisers/requests` | Público / Partner | Solicitud de publicidad (`/prensa-comunicacion`, `/partners`): genera lead y ticket |
| GET | `/admin/ads/reports?range=` | `Admin` | Impresiones, clics, CTR por banner/anunciante |

Marketing (`marketing_campaigns`, `marketing_leads`, `newsletter_subscribers`, `offers`):

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/offers?near=&flash=true` | Público | Ofertas (`/ofertas`), incluidas las relámpago geolocalizadas (`radius_meters`) |
| GET | `/offers/{id}` · POST `/offers/{id}/redeem` | Público / Auth | Detalle y canje de código de descuento |
| GET/POST/PATCH | `/admin/marketing/campaigns[/{id}]` | `Admin` | Campañas (segmentación, calendario, canal correo/push) |
| POST | `/admin/marketing/campaigns/{id}/send-test` · `/schedule` · `/cancel` | `Admin` | Envío de prueba, programación, cancelación |
| GET | `/admin/marketing/leads?status=&source=` · PATCH `…/{id}` | `Admin` | Gestión de leads con estado (`new`, `contacted`, `won`, `lost`) |
| GET | `/admin/marketing/segments` · POST | `Admin` | Segmentos de usuarios (intereses, país, nivel, actividad) |


### 5.13 Correos y notificaciones

Módulo `mailer` + `notifications`. **Ningún módulo envía correo directamente**: publica un evento de dominio (sección 8) y el `mailer` lo renderiza con la plantilla y el idioma del destinatario, lo encola y registra el resultado (`email_log`).

**Catálogo de correos transaccionales**

| Clave de plantilla | Disparador | Destinatario | Idiomas |
|---|---|---|---|
| `auth.verify_email` | `POST /auth/register`, `resend-verification` | Usuario | 6 |
| `auth.welcome` | Al verificar el correo (incluye guía de gamificación y bono de bienvenida) | Usuario | 6 |
| `auth.reset_password` · `auth.password_changed` | `forgot-password`, `reset/update-password` | Usuario | 6 |
| `auth.suspicious_login` | Inicio de sesión desde dispositivo/país nuevo | Usuario | 6 |
| `booking.confirmation` | Reserva creada (`web` / `portal`) | Viajero (+ copia al operador) | 6 |
| `booking.request_received` / `booking.approved` / `booking.declined` | Reserva con `pay_later` o que exige aprobación | Viajero | 6 |
| `booking.reminder_24h` | Job: día anterior a la fecha | Viajero | 6 |
| `booking.balance_due` | 3 días antes de la fecha si hay saldo | Viajero | 6 |
| `booking.cancelled` · `booking.refund_issued` | Cancelación / reembolso | Viajero | 6 |
| `booking.min_guests_not_reached` | Salida sin mínimo de personas | Viajero | 6 |
| `booking.review_request` | Reserva `completed` (+ 24 h) | Viajero | 6 |
| `operator.new_booking` · `operator.new_message` · `operator.booking_cancelled` | Eventos de reserva/mensaje | Operador (roles `owner/admin/recepcion`) | es/en |
| `operator.verification_approved` / `_rejected` | Decisión del admin | Operador | es/en |
| `operator.team_invitation` | `POST /orgs/me/team` | Invitado | es/en |
| `operator.payout_sent` | Liquidación emitida | Operador | es/en |
| `order.confirmation` · `order.shipped` · `order.delivered` · `order.refund` | Estados del pedido de la tienda/marketplace | Comprador | 6 |
| `vendor.new_order` | Pedido del marketplace | Vendedor | es/en |
| `newsletter.confirm` · `newsletter.welcome` · `newsletter.issue` | Suscripción y campañas | Suscriptor | 6 |
| `support.ticket_received` · `support.reply` · `support.resolved` | Tickets | Usuario | es/en |
| `review.approved` · `review.rejected` · `review.reply_from_business` | Moderación / respuesta | Autor | 6 |
| `gamification.level_up` · `gamification.prize_redeemed` · `gamification.shipment_update` | Hitos y premios | Usuario | 6 |
| `ambassador.approved` · `ambassador.payout` | Programa de embajadores | Embajador | es/en |
| `establishment.registration_received` / `_approved` / `_rejected` | Alta de establecimiento | Solicitante | es/en |
| `contest.registered` · `contest.winner` | Concursos y sorteos | Participante | 6 |
| `account.export_ready` · `account.deletion_scheduled` · `account.deleted` | Derechos del titular | Usuario | 6 |
| `admin.digest_daily` · `admin.alert` | Resumen diario y alertas (picos de errores, moderación pendiente) | Administradores | es |

**API de plantillas y bitácora (administración)**

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/admin/email/templates` · GET `/admin/email/templates/{key}` | `Admin` | Plantillas por idioma (asunto, HTML/MJML, texto plano, variables permitidas) |
| PUT | `/admin/email/templates/{key}/{locale}` | `Admin` | Edita con versionado; valida variables |
| POST | `/admin/email/templates/{key}/test` | `Admin` | Envía prueba a un correo |
| POST | `/admin/email/templates/{key}/preview` | `Admin` | Renderiza con datos de ejemplo |
| GET | `/admin/email/log?to=&template=&status=&from=` | `Admin` | Bitácora (`queued`, `sent`, `delivered`, `bounced`, `complained`, `failed`) |
| POST | `/admin/email/log/{id}/resend` | `Admin` | Reintento manual |
| GET/POST/DELETE | `/admin/email/suppressions` | `Admin` | Lista de supresión (rebotes duros, quejas, bajas) |
| POST | `/webhooks/email/{provider}` | Firma del proveedor | Entrega/rebote/queja/apertura → actualiza `email_log` y suprime direcciones |

**Reglas del correo:** remitente por tipo (`no-reply@`, `reservas@`, `soporte@`); SPF/DKIM/DMARC configurados; cabecera `List-Unsubscribe` en marketing; los transaccionales no requieren consentimiento de marketing pero **sí respetan la supresión por rebote**; cola con reintentos exponenciales (5 intentos); adjuntos sólo por enlace firmado (vouchers/entradas).

**Notificaciones dentro de la app y otros canales**

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/me/notifications` · PATCH/POST (5.2) | Auth | Bandeja (`notifications`): `type`, `title`, `body`, `link`, `read_at` |
| GET | `/me/notification-preferences` · PUT | Auth | Matriz tipo × canal (`email`, `in_app`, `push`, `whatsapp`) |
| POST | `/me/push-subscriptions` · DELETE `/{id}` | Auth | Registro Web Push / FCM |
| GET | `/notifications/stream` | Auth | SSE/WebSocket para notificaciones en tiempo real (nuevo mensaje, resultado de moderación, salida confirmada) |
| POST | `/admin/notifications/broadcast` | `Admin` | Mensaje masivo segmentado (usa segmentos de 5.12) |

**WhatsApp Business** (Operadores RD y notificaciones): plantillas aprobadas por Meta para recordatorios; webhook `POST /webhooks/whatsapp` recibe respuestas de viajeros y las inserta en la bandeja del operador (`operator_messages`, canal `whatsapp`). Instagram Direct sigue el mismo patrón (`/webhooks/instagram`).

### 5.14 Analítica

Ingesta ligera desde el frontend (`useAnalytics`, hoy `analytics_events`: `event_type`, `page`, `session_id`, `metadata`) y consumo en los paneles.

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/analytics/events` | Público | Lote de eventos `[{ type, page, session_id, ts, props }]` (máx. 50/lote). Respeta consentimiento (`Do-Not-Track` y preferencia). Responde `204`. Tipos: `page_view`, `click`, `search`, `favorite`, `share`, `booking_started`, `booking_completed`, `ad_impression`, `ad_click`, `outbound_click`, `scroll_depth`, `error` |
| GET | `/admin/analytics/overview?from=&to=` | `Admin` | KPIs: usuarios, reseñas, favoritos, publicaciones, establecimientos, reservas, ingresos (pestaña `analytics`, `dashboard`) |
| GET | `/admin/analytics/traffic?from=&to=&group=page\|source\|country` | `Admin` | Vistas y sesiones |
| GET | `/admin/analytics/top-content?type=&limit=` | `Admin` | Contenido más visto/favorito |
| GET | `/admin/analytics/funnels/{name}` | `Admin` | Embudos (`reserva`, `registro`, `tienda`) |
| GET | `/admin/analytics/nps?from=&to=` | `Admin` | NPS y comentarios de `survey_responses` (pestaña `nps`) |
| GET | `/admin/analytics/search-terms` | `Admin` | Términos buscados sin resultados |
| GET | `/admin/analytics/export.csv?report=` | `Admin` | Exportación |
| GET | `/partner/analytics` · `/org/reports/*` | `Partner` / `Org:*` | Vistas por proveedor (5.10) |
| GET | `/statistics/public` | Público | Cifras públicas para `/estadisticas` (llegadas, ocupación, etc. — CMS + fuentes oficiales) |

Los eventos crudos se conservan 13 meses (luego se agregan por día). Se usan identificadores de sesión anónimos; no se guardan IP completas (sólo país y hash truncado).

### 5.15 Traducciones (i18n)

Idiomas soportados: `es` (base), `en`, `fr`, `de`, `pt`, `it`. Tres capas:

1. **Interfaz** (menús, botones): archivos de diccionario versionados con el frontend + diccionario automático de cadenas (`src/i18n/auto/*`). Se publica también como `GET /i18n/dictionary/{locale}` para poder corregirlo sin redeploy (tabla `ui_strings`).
2. **Contenido de entidades**: `entity_translations(entity_type, entity_id, language, field_name, translation_text)` y `article_translations`. Al leer una entidad con `?lang=`, la API reemplaza los campos traducidos y cae a `es` si faltan.
3. **Traducción automática asistida**: cuando un contenido se publica o cambia, se encola `translate.entity` para los idiomas activos; el traductor (IA/DeepL) escribe una traducción con estado `machine`; un editor puede revisarla (`reviewed`) o corregirla (`human`). El plan por página que quedó pausado se ejecuta con esta cola.

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/i18n/locales` | Público | Idiomas activos y cobertura |
| GET | `/i18n/dictionary/{locale}?ns=` | Público | Diccionario de UI (cacheable, con `ETag`) |
| GET | `/admin/translations?entity_type=&entity_id=&locale=&status=` | `Editor` | Traducciones y pendientes |
| PUT | `/admin/translations/{entity_type}/{entity_id}/{locale}` | `Editor` | Guarda campos traducidos (`status = human`) |
| POST | `/admin/translations/{entity_type}/{entity_id}/auto` | `Editor` | Fuerza traducción automática (todos los idiomas o `locales[]`) |
| POST | `/admin/translations/bulk-auto` | `Admin` | Encola una colección completa o una página |
| GET | `/admin/translations/coverage` | `Editor` | % traducido por colección/idioma (guía el plan página-por-página) |
| PUT | `/admin/i18n/dictionary/{locale}` | `Admin` | Edita cadenas de UI |

### 5.16 Archivos y medios

Hoy las imágenes son URLs externas; el backend centraliza los medios (`media_assets`: `id`, `owner_id`, `kind`, `mime`, `size`, `width/height`, `alt`, `credit`, `status`, `variants`).

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/media/upload-url` | Auth | Devuelve URL firmada (PUT directo a S3) + `asset_id`. Body: `mime`, `size`, `purpose` (`avatar`, `review_photo`, `ugc`, `listing_image`, `cms`). Límites por propósito (p. ej. 5 MB, `image/jpeg|png|webp`) |
| POST | `/media/{id}/complete` | Auth | Confirma la subida; el worker valida el archivo real (firma, antivirus), genera variantes (`thumb`, `card`, `hero`, `webp/avif`) y extrae dimensiones |
| GET | `/media/{id}` | Público / Dueño | Metadatos y URLs de variantes |
| DELETE | `/media/{id}` | Dueño / `Admin` | Elimina |
| GET | `/admin/media?q=&kind=&status=` | `Editor` | Biblioteca de medios del CMS |
| POST | `/admin/media/{id}/moderate` | `Moderador` | Aprobar/rechazar medios de usuarios |
| POST | `/admin/media/import-url` | `Editor` | Descarga una URL externa (p. ej. Unsplash) al almacenamiento propio y devuelve el `asset_id` |

Las imágenes se sirven desde `cdn.descubre.do` con parámetros de tamaño (`?w=800&fmt=webp`) y `Cache-Control: immutable`.

### 5.17 Administración del portal

Panel `/admin` (protegido con `has_role('admin')` hoy; ver roles en 7.3). Todas las rutas `/admin/*` requieren token con rol adecuado, registran auditoría y aplican límite de 600 req/min.

**Dashboard y usuarios** (pestañas `dashboard`, `usuarios`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/admin/dashboard` | `Admin` | KPIs, actividad reciente, pendientes de moderación, salud del sistema |
| GET | `/admin/users?q=&role=&status=&page=` | `Admin` | Listado con filtros (`AdminUsuarios`) |
| GET | `/admin/users/{id}` | `Admin` | Perfil, roles, actividad, XP, reservas, pedidos, banderas |
| PATCH | `/admin/users/{id}/role` | `Admin` | Reemplaza `admin_update_user_role(p_user_id, p_new_role)`. Registra auditoría; no permite quitar el último `admin` |
| POST | `/admin/users/{id}/suspend` · `/unsuspend` | `Admin` | Reemplaza `admin_toggle_user_suspended(p_user_id, p_suspended, p_reason)`; revoca sesiones y crea `user_suspensions` |
| POST | `/admin/users/{id}/award-xp` | `Admin` | Reemplaza `admin_award_xp_to_user` (`xp`, `coins`, `reason`) |
| POST | `/admin/users/{id}/impersonate` | `Admin` (con 2FA) | Sesión de soporte de sólo lectura, con banner y auditoría |
| POST | `/admin/users/{id}/reset-password` | `Admin` | Envía enlace de restablecimiento |
| GET/POST | `/admin/user-flags` · PATCH `/{id}` | `Moderador` | Banderas antifraude (`user_flags`) |
| GET/POST/DELETE | `/admin/ip-rules` | `Admin` | Reglas de IP (`ip_rules`: allow/deny) |

**CMS: gestión de contenido (genérica para las 76 entidades)** — reemplaza a `functions.invoke('admin-entities', { entity, action, id, data, filters })` y a `useAdminEntities`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/admin/{entity}?q=&filter[…]=&sort=&page=&status=` | `Editor` (según entidad) | Lista con conteo total (`action: list`) |
| GET | `/admin/{entity}/{id}` | `Editor` | Detalle (`get`) |
| POST | `/admin/{entity}` | `Editor` | Crea (`create`); valida con el esquema de campos (`fieldTypeMap`/`labelMap` del panel pasan a metadata servida por `GET /admin/{entity}/schema`) |
| PATCH | `/admin/{entity}/{id}` | `Editor` | Actualiza con `version` (concurrencia optimista) |
| DELETE | `/admin/{entity}/{id}` | `Editor`/`Admin` | Borrado lógico (`?hard=true` sólo `Admin`) |
| POST | `/admin/{entity}/{id}/submit-review` · `/publish` · `/unpublish` · `/archive` | Editor / Revisor | Flujo editorial (4.2); `publish` acepta `publish_at` |
| GET | `/admin/{entity}/{id}/revisions` · POST `…/restore/{version}` | `Editor` | Historial y restauración |
| POST | `/admin/{entity}/bulk` | `Editor` | Acciones masivas (`publish`, `unpublish`, `delete`, `set_field`) |
| POST | `/admin/{entity}/import` | `Editor` | Importación CSV/JSON (`EntityImportManager`): `?dry_run=true` valida y devuelve errores por fila; sin dry-run inserta/actualiza por `slug` |
| GET | `/admin/{entity}/export?format=csv\|json` | `Editor` | Exportación |
| GET | `/admin/{entity}/schema` | `Editor` | Definición de campos para generar formularios (tipo, etiqueta, requerido, opciones, relaciones) |

Entidades soportadas (todas las claves de `entityConfigs`): `provinces, destinations, hotels, restaurants, bars, tour_guides, travel_agencies, tour_operators, experiences, events, clinics, ports_marinas, stadiums, theme_parks, caves, rivers, coffee_experiences, airbnb_listings, artisanal_workshops, municipalities, ad_banners, historical_figures, historical_events, tour_packages, job_vacancies, establishment_registrations, beaches, spas_wellness, site_settings, newsletter_subscribers, marketing_leads, offers, ambassadors, ambassador_referrals, achievements, gamification_levels, profiles, partner_profiles, routes, route_stops, audio_guides, ugc_reports, event_tickets, reward_inventory, reward_shipments, survey_templates, survey_responses, admin_activity_logs, seo_redirections, system_webhooks, ugc_media, user_suspensions, support_tickets, support_messages, marketing_campaigns, points_transactions, marketplace_orders, marketplace_order_items, vendor_payments, discount_coupons, weather_alerts, emergency_contacts, system_cron_jobs, ip_rules, lotteries, lottery_draws, lottery_results, exchange_rates, fuel_prices, reservations, protected_areas, bird_species, hot_springs, offset_projects, toll_routes, marine_reports`. Se agregan a la lista las nuevas colecciones (`mountains`, `recipes`, `airports`, `activities`, `creators`, `faqs`, `pages`, `navigation`, `phrases`, `platform_announcements`, `operator_features`).

> Las entidades **transaccionales** de la lista (`reservations`, `profiles`, `points_transactions`, `marketplace_orders`, `support_tickets`, `user_suspensions`…) se exponen en `/admin/{entity}` sólo para **consulta y correcciones puntuales** (permisos por entidad en 7.3); su flujo de negocio real pasa por los endpoints de dominio.

**Moderación y comunidad** (pestaña `moderacion`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/admin/moderation/queue?type=review\|post\|comment\|media\|photo_submission\|report&status=pending` | `Moderador` | Cola unificada (`UGCModerationPanel`) |
| POST | `/admin/moderation/{type}/{id}/approve` · `/reject` · `/remove` | `Moderador` | Con `reason`; notifica al autor; otorga/retira XP asociado |
| GET | `/admin/moderation/reports` · PATCH `/admin/moderation/reports/{id}` | `Moderador` | Reportes de usuarios (`ugc_reports`): `open → reviewing → resolved/dismissed` |
| POST | `/admin/moderation/rules/test` | `Admin` | Prueba de filtros automáticos (lenguaje ofensivo, spam, enlaces) |

**Banners y publicidad** (pestaña `banners`, `AdminMockupBanners`): CRUD `/admin/ad_banners` + `GET /admin/ads/reports` (5.12) + `POST /admin/ads/preview` (vista previa por espacio y dispositivo).

**Gamificación** (pestaña `gamificacion`, `AdminGamification`, `GamificationStats`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/admin/gamification/stats` | `Admin` | XP emitido, usuarios activos, canjes, distribución por nivel |
| CRUD | `/admin/achievements` · `/admin/gamification_levels` · `/admin/gamification_missions` · `/admin/gamification_prizes` · `/admin/reward_inventory` · `/admin/gamification_seasons` · `/admin/xp_milestones` · `/admin/trivia_questions` · `/admin/digital_collectibles` · `/admin/photo_challenges` | `Admin` | Configuración del juego (misma API genérica) |
| POST | `/admin/gamification/seasons/{id}/close` | `Admin` | Cierra temporada: congela ranking, reparte premios, crea la siguiente |
| GET/PATCH | `/admin/gamification/shipments[/{id}]` | `Admin` | Consola de stock y envíos (`AdminStockConsole`, `reward_shipments`): estados `pending → packed → shipped → delivered`, guía de rastreo |
| POST | `/admin/gamification/users/{id}/adjust` | `Admin` | Ajuste manual con motivo (queda en `gamification_transactions`) |

**Constructor de rutas** (`routebuilder`): CRUD `/admin/routes` y `/admin/route_stops` + `POST /admin/routes/{id}/stops/reorder` (reordenar paradas), `GET /admin/routes/{id}/preview` (GeoJSON/tiempos).

**Importación de establecimientos** (`import`, `AdminImportEstablecimientos`): reemplaza `functions.invoke('import-establecimientos', { csv_text })`.

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/admin/imports/establecimientos` | `Admin` | Sube CSV/TXT (delimitador detectado: tabulador, `\|` o coma). Devuelve `job_id` |
| GET | `/admin/imports/{jobId}` | `Admin` | Estado: `{ inserted, updated, skipped, errors[{row,reason}] }` |
| GET | `/establecimientos?q=&province=&category=` | Público | Directorio oficial de establecimientos (`/establecimientos`) |

**Generador con IA** (`aigenerator`): reemplaza `functions.invoke('admin-ai-operations', { prompt, tone, entityType })`.

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/admin/ai/generate` | `Editor` | Body: `prompt`, `tone` (`aventurero`, `elegante`, `familiar`…), `entity_type`, `locale`. Devuelve `{ text, highlights[] }`; **nunca publica solo**: el resultado se pega en un borrador |
| GET | `/admin/ai/usage` | `Admin` | Consumo y costo por usuario/mes |

**Finanzas y lotería** (`AdminFinanceLotteryManager`): CRUD `/admin/exchange_rates`, `/admin/fuel_prices`, `/admin/lotteries`, `/admin/lottery_draws`, `/admin/lottery_results` + `POST /admin/live/refresh?source=fx|fuel|lottery|weather` (forzar actualización) y `PUT /admin/live/overrides/{key}` (corrección manual con caducidad).

**Auditoría** (`audit`)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/admin/audit-logs?actor=&entity=&action=&from=&to=` | `Admin` | `admin_activity_logs`: quién, qué, antes/después, IP, `request_id` |
| GET | `/admin/audit-logs/export.csv` | `Admin` | Exportación |

**Soporte** (`support_tickets`, `support_messages`): `GET /admin/support/tickets`, `PATCH /admin/support/tickets/{id}` (estado, prioridad, asignación), `POST /admin/support/tickets/{id}/messages`, `GET /admin/support/stats`.

**Ajustes del sistema**

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET/PUT | `/admin/settings/{key}` | `Admin` | `site_settings` (JSON con `is_public`): textos globales, contacto, redes, menú, reglas de puntos, comisión por defecto, tarifas de envío, tope de XP, prompts de IA, textos legales versionados |
| CRUD | `/admin/seo_redirections` | `Admin` | Redirecciones 301/302; se publican en `/redirects` |
| CRUD | `/admin/system_webhooks` · POST `…/{id}/test` · GET `…/{id}/deliveries` | `Admin` | Webhooks salientes (sección 8) |
| CRUD | `/admin/system_cron_jobs` · POST `…/{id}/run` · GET `…/{id}/runs` | `Admin` | Tareas programadas visibles y ejecutables (sección 9) |
| GET | `/admin/system/health` | `Admin` | Estado de BD, Redis, cola, proveedores externos, versión |
| GET | `/admin/system/feature-flags` · PUT | `Admin` | Banderas de funciones (p. ej. `checkout_enabled`, `ai_chat_enabled`) |

### 5.18 Administración de Operadores RD y Tienda

Pestañas `operadores` y `reservas-directas` del panel admin (`AdminOperadores`, `AdminReservasDirectas`).

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/admin/orgs?verification=&q=` | `Admin` | Organizaciones y estado |
| GET | `/admin/orgs/{id}` | `Admin` | Detalle: documentos, anuncios, reservas, comisiones acumuladas, equipo |
| POST | `/admin/orgs/{id}/verify` · `/reject` · `/suspend` | `Admin` | Reemplaza `admin_toggle_operator_verified(p_operator_id, p_type, p_verified)`; `reject` requiere motivo; dispara correo |
| PATCH | `/admin/orgs/{id}` | `Admin` | Ajusta `commission_rate`, `website_enabled`, datos |
| GET | `/admin/listings?status=&org_id=&category=` | `Admin` | Todos los anuncios |
| PATCH/DELETE | `/admin/listings/{id}` | `Admin` | Pausar/retirar/eliminar por incumplimiento |
| GET | `/admin/bookings?org_id=&from=&to=&source=` | `Admin` | Reservas directas de todos los operadores |
| GET | `/admin/commissions?from=&to=&org_id=` | `Admin` | Ventas cobradas web, comisión devengada, pendiente de liquidar |
| GET/POST | `/admin/payouts` · POST `/admin/payouts/{id}/mark-paid` | `Admin` | Liquidaciones a operadores (lote semanal) |
| GET/PATCH | `/admin/store/products[/{id}]` · POST | `Admin` | Catálogo de la tienda (`store_products`): precio, stock, variantes, destacados, imágenes |
| GET/PATCH | `/admin/store/orders[/{id}]` | `Admin` | Pedidos y cambio de estado (`processing → shipped → delivered`), guía de envío, reembolsos |
| GET | `/admin/marketplace/vendors` · PATCH `/{id}` · `/admin/marketplace/orders` · `/admin/marketplace/payouts` | `Admin` | Vendedores, pedidos y `vendor_payments` |
| GET/PATCH | `/admin/ambassadors[/{id}]` · `/admin/ambassadors/payouts` | `Admin` | Aprobación de embajadores y pagos de comisiones |
| GET/PATCH | `/admin/establishment-registrations[/{id}]` | `Admin` | Aprobar/rechazar altas; al aprobar crea `partner_profiles` y envía correo |

### 5.19 Sistema

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/health` · `/health/ready` | Público | Liveness / readiness (BD, Redis) |
| GET | `/version` | Público | Versión de la API y del esquema |
| GET | `/config` | Público | Configuración de arranque del cliente: idiomas, monedas, banderas de funciones, claves públicas (mapa, pasarela), tasa USD→DOP |
| GET | `/openapi.json` · `/docs` | Público (staging) / `Admin` (prod) | Contrato OpenAPI y documentación interactiva |
| POST | `/webhooks/cms` | Firma HMAC | Entrada del CMS headless (4.3): `entry.publish/unpublish/delete` → sincroniza, purga cache, reindexa |
| POST | `/webhooks/payments/{provider}` · `/webhooks/email/{provider}` · `/webhooks/whatsapp` · `/webhooks/instagram` | Firma del proveedor | Ver 5.8 y 5.13 |
| POST | `/internal/jobs/{name}` | Token de servicio | Disparo de tareas desde el planificador (sección 9) |


---

## 6. Modelo de datos

El catálogo completo (138 tablas, columnas, clasificación y consumidores) está en el **Apéndice A**. Esta sección fija los criterios de diseño y lo que **falta** respecto a los esquemas existentes.

### 6.1 Criterios

- **Motor:** PostgreSQL 15+. Se consolida `supabase/migrations` como historial oficial; `mysql/schema.sql` se usa sólo para completar columnas y se abandona.
- **Identificadores:** `uuid` (`gen_random_uuid()`); `slug` único con índice para contenido público; `created_at`, `updated_at` (trigger `update_updated_at_column`) en todas las tablas.
- **JSON:** `jsonb` para listas flexibles (`gallery`, `amenities`, `includes`, `extras`, `itinerary`, `seasons`, `blocked`…). Los campos que se **filtran** o se **suman** (habitaciones, temporadas, bloqueos, miembros de equipo) se normalizan en tablas (6.3) para poder aplicar restricciones e índices.
- **Búsqueda:** columna `search_tsv tsvector` (con `unaccent`, configuración `spanish`) + índice GIN por colección; `pg_trgm` para tolerancia a errores. Índices GiST sobre `geography(point)` en tablas con coordenadas.
- **Dinero:** `numeric(12,2)` + `currency char(3)`. Nunca `float`.
- **Fechas de calendario** (`check_in`, `date`) como `date`; instantes como `timestamptz` (UTC).
- **Integridad:** claves foráneas con `ON DELETE` explícito; `CHECK` para estados y rangos; restricción de exclusión (`btree_gist`) para impedir sobrerreserva de una habitación en noches solapadas.
- **Concurrencia:** columna `version` en contenido CMS; bloqueos de fila (`SELECT … FOR UPDATE`) al descontar cupo/stock.
- **RLS (Row Level Security):** se mantiene como *segunda barrera* aunque la API use un rol de servicio: lectura pública sólo de `published`; propietarios sobre sus filas; roles administrativos por `has_role`. Las políticas de las migraciones existentes se conservan y se revisan (hallazgo: hay 45 políticas `USING (true)` —aceptable sólo en lectura de contenido público— y 6 `WITH CHECK (true)` que dejan abierta la inserción, p. ej. en `analytics_events` y `ambassador_referrals`; deben acotarse).

### 6.2 Cambios transversales

1. **Gobierno CMS** (4.1) en todas las tablas de categoría CMS: `status`, `published_at`, `slug_history`, campos SEO, `created_by/updated_by`, `deleted_at`, `version`.
2. **Enum de roles:** `app_role` pasa de `('admin','moderator','user')` a `('admin','editor','moderator','partner','ambassador','user')`. Los roles de organización viven en `org_members`.
3. **Unificar `reservations`:** columnas del portal (`user_id`, `item_id`, `item_type`, `check_in`, `check_out`, `guests`, `total_price`, `currency`, `status`, `contact_*`, `notes`) + las de Operadores RD (`org_id`, `listing_id`, `room_id`, `time`, `guest_mix`, `extras`, `payment_status`, `amount_paid`, `promo_code`, `source`, `notified`, `review_pending`, `deposit_amount`, `commission_amount`, `commission_rate`, `payment_id`, `guest_token`). Se puede renombrar a `bookings` con una vista `reservations` de compatibilidad.
4. **Consolidar duplicados de esquema:** `blog_posts` vs `articles` (se conserva `articles`), `gamified_routes` vs `routes` (rutas turísticas vs. rutas de juego: se mantienen separadas pero con la misma tabla de paradas geográficas), `establecimientos` vs `establishment_registrations` (directorio oficial vs. solicitudes).

### 6.3 Tablas nuevas requeridas

| Tabla | Para qué | Sustituye a |
|---|---|---|
| `content_revisions` | Historial de versiones del CMS | — |
| `media_assets` | Biblioteca de medios | URLs externas sueltas |
| `refresh_tokens` / `sessions` / `password_resets` / `email_verifications` | Autenticación propia | Supabase Auth |
| `payments`, `payment_refunds`, `payouts`, `payout_items` | Pagos, reembolsos y liquidaciones | Cobro simulado |
| `org_members`, `org_invitations` | Equipo y roles de Operadores RD | `partner_profiles.team` (JSON) |
| `operator_rooms`, `room_rate_seasons`, `room_blocks`, `room_ical_links` | Habitaciones, temporadas, bloqueos y calendarios importados | `Listing.rooms[]` (JSON) |
| `operator_automations`, `email_templates`, `email_log`, `email_suppressions`, `push_subscriptions` | Automatizaciones y correo | `partner_profiles.automation` (JSON) |
| `org_verifications` | Documentos de verificación | — |
| `marketplace_products`, `marketplace_vendors` | Catálogo del marketplace | `data/marketplaceData.ts` |
| `trips`, `trip_items`, `trip_members`, `trip_votes`, `trip_diary_entries`, `traveler_spots`, `traveler_wishlist` | Mi viaje y reto Top 100 | `traveler_*` del mock |
| `contests` | Concursos/sorteos (campos de `sorteosData`) | `data/sorteosData.ts` |
| `mountains`, `recipes`, `airports`, `activities`, `creators`, `faqs`, `phrases`, `pages`, `navigation`, `platform_announcements`, `operator_features`, `transport_services`, `lidom_standings` | Colecciones CMS hoy embebidas en el código | `src/data/*.ts` |
| `ui_strings` | Diccionario de interfaz editable | `src/i18n/*` |
| `feature_flags` | Banderas de funciones | — |
| `api_clients` (opcional) | Claves de integración para partners B2B | — |

### 6.4 Esquema de Operadores RD ya definido

`supabase/migrations/20260924000000_operator_hub_and_store.sql` contiene `operator_listings`, `operator_messages`, `operator_promotions`, `operator_reviews`, `store_products`, `store_orders` y las extensiones de `reservations`/`partner_profiles`, con sus políticas RLS. Las etapas 1–8 posteriores (tarifas, depósito, extras, precios por persona, paquetes, iCal, automatizaciones, equipo) hoy guardan sus datos como JSON dentro de esas filas; **la migración de la Fase 2** las normaliza según 6.3.

---

## 7. Seguridad, roles y privacidad

### 7.1 Principios

1. **Cero confianza en el cliente:** precios, XP, disponibilidad, roles y estados los calcula/valida el servidor. Lo que envía el cliente es sólo intención.
2. **Mínimo privilegio:** cada endpoint declara roles permitidos; las consultas filtran por propietario u organización en el propio SQL (no sólo en el middleware).
3. **Defensa en profundidad:** validación de esquema (Zod/JSON Schema) → autorización → RLS → auditoría.
4. **Secretos** sólo en variables de entorno/gestor de secretos (JWT, pasarelas, IA, correo). Nunca valores por defecto (el prototipo usa `"secret"`).

### 7.2 Controles

| Área | Control |
|---|---|
| Contraseñas | argon2id, política ≥ 10 caracteres, verificación contra contraseñas filtradas |
| Sesión | JWT corto + refresh rotatorio, revocación al suspender, cierre de todas las sesiones al cambiar contraseña |
| 2FA | TOTP obligatorio para `admin`/`editor` y `Org:owner` (Fase 2) |
| Entrada | Validación estricta, *allow-list* de columnas ordenables/filtrables, límites de longitud (los `maxLength` del frontend se replican), sanitización de HTML enriquecido (lista blanca) |
| Subidas | Tipo por firma real, límite de tamaño, antivirus, renombrado, sin ejecución |
| Abuso | Límites de tasa (3.5), CAPTCHA (Turnstile) en registro, contacto, newsletter y reseñas anónimas; detección de duplicados; IP rules |
| Pagos | Sin datos de tarjeta en el backend; webhooks firmados; idempotencia; conciliación diaria |
| Privacidad | Cumplimiento **Ley 172-13**: consentimiento explícito, finalidad, acceso/rectificación/cancelación (`/me/export`, `DELETE /me`), retención definida, registro de tratamientos |
| Cabeceras | HSTS, CSP estricta (el `index.html` actual ya define una), `X-Content-Type-Options`, `Referrer-Policy` |
| Auditoría | `admin_activity_logs` inmutable (sólo `INSERT`), retención 24 meses |
| Copias | Backups diarios cifrados + PITR; prueba de restauración trimestral |
| Dependencias | Escaneo en CI (SCA), actualizaciones automáticas |

### 7.3 Matriz de roles

Roles globales: `visitor` (anónimo), `user`, `ambassador`, `partner`, `moderator`, `editor`, `admin`. Roles de organización (Operadores RD): `owner`, `admin`, `recepcion`, `guia`.

| Capacidad | visitor | user | partner | moderator | editor | admin | Org owner | Org admin | Org recepción | Org guía |
|---|---|---|---|---|---|---|---|---|---|---|
| Leer contenido publicado | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Ver borradores/revisiones | | | | | ✔ | ✔ | | | | |
| Crear/editar contenido CMS | | | | | ✔ | ✔ | | | | |
| Publicar contenido CMS | | | | | ✔ (según flujo) | ✔ | | | | |
| Reservar / comprar | ✔ (invitado) | ✔ | ✔ | ✔ | ✔ | ✔ | | | | |
| Reseñas, favoritos, gamificación | | ✔ | ✔ | ✔ | ✔ | ✔ | | | | |
| Moderar UGC | | | | ✔ | | ✔ | | | | |
| Gestionar usuarios / roles / suspensiones | | | | | | ✔ | | | | |
| Configuración del sistema, webhooks, cron | | | | | | ✔ | | | | |
| Verificar organizaciones | | | | | | ✔ | | | | |
| Ver auditoría | | | | | | ✔ | | | | |
| Equipo y perfil de la organización | | | | | | | ✔ | | | |
| Anuncios, tarifas, promociones, automatizaciones | | | | | | | ✔ | ✔ | | |
| Ingresos, reportes, liquidaciones | | | | | | | ✔ | ✔ (sin liquidaciones) | | |
| Reservas: ver | | | | | | | ✔ | ✔ | ✔ | sólo sus excursiones |
| Reservas: crear/cambiar estado/cobrar | | | | | | | ✔ | ✔ | ✔ | |
| Mensajes | | | | | | | ✔ | ✔ | ✔ | |
| Calendario | | | | | | | ✔ | ✔ | ✔ | sólo lectura, sus excursiones |

Permisos por entidad en `/admin/{entity}`: las tablas CMS admiten `editor`; las de gamificación, marketing y sistema sólo `admin`; las de moderación `moderator`; las transaccionales sólo consulta/corrección puntual (`admin`).

---

## 8. Eventos de dominio y webhooks

Cada servicio publica eventos en un bus interno (outbox transaccional + cola). Los consumidores (mailer, gamificación, analítica, búsqueda, webhooks salientes) se suscriben; así ningún módulo llama a otro directamente.

| Evento | Publicado por | Consumidores |
|---|---|---|
| `user.registered` / `user.verified` | auth | mailer (verificación, bienvenida), gamificación (bono), analítica, CRM |
| `user.suspended` · `user.deleted` | admin / me | auth (revocar), mailer, gamificación |
| `content.published` · `content.updated` · `content.unpublished` | CMS | cache/CDN, búsqueda, sitemap, cola de traducción, webhooks salientes |
| `review.created` · `review.approved` | social | moderación, gamificación (XP), mailer, agregados de rating |
| `booking.created` · `booking.confirmed` · `booking.cancelled` · `booking.completed` · `booking.balance_paid` | bookings | mailer, notificaciones, operador (bandeja), gamificación, comisiones, analítica |
| `payment.succeeded` · `payment.failed` · `payment.refunded` | payments | bookings/orders, mailer, contabilidad, embajadores (`track-sale`) |
| `order.created` · `order.paid` · `order.shipped` · `order.delivered` | store/marketplace | mailer, stock, embajadores |
| `org.verified` · `org.rejected` · `org.member_invited` | operators | mailer |
| `message.received` | webhooks WhatsApp/Instagram/web | bandeja del operador, notificaciones |
| `gamification.xp_granted` · `level_up` · `achievement_unlocked` · `prize_redeemed` | gamificación | notificaciones, mailer, ligas, analítica |
| `ugc.reported` · `ugc.removed` | social/admin | moderación, gamificación (retirar XP) |

**Webhooks salientes** (`system_webhooks`): el administrador registra URL + eventos; el envío incluye `X-Event`, `X-Delivery-Id`, `X-Signature: sha256=…` y cuerpo `{ id, type, created_at, data }`. Reintentos: 1 min, 5 min, 30 min, 2 h, 12 h (luego `failed`). Consulta de entregas en `/admin/system_webhooks/{id}/deliveries`.

---

## 9. Trabajos programados

Definidos en `system_cron_jobs` (visibles y ejecutables desde el panel, 5.17). Zona horaria `America/Santo_Domingo`.

| Trabajo | Frecuencia | Descripción |
|---|---|---|
| `fx.refresh` | 30 min | Tasas de cambio (BCRD y bancos) → `exchange_rates`; conserva histórico |
| `fuel.refresh` | Viernes 18:00 | Precios de combustibles (MICM) |
| `lottery.refresh` | Por sorteo | Resultados de lotería |
| `weather.refresh` · `weather.alerts` | 30 min · 10 min | Clima y alertas |
| `bookings.reminders` | Cada hora | Recordatorios 24 h (`booking.reminder_24h`) para reservas de mañana; una vez por reserva |
| `bookings.balance_due` | Diario 09:00 | Aviso de saldo pendiente a 3 días |
| `bookings.min_guests_check` | Diario | Salidas que no alcanzaron el mínimo: proponer cambio o reembolsar |
| `bookings.expire_pending` | Cada 15 min | Cancela reservas `pay_now` sin pago tras 30 min y libera cupo |
| `bookings.review_requests` | Cada hora | Solicitud de reseña a reservas completadas |
| `ical.sync` | Cada 15 min | Sincroniza calendarios externos vinculados |
| `payouts.generate` | Semanal (lunes) | Lote de liquidaciones a operadores (reservas `completed` y no liquidadas) |
| `promotions.expire` | Diario | Desactiva promociones vencidas |
| `offers.expire` | 5 min | Desactiva ofertas relámpago vencidas |
| `gamification.streaks` | Diario 00:05 | Reinicia rachas rotas |
| `gamification.season_rollover` | Fin de temporada | Cierra temporada, reparte premios, crea la siguiente |
| `gamification.leagues` | Semanal | Ascensos/descensos de liga |
| `orders.abandoned_cart` | 6 h | Recordatorio de carrito abandonado (con consentimiento) |
| `orders.auto_cancel` | Cada hora | Pedidos sin pago tras 24 h |
| `newsletter.send` | Programado por campaña | Envío por lotes con límite de tasa |
| `search.reindex` | Nocturno | Reindexado completo (además de incremental) |
| `sitemap.build` | Diario | `sitemap.xml` |
| `translations.queue` | Continuo | Cola de traducción automática |
| `analytics.rollup` | Diario | Agrega eventos por día; purga crudos > 13 meses |
| `media.cleanup` | Diario | Elimina subidas sin completar (> 24 h) |
| `email.retry` | 5 min | Reintenta correos fallidos |
| `gdpr.process` | Diario | Ejecuta eliminaciones vencidas y genera exportaciones |
| `backup.verify` | Semanal | Verifica último backup |

---

## 10. Integraciones externas

| Ámbito | Opción recomendada | Alternativas | Uso |
|---|---|---|---|
| Correo transaccional | Amazon SES / Resend | SendGrid, Postmark | 5.13 |
| WhatsApp | WhatsApp Business Cloud API (Meta) | Twilio | Recordatorios y bandeja de operadores |
| Pagos (RD) | **Azul (Banco Popular)** o **CardNET** para tarjetas locales | Stripe / PayPal (turistas), tokenización 3-DS | 5.8, 5.9 |
| Mapas y geocodificación | Mapbox / Google Maps | OpenStreetMap (Nominatim/Photon) | 5.4 |
| Clima | OpenWeather (+ ONAMET/INDOMET para alertas) | Tomorrow.io | 5.5 |
| Tasas de cambio | Banco Central RD (BCRD) + scraping de bancos | exchangerate.host | 5.5 |
| Combustibles / lotería | MICM / proveedores de resultados | Carga manual desde el admin | 5.5 |
| Vuelos (opcional) | AviationStack / FlightAware | — | 5.5 |
| IA | Claude / Gemini (las funciones actuales usan Gemini o el gateway `LOVABLE_API_KEY`) | — | 5.4, 5.17 |
| Traducción automática | IA generativa (misma que arriba) o DeepL | Google Translate | 5.15 |
| Almacenamiento / CDN | S3-compatible (Cloudflare R2 / AWS S3) + CDN | — | 5.16 |
| Búsqueda (crecimiento) | Meilisearch / Typesense | Elasticsearch | 5.4 |
| Antispam/CAPTCHA | Cloudflare Turnstile | hCaptcha | 7.2 |
| Errores y métricas | Sentry + Prometheus/Grafana | Datadog | Observabilidad |
| Push | Web Push (VAPID) / FCM | OneSignal | 5.13 |
| CMS headless (opcional) | Directus / Strapi / Payload | Contentful | 4.3 |

Cada integración se encapsula en un *adapter* con una interfaz común (`PaymentGateway`, `EmailProvider`, `WeatherProvider`…), *circuit breaker*, *timeout* y *fallback* (p. ej. si falla la tasa de cambio se sirve la última con `stale: true`).

---

## 11. Plan de migración y roadmap

### 11.1 Cómo se conecta el frontend sin reescribirlo

El frontend habla con una capa única: `src/integrations/supabase/client.ts` (hoy un mock que imita `from().select().eq()…`, `rpc()`, `functions.invoke()` y `auth`). La migración es **por adaptador**:

1. Crear `src/integrations/api/client.ts` con la misma forma pública que usa el código (`from(table)…`, `rpc(name, args)`, `functions.invoke(name, body)`, `auth.*`) pero traduciendo cada llamada al endpoint del Apéndice B y de la sección 5. Las llamadas `from(<tabla>)` de lectura pública se enrutan a `GET /{col}` con `filter[…]`.
2. Activar por **banderas** (`VITE_API_MODE=mock|hybrid|live`) y por módulo: cada módulo migrado pasa a `live` mientras los demás siguen en mock.
3. Reemplazar gradualmente los adaptadores por hooks tipados (`useBeaches`, `useBookingQuote`…) generados a partir de `openapi.json`, y eliminar `mockDb.json` cuando todas las secciones estén en `live`.
4. Los módulos nuevos (`modules/operadores`, `modules/tienda`, `modules/viajero`) ya centralizan su acceso en `api.ts` de cada módulo: es allí donde se cambia el origen de datos.

### 11.2 Fases

| Fase | Objetivo | Contenido | Criterio de salida |
|---|---|---|---|
| **0. Cimientos** (2 semanas) | Base técnica | Repositorio API, CI/CD, Docker, migraciones consolidadas a Postgres, semilla desde `mockDb.json`, autenticación propia, OpenAPI, observabilidad, `/health`, `/config` | Login/registro reales; `GET /provinces` y `GET /destinations` en producción de staging |
| **1. Portal público lectura** (4 semanas) | Contenido sirve desde la API | Sección 5.3 completa, `/home`, `/search`, `/site/*`, datos vivos (5.5), i18n (5.15), medios (5.16), cache/CDN, sitemap | El portal público funciona en modo `live` sin `mockDb.json` para lectura; SEO y rendimiento medidos |
| **2. CMS y administración** (4 semanas) | Contenido editable | Sección 5.17 (CMS genérico, flujo editorial, revisiones, importación), usuarios/roles, auditoría, moderación, banners, ajustes | Editores publican sin intervención técnica; se migran los `src/data/*.ts` prioritarios (Apéndice D) |
| **3. Usuario y comunidad** (3 semanas) | Interacción | 5.2, 5.6 (reseñas, RD Social, formularios, newsletter, soporte, encuestas), notificaciones, correo (5.13) con las plantillas críticas | Registro con verificación real, reseñas moderadas, correos entregados con SPF/DKIM |
| **4. Gamificación** (3 semanas) | Juego con reglas en servidor | 5.11 completa con antifraude, ligas, premios y envíos, embajadores; sustituir los 19 RPC | Cero XP calculado en el cliente; pruebas de abuso superadas |
| **5. Reservas y pagos** (5 semanas) | Dinero real | 5.8, pasarela (sandbox → producción), reservas del portal y reserva directa, cancelaciones, comisiones, conciliación | Pago end-to-end en sandbox; auditoría de seguridad; sin datos de tarjeta en el backend |
| **6. Operadores RD y Tienda** (5 semanas) | Plataforma de proveedores | 5.9, 5.10, 5.18: normalización de tarifas/habitaciones/equipo, iCal, automatizaciones, liquidaciones, tienda con stock | Un operador real vende y cobra; liquidación semanal ejecutada |
| **7. Endurecimiento** (2 semanas) | Producción | Pruebas de carga, pentest, backups/restauración, runbooks, 2FA, límites, monitoreo de costos de IA | Checklist de salida (11.4) completa |
| **8. Evolución** (continua) | Mejoras | Búsqueda dedicada, app móvil, OAuth social, vuelos, recomendaciones personalizadas, API pública B2B | — |

Las fases 3 y 4 pueden solaparse con la 2; la 5 depende de 0 y 3.

### 11.3 Pruebas y calidad

- **Contrato:** OpenAPI como fuente única; pruebas de contrato (Schemathesis/Dredd) en CI; el SDK del frontend se genera de ahí.
- **Unitarias / integración:** servicios de dominio con base de datos real en contenedor; casos críticos con pruebas propias: cotización de reservas (temporadas, fin de semana, mínimo de noches, bloqueos, depósito, extras, niños/bebés), comisiones, XP/antifraude, stock, idempotencia de pagos.
- **E2E:** Playwright sobre staging con los flujos: registro → reseña → XP; búsqueda → reserva → pago → correo; operador: alta → anuncio → reserva → cobro → liquidación; admin: publicar contenido → aparece en el portal.
- **Carga:** objetivo p95 < 300 ms en lecturas cacheadas y < 800 ms en escrituras; 500 req/s sostenidos en lectura pública.
- **Seguridad:** OWASP ASVS nivel 2, pentest externo antes de la Fase 5 en producción.

### 11.4 Checklist de salida a producción

- [ ] Migraciones aplicadas y reversibles; semilla revisada
- [ ] Secretos rotados y fuera del repositorio; sin valores por defecto
- [ ] Roles y RLS revisados tabla por tabla (Apéndice A)
- [ ] Rate limiting, CAPTCHA y WAF activos
- [ ] Correos con SPF/DKIM/DMARC y plantillas en 6 idiomas (las críticas)
- [ ] Pasarela en producción, conciliación diaria y webhooks probados
- [ ] Backups y restauración probados; RPO ≤ 15 min, RTO ≤ 2 h
- [ ] Monitoreo, alertas y *runbooks* de incidentes
- [ ] Política de privacidad y avisos (Ley 172-13); registro de consentimientos
- [ ] `mockDb.json` retirado del bundle del frontend

### 11.5 Riesgos y decisiones abiertas

| Tema | Riesgo / decisión | Propuesta |
|---|---|---|
| Pasarela de pago | Cobertura de tarjetas locales vs. internacionales; comisiones | Azul/CardNET para RD + Stripe/PayPal para turistas; decidir con Finanzas |
| CMS | ¿Integrado o headless? Afecta el flujo editorial | Empezar con el integrado (4.3-A); evaluar headless tras la Fase 2 |
| Liquidaciones a operadores | Método de dispersión (ACH local, transferencia) y régimen fiscal | Liquidación semanal con retención; validar con Legal/Finanzas |
| Verificación de operadores | Documentos requeridos y responsable de revisión | RNC + licencia MITUR; equipo de operaciones |
| Datos personales | Transferencias internacionales (proveedores en la nube) | Cláusulas contractuales y cifrado; región de nube |
| Costos de IA | Chat y traducciones automáticas pueden crecer rápido | Cuotas por usuario, cache de traducciones, modelos ligeros para lote |
| Contenido estático | 42 archivos con ~16 000 líneas por migrar | Cargarlos con un script de semilla y luego editarlos en el CMS |
| Moneda | El catálogo mezcla USD y DOP | Guardar moneda original; convertir con tasa vigente sólo para mostrar |

---

## Apéndice A — Catálogo de tablas

Generado a partir de `mysql/schema.sql`, `supabase/schema.sql` y `supabase/migrations/*` (138 tablas). **Cat.** = categoría de la sección 4: **CMS**, **Proveedor**, **Transaccional** o **Sistema**. *Origen* indica el archivo del que se tomaron las columnas (la definición más completa). Los tipos se muestran tal como aparecen en el SQL de origen; en la consolidación a PostgreSQL los `VARCHAR(36)` pasan a `uuid`, los `JSON` a `jsonb` y los `TEXT[]` a arreglos nativos.

### A.1 Resumen por dominio

| Dominio | Cat. | Tablas |
|---|---|---|
| Identidad y perfiles | Transaccional | `users`, `profiles`, `user_roles`, `user_suspensions`, `user_flags`, `favorites`, `notifications`, `explorer_follows`, `cart_items` |
| Destinos y territorio | CMS (editorial) | `provinces`, `municipalities`, `destinations`, `beaches`, `rivers`, `parks`, `protected_areas`, `caves`, `hot_springs`, `monuments`, `bird_species`, `offset_projects`, `toll_routes` |
| Alojamiento, gastronomía y servicios | CMS (editorial) | `hotels`, `airbnb_listings`, `restaurants`, `bars`, `spas_wellness`, `experiences`, `tour_packages`, `events`, `clinics`, `ports_marinas`, `stadiums`, `theme_parks`, `golf_courses`, `shopping_centers`, `souvenirs`, `artisanal_workshops`, `coffee_experiences`, `tour_guides`, `travel_agencies`, `tour_operators`, `establecimientos` |
| Historia, cultura y editorial | CMS (editorial) | `historical_figures`, `historical_events`, `articles`, `article_translations`, `blog_posts`, `routes`, `route_stops`, `audio_guides`, `job_vacancies`, `emergency_contacts` |
| Reservas y pagos | Transaccional | `reservations`, `event_tickets` |
| Marketplace y tienda | Transaccional | `marketplace_orders`, `marketplace_order_items`, `store_orders`, `vendor_payments` |
| Marketplace y tienda | CMS (editorial) | `store_products`, `discount_coupons` |
| Proveedores y Operadores RD | Proveedor | `partner_profiles`, `operator_listings`, `operator_promotions` |
| Proveedores y Operadores RD | Transaccional | `operator_messages`, `operator_reviews`, `establishment_registrations` |
| Gamificación | CMS (editorial) | `achievements`, `gamification_levels`, `gamification_missions`, `gamification_prizes`, `gamification_seasons`, `gamification_leagues`, `xp_milestones`, `trivia_questions`, `digital_collectibles`, `gamified_routes`, `route_checkpoints`, `photo_challenges`, `reward_inventory` |
| Gamificación | Transaccional | `user_gamification`, `user_achievements`, `user_missions`, `user_prize_redemptions`, `gamification_transactions`, `points_transactions`, `passport_stamps`, `user_route_progress`, `user_checkpoint_completions`, `user_collectibles`, `trivia_sessions`, `photo_submissions`, `photo_votes`, `user_league_stats`, `explorer_guilds`, `guild_members`, `province_visits`, `user_xp_milestones`, `referral_codes`, `referral_uses`, `reward_shipments` |
| Embajadores y marketing | Transaccional | `ambassadors`, `ambassador_referrals`, `ambassador_payouts`, `marketing_leads`, `newsletter_subscribers`, `contest_registrations`, `vacation_registrations` |
| Embajadores y marketing | CMS (editorial) | `offers`, `ad_banners`, `marketing_campaigns` |
| Comunidad y UGC | Transaccional | `reviews`, `social_posts`, `social_likes`, `social_comments`, `post_comments`, `post_likes`, `ugc_media`, `ugc_reports`, `survey_responses`, `support_tickets`, `support_messages` |
| Comunidad y UGC | CMS (editorial) | `survey_templates` |
| Datos vivos | Sistema / vivo | `exchange_rates`, `fuel_prices`, `lotteries`, `lottery_draws`, `lottery_results`, `weather_alerts`, `marine_reports` |
| Sistema y administración | Sistema / vivo | `analytics_events`, `admin_activity_logs`, `site_settings`, `entity_translations`, `seo_redirections`, `system_webhooks`, `system_cron_jobs`, `ip_rules` |

### A.2 Matriz de acceso por tabla

| Tabla | Dominio | Cat. | Origen | Lo consume hoy |
|---|---|---|---|---|
| `achievements` | Gamificación | CMS | supabase/schema.sql | GamificationStats, useAchievementChecker, Badges, ExplorerProfile (+4) |
| `ad_banners` | Embajadores y marketing | CMS | supabase/schema.sql | AdminDashboard, useAdBanners |
| `admin_activity_logs` | Sistema y administración | Sistema | supabase/schema.sql | panel admin genérico (`admin-entities`) |
| `airbnb_listings` | Alojamiento, gastronomía y servicios | CMS | mig. 20260127 | AccommodationsSection, AirbnbDetalle, Alojamientos |
| `ambassador_payouts` | Embajadores y marketing | Transaccional | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `ambassador_referrals` | Embajadores y marketing | Transaccional | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `ambassadors` | Embajadores y marketing | Transaccional | mysql/schema.sql | SistemaAfiliados |
| `analytics_events` | Sistema y administración | Sistema | mig. 20260308 | AdminAnalytics, CurrencyExchangeSection, FreeTicketModal, RegistroEventoModal (+4) |
| `article_translations` | Historia, cultura y editorial | CMS | mig. 20260307 | panel admin genérico (`admin-entities`) |
| `articles` | Historia, cultura y editorial | CMS | mig. 20260307 | AdminDashboard, RelatedBlogPosts |
| `artisanal_workshops` | Alojamiento, gastronomía y servicios | CMS | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `audio_guides` | Historia, cultura y editorial | CMS | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `bars` | Alojamiento, gastronomía y servicios | CMS | supabase/schema.sql | RestaurantsBarsSection, BarDetalle, DestinoDetalle, ProvinciaDetalle (+1) |
| `beaches` | Destinos y territorio | CMS | mysql/schema.sql | AdminDashboard, GlobalSearch, InteractiveMap, EstadoPlayas (+2) |
| `bird_species` | Destinos y territorio | CMS | mysql/schema.sql | AvistamientoAves |
| `blog_posts` | Historia, cultura y editorial | CMS | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `cart_items` | Identidad y perfiles | Transaccional | mig. 20260308 | useCart |
| `caves` | Destinos y territorio | CMS | mig. 20260127 | panel admin genérico (`admin-entities`) |
| `clinics` | Alojamiento, gastronomía y servicios | CMS | mig. 20260127 | panel admin genérico (`admin-entities`) |
| `coffee_experiences` | Alojamiento, gastronomía y servicios | CMS | mig. 20260127 | panel admin genérico (`admin-entities`) |
| `contest_registrations` | Embajadores y marketing | Transaccional | mig. 20260307 | SorteoLectorBanner, ViralSorteoModule |
| `destinations` | Destinos y territorio | CMS | mysql/schema.sql | AdminDashboard, AdminRouteBuilder, DestinationsSection, GlobalSearch (+2) |
| `digital_collectibles` | Gamificación | CMS | mysql/schema.sql | usePassport, SouvenirsDigitales |
| `discount_coupons` | Marketplace y tienda | CMS | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `emergency_contacts` | Historia, cultura y editorial | CMS | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `entity_translations` | Sistema y administración | Sistema | mysql/schema.sql | EntityFormDialog, EntityList |
| `establecimientos` | Alojamiento, gastronomía y servicios | CMS | mig. 20260308 | AdminAnalytics, Establecimientos |
| `establishment_registrations` | Proveedores y Operadores RD | Transaccional | mysql/schema.sql | RegistroEstablecimientoModal |
| `event_tickets` | Reservas y pagos | Transaccional | mysql/schema.sql | PartnerToolsModules |
| `events` | Alojamiento, gastronomía y servicios | CMS | mig. 20260127 | AdminDashboard, EventsSection, EventoDetalle, Eventos |
| `exchange_rates` | Datos vivos | Sistema | mysql/schema.sql | ConversorMoneda |
| `experiences` | Alojamiento, gastronomía y servicios | CMS | mig. 20260127 | ActividadDetalle, DestinoDetalle, Experiencias |
| `explorer_follows` | Identidad y perfiles | Transaccional | mysql/schema.sql | ExplorerProfile |
| `explorer_guilds` | Gamificación | Transaccional | mysql/schema.sql | GamificacionTuristica |
| `favorites` | Identidad y perfiles | Transaccional | mig. 20260126 | AdminAnalytics, useAchievementChecker, useFavorites |
| `fuel_prices` | Datos vivos | Sistema | mysql/schema.sql | PreciosCombustible |
| `gamification_leagues` | Gamificación | CMS | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `gamification_levels` | Gamificación | CMS | mig. 20260307 | useGamification, ExplorerProfile, GamificacionTuristica |
| `gamification_missions` | Gamificación | CMS | mig. 20260307 | GamificationStats, useActionTracker, useGamification |
| `gamification_prizes` | Gamificación | CMS | mysql/schema.sql | GamificationStats, useGamification |
| `gamification_seasons` | Gamificación | CMS | mysql/schema.sql | GamificationStats |
| `gamification_transactions` | Gamificación | Transaccional | mysql/schema.sql | AdminUsuarios, SocialFeed, ExplorerProfile, PerfilJugador |
| `gamified_routes` | Gamificación | CMS | mysql/schema.sql | GamificationStats, usePassport |
| `golf_courses` | Alojamiento, gastronomía y servicios | CMS | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `guild_members` | Gamificación | Transaccional | mysql/schema.sql | GamificacionTuristica |
| `historical_events` | Historia, cultura y editorial | CMS | mig. 20260307 | EventoHistorico, HistoriaRD |
| `historical_figures` | Historia, cultura y editorial | CMS | mig. 20260307 | HistoriaRD, PersonajeHistorico |
| `hot_springs` | Destinos y territorio | CMS | mysql/schema.sql | AguasTermales |
| `hotels` | Alojamiento, gastronomía y servicios | CMS | mysql/schema.sql | AccommodationsSection, AdminDashboard, GlobalSearch, InteractiveMap (+4) |
| `ip_rules` | Sistema y administración | Sistema | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `job_vacancies` | Historia, cultura y editorial | CMS | mig. 20260307 | Empleo, EmpleoDetalle |
| `lotteries` | Datos vivos | Sistema | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `lottery_draws` | Datos vivos | Sistema | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `lottery_results` | Datos vivos | Sistema | mig. 20260308 | Loteria |
| `marine_reports` | Datos vivos | Sistema | mysql/schema.sql | ReporteOlasViento |
| `marketing_campaigns` | Embajadores y marketing | CMS | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `marketing_leads` | Embajadores y marketing | Transaccional | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `marketplace_order_items` | Marketplace y tienda | Transaccional | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `marketplace_orders` | Marketplace y tienda | Transaccional | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `monuments` | Destinos y territorio | CMS | mig. 20260309 | ProvinceMonuments |
| `municipalities` | Destinos y territorio | CMS | mysql/schema.sql | DestinoDetalle |
| `newsletter_subscribers` | Embajadores y marketing | Transaccional | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `notifications` | Identidad y perfiles | Transaccional | mig. 20260308 | NotificationBell |
| `offers` | Embajadores y marketing | CMS | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `offset_projects` | Destinos y territorio | CMS | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `operator_listings` | Proveedores y Operadores RD | Proveedor | mig. 20260924 | AdminReservasDirectas |
| `operator_messages` | Proveedores y Operadores RD | Transaccional | mig. 20260924 | módulos operadores / tienda |
| `operator_promotions` | Proveedores y Operadores RD | Proveedor | mig. 20260924 | módulos operadores / tienda |
| `operator_reviews` | Proveedores y Operadores RD | Transaccional | mig. 20260924 | módulos operadores / tienda |
| `parks` | Destinos y territorio | CMS | mig. 20260309 | ProvinceParks |
| `partner_profiles` | Proveedores y Operadores RD | Proveedor | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `passport_stamps` | Gamificación | Transaccional | mysql/schema.sql | usePassport |
| `photo_challenges` | Gamificación | CMS | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `photo_submissions` | Gamificación | Transaccional | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `photo_votes` | Gamificación | Transaccional | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `points_transactions` | Gamificación | Transaccional | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `ports_marinas` | Alojamiento, gastronomía y servicios | CMS | mig. 20260127 | panel admin genérico (`admin-entities`) |
| `post_comments` | Comunidad y UGC | Transaccional | mysql/schema.sql | RDSocial |
| `post_likes` | Comunidad y UGC | Transaccional | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `profiles` | Identidad y perfiles | Transaccional | mysql/schema.sql | AdminAnalytics, AdminDashboard, GamificationStats, useGamification (+5) |
| `protected_areas` | Destinos y territorio | CMS | mysql/schema.sql | AreasProtegidas |
| `province_visits` | Gamificación | Transaccional | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `provinces` | Destinos y territorio | CMS | mysql/schema.sql | DestinoDetalle, ProvinciaDetalle, Provincias |
| `referral_codes` | Gamificación | Transaccional | mysql/schema.sql | useGamification |
| `referral_uses` | Gamificación | Transaccional | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `reservations` | Reservas y pagos | Transaccional | mig. 20260308 | AdminAnalytics, CheckoutModal, PartnerDashboard, Reservas |
| `restaurants` | Alojamiento, gastronomía y servicios | CMS | supabase/schema.sql | AdminDashboard, InteractiveMap, RestaurantsBarsSection, DestinoDetalle (+3) |
| `reviews` | Comunidad y UGC | Transaccional | mig. 20260126 | AdminAnalytics, AdminDashboard, useAchievementChecker, Opiniones (+1) |
| `reward_inventory` | Gamificación | CMS | mysql/schema.sql | AdminDashboard |
| `reward_shipments` | Gamificación | Transaccional | mysql/schema.sql | AdminStockConsole |
| `rivers` | Destinos y territorio | CMS | mig. 20260127 | panel admin genérico (`admin-entities`) |
| `route_checkpoints` | Gamificación | CMS | mysql/schema.sql | usePassport |
| `route_stops` | Historia, cultura y editorial | CMS | mysql/schema.sql | AdminRouteBuilder |
| `routes` | Historia, cultura y editorial | CMS | mysql/schema.sql | AdminRouteBuilder |
| `seo_redirections` | Sistema y administración | Sistema | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `shopping_centers` | Alojamiento, gastronomía y servicios | CMS | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `site_settings` | Sistema y administración | Sistema | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `social_comments` | Comunidad y UGC | Transaccional | mysql/schema.sql | FeedSocial |
| `social_likes` | Comunidad y UGC | Transaccional | mysql/schema.sql | FeedSocial |
| `social_posts` | Comunidad y UGC | Transaccional | mysql/schema.sql | AdminAnalytics, AdminDashboard, FeedSocial |
| `souvenirs` | Alojamiento, gastronomía y servicios | CMS | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `spas_wellness` | Alojamiento, gastronomía y servicios | CMS | mig. 20260304 | SpaDetalle, SpasWellness |
| `stadiums` | Alojamiento, gastronomía y servicios | CMS | mig. 20260127 | panel admin genérico (`admin-entities`) |
| `store_orders` | Marketplace y tienda | Transaccional | mig. 20260924 | módulos operadores / tienda |
| `store_products` | Marketplace y tienda | CMS | mig. 20260924 | módulos operadores / tienda |
| `support_messages` | Comunidad y UGC | Transaccional | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `support_tickets` | Comunidad y UGC | Transaccional | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `survey_responses` | Comunidad y UGC | Transaccional | supabase/schema.sql | AdminNpsAnalytics, SurveyModule |
| `survey_templates` | Comunidad y UGC | CMS | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `system_cron_jobs` | Sistema y administración | Sistema | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `system_webhooks` | Sistema y administración | Sistema | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `theme_parks` | Alojamiento, gastronomía y servicios | CMS | mig. 20260127 | panel admin genérico (`admin-entities`) |
| `toll_routes` | Destinos y territorio | CMS | mysql/schema.sql | CalculadoraPeajes |
| `tour_guides` | Alojamiento, gastronomía y servicios | CMS | mig. 20260127 | GuiasLocales |
| `tour_operators` | Alojamiento, gastronomía y servicios | CMS | mig. 20260127 | panel admin genérico (`admin-entities`) |
| `tour_packages` | Alojamiento, gastronomía y servicios | CMS | mig. 20260307 | TourDetalle, Tours |
| `travel_agencies` | Alojamiento, gastronomía y servicios | CMS | mig. 20260127 | panel admin genérico (`admin-entities`) |
| `trivia_questions` | Gamificación | CMS | mysql/schema.sql | TriviaTuristica |
| `trivia_sessions` | Gamificación | Transaccional | mysql/schema.sql | TriviaTuristica |
| `ugc_media` | Comunidad y UGC | Transaccional | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `ugc_reports` | Comunidad y UGC | Transaccional | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `user_achievements` | Gamificación | Transaccional | mysql/schema.sql | useAchievementChecker, Badges, ExplorerProfile, GamificacionTuristica (+2) |
| `user_checkpoint_completions` | Gamificación | Transaccional | mysql/schema.sql | usePassport |
| `user_collectibles` | Gamificación | Transaccional | mysql/schema.sql | usePassport, SouvenirsDigitales |
| `user_flags` | Identidad y perfiles | Transaccional | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `user_gamification` | Gamificación | Transaccional | mysql/schema.sql | PhotoChallenge, useAchievementChecker, useActionTracker, useGamification (+2) |
| `user_league_stats` | Gamificación | Transaccional | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `user_missions` | Gamificación | Transaccional | mig. 20260307 | useAchievementChecker, useActionTracker, useGamification |
| `user_prize_redemptions` | Gamificación | Transaccional | mysql/schema.sql | GamificationStats |
| `user_roles` | Identidad y perfiles | Transaccional | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `user_route_progress` | Gamificación | Transaccional | mysql/schema.sql | usePassport |
| `user_suspensions` | Identidad y perfiles | Transaccional | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `user_xp_milestones` | Gamificación | Transaccional | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `users` | Identidad y perfiles | Transaccional | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `vacation_registrations` | Embajadores y marketing | Transaccional | mig. 20260307 | VacacionesRD |
| `vendor_payments` | Marketplace y tienda | Transaccional | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `weather_alerts` | Datos vivos | Sistema | mysql/schema.sql | panel admin genérico (`admin-entities`) |
| `xp_milestones` | Gamificación | CMS | mysql/schema.sql | panel admin genérico (`admin-entities`) |

### A.3 Columnas por tabla

#### Identidad y perfiles

<details><summary><code>cart_items</code> — 8 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | requerido |
| `product_id` | TEXT | requerido |
| `product_name` | TEXT | requerido |
| `product_image` | TEXT |  |
| `price` | NUMERIC | requerido |
| `quantity` | INTEGER | requerido |
| `created_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>explorer_follows</code> — 4 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `follower_id` | VARCHAR(36) | requerido |
| `following_id` | VARCHAR(36) | requerido |
| `created_at` | TIMESTAMP |  |

</details>

<details><summary><code>favorites</code> — 8 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK, requerido |
| `user_id` | UUID | requerido |
| `item_id` | TEXT | requerido |
| `item_type` | TEXT | requerido |
| `item_name` | TEXT | requerido |
| `item_image` | TEXT |  |
| `item_location` | TEXT |  |
| `created_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>notifications</code> — 8 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | requerido |
| `title` | TEXT | requerido |
| `message` | TEXT |  |
| `type` | TEXT | requerido |
| `link` | TEXT |  |
| `is_read` | BOOLEAN | requerido |
| `created_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>profiles</code> — 10 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `display_name` | VARCHAR(255) |  |
| `avatar_url` | VARCHAR(512) |  |
| `bio` | TEXT |  |
| `role` | VARCHAR(50) |  |
| `is_suspended` | BOOLEAN |  |
| `suspension_reason` | TEXT |  |
| `travel_interests` | JSON |  |
| `created_at` | TIMESTAMP |  |
| `updated_at` | TIMESTAMP |  |

</details>

<details><summary><code>user_flags</code> — 6 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `user_id` | VARCHAR(36) | requerido |
| `flag_name` | VARCHAR(255) | requerido |
| `value` | TEXT |  |
| `updated_at` | TIMESTAMP |  |
| `created_at` | TIMESTAMP |  |

</details>

<details><summary><code>user_roles</code> — 4 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `user_id` | VARCHAR(36) | requerido |
| `role` | ENUM('admin','moderator','user') | requerido |
| `created_at` | TIMESTAMP |  |

</details>

<details><summary><code>user_suspensions</code> — 7 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `user_id` | VARCHAR(36) |  |
| `reason` | TEXT | requerido |
| `suspended_by` | VARCHAR(36) |  |
| `expires_at` | TIMESTAMP |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>users</code> — 5 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `email` | VARCHAR(255) | requerido |
| `password_hash` | VARCHAR(255) | requerido |
| `created_at` | TIMESTAMP |  |
| `updated_at` | TIMESTAMP |  |

</details>

#### Destinos y territorio

<details><summary><code>beaches</code> — 31 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `destination_id` | VARCHAR(36) |  |
| `province_id` | VARCHAR(36) |  |
| `name` | TEXT | requerido |
| `slug` | VARCHAR(255) |  |
| `beach_type` | TEXT |  |
| `description` | TEXT |  |
| `short_description` | TEXT |  |
| `image_url` | TEXT |  |
| `gallery` | JSON |  |
| `activities` | JSON |  |
| `amenities` | JSON |  |
| `water_color` | TEXT |  |
| `sand_type` | TEXT |  |
| `wave_intensity` | TEXT |  |
| `crowd_level` | TEXT |  |
| `access_type` | TEXT |  |
| `parking_available` | BOOLEAN |  |
| `lifeguard_on_duty` | BOOLEAN |  |
| `how_to_get_there` | TEXT |  |
| `best_time_to_visit` | TEXT |  |
| `address` | TEXT |  |
| `latitude` | DECIMAL(10,8) |  |
| `longitude` | DECIMAL(11,8) |  |
| `rating` | DECIMAL(3,2) |  |
| `review_count` | INT |  |
| `is_popular` | BOOLEAN |  |
| `is_featured` | BOOLEAN |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP | requerido |
| `updated_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>bird_species</code> — 10 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `name` | VARCHAR(255) | requerido |
| `scientific_name` | VARCHAR(255) | requerido |
| `status` | ENUM('Endémica','Residente','Migratoria') | requerido |
| `conservation` | ENUM('PreocupaciónMenor','Vulnerable','EnPeligroCrítico') | requerido |
| `description` | TEXT | requerido |
| `best_locations` | JSON | requerido |
| `avatar` | VARCHAR(50) | requerido |
| `created_at` | TIMESTAMP |  |
| `updated_at` | TIMESTAMP |  |

</details>

<details><summary><code>caves</code> — 28 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK, requerido |
| `name` | TEXT | requerido |
| `slug` | TEXT |  |
| `description` | TEXT |  |
| `short_description` | TEXT |  |
| `image_url` | TEXT |  |
| `gallery` | TEXT[] |  |
| `address` | TEXT |  |
| `destination_id` | UUID | → destinations |
| `latitude` | NUMERIC |  |
| `longitude` | NUMERIC |  |
| `cave_type` | TEXT |  |
| `tour_duration` | TEXT |  |
| `price_adult` | NUMERIC |  |
| `price_child` | NUMERIC |  |
| `opening_hours` | TEXT |  |
| `highlights` | TEXT[] |  |
| `flora_fauna` | TEXT[] |  |
| `historical_info` | TEXT |  |
| `phone` | TEXT |  |
| `email` | TEXT |  |
| `website` | TEXT |  |
| `rating` | NUMERIC |  |
| `review_count` | INTEGER |  |
| `is_featured` | BOOLEAN |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP | requerido |
| `updated_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>destinations</code> — 17 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `name` | VARCHAR(255) | requerido |
| `slug` | VARCHAR(255) | requerido |
| `province_id` | VARCHAR(36) |  |
| `description` | TEXT |  |
| `short_description` | TEXT |  |
| `image_url` | VARCHAR(512) |  |
| `gallery` | JSON |  |
| `highlights` | JSON |  |
| `typical_dishes` | JSON |  |
| `latitude` | DECIMAL(10,8) |  |
| `longitude` | DECIMAL(11,8) |  |
| `weather_info` | TEXT |  |
| `best_time_to_visit` | VARCHAR(255) |  |
| `how_to_get_there` | TEXT |  |
| `created_at` | TIMESTAMP |  |
| `updated_at` | TIMESTAMP |  |

</details>

<details><summary><code>hot_springs</code> — 12 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `name` | VARCHAR(255) | requerido |
| `location` | VARCHAR(255) | requerido |
| `province` | VARCHAR(255) | requerido |
| `temp_celsius` | DECIMAL(4,1) | requerido |
| `properties` | JSON | requerido |
| `description` | TEXT | requerido |
| `access` | ENUM('Fácil','Moderado','Aventura(Difícil) | requerido |
| `price` | VARCHAR(255) | requerido |
| `avatar` | VARCHAR(50) | requerido |
| `created_at` | TIMESTAMP |  |
| `updated_at` | TIMESTAMP |  |

</details>

<details><summary><code>monuments</code> — 27 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `name` | TEXT | requerido |
| `slug` | TEXT |  |
| `monument_type` | TEXT |  |
| `description` | TEXT |  |
| `short_description` | TEXT |  |
| `historical_period` | TEXT |  |
| `year_built` | TEXT |  |
| `architect` | TEXT |  |
| `address` | TEXT |  |
| `province_id` | UUID | → provinces |
| `destination_id` | UUID | → destinations |
| `latitude` | NUMERIC |  |
| `longitude` | NUMERIC |  |
| `image_url` | TEXT |  |
| `gallery` | TEXT[] |  |
| `opening_hours` | TEXT |  |
| `entry_fee` | TEXT |  |
| `phone` | TEXT |  |
| `website` | TEXT |  |
| `rating` | NUMERIC |  |
| `review_count` | INTEGER |  |
| `is_featured` | BOOLEAN |  |
| `is_active` | BOOLEAN |  |
| `highlights` | TEXT[] |  |
| `created_at` | TIMESTAMPTZ |  |
| `updated_at` | TIMESTAMPTZ |  |

</details>

<details><summary><code>municipalities</code> — 16 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `name` | VARCHAR(255) | requerido |
| `slug` | VARCHAR(255) | requerido |
| `province_id` | VARCHAR(36) | requerido |
| `municipality_type` | VARCHAR(100) |  |
| `description` | TEXT |  |
| `short_description` | TEXT |  |
| `image_url` | VARCHAR(512) |  |
| `gallery` | JSON |  |
| `highlights` | JSON |  |
| `population` | INT |  |
| `area_km2` | DECIMAL(10,2) |  |
| `is_tourist_destination` | BOOLEAN |  |
| `latitude` | DECIMAL(10,8) |  |
| `longitude` | DECIMAL(11,8) |  |
| `created_at` | TIMESTAMP |  |

</details>

<details><summary><code>offset_projects</code> — 8 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `title` | VARCHAR(255) | requerido |
| `location` | VARCHAR(255) | requerido |
| `category` | VARCHAR(255) | requerido |
| `description` | TEXT | requerido |
| `cost_info` | VARCHAR(255) | requerido |
| `created_at` | TIMESTAMP |  |
| `updated_at` | TIMESTAMP |  |

</details>

<details><summary><code>parks</code> — 30 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `name` | TEXT | requerido |
| `slug` | TEXT |  |
| `park_type` | TEXT |  |
| `description` | TEXT |  |
| `short_description` | TEXT |  |
| `area_km2` | NUMERIC |  |
| `established_year` | INTEGER |  |
| `ecosystems` | TEXT[] |  |
| `flora_fauna` | TEXT[] |  |
| `activities` | TEXT[] |  |
| `trails` | TEXT[] |  |
| `address` | TEXT |  |
| `province_id` | UUID | → provinces |
| `destination_id` | UUID | → destinations |
| `latitude` | NUMERIC |  |
| `longitude` | NUMERIC |  |
| `image_url` | TEXT |  |
| `gallery` | TEXT[] |  |
| `opening_hours` | TEXT |  |
| `entry_fee` | TEXT |  |
| `phone` | TEXT |  |
| `website` | TEXT |  |
| `rating` | NUMERIC |  |
| `review_count` | INTEGER |  |
| `is_featured` | BOOLEAN |  |
| `is_active` | BOOLEAN |  |
| `highlights` | TEXT[] |  |
| `created_at` | TIMESTAMPTZ |  |
| `updated_at` | TIMESTAMPTZ |  |

</details>

<details><summary><code>protected_areas</code> — 13 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `name` | VARCHAR(255) | requerido |
| `slug` | VARCHAR(255) |  |
| `category` | ENUM('ParqueNacional','Santuario','ReservaCientífica') | requerido |
| `location` | VARCHAR(255) | requerido |
| `size` | VARCHAR(100) | requerido |
| `fee` | VARCHAR(255) | requerido |
| `hours` | VARCHAR(100) | requerido |
| `attractions` | JSON | requerido |
| `rules` | JSON | requerido |
| `description` | TEXT | requerido |
| `created_at` | TIMESTAMP |  |
| `updated_at` | TIMESTAMP |  |

</details>

<details><summary><code>provinces</code> — 7 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `name` | VARCHAR(255) | requerido |
| `region` | VARCHAR(100) |  |
| `description` | TEXT |  |
| `image_url` | VARCHAR(512) |  |
| `created_at` | TIMESTAMP |  |
| `updated_at` | TIMESTAMP |  |

</details>

<details><summary><code>rivers</code> — 24 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK, requerido |
| `name` | TEXT | requerido |
| `slug` | TEXT |  |
| `description` | TEXT |  |
| `short_description` | TEXT |  |
| `image_url` | TEXT |  |
| `gallery` | TEXT[] |  |
| `address` | TEXT |  |
| `destination_id` | UUID | → destinations |
| `latitude` | NUMERIC |  |
| `longitude` | NUMERIC |  |
| `difficulty` | TEXT |  |
| `activities` | TEXT[] |  |
| `best_season` | TEXT |  |
| `duration` | TEXT |  |
| `price_range` | TEXT |  |
| `safety_tips` | TEXT[] |  |
| `certified_guides` | BOOLEAN |  |
| `rating` | NUMERIC |  |
| `review_count` | INTEGER |  |
| `is_featured` | BOOLEAN |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP | requerido |
| `updated_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>toll_routes</code> — 6 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `name` | VARCHAR(255) | requerido |
| `description` | TEXT | requerido |
| `tolls_data` | JSON | requerido |
| `created_at` | TIMESTAMP |  |
| `updated_at` | TIMESTAMP |  |

</details>

#### Alojamiento, gastronomía y servicios

<details><summary><code>airbnb_listings</code> — 50 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK, requerido |
| `name` | TEXT | requerido |
| `slug` | TEXT |  |
| `description` | TEXT |  |
| `short_description` | TEXT |  |
| `property_type` | TEXT |  |
| `gallery` | TEXT[] |  |
| `address` | TEXT |  |
| `destination_id` | UUID | → destinations |
| `host_name` | TEXT |  |
| `host_image` | TEXT |  |
| `host_since` | DATE |  |
| `is_superhost` | BOOLEAN |  |
| `host_response_rate` | INTEGER |  |
| `host_response_time` | TEXT |  |
| `host_languages` | TEXT[] |  |
| `host_description` | TEXT |  |
| `guests` | INTEGER |  |
| `bedrooms` | INTEGER |  |
| `beds` | INTEGER |  |
| `bathrooms` | NUMERIC |  |
| `price_per_night` | NUMERIC |  |
| `cleaning_fee` | NUMERIC |  |
| `service_fee` | NUMERIC |  |
| `price_range` | TEXT |  |
| `amenities` | TEXT[] |  |
| `house_rules` | TEXT[] |  |
| `safety_features` | TEXT[] |  |
| `check_in_time` | TEXT |  |
| `check_out_time` | TEXT |  |
| `cancellation_policy` | TEXT |  |
| `strict` | cancellation_details |  |
| `min_nights` | INTEGER |  |
| `max_nights` | INTEGER |  |
| `latitude` | NUMERIC |  |
| `longitude` | NUMERIC |  |
| `neighborhood_description` | TEXT |  |
| `rating` | NUMERIC |  |
| `review_count` | INTEGER |  |
| `cleanliness_rating` | NUMERIC |  |
| `accuracy_rating` | NUMERIC |  |
| `checkin_rating` | NUMERIC |  |
| `communication_rating` | NUMERIC |  |
| `location_rating` | NUMERIC |  |
| `value_rating` | NUMERIC |  |
| `is_featured` | BOOLEAN |  |
| `is_active` | BOOLEAN |  |
| `instant_book` | BOOLEAN |  |
| `created_at` | TIMESTAMP | requerido |
| `updated_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>artisanal_workshops</code> — 29 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `name` | TEXT | requerido |
| `slug` | TEXT | requerido |
| `destination_id` | VARCHAR(36) |  |
| `workshop_type` | TEXT |  |
| `description` | TEXT |  |
| `short_description` | TEXT |  |
| `image_url` | TEXT |  |
| `gallery` | JSON |  |
| `address` | TEXT |  |
| `phone` | TEXT |  |
| `email` | TEXT |  |
| `website` | TEXT |  |
| `craft_types` | JSON |  |
| `duration` | TEXT |  |
| `price_range` | TEXT |  |
| `includes` | JSON |  |
| `skill_level` | TEXT |  |
| `languages` | JSON |  |
| `max_participants` | INT |  |
| `opening_hours` | TEXT |  |
| `latitude` | DECIMAL(10,8) |  |
| `longitude` | DECIMAL(11,8) |  |
| `rating` | DECIMAL(3,2) |  |
| `review_count` | INT |  |
| `is_featured` | BOOLEAN |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP | requerido |
| `updated_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>bars</code> — 29 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `name` | TEXT | requerido |
| `slug` | TEXT | requerido |
| `destination_id` | UUID | → destinations |
| `bar_type` | TEXT |  |
| `ambiance` | TEXT |  |
| `music_style` | TEXT |  |
| `description` | TEXT |  |
| `short_description` | TEXT |  |
| `image_url` | TEXT |  |
| `gallery` | TEXT[] |  |
| `address` | TEXT |  |
| `phone` | TEXT |  |
| `email` | TEXT |  |
| `website` | TEXT |  |
| `price_range` | TEXT |  |
| `opening_hours` | TEXT |  |
| `dress_code` | TEXT |  |
| `minimum_age` | INTEGER |  |
| `services` | TEXT[] |  |
| `latitude` | NUMERIC(10,8) |  |
| `longitude` | NUMERIC(11,8) |  |
| `rating` | NUMERIC(3,2) |  |
| `review_count` | INTEGER |  |
| `is_featured` | BOOLEAN |  |
| `is_sponsored` | BOOLEAN |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP | requerido |
| `updated_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>clinics</code> — 29 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `name` | TEXT | requerido |
| `slug` | TEXT |  |
| `destination_id` | UUID | → destinations |
| `clinic_type` | TEXT |  |
| `specialties` | TEXT[] |  |
| `description` | TEXT |  |
| `short_description` | TEXT |  |
| `image_url` | TEXT |  |
| `gallery` | TEXT[] |  |
| `address` | TEXT |  |
| `phone` | TEXT |  |
| `emergency_phone` | TEXT |  |
| `email` | TEXT |  |
| `website` | TEXT |  |
| `opening_hours` | TEXT |  |
| `services` | TEXT[] |  |
| `certifications` | TEXT[] |  |
| `insurance_accepted` | TEXT[] |  |
| `languages` | TEXT[] |  |
| `latitude` | DECIMAL(10,8) |  |
| `longitude` | DECIMAL(11,8) |  |
| `rating` | DECIMAL(2,1) |  |
| `review_count` | INTEGER |  |
| `is_24_hours` | BOOLEAN |  |
| `is_featured` | BOOLEAN |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP | requerido |
| `updated_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>coffee_experiences</code> — 28 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK, requerido |
| `name` | TEXT | requerido |
| `slug` | TEXT |  |
| `description` | TEXT |  |
| `short_description` | TEXT |  |
| `image_url` | TEXT |  |
| `gallery` | TEXT[] |  |
| `address` | TEXT |  |
| `destination_id` | UUID | → destinations |
| `latitude` | NUMERIC |  |
| `longitude` | NUMERIC |  |
| `experience_type` | TEXT |  |
| `altitude` | TEXT |  |
| `tour_duration` | TEXT |  |
| `price_range` | TEXT |  |
| `includes` | TEXT[] |  |
| `tasting_notes` | TEXT |  |
| `production_process` | TEXT |  |
| `phone` | TEXT |  |
| `email` | TEXT |  |
| `website` | TEXT |  |
| `opening_hours` | TEXT |  |
| `rating` | NUMERIC |  |
| `review_count` | INTEGER |  |
| `is_featured` | BOOLEAN |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP | requerido |
| `updated_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>establecimientos</code> — 17 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK, requerido |
| `subsector` | text | requerido |
| `actividad` | text |  |
| `rut` | text |  |
| `numero_identificacion` | text |  |
| `nombre` | text | requerido |
| `sector_zona` | text |  |
| `provincia` | text |  |
| `estatus_proceso` | text |  |
| `estatus_licencia` | text |  |
| `estatus_establecimiento` | text |  |
| `fecha_vencimiento` | date |  |
| `telefono` | text |  |
| `correo` | text |  |
| `is_active` | boolean |  |
| `created_at` | timestamp | requerido |
| `updated_at` | timestamp | requerido |

</details>

<details><summary><code>events</code> — 24 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `name` | TEXT | requerido |
| `slug` | TEXT |  |
| `destination_id` | UUID | → destinations |
| `event_type` | TEXT |  |
| `description` | TEXT |  |
| `short_description` | TEXT |  |
| `image_url` | TEXT |  |
| `gallery` | TEXT[] |  |
| `start_date` | DATE |  |
| `end_date` | DATE |  |
| `start_time` | TIME |  |
| `end_time` | TIME |  |
| `venue` | TEXT |  |
| `address` | TEXT |  |
| `price_range` | TEXT |  |
| `ticket_url` | TEXT |  |
| `organizer` | TEXT |  |
| `is_recurring` | BOOLEAN |  |
| `recurrence_pattern` | TEXT |  |
| `is_featured` | BOOLEAN |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP | requerido |
| `updated_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>experiences</code> — 23 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `name` | TEXT | requerido |
| `slug` | TEXT |  |
| `destination_id` | UUID | → destinations |
| `category` | TEXT |  |
| `experience_type` | TEXT |  |
| `description` | TEXT |  |
| `short_description` | TEXT |  |
| `image_url` | TEXT |  |
| `gallery` | TEXT[] |  |
| `duration` | TEXT |  |
| `difficulty` | TEXT |  |
| `price_range` | TEXT |  |
| `best_season` | TEXT |  |
| `included` | TEXT[] |  |
| `requirements` | TEXT[] |  |
| `highlights` | TEXT[] |  |
| `rating` | DECIMAL(2,1) |  |
| `review_count` | INTEGER |  |
| `is_featured` | BOOLEAN |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP | requerido |
| `updated_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>golf_courses</code> — 10 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `name` | VARCHAR(255) | requerido |
| `slug` | VARCHAR(255) | requerido |
| `destination_id` | VARCHAR(36) |  |
| `holes` | INT | requerido |
| `par` | INT | requerido |
| `designer` | VARCHAR(255) |  |
| `description` | TEXT |  |
| `image_url` | VARCHAR(512) |  |
| `created_at` | TIMESTAMP |  |

</details>

<details><summary><code>hotels</code> — 24 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `name` | VARCHAR(255) | requerido |
| `slug` | VARCHAR(255) | requerido |
| `destination_id` | VARCHAR(36) |  |
| `category` | VARCHAR(100) |  |
| `stars` | INT |  |
| `description` | TEXT |  |
| `short_description` | TEXT |  |
| `image_url` | VARCHAR(512) |  |
| `gallery` | JSON |  |
| `address` | VARCHAR(512) |  |
| `phone` | VARCHAR(50) |  |
| `email` | VARCHAR(255) |  |
| `website` | VARCHAR(255) |  |
| `price_range` | VARCHAR(100) |  |
| `amenities` | JSON |  |
| `latitude` | DECIMAL(10,8) |  |
| `longitude` | DECIMAL(11,8) |  |
| `rating` | DECIMAL(3,2) |  |
| `is_featured` | BOOLEAN |  |
| `is_sponsored` | BOOLEAN |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP |  |
| `updated_at` | TIMESTAMP |  |

</details>

<details><summary><code>ports_marinas</code> — 25 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `name` | TEXT | requerido |
| `slug` | TEXT |  |
| `destination_id` | UUID | → destinations |
| `port_type` | TEXT |  |
| `description` | TEXT |  |
| `short_description` | TEXT |  |
| `image_url` | TEXT |  |
| `gallery` | TEXT[] |  |
| `address` | TEXT |  |
| `phone` | TEXT |  |
| `email` | TEXT |  |
| `website` | TEXT |  |
| `cruise_lines` | TEXT[] |  |
| `facilities` | TEXT[] |  |
| `services` | TEXT[] |  |
| `capacity` | INTEGER |  |
| `latitude` | DECIMAL(10,8) |  |
| `longitude` | DECIMAL(11,8) |  |
| `rating` | DECIMAL(2,1) |  |
| `review_count` | INTEGER |  |
| `is_featured` | BOOLEAN |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP | requerido |
| `updated_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>restaurants</code> — 26 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `name` | TEXT | requerido |
| `slug` | TEXT | requerido |
| `destination_id` | UUID | → destinations |
| `category` | TEXT |  |
| `cuisine_type` | TEXT[] |  |
| `description` | TEXT |  |
| `short_description` | TEXT |  |
| `image_url` | TEXT |  |
| `gallery` | TEXT[] |  |
| `address` | TEXT |  |
| `phone` | TEXT |  |
| `email` | TEXT |  |
| `website` | TEXT |  |
| `price_range` | TEXT |  |
| `opening_hours` | TEXT |  |
| `services` | TEXT[] |  |
| `signature_dishes` | TEXT[] |  |
| `latitude` | NUMERIC(10,8) |  |
| `longitude` | NUMERIC(11,8) |  |
| `rating` | NUMERIC(3,2) |  |
| `is_featured` | BOOLEAN |  |
| `is_sponsored` | BOOLEAN |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP | requerido |
| `updated_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>shopping_centers</code> — 10 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `name` | VARCHAR(255) | requerido |
| `slug` | VARCHAR(255) | requerido |
| `destination_id` | VARCHAR(36) |  |
| `address` | VARCHAR(512) |  |
| `phone` | VARCHAR(50) |  |
| `website` | VARCHAR(255) |  |
| `image_url` | VARCHAR(512) |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP |  |

</details>

<details><summary><code>souvenirs</code> — 6 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `name` | VARCHAR(255) | requerido |
| `description` | TEXT |  |
| `typical_price` | VARCHAR(100) |  |
| `image_url` | VARCHAR(512) |  |
| `created_at` | TIMESTAMP |  |

</details>

<details><summary><code>spas_wellness</code> — 25 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK, requerido |
| `destination_id` | uuid | → destinations |
| `name` | text | requerido |
| `slug` | text |  |
| `spa_type` | text |  |
| `short_description` | text |  |
| `image_url` | text |  |
| `gallery` | text[] |  |
| `services` | text[] |  |
| `treatments` | text[] |  |
| `amenities` | text[] |  |
| `address` | text |  |
| `phone` | text |  |
| `email` | text |  |
| `website` | text |  |
| `opening_hours` | text |  |
| `price_range` | text |  |
| `latitude` | numeric |  |
| `longitude` | numeric |  |
| `rating` | numeric |  |
| `review_count` | integer |  |
| `is_featured` | boolean |  |
| `is_active` | boolean |  |
| `created_at` | timestamptz | requerido |
| `updated_at` | timestamptz | requerido |

</details>

<details><summary><code>stadiums</code> — 26 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `name` | TEXT | requerido |
| `slug` | TEXT |  |
| `destination_id` | UUID | → destinations |
| `stadium_type` | TEXT |  |
| `sport_types` | TEXT[] |  |
| `description` | TEXT |  |
| `short_description` | TEXT |  |
| `image_url` | TEXT |  |
| `gallery` | TEXT[] |  |
| `address` | TEXT |  |
| `phone` | TEXT |  |
| `email` | TEXT |  |
| `website` | TEXT |  |
| `capacity` | INTEGER |  |
| `home_teams` | TEXT[] |  |
| `facilities` | TEXT[] |  |
| `services` | TEXT[] |  |
| `latitude` | DECIMAL(10,8) |  |
| `longitude` | DECIMAL(11,8) |  |
| `rating` | DECIMAL(2,1) |  |
| `review_count` | INTEGER |  |
| `is_featured` | BOOLEAN |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP | requerido |
| `updated_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>theme_parks</code> — 31 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `name` | TEXT | requerido |
| `slug` | TEXT |  |
| `destination_id` | UUID | → destinations |
| `park_type` | TEXT |  |
| `parque` | tem |  |
| `parque` | de |  |
| `short_description` | TEXT |  |
| `image_url` | TEXT |  |
| `gallery` | TEXT[] |  |
| `address` | TEXT |  |
| `phone` | TEXT |  |
| `email` | TEXT |  |
| `website` | TEXT |  |
| `price_adult` | DECIMAL(10,2) |  |
| `price_child` | DECIMAL(10,2) |  |
| `price_range` | TEXT |  |
| `opening_hours` | TEXT |  |
| `attractions` | TEXT[] |  |
| `services` | TEXT[] |  |
| `includes` | TEXT[] |  |
| `age_restrictions` | TEXT |  |
| `duration_recommended` | TEXT |  |
| `latitude` | DECIMAL(10,8) |  |
| `longitude` | DECIMAL(11,8) |  |
| `rating` | DECIMAL(2,1) |  |
| `review_count` | INTEGER |  |
| `is_featured` | BOOLEAN |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP | requerido |
| `updated_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>tour_guides</code> — 20 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `name` | TEXT | requerido |
| `slug` | TEXT |  |
| `destination_id` | UUID | → destinations |
| `specialties` | TEXT[] |  |
| `languages` | TEXT[] |  |
| `description` | TEXT |  |
| `image_url` | TEXT |  |
| `phone` | TEXT |  |
| `email` | TEXT |  |
| `website` | TEXT |  |
| `years_experience` | INTEGER |  |
| `certifications` | TEXT[] |  |
| `price_range` | TEXT |  |
| `rating` | DECIMAL(2,1) |  |
| `review_count` | INTEGER |  |
| `is_certified` | BOOLEAN |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP | requerido |
| `updated_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>tour_operators</code> — 23 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `name` | TEXT | requerido |
| `slug` | TEXT |  |
| `destination_id` | UUID | → destinations |
| `operator_type` | TEXT |  |
| `description` | TEXT |  |
| `short_description` | TEXT |  |
| `image_url` | TEXT |  |
| `logo_url` | TEXT |  |
| `address` | TEXT |  |
| `phone` | TEXT |  |
| `email` | TEXT |  |
| `website` | TEXT |  |
| `services` | TEXT[] |  |
| `tour_types` | TEXT[] |  |
| `languages` | TEXT[] |  |
| `certifications` | TEXT[] |  |
| `rating` | DECIMAL(2,1) |  |
| `review_count` | INTEGER |  |
| `is_featured` | BOOLEAN |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP | requerido |
| `updated_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>tour_packages</code> — 30 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK, requerido |
| `name` | TEXT | requerido |
| `slug` | TEXT |  |
| `category` | TEXT |  |
| `duration` | TEXT |  |
| `difficulty` | TEXT |  |
| `description` | TEXT |  |
| `short_description` | TEXT |  |
| `image_url` | TEXT |  |
| `gallery` | TEXT[] |  |
| `destinations` | TEXT[] |  |
| `highlights` | TEXT[] |  |
| `included` | TEXT[] |  |
| `not_included` | TEXT[] |  |
| `itinerary` | JSONB |  |
| `price_from` | NUMERIC |  |
| `price_currency` | TEXT |  |
| `max_group_size` | INTEGER |  |
| `min_age` | INTEGER |  |
| `languages` | TEXT[] |  |
| `meeting_point` | TEXT |  |
| `start_times` | TEXT[] |  |
| `rating` | NUMERIC |  |
| `review_count` | INTEGER |  |
| `destination_id` | UUID | → destinations |
| `is_featured` | BOOLEAN |  |
| `is_active` | BOOLEAN |  |
| `is_sponsored` | BOOLEAN |  |
| `created_at` | TIMESTAMPTZ | requerido |
| `updated_at` | TIMESTAMPTZ | requerido |

</details>

<details><summary><code>travel_agencies</code> — 23 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `name` | TEXT | requerido |
| `slug` | TEXT |  |
| `destination_id` | UUID | → destinations |
| `agency_type` | TEXT |  |
| `description` | TEXT |  |
| `short_description` | TEXT |  |
| `image_url` | TEXT |  |
| `logo_url` | TEXT |  |
| `address` | TEXT |  |
| `phone` | TEXT |  |
| `email` | TEXT |  |
| `website` | TEXT |  |
| `services` | TEXT[] |  |
| `specialties` | TEXT[] |  |
| `languages` | TEXT[] |  |
| `certifications` | TEXT[] |  |
| `rating` | DECIMAL(2,1) |  |
| `review_count` | INTEGER |  |
| `is_featured` | BOOLEAN |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP | requerido |
| `updated_at` | TIMESTAMP | requerido |

</details>

#### Historia, cultura y editorial

<details><summary><code>article_translations</code> — 8 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `article_id` | uuid | requerido, → articles |
| `locale` | text | requerido |
| `title` | text | requerido |
| `excerpt` | text |  |
| `content` | text |  |
| `created_at` | timestamptz | requerido |
| `updated_at` | timestamptz | requerido |

</details>

<details><summary><code>articles</code> — 16 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `slug` | text |  |
| `title` | text | requerido |
| `excerpt` | text |  |
| `content` | text |  |
| `image_url` | text |  |
| `gallery` | text[] |  |
| `category` | text |  |
| `tags` | text[] |  |
| `author_name` | text |  |
| `author_image` | text |  |
| `is_published` | boolean |  |
| `is_featured` | boolean |  |
| `published_at` | timestamptz |  |
| `created_at` | timestamptz | requerido |
| `updated_at` | timestamptz | requerido |

</details>

<details><summary><code>audio_guides</code> — 8 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `title` | VARCHAR(255) | requerido |
| `description` | TEXT |  |
| `audio_url` | VARCHAR(512) | requerido |
| `language` | VARCHAR(10) |  |
| `associated_entity_type` | VARCHAR(100) | requerido |
| `associated_entity_id` | VARCHAR(36) | requerido |
| `duration_seconds` | INT |  |

</details>

<details><summary><code>blog_posts</code> — 11 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `title` | VARCHAR(255) | requerido |
| `slug` | VARCHAR(255) | requerido |
| `content` | TEXT | requerido |
| `summary` | VARCHAR(512) |  |
| `image_url` | VARCHAR(512) |  |
| `author_id` | VARCHAR(36) |  |
| `category` | VARCHAR(100) |  |
| `published_at` | TIMESTAMP |  |
| `is_featured` | BOOLEAN |  |
| `created_at` | TIMESTAMP |  |

</details>

<details><summary><code>emergency_contacts</code> — 8 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `province_id` | VARCHAR(36) |  |
| `institution` | TEXT | requerido |
| `phone_number` | TEXT | requerido |
| `address` | TEXT |  |
| `latitude` | DECIMAL(10,8) |  |
| `longitude` | DECIMAL(11,8) |  |
| `created_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>historical_events</code> — 21 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `name` | text | requerido |
| `slug` | text |  |
| `event_date` | text |  |
| `end_date` | text |  |
| `year` | integer |  |
| `era` | text |  |
| `category` | text |  |
| `location` | text |  |
| `short_description` | text |  |
| `description` | text |  |
| `significance` | text |  |
| `key_figures` | text[] |  |
| `consequences` | text[] |  |
| `image_url` | text |  |
| `gallery` | text[] |  |
| `sources` | text[] |  |
| `is_featured` | boolean |  |
| `is_active` | boolean |  |
| `created_at` | timestamptz | requerido |
| `updated_at` | timestamptz | requerido |

</details>

<details><summary><code>historical_figures</code> — 21 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `name` | text | requerido |
| `slug` | text |  |
| `title` | text |  |
| `birth_date` | text |  |
| `death_date` | text |  |
| `birth_place` | text |  |
| `era` | text |  |
| `category` | text |  |
| `short_description` | text |  |
| `description` | text |  |
| `biography` | text |  |
| `achievements` | text[] |  |
| `quotes` | text[] |  |
| `image_url` | text |  |
| `gallery` | text[] |  |
| `related_events` | text[] |  |
| `is_featured` | boolean |  |
| `is_active` | boolean |  |
| `created_at` | timestamptz | requerido |
| `updated_at` | timestamptz | requerido |

</details>

<details><summary><code>job_vacancies</code> — 38 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `hotel_id` | uuid | → hotels |
| `restaurant_id` | uuid | → restaurants |
| `company_name` | text | requerido |
| `company_logo` | text |  |
| `company_description` | text |  |
| `title` | text | requerido |
| `slug` | text |  |
| `description` | text |  |
| `short_description` | text |  |
| `location` | text |  |
| `address` | text |  |
| `province` | text |  |
| `salary_range` | text |  |
| `salary_min` | numeric |  |
| `salary_max` | numeric |  |
| `salary_currency` | text |  |
| `job_type` | text |  |
| `experience_level` | text |  |
| `education` | text |  |
| `category` | text |  |
| `department` | text |  |
| `languages` | text[] |  |
| `responsibilities` | text[] |  |
| `requirements` | text[] |  |
| `benefits` | text[] |  |
| `skills` | text[] |  |
| `is_urgent` | boolean |  |
| `is_remote` | boolean |  |
| `is_featured` | boolean |  |
| `is_active` | boolean |  |
| `application_url` | text |  |
| `application_email` | text |  |
| `deadline` | date |  |
| `applicants_count` | integer |  |
| `views_count` | integer |  |
| `created_at` | timestamptz | requerido |
| `updated_at` | timestamptz | requerido |

</details>

<details><summary><code>route_stops</code> — 8 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `route_id` | VARCHAR(36) | requerido |
| `stop_order` | INT | requerido |
| `destination_id` | VARCHAR(36) | requerido |
| `place_name` | VARCHAR(255) | requerido |
| `latitude` | DECIMAL(10,8) |  |
| `longitude` | DECIMAL(11,8) |  |
| `notes` | TEXT |  |

</details>

<details><summary><code>routes</code> — 10 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `title` | VARCHAR(255) | requerido |
| `slug` | VARCHAR(255) | requerido |
| `description` | TEXT |  |
| `duration_hours` | DECIMAL(4,2) |  |
| `distance_km` | DECIMAL(6,2) |  |
| `difficulty` | ENUM('facil','moderado','dificil') |  |
| `gpx_track_url` | VARCHAR(512) |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP |  |

</details>

#### Reservas y pagos

<details><summary><code>event_tickets</code> — 6 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `reservation_id` | VARCHAR(36) |  |
| `ticket_code` | VARCHAR(255) | requerido |
| `status` | ENUM('unused','scanned','cancelled') |  |
| `scanned_at` | TIMESTAMP |  |
| `created_at` | TIMESTAMP |  |

</details>

<details><summary><code>reservations</code> — 18 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | requerido, → auth |
| `item_type` | text | requerido |
| `item_id` | uuid | requerido |
| `item_name` | text | requerido |
| `item_image` | text |  |
| `check_in` | date |  |
| `check_out` | date |  |
| `guests` | integer |  |
| `total_price` | numeric |  |
| `currency` | text |  |
| `status` | text |  |
| `notes` | text |  |
| `contact_name` | text |  |
| `contact_email` | text |  |
| `contact_phone` | text |  |
| `created_at` | timestamptz | requerido |
| `updated_at` | timestamptz | requerido |

</details>

#### Marketplace y tienda

<details><summary><code>discount_coupons</code> — 9 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `code` | VARCHAR(255) | requerido |
| `discount_percentage` | DECIMAL(5,2) |  |
| `discount_amount` | DECIMAL(10,2) |  |
| `expires_at` | TIMESTAMP |  |
| `max_uses` | INT |  |
| `uses_count` | INT |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>marketplace_order_items</code> — 6 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `order_id` | VARCHAR(36) |  |
| `item_type` | TEXT |  |
| `item_id` | VARCHAR(36) | requerido |
| `quantity` | INT | requerido |
| `price_unit` | DECIMAL(10,2) | requerido |

</details>

<details><summary><code>marketplace_orders</code> — 7 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `user_id` | VARCHAR(36) |  |
| `total_amount` | DECIMAL(10,2) | requerido |
| `status` | VARCHAR(100) |  |
| `payment_method` | TEXT |  |
| `payment_intent_id` | TEXT |  |
| `created_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>store_orders</code> — 13 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | text | PK |
| `user_id` | uuid |  |
| `customer_name` | text | requerido |
| `customer_email` | text | requerido |
| `phone` | text |  |
| `address` | text | requerido |
| `city` | text | requerido |
| `items` | jsonb | requerido |
| `subtotal` | numeric(12,2) | requerido |
| `shipping` | numeric(12,2) | requerido |
| `total` | numeric(12,2) | requerido |
| `status` | text | requerido |
| `created_at` | timestamptz | requerido |

</details>

<details><summary><code>store_products</code> — 17 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | text | PK |
| `slug` | text | requerido |
| `name` | text | requerido |
| `category` | text | requerido |
| `price` | numeric(12,2) | requerido |
| `currency` | text | requerido |
| `stock` | integer | requerido |
| `active` | boolean | requerido |
| `featured` | boolean | requerido |
| `emoji` | text |  |
| `tone` | text |  |
| `sizes` | text[] | requerido |
| `colors` | text[] | requerido |
| `tagline` | text |  |
| `description` | text |  |
| `includes` | text[] | requerido |
| `created_at` | timestamptz | requerido |

</details>

<details><summary><code>vendor_payments</code> — 8 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `partner_id` | VARCHAR(36) |  |
| `amount` | DECIMAL(10,2) | requerido |
| `status` | VARCHAR(100) |  |
| `payout_method` | TEXT |  |
| `payout_reference` | TEXT |  |
| `paid_at` | TIMESTAMP |  |
| `created_at` | TIMESTAMP | requerido |

</details>

#### Proveedores y Operadores RD

<details><summary><code>establishment_registrations</code> — 16 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `tipo_establecimiento` | TEXT | requerido |
| `nombre` | TEXT | requerido |
| `responsable` | TEXT | requerido |
| `email` | TEXT | requerido |
| `telefono` | TEXT | requerido |
| `direccion` | TEXT | requerido |
| `provincia` | TEXT | requerido |
| `website` | TEXT |  |
| `foto_url` | TEXT |  |
| `descripcion` | TEXT | requerido |
| `rnc` | TEXT |  |
| `horario` | TEXT |  |
| `detalles` | JSON |  |
| `status` | VARCHAR(100) |  |
| `created_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>operator_listings</code> — 23 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | text | PK |
| `org_id` | uuid | requerido, → partner_profiles |
| `category` | text | requerido |
| `title` | text | requerido |
| `slug` | text | requerido |
| `summary` | text | requerido |
| `description` | text | requerido |
| `destination` | text |  |
| `price` | numeric(12,2) | requerido |
| `currency` | text | requerido |
| `duration` | text |  |
| `capacity` | integer | requerido |
| `min_age` | integer |  |
| `languages` | text[] | requerido |
| `includes` | text[] | requerido |
| `meeting_point` | text |  |
| `cancellation_policy` | text | requerido |
| `images` | text[] | requerido |
| `time_slots` | text[] | requerido |
| `status` | text | requerido |
| `rating` | numeric(2,1) |  |
| `reviews_count` | integer | requerido |
| `created_at` | timestamptz | requerido |

</details>

<details><summary><code>operator_messages</code> — 10 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | text | PK |
| `org_id` | uuid | requerido, → partner_profiles |
| `thread_id` | text | requerido |
| `traveler_name` | text | requerido |
| `sender` | text | requerido |
| `channel` | text | requerido |
| `body` | text | requerido |
| `booking_id` | text |  |
| `read` | boolean | requerido |
| `created_at` | timestamptz | requerido |

</details>

<details><summary><code>operator_promotions</code> — 12 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | text | PK |
| `org_id` | uuid | requerido, → partner_profiles |
| `code` | text | requerido |
| `type` | text | requerido |
| `value` | numeric(10,2) | requerido |
| `listing_id` | text | → operator_listings |
| `starts_at` | date |  |
| `ends_at` | date |  |
| `max_uses` | integer |  |
| `uses` | integer | requerido |
| `active` | boolean | requerido |
| `created_at` | timestamptz | requerido |

</details>

<details><summary><code>operator_reviews</code> — 8 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | text | PK |
| `org_id` | uuid | requerido, → partner_profiles |
| `listing_id` | text | → operator_listings |
| `author` | text | requerido |
| `rating` | integer | requerido |
| `comment` | text |  |
| `reply` | text |  |
| `created_at` | timestamptz | requerido |

</details>

<details><summary><code>partner_profiles</code> — 9 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `business_name` | VARCHAR(255) | requerido |
| `business_type` | ENUM('hotel','restaurant','bar','tour','spa','shop','operador','agencia','guia') | requerido |
| `phone` | VARCHAR(50) |  |
| `email` | VARCHAR(255) | requerido |
| `description` | TEXT |  |
| `rating` | DECIMAL(3,2) |  |
| `created_at` | TIMESTAMP |  |
| `updated_at` | TIMESTAMP |  |

</details>

#### Gamificación

<details><summary><code>achievements</code> — 20 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `name` | TEXT | requerido |
| `slug` | TEXT |  |
| `description` | TEXT |  |
| `short_description` | TEXT |  |
| `icon` | TEXT |  |
| `badge_color` | TEXT |  |
| `category` | TEXT | requerido |
| `achievement_type` | TEXT | requerido |
| `xp_reward` | INTEGER |  |
| `coin_reward` | INTEGER |  |
| `min_level` | INTEGER |  |
| `unlock_condition` | TEXT |  |
| `unlock_requirement` | JSONB |  |
| `display_order` | INTEGER |  |
| `total_unlocked` | INTEGER |  |
| `is_hidden` | BOOLEAN |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP | requerido |
| `updated_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>digital_collectibles</code> — 22 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `name` | TEXT | requerido |
| `slug` | VARCHAR(255) |  |
| `description` | TEXT |  |
| `short_description` | TEXT |  |
| `collectible_type` | VARCHAR(50) | requerido |
| `rarity` | VARCHAR(50) | requerido |
| `image_url` | TEXT |  |
| `animated_url` | TEXT |  |
| `thumbnail_url` | TEXT |  |
| `unlock_condition` | TEXT |  |
| `unlock_requirement` | JSON |  |
| `total_supply` | INT |  |
| `current_supply` | INT |  |
| `xp_value` | INT |  |
| `coin_value` | INT |  |
| `is_tradeable` | BOOLEAN |  |
| `is_active` | BOOLEAN |  |
| `season` | VARCHAR(100) |  |
| `event_id` | VARCHAR(36) |  |
| `created_at` | TIMESTAMP | requerido |
| `updated_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>explorer_guilds</code> — 11 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `name` | VARCHAR(255) | requerido |
| `slug` | VARCHAR(255) | requerido |
| `description` | TEXT |  |
| `icon` | VARCHAR(50) | requerido |
| `region` | VARCHAR(255) | requerido |
| `member_count` | INT | requerido |
| `total_xp` | BIGINT | requerido |
| `is_official` | BOOLEAN | requerido |
| `created_by` | VARCHAR(36) |  |
| `created_at` | TIMESTAMP |  |

</details>

<details><summary><code>gamification_leagues</code> — 11 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `name` | VARCHAR(255) | requerido |
| `slug` | VARCHAR(255) | requerido |
| `icon` | VARCHAR(50) | requerido |
| `min_xp_week` | INT | requerido |
| `max_xp_week` | INT |  |
| `color` | VARCHAR(50) | requerido |
| `bg_color` | VARCHAR(50) | requerido |
| `coin_reward` | INT | requerido |
| `display_order` | INT | requerido |
| `created_at` | TIMESTAMP |  |

</details>

<details><summary><code>gamification_levels</code> — 10 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `level_number` | integer | requerido |
| `name` | text | requerido |
| `title` | text | requerido |
| `xp_required` | integer | requerido |
| `icon` | text |  |
| `color` | text |  |
| `marketplace_discount` | numeric |  |
| `perks` | text[] |  |
| `created_at` | timestamptz | requerido |

</details>

<details><summary><code>gamification_missions</code> — 18 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `name` | text | requerido |
| `description` | text |  |
| `short_description` | text |  |
| `mission_type` | text | requerido |
| `category` | text |  |
| `icon` | text |  |
| `xp_reward` | integer | requerido |
| `coin_reward` | integer | requerido |
| `target_count` | integer | requerido |
| `target_action` | text | requerido |
| `is_active` | boolean |  |
| `is_featured` | boolean |  |
| `min_level` | integer |  |
| `start_date` | date |  |
| `end_date` | date |  |
| `created_at` | timestamptz | requerido |
| `updated_at` | timestamptz | requerido |

</details>

<details><summary><code>gamification_prizes</code> — 17 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `name` | VARCHAR(255) | requerido |
| `description` | TEXT |  |
| `short_description` | VARCHAR(255) |  |
| `image_url` | VARCHAR(512) |  |
| `prize_type` | VARCHAR(100) | requerido |
| `coin_cost` | INT | requerido |
| `min_level` | INT |  |
| `quantity_available` | INT |  |
| `quantity_redeemed` | INT |  |
| `is_active` | BOOLEAN |  |
| `is_featured` | BOOLEAN |  |
| `sponsor` | VARCHAR(255) |  |
| `valid_until` | DATE |  |
| `terms` | TEXT |  |
| `created_at` | TIMESTAMP |  |
| `updated_at` | TIMESTAMP |  |

</details>

<details><summary><code>gamification_seasons</code> — 8 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `name` | VARCHAR(255) | requerido |
| `number` | INT | requerido |
| `starts_at` | TIMESTAMP | requerido |
| `ends_at` | TIMESTAMP | requerido |
| `is_active` | BOOLEAN | requerido |
| `top_rewards` | JSON |  |
| `created_at` | TIMESTAMP |  |

</details>

<details><summary><code>gamification_transactions</code> — 9 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `user_id` | VARCHAR(36) | requerido |
| `transaction_type` | VARCHAR(50) | requerido |
| `xp_amount` | INT |  |
| `coin_amount` | INT |  |
| `description` | VARCHAR(255) |  |
| `source_type` | VARCHAR(100) |  |
| `source_id` | VARCHAR(255) |  |
| `created_at` | TIMESTAMP |  |

</details>

<details><summary><code>gamified_routes</code> — 19 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `name` | TEXT | requerido |
| `slug` | VARCHAR(255) |  |
| `description` | TEXT |  |
| `short_description` | TEXT |  |
| `route_type` | VARCHAR(50) | requerido |
| `difficulty` | VARCHAR(50) |  |
| `duration_days` | INT |  |
| `distance_km` | DECIMAL(12,2) |  |
| `total_xp_reward` | INT |  |
| `total_coin_reward` | INT |  |
| `completion_badge_id` | VARCHAR(36) |  |
| `image_url` | TEXT |  |
| `gallery` | JSON |  |
| `min_level` | INT |  |
| `is_featured` | BOOLEAN |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP | requerido |
| `updated_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>guild_members</code> — 5 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `guild_id` | VARCHAR(36) | requerido |
| `user_id` | VARCHAR(36) | requerido |
| `role` | VARCHAR(100) | requerido |
| `joined_at` | TIMESTAMP |  |

</details>

<details><summary><code>passport_stamps</code> — 21 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `user_id` | VARCHAR(36) | requerido |
| `destination_id` | VARCHAR(36) |  |
| `beach_id` | VARCHAR(36) |  |
| `hotel_id` | VARCHAR(36) |  |
| `restaurant_id` | VARCHAR(36) |  |
| `experience_id` | VARCHAR(36) |  |
| `stamp_type` | VARCHAR(50) | requerido |
| `stamp_name` | TEXT | requerido |
| `stamp_location` | TEXT |  |
| `stamp_image` | TEXT |  |
| `visited_at` | TIMESTAMP | requerido |
| `verification_method` | VARCHAR(50) |  |
| `verification_data` | JSON |  |
| `xp_earned` | INT |  |
| `coins_earned` | INT |  |
| `notes` | TEXT |  |
| `photos` | JSON |  |
| `rating` | INT |  |
| `is_verified` | BOOLEAN |  |
| `created_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>photo_challenges</code> — 11 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `title` | VARCHAR(255) | requerido |
| `description` | TEXT |  |
| `theme` | VARCHAR(255) | requerido |
| `destination` | VARCHAR(255) |  |
| `starts_at` | TIMESTAMP |  |
| `ends_at` | TIMESTAMP |  |
| `xp_reward` | INT | requerido |
| `coin_reward` | INT | requerido |
| `is_active` | BOOLEAN | requerido |
| `created_at` | TIMESTAMP |  |

</details>

<details><summary><code>photo_submissions</code> — 9 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `challenge_id` | VARCHAR(36) | requerido |
| `user_id` | VARCHAR(36) | requerido |
| `image_url` | VARCHAR(512) | requerido |
| `caption` | TEXT |  |
| `votes` | INT | requerido |
| `is_approved` | BOOLEAN | requerido |
| `is_winner` | BOOLEAN | requerido |
| `created_at` | TIMESTAMP |  |

</details>

<details><summary><code>photo_votes</code> — 4 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `submission_id` | VARCHAR(36) | requerido |
| `user_id` | VARCHAR(36) | requerido |
| `created_at` | TIMESTAMP |  |

</details>

<details><summary><code>points_transactions</code> — 8 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `user_id` | VARCHAR(36) |  |
| `transaction_type` | TEXT |  |
| `amount` | INT | requerido |
| `reason` | TEXT | requerido |
| `reference_entity_type` | TEXT |  |
| `reference_entity_id` | VARCHAR(36) |  |
| `created_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>province_visits</code> — 4 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `user_id` | VARCHAR(36) | requerido |
| `province` | VARCHAR(255) | requerido |
| `visited_at` | TIMESTAMP |  |

</details>

<details><summary><code>referral_codes</code> — 7 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `user_id` | VARCHAR(36) | requerido |
| `code` | VARCHAR(50) | requerido |
| `total_referrals` | INT |  |
| `total_earnings_coins` | INT |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP |  |

</details>

<details><summary><code>referral_uses</code> — 6 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `referral_code_id` | VARCHAR(36) | requerido |
| `referred_user_id` | VARCHAR(36) | requerido |
| `xp_awarded` | INT |  |
| `coins_awarded` | INT |  |
| `created_at` | TIMESTAMP |  |

</details>

<details><summary><code>reward_inventory</code> — 8 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `title` | VARCHAR(255) | requerido |
| `description` | TEXT |  |
| `coins_cost` | INT | requerido |
| `stock` | INT |  |
| `is_physical` | BOOLEAN |  |
| `image_url` | VARCHAR(512) |  |
| `created_at` | TIMESTAMP |  |

</details>

<details><summary><code>reward_shipments</code> — 11 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `user_id` | VARCHAR(36) |  |
| `reward_id` | VARCHAR(36) |  |
| `recipient_name` | VARCHAR(255) | requerido |
| `recipient_phone` | VARCHAR(50) | requerido |
| `shipping_address` | TEXT | requerido |
| `courier_name` | VARCHAR(100) |  |
| `tracking_number` | VARCHAR(100) |  |
| `status` | ENUM('pending','shipped','delivered','cancelled') |  |
| `shipped_at` | TIMESTAMP |  |
| `created_at` | TIMESTAMP |  |

</details>

<details><summary><code>route_checkpoints</code> — 19 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `route_id` | VARCHAR(36) | requerido |
| `checkpoint_order` | INT | requerido |
| `checkpoint_name` | TEXT | requerido |
| `checkpoint_description` | TEXT |  |
| `checkpoint_type` | VARCHAR(50) | requerido |
| `destination_id` | VARCHAR(36) |  |
| `beach_id` | VARCHAR(36) |  |
| `hotel_id` | VARCHAR(36) |  |
| `restaurant_id` | VARCHAR(36) |  |
| `experience_id` | VARCHAR(36) |  |
| `latitude` | DECIMAL(10,8) |  |
| `longitude` | DECIMAL(11,8) |  |
| `xp_reward` | INT |  |
| `coin_reward` | INT |  |
| `challenge_task` | TEXT |  |
| `photo_required` | BOOLEAN |  |
| `is_mandatory` | BOOLEAN |  |
| `created_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>trivia_questions</code> — 14 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `question` | TEXT | requerido |
| `options` | JSON | requerido |
| `correct_index` | INT | requerido |
| `category` | VARCHAR(100) | requerido |
| `difficulty` | VARCHAR(50) | requerido |
| `explanation` | TEXT |  |
| `xp_reward` | INT | requerido |
| `image_url` | TEXT |  |
| `is_active` | BOOLEAN | requerido |
| `times_answered` | INT | requerido |
| `times_correct` | INT | requerido |
| `created_at` | TIMESTAMP | requerido |
| `updated_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>trivia_sessions</code> — 11 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `user_id` | VARCHAR(36) | requerido |
| `score` | INT | requerido |
| `total_questions` | INT | requerido |
| `correct_answers` | INT | requerido |
| `xp_earned` | INT | requerido |
| `coins_earned` | INT | requerido |
| `max_streak` | INT | requerido |
| `duration_seconds` | INT |  |
| `completed_at` | TIMESTAMP | requerido |
| `created_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>user_achievements</code> — 5 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `user_id` | VARCHAR(36) | requerido |
| `achievement_id` | VARCHAR(36) | requerido |
| `progress` | INT |  |
| `unlocked_at` | TIMESTAMP |  |

</details>

<details><summary><code>user_checkpoint_completions</code> — 11 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `user_id` | VARCHAR(36) | requerido |
| `route_id` | VARCHAR(36) | requerido |
| `checkpoint_id` | VARCHAR(36) | requerido |
| `completed_at` | TIMESTAMP |  |
| `photo_url` | TEXT |  |
| `notes` | TEXT |  |
| `verification_data` | JSON |  |
| `xp_earned` | INT |  |
| `coins_earned` | INT |  |
| `created_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>user_collectibles</code> — 8 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `user_id` | VARCHAR(36) | requerido |
| `collectible_id` | VARCHAR(36) | requerido |
| `acquired_at` | TIMESTAMP |  |
| `acquisition_method` | VARCHAR(50) |  |
| `is_favorite` | BOOLEAN |  |
| `display_order` | INT |  |
| `created_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>user_gamification</code> — 12 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `user_id` | VARCHAR(36) | requerido |
| `total_xp` | INT |  |
| `coins` | INT |  |
| `current_level` | INT |  |
| `streak_days` | INT |  |
| `total_missions_completed` | INT |  |
| `total_purchases` | INT |  |
| `total_referrals` | INT |  |
| `last_activity_date` | DATE |  |
| `created_at` | TIMESTAMP |  |
| `updated_at` | TIMESTAMP |  |

</details>

<details><summary><code>user_league_stats</code> — 9 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `user_id` | VARCHAR(36) | requerido |
| `season_id` | VARCHAR(36) | requerido |
| `league_slug` | VARCHAR(255) | requerido |
| `xp_this_week` | INT | requerido |
| `xp_this_season` | INT | requerido |
| `week_rank` | INT |  |
| `season_rank` | INT |  |
| `last_updated` | TIMESTAMP |  |

</details>

<details><summary><code>user_missions</code> — 8 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | requerido, → auth |
| `mission_id` | uuid | requerido, → gamification_missions |
| `progress` | integer | requerido |
| `is_completed` | boolean | requerido |
| `completed_at` | timestamptz |  |
| `created_at` | timestamptz | requerido |
| `updated_at` | timestamptz | requerido |

</details>

<details><summary><code>user_prize_redemptions</code> — 8 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `user_id` | VARCHAR(36) | requerido |
| `prize_id` | VARCHAR(36) | requerido |
| `coins_spent` | INT | requerido |
| `status` | VARCHAR(50) |  |
| `redemption_code` | VARCHAR(100) |  |
| `redeemed_at` | TIMESTAMP |  |
| `created_at` | TIMESTAMP |  |

</details>

<details><summary><code>user_route_progress</code> — 14 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `user_id` | VARCHAR(36) | requerido |
| `route_id` | VARCHAR(36) | requerido |
| `started_at` | TIMESTAMP |  |
| `completed_at` | TIMESTAMP |  |
| `current_checkpoint` | INT |  |
| `checkpoints_completed` | INT |  |
| `total_checkpoints` | INT |  |
| `total_xp_earned` | INT |  |
| `total_coins_earned` | INT |  |
| `is_completed` | BOOLEAN |  |
| `completion_percentage` | INT |  |
| `created_at` | TIMESTAMP | requerido |
| `updated_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>user_xp_milestones</code> — 4 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `user_id` | VARCHAR(36) | requerido |
| `milestone_id` | VARCHAR(36) | requerido |
| `achieved_at` | TIMESTAMP |  |

</details>

<details><summary><code>xp_milestones</code> — 6 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `xp_threshold` | INT | requerido |
| `badge_icon` | VARCHAR(50) | requerido |
| `badge_name` | VARCHAR(255) | requerido |
| `coin_reward` | INT | requerido |
| `description` | TEXT |  |

</details>

#### Embajadores y marketing

<details><summary><code>ad_banners</code> — 24 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `name` | TEXT | requerido |
| `slug` | TEXT |  |
| `image_url` | TEXT |  |
| `video_url` | TEXT |  |
| `alt_text` | TEXT |  |
| `target_url` | TEXT |  |
| `headline` | TEXT |  |
| `subtext` | TEXT |  |
| `cta_text` | TEXT |  |
| `sponsor` | TEXT |  |
| `banner_type` | TEXT | requerido |
| `placement` | TEXT | requerido |
| `section` | TEXT |  |
| `page` | TEXT |  |
| `start_date` | TIMESTAMP |  |
| `end_date` | TIMESTAMP |  |
| `priority` | INTEGER |  |
| `is_active` | BOOLEAN |  |
| `is_featured` | BOOLEAN |  |
| `impressions` | INTEGER |  |
| `clicks` | INTEGER |  |
| `created_at` | TIMESTAMP | requerido |
| `updated_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>ambassador_payouts</code> — 8 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `ambassador_id` | VARCHAR(36) | requerido |
| `amount` | DECIMAL(10,2) | requerido |
| `status` | VARCHAR(50) |  |
| `payout_method` | VARCHAR(100) | requerido |
| `payout_details` | TEXT |  |
| `processed_at` | TIMESTAMP |  |
| `created_at` | TIMESTAMP |  |

</details>

<details><summary><code>ambassador_referrals</code> — 7 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `ambassador_id` | VARCHAR(36) | requerido |
| `referred_email` | VARCHAR(255) | requerido |
| `sale_amount` | DECIMAL(10,2) | requerido |
| `commission_earned` | DECIMAL(10,2) | requerido |
| `status` | VARCHAR(50) |  |
| `created_at` | TIMESTAMP |  |

</details>

<details><summary><code>ambassadors</code> — 8 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `referral_code` | VARCHAR(50) | requerido |
| `sales_count` | INT |  |
| `total_earned` | DECIMAL(12,2) |  |
| `pending_payout` | DECIMAL(12,2) |  |
| `tier` | VARCHAR(50) |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP |  |

</details>

<details><summary><code>contest_registrations</code> — 9 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK, requerido |
| `nombre` | TEXT | requerido |
| `email` | TEXT | requerido |
| `telefono` | TEXT |  |
| `pais` | TEXT |  |
| `edad` | TEXT |  |
| `visitado` | TEXT |  |
| `intereses` | TEXT[] |  |
| `created_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>marketing_campaigns</code> — 9 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `title` | TEXT | requerido |
| `subject` | TEXT | requerido |
| `body_template` | TEXT | requerido |
| `segment_interests` | JSON |  |
| `sent_count` | INT |  |
| `status` | VARCHAR(100) |  |
| `scheduled_for` | TIMESTAMP |  |
| `created_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>marketing_leads</code> — 9 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `nombre` | TEXT | requerido |
| `email` | TEXT | requerido |
| `telefono` | TEXT |  |
| `empresa` | TEXT |  |
| `mensaje` | TEXT |  |
| `source` | TEXT |  |
| `status` | VARCHAR(100) |  |
| `created_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>newsletter_subscribers</code> — 7 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `email` | VARCHAR(255) | requerido |
| `nombre` | TEXT |  |
| `intereses` | JSON |  |
| `frecuencia` | VARCHAR(100) |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>offers</code> — 15 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `title` | TEXT | requerido |
| `description` | TEXT |  |
| `discount_code` | TEXT |  |
| `discount_percentage` | DECIMAL(12,2) |  |
| `original_price` | DECIMAL(12,2) | requerido |
| `price` | DECIMAL(12,2) | requerido |
| `start_time` | TIMESTAMP |  |
| `end_time` | TIMESTAMP |  |
| `latitude` | DECIMAL(10,8) |  |
| `longitude` | DECIMAL(11,8) |  |
| `radius_meters` | INT |  |
| `is_flash` | BOOLEAN |  |
| `image_url` | TEXT |  |
| `created_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>vacation_registrations</code> — 17 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK, requerido |
| `nombre` | TEXT | requerido |
| `email` | TEXT | requerido |
| `telefono` | TEXT |  |
| `pais` | TEXT |  |
| `acompanantes` | TEXT |  |
| `tipo_viajero` | TEXT |  |
| `fecha_llegada` | DATE |  |
| `fecha_salida` | DATE |  |
| `aeropuerto` | TEXT |  |
| `destino` | TEXT |  |
| `alojamiento` | TEXT |  |
| `nombre_alojamiento` | TEXT |  |
| `intereses` | TEXT[] |  |
| `primera_vez` | TEXT |  |
| `como_supo` | TEXT |  |
| `created_at` | TIMESTAMP | requerido |

</details>

#### Comunidad y UGC

<details><summary><code>post_comments</code> — 5 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `post_id` | VARCHAR(36) | requerido |
| `user_id` | VARCHAR(36) | requerido |
| `content` | TEXT | requerido |
| `created_at` | TIMESTAMP |  |

</details>

<details><summary><code>post_likes</code> — 4 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `post_id` | VARCHAR(36) | requerido |
| `user_id` | VARCHAR(36) | requerido |
| `created_at` | TIMESTAMP |  |

</details>

<details><summary><code>reviews</code> — 14 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK, requerido |
| `user_id` | UUID | requerido |
| `author_name` | TEXT | requerido |
| `verified` | BOOLEAN |  |
| `rating` | INTEGER | requerido |
| `traveler_type` | TEXT | requerido |
| `location` | TEXT | requerido |
| `category` | TEXT | requerido |
| `title` | TEXT | requerido |
| `content` | TEXT | requerido |
| `images` | TEXT[] |  |
| `helpful_count` | INTEGER |  |
| `created_at` | TIMESTAMP | requerido |
| `updated_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>social_comments</code> — 5 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `user_id` | VARCHAR(36) | requerido |
| `post_id` | VARCHAR(36) | requerido |
| `content` | TEXT | requerido |
| `created_at` | TIMESTAMP |  |

</details>

<details><summary><code>social_likes</code> — 4 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `user_id` | VARCHAR(36) | requerido |
| `post_id` | VARCHAR(36) | requerido |
| `created_at` | TIMESTAMP |  |

</details>

<details><summary><code>social_posts</code> — 12 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `user_id` | VARCHAR(36) | requerido |
| `content` | TEXT |  |
| `image_url` | VARCHAR(512) |  |
| `gallery` | JSON |  |
| `location` | VARCHAR(255) |  |
| `destination_id` | VARCHAR(36) |  |
| `likes_count` | INT |  |
| `comments_count` | INT |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP |  |
| `updated_at` | TIMESTAMP |  |

</details>

<details><summary><code>support_messages</code> — 6 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `ticket_id` | VARCHAR(36) |  |
| `sender_id` | VARCHAR(36) |  |
| `message` | TEXT | requerido |
| `is_admin_reply` | BOOLEAN |  |
| `created_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>support_tickets</code> — 8 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `user_id` | VARCHAR(36) |  |
| `subject` | TEXT | requerido |
| `description` | TEXT | requerido |
| `status` | VARCHAR(100) |  |
| `priority` | VARCHAR(100) |  |
| `assigned_to` | VARCHAR(36) |  |
| `created_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>survey_responses</code> — 7 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `template_id` | UUID | → survey_templates |
| `user_id` | UUID | → auth |
| `reservation_id` | UUID | → reservations |
| `nps_score` | INTEGER |  |
| `answers` | JSONB | requerido |
| `created_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>survey_templates</code> — 4 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `title` | VARCHAR(255) | requerido |
| `questions` | JSON | requerido |
| `is_active` | BOOLEAN |  |

</details>

<details><summary><code>ugc_media</code> — 8 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `user_id` | VARCHAR(36) |  |
| `media_url` | TEXT | requerido |
| `media_type` | TEXT |  |
| `associated_entity_type` | TEXT | requerido |
| `associated_entity_id` | VARCHAR(36) | requerido |
| `status` | VARCHAR(100) |  |
| `created_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>ugc_reports</code> — 7 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `user_id` | VARCHAR(36) |  |
| `target_type` | VARCHAR(100) | requerido |
| `target_id` | VARCHAR(36) | requerido |
| `reason` | VARCHAR(255) | requerido |
| `status` | VARCHAR(50) |  |
| `created_at` | TIMESTAMP |  |

</details>

#### Datos vivos

<details><summary><code>exchange_rates</code> — 6 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `rate_date` | DATE | requerido |
| `currency_code` | VARCHAR(255) | requerido |
| `buy_rate` | DECIMAL(10,4) | requerido |
| `sell_rate` | DECIMAL(10,4) | requerido |
| `created_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>fuel_prices</code> — 9 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `effective_date` | DATE | requerido |
| `gasolina_premium` | DECIMAL(10,2) | requerido |
| `gasolina_regular` | DECIMAL(10,2) | requerido |
| `gasoil_optimo` | DECIMAL(10,2) | requerido |
| `gasoil_regular` | DECIMAL(10,2) | requerido |
| `glp` | DECIMAL(10,2) | requerido |
| `gnv` | DECIMAL(10,2) | requerido |
| `created_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>lotteries</code> — 7 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `name` | TEXT | requerido |
| `country` | VARCHAR(100) | requerido |
| `logo_url` | TEXT |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP | requerido |
| `updated_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>lottery_draws</code> — 13 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `lottery_id` | VARCHAR(36) |  |
| `name` | TEXT | requerido |
| `draw_days` | JSON | requerido |
| `draw_time` | TIME | requerido |
| `ball_range_min` | INT |  |
| `ball_range_max` | INT |  |
| `number_of_balls` | INT |  |
| `tombolas_count` | INT |  |
| `has_bonus` | BOOLEAN |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP | requerido |
| `updated_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>lottery_results</code> — 17 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `lottery_name` | text | requerido |
| `slug` | text |  |
| `logo_url` | text |  |
| `draw_date` | date | requerido |
| `draw_time` | text |  |
| `draw_type` | text |  |
| `winning_numbers` | integer[] |  |
| `bonus_number` | integer |  |
| `prize_pool` | text |  |
| `jackpot_amount` | text |  |
| `next_draw_date` | date |  |
| `next_jackpot_estimate` | text |  |
| `is_active` | boolean |  |
| `is_featured` | boolean |  |
| `created_at` | timestamptz | requerido |
| `updated_at` | timestamptz | requerido |

</details>

<details><summary><code>marine_reports</code> — 11 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `location` | VARCHAR(255) | requerido |
| `wind_speed` | DECIMAL(4,1) | requerido |
| `wind_direction` | VARCHAR(20) | requerido |
| `wave_height` | DECIMAL(3,1) | requerido |
| `wave_period` | INT | requerido |
| `water_temp` | DECIMAL(3,1) | requerido |
| `condition_rating` | ENUM('Excelente','Buena','Regular','Mala') | requerido |
| `recommendation` | TEXT | requerido |
| `created_at` | TIMESTAMP |  |
| `updated_at` | TIMESTAMP |  |

</details>

<details><summary><code>weather_alerts</code> — 9 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `province_id` | VARCHAR(36) |  |
| `alert_type` | TEXT |  |
| `severity` | TEXT |  |
| `title` | TEXT | requerido |
| `description` | TEXT | requerido |
| `expires_at` | TIMESTAMP |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP | requerido |

</details>

#### Sistema y administración

<details><summary><code>admin_activity_logs</code> — 10 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `admin_id` | UUID | → auth |
| `action_type` | TEXT | requerido |
| `entity_name` | TEXT | requerido |
| `entity_id` | UUID |  |
| `ip_address` | TEXT |  |
| `user_agent` | TEXT |  |
| `old_data` | JSONB |  |
| `new_data` | JSONB |  |
| `created_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>analytics_events</code> — 7 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `event_type` | text | requerido |
| `page` | text |  |
| `metadata` | jsonb |  |
| `user_id` | uuid |  |
| `session_id` | text |  |
| `created_at` | timestamptz | requerido |

</details>

<details><summary><code>entity_translations</code> — 8 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `entity_type` | VARCHAR(50) | requerido |
| `entity_id` | VARCHAR(36) | requerido |
| `language` | VARCHAR(10) | requerido |
| `field_name` | VARCHAR(100) | requerido |
| `translation_text` | TEXT | requerido |
| `created_at` | TIMESTAMP | requerido |
| `updated_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>ip_rules</code> — 5 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `ip_address` | VARCHAR(255) | requerido |
| `rule_type` | TEXT |  |
| `notes` | TEXT |  |
| `created_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>seo_redirections</code> — 6 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `source_path` | VARCHAR(255) | requerido |
| `target_path` | TEXT | requerido |
| `redirect_type` | INT |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>site_settings</code> — 6 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `key` | VARCHAR(255) | requerido |
| `value` | JSON | requerido |
| `description` | TEXT |  |
| `created_at` | TIMESTAMP | requerido |
| `updated_at` | TIMESTAMP | requerido |

</details>

<details><summary><code>system_cron_jobs</code> — 7 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `job_name` | VARCHAR(255) | requerido |
| `schedule_cron` | TEXT | requerido |
| `last_run_at` | TIMESTAMP |  |
| `next_run_at` | TIMESTAMP |  |
| `status` | TEXT |  |
| `error_log` | TEXT |  |

</details>

<details><summary><code>system_webhooks</code> — 6 columnas</summary>

| Columna | Tipo | Notas |
|---|---|---|
| `id` | VARCHAR(36) | PK |
| `url` | TEXT | requerido |
| `event_type` | TEXT | requerido |
| `secret_token` | TEXT |  |
| `is_active` | BOOLEAN |  |
| `created_at` | TIMESTAMP | requerido |

</details>


---

## Apéndice B — RPC y funciones edge → endpoints

Cada llamada que hoy hace el frontend con `supabase.rpc(...)` o `supabase.functions.invoke(...)` y su reemplazo. "Usado en" se genera escaneando el código.

### B.1 Funciones RPC

| RPC actual | Endpoint equivalente | Sección | Usado en |
|---|---|---|---|
| `admin_award_xp_to_user` | POST `/admin/users/{id}/award-xp` | 5.17 | AdminUsuarios |
| `admin_toggle_operator_verified` | POST `/admin/orgs/{id}/verify` · `/reject` | 5.18 | AdminOperadores |
| `admin_toggle_user_suspended` | POST `/admin/users/{id}/suspend` · `/unsuspend` | 5.17 | AdminUsuarios |
| `admin_update_user_role` | PATCH `/admin/users/{id}/role` | 5.17 | AdminUsuarios |
| `award_user_xp` | POST `/gamification/actions` (usuario) · POST `/gamification/xp/award` (admin) | 5.11 | useActionTracker, useGamification, TriviaTuristica |
| `check_and_award_streak_bonus` | POST `/gamification/streak-bonus` | 5.11 | useActionTracker |
| `check_xp_milestones` | POST `/gamification/milestones/check` | 5.11 | useActionTracker |
| `get_my_comment_stats` | GET `/social/me/comment-stats` | 5.6 | RDSocial |
| `get_province_stats` | GET `/gamification/provinces` · GET `/provinces/stats` | 5.11 / 5.3 | GamificacionTuristica |
| `get_season_leaderboard` | GET `/gamification/leaderboard?scope=season&limit=` | 5.11 | LeagueWidget |
| `has_role` | Middleware de autorización (no es endpoint); `GET /auth/me` devuelve `roles[]` | 5.1 / 7.3 | AdminPanel |
| `perform_daily_checkin` | POST `/gamification/check-in` | 5.11 | useActionTracker |
| `perform_early_bird_bonus` | POST `/gamification/early-bird` | 5.11 | useActionTracker |
| `post_comment` | POST `/social/posts/{id}/comments` | 5.6 | RDSocial |
| `record_province_visit` | POST `/gamification/provinces/{slug}/visit` | 5.11 | GamificacionTuristica |
| `redeem_user_prize` | POST `/gamification/prizes/{id}/redeem` | 5.11 | useGamification |
| `track_ambassador_sale` | Interno al confirmarse el pago (`POST /ambassadors/track-sale` sólo con token de servicio) | 5.11 | CheckoutModal |
| `unlock_user_achievement` | POST `/gamification/achievements/{id}/unlock` | 5.11 | useAchievementChecker, GamificacionHub |
| `vote_photo_submission` | POST `/gamification/photo-submissions/{id}/vote` | 5.11 | PhotoChallenge |

### B.2 Funciones edge

| Función actual | Endpoint equivalente | Sección | Usado en |
|---|---|---|---|
| `admin-ai-operations` | POST `/admin/ai/generate` | 5.17 | AdminAiGenerator |
| `admin-entities` | Familia `/admin/{entity}` (`list/get/create/update/delete` → `GET/GET/POST/PATCH/DELETE`) | 5.17 | useAdminEntities |
| `import-establecimientos` | POST `/admin/imports/establecimientos` (+ `GET /admin/imports/{jobId}`) | 5.17 | AdminImportEstablecimientos |
| `chat-turistico` | POST `/ai/chat` (SSE) | 5.4 | (existe en `supabase/functions`, sin invocación directa en `src/`) |
| `ai-recommendations` | POST `/ai/recommendations` | 5.4 | (existe en `supabase/functions`, sin invocación directa en `src/`) |

### B.3 Operaciones de `supabase.auth` y `supabase.storage`

| Llamada actual | Endpoint |
|---|---|
| `auth.signUp` / `signInWithPassword` / `signOut` / `getSession` / `onAuthStateChange` | `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/refresh`, `/auth/me` |
| `auth.updateUser({password})` | `/auth/update-password` |
| `storage.from(bucket).upload` (previsto) | `/media/upload-url` + `/media/{id}/complete` |

---

## Apéndice C — Páginas del portal → endpoints

Mapa de las rutas de `src/App.tsx` (336 patrones distintos) por grupo funcional y los endpoints que necesitan. Las páginas de detalle dinámicas (`:slug`, `:id`) usan `GET /{colección}/{idOrSlug}`.

| Grupo | Rutas | Endpoints principales |
|---|---|---|
| Portada y navegación general | 3 rutas: `/` `/sobre-nosotros` `/sitemap` | `GET /home`, `/site/settings`, `/site/navigation`, `/ads`, `/live/weather`, `/live/exchange-rates`, `/search` |
| Destinos, provincias y territorio | 85 rutas: `/destinos` `/playa` `/playas` `/playa/:slug` `/rios` `/rio/:slug` `/destinos-regiones` `/destino/:slug` `/destinos/:slug` `/mapa-misiones` `/estado-playas` `/mapas` `/biodiversidad` `/astroturismo` … | `/destinations`, `/provinces`, `/beaches`, `/rivers`, `/mountains`, `/parks`, `/protected-areas`, `/caves`, `/hot-springs`, `/bird-species`, `/map/*`, `/live/beach-status` |
| Alojamiento, comida, ocio y servicios | 46 rutas: `/actividades` `/alojamientos` `/alojamiento/:slug` `/restaurante` `/restaurante/:slug` `/vida-nocturna` `/guia-gastronomica` `/centro-comercial/:slug` `/wellness` `/bodas` `/cruceros` `/nautica` `/nautica-cruceros` `/mice` … | `/hotels`, `/airbnb-listings`, `/restaurants`, `/bars`, `/spas`, `/experiences`, `/tours`, `/clinics`, `/ports`, `/stadiums`, `/shopping-centers`, `/golf-courses`, `/theme-parks`, `/reviews` |
| Eventos, cultura, historia y contenido editorial | 43 rutas: `/cultura` `/revista` `/receta/:slug` `/articulo/:slug` `/galeria` `/eventos` `/evento/:slug` `/evento/:id` `/eventos/:slug` `/eventos/:id` `/patrimonio` `/biblioteca` `/cine-rd` `/academia` … | `/events`, `/historical-figures`, `/historical-events`, `/articles`, `/recipes`, `/routes`, `/audio-guides`, `/pages/{slug}`, `/monuments` |
| Herramientas, datos vivos y guías prácticas | 70 rutas: `/aeropuerto` `/aeropuerto/:slug` `/sostenible` `/estadisticas` `/como-llegar` `/herramientas` `/info/seguridad` `/info/transporte` `/metro-santo-domingo` `/teleferico-santo-domingo` `/monoriel-santiago` `/inversion` `/accesibilidad` `/nomadas-digitales` … | `/live/*`, `/calculators/*`, `/tools/*`, `/airports`, `/emergency-contacts`, `/toll-routes`, `/pages/{slug}` |
| Usuarios, cuenta y participación | 23 rutas: `/ayuda` `/centro-ayuda` `/asistencia` `/terminos` `/rd-social` `/empleo` `/empleo/:slug` `/newsletter` `/encuesta` `/perfil-jugador` `/explorador/:id` `/mis-logros` `/opiniones` `/sugerencias` … | `/auth/*`, `/me/*`, `/newsletter/*`, `/surveys/*`, `/contests/*`, `/social/*`, `/reviews`, `/support/*`, `/job-vacancies` |
| Mi viaje, reservas y checkout | 15 rutas: `/planifica` `/mi-viaje` `/pasaporte-digital` `/planificador-grupal` `/e-ticket` `/check-in` `/itinerario-ia` `/reserva-directa` `/vacaciones` `/vuelve-a-casa` `/reservas` `/diario-viaje` `/suscripciones-sabores` `/top-100` … | `/me/trips/*`, `/ai/itinerary`, `/bookings/*`, `/payments/*`, `/me/tickets`, `/me/spots`, `/passport/*` |
| Gamificación y recompensas | 20 rutas: `/club-recompensas` `/gamificacion` `/gamificacion-turistica` `/gamificacion-turistica/retos` `/gamificacion-turistica/creadores` `/gamificacion-turistica/trivia` `/gamificacion-turistica/mapa` `/gamificacion-turistica/perfil` `/gamificacion-turistica/recompensas` `/gamificacion-turistica/reglas` `/reglas-gamificacion` `/retos` `/retos-turisticos` `/trivia` … | `/gamification/*`, `/trivia/*`, `/passport/*`, `/collectibles/*`, `/referrals/*`, `/ambassadors/*` |
| Marketplace y tienda | 5 rutas: `/ofertas` `/marketplace` `/tienda` `/tienda/checkout` `/tienda/:slug` | `/marketplace/*`, `/store/*`, `/cart/*`, `/checkout/*`, `/orders`, `/offers` |
| Proveedores y Operadores RD | 18 rutas: `/directorio-agencias` `/partners` `/guias-locales` `/fotografos` `/sello-calidad` `/agencia/:slug` `/contratar-influencers` `/guias-ecologicos` `/establecimientos` `/creadores` `/partner/login` `/partner/dashboard` `/operadores` `/operadores/directorio` … | `/orgs/*`, `/org/*`, `/operators/*`, `/partner/*`, `/establishments/*`, `/creators`, `/tour-guides`, `/travel-agencies` |
| Administración | 1 ruta: `/admin` | `/admin/*` (sección 5.17 y 5.18) |

**Rutas sin grupo asignado (6)** — páginas informativas o utilidades; usan `/pages/{slug}` o los endpoints de 5.3–5.5 según su contenido:

`/chef/:slug` `/running-ciclismo` `/volunturismo` `/ecoturismo` `/buceo-snorkel` `/vive-local`

---

## Apéndice D — Datos estáticos del frontend a migrar

Archivos de `src/data/` que hoy contienen contenido embebido en el código. Deben cargarse en la base (semilla inicial + CMS) y sustituirse por llamadas a la API; hasta entonces son la fuente de contenido de esas secciones.

| Archivo | Líneas | Destino en el backend |
|---|---|---|
| `activitiesData.ts` | 371 | activities |
| `airports.ts` | 363 | airports (`/airports`) |
| `bars.ts` | 430 | `bars` |
| `beaches.ts` | 603 | `beaches` |
| `blogData.ts` | 205 | `articles` |
| `carbonoData.ts` | 70 | `offset_projects` + parámetros en `site_settings` (`calculators.carbon`) |
| `comoLlegarData.ts` | 201 | `pages` (`como-llegar`) + `airports` |
| `creatorsData.ts` | 212 | `creators` |
| `criolloRecipesData.ts` | 243 | `recipes` |
| `destinations.ts` | 1479 | `destinations` |
| `destinosData.ts` | 229 | `destinations` (contenido complementario) |
| `eventosData.ts` | 108 | `events` |
| `experiences.ts` | 436 | `experiences` |
| `experienciasData.ts` | 66 | `experiences` |
| `fallbackAccommodations.ts` | 359 | `hotels` (semilla de respaldo; se elimina) |
| `formasGanarPuntos.ts` | 354 | `site_settings` (`gamification.rules`) + `gamification_missions` |
| `gamificacionHubData.ts` | 62 | `achievements`, `gamification_missions`, `pages` |
| `gamificacionTuristicaData.ts` | 137 | `achievements`, `gamified_routes`, `route_checkpoints` |
| `healthCenters.ts` | 251 | `clinics` |
| `historyArticles.ts` | 263 | `articles` / `historical_events` |
| `hotelDetailData.ts` | 320 | `hotels` (habitaciones, servicios) |
| `hotels.ts` | 498 | `hotels` |
| `lidomData.ts` | 226 | `events`, `stadiums`, colección `lidom_standings` (nueva, dato vivo) |
| `marketplaceData.ts` | 419 | `marketplace_products`, vendedores |
| `mockIndustryBanners.ts` | 242 | `ad_banners` |
| `monedaData.ts` | 51 | `exchange_rates` + `phrases` |
| `mountains.ts` | 1188 | `mountains` |
| `nauticaData.ts` | 170 | `ports_marinas`, `experiences` |
| `parquesData.ts` | 152 | `parks`, `protected_areas` |
| `partnerDashboardData.ts` | 47 | datos de demostración; se elimina (lo reemplaza `/partner/*`) |
| `provinceEnrichment.ts` | 1033 | `provinces` (campos enriquecidos) + `destinations` |
| `recipesData.ts` | 613 | `recipes` |
| `restaurants.ts` | 468 | `restaurants` |
| `rewardsData.ts` | 271 | `gamification_prizes` |
| `riosData.ts` | 757 | `rivers` |
| `rivers.ts` | 2056 | `rivers` |
| `rutasSaborData.ts` | 322 | `routes` |
| `shopping-malls.ts` | 418 | `shopping_centers` |
| `socialData.ts` | 150 | datos de demostración de RD Social; se elimina |
| `sorteosData.ts` | 87 | `contests` |
| `souvenirsData.ts` | 54 | `souvenirs` |
| `transporteData.ts` | 267 | `pages` + `airports` + colección `transport_services` (nueva) |

Total: 42 archivos, 16251 líneas.
