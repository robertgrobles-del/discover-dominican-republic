import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
const tag = Date.now().toString(36);
let n = 0;

describe("revisiones periódicas de acceso (plan de accesos, punto 99)", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  type Account = { id: string; email: string; token: string };
  let alice: Account, bob: Account, editor: Account, moderator: Account, plain: Account;

  const call = (method: "GET" | "POST", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const login = async (email: string) => json(await call("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token as string;
  const account = async (role?: string): Promise<Account> => {
    const email = `ar${tag}${n++}@test.local`;
    const reg = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true, display_name: "Revisión Prueba" } }));
    const id = reg.data.user.id as string;
    await pool.query("UPDATE users SET email_verified_at = now() WHERE id = $1", [id]);
    if (role) await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [id, role]);
    return { id, email, token: role ? await login(email) : (reg.data.tokens.access_token as string) };
  };
  const hasRole = async (id: string, role: string) => !!(await pool.query("SELECT 1 FROM user_roles WHERE user_id = $1 AND role = $2::app_role", [id, role])).rowCount;
  type Item = { id: string; subject_user_id: string; role: string; decision: string | null };
  const decide = (reviewId: string, itemId: string, token: string, body: object) => call("POST", `/admin/access-reviews/${reviewId}/items/${itemId}/decide`, { token, payload: body });

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    // Otras suites pueden haber dejado una revisión abierta: sólo puede haber una a la vez.
    await pool.query("UPDATE access_reviews SET status = 'closed', closed_at = now() WHERE status = 'open'");
    alice = await account("admin");
    bob = await account("admin");
    editor = await account("editor");
    moderator = await account("moderator");
    plain = await account();
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  it("abre una foto de los roles del personal, sin incluir a quien sólo es usuario, y no permite dos abiertas", async () => {
    expect((await call("POST", "/admin/access-reviews", { token: editor.token })).statusCode).toBe(403);
    const res = await call("POST", "/admin/access-reviews", { token: alice.token });
    expect(res.statusCode).toBe(201);
    const review = json(res).data as { id: string; status: string; due_at: string; items: Item[] };
    expect(review.status).toBe("open");
    expect(new Date(review.due_at).getTime()).toBeGreaterThan(Date.now() + 13 * 86_400_000);
    const mine = review.items.filter((i) => [alice.id, bob.id, editor.id, moderator.id, plain.id].includes(i.subject_user_id));
    expect(mine.map((i) => `${i.subject_user_id}:${i.role}`).sort()).toEqual([`${alice.id}:admin`, `${bob.id}:admin`, `${editor.id}:editor`, `${moderator.id}:moderator`].sort());
    expect(mine.every((i) => i.decision === null)).toBe(true);

    expect((await call("POST", "/admin/access-reviews", { token: bob.token })).statusCode).toBe(409);
    const listed = json(await call("GET", "/admin/access-reviews", { token: bob.token })).data.find((r: { id: string }) => r.id === review.id);
    expect(listed).toMatchObject({ status: "open", overdue: false, revoked: 0 });
    expect(listed.pending).toBe(listed.items);
  });

  it("confirmar conserva el acceso; retirar lo quita, cierra sesiones y avisa; nadie revisa los suyos", async () => {
    const review = json(await call("GET", "/admin/access-reviews", { token: alice.token })).data.find((r: { status: string }) => r.status === "open");
    const items = json(await call("GET", `/admin/access-reviews/${review.id}`, { token: alice.token })).data.items as Item[];
    const of = (userId: string) => items.find((i) => i.subject_user_id === userId)!;

    expect((await decide(review.id, of(editor.id).id, alice.token, { decision: "keep", justification: "no" })).statusCode).toBe(400);
    const self = await decide(review.id, of(alice.id).id, alice.token, { decision: "keep", justification: "Sigo necesitándolo" });
    expect(self.statusCode).toBe(403);
    expect(json(self).error.details.code).toBe("SELF_REVIEW");

    expect((await decide(review.id, of(editor.id).id, alice.token, { decision: "keep", justification: "Sigue en el equipo editorial" })).statusCode).toBe(200);
    expect(await hasRole(editor.id, "editor")).toBe(true);
    expect((await decide(review.id, of(editor.id).id, bob.token, { decision: "revoke", justification: "Segundo intento" })).statusCode).toBe(422); // ya revisado

    const session = await login(moderator.email);
    expect((await decide(review.id, of(moderator.id).id, alice.token, { decision: "revoke", justification: "Dejó el equipo de moderación" })).statusCode).toBe(200);
    expect(await hasRole(moderator.id, "moderator")).toBe(false);
    expect((await call("GET", "/auth/me", { token: session })).statusCode).toBe(401);
    expect((await pool.query("SELECT 1 FROM notifications WHERE user_id = $1 AND title LIKE 'Se retiró tu acceso%'", [moderator.id])).rowCount).toBe(1);
    const log = (await pool.query<{ actor_id: string; meta: { justification: string; role: string } }>("SELECT actor_id, meta FROM audit_log WHERE action = 'access_review.revoke' AND entity_id = $1", [moderator.id])).rows[0]!;
    expect(log.actor_id).toBe(alice.id);
    expect(log.meta).toMatchObject({ role: "moderator", justification: "Dejó el equipo de moderación" });
  });

  it("no se cierra con accesos sin revisar; al completarla queda cerrada con su resumen", async () => {
    const review = json(await call("GET", "/admin/access-reviews", { token: alice.token })).data.find((r: { status: string }) => r.status === "open");
    const early = await call("POST", `/admin/access-reviews/${review.id}/close`, { token: alice.token });
    expect(early.statusCode).toBe(422);
    expect(json(early).error.details.code).toBe("REVIEW_INCOMPLETE");

    // Cada administradora revisa lo que no es suyo.
    const items = json(await call("GET", `/admin/access-reviews/${review.id}`, { token: alice.token })).data.items as Item[];
    for (const item of items.filter((i) => i.decision === null)) {
      const reviewer = item.subject_user_id === alice.id ? bob : alice;
      expect((await decide(review.id, item.id, reviewer.token, { decision: "keep", justification: "Acceso vigente y necesario" })).statusCode, `${item.role}`).toBe(200);
    }
    expect((await call("POST", `/admin/access-reviews/${review.id}/close`, { token: bob.token })).statusCode).toBe(204);
    const closed = json(await call("GET", "/admin/access-reviews", { token: bob.token })).data.find((r: { id: string }) => r.id === review.id);
    expect(closed).toMatchObject({ status: "closed", pending: 0, revoked: 1 });
    expect((await decide(review.id, items[0]!.id, alice.token, { decision: "keep", justification: "Después del cierre" })).statusCode).toBe(422);
  });

  it("la revisión no puede dejar el sistema sin administradores", async () => {
    // Deja a bob como único admin activo fuera de alice y abre una revisión nueva.
    await pool.query("DELETE FROM user_roles WHERE role = 'admin' AND user_id NOT IN ($1, $2)", [alice.id, bob.id]);
    const review = json(await call("POST", "/admin/access-reviews", { token: alice.token })).data as { id: string; items: Item[] };
    const bobItem = review.items.find((i) => i.subject_user_id === bob.id && i.role === "admin")!;
    const aliceItem = review.items.find((i) => i.subject_user_id === alice.id && i.role === "admin")!;
    expect((await decide(review.id, bobItem.id, alice.token, { decision: "revoke", justification: "Reducción del equipo administrador" })).statusCode).toBe(200);
    // Alice es ahora la última administradora: nadie puede retirarle el rol (y bob ya no es admin).
    await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin') ON CONFLICT DO NOTHING", [bob.id]);
    const bobAgain = await login(bob.email);
    await pool.query("DELETE FROM user_roles WHERE user_id = $1 AND role = 'admin'", [bob.id]);
    const last = await decide(review.id, aliceItem.id, bobAgain, { decision: "revoke", justification: "Intento de dejar el sistema sin admin" });
    expect(last.statusCode).toBe(422);
    expect(json(last).error.details.code).toBe("LAST_ADMIN");
    expect(await hasRole(alice.id, "admin")).toBe(true);
    await pool.query("UPDATE access_reviews SET status = 'closed', closed_at = now() WHERE id = $1", [review.id]);
  });

  it("el trabajo abre la revisión cuando pasaron 90 días de la última y recuerda las vencidas una vez por semana", async () => {
    await pool.query("UPDATE access_reviews SET closed_at = now() - interval '10 days' WHERE status = 'closed'");
    expect((await app.jobs.runNow("access.reviews.schedule")).result).toMatchObject({ opened: false });

    await pool.query("UPDATE access_reviews SET closed_at = now() - interval '91 days' WHERE status = 'closed'");
    expect((await app.jobs.runNow("access.reviews.schedule")).result).toMatchObject({ opened: true, overdue_reminders: 0 });
    const open = (await pool.query<{ id: string; opened_by: string | null }>("SELECT id, opened_by FROM access_reviews WHERE status = 'open'")).rows;
    expect(open).toHaveLength(1);
    expect(open[0]!.opened_by).toBeNull(); // abierta por el sistema
    expect((await pool.query("SELECT 1 FROM notifications WHERE user_id = $1 AND data->>'access_review_id' = $2", [alice.id, open[0]!.id])).rowCount).toBe(1);

    await pool.query("UPDATE access_reviews SET due_at = now() - interval '1 day' WHERE id = $1", [open[0]!.id]);
    expect((await app.jobs.runNow("access.reviews.schedule")).result).toMatchObject({ opened: false, overdue_reminders: 1 });
    expect((await app.jobs.runNow("access.reviews.schedule")).result).toMatchObject({ overdue_reminders: 0 });
    await pool.query("UPDATE access_reviews SET status = 'closed', closed_at = now() WHERE id = $1", [open[0]!.id]);
  });
});
