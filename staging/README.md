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

Para regenerar el archivo: `node staging/db.mjs build` (esquema + todas las migraciones, en modo WAL).

### Migraciones (cambios sobre una base que ya tiene datos)

Los cambios de tablas van en `staging/migrations/NNN_descripcion.sql`. Para aplicarlos en Turso:

```bash
TURSO_DATABASE_URL="libsql://…turso.io" TURSO_AUTH_TOKEN="…" node staging/db.mjs migrate
```

Aplica solo las que falten (las anota en `schema_migrations`), cada una en una transacción. Ejecutarlo dos veces
no hace nada la segunda. **Vercel lo hace solo en cada despliegue** (`buildCommand` de `vercel.json`, con
`--if-remote`): si una migración falla, el despliegue se detiene y sigue en línea la versión anterior.

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
| `GEMINI_API_KEY` | (opcional) clave de Google AI Studio para «Traducir con IA» |
| `ANTHROPIC_API_KEY` | (opcional) clave de Anthropic para «Traducir con IA» |
| `TRANSLATION_PROVIDER` | (opcional) `gemini` o `claude`; sin ella, Gemini si hay su clave, si no Claude |
| `GEMINI_MODEL` | (opcional) modelo de Gemini; por defecto `gemini-2.5-flash` |

Las variables del frontend (`VITE_AUTH_SOURCE=api`, `VITE_DATA_SOURCE=mock`, `VITE_ALLOW_MOCK_BUILD=true`: landing con
datos locales y sesión real) ya van en el `buildCommand` de `vercel.json`. No pongas `VITE_API_URL`: el frontend usa
`/api/v1` en el mismo dominio.

## Noticias públicas, SEO y agentes de IA

- `/noticias` y `/noticias/<slug>` las sirve la función con el `index.html` del sitio y los metadatos de cada
  página ya escritos (título, descripción, canónica, Open Graph, Twitter, JSON-LD `NewsArticle` y migas): así las
  ven también WhatsApp, Facebook, X y los buscadores que no ejecutan JavaScript. Caché de 60 s en la CDN.
- `/sitemap.xml` y `/noticias/rss.xml` se generan con lo publicado. `robots.txt` apunta al sitemap.
- Para agentes de IA: `/llms.txt` (índice, https://llmstxt.org), `/llms-full.txt` (todas las noticias) y
  `/noticias/<slug>.md` (cada noticia en Markdown, anunciada con `<link rel="alternate" type="text/markdown">`).
  `robots.txt` da acceso explícito a los rastreadores de IA conocidos.
- Dominio: `SITE_URL` (variable de entorno opcional; por defecto `https://descubrerepdom.com`).
- `/admin` y `/login` llevan `X-Robots-Tag: noindex`; el resto del sitio es indexable.
- Con `VITE_STAGING_API=true` (en el `buildCommand`) el frontend no llama a rutas que el mini backend no tiene.

## Idiomas del contenido

- Noticias, provincias y categorías se publican en español y, con traducción, en en, fr, de, it y pt
  (tabla `content_translations`). El editor de noticias tiene una pestaña por idioma y «Traducir con IA».
- Lo público acepta `?lang=xx`; lo que no esté traducido sale en español. Cada noticia traducida declara sus
  versiones con `hreflang` y su canónica `…/noticias/<slug>?lang=xx`.

## Endpoints

`POST /api/v1/auth/login`, `/auth/refresh`, `/auth/logout`, `GET /auth/me`, y
`GET|POST /api/v1/admin/{provinces|news}`, `GET|PUT|DELETE /api/v1/admin/{provinces|news}/:id` (rol admin o editor),
`GET|POST /api/v1/admin/users`, `PATCH|DELETE /api/v1/admin/users/:id` (solo admin) y, sin sesión,
`GET /api/v1/public/{provinces|news}` (solo lo publicado; lo usa la landing).

Tests: `npx vitest run api/_index.test.ts`.

## Límites conocidos

- El token de refresco no se revoca en el servidor: cerrar sesión borra la cookie, pero un token copiado sigue
  valiendo hasta 7 días. Aceptable para staging; con usuarios reales, guardar los tokens en una tabla.
- Las imágenes subidas desde el panel se convierten a WebP en el navegador (máx. 1920 px y 2 MB) y se guardan en la
  tabla `media` de Turso; se sirven en `/api/v1/media/<id>.webp` con caché de un año. Es provisional: para
  mudarlas a un almacenamiento de archivos basta cambiar ese endpoint, las URLs guardadas siguen valiendo.
- La landing muestra las provincias publicadas en el carrusel de destinos y las noticias publicadas al frente de la
  sección de noticias (la más reciente, destacada). Los borradores no se ven. Como los enlaces de la landing están
  desactivados, el texto completo de una noticia solo se lee en el panel.
