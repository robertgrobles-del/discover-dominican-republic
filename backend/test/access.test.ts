import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CAPABILITIES, CATALOG_VERSION, SPACES, capabilityForRoute, decisionSourceForRoute } from "../src/modules/access/catalog.js";
import { json, makeApp } from "./helpers.js";

// Plan de accesos y paneles por perfil, Fase 5 (puntos 58, 66 y 70): el catálogo de capacidades es la
// fuente de verdad del servidor y el inventario real de rutas debe quedar declarado en él.
const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = () => `ac${Date.now().toString(36)}${n++}@test.local`;

describe("catálogo de capacidades", () => {
  it("publica versión y gobierno completo en cada capacidad", () => {
    expect(CATALOG_VERSION).toMatch(/^\d{4}\.\d{2}\.\d+$/);
    expect(CAPABILITIES.length).toBeGreaterThanOrEqual(20);
    expect(new Set(CAPABILITIES.map((c) => c.key)).size).toBe(CAPABILITIES.length);
    for (const c of CAPABILITIES) {
      expect(c.key).toMatch(/^[a-z][a-z0-9_.]+$/);
      expect(c.label.length).toBeGreaterThan(3);
      expect(c.purpose.length).toBeGreaterThan(10);
      expect(c.owner.length).toBeGreaterThan(2);
      expect(c.assigned_by.length).toBeGreaterThan(5);
      expect(c.revocation.length).toBeGreaterThan(5);
    }
  });

  it("exige MFA en las capacidades del personal interno", () => {
    for (const key of ["admin.accounts", "admin.global_config", "admin.finance", "admin.audit_read", "admin.access_catalog", "editorial.content", "moderation.queue", "support.readonly"]) {
      expect(CAPABILITIES.find((c) => c.key === key)!.mfa_required).toBe(true);
    }
  });

  it("no concede ninguna capacidad administrativa a roles que no son de personal", () => {
    for (const c of CAPABILITIES.filter((x) => x.panel === "admin")) {
      expect(c.global_roles.length).toBeGreaterThan(0);
      expect(c.global_roles.every((r) => ["admin", "editor", "moderator"].includes(r))).toBe(true);
    }
  });

  it("resuelve cada ruta por su prefijo más específico", () => {
    expect(capabilityForRoute("/api/v1/admin/users/8f00/roles")?.key).toBe("admin.accounts");
    expect(capabilityForRoute("/api/v1/admin/hotels/123")?.key).toBe("admin.panel_modules");
    expect(capabilityForRoute("/api/v1/org/bookings?page=2")?.key).toBe("org.bookings_manage");
    expect(capabilityForRoute("/api/v1/org/team")?.key).toBe("org.team_manage");
    expect(capabilityForRoute("/api/v1/me/profile")?.key).toBe("account.self_service");
    expect(capabilityForRoute("/api/v1/creators/me")?.key).toBe("creator.studio");
  });

  it("deriva la fuente de decisión de cada ruta", () => {
    expect(decisionSourceForRoute({ authenticated: false, roles: [], orgScope: false })).toBe("publico");
    expect(decisionSourceForRoute({ authenticated: true, roles: ["admin"], orgScope: false })).toBe("rol_global");
    expect(decisionSourceForRoute({ authenticated: true, roles: [], orgScope: true })).toBe("pertenencia_organizacion");
    expect(decisionSourceForRoute({ authenticated: true, roles: [], orgScope: false })).toBe("permiso_de_recurso");
  });

  it("declara cada espacio de producto con su ruta canónica", () => {
    expect(SPACES.map((s) => s.key)).toEqual(expect.arrayContaining(["viajero", "empresa", "creador", "embajador"]));
    for (const s of SPACES) expect(s.route.startsWith("/")).toBe(true);
  });
});

describe("accesos", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;

  const call = (method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });

  const account = async (opts: { role?: string } = {}) => {
    const email = uniq();
    const reg = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true, display_name: "Cuenta Accesos" } }));
    const id = reg.data.user.id as string;
    await pool.query("UPDATE users SET email_verified_at = now() WHERE id = $1", [id]);
    let token = reg.data.tokens.access_token as string;
    if (opts.role) {
      await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [id, opts.role]);
      token = json(await call("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token;
    }
    return { id, token, email };
  };

  const context = async (token: string) => json(await call("GET", "/me/context", { token })).data;

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  it("exige sesión para el contexto de acceso", async () => {
    expect((await call("GET", "/me/context")).statusCode).toBe(401);
  });

  it("devuelve al viajero su espacio y sus capacidades sin conceder nada de empresa ni de personal", async () => {
    const u = await account();
    const ctx = await context(u.token);
    expect(ctx.catalog_version).toBe(CATALOG_VERSION);
    expect(ctx.user.roles).toEqual(["user"]);
    expect(ctx.user.impersonation).toEqual({ active: false, actor_id: null, read_only: false });
    const keys = ctx.capabilities.map((c: { key: string }) => c.key);
    expect(keys).toEqual(expect.arrayContaining(["account.self_service", "traveler.bookings", "gamification.self"]));
    expect(keys).not.toEqual(expect.arrayContaining(["org.bookings_manage", "creator.studio", "ambassador.program"]));
    expect(keys.every((k: string) => !String(k).startsWith("admin."))).toBe(true);

    const byKey = Object.fromEntries(ctx.spaces.map((s: { key: string; available: boolean }) => [s.key, s.available]));
    expect(byKey.viajero).toBe(true);
    expect(byKey.empresa).toBe(false);
    expect(byKey.creador).toBe(false);
    expect(byKey.admin).toBe(false);
  });

  it("concede el espacio de empresa por membresía: recepción atiende reservas, no edita el equipo", async () => {
    const u = await account();
    const orgId = crypto.randomUUID();
    await pool.query("INSERT INTO partner_profiles (id, business_name, business_type, email, slug) VALUES ($1, $2, 'operador', $3, $4)", [orgId, "Org Recepción", u.email, `org-${orgId.slice(0, 8)}`]);
    await pool.query("INSERT INTO org_members (org_id, user_id, role) VALUES ($1, $2, 'recepcion')", [orgId, u.id]);

    const ctx = await context(u.token);
    const keys = ctx.capabilities.map((c: { key: string }) => c.key);
    expect(keys).toContain("org.bookings_manage");
    expect(keys).not.toContain("org.team_manage");
    const empresa = ctx.spaces.find((s: { key: string }) => s.key === "empresa");
    expect(empresa.available).toBe(true);
    expect(empresa.context.organizations).toEqual([{ id: orgId, name: "Org Recepción", role: "recepcion" }]);
    expect(empresa.context.requires_choice).toBe(false);
  });

  it("concede la edición del equipo solo al propietario o administrador de la organización", async () => {
    const u = await account();
    const orgId = crypto.randomUUID();
    await pool.query("INSERT INTO partner_profiles (id, business_name, business_type, email, slug) VALUES ($1, $2, 'operador', $3, $4)", [orgId, "Org Owner", u.email, `org-${orgId.slice(0, 8)}`]);
    await pool.query("INSERT INTO org_members (org_id, user_id, role) VALUES ($1, $2, 'owner')", [orgId, u.id]);
    const ctx = await context(u.token);
    const team = ctx.capabilities.find((c: { key: string }) => c.key === "org.team_manage");
    expect(team).toBeTruthy();
    expect(team.source).toBe("pertenencia_organizacion");
    expect(team.granted_by).toMatch(/organizaci/i);
  });

  it("concede el estudio de creador por perfil aprobado, sin tocar el rol global", async () => {
    const u = await account();
    await pool.query("INSERT INTO creator_profiles (id, handle, display_name, status) VALUES ($1, $2, 'Creador Prueba', 'active')", [u.id, `creador${n}${Date.now().toString(36)}`]);
    const ctx = await context(u.token);
    expect(ctx.user.roles).toEqual(["user"]);
    expect(ctx.capabilities.map((c: { key: string }) => c.key)).toContain("creator.studio");
    const creador = ctx.spaces.find((s: { key: string }) => s.key === "creador");
    expect(creador.available).toBe(true);
    expect(creador.context.status).toBe("active");
  });

  it("reserva el catálogo y la auditoría al rol admin", async () => {
    const user = await account();
    const admin = await account({ role: "admin" });
    expect((await call("GET", "/admin/access/catalog", { token: user.token })).statusCode).toBe(403);
    expect((await call("GET", "/admin/access/audit", { token: user.token })).statusCode).toBe(403);

    const catalog = json(await call("GET", "/admin/access/catalog", { token: admin.token })).data;
    expect(catalog.version).toBe(CATALOG_VERSION);
    expect(catalog.capabilities.length).toBe(CAPABILITIES.length);
    expect(catalog.spaces.length).toBe(SPACES.length);

    const ctx = await context(admin.token);
    expect(ctx.capabilities.map((c: { key: string }) => c.key)).toEqual(expect.arrayContaining(["admin.accounts", "admin.access_catalog", "admin.audit_read"]));
    expect(ctx.spaces.find((s: { key: string }) => s.key === "admin").available).toBe(true);
  });

  it("audita el inventario real de rutas: ninguna ruta autenticada queda sin capacidad declarada", async () => {
    const admin = await account({ role: "admin" });
    const all = json(await call("GET", "/admin/access/audit?per_page=200&page=1", { token: admin.token }));
    expect(all.data.summary.routes).toBeGreaterThan(100);
    expect(all.data.summary.undeclared).toBe(0);
    expect(all.data.summary.declared).toBe(all.data.summary.routes);
    expect(all.data.summary.authenticated).toBeGreaterThan(100);
    expect(all.data.summary.by_source.rol_global).toBeGreaterThan(0);

    // Todas las páginas: ninguna ruta puede quedar fuera de una capacidad ni del inventario.
    const pages = all.meta.total_pages as number;
    const seen = new Set<string>();
    for (let page = 1; page <= pages; page++) {
      const body = json(await call("GET", `/admin/access/audit?per_page=200&page=${page}`, { token: admin.token }));
      for (const row of body.data.rows as { method: string; url: string; capability: string | null }[]) {
        seen.add(`${row.method} ${row.url}`);
        expect(row.capability).toBeTruthy();
      }
    }
    expect(seen.size).toBe(all.data.summary.routes);

    // Ninguna ruta administrativa puede quedar abierta ni concedida a un usuario corriente.
    const adminRows = (json(await call("GET", "/admin/access/audit?per_page=200&q=/api/v1/admin&panel=todos", { token: admin.token })).data.rows as { url: string; authenticated: boolean; roles: string[] }[])
      .filter((row) => row.url.startsWith("/api/v1/admin"));
    expect(adminRows.length).toBeGreaterThan(0);
    for (const row of adminRows) {
      expect(row.authenticated).toBe(true);
      expect(row.roles).not.toEqual(["user"]);
    }
  });

  it("filtra la auditoría por panel y por capacidad", async () => {
    const admin = await account({ role: "admin" });
    const empresas = json(await call("GET", "/admin/access/audit?panel=empresa&per_page=200", { token: admin.token })).data;
    expect(empresas.rows.length).toBeGreaterThan(0);
    expect((empresas.rows as { panel: string }[]).every((row) => row.panel === "empresa")).toBe(true);

    const moderation = json(await call("GET", "/admin/access/audit?capability=moderation.queue&per_page=200", { token: admin.token })).data;
    expect(moderation.rows.length).toBeGreaterThan(0);
    expect((moderation.rows as { capability: string }[]).every((row) => row.capability === "moderation.queue")).toBe(true);
  });
});
