# Frontend — despliegue, caché y service worker

Guía para quien publica el portal (SPA de Vite en `dist/`). Complementa `docs/SEGURIDAD_SESION_Y_CABECERAS.md` (cabeceras de seguridad) y `MOCK_MIGRATION_NOTES.md` (retirada del service worker anterior).

## 1. Despliegue atómico y rollback

El frontend es un sitio estático: el despliegue consiste en sustituir el contenido servido por el de un build validado. Para que el cambio sea atómico (nunca una versión mezclada) y el rollback inmediato:

1. **Artefacto**: cada ejecución validada del flujo `frontend` publica `dist/` como artefacto `frontend-dist-<sha>` (workflow `frontend.yml`, `actions/upload-artifact@v4`, retención 90 días). También se puede recompilar bajo demanda con *Run workflow* (`workflow_dispatch`) sobre cualquier revisión de `dev`.
2. **Publicar sin sobrescribir**: subir el artefacto a un directorio de release inmutable con la fecha y el sha, por ejemplo `releases/2026-09-29-<sha>/`.
3. **Cambiar el puntero**: al terminar la subida, apuntar el servidor web al release nuevo. Con nginx, cambiar el enlace simbólico del `root` y recargar; con hosting de archivos, promover la carpeta.
4. **Conservar releases**: mantener los N releases anteriores (sugerido: 5 o los últimos 30 días). No borrar el release anterior hasta que el nuevo pase la comprobación de humo.
5. **Rollback**: volver a apuntar el `root` al release anterior (el mismo enlace simbólico, un comando) o, si el release ya no está en el servidor, descargar su artefacto con
   `gh run download <run-id> -n frontend-dist-<sha>` y subirlo.

Comprobación mínima después de cada despliegue (humo):

- `GET /` devuelve 200 y el `index.html` del release nuevo (comprobar el `<script type="module" src="/assets/index-<hash>.js">`).
- Una ruta profunda (p. ej. `/destinos`) carga con recarga directa: el hosting debe devolver `index.html` para rutas desconocidas (fallback SPA).
- `GET /estado` responde (página de estatus del servicio).

El fallback SPA es requisito del hosting (nginx: `try_files $uri /index.html;`; Vercel: rewrite de todas las rutas a `/index.html`; Netlify: regla `/* /index.html 200`). Sin él, las rutas profundas dan 404 aunque el despliegue sea correcto.

## 2. Política de caché y versionado de assets

Vite genera nombres con hash de contenido (`/assets/<nombre>-<hash>.js|css`): si el contenido cambia, cambia la URL, así que los assets son inmutables y el `index.html` es el único archivo que debe revalidarse.

Regla aplicada (archivo `public/_headers`, se sirve tal cual en el hosting):

| Ruta | Cabecera | Motivo |
|---|---|---|
| `/*` | `Cache-Control: no-cache` | `index.html` y el resto de archivos sin hash se revalidan en cada petición; nunca se sirve un HTML viejo que apunte a assets borrados |
| `/assets/*` | `Cache-Control: public, max-age=31536000, immutable` | Nombres con hash: la URL es única por contenido |

`no-cache` no significa «no guardar»: significa revalidar (con `ETag`, que el hosting estático genera) antes de usar la copia. Es la elección segura para el HTML.

Equivalencia por hosting (si el hosting no lee `_headers`):

- **nginx**:

  ```nginx
  location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
  location /       { add_header Cache-Control "no-cache"; try_files $uri /index.html; }
  ```

- **Vercel** (`vercel.json`):

  ```json
  { "headers": [
      { "source": "/(.*)", "headers": [{ "key": "Cache-Control", "value": "no-cache" }] },
      { "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }
  ] }
  ```

- **Netlify/Cloudflare Pages**: usan `_headers` directamente; no hay que hacer nada más.

**Verificación tras desplegar** (con el dominio real, no en local):

```bash
curl -sI https://<dominio>/                        | grep -i cache-control   # no-cache
curl -sI https://<dominio>/assets/<archivo>.js     | grep -i cache-control   # immutable
```

Las cabeceras de seguridad del HTML (CSP, `Referrer-Policy`, etc.) se gobiernan aparte: ver `docs/SEGURIDAD_SESION_Y_CABECERAS.md` (§ Pendiente antes de producción). Cuando el hosting esté definido, configurarlas en el mismo mecanismo que `_headers`.

## 3. Service worker: estado y guardas

Un build anterior del portal registró un service worker PWA en el origen de producción. Un service worker instalado sirve su propia copia cacheada y **ninguna corrección del servidor llega a los navegadores que lo tengan activo**, así que su retirada tiene dos partes:

- **Retirada (hecha)**: se eliminó `vite-plugin-pwa` del proyecto y se borró `dist/` (ver `MOCK_MIGRATION_NOTES.md`). Ningún build actual registra un service worker.
- **Limpieza en el navegador (hecha)**: `index.html` incluye un script de limpieza que, al cargar, desregistra cualquier service worker existente, borra sus cachés y recarga la pestaña **una sola vez** (guarda `dr-sw-cleanup-v1` en `sessionStorage`). Si no hay registros, no hace nada. Es idempotente y se puede retirar cuando pase el periodo de gracia (sugerido: 3–6 meses desde la retirada).

Regresiones cubiertas por pruebas (`src/test/service-worker-removal.test.ts`):

- Ningún archivo de `src/`, `index.html` ni `public/` llama a `serviceWorker.register(`.
- `index.html` conserva el desregistro, el borrado de cachés y la guarda de recarga única.
- `package.json` y `vite.config.ts` no reintroducen `vite-plugin-pwa`.
