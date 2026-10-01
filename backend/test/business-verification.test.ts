import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PostgresContentReader } from "../src/modules/content/reader.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
const tag = Date.now().toString(36);
let n = 0;
const uniq = () => `bv${Date.now().toString(36)}${n++}@test.local`;
const DAY = 86_400_000;

const BEACH = "b1000000-0000-4000-8000-000000000001";      // Playa Bávaro (fixtures)
const BEACH2 = "b1000000-0000-4000-8000-000000000002";     // Playa Macao (fixtures)
const P_OPERADOR = "f5e00000-0000-4000-8000-000000000001"; // partner_profiles exige id explícito
const P_HOTEL = "f5e00000-0000-4000-8000-000000000002";
const X_DOBLE = "f5e00000-0000-4000-8000-000000000003";    // mismo negocio en dos auditorías aprobadas
const PEND_ID = "f5e00000-0000-4000-8000-000000000004";    // negocio que queda pendiente
const RECH_ID = "f5e00000-0000-4000-8000-000000000005";    // negocio rechazado

const NM = {
  pendHotel: `BV${tag}-pend-hotel`,
  pendOp1: `BV${tag}-pend-op-1`,
  pendOp2: `BV${tag}-pend-op-2`,
  pendGuia: `BV${tag}-pend-guia`,
  okBar: `BV${tag}-ok-bar`,
  okOtro: `BV${tag}-ok-otro`,
  rechAg: `BV${tag}-rech-agencia`,
  expHotel: `BV${tag}-exp-hotel`,
};

describe("puerto de verificación de negocios (#15)", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let admin: { token: string; id: string }, moderator: { token: string; id: string }, plain: { token: string; id: string };

  const call = (method: "GET" | "POST", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });

  const account = async (role?: string) => {
    const email = uniq();
    const reg = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true, display_name: "Sello Prueba" } }));
    await pool.query("UPDATE users SET email_verified_at = now() WHERE id = $1", [reg.data.user.id]);
    let token = reg.data.tokens.access_token as string;
    if (role) { await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [reg.data.user.id, role]); token = json(await call("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token; }
    return { token, id: reg.data.user.id as string };
  };

  const seed = async (o: { business_id: string; business_type: string; name: string; status?: string; minutesAgo?: number }) =>
    (await pool.query<{ id: string }>(
      `INSERT INTO business_verification_audits (business_id, business_type, business_name, rnc, mitur_license, status, created_at, updated_at)
       VALUES ($1, $2, $3, '131000000', 'MITUR-X', $4, now() - ($5 || ' minutes')::interval, now() - ($5 || ' minutes')::interval)
       RETURNING id`,
      [o.business_id, o.business_type, o.name, o.status ?? "pending", String(o.minutesAgo ?? 30)],
    )).rows[0]!.id;

  const auditRow = async (id: string) =>
    (await pool.query<{ status: string; audited_by: string | null; audit_notes: string | null; badge_expires_at: Date | null }>(
      "SELECT status, audited_by, audit_notes, badge_expires_at FROM business_verification_audits WHERE id = $1", [id],
    )).rows[0]!;
  const partner = async (id: string) =>
    (await pool.query<{ verified_badge: boolean; verification: string; verified_badge_issued_at: Date | null; verified_badge_notes: string | null }>(
      "SELECT verified_badge, verification, verified_badge_issued_at, verified_badge_notes FROM partner_profiles WHERE id = $1", [id],
    )).rows[0]!;
  const logCount = async (action: string, entityId: string) =>
    (await pool.query<{ n: number }>("SELECT count(*)::int AS n FROM audit_log WHERE action = $1 AND entity_type = 'verification_audit' AND entity_id = $2", [action, entityId])).rows[0]!.n;

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    admin = await account("admin");
    moderator = await account("moderator");
    plain = await account();
    await pool.query("INSERT INTO partner_profiles (id, business_name, business_type, email) VALUES ($1, 'Operador Sello', 'operador', $2), ($3, 'Hotel Sello', 'hotel', $4)", [P_OPERADOR, uniq(), P_HOTEL, uniq()]);
    await seed({ business_id: P_HOTEL, business_type: "hotel", name: NM.pendHotel, minutesAgo: 100 });
    await seed({ business_id: PEND_ID, business_type: "operador", name: NM.pendOp1, minutesAgo: 90 });
    await seed({ business_id: crypto.randomUUID(), business_type: "operador", name: NM.pendOp2, minutesAgo: 80 });
    await seed({ business_id: crypto.randomUUID(), business_type: "guia", name: NM.pendGuia, minutesAgo: 70 });
    await seed({ business_id: X_DOBLE, business_type: "bar", name: NM.okBar, status: "approved", minutesAgo: 60 });
    await seed({ business_id: X_DOBLE, business_type: "otro", name: NM.okOtro, status: "approved", minutesAgo: 50 });
    await seed({ business_id: RECH_ID, business_type: "agencia", name: NM.rechAg, status: "rejected", minutesAgo: 40 });
    await seed({ business_id: crypto.randomUUID(), business_type: "hotel", name: NM.expHotel, status: "expired", minutesAgo: 30 });
  });
  afterAll(async () => {
    await pool.query("DELETE FROM business_verification_audits WHERE business_name LIKE $1", [`BV${tag}%`]);
    await pool.query("DELETE FROM partner_profiles WHERE id = ANY($1)", [[P_OPERADOR, P_HOTEL]]);
    await pool.end();
    await app.close();
  });

  it("sólo admin consulta y actúa sobre las verificaciones", async () => {
    expect((await call("GET", "/admin/verifications")).statusCode).toBe(401);
    expect((await call("GET", "/admin/verifications", { token: plain.token })).statusCode).toBe(403);
    expect((await call("GET", "/admin/verifications", { token: moderator.token })).statusCode).toBe(403);
    expect((await call("GET", "/admin/verifications", { token: admin.token })).statusCode).toBe(200);
    const ghost = crypto.randomUUID();
    expect((await call("POST", `/admin/verifications/${ghost}/approve`, { token: moderator.token, payload: {} })).statusCode).toBe(403);
    expect((await call("POST", `/admin/verifications/${ghost}/reject`, { token: moderator.token, payload: { reason: "sin permiso" } })).statusCode).toBe(403);
  });

  it("lista con filtros por estado y tipo, orden descendente y paginación", async () => {
    const pend = json(await call("GET", "/admin/verifications?status=pending", { token: admin.token }));
    expect(pend.data.map((r: { business_name: string }) => r.business_name)).toEqual([NM.pendGuia, NM.pendOp2, NM.pendOp1, NM.pendHotel]);
    expect(pend.data[0]).toMatchObject({ business_type: "guia", status: "pending", rnc: "131000000" });
    expect(pend.meta).toMatchObject({ page: 1, per_page: 50, total: 4, total_pages: 1 });

    const op = json(await call("GET", "/admin/verifications?status=pending&business_type=operador", { token: admin.token }));
    expect(op.data.map((r: { business_name: string }) => r.business_name)).toEqual([NM.pendOp2, NM.pendOp1]);
    expect(op.meta.total).toBe(2);

    const page1 = json(await call("GET", "/admin/verifications?per_page=3", { token: admin.token }));
    expect(page1.data.map((r: { business_name: string }) => r.business_name)).toEqual([NM.expHotel, NM.rechAg, NM.okOtro]);
    const page2 = json(await call("GET", "/admin/verifications?per_page=3&page=2", { token: admin.token }));
    expect(page2.data.map((r: { business_name: string }) => r.business_name)).toEqual([NM.okBar, NM.pendGuia, NM.pendOp2]);
    expect(page2.meta).toMatchObject({ page: 2, per_page: 3, total: 8, total_pages: 3 });

    expect((await call("GET", "/admin/verifications?status=inventado", { token: admin.token })).statusCode).toBe(400);
    expect((await call("GET", "/admin/verifications?business_type=airport", { token: admin.token })).statusCode).toBe(400);
  });

  it("aprobar a un operador otorga el sello en su perfil y queda auditado", async () => {
    const id = await seed({ business_id: P_OPERADOR, business_type: "operador", name: `BV${tag}-aprobar-operador` });
    await expect(partner(P_OPERADOR)).resolves.toMatchObject({ verified_badge: false, verification: "unverified" });

    const res = await call("POST", `/admin/verifications/${id}/approve`, { token: admin.token, payload: { notes: "RNC y licencia MITUR verificadas" } });
    expect(res.statusCode).toBe(200);
    expect(json(res).data).toMatchObject({ success: true });

    const row = await auditRow(id);
    expect(row).toMatchObject({ status: "approved", audited_by: admin.id, audit_notes: "RNC y licencia MITUR verificadas" });
    expect(new Date(row.badge_expires_at!).getTime()).toBeGreaterThan(Date.now() + 330 * DAY); // 12 meses por omisión
    expect(new Date(row.badge_expires_at!).getTime()).toBeLessThan(Date.now() + 390 * DAY);

    const p = await partner(P_OPERADOR);
    expect(p).toMatchObject({ verified_badge: true, verification: "verified", verified_badge_notes: "RNC y licencia MITUR verificadas" });
    expect(p.verified_badge_issued_at).not.toBeNull();

    expect(await logCount("verification.approve", id)).toBe(1);
    expect(await app.businessVerification.listApprovedBusinessIds()).toContain(P_OPERADOR);
  });

  it("aprobar a un hotel no toca el sello del perfil (sólo operador/agencia/guia)", async () => {
    const id = await seed({ business_id: P_HOTEL, business_type: "hotel", name: `BV${tag}-aprobar-hotel` });
    expect((await call("POST", `/admin/verifications/${id}/approve`, { token: admin.token, payload: { notes: "Registro turístico en regla" } })).statusCode).toBe(200);
    expect(await auditRow(id)).toMatchObject({ status: "approved", audit_notes: "Registro turístico en regla" });
    expect(await partner(P_HOTEL)).toMatchObject({ verified_badge: false, verification: "unverified", verified_badge_notes: null });
  });

  it("aprobar sin notas usa los textos por omisión", async () => {
    const id = await seed({ business_id: crypto.randomUUID(), business_type: "otro", name: `BV${tag}-aprobar-otro` });
    expect((await call("POST", `/admin/verifications/${id}/approve`, { token: admin.token, payload: {} })).statusCode).toBe(200);
    expect(await auditRow(id)).toMatchObject({ status: "approved", audit_notes: "Aprobado por administración" });
  });

  it("rechazar exige motivo, marca quién rechazó y queda auditado", async () => {
    const id = await seed({ business_id: crypto.randomUUID(), business_type: "guia", name: `BV${tag}-rechazar` });
    expect((await call("POST", `/admin/verifications/${id}/reject`, { token: admin.token, payload: { reason: "no" } })).statusCode).toBe(400);
    expect((await call("POST", `/admin/verifications/${id}/reject`, { token: admin.token, payload: { reason: "Licencia MITUR vencida" } })).statusCode).toBe(200);
    expect(await auditRow(id)).toMatchObject({ status: "rejected", audited_by: admin.id, audit_notes: "Licencia MITUR vencida" });
    expect((await auditRow(id)).badge_expires_at).toBeNull();
    expect(await logCount("verification.reject", id)).toBe(1);
  });

  it("404 para auditorías inexistentes y 400 para ids inválidos", async () => {
    const ghost = crypto.randomUUID();
    expect((await call("POST", `/admin/verifications/${ghost}/approve`, { token: admin.token, payload: {} })).statusCode).toBe(404);
    expect((await call("POST", `/admin/verifications/${ghost}/reject`, { token: admin.token, payload: { reason: "no existe" } })).statusCode).toBe(404);
    expect((await call("POST", "/admin/verifications/no-es-uuid/approve", { token: admin.token, payload: {} })).statusCode).toBe(400);
  });

  it("listApprovedBusinessIds: sólo aprobados y sin duplicados", async () => {
    const ids = await app.businessVerification.listApprovedBusinessIds();
    expect(ids.filter((x) => x === X_DOBLE)).toHaveLength(1);
    expect(ids).toContain(P_OPERADOR);
    expect(ids).not.toContain(PEND_ID);
    expect(ids).not.toContain(RECH_ID);
  });

  it("un negocio aprobado llega al catálogo de IA como verificado", async () => {
    const id = await seed({ business_id: BEACH, business_type: "bar", name: `BV${tag}-playa` });
    expect((await call("POST", `/admin/verifications/${id}/approve`, { token: admin.token, payload: { notes: "Sello oficial de la playa" } })).statusCode).toBe(200);
    const verifiedIds = await app.businessVerification.listApprovedBusinessIds();
    expect(verifiedIds).toContain(BEACH);
    const cands = await new PostgresContentReader(app.db).findPublicCandidates({ paths: ["beaches"], keywords: [], perType: 10, verifiedIds });
    expect(cands.find((c) => c.ref === BEACH)?.is_verified).toBe(true);
    expect(cands.find((c) => c.ref === BEACH2)?.is_verified).toBe(false);
  });
});
