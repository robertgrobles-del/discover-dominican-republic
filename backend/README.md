# Descubre RD — API (backend)

API REST v1 del portal. Fastify + TypeScript + PostgreSQL. Es un proyecto **independiente del frontend**: no se importa desde `src/` ni lo modifica.
Diseño completo, endpoints previstos y roadmap: [`../docs/BACKEND_API.md`](../docs/BACKEND_API.md).

**Estado (Fase 0, pasos 1–3):** base técnica, esquema, primeros endpoints, **autenticación y correo**.

| Hecho | Detalle |
|---|---|
| Servidor | Fastify 5, validación con Zod, envoltorio de errores único, `X-Request-Id`, helmet, CORS, límite de tasa, ETag/304 |
| Contrato | OpenAPI 3.1 en `/openapi.json` y UI en `/docs` |
| Esquema | 138 tablas en PostgreSQL (migraciones `0001`–`0006`), gobierno CMS, roles ampliados, auditoría, slugs |
| Datos de desarrollo | Carga desde `src/integrations/supabase/mockDb.json` (no toca `src/data/*.ts`) |
| Endpoints | `/health`, `/health/ready`, `/version`, `/config`, `/provinces`, `/provinces/{idOrSlug}` y `/auth/*` (bajo `/api/v1`) |
| Autenticación | Registro, login, refresh con rotación, logout, verificación de correo, olvidé/restablecer/cambiar contraseña, dispositivos, roles (`requireRole`) |
| Correo | Servicio único (`app.mailer`) con plantillas es/en, bitácora `email_log`, transporte log · SMTP (Mailpit/SES) · memoria |
| Pruebas | 54 pruebas de integración contra PostgreSQL real y un servidor SMTP real |

Siguiente: lectura pública genérica de colecciones (paso 4), luego CMS y administración. Ver roadmap en el documento de diseño.

### Autenticación en 60 segundos

```bash
# Usuario de desarrollo (lo crea `npm run db:seed`): admin@descubre.local / Admin-Descubre-2026!
curl -s -X POST localhost:3000/api/v1/auth/login -H 'content-type: application/json'   -d '{"email":"admin@descubre.local","password":"Admin-Descubre-2026!"}'
curl -s localhost:3000/api/v1/auth/me -H "authorization: Bearer <access_token>"
```

- **Tokens:** acceso JWT RS256 de 15 min; refresco opaco de 30 días, de un solo uso y rotatorio (el hash es lo único que se guarda). Reutilizar uno ya rotado revoca toda la sesión.
- **Web (cookie):** con la cabecera `X-Refresh-Transport: cookie` el refresco viaja en cookie `HttpOnly` y no en el JSON; esa misma cabecera obliga a un preflight CORS y bloquea CSRF.
- **Contraseñas:** Argon2id, política de 10–128 caracteres, sin el correo ni claves comunes. Tras 5 fallos la cuenta se bloquea 15 min; el mensaje de error es el mismo exista o no el correo.
- **Correos:** con `MAIL_TRANSPORT=log` (por defecto en desarrollo) el mensaje y sus enlaces salen en el log del servidor; con `smtp` y `docker compose up -d` se ven en http://localhost:8025 (Mailpit).
- **Proteger una ruta:** `preHandler: app.authenticate` o `app.requireRole("admin", "editor")`.

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
| `npm run db:seed` | Siembra desde `mockDb.json` (idempotente: `ON CONFLICT DO NOTHING`) |
| `npm run db:reset` | Recrea `public` y siembra (bloqueado si `NODE_ENV=production`) |
| `npm run db:gen-baseline` | Regenera `0001`/`0002` desde las fuentes SQL (ver más abajo) |

## Estructura

```
backend/
  migrations/           SQL versionado (0001 base generada · 0002 gobierno CMS generada · 0003+ a mano)
  scripts/              migrate · seed-from-mock · gen-baseline · dev-db (Postgres embebido)
  src/
    config/env.ts       variables de entorno validadas (Zod)
    db/                 pool y migrador (checksums: una migración aplicada no se puede editar)
    lib/                errores, paginación/orden, i18n
    plugins/            errores, seguridad, ETag, OpenAPI
    modules/<dominio>/  routes.ts por dominio (health, config, provinces, …)
    routes.ts           registro de módulos bajo /api/v1
  test/                 integración (fastify.inject + PostgreSQL real)
```

## Convenciones

- **Respuesta:** `{ data, meta?, links? }`; **error:** `{ error: { code, message, details?, request_id } }` (docs §3.3). Lanza `AppError` desde los servicios.
- **Listados:** `page`, `per_page` (máx. 100), `q`, `sort` (`-campo`, lista blanca), `filter[campo]`, `lang` (docs §3.4).
- **Contenido público:** sólo `status = 'published'`, no eliminado y con `published_at ≤ ahora` (docs §4.1). Cabecera `Cache-Control` pública + ETag.
- **Idioma:** `?lang=` o `Accept-Language`; traducciones en `entity_translations` con respaldo a `es` (`meta.fallback_locale`).
- **SQL:** siempre parametrizado; nombres de columnas de `ORDER BY` salen de listas blancas.
- **Migraciones:** nunca se editan las ya aplicadas; se agrega una nueva `000N_descripcion.sql`.

## Cómo agregar una colección de contenido

1. Confirma la tabla y sus columnas en `migrations/0001_baseline.sql` (ya existen las 138 del portal).
2. Copia `src/modules/provinces/routes.ts` a `src/modules/<colección>/routes.ts`, ajusta columnas, filtros y `SORTABLE`.
3. Regístrala en `src/routes.ts`.
4. Añade pruebas en `test/` con datos propios (ver `global-setup.ts`).
5. Cuando haya varias colecciones, el patrón se extrae a un controlador genérico (docs §5.3).

## Sobre el esquema generado

`0001_baseline.sql` y `0002_cms_governance.sql` se **generan** con `npm run db:gen-baseline` combinando:

1. `mysql/schema.sql` (124 tablas; se traduce a PostgreSQL: `VARCHAR(36)`→`uuid`, `JSON`→`jsonb`, `TIMESTAMP`→`timestamptz`, `ENUM`→`text + CHECK`, `UUID()`→`gen_random_uuid()`),
2. `supabase/migrations/*` y `supabase/schema.sql` (tablas sólo-Postgres y `ADD COLUMN` posteriores),
3. columnas que el frontend usa de hecho (inferidas de `mockDb.json`; quedan marcadas `-- inferida de mockDb.json`).

Si cambian las fuentes **antes del primer despliegue**, se regenera; después de desplegar, cualquier cambio de esquema va en una migración nueva.

Hallazgos de la consolidación (datos del mock vs. esquema) ya corregidos en `0005`: el módulo Operadores RD usa `business_type` = `tour_operator`/`agency` y categoría `paquete`, que el esquema original no permitía.

## Datos de desarrollo

`db:seed` convierte los ids que no son UUID del mock (`org-seed-samana`, `lst-seed-1`…) a UUID v5 deterministas, de modo que las referencias entre tablas se conservan. Crea cuentas de marcador (`<id>@seed.invalid`, sin contraseña utilizable) para los perfiles sembrados. Al final verifica la integridad referencial e informa de filas huérfanas.

## Seguridad (estado actual)

Entrada validada con Zod, SQL parametrizado, cabeceras de seguridad, CORS por lista blanca, límite de tasa por IP, errores sin trazas, registros sin `Authorization`/cookies. Pendiente por fase: autenticación y roles (paso 3), RLS como segunda barrera, 2FA de administradores, WAF/CAPTCHA.
