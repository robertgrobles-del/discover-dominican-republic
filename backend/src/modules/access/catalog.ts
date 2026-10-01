/**
 * Catálogo interno de capacidades (Plan de accesos y paneles por perfil, Fase 5: puntos 58, 66 y 70).
 *
 * Es la única fuente de verdad de "quién puede qué" en la interfaz: el frontend no decide por sí
 * mismo si muestra un menú (el servidor le dice qué capacidades tiene) y el inventario de rutas
 * (`app.routeTable`, ver `backend/src/app.ts`) se contrasta contra este catálogo para que una ruta
 * nueva sin capacidad declarada salte en las pruebas (`backend/test/access.test.ts`).
 *
 * Autorización por capas, nunca por nombres de ruta escondidos:
 *   - `rol_global`                 → `user_roles` (admin, editor, moderator, partner, ambassador, user)
 *   - `pertenencia_organizacion`   → `org_members` (owner, admin, recepcion, guia)
 *   - `perfil_de_producto`         → estado de creador aprobado, embajador aprobado, membresía
 *   - `permiso_de_recurso`         → token de reserva, viaje compartido, asignación de servicio
 *
 * Cada capacidad publica además su gobierno (dueño, quién la asigna, si exige MFA y cómo se da de baja),
 * que es lo que alimenta el catálogo interno y la auditoría visual de permisos.
 */

/** Sube este valor cuando cambie cualquier definición: la interfaz lo compara para avisar de catálogos desfasados. */
export const CATALOG_VERSION = "2026.10.1";

export type PanelKey =
  | "publico"
  | "viajero"
  | "empresa"
  | "creador"
  | "embajador"
  | "editorial"
  | "moderacion"
  | "admin";

export type CapabilitySource =
  | "publico"
  | "rol_global"
  | "pertenencia_organizacion"
  | "perfil_de_producto"
  | "permiso_de_recurso";

export interface CapabilityDefinition {
  key: string;
  label: string;
  purpose: string;
  panel: PanelKey;
  source: CapabilitySource;
  /** Roles globales (`app_role`) que la conceden. Vacío = no depende de un rol global. */
  global_roles: string[];
  /** Roles organizacionales (`org_members.role`) que la conceden dentro del panel de empresa. */
  org_roles: string[];
  /** Recursos o pantallas que cubre, para la auditoría visual. */
  resources: string[];
  owner: string;
  assigned_by: string;
  mfa_required: boolean;
  revocation: string;
}

export const CAPABILITIES: CapabilityDefinition[] = [
  {
    key: "content.explore",
    label: "Explorar contenido público",
    purpose: "Navegar el catálogo, el buscador y el mapa sin cuenta ni rol.",
    panel: "publico",
    source: "publico",
    global_roles: [],
    org_roles: [],
    resources: ["catálogo público", "buscador", "mapa interactivo", "contenido editorial"],
    owner: "Producto",
    assigned_by: "No se asigna: es acceso anónimo",
    mfa_required: false,
    revocation: "No aplica",
  },
  {
    key: "account.self_service",
    label: "Gestionar la cuenta propia",
    purpose: "Perfil, preferencias, favoritos, notificaciones y exportación de datos propios.",
    panel: "viajero",
    source: "rol_global",
    global_roles: ["user", "partner", "ambassador", "editor", "moderator", "admin"],
    org_roles: [],
    resources: ["/me/profile", "/me/preferences", "/me/favorites", "/me/notifications", "/me/export"],
    owner: "Producto",
    assigned_by: "Se concede al registrarse (rol `user`)",
    mfa_required: false,
    revocation: "Se retira al suspender, borrar la cuenta o cerrar sesión",
  },
  {
    key: "account.authentication",
    label: "Autenticarse y administrar credenciales",
    purpose: "Entrar, cerrar sesión, verificar correo, recuperar contraseña y gestionar el segundo factor.",
    panel: "viajero",
    source: "rol_global",
    global_roles: ["user", "partner", "ambassador", "editor", "moderator", "admin"],
    org_roles: [],
    resources: ["/auth/login", "/auth/register", "/auth/2fa", "/auth/sessions"],
    owner: "Seguridad",
    assigned_by: "Automático por cuenta",
    mfa_required: false,
    revocation: "Se invalida al cambiar contraseña, suspender la cuenta o revocar la sesión",
  },
  {
    key: "traveler.bookings",
    label: "Gestionar reservas y pedidos propios",
    purpose: "Reservar, pagar el saldo, cambiar fecha, cancelar y consultar comprobantes propios.",
    panel: "viajero",
    source: "rol_global",
    global_roles: ["user", "partner", "ambassador", "editor", "moderator", "admin"],
    org_roles: [],
    resources: ["/me/bookings", "/bookings/:id", "/orders", "/cart", "/trips", "/me/tickets"],
    owner: "Producto",
    assigned_by: "Automático por cuenta (o token de invitado para una reserva concreta)",
    mfa_required: false,
    revocation: "Al cerrar sesión; el token de invitado caduca con la reserva",
  },
  {
    key: "traveler.ai_tools",
    label: "Usar las herramientas de IA del viajero",
    purpose: "Chat, itinerarios, recomendaciones y traducción, dentro de la cuota diaria.",
    panel: "viajero",
    source: "rol_global",
    global_roles: ["user", "partner", "ambassador", "editor", "moderator", "admin"],
    org_roles: [],
    resources: ["/ai/chat", "/ai/itinerary", "/ai/recommendations", "/ai/quota"],
    owner: "Producto",
    assigned_by: "Automático por cuenta; el personal interno tiene cuota ampliada",
    mfa_required: false,
    revocation: "Apagando la bandera `ai_chat_enabled` o al suspender la cuenta",
  },
  {
    key: "traveler.memberships",
    label: "Membresías, entradas y eventos",
    purpose: "Suscribirse a un plan, comprar entradas de eventos y validar códigos de acceso.",
    panel: "viajero",
    source: "rol_global",
    global_roles: ["user", "partner", "ambassador", "editor", "moderator", "admin"],
    org_roles: [],
    resources: ["/memberships/subscribe", "/memberships/me", "/events/:id/tickets/purchase"],
    owner: "Negocio",
    assigned_by: "Automático por cuenta (la compra genera la membresía)",
    mfa_required: false,
    revocation: "Al vencer la membresía o reembolsarse la compra",
  },
  {
    key: "community.participate",
    label: "Participar en la comunidad",
    purpose: "Reseñar, comentar, publicar en el feed y responder campañas y formularios.",
    panel: "viajero",
    source: "rol_global",
    global_roles: ["user", "partner", "ambassador", "editor", "moderator", "admin"],
    org_roles: [],
    resources: ["/reviews", "/social", "/campaigns", "/forms", "/media/upload-url"],
    owner: "Comunidad",
    assigned_by: "Automático por cuenta (sujeto a moderación y banderas antifraude)",
    mfa_required: false,
    revocation: "Al suspender la cuenta o aplicar una bandera antifraude",
  },
  {
    key: "gamification.self",
    label: "Pasaporte, retos y coleccionables propios",
    purpose: "Ver y avanzar el progreso de juego propio; nunca concede permisos administrativos.",
    panel: "viajero",
    source: "rol_global",
    global_roles: ["user", "partner", "ambassador", "editor", "moderator", "admin"],
    org_roles: [],
    resources: ["/passport/me", "/gamification/routes", "/collectibles/me"],
    owner: "Producto",
    assigned_by: "Se activa al participar (estado de producto, no rol de seguridad)",
    mfa_required: false,
    revocation: "Al restablecer el progreso o darse de baja del ranking",
  },
  {
    key: "org.bookings_manage",
    label: "Gestionar reservas de la organización",
    purpose: "Atender, confirmar, cobrar y documentar las reservas de la organización activa.",
    panel: "empresa",
    source: "pertenencia_organizacion",
    global_roles: ["partner", "admin"],
    org_roles: ["owner", "admin", "recepcion", "guia"],
    resources: ["/org/bookings", "/org/calendar", "/org/income", "/org/promotions"],
    owner: "Operaciones",
    assigned_by: "El propietario o un administrador de la organización invita al miembro",
    mfa_required: false,
    revocation: "Al retirar la membresía, vencer la invitación o suspender la organización",
  },
  {
    key: "org.team_manage",
    label: "Editar la organización y su equipo",
    purpose: "Datos de la empresa, servicios, tarifas, sucursales y miembros con su rol y alcance.",
    panel: "empresa",
    source: "pertenencia_organizacion",
    global_roles: ["partner", "admin"],
    org_roles: ["owner", "admin"],
    resources: ["/org/team", "/org/team-invitations", "/org/listings", "/org/branches"],
    owner: "Operaciones",
    assigned_by: "Solo el propietario asigna administradores; el propietario lo transfiere otro propietario",
    mfa_required: false,
    revocation: "Al retirar la membresía o transferir la propiedad; el último propietario no se puede retirar",
  },
  {
    key: "org.challenges_manage",
    label: "Campañas y retos patrocinados por la organización",
    purpose: "Crear y administrar campañas o retos que la organización patrocina, con su presupuesto y vigencia.",
    panel: "empresa",
    source: "pertenencia_organizacion",
    global_roles: ["partner", "admin"],
    org_roles: ["owner", "admin"],
    resources: ["campañas patrocinadas", "retos de marca", "presupuesto de campaña"],
    owner: "Marketing",
    assigned_by: "El propietario o un administrador de la organización",
    mfa_required: false,
    revocation: "Al retirar la membresía o vencer la campaña",
  },
  {
    key: "creator.studio",
    label: "Estudio de creador y contenido propio",
    purpose: "Onboarding de creador, publicaciones propias, métricas, licencias y cobros propios.",
    panel: "creador",
    source: "perfil_de_producto",
    global_roles: ["user", "partner", "ambassador", "editor", "moderator", "admin"],
    org_roles: [],
    resources: ["/creators/me", "/creators/videos", "/creators/onboarding"],
    owner: "Programa de creadores",
    assigned_by: "Se solicita en el onboarding y lo aprueba el equipo del programa",
    mfa_required: false,
    revocation: "Al suspender el perfil de creador (`creator_profiles.status`), sin tocar el rol global",
  },
  {
    key: "ambassador.program",
    label: "Programa de embajadores",
    purpose: "Código de referencia, ventas atribuidas, comisiones y retiros propios.",
    panel: "embajador",
    source: "perfil_de_producto",
    global_roles: ["user", "partner", "ambassador", "editor", "moderator", "admin"],
    org_roles: [],
    resources: ["/ambassadors/me", "/ambassadors/me/referrals", "/ambassadors/me/payouts"],
    owner: "Afiliados",
    assigned_by: "Se solicita con correo verificado y lo aprueba el equipo de afiliados",
    mfa_required: false,
    revocation: "Al suspender la afiliación; se retira el rol `ambassador` en el mismo paso",
  },
  {
    key: "editorial.content",
    label: "Mesa editorial del portal",
    purpose: "Preparar y actualizar borradores, previsualizar y enviar a revisión; publicar según política.",
    panel: "editorial",
    source: "rol_global",
    global_roles: ["admin", "editor"],
    org_roles: [],
    resources: ["/admin/<colección>", "/admin/seo_redirections", "/admin/settings (lectura)"],
    owner: "Contenido",
    assigned_by: "Un administrador invita como editor (doble aprobación para `admin`)",
    mfa_required: true,
    revocation: "Al retirar el rol `editor`; las sesiones se invalidan al aplicarlo",
  },
  {
    key: "moderation.queue",
    label: "Cola de moderación de contenido de usuarios",
    purpose: "Revisar reseñas, publicaciones, comentarios, fotos, reportes y apelaciones dentro del alcance.",
    panel: "moderacion",
    source: "rol_global",
    global_roles: ["admin", "moderator"],
    org_roles: [],
    resources: ["/admin/moderation/queue", "/admin/moderation/reports", "/admin/user-flags", "/admin/photo-submissions"],
    owner: "Confianza y seguridad",
    assigned_by: "Un administrador invita como moderador",
    mfa_required: true,
    revocation: "Al retirar el rol `moderator`; no concede acceso a cuentas, pagos ni configuración",
  },
  {
    key: "admin.accounts",
    label: "Administración de cuentas y roles",
    purpose: "Buscar cuentas, ver su estado, cambiar roles, suspender y restablecer accesos.",
    panel: "admin",
    source: "rol_global",
    global_roles: ["admin"],
    org_roles: [],
    resources: ["/admin/users", "/admin/ambassadors", "/admin/verifications", "/admin/approvals", "/admin/access-reviews"],
    owner: "Seguridad",
    assigned_by: "Otro administrador con segundo aprobador y MFA reciente",
    mfa_required: true,
    revocation: "Al retirar el rol `admin`; la regla del último administrador impide dejar el sistema sin ninguno",
  },
  {
    key: "admin.global_config",
    label: "Configuración global y operación interna",
    purpose: "Ajustes del sitio, banderas de función, reglas de IP, trabajos programados y salud del sistema.",
    panel: "admin",
    source: "rol_global",
    global_roles: ["admin"],
    org_roles: [],
    resources: ["/admin/settings", "/admin/system", "/admin/ip-rules", "/admin/jobs", "/admin/live", "/admin/calculators"],
    owner: "Infraestructura",
    assigned_by: "Otro administrador con doble aprobación",
    mfa_required: true,
    revocation: "Al retirar el rol `admin`; toda operación queda en la bitácora encadenada",
  },
  {
    key: "admin.finance",
    label: "Operaciones financieras",
    purpose: "Liquidaciones, pagos manuales, reembolsos y ajustes de saldo con motivo obligatorio.",
    panel: "admin",
    source: "rol_global",
    global_roles: ["admin"],
    org_roles: [],
    resources: ["/admin/payouts", "/admin/store/orders", "/admin/discount_coupons", "/admin/creators/:id/payout"],
    owner: "Finanzas",
    assigned_by: "Otro administrador; los pagos manuales exigen actor y aprobador distintos",
    mfa_required: true,
    revocation: "Al retirar el rol `admin`; el historial de pagos no se borra al retirarlo",
  },
  {
    key: "admin.content_ops",
    label: "Operación de contenido e importaciones",
    purpose: "Importar catálogos, generar contenido con IA, campañas de patrocinio y correo transaccional.",
    panel: "admin",
    source: "rol_global",
    global_roles: ["admin", "editor"],
    org_roles: [],
    resources: ["/admin/imports", "/admin/ai", "/admin/sponsorship", "/admin/email"],
    owner: "Contenido",
    assigned_by: "Un administrador; el editor solo accede a lo que no toca cuentas ni dinero",
    mfa_required: true,
    revocation: "Al retirar el rol correspondiente",
  },
  {
    key: "admin.audit_read",
    label: "Lectura de la bitácora de auditoría",
    purpose: "Consultar quién hizo qué, cuándo y con qué resultado; verificar la cadena de hashes.",
    panel: "admin",
    source: "rol_global",
    global_roles: ["admin"],
    org_roles: [],
    resources: ["/admin/audit", "/admin/audit/verify", "/admin/audit-logs"],
    owner: "Seguridad",
    assigned_by: "Otro administrador",
    mfa_required: true,
    revocation: "Al retirar el rol `admin`; la bitácora es de solo anexado",
  },
  {
    key: "admin.access_catalog",
    label: "Catálogo y auditoría de permisos",
    purpose: "Consultar el catálogo de capacidades y el inventario de rutas con su fuente de decisión.",
    panel: "admin",
    source: "rol_global",
    global_roles: ["admin"],
    org_roles: [],
    resources: ["/admin/access/catalog", "/admin/access/audit"],
    owner: "Seguridad",
    assigned_by: "Otro administrador",
    mfa_required: true,
    revocation: "Al retirar el rol `admin`",
  },
  {
    key: "admin.panel_modules",
    label: "Módulos internos sin capacidad específica",
    purpose: "Cobertura declarada para las colecciones del CMS y módulos internos agrupados por colección.",
    panel: "admin",
    source: "rol_global",
    global_roles: ["admin", "editor", "moderator"],
    org_roles: [],
    resources: ["/admin/<colección>"],
    owner: "Seguridad",
    assigned_by: "Se hereda del rol que ya exige la ruta; sirve para que ninguna ruta quede sin declarar",
    mfa_required: true,
    revocation: "Al retirar el rol correspondiente",
  },
  {
    key: "support.readonly",
    label: "Soporte de solo lectura por caso",
    purpose: "Mirar la sesión de otra cuenta con banner visible, sin escrituras y con auditoría por petición.",
    panel: "admin",
    source: "rol_global",
    global_roles: ["admin"],
    org_roles: [],
    resources: ["/admin/support", "/admin/support-sessions", "/admin/users/:id/impersonate"],
    owner: "Soporte",
    assigned_by: "Un administrador, por caso y con duración corta (15 minutos)",
    mfa_required: true,
    revocation: "Caduca sola o al cerrarla; la sesión de soporte solo puede terminar, nunca escribir",
  },
  {
    key: "authenticated.self_service",
    label: "Servicios autenticados de alcance propio",
    purpose: "Cobertura declarada para rutas autenticadas cuyo alcance lo fija el propio recurso (token, viaje, asignación).",
    panel: "viajero",
    source: "permiso_de_recurso",
    global_roles: ["user", "partner", "ambassador", "editor", "moderator", "admin"],
    org_roles: [],
    resources: ["cualquier ruta autenticada no listada arriba"],
    owner: "Seguridad",
    assigned_by: "Automático por sesión válida",
    mfa_required: false,
    revocation: "Al cerrar la sesión o revocarse el token",
  },
];

/**
 * Mapa ruta→capacidad. Se evalúa por prefijo más largo, así que el orden de esta lista no importa:
 * una ruta concreta siempre gana sobre el prefijo general.
 */
export const ROUTE_CAPABILITIES: { prefix: string; capability: string }[] = [
  { prefix: "/api/v1/admin/access", capability: "admin.access_catalog" },
  { prefix: "/api/v1/admin/users", capability: "admin.accounts" },
  { prefix: "/api/v1/admin/approvals", capability: "admin.accounts" },
  { prefix: "/api/v1/admin/access-reviews", capability: "admin.accounts" },
  { prefix: "/api/v1/admin/ambassadors", capability: "admin.accounts" },
  { prefix: "/api/v1/admin/verifications", capability: "admin.accounts" },
  { prefix: "/api/v1/admin/support-sessions", capability: "support.readonly" },
  { prefix: "/api/v1/admin/support", capability: "support.readonly" },
  { prefix: "/api/v1/auth/impersonation", capability: "support.readonly" },
  { prefix: "/api/v1/admin/moderation", capability: "moderation.queue" },
  { prefix: "/api/v1/admin/user-flags", capability: "moderation.queue" },
  { prefix: "/api/v1/admin/photo-submissions", capability: "moderation.queue" },
  { prefix: "/api/v1/admin/photo-challenges", capability: "moderation.queue" },
  { prefix: "/api/v1/admin/audit", capability: "admin.audit_read" },
  { prefix: "/api/v1/admin/payouts", capability: "admin.finance" },
  { prefix: "/api/v1/admin/store", capability: "admin.finance" },
  { prefix: "/api/v1/admin/discount_coupons", capability: "admin.finance" },
  { prefix: "/api/v1/admin/creators", capability: "admin.finance" },
  { prefix: "/api/v1/admin/imports", capability: "admin.content_ops" },
  { prefix: "/api/v1/admin/ai", capability: "admin.content_ops" },
  { prefix: "/api/v1/admin/sponsorship", capability: "admin.content_ops" },
  { prefix: "/api/v1/admin/email", capability: "admin.content_ops" },
  { prefix: "/api/v1/admin/seo_redirections", capability: "editorial.content" },
  { prefix: "/api/v1/admin/settings", capability: "admin.global_config" },
  { prefix: "/api/v1/admin/system", capability: "admin.global_config" },
  { prefix: "/api/v1/admin/ip-rules", capability: "admin.global_config" },
  { prefix: "/api/v1/admin/jobs", capability: "admin.global_config" },
  { prefix: "/api/v1/admin/live", capability: "admin.global_config" },
  { prefix: "/api/v1/admin/calculators", capability: "admin.global_config" },
  { prefix: "/api/v1/admin", capability: "admin.panel_modules" },
  { prefix: "/api/v1/org/team", capability: "org.team_manage" },
  { prefix: "/api/v1/team-invitations", capability: "org.team_manage" },
  { prefix: "/api/v1/org", capability: "org.bookings_manage" },
  { prefix: "/api/v1/creators", capability: "creator.studio" },
  { prefix: "/api/v1/ambassadors", capability: "ambassador.program" },
  { prefix: "/api/v1/gamification", capability: "gamification.self" },
  { prefix: "/api/v1/passport", capability: "gamification.self" },
  { prefix: "/api/v1/collectibles", capability: "gamification.self" },
  { prefix: "/api/v1/media", capability: "community.participate" },
  { prefix: "/api/v1/reviews", capability: "community.participate" },
  { prefix: "/api/v1/social", capability: "community.participate" },
  { prefix: "/api/v1/campaigns", capability: "community.participate" },
  { prefix: "/api/v1/forms", capability: "community.participate" },
  { prefix: "/api/v1/memberships", capability: "traveler.memberships" },
  { prefix: "/api/v1/events", capability: "traveler.memberships" },
  { prefix: "/api/v1/bookings", capability: "traveler.bookings" },
  { prefix: "/api/v1/orders", capability: "traveler.bookings" },
  { prefix: "/api/v1/trips", capability: "traveler.bookings" },
  { prefix: "/api/v1/tickets", capability: "traveler.bookings" },
  { prefix: "/api/v1/cart", capability: "traveler.bookings" },
  { prefix: "/api/v1/checkout", capability: "traveler.bookings" },
  { prefix: "/api/v1/coupons", capability: "traveler.bookings" },
  { prefix: "/api/v1/ai", capability: "traveler.ai_tools" },
  { prefix: "/api/v1/notifications", capability: "account.self_service" },
  { prefix: "/api/v1/me", capability: "account.self_service" },
  { prefix: "/api/v1/users", capability: "account.self_service" },
  { prefix: "/api/v1/auth", capability: "account.authentication" },
  { prefix: "/api/v1", capability: "authenticated.self_service" },
];

/** Espacios de producto que una misma cuenta puede tener abiertos a la vez (puntos 43 y 78). */
export interface SpaceDefinition {
  key: "viajero" | "empresa" | "creador" | "embajador" | "editorial" | "moderacion" | "admin";
  label: string;
  description: string;
  route: string;
  /** Cómo se obtiene el espacio: rol global, membresía o perfil de producto. */
  source: CapabilitySource;
}

export const SPACES: SpaceDefinition[] = [
  { key: "viajero", label: "Viajero", description: "Mi cuenta, mis viajes, mis reservas y mi pasaporte", route: "/perfil", source: "rol_global" },
  { key: "empresa", label: "Empresa", description: "Reservas, equipo y ficha de la organización activa", route: "/operadores/panel", source: "pertenencia_organizacion" },
  { key: "creador", label: "Creador", description: "Contenido, métricas, licencias y cobros propios", route: "/creadores", source: "perfil_de_producto" },
  { key: "embajador", label: "Embajador", description: "Código de referencia, comisiones y retiros", route: "/creadores?panel=embajador", source: "perfil_de_producto" },
  { key: "editorial", label: "Editorial", description: "Mesa editorial: borradores, revisiones y publicación", route: "/admin", source: "rol_global" },
  { key: "moderacion", label: "Moderación", description: "Cola de contenido de usuarios y apelaciones", route: "/admin", source: "rol_global" },
  { key: "admin", label: "Administración", description: "Cuentas, configuración, dinero y auditoría", route: "/admin", source: "rol_global" },
];

const BY_KEY = new Map(CAPABILITIES.map((c) => [c.key, c]));

/** Capacidad declarada para una ruta: gana el prefijo más específico. `null` si la ruta no está declarada. */
export function capabilityForRoute(url: string): CapabilityDefinition | null {
  const path = url.split("?")[0] ?? url;
  let best: { prefix: string; capability: string } | null = null;
  for (const entry of ROUTE_CAPABILITIES) {
    if (path === entry.prefix || path.startsWith(`${entry.prefix}/`) || path.startsWith(entry.prefix)) {
      if (!best || entry.prefix.length > best.prefix.length) best = entry;
    }
  }
  return best ? BY_KEY.get(best.capability) ?? null : null;
}

/** De dónde sale la autorización de una ruta del inventario, tal como quedó declarada. */
export function decisionSourceForRoute(route: { authenticated: boolean; roles: string[]; orgScope: boolean }): CapabilitySource {
  if (!route.authenticated) return "publico";
  if (route.roles.length > 0) return "rol_global";
  if (route.orgScope) return "pertenencia_organizacion";
  return "permiso_de_recurso";
}

/**
 * Capacidades que concede el conjunto de roles globales de una sesión.
 *
 * Las capacidades de perfil de producto (estudio de creador, programa de embajadores) nunca salen de aquí:
 * dependen de un perfil aprobado, no de un rol, así que se conceden por separado al comprobarlo.
 */
export function capabilitiesForRoles(roles: string[]): CapabilityDefinition[] {
  if (roles.length === 0) return [];
  return CAPABILITIES.filter(
    (c) => c.source !== "perfil_de_producto" && (c.source === "publico" || c.global_roles.some((r) => roles.includes(r))),
  );
}

export function getCapability(key: string): CapabilityDefinition | null {
  return BY_KEY.get(key) ?? null;
}
