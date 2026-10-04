# API implementada (backend/)

> Generado automáticamente por `npm run docs:api` a partir de las rutas que el servidor registra. **No se edita a mano**: si una ruta cambia, se regenera (CI verifica con `npm run docs:api -- --check`).
> `docs/BACKEND_API.md` es el diseño original; donde difiera, esta lista describe lo que existe. Detalle de cada módulo, reglas y ejemplos: `backend/README.md`. Contrato completo (esquemas de entrada y salida): `/docs` (Swagger) del servidor.

Versión 0.1.0 · 1006 operaciones en 47 grupos.

Convenciones: todas las rutas cuelgan de `/api/v1`. Errores con la forma `{ error: { code, message, details, request_id } }`. **Sesión** = `Authorization: Bearer <jwt>`; **Opcional** = funciona sin sesión y, con ella, personaliza.

## Diferencias deliberadas respecto al diseño original
| Diseño (`BACKEND_API.md`) | Implementado | Motivo |
|---|---|---|
| `GET /tickets/verify?code=` | `POST /tickets/verify` | Marca el ticket como usado: un GET no debe modificar datos. |
| Invitar al viaje por correo/enlace | Invitación por enlace con token (`POST /me/trips/{id}/members`, `POST /trips/join`) | No revela quién tiene cuenta. |
| `GET /notifications/stream` con `Authorization` | Además acepta un `ticket` de 60 s (`POST /notifications/stream-ticket`) | Un `EventSource` del navegador no puede enviar encabezados. |
| Pago de comisiones con `ambassadors/track-sale` desde el navegador | La comisión se calcula en el servidor sobre el pedido cobrado; no hay endpoint público | El cliente nunca informa cifras. |
| Estados de reporte `open → reviewing → resolved` | `pendiente → revisado / ignorado` | Es el esquema original de `ugc_reports`. |
| `PATCH /admin/users/{id}/role` | `PUT /admin/users/{id}/roles` (reemplaza el conjunto) | Un usuario puede tener varios roles. |
| Cambio de fecha de reserva con re-cotización libre | El total nunca baja; si sube, la diferencia queda como saldo; 2 cambios y 48 h para el viajero | Sin mover dinero en la pasarela en pleno cambio. |

## Pendiente (no implementado)
Antivirus y almacenamiento S3 de medios · vuelos · Azul/CardNET y 3-D Secure de Stripe · adaptadores de webhook de correo por proveedor (SES, SendGrid) · WhatsApp/Instagram Direct · datos vivos LIDOM.

## config

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/feature-flags` | Público | Banderas públicas (el frontend oculta lo que esté apagado) |

## auth

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/.well-known/jwks.json` | Público | Claves públicas de firma de los JWT (JWKS) |
| POST | `/auth/2fa/disable` | Sesión | Desactivar el 2FA (contraseña + código); cierra las demás sesiones |
| POST | `/auth/2fa/enable` | Sesión | Paso 2 del 2FA: confirmar con un código y recibir los códigos de recuperación |
| POST | `/auth/2fa/recovery-codes` | Sesión | Generar códigos de recuperación nuevos (invalida los anteriores) |
| POST | `/auth/2fa/setup` | Sesión | Paso 1 del 2FA: obtener el secreto para la app de autenticación |
| POST | `/auth/2fa/verify` | Público | Completar el inicio de sesión con el código de la app o un código de recuperación |
| POST | `/auth/forgot-password` | Público | Solicitar restablecimiento de contraseña |
| GET | `/auth/identities` | Sesión | Proveedores vinculados a mi cuenta |
| DELETE | `/auth/identities/{provider}` | Sesión | Desvincular un proveedor (debe quedar otro método de acceso) |
| POST | `/auth/login` | Público | Iniciar sesión |
| POST | `/auth/logout` | Público | Cerrar sesión |
| GET | `/auth/me` | Sesión | Usuario de la sesión actual |
| GET | `/auth/oauth/{provider}` | Público | Variante por redirección (302) para enlaces simples de "Continuar con …" |
| GET | `/auth/oauth/{provider}/callback` | Público | Retorno del proveedor (lo llama el navegador; redirige al frontend) |
| POST | `/auth/oauth/{provider}/start` | Público | Iniciar el flujo social: devuelve la URL del proveedor |
| POST | `/auth/oauth/exchange` | Público | Canjear el `oauth_code` (60 s, un solo uso) por la sesión |
| GET | `/auth/oauth/providers` | Público | Proveedores de inicio de sesión social disponibles |
| POST | `/auth/partner/register` | Público | Alta de proveedor: crea la cuenta y su organización (queda pendiente de verificación) e inicia sesión |
| POST | `/auth/refresh` | Público | Rotar el token de refresco |
| POST | `/auth/register` | Público | Crear cuenta |
| POST | `/auth/resend-verification` | Sesión | Reenviar correo de verificación (máx. 3 por hora) |
| POST | `/auth/reset-password` | Público | Definir nueva contraseña con el token del correo |
| GET | `/auth/sessions` | Sesión | Dispositivos con sesión abierta |
| DELETE | `/auth/sessions/{id}` | Sesión | Cerrar la sesión de un dispositivo |
| POST | `/auth/update-password` | Sesión | Cambiar la contraseña (cierra las demás sesiones) |
| POST | `/auth/verify-email` | Público | Confirmar correo con el token del enlace |

## perfil

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| DELETE | `/me` | Sesión | Solicita eliminar mi cuenta (30 días de gracia) |
| GET | `/me/capability-grants` | Sesión | Mis permisos acotados vigentes |
| POST | `/me/deletion/cancel` | Sesión | Cancela la solicitud de eliminación durante el período de gracia |
| GET | `/me/export` | Sesión | Descarga todos mis datos personales (JSON) |
| GET | `/me/favorites` | Sesión | Mis favoritos |
| PUT | `/me/favorites/{entity_type}/{entity_id}` | Sesión | Marca un favorito (idempotente) |
| DELETE | `/me/favorites/{entity_type}/{entity_id}` | Sesión | Quita un favorito |
| GET | `/me/notifications` | Sesión | Mi bandeja |
| PATCH | `/me/notifications/{id}` | Sesión | Marca una notificación como leída o no leída |
| POST | `/me/notifications/read-all` | Sesión | Marca todas como leídas |
| GET | `/me/preferences` | Sesión | Idioma, moneda, consentimientos y notificaciones |
| PUT | `/me/preferences` | Sesión | Actualiza preferencias (sólo lo enviado) |
| GET | `/me/profile` | Sesión | Mi perfil |
| PATCH | `/me/profile` | Sesión | Edita mi perfil |
| POST | `/users/{id}/follow` | Sesión | Seguir a un explorador |
| DELETE | `/users/{id}/follow` | Sesión | Dejar de seguir |
| GET | `/users/{id}/public` | Público | Perfil público de un explorador |

## búsqueda

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/recommendations/home` | Opcional (sesión) | Secciones de la portada (personalizadas si hay sesión) |
| GET | `/search` | Público | Búsqueda global multi-colección ordenada por relevancia (sin acentos ni mayúsculas, tolera errores leves) |
| GET | `/search/popular` | Público | Búsquedas frecuentes de los últimos 7 días (o las sugeridas por el equipo) |
| GET | `/search/suggest` | Público | Autocompletado por nombre (máx. 8) |

## admin

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/admin/access-reviews` | Personal / admin | Revisiones de acceso del personal, con lo pendiente de cada una |
| POST | `/admin/access-reviews` | Personal / admin | Abre una revisión con los roles actuales del personal (sólo una abierta a la vez) |
| GET | `/admin/access-reviews/{id}` | Personal / admin | Una revisión con cada acceso, su última sesión y la decisión tomada |
| POST | `/admin/access-reviews/{id}/close` | Personal / admin | Cierra la revisión (exige haber decidido todos los accesos) |
| POST | `/admin/access-reviews/{id}/items/{itemId}/decide` | Personal / admin | Confirma o retira un acceso (justificación obligatoria; nadie revisa los suyos) |
| GET | `/admin/achievements` | Personal / admin | Logros: lista |
| POST | `/admin/achievements` | Personal / admin | Logros: crear |
| PATCH | `/admin/achievements/{id}` | Personal / admin | Logros: editar |
| DELETE | `/admin/achievements/{id}` | Personal / admin | Logros: borrar |
| GET | `/admin/ad_banners` | Personal / admin | Banners: lista |
| POST | `/admin/ad_banners` | Personal / admin | Banners: crear |
| PATCH | `/admin/ad_banners/{id}` | Personal / admin | Banners: editar |
| DELETE | `/admin/ad_banners/{id}` | Personal / admin | Banners: borrar |
| GET | `/admin/ad_slots` | Personal / admin | Espacios publicitarios: lista |
| POST | `/admin/ad_slots` | Personal / admin | Espacios publicitarios: crear |
| PATCH | `/admin/ad_slots/{id}` | Personal / admin | Espacios publicitarios: editar |
| DELETE | `/admin/ad_slots/{id}` | Personal / admin | Espacios publicitarios: borrar |
| GET | `/admin/ads/reports` | Personal / admin | Vistas, clics y CTR por banner y por anunciante |
| GET | `/admin/affiliate_offers` | Personal / admin | Ofertas de afiliados: lista |
| POST | `/admin/affiliate_offers` | Personal / admin | Ofertas de afiliados: crear |
| PATCH | `/admin/affiliate_offers/{id}` | Personal / admin | Ofertas de afiliados: editar |
| DELETE | `/admin/affiliate_offers/{id}` | Personal / admin | Ofertas de afiliados: borrar |
| POST | `/admin/ai/generate` | Personal / admin | Redacta un borrador de contenido (editor). Nunca publica: el texto lo pega una persona en un borrador |
| GET | `/admin/ai/usage` | Personal / admin | Consumo y costo de IA del mes (total, por tipo y por usuario) y gasto de hoy frente al tope |
| GET | `/admin/ambassadors` | Personal / admin | Embajadores y solicitudes |
| GET | `/admin/ambassadors/{id}` | Personal / admin | Detalle de un embajador con sus comisiones |
| PATCH | `/admin/ambassadors/{id}` | Personal / admin | Aprueba, rechaza o suspende; fija una comisión especial |
| GET | `/admin/ambassadors/payouts` | Personal / admin | Pagos de comisiones |
| PATCH | `/admin/ambassadors/payouts/{id}` | Personal / admin | Marca un pago como enviado (con referencia) o fallido (las comisiones vuelven a estar disponibles) |
| GET | `/admin/analytics/bounce` | Personal / admin | Tasa de rebote por día y por página de entrada, con el umbral de alerta vigente |
| GET | `/admin/analytics/export.csv` | Personal / admin | Exporta un reporte en CSV |
| GET | `/admin/analytics/funnels/{name}` | Personal / admin | Embudos calculados con datos reales (reserva, registro, tienda) |
| GET | `/admin/analytics/heatmap` | Personal / admin | Mapa de calor de actividad por día de la semana y hora |
| GET | `/admin/analytics/nps` | Personal / admin | NPS y comentarios de las encuestas |
| GET | `/admin/analytics/overview` | Personal / admin | KPIs de la plataforma en un rango |
| GET | `/admin/analytics/panel-adoption` | Personal / admin | Adopción por perfil: onboarding, tareas, abandono y errores por tipo de panel (agregado y sin PII) |
| GET | `/admin/analytics/satisfaction` | Personal / admin | Índice de satisfacción: reseñas aprobadas ponderadas por visitas con sello de Pasaporte |
| GET | `/admin/analytics/search-terms` | Personal / admin | Términos buscados sin resultados |
| GET | `/admin/analytics/top-content` | Personal / admin | Contenido más visto o más guardado |
| GET | `/admin/analytics/traffic` | Personal / admin | Vistas y sesiones por página, origen, país o día |
| GET | `/admin/approvals` | Personal / admin | Solicitudes de aprobación |
| POST | `/admin/approvals` | Personal / admin | Solicita una operación crítica; otra persona administradora debe aprobarla |
| POST | `/admin/approvals/{id}/approve` | Personal / admin | Aprueba y ejecuta la operación (no puede hacerlo quien la solicitó) |
| POST | `/admin/approvals/{id}/cancel` | Personal / admin | Retira una solicitud propia aún pendiente |
| POST | `/admin/approvals/{id}/reject` | Personal / admin | Rechaza la solicitud (motivo obligatorio) |
| GET | `/admin/audit` | Personal / admin | Bitácora de auditoría |
| GET | `/admin/audit-logs` | Personal / admin | Auditoría con filtros por actor, entidad, acción y fechas (?format=csv exporta) |
| GET | `/admin/audit/verify` | Personal / admin | Verifica la cadena de hash de la bitácora (detecta manipulación) |
| GET | `/admin/calculators/defaults` | Personal / admin | Cifras por defecto y vigentes de las calculadoras (se ajustan con site_settings `calculators.<nombre>`) |
| GET | `/admin/capability-grants` | Personal / admin | Permisos acotados concedidos, con su alcance y vigencia |
| POST | `/admin/capability-grants` | Personal / admin | Concede un permiso acotado (colecciones del catálogo, registros concretos con vencimiento, o analítica de sólo lectura) |
| DELETE | `/admin/capability-grants/{id}` | Personal / admin | Revoca un permiso acotado |
| POST | `/admin/contests` | Personal / admin | Crea un concurso |
| POST | `/admin/contests/{slug}/draw` | Personal / admin | Sortea ganadores al azar entre los inscritos y cierra el concurso |
| GET | `/admin/contests/{slug}/registrations` | Personal / admin | Inscritos |
| GET | `/admin/creator-campaigns` | Personal / admin | Campañas con creadores, con aceptaciones y entregas pendientes |
| POST | `/admin/creator-campaigns` | Personal / admin | Crea una campaña en borrador con la primera versión de sus términos |
| GET | `/admin/creator-campaigns/{id}/acceptances` | Personal / admin | Evidencia de aceptación: quién aceptó qué versión, cuándo y con qué texto |
| GET | `/admin/creator-campaigns/{id}/deliverables` | Personal / admin | Entregas de una campaña, con las pendientes de revisar primero |
| POST | `/admin/creator-campaigns/{id}/status` | Personal / admin | Abre o cierra la campaña |
| PUT | `/admin/creator-campaigns/{id}/terms` | Personal / admin | Publica una versión nueva de los términos (quien ya aceptó debe volver a aceptar) |
| POST | `/admin/creator-deliverables/{id}/review` | Personal / admin | Aprueba o rechaza una entrega; aprobar registra la licencia y, si aplica, el pago |
| GET | `/admin/creator-disputes` | Personal / admin | Disputas de creadores por plazo de respuesta |
| POST | `/admin/creator-disputes/{id}/resolve` | Personal / admin | Resuelve una disputa (la corrección económica, si procede, se registra aparte como reverso o ajuste) |
| POST | `/admin/creator-ledger` | Personal / admin | Registra una bonificación, un ajuste, fondo de creadores o propina (motivo obligatorio) |
| POST | `/admin/creator-ledger/{id}/reverse` | Personal / admin | Revierte un ingreso dejando la razón a la vista del creador |
| POST | `/admin/creators/{id}/payout` | Personal / admin | Registra y liquida fondos a creador (Fondo de Creadores o Comisiones) |
| GET | `/admin/creators/stay-deliverables` | Personal / admin | Lista entregables de contenido (Reels, Videos, Fotos) subidos por creadores tras estancias |
| GET | `/admin/dashboard` | Personal / admin | KPIs, pendientes de moderación y contenido por estado |
| PUT | `/admin/datasets/{key}` | Personal / admin | Crea o reemplaza un documento de contenido (objeto JSON, máx. 512 KB) |
| DELETE | `/admin/datasets/{key}` | Personal / admin | Elimina un documento de contenido (el sitio vuelve a mostrar el que trae compilado) |
| GET | `/admin/dictionary_terms` | Personal / admin | Glosario: lista |
| POST | `/admin/dictionary_terms` | Personal / admin | Glosario: crear |
| PATCH | `/admin/dictionary_terms/{id}` | Personal / admin | Glosario: editar |
| DELETE | `/admin/dictionary_terms/{id}` | Personal / admin | Glosario: borrar |
| GET | `/admin/digital_collectibles` | Personal / admin | Coleccionables: lista |
| POST | `/admin/digital_collectibles` | Personal / admin | Coleccionables: crear |
| PATCH | `/admin/digital_collectibles/{id}` | Personal / admin | Coleccionables: editar |
| DELETE | `/admin/digital_collectibles/{id}` | Personal / admin | Coleccionables: borrar |
| GET | `/admin/discount_coupons` | Personal / admin | Cupones de descuento |
| POST | `/admin/discount_coupons` | Personal / admin | Crea un cupón (porcentaje o monto fijo) |
| PATCH | `/admin/discount_coupons/{id}` | Personal / admin | Edita o desactiva un cupón |
| GET | `/admin/email/log` | Personal / admin | Bitácora de correos (sin el contenido ni los datos personales del mensaje) |
| POST | `/admin/email/log/{id}/resend` | Personal / admin | Reenvía un correo (crea uno nuevo enlazado al original). No aplica a direcciones suprimidas |
| GET | `/admin/email/stats` | Personal / admin | Correos por estado en las últimas 24 h y 7 días |
| GET | `/admin/email/suppressions` | Personal / admin | Direcciones a las que no se escribe |
| POST | `/admin/email/suppressions` | Personal / admin | Agrega una dirección a la lista (bloqueo manual por defecto) |
| DELETE | `/admin/email/suppressions` | Personal / admin | Quita una dirección de la lista (`?email=`) |
| GET | `/admin/email/templates` | Personal / admin | Plantillas, sus variables y en qué idiomas están personalizadas |
| GET | `/admin/email/templates/{key}` | Personal / admin | Una plantilla: variables, datos de ejemplo, texto por defecto y versión personalizada de cada idioma |
| PUT | `/admin/email/templates/{key}/{locale}` | Personal / admin | Guarda la plantilla de un idioma (versionada). Variables `{{name}}`; el HTML se limpia (sólo texto, listas y enlaces https) |
| DELETE | `/admin/email/templates/{key}/{locale}` | Personal / admin | Vuelve a la plantilla por defecto de ese idioma (el historial se conserva) |
| POST | `/admin/email/templates/{key}/{locale}/restore` | Personal / admin | Restaura una versión anterior (queda como una versión nueva) |
| POST | `/admin/email/templates/{key}/preview` | Personal / admin | Vista previa con datos de ejemplo (de un borrador sin guardar, de la plantilla guardada o de la del código) |
| POST | `/admin/email/templates/{key}/test` | Personal / admin | Envía un correo de prueba (con datos de ejemplo y asunto «[PRUEBA]») |
| GET | `/admin/email/templates/{key}/versions` | Personal / admin | Historial de versiones de un idioma |
| GET | `/admin/entry_requirements` | Personal / admin | Requisitos de entrada: lista |
| POST | `/admin/entry_requirements` | Personal / admin | Requisitos de entrada: crear |
| PATCH | `/admin/entry_requirements/{id}` | Personal / admin | Requisitos de entrada: editar |
| DELETE | `/admin/entry_requirements/{id}` | Personal / admin | Requisitos de entrada: borrar |
| GET | `/admin/exchange_rates` | Personal / admin | Tasas de cambio: lista |
| POST | `/admin/exchange_rates` | Personal / admin | Tasas de cambio: crear |
| PATCH | `/admin/exchange_rates/{id}` | Personal / admin | Tasas de cambio: editar |
| DELETE | `/admin/exchange_rates/{id}` | Personal / admin | Tasas de cambio: borrar |
| GET | `/admin/explorer_guilds` | Personal / admin | Gremios: lista |
| POST | `/admin/explorer_guilds` | Personal / admin | Gremios: crear |
| PATCH | `/admin/explorer_guilds/{id}` | Personal / admin | Gremios: editar |
| DELETE | `/admin/explorer_guilds/{id}` | Personal / admin | Gremios: borrar |
| GET | `/admin/finance/reconciliation` | Personal / admin | Conciliación de cobros, comprobantes fiscales y liquidaciones en un rango (máx. 366 días) |
| GET | `/admin/flight_routes` | Personal / admin | Distancias de vuelo: lista |
| POST | `/admin/flight_routes` | Personal / admin | Distancias de vuelo: crear |
| PATCH | `/admin/flight_routes/{id}` | Personal / admin | Distancias de vuelo: editar |
| DELETE | `/admin/flight_routes/{id}` | Personal / admin | Distancias de vuelo: borrar |
| GET | `/admin/fuel_prices` | Personal / admin | Precios de combustibles: lista |
| POST | `/admin/fuel_prices` | Personal / admin | Precios de combustibles: crear |
| PATCH | `/admin/fuel_prices/{id}` | Personal / admin | Precios de combustibles: editar |
| DELETE | `/admin/fuel_prices/{id}` | Personal / admin | Precios de combustibles: borrar |
| GET | `/admin/gamification_leagues` | Personal / admin | Ligas: lista |
| POST | `/admin/gamification_leagues` | Personal / admin | Ligas: crear |
| PATCH | `/admin/gamification_leagues/{id}` | Personal / admin | Ligas: editar |
| DELETE | `/admin/gamification_leagues/{id}` | Personal / admin | Ligas: borrar |
| GET | `/admin/gamification_levels` | Personal / admin | Niveles: lista |
| POST | `/admin/gamification_levels` | Personal / admin | Niveles: crear |
| PATCH | `/admin/gamification_levels/{id}` | Personal / admin | Niveles: editar |
| DELETE | `/admin/gamification_levels/{id}` | Personal / admin | Niveles: borrar |
| GET | `/admin/gamification_missions` | Personal / admin | Misiones: lista |
| POST | `/admin/gamification_missions` | Personal / admin | Misiones: crear |
| PATCH | `/admin/gamification_missions/{id}` | Personal / admin | Misiones: editar |
| DELETE | `/admin/gamification_missions/{id}` | Personal / admin | Misiones: borrar |
| GET | `/admin/gamification_prizes` | Personal / admin | Premios: lista |
| POST | `/admin/gamification_prizes` | Personal / admin | Premios: crear |
| PATCH | `/admin/gamification_prizes/{id}` | Personal / admin | Premios: editar |
| DELETE | `/admin/gamification_prizes/{id}` | Personal / admin | Premios: borrar |
| GET | `/admin/gamification_rules` | Personal / admin | Reglas de puntos: lista |
| POST | `/admin/gamification_rules` | Personal / admin | Reglas de puntos: crear |
| PATCH | `/admin/gamification_rules/{id}` | Personal / admin | Reglas de puntos: editar |
| DELETE | `/admin/gamification_rules/{id}` | Personal / admin | Reglas de puntos: borrar |
| GET | `/admin/gamification_seasons` | Personal / admin | Temporadas: lista |
| POST | `/admin/gamification_seasons` | Personal / admin | Temporadas: crear |
| PATCH | `/admin/gamification_seasons/{id}` | Personal / admin | Temporadas: editar |
| DELETE | `/admin/gamification_seasons/{id}` | Personal / admin | Temporadas: borrar |
| POST | `/admin/gamification/missions` | Personal / admin | Crea una misión de gamificación, opcionalmente patrocinada por un operador o marca (#6) |
| POST | `/admin/gamification/seasons/{id}/close` | Personal / admin | Cierra la temporada: reparte premios al top, y abre la siguiente |
| GET | `/admin/gamification/shipments` | Personal / admin | Consola de envíos |
| PATCH | `/admin/gamification/shipments/{id}` | Personal / admin | Avanza un envío (pending → packed → shipped → delivered) |
| GET | `/admin/gamification/sponsored-challenges` | Personal / admin | Lista los retos patrocinados creados por operadores para revisión y moderación |
| PATCH | `/admin/gamification/sponsored-challenges/{id}/review` | Personal / admin | Aprueba o rechaza un reto patrocinado |
| GET | `/admin/gamification/sponsored-rewards` | Personal / admin | Lista premios ofrecidos por negocios para el Club de Recompensas |
| PATCH | `/admin/gamification/sponsored-rewards/{id}/review` | Personal / admin | Aprueba o rechaza un premio del Club ofrecido por un negocio |
| GET | `/admin/gamification/stats` | Personal / admin | XP emitido, jugadores activos, canjes y distribución por nivel |
| POST | `/admin/gamification/users/{id}/adjust` | Personal / admin | Ajuste manual de XP y monedas, también negativo (sin bajar de cero), con motivo; queda en la bitácora del juego |
| GET | `/admin/gamified_routes` | Personal / admin | Rutas gamificadas: lista |
| POST | `/admin/gamified_routes` | Personal / admin | Rutas gamificadas: crear |
| PATCH | `/admin/gamified_routes/{id}` | Personal / admin | Rutas gamificadas: editar |
| DELETE | `/admin/gamified_routes/{id}` | Personal / admin | Rutas gamificadas: borrar |
| PUT | `/admin/i18n/dictionary/{locale}` | Personal / admin | Crea o reemplaza cadenas de la interfaz (máx. 2000 por llamada) |
| GET | `/admin/imports` | Personal / admin | Importaciones recientes |
| GET | `/admin/imports/{jobId}` | Personal / admin | Estado de una importación: avance, insertadas, actualizadas, omitidas, errores y avisos por fila |
| POST | `/admin/imports/establecimientos` | Personal / admin | Importa el directorio oficial de establecimientos desde un CSV/TXT (delimitador detectado: tabulador, `\|`, `;` o coma; encabezados por nombre o, si no, por posición). Repetir el archivo actualiza en vez de duplicar. Devuelve `job_id` |
| GET | `/admin/ip-rules` | Personal / admin | Reglas de IP vigentes y tu dirección actual |
| POST | `/admin/ip-rules` | Personal / admin | Bloquea una IP o rango (`deny`), o restringe el panel a una lista de direcciones (`allow` con alcance `admin`). Rechaza reglas que te dejarían fuera |
| DELETE | `/admin/ip-rules/{id}` | Personal / admin | Quita una regla (no permite dejar tu propia IP fuera de una lista de permitidos) |
| GET | `/admin/jobs` | Personal / admin | Trabajos programados y su último resultado |
| PATCH | `/admin/jobs/{name}` | Personal / admin | Activa/desactiva un trabajo o cambia su frecuencia |
| POST | `/admin/jobs/{name}/run` | Personal / admin | Ejecuta un trabajo ahora |
| POST | `/admin/live/refresh` | Personal / admin | Actualiza ahora tasas o clima desde el proveedor configurado |
| GET | `/admin/lotteries` | Personal / admin | Loterías: lista |
| POST | `/admin/lotteries` | Personal / admin | Loterías: crear |
| PATCH | `/admin/lotteries/{id}` | Personal / admin | Loterías: editar |
| DELETE | `/admin/lotteries/{id}` | Personal / admin | Loterías: borrar |
| GET | `/admin/lottery_draws` | Personal / admin | Sorteos: lista |
| POST | `/admin/lottery_draws` | Personal / admin | Sorteos: crear |
| PATCH | `/admin/lottery_draws/{id}` | Personal / admin | Sorteos: editar |
| DELETE | `/admin/lottery_draws/{id}` | Personal / admin | Sorteos: borrar |
| GET | `/admin/lottery_results` | Personal / admin | Resultados de lotería: lista |
| POST | `/admin/lottery_results` | Personal / admin | Resultados de lotería: crear |
| PATCH | `/admin/lottery_results/{id}` | Personal / admin | Resultados de lotería: editar |
| DELETE | `/admin/lottery_results/{id}` | Personal / admin | Resultados de lotería: borrar |
| GET | `/admin/marine_reports` | Personal / admin | Reportes marinos: lista |
| POST | `/admin/marine_reports` | Personal / admin | Reportes marinos: crear |
| PATCH | `/admin/marine_reports/{id}` | Personal / admin | Reportes marinos: editar |
| DELETE | `/admin/marine_reports/{id}` | Personal / admin | Reportes marinos: borrar |
| GET | `/admin/marketing/campaigns` | Personal / admin | Campañas de correo |
| POST | `/admin/marketing/campaigns` | Personal / admin | Crea una campaña (borrador). Variables: {{name}} |
| GET | `/admin/marketing/campaigns/{id}` | Personal / admin | Detalle de una campaña |
| PATCH | `/admin/marketing/campaigns/{id}` | Personal / admin | Edita una campaña que aún no se envió |
| POST | `/admin/marketing/campaigns/{id}/cancel` | Personal / admin | Cancela una campaña programada |
| POST | `/admin/marketing/campaigns/{id}/schedule` | Personal / admin | Programa el envío (a partir de esa fecha lo toma el trabajo newsletter.send) |
| POST | `/admin/marketing/campaigns/{id}/send-test` | Personal / admin | Envía la campaña a tu propio correo |
| GET | `/admin/marketing/leads` | Personal / admin | Leads por estado y origen |
| PATCH | `/admin/marketing/leads/{id}` | Personal / admin | Cambia el estado de un lead |
| GET | `/admin/marketplace/orders` | Personal / admin | Pedidos del marketplace |
| GET | `/admin/marketplace/orders/{id}` | Personal / admin | Detalle de un pedido |
| POST | `/admin/marketplace/orders/{id}/refund` | Personal / admin | Reembolsa un artículo (`item_id`) o todo lo reembolsable del pedido; no aplica a lo ya liquidado |
| GET | `/admin/marketplace/payouts` | Personal / admin | Liquidaciones a vendedores |
| PATCH | `/admin/marketplace/payouts/{id}` | Personal / admin | Marca una liquidación como pagada (con referencia) o fallida (los artículos vuelven a liquidarse) |
| POST | `/admin/marketplace/payouts/generate` | Personal / admin | Genera ya las liquidaciones pendientes (también corre sola cada día) |
| GET | `/admin/marketplace/products` | Personal / admin | Productos (por defecto, en revisión primero con `status`) |
| POST | `/admin/marketplace/products/{id}/review` | Personal / admin | Aprueba o rechaza (con motivo) un producto en revisión |
| GET | `/admin/marketplace/vendors` | Personal / admin | Vendedores y solicitudes |
| PATCH | `/admin/marketplace/vendors/{id}` | Personal / admin | Aprueba, rechaza o suspende un vendedor; fija su comisión |
| GET | `/admin/media` | Personal / admin | Biblioteca de medios |
| POST | `/admin/media/{id}/moderate` | Personal / admin | Aprueba o rechaza una imagen de usuario |
| POST | `/admin/media/import-url` | Personal / admin | Descarga una imagen de una URL https pública a nuestro almacenamiento |
| POST | `/admin/media/licenses/offers` | Personal / admin | Oferta una imagen editorial para licenciar; su original deja de ser público |
| DELETE | `/admin/media/licenses/offers/{id}` | Personal / admin | Retira una oferta (las licencias ya concedidas siguen vigentes) |
| GET | `/admin/media/licenses/requests` | Personal / admin | Solicitudes de licencia |
| POST | `/admin/media/licenses/requests/{id}/decide` | Personal / admin | Aprueba (anotando el comprobante del pago) o rechaza una solicitud de licencia |
| POST | `/admin/moderation/{type}/{id}/{action}` | Personal / admin | Aprueba, rechaza o retira un contenido (rechazar y retirar exigen motivo). Avisa a la persona y queda auditado |
| GET | `/admin/moderation/appeals` | Personal / admin | Apelaciones pendientes de creadores, con contexto limitado (sin correo ni datos de pago) |
| POST | `/admin/moderation/appeals/{id}/resolve` | Personal / admin | Resuelve la apelación de un creador: aceptarla devuelve la publicación a revisión |
| GET | `/admin/moderation/queue` | Personal / admin | Cola unificada de lo pendiente (sin `type`: lo más antiguo de cada tipo, con los totales) |
| GET | `/admin/moderation/reports` | Personal / admin | Reportes de usuarios con un extracto de lo reportado |
| PATCH | `/admin/moderation/reports/{id}` | Personal / admin | Cierra un reporte como revisado o ignorado |
| POST | `/admin/moderation/rules/test` | Personal / admin | Prueba los filtros automáticos con un texto: motivos detectados y si se publicaría sin revisión |
| POST | `/admin/notifications/broadcast` | Personal / admin | Difunde un aviso a un segmento (respeta las preferencias de cada persona). Con `dry_run` sólo cuenta a quién alcanzaría |
| GET | `/admin/notifications/broadcasts` | Personal / admin | Difusiones enviadas |
| GET | `/admin/orgs` | Personal / admin | Operadores registrados |
| PUT | `/admin/orgs/{id}/verification` | Personal / admin | Verifica o rechaza un operador |
| GET | `/admin/payouts` | Personal / admin | Liquidaciones a operadores |
| POST | `/admin/payouts` | Personal / admin | Genera ahora el lote de liquidaciones (opcionalmente de una organización) |
| GET | `/admin/payouts/{id}/items` | Personal / admin | Reservas de una liquidación |
| POST | `/admin/payouts/{id}/mark-paid` | Personal / admin | Marca una liquidación como pagada (comprobante obligatorio) y avisa al operador |
| GET | `/admin/photo_challenges` | Personal / admin | Retos de foto: lista |
| POST | `/admin/photo_challenges` | Personal / admin | Retos de foto: crear |
| PATCH | `/admin/photo_challenges/{id}` | Personal / admin | Retos de foto: editar |
| DELETE | `/admin/photo_challenges/{id}` | Personal / admin | Retos de foto: borrar |
| POST | `/admin/photo-challenges/{id}/close` | Personal / admin | Cierra el reto y premia a la foto más votada |
| GET | `/admin/photo-submissions` | Personal / admin | Fotos de retos por moderar |
| POST | `/admin/photo-submissions/{id}/moderate` | Personal / admin | Aprueba o rechaza una foto de un reto |
| POST | `/admin/place-qr` | Personal / admin | Genera el código QR de un lugar (se muestra una sola vez; sólo se guarda su hash) |
| GET | `/admin/reviews` | Personal / admin | Cola de moderación de reseñas |
| PATCH | `/admin/reviews/{id}` | Personal / admin | Aprueba o rechaza una reseña |
| GET | `/admin/route_checkpoints` | Personal / admin | Puntos de ruta: lista |
| POST | `/admin/route_checkpoints` | Personal / admin | Puntos de ruta: crear |
| PATCH | `/admin/route_checkpoints/{id}` | Personal / admin | Puntos de ruta: editar |
| DELETE | `/admin/route_checkpoints/{id}` | Personal / admin | Puntos de ruta: borrar |
| POST | `/admin/route-checkpoints/{id}/qr` | Personal / admin | Genera el código QR de un punto de ruta (se muestra una sola vez) |
| GET | `/admin/seo_redirections` | Personal / admin | Redirecciones |
| POST | `/admin/seo_redirections` | Personal / admin | Crea una redirección |
| PATCH | `/admin/seo_redirections/{id}` | Personal / admin | Edita una redirección |
| DELETE | `/admin/seo_redirections/{id}` | Personal / admin | Elimina una redirección |
| GET | `/admin/settings` | Personal / admin | Todos los ajustes |
| GET | `/admin/settings/{key}` | Personal / admin | Un ajuste |
| PUT | `/admin/settings/{key}` | Personal / admin | Crea o reemplaza un ajuste (JSON, máx. 64 KB) |
| DELETE | `/admin/settings/{key}` | Personal / admin | Elimina un ajuste |
| PATCH | `/admin/social/posts/{id}` | Personal / admin | Oculta o restaura una publicación |
| GET | `/admin/sponsorship/auctions` | Personal / admin | Pujas de un espacio y semana, de mayor a menor |
| POST | `/admin/sponsorship/auctions/close` | Personal / admin | Cierra la subasta: ganan las pujas más altas hasta el cupo del espacio |
| GET | `/admin/sponsorship/campaigns` | Personal / admin | Listado de campañas publicitarias |
| PATCH | `/admin/sponsorship/campaigns/{id}/status` | Personal / admin | Aprueba o cambia el estado de una campaña publicitaria |
| PUT | `/admin/sponsorship/slots/{id}/auction` | Personal / admin | Activa la subasta de un espacio y fija su precio mínimo |
| GET | `/admin/staff-invitations` | Personal / admin | Invitaciones de personal abiertas y recientes |
| POST | `/admin/staff-invitations` | Personal / admin | Invita por correo a un editor o moderador (vence a los 7 días) |
| DELETE | `/admin/staff-invitations/{id}` | Personal / admin | Revoca una invitación abierta |
| GET | `/admin/store/orders` | Personal / admin | Pedidos de la tienda |
| GET | `/admin/store/orders/{id}` | Personal / admin | Detalle de un pedido |
| PATCH | `/admin/store/orders/{id}` | Personal / admin | Cambia el estado (processing → shipped con guía → delivered; cancelar reembolsa) |
| POST | `/admin/store/orders/{id}/refund` | Personal / admin | Reembolso total o parcial (con o sin devolver el stock) |
| GET | `/admin/store/products` | Personal / admin | Catálogo completo (incluye inactivos) |
| POST | `/admin/store/products` | Personal / admin | Crea un producto |
| PATCH | `/admin/store/products/{id}` | Personal / admin | Edita un producto (precio, stock, variantes, destacados…) |
| DELETE | `/admin/store/products/{id}` | Personal / admin | Retira un producto del catálogo (borrado lógico; los pedidos conservan su instantánea) |
| GET | `/admin/support-sessions` | Personal / admin | Sesiones de soporte abiertas (quién, a quién, por qué, cuándo) |
| GET | `/admin/support/stats` | Personal / admin | Pendientes por estado y prioridad, sin asignar, antigüedad y tiempo medio de primera respuesta (30 días) |
| GET | `/admin/support/tickets` | Personal / admin | Bandeja de soporte (lo más urgente y antiguo primero) |
| GET | `/admin/support/tickets/{id}` | Personal / admin | Ticket con toda la conversación, incluidas las notas internas |
| PATCH | `/admin/support/tickets/{id}` | Personal / admin | Cambia estado, prioridad o asignación (quien atiende debe ser personal). Al resolver se avisa a la persona |
| POST | `/admin/support/tickets/{id}/messages` | Personal / admin | Responde al usuario (aviso en su bandeja y correo) o deja una nota interna que él no ve |
| POST | `/admin/surveys` | Personal / admin | Crea una encuesta |
| PATCH | `/admin/surveys/{slug}` | Personal / admin | Activa/desactiva o retitula una encuesta (las preguntas no cambian una vez publicada) |
| GET | `/admin/surveys/{slug}/results` | Personal / admin | Resultados agregados (NPS, medias y distribución) |
| GET | `/admin/system/feature-flags` | Personal / admin | Banderas de funciones |
| PUT | `/admin/system/feature-flags` | Personal / admin | Enciende o apaga funciones (crea la bandera si no existe). Rige en segundos |
| GET | `/admin/system/health` | Personal / admin | Estado de la base de datos, la cola de correo y los trabajos |
| GET | `/admin/translations` | Personal / admin | Traducciones de contenido por entidad, idioma y estado |
| PUT | `/admin/translations/{entity_type}/{entity_id}/{locale}` | Personal / admin | Guarda campos traducidos de una entidad (quedan como `human`) |
| POST | `/admin/translations/{entity_type}/{entity_id}/{locale}/review` | Personal / admin | Marca como revisadas las traducciones automáticas de una entidad e idioma |
| POST | `/admin/translations/{entity_type}/{entity_id}/auto` | Personal / admin | Traduce con la IA los campos de una entidad (quedan como `machine`; nunca pisa lo escrito o revisado por una persona) |
| POST | `/admin/translations/auto-batch` | Personal / admin | Traduce con la IA los registros publicados de una colección que aún no tienen traducción a un idioma (hasta 20 por llamada) |
| GET | `/admin/translations/coverage` | Personal / admin | Porcentaje traducido por colección e idioma (guía el plan de traducción) |
| GET | `/admin/travel_phrases` | Personal / admin | Frases de viaje: lista |
| POST | `/admin/travel_phrases` | Personal / admin | Frases de viaje: crear |
| PATCH | `/admin/travel_phrases/{id}` | Personal / admin | Frases de viaje: editar |
| DELETE | `/admin/travel_phrases/{id}` | Personal / admin | Frases de viaje: borrar |
| GET | `/admin/trivia_questions` | Personal / admin | Preguntas de trivia: lista |
| POST | `/admin/trivia_questions` | Personal / admin | Preguntas de trivia: crear |
| PATCH | `/admin/trivia_questions/{id}` | Personal / admin | Preguntas de trivia: editar |
| DELETE | `/admin/trivia_questions/{id}` | Personal / admin | Preguntas de trivia: borrar |
| GET | `/admin/ugc/media` | Personal / admin | Medios de usuarios por aprobar |
| PATCH | `/admin/ugc/media/{id}` | Personal / admin | Aprueba o rechaza un medio |
| GET | `/admin/ugc/reports` | Personal / admin | Cola de reportes de usuarios |
| PATCH | `/admin/ugc/reports/{id}` | Personal / admin | Resuelve un reporte |
| GET | `/admin/user-flags` | Personal / admin | Banderas antifraude de usuarios |
| POST | `/admin/user-flags` | Personal / admin | Marca a un usuario (si ya tiene esa bandera, actualiza el valor y la nota) |
| PATCH | `/admin/user-flags/{id}` | Personal / admin | Cambia el valor o la nota de una bandera |
| DELETE | `/admin/user-flags/{id}` | Personal / admin | Quita una bandera |
| GET | `/admin/users` | Personal / admin | Usuarios (filtros por texto, rol y estado) |
| GET | `/admin/users/{id}` | Personal / admin | Detalle de un usuario |
| POST | `/admin/users/{id}/2fa/reset` | Personal / admin | Desactiva la verificación en dos pasos de una cuenta (pérdida de dispositivo y de códigos) |
| GET | `/admin/users/{id}/access-timeline` | Personal / admin | Accesos vigentes y línea de tiempo de cambios de acceso de una persona |
| POST | `/admin/users/{id}/award-xp` | Personal / admin | Otorga XP o monedas con motivo (auditado) |
| POST | `/admin/users/{id}/impersonate` | Personal / admin | Abre una sesión de soporte de sólo lectura (15 min, sin renovación) en la cuenta de una persona que no es del personal. Exige motivo y verificación en dos pasos |
| POST | `/admin/users/{id}/reset-password` | Personal / admin | Envía al usuario un enlace de restablecimiento de contraseña |
| PUT | `/admin/users/{id}/roles` | Personal / admin | Reemplaza los roles de un usuario (no puedes cambiar los tuyos ni quitar al último admin) |
| POST | `/admin/users/{id}/roles/temporary` | Personal / admin | Concede un rol por tiempo limitado (vence solo y cierra la sesión al vencer) |
| POST | `/admin/users/{id}/suspend` | Personal / admin | Suspende una cuenta y cierra sus sesiones |
| POST | `/admin/users/{id}/unsuspend` | Personal / admin | Reactiva una cuenta suspendida |
| GET | `/admin/verifications` | Personal / admin | Solicitudes y auditorías de Sello Verificado (#15) |
| POST | `/admin/verifications/{id}/approve` | Personal / admin | Aprueba el sello verificado para un negocio/operador |
| POST | `/admin/verifications/{id}/reject` | Personal / admin | Rechaza la solicitud de verificación con motivo justificado |
| GET | `/admin/weather_alerts` | Personal / admin | Alertas meteorológicas: lista |
| POST | `/admin/weather_alerts` | Personal / admin | Alertas meteorológicas: crear |
| PATCH | `/admin/weather_alerts/{id}` | Personal / admin | Alertas meteorológicas: editar |
| DELETE | `/admin/weather_alerts/{id}` | Personal / admin | Alertas meteorológicas: borrar |
| GET | `/admin/weather_snapshots` | Personal / admin | Clima por ciudad: lista |
| POST | `/admin/weather_snapshots` | Personal / admin | Clima por ciudad: crear |
| PATCH | `/admin/weather_snapshots/{id}` | Personal / admin | Clima por ciudad: editar |
| DELETE | `/admin/weather_snapshots/{id}` | Personal / admin | Clima por ciudad: borrar |
| GET | `/admin/webcams` | Personal / admin | Webcams: lista |
| POST | `/admin/webcams` | Personal / admin | Webcams: crear |
| PATCH | `/admin/webcams/{id}` | Personal / admin | Webcams: editar |
| DELETE | `/admin/webcams/{id}` | Personal / admin | Webcams: borrar |
| GET | `/admin/xp_milestones` | Personal / admin | Hitos de XP: lista |
| POST | `/admin/xp_milestones` | Personal / admin | Hitos de XP: crear |
| PATCH | `/admin/xp_milestones/{id}` | Personal / admin | Hitos de XP: editar |
| DELETE | `/admin/xp_milestones/{id}` | Personal / admin | Hitos de XP: borrar |
| POST | `/auth/impersonation/end` | Sesión | Cierra la sesión de soporte actual |
| POST | `/gamification/xp/award` | Sesión | Ajuste manual de XP/monedas con motivo (auditado) |
| GET | `/staff-invitations/{token}` | Público | Vista previa de una invitación de personal |
| POST | `/staff-invitations/{token}/accept` | Sesión | Acepta la invitación con la cuenta del correo invitado (correo verificado) |

## accesos

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/admin/access/audit` | Personal / admin | Auditoría visual de permisos: rol, recurso, permiso y fuente de decisión por ruta |
| GET | `/admin/access/catalog` | Personal / admin | Catálogo interno de capacidades con su gobierno (dueño, asignación, MFA y baja) |
| GET | `/me/context` | Sesión | Mi contexto de acceso: roles, espacios de producto y capacidades efectivas |

## alojamiento

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/airbnb-listings` | Público | Listado de alojamientos tipo airbnb |
| GET | `/airbnb-listings/{idOrSlug}` | Público | Detalle de alojamientos tipo airbnb por id (uuid) o slug |
| GET | `/airbnb-listings/{idOrSlug}/nearby` | Público | Lugares cerca de este elemento |
| GET | `/airbnb-listings/{idOrSlug}/related` | Público | Alojamientos tipo Airbnb relacionados |
| GET | `/airbnb-listings/{idOrSlug}/reviews` | Público | Reseñas aprobadas de alojamientos tipo airbnb |
| GET | `/airbnb-listings/facets` | Público | Facetas de alojamientos tipo airbnb |
| GET | `/hotels` | Público | Listado de hoteles |
| GET | `/hotels/{idOrSlug}` | Público | Detalle de hoteles por id (uuid) o slug |
| GET | `/hotels/{idOrSlug}/nearby` | Público | Lugares cerca de este elemento |
| GET | `/hotels/{idOrSlug}/related` | Público | Hoteles relacionados |
| GET | `/hotels/{idOrSlug}/reviews` | Público | Reseñas aprobadas de hoteles |
| GET | `/hotels/facets` | Público | Facetas de hoteles |

## analítica

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/analytics/events` | Público | Lote de eventos anónimos (máx. 50). Respeta Do-Not-Track, Sec-GPC y el consentimiento; no guarda IP |
| GET | `/statistics/public` | Público | Cifras públicas de /estadisticas (las del equipo en `statistics.public` más conteos del portal) |

## b2b

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/v1/b2b/analytics/aggregate` | Público | Datos turísticos agregados y anonimizados B2B (requiere encabezado X-API-Key) |
| GET | `/b2b/api-keys` | Sesión | Mis API Keys B2B activas |
| POST | `/b2b/api-keys` | Sesión | Genera una nueva API Key B2B para acceso a datos agregados del turismo |
| DELETE | `/b2b/api-keys/{id}` | Sesión | Revoca una API Key B2B |

## billing

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/invoices` | Sesión | Lista los comprobantes fiscales vinculados a una referencia (#4) |
| GET | `/invoices/{ncf}` | Sesión | Consulta un comprobante fiscal por su NCF (#4) |
| POST | `/invoices/issue` | Sesión | Emite un comprobante fiscal NCF/e-CF asociado a un pedido o reserva cobrada (#4) |

## calculadoras

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/calculators/budget` | Público | Presupuesto de viaje por rubro (USD y DOP) |
| POST | `/calculators/carbon` | Público | Huella de carbono del viaje y proyectos para compensarla |
| GET | `/calculators/carbon/routes` | Público | Rutas de vuelo con distancia conocida |
| POST | `/calculators/confotur` | Público | Beneficios fiscales estimados de la Ley 158-01 (CONFOTUR) |
| POST | `/calculators/packing-list` | Público | Lista de empaque según duración, clima y actividades |
| POST | `/calculators/tax` | Público | Cuenta con ITBIS (18 %) y propina de ley (10 %) más propina voluntaria |
| POST | `/calculators/tolls` | Público | Costo de peajes de una ruta según la categoría del vehículo (1 liviano … 4 pesado) |
| GET | `/calculators/tolls/routes` | Público | Rutas con peaje y sus estaciones |

## concursos

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/contests` | Público | Concursos y sorteos vigentes |
| GET | `/contests/{slug}` | Público | Detalle de un concurso |
| POST | `/contests/{slug}/register` | Sesión | Inscribirse (una vez por persona; correo verificado) |
| GET | `/contests/{slug}/winners` | Público | Ganadores (nombre abreviado) |

## creadores

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/creators/campaigns` | Sesión | Campañas abiertas con sus términos vigentes y lo que ya acepté |
| POST | `/creators/campaigns/{id}/accept` | Sesión | Acepta una versión concreta de los términos (queda registrada con fecha, IP y huella del texto) |
| POST | `/creators/campaigns/{id}/deliverables` | Sesión | Entrega una pieza propia a la campaña (exige haber aceptado los términos vigentes) |
| POST | `/creators/disputes` | Sesión | Abre una disputa sobre una campaña o un movimiento propio, con evidencia |
| POST | `/creators/disputes/{id}/withdraw` | Sesión | Retira una disputa propia aún abierta |
| GET | `/creators/feed` | Público | Feed público de videos y experiencias UGC |
| PATCH | `/creators/invitations/{id}/respond` | Sesión | Aceptar o declinar invitación de un hotel |
| GET | `/creators/me` | Sesión | Panel privado del creador: métricas, saldo acumulado y videos |
| GET | `/creators/me/appeals` | Sesión | Apelaciones de mis publicaciones, con su estado y resolución |
| GET | `/creators/me/disputes` | Sesión | Mis disputas y su estado |
| GET | `/creators/me/earnings` | Sesión | Mis ingresos por concepto, separando lo estimado de lo confirmado y explicando los reversos |
| GET | `/creators/me/identity` | Sesión | Centro de identidad: perfil, sellos con criterios publicados, reputación y audiencia |
| PATCH | `/creators/me/identity` | Sesión | Actualiza la identidad declarada del creador (categorías, idiomas, visibilidad y bio) |
| GET | `/creators/me/invitations` | Sesión | Invitaciones directas recibidas de hoteles |
| GET | `/creators/me/stay-applications` | Sesión | Mis postulaciones a estancias de hoteles y estado |
| POST | `/creators/onboarding` | Sesión | Registro como creador de contenido de Descubre RD |
| GET | `/creators/profile/{handle}` | Público | Perfil público del creador: identidad, sellos con sus criterios, reputación y métricas agregadas |
| POST | `/creators/rights/{id}/revoke` | Sesión | Revoca una licencia: el autor la de plataforma; el personal, cualquiera |
| POST | `/creators/stays/{id}/apply` | Sesión | Postulación de un creador a una estancia de hotel |
| POST | `/creators/stays/{id}/deliverables` | Sesión | El creador envía los enlaces de contenido UGC completados (Reels, TikTok, Posts) |
| GET | `/creators/stays/open` | Público | Lista de estancias y colaboraciones abiertas para creadores de contenido |
| POST | `/creators/videos` | Sesión | Publica un video UGC con atribución a tours o experiencias (queda en revisión de moderación) |
| POST | `/creators/videos/{id}/appeal` | Sesión | Apela la moderación de mi publicación (una sola apelación abierta por publicación) |
| POST | `/creators/videos/{id}/events` | Público | Registra evento de reproducción o interacción en video UGC |
| POST | `/creators/videos/{id}/platform-license` | Sesión | Concede a la plataforma una licencia de difusión de un año sobre una pieza propia |
| GET | `/creators/videos/{id}/rights` | Sesión | Titular y licencias de una pieza (sólo su autor y el personal) |

## datos vivos

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/live/beach-status` | Público | Estado del mar por localidad y alertas de oleaje o sargazo |
| GET | `/live/events-now` | Público | Eventos que ocurren hoy |
| GET | `/live/exchange-rates` | Público | Tasas vigentes (DOP por unidad de cada moneda) |
| GET | `/live/exchange-rates/history` | Público | Serie histórica de una moneda contra el DOP |
| GET | `/live/fuel-prices` | Público | Combustibles vigentes y variación contra la semana anterior |
| GET | `/live/locations` | Público | Ciudades con clima |
| GET | `/live/lottery/results` | Público | Resultados por lotería o sorteo y rango de fechas |
| GET | `/live/marine-reports` | Público | Reportes marinos recientes |
| POST | `/live/marine-reports` | Sesión | Registra un reporte marino (editor) |
| GET | `/live/time-zones` | Público | Zonas horarias frecuentes de los visitantes |
| GET | `/live/weather` | Público | Clima actual de una ciudad o de todas |
| GET | `/live/weather/alerts` | Público | Alertas meteorológicas vigentes |
| GET | `/live/weather/forecast` | Público | Pronóstico de una ciudad |
| GET | `/live/webcams` | Público | Webcams |
| GET | `/lotteries` | Público | Loterías con sus sorteos y último resultado |
| GET | `/lotteries/{id}` | Público | Ficha de una lotería con sus últimos resultados |
| POST | `/utils/convert` | Público | Convierte un monto con la tasa vigente (punto medio compra/venta) |

## editorial

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/articles` | Público | Listado de artículos |
| GET | `/articles/{idOrSlug}` | Público | Detalle de artículos por id (uuid) o slug |
| GET | `/articles/{idOrSlug}/related` | Público | Artículos relacionados |
| GET | `/articles/facets` | Público | Facetas de artículos |
| GET | `/audio-guides` | Público | Listado de audioguías |
| GET | `/audio-guides/{idOrSlug}` | Público | Detalle de audioguías por id (uuid) o slug |
| GET | `/audio-guides/facets` | Público | Facetas de audioguías |
| GET | `/job-vacancies` | Público | Listado de empleo |
| GET | `/job-vacancies/{idOrSlug}` | Público | Detalle de empleo por id (uuid) o slug |
| GET | `/job-vacancies/{idOrSlug}/related` | Público | Empleo relacionados |
| GET | `/job-vacancies/facets` | Público | Facetas de empleo |
| GET | `/routes` | Público | Listado de rutas |
| GET | `/routes/{idOrSlug}` | Público | Detalle de rutas por id (uuid) o slug |
| GET | `/routes/{idOrSlug}/related` | Público | Rutas relacionados |
| GET | `/routes/{idOrSlug}/reviews` | Público | Reseñas aprobadas de rutas |
| GET | `/routes/facets` | Público | Facetas de rutas |

## embajadores

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/ambassadors/apply` | Sesión | Solicita ser embajador (correo verificado) |
| GET | `/ambassadors/me` | Sesión | Mi estado, código, nivel, ventas y comisiones (en espera, disponible, solicitada, pagada) |
| PATCH | `/ambassadors/me` | Sesión | Actualiza mi forma de cobro y mis redes |
| GET | `/ambassadors/me/payouts` | Sesión | Mis pagos de comisiones |
| POST | `/ambassadors/me/payouts/request` | Sesión | Solicita el pago de todo lo disponible (mínimo RD$ 1 000) |
| GET | `/ambassadors/me/referrals` | Sesión | Mis ventas atribuidas (comprador enmascarado) |
| GET | `/ambassadors/track` | Público | Valida el código de un enlace de embajador y cuenta el clic (guardarlo 30 días y enviarlo como `ref_code` al comprar) |

## encuestas

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/surveys/{slug}` | Público | Estructura de una encuesta |
| POST | `/surveys/{slug}/responses` | Opcional (sesión) | Responde una encuesta (validada contra su estructura) |

## eventos

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/events` | Público | Listado de eventos |
| GET | `/events/{idOrSlug}` | Público | Detalle de eventos por id (uuid) o slug |
| GET | `/events/{idOrSlug}/related` | Público | Eventos relacionados |
| GET | `/events/{idOrSlug}/reviews` | Público | Reseñas aprobadas de eventos |
| GET | `/events/facets` | Público | Facetas de eventos |

## explorar

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/collectibles` | Opcional (sesión) | Catálogo de coleccionables (suministro restante y condición de desbloqueo) |
| POST | `/collectibles/{id}/claim` | Sesión | Reclama un coleccionable si cumples su condición (suministro limitado, sin sobreventa) |
| GET | `/collectibles/me` | Sesión | Mi colección |
| PATCH | `/collectibles/me/{id}` | Sesión | Marca como favorito u ordena uno de mis coleccionables |
| DELETE | `/collectibles/me/{id}` | Sesión | Quita un coleccionable de mi colección |
| GET | `/gamification/guilds` | Opcional (sesión) | Gremios de exploradores |
| POST | `/gamification/guilds` | Sesión | Crea un gremio (nivel 3 o más; un gremio por persona) |
| POST | `/gamification/guilds/{id}/join` | Sesión | Únete a un gremio |
| POST | `/gamification/guilds/{id}/leave` | Sesión | Sal de tu gremio (el mando pasa al miembro más antiguo; si eres el último, se disuelve) |
| GET | `/gamification/photo-challenges` | Público | Retos de fotografía |
| GET | `/gamification/photo-challenges/{id}/submissions` | Opcional (sesión) | Fotos aprobadas de un reto, ordenadas por votos |
| POST | `/gamification/photo-challenges/{id}/submissions` | Sesión | Envía tu foto (subida antes con /media/upload-url); queda pendiente de moderación |
| POST | `/gamification/photo-submissions/{id}/vote` | Sesión | Vota una foto (una vez; no la propia) |
| GET | `/gamification/provinces` | Sesión | Provincias visitadas y pendientes |
| POST | `/gamification/provinces/{slug}/visit` | Sesión | Registra la visita a una provincia con tu ubicación |
| GET | `/gamification/routes` | Opcional (sesión) | Rutas gamificadas (con mi avance si hay sesión) |
| GET | `/gamification/routes/{id}` | Opcional (sesión) | Detalle de una ruta con sus puntos |
| POST | `/gamification/routes/{id}/checkpoints/{cp}/complete` | Sesión | Completa un punto de la ruta (ubicación o QR verificados en el servidor; en orden si la ruta es secuencial) |
| POST | `/gamification/routes/{id}/start` | Sesión | Inicia una ruta |
| GET | `/passport/me` | Sesión | Mi pasaporte: sellos, totales y provincias |
| POST | `/passport/stamps` | Sesión | Sella un lugar: se verifica tu ubicación (o el QR del lugar) en el servidor |

## formularios

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/contact` | Público | Formulario de contacto, sugerencias, prensa y creadores |
| POST | `/establishments/register` | Público | Solicita el alta de un establecimiento (queda pendiente de revisión) |
| GET | `/establishments/registrations/{id}/status` | Público | Estado de una solicitud (con su token) |
| POST | `/leads` | Público | Lead comercial (requiere consentimiento) |
| GET | `/newsletter/confirm` | Público | Confirma la suscripción |
| POST | `/newsletter/confirm` | Público | Confirma la suscripción (POST) |
| POST | `/newsletter/subscribe` | Público | Suscribirse (doble opt-in por correo) |
| GET | `/newsletter/unsubscribe` | Público | Baja con un clic |
| POST | `/newsletter/unsubscribe` | Público | Baja con un clic (POST, para el encabezado List-Unsubscribe-Post) |
| POST | `/vacation-registrations` | Público | Registra el interés de vacaciones (con o sin cuenta) |

## gamificación

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/gamification/achievements` | Opcional (sesión) | Catálogo de logros (los secretos se ocultan hasta desbloquearse) |
| POST | `/gamification/achievements/{id}/unlock` | Sesión | Pide desbloquear un logro; el servidor comprueba la condición |
| GET | `/gamification/achievements/me` | Sesión | Mis insignias |
| POST | `/gamification/actions` | Sesión | Informa una acción del usuario; el servidor decide si otorga puntos |
| POST | `/gamification/check-in` | Sesión | Check-in diario (una vez por día en hora de RD); actualiza la racha |
| POST | `/gamification/early-bird` | Sesión | Bono madrugador (antes de las 8:00 hora de RD) |
| GET | `/gamification/leaderboard` | Opcional (sesión) | Ranking por temporada, semana o histórico (con mi posición si hay sesión) |
| GET | `/gamification/leagues` | Público | Ligas semanales |
| GET | `/gamification/levels` | Público | Niveles |
| GET | `/gamification/me` | Sesión | Mi perfil de juego: XP, monedas, nivel, racha, insignias y liga |
| GET | `/gamification/me/transactions` | Sesión | Historial de XP y monedas (cursor) |
| POST | `/gamification/milestones/check` | Sesión | Entrega los hitos de XP pendientes |
| GET | `/gamification/missions` | Opcional (sesión) | Misiones activas (con mi progreso si hay sesión) |
| POST | `/gamification/missions/{id}/progress` | Sesión | Estado de una misión. El progreso lo suma el servidor con las acciones reales; aquí no se envían cifras |
| GET | `/gamification/missions/me` | Sesión | Mis misiones con progreso |
| POST | `/gamification/passport/scan-qr` | Sesión | Valida un código QR escaneado en un destino/negocio y otorga el sello oficial del pasaporte digital con XP y monedas (#220) |
| GET | `/gamification/prizes` | Público | Premios canjeables |
| POST | `/gamification/prizes/{id}/redeem` | Sesión | Canjea un premio con monedas (stock y monedas en una sola transacción) |
| GET | `/gamification/redemptions/me` | Sesión | Mis canjes |
| GET | `/gamification/rules` | Público | Reglas de puntos (cómo ganar XP y monedas) |
| GET | `/gamification/seasons/current` | Público | Temporada actual |
| GET | `/gamification/shipments/me` | Sesión | Mis envíos de premios |
| POST | `/gamification/streak-bonus` | Sesión | Bono por hitos de racha (7, 14, 30, 60 y 100 días) |
| POST | `/referrals/apply` | Sesión | Aplica el código de otra persona (una vez; cuentas nuevas con correo verificado) |
| GET | `/referrals/me` | Sesión | Mi código de referido y estadísticas (se crea al primer uso) |
| GET | `/trivia/leaderboard` | Público | Ranking de trivia (últimos 7 días) |
| GET | `/trivia/session` | Sesión | Inicia (o retoma) una partida; las preguntas llegan sin la respuesta correcta |
| POST | `/trivia/session/{id}/answer` | Sesión | Responde una pregunta (se corrige en el servidor) |
| POST | `/trivia/session/{id}/finish` | Sesión | Termina la partida; el XP se calcula con los aciertos registrados (tope por partida) |

## gastronomia

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/bars` | Público | Listado de bares y vida nocturna |
| GET | `/bars/{idOrSlug}` | Público | Detalle de bares y vida nocturna por id (uuid) o slug |
| GET | `/bars/{idOrSlug}/nearby` | Público | Lugares cerca de este elemento |
| GET | `/bars/{idOrSlug}/related` | Público | Bares y vida nocturna relacionados |
| GET | `/bars/{idOrSlug}/reviews` | Público | Reseñas aprobadas de bares y vida nocturna |
| GET | `/bars/facets` | Público | Facetas de bares y vida nocturna |
| GET | `/recipes` | Público | Listado de recetas criollas |
| GET | `/recipes/{idOrSlug}` | Público | Detalle de recetas criollas por id (uuid) o slug |
| GET | `/recipes/{idOrSlug}/related` | Público | Recetas criollas relacionados |
| GET | `/recipes/facets` | Público | Facetas de recetas criollas |
| GET | `/restaurants` | Público | Listado de restaurantes |
| GET | `/restaurants/{idOrSlug}` | Público | Detalle de restaurantes por id (uuid) o slug |
| GET | `/restaurants/{idOrSlug}/nearby` | Público | Lugares cerca de este elemento |
| GET | `/restaurants/{idOrSlug}/related` | Público | Restaurantes relacionados |
| GET | `/restaurants/{idOrSlug}/reviews` | Público | Reseñas aprobadas de restaurantes |
| GET | `/restaurants/facets` | Público | Facetas de restaurantes |

## herramientas

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/tools/dictionary` | Público | Glosario de dominicanismos (sin acentos ni mayúsculas) |
| GET | `/tools/esim` | Público | Ofertas de esim |
| POST | `/tools/esim/lead` | Público | Solicita información sobre esim (requiere consentimiento) |
| GET | `/tools/insurance` | Público | Ofertas de insurance |
| POST | `/tools/insurance/lead` | Público | Solicita información sobre insurance (requiere consentimiento) |
| GET | `/tools/phrases` | Público | Frases útiles del español al idioma elegido |
| GET | `/tools/prepaid-card` | Público | Ofertas de prepaid-card |
| POST | `/tools/prepaid-card/lead` | Público | Solicita información sobre prepaid-card (requiere consentimiento) |
| GET | `/tools/requirements` | Público | Requisitos de entrada por país (código ISO de 2 letras) |

## historia

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/historical-events` | Público | Listado de eventos históricos |
| GET | `/historical-events/{idOrSlug}` | Público | Detalle de eventos históricos por id (uuid) o slug |
| GET | `/historical-events/{idOrSlug}/related` | Público | Eventos históricos relacionados |
| GET | `/historical-events/facets` | Público | Facetas de eventos históricos |
| GET | `/historical-figures` | Público | Listado de personajes históricos |
| GET | `/historical-figures/{idOrSlug}` | Público | Detalle de personajes históricos por id (uuid) o slug |
| GET | `/historical-figures/{idOrSlug}/related` | Público | Personajes históricos relacionados |
| GET | `/historical-figures/facets` | Público | Facetas de personajes históricos |

## ia

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/ai/chat` | Opcional (sesión) | Asistente «Guía RD» en streaming (SSE): eventos `{places}`, `{delta}`, `{done, usage}` o `{error}`. 10 mensajes/min anónimo; con sesión cuenta en la cuota diaria |
| POST | `/ai/itinerary` | Sesión | Genera un itinerario con lugares reales del catálogo (los `ref` inventados se descartan). Se guarda con POST /me/trips/{id}/from-itinerary |
| GET | `/ai/quota` | Sesión | Mi cuota diaria de consultas de IA |
| POST | `/ai/recommendations` | Sesión | Recomendaciones según intereses, favoritos y lugares visitados (sin IA disponible, se ordena por calificación) |
| POST | `/ai/translate` | Sesión | Traducción asistida (editor); las repetidas salen de la caché sin costo |

## mapa

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/geo/nearby` | Público | Lugares cercanos de varias colecciones, del más cercano al más lejano |
| GET | `/geo/reverse` | Público | Provincia, municipio y destino más cercanos a una coordenada (hasta 60 km) |
| GET | `/map/features` | Público | GeoJSON de una o varias capas dentro de un rectángulo (bbox=minLng,minLat,maxLng,maxLat) |
| GET | `/map/layers` | Público | Capas del mapa interactivo |

## marketing

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/offers` | Público | Listado de ofertas |
| GET | `/offers/{idOrSlug}` | Público | Detalle de ofertas por id (uuid) o slug |
| GET | `/offers/{idOrSlug}/nearby` | Público | Lugares cerca de este elemento |
| GET | `/offers/facets` | Público | Facetas de ofertas |

## marketplace

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/marketplace/categories` | Público | Categorías con productos |
| POST | `/marketplace/checkout/quote` | Público | Cotiza un carrito de productos del marketplace |
| POST | `/marketplace/orders` | Opcional (sesión) | Crea y cobra un pedido (Idempotency-Key obligatorio; puede mezclar vendedores; `ref_code` atribuye a un embajador) |
| GET | `/marketplace/orders/{id}` | Opcional (sesión) | Detalle y seguimiento por artículo (token de invitado o sesión del titular) |
| POST | `/marketplace/orders/{id}/cancel` | Opcional (sesión) | Cancela mientras ningún vendedor haya enviado; reembolsa todo |
| GET | `/marketplace/products` | Público | Catálogo de vendedores locales |
| GET | `/marketplace/products/{slug}` | Público | Detalle de un producto (DOP y USD) |
| GET | `/marketplace/vendors` | Público | Vendedores activos |
| GET | `/marketplace/vendors/{slug}` | Público | Tienda pública con sus productos |
| POST | `/marketplace/vendors/apply` | Sesión | Solicita abrir una tienda (correo verificado; el equipo la revisa) |
| GET | `/marketplace/vendors/me` | Sesión | Mi tienda |
| PATCH | `/marketplace/vendors/me` | Sesión | Edita mi tienda y mi forma de cobro |
| GET | `/me/marketplace/orders` | Sesión | Mis pedidos del marketplace |
| PATCH | `/partner/marketplace/order-items/{id}` | Sesión | Marca un artículo como enviado (con guía) o entregado |
| POST | `/partner/marketplace/order-items/{id}/cancel` | Sesión | Cancela un artículo que no puedo surtir (se reembolsa y vuelve al stock) |
| GET | `/partner/marketplace/orders` | Sesión | Artículos vendidos por mi tienda (con los datos de entrega) |
| GET | `/partner/marketplace/products` | Sesión | Mis productos (todos los estados) |
| POST | `/partner/marketplace/products` | Sesión | Publica un producto o experiencia (pasa por revisión) |
| PATCH | `/partner/marketplace/products/{id}` | Sesión | Edita: precio y existencias al instante; el contenido vuelve a revisión. `archived` retira o reactiva |
| DELETE | `/partner/marketplace/products/{id}` | Sesión | Elimina un producto (los pedidos conservan su instantánea) |
| GET | `/partner/payouts` | Sesión | Mis liquidaciones y saldo por liquidar |

## medios

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/media/{id}` | Opcional (sesión) | Metadatos y URLs (público si está aprobado; si no, sólo el dueño o el equipo) |
| DELETE | `/media/{id}` | Sesión | Elimina un archivo (dueño o admin) |
| POST | `/media/{id}/complete` | Sesión | Confirma la subida: se valida el archivo real (formato, tamaño y dimensiones) |
| PUT | `/media/{id}/upload` | Público | Sube el binario a la URL firmada (sin sesión: la firma lo autoriza) |
| GET | `/media/files/{id}` | Público | El archivo (inmutable y cacheable una vez aprobado). `?variant=thumb\|medium\|large` sirve una versión reducida en webp; si no existe, el original |
| GET | `/media/licenses/catalog` | Público | Imágenes del banco oficial disponibles para licenciar, con su vista previa y precios |
| GET | `/media/licenses/mine` | Sesión | Mis solicitudes y licencias, con el enlace de descarga de las vigentes |
| POST | `/media/licenses/requests` | Sesión | Solicita una licencia de uso; queda en revisión hasta confirmar el pago |
| POST | `/media/upload-url` | Sesión | Pide una URL firmada para subir una imagen (PUT directo con el binario) |

## memberships

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/events/{id}/tickets/purchase` | Sesión | Compra de entrada para un evento en vivo con QR único (#20) |
| POST | `/events/tickets/verify` | Sesión | Valida el QR de una entrada y registra el check-in en puerta (#20) |
| GET | `/memberships/me` | Sesión | Membresía activa y balance de puntos de quien llama (#18, #19) |
| GET | `/memberships/plans` | Público | Planes de membresía Pasaporte RD activos (#19) |
| POST | `/memberships/subscribe` | Sesión | Suscribe a la persona autenticada en un plan Pasaporte RD (#19) |

## mi viaje

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/me/spots` | Sesión | Mis lugares del Top 100: visitados y deseados |
| PUT | `/me/spots/{spot_id}` | Sesión | Marca un lugar como visitado (10/25/50/100 dan premios) |
| DELETE | `/me/spots/{spot_id}` | Sesión | Quita un lugar de mis visitados (el premio ya otorgado se conserva) |
| GET | `/me/tickets` | Sesión | Mis e-tickets (eventos) y vouchers de reservas, con el código para el QR |
| GET | `/me/tickets/{id}` | Sesión | Detalle de un ticket |
| GET | `/me/trips` | Sesión | Mis viajes y los compartidos conmigo |
| POST | `/me/trips` | Sesión | Crea un viaje (máximo 50) |
| GET | `/me/trips/{id}` | Sesión | Detalle con las actividades por día, votos y miembros |
| PATCH | `/me/trips/{id}` | Sesión | Edita el viaje (dueño) |
| DELETE | `/me/trips/{id}` | Sesión | Elimina el viaje (dueño) |
| POST | `/me/trips/{id}/check-in` | Sesión | Check-in digital de una reserva propia (suma XP una sola vez) |
| GET | `/me/trips/{id}/diary` | Sesión | Diario del viaje |
| POST | `/me/trips/{id}/diary` | Sesión | Nueva entrada del diario (opcionalmente pública en el enlace compartido) |
| PATCH | `/me/trips/{id}/diary/{entryId}` | Sesión | Edita una entrada |
| DELETE | `/me/trips/{id}/diary/{entryId}` | Sesión | Borra una entrada |
| POST | `/me/trips/{id}/from-itinerary` | Sesión | Copia un itinerario (prediseñado o de /ai/itinerary) al viaje |
| GET | `/me/trips/{id}/invites` | Sesión | Enlaces de invitación vigentes de mi viaje (sólo el dueño) |
| DELETE | `/me/trips/{id}/invites/{inviteId}` | Sesión | Revoca un enlace de invitación ya compartido (sólo el dueño) |
| POST | `/me/trips/{id}/items` | Sesión | Agrega una actividad (lugar del catálogo o texto libre) |
| PATCH | `/me/trips/{id}/items/{itemId}` | Sesión | Edita una actividad (día, hora, notas, costo) |
| DELETE | `/me/trips/{id}/items/{itemId}` | Sesión | Quita una actividad |
| POST | `/me/trips/{id}/items/{itemId}/vote` | Sesión | Voto +1 / −1 (0 lo retira) |
| POST | `/me/trips/{id}/members` | Sesión | Crea un enlace de invitación al planificador grupal (viewer o editor, válido 7 días, 5 usos) |
| DELETE | `/me/trips/{id}/members/{userId}` | Sesión | El dueño quita a un miembro, o un miembro sale del viaje |
| GET | `/me/trips/{id}/packing-list` | Sesión | Lista de empaque |
| PUT | `/me/trips/{id}/packing-list` | Sesión | Reemplaza la lista de empaque (marcar/desmarcar) |
| POST | `/me/trips/{id}/reorder` | Sesión | Reordena y cambia de día varias actividades |
| POST | `/me/trips/{id}/share` | Sesión | Crea el enlace público de sólo lectura (se muestra una vez; volver a llamar lo reemplaza) |
| DELETE | `/me/trips/{id}/share` | Sesión | Deja de compartir el viaje |
| GET | `/me/trips/{id}/summary` | Sesión | Presupuesto estimado, mapa (GeoJSON) y reservas del periodo |
| PUT | `/me/wishlist/{spot_id}` | Sesión | Agrega un lugar a mi lista de deseos |
| DELETE | `/me/wishlist/{spot_id}` | Sesión | Quita un lugar de mi lista de deseos |
| POST | `/tickets/verify` | Sesión | Escáner: valida un código; los tickets de eventos se marcan como usados (personal) y las reservas las consulta el personal del operador |
| POST | `/trips/join` | Sesión | Acepta una invitación con su token |
| GET | `/trips/shared/{token}` | Público | Vista pública de un viaje compartido (sin costos ni datos privados) |

## notificaciones

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/me/notification-preferences` | Sesión | Matriz de notificaciones por canal (email, push, in_app) y tipo |
| PUT | `/me/notification-preferences` | Sesión | Actualiza sólo lo enviado (las promociones requieren activarse) |
| GET | `/me/push-subscriptions` | Sesión | Mis dispositivos con push y la clave pública VAPID para registrarlos |
| POST | `/me/push-subscriptions` | Sesión | Registra un dispositivo (objeto `PushSubscription` del navegador) |
| DELETE | `/me/push-subscriptions/{id}` | Sesión | Quita un dispositivo |
| GET | `/notifications/stream` | Opcional (sesión) | Notificaciones en tiempo real (SSE): `event: ready`, luego `event: notification` con cada aviso nuevo; latido cada 25 s. Máximo 5 conexiones por persona |
| POST | `/notifications/stream-ticket` | Sesión | Ticket de un minuto para abrir el flujo SSE (un EventSource no puede enviar el encabezado Authorization) |

## operadores

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/ical/{file}` | Público | Feed iCal de una habitación (URL secreta para Airbnb, Booking, Google…) |
| GET | `/listings/{id}/reviews` | Público | Reseñas públicas de un servicio |
| GET | `/me/org-join-requests` | Sesión | Mis solicitudes para unirme a organizaciones |
| DELETE | `/me/org-join-requests/{id}` | Sesión | Retira una solicitud propia aún pendiente |
| GET | `/operators` | Público | Directorio de operadores verificados |
| GET | `/operators/{slug}` | Público | Sitio web público de un operador |
| POST | `/operators/{slug}/contact-click` | Público | Cuenta un clic de contacto (WhatsApp, llamada, ruta o sitio web) hacia un operador |
| GET | `/operators/{slug}/listings/{listing}` | Público | Ficha pública de un servicio |
| PATCH | `/operators/creator-stay-applications/{id}` | Sesión | Acepta o rechaza la postulación de un creador |
| GET | `/operators/creator-stays` | Sesión | Lista las estancias publicadas por mi establecimiento con conteo de postulaciones |
| POST | `/operators/creator-stays` | Sesión | Publica una oportunidad de estancia para influencers y creadores de contenido |
| GET | `/operators/creator-stays/{id}/applications` | Sesión | Ver postulantes para una estancia concreta |
| POST | `/operators/creators/{id}/invite-stay` | Sesión | Envía una invitación directa de estancia a un creador |
| GET | `/operators/creators/directory` | Sesión | Directorio de creadores verificados para invitaciones directas |
| GET | `/operators/sponsorship/challenges` | Sesión | Lista los retos patrocinados creados por mi establecimiento |
| POST | `/operators/sponsorship/challenges` | Sesión | Crea un reto o misión patrocinada por el establecimiento |
| GET | `/operators/sponsorship/rewards` | Sesión | Lista los premios publicados por mi establecimiento |
| POST | `/operators/sponsorship/rewards` | Sesión | Publica un premio o voucher para el Club de Recompensas |
| GET | `/operators/sponsorship/stats` | Sesión | Métricas de participación, visitas generadas y canjes |
| GET | `/org/bookings` | Sesión | Reservas de mi organización |
| POST | `/org/bookings` | Sesión | Reserva manual (teléfono, mostrador): confirmada, sin comisión |
| GET | `/org/bookings/{id}` | Sesión | Detalle de una reserva |
| PATCH | `/org/bookings/{id}` | Sesión | Notas internas |
| POST | `/org/bookings/{id}/change-date` | Sesión | Mueve una reserva a otra fecha (sin los límites del viajero); se le avisa |
| POST | `/org/bookings/{id}/payments` | Sesión | Registra un cobro manual (efectivo, transferencia) |
| PUT | `/org/bookings/{id}/status` | Sesión | Cambia el estado (cancelar reembolsa todo) |
| GET | `/org/bookings/{id}/voucher.pdf` | Sesión | Voucher en PDF de una reserva de mi organización |
| GET | `/org/calendar` | Sesión | Calendario de reservas (máx. 93 días) |
| DELETE | `/org/calendar-links/{id}` | Sesión | Quita un calendario importado y sus bloqueos |
| POST | `/org/calendar-links/{id}/sync` | Sesión | Sincroniza ahora un calendario importado |
| GET | `/org/income` | Sesión | Ingresos, comisión y saldo por liquidar |
| GET | `/org/join-requests` | Sesión | Solicitudes para unirse a mi organización, con la identidad de quien pide |
| POST | `/org/join-requests/{id}/approve` | Sesión | Aprueba la solicitud y crea la membresía (se puede conceder un rol distinto del pedido) |
| POST | `/org/join-requests/{id}/reject` | Sesión | Rechaza la solicitud (motivo obligatorio) |
| GET | `/org/listings` | Sesión | Mis servicios |
| POST | `/org/listings` | Sesión | Crea un servicio (borrador) |
| GET | `/org/listings/{id}` | Sesión | Detalle de un servicio |
| PATCH | `/org/listings/{id}` | Sesión | Edita un servicio |
| DELETE | `/org/listings/{id}` | Sesión | Elimina un servicio sin reservas |
| POST | `/org/listings/{id}/rooms` | Sesión | Crea una habitación |
| PUT | `/org/listings/{id}/status` | Sesión | Publica, pausa o pasa a borrador (publicar exige organización verificada) |
| GET | `/org/messages` | Sesión | Conversaciones |
| GET | `/org/messages/{thread}` | Sesión | Mensajes de una conversación (la marca como leída) |
| POST | `/org/messages/{thread}` | Sesión | Responde una conversación |
| GET | `/org/ownership-transfer` | Sesión | Transferencia de propiedad pendiente de mi organización, si la hay |
| POST | `/org/ownership-transfer` | Sesión | Propone transferir la propiedad a un miembro del equipo (pide la contraseña y, si está activo, el segundo factor) |
| POST | `/org/ownership-transfer/{id}/accept` | Sesión | Acepta ser el nuevo propietario; el anterior pasa a administrador |
| POST | `/org/ownership-transfer/{id}/close` | Sesión | Rechaza la transferencia (quien fue elegido) o la retira (quien la propuso) |
| GET | `/org/payouts` | Sesión | Mis liquidaciones y lo pendiente de pago |
| GET | `/org/payouts/{id}/items` | Sesión | Reservas incluidas en una liquidación |
| GET | `/org/promotions` | Sesión | Mis códigos promocionales |
| POST | `/org/promotions` | Sesión | Crea un código |
| PATCH | `/org/promotions/{id}` | Sesión | Edita un código |
| DELETE | `/org/promotions/{id}` | Sesión | Elimina un código |
| GET | `/org/reports/contact-clicks` | Sesión | Clics a WhatsApp, llamada, ruta y sitio web por día y por servicio |
| GET | `/org/reports/demand` | Sesión | Reporte trimestral de demanda (planes Premium y Corporativo) |
| GET | `/org/reports/summary` | Sesión | Resumen: reservas, ingresos, servicios, canales, cancelaciones y promociones |
| GET | `/org/reports/weekly-email` | Sesión | ¿Recibe mi organización el resumen semanal por correo? |
| PUT | `/org/reports/weekly-email` | Sesión | Activa o desactiva el resumen semanal por correo |
| GET | `/org/reviews` | Sesión | Reseñas de mis servicios |
| PUT | `/org/reviews/{id}/reply` | Sesión | Responde una reseña |
| PATCH | `/org/rooms/{id}` | Sesión | Edita una habitación |
| DELETE | `/org/rooms/{id}` | Sesión | Elimina una habitación sin reservas |
| PUT | `/org/rooms/{id}/blocks` | Sesión | Fechas bloqueadas manualmente |
| GET | `/org/rooms/{id}/calendar` | Sesión | URL de exportación y calendarios importados |
| POST | `/org/rooms/{id}/calendar-links` | Sesión | Importa un calendario iCal externo (https) y bloquea sus fechas |
| PUT | `/org/rooms/{id}/rates` | Sesión | Tarifas: fin de semana, noches mínimas y temporadas |
| GET | `/org/subscription` | Sesión | Estado y plan de suscripción del operador |
| POST | `/org/subscription/cancel` | Sesión | Cancela la renovación automática de la suscripción |
| POST | `/org/subscription/upgrade` | Sesión | Cambia o activa el plan de suscripción (destacado, premium_partner, corporativo) |
| GET | `/org/team` | Sesión | Miembros e invitaciones abiertas |
| POST | `/org/team/invitations` | Sesión | Invita a alguien al equipo por correo |
| DELETE | `/org/team/invitations/{id}` | Sesión | Revoca una invitación |
| PATCH | `/org/team/members/{id}` | Sesión | Cambia el rol o los servicios de un miembro |
| DELETE | `/org/team/members/{id}` | Sesión | Quita a un miembro (o sal tú del equipo) |
| GET | `/org/webhooks` | Sesión | Webhooks de mi organización (sin el secreto) |
| POST | `/org/webhooks` | Sesión | Registra un webhook https; el secreto para verificar la firma sólo se muestra aquí |
| DELETE | `/org/webhooks/{id}` | Sesión | Elimina un webhook y sus entregas |
| GET | `/org/webhooks/{id}/deliveries` | Sesión | Últimas 50 entregas de un webhook |
| POST | `/org/webhooks/{id}/enable` | Sesión | Reactiva un webhook desactivado por fallos |
| POST | `/org/webhooks/{id}/test` | Sesión | Encola una entrega de prueba |
| POST | `/orgs` | Sesión | Registra mi organización de operador (queda pendiente de verificación) |
| POST | `/orgs/{id}/join-requests` | Sesión | Pide unirte al equipo de una organización (requiere correo verificado) |
| GET | `/orgs/me` | Sesión | Mi organización y mi rol |
| PATCH | `/orgs/me` | Sesión | Actualiza mi organización |
| GET | `/team-invitations/{token}` | Público | Vista previa de una invitación |
| POST | `/team-invitations/{token}/accept` | Sesión | Acepta una invitación con la cuenta invitada |
| POST | `/verifications` | Sesión | Solicita el Sello Verificado para un negocio; queda en revisión |
| GET | `/verifications/contracts` | Sesión | Contratos de términos comerciales emitidos a mi nombre, con su texto |
| POST | `/verifications/contracts/{id}/accept` | Sesión | Acepta un contrato indicando la huella del texto leído |
| GET | `/verifications/mine` | Sesión | Mis solicitudes de Sello Verificado y su contrato |

## otros

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/content/offline-bundle` | Público |  |
| GET | `/sitemap.xml` | Público |  |
| GET | `/sitemap.xml` | Público |  |

## patrocinio

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/sponsorship/bids` | Sesión | Puja (a sobre cerrado) por un espacio en una semana futura; repetirla sólo puede subirla |
| DELETE | `/sponsorship/bids/{id}` | Sesión | Retira una puja propia mientras la subasta siga abierta |
| GET | `/sponsorship/bids/mine` | Sesión | Mis pujas y el precio mínimo de cada espacio |
| POST | `/sponsorship/campaigns` | Sesión | Crea una nueva campaña publicitaria/patrocinada |
| POST | `/sponsorship/campaigns/{id}/creatives` | Sesión | Agrega una creatividad/anuncio a una campaña |
| GET | `/sponsorship/campaigns/mine` | Sesión | Mis campañas con sus anuncios y resultados |
| GET | `/sponsorship/serve/{slot_id}` | Público | Entrega creatividades activas para un espacio publicitario |
| GET | `/sponsorship/slots` | Público | Espacios de patrocinio e inventario disponibles en el portal |
| POST | `/sponsorship/telemetry` | Público | Registra telemetría de anuncios (impresión, clic o conversión) |

## productos

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/insurance/quote-and-issue` | Público | Emisión de seguro de viaje con cobertura médica y cancelación (#12) |
| GET | `/packages/dynamic` | Público | Catálogo de paquetes dinámicos multidestino (#17) |
| POST | `/transport/book` | Público | Reserva de transfer privado, chofer o vehículo rent-a-car (#13) |

## publicidad

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/ads` | Público | Banners vigentes de un espacio, con rotación ponderada por prioridad |
| GET | `/ads/{id}/click` | Público | Cuenta el clic y redirige al destino del anunciante |
| POST | `/ads/{id}/impression` | Público | Registra una vista |
| POST | `/ads/impressions` | Público | Registra vistas en lote (deduplicadas por sesión y hora) |
| GET | `/ads/slots` | Público | Espacios publicitarios y sus dimensiones |
| POST | `/advertisers/requests` | Público | Solicitud de publicidad (crea un lead y un ticket) |
| POST | `/offers/{id}/redeem` | Sesión | Canjea una oferta vigente (una vez por persona) y devuelve su código de descuento |

## reseñas

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/me/reviews` | Sesión | Mis reseñas (incluye las pendientes) |
| POST | `/reviews` | Sesión | Deja una reseña (una por entidad; pasa por moderación automática) |
| PATCH | `/reviews/{id}` | Sesión | Edita mi reseña (vuelve a moderarse) |
| DELETE | `/reviews/{id}` | Sesión | Elimina mi reseña |
| POST | `/reviews/{id}/helpful` | Sesión | Marca una reseña como útil (una vez; no la propia) |
| POST | `/reviews/{id}/reply` | Sesión | Respuesta oficial (editor/admin, o el operador dueño del servicio) |
| POST | `/reviews/{id}/report` | Sesión | Reporta una reseña (a los 3 reportes distintos se oculta hasta revisarla) |

## reservas

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/bookings` | Opcional (sesión) | Crea una reserva (el servidor recalcula el precio; requiere Idempotency-Key) |
| GET | `/bookings/{id}` | Público | Detalle de una reserva (token de invitado o sesión del titular) |
| POST | `/bookings/{id}/cancel` | Público | Cancela con reembolso según la política |
| POST | `/bookings/{id}/change-date` | Público | Cambia la fecha (misma cotización: el total nunca baja; si sube, la diferencia queda como saldo). Hasta 2 veces y 48 h antes. `dry_run` sólo muestra cómo quedaría |
| POST | `/bookings/{id}/claim/start` | Opcional (sesión) | Envía al correo de contacto un enlace de un solo uso (1 hora) para vincular la reserva a una cuenta |
| POST | `/bookings/{id}/messages` | Público | El viajero escribe al operador desde su reserva |
| POST | `/bookings/{id}/pay-balance` | Público | Paga el saldo pendiente |
| POST | `/bookings/{id}/review` | Público | Reseña verificada de una reserva completada (una por reserva) |
| GET | `/bookings/{id}/voucher.pdf` | Público | Voucher en PDF con el QR de la referencia (reservas confirmadas o realizadas) |
| POST | `/bookings/claim` | Sesión | Vincula a mi cuenta la reserva del enlace (un solo uso) |
| GET | `/bookings/claim/{token}` | Público | Vista previa sin datos personales del enlace de reclamo (correo enmascarado) |
| POST | `/bookings/quote` | Público | Cotiza una reserva (precio final, disponibilidad y motivos si no se puede) |
| GET | `/listings/{id}/availability` | Público | Disponibilidad por día (máx. 62 días) |
| GET | `/me/bookings` | Sesión | Mis reservas |
| POST | `/promotions/validate` | Público | Valida un código promocional para un servicio |

## servicios

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/airports` | Público | Listado de aeropuertos |
| GET | `/airports/{idOrSlug}` | Público | Detalle de aeropuertos por id (uuid) o slug |
| GET | `/airports/{idOrSlug}/nearby` | Público | Lugares cerca de este elemento |
| GET | `/airports/{idOrSlug}/related` | Público | Aeropuertos relacionados |
| GET | `/airports/facets` | Público | Facetas de aeropuertos |
| GET | `/artisan-workshops` | Público | Listado de talleres artesanales |
| GET | `/artisan-workshops/{idOrSlug}` | Público | Detalle de talleres artesanales por id (uuid) o slug |
| GET | `/artisan-workshops/{idOrSlug}/nearby` | Público | Lugares cerca de este elemento |
| GET | `/artisan-workshops/{idOrSlug}/related` | Público | Talleres artesanales relacionados |
| GET | `/artisan-workshops/{idOrSlug}/reviews` | Público | Reseñas aprobadas de talleres artesanales |
| GET | `/artisan-workshops/facets` | Público | Facetas de talleres artesanales |
| GET | `/clinics` | Público | Listado de clínicas y centros de salud |
| GET | `/clinics/{idOrSlug}` | Público | Detalle de clínicas y centros de salud por id (uuid) o slug |
| GET | `/clinics/{idOrSlug}/related` | Público | Clínicas y centros de salud relacionados |
| GET | `/clinics/facets` | Público | Facetas de clínicas y centros de salud |
| GET | `/coffee-experiences` | Público | Listado de experiencias de café |
| GET | `/coffee-experiences/{idOrSlug}` | Público | Detalle de experiencias de café por id (uuid) o slug |
| GET | `/coffee-experiences/{idOrSlug}/nearby` | Público | Lugares cerca de este elemento |
| GET | `/coffee-experiences/{idOrSlug}/related` | Público | Experiencias de café relacionados |
| GET | `/coffee-experiences/{idOrSlug}/reviews` | Público | Reseñas aprobadas de experiencias de café |
| GET | `/coffee-experiences/facets` | Público | Facetas de experiencias de café |
| GET | `/emergency-contacts` | Público | Listado de contactos de emergencia |
| GET | `/emergency-contacts/{idOrSlug}` | Público | Detalle de contactos de emergencia por id (uuid) o slug |
| GET | `/emergency-contacts/{idOrSlug}/nearby` | Público | Lugares cerca de este elemento |
| GET | `/emergency-contacts/facets` | Público | Facetas de contactos de emergencia |
| GET | `/establecimientos` | Público | Listado de directorio oficial de establecimientos |
| GET | `/establecimientos/{idOrSlug}` | Público | Detalle de directorio oficial de establecimientos por id (uuid) o slug |
| GET | `/establecimientos/facets` | Público | Facetas de directorio oficial de establecimientos |
| GET | `/experiences` | Público | Listado de experiencias |
| GET | `/experiences/{idOrSlug}` | Público | Detalle de experiencias por id (uuid) o slug |
| GET | `/experiences/{idOrSlug}/related` | Público | Experiencias relacionados |
| GET | `/experiences/{idOrSlug}/reviews` | Público | Reseñas aprobadas de experiencias |
| GET | `/experiences/facets` | Público | Facetas de experiencias |
| GET | `/golf-courses` | Público | Listado de campos de golf |
| GET | `/golf-courses/{idOrSlug}` | Público | Detalle de campos de golf por id (uuid) o slug |
| GET | `/golf-courses/{idOrSlug}/related` | Público | Campos de golf relacionados |
| GET | `/golf-courses/facets` | Público | Facetas de campos de golf |
| GET | `/ports` | Público | Listado de puertos y marinas |
| GET | `/ports/{idOrSlug}` | Público | Detalle de puertos y marinas por id (uuid) o slug |
| GET | `/ports/{idOrSlug}/nearby` | Público | Lugares cerca de este elemento |
| GET | `/ports/{idOrSlug}/related` | Público | Puertos y marinas relacionados |
| GET | `/ports/facets` | Público | Facetas de puertos y marinas |
| GET | `/shopping-centers` | Público | Listado de centros comerciales |
| GET | `/shopping-centers/{idOrSlug}` | Público | Detalle de centros comerciales por id (uuid) o slug |
| GET | `/shopping-centers/{idOrSlug}/related` | Público | Centros comerciales relacionados |
| GET | `/shopping-centers/facets` | Público | Facetas de centros comerciales |
| GET | `/souvenirs` | Público | Listado de souvenirs |
| GET | `/souvenirs/{idOrSlug}` | Público | Detalle de souvenirs por id (uuid) o slug |
| GET | `/spas` | Público | Listado de spas y bienestar |
| GET | `/spas/{idOrSlug}` | Público | Detalle de spas y bienestar por id (uuid) o slug |
| GET | `/spas/{idOrSlug}/related` | Público | Spas y bienestar relacionados |
| GET | `/spas/{idOrSlug}/reviews` | Público | Reseñas aprobadas de spas y bienestar |
| GET | `/spas/facets` | Público | Facetas de spas y bienestar |
| GET | `/stadiums` | Público | Listado de estadios |
| GET | `/stadiums/{idOrSlug}` | Público | Detalle de estadios por id (uuid) o slug |
| GET | `/stadiums/{idOrSlug}/nearby` | Público | Lugares cerca de este elemento |
| GET | `/stadiums/{idOrSlug}/related` | Público | Estadios relacionados |
| GET | `/stadiums/facets` | Público | Facetas de estadios |
| GET | `/theme-parks` | Público | Listado de parques temáticos |
| GET | `/theme-parks/{idOrSlug}` | Público | Detalle de parques temáticos por id (uuid) o slug |
| GET | `/theme-parks/{idOrSlug}/nearby` | Público | Lugares cerca de este elemento |
| GET | `/theme-parks/{idOrSlug}/related` | Público | Parques temáticos relacionados |
| GET | `/theme-parks/{idOrSlug}/reviews` | Público | Reseñas aprobadas de parques temáticos |
| GET | `/theme-parks/facets` | Público | Facetas de parques temáticos |
| GET | `/tour-guides` | Público | Listado de guías turísticos |
| GET | `/tour-guides/{idOrSlug}` | Público | Detalle de guías turísticos por id (uuid) o slug |
| GET | `/tour-guides/{idOrSlug}/reviews` | Público | Reseñas aprobadas de guías turísticos |
| GET | `/tour-guides/facets` | Público | Facetas de guías turísticos |
| GET | `/tour-operators` | Público | Listado de operadores de turismo |
| GET | `/tour-operators/{idOrSlug}` | Público | Detalle de operadores de turismo por id (uuid) o slug |
| GET | `/tour-operators/facets` | Público | Facetas de operadores de turismo |
| GET | `/tours` | Público | Listado de tours y paquetes |
| GET | `/tours/{idOrSlug}` | Público | Detalle de tours y paquetes por id (uuid) o slug |
| GET | `/tours/{idOrSlug}/related` | Público | Tours y paquetes relacionados |
| GET | `/tours/{idOrSlug}/reviews` | Público | Reseñas aprobadas de tours y paquetes |
| GET | `/tours/facets` | Público | Facetas de tours y paquetes |
| GET | `/travel-agencies` | Público | Listado de agencias de viaje |
| GET | `/travel-agencies/{idOrSlug}` | Público | Detalle de agencias de viaje por id (uuid) o slug |
| GET | `/travel-agencies/facets` | Público | Facetas de agencias de viaje |

## sistema

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/config` | Público | Configuración pública de arranque |
| GET | `/health` | Público | Liveness: el proceso responde |
| GET | `/health` | Público | Liveness: el proceso responde |
| GET | `/health/cache` | Público | Estado de la caché Redis (si está configurada) |
| GET | `/health/cache` | Público | Estado de la caché Redis (si está configurada) |
| GET | `/health/db` | Público | Health detallado de la base de datos: latencia, pool y migraciones |
| GET | `/health/db` | Público | Health detallado de la base de datos: latencia, pool y migraciones |
| GET | `/health/detailed` | Público | Diagnóstico completo de todos los subsistemas |
| GET | `/health/detailed` | Público | Diagnóstico completo de todos los subsistemas |
| GET | `/health/queue` | Público | Estado de la cola de correos: pendientes y fallidos |
| GET | `/health/queue` | Público | Estado de la cola de correos: pendientes y fallidos |
| GET | `/health/ready` | Público | Readiness: dependencias disponibles (base de datos) |
| GET | `/health/ready` | Público | Readiness: dependencias disponibles (base de datos) |
| GET | `/version` | Público | Versión de la API |
| GET | `/version` | Público | Versión de la API |

## sitio

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/datasets` | Público | Índice de documentos de contenido, con su revisión |
| GET | `/datasets/{key}` | Público | Un documento de contenido |
| GET | `/redirects` | Público | Redirecciones activas (para el servidor web o el frontend) |
| GET | `/site/settings` | Público | Ajustes públicos del sitio (textos, contacto, redes, menú…) |

## social

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| DELETE | `/social/comments/{id}` | Sesión | Borra un comentario (dueño o moderador) |
| GET | `/social/feed` | Opcional (sesión) | Feed de RD Social |
| GET | `/social/me/comment-stats` | Sesión | Mis estadísticas de participación |
| POST | `/social/posts` | Sesión | Publica (máx. 10 al día; correo verificado) |
| DELETE | `/social/posts/{id}` | Sesión | Borra una publicación (dueño o moderador; borrado lógico) |
| GET | `/social/posts/{id}/comments` | Público | Comentarios de una publicación |
| POST | `/social/posts/{id}/comments` | Sesión | Comenta (3–500 caracteres) |
| PUT | `/social/posts/{id}/like` | Sesión | Like (idempotente) |
| DELETE | `/social/posts/{id}/like` | Sesión | Quita el like |
| GET | `/ugc/media` | Público | Fotos y videos aprobados de un lugar |
| POST | `/ugc/media` | Sesión | Sube una foto o video de un lugar (queda pendiente de aprobación) |
| POST | `/ugc/reports` | Sesión | Reporta contenido (a los 3 reportes distintos una publicación se oculta hasta revisarla) |

## soporte

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/support/tickets` | Sesión | Mis tickets |
| POST | `/support/tickets` | Sesión | Abre un ticket |
| GET | `/support/tickets/{id}` | Sesión | Conversación de un ticket |
| POST | `/support/tickets/{id}/messages` | Sesión | Responde en mi ticket |

## territorio

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/beaches` | Público | Listado de playas |
| GET | `/beaches/{idOrSlug}` | Público | Detalle de playas por id (uuid) o slug |
| GET | `/beaches/{idOrSlug}/nearby` | Público | Lugares cerca de este elemento |
| GET | `/beaches/{idOrSlug}/related` | Público | Playas relacionados |
| GET | `/beaches/{idOrSlug}/reviews` | Público | Reseñas aprobadas de playas |
| GET | `/beaches/facets` | Público | Facetas de playas |
| GET | `/bird-species` | Público | Listado de aves |
| GET | `/bird-species/{idOrSlug}` | Público | Detalle de aves por id (uuid) o slug |
| GET | `/bird-species/{idOrSlug}/related` | Público | Aves relacionados |
| GET | `/bird-species/facets` | Público | Facetas de aves |
| GET | `/caves` | Público | Listado de cuevas |
| GET | `/caves/{idOrSlug}` | Público | Detalle de cuevas por id (uuid) o slug |
| GET | `/caves/{idOrSlug}/nearby` | Público | Lugares cerca de este elemento |
| GET | `/caves/{idOrSlug}/related` | Público | Cuevas relacionados |
| GET | `/caves/{idOrSlug}/reviews` | Público | Reseñas aprobadas de cuevas |
| GET | `/caves/facets` | Público | Facetas de cuevas |
| GET | `/destinations` | Público | Listado de destinos |
| GET | `/destinations/{idOrSlug}` | Público | Detalle de destinos por id (uuid) o slug |
| GET | `/destinations/{idOrSlug}/nearby` | Público | Lugares cerca de este elemento |
| GET | `/destinations/{idOrSlug}/related` | Público | Destinos relacionados |
| GET | `/destinations/{idOrSlug}/reviews` | Público | Reseñas aprobadas de destinos |
| GET | `/destinations/facets` | Público | Facetas de destinos |
| GET | `/hot-springs` | Público | Listado de aguas termales |
| GET | `/hot-springs/{idOrSlug}` | Público | Detalle de aguas termales por id (uuid) o slug |
| GET | `/hot-springs/{idOrSlug}/related` | Público | Aguas termales relacionados |
| GET | `/hot-springs/facets` | Público | Facetas de aguas termales |
| GET | `/monuments` | Público | Listado de monumentos y museos |
| GET | `/monuments/{idOrSlug}` | Público | Detalle de monumentos y museos por id (uuid) o slug |
| GET | `/monuments/{idOrSlug}/nearby` | Público | Lugares cerca de este elemento |
| GET | `/monuments/{idOrSlug}/related` | Público | Monumentos y museos relacionados |
| GET | `/monuments/{idOrSlug}/reviews` | Público | Reseñas aprobadas de monumentos y museos |
| GET | `/monuments/facets` | Público | Facetas de monumentos y museos |
| GET | `/mountains` | Público | Listado de montañas |
| GET | `/mountains/{idOrSlug}` | Público | Detalle de montañas por id (uuid) o slug |
| GET | `/mountains/{idOrSlug}/nearby` | Público | Lugares cerca de este elemento |
| GET | `/mountains/{idOrSlug}/related` | Público | Montañas relacionados |
| GET | `/mountains/{idOrSlug}/reviews` | Público | Reseñas aprobadas de montañas |
| GET | `/mountains/facets` | Público | Facetas de montañas |
| GET | `/municipalities` | Público | Listado de municipios |
| GET | `/municipalities/{idOrSlug}` | Público | Detalle de municipios por id (uuid) o slug |
| GET | `/municipalities/{idOrSlug}/nearby` | Público | Lugares cerca de este elemento |
| GET | `/municipalities/{idOrSlug}/related` | Público | Municipios relacionados |
| GET | `/municipalities/facets` | Público | Facetas de municipios |
| GET | `/offset-projects` | Público | Listado de proyectos de compensación |
| GET | `/offset-projects/{idOrSlug}` | Público | Detalle de proyectos de compensación por id (uuid) o slug |
| GET | `/offset-projects/facets` | Público | Facetas de proyectos de compensación |
| GET | `/parks` | Público | Listado de parques nacionales |
| GET | `/parks/{idOrSlug}` | Público | Detalle de parques nacionales por id (uuid) o slug |
| GET | `/parks/{idOrSlug}/nearby` | Público | Lugares cerca de este elemento |
| GET | `/parks/{idOrSlug}/related` | Público | Parques nacionales relacionados |
| GET | `/parks/{idOrSlug}/reviews` | Público | Reseñas aprobadas de parques nacionales |
| GET | `/parks/facets` | Público | Facetas de parques nacionales |
| GET | `/protected-areas` | Público | Listado de áreas protegidas |
| GET | `/protected-areas/{idOrSlug}` | Público | Detalle de áreas protegidas por id (uuid) o slug |
| GET | `/protected-areas/{idOrSlug}/related` | Público | Áreas protegidas relacionados |
| GET | `/protected-areas/facets` | Público | Facetas de áreas protegidas |
| GET | `/provinces` | Público | Listado de provincias |
| GET | `/provinces/{idOrSlug}` | Público | Detalle de provincias por id (uuid) o slug |
| GET | `/provinces/facets` | Público | Facetas de provincias |
| GET | `/rivers` | Público | Listado de ríos |
| GET | `/rivers/{idOrSlug}` | Público | Detalle de ríos por id (uuid) o slug |
| GET | `/rivers/{idOrSlug}/nearby` | Público | Lugares cerca de este elemento |
| GET | `/rivers/{idOrSlug}/related` | Público | Ríos relacionados |
| GET | `/rivers/{idOrSlug}/reviews` | Público | Reseñas aprobadas de ríos |
| GET | `/rivers/facets` | Público | Facetas de ríos |
| GET | `/toll-routes` | Público | Listado de rutas con peaje |
| GET | `/toll-routes/{idOrSlug}` | Público | Detalle de rutas con peaje por id (uuid) o slug |

## tienda

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/cart` | Opcional (sesión) | Mi carrito (cuenta, o invitado con X-Cart-Token) |
| DELETE | `/cart` | Opcional (sesión) | Vacía el carrito |
| PUT | `/cart/coupon` | Opcional (sesión) | Aplica o quita un cupón del carrito |
| POST | `/cart/items` | Opcional (sesión) | Agrega un producto (valida talla, color y stock). Un invitado recibe `cart_token` la primera vez |
| PATCH | `/cart/items/{id}` | Opcional (sesión) | Cambia la cantidad |
| DELETE | `/cart/items/{id}` | Opcional (sesión) | Quita un artículo |
| POST | `/cart/merge` | Sesión | Al iniciar sesión, fusiona el carrito de invitado (X-Cart-Token) con el de la cuenta |
| POST | `/checkout/quote` | Opcional (sesión) | Subtotal, cupón, envío (gratis desde RD$ 2 500, si no RD$ 250), ITBIS incluido y total en DOP y USD |
| POST | `/coupons/validate` | Opcional (sesión) | Valida un cupón contra un subtotal |
| GET | `/me/orders` | Sesión | Mis pedidos |
| POST | `/orders` | Opcional (sesión) | Crea el pedido desde el carrito (Idempotency-Key obligatorio; descuenta stock con bloqueo; cobra con la pasarela) |
| GET | `/orders/{id}` | Opcional (sesión) | Detalle y seguimiento (token de invitado o sesión del titular) |
| POST | `/orders/{id}/cancel` | Opcional (sesión) | Cancela un pedido que aún no salió; reembolsa lo cobrado |
| POST | `/orders/{id}/return-request` | Opcional (sesión) | Solicita una devolución dentro de las 72 h de la entrega |
| GET | `/store/categories` | Público | Categorías con productos |
| GET | `/store/products` | Público | Catálogo de la tienda oficial |
| GET | `/store/products/{slug}` | Público | Detalle de un producto (precio en DOP y USD) |

## traducciones

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/i18n/dictionary/{locale}` | Público | Diccionario de la interfaz (con ETag; lo que falta cae al español) |
| GET | `/i18n/locales` | Público | Idiomas activos y cobertura de la interfaz |
