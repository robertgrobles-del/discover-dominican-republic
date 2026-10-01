# Backend — operación y salida a producción

Guía para quien despliega y opera la API (`backend/`). Complementa `backend/README.md` (qué hace cada módulo) y `docs/BACKEND_SEGURIDAD.md` (controles y riesgos).

## 1. Lista de verificación de salida

| # | Punto | Cómo comprobarlo |
|---|---|---|
| 1 | Configuración de producción válida | La API **no arranca** si falta algo crítico (`loadEnv`): claves JWT, `TOTP_ENCRYPTION_KEY`, `APP_SECRET` (≥ 32), `CORS_ORIGINS` con orígenes https concretos, `DATABASE_URL` sin credenciales por defecto, `MAIL_TRANSPORT=smtp` (`log` y `memory` se rechazan), `PAYMENT_PROVIDER` ≠ `fake` |
| 2 | Migraciones aplicadas | `npm run db:migrate` (cada archivo en su transacción; checksums: un cambio a una migración ya aplicada falla) |
| 3 | Proxy de confianza | `TRUST_PROXY` = nº de saltos o lista de IP/CIDR del balanceador (el formato se valida al arrancar; en producción se rechaza `true`, cualquiera podría falsear su IP). **Por defecto no se acepta `X-Forwarded-For`**; si detrás de un proxy no lo configuras, todos los clientes compartirán IP (y sus límites) |
| 4 | Límites compartidos entre instancias | `RATE_LIMIT_STORE=postgres` (o `redis` con `REDIS_URL`) |
| 5 | Correo | `MAIL_TRANSPORT=smtp` + SPF/DKIM/DMARC del dominio de `MAIL_FROM`; probar recuperación de contraseña y confirmación de reserva |
| 6 | Pagos | `PAYMENT_PROVIDER=stripe` con `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET`; registrar `POST /api/v1/webhooks/payments/stripe` en el panel de Stripe (eventos `payment_intent.succeeded`, `charge.refunded`, `charge.dispute.created`); probar un cobro y un reembolso en modo prueba |
| 7 | Trabajos programados | `JOBS_ENABLED=true` en **una o más** instancias (son seguros en paralelo). Verificar `GET /api/v1/admin/jobs` |
| 8 | Archivos subidos | `MEDIA_DIR` en un volumen persistente con respaldo, o migrar a S3 (interfaz `MediaStorage`) |
| 9 | Métricas | `METRICS_TOKEN` y alertas (sección 3) |
| 10 | Documentación de la API | `DOCS_ENABLED` queda **apagada** en producción salvo que se active explícitamente (sin ella no se sirven ni `/docs` ni `/openapi.json`) |
| 11 | Cuenta admin | Crear el primer admin (insertar en `user_roles`), activar su 2FA (`REQUIRE_2FA_FOR_STAFF` es `true` por defecto en producción) y guardar sus códigos de recuperación |
| 12 | Respaldo probado | `npm run db:backup -- --verify` (sección 2) |
| 13 | Datos de contenido | `npm run db:seed` (o carga desde el CMS); `npm run db:gen-manifest` **contra una base migrada** si cambió el esquema |
| 14 | Contenedor endurecido | Arrancar sin privilegios y con FS de solo lectura (sección 9); la imagen lleva SBOM y procedencia (sección 10) |

## 2. Respaldo y restauración

- **Frecuencia sugerida**: diaria completa + archivado continuo de WAL si el proveedor lo ofrece (meta: pérdida máxima 15 min, recuperación ≤ 2 h).
- **Comando**: `npm run db:backup` genera `backups/<base>-<fecha>.dump` (formato custom comprimido) y conserva los 14 más recientes (`--keep N`).
- **Prueba de restauración**: `npm run db:backup -- --verify` restaura en una base temporal y compara tablas, usuarios y migraciones. Ejecútalo al menos una vez por semana; una copia sin probar no es un respaldo.
- **Restaurar**: `pg_restore --no-owner --clean --if-exists --dbname <url> <archivo.dump>`; luego `npm run db:migrate` (aplica lo que falte) y reiniciar la API.
- **No incluye** los archivos subidos (`MEDIA_DIR`): respáldalos por separado.
- Cifra los respaldos y guárdalos fuera del servidor de la base de datos. Contienen datos personales (Ley 172-13).

## 3. Monitoreo y alertas

`GET /metrics` (Prometheus, `Authorization: Bearer $METRICS_TOKEN`). Las etiquetas usan el patrón de la ruta, nunca ids ni tokens de la URL.

| Métrica | Alerta sugerida | Qué significa |
|---|---|---|
| `app_db_up` | `== 0` 1 min | La base no responde |
| `app_jobs_failed` | `> 0` 15 min | Un trabajo programado falló: ver `error_log` en `/admin/jobs` |
| `app_jobs_stale` | `> 0` 30 min | Un trabajo activo dejó de correr (3× su frecuencia) |
| `app_mail_queue_depth` / `app_mail_oldest_queued_seconds` | `oldest > 900` | El envío de correo está atascado |
| `app_mail_failed_24h` | `> 20` | Fallos de entrega (SMTP, dominio) |
| `app_payment_events_unprocessed` | `> 0` 10 min | Webhooks recibidos que no se pudieron procesar; el proveedor reintenta, pero revísalo |
| `app_bookings_pending_unpaid` | crece sin bajar | El trabajo `bookings.expire_pending` no está liberando cupos |
| `app_payouts_pending` | antigüedad > 2 semanas | Liquidaciones a operadores sin pagar |
| `http_requests_total{status="5xx"}` | tasa > 1 % | Errores del servidor |
| `http_request_duration_seconds` | p95 > 1 s | Lentitud |
| `db_pool_connections{state="waiting"}` | `> 0` sostenido | Pool saturado (`DB_POOL_MAX`) |

Además: `/health` (liveness) y `/health/ready` (readiness con la base) para el balanceador; `GET /api/v1/admin/system/health` y `/admin/dashboard` para el panel. Cada respuesta lleva `X-Request-Id` para correlacionar con los registros (los datos sensibles y las cabeceras `authorization` y `cookie` se ocultan en el log).

## 4. Retención de datos

El trabajo `maintenance.purge` (diario) borra: sesiones vencidas hace más de 30 días, tokens de un solo uso vencidos o usados hace más de 7, correos entregados o fallidos de más de 90 días, eventos de pago procesados de más de 1 año, marcas de trabajos de más de 1 año, notificaciones leídas de más de 180 días y carritos de invitado sin actividad en 30 días. `analytics.rollup` agrega y purga los eventos de analítica a los 13 meses. `gdpr.process` anonimiza las cuentas cuya eliminación superó los 30 días de gracia. **No se purgan**: `audit_log` (trazabilidad), reservas y pedidos (obligación contable; se desligan de la cuenta al anonimizarla).

## 5. Rotación de secretos

- **Claves JWT (RS256)**: generar un par nuevo (`npm run keys:generate`), poner la clave pública anterior en `JWT_PREVIOUS_PUBLIC_KEYS` y desplegar; los tokens vigentes siguen validando hasta que venzan (15 min por defecto). Retirar la anterior después.
- **`APP_SECRET`**: invalida los enlaces de baja de newsletter y las URL de subida en curso (15 min); rotar en horario tranquilo.
- **`TOTP_ENCRYPTION_KEY`**: cambiarla deja ilegibles los secretos 2FA existentes; hay que re-enrolar a los usuarios con 2FA (requiere planificación).
- **Stripe**: rotar `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` en el panel del proveedor y desplegar ambos a la vez.
- Una clave filtrada en el repositorio se considera comprometida: rotarla aunque se borre del historial. El CI ejecuta `gitleaks` en cada cambio.
- **Custodia**: ningún secreto vive en Git ni se hornea en la imagen. `.env` está ignorado por Git y excluido del contexto de build (`.dockerignore`); en el servidor los secretos se inyectan en ejecución (variables del orquestador o su gestor de secretos, con archivo de permisos `600`). Los respaldos también contienen datos sensibles: cifrarlos (sección 2).

## 6. Respuesta a incidentes (primeras horas)

1. **Contener**: suspender cuentas implicadas (`POST /admin/users/{id}/suspend` cierra sus sesiones al instante), rotar las claves expuestas, desactivar un trabajo (`PATCH /admin/jobs/{name}`) o el proveedor de pagos (`PAYMENT_PROVIDER=none`: sólo se admite "pagar después").
2. **Investigar**: `GET /admin/audit-logs` (con `?format=csv`) filtra por actor, entidad, acción y fechas; `audit_log` registra verificaciones de operadores, cambios de roles, reembolsos, liquidaciones, moderación, exportaciones y reinicios de 2FA.
3. **Pagos**: conciliar contra el panel del proveedor; el webhook registra cobros huérfanos y los reembolsa solo (`payment.orphan_refunded` en auditoría).
4. **Datos personales**: si hubo exposición, notificar a la autoridad y a los titulares según la Ley 172-13; el listado de afectados sale de `audit_log` y los respaldos.

## 7. Cumplimiento (Ley 172-13) — lo que ya hace el sistema

Exportación de datos propios (`GET /me/export`), eliminación con 30 días de gracia y anonimización automática, consentimientos de marketing y analítica registrados con auditoría, analítica sin IP y sin datos personales, doble opt-in y baja con un clic del boletín, retención automática (sección 4). Pendiente de la organización: política de privacidad y avisos publicados, registro de tratamientos y contratos con encargados (proveedores de nube, pagos y correo).

## 8. Comandos útiles

```
npm run db:migrate            # aplica migraciones pendientes
npm run db:backup -- --verify # respaldo + prueba de restauración
npm run audit                 # vulnerabilidades en dependencias de producción
npm run keys:generate         # par de claves JWT
npm test                      # 400+ pruebas contra PostgreSQL real (una corrida a la vez: comparten la base de pruebas)
```

## 9. Contenedor de producción (sin privilegios y FS de solo lectura)

La imagen (`backend/Dockerfile`) ya corre como usuario `node` (no root) y sin herramientas de compilación. Al desplegarla, endurece el contenedor:

```bash
docker run -d --name descubre-api \
  --read-only --tmpfs /tmp \
  --cap-drop=ALL --security-opt no-new-privileges \
  --env-file /etc/descubre/produccion.env \
  -v descubre-media:/app/storage/media \
  -p 3000:3000 descubre-rd-api
```

- `--read-only`: el sistema de archivos de la imagen es inmutable; sólo se escribe en `/tmp` (tmpfs, en memoria) y en el volumen de medios. Los registros van a stdout, nunca a disco.
- `--cap-drop=ALL` y `--security-opt no-new-privileges`: sin capacidades extra (el puerto 3000 es > 1024) ni escalada de privilegios.
- `--env-file` con permisos `600`: los secretos se inyectan en ejecución y no se hornean en la imagen (sección 5).
- El volumen `descubre-media` (→ `/app/storage/media`, el `MEDIA_DIR` por defecto) hace sobrevivir las imágenes subidas a los despliegues; respáldalo aparte (sección 2).

El trabajo `docker` del CI (`.github/workflows/backend.yml`) arranca la imagen **exactamente así** (con claves efímeras y una base real) y espera a `/health` y `/health/ready`: un cambio que rompa el arranque endurecido falla el PR antes de llegar a producción.

## 10. SBOM y procedencia de la imagen

Cada ejecución del CI publica dos artefactos en `Actions → ejecución → Artifacts`:

- **`sbom.cdx.json`**: inventario CycloneDX de las dependencias de producción del backend (`npm sbom --sbom-format=cyclonedx --omit=dev`). Úsalo para responder "¿nos afecta esta CVE?" con datos, no a ojo.
- **`image-oci.tar`**: la imagen en formato OCI **con SBOM y atestación de procedencia** (`docker buildx build --sbom=true --provenance=mode=min`). La atestación registra con qué repositorio, commit y momento se compiló la imagen.

Para inspeccionar la procedencia y el SBOM de la imagen generada (el inspector lee un layout OCI extraído, no el tar; usa el mismo tag que pasaste a `--tag` —`ci` en el CI—):

```bash
mkdir -p /tmp/oci-layout && tar -xf image-oci.tar -C /tmp/oci-layout
docker buildx imagetools inspect oci-layout:///tmp/oci-layout:ci
# La lista muestra el manifiesto linux/amd64 y el de atestación (platform unknown/unknown);
# con `--raw oci-layout:///tmp/oci-layout@<digest>` sobre el digest de la atestación se ven los predicados (SPDX y SLSA).
```

`docker load -i image-oci.tar` carga la imagen en el motor local (los manifiestos de atestación no estorban al cargar).
