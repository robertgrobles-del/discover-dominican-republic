# Plan de mejoras de accesos y paneles por perfil

## Propósito

Este plan parte de la revisión del panel, usuarios, roles y accesos de Descubre RD. Busca unificar la autorización real del servidor y crear experiencias visuales distintas para viajeros, empresas, influencers/creadores y personal interno. También define por separado a visitantes anónimos y miembros invitados.

El plan es de cambios propuestos; no implica que ya estén implementados. Los cambios locales revisados en esta sesión están en `backend/package.json`, `backend/package-lock.json` y `backend/scripts/seed-bulk.ts`; no alteran directamente los paneles ni la matriz de roles.

## Hallazgos que motivan el plan

1. El frontend administrativo llama a un cliente Supabase mock. En ese cliente, `has_role` devuelve `true` y `admin-entities` modifica datos mock: [client.ts](src/integrations/supabase/client.ts), [AdminPanel.tsx](src/pages/AdminPanel.tsx), [useAdminEntities.tsx](src/hooks/useAdminEntities.tsx).
2. Los endpoints reales de administración están en Fastify y usan roles distintos: [backend/src/modules/admin/users.ts](backend/src/modules/admin/users.ts), [backend/src/modules/admin/cms.ts](backend/src/modules/admin/cms.ts), [backend/src/modules/admin/moderation.ts](backend/src/modules/admin/moderation.ts).
3. El formulario actual de usuarios maneja un solo rol y no ofrece todos los roles del backend: [AdminUsuarios.tsx](src/components/admin/AdminUsuarios.tsx).
4. Conviven un panel legacy partner y el panel de operadores. El área de empresa necesita un solo punto de entrada con ámbito de organización: [PartnerDashboard.tsx](src/pages/PartnerDashboard.tsx), [OperatorPanel.tsx](src/modules/operadores/panel/OperatorPanel.tsx).
5. Fastify ya cuenta con perfiles de creador y embajador, además de invitaciones por organización. Deben mostrarse como experiencias diferentes, no como una etiqueta genérica de `partner`: [creators/routes.ts](backend/src/modules/creators/routes.ts), [ambassadors/routes.ts](backend/src/modules/ambassadors/routes.ts), [TeamService](backend/src/modules/operators/team.ts).

## Definición de perfiles

| Perfil | Identidad y acceso | Panel/entrada propuesta |
|---|---|---|
| Visitante anónimo | No tiene cuenta ni rol. Puede explorar contenido público y usar solo flujos de invitado con token de acceso acotado. | Portal público; entrada a `/login` o `/registro` cuando intente guardar o gestionar una reserva. |
| Viajero registrado | Rol global `user`; gestiona su perfil, favoritos, viajes, reseñas y actividad propia. | `/mi-cuenta` con secciones “Mis viajes”, “Reservas”, “Guardados” y “Pasaporte”. |
| Viajero jugador | Es el mismo rol global `user`, con inscripción/progreso de gamificación en su perfil. Los puntos, logros y nivel son estado de producto, no permisos. | Sección “Pasaporte y retos” dentro de `/mi-cuenta`; puede tener una vista dedicada `/gamificacion` enlazada desde allí. |
| Empresa/operador | Cuenta con organización propia o miembro de organización. Roles organizacionales: propietario, administrador, recepción o guía. | Un único `/panel-empresa`, con selector de organización si pertenece a más de una. |
| Influencer/creador | Perfil de creador revisable, con publicaciones, métricas, licencias y pagos propios. No obtiene permisos administrativos ni de empresa por ser creador. | Nuevo `/panel-creador` o entrada “Estudio de creador” desde `/creadores`. |
| Embajador afiliado | Perfil separado para códigos de referencia, ventas atribuibles y comisiones. No equivale a influencer ni editor. | `/panel-embajador`, basado en las rutas existentes `/ambassadors/me*`. |
| Administrador | Rol global `admin`; administración del sistema, acceso de usuarios y operaciones sensibles. MFA obligatorio. | `/admin`, consola interna completa. |
| Editor | Rol global `editor`; crea y actualiza borradores y trabaja el flujo editorial. No gestiona usuarios, pagos, claves ni seguridad. | `/admin/contenido`, mesa editorial. |
| Moderador | Rol global `moderator`; revisa contenido generado por usuarios y reportes, dentro de una política de alcance definida. No administra cuentas ni configuración. | `/admin/moderacion`, cola de revisión. |
| Invitado de empresa | No es un rol global. Es una invitación dirigida a email; al aceptarla se asocia el usuario a una organización con un rol de organización limitado. | Invitación expirable; tras aceptarla entra al panel de empresa con sus permisos. |
| Invitado de viaje | Colaborador `viewer` o `editor` sobre un viaje compartido; no hereda permisos globales ni de empresa. | Acceso al viaje invitado, con salida y revocación visibles. |

### Tipos de persona versus roles de acceso

No conviene crear un rol global para cada función que una persona usa. Separar estas dimensiones evita que gamificación, compras o participación comunitaria aumenten permisos por accidente:

- **Tipo de persona/producto:** visitante, viajero, jugador, comprador, reseñador, organizador de evento, creador o cliente empresarial. Describe tareas e interfaz.
- **Rol de acceso global:** `user`, `admin`, `editor`, `moderator` y, mientras existan rutas que lo requieran, `partner`/`ambassador`. Concede capacidades transversales limitadas.
- **Membresía y rol local:** empresa, organización, viaje, evento u otro recurso, con alcance y vigencia propios.
- **Estado de producto:** progreso, nivel, XP, badges, pasaporte, consentimientos, saldo promocional o estado de onboarding. No autoriza operaciones administrativas.

Por tanto, un registro normal puede ser simultáneamente viajero, jugador, comprador y reseñador sin recibir nuevos roles de seguridad. “Influencer/creador” se representa con su perfil y estado de aprobación; “embajador” es un programa afiliado separado. “Organizador” puede ser una capacidad de un miembro empresarial para administrar determinados eventos, no un rol global automático.

### Reglas de identidad

- La autorización se compone por capas: **rol global**, **membresía de organización** y **permiso sobre recurso**. Una capa no concede permisos de otra.
- `partner` no debe usarse como sustituto de pertenecer a una organización. La pertenencia se valida contra `org_members` y la organización solicitada.
- `ambassador` se reserva para afiliación. `creator` se modela con perfil y estado de aprobación; agregar un nuevo rol global solo si necesita rutas globales adicionales.
- Visitante anónimo no se guarda como rol `guest`. Los tokens de reserva de invitado autorizan únicamente la reserva concreta y con caducidad.
- Ser influencer, partner o miembro invitado nunca da acceso a `/admin`.

## Matriz de capacidades propuesta

| Capacidad | Anónimo | Viajero | Empresa: owner/admin | Recepción | Guía | Creador | Embajador | Editor | Moderador | Admin |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Explorar contenido público | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Sí |
| Gestionar perfil propio | No | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Sí |
| Gestionar reservas de una organización | No | No | Sí | Sí | Solo las asignadas | No | No | No | No | Lectura/soporte auditado |
| Editar organización y equipo | No | No | Owner; admin limitado | No | No | No | No | No | No | Solo soporte auditado |
| Crear/gestionar contenido propio de creador | No | No | No | No | No | Sí, solo propio | No | No | No | Moderación/administración |
| Consultar comisiones propias | No | No | Solo liquidación de su org | No | No | Si hay fuente aplicable, propia | Sí | No | No | Sí |
| Participar en gamificación y ver progreso propio | No | Sí (activar perfil de juego si hace falta) | Sí, como persona; sin poderes por ser empresa | Sí | Sí | Sí, como persona | Sí, como persona | Sí, como persona | Sí, como persona | Sí |
| Editar contenido editorial del portal | No | No | No | No | No | No | No | Sí, no publicar cambios sensibles | No | Sí |
| Moderar reseñas y UGC | No | No | No | No | No | No | No | No | Sí | Sí |
| Cambiar roles y configuración global | No | No | No | No | No | No | No | No | No | Sí, con MFA y auditoría |
| Suspender cuenta o reiniciar 2FA | No | No | No | No | No | No | No | No | Alcance definido | Sí, con motivo y auditoría |

**Nota:** “Admin” dentro de una organización no equivale a `admin` global. El acceso de soporte/impersonación sigue siendo de solo lectura y con auditoría, salvo el cierre de sesión.

## Plan de cambios

### Fase 0 — Cerrar la brecha de autorización (P0)

1. **[x] Desactivar mock en build productivo.** `VITE_APP_DATA_MODE=mock` debe estar permitido solo en local/demo; CI y build de producción fallan si aparece. Implementado sobre la variable real (`VITE_DATA_SOURCE`): `vite.config.ts` bloquea un build en modo `production` con datos simulados salvo autorización explícita `VITE_ALLOW_MOCK_BUILD=true`, el CI la declara de forma consciente y `npm run check:data-source` verifica además que ese build **falla** sin la autorización.
2. **[x] Eliminar `has_role => true`.** El modo mock devuelve usuario demo con capacidades explícitas de demo, no roles reales; nunca sirve para autorizar en despliegue. Implementado: `has_role` del cliente simulado falla cerrado (`false`), ya no lo usa ningún componente y la consola interna se autoriza con el contexto de demostración explícito y etiquetado (`demo: true`) de `src/lib/capabilities.ts`.
3. **[x] Conectar el frontend a Fastify.** Sustituir `supabase.functions.invoke("admin-entities")` y RPC simuladas por `/api/v1/admin/*`. Implementado para la administración de entidades: `src/lib/adminApi.ts` cubre las cinco operaciones contra `/api/v1/admin/<colección>` (mismo contrato que las fábricas `admin/tables.ts` y `admin/cms.ts`), traduce filtros y clasifica los errores; `useAdminEntities` usa esa capa con `VITE_DATA_SOURCE=api` y deja el camino simulado en una importación diferida, de modo que un build real ya no carga el cliente simulado. 7 pruebas en `src/test/admin-api.test.ts`. La migración del resto de consumidores del mock sigue el plan por fases (deuda D-01).
4. **Aplicar denegación por defecto.** Rutas API nuevas requieren autenticación y permiso; ningún control depende del nombre de ruta o de esconder un tab.
5. **[x] Asegurar acceso cruzado a organizaciones.** Cada lectura y mutación verifica el `org_id` de la fila contra la membresía válida del solicitante. Verificado: el guard `org()` resuelve la membresía en cada petición y expone `req.member` con `orgScope: true`; las consultas del panel filtran por esa organización (`bookings.ts:453`, `getForOrg` → 404 si la fila es ajena, `bookings.ts:200` rechaza reservas de mostrador de otra organización) y el aislamiento está probado en `operators-b.test.ts`.
6. **[x] Corregir reservas del panel empresa.** Filtrar en backend por organización; una cuenta de empresa solo ve sus reservas y no depende de una query global con RLS implícita. Verificado: `BookingService.listForOrg(orgId, …)` filtra `b.org_id = $1`, y el calendario y los ingresos usan la misma base.
7. **[x] Asegurar cierre de sesión al revocar permisos.** Cambiar rol, suspender, retirar una membresía o revocar invitación invalida las sesiones y accesos correspondientes. Verificado y reforzado: el cambio de roles, la suspensión, el reset de 2FA, el cambio de contraseña y la baja de cuenta revocan los tokens de refresco, y la revocación del cambio de roles se movió **dentro de la misma transacción** que el cambio (antes iba después del `COMMIT`); retirar una membresía corta el acceso al instante porque el guard de organización relee `org_members` en cada petición.
8. **[x] Serializar cambios de administrador.** Proteger la regla de último administrador dentro de transacción y con bloqueo; registrar el cambio de roles en la misma operación atómica. Verificado: `pg_advisory_xact_lock(ROLES_LOCK)` dentro de la transacción, comprobación del último administrador en el mismo bloque, auditoría con `auditInsert` y revocación de sesiones también dentro, todo en una sola operación atómica.
9. **[x] Exigir MFA de personal.** Mantener MFA en producción para admin/editor/moderator, bloquear operaciones sensibles con sesión sin segundo factor. Verificado: `REQUIRE_2FA_FOR_STAFF` se activa por defecto en producción y `requireRole` responde `MFA_REQUIRED` cuando el rol pertenece a `STAFF_ROLES` y la sesión no completó el segundo factor; el catálogo de capacidades marca además las 10 capacidades con MFA obligatorio.
10. **[x] Añadir pruebas negativas de acceso.** Cubrir anónimo, usuario normal, partner de otra organización, miembro invitado, guía no asignado, creador ajeno, editor y moderador. Verificado: `backend/test/security.test.ts` recorre el inventario real de rutas (401 sin sesión, 403 sin rol, guard de organización, roles de personal) y `operators-b.test.ts`, `tasks-per-profile.test.ts` y `access.test.ts` cubren el resto de perfiles.

### Fase 1 — Unificar cuentas, roles e invitaciones (P1)

11. **[x] Publicar catálogo de roles/capacidades desde backend.** La UI consume descripciones y permisos de una fuente común con versión. Implementado: `backend/src/modules/access/catalog.ts` (catálogo versionado con propósito, dueño, asignación, MFA y baja), servido por `GET /api/v1/admin/access/catalog` y `GET /api/v1/me/context` (con `catalog_version`), consumido por la consola interna y publicado además en `docs/CATALOGO_CAPACIDADES.md`.
12. **Actualizar el modelo de usuario del frontend.** Admitir arreglo de roles globales y mostrar estados de pertenencia organizacional por separado.
13. **Separar estado de cuenta y roles.** Mostrar activo, suspendido, borrado, email verificado y MFA en campos distintos; no inferir estado por un rol.
14. **Añadir flujo de aprobación de creador.** `creator_profile` tiene estados borrador, pendiente, aprobado, rechazado y suspendido con motivos y auditoría.
15. **Mantener embajador separado de creador.** Panel y soporte distinguen clics/referidos/comisiones de publicaciones/alcance/licencias.
16. **Consolidar invitaciones empresariales.** Enviar invitación a email, rol de organización, servicios asignados para guías, expiración, revocación y aceptación con cuenta del email invitado.
17. **Crear invitaciones para personal interno con límites.** Admin puede invitar editor/moderator; asignar admin requiere segundo aprobador y MFA reciente. Avance: asignar `admin` ya puede exigir segundo aprobador (`/admin/approvals` con `DUAL_APPROVAL_REQUIRED=true`). Pendiente: el flujo de invitación de personal por correo y la exigencia de MFA reciente.
18. **Definir invitaciones a viajes como acceso a recurso.** Compartir solo `viewer` o `editor` en el viaje, con vencimiento y revocación desde el propietario.
19. **[x] Normalizar suspensión y baja.** Una operación del servicio aplica estado, invalida sesiones, registra motivo y evita inconsistencias entre `users`, `profiles` y `user_suspensions`. Implementado: `auth` es el único escritor de `users`, `refresh_tokens` y `user_roles` (`IdentityAdminPort`); la suspensión y la reactivación aplican estado de cuenta, marca del perfil, `user_suspensions`, cierre de sesiones y auditoría en una sola transacción (`backend/src/modules/admin/users.ts`).
20. **Documentar la precedencia de permisos.** Reglas explícitas para rol global + organización + recurso; no combinar roles con lógica ad hoc en componentes.
20.a **[x] Mantener gamificación fuera de `app_role`.** El usuario que hace retos conserva `user`; progreso, elegibilidad y puntos pertenecen al dominio de gamificación.
20.b **[x] Definir acceso de gamificación por propietario.** Un usuario solo consulta/modifica su pasaporte, retos, logros y saldo; operaciones de corrección usan permisos de administración auditados.
20.c **[x] Separar XP, monedas de juego y dinero.** La UI etiqueta cada saldo, limita dónde se canjea y nunca los presenta como pago o comisión salvo que exista una conversión contractual.
20.d **[x] Añadir ajustes de privacidad de jugador.** Elegir visibilidad de ranking/perfil, ocultar nombre real y salir de tablas públicas cuando la regla del producto lo permita.
20.e **Añadir onboarding de jugador opcional.** Explicar cómo se ganan puntos y qué datos se guardan antes de participar; navegar el portal no debe exigir gamificación.
20.f **Distinguir acciones de jugador y de organizador de retos.** Cualquier campaña/retos que un partner patrocine se administra desde una capacidad empresarial aprobada, no desde el perfil de jugador.

### Fase 2 — Panel de empresa y equipo invitado (P1)

21. **[x] Retirar panel partner duplicado.** Redirigir `/partner/dashboard`, `/panel-empresa` y `/panel-negocio` a la experiencia canónica en `/operadores/panel`.
22. **[x] Crear selector de organización.** Si la persona pertenece a varias empresas, elegir contexto visible y conservarlo durante la sesión. Implementado: `SpaceSwitcher` en cabecera permite alternar organizaciones y contexto activo (`activeOrg`, `setActiveOrg`) persistido durante la sesión.
23. **[x] Diseñar resumen empresarial por trabajo.** Inicio con reservas por atender, calendario, mensajes, ingresos netos, ficha y estado de verificación. Implementado: `PanelHome.tsx` + `OrgHealthWidget.tsx` muestran métricas de salud empresarial, reservas por fecha/estado y accesos directos por trabajo.
24. **Separar estados comerciales de estados de reserva.** Badges, leyenda y filtros propios para pendiente, confirmada, cancelada y liquidada.
25. **[x] Crear bandeja de tareas con prioridad.** Solicitudes nuevas, pagos pendientes de datos, mensajes y documentos por completar. Implementado: `OrgHealthWidget` calcula checklist con prioridades (verificación legal, método de cobros, anuncios y equipo).
26. **[x] Mostrar rol y alcance siempre.** Cabecera indica organización, rol y permisos clave; guía ve sus servicios asignados de forma explícita. Implementado: `OperatorPanel` renderiza badge de rol (`ROLE_LABEL`), selector de org y restricción de navegación según `ALLOWED[role]`.
27. **[x] Diseñar vista de equipo.** Tabla con miembro, email, rol, servicios asignados, invitación/último acceso y estado; acciones según jerarquía. Implementado en `src/modules/operadores/panel/Equipo.tsx`.
28. **Añadir pantalla de invitación aceptada/expirada/revocada.** Explicar a qué organización y rol da acceso antes de confirmar.
29. **[x] Aplicar acceso guiado para recepción.** Navegación enfocada en reservas, calendario, solicitudes y mensajes; no mostrar finanzas ni equipo. Implementado: `ALLOWED["recepcion"]` limita las rutas visibles/navegables a reservas, calendario, solicitudes y mensajes.
30. **[x] Aplicar modo lectura para guías.** Mostrar agenda de excursiones asignadas, datos necesarios y contacto, sin acciones de precio o gestión. Implementado: `ALLOWED["guia"]` limita el alcance solo a calendario y reservas.
31. **Diseñar perfil público de empresa separado de cuenta.** Cuenta personal mantiene credenciales; empresa mantiene marca, datos, documentos y publicación.
32. **Mostrar seguridad y verificación empresarial.** Estado, documentos pendientes, última revisión y pasos faltantes sin exponer datos sensibles a otros miembros.

### Fase 3 — Estudio de influencer/creador y embajador (P1)

33. **[x] Crear panel de creador separado del panel empresa.** Disponible en `/creadores` (alias `/panel-creador`), enfocado en monetización UGC, métricas de video y patrocinios.
34. **[x] Crear onboarding de creador con revisión humana.** Componente `CreatorsOnboardingModal.tsx` con flujo por pasos (datos, red principal, portafolio, aceptación de términos UGC no exclusivos y datos de cobro).
35. **[x] Diseñar dashboard de contenido.** `CreatorsVideosTab.tsx` con tabla auditada de reproducciones cualificadas, enlaces a TikTok/Reels, reservas atribuidas y ganancias por pieza.
36. **[x] Separar métricas estimadas de ingresos confirmados.** Pestaña de retiros con desglose transparente entre saldo pendiente, confirmado y cobrable.
37. **[x] Crear biblioteca de campañas disponibles.** `CreatorsSponsorshipsTab.tsx` con briefs de hoteles patrocinadores (Puerto Plata, Samaná, Punta Cana) y asignación directa.
38. **[x] Crear flujo de propuesta y aprobación de contenido.** Envío de videos a moderación con estados visibles (Aprobado, Pendiente, Rechazado).
39. **[x] Crear consola de licencias de contenido.** Cuadro informativo y modal de términos de cesión de derechos no exclusiva y autoría para creadores.
40. **[x] Crear historial de ingresos y pagos del creador.** `CreatorsPayoutsTab.tsx` con solicitudes de retiro a PayPal / Banco y saldo mínimo claro.
41. **[x] Crear centro de identidad y reputación de creador.** Perfil público, categorías, idiomas, audiencia verificada y sellos con criterios publicados. Implementado: catálogo publicado de sellos y criterios en `backend/src/modules/creators/reputation.ts`, `GET/PATCH /api/v1/creators/me/identity`, perfil público con identidad en `GET /api/v1/creators/profile/:handle` y pestaña “Identidad y reputación” en `/creadores`.
42. **[x] Crear panel de embajador independiente.** Integrado en `/creadores` (alias `/panel-embajador`), con código de afiliado, atribución y retiros independientes de la creación de contenido.
43. **[x] Diseñar selector de perfil cuando hay varias capacidades.** Si una cuenta es empresa y creador, permitir cambiar de espacio; conservar permisos y contexto separados. Implementado: `SpaceSwitcher` en la cabecera, alimentado por `GET /api/v1/me/context` (espacios disponibles, organizaciones y capacidades); el espacio y la organización activa se conservan durante la sesión sin mezclar permisos.
44. **[x] Aplicar moderación y apelación de contenido.** Motivo, regla aplicable, revisión y apelación accesibles desde cada publicación afectada. Implementado: `creator_video` en la cola de moderación, `creator_video_appeals` con una sola apelación abierta por pieza, `POST /api/v1/creators/videos/:id/appeal`, `GET /admin/moderation/appeals`, `POST /admin/moderation/appeals/:id/resolve` y acción “Apelar” en cada fila de “Mis contenidos” con la regla aplicable y el motivo de la revisión. La publicación de un creador ya nace en `pending_review` en vez de publicarse sola.

### Fase 4 — Consola interna para admin, editor y moderador (P1)

45. **[x] Reemplazar tabs de 15 módulos por navegación por áreas.** Agrupadas en bloques temáticos (Consola Interna) en `AdminPanel.tsx`.
46. **[x] Crear home administrativo distinta por rol.** Cada persona ve trabajo pendiente de su ámbito, indicadores necesarios y enlaces de acción permitidos.
47. **[x] Crear mesa editorial para editores.** Borradores asignados, calendario, previsualización, historial de versiones, cambios y envío a revisión/publicación según política.
48. **[x] Establecer flujo de publicación.** Editor prepara; publicador autorizado revisa/publica; cambios críticos requieren una aprobación independiente.
49. **[x] Crear consola de moderación para moderadores.** Cola por antigüedad/riesgo, contexto limitado, acciones permitidas, plantillas de motivo y apelaciones.
50. **[x] Limitar vista de moderación a lo necesario.** Evitar acceso a email, datos de pago, configuración o historial privado no requerido por el caso.
51. **[x] Crear escritorio de usuarios solo para permisos autorizados.** Búsqueda paginada, filtros, estado, roles múltiples (incluyendo editor, moderador, partner, admin y usuario) y panel lateral con historial y acciones.
52. **[x] Separar acciones destructivas y financieras.** Doble confirmación, motivo obligatorio y resumen de impacto para roles, suspensión, payout, reembolso y reset de MFA.
53. **[x] Aplicar aprobación dual a privilegios críticos.** Conceder admin global, pago manual o reset de MFA requieren otra persona o flujo fuera de banda. Implementado en la API: `approval_requests` (migración `0061`) y `/admin/approvals`. Quien solicita no puede aprobar (lo impiden el servicio y una restricción de la base de datos); la solicitud vence a las 24 h; aprobar ejecuta la operación y deja `approval.requested`, `approval.approved` y la acción en la auditoría. Se activa con `DUAL_APPROVAL_REQUIRED=true`, que además niega las rutas directas; está apagada por omisión porque exige al menos dos personas administradoras. Cubre conceder `admin` (permanente o temporal), restablecer 2FA y marcar una liquidación como pagada. Pendiente: la pantalla en la consola.
54. **[x] Hacer audit log accesible desde cada acción.** Enlace a actor, hora, razón, recurso, resultado y request ID; proteger contra edición y exportación indebida.
55. **[x] Crear sesión de soporte como modo visible.** Banner persistente `SupportImpersonationBanner.tsx` (usuario objetivo, expiración, solo lectura y botón para terminarla). Ahora lee el estado real del servidor (`GET /api/v1/me/context` expone el actor de la impersonación desde el claim `imp`) y termina la sesión contra `POST /api/v1/auth/impersonation/end`; la vía por `sessionStorage` queda solo para el entorno simulado.
56. **[x] Crear tabla de accesos denegados.** Componente `AccessDeniedState.tsx` que muestra aviso de "no tienes permiso" con botón de solicitar acceso. Ya está integrado en la consola interna (denegación de personal sin capacidades) y en la pestaña de identidad de creador.
57. **[x] Retirar paneles mock de producción.** Banners de maqueta, métricas y pantallas de muestra se identifican como demo o quedan excluidos del build real. Implementado: aviso `MockDataNotice` visible cuando el origen de datos es simulado, capacidades de demostración explícitas en `src/lib/capabilities.ts` (nunca se usan con `VITE_DATA_SOURCE=api`) y el simulador de banners marcado `demoOnly` y cargado bajo demanda, de modo que en un build real su código no se descarga.
58. **[x] Definir navegación por capacidades en servidor.** El frontend usa el catálogo para mostrar menús; Fastify vuelve a comprobar permiso en cada endpoint. Implementado: `GET /api/v1/me/context` publica espacios y capacidades efectivas; `AdminPanel` construye sus pestañas desde ahí y cada endpoint conserva su `requireRole`/guard propio.

### Fase 5 — Sistema visual común y aceptación (P1/P2)

59. **[x] Crear un sistema de diseño para paneles.** Tipografía, color semántico, espaciado, tablas, filtros, formularios, badges, diálogos y estados compartidos.
60. **[x] Asignar identidad visual por espacio sin inventar productos separados.** Empresa (operación), creador (contenido/analítica), editor (flujo editorial), moderación (cola) y admin (control) comparten marca y componentes.
61. **[x] Optimizar admin para trabajo denso.** Navegación lateral plegable, encabezado compacto, búsqueda global y tablas con columnas configurables.
62. **[x] Optimizar empresa y creador para móvil.** Navegación inferior o tabs desplazables con tareas principales visibles y controles táctiles cómodos.
63. **[x] Diseñar estados vacíos con siguiente paso.** Componente `PanelEmptyState` reutilizable con explicación e instrucciones de acción.
64. **[x] Diseñar estados de carga, error y acceso insuficiente.** Componente `AccessDeniedState` y skeletons semánticos específicos sin filtrar detalles técnicos.
65. **[x] Mejorar accesibilidad de navegación por rol.** Teclado, foco, landmarks, etiquetas de tabla y lector de pantalla en tabs/menús/dialogs.
66. **[x] Diseñar auditoría visual de permisos.** Herramienta interna muestra rol, recurso, permiso y fuente de decisión para soporte autorizado. Implementado: pestaña “Auditoría de accesos” (`PermissionAuditPanel`) sobre `GET /api/v1/admin/access/audit`, que cruza el inventario real de rutas con el catálogo; la prueba `backend/test/access.test.ts` falla si una ruta autenticada queda sin capacidad declarada.
67. **[x] Instrumentar adopción por perfil sin registrar PII innecesaria.** Medir onboarding completado, tareas, abandono y errores por tipo de panel. Implementado: `src/lib/adoption.ts` (lista blanca de propiedades y consentimiento como condición), canal propio de paneles internos y agregado `GET /api/v1/admin/analytics/panel-adoption`; documentado en `docs/ADOPCION_POR_PERFIL.md`.
68. **[x] Probar las tareas por persona.** Empresa invita recepción; guía consulta su agenda; creador somete pieza; editor publica borrador; moderador resuelve reporte; admin cambia rol con control dual. Implementado en `backend/test/tasks-per-profile.test.ts`, con la tarea completa y su límite por persona.
69. **[x] Usar datos sintéticos etiquetados para demos.** Separar cuentas y datasets de demostración del entorno y registros reales. Implementado: migración `0057` con `is_synthetic`/`synthetic_batch` en las tablas de identidad y operación, seeds que etiquetan lo que crean, `npm run db:purge-synthetic` y `docs/DATOS_SINTETICOS.md`.
70. **[x] Publicar catálogo interno de capacidades.** Cada rol incluye propósito, dueño, quién lo asigna, requisitos MFA y proceso de baja. Implementado: catálogo versionado en `backend/src/modules/access/catalog.ts`, servido por `GET /api/v1/admin/access/catalog` y publicado en `docs/CATALOGO_CAPACIDADES.md`, que se genera desde el código y CI verifica que esté al día.

### Fase 6 — Cuenta, confianza y servicios para viajeros (P1/P2)

71. **[x] Crear un centro de seguridad de cuenta.** Mostrar sesiones y dispositivos activos, fecha de acceso, alertas de inicio de sesión y opción para cerrar sesiones remotas.
72. **[x] Permitir revocación inmediata de sesiones.** Cambio de contraseña, MFA, suspensión o actividad sospechosa invalida tokens según política y deja constancia auditable.
73. **[x] Ofrecer configuración de MFA y recuperación segura.** Métodos disponibles, códigos de recuperación de un solo uso y flujo de recuperación con verificación reforzada.
74. **[x] Añadir panel de privacidad y consentimientos.** Consultar y modificar preferencias, descargar datos y solicitar eliminación conforme a la política aplicable.
75. **[x] Unificar viajes, reservas y actividad propia.** Mostrar estado, próximos pasos, comprobantes y canal de ayuda sin exponer datos de otros viajeros.
76. **[x] Permitir reclamar una reserva de invitado.** Vincularla a una cuenta tras verificar el email y un token limitado, de un solo uso y con expiración. Implementado: tabla `booking_claim_tokens` (hash único, caducidad de 1 hora, `used_at`), `POST /api/v1/bookings/:id/claim/start` (responde 202 siempre, para no revelar si el email coincide), `GET /api/v1/bookings/claim/:token` (vista previa sin PII), `POST /api/v1/bookings/claim` (canje atómico de un solo uso, conflicto si la reserva ya es de otra cuenta) y página pública `/reclamar-reserva` (alias `/reservas/reclamar`).
77. **[x] Diseñar centro de notificaciones configurable.** Preferencias por tipo y canal, con opt-in separado cuando sea necesario y registro del consentimiento.
78. **[x] Definir una experiencia de cuenta multi-perfil.** Cambiar entre viajero, empresa, creador o embajador conservando organización y permisos separados, con indicador de contexto persistente. Implementado con el mismo mecanismo del punto 43: espacios servidos por `GET /api/v1/me/context`, selección e indicador persistente en la cabecera y organización activa guardada aparte para no mezclar contextos.

### Fase 7 — Espacios empresariales y operación de equipos (P1/P2)

79. **[x] Soportar sucursales y ubicaciones.** Cada ubicación tiene miembros, servicios, horarios y recursos propios, subordinados a una organización (componente `Sucursales.tsx` integrado en `/operadores/panel/sucursales`).
80. **[x] Limitar miembros por servicio y ubicación.** Recepción y guías solo acceden a las reservas y datos operativos necesarios para su asignación vigente (`permissions.ts` con ámbito restringido).
81. **Crear solicitudes para unirse a una organización.** El dueño o administrador revisa identidad, ámbito solicitado y rol antes de aprobar o rechazar.
82. **Incluir transferencia de propiedad empresarial.** Requerir aceptación del nuevo propietario, MFA reciente y auditoría; impedir dejar una organización sin responsable.
83. **[x] Agregar checklist de incorporación de empresa.** Verificación, datos públicos, servicios, pagos y equipo con estado y responsable visibles (componente `OrgHealthWidget.tsx` integrado en `/operadores/panel`).
84. **[x] Mostrar salud operativa del espacio.** Reservas pendientes, disponibilidad, pagos por conciliar y documentos vencidos con permisos acordes al rol.
85. **Definir administración delegada de eventos y retos.** Asignar capacidades acotadas a evento/campaña con fecha de vencimiento, sin crear roles globales innecesarios.
86. **[x] Cerrar y auditar membresías caducadas.** Revocar accesos al vencer contrato o invitación y facilitar revisión de miembros inactivos. Implementado: `org_members.expires_at` (migración `0060`); el dueño o un administrador fija el fin del acceso con `PATCH /org/team/members/:id`, el guard de organización ignora al instante una membresía vencida y el trabajo `org.access.expire` la retira, cierra las invitaciones caducadas y deja `org.member_expired` en la auditoría. El propietario no puede vencer (restricción en base de datos). Pendiente: la revisión de miembros inactivos.

### Fase 8 — Campañas, derechos y liquidaciones de creadores (P1/P2)

87. **Formalizar términos de cada campaña.** Brief, entregables, calendario, compensación, divulgación publicitaria, métricas y derechos antes de aceptar.
88. **Añadir contratos y aceptación versionados.** Registrar quién aceptó qué versión y cuándo; conservar evidencia asociada a la campaña.
89. **Crear registro de derechos por pieza.** Titular, licencia, medios, territorio, plazo, exclusividad y usos aprobados visibles para autor y personal autorizado.
90. **Separar el libro de ingresos por fuente.** Comisiones de embajador, pagos por contenido, bonificaciones y reembolsos se registran en conceptos distintos.
91. **Explicar atribución y ajustes.** Mostrar ventana, origen, estado estimado/confirmado y razón de reversos sin prometer ingresos no liquidados.
92. **Ofrecer disputa de campaña o liquidación.** Presentar evidencia, plazo y estado de revisión con acceso restringido al caso.
93. **Controlar caducidad y revocación de licencias.** Alertar antes de vencer y detener nuevos usos cuando el derecho ya no esté vigente.

### Fase 9 — Operaciones internas de mínimo privilegio (P1/P2)

94. **Definir capacidad de soporte de solo lectura.** Alcance por caso/usuario, duración corta, datos enmascarados por defecto y sin acceso a contraseñas ni credenciales.
95. **Definir analítica interna de solo lectura.** Acceso a métricas agregadas; enmascarar PII y limitar exportaciones por permiso y propósito.
96. **Asignar gestión de catálogo como capacidad acotada.** Permitir mantener categorías o fichas seleccionadas sin conceder administración de usuarios o seguridad.
97. **[x] Exigir doble aprobación para operaciones críticas.** Cambios de admin global, pagos manuales, cambios de beneficiario y recuperación/reset de MFA requieren actor y aprobador distintos. Implementado en la API: `approval_requests` (migración `0061`) y `/admin/approvals`. Quien solicita no puede aprobar (lo impiden el servicio y una restricción de la base de datos); la solicitud vence a las 24 h; aprobar ejecuta la operación y deja `approval.requested`, `approval.approved` y la acción en la auditoría. Se activa con `DUAL_APPROVAL_REQUIRED=true`, que además niega las rutas directas; está apagada por omisión porque exige al menos dos personas administradoras. Cubre cambios de admin global, pagos manuales (liquidaciones) y restablecimiento de MFA. Pendiente: el cambio de beneficiario de pagos, que aún no existe como operación, y la pantalla en la consola.
98. **[x] Crear una línea de tiempo de acceso por usuario.** Mostrar invitaciones, membresías, cambios de rol, sesiones revocadas y decisiones relevantes con retención definida. Implementado en la API: `GET /admin/users/:id/access-timeline` devuelve roles vigentes con vencimiento y motivo, organizaciones y los eventos de acceso de la auditoría (roles, suspensiones, 2FA, altas y bajas en organizaciones). Pendiente: la pantalla en la consola y definir la retención.
99. **[x] Programar revisiones periódicas de acceso.** Responsables confirman o retiran permisos de personal, empresas y proveedores; registrar fecha, decisión y justificación. Implementado para el personal en la API: `access_reviews` y `access_review_items` (migración `0062`) y `/admin/access-reviews`. Abrir una revisión toma una foto de los roles globales; cada acceso se confirma o se retira con justificación obligatoria, nadie revisa los suyos y no se puede retirar al último administrador. Retirar quita el rol y cierra las sesiones en la misma transacción. El trabajo `access.reviews.schedule` abre una revisión cada 90 días desde el cierre de la anterior y recuerda las vencidas. Pendiente: revisiones de equipos de empresa y proveedores, y la pantalla en la consola.
100. **[x] Hacer temporales los privilegios elevados.** Justificación, alcance, vencimiento automático y notificación antes de expirar; evitar permisos permanentes por conveniencia. Implementado para roles globales no administrativos: `POST /admin/users/:id/roles/temporary` exige motivo y duración (máx. 30 días); el rol vencido deja de entrar en los tokens al instante y el trabajo `access.roles.expire` avisa 24 h antes, lo retira, cierra sesiones y lo audita. `admin` temporal se concede por `/admin/approvals` con doble aprobación.

## Orden de despliegue

1. **Bloqueo de producción:** impedir el mock y revisar roles/RLS/endpoints antes de habilitar el panel real.
2. **Contrato de identidad:** aprobar matriz de permisos, definir `creator` como perfil/estado separado de `ambassador` y escoger rutas canónicas.
3. **API y sesión:** conectar frontend con Fastify, validar organización/recurso, revocar sesiones y registrar auditoría.
4. **Panel empresa y equipo:** migrar desde las pantallas partner duplicadas e introducir invitaciones con alcance organizacional.
5. **Experiencias internas:** habilitar paneles editor y moderador de menor privilegio antes de ampliar acciones de admin.
6. **Creator studio:** lanzar por invitación/piloto, medir valor y mantener pagos separados de la analítica de contenido.
7. **Activación gradual:** probar con cuentas sintéticas, grupo cerrado y monitoreo; retirar mock al completar migración.
8. **Cuenta y seguridad del viajero:** habilitar centro de sesiones, MFA, privacidad y reclamación segura de reservas.
9. **Escala empresarial:** incorporar ubicaciones, permisos por servicio, solicitudes de acceso y transferencia de propiedad.
10. **Gobierno de campañas:** publicar términos/versiones, derechos de contenido y libro separado de liquidaciones.
11. **Operación interna reforzada:** introducir soporte/analítica de solo lectura, revisiones de acceso y privilegios temporales/duales.

## Criterios de aceptación del plan

- Ningún usuario no autorizado puede acceder a datos cambiando la URL, el ID o el cuerpo de una solicitud.
- Una empresa solo ve recursos de organizaciones donde tiene membresía vigente; guías solo ven recursos asignados.
- Influencer/creador, embajador, partner/empresa y viajero se muestran como perfiles distintos con funciones y términos claros.
- Anónimo, miembro invitado, usuario registrado y trabajador interno tienen flujos separados de invitación, acceso y revocación.
- Editor y moderador acceden a sus herramientas sin recibir permisos de administración financiera o seguridad global.
- La interfaz muestra acciones disponibles según capacidad, pero cada acción se valida de nuevo en Fastify.
- Cambios de rol o membresía quedan auditados y se aplican al acceso de sesión dentro del tiempo acordado.
- El último administrador no se puede retirar por operación concurrente; las operaciones privilegiadas tienen control dual.
- Todos los paneles tienen versión móvil, accesible, estados vacíos/de error y métricas reales provenientes del servicio correspondiente.
- Las sesiones y permisos revocados dejan de funcionar dentro del SLA acordado; la persona puede revisar y cerrar sus sesiones.
- El acceso a sucursales, servicios y recursos empresariales se valida por organización y asignación en cada endpoint.
- Campañas y licencias guardan términos aceptados, vigencia y alcance; ingresos de creador y embajador no se mezclan.
- Soporte y analítica aplican mínimo privilegio, enmascaramiento y auditoría; operaciones críticas requieren aprobación independiente.
- Invitaciones, elevaciones temporales y revisiones de acceso tienen expiración o resolución explícita y trazable.

## Estado de la tanda implementada (puntos 41, 43, 44, 55-58, 66-70, 76 y 78)

**Qué se entregó**

- **Servidor como fuente de verdad de los permisos:** `backend/src/modules/access/catalog.ts` (23 capacidades con propósito, dueño, quién las asigna, MFA y baja), `GET /api/v1/me/context` (espacios + capacidades efectivas + sesión de soporte), `GET /api/v1/admin/access/catalog` y `GET /api/v1/admin/access/audit` (inventario real de rutas × catálogo).
- **Creación y apelación de contenido de creador:** identidad y reputación (`reputation.ts`, sellos con criterios publicados, `GET/PATCH /creators/me/identity`), moderación de `creator_video` en la cola existente y apelaciones de un solo uso abierto por pieza.
- **Reclamación de reservas de invitado:** tabla y endpoints de un solo uso, plantilla de correo `booking.claim` y página pública.
- **Entorno de desarrollo:** navegación por capacidades, aviso de modo simulado, auditoría visual de permisos, adopción por perfil sin PII, datos sintéticos etiquetados, pruebas de tareas por persona y catálogo publicado generado desde el código.

**Verificación**

- `npx tsc -p tsconfig.app.json --noEmit` y `npx tsc --noEmit` (backend): sin errores.
- Pruebas nuevas de backend: `test/access.test.ts`, `test/creators-appeals.test.ts`, `test/booking-claim.test.ts`, `test/synthetic-data.test.ts`, `test/tasks-per-profile.test.ts` y el bloque de adopción en `test/analytics.test.ts`, todos registrados en `backend/vitest.config.ts`.
- CI del backend verifica además que `docs/CATALOGO_CAPACIDADES.md` esté al día.

**Pendientes conocidos (no bloquean lo anterior)**

- **La interfaz todavía no puede correr contra Fastify**: con `VITE_DATA_SOURCE=api` el cliente `src/integrations/supabase/client.ts` falla de forma cerrada porque el portal sigue sobre datos simulados, y `fastifyClient` no añade la cabecera de autorización (deudas D-01 y D-02 de `docs/DEUDA_FRONTEND.md`). Todo el frontend nuevo consume el contrato real y degrada a un contexto de demostración etiquetado; cuando se cierre esa migración no hay que reescribir componentes.
- **Las pruebas de integración de backend requieren Postgres** en `TEST_DATABASE_URL` (puerto 5434). En este entorno el motor rechaza el segmento de memoria compartida, así que deben ejecutarse fuera del confinamiento: `cd backend && npm test`.
