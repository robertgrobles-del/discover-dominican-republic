import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { audit, auditChainVerify } from "../src/lib/audit.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = () => `chain${Date.now().toString(36)}${n++}@test.local`;

describe("cadena de hash de la auditoría", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  beforeAll(async () => { app = await makeApp(); pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL }); });
  afterAll(async () => { await wipe(); await pool.end(); await app.close(); });

  // La tabla es de sólo anexado: para retirar las filas de prueba hay que desactivar el trigger un momento.
  const wipe = async () => {
    await pool.query("ALTER TABLE audit_log DISABLE TRIGGER audit_log_append_only");
    await pool.query("DELETE FROM audit_log WHERE action LIKE 'chain.%'");
    await pool.query("ALTER TABLE audit_log ENABLE TRIGGER audit_log_append_only");
  };
  const mine = async () => (await pool.query("SELECT id, prev_hash, hash FROM audit_log WHERE action LIKE 'chain.%' ORDER BY id")).rows;
  const write = (action: string, extra: Record<string, unknown> = {}) => audit(app.db, { action, entity: "test", meta: { origen: "prueba" }, ...extra });

  it("encadena cada entrada con el hash de la anterior y la verificación pasa", async () => {
    await wipe();
    await write("chain.a");
    await write("chain.b", { actor: "a0000000-0000-4000-8000-000000000001", id: "ent-1", ip: "10.0.0.9" });
    await write("chain.c");
    const rs = await mine();
    expect(rs).toHaveLength(3);
    expect(rs[1]!.prev_hash).toBe(rs[0]!.hash);
    expect(rs[2]!.prev_hash).toBe(rs[1]!.hash);
    const rep = await auditChainVerify(app.db, { afterId: rs[0]!.id - 1 });
    expect(rep).toMatchObject({ ok: true, checked: 3, broken: [] });
    expect(await auditChainVerify(app.db)).toMatchObject({ ok: true, broken: [] });
  });

  it("diez escrituras simultáneas no bifurcan la cadena", async () => {
    await Promise.all(Array.from({ length: 10 }, (_, i) => write(`chain.c${i}`, { meta: { i } })));
    const rs = await mine();
    const window = await auditChainVerify(app.db, { afterId: rs[0]!.id - 1 });
    expect(window.ok).toBe(true);
    expect(window.checked).toBe(rs.length);
    for (let i = 1; i < rs.length; i++) expect(rs[i]!.prev_hash).toBe(rs[i - 1]!.hash);
  });

  it("el panel verifica la cadena (sólo admin)", async () => {
    const email = uniq();
    const reg = json(await app.inject({ method: "POST", url: "/api/v1/auth/register", payload: { email, password: PW, accept_terms: true } }));
    const user = reg.data.user.id as string;
    const userToken = reg.data.tokens.access_token as string;
    expect((await app.inject({ method: "GET", url: "/api/v1/admin/audit/verify", headers: { authorization: `Bearer ${userToken}` } })).statusCode).toBe(403);
    await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')", [user]);
    const admin = json(await app.inject({ method: "POST", url: "/api/v1/auth/login", payload: { email, password: PW } })).data.tokens.access_token as string;
    const res = json(await app.inject({ method: "GET", url: "/api/v1/admin/audit/verify", headers: { authorization: `Bearer ${admin}` } }));
    expect(res.data.ok).toBe(true);
    expect(res.data.broken).toEqual([]);
    expect(res.data.checked).toBeGreaterThan(0);
  });

  it("detecta una fila editada (hash) y una fila borrada (enlace)", async () => {
    const base = (await mine()).length;
    await write("chain.h1");
    await write("chain.h2", { meta: { original: true } });
    await write("chain.h3");
    const rs = (await mine()).slice(base);

    await pool.query("ALTER TABLE audit_log DISABLE TRIGGER audit_log_append_only");
    await pool.query("UPDATE audit_log SET action = 'chain.manipulada' WHERE id = $1", [rs[1]!.id]);
    await pool.query("ALTER TABLE audit_log ENABLE TRIGGER audit_log_append_only");
    const tampered = await auditChainVerify(app.db, { afterId: rs[0]!.id - 1 });
    expect(tampered.ok).toBe(false);
    expect(tampered.broken).toEqual([{ id: rs[1]!.id, reason: "hash" }]);

    const base2 = (await mine()).length;
    await write("chain.d1");
    await write("chain.d2");
    await write("chain.d3");
    const ds = (await mine()).slice(base2);
    await pool.query("ALTER TABLE audit_log DISABLE TRIGGER audit_log_append_only");
    await pool.query("DELETE FROM audit_log WHERE id = $1", [ds[1]!.id]);
    await pool.query("ALTER TABLE audit_log ENABLE TRIGGER audit_log_append_only");
    const deleted = await auditChainVerify(app.db, { afterId: ds[0]!.id - 1 });
    expect(deleted.ok).toBe(false);
    expect(deleted.broken).toEqual([{ id: ds[2]!.id, reason: "enlace" }]);
  });

  it("el trigger impide UPDATE y DELETE aunque sea desde SQL directo", async () => {
    await expect(pool.query("UPDATE audit_log SET action = 'x' WHERE action LIKE 'chain.%'")).rejects.toMatchObject({ code: "P0001" });
    await expect(pool.query("DELETE FROM audit_log WHERE action LIKE 'chain.%'")).rejects.toMatchObject({ code: "P0001" });
  });
});
