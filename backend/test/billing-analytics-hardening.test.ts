import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = () => `bh${Date.now().toString(36)}${n++}@test.local`;
const tag = Date.now().toString(36);

describe("comprobantes, llaves B2B, borrado de cuenta y analítica anónima", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  const call = (method: "GET" | "POST" | "DELETE", url: string, opts: { token?: string; payload?: unknown; headers?: Record<string, string> } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: { ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}), ...opts.headers } });
  const account = async (role?: string) => {
    const email = uniq();
    const reg = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true } }));
    const id = reg.data.user.id as string;
    if (!role) return { id, token: reg.data.tokens.access_token as string };
    await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [id, role]);
    return { id, token: json(await call("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token as string };
  };
  const b2bKey = async (token: string) => json(await call("POST", "/b2b/api-keys", { token, payload: { client_name: "Agencia prueba" } })).data.key as string;
  const aggregate = (key: string) => call("GET", "/api/v1/b2b/analytics/aggregate", { headers: { "x-api-key": key } });

  beforeAll(async () => { app = await makeApp(); pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL }); });
  afterAll(async () => {
    await pool.query("DELETE FROM analytics_events WHERE session_id LIKE $1", [`bh-${tag}%`]);
    await pool.end(); await app.close();
  });

  it("un comprobante fiscal sólo lo consulta personal admin, no cualquier sesión", async () => {
    const admin = await account("admin"), user = await account();
    const ref = `bh-ref-${tag}`;
    const issued = await call("POST", "/invoices/issue", { token: admin.token, payload: { ncf_type: "B02", buyer_name: "Comprador Prueba", buyer_rnc_cedula: "00100000001", subtotal: 100, itbis: 0, currency: "USD", reference_type: "booking", reference_id: ref } });
    expect(issued.statusCode).toBe(201);
    const ncf = json(issued).data.ncf as string;
    expect((await call("GET", `/invoices/${ncf}`, { token: user.token })).statusCode).toBe(403);
    expect((await call("GET", `/invoices?reference_type=booking&reference_id=${ref}`, { token: user.token })).statusCode).toBe(403);
    expect((await call("GET", `/invoices/${ncf}`, { token: admin.token })).statusCode).toBe(200);
    expect(json(await call("GET", `/invoices?reference_type=booking&reference_id=${ref}`, { token: admin.token })).data).toHaveLength(1);
  });

  it("una llave B2B deja de valer cuando su dueño es suspendido", async () => {
    const u = await account();
    const key = await b2bKey(u.token);
    expect((await aggregate(key)).statusCode).toBe(200);
    await pool.query("UPDATE users SET status = 'suspended' WHERE id = $1", [u.id]);
    expect((await aggregate(key)).statusCode).toBe(401);
    await pool.query("UPDATE users SET status = 'active' WHERE id = $1", [u.id]);
    await pool.query("UPDATE profiles SET is_suspended = true WHERE id = $1", [u.id]);
    expect((await aggregate(key)).statusCode).toBe(401);
  });

  it("el borrado de cuenta revoca llaves B2B, borra OAuth y push, y limpia el texto de los tickets", async () => {
    const u = await account();
    const key = await b2bKey(u.token);
    await pool.query("INSERT INTO oauth_identities (user_id, provider, subject, email) VALUES ($1, 'google', $2, 'real@test.local')", [u.id, `sub-${tag}-${u.id}`]);
    await pool.query("INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth) VALUES ($1, $2, 'k', 'a')", [u.id, `https://push.test.local/${u.id}`]);
    const ticket = (await pool.query<{ id: string }>("INSERT INTO support_tickets (user_id, subject, description) VALUES ($1, 'Mi teléfono 809', 'Llamar a Ana') RETURNING id", [u.id])).rows[0]!.id;
    expect((await call("DELETE", "/me", { token: u.token, payload: { password: PW } })).statusCode).toBe(200);
    await pool.query("UPDATE profiles SET deletion_requested_at = now() - interval '31 days' WHERE id = $1", [u.id]);
    await app.jobs.runNow("gdpr.process");
    expect((await aggregate(key)).statusCode).toBe(401);
    expect((await pool.query("SELECT is_active FROM b2b_api_keys WHERE user_id = $1", [u.id])).rows.every((r) => r.is_active === false)).toBe(true);
    expect((await pool.query("SELECT 1 FROM oauth_identities WHERE user_id = $1", [u.id])).rowCount).toBe(0);
    expect((await pool.query("SELECT 1 FROM push_subscriptions WHERE user_id = $1", [u.id])).rowCount).toBe(0);
    expect((await pool.query("SELECT user_id, subject, description FROM support_tickets WHERE id = $1", [ticket])).rows[0]).toEqual({ user_id: null, subject: "[eliminado]", description: "[eliminado]" });
  });

  it("un conteo de resultados no entero no rompe las búsquedas populares ni el reporte", async () => {
    const admin = await account("admin");
    const events = ["abc", 1.5, 99999999999].map((results) => ({ type: "search", session_id: `bh-${tag}-cast`, props: { q: `roto ${tag}`, results } }));
    expect((await call("POST", "/analytics/events", { payload: { events } })).statusCode).toBe(204);
    const fresh = await makeApp(); // caché en memoria vacía
    try { expect((await fresh.inject({ method: "GET", url: "/api/v1/search/popular" })).statusCode).toBe(200); } finally { await fresh.close(); }
    expect((await call("GET", "/admin/analytics/search-terms", { token: admin.token })).statusCode).toBe(200);
  });

  it("las búsquedas que reporta el cliente no se publican en la lista de populares", async () => {
    const q = `termino plantado ${tag}`;
    const e = { type: "search", session_id: `bh-${tag}-pop`, props: { q, results: 5 } };
    expect((await call("POST", "/analytics/events", { payload: { consent: true, events: [e, e, e] } })).statusCode).toBe(204);
    const fresh = await makeApp();
    try { expect(json(await fresh.inject({ method: "GET", url: "/api/v1/search/popular" })).data).not.toContain(q); } finally { await fresh.close(); }
  });

  it("un U+0000 en la página, la sesión o las propiedades se limpia y el evento se guarda", async () => {
    const res = await call("POST", "/analytics/events", { payload: { events: [{ type: "page_view", page: "/a\u0000b", session_id: `bh-${tag}-nul\u0000`, props: { k: "a\u0000b" } }] } });
    expect(res.statusCode).toBe(204);
    const row = (await pool.query("SELECT page, metadata FROM analytics_events WHERE session_id = $1", [`bh-${tag}-nul`])).rows[0];
    expect(row).toEqual({ page: "/ab", metadata: { k: "ab" } });
  });
});
