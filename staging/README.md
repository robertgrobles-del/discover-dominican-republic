# Rama `staging`

Versión reducida del sitio para Vercel + Turso:

- **Landing** (`/`): la página de inicio tal cual, con datos locales y ningún enlace activo.
- **Acceso** (`/login`) y **panel** (`/admin`) con dos secciones: **Provincias** y **Noticias**.
- Cualquier otra ruta vuelve a `/`. Todo el sitio responde con `X-Robots-Tag: noindex`.

El backend completo (`backend/`, PostgreSQL) **no** se despliega aquí. En su lugar, `api/index.ts` es una función de
Vercel que habla con Turso y solo cubre acceso, provincias y noticias (todo en ese archivo).

## 1. Base de datos en Turso

Importar el archivo con las tablas (está vacío):

```bash
turso db create descubre-staging --from-file staging/descubre-staging.sqlite
# o, sobre una base ya creada:
turso db shell descubre-staging < staging/schema.sql
```

Para regenerar el archivo tras cambiar `schema.sql`: `node staging/db.mjs build`.

## 2. Primer usuario del panel

```bash
TURSO_DATABASE_URL="libsql://…turso.io" TURSO_AUTH_TOKEN="…" \
  node staging/db.mjs admin tu@correo.com "una-contraseña-de-12-o-más" admin
```

Con el mismo comando se cambia la contraseña. Rol `editor` para quien solo edita contenido.

## 3. Proyecto en Vercel

- **Branch**: `staging`. El resto (build, carpeta de salida, rutas) lo toma de `vercel.json`.
- **Variables de entorno**:

| Variable | Valor |
|---|---|
| `TURSO_DATABASE_URL` | `libsql://…turso.io` |
| `TURSO_AUTH_TOKEN` | token de Turso (`turso db tokens create descubre-staging`) |
| `JWT_SECRET` | 32+ caracteres aleatorios (`openssl rand -hex 32`) |

Las variables del frontend (`VITE_AUTH_SOURCE=api`, `VITE_DATA_SOURCE=mock`, `VITE_ALLOW_MOCK_BUILD=true`: landing con
datos locales y sesión real) ya van en el `buildCommand` de `vercel.json`. No pongas `VITE_API_URL`: el frontend usa
`/api/v1` en el mismo dominio.

## Endpoints

`POST /api/v1/auth/login`, `/auth/refresh`, `/auth/logout`, `GET /auth/me`, y
`GET|POST /api/v1/admin/{provinces|news}`, `GET|PUT|DELETE /api/v1/admin/{provinces|news}/:id` (rol admin o editor),
`GET|POST /api/v1/admin/users`, `PATCH|DELETE /api/v1/admin/users/:id` (solo admin) y, sin sesión,
`GET /api/v1/public/{provinces|news}` (solo lo publicado; lo usa la landing).

Tests: `npx vitest run api/_index.test.ts`.

## Límites conocidos

- El token de refresco no se revoca en el servidor: cerrar sesión borra la cookie, pero un token copiado sigue
  valiendo hasta 7 días. Aceptable para staging; con usuarios reales, guardar los tokens en una tabla.
- La landing muestra las provincias publicadas en el carrusel de destinos y las noticias publicadas al frente de la
  sección de noticias (la más reciente, destacada). Los borradores no se ven. Como los enlaces de la landing están
  desactivados, el texto completo de una noticia solo se lee en el panel.
