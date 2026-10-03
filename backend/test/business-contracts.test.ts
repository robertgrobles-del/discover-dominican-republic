import { createHash, randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { TERMS_VERSION, renderContract } from "../src/modules/operators/contracts.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = () => `bc${Date.now().toString(36)}${n++}@test.local`;

describe("texto del contrato", () => {
  const base = { audit_id: "a", business_id: "b", business_name: "Hotel Sol", business_type: "hotel", rnc: "131000000", applicant_user_id: null, badge_expires_at: "2027-10-03T00:00:00Z" };
  it("incluye negocio, RNC, vigencia y la comisión que corresponda", () => {
    const withRate = renderContract({ ...base, commission_rate: 8 }, "2026-10-03");
    expect(withRate).toContain("Hotel Sol, RNC 131000000 (hotel)");
    expect(withRate).toContain("hasta el 2027-10-03");
    expect(withRate).toContain("del 8 %");
    expect(withRate).toContain(TERMS_VERSION);
    expect(renderContract({ ...base, rnc: null, commission_rate: null }, "2026-10-03")).toContain("tarifario vigente");
  });
});

describe("Claim & Verify: solicitud, contrato y aceptación", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let admin: string, owner: { token: string; id: string }, stranger: string;
  let orgId: string, auditId: string;

  const call = (method: "GET" | "POST", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const account = async (role?: string) => {
    const email = uniq();
    const reg = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true } }));
    const id = reg.data.user.id as string;
    if (!role) return { id, token: reg.data.tokens.access_token as string };
    await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [id, role]);
    return { id, token: json(await call("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token as string };
  };

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    admin = (await account("admin")).token; owner = await account(); stranger = (await account()).token;
    orgId = json(await call("POST", "/orgs", { token: owner.token, payload: { business_name: `Contrato ${Date.now()}` } })).data.id;
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  it("sólo el propietario solicita el sello de su organización, y una vez mientras esté en revisión", async () => {
    const payload = { business_id: orgId, business_type: "operador", business_name: "Aventuras Contrato", rnc: "131000000", documents: ["https://example.com/registro.pdf"] };
    expect((await call("POST", "/verifications", { payload })).statusCode).toBe(401);
    expect((await call("POST", "/verifications", { token: stranger, payload })).statusCode).toBe(403);
    expect((await call("POST", "/verifications", { token: owner.token, payload: { ...payload, rnc: "12" } })).statusCode).toBe(400);
    const created = await call("POST", "/verifications", { token: owner.token, payload });
    expect(created.statusCode).toBe(201);
    auditId = json(created).data.id;
    expect((await call("POST", "/verifications", { token: owner.token, payload })).statusCode).toBe(409);
    expect(json(await call("GET", "/verifications/mine", { token: owner.token })).data[0]).toMatchObject({ id: auditId, status: "pending", contract_id: null });
  });

  it("al aprobar se emite el contrato con el texto y su huella, y sólo lo ve quien solicitó", async () => {
    expect(json(await call("GET", "/verifications/contracts", { token: owner.token })).data).toEqual([]);
    expect((await call("POST", `/admin/verifications/${auditId}/approve`, { token: admin, payload: {} })).statusCode).toBe(200);
    const mine = json(await call("GET", "/verifications/contracts", { token: owner.token })).data;
    expect(mine).toHaveLength(1);
    expect(mine[0]).toMatchObject({ audit_id: auditId, business_id: orgId, terms_version: TERMS_VERSION, accepted_at: null });
    expect(mine[0].body).toContain("Aventuras Contrato, RNC 131000000 (operador)");
    expect(mine[0].body).toContain("del 8 %");
    expect(mine[0].body_hash).toBe(createHash("sha256").update(mine[0].body).digest("hex"));
    expect(json(await call("GET", "/verifications/contracts", { token: stranger })).data).toEqual([]);
    expect((await pool.query("SELECT verification FROM partner_profiles WHERE id = $1", [orgId])).rows[0].verification).toBe("verified");
  });

  it("la aceptación exige la huella del texto emitido, queda auditada y no se repite", async () => {
    const c = json(await call("GET", "/verifications/contracts", { token: owner.token })).data[0];
    expect((await call("POST", `/verifications/contracts/${c.id}/accept`, { token: owner.token, payload: { body_hash: "0".repeat(64) } })).statusCode).toBe(409);
    expect((await call("POST", `/verifications/contracts/${c.id}/accept`, { token: stranger, payload: { body_hash: c.body_hash } })).statusCode).toBe(404);
    const first = json(await call("POST", `/verifications/contracts/${c.id}/accept`, { token: owner.token, payload: { body_hash: c.body_hash } })).data;
    expect(first.already_accepted).toBe(false);
    const again = json(await call("POST", `/verifications/contracts/${c.id}/accept`, { token: owner.token, payload: { body_hash: c.body_hash } })).data;
    expect(again).toMatchObject({ already_accepted: true, accepted_at: first.accepted_at });
    expect((await pool.query("SELECT count(*)::int AS n FROM audit_log WHERE action = 'contract.accept' AND entity_id = $1", [c.id])).rows[0].n).toBe(1);
    expect(json(await call("GET", "/verifications/mine", { token: owner.token })).data[0].contract_accepted_at).not.toBeNull();
  });

  it("un negocio que no es organización también recibe su contrato, con el tarifario vigente", async () => {
    const hotel = randomUUID();
    const a = json(await call("POST", "/verifications", { token: stranger, payload: { business_id: hotel, business_type: "hotel", business_name: "Hotel Reclamado" } })).data;
    await call("POST", `/admin/verifications/${a.id}/approve`, { token: admin, payload: {} });
    const c = json(await call("GET", "/verifications/contracts", { token: stranger })).data[0];
    expect(c.body).toContain("Hotel Reclamado (hotel)");
    expect(c.body).toContain("tarifario vigente");
  });
});
