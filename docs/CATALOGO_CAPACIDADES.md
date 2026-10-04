# Catálogo interno de capacidades

> **Generado automáticamente** desde `backend/src/modules/access/catalog.ts` (versión `2026.10.1`).
> No se edita a mano: ejecuta `npx tsx scripts/gen-capability-doc.ts` desde `backend/`.

Cada capacidad dice **qué permite**, **de dónde sale la autorización**, **quién la asigna**, **si exige segundo factor**
y **cómo se da de baja**. El frontend consume esta misma información por API (`GET /api/v1/me/context`);
el servidor vuelve a comprobar el permiso en cada endpoint, así que ocultar un menú nunca es la única defensa.

## Resumen

- Capacidades declaradas: **24**
- Espacios de producto: **7**
- Reglas ruta → capacidad: **64**
- Capacidades con segundo factor obligatorio: **10**

## Espacios de producto

| Espacio | Entrada | Autorización | Descripción |
|---|---|---|---|
| Viajero | `/perfil` | Rol global | Mi cuenta, mis viajes, mis reservas y mi pasaporte |
| Empresa | `/operadores/panel` | Membresía de organización | Reservas, equipo y ficha de la organización activa |
| Creador | `/creadores` | Perfil de producto | Contenido, métricas, licencias y cobros propios |
| Embajador | `/creadores?panel=embajador` | Perfil de producto | Código de referencia, comisiones y retiros |
| Editorial | `/admin` | Rol global | Mesa editorial: borradores, revisiones y publicación |
| Moderación | `/admin` | Rol global | Cola de contenido de usuarios y apelaciones |
| Administración | `/admin` | Rol global | Cuentas, configuración, dinero y auditoría |

Una misma cuenta puede tener varios espacios a la vez (viajero, empresa, creador, embajador):
el contexto activo se conserva durante la sesión y **no** mezcla permisos entre espacios.

## Capacidades

| Capacidad | Panel | Autorización | Roles globales | Roles de organización | MFA |
|---|---|---|---|---|---|
| `content.explore` | publico | Acceso anónimo | — | — | No |
| `account.self_service` | viajero | Rol global | user, partner, ambassador, editor, moderator, admin | — | No |
| `account.authentication` | viajero | Rol global | user, partner, ambassador, editor, moderator, admin | — | No |
| `traveler.bookings` | viajero | Rol global | user, partner, ambassador, editor, moderator, admin | — | No |
| `traveler.ai_tools` | viajero | Rol global | user, partner, ambassador, editor, moderator, admin | — | No |
| `traveler.memberships` | viajero | Rol global | user, partner, ambassador, editor, moderator, admin | — | No |
| `community.participate` | viajero | Rol global | user, partner, ambassador, editor, moderator, admin | — | No |
| `gamification.self` | viajero | Rol global | user, partner, ambassador, editor, moderator, admin | — | No |
| `org.bookings_manage` | empresa | Membresía de organización | partner, admin | owner, admin, recepcion, guia | No |
| `org.team_manage` | empresa | Membresía de organización | partner, admin | owner, admin | No |
| `org.challenges_manage` | empresa | Membresía de organización | partner, admin | owner, admin | No |
| `creator.studio` | creador | Perfil de producto | user, partner, ambassador, editor, moderator, admin | — | No |
| `ambassador.program` | embajador | Perfil de producto | user, partner, ambassador, editor, moderator, admin | — | No |
| `editorial.content` | editorial | Rol global | admin, editor | — | Sí |
| `moderation.queue` | moderacion | Rol global | admin, moderator | — | Sí |
| `admin.accounts` | admin | Rol global | admin | — | Sí |
| `admin.global_config` | admin | Rol global | admin | — | Sí |
| `admin.finance` | admin | Rol global | admin | — | Sí |
| `admin.content_ops` | admin | Rol global | admin, editor | — | Sí |
| `admin.audit_read` | admin | Rol global | admin | — | Sí |
| `admin.access_catalog` | admin | Rol global | admin | — | Sí |
| `admin.panel_modules` | admin | Rol global | admin, editor, moderator | — | Sí |
| `support.readonly` | admin | Rol global | admin | — | Sí |
| `authenticated.self_service` | viajero | Permiso sobre el recurso | user, partner, ambassador, editor, moderator, admin | — | No |

## Ficha de gobierno

### `content.explore` — Explorar contenido público

- **Propósito:** Navegar el catálogo, el buscador y el mapa sin cuenta ni rol.
- **Panel:** publico
- **Fuente de autorización:** Acceso anónimo
- **Recursos:** catálogo público, buscador, mapa interactivo, contenido editorial
- **Dueño funcional:** Producto
- **Quién la asigna:** No se asigna: es acceso anónimo
- **Segundo factor:** no requerido
- **Baja o revocación:** No aplica

### `account.self_service` — Gestionar la cuenta propia

- **Propósito:** Perfil, preferencias, favoritos, notificaciones y exportación de datos propios.
- **Panel:** viajero
- **Fuente de autorización:** Rol global
- **Recursos:** /me/profile, /me/preferences, /me/favorites, /me/notifications, /me/export
- **Dueño funcional:** Producto
- **Quién la asigna:** Se concede al registrarse (rol `user`)
- **Segundo factor:** no requerido
- **Baja o revocación:** Se retira al suspender, borrar la cuenta o cerrar sesión

### `account.authentication` — Autenticarse y administrar credenciales

- **Propósito:** Entrar, cerrar sesión, verificar correo, recuperar contraseña y gestionar el segundo factor.
- **Panel:** viajero
- **Fuente de autorización:** Rol global
- **Recursos:** /auth/login, /auth/register, /auth/2fa, /auth/sessions
- **Dueño funcional:** Seguridad
- **Quién la asigna:** Automático por cuenta
- **Segundo factor:** no requerido
- **Baja o revocación:** Se invalida al cambiar contraseña, suspender la cuenta o revocar la sesión

### `traveler.bookings` — Gestionar reservas y pedidos propios

- **Propósito:** Reservar, pagar el saldo, cambiar fecha, cancelar y consultar comprobantes propios.
- **Panel:** viajero
- **Fuente de autorización:** Rol global
- **Recursos:** /me/bookings, /bookings/:id, /orders, /cart, /trips, /me/tickets
- **Dueño funcional:** Producto
- **Quién la asigna:** Automático por cuenta (o token de invitado para una reserva concreta)
- **Segundo factor:** no requerido
- **Baja o revocación:** Al cerrar sesión; el token de invitado caduca con la reserva

### `traveler.ai_tools` — Usar las herramientas de IA del viajero

- **Propósito:** Chat, itinerarios, recomendaciones y traducción, dentro de la cuota diaria.
- **Panel:** viajero
- **Fuente de autorización:** Rol global
- **Recursos:** /ai/chat, /ai/itinerary, /ai/recommendations, /ai/quota
- **Dueño funcional:** Producto
- **Quién la asigna:** Automático por cuenta; el personal interno tiene cuota ampliada
- **Segundo factor:** no requerido
- **Baja o revocación:** Apagando la bandera `ai_chat_enabled` o al suspender la cuenta

### `traveler.memberships` — Membresías, entradas y eventos

- **Propósito:** Suscribirse a un plan, comprar entradas de eventos y validar códigos de acceso.
- **Panel:** viajero
- **Fuente de autorización:** Rol global
- **Recursos:** /memberships/subscribe, /memberships/me, /events/:id/tickets/purchase
- **Dueño funcional:** Negocio
- **Quién la asigna:** Automático por cuenta (la compra genera la membresía)
- **Segundo factor:** no requerido
- **Baja o revocación:** Al vencer la membresía o reembolsarse la compra

### `community.participate` — Participar en la comunidad

- **Propósito:** Reseñar, comentar, publicar en el feed y responder campañas y formularios.
- **Panel:** viajero
- **Fuente de autorización:** Rol global
- **Recursos:** /reviews, /social, /campaigns, /forms, /media/upload-url
- **Dueño funcional:** Comunidad
- **Quién la asigna:** Automático por cuenta (sujeto a moderación y banderas antifraude)
- **Segundo factor:** no requerido
- **Baja o revocación:** Al suspender la cuenta o aplicar una bandera antifraude

### `gamification.self` — Pasaporte, retos y coleccionables propios

- **Propósito:** Ver y avanzar el progreso de juego propio; nunca concede permisos administrativos.
- **Panel:** viajero
- **Fuente de autorización:** Rol global
- **Recursos:** /passport/me, /gamification/routes, /collectibles/me
- **Dueño funcional:** Producto
- **Quién la asigna:** Se activa al participar (estado de producto, no rol de seguridad)
- **Segundo factor:** no requerido
- **Baja o revocación:** Al restablecer el progreso o darse de baja del ranking

### `org.bookings_manage` — Gestionar reservas de la organización

- **Propósito:** Atender, confirmar, cobrar y documentar las reservas de la organización activa.
- **Panel:** empresa
- **Fuente de autorización:** Membresía de organización
- **Recursos:** /org/bookings, /org/calendar, /org/income, /org/promotions
- **Dueño funcional:** Operaciones
- **Quién la asigna:** El propietario o un administrador de la organización invita al miembro
- **Segundo factor:** no requerido
- **Baja o revocación:** Al retirar la membresía, vencer la invitación o suspender la organización

### `org.team_manage` — Editar la organización y su equipo

- **Propósito:** Datos de la empresa, servicios, tarifas, sucursales y miembros con su rol y alcance.
- **Panel:** empresa
- **Fuente de autorización:** Membresía de organización
- **Recursos:** /org/team, /org/team-invitations, /org/listings, /org/branches
- **Dueño funcional:** Operaciones
- **Quién la asigna:** Solo el propietario asigna administradores; el propietario lo transfiere otro propietario
- **Segundo factor:** no requerido
- **Baja o revocación:** Al retirar la membresía o transferir la propiedad; el último propietario no se puede retirar

### `org.challenges_manage` — Campañas y retos patrocinados por la organización

- **Propósito:** Crear y administrar campañas o retos que la organización patrocina, con su presupuesto y vigencia.
- **Panel:** empresa
- **Fuente de autorización:** Membresía de organización
- **Recursos:** campañas patrocinadas, retos de marca, presupuesto de campaña
- **Dueño funcional:** Marketing
- **Quién la asigna:** El propietario o un administrador de la organización
- **Segundo factor:** no requerido
- **Baja o revocación:** Al retirar la membresía o vencer la campaña

### `creator.studio` — Estudio de creador y contenido propio

- **Propósito:** Onboarding de creador, publicaciones propias, métricas, licencias y cobros propios.
- **Panel:** creador
- **Fuente de autorización:** Perfil de producto
- **Recursos:** /creators/me, /creators/videos, /creators/onboarding
- **Dueño funcional:** Programa de creadores
- **Quién la asigna:** Se solicita en el onboarding y lo aprueba el equipo del programa
- **Segundo factor:** no requerido
- **Baja o revocación:** Al suspender el perfil de creador (`creator_profiles.status`), sin tocar el rol global

### `ambassador.program` — Programa de embajadores

- **Propósito:** Código de referencia, ventas atribuidas, comisiones y retiros propios.
- **Panel:** embajador
- **Fuente de autorización:** Perfil de producto
- **Recursos:** /ambassadors/me, /ambassadors/me/referrals, /ambassadors/me/payouts
- **Dueño funcional:** Afiliados
- **Quién la asigna:** Se solicita con correo verificado y lo aprueba el equipo de afiliados
- **Segundo factor:** no requerido
- **Baja o revocación:** Al suspender la afiliación; se retira el rol `ambassador` en el mismo paso

### `editorial.content` — Mesa editorial del portal

- **Propósito:** Preparar y actualizar borradores, previsualizar y enviar a revisión; publicar según política.
- **Panel:** editorial
- **Fuente de autorización:** Rol global
- **Recursos:** /admin/<colección>, /admin/seo_redirections, /admin/settings (lectura)
- **Dueño funcional:** Contenido
- **Quién la asigna:** Un administrador invita como editor (doble aprobación para `admin`)
- **Segundo factor:** obligatorio
- **Baja o revocación:** Al retirar el rol `editor`; las sesiones se invalidan al aplicarlo

### `moderation.queue` — Cola de moderación de contenido de usuarios

- **Propósito:** Revisar reseñas, publicaciones, comentarios, fotos, reportes y apelaciones dentro del alcance.
- **Panel:** moderacion
- **Fuente de autorización:** Rol global
- **Recursos:** /admin/moderation/queue, /admin/moderation/reports, /admin/user-flags, /admin/photo-submissions
- **Dueño funcional:** Confianza y seguridad
- **Quién la asigna:** Un administrador invita como moderador
- **Segundo factor:** obligatorio
- **Baja o revocación:** Al retirar el rol `moderator`; no concede acceso a cuentas, pagos ni configuración

### `admin.accounts` — Administración de cuentas y roles

- **Propósito:** Buscar cuentas, ver su estado, cambiar roles, suspender y restablecer accesos.
- **Panel:** admin
- **Fuente de autorización:** Rol global
- **Recursos:** /admin/users, /admin/ambassadors, /admin/verifications, /admin/approvals, /admin/access-reviews, /admin/staff-invitations
- **Dueño funcional:** Seguridad
- **Quién la asigna:** Otro administrador con segundo aprobador y MFA reciente
- **Segundo factor:** obligatorio
- **Baja o revocación:** Al retirar el rol `admin`; la regla del último administrador impide dejar el sistema sin ninguno

### `admin.global_config` — Configuración global y operación interna

- **Propósito:** Ajustes del sitio, banderas de función, reglas de IP, trabajos programados y salud del sistema.
- **Panel:** admin
- **Fuente de autorización:** Rol global
- **Recursos:** /admin/settings, /admin/system, /admin/ip-rules, /admin/jobs, /admin/live, /admin/calculators
- **Dueño funcional:** Infraestructura
- **Quién la asigna:** Otro administrador con doble aprobación
- **Segundo factor:** obligatorio
- **Baja o revocación:** Al retirar el rol `admin`; toda operación queda en la bitácora encadenada

### `admin.finance` — Operaciones financieras

- **Propósito:** Liquidaciones, pagos manuales, reembolsos y ajustes de saldo con motivo obligatorio.
- **Panel:** admin
- **Fuente de autorización:** Rol global
- **Recursos:** /admin/payouts, /admin/store/orders, /admin/discount_coupons, /admin/creators/:id/payout
- **Dueño funcional:** Finanzas
- **Quién la asigna:** Otro administrador; los pagos manuales exigen actor y aprobador distintos
- **Segundo factor:** obligatorio
- **Baja o revocación:** Al retirar el rol `admin`; el historial de pagos no se borra al retirarlo

### `admin.content_ops` — Operación de contenido e importaciones

- **Propósito:** Importar catálogos, generar contenido con IA, campañas de patrocinio y correo transaccional.
- **Panel:** admin
- **Fuente de autorización:** Rol global
- **Recursos:** /admin/imports, /admin/ai, /admin/sponsorship, /admin/email
- **Dueño funcional:** Contenido
- **Quién la asigna:** Un administrador; el editor solo accede a lo que no toca cuentas ni dinero
- **Segundo factor:** obligatorio
- **Baja o revocación:** Al retirar el rol correspondiente

### `admin.audit_read` — Lectura de la bitácora de auditoría

- **Propósito:** Consultar quién hizo qué, cuándo y con qué resultado; verificar la cadena de hashes.
- **Panel:** admin
- **Fuente de autorización:** Rol global
- **Recursos:** /admin/audit, /admin/audit/verify, /admin/audit-logs
- **Dueño funcional:** Seguridad
- **Quién la asigna:** Otro administrador
- **Segundo factor:** obligatorio
- **Baja o revocación:** Al retirar el rol `admin`; la bitácora es de solo anexado

### `admin.access_catalog` — Catálogo y auditoría de permisos

- **Propósito:** Consultar el catálogo de capacidades y el inventario de rutas con su fuente de decisión.
- **Panel:** admin
- **Fuente de autorización:** Rol global
- **Recursos:** /admin/access/catalog, /admin/access/audit
- **Dueño funcional:** Seguridad
- **Quién la asigna:** Otro administrador
- **Segundo factor:** obligatorio
- **Baja o revocación:** Al retirar el rol `admin`

### `admin.panel_modules` — Módulos internos sin capacidad específica

- **Propósito:** Cobertura declarada para las colecciones del CMS y módulos internos agrupados por colección.
- **Panel:** admin
- **Fuente de autorización:** Rol global
- **Recursos:** /admin/<colección>
- **Dueño funcional:** Seguridad
- **Quién la asigna:** Se hereda del rol que ya exige la ruta; sirve para que ninguna ruta quede sin declarar
- **Segundo factor:** obligatorio
- **Baja o revocación:** Al retirar el rol correspondiente

### `support.readonly` — Soporte de solo lectura por caso

- **Propósito:** Mirar la sesión de otra cuenta con banner visible, sin escrituras y con auditoría por petición.
- **Panel:** admin
- **Fuente de autorización:** Rol global
- **Recursos:** /admin/support, /admin/support-sessions, /admin/users/:id/impersonate
- **Dueño funcional:** Soporte
- **Quién la asigna:** Un administrador, por caso y con duración corta (15 minutos)
- **Segundo factor:** obligatorio
- **Baja o revocación:** Caduca sola o al cerrarla; la sesión de soporte solo puede terminar, nunca escribir

### `authenticated.self_service` — Servicios autenticados de alcance propio

- **Propósito:** Cobertura declarada para rutas autenticadas cuyo alcance lo fija el propio recurso (token, viaje, asignación).
- **Panel:** viajero
- **Fuente de autorización:** Permiso sobre el recurso
- **Recursos:** cualquier ruta autenticada no listada arriba
- **Dueño funcional:** Seguridad
- **Quién la asigna:** Automático por sesión válida
- **Segundo factor:** no requerido
- **Baja o revocación:** Al cerrar la sesión o revocarse el token

## Reglas ruta → capacidad

Se evalúa por **prefijo más específico**: una ruta concreta siempre gana sobre el prefijo general.

| Prefijo de ruta | Capacidad |
|---|---|
| `/api/v1/admin/creator-deliverables` | `admin.accounts` |
| `/api/v1/admin/staff-invitations` | `admin.accounts` |
| `/api/v1/admin/capability-grants` | `admin.accounts` |
| `/api/v1/admin/creator-campaigns` | `admin.accounts` |
| `/api/v1/admin/photo-submissions` | `moderation.queue` |
| `/api/v1/admin/creator-disputes` | `admin.accounts` |
| `/api/v1/admin/support-sessions` | `support.readonly` |
| `/api/v1/admin/photo-challenges` | `moderation.queue` |
| `/api/v1/admin/discount_coupons` | `admin.finance` |
| `/api/v1/admin/seo_redirections` | `editorial.content` |
| `/api/v1/admin/access-reviews` | `admin.accounts` |
| `/api/v1/admin/creator-ledger` | `admin.accounts` |
| `/api/v1/admin/verifications` | `admin.accounts` |
| `/api/v1/auth/impersonation` | `support.readonly` |
| `/api/v1/admin/ambassadors` | `admin.accounts` |
| `/api/v1/admin/sponsorship` | `admin.content_ops` |
| `/api/v1/admin/calculators` | `admin.global_config` |
| `/api/v1/admin/moderation` | `moderation.queue` |
| `/api/v1/admin/user-flags` | `moderation.queue` |
| `/api/v1/team-invitations` | `org.team_manage` |
| `/api/v1/admin/approvals` | `admin.accounts` |
| `/api/v1/admin/creators` | `admin.finance` |
| `/api/v1/admin/settings` | `admin.global_config` |
| `/api/v1/admin/ip-rules` | `admin.global_config` |
| `/api/v1/admin/support` | `support.readonly` |
| `/api/v1/admin/payouts` | `admin.finance` |
| `/api/v1/admin/imports` | `admin.content_ops` |
| `/api/v1/notifications` | `account.self_service` |
| `/api/v1/admin/access` | `admin.access_catalog` |
| `/api/v1/admin/system` | `admin.global_config` |
| `/api/v1/gamification` | `gamification.self` |
| `/api/v1/collectibles` | `gamification.self` |
| `/api/v1/admin/users` | `admin.accounts` |
| `/api/v1/admin/audit` | `admin.audit_read` |
| `/api/v1/admin/store` | `admin.finance` |
| `/api/v1/admin/email` | `admin.content_ops` |
| `/api/v1/ambassadors` | `ambassador.program` |
| `/api/v1/memberships` | `traveler.memberships` |
| `/api/v1/admin/jobs` | `admin.global_config` |
| `/api/v1/admin/live` | `admin.global_config` |
| `/api/v1/campaigns` | `community.participate` |
| `/api/v1/admin/ai` | `admin.content_ops` |
| `/api/v1/org/team` | `org.team_manage` |
| `/api/v1/creators` | `creator.studio` |
| `/api/v1/passport` | `gamification.self` |
| `/api/v1/bookings` | `traveler.bookings` |
| `/api/v1/checkout` | `traveler.bookings` |
| `/api/v1/reviews` | `community.participate` |
| `/api/v1/tickets` | `traveler.bookings` |
| `/api/v1/coupons` | `traveler.bookings` |
| `/api/v1/social` | `community.participate` |
| `/api/v1/events` | `traveler.memberships` |
| `/api/v1/orders` | `traveler.bookings` |
| `/api/v1/admin` | `admin.panel_modules` |
| `/api/v1/media` | `community.participate` |
| `/api/v1/forms` | `community.participate` |
| `/api/v1/trips` | `traveler.bookings` |
| `/api/v1/users` | `account.self_service` |
| `/api/v1/cart` | `traveler.bookings` |
| `/api/v1/auth` | `account.authentication` |
| `/api/v1/org` | `org.bookings_manage` |
| `/api/v1/ai` | `traveler.ai_tools` |
| `/api/v1/me` | `account.self_service` |
| `/api/v1` | `authenticated.self_service` |

## Cómo se audita

- `GET /api/v1/admin/access/catalog`: catálogo completo con su gobierno (requiere rol `admin`).
- `GET /api/v1/admin/access/audit`: inventario real de rutas (`app.routeTable`) cruzado con este catálogo:
  método, recurso, permiso, roles, ámbito de organización, MFA y **fuente de decisión**.
- `backend/test/access.test.ts`: comprueba que ninguna ruta autenticada queda sin capacidad declarada
  y que ninguna capacidad administrativa se concede a un rol que no es de personal interno.
