# Despliegue en un VPS

Estado: **configurado, sin validar**. Los archivos de [`deploy/`](../deploy/) pasan la validación de sintaxis (`docker compose config`, `bash -n`), pero nunca se han levantado: no hay VPS contratado todavía. Trata el primer despliegue como una prueba y haz staging antes que producción.

## Qué hay

| Archivo | Para qué |
| :--- | :--- |
| `deploy/docker-compose.vps.yml` | Proxy Caddy (TLS automático), API, PostgreSQL y el paso de migraciones |
| `deploy/Caddyfile` | Sitio estático en `SITE_DOMAIN` y proxy a la API en `API_DOMAIN` |
| `deploy/.env.example` | Variables de cada entorno; se copia como `.env.prod` o `.env.staging` en el VPS |
| `deploy/deploy.sh` | Despliegue de la API, publicación atómica del frontend y vuelta atrás |
| `deploy/backup.sh` | Respaldo de la base con rotación |

El CMS (`cms.descubrerd.com`) y los servicios `content` y `weather` no están en este Compose: se añaden cuando se decida desplegarlos.

## Requisitos del VPS

- Linux con Docker y el plugin `compose`.
- Puertos 80 y 443 abiertos; el resto cerrado en el cortafuegos (SSH sólo con llave).
- Registros DNS `A` de `SITE_DOMAIN` y `API_DOMAIN` apuntando al VPS **antes** de arrancar: Caddy pide los certificados al iniciar.
- Como referencia, 2 GB de RAM alcanzan para API, PostgreSQL y proxy; es una estimación, no una medición.

## Primer despliegue

```bash
git clone <repositorio> /srv/descubre/app && cd /srv/descubre/app/deploy
cp .env.example .env.staging      # completar dominios y secretos
./deploy.sh staging api           # construye la imagen, migra y arranca
./deploy.sh staging site /ruta/al/dist   # publica el frontend
./deploy.sh staging status
```

El frontend se compila fuera del VPS (CI publica el artefacto `frontend-dist-<sha>`) con `VITE_API_URL=https://<API_DOMAIN>`, y se copia al servidor.

## Cómo se despliega sin cortar el servicio

- **Frontend:** cada versión va a `releases/<fecha>` y `current` es un enlace simbólico que se cambia con un `mv` atómico. Ninguna petición ve una versión a medias, y `./deploy.sh <entorno> rollback-site` vuelve a la anterior. Se conservan las últimas 5.
- **API:** primero corre `migrate`; si falla, la API anterior sigue en servicio. Luego se reemplaza el contenedor y se espera a que pase `/health/ready`. Hay un solo contenedor, así que existe una ventana de unos segundos durante el reinicio: Caddy reintenta hasta 30 s en vez de devolver error. No es un despliegue sin interrupción estricto; para eso harían falta dos réplicas.
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
