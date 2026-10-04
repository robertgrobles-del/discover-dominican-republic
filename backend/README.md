# Descubre RD — API (backend)

API REST v1 del portal. Fastify + TypeScript + PostgreSQL. Es un proyecto **independiente del frontend**: no se importa desde `src/` ni lo modifica.
Diseño completo, endpoints previstos y roadmap: [`../docs/BACKEND_API.md`](../docs/BACKEND_API.md).

**Estado:** Fase 0 completa (base técnica, esquema, autenticación, correo) + **lectura pública de contenido** (paso 4). Sigue el CMS y la administración.

| Área | Qué hay |
|---|---|
| Servidor | Fastify 5, validación con Zod, envoltorio de errores único, `X-Request-Id`, helmet, CORS, ETag/304 |
| Contrato | OpenAPI 3.1 en `/openapi.json` y UI en `/docs` (230 operaciones descritas con su esquema real) |
| Esquema | 138 tablas en PostgreSQL (migraciones `0001`–`0012`), gobierno CMS, roles, auditoría, slugs, búsqueda |
| Contenido público | **43 colecciones** (`/beaches`, `/hotels`, `/restaurants`, `/events`…) con filtros, búsqueda, facetas, cercanía, relacionados, reseñas y traducciones |
| Autenticación | Registro, login, refresh con rotación, verificación de correo, contraseñas, dispositivos, **2FA (TOTP)**, **login social (Google/OIDC)**, roles |
| Correo | Cola **durable en PostgreSQL** (reintentos, outbox transaccional), plantillas es/en, SMTP/Mailpit/SES |
| Límites de tasa | Memoria, **PostgreSQL** (varias instancias, sin infraestructura extra) o Redis |
| Claves JWT | Generador, `kid`, JWKS público y rotación sin cortar sesiones |
| Pruebas | 159 pruebas de integración contra PostgreSQL real, un SMTP real y un proveedor OIDC local |

## Requisitos

- Node.js ≥ 20.17 (probado con 22).
- PostgreSQL 15+: con Docker (`docker compose up -d`) **o** sin Docker con el PostgreSQL embebido (`npm run db:embedded`).

## Puesta en marcha

```bash
cd backend
npm install
cp .env.example .env            # ajusta DATABASE_URL según la opción elegida

# Opción A — Docker (Postgres :5433, Redis :6380, Mailpit :8025)
docker compose up -d

# Opción B — sin Docker: PostgreSQL real embebido en :5434 (déjalo corriendo en otra terminal)
npm run db:embedded             # DATABASE_URL=postgres://postgres:postgres@localhost:5434/descubre_rd

npm run db:reset                # recrea el esquema y siembra los datos de desarrollo
npm run dev                     # http://localhost:3000  ·  docs en /docs
```

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | API con recarga automática |
| `npm test` | Pruebas (usa la base `descubre_rd_test`, la recrea en cada ejecución) |
| `npm run typecheck` | Verificación de tipos |
| `npm run build` / `npm start` | Compila a `dist/` y ejecuta |
| `npm run db:migrate` | Aplica migraciones pendientes |
| `npm run db:seed` | Siembra desde `mockDb.json` y crea el administrador de desarrollo |
| `npm run db:reset` | Recrea `public` y siembra (bloqueado si `NODE_ENV=production`) |
| `npm run db:gen-baseline` | Regenera `0001`/`0002` desde las fuentes SQL (sólo antes del primer despliegue) |
| `npm run db:gen-manifest` | Regenera `src/modules/content/manifest.json` (columnas de las colecciones) tras cambiar el esquema |
| `npm run keys:generate` | Genera un par de claves RS256 para firmar JWT |

## Estructura

```
backend/
  migrations/           SQL versionado (0001 base generada · 0002 gobierno CMS generada · 0003+ a mano)
  scripts/              migrate · seed-from-mock · gen-baseline · gen-manifest · generate-keys · dev-db
  src/
    config/env.ts       variables de entorno validadas (Zod)
    db/                 pool y migrador (checksums: una migración aplicada no se puede editar)
    lib/                errores, paginación/orden, i18n
    plugins/            errores, seguridad y límites de tasa, ETag, OpenAPI, autenticación
    modules/
      content/          registro de colecciones + motor de consultas + rutas genéricas
      auth/             servicio de cuentas, tokens, TOTP, OAuth, rutas
      mailer/           cola durable + plantillas
      health/ config/   sistema
    routes.ts           registro de módulos bajo /api/v1
  test/                 integración (fastify.inject + PostgreSQL real)
```

## Convenciones

- **Respuesta:** `{ data, meta?, links? }`; **error:** `{ error: { code, message, details?, request_id } }` (docs §3.3). Lanza `AppError` desde los servicios.
- **Listados:** `page`, `per_page` (máx. 100), `q`, `sort` (`-campo`, lista blanca), `filter[campo]`, `lang` (docs §3.4).
- **Contenido público:** sólo `status = 'published'`, no eliminado y con `published_at ≤ ahora` (docs §4.1). Cabecera `Cache-Control` pública + ETag.
- **Idioma:** `?lang=` o `Accept-Language`; traducciones en `entity_translations` con respaldo a `es` (`meta.fallback_locale`).
- **SQL:** siempre parametrizado; los nombres de columnas de `ORDER BY`, filtros y campos salen de listas blancas.
- **Migraciones:** nunca se editan las ya aplicadas; se agrega una nueva `000N_descripcion.sql`.

## Contenido público (paso 4)

Cada colección es una entrada en `src/modules/content/collections.ts` y recibe **seis rutas** sin más código:

| Ruta | Qué hace |
|---|---|
| `GET /{col}` | Listado: `page`, `per_page`, `q`, `sort`, `fields`, `include`, `filter[col]`, `filter[col][gte\|lte\|gt\|lt\|ne]`, `near=lat,lng&radius=` (ordena por distancia y devuelve `distance_m`), `lang` |
| `GET /{col}/facets` | Conteos por valor para construir filtros (respeta los demás filtros, no el propio) |
| `GET /{col}/{idOrSlug}` | Detalle completo con SEO agrupado y relaciones (`include=destination,province`) |
| `GET /{col}/{idOrSlug}/related` | Relacionados por destino/provincia/tipo, destacados primero |
| `GET /{col}/{idOrSlug}/nearby` | Otras colecciones alrededor (`types=hotels,restaurants`, `radius`, `limit`) |
| `GET /{col}/{idOrSlug}/reviews` | Reseñas aprobadas con resumen (promedio y distribución) y autor abreviado |

```bash
curl 'localhost:3000/api/v1/beaches?filter[beach_type]=arena-blanca&filter[rating][gte]=4.5&near=18.58,-68.40&radius=30000&include=destination&fields=name,rating'
curl 'localhost:3000/api/v1/restaurants/facets?fields=cuisine_type,price_range'
curl 'localhost:3000/api/v1/hotels?filter[amenities]=spa,pool&filter[stars][gte]=4&q=caribe'
```

Garantías: visibilidad pública estricta (borradores, eliminados, inactivos, programados a futuro, vacantes vencidas y ofertas fuera de vigencia no salen); columnas internas del CMS y datos personales (`rut`, `discount_code`…) nunca se exponen; parámetros desconocidos o valores inválidos dan 400; el listado omite campos pesados (`description`, `gallery`…) y el detalle los incluye; el esquema de respuesta de cada colección se genera de las columnas reales.

**Agregar una colección:** (1) que la tabla exista en una migración; (2) añade su `def(...)` a `COLLECTIONS`; (3) `npm run db:gen-manifest`; (4) `npm test` — una prueba comprueba que cada columna referenciada exista y otra que el manifiesto coincida con la base.

## Autenticación

```bash
# Usuario de desarrollo (lo crea `npm run db:seed`): admin@descubre.local / Admin-Descubre-2026!
curl -s -X POST localhost:3000/api/v1/auth/login -H 'content-type: application/json' -d '{"email":"admin@descubre.local","password":"Admin-Descubre-2026!"}'
curl -s localhost:3000/api/v1/auth/me -H "authorization: Bearer <access_token>"
```

- **Tokens:** acceso JWT RS256 de 15 min; refresco opaco de 30 días, de un solo uso y rotatorio (sólo se guarda el hash). Reutilizar uno ya rotado revoca toda la sesión.
- **Web (cookie):** con la cabecera `X-Refresh-Transport: cookie` el refresco viaja en cookie `HttpOnly` y no en el JSON; esa cabecera obliga a un preflight CORS y bloquea CSRF.
- **Contraseñas:** Argon2id, política de 10–128 caracteres, sin el correo ni claves comunes. Tras 5 fallos la cuenta se bloquea 15 min; el error es el mismo exista o no el correo. Máximo 3 correos de restablecimiento por hora a una cuenta.
- **Proteger una ruta:** `preHandler: app.authenticate` o `app.requireRole("admin", "editor")`.

### Claves JWT y rotación

```bash
npm run keys:generate     # imprime JWT_PRIVATE_KEY y JWT_PUBLIC_KEY (una línea con \n) y el kid
```

Guárdalas en tu gestor de secretos. En producción son obligatorias (en desarrollo se genera un par efímero). Al arrancar se comprueba que sean un par y que sean RSA de ≥ 2048 bits. Cada token lleva el `kid`; las claves públicas están en `GET /.well-known/jwks.json`.

**Rotar sin cortar sesiones:** (1) `keys:generate` → nuevo par; (2) el par nuevo pasa a `JWT_PRIVATE_KEY`/`JWT_PUBLIC_KEY`; (3) la pública anterior se agrega a `JWT_PREVIOUS_PUBLIC_KEYS='["-----BEGIN PUBLIC KEY-----\n…"]'`; (4) despliega; (5) pasados 15 min (el tiempo de vida del acceso) retira la anterior.

### Verificación en dos pasos (TOTP)

`POST /auth/2fa/setup` → secreto y URI `otpauth://` para el QR · `POST /auth/2fa/enable {code}` → activa y entrega 10 códigos de recuperación (una sola vez) · el login devuelve `two_factor_required` + `challenge_token` (5 min) que se canjea en `POST /auth/2fa/verify` con el código de la app o uno de recuperación · `POST /auth/2fa/disable` y `/auth/2fa/recovery-codes` piden contraseña o código.

El secreto se guarda cifrado (AES-256-GCM, clave `TOTP_ENCRYPTION_KEY`), cada código TOTP sirve una sola vez, los fallos suman al bloqueo de la cuenta y los códigos de recuperación se guardan como hash. Con `REQUIRE_2FA_FOR_STAFF` (por defecto **sí en producción**) las rutas protegidas con `requireRole("admin"|"editor"|"moderator")` responden `403 MFA_REQUIRED` hasta que la sesión cumpla el segundo factor, y el personal no puede desactivarlo.

### Login social (Google, OIDC)

Actívalo con `OAUTH_GOOGLE_CLIENT_ID` y `OAUTH_GOOGLE_CLIENT_SECRET`; la URI de redirección autorizada en Google es `{PUBLIC_BASE_URL}/api/v1/auth/oauth/google/callback`. Flujo: `POST /auth/oauth/google/start` → `authorize_url` → el navegador va a Google → vuelve a `redirect_to?oauth_code=…` → `POST /auth/oauth/exchange {code}` → sesión. Usa PKCE S256, `state` de un solo uso atado por cookie, `nonce` y verificación del id_token; `redirect_to` sólo puede ser un origen de la lista blanca (`WEB_BASE_URL`, `CORS_ORIGINS`, `OAUTH_REDIRECT_ALLOWLIST`). Un correo no verificado por el proveedor no crea ni vincula cuentas, y si el correo coincide con una cuenta **sin verificar**, se anula su contraseña y sesiones (anti pre-secuestro). También hay vincular/desvincular (`/auth/identities`). Para añadir otro proveedor OIDC basta una entrada en `providers()` (`src/modules/auth/oauth.ts`); **Apple** (necesita un secreto JWT ES256) y **Facebook** (OAuth2 no OIDC) quedan pendientes.

## Motor de reservas de Operadores RD

El servidor decide precio, disponibilidad, cobros y comisión; el cliente sólo muestra. Reglas portadas del frontend (etapas 1–8) en `src/modules/operators/domain/` (funciones puras, con pruebas unitarias):

- **Precio por noche**: temporada > fin de semana (noches vie/sáb) > tarifa base; noches mínimas y fechas bloqueadas por habitación.
- **Tours/experiencias**: cupos por fecha y horario; niños con `child_price`; bebés gratis sólo si `infants_free` y no ocupan cupo; extras por persona/reserva/noche.
- **Promoción** sobre el subtotal (con extras); **depósito** = % del total. Paquetes: `days` fija la fecha final.
- **Cancelación**: flexible (100 % ≥24 h), moderada (100 % ≥5 días), estricta (50 % ≥7 días); si cancela el operador se devuelve todo.
- **Comisión** (8 % por defecto): sólo sobre lo cobrado en reservas web, neto de reembolsos; las manuales no pagan.

Anti-sobreventa: cada reserva corre en una transacción que bloquea (`FOR UPDATE`) el anuncio o la habitación, recuenta la ocupación y luego inserta. `POST /bookings` exige `Idempotency-Key`: reintentar devuelve la misma reserva (200, `replayed: true`).

| Zona | Endpoints |
|---|---|
| Público | `GET /operators`, `/operators/{slug}`, `/operators/{slug}/listings/{listing}`, `/listings/{id}/availability`, `POST /bookings/quote`, `POST /promotions/validate`, `POST /bookings`, `GET /bookings/{id}?token=`, `POST /bookings/{id}/cancel`, `POST /bookings/{id}/pay-balance`, `GET /me/bookings` |
| Operador (`org_members`: owner/admin/recepcion/guia; guía limitado a sus anuncios; cabecera opcional `X-Org-Id`) | `POST /orgs`, `/orgs/me`, `/org/listings` (+ rooms, rates, blocks, status), `/org/bookings` (+ status, notas, pagos), `/org/calendar`, `/org/income`, `/org/promotions` |
| Admin | `GET /admin/orgs`, `PUT /admin/orgs/{id}/verification` (publicar exige operador verificado) |

Pagos: el backend nunca recibe tarjetas; el navegador manda un `payment_method_token` del proveedor. `PAYMENT_PROVIDER=fake` (dev/pruebas: `tok_test_ok`, `tok_test_declined`, `tok_test_error`) o `none` (por defecto en producción hasta integrar Azul/CardNET/Stripe: sólo "pagar después"). Un pago rechazado anula la reserva y libera cupo y código promocional. El invitado accede a su reserva con el `access_token` devuelto al crearla (sólo se guarda su hash).

### Fase B: equipo, mensajes, reseñas, calendarios, reportes y auditoría

- **Equipo**: `GET /org/team`, `POST/DELETE /org/team/invitations`, `PATCH/DELETE /org/team/members/{id}`, y públicos `GET /team-invitations/{token}` + `POST /team-invitations/{token}/accept` (exige la cuenta con el correo invitado). Sólo se gestiona a roles inferiores (el propietario a todos; un admin sólo recepción y guía); un guía debe tener servicios asignados y sólo ve sus reservas, calendario y reseñas. El token se guarda como hash y vence a los 7 días.
- **Mensajes**: cada reserva abre la conversación `web-{booking_id}`; `GET/POST /org/messages[/{thread}]` para el operador y `POST /bookings/{id}/messages?token=` para el viajero.
- **Reseñas verificadas**: `POST /bookings/{id}/review` sólo con la reserva `completed`, una por reserva; recalcula `rating` y `reviews_count` del servicio. `GET /listings/{id}/reviews` (público), `GET /org/reviews`, `PUT /org/reviews/{id}/reply`.
- **iCal**: `GET /ical/{token}.ics` (URL secreta por habitación, sin datos personales ni bloqueos importados) e importación de hasta 5 calendarios externos por habitación (`POST /org/rooms/{id}/calendar-links`, `POST /org/calendar-links/{id}/sync`, `DELETE`). La importación exige https, resuelve el DNS y rechaza redes privadas (SSRF); si una sincronización falla se conserva lo importado.
- **Automatizaciones** (`JOBS_ENABLED`, cada 5 min, con candado consultivo entre instancias): recordatorio ~24 h antes, solicitud de reseña al completar (emite un token nuevo de acceso para el enlace) y sincronización de calendarios con más de 1 h.
- **Reportes**: `GET /org/reports/summary?from&to` (totales, cancelación, por servicio, canal, mes y promoción).
- **Admin**: `POST /admin/users/{id}/2fa/reset` (motivo obligatorio, cierra sesiones, avisa por correo, no aplica a uno mismo) y `GET /admin/audit`. Se auditan verificaciones de operadores, invitaciones, cambios de equipo y resets de 2FA (tabla `audit_log`).

### Trabajos programados y liquidaciones

`JobRunner` (`src/modules/jobs`) guarda el estado en `system_cron_jobs` y reclama cada trabajo con un UPDATE atómico, así que varias instancias no lo duplican; uno "running" por más de 1 h se considera huérfano. Con `JOBS_ENABLED=true` revisa cada 30 s. Admin: `GET /admin/jobs`, `POST /admin/jobs/{name}/run`, `PATCH /admin/jobs/{name}` (activar/frecuencia).

Trabajos: `bookings.reminders`, `bookings.review_requests`, `ical.sync`, `bookings.expire_pending` (pago en línea sin cobrar tras 30 min → cancela y libera cupo/código), `bookings.balance_due` (saldo a 3 días), `bookings.min_guests_check` (avisa al operador, una vez por salida), `promotions.expire`, `payouts.generate` (semanal).

Liquidaciones: sólo lo cobrado en línea (no los cobros manuales) de reservas `completed`, menos reembolsos y comisión; cada reserva entra en un solo lote. Operador (owner): `GET /org/payouts`, `/org/payouts/{id}/items`. Admin: `GET/POST /admin/payouts`, `GET /admin/payouts/{id}/items`, `POST /admin/payouts/{id}/mark-paid` (comprobante obligatorio, auditado, avisa al operador).

### Pasarela de pago: Stripe y conciliación

`PAYMENT_PROVIDER=stripe` (con `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET`) cobra con PaymentIntents por REST, sin SDK: el navegador crea un `PaymentMethod` (`pm_…`) con Stripe.js y lo manda como `payment_method_token`. Toda llamada lleva `Idempotency-Key` y el intento lleva `booking_id` en los metadatos. Si el banco exige 3-D Secure (`requires_action`) el intento se cancela y se rechaza; soportarlo necesita el flujo de `client_secret` en el frontend.

`POST /api/v1/webhooks/payments/stripe` verifica `Stripe-Signature` (HMAC-SHA256, tolerancia de 5 min, tiempo constante) sobre el cuerpo crudo y procesa cada evento una sola vez (`payment_events`). Concilia: cobros cuya respuesta se perdió (reserva pendiente → pagada), cobros huérfanos de reservas ya canceladas (se reembolsan solos y queda auditado), reembolsos hechos en el panel de Stripe y disputas (auditadas). Un pago o reembolso no puede registrarse dos veces (índice único por proveedor y referencia). `payment_status` se calcula con lo cobrado menos lo reembolsado.

Azul/CardNET (tarjetas locales) se agregan como otra clase que implemente `PaymentGateway`; la decisión de proveedor sigue abierta con Finanzas (docs §11.5).

## Usuario, captación y soporte

- **Perfil (`/me/*`)**: `GET/PATCH /me/profile`, `GET/PUT /me/preferences` (idioma, moneda, consentimientos de marketing/analítica —auditados— y notificaciones por canal y tipo; lo transaccional va activado por defecto y las promociones no), favoritos (`PUT/DELETE /me/favorites/{tipo}/{id}`, idempotentes; ids de texto para servicios de operadores), bandeja (`/me/notifications`), exportación JSON (`GET /me/export`) y perfil público con seguidores (`/users/{id}/public`, `/users/{id}/follow`).
- **Eliminar cuenta (Ley 172-13)**: `DELETE /me` pide la contraseña, cierra sesiones y abre 30 días de gracia (`POST /me/deletion/cancel` la revierte; un propietario de organización debe transferirla primero). El trabajo `gdpr.process` anonimiza la cuenta pasada la gracia: borra favoritos, notificaciones y membresías, y conserva las reservas sin ligarlas al usuario.
- **Newsletter**: `POST /newsletter/subscribe` (doble opt-in; la respuesta no revela si el correo ya existe), confirmación y baja con un clic (`GET|POST /newsletter/confirm|unsubscribe`). El token de baja es un HMAC con `APP_SECRET` (obligatorio en producción, mínimo 32 caracteres), apto para enlaces en campañas.
- **Contacto y soporte**: `POST /contact` (ticket + acuse por correo), tickets del usuario (`/support/tickets`, sólo visibles para su dueño), `POST /leads` (exige consentimiento) y `POST /establishments/register` + `GET /establishments/registrations/{id}/status?token=` (alta pendiente de revisión). Los formularios públicos tienen campo trampa contra bots y límites por IP.

### Reseñas del portal

`POST /reviews` (una por persona y lugar; `entity_type` de cualquier colección con reseñas), `PATCH/DELETE /reviews/{id}`, `POST /reviews/{id}/helpful` (una vez, no la propia), `POST /reviews/{id}/report` (a los 3 reportes distintos se oculta hasta revisarla), `GET /me/reviews` y `POST /reviews/{id}/reply` (equipo del sitio). La lectura pública sigue en `/{colección}/{id}/reviews`.

Moderación automática: enlaces, datos de contacto, MAYÚSCULAS, caracteres repetidos, groserías o cuenta sin verificar → `pending`; lo demás se publica. Editar vuelve a moderar. Cola en `GET /admin/reviews` y `PATCH /admin/reviews/{id}` (admin/moderator, auditado). Al cambiar el estado se recalcula `rating` y `review_count` de la entidad cuando su tabla los tiene.

### RD Social, encuestas, concursos y vacaciones

- **RD Social**: `GET /social/feed` (`latest|following|trending|province`, paginación por cursor), `POST/DELETE /social/posts`, likes idempotentes con contadores, comentarios (3–500 caracteres) y `GET /social/me/comment-stats`. Publicar y comentar exige correo verificado, máximo 10 publicaciones al día y rechaza enlaces, datos de contacto y groserías (la misma detección que las reseñas). `xp_awarded` vale 0 hasta que exista la gamificación.
- **Reportes y medios de usuarios**: `POST /ugc/reports` (uno por persona; a los 3 una publicación se oculta hasta que un moderador la restaure), `POST /ugc/media` (queda pendiente) y `GET /ugc/media` (sólo aprobados). Moderación en `/admin/ugc/*` y `PATCH /admin/social/posts/{id}`, todo auditado.
- **Encuestas**: `GET /surveys/{slug}`, `POST /surveys/{slug}/responses` (validadas contra la estructura: rating, nps, texto, opción y múltiple; con cuenta se responde una vez). Admin: crear, activar y `GET /admin/surveys/{slug}/results` (NPS, medias y distribución).
- **Concursos**: `GET /contests[/{slug}]`, `POST /contests/{slug}/register` (abierto, una vez, correo verificado, edad mínima, cupo máximo), `GET /contests/{slug}/winners` (nombre abreviado). Admin: crear, ver inscritos y `POST /admin/contests/{slug}/draw` (sorteo al azar al terminar).
- **Vacaciones**: `POST /vacation-registrations` (visitantes con contacto o usuarios con cuenta).

## Administración del portal (CMS integrado)

Cada colección pública tiene su administración bajo `/admin/{colección}` (p. ej. `/admin/beaches`), generada a partir de `manifest.json`; roles `editor` y `admin`. Los endpoints no se listan uno por uno en `/docs`: `GET /admin/{colección}/schema` describe los campos (tipo, editable, buscable, filtrable) para construir formularios.

- **CRUD**: `GET` (todos los estados; `q`, `status`, `filter[col]`, `sort`, `deleted=true`), `POST` (siempre crea un **borrador**; genera un slug único), `PATCH` (**exige `version`**: si otra persona editó antes, responde 409 `VERSION_CONFLICT` con la versión actual), `DELETE` (lógico; `?hard=true` sólo admin). El esquema de entrada es estricto: una columna desconocida o gestionada por el sistema (`status`, `version`, `created_by`…) es un 400.
- **Flujo editorial**: `submit-review` (editor) → `publish` / `unpublish` / `archive` (sólo admin). Publicar valida slug y título, acepta `publish_at` futuro y mantiene `is_active` coherente con el estado. Cambiar el slug conserva el anterior en `slug_history`.
- **Revisiones**: cada cambio guarda una versión (`content_revisions`); `GET …/{id}/revisions` y `POST …/{id}/restore/{version}`. Editar contenido publicado tiene efecto inmediato (no hay "copia de trabajo"); el historial permite volver atrás.
- **Masivo, importación y exportación**: `POST …/bulk` (publicar, archivar, borrar o `set_field`; informa `ok` y `failed`), `POST …/import` (filas JSON, upsert por slug, `dry_run` por defecto, todo o nada) y `GET …/export?format=csv|json` (el CSV neutraliza fórmulas).
- **Usuarios** (`/admin/users`): listado con filtros, detalle, `PUT …/roles` (no los propios ni el último admin), `suspend`/`unsuspend`, `reset-password`; todo auditado y cierra las sesiones afectadas.
- **Sitio**: `GET/PUT/DELETE /admin/settings/{clave}` y `GET /site/settings` (sólo los marcados públicos), `/admin/seo_redirections` con detección de bucles y `GET /redirects`, `GET /admin/dashboard`, `GET /admin/system/health` y `GET /admin/audit-logs` (con `?format=csv`).
- **Sesiones**: un token de acceso deja de servir en cuanto su sesión se revoca (cierre de sesión, suspensión, cambio de roles o de contraseña, reset de 2FA); se comprueba con una caché de 5 s.

## Gamificación

Una sola puerta de escritura: `GameService.grant()` (transaccional, con el jugador bloqueado). Los puntos los fija la tabla `gamification_rules` (XP, monedas, tope diario, enfriamiento y unicidad por referencia); **el cliente sólo informa qué hizo, nunca cifras**. Cada concesión queda en `gamification_transactions`.

- **Acciones**: los módulos otorgan por su cuenta lo que pueden verificar (reseña aprobada, favorito, publicación y comentario en RD Social, reserva completada). `POST /gamification/actions` sólo admite acciones marcadas `client_allowed` (visitar página, compartir, lugar visitado) y las insistencias contra el tope suman una bandera antifraude (`user_flags`).
- **Perfil**: `GET /gamification/me` (XP, monedas, nivel y progreso, racha, insignias, liga y puesto), `/me/transactions` (cursor), `/levels`, `/rules`, `/leaderboard?scope=season|week|all`, `/seasons/current`, `/leagues`.
- **Retención**: `check-in` diario en hora de RD (la racha multiplica el XP: 3 días ×1,2 · 7 ×1,5 · 14 ×2 · 30 ×2,5), `early-bird` (antes de las 8:00), `streak-bonus` (7/14/30/60/100 días, una vez por hito) e hitos de XP.
- **Misiones** (diarias/semanales/especiales) avanzan solas con las acciones reales y pagan una vez por período. **Logros** con condición evaluada en el servidor (`xp>=N`, `level>=N`, `streak>=N`, `missions>=N`, `referrals>=N`, `action:<acción>>=N`); los secretos se ocultan hasta desbloquearse.
- **Premios**: `POST /gamification/prizes/{id}/redeem` descuenta monedas y stock en una transacción (nunca se vende más que el stock), genera el código y, si es físico, crea el envío; el admin lo avanza `pending → packed → shipped → delivered`.
- **Trivia**: las preguntas se entregan sin la respuesta, se corrigen en el servidor y el XP sale de los aciertos (con tope por partida). **Referidos**: un código por persona, se aplica una vez, en cuentas nuevas con correo verificado.
- **Trabajos**: `gamification.streaks` (rachas rotas), `gamification.leagues` (liga y premio semanal) y `gamification.season_rollover` (reparte `top_rewards` y abre la siguiente temporada).
- **Admin**: `POST /gamification/xp/award` (con motivo, auditado), `/admin/gamification/stats`, `/admin/gamification/shipments`, cierre de temporada, y CRUD de `achievements`, `gamification_levels|missions|prizes|rules|seasons|leagues`, `trivia_questions` y `xp_milestones` bajo `/admin/{tabla}`.

Pendiente del §5.11: pasaporte con sellos por GPS/QR, rutas gamificadas con checkpoints, coleccionables, retos de foto, gremios y embajadores.

## Tienda oficial

- **Catálogo** (`/store/products`, `/store/products/{slug}`, `/store/categories`): precios en DOP con equivalente en USD (tasa vigente de `exchange_rates`, o `DEFAULT_USD_DOP`); lo inactivo o borrado no se ve.
- **Carrito** (`/cart`, `/cart/items`, `/cart/coupon`): de la cuenta, o de invitado con el encabezado `X-Cart-Token` (el token se entrega una sola vez al crear el carrito y sólo se guarda su hash). `POST /cart/merge` fusiona el de invitado con el de la cuenta al iniciar sesión. Se validan tallas, colores, stock y el máximo de 20 por producto.
- **Cotización** (`POST /checkout/quote`): subtotal, cupón, envío (gratis desde RD$ 2 500, si no RD$ 250), ITBIS incluido y total en DOP y USD. Cupones por porcentaje o monto, con mínimo, vencimiento, usos máximos y límite por persona (`POST /coupons/validate`).
- **Pedidos** (`POST /orders`, `Idempotency-Key` obligatorio): dentro de una transacción bloquea los productos (en orden de id), recomprueba stock y precios, descuenta stock, cuenta el cupón y guarda una instantánea de cada línea; luego cobra con la pasarela. Un cobro rechazado o caído cancela el pedido y devuelve stock y cupón, y el cliente conserva su carrito. Con Stripe se cobra el equivalente en USD con la tasa guardada en el pedido (Stripe no procesa DOP); los cobros, reembolsos y cobros huérfanos también se concilian por el webhook.
- **Seguimiento**: `GET /orders/{id}?token=` (invitado) o con sesión, `GET /me/orders`, cancelación antes del envío con reembolso total y devolución dentro de 72 h de la entrega. Estados: `pending → paid → processing → shipped → delivered` (+ `cancelled`, `refunded`, `return_requested`); cada cambio avisa por correo.
- **Admin** (`/admin/store/orders`, `/admin/store/products`, `/admin/discount_coupons`): estados con guía de envío obligatoria, reembolso total o parcial (con o sin devolver stock), catálogo y cupones; todo auditado. El trabajo `orders.auto_cancel` libera los pedidos sin cobrar tras 60 min.

Pendiente del §5.9: Marketplace de vendedores (productos y liquidaciones a vendedores), `/ambassadors/track` y `track-sale`.

## Búsqueda, mapa y datos vivos

- **Búsqueda** (`GET /search`, `/search/suggest`, `/search/popular`): global sobre las colecciones con título, sin acentos ni mayúsculas y tolerante a errores leves (trigramas); ordena por relevancia (exacta > prefijo > contiene > similar), respeta la visibilidad pública y admite `types=`. Las consultas se registran sin datos personales como eventos `search` para las "búsquedas frecuentes".
- **Mapa y ubicación**: `GET /map/layers`, `GET /map/features?layer=&bbox=` (GeoJSON de una o varias capas), `GET /geo/nearby` (varias colecciones, del más cercano al más lejano), `GET /geo/reverse` (provincia, municipio y destino a menos de 60 km) y `GET /recommendations/home` (secciones de portada; con sesión se priorizan los tipos que el usuario guarda y se omite lo que ya marcó).
- **Datos vivos** (`/live/*`, `/lotteries`, `/utils/convert`): tasas con historial y conversor (punto medio compra/venta, pasando por DOP; sin tasa cargada sólo el dólar usa `DEFAULT_USD_DOP`), combustibles con variación semanal, loterías con sorteos y resultados, clima y pronóstico por ciudad (con marca `stale` si tiene más de 3 h), alertas vigentes por gravedad, estado del mar, reportes marinos, webcams, eventos de hoy y zonas horarias.
- **Proveedores externos**, apagados por defecto (`*_PROVIDER=none`): `FX_PROVIDER=open_er_api` (tasas cada 30 min con margen `FX_SPREAD_PCT`) y `WEATHER_PROVIDER=openweather` con `OPENWEATHER_API_KEY` (clima y pronóstico de 8 ciudades). Se validan los datos recibidos (una tasa absurda no se guarda) y un fallo conserva lo último conocido. Combustibles y loterías no tienen API pública fiable: los carga el equipo (`/admin/fuel_prices`, `/admin/lotteries`, `/admin/lottery_results`, …, roles admin y editor, con el CRUD genérico de tablas). `POST /admin/live/refresh?source=fx|weather` fuerza la actualización.

Pendiente del §5.4/§5.5: asistente y generadores con IA (`/ai/*`), calculadoras y herramientas (`/calculators/*`, `/tools/*`), vuelos y traducción de resultados de búsqueda.

### Calculadoras y herramientas

`POST /calculators/{budget|tax|confotur|carbon|tolls|packing-list}` son funciones puras (`src/modules/tools/calculators.ts`) con las reglas que hoy viven en el frontend: presupuesto por rubro y estilo (vuelos una sola vez), cuenta con ITBIS 18 % + propina de ley 10 %, beneficios CONFOTUR (transferencia 3 %, IPI 1 %, ISR 20 % de rentas, activos 1 % de empresas, hasta 15 años), huella de carbono (vuelo 0,115 kg/km por pasajero, guagua, lancha, vehículo compartido; árboles a 22 kg/año) con proyectos de compensación del CMS, peajes de las rutas publicadas y lista de empaque según días, clima y actividades. Las cifras se ajustan en `site_settings` (`calculators.budget|tax|confotur|carbon`): sólo se aceptan números no negativos de campos que ya existen (`GET /admin/calculators/defaults` muestra lo vigente).

Herramientas: `GET /tools/dictionary` (sin acentos), `/tools/phrases?lang=`, `/tools/requirements?country=`, ofertas de afiliados `/tools/{esim|insurance|prepaid-card}` con `POST …/lead` (consentimiento obligatorio, campo trampa, guarda en `marketing_leads`). Glosario, frases, requisitos, distancias de vuelo y ofertas se editan en `/admin/{dictionary_terms|travel_phrases|entry_requirements|flight_routes|affiliate_offers}` (admin y editor).

## Publicidad y marketing

- **Servidor de anuncios**: `GET /ads?placement=&page=&section=&limit=` sirve banners publicados, activos y dentro de fechas (hora de RD), con rotación ponderada por `priority` y sin exponer el destino (`click_url` pasa por el servidor). `GET /ads/slots` da las dimensiones de cada espacio. Vistas (`POST /ads/impressions`, `/ads/{id}/impression`) y clics (`GET /ads/{id}/click`, redirige sólo a https o rutas propias) se cuentan una vez por sesión, banner y hora en `ad_stats`; no se guarda IP ni sesión, sólo un hash truncado (`ad_seen`, limpiado por `ads.cleanup`). `GET /admin/ads/reports` da vistas, clics y CTR por banner y anunciante.
- **Solicitudes de publicidad** (`POST /advertisers/requests`): lead + ticket + acuse por correo, con consentimiento y campo trampa.
- **Ofertas**: `POST /offers/{id}/redeem` (una vez por persona, sólo vigentes) devuelve el código de descuento; el listado y la geolocalización siguen en `/offers`.
- **Campañas de correo** (`/admin/marketing/campaigns`): borrador → prueba a tu correo → programar → cancelar. El trabajo `newsletter.send` (cada 5 min) envía las vencidas sólo a suscriptores confirmados y activos, filtra por intereses del segmento, registra cada entrega para no duplicar y añade el enlace de baja firmado. Leads con estado en `/admin/marketing/leads`.
- **Administración**: `/admin/ad_banners` y `/admin/ad_slots` (admin y editor).

## Analítica

- **Ingesta** (`POST /analytics/events`, lotes de hasta 50): anónima y respetuosa. No guarda nunca la IP: sólo país (cabecera del proxy), host de origen y ruta sin parámetros ni fragmento; las propiedades se limpian (se descartan campos que parecen correo, teléfono, nombre, token o tarjeta). Con `Do-Not-Track`, `Sec-GPC` o `consent: false` responde 204 sin guardar nada. Una hora de cliente absurda se reemplaza por la del servidor.
- **Paneles** (`/admin/analytics/*`, admin): `overview` (usuarios, reseñas, favoritos, publicaciones, reservas, ingresos, vistas y sesiones con serie diaria), `traffic` (por página, origen, país o día), `top-content` (más visto o más guardado, con el nombre de la entidad), `funnels/{reserva|registro|tienda}` (calculados con datos reales de la misma población, con porcentajes), `nps` (con comentarios), `search-terms` (búsquedas sin resultados) y `export.csv` (neutraliza fórmulas y queda auditado). Los rangos se interpretan en hora de RD.
- **Retención**: `analytics.rollup` agrega por día lo que supera 13 meses y borra los eventos crudos; `traffic` lee lo antiguo del agregado.
- **Público**: `GET /statistics/public` combina las cifras oficiales del equipo (`site_settings` `statistics.public`) con conteos del portal.

## Traducciones

- **Interfaz**: `GET /i18n/dictionary/{locale}?ns=&fallback=` (con ETag; lo que falta cae al español), `GET /i18n/locales` (6 idiomas con cobertura) y `PUT /admin/i18n/dictionary/{locale}` (admin: hasta 2 000 cadenas por llamada, atómico, sólo texto plano: se rechaza `<script>`, `<iframe>`, `javascript:` y manejadores `on…=`). Corregir un texto no requiere redeploy.
- **Contenido**: `PUT /admin/translations/{tabla}/{id}/{idioma}` (admin/editor) valida que el campo sea traducible y que la entidad exista; un texto vacío borra la traducción; las traducciones escritas por una persona quedan `human` y se ven de inmediato con `?lang=` en la API pública. `GET /admin/translations` filtra por entidad, idioma y estado; `POST …/review` marca como `reviewed` las automáticas; `GET /admin/translations/coverage` da el porcentaje traducido por colección e idioma.
- **Traducción automática**: `POST /admin/translations/{tabla}/{id}/auto` responde 503 `NO_TRANSLATION_PROVIDER` hasta que se conecte un proveedor (IA/DeepL); el estado `machine` ya está previsto en la base.

## Archivos y medios

Flujo: `POST /media/upload-url` (sesión; tipo, tamaño y finalidad) → `PUT` del binario a la URL firmada (HMAC con `APP_SECRET`, vence a los 15 min, ligada al tipo y tamaño declarados, de un solo uso) → `POST /media/{id}/complete`, que valida el **archivo real**: formato por sus primeros bytes (no por lo que diga el cliente), coincidencia con lo declarado, mínimo 16 px, máximo 12 000 px y 60 Mpx. Lo que finge ser una imagen se rechaza y se borra.

- **Límites por finalidad**: avatar 2 MB, foto de reseña 5 MB, UGC 8 MB, imagen de anuncio 8 MB, CMS 10 MB; sólo jpeg, png, webp y gif (nunca SVG). Las imágenes de anuncio y de CMS las suben el equipo o miembros de una organización.
- **Moderación**: las fotos de reseñas y UGC quedan `in_review` (sólo las ve su dueño y el equipo) hasta que un moderador las aprueba (`POST /admin/media/{id}/moderate`, el rechazo exige motivo y borra el binario); lo que sube el equipo se publica directo.
- **Servido**: `GET /media/files/{id}` con `nosniff`, `Content-Security-Policy: sandbox` y caché inmutable de un año una vez aprobado. `GET /media/{id}` da metadatos y URL; `DELETE /media/{id}` (dueño o admin). `GET /admin/media` es la biblioteca con filtros; `POST /admin/media/import-url` descarga una URL https pública (sin acceso a redes internas), valida el archivo y lo guarda como propio.
- **Almacenamiento**: disco local en `MEDIA_DIR` (`storage/media`, fuera de git) detrás de la interfaz `MediaStorage`; para varios servidores se implementa la misma interfaz con S3. `media.cleanup` borra subidas sin completar de más de 24 h.
- **Pendiente**: variantes (`thumb`, `card`, `hero`, webp/avif) y antivirus necesitan una librería de imágenes y un servicio externo; hoy sólo existe la variante `original`.

## Operación y seguridad

- **Salida a producción, respaldos, monitoreo, retención y respuesta a incidentes**: [`docs/BACKEND_OPERACION.md`](../docs/BACKEND_OPERACION.md).
- **Controles, hallazgos de la revisión y riesgos residuales**: [`docs/BACKEND_SEGURIDAD.md`](../docs/BACKEND_SEGURIDAD.md).
- `npm run db:backup -- --verify` (respaldo + prueba de restauración), `npm run audit`, `GET /metrics` (con `METRICS_TOKEN`), variable `TRUST_PROXY` (por defecto no se acepta `X-Forwarded-For`) y trabajo `maintenance.purge`.
- La autenticación se ejecuta en `onRequest` (antes de leer y validar el cuerpo) y `test/security.test.ts` verifica sobre el inventario real de rutas que todo lo administrativo, del operador y de la cuenta exige sesión.

## Correo

`app.mailer.send({ to, template, data, locale })` **encola** en la tabla `email_log` y vuelve; un trabajador (en el mismo proceso, `MAIL_WORKER_ENABLED`, o en otro) toma los pendientes con `FOR UPDATE SKIP LOCKED`, así que varias instancias nunca envían dos veces. Reintenta con espera creciente (1 min, 5 min, 30 min, 2 h, 12 h) hasta `MAIL_MAX_ATTEMPTS` y luego marca `failed`; los mensajes que quedaron `sending` por un proceso caído se recuperan. Si se pasa la conexión de una transacción (`send(input, client)`) el correo forma parte de ella (outbox transaccional: el registro y su correo se guardan juntos o no se guarda ninguno).

Transportes: `MAIL_TRANSPORT=log` (desarrollo: el mensaje con sus enlaces sale en el log) · `smtp` (Mailpit de docker-compose en :1025, SES, etc.) · `memory` (pruebas). Con un volumen muy alto se puede pasar a BullMQ/Redis sin cambiar la interfaz.

## Límites de tasa

`RATE_LIMIT_STORE=memory` (por defecto, una sola instancia) · `postgres` (tabla `rate_limits`, atómica, compartida entre instancias, sin infraestructura extra) · `redis` (`REDIS_URL`). Cada ruta con límite propio (registro, login, olvidé mi contraseña, 2FA, OAuth) tiene su contador. Si el almacén falla la API sigue respondiendo (falla abierta): los intentos de contraseña y de segundo factor siguen protegidos por el bloqueo de cuenta, que vive en la base de datos. En producción con `memory` se registra una advertencia.

## Cola de telemetría (Fase 9.1)

`app.telemetryQueue` (`src/lib/telemetry-queue.ts`) delega a Redis la ingesta de `POST /analytics/events` cuando `REDIS_URL` está configurado: cada lote del cliente se encola (`LPUSH telemetry:analytics_events`) en vez de insertarse directo en la tabla transaccional, y el trabajo programado `analytics.flush_queue` (cada 30 s) lo vacía en lotes de hasta 500 filas con `RPOP ... COUNT`. Sin `REDIS_URL`, o si falla encolar algún evento del lote, se inserta directo como antes — el cambio es transparente y no requiere infraestructura adicional para desarrollo o una sola instancia.

Deliberadamente **no** se encola `sponsorship_events`: su inserción vive dentro de la misma transacción que valida la creatividad/campaña y actualiza `impressions_count`/`clicks_count`/`budget_spent` (dinero real). Diferir esa escritura cambiaría cuándo se confirma el gasto publicitario y podría perder eventos con efecto financiero si el proceso muere antes de vaciar la cola; se prioriza la consistencia inmediata sobre el throughput ahí.

## Bloqueo entre instancias en trabajos programados (Fase 9.2)

`JobRunner.execute()` (`src/modules/jobs/runner.ts`) ya reclama cada trabajo vencido con un único `UPDATE system_cron_jobs SET status = 'running' ... WHERE (status IS DISTINCT FROM 'running' OR started_at < now() - interval '60 min') RETURNING id`: el `UPDATE` es atómico a nivel de fila en PostgreSQL, así que con varias instancias corriendo el mismo proceso sólo una obtiene la fila devuelta y ejecuta el trabajo — el resto ve `rowCount = 0` y no hace nada. Un trabajo que quedó `running` más de 60 minutos (proceso caído) se considera huérfano y se puede reclamar de nuevo. Cumple el mismo objetivo que `pg_advisory_lock`/Redlock sin depender de una conexión persistente ni de infraestructura adicional, y además deja el estado de cada trabajo visible y editable desde el panel admin.

## Verificación de magic bytes en medios (Fase 9.3)

`readImage`/`sniffMime` (`src/modules/media/images.ts`) detectan el formato real de cada archivo subido por sus primeros bytes (firma PNG/JPEG/WebP/GIF), no por el `Content-Type` que declare el cliente ni por su extensión; `POST /media/:id/complete` y la importación por URL rechazan cualquier archivo cuyos bytes no correspondan a una imagen válida antes de procesarlo con `sharp` o de pasarlo al antivirus.

## Paginación por cursor en las colecciones del CMS (Fase 10.21)

Todo listado de una colección (`GET /destinations`, `/hotels`, ...) sigue aceptando `page`/`per_page` como siempre, pero ahora también admite `cursor` — más barato en páginas avanzadas, porque evita el `OFFSET`, que en Postgres obliga a recorrer y descartar todas las filas anteriores (cada vez más lento cuantas más páginas se avanzan). El flujo: pedir la primera página normal, y si la respuesta trae `meta.next_cursor`, usarlo como `?cursor=...` para pedir la siguiente; cuando no queden más filas, `next_cursor` es `null`.

El cursor es opaco (base64url de los valores de la fila con la que terminó la página, en las columnas del `ORDER BY` activo) y sólo es válido junto con el mismo `sort` con el que se generó — no tiene sentido "seguir" en un orden distinto. No todo orden admite cursor: si alguna de sus columnas permite `NULL` en el esquema real (un `NULL` rompe silenciosamente la comparación `</>`), o el orden es por `distance` (con `near`, una expresión calculada), `meta.next_cursor` sencillamente no aparece — y si de todas formas se manda un `cursor` en esas condiciones, la API responde `400` en vez de devolver una página incompleta o repetida. `src/modules/content/query.ts` (`keysetEligible`, `buildKeysetWhere`, `resolveCursorWhere`) tiene el detalle; `test/content.test.ts` cubre el recorrido completo, el corte cuando ya no hay más filas, y el rechazo con columnas nulificables.

## Compresión de respuestas (Fase 10.22)

`@fastify/compress` registrado en `registerSecurity` (`src/plugins/security.ts`) comprime toda respuesta con Brotli o gzip según lo que acepte el cliente (`global: true`). Las respuestas ya binarias (imágenes servidas desde `/media/files/*`) no se recomprimen: el filtro por `Content-Type` del propio plugin sólo actúa sobre tipos comprimibles (JSON, texto, XML del sitemap, etc.), así que los listados y exportaciones grandes son los que más se benefician.

## Integridad y operación de la base de datos (grupo B4)

- **Claves foráneas e invariantes** (`0053_db_integrity_fks.sql`): los pedidos de tienda se desligan del usuario al borrarlo (SET NULL), y membresías, movimientos de puntos y entradas de eventos se eliminan en cascada con su dueño; la deduplicación previa garantiza que las restricciones nuevas siempre apliquen. Dos índices únicos parciales cierran las invariantes en la base misma, no sólo en el código: una membresía `ACTIVE` por persona (`uq_user_memberships_active`) y un movimiento de puntos por referencia (`uq_loyalty_ledger_reference`).
- **Concurrencia**: el servicio de membresías serializa el balance de puntos por usuario con `pg_advisory_xact_lock` y escribe el ledger con `ON CONFLICT DO NOTHING` (reintentar una concesión no duplica ni dobla puntos); el alta de membresía cancela la anterior y aprovecha el índice único como respaldo ante carreras (reintento automático ante `23505`). El check-in de entradas es un `UPDATE` condicional atómico (`WHERE status = 'ISSUED'`) — dos escáneres simultáneos: uno gana, el otro recibe 409. El fallback de NCF sin secuencia toma un candado asesor por tipo (`fiscal-fallback:{tipo}`) para que correlativos concurrentes no se pisen; la ruta normal usa `FOR UPDATE` sobre `fiscal_sequences`. Las mismas carreras están probadas con operaciones realmente simultáneas (`test/integrity.test.ts`).
- **Transacciones**: la liquidación de embajadores y la actualización de suscripción de operadores corren en una transacción (o no pasan); la compra de entrada + puntos VIP se escriben juntas.
- **Migrador seguro ante doble ejecución**: `migrate()` toma `pg_advisory_lock(727100)` antes de leer `schema_migrations` — dos despliegues simultáneos no aplican el mismo archivo dos veces (el segundo espera, re-lee y no aplica nada). `scripts/check-migrations.ts` compara el contenido de `migrations/` contra lo aplicado para detectar derivas.
- **Pool** (`src/db/pool.ts`): `statement_timeout` 15 s, `idle_in_transaction_session_timeout` 60 s (nadie queda sentado dentro de una transacción muerta), conexión máxima de espera 10 s, `application_name` identificable en `pg_stat_activity` y manejo del error de cliente inactivo (un reinicio de Postgres no derriba el proceso). Los tipos problemáticos se parsean explícitamente: `numeric` y `bigint` llegan como número (los importes usan `numeric(12,2)`, sin pérdida en ese rango) y `date` queda como texto `YYYY-MM-DD` para evitar desfases de zona horaria.
- **Respaldos**: `npm run db:backup` (pg_dump comprimido en `BACKUP_DIR`, rotación con `--keep N`, 14 por defecto) y `npm run db:backup -- --verify`, que restaura el volcado en una base temporal y compara conteos — una copia sin probar no es un respaldo. Programa lo diario fuera de horas pico, p. ej. cron: `30 3 * * * cd /app/backend && npm run db:backup -- --verify >> /var/log/backup.log 2>&1`. El respaldo no incluye `MEDIA_DIR`: cópialo aparte.
- **PgBouncer**: útil sólo con `pool_mode=session` para esta app — el SSE de notificaciones usa `LISTEN` de PostgreSQL, que es por sesión y se corta con `pool_mode=transaction`; ese cliente debe ir directo a `postgres:5433` (ver `docker-compose.yml`).

## Seguridad de datos y archivos (grupo B5)

- **PII y secretos en logs**: el logger redacta `authorization` y `cookie` (`src/app.ts:36`); el único `console.*` del código imprime sólo `err.message` (`src/db/pool.ts:23`); los errores no controlados van al log vía serializador de Fastify (sin cuerpo ni parámetros) y al cliente como «Error interno». El texto del usuario se redacta antes de salir a proveedores de IA (`src/modules/ai/service.ts:36`). Los secretos (`password_hash`, `totp_secret_enc`) nunca aparecen en respuestas: los esquemas Zod de salida no los incluyen.
- **Webhooks con cuerpo original y anti-replay**: ambos webhooks encapsulan su parser para firmar/verificar el cuerpo crudo. Stripe usa su formato `t=…,v1=…` con tolerancia ±300 s (`src/modules/operators/gateway.ts:105`); el webhook de correo usa `X-Email-Signature: t=<unix>,sha256=<hex>` HMAC sobre `t.<cuerpo>` con la misma tolerancia — una firma capturada deja de servir pasados 5 minutos. Los efectos son idempotentes además: `payment_events` deduplica por id de evento y los estados de `email_log` sólo avanzan.
- **Carga de archivos**: URL firmada (HMAC con expiración, un solo uso, MIME y tamaño declarados en sesión autorizada por propósito) → antivirus fail-closed antes de interpretar nada → magic bytes contra el MIME declarado → topes de píxeles → re-codificación con sharp (descarta archivos dañados y metadatos). Rechazo deja evidencia en auditoría.
- **Servido aislado**: los binarios se sirven con `nosniff`, `content-disposition: inline` y `Content-Security-Policy: default-src 'none'; sandbox`; caché inmutable sólo cuando el activo está aprobado. Las claves de almacenamiento las genera el servidor (UUID) y el disco local valida el formato antes de tocar rutas.
- **Datos sensibles en reposo**: el secreto TOTP va cifrado con AES-256-GCM (`src/modules/auth/totp.ts`) y `TOTP_ENCRYPTION_KEY` es obligatoria en producción.
- **Borrado de cuenta (Ley 172-13)**: `DELETE /me` exige contraseña, revoca sesiones y abre 30 días de gracia (cancelable con `POST /me/deletion/cancel`); el trabajo `gdpr.process` anonimiza al vencer la gracia en una transacción: correo a `deleted-…@invalid.local`, borra TOTP/perfil/favoritos/notificaciones/seguimientos, y deja reservas y tickets de soporte sin datos de contacto (se conservan por contabilidad). Exportación previa de datos en `GET /me/export`.

## Resiliencia e integraciones externas (grupo B6)

- **SSRF (B6.51, B6.59)**: la importación de calendarios por URL resuelve el host y rechaza direcciones privadas/loopback/link-local antes de hacer la petición (`isPrivateIp`, `src/modules/operators/ical.ts:13`); todo lo que importa queda dentro de la organización del miembro autenticado, nunca global.
- **Circuit breaker (B6.52)**: `CircuitBreaker` (`src/lib/breaker.ts`) abre el circuito tras 5 fallos seguidos y lo prueba de nuevo a los 5 minutos (FX y clima en `src/modules/live/service.ts:38`, 300 s) o 60 segundos (Anthropic en `src/modules/ai/provider.ts:80`); mientras está abierto la petición ni siquiera sale, así que un proveedor caído no acumula esperas de timeout en cada request.
- **Cuerpos de respuesta acotados (B6.53)**: toda respuesta de un servicio externo pasa por `readBodyCapped` (`src/lib/http.ts:5`) con tope por integración (Anthropic, OIDC de Google, feeds Live, iCal): un par de credenciales filtrado que responde gigabytes no agota la memoria del proceso.
- **Idempotencia de pedidos y reservas (B6.54)**: `POST /store/orders`, `/marketplace/orders` y las reservas de operadores exigen `Idempotency-Key`; la misma llave devuelve el pedido/reserva original (único parcial en la base + relectura ante carrera `23505`), así que un reintento de red nunca cobra dos veces.
- **Cuotas de IA (B6.57)**: límite diario por usuario (`AI_QUOTA`, `src/modules/ai/service.ts:70`, `GET /ai/quota` para consultarlo) y techo de gasto diario global en dólares (`AI_BUDGET`); se chequean antes de llamar al proveedor.
- **OAuth acotado (B6.58)**: los proveedores sólo existen si sus credenciales están configuradas (`src/modules/auth/oauth.ts:37`) y cada `redirect_uri` se valida contra una lista cerrada (`WEB_BASE_URL` + `CORS_ORIGINS` + `OAUTH_REDIRECT_ALLOWLIST`, `src/modules/auth/oauth.ts:53`).
- **Configuración fail-closed (B6.60)**: en producción el arranque falla si falta algo crítico o hay valores de desarrollo: CORS sin `*` ni http (`src/config/env.ts:135`), credenciales por defecto de la base (`:136`), `APP_SECRET`/`TOTP_ENCRYPTION_KEY` obligatorias (`:137-138`), `TRUST_PROXY=true` prohibido (`:139`), correo `smtp` (`:140`), y `PAYMENT_PROVIDER`/`AI_PROVIDER` en modo `fake` bloqueados (`:145`, `:148`).

## Rendimiento y escalabilidad (grupo B7)

- **SLO por clase de endpoint (B7.61)**: disponibilidad objetivo 99.9 % mensual y p99 de latencia por escenario, con los mismos umbrales que `scripts/loadtest.ts` usa al validar: salud 50 ms · listados y detalles 250 ms · filtros 300 ms · búsqueda global 400 ms · autocompletado 200 ms · portada 500 ms · mapa y cercanía 400 ms · panel de analítica y login 1500 ms · evento de analítica 200 ms. La latencia real se observa en los histogramas de `GET /metrics` (token `METRICS_TOKEN`) y antes de cada despliegue se exige con `npm run loadtest -- --assert`, que termina con error si algún escenario supera su p99 o registra errores.
- **Consultas lentas (B7.63)**: `npm run db:explain` ejecuta `EXPLAIN (ANALYZE, BUFFERS)` sobre 8 consultas representativas (listado paginado, conteo, búsqueda trigram, UNION ALL multi-colección, faceta, mapa, haversine y analytics) contra la base que se le pase (`--db postgres://...`; por defecto la de desarrollo :5434). Las literales van incrustadas (read-only, no toca datos) y es el punto de partida para decidir índices nuevos.
- **Caché pública con invalidación (B7.64–65)**: búsqueda, autocompletado, populares, portada anónima, capas del mapa y facetas se sirven desde `app.publicCache` (`src/plugins/public-cache.ts`, TTL 30 s, LRU de 500 entradas por caché; instancias por app, no globales). Las claves incluyen todo lo que cambia el resultado: el texto y tipos de la búsqueda, y en facetas la colección completa más el filtro crudo serializado. Cualquier mutación del CMS (`src/modules/admin/cms.ts`, punto único `done()`) y editar/publicar/pausar/borrar un servicio desde el panel (`src/modules/operators/routes.ts`) llama `app.invalidatePublicContent()`: publicar un borrador se ve al instante en `/search` aunque la entrada cacheada aún no hubiera vencido (`test/admin-cms.test.ts` lo prueba). Además los GET públicos declaran `cache-control` + ETag/304 (`src/plugins/etag.ts`), así que la segunda capa (CDN/navegador) revalida sin reenviar cuerpo.

## Observabilidad y operación (grupo B8)

- **Monitoreo de errores y avisos**: con `SENTRY_DSN` las excepciones no controladas de las peticiones, los fallos de tareas programadas y los errores fatales del proceso se envían a Sentry (por su API HTTP, sin SDK: `src/lib/error-reporter.ts`); con `ALERT_WEBHOOK_URL` (webhook entrante de Slack o Discord) además se avisa al canal del equipo, una vez cada cinco minutos por error y siempre ante la caída del proceso. Los errores de validación y de negocio no se reportan. De una petición sólo salen el método, la ruta declarada (no la URL real), el `request_id` y el id de la cuenta: ni cuerpo, ni consulta, ni cabeceras. Un monitoreo caído nunca afecta a la respuesta. Que la API no responda en absoluto lo vigila `deploy/watchdog.sh` desde fuera del proceso.
- **Respaldos fuera del servidor**: `npm run db:backup -- --upload` cifra el volcado (AES-256 con clave derivada de `BACKUP_ENCRYPTION_KEY`) y lo sube con su huella SHA-256 a un almacenamiento compatible con S3 (`BACKUP_S3_*`; sirve Google Cloud Storage con claves HMAC), con petición firmada y sin SDK (`src/lib/backup-offsite.ts`); `-- --decrypt <archivo>` lo descifra. En el VPS lo hace `deploy/backup.sh` con `openssl` y `curl`, en el mismo formato.
- **Trazabilidad de extremo a extremo (B8.72)**: cada petición recibe un `request_id` (cabecera `x-request-id` o UUID propio de Fastify) que queda atado al contexto asíncrono (`src/lib/request-context.ts`, enganchado en `onRequest` antes de auth/security en `src/app.ts`). `traceHeaders()` (`src/lib/http.ts`) lo añade a las llamadas salientes al proveedor de IA, OAuth (discovery e intercambio de token), tipos de cambio/clima e iCal — así un problema con un proveedor se correlaciona con la petición que lo sufrió (el proveedor puede devolverlo y aparece en los dos lados). Los trabajos ejecutados desde el panel heredan el `request_id` de quien los disparó (`JobRunner.runNow(name, { requestId })` en `src/modules/jobs/runner.ts`; lo pasan `POST /admin/jobs/:name/run` y `GET /live/refresh`) y viaja en sus logs y en el resultado. Fuera de una petición (cron) simplemente no se envía la cabecera. Probado en `test/request-context.test.ts`.
- **Auditoría firmada y de sólo anexado (B8.76)**: cada entrada nueva de `audit_log` se firma con HMAC-SHA256(encadenado) usando `APP_SECRET` como clave — la clave nunca vive en la base, así que quien robe un volcado no puede forjar entradas. La migración `0054` añade `prev_hash`/`hash` y convierte la tabla en apéndice puro: triggers rechazan `UPDATE`, `DELETE` y `TRUNCATE` (incluso desde SQL directo; `pg_restore` no se ve afectado porque los INSERT no pasan por esos caminos). `GET /admin/audit/verify` recalcula la cadena en una ventana (`after_id`, `limit`, tope 20 000) y `/metrics` expone `app_audit_chain_broken` sobre las últimas ~2000 entradas: un eslabón roto delata edición o borrado (`test/audit-chain.test.ts` lo provoca de verdad y lo detecta; 10 escrituras simultáneas no bifurcan la cadena gracias a un candado de asesoría dedicado). **Rotación de `APP_SECRET`**: la verificación recalcula con la clave actual, así que tras rotar, las entradas anteriores se reportarán como rotas aunque no lo estén — antes de rotar, anota la fecha y el último `id` verificado (`GET /admin/audit/verify`) y descarta las denuncias de eslabones previos a ese corte.
- **Salud del store de rate limit (B8.77)**: el almacén de límites es fail-open (si falla, la API sigue sirviendo pero los límites dejan de ser compartidos entre instancias). Desde esta fase cada fallo incrementa `app_rate_limit_store_errors_total` en `/metrics`: si ese contador crece, alerta — significa que Redis/BD de límites está caído y los límites por instancia no protegen frente a abuso distribuido.
- **Correos y colas (B8.78)**: `app_mail_queue_depth`, `app_mail_oldest_queued_seconds` y `app_mail_failed_24h` en `/metrics`, más `GET /health/queue` con estado `degraded` cuando la cola envejece o acumula fallos (umbrales en `src/modules/health/routes.ts`).
- **Sondeos y tablero (B8.73–75, 80)**: liveness `GET /health` separado de readiness `GET /health/ready` (503 si la base no responde), diagnóstico detallado en `/health/db`, `/health/queue`, `/health/cache` y `/health/detailed` (`src/modules/health/routes.ts`). Las alertas accionables (métrica → umbral → acción) y la rotación de claves están en `docs/BACKEND_OPERACION.md` §2–3. El costo de IA por mes/tipo/usuario con tope diario sale de `GET /admin/ai/usage` (`src/modules/ai/routes.ts`), alimentado por `ai_usage` (tokens y `cost_usd` por request).

## Pruebas, CI y cadena de suministro (grupo B9)

- **Matriz de autorización negativa (B9.81–82)**: `test/security.test.ts` recorre el `routeTable` real y comprueba que todo lo administrativo y del panel exige sesión y guard correspondiente (401 sin sesión, 403 con cuenta sin rol/organización, nunca 200/400/404 ni 500); el aislamiento entre organizaciones (IDOR/BOLA) y la escalada de roles quedan cubiertos en `test/operators-b.test.ts`, `operators.test.ts`, `trips.test.ts`, `store.test.ts`, `game.test.ts`, `marketplace.test.ts` y `payments.test.ts`.
- **Inyección y entradas hostiles (B9.83)**: SQLi en `q`/`sort`/`filter`, prototype pollution y números imposibles en el cuerpo de todas las rutas (nada responde 500), mass assignment al registrarse (`test/security.test.ts`, descriptes "inyección y entradas hostiles" e "inventario de rutas").
- **Spoofing de IP y doble envío (B9.84–85)**: matriz de TRUST_PROXY con `X-Forwarded-For` falseado (por defecto se ignora) en `test/security.test.ts`; concurrencia de stock sin sobresellado, pedidos multi-vendedor idempotentes, `Idempotency-Key` en pagos y migradores concurrentes en las suites respectivas.
- **Capas de pruebas (B9.86)**: dos proyectos de vitest — integración (una base compartida, `npm test`) y unitaria sin base (`npm run test:unit`); el contrato del frontend se prueba contra la API con fetch simulado (`src/test/api-contract.test.ts`) y el CI bloquea el drift de OpenAPI con `npm run docs:api -- --check`.
- **Restauración probada (B9.87)**: `npm run db:backup -- --verify` restaura el volcado en una base temporal y compara conteos tabla a tabla (documentado en `docs/BACKEND_OPERACION.md` §2); las migraciones son idempotentes y con checksum irrevocable (`test/migrations.test.ts`).
- **Cadena de suministro (B9.88–90)**: el CI audita dependencias de producción en los tres proyectos con lockfile — backend (`npm run audit`), frontend (`npm audit --omit=dev --audit-level=high` en `.github/workflows/frontend.yml`) y cms/server por lockfile sin instalar (`.github/workflows/supply-chain.yml`; cms legado reporta sin bloquear, server sí bloquea). Los workflows declaran `permissions: contents: read` por defecto (gitleaks escala sólo `pull-requests: write`), Trivy escanea la imagen OCI construida y falla con CRITICAL/HIGH, y los secretos se rastrean en todo el historial con gitleaks (`.github/workflows/backend.yml`).

## Arquitectura, contratos y retiro de legado (grupo B10)

- **Fuente de verdad por dominio (B10.91)**: la declaración oficial vive en `docs/FUENTE_DE_VERDAD.md` — `backend/` manda en todos los dominios transaccionales y en el contenido editorial; `server/` está retirado, `cms/` (Strapi) es origen editorial en transición y el mock del frontend es sólo de demostración mientras cierra la migración de escrituras.
- **Servidor legado aislado (B10.92)**: `server/` (prototipo Express + MySQL) declara su propia obsolescencia (`server/README.md`: "No debe utilizarse en despliegue ni producción"); ningún pipeline lo construye ni despliega, su `.env` no está versionado y su volcado de datos (`db_dump.json`) está fuera del índice del repositorio.
- **Contrato de transición mock → Fastify (B10.93)**: `docs/MIGRACION_ESCRITURAS_BACKEND.md` define reglas (Idempotency-Key, `payment_method_token`, nada de `setTimeout`, precios sólo del servidor) y el mapeo flujo por flujo con bloqueadores; el build `api` falla de forma cerrada mientras el mock siga escribiendo (`src/integrations/supabase/client.ts`).
- **OpenAPI sincronizado en CI (B10.94)**: `npm run docs:api -- --check` en `.github/workflows/backend.yml` rompe el build si la referencia (`docs/BACKEND_API.md`) no coincide con los esquemas Zod reales.
- **Capas consistentes (B10.95)**: cada módulo separa la capa HTTP (`routes.ts`: transport, Zod, guards) del dominio (`service.ts`/`bookings.ts`/`store.ts`: reglas y SQL parametrizado); los servicios se inyectan explícitamente en `src/app.ts` (`app.bookings`, `app.store`, `app.game`…) y no hay accesos a la base desde las rutas.
- **Dependencias explícitas y sin ciclos (B10.96)**: `npm run check:cycles` (`scripts/check-cycles.mjs`, sin dependencias externas) construye el grafo de imports de `src/` y falla si aparece un ciclo; corre en CI junto al typecheck. Al incorporarlo se rompieron los 2 ciclos existentes extrayendo los tipos compartidos del mailer a `src/modules/mailer/templates-types.ts` (127 módulos, hoy sin ciclos).
- **Outbox transaccional (B10.97)**: los correos críticos se encolan dentro de la transacción del cambio de negocio — el correo existe si y sólo si el cambio se compromete (`src/modules/mailer/mailer.ts:71`), con cola durable, reintentos, métricas (`app_mail_*`) y `GET /health/queue`; los webhooks de pago se graban de forma idempotente (`PaymentReconciler` en `src/modules/payments/webhooks.ts`).
- **Consistencia y saga de checkout (B10.98)**: reserva/pedido exigen `Idempotency-Key`; si el cobro nunca llega, los trabajos `bookings.expire_pending` (30 min, libera cupo y código promocional), `orders.auto_cancel` y `marketplace.auto_cancel` (60 min, devuelven stock y cupón) hacen la compensación; la conciliación del webhook evita doble registro (`recorded`/`already_recorded`) y las pruebas de concurrencia prueban que el stock nunca se sobrevende (`test/store.test.ts`, `test/game.test.ts`).

## Catálogo de módulos y trabajos programados (B10.99)

Módulos (`src/modules/`): `admin` paneles de administración (CMS, soporte, moderación, auditoría, importaciones) · `ai` asistente de IA con tope de costo · `ambassadors` embajadores y comisiones · `analytics` eventos de producto y rollups · `auth` cuentas, sesiones, TOTP y OAuth · `billing` facturación · `community` campañas, reseñas y social · `config` configuración pública · `content` CMS integrado (colecciones y motor de consultas) · `creators` creadores de contenido · `discover` portada y descubrimiento · `forms` formularios públicos · `game` gamificación · `health` sondeos · `i18n` traducciones · `jobs` JobRunner con bloqueo entre instancias · `live` clima y tasas · `mailer` correo con cola durable · `marketplace` pedidos multi-vendedor · `me` cuenta del viajero · `media` archivos y medios · `memberships` membresías · `notifications` notificaciones in-app · `operators` Operadores RD (listados, reservas, equipo, pagos, iCal) · `payments` webhooks y conciliación · `products` catálogo de productos · `seo` sitemap · `sponsorship` patrocinios · `store` tienda oficial · `tools` utilidades · `trips` itinerarios.

- **Rutas**: el catálogo completo y generado es `docs/BACKEND_API.md` (+ `openapi.json`), regenerado con `npm run docs:api` y verificado en cada push.
- **Jobs (25)**: el estado vivo (descripción, intervalo, activación, último resultado) lo sirve `GET /admin/jobs`; registro estático en `operators/jobs.ts` (reservas: recordatorios 15 min, reseñas 1 h, iCal 15 min, expiración de pendientes 15 min, saldo 1 h, mínimo de huéspedes 6 h, promociones 24 h, liquidaciones 7 d, GDPR 24 h), `src/routes.ts` (tienda/marketplace: auto-cancel 15 min, pagos a vendedores 24 h, embajadores 1 h; purga de retención 24 h), `game/jobs.ts` (rachas 1 h, ligas 7 d, temporada 1 h), `live/routes.ts` (tasas y clima 30 min), `marketing/routes.ts` (newsletter 5 min, anuncios 24 h), `analytics/routes.ts` (vaciado de cola 30 s, rollup 24 h), `media/routes.ts` (limpieza 24 h), `admin/imports.ts` (limpieza 1 h).
- **Propietarios**: un solo equipo (Descubre RD) mantiene todos los dominios; cualquier cambio en un dominio cita la fila correspondiente de `docs/FUENTE_DE_VERDAD.md` en la descripción del PR.

## Revisión técnica periódica (B10.100)

- **En cada PR** (automático, CI): typecheck estricto, `check:cycles`, `docs:api -- --check`, suite de integración completa, `npm audit --omit=dev --audit-level=high`, gitleaks y Trivy sobre la imagen.
- **Semanal**: `npm run db:backup -- --verify` (restauración probada, `docs/BACKEND_OPERACION.md` §2) y revisión de `GET /health/detailed`, `GET /metrics` y la cola de correo.
- **Mensual**: revisión del costo de IA (`GET /admin/ai/usage`), de las vulnerabilidades reportadas por `supply-chain.yml` (cms/Strapi) y de la deuda registrada en `docs/DEUDA_FRONTEND.md` y `PLAN_MAESTRO_MEJORAS.md`; ejecutar `npm run loadtest -- --assert` antes de cada despliegue relevante y revisar los planes de las consultas pesadas con `npm run db:explain`.
- **Trimestral**: revalidar `docs/FUENTE_DE_VERDAD.md` (¿algún dominio cambió de dueño?), los SLO de `scripts/loadtest.ts` y la vigencia de las retenciones de `docs/BACKEND_OPERACION.md` §4. La constancia queda en el PR o incidencia que ejecutó la revisión.

## Sobre el esquema generado

`0001_baseline.sql` y `0002_cms_governance.sql` se **generan** con `npm run db:gen-baseline` combinando:

1. `mysql/schema.sql` (124 tablas; se traduce a PostgreSQL: `VARCHAR(36)`→`uuid`, `JSON`→`jsonb`, `TIMESTAMP`→`timestamptz`, `ENUM`→`text + CHECK`, `UUID()`→`gen_random_uuid()`),
2. `supabase/migrations/*` y `supabase/schema.sql` (tablas sólo-Postgres y `ADD COLUMN` posteriores),
3. columnas que el frontend usa de hecho (inferidas de `mockDb.json`; quedan marcadas `-- inferida de mockDb.json`).

Si cambian las fuentes **antes del primer despliegue**, se regenera; después de desplegar, cualquier cambio de esquema va en una migración nueva.

## Datos de desarrollo

`db:seed` convierte los ids que no son UUID del mock (`org-seed-samana`, `lst-seed-1`…) a UUID v5 deterministas, de modo que las referencias entre tablas se conservan. Crea cuentas de marcador (`<id>@seed.invalid`, sin contraseña utilizable) para los perfiles sembrados y el administrador de desarrollo. Al final verifica la integridad referencial.

## Seguridad (estado actual)

Entrada validada con Zod, SQL parametrizado con listas blancas, cabeceras de seguridad, CORS por lista blanca, límites de tasa compartidos, errores sin trazas, registros sin `Authorization`/cookies, contraseñas Argon2id, JWT RS256 con rotación, refresco de un solo uso, 2FA, login social con PKCE, cola de correo durable.

**Pendiente antes de producción:** RLS en PostgreSQL como segunda barrera, WAF/CAPTCHA, reinicio de 2FA por un administrador (perdió el dispositivo y los códigos), Apple/Facebook, alta de proveedores e invitaciones de equipo (van con Operadores RD), auditoría de acciones de administración (van con el CMS) y una prueba de intrusión.

## Explorar: pasaporte, rutas, provincias, coleccionables, retos de foto y gremios

- **Pasaporte** (`POST /passport/stamps`, `GET /passport/me`): un sello por persona y lugar. La visita se verifica en el servidor: código QR del lugar (solo se guarda su hash; `POST /admin/place-qr`) o GPS (precisión ≤ 150 m, dentro del radio del tipo de lugar). Los desplazamientos imposibles (> 300 km/h) se rechazan y marcan `gps_suspect`. El primer sello en una provincia registra la visita.
- **Provincias** (`GET /gamification/provinces`, `POST /gamification/provinces/:slug/visit`).
- **Rutas** (`/gamification/routes*`): iniciar, completar puntos en orden por GPS/QR/foto propia, bono y medalla al terminar. Administración con `/admin/gamified_routes`, `/admin/route_checkpoints` y `/admin/route-checkpoints/:id/qr`.
- **Coleccionables** (`/collectibles*`): reclamo con condición evaluada en el servidor y suministro limitado atómico.
- **Retos de foto** (`/gamification/photo-challenges*`, `/admin/photo-submissions/:id/moderate`, `/admin/photo-challenges/:id/close`): envío con foto propia, moderación, votos únicos y cierre con ganador.
- **Gremios** (`/gamification/guilds*`, `leaderboard?scope=guild`): nivel ≥ 3 para crear, XP acumulado de los miembros, traspaso de liderazgo o disolución al salir.

## Marketplace de vendedores y embajadores

- **Vendedores** (`/marketplace/vendors/*`): solicitud con correo verificado, aprobación del equipo (`PATCH /admin/marketplace/vendors/:id`, comisión por vendedor, 15 % por defecto) y suspensión.
- **Catálogo** (`/marketplace/products`, `/partner/marketplace/products`): productos y experiencias con revisión previa; precio y existencias cambian al instante, el contenido vuelve a revisión.
- **Pedidos** (`POST /marketplace/orders`, `Idempotency-Key` obligatorio): un pedido puede mezclar vendedores; stock bloqueado, comisión y neto del vendedor guardados por artículo, cobro con la pasarela (y conciliación por webhook, `metadata.mp_order_id`). Envío/entrega por artículo (`/partner/marketplace/order-items/:id`), cancelación del cliente mientras nada haya salido y cancelación por artículo del vendedor, con reembolso y devolución de stock.
- **Liquidaciones** (`marketplace.payouts`, diario): lo entregado, cobrado y sin devolución tras 3 días, por vendedor; el equipo las marca pagadas o fallidas. Lo ya liquidado no se puede reembolsar.
- **Embajadores** (`/ambassadors/*`): solicitud, aprobación, código `EMB-XXXXXX`, niveles (bronce 5 %, plata 7 % desde 10 ventas, oro 10 % desde 30) o comisión especial. La comisión se calcula en el servidor sobre lo cobrado (`ref_code` en pedidos de tienda y marketplace; autocompra e códigos inválidos se ignoran), queda 7 días en espera, se revierte con los reembolsos y se paga por solicitud (mínimo RD$ 1 000).

## Mi viaje, e-tickets y Top 100 (docs §5.7)

- **Viajes** (`/me/trips*`): actividades por día con lugares del catálogo (se guarda una instantánea de nombre, foto y coordenadas) o texto libre, reordenar entre días, `from-itinerary` (para el itinerario de la IA), resumen de costos frente al presupuesto con mapa GeoJSON y reservas del periodo.
- **Compartir**: enlace público de sólo lectura sin costos ni notas (`POST/DELETE /me/trips/:id/share`, `GET /trips/shared/:token`; sólo se guarda el hash). **Planificador grupal** por enlace de invitación con rol viewer/editor (`/me/trips/:id/members`, `/trips/join`) y votos +1/−1 por actividad.
- **Diario**, **lista de empaque** y **check-in** de una reserva propia (ventana de fechas, XP una sola vez).
- **E-tickets** (`/me/tickets`) de eventos y reservas; `POST /tickets/verify` (POST, no GET, porque marca el ticket como usado) para personal y operadores.
- **Top 100** (`/me/spots`, `/me/wishlist`): premios en 10/25/50/100 lugares, una vez por hito.

## Asistente de IA (docs §5.4 y §5.17)

- **Proveedor** intercambiable: `AI_PROVIDER=none` (apagado; por defecto en producción) | `fake` (simulador, sólo desarrollo/pruebas) | `anthropic` (`ANTHROPIC_API_KEY`; `AI_MODEL` para itinerarios y borradores, `AI_MODEL_LIGHT` para chat, recomendaciones y traducciones).
- **Chat** `POST /ai/chat` (SSE): contexto con lugares reales del catálogo; anónimo 10 msg/min, con sesión cuenta en la cuota. **Itinerario** `POST /ai/itinerary`: los `ref` que el modelo invente se descartan y el resultado entra tal cual en `POST /me/trips/:id/from-itinerary`. **Recomendaciones** `POST /ai/recommendations` (sin IA, se ordena por calificación). **Traducción** `POST /ai/translate` (editor, con caché) y **borradores** `POST /admin/ai/generate` (editor; nunca publica).
- **Controles**: cuota diaria por usuario (`AI_DAILY_LIMIT_USER`, 10× para personal; se reserva antes de llamar, así las consultas simultáneas no la superan), tope de gasto diario global (`AI_DAILY_BUDGET_USD`), datos personales (correos, teléfonos, tarjetas) quitados antes de enviar, prompts editables en `site_settings` (`ai.prompt.chat|itinerary|recommendations|translate|generate`) y consumo/costo por usuario en `GET /admin/ai/usage`.

### Traducción automática de contenido
`POST /admin/translations/:entity_type/:entity_id/auto` y `POST /admin/translations/auto-batch` traducen con la IA (misma cuota, caché y tope de gasto). Nunca pisan traducciones `human` o `reviewed`; lo nuevo queda como `machine` hasta que un editor lo revise.

### Correos en fr, de, pt e it
Los correos al viajero (cuenta, reservas, boletín, soporte, tienda, campañas) existen en francés, alemán, portugués e italiano (`src/modules/mailer/templates-extra.ts`); operadores, vendedores y embajadores siguen en es/en. Lo que no esté traducido cae al español. Los textos dinámicos que arma el servidor (p. ej. el mensaje de una actualización de pedido) siguen en español.

### Imágenes: saneado y variantes
Al completar una subida (o importar una URL), la imagen se decodifica y se recodifica con `sharp`: se descartan los metadatos (EXIF con GPS, comentarios), se aplica la orientación y se rechaza (`IMAGE_CORRUPT`) lo que tiene cabecera válida pero cuerpo dañado. Se generan `thumb` (320 px), `medium` (800 px) y `large` (1 600 px) en webp, sin agrandar nunca; `GET /media/files/:id?variant=thumb|medium|large` sirve la variante (o el original si no existe) y `variants` en los metadatos apunta siempre a una URL válida. Los gif se conservan tal cual. Pendiente: antivirus (ClamAV) y almacenamiento S3, que requieren infraestructura externa.

## Pruebas de carga
`npm run loadtest` levanta la API en el mismo proceso sobre su propia base (`descubre_rd_load`, en el PostgreSQL embebido), la llena con los datos del mock más volumen sintético (300 000 eventos de analítica, 3 000 usuarios, 300 000 movimientos de XP) y mide con autocannon 17 escenarios (portada, detalle, filtros, búsqueda, mapa, tienda, marketplace, ranking, login, analítica…). Opciones: `--duration 20 --connections 100 --skip-setup --assert` (con `--assert` falla si un p99 supera su umbral; sirve para CI o antes de desplegar). El informe queda en `loadtest-report.json`.

Hallazgos de la primera corrida (40 conexiones): la búsqueda global hacía ~40 consultas por petición y agotaba el pool (89 req/s, p99 757 ms) → ahora una sola consulta `UNION ALL` más caché de 30 s con vuelo único (1 700 req/s, p99 38 ms); el panel de analítica tardaba 1,7 s bajo carga → una pasada menos por los eventos y caché de 20 s. Ver `src/lib/cache.ts`.

## Administración del correo (docs §5.13)
- **Plantillas editables** (`/admin/email/templates*`): cada plantilla e idioma puede personalizarse desde el panel (asunto, título, cuerpo, botón) con variables `{{name}}`; se validan contra las variables de esa plantilla, el HTML se limpia (sólo texto, listas y enlaces https), los valores se escapan, hay historial de versiones con restauración y vista previa de borradores. Lo que no se personaliza sale de las plantillas del código. Correo de prueba con «[PRUEBA]».
- **Bitácora** (`/admin/email/log`, `/stats`): filtros, estados (`suppressed` incluido) y reenvío; no expone el contenido de los mensajes.
- **Supresiones** (`/admin/email/suppressions`): rebote duro, queja y bloqueo manual frenan todo el correo; la baja sólo frena el marketing. Un correo suprimido queda registrado, no sale.
- **Webhook** `POST /webhooks/email/generic` (firma HMAC con marca de tiempo `X-Email-Signature: t=<unix>,sha256=<hex>` sobre `t.<cuerpo>`, tolerancia ±300 s — replay fuera de la ventana se rechaza; `EMAIL_WEBHOOK_SECRET`): entrega, apertura, rebote duro/blando y queja actualizan la bitácora y suprimen automáticamente. Un adaptador por proveedor (SES, SendGrid…) traduce su formato a este.

## Notificaciones (docs §5.13)
- **Bandeja** (`/me/notifications`): ahora la llenan los eventos reales: subir de nivel y logros, reserva confirmada/solicitada/cancelada, pedidos de la tienda y del marketplace (envío, entrega, reembolso; pedido nuevo para el vendedor), aprobaciones de tienda y de embajador, pago de comisiones y alguien que se une a tu viaje. Respeta las preferencias (`GET/PUT /me/notification-preferences`, matriz tipo × canal; las promociones sólo llegan a quien las activó).
- **Tiempo real** (`GET /notifications/stream`, SSE): se canjea la sesión por un ticket de un minuto (`POST /notifications/stream-ticket`) porque un `EventSource` no puede enviar `Authorization`; máximo 5 conexiones por persona; funciona entre instancias con `LISTEN/NOTIFY` de PostgreSQL (el aviso sólo sale si la transacción que lo creó se confirma). Al apagar el servidor se cierran los flujos (`preClose`).
- **Web Push** (`/me/push-subscriptions`): estándar VAPID (`VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY`; `npx web-push generate-vapid-keys`). Sin claves está apagado. Los dispositivos caducados se retiran solos.
- **Difusiones** (`POST /admin/notifications/broadcast`): a un segmento (rol, idioma, nivel, aceptó marketing), con `dry_run` para ver a cuántas personas alcanza; respeta las preferencias de cada una.

## Administración del portal: soporte, moderación y seguridad (docs §5.17)
- **Soporte** (`/admin/support/*`): bandeja (urgente y antiguo primero), asignación sólo a personal, respuestas al usuario con aviso en su bandeja y correo (`support.reply`), notas internas que el usuario nunca ve, tiempos de primera respuesta y estadísticas.
- **Moderación unificada** (`/admin/moderation/*`): una cola para reseñas, publicaciones reportadas, imágenes, medios de la comunidad, fotos de retos y reportes, con alertas automáticas (enlaces, contacto, mayúsculas, groserías) y una sola acción (`approve|reject|remove`, con motivo) que respeta las reglas de cada tipo (XP, calificación del lugar, borrado de archivos), avisa al autor y queda auditada. `POST /admin/moderation/rules/test` prueba los filtros.
- **Reglas de IP** (`/admin/ip-rules`): `deny` bloquea una IP o rango en todo el API (salvo `/health`); un `allow` con alcance `admin` restringe `/admin` a esas direcciones. Rechaza reglas que dejarían fuera a quien las crea (`SELF_LOCKOUT`) y admite vencimiento. Las reglas rigen en ≤ 15 s.
- **Banderas de funciones** (`/admin/system/feature-flags`, público `/feature-flags`): `registration_enabled`, `checkout_enabled`, `marketplace_orders_enabled`, `ai_chat_enabled`, `ai_planner_enabled` apagan la función con un 503 `FEATURE_DISABLED` sin desplegar.
- **Banderas de usuario** (`/admin/user-flags`) y **ajuste de XP/monedas** (`/admin/users/:id/award-xp`, `/admin/gamification/users/:id/adjust`, este último también negativo, sin bajar de cero).
- Pendiente a propósito: la «sesión de soporte» (`impersonate`), que requiere decidir su diseño de sólo lectura y su auditoría.

## Reservas: cambio de fecha, voucher y alta de proveedor (docs §5.8)
- **Cambio de fecha** (`POST /bookings/:id/change-date`, operador: `POST /org/bookings/:id/change-date`): se vuelve a cotizar con los mismos servicios, personas, extras y código, y se valida el cupo de la nueva fecha bajo bloqueo del anuncio **sin contar la propia reserva** (dos personas que compiten por la última plaza: sólo una gana). Regla de precio: el total **nunca baja** (sin crédito ni reembolso por mover a una fecha más barata); si sube, la diferencia queda como saldo (`pay-balance`). El viajero puede cambiar 2 veces y hasta 48 h antes; el operador, sin esos límites. Con `dry_run` muestra cómo quedaría. Guarda la fecha original, reinicia los recordatorios y avisa (correo, bandeja y mensaje al operador).
- **Voucher** (`GET /bookings/:id/voucher.pdf`, `GET /org/bookings/:id/voucher.pdf`): PDF con los datos de la reserva y un QR con su referencia, que el personal valida en `POST /tickets/verify`. Sólo para reservas confirmadas, en curso o realizadas.
- **Alta de proveedor** (`POST /auth/partner/register`): cuenta + organización en un paso, con sesión iniciada; la organización queda pendiente de verificación.

## Importación masiva de establecimientos (docs §5.17)
`POST /admin/imports/establecimientos` acepta un CSV/TXT (delimitador detectado: tabulador, `|`, `;` o coma; comillas y saltos de línea dentro de un campo; encabezados por nombre —sin acentos, con sinónimos— o, si no se reconocen, por posición como el archivo oficial) y responde `202` con un `job_id`. Un archivo ilegible se rechaza al instante; el resto se procesa en segundo plano por lotes de 500 y se consulta en `GET /admin/imports/:jobId` (avance, insertadas, actualizadas, omitidas, errores y avisos **por fila**, con el número de línea del archivo). Repetir el archivo **actualiza** en vez de duplicar (llave: identificación, RUT o nombre + provincia + zona). `dry_run` cuenta lo que pasaría sin escribir. Una sola importación real a la vez; las interrumpidas por un reinicio se cierran solas (`imports.cleanup`) y el archivo no se conserva al terminar. El directorio público (`GET /establecimientos`) no expone RUT, identificación, contacto ni la llave interna.

## Contenido estático del frontend → CMS (docs, Apéndice D)
`npm run db:import-static` carga en la base el contenido que hoy vive embebido en `src/data/*.ts` **sin modificar esos archivos** (se empaquetan con esbuild, resolviendo `@/` y las imágenes importadas). 400 registros en 25 conjuntos: provincias, destinos, playas, montañas, ríos, áreas protegidas, hoteles, restaurantes, bares, centros comerciales, clínicas, experiencias, parques temáticos, estadios y campos de golf, puertos y marinas, eventos, blog, artículos de historia, proyectos de compensación, rutas del sabor, recetas criollas y aeropuertos (las dos últimas son colecciones nuevas: `recipes` y `airports`).
- **Idempotente y sin pisar**: los ids son UUID v5 de (tabla, id original) y cada fila se inserta con `ON CONFLICT DO NOTHING`; repetirlo no duplica ni sobrescribe lo que el equipo haya editado en el CMS. Lo cargado queda `published`.
- **Referencias resueltas**: provincia de cada destino y montaña, destino de playas, hoteles, restaurantes, bares, experiencias y ríos.
- Opciones: `--dry-run` (todo dentro de una transacción que se revierte, con informe por conjunto), `--only beaches,hotels`. `test/static-import.test.ts` ejecuta la carga completa en una transacción y verifica restricciones, idempotencia y referencias.
- **Ficha completa (`extras`)**: cada fila guarda en `extras` (jsonb) el registro tal como lo conoce el sitio, de modo que los campos sin columna propia (consejos, categorías, especificaciones, bloques de texto) no se pierden y se editan desde el CMS. Una fila cargada antes de que existiera la columna la recibe al repetir la carga; si el equipo ya la editó, no se toca.
- **Filas que no vienen de `src/data`** (sembradas por otra vía o creadas en el CMS sin ficha): al final de la carga reciben su `extras` armado con sus propias columnas y con la forma que esperan las pantallas, usando los conversores del frontend (`src/services/contentMappers.ts` y `catalogCollections.ts`). Antes, una fila sin destino lo recibe si el último tramo de su dirección es exactamente el nombre de un destino ("Boulevard Cap Cana, Punta Cana"); lo que no encaja se queda sin destino. Una fila que ya tiene ficha no se toca.
- **Documentos de contenido (`content_datasets`)**: lo que no es una colección de fichas (transporte, itinerarios, náutica, loterías, tasas de referencia, textos de páginas…) se guarda como un documento JSON por archivo de datos (`comoLlegarData.ts` → `como-llegar-data`), con una entrada por exportación. `GET /datasets` (índice con `revision`), `GET /datasets/:key`, `PUT /admin/datasets/:key` (admin o editor, sube la revisión) y `DELETE /admin/datasets/:key` (admin). `revision = 0` significa «tal como se cargó»: repetir la carga lo refresca con el archivo; un documento editado no se pisa. El frontend sólo descarga los documentos editados.
- Fuera de alcance a propósito: la actividad simulada de personas y anunciantes que sólo sirve a las demostraciones (`partnerDashboardData`, `creatorsData`, `socialData`, `mockIndustryBanners`), y `provinceEnrichment`, que no son datos sino plantillas en código que generan textos por región.
- **En producción** la carga se ejecuta desde una copia del repositorio (necesita `src/data` del frontend), apuntando `DATABASE_URL` a la base del servidor por un túnel SSH; la imagen de la API no lleva esos archivos.

## Sesión de soporte de sólo lectura (docs §5.17)
`POST /admin/users/:id/impersonate` abre, para un admin, una sesión que ve la cuenta de otra persona **tal como ella la ve**, para ayudarle. Garantías: **sólo lectura** (cualquier escritura devuelve `IMPERSONATION_READONLY`, salvo cerrarla), **sin lo sensible** (exportar datos, sesiones, panel de administración → `IMPERSONATION_RESTRICTED`), **15 minutos y sin renovación** (no hay token de refresco), **motivo obligatorio**, sólo cuentas que **no son del personal**, verificación en dos pasos del admin cuando la política está activa, no se encadena, se revoca sola si la persona cambia su contraseña o se suspende la cuenta, **aviso en la bandeja de la persona** y **cada petición queda auditada** (método, ruta y resultado; nunca cuerpos ni parámetros). `GET /auth/me` devuelve `impersonation: { by, read_only }` para mostrar el aviso; `POST /auth/impersonation/end` la cierra; `GET /admin/support-sessions` lista quién miró qué cuenta, por qué y cuántas peticiones hizo.

## Versionado y compatibilidad del API

Toda ruta de API cuelga de `/api/v1` (`src/routes.ts`) — no existen duplicados sin versión. Fuera del prefijo sólo viven recursos que no son del API versionado: `/health` (balanceadores), `/.well-known/*`, `/metrics`, `/sitemap.xml` y los archivos de `/media/files/*`.

Reglas de gobierno para evolucionar el contrato (docs §3.1):

- **Cambio que no rompe** (añadir campos en respuestas, parámetros opcionales nuevos, rutas nuevas): puede entrar directamente en `v1`; el cliente ignora lo que no conoce.
- **Cambio que rompe** (quitar o renombrar campos, volver obligatorio un parámetro, cambiar semántica de un código de error): requiere una versión nueva (`/api/v2` con su prefijo propio y su entrada en `registerRoutes`); la anterior entra en deprecated, sigue respondiendo y anuncia su cierre en `docs/BACKEND_API_IMPLEMENTADO.md` con fecha.
- Las colecciones documentadas en `docs/BACKEND_API_IMPLEMENTADO.md` se regeneran del código (`npm run docs:api`) y CI falla si el documento no corresponde al OpenAPI real (`--check`): el contrato publicado nunca diverge del que la app sirve.

## Referencia de la API
`docs/BACKEND_API_IMPLEMENTADO.md` se **genera** del código (`npm run docs:api`) y CI verifica que esté al día (`npm run docs:api -- --check`); `docs/BACKEND_API.md` queda como diseño, con un aviso al inicio.
