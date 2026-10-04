# Despliegue en un VPS

Estado: **validado en parte, en local (2026-10-03)**. La imagen de producción de la API se construyó y se ejecutó endurecida (sin root, sistema de archivos de sólo lectura, sin capabilities) contra PostgreSQL 16: arranca, pasa `/health/ready`, aplica las 74 migraciones, registra una cuenta y mantiene sesión. Esa prueba destapó dos errores de este Compose, ya corregidos: `TRUST_PROXY` debe ser el número de saltos (la API rechaza `true`) y el correo debe ser SMTP (la API no arranca con `log`). **Sigue sin validar** todo lo que necesita un servidor y un dominio: el proxy Caddy con TLS, `deploy.sh`, `backup.sh` y la publicación del frontend. Trata el primer despliegue como una prueba y haz staging antes que producción.

## Qué hay

| Archivo | Para qué |
| :--- | :--- |
| `deploy/docker-compose.vps.yml` | Proxy Caddy (TLS automático), API, PostgreSQL y el paso de migraciones |
| `deploy/Caddyfile` | Sitio estático en `SITE_DOMAIN` con la API bajo `/api`, y la misma API en `API_DOMAIN` |
| `deploy/.env.example` | Variables de cada entorno; se copia como `.env.prod` o `.env.staging` en el VPS |
| `deploy/deploy.sh` | Despliegue de la API, publicación atómica del frontend y vuelta atrás |
| `deploy/backup.sh` | Respaldo de la base con rotación |

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

## Pendiente

- Validar todo lo anterior en un VPS real.
- Staging y producción en el mismo servidor.
- CMS, `content` y `weather` en el Compose.
- Despliegue automático desde CI (hoy es manual por SSH).
- Monitoreo y alertas externas.
