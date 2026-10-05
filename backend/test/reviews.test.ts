import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { screenReview } from "../src/modules/community/reviews.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = () => `rv${Date.now().toString(36)}${n++}@test.local`;

describe("moderación automática", () => {
  it("publica lo limpio y marca enlaces, contactos, gritos, repetición y groserías", () => {
    expect(screenReview("Playa hermosa, el agua estaba cristalina y había poca gente.")).toEqual([]);
    expect(screenReview("Visítenos en www.promo.com")).toContain("contains_link");
    expect(screenReview("Llámame al 809 555 1234")).toContain("contains_contact");
    expect(screenReview("escríbeme a yo@correo.com")).toContain("contains_contact");
    expect(screenReview("LO MEJOR DE TODO EL PAIS NO SE LO PIERDAN")).toContain("shouting");
    expect(screenReview("buenooooooooooo")).toContain("repeated_characters");
    expect(screenReview("qué mierda de servicio")).toContain("profanity");
  });
});

describe("reseñas del portal", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let cave: string;
  let admin: string;
  const call = (method: "GET" | "POST" | "PATCH" | "DELETE", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const signup = async (verified = true) => {
    const email = uniq();
    const res = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true, display_name: "Rosa Reseñas" } }));
    if (verified) await pool.query("UPDATE users SET email_verified_at = now() WHERE id = $1", [res.data.user.id]);
    return { token: res.data.tokens.access_token as string, id: res.data.user.id as string, email };
  };
  const review = (token: string, over: Record<string, unknown> = {}) =>
    call("POST", "/reviews", { token, payload: { entity_type: "cave", entity_id: cave, rating: 5, comment: "Una cueva impresionante, con guías muy amables.", ...over } });
  const reviewsOf = async () => json(await call("GET", "/caves/cueva-de-prueba/reviews"));

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    cave = randomUUID();
    await pool.query("INSERT INTO caves (id, name, slug, status, published_at, rating) VALUES ($1, 'Cueva de Prueba', 'cueva-de-prueba', 'published', now(), 0)", [cave]);
    const a = await signup();
    await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')", [a.id]);
    admin = json(await call("POST", "/auth/login", { payload: { email: a.email, password: PW } })).data.tokens.access_token;
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  it("una reseña limpia de una cuenta verificada se publica y actualiza la calificación del lugar", async () => {
    const u = await signup();
    const res = await review(u.token, { rating: 4, title: "Muy buena" });
    expect(res.statusCode).toBe(201);
    expect(json(res).data.status).toBe("approved");
    const list = await reviewsOf();
    expect(list.meta.summary).toMatchObject({ average: 4, count: 1 });
    expect(Number((await pool.query("SELECT rating FROM caves WHERE id = $1", [cave])).rows[0].rating)).toBe(4);
  });

  it("valida la entrada, exige sesión y permite una sola reseña por lugar", async () => {
    const u = await signup();
    expect((await call("POST", "/reviews", { payload: { entity_type: "cave", entity_id: cave, rating: 5 } })).statusCode).toBe(401);
    expect((await review(u.token, { rating: 6 })).statusCode).toBe(400);
    expect((await review(u.token, { comment: "corto" })).statusCode).toBe(400);
    expect((await review(u.token, { entity_type: "planeta" })).statusCode).toBe(400);
    expect((await review(u.token, { entity_id: randomUUID() })).statusCode).toBe(404);
    expect((await review(u.token)).statusCode).toBe(201);
    const dup = await review(u.token);
    expect(dup.statusCode).toBe(409);
    expect(json(dup).error.details.reason).toBe("ALREADY_REVIEWED");
  });

  it("lo dudoso o de cuentas sin verificar queda pendiente y no se ve hasta que un moderador lo aprueba", async () => {
    const before = (await reviewsOf()).meta.summary.count;
    const spam = await signup();
    const s = await review(spam.token, { comment: "Reserva ya en www.gangas.com y llama al 809 555 1234" });
    expect(json(s).data.status).toBe("pending");
    const unverified = await signup(false);
    const p = await review(unverified.token);
    expect(json(p).data.status).toBe("pending");
    expect((await reviewsOf()).meta.summary.count).toBe(before);

    const mine = json(await call("GET", "/me/reviews", { token: spam.token })).data;
    expect(mine[0]).toMatchObject({ status: "pending" });
    // "Mis reseñas" trae el lugar al que pertenece cada una, para poder mostrarla fuera de su ficha.
    expect(mine[0].entity).toMatchObject({ collection: "caves" });
    expect(typeof mine[0].entity.name).toBe("string");
    // El muro público sólo muestra lo aprobado, firmado de forma abreviada y sin identificar a quien escribe.
    const pendingId = json(s).data.id;
    const wall = json(await call("GET", "/reviews/recent?per_page=30&type=cave"));
    expect(wall.data.some((x: { id: string }) => x.id === pendingId)).toBe(false);
    for (const x of wall.data) { expect(x).not.toHaveProperty("user_id"); expect(x).not.toHaveProperty("display_name"); expect(x.entity).toMatchObject({ collection: "caves" }); expect(typeof x.author).toBe("string"); }
    expect((await call("GET", "/reviews/recent?type=planeta")).statusCode).toBe(400);
    const queue = json(await call("GET", "/admin/reviews?status=pending", { token: admin }));
    expect(queue.data.some((x: { id: string }) => x.id === json(s).data.id)).toBe(true);
    expect((await call("GET", "/admin/reviews", { token: spam.token })).statusCode).toBe(403);

    expect((await call("PATCH", `/admin/reviews/${json(p).data.id}`, { token: admin, payload: { status: "approved" } })).statusCode).toBe(204);
    expect((await call("PATCH", `/admin/reviews/${json(s).data.id}`, { token: admin, payload: { status: "rejected", note: "spam" } })).statusCode).toBe(204);
    expect((await reviewsOf()).meta.summary.count).toBe(before + 1);
    expect((await pool.query("SELECT 1 FROM audit_log WHERE action = 'review.rejected' AND entity_id = $1", [json(s).data.id])).rowCount).toBe(1);
  });

  it("editar vuelve a moderar, y sólo el dueño puede editar o borrar", async () => {
    const u = await signup(), other = await signup();
    const id = json(await review(u.token, { rating: 3 })).data.id;
    expect((await call("PATCH", `/reviews/${id}`, { token: other.token, payload: { rating: 1 } })).statusCode).toBe(404);
    expect((await call("DELETE", `/reviews/${id}`, { token: other.token })).statusCode).toBe(404);
    expect(json(await call("PATCH", `/reviews/${id}`, { token: u.token, payload: { rating: 5 } })).data.status).toBe("approved");
    expect(json(await call("PATCH", `/reviews/${id}`, { token: u.token, payload: { comment: "ahora con enlace https://spam.example.com" } })).data.status).toBe("pending");
    const count = (await reviewsOf()).meta.summary.count;
    expect((await call("DELETE", `/reviews/${id}`, { token: u.token })).statusCode).toBe(204);
    expect((await reviewsOf()).meta.summary.count).toBe(count);
    expect((await pool.query("SELECT 1 FROM reviews WHERE id = $1", [id])).rowCount).toBe(0);
  });

  it("votos útiles: uno por persona y no en la propia reseña", async () => {
    const author = await signup(), voter = await signup();
    const id = json(await review(author.token)).data.id;
    expect((await call("POST", `/reviews/${id}/helpful`, { token: author.token })).statusCode).toBe(400);
    expect((await call("POST", `/reviews/${id}/helpful`, { token: voter.token })).statusCode).toBe(204);
    expect((await call("POST", `/reviews/${id}/helpful`, { token: voter.token })).statusCode).toBe(204);
    expect((await pool.query("SELECT helpful_count FROM reviews WHERE id = $1", [id])).rows[0].helpful_count).toBe(1);
  });

  it("tres reportes distintos ocultan la reseña hasta revisarla; un moderador puede restaurarla", async () => {
    const author = await signup();
    const id = json(await review(author.token)).data.id;
    const before = (await reviewsOf()).meta.summary.count;
    for (let i = 0; i < 3; i++) {
      const rep = await signup();
      expect((await call("POST", `/reviews/${id}/report`, { token: rep.token, payload: { reason: "fake" } })).statusCode).toBe(204);
      if (i === 0) expect((await call("POST", `/reviews/${id}/report`, { token: rep.token, payload: { reason: "fake" } })).statusCode).toBe(204); // repetido: no cuenta doble
    }
    expect((await pool.query("SELECT status, report_count FROM reviews WHERE id = $1", [id])).rows[0]).toEqual({ status: "pending", report_count: 3 });
    expect((await reviewsOf()).meta.summary.count).toBe(before - 1);
    const reported = json(await call("GET", "/admin/reviews?status=pending&reported=true", { token: admin }));
    expect(reported.data[0].id).toBe(id);
    expect((await call("PATCH", `/admin/reviews/${id}`, { token: admin, payload: { status: "approved" } })).statusCode).toBe(204);
    expect((await reviewsOf()).meta.summary.count).toBe(before);
    expect((await pool.query("SELECT report_count FROM reviews WHERE id = $1", [id])).rows[0].report_count).toBe(0);
  });

  it("la respuesta oficial es del equipo del sitio", async () => {
    const author = await signup();
    const id = json(await review(author.token)).data.id;
    expect((await call("POST", `/reviews/${id}/reply`, { token: author.token, payload: { reply: "gracias" } })).statusCode).toBe(403);
    expect((await call("POST", `/reviews/${id}/reply`, { token: admin, payload: { reply: "¡Gracias por visitarnos!" } })).statusCode).toBe(204);
    expect((await pool.query("SELECT reply FROM reviews WHERE id = $1", [id])).rows[0].reply).toBe("¡Gracias por visitarnos!");
  });
});
