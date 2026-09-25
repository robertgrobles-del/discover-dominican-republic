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

## Correo

`app.mailer.send({ to, template, data, locale })` **encola** en la tabla `email_log` y vuelve; un trabajador (en el mismo proceso, `MAIL_WORKER_ENABLED`, o en otro) toma los pendientes con `FOR UPDATE SKIP LOCKED`, así que varias instancias nunca envían dos veces. Reintenta con espera creciente (1 min, 5 min, 30 min, 2 h, 12 h) hasta `MAIL_MAX_ATTEMPTS` y luego marca `failed`; los mensajes que quedaron `sending` por un proceso caído se recuperan. Si se pasa la conexión de una transacción (`send(input, client)`) el correo forma parte de ella (outbox transaccional: el registro y su correo se guardan juntos o no se guarda ninguno).

Transportes: `MAIL_TRANSPORT=log` (desarrollo: el mensaje con sus enlaces sale en el log) · `smtp` (Mailpit de docker-compose en :1025, SES, etc.) · `memory` (pruebas). Con un volumen muy alto se puede pasar a BullMQ/Redis sin cambiar la interfaz.

## Límites de tasa

`RATE_LIMIT_STORE=memory` (por defecto, una sola instancia) · `postgres` (tabla `rate_limits`, atómica, compartida entre instancias, sin infraestructura extra) · `redis` (`REDIS_URL`). Cada ruta con límite propio (registro, login, olvidé mi contraseña, 2FA, OAuth) tiene su contador. Si el almacén falla la API sigue respondiendo (falla abierta): los intentos de contraseña y de segundo factor siguen protegidos por el bloqueo de cuenta, que vive en la base de datos. En producción con `memory` se registra una advertencia.

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
