import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { pageMeta } from "../../lib/pagination.js";
import {
  CAPABILITIES,
  CATALOG_VERSION,
  SPACES,
  capabilityForRoute,
  capabilitiesForRoles,
  decisionSourceForRoute,
  getCapability,
  type CapabilityDefinition,
  type CapabilitySource,
} from "./catalog.js";

/** Capacidad efectiva de una sesión, con la fuente de decisión que la concede (punto 66). */
interface CapabilityGrant {
  key: string;
  label: string;
  panel: CapabilityDefinition["panel"];
  source: CapabilitySource;
  granted_by: string;
  mfa_required: boolean;
  resources: string[];
}

interface OrgRow {
  org_id: string;
  role: string;
  business_name: string | null;
}

interface CatalogRoutesOptions {
  /** Inventario de rutas construido por el servidor (`app.routeTable`). */
  routeTable: { method: string; url: string; authenticated: boolean; roles: string[]; orgScope: boolean }[];
}

const any = z.any();
const ok = z.object({ data: any });
const bearer = [{ bearerAuth: [] }];

/**
 * Accesos y capacidades (Plan de accesos y paneles por perfil).
 *
 * - `GET /me/context` alimenta la navegación por capacidades del frontend (punto 58) y el selector de
 *   espacios de la cuenta multi-perfil (puntos 43 y 78): la interfaz no decide por su cuenta qué mostrar.
 * - `GET /admin/access/catalog` publica el catálogo interno con su gobierno (punto 70).
 * - `GET /admin/access/audit` cruza el inventario real de rutas con el catálogo para ver rol, recurso,
 *   permiso y fuente de decisión (punto 66).
 */
export async function accessRoutes(app: FastifyInstance, opts: CatalogRoutesOptions) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const auth = app.authenticate;
  const admin = app.requireRole("admin");
  const routeTable = opts.routeTable;

  const orgsOf = async (userId: string): Promise<OrgRow[]> =>
    (await app.db.query<OrgRow>(
      `SELECT om.org_id, om.role, p.business_name
         FROM org_members om
         JOIN partner_profiles p ON p.id = om.org_id
        WHERE om.user_id = $1
        ORDER BY om.role = 'owner' DESC, p.business_name NULLS LAST`,
      [userId],
    )).rows;

  r.get("/me/context", {
    onRequest: auth,
    schema: {
      tags: ["accesos"],
      summary: "Mi contexto de acceso: roles, espacios de producto y capacidades efectivas",
      security: bearer,
      response: { 200: ok },
    },
  }, async (req) => {
    const user = req.user!;
    const [orgs, creator, ambassador] = await Promise.all([
      orgsOf(user.id),
      app.db.query<{ status: string }>("SELECT status FROM creator_profiles WHERE id = $1", [user.id]).then((res) => res.rows[0] ?? null),
      app.db.query<{ status: string; referral_code: string }>("SELECT status, referral_code FROM ambassadors WHERE id = $1", [user.id]).then((res) => res.rows[0] ?? null),
    ]);

    const grants = new Map<string, CapabilityGrant>();
    const add = (cap: CapabilityDefinition | null, grantedBy: string) => {
      if (!cap || grants.has(cap.key)) return;
      grants.set(cap.key, {
        key: cap.key,
        label: cap.label,
        panel: cap.panel,
        source: cap.source,
        granted_by: grantedBy,
        mfa_required: cap.mfa_required,
        resources: cap.resources,
      });
    };

    for (const cap of capabilitiesForRoles(user.roles)) add(cap, "rol global");
    if (orgs.length > 0) {
      add(getCapability("org.bookings_manage"), "membresía de organización");
      if (orgs.some((o) => o.role === "owner" || o.role === "admin")) {
        add(getCapability("org.team_manage"), "membresía de organización");
        // Administrar retos o campañas patrocinadas es una capacidad de empresa, nunca del perfil de jugador
        // (punto 20.f): el jugador conserva `gamification.self` y no gana nada por participar.
        add(getCapability("org.challenges_manage"), "membresía de organización");
      }
    }
    if (creator?.status === "active") add(getCapability("creator.studio"), "perfil de creador aprobado");
    if (ambassador?.status === "approved") add(getCapability("ambassador.program"), "afiliación aprobada");

    const spaceContext: Record<string, unknown> = {
      viajero: { profile_route: "/perfil" },
      empresa: {
        organizations: orgs.map((o) => ({ id: o.org_id, name: o.business_name, role: o.role })),
        /** Si pertenece a varias, la interfaz pide elegir y conserva la elección durante la sesión (punto 22). */
        requires_choice: orgs.length > 1,
      },
      creador: creator ? { status: creator.status, handle: null } : null,
      embajador: ambassador ? { status: ambassador.status, referral_code: ambassador.referral_code } : null,
    };

    const spaces = SPACES.map((s) => ({
      ...s,
      available:
        s.key === "viajero"
        || (s.key === "empresa" && orgs.length > 0)
        || (s.key === "creador" && creator?.status === "active")
        || (s.key === "embajador" && ambassador?.status === "approved")
        || (s.key === "admin" && user.roles.includes("admin"))
        || (s.key === "editorial" && (user.roles.includes("admin") || user.roles.includes("editor")))
        || (s.key === "moderacion" && (user.roles.includes("admin") || user.roles.includes("moderator"))),
      context: spaceContext[s.key] ?? null,
    }));

    return {
      data: {
        catalog_version: CATALOG_VERSION,
        user: {
          id: user.id,
          roles: user.roles,
          locale: user.locale,
          mfa: user.mfa,
          /** Sesión de soporte visible (punto 55): quién la abrió; el servidor la aplica en modo lectura. */
          impersonation: user.imp ? { active: true, actor_id: user.imp, read_only: true } : { active: false, actor_id: null, read_only: false },
        },
        spaces,
        capabilities: [...grants.values()],
      },
    };
  });

  r.get("/admin/access/catalog", {
    onRequest: admin,
    schema: {
      tags: ["accesos", "admin"],
      summary: "Catálogo interno de capacidades con su gobierno (dueño, asignación, MFA y baja)",
      security: bearer,
      response: { 200: ok },
    },
  }, async () => ({
    data: {
      version: CATALOG_VERSION,
      spaces: SPACES,
      capabilities: CAPABILITIES,
      note: "Fuente de verdad del servidor: el frontend consume este catálogo para construir menús y el backend vuelve a comprobar el permiso en cada endpoint.",
    },
  }));

  r.get("/admin/access/audit", {
    onRequest: admin,
    schema: {
      tags: ["accesos", "admin"],
      summary: "Auditoría visual de permisos: rol, recurso, permiso y fuente de decisión por ruta",
      security: bearer,
      querystring: z.object({
        page: z.coerce.number().int().min(1).default(1),
        per_page: z.coerce.number().int().min(1).max(200).default(50),
        panel: z.enum(["todos", "publico", "viajero", "empresa", "creador", "embajador", "editorial", "moderacion", "admin"]).default("todos"),
        capability: z.string().max(60).optional(),
        q: z.string().trim().max(120).optional(),
        method: z.string().max(10).optional(),
      }),
      response: { 200: z.object({ data: any, meta: any }) },
    },
  }, async (req) => {
    const rows = routeTable
      .filter((route) => route.method !== "HEAD" && route.method !== "OPTIONS" && route.url.startsWith("/api/v1"))
      .map((route) => {
        const capability = capabilityForRoute(route.url);
        return {
          method: route.method,
          url: route.url,
          authenticated: route.authenticated,
          roles: route.roles,
          org_scope: route.orgScope,
          decision_source: decisionSourceForRoute(route),
          capability: capability?.key ?? null,
          capability_label: capability?.label ?? null,
          panel: capability?.panel ?? "publico",
          mfa_required: capability?.mfa_required ?? false,
          owner: capability?.owner ?? null,
          declared: !!capability,
        };
      });

    const filtered = rows.filter((row) => {
      if (req.query.panel !== "todos" && row.panel !== req.query.panel) return false;
      if (req.query.capability && row.capability !== req.query.capability) return false;
      if (req.query.method && row.method.toUpperCase() !== req.query.method.toUpperCase()) return false;
      if (req.query.q) {
        const needle = req.query.q.toLowerCase();
        const haystack = `${row.method} ${row.url} ${row.capability ?? ""} ${row.roles.join(" ")}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });

    const start = (req.query.page - 1) * req.query.per_page;
    const page = filtered.slice(start, start + req.query.per_page);

    const summary = {
      routes: rows.length,
      declared: rows.filter((row) => row.declared).length,
      undeclared: rows.filter((row) => !row.declared).length,
      authenticated: rows.filter((row) => row.authenticated).length,
      public: rows.filter((row) => !row.authenticated).length,
      mfa_required: rows.filter((row) => row.mfa_required).length,
      by_source: rows.reduce<Record<string, number>>((acc, row) => {
        acc[row.decision_source] = (acc[row.decision_source] ?? 0) + 1;
        return acc;
      }, {}),
    };

    return {
      data: { catalog_version: CATALOG_VERSION, summary, capabilities: CAPABILITIES.map((c) => ({ key: c.key, label: c.label, panel: c.panel })), rows: page },
      meta: pageMeta(req.query.page, req.query.per_page, filtered.length),
    };
  });
}
