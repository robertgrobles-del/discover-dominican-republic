import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { validateAnswers } from "../src/modules/community/campaigns.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
const DEST = "d1000000-0000-4000-8000-000000000001"; // Punta Cana (provincia 2222…)
const PROVINCE = "22222222-2222-4222-8222-222222222222";
let n = 0;
const uniq = () => `so${Date.now().toString(36)}${n++}@test.local`;

describe("validación de respuestas de encuestas", () => {
  const qs = [
    { id: "sat", type: "rating" as const, label: "Satisfacción", required: true },
    { id: "rec", type: "nps" as const, label: "Recomendarías", required: false },
    { id: "com", type: "text" as const, label: "Comentario", required: false },
    { id: "med", type: "choice" as const, label: "Medio", required: false, options: ["auto", "bus"] },
    { id: "act", type: "multi" as const, label: "Actividades", required: false, options: ["playa", "montaña", "ciudad"] },
  ];
  it("acepta respuestas válidas y extrae el NPS", () => {
    expect(validateAnswers(qs, { sat: 4, rec: 9, com: " Genial ", med: "bus", act: ["playa", "ciudad"] })).toEqual({ clean: { sat: 4, rec: 9, com: "Genial", med: "bus", act: ["playa", "ciudad"] }, nps: 9 });
  });
  it("rechaza faltantes, fuera de rango, opciones ajenas y preguntas desconocidas", () => {
    for (const bad of [{}, { sat: 6 }, { sat: 3.5 }, { sat: 3, rec: 11 }, { sat: 3, med: "avion" }, { sat: 3, act: ["playa", "playa"] }, { sat: 3, act: "playa" }, { sat: 3, otra: 1 }, { sat: 3, com: "x".repeat(2001) }]) {
      expect(() => validateAnswers(qs, bad as Record<string, unknown>), JSON.stringify(bad)).toThrow();
    }
  });
});

describe("RD Social, encuestas, concursos y vacaciones", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let admin: string;
  const call = (method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const signup = async (verified = true, name = "Ana Social") => {
    const email = uniq();
    const res = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true, display_name: name } }));
    if (verified) await pool.query("UPDATE users SET email_verified_at = now() WHERE id = $1", [res.data.user.id]);
    return { token: res.data.tokens.access_token as string, id: res.data.user.id as string, email };
  };
  const post = (token: string, over: Record<string, unknown> = {}) => call("POST", "/social/posts", { token, payload: { content: "Un atardecer increíble en la playa", ...over } });

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    const a = await signup();
    await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')", [a.id]);
    admin = json(await call("POST", "/auth/login", { payload: { email: a.email, password: PW } })).data.tokens.access_token;
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  describe("publicaciones", () => {
    it("publica con correo verificado, valida contenido y límite diario", async () => {
      const u = await signup();
      expect((await call("POST", "/social/posts", { payload: { content: "x" } })).statusCode).toBe(401);
      expect((await post((await signup(false)).token)).statusCode).toBe(403);
      for (const bad of [{ content: "" }, { content: "a".repeat(1001) }, { media: ["http://x.com/a.jpg"] }, { destination_id: randomUUID() }]) expect((await post(u.token, bad)).statusCode, JSON.stringify(bad)).toBe(bad.destination_id ? 400 : 400);
      const spam = await post(u.token, { content: "Compra ya en www.gangas.com o llama al 809 555 1234" });
      expect(spam.statusCode).toBe(422);
      expect(json(spam).error.details.code).toBe("CONTENT_REJECTED");
      const ok = await post(u.token, { media: ["https://cdn.test/a.jpg", "https://cdn.test/b.jpg"], location: "Bávaro", destination_id: DEST });
      expect(ok.statusCode).toBe(201);
      const t = await signup();
      for (let i = 0; i < 10; i++) expect((await post(t.token, { content: `Publicación número ${i} de prueba` })).statusCode).toBe(201);
      const over = await post(t.token, { content: "Una más de prueba hoy" });
      expect(over.statusCode).toBe(429);
      expect(json(over).error.details.code).toBe("DAILY_POST_LIMIT");
      expect(json(await call("GET", "/social/me/comment-stats", { token: t.token })).data.posts_today).toBe(10);
    });

    it("feed: cursor, siguiendo, tendencia, provincia y liked_by_me", async () => {
      const a = await signup(true, "Autor Uno"), b = await signup(true, "Lector Dos");
      const ids: string[] = [];
      for (let i = 0; i < 3; i++) { ids.push(json(await post(a.token, { content: `Feed post ${i} lindo día`, ...(i === 0 ? { destination_id: DEST } : {}) })).data.id); await new Promise((r) => setTimeout(r, 15)); }
      const p1 = json(await call("GET", "/social/feed?limit=2", { token: b.token }));
      expect(p1.data).toHaveLength(2);
      expect(p1.data[0].author.name).toBe("Autor U.");
      expect(p1.data[0].author.email).toBeUndefined();
      expect(p1.meta.next_cursor).toBeTruthy();
      const p2 = json(await call("GET", `/social/feed?limit=2&cursor=${p1.meta.next_cursor}`, { token: b.token }));
      expect(p2.data.map((x: { id: string }) => x.id)).not.toContain(p1.data[0].id);
      expect((await call("GET", "/social/feed?cursor=basura")).statusCode).toBe(400);

      expect((await call("GET", "/social/feed?filter=following")).statusCode).toBe(401);
      expect(json(await call("GET", "/social/feed?filter=following", { token: b.token })).data).toHaveLength(0);
      await call("POST", `/users/${a.id}/follow`, { token: b.token });
      const following = json(await call("GET", "/social/feed?filter=following", { token: b.token })).data;
      expect(following.map((x: { id: string }) => x.id).sort()).toEqual([...ids].sort());

      const prov = json(await call("GET", `/social/feed?filter=province&province_id=${PROVINCE}`)).data;
      expect(prov.some((x: { id: string }) => x.id === ids[0])).toBe(true);
      expect(prov.every((x: { destination_id: string }) => x.destination_id === DEST)).toBe(true);

      await call("PUT", `/social/posts/${ids[1]}/like`, { token: b.token });
      const liked = json(await call("GET", "/social/feed?filter=trending", { token: b.token })).data;
      expect(liked[0].id).toBe(ids[1]);
      expect(liked[0]).toMatchObject({ likes_count: 1, liked_by_me: true });
      expect(json(await call("GET", "/social/feed?filter=trending")).data[0].liked_by_me).toBe(false);
    });

    it("likes idempotentes que mantienen el contador; comentarios con reglas y contadores", async () => {
      const a = await signup(), b = await signup();
      const id = json(await post(a.token)).data.id;
      for (let i = 0; i < 2; i++) expect((await call("PUT", `/social/posts/${id}/like`, { token: b.token })).statusCode).toBe(204);
      const likes = async () => (await pool.query("SELECT likes_count, comments_count FROM social_posts WHERE id = $1", [id])).rows[0];
      expect((await likes()).likes_count).toBe(1);
      await call("DELETE", `/social/posts/${id}/like`, { token: b.token });
      await call("DELETE", `/social/posts/${id}/like`, { token: b.token });
      expect((await likes()).likes_count).toBe(0);

      expect((await call("POST", `/social/posts/${id}/comments`, { token: b.token, payload: { content: "ok" } })).statusCode).toBe(400);
      expect((await call("POST", `/social/posts/${id}/comments`, { token: (await signup(false)).token, payload: { content: "Hola desde sin verificar" } })).statusCode).toBe(403);
      expect((await call("POST", `/social/posts/${id}/comments`, { token: b.token, payload: { content: "Visita www.spam.com ya" } })).statusCode).toBe(422);
      const c = await call("POST", `/social/posts/${id}/comments`, { token: b.token, payload: { content: "¡Qué lugar tan lindo!" } });
      expect(c.statusCode).toBe(201);
      expect(json(c).data.xp_awarded).toBe(0);
      expect((await call("POST", `/social/posts/${id}/comments`, { token: b.token, payload: { content: "¡Qué lugar tan lindo!" } })).statusCode).toBe(409);
      expect((await likes()).comments_count).toBe(1);
      const list = json(await call("GET", `/social/posts/${id}/comments`));
      expect(list.data).toHaveLength(1);
      expect(list.data[0].author.name).toBe("Ana S.");
      expect(json(await call("GET", "/social/me/comment-stats", { token: b.token })).data.total_comments).toBe(1);
      expect((await call("DELETE", `/social/comments/${list.data[0].id}`, { token: a.token })).statusCode).toBe(404); // ni el autor del post ni un tercero
      expect((await call("DELETE", `/social/comments/${list.data[0].id}`, { token: b.token })).statusCode).toBe(204);
      expect((await likes()).comments_count).toBe(0);
    });

    it("borrar: el dueño o un moderador; los demás no ven que existe", async () => {
      const a = await signup(), b = await signup();
      const id = json(await post(a.token)).data.id;
      expect((await call("DELETE", `/social/posts/${id}`, { token: b.token })).statusCode).toBe(404);
      expect((await call("DELETE", `/social/posts/${id}`, { token: admin })).statusCode).toBe(204);
      expect(json(await call("GET", "/social/feed?limit=50")).data.some((x: { id: string }) => x.id === id)).toBe(false);
      expect((await call("PUT", `/social/posts/${id}/like`, { token: b.token })).statusCode).toBe(404);
      expect((await pool.query("SELECT 1 FROM audit_log WHERE action = 'social.post_deleted' AND entity_id = $1", [id])).rowCount).toBe(1);
    });

    it("reportes: uno por persona, a los 3 se oculta y un moderador lo restaura", async () => {
      const a = await signup();
      const id = json(await post(a.token)).data.id;
      const report = (token: string) => call("POST", "/ugc/reports", { token, payload: { target_type: "post", target_id: id, reason: "spam" } });
      const r1 = await signup();
      expect((await report(r1.token)).statusCode).toBe(204);
      expect((await report(r1.token)).statusCode).toBe(204); // repetido: no suma
      for (let i = 0; i < 2; i++) await report((await signup()).token);
      expect((await pool.query("SELECT is_active, report_count FROM social_posts WHERE id = $1", [id])).rows[0]).toEqual({ is_active: false, report_count: 3 });
      expect((await call("POST", "/ugc/reports", { token: r1.token, payload: { target_type: "post", target_id: randomUUID(), reason: "spam" } })).statusCode).toBe(404);
      const queue = json(await call("GET", "/admin/ugc/reports", { token: admin })).data as { id: string; target_id: string }[];
      expect(queue.filter((x) => x.target_id === id)).toHaveLength(3);
      expect((await call("GET", "/admin/ugc/reports", { token: r1.token })).statusCode).toBe(403);
      expect((await call("PATCH", `/admin/social/posts/${id}`, { token: admin, payload: { is_active: true } })).statusCode).toBe(204);
      expect((await call("PATCH", `/admin/ugc/reports/${queue.find((x) => x.target_id === id)!.id}`, { token: admin, payload: { status: "revisado" } })).statusCode).toBe(204);
      expect(json(await call("GET", "/social/feed?limit=50")).data.some((x: { id: string }) => x.id === id)).toBe(true);
    });

    it("medios de usuarios: quedan pendientes y sólo se ven al aprobarse", async () => {
      const u = await signup();
      const body = { media_url: "https://cdn.test/foto.jpg", media_type: "photo", entity_type: "destination", entity_id: DEST };
      expect((await call("POST", "/ugc/media", { token: (await signup(false)).token, payload: body })).statusCode).toBe(403);
      expect((await call("POST", "/ugc/media", { token: u.token, payload: { ...body, entity_id: randomUUID() } })).statusCode).toBe(404);
      const res = await call("POST", "/ugc/media", { token: u.token, payload: body });
      expect(res.statusCode).toBe(201);
      const id = json(res).data.id;
      const visible = async () => json(await call("GET", `/ugc/media?entity_type=destination&entity_id=${DEST}`)).data.some((x: { id: string }) => x.id === id);
      expect(await visible()).toBe(false);
      expect((await call("PATCH", `/admin/ugc/media/${id}`, { token: admin, payload: { status: "approved" } })).statusCode).toBe(204);
      expect(await visible()).toBe(true);
    });
  });

  describe("encuestas", () => {
    it("el admin crea, cualquiera responde y los resultados calculan NPS", async () => {
      const slug = `nps-${Date.now().toString(36)}`;
      const questions = [{ id: "rec", type: "nps", label: "¿Nos recomendarías?", required: true }, { id: "med", type: "choice", label: "Medio", options: ["auto", "bus"] }];
      const u = await signup();
      expect((await call("POST", "/admin/surveys", { token: u.token, payload: { slug, title: "Encuesta NPS", kind: "nps", questions } })).statusCode).toBe(403);
      expect((await call("POST", "/admin/surveys", { token: admin, payload: { slug, title: "Encuesta NPS", kind: "nps", questions: [...questions, questions[0]] } })).statusCode).toBe(400);
      expect((await call("POST", "/admin/surveys", { token: admin, payload: { slug, title: "Encuesta NPS", kind: "nps", questions } })).statusCode).toBe(201);
      expect((await call("POST", "/admin/surveys", { token: admin, payload: { slug, title: "Otra", questions } })).statusCode).toBe(409);
      expect(json(await call("GET", `/surveys/${slug}`)).data.questions).toHaveLength(2);
      const answer = (score: number, token?: string, med = "auto") => call("POST", `/surveys/${slug}/responses`, { token, payload: { answers: { rec: score, med } } });
      expect((await answer(10)).statusCode).toBe(201); // invitado
      expect((await answer(9, u.token)).statusCode).toBe(201);
      expect((await answer(9, u.token)).statusCode).toBe(409); // con cuenta: una vez
      expect((await answer(3, (await signup()).token, "bus")).statusCode).toBe(201);
      expect((await call("POST", `/surveys/${slug}/responses`, { payload: { answers: { med: "auto" } } })).statusCode).toBe(400); // falta la requerida
      const res = json(await call("GET", `/admin/surveys/${slug}/results`, { token: admin })).data;
      expect(res.responses).toBe(3);
      expect(res.nps).toEqual({ score: 33, promoters: 2, detractors: 1, passives: 0, count: 3 });
      expect(res.questions.find((q: { id: string }) => q.id === "med").distribution).toEqual({ auto: 2, bus: 1 });
      await call("PATCH", `/admin/surveys/${slug}`, { token: admin, payload: { is_active: false } });
      expect((await call("GET", `/surveys/${slug}`)).statusCode).toBe(404);
    });
  });

  describe("concursos", () => {
    const iso = (offsetHours: number) => new Date(Date.now() + offsetHours * 3_600_000).toISOString();
    it("sólo se inscribe a un concurso abierto, una vez, con correo verificado y edad mínima", async () => {
      const slug = `sorteo-${Date.now().toString(36)}`;
      const create = (over: object) => call("POST", "/admin/contests", { token: admin, payload: { slug, title: "Sorteo de verano", prize: "Viaje", starts_at: iso(-1), ends_at: iso(24), status: "published", min_age: 18, max_entries: 2, ...over } });
      expect((await create({ ends_at: iso(-2) })).statusCode).toBe(400);
      expect((await create({})).statusCode).toBe(201);
      expect((await create({})).statusCode).toBe(409);
      expect(json(await call("GET", "/contests")).data.some((c: { slug: string }) => c.slug === slug)).toBe(true);
      const reg = (token: string, age = 30) => call("POST", `/contests/${slug}/register`, { token, payload: { name: "Ana Concursante", age, accept_rules: true } });
      const u = await signup();
      expect((await reg((await signup(false)).token)).statusCode).toBe(403);
      const young = await reg(u.token, 16);
      expect(young.statusCode).toBe(422);
      expect(json(young).error.details.code).toBe("UNDERAGE");
      expect((await call("POST", `/contests/${slug}/register`, { token: u.token, payload: { name: "Ana", age: 30, accept_rules: false } })).statusCode).toBe(400);
      expect((await reg(u.token)).statusCode).toBe(201);
      expect((await reg(u.token)).statusCode).toBe(409);
      expect((await reg((await signup()).token)).statusCode).toBe(201);
      expect(json(await reg((await signup()).token)).error.details.code).toBe("CONTEST_FULL");
      expect((await call("POST", `/contests/${slug}/draw`, { token: admin, payload: {} })).statusCode).toBe(404);
      expect(json(await call("POST", `/admin/contests/${slug}/draw`, { token: admin, payload: {} })).error.details.code).toBe("CONTEST_OPEN");
      const regs = json(await call("GET", `/admin/contests/${slug}/registrations`, { token: admin }));
      expect(regs.meta.total).toBe(2);
      // Termina el concurso y se sortea: ganadores públicos con nombre abreviado.
      await pool.query("UPDATE contests SET starts_at = now() - interval '3 days', ends_at = now() - interval '1 day' WHERE slug = $1", [slug]);
      expect((await reg((await signup()).token)).statusCode).toBe(422);
      const draw = await call("POST", `/admin/contests/${slug}/draw`, { token: admin, payload: { winners: 1 } });
      expect(draw.statusCode).toBe(200);
      expect(json(draw).data.winners).toHaveLength(1);
      expect(json(await call("POST", `/admin/contests/${slug}/draw`, { token: admin, payload: {} })).error.details.code).toBe("ALREADY_DRAWN");
      expect(json(await call("GET", `/contests/${slug}/winners`)).data[0]).toEqual({ name: "Ana C.", country: null });
    });
  });

  describe("vacaciones", () => {
    it("acepta visitantes con contacto o usuarios con cuenta, y valida fechas y destino", async () => {
      const future = (d: number) => new Date(Date.now() + d * 86_400_000).toISOString().slice(0, 10);
      const base = { destination_id: DEST, start_date: future(30), end_date: future(37), travelers: 2 };
      const send = (payload: object, token?: string) => call("POST", "/vacation-registrations", { token, payload });
      expect((await send(base)).statusCode).toBe(400); // invitado sin contacto
      expect((await send({ ...base, name: "Luis Visitante", email: "luis@test.local" })).statusCode).toBe(202);
      expect((await send(base, (await signup()).token)).statusCode).toBe(202);
      expect((await send({ ...base, end_date: future(20), name: "Luis V", email: "l@test.local" })).statusCode).toBe(400);
      expect((await send({ ...base, start_date: "2020-01-01", end_date: "2020-01-05", name: "Luis V", email: "l@test.local" })).statusCode).toBe(400);
      expect((await send({ ...base, destination_id: randomUUID(), name: "Luis V", email: "l@test.local" })).statusCode).toBe(400);
      expect((await pool.query("SELECT count(*)::int AS n FROM vacation_registrations WHERE contact_email = 'luis@test.local'")).rows[0].n).toBe(1);
    });
  });
});
