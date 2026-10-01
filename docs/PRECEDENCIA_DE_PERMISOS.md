# Precedencia de permisos

Regla única del portal para decidir si alguien puede hacer algo (Plan de accesos y paneles por perfil,
punto 20). Está escrita para que nadie tenga que inventar lógica ad hoc en un componente: si una pantalla
necesita saber qué mostrar, pregunta por **capacidades**; si un endpoint necesita autorizar, aplica las
capas de abajo en este orden.

## Las cuatro capas

| Orden | Capa | De dónde sale | Qué concede | Qué **no** concede |
|---|---|---|---|---|
| 1 | **Acceso anónimo** | No hay sesión | Ver contenido público y usar flujos de invitado con token acotado (reserva, pedido, carrito) | Nada que requiera identidad |
| 2 | **Rol global** | `user_roles` (`admin`, `editor`, `moderator`, `partner`, `ambassador`, `user`) | Capacidades transversales limitadas, definidas en `backend/src/modules/access/catalog.ts` | Permisos dentro de una organización, ni permiso sobre un recurso ajeno |
| 3 | **Membresía de organización** | `org_members` (`owner`, `admin`, `recepcion`, `guia`) | Operar los recursos **de esa organización** y solo dentro de ella | Un rol global; ni acceso a otra organización |
| 4 | **Permiso sobre el recurso** | Token de invitado, viaje compartido (`owner`/`editor`/`viewer`), asignación de servicio (`listing_ids`), propiedad de la fila | Exactamente ese recurso, con su vigencia | Cualquier otra cosa |

**Una capa nunca concede permisos de otra.** Ser `partner` no da acceso a una organización concreta: hay que
tener membresía vigente en ella. Ser creador aprobado no da acceso al panel de empresa. Tener un token de
invitado no da acceso a la cuenta.

## Cómo se combinan (algoritmo)

1. **Denegar por defecto.** Una ruta nueva sin `authenticate`/`requireRole`/guard de organización es un
   error, no una comodidad: `backend/test/security.test.ts` recorre el inventario real de rutas y falla si
   algo administrativo queda abierto o si una mutación sin autenticar no está en la lista de excepciones.
2. **Autenticación antes que validación.** Sin sesión, la respuesta es **401** aunque el cuerpo sea
   inválido; nunca 400/404/500 que revelen si el recurso existe.
3. **Rol global** (si la ruta lo exige) → **403** si no lo tiene. Con `REQUIRE_2FA_FOR_STAFF` (producción),
   el personal (`admin`, `editor`, `moderator`) necesita además el segundo factor en esa sesión → `MFA_REQUIRED`.
4. **Alcance de organización** → el guard resuelve la membresía en cada petición y la fila se contrasta con
   ella; si la fila es de otra organización, la respuesta es **404** (no 403): no se confirma que exista.
5. **Alcance de recurso** → token/rol de recurso, con caducidad y revocación propias.
6. **Cada endpoint vuelve a comprobar.** Ocultar un menú es comodidad de interfaz, jamás la defensa.

## Qué ve la interfaz

- La interfaz **no** deduce permisos: `GET /api/v1/me/context` devuelve los espacios disponibles y las
  capacidades efectivas con su fuente de decisión. Los menús se construyen con eso
  (`useAccessContext` → `can("capacidad")`).
- Cuando falta una capacidad, se muestra `AccessDeniedState` con el motivo y un siguiente paso; no se
  muestra un botón que vaya a fallar.
- Con datos simulados, las capacidades provienen de un contexto de demostración **etiquetado** (`demo: true`),
  nunca de roles reales.

## Reglas por perfil (resumen)

| Situación | Resultado |
|---|---|
| Visitante anónimo con token de reserva | Solo esa reserva, mientras el token viva |
| Viajero | Su cuenta, sus reservas, su progreso; nada de terceros |
| Empresa: owner/admin | Recursos de su organización, equipo y finanzas |
| Empresa: recepción | Reservas, calendario y mensajes de su organización; sin finanzas ni equipo |
| Empresa: guía | Solo los servicios asignados (`listing_ids`), en modo lectura operativa |
| Creador aprobado | Su contenido, sus métricas, sus cobros; sin permisos de empresa ni de administración |
| Embajador aprobado | Su código, sus referidos y sus comisiones; sin permisos de creador |
| Editor | Mesa editorial; no publica cambios sensibles ni toca cuentas, dinero o seguridad |
| Moderador | Cola de contenido de usuarios; sin cuentas, pagos ni configuración |
| Admin | Todo lo interno, con MFA, auditoría y doble aprobación en lo crítico |
| Soporte (impersonación) | Solo lectura, con banner visible, duración corta y auditoría por petición |

## Dónde vive cada cosa

- **Catálogo de capacidades y gobierno:** `backend/src/modules/access/catalog.ts` (publicado en
  `docs/CATALOGO_CAPACIDADES.md`).
- **Implementación de las capas:** `backend/src/plugins/auth.ts` (`authenticate`, `requireRole`) y el guard
  `org(...)` de `backend/src/modules/operators/routes.ts`.
- **Verificación continua:** `backend/test/security.test.ts`, `backend/test/access.test.ts`,
  `backend/test/operators-b.test.ts` y `backend/test/tasks-per-profile.test.ts`.
