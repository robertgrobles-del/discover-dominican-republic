import { fetchApi } from "@/lib/fastifyClient";
import { IS_MOCK_DATA } from "@/lib/dataSource";
import { reportError } from "@/lib/errorReporter";

/**
 * Contexto de acceso del usuario (Plan de accesos y paneles por perfil, puntos 43, 58, 66 y 78).
 *
 * El servidor es la única fuente de verdad: `GET /api/v1/me/context` devuelve los roles, los espacios de
 * producto disponibles y las capacidades efectivas con su fuente de decisión. La interfaz **no** decide por
 * sí misma qué menús mostrar a partir de un booleano local.
 *
 * Excepción deliberada y etiquetada: cuando el frontend corre con datos simulados
 * (`VITE_DATA_SOURCE=mock`, el modo del entorno de desarrollo sin backend), no hay servidor al que
 * preguntar, así que se devuelve un contexto de demostración con `demo: true`. Todas sus capacidades son
 * explícitamente de demo, no autorizan nada en un despliegue real y la interfaz lo anuncia con un aviso
 * visible (`MockDataNotice`). En modo `api` este archivo nunca inventa permisos: si la llamada falla, se
 * devuelve un contexto vacío (denegar por defecto).
 */

export type PanelKey = "publico" | "viajero" | "empresa" | "creador" | "embajador" | "editorial" | "moderacion" | "admin";

export type CapabilitySource = "publico" | "rol_global" | "pertenencia_organizacion" | "perfil_de_producto" | "permiso_de_recurso";

export interface CapabilityGrant {
  key: string;
  label: string;
  panel: PanelKey;
  source: CapabilitySource;
  granted_by: string;
  mfa_required: boolean;
  resources: string[];
}

export interface AccessSpace {
  key: string;
  label: string;
  description: string;
  route: string;
  available: boolean;
  context: unknown;
}

export interface AccessContext {
  catalog_version: string;
  demo: boolean;
  user: {
    id: string | null;
    roles: string[];
    locale: string;
    mfa: boolean;
    impersonation: { active: boolean; actor_id: string | null; read_only: boolean };
  };
  spaces: AccessSpace[];
  capabilities: CapabilityGrant[];
}

const DEMO_CATALOG_VERSION = "demo-2026.10.1";

const demoCap = (key: string, label: string, panel: PanelKey, source: CapabilitySource, resources: string[] = []): CapabilityGrant => ({
  key, label, panel, source, granted_by: "contexto de demostración (datos simulados)", mfa_required: false, resources,
});

/**
 * Capacidades del entorno de demostración. Reflejan la matriz del plan para poder recorrer todos los
 * paneles sin backend; nunca se usan con `VITE_DATA_SOURCE=api`.
 */
export const DEMO_CAPABILITIES: CapabilityGrant[] = [
  demoCap("content.explore", "Explorar contenido público", "publico", "publico"),
  demoCap("account.self_service", "Gestionar la cuenta propia", "viajero", "rol_global", ["/perfil"]),
  demoCap("traveler.bookings", "Gestionar reservas y pedidos propios", "viajero", "rol_global", ["/reservas", "/mi-viaje"]),
  demoCap("gamification.self", "Pasaporte, retos y coleccionables propios", "viajero", "rol_global", ["/mis-logros"]),
  demoCap("org.bookings_manage", "Gestionar reservas de la organización", "empresa", "pertenencia_organizacion", ["/operadores/panel/reservas"]),
  demoCap("org.team_manage", "Editar la organización y su equipo", "empresa", "pertenencia_organizacion", ["/operadores/panel/equipo"]),
  demoCap("org.challenges_manage", "Campañas y retos patrocinados por la organización", "empresa", "pertenencia_organizacion", ["/operadores/panel/promocion"]),
  demoCap("creator.studio", "Estudio de creador y contenido propio", "creador", "perfil_de_producto", ["/creadores"]),
  demoCap("ambassador.program", "Programa de embajadores", "embajador", "perfil_de_producto", ["/creadores?panel=embajador"]),
  demoCap("editorial.content", "Mesa editorial del portal", "editorial", "rol_global", ["/admin"]),
  demoCap("moderation.queue", "Cola de moderación de contenido de usuarios", "moderacion", "rol_global", ["/admin"]),
  demoCap("admin.accounts", "Administración de cuentas y roles", "admin", "rol_global", ["/admin"]),
  demoCap("admin.global_config", "Configuración global y operación interna", "admin", "rol_global", ["/admin"]),
  demoCap("admin.finance", "Operaciones financieras", "admin", "rol_global", ["/admin"]),
  demoCap("admin.content_ops", "Operación de contenido e importaciones", "admin", "rol_global", ["/admin"]),
  demoCap("admin.audit_read", "Lectura de la bitácora de auditoría", "admin", "rol_global", ["/admin"]),
  demoCap("admin.access_catalog", "Catálogo y auditoría de permisos", "admin", "rol_global", ["/admin"]),
];

export const DEMO_SPACES: AccessSpace[] = [
  { key: "viajero", label: "Viajero", description: "Mi cuenta, mis viajes, mis reservas y mi pasaporte", route: "/perfil", available: true, context: null },
  { key: "empresa", label: "Empresa", description: "Reservas, equipo y ficha de la organización activa", route: "/operadores/panel", available: true, context: { organizations: [{ id: "demo-org", name: "Hotel Demo Samaná", role: "owner" }], requires_choice: false } },
  { key: "creador", label: "Creador", description: "Contenido, métricas, licencias y cobros propios", route: "/creadores", available: true, context: { status: "active" } },
  { key: "embajador", label: "Embajador", description: "Código de referencia, comisiones y retiros", route: "/creadores?panel=embajador", available: true, context: { status: "approved", referral_code: "DEMO-RD" } },
  { key: "editorial", label: "Editorial", description: "Mesa editorial: borradores, revisiones y publicación", route: "/admin", available: true, context: null },
  { key: "moderacion", label: "Moderación", description: "Cola de contenido de usuarios y apelaciones", route: "/admin", available: true, context: null },
  { key: "admin", label: "Administración", description: "Cuentas, configuración, dinero y auditoría", route: "/admin", available: true, context: null },
];

export const EMPTY_ACCESS_CONTEXT: AccessContext = {
  catalog_version: "desconocida",
  demo: false,
  user: { id: null, roles: [], locale: "es", mfa: false, impersonation: { active: false, actor_id: null, read_only: false } },
  spaces: [],
  capabilities: [],
};

export function demoAccessContext(): AccessContext {
  return {
    catalog_version: DEMO_CATALOG_VERSION,
    demo: true,
    user: {
      id: "demo-user",
      roles: ["user", "partner", "ambassador", "editor", "moderator", "admin"],
      locale: "es",
      mfa: false,
      impersonation: { active: false, actor_id: null, read_only: false },
    },
    spaces: DEMO_SPACES,
    capabilities: DEMO_CAPABILITIES,
  };
}

/**
 * Contexto de demostración coherente con el rol con el que se quiere recorrer el panel. Sirve para pruebas
 * y para el modo simulado; en modo `api` el servidor manda y esta función no se usa.
 */
export function demoAccessContextForRoles(roles: string[]): AccessContext {
  const base = demoAccessContext();
  if (roles.length === 0) return { ...base, capabilities: base.capabilities.filter((c) => c.panel === "publico") };
  const isStaff = roles.some((r) => ["admin", "editor", "moderator"].includes(r));
  const isAdmin = roles.includes("admin");
  const personal = ["content.explore", "account.self_service", "traveler.bookings", "gamification.self"];
  const empresa = ["org.bookings_manage", "org.team_manage", "org.challenges_manage", "creator.studio"];
  const staff = ["editorial.content", "moderation.queue"];
  return {
    ...base,
    user: { ...base.user, roles },
    spaces: base.spaces.map((s) => ({
      ...s,
      available:
        s.key === "viajero"
        || (s.key === "empresa" && roles.includes("partner"))
        || (s.key === "creador" && roles.includes("partner"))
        || (s.key === "embajador" && roles.includes("ambassador"))
        || (s.key === "admin" && isAdmin)
        || (s.key === "editorial" && isStaff)
        || (s.key === "moderacion" && isStaff),
    })),
    capabilities: base.capabilities.filter((c) => {
      if (personal.includes(c.key)) return true;
      if (staff.includes(c.key) || c.key.startsWith("admin.")) return isStaff;
      if (empresa.includes(c.key)) return roles.includes("partner");
      if (c.key === "ambassador.program") return roles.includes("ambassador");
      return false;
    }),
  };
}

/** Carga el contexto real. Con datos simulados devuelve el contexto de demostración; con `api`, denegar por defecto. */
export async function loadAccessContext(token?: string | null): Promise<AccessContext> {
  if (IS_MOCK_DATA) return demoAccessContext();
  try {
    const res = await fetchApi<{ data: AccessContext }>("/me/context", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return res.data;
  } catch (error) {
    // Denegar por defecto: sin contexto del servidor no se muestra ni un panel interno.
    reportError(error, { source: "api" });
    return EMPTY_ACCESS_CONTEXT;
  }
}

export function hasCapability(ctx: AccessContext | undefined, key: string): boolean {
  return !!ctx?.capabilities.some((c) => c.key === key);
}

export function capability(ctx: AccessContext | undefined, key: string): CapabilityGrant | undefined {
  return ctx?.capabilities.find((c) => c.key === key);
}

/** Espacios que la cuenta puede abrir ahora mismo (punto 43: una cuenta puede ser empresa y creador a la vez). */
export function availableSpaces(ctx: AccessContext | undefined): AccessSpace[] {
  return (ctx?.spaces ?? []).filter((s) => s.available);
}
