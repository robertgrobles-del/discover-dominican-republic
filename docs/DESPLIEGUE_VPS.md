# Despliegue en un VPS

Estado: **validado en parte, en local (2026-10-03)**. La imagen de producción de la API se construyó y se ejecutó endurecida (sin root, sistema de archivos de sólo lectura, sin capabilities) contra PostgreSQL 16: arranca, pasa `/health/ready`, aplica las 74 migraciones, registra una cuenta y mantiene sesión. Esa prueba destapó dos errores de este Compose, ya corregidos: `TRUST_PROXY` debe ser el número de saltos (la API rechaza `true`) y el correo debe ser SMTP (la API no arranca con `log`). **Sigue sin validar** todo lo que necesita un servidor y un dominio: el proxy Caddy con TLS, `deploy.sh`, `backup.sh` y la publicación del frontend. Trata el primer despliegue como una prueba y haz staging antes que producción.

## Qué hay

| Archivo | Para qué |
| :--- | :--- |
| `deploy/docker-compose.vps.yml` | Proxy Caddy (TLS automático), API, PostgreSQL y el paso de migraciones |
| `deploy/Caddyfile` | Sitio estático en `SITE_DOMAIN` con la API bajo `/api`, y la misma API en `API_DOMAIN` |
| `deploy/.env.example` | Variables de cada entorno; se copia como `.env.prod` o `.env.staging` en el VPS |
| `deploy/deploy.sh` | Despliegue de la API, publicación atómica del frontend y vuelta atrás |
| `deploy/backup.sh` | Respaldo de la base con rotación y copia externa cifrada |
| `deploy/watchdog.sh` | Aviso cuando la API deja de responder |
| `deploy/lib.sh` | Funciones comunes de los dos anteriores |

El CMS (`cms.descubrerd.com`) y los servicios `content` y `weather` no están en este Compose: se añaden cuando se decida desplegarlos.

## Requisitos del VPS

- Linux con Docker y el plugin `compose`.
- Puertos 80 y 443 abiertos; el resto cerrado en el cortafuegos (SSH sólo con llave).
- Registros DNS `A` de `SITE_DOMAIN` y `API_DOMAIN` apuntando al VPS **antes** de arrancar: Caddy pide los certificados al iniciar.
- Un servidor SMTP: la API no arranca en producción (ni en staging) sin `SMTP_HOST`.
- Memoria medida en local, en reposo y sin tráfico: API 133 MB y PostgreSQL 100 MB. Con sistema, proxy y margen, 2 GB de RAM son un mínimo razonable; no hay medición bajo carga.

## Primer despliegue

```bash
git clone <repositorio> /srv/descubre/app && cd /srv/descubre/app/deploy
cp .env.example .env.staging      # completar dominios y secretos
./deploy.sh staging api           # construye la imagen, migra y arranca
./deploy.sh staging site /ruta/al/dist   # publica el frontend
./deploy.sh staging status
```

El frontend se compila fuera del VPS (CI publica el artefacto `frontend-dist-<sha>`) **sin definir `VITE_API_URL`** y con `VITE_DATA_SOURCE=api`, y se copia al servidor. Con ese valor el catálogo se lee del backend, que es la fuente de verdad (`VITE_CATALOG_SOURCE` vacío sigue a `VITE_DATA_SOURCE`; sólo hay que definirlo para forzar `static` o `api` por separado). Así llama a la API por `/api/v1` en su mismo dominio, que el proxy reenvía. No apuntes el frontend a `API_DOMAIN`: la política de seguridad de contenido de `index.html` sólo permite conexiones al propio origen y el navegador bloquearía todas las llamadas (comprobado en local). `API_DOMAIN` queda para integraciones externas.

`npm run build` ejecuta después `scripts/postbuild.mjs`, que deja en `dist/`:

- **Fichas prerenderizadas** (`/destino/:slug`, `/playa/:slug`, `/alojamiento/:slug`, `/restaurante/:slug`, `/bar/:slug`, `/experiencia/:slug`, `/montana/:slug`, `/aeropuerto/:slug`, `/articulo/:slug`): un `index.html` por ficha con su título, descripción, imagen, URL canónica, datos estructurados y un resumen del contenido, para buscadores y para las vistas previas de WhatsApp, Facebook o X, que no ejecutan JavaScript. Caddy las sirve antes de caer en la plantilla de la aplicación (`try_files {path} {path}/index.html /index.html`). Variables del build: `SITE_URL` (dominio canónico) y, opcional, `PRERENDER_API` para que los textos salgan del backend. Una ficha creada después en el CMS no tiene página propia hasta el siguiente build: mientras tanto responde la aplicación, como antes.
- **Píxeles de publicidad**: sólo si el build define `VITE_META_PIXEL_ID` o `VITE_TIKTOK_PIXEL_ID` se añaden sus dominios a la política de seguridad de contenido. El script del píxel no se carga hasta que la persona acepta la analítica, y no recibe datos personales (`src/lib/marketingPixels.ts`).

## Cómo se despliega sin cortar el servicio

- **Frontend:** cada versión va a `releases/<fecha>` y `current` es un enlace simbólico que se cambia con un `mv` atómico. Ninguna petición ve una versión a medias, y `./deploy.sh <entorno> rollback-site` vuelve a la anterior. Se conservan las últimas 5.
- **API:** primero corre `migrate`; si falla, la API anterior sigue en servicio. Luego se reemplaza el contenedor y se espera a que pase `/health/ready`. Hay un solo contenedor, así que existe una ventana de unos segundos durante el reinicio: Caddy reintenta hasta 30 s en vez de devolver error. No es un despliegue sin interrupción estricto; para eso harían falta dos réplicas.
- **Contenido inicial:** una sola vez tras la primera migración (y cada vez que cambien los archivos de `src/data`), desde una copia del repositorio y con un túnel SSH a la base: `ssh -L 5440:localhost:5432 usuario@servidor` y, en `backend/`, `DATABASE_URL=postgres://…@localhost:5440/… npm run db:import-static`. Carga las fichas del catálogo con su ficha completa y los documentos de contenido; no pisa lo que el equipo ya haya editado. Con `-- --dry-run` sólo informa.
- **Migraciones:** deben ser compatibles con la versión anterior de la API mientras dura el cambio (añadir antes de quitar). `deploy.sh` hace un respaldo antes de migrar.

## Staging

Mismo Compose con otro proyecto y otro archivo de variables (`-p descubre-staging --env-file .env.staging`): base, volúmenes y red propios.

- **Recomendado:** un segundo VPS pequeño. Es idéntico a producción y no compite por memoria.
- **En el mismo VPS:** esta configuración no lo resuelve todavía. Dos proxies no pueden ocupar a la vez los puertos 80 y 443, y Caddy los necesita para emitir certificados. Haría falta un único proxy para ambos entornos.

Antes de aplicar una migración en producción, restaura en staging el último respaldo de producción y despliega allí primero.

## Respaldos

```bash
./backup.sh prod        # a diario con cron
```

Deja los volcados en `BACKUP_DIR/<entorno>` y borra los de más de `BACKUP_KEEP_DAYS` días. **Copia esa carpeta fuera del VPS**: un respaldo en el mismo disco no protege de perder el servidor. La prueba de restauración está descrita en [`BACKEND_OPERACION.md`](BACKEND_OPERACION.md).

### Copia externa cifrada

Con `BACKUP_S3_BUCKET` definido en el archivo del entorno, `backup.sh` cifra el volcado (AES-256, clave derivada de `BACKUP_ENCRYPTION_KEY`) y lo sube con su huella SHA-256 a un almacenamiento compatible con S3: AWS S3, Cloudflare R2, DigitalOcean Spaces, Backblaze B2, MinIO o Google Cloud Storage con claves HMAC. Sólo necesita `openssl` y `curl` (7.75 o posterior), que ya están en el servidor. Recomendaciones: una clave de acceso que sólo pueda escribir en ese bucket, una regla de ciclo de vida que caduque las copias antiguas, y la clave de cifrado guardada fuera del servidor: sin ella las copias no se pueden leer.

```bash
# Restaurar desde el bucket: bajar x.dump.enc y x.dump.enc.sha256, comprobar y descifrar
sha256sum -c x.dump.enc.sha256
BACKUP_ENCRYPTION_KEY=… openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -in x.dump.enc -out x.dump -pass env:BACKUP_ENCRYPTION_KEY
```

Fuera del VPS, `npm run db:backup -- --upload` hace lo mismo y `-- --decrypt x.dump.enc` descifra. Si el respaldo falla en cualquier paso, `backup.sh` termina con error y avisa al canal del equipo.

## Monitoreo y avisos

| Qué vigila | Cómo | Variables |
|---|---|---|
| Excepciones no controladas de la API, fallos de tareas programadas y caída del proceso | La API las envía a Sentry (por HTTP, sin SDK) y avisa al canal | `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `ALERT_WEBHOOK_URL` |
| Que la API responda | `./watchdog.sh prod` desde cron: consulta `/api/v1/health/ready` por la dirección pública y avisa al caer, cada 30 minutos mientras siga caída y al recuperarse | `ALERT_WEBHOOK_URL` |
| Respaldo diario | `backup.sh` avisa si falla el volcado o la subida | `ALERT_WEBHOOK_URL` |

`ALERT_WEBHOOK_URL` es un webhook entrante de Slack o de Discord. Los avisos no llevan datos personales: de una petición sólo salen el método, la ruta declarada (`/bookings/:id`, no la URL real), el identificador de la petición y el id de la cuenta. El mismo error avisa al canal una vez cada cinco minutos; a Sentry va cada ocurrencia.

```cron
*/5 * * * *  /srv/descubre/deploy/watchdog.sh prod
15 3 * * *   /srv/descubre/deploy/backup.sh prod >> /var/log/descubre-backup.log 2>&1
```

El vigilante corre en el mismo servidor: no detecta que el servidor entero esté apagado o sin red. Para eso hace falta además un monitor externo (el de Sentry, UptimeRobot u otro) apuntando a `https://<dominio>/api/v1/health/ready`.

## Pendiente

- Validar todo lo anterior en un VPS real.
- Staging y producción en el mismo servidor.
- CMS, `content` y `weather` en el Compose.
- Despliegue automático desde CI (hoy es manual por SSH).
- Monitoreo y alertas externas.
