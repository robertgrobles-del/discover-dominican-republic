# Inventario de dependencias de datos

**Estado:** inventario inicial, estático y parcial. La revisión no declara propiedad definitiva de tablas y no detecta de forma completa SQL dinámico, funciones/procedimientos, triggers, escrituras del helper genérico ni llamadas de runtime.
**Fecha:** 2026-09-30

Este documento apoya la transición del monolito modular a servicios con propiedad de datos propia. Antes de extraer una base hay que contrastar cada acceso con migraciones, `TableCfg`, jobs, permisos, triggers y escritores externos.

## Primer candidato: `weather`

El dominio `live` consulta y actualiza tasas, combustibles, loterías, alertas meteorológicas y reportes marinos. El subdominio `weather` ya tiene repositorio, servicio standalone, migraciones y una ruta de proxy optativa; la base/weather cutover sigue pendiente. La preparación Docker de `weather` no acredita ejecución de contenedores ni migración de datos.

| Recurso | Acceso observado | Dependencias / trabajo pendiente |
| --- | --- | --- |
| `exchange_rates` | `live` consulta y actualiza; también se ofrece administración genérica | `config`, `tools`, `store` y `marketplace` consumen tasas; definir contrato/proyección y trasladar CRUD al dueño |
| `fuel_prices` | Lectura de `live` y administración genérica | Confirmar escritores, migraciones y dueño antes de extraer |
| `lotteries`, `lottery_draws`, `lottery_results` | Lectura y administración genérica desde `live` | Confirmar escritores externos y trasladar administración |
| `weather_alerts` | Lectura y actualización en `live`; administración genérica | Confirmar fuente externa, escritores y contrato del proveedor |
| `weather_snapshots` | `weather` lee/actualiza con proveedor y administra vía repositorio | Servicio autónomo disponible; aplicar/reconciliar datos, comprobar readiness y hacer cutover coordinado |
| `marine_reports` | Rutas de `live` leen/escriben y exponen administración genérica | Mantener fuera del corte `weather`; definir propietario y consumidores por separado |

El proxy de weather debe activarse sólo después de migrar/reconciliar y verificar la base destino. Con proxy activo, el refresco programado corresponde al servicio weather y se omite el job del monolito; esto está configurado, pero no se ha validado en runtime.

## Lecturas del catálogo y territorios

`ContentReaderPort` declara lecturas públicas versionables. `PostgresContentReader` implementa el puerto sobre el pool PostgreSQL compartido; por tanto, el contrato desacopla consumidores, pero aún no prueba propiedad exclusiva ni transporte HTTP.

| Consumidor | Lecturas delegadas | Estado y dependencia remanente |
| --- | --- | --- |
| `game` | Lugar público, provincias y puntos de verificación geográfica | Usa `ContentReaderPort`; las escrituras de gamificación siguen en su dominio |
| `trips` | Datos de lugares seleccionados | Usa `ContentReaderPort`; viajes y actividades siguen siendo del dominio `trips` |
| `ai` | Candidatos de catálogo, búsqueda por interés, exclusiones, ranking verificado | Usa `ContentReaderPort` para catálogo y `BusinessVerificationReaderPort` para IDs aprobados. El adaptador de verificación está en `operators`; ambas implementaciones aún consultan la base PostgreSQL compartida |
| `discover` | Búsqueda global/sugerencias; capas y features de mapa; cercanía, reverse geocoding y secciones de portada | Las lecturas de catálogo y territorio usan `ContentReaderPort`, con `UNION ALL` y fallback para búsqueda. Ya no ejecuta SQL propio: los términos de búsqueda salen por `SearchAnalyticsPort` (`analytics`), el respaldo editorial por `PublicSettingsReaderPort` (`admin`) y los favoritos por `FavoritesReaderPort` (`me`). Los adaptadores siguen sobre la base compartida. |

`ai` conserva el ranking en su caso de uso; el adaptador de catálogo recibe los IDs aprobados desde `operators` y ya no consulta `business_verification_audits`. `admin` conserva los endpoints autenticados y delega consultas/aprobaciones/rechazos al `OperatorVerificationService`. Esto fija el límite de código actual, pero no la separación física: el servicio de operadores y el lector de contenido siguen usando el pool compartido.

## Límites conocidos del inventario

- El escáner `backend/scripts/audit-module-dependencies.mjs` cuenta imports relativos entre carpetas de dominio; actualmente reporta **19 pares y 23 referencias**. Este número no mide SQL ni ownership.
- `backend/src/lib/table-admin.ts` habilita lecturas/escrituras configuradas que no siempre aparecen como SQL literal del módulo consumidor. Revisar sus configuraciones y autorización antes de asignar propiedad.
- El frontend aún conserva adaptadores/datos de demostración; sus escrituras críticas no equivalen a transacciones reales del backend.
- El backend sigue desplegado como una aplicación Fastify con PostgreSQL compartido. El código de un servicio standalone o un perfil de Compose no constituye evidencia de cutover.

## Verificaciones reproducibles

Desde `backend/`, en PowerShell:

```powershell
npm run architecture:dependencies
npm run typecheck
```

La compilación independiente de weather se ejecuta con `npx tsc -p services/weather/tsconfig.json`. No iniciar ni validar Docker como parte de este inventario hasta que se solicite expresamente una comprobación de runtime.

## Proyección de contenido (2026-10-01)

El servicio `content` posee una copia de lectura de las tablas listadas en `backend/services/content/content-tables.txt` (las de `COLLECTIONS`). El monolito conserva la escritura. Quedan fuera de la proyección, y por tanto sin servir desde el servicio, `entity_translations` y cualquier otra tabla que no esté en esa lista. Rollback: retirar `CONTENT_SERVICE_URL` del facade.

## Acceso a tablas por módulo (2026-10-01)

Generado con `cd backend && npm run architecture:tables`. Es un barrido léxico del SQL de `src/modules/`: no ve nombres de tabla dinámicos (las colecciones del catálogo), triggers ni el SQL de `scripts/`. De 231 tablas definidas en migraciones, 184 aparecen en SQL estático; **41 las toca más de un módulo y ninguna la escribe más de uno** (la primera medición dio 45 y 19). CI falla si cualquiera de las dos cifras sube.

Cortes de escritura ya hechos, todos sobre la base compartida y conservando las transacciones originales:

- **Identidad:** `users`, `refresh_tokens` y `user_roles` sólo las escribe `auth` (`IdentityAdminPort`).
- **Perfil:** suspensión y preferencias de notificación pasan por `ProfileAdminPort` de `me`.
- **Borrado de cuentas:** `gdpr.process` salió de `operators`; cada dominio borra lo suyo como `AccountErasureParticipant`.
- **Moderación:** la cola de `admin` delega cada decisión en el dueño (`community`, `media`, `creators`) mediante `ModerationPorts.decide`; `game` levanta banderas por `UserFlagsPort` y publica fotos por `MediaReviewPort`.
- **Captación:** leads por `LeadCapturePort` (`marketing`), apertura de tickets por `SupportIntakePort` (`forms`), lectura de notificaciones por `NotificationService`.

- **Soporte:** la mesa de ayuda pasó de `admin/support.ts` a `forms/support-desk.ts`, junto a la recepción de tickets; las rutas `/admin/support/*` no cambian.
- **Registro:** `auth` crea el perfil con `ProfileAdminPort.createProfile` dentro de la transacción de registro.

**Ninguna tabla tiene ya más de un módulo escritor** en el SQL estático. Quedan 41 tablas con lecturas cruzadas: cada una necesita una proyección o un puerto de lectura antes de separar bases. Las más leídas son `users` (12 módulos), `profiles` (10), `bookings` y `org_members` (5 cada una).

| Tabla | Escriben | Sólo leen |
| --- | --- | --- |
| `users` | `auth` | `admin`, `ai`, `ambassadors`, `analytics`, `community`, `forms`, `game`, `marketing`, `marketplace`, `me`, `notifications`, `operators` |
| `profiles` | `me` | `admin`, `ambassadors`, `auth`, `community`, `content`, `forms`, `game`, `notifications`, `operators`, `trips` |
| `bookings` | `operators` | `admin`, `analytics`, `me`, `payments`, `trips` |
| `org_members` | `operators` | `access`, `admin`, `me`, `media`, `trips` |
| `exchange_rates` | `live` | `config`, `marketplace`, `store`, `tools` |
| `booking_payments` | `operators` | `admin`, `analytics`, `payments` |
| `favorites` | `me` | `ai`, `analytics`, `auth` |
| `reviews` | `community` | `admin`, `analytics`, `content` |
| `site_settings` | `admin` | `ai`, `analytics`, `tools` |
| `store_orders` | `store` | `ambassadors`, `analytics`, `payments` |
| `user_roles` | `auth` | `admin`, `forms`, `notifications` |
| `creator_profiles` | `creators` | `access`, `admin` |
| `establishment_registrations` | `forms` | `admin`, `analytics` |
| `media_assets` | `media` | `admin`, `game` |
| `notifications` | `notifications` | `auth`, `me` |
| `partner_profiles` | `operators` | `access`, `admin` |
| `social_posts` | `community` | `admin`, `analytics` |
| `support_tickets` | `forms` | `admin`, `me` |
| `ambassadors` | `ambassadors` | `access` |
| `creator_video_appeals` | `creators` | `admin` |
| `creator_videos` | `creators` | `admin` |
| `email_log` | `mailer` | `admin` |
| `explorer_follows` | `me` | `community` |
| `gamification_transactions` | `game` | `analytics` |
| `marketplace_order_items` | `marketplace` | `ambassadors` |
| `marketplace_orders` | `marketplace` | `ambassadors` |
| `marketplace_payments` | `marketplace` | `payments` |
| `newsletter_subscribers` | `forms` | `marketing` |
| `passport_stamps` | `game` | `ai` |
| `payouts` | `operators` | `admin` |
| `photo_submissions` | `game` | `admin` |
| `social_comments` | `community` | `admin` |
| `store_payments` | `store` | `payments` |
| `survey_responses` | `community` | `analytics` |
| `survey_templates` | `community` | `analytics` |
| `system_cron_jobs` | `jobs` | `admin` |
| `ugc_media` | `community` | `admin` |
| `ugc_reports` | `community` | `admin` |
| `user_flags` | `admin` | `game` |
| `user_gamification` | `game` | `notifications` |
| `toll_routes` | — | `content`, `tools` |

## Directorio de usuarios: diseño aplazado (2026-10-01)

Fuera de `auth` y `me` hay unas 100 lecturas de `users` y `profiles`, más de la mitad como `JOIN` en consultas de listado. Sustituirlas una a una por llamadas a un puerto multiplicaría las consultas sin acercar la separación de bases, y hacerlo ahora, con una sola base, sólo añadiría una copia que mantener.

Diseño para cuando un dominio se extraiga con base propia:

- **Proyección `user_directory`** en la base de cada servicio que la necesite: `id`, `display_name`, `avatar_url`, `status` y `updated_at`. Sin correo, teléfono ni roles.
- **El correo no se replica.** Quien necesite escribir a una persona (soporte, operadores, campañas) lo pide a `auth` por id en el momento, o delega el envío en el servicio de comunicación.
- **Alimentación:** eventos `user.profile_changed`, `user.status_changed` y `account.erased` por outbox desde `me` y `auth`; el borrado de cuenta ya está modelado como participantes por dominio.
- **Orden de adopción:** primero los dominios que sólo muestran nombre y avatar (`community`, `game`, `trips`), después los que filtran por estado (`admin`, `operators`).
