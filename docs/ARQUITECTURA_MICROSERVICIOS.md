# Migración del monolito modular a microservicios

**Estado:** objetivo aprobado; diseño y preparación inicial en curso  
**Fecha:** 2026-09-30

## Objetivo

Descomponer el backend Fastify actual en servicios independientes por dominio. Cada servicio debe poder evolucionar y desplegarse con autonomía, ser dueño de sus datos y publicar contratos versionados. El frontend seguirá usando una entrada estable; no conocerá las ubicaciones internas de los servicios.

La migración es progresiva. `backend/` continúa siendo la fuente de verdad durante la extracción y no se elimina hasta que cada dominio haya cambiado de dueño, datos y despliegue con criterios de salida comprobados.

## Estado actual verificado

- `backend/` es un único proceso Fastify 5 con módulos internos por dominio, una API pública `/api/v1` y PostgreSQL 16.
- El registro incluye módulos como `auth`, `content`, `operators`, `store`, `game`, `payments`, `analytics`, `mailer`, `media`, `live` y `notifications`.
- Hay Dockerfile y Compose para la API y servicios locales de PostgreSQL, Redis, PgBouncer y Mailpit. Esto dockeriza el monolito, pero por sí solo no lo convierte en microservicios.
- El backend tiene contratos y validación en rutas; no se debe asumir que cada ruta actual equivale a un límite de servicio bien definido.
- Un inventario estático inicial encontró **61 pares de dependencias entre carpetas de dominio**. Tras mover utilidades y contratos de correo, scheduler, catálogo y lecturas de lugares/provincias y política pública de contenido, `node scripts/audit-module-dependencies.mjs` reporta **19 pares y 23 referencias entre módulos**. El conteo cubre imports relativos, no SQL, accesos a tablas ni llamadas en runtime.
- La implementación transversal de auditoría se movió de `modules/operators/team.ts` a `backend/src/lib/audit.ts`, y sus consumidores ahora importan desde la capa común. Se mantiene un reexport temporal para compatibilidad. La escritura sigue acoplada a `audit_log` en la base PostgreSQL compartida; para microservicios se debe reemplazar este adaptador por una interfaz/contrato de auditoría y definir auditoría local más un flujo de eventos, sin perder atomicidad de cambios sensibles.
- Se añadió `npm run architecture:dependencies` en `backend/` y se conectó al CI. El comando imprime las referencias y falla si los pares origen→destino superan 34, la nueva línea base alcanzada al extraer el contrato de correo. El escáner cubre imports relativos; no mide dependencias de base de datos ni llamadas en ejecución.
- La primera pasada del inventario SQL está documentada en [`DEPENDENCIAS_DATOS_INVENTARIO.md`](DEPENDENCIAS_DATOS_INVENTARIO.md). El módulo completo `live` tiene varios datos compartidos, por eso no se extraerá entero como primera unidad. Se seleccionó el subdominio meteorológico para el piloto por su tabla sin lectores externos observados; deben trasladarse administración, scheduler y persistencia antes del corte.
- Las funciones de fecha reutilizadas salieron de `modules/operators/domain/dates.ts` hacia `backend/src/lib/dates.ts`; los módulos consumidores ahora dependen de la capa común. Se conserva un reexport temporal para no cambiar los imports internos de `operators`.
- El CRUD genérico de tablas configuradas se movió de `modules/admin/tables.ts` a `backend/src/lib/table-admin.ts`; `admin/tables.ts` mantiene un reexport temporal y los módulos consumidores importan la utilidad compartida. Esto elimina el acoplamiento de `live`, `game`, `tools` y `marketing` al módulo de administración, pero no elimina el acceso SQL dinámico ni asigna ownership de los datos.
- Las tareas `live` se registran ahora en el composition root y las rutas reciben un puerto `runRefreshJob`; el módulo `live` dejó de importar el runner compartido. El scheduler y la persistencia de ejecución siguen dentro del monolito.
- Las utilidades de tokens opacos (`newOpaqueToken`, SHA-256) salieron de `modules/auth/tokens.ts` a `backend/src/lib/opaque-tokens.ts`; `auth/tokens.ts` las reexporta temporalmente y los tres consumidores de `operators` ya dependen de la capa común.
- El contrato de correo (`EmailTemplateData`, `SendEmailInput`, `MailerPort`) salió de `modules/mailer` a `backend/src/contracts/email.ts`. Los servicios de `auth`, `operators`, `store`, `marketplace` y `ambassadors` reciben el puerto; `Mailer` sigue siendo el adaptador local de cola durable y conserva su ciclo de vida en el plugin Fastify. En esa extracción los imports bajaron de 60 a 51 referencias y de 39 a 34 pares. Aún se comparte la DB/outbox transaccional; el puerto no implica que correo tenga despliegue independiente.
- El contrato del scheduler (`ScheduledJobDefinition`, `JobRegistrar`, `JobControlPort`, `JobRunnerPort`) salió de `modules/jobs/runner.ts` a `backend/src/contracts/jobs.ts`. Los dominios registran trabajo por `JobRegistrar`; el control del panel usa `JobRunnerPort`; la implementación PostgreSQL sigue en `modules/jobs`. La compilación del backend pasó y el inventario bajó a 28 pares y 44 referencias. La tabla de control sigue compartida, así que aún no es un scheduler independiente.
- Las definiciones `CollectionDef`/`COLLECTIONS`, el snapshot `ContentManifest` y las funciones de lectura de columnas están en `backend/src/contracts/content-collections.ts` y `backend/src/contracts/content-schema.ts`. `npm run db:gen-manifest` escribe el snapshot ahí. El `ContentReaderPort` (`backend/src/contracts/content-reader.ts`) define lecturas públicas de lugares, provincias, candidatos de IA, búsqueda, secciones, mapa y geo; `game`, `trips`, `ai` y las consultas de catálogo de `discover` lo consumen a través de `PostgresContentReader` en `modules/content/reader.ts`. El `BusinessVerificationPort` encapsula consultas/escrituras del sello verificado en `OperatorVerificationService`; admin mantiene HTTP/RBAC e IA consume sólo el lector de aprobados. Los puertos preservan PostgreSQL compartido mientras aíslan el transporte futuro. `discover` ya no ejecuta SQL propio: recibe `SearchAnalyticsPort`, `PublicSettingsReaderPort` y `FavoritesReaderPort` (`backend/src/contracts/`), implementados por `analytics`, `admin` y `me` y compuestos en `routes.ts`. Aprobar/rechazar un sello confirma decisión, perfil y `audit_log` en una sola transacción dentro de `OperatorVerificationService`. La propiedad física de datos aún no se ha transferido.
- El frontend conserva ramas de demostración. Sus escrituras críticas aún no deben exponerse como transacciones reales; véase [`MIGRACION_ESCRITURAS_BACKEND.md`](MIGRACION_ESCRITURAS_BACKEND.md).
- `server/` (Express/MySQL) está retirado y `cms/` (Strapi) es una fuente editorial de transición. No se reactivan automáticamente como servicios objetivo.

## Límites de servicio propuestos

Estos son límites iniciales que se validarán contra dependencias, datos y responsabilidades compartidas antes de mover código. La lista agrupa los módulos actuales; no significa que deban convertirse mecánicamente en un servicio por módulo.

| Servicio candidato | Responsabilidad y módulos actuales | Dueño de datos propuesto |
| --- | --- | --- |
| Identidad y acceso | Cuentas, sesiones, OAuth, MFA, roles y políticas (`auth`, parte de `access`) | Identidades, credenciales, sesiones, membresías y políticas de acceso |
| Contenido y territorio | CMS editorial, destinos, directorio, búsqueda y traducciones (`content`, `discover`, `i18n`, parte de `seo`) | Colecciones editoriales, entidades territoriales, slugs, traducciones y publicación |
| Operadores y reservas | Organizaciones, fichas reclamadas, inventario de experiencias y reservas (`operators`) | Operadores, disponibilidad y ciclo de vida de reservas |
| Comercio | Catálogo, carrito, pedidos, marketplace y productos (`store`, `products`, `marketplace`) | Productos, precios, inventario, carritos y pedidos |
| Pagos y facturación | Orquestación de pasarelas, conciliación, membresías y NCF (`payments`, `billing`, `memberships`) | Referencias de pago, reembolsos, liquidaciones y documentos fiscales; nunca PAN/CVC |
| Gamificación y viajes | XP, retos, pasaporte, viajes y tickets (`game`, `trips`) | Progreso, recompensas, viajes y tickets |
| Comunidad y moderación | Reseñas, UGC, reportes y perfiles de creadores (`community`, `creators`) | Publicaciones, reseñas, reportes y estados de moderación |
| Monetización y analítica | Anuncios, campañas, afiliación y embudos (`marketing`, `analytics`, `ambassadors`, `sponsorship`) | Campañas, atribución y eventos agregados sin PII innecesaria |
| Comunicación | Correo y notificaciones (`mailer`, `notifications`) | Outbox, plantillas, entregas, preferencias y bandejas |
| Plataforma y datos vivos | Archivos, clima/tasas, salud, configuración y tareas (`media`, `live`, `health`, `config`, `jobs`) | Metadatos de medios, cachés/proyecciones y configuración de plataforma |

### Propiedad de datos

Cada servicio será el único escritor de sus datos y los expondrá mediante su API o eventos. La meta es base de datos por servicio (o aislamiento equivalente en la etapa transitoria); ningún consumidor consultará directamente tablas ajenas. Las proyecciones de lectura pueden duplicar campos mínimos y deben tener una política de actualización explícita.

No se adopta todavía un broker concreto. Antes de elegir Kafka, NATS, RabbitMQ u otra opción se medirán volumen, orden, reintentos, retención y operación requerida. Los cambios de estado que generen eventos usarán outbox transaccional para no confirmar una escritura sin publicar su evento.

### Comunicación y entrada

- Mantener `/api/v1` detrás de una capa de gateway/ruteo para que el frontend no dependa de nombres de host internos.
- Usar HTTP para lecturas y comandos síncronos cuando el usuario necesita respuesta inmediata; usar eventos versionados para notificaciones y procesos desacoplados.
- Propagar `request_id`/trace context, identidad autenticada y deadlines; validar audiencia y autorización en cada servicio. El gateway no reemplaza controles de dominio.
- No pasar credenciales de base de datos, tokens de pago ni secretos de servicio al navegador.
- Documentar OpenAPI por servicio y política de compatibilidad antes de mover rutas existentes.

## Orden de migración

1. **Fase 0 — Inventario y contratos:** dibujar dependencias entre módulos/tablas, distinguir comandos de consultas, fijar ownership, SLA, datos personales, eventos y pruebas de contrato. Congelar la lista de rutas y el comportamiento externo.
2. **Fase 1 — Plataforma de microservicios:** materializar el facade Fastify como gateway de compatibilidad, configurar ruteo interno, configuración y secretos, identidad servicio-a-servicio, observabilidad distribuida, plantillas OCI, entorno local y staging. Elegir broker sólo con evidencia de requisitos.
3. **Fase 2 — Piloto meteorológico:** crear el servicio y su PostgreSQL independiente; trasladar esquema, importación/reconciliación de `weather_snapshots`, proveedor OpenWeather, refresh y administración; conservar `/api/v1` mediante proxy del facade Fastify; verificar contrato, salud y permisos; enrutar gradualmente y retirar sólo el lector/escritor anterior tras observar estabilidad. `live` seguirá en el monolito para tasas, eventos, alertas, webcams, loterías y reportes marinos.

**Estado de implementación (2026-09-30):** el facade puede configurarse para reenviar clima público y CRUD administrativo al proceso `weather`. Las rutas internas administrativas y el refresh manual verifican JWT HMAC HS256 ligado al actor, método, URL y hash del cuerpo; aceptan un `jti` una sola vez mediante `weather_internal_nonces`. El secreto compartido se configura como `WEATHER_SERVICE_TOKEN` en ambos procesos y `WEATHER_SERVICE_URL` activa el proxy del facade. Con el proxy activo, el runner del monolito omite `weather.refresh`; el scheduler puede correr en el servicio (`WEATHER_REFRESH_ENABLED=true`), y los refresh manuales van por la ruta interna firmada. `WEATHER_WRITES_FROZEN=true` bloquea temporalmente CRUD/refresh del facade para la reconciliación final sin cortar lecturas del origen. Un advisory lock por ejecución serializa refresh manuales y automáticos incluso entre instancias; otro lock separado mantiene un scheduler líder. El proceso sólo acepta `WEATHER_DATABASE_URL` (conexión diferenciada de la URL genérica del monolito). `npm run weather:migrate` aplica SQL versionado en transacciones, bajo advisory lock y con checksum inmutable; `weather:migrate:check` valida estado sin mutar. `backend/docker-compose.yml` aporta un perfil de desarrollo `weather` con PostgreSQL, volumen y puertos de loopback independientes; aún no se ha iniciado ni validado en este entorno. Persisten pendientes la migración/reconciliación de datos, el despliegue y la validación operativa.
4. **Fase 3 — Contenido/directorio:** definir propiedad de las colecciones, migrar el CMS y el catálogo, asegurar URLs públicas y SEO; el frontend consume el contrato estable del gateway.
5. **Fase 4 — Dominios transaccionales:** separar primero comercio y reservas/pagos con idempotencia, outbox, conciliación y escrituras duales sólo si existe reconciliación automatizada. No habilitar checkout real antes de cerrar los bloqueos indicados en `MIGRACION_ESCRITURAS_BACKEND.md`.
6. **Fase 5 — Dominios restantes:** identidad, gamificación, comunidad/moderación, analítica/monetización y comunicación según dependencias y coste operacional.
7. **Retiro por dominio:** eliminar el módulo original sólo después de comparar tráfico/respuestas, completar reconciliación, observar un periodo estable y tener rollback probado.

El orden piloto se puede cambiar si el mapa real de dependencias demuestra que otro módulo tiene menor acoplamiento. Cada cambio debe registrarse aquí antes de extraerlo.

### Hallazgos de acoplamiento

Medición del 2026-10-01 con `npm run architecture:dependencies` (imports relativos; no cuenta SQL ni llamadas en ejecución): **0 pares**, frente a 61 al inicio. CI falla ante cualquier import nuevo entre dominios. Los últimos cuatro se cortaron con `GameGrantPort` (`trips`), `PasswordVerifier` (`me`) y `ModerationPorts` (`admin`), compuestos en `routes.ts`.

El acoplamiento que queda es de datos. `npm run architecture:tables` encuentra 45 tablas tocadas por más de un módulo y 19 escritas por más de uno; el detalle está en [`DEPENDENCIAS_DATOS_INVENTARIO.md`](DEPENDENCIAS_DATOS_INVENTARIO.md).

Cortes del 2026-10-01: dinero (`lib/money.ts`), guarda SSRF (`lib/public-url.ts`), firma de Stripe (`lib/stripe-signature.ts`), token de baja (`lib/unsubscribe-token.ts`), roles de personal (`lib/roles.ts`), tipos de pasarela y puertos de conciliación (`contracts/payments.ts`) y notificaciones (`contracts/notifications.ts`). Los archivos originales conservan un reexport temporal. `game` y `trips` reciben `NotifyInTransaction` por constructor: sigue siendo un INSERT en la misma transacción y base; al separar la bandeja pasa a ser el outbox del dominio que avisa.

**Siguiente tarea técnica recomendada:** levantar los perfiles Compose `weather`, `content` y `content-sync`, conciliar datos y activar `WEATHER_SERVICE_URL`/`CONTENT_SERVICE_URL` en un entorno de prueba; después reemplazar la sincronización completa de contenido por un flujo de cambios (outbox) o mover la escritura del CMS al servicio. Las escrituras de `game` y `trips` y el resto de datos siguen bajo control del monolito.

## Criterios para aceptar un microservicio

- Tiene límite de negocio y dueño responsable, repositorio/paquete, configuración y pipeline de despliegue propios.
- Es dueño de sus escrituras y migraciones; no accede a tablas de otro servicio.
- Tiene contrato versionado, pruebas de contrato de consumidor/proveedor, health/readiness y compatibilidad con el gateway.
- Emite logs estructurados y métricas con `request_id`; los flujos entre servicios tienen trazas y límites de tiempo.
- Tiene estrategia definida para reintentos, duplicados, idempotencia, fallos parciales, eventos y rollback.
- Maneja secretos por entorno y cuenta de servicio con privilegios mínimos.
- Hay runbook, backup/retención acordes a sus datos y staging desplegado con la misma topología.

## Decisiones acordadas

- **Monorepo durante el piloto:** mantener los servicios en este repositorio, cada uno con paquete, configuración, imagen y pipeline de despliegue independientes. No fragmentar repositorios hasta demostrar que los límites y contratos del primer servicio son estables.
- **Entrada API compatible:** el backend Fastify actual seguirá recibiendo las rutas públicas `/api/v1` como facade/gateway de transición. El frontend no llamará a hosts internos ni cambia sus URLs durante las primeras extracciones. El proxy de una ruta se implementa sólo cuando el servicio extraído ya tenga su contrato y almacenamiento propios.
- **Sin broker previo al piloto:** conservar HTTP para solicitudes síncronas y agregar transporte de eventos únicamente cuando un flujo desacoplado tenga requisitos medidos de volumen, orden, retención y reintentos. Las operaciones transaccionales futuras usarán outbox.
- **Primer piloto: subdominio meteorológico:** extraer sólo tiempo actual y pronóstico (`GET /live/weather`, `GET /live/weather/forecast`) como servicio `weather`, dueño de `weather_snapshots` y `weather.refresh`. El resto de las rutas `live` queda en el monolito. El CRUD interno autenticado y el proxy RBAC están preparados con auditoría en el facade.
- La lógica vive en `modules/weather/service.ts`; `services/weather/server.ts` ofrece rutas públicas, CRUD/refresh internos, health/readiness y OpenAPI optativo. Usa `WEATHER_DATABASE_URL`, migraciones versionadas y scheduler optativo. Con el proxy activo se omite el job del monolito. `WEATHER_WRITES_FROZEN=true` permite bloquear CRUD/refresh del facade mientras se reconcilian datos, manteniendo lecturas del origen. Un lock de scheduler elige líder y un lock por ejecución serializa refresh. Build/escaneo OCI está configurado en CI, pero aún no hay evidencia de ejecución exitosa ni runtime independiente. El proxy permanece apagado hasta provisionar DB y completar corte.

## Decisiones pendientes antes del despliegue independiente

- Hosting de servicios, ingress/reverse proxy, DNS/TLS y balanceo fuera del facade Fastify.
- Identidad servicio-a-servicio y política de secretos según el entorno de ejecución.
- Tracing (OTel), almacenamiento de métricas/logs y dashboards para varios procesos.
- Topología de bases y plan de migración/reconciliación desde PostgreSQL compartido.
- Proveedor de pagos tokenizados; mapeo de productos actuales a IDs de catálogo backend; decisión sobre inscripciones/tickets gratuitos.
- Disponibilidad de credenciales/ambientes para staging y servicios externos.

Estas decisiones no bloquean el diseño local ni la preparación del piloto. Sí bloquean el despliegue independiente de cualquier servicio que dependa de ellas; no se fija aún una topología productiva sin datos del hosting objetivo.

## Registro de extracción

| Servicio | Estado | Criterio de salida |
| --- | --- | --- |
| Servicio `weather` (tiempo actual y pronóstico) | Módulo, contrato, entrypoint, rutas internas, proxy optativo, health/readiness, migrador versionado y Dockerfile; compilaciones locales pasan | Provisionar DB, desplegar y verificar CI/runtime; congelar escrituras con `WEATHER_WRITES_FROZEN`; migrar/reconciliar; activar proxy/secreto/scheduler en un cambio coordinado; observar equivalencia y preparar rollback; retirar adaptador antiguo tras periodo estable |
| Contenido/directorio | Lecturas entre dominios extraídas: proceso `services/content`, contrato RPC validado, cliente HTTP optativo en el facade, base propia como proyección de lectura, imagen y perfiles Compose; paridad HTTP/PostgreSQL probada en local. Sin levantar en Docker | Levantar los perfiles y conciliar; alimentar la proyección por eventos o mover el escritor (CMS, rutas públicas `/api/v1` de colecciones, traducciones) al servicio; datos y workflow editorial migrados; URLs, SEO y redirects preservados |
| Comercio | Por iniciar | Carrito y pedidos autoritativos, stock/precios del servidor, pagos tokenizados e idempotencia |
| Reservas y operadores | Por iniciar | Disponibilidad y reservas bajo dueño único; pagos/liquidaciones conciliados |
| Servicios restantes | Por priorizar | Matriz de dependencias completa al terminar el piloto |

## Servicio de contenido (estado 2026-10-01)

- **Qué se extrajo:** las lecturas que otros dominios hacen del catálogo (`ContentReaderPort`: `game`, `trips`, `ai`, `discover`). El CMS de administración, las rutas públicas de colecciones y las traducciones siguen en el monolito.
- **Contrato:** `POST /internal/content/read/:method` con `{ "args": [...] }` y respuesta `{ "data": ... }`. `backend/src/modules/content/reader-rpc.ts` define un esquema por método; el servicio valida rangos y tipos antes de ejecutar porque varias consultas interpolan límites en el SQL. Autenticación por secreto compartido (`CONTENT_SERVICE_TOKEN`) comparado en tiempo constante; al ser sólo lectura no usa nonces.
- **Facade:** `routes.ts` usa `HttpContentReader` si existe `CONTENT_SERVICE_URL`; si no, `PostgresContentReader` sobre la base compartida. Un servicio caído devuelve `SERVICE_UNAVAILABLE`; no hay fallback silencioso a la base compartida para no ocultar divergencias.
- **Datos:** base PostgreSQL propia con las 45 tablas de `COLLECTIONS` (`services/content/content-tables.txt`, verificado en CI). `services/content/scripts/sync-projection.sh` la reconstruye desde el origen (esquema completo, retiro de tablas ajenas, copia de datos, comparación de conteos). Exige confirmar el nombre de la base destino.
- **Límite conocido:** la proyección es una copia completa bajo demanda. Hasta tener un flujo de cambios, el servicio puede servir datos anteriores a la última publicación.
- **Hardening Compose:** `weather`, `weather-migrate` y `content` corren con `read_only`, `tmpfs /tmp`, `cap_drop: ALL` y `no-new-privileges`; los puertos sólo escuchan en loopback.

## Subdominios (decisión 2026-10-01)

El plan maestro dibuja un subdominio por servicio (`auth`, `b2b`, `api-gamificacion`, `ads`, `tienda`…). Para un proyecto personal en un VPS se simplifica a (el CMS conserva subdominio propio por decisión del responsable):

| Subdominio | Sirve |
| --- | --- |
| `descubrerd.com` | Sitio (SPA estática) |
| `api.descubrerd.com` | API Fastify completa bajo `/api/v1` |
| `cms.descubrerd.com` | CMS editorial, separado del sitio público y con acceso restringido al equipo |
| `staging.descubrerd.com` | Entorno de pruebas (sitio y API, con base propia) |
| `media.descubrerd.com` (opcional) | Archivos subidos, si se usa almacenamiento S3 o CDN |

Motivos: un certificado, un origen CORS y una cookie de sesión que funciona sin ajustes entre sitio y API; menos DNS y menos piezas que vigilar. La separación por dominio ya existe en el código (contratos, cero imports cruzados, un escritor por tabla), que es lo que permite extraer un servicio más adelante. Cuando uno se despliegue aparte seguirá detrás de `api.descubrerd.com`: el facade enruta y el frontend no cambia.
