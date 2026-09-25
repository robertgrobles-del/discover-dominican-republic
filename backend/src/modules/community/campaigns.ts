import type { FastifyInstance, FastifyRequest } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { pageMeta } from "../../lib/pagination.js";
import { todayInSantoDomingo } from "../operators/domain/dates.js";
import { audit } from "../operators/team.js";

const ok = z.object({ data: z.any() });
const bearer = [{ bearerAuth: [] }];
const slug = z.string().trim().min(3).max(80).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Sólo minúsculas, números y guiones");
const email = z.string().trim().toLowerCase().pipe(z.email().max(254));
const first = (n: string) => { const [a = "", b = ""] = n.trim().split(/\s+/); return a ? `${a}${b ? ` ${b[0]!.toUpperCase()}.` : ""}` : "Participante"; };

const question = z.discriminatedUnion("type", [
  z.object({ id: z.string().regex(/^[a-z0-9_]{1,40}$/), type: z.literal("rating"), label: z.string().min(1).max(200), required: z.boolean().default(false) }),
  z.object({ id: z.string().regex(/^[a-z0-9_]{1,40}$/), type: z.literal("nps"), label: z.string().min(1).max(200), required: z.boolean().default(false) }),
  z.object({ id: z.string().regex(/^[a-z0-9_]{1,40}$/), type: z.literal("text"), label: z.string().min(1).max(200), required: z.boolean().default(false) }),
  z.object({ id: z.string().regex(/^[a-z0-9_]{1,40}$/), type: z.enum(["choice", "multi"]), label: z.string().min(1).max(200), required: z.boolean().default(false), options: z.array(z.string().min(1).max(80)).min(2).max(20) }),
]);
type Question = z.infer<typeof question>;

/** Valida las respuestas contra la estructura de la encuesta y devuelve las respuestas limpias y el puntaje NPS (si lo hay). */
export function validateAnswers(questions: Question[], answers: Record<string, unknown>): { clean: Record<string, unknown>; nps: number | null } {
  const clean: Record<string, unknown> = {};
  let nps: number | null = null;
  const known = new Set(questions.map((q) => q.id));
  for (const k of Object.keys(answers)) if (!known.has(k)) throw AppError.validation(`Pregunta desconocida: ${k}`);
  for (const q of questions) {
    const v = answers[q.id];
    if (v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length)) {
      if (q.required) throw AppError.validation(`Responde: ${q.label}`, { question: q.id });
      continue;
    }
    switch (q.type) {
      case "rating": if (!Number.isInteger(v) || (v as number) < 1 || (v as number) > 5) throw AppError.validation(`"${q.label}" va de 1 a 5`, { question: q.id }); clean[q.id] = v; break;
      case "nps": if (!Number.isInteger(v) || (v as number) < 0 || (v as number) > 10) throw AppError.validation(`"${q.label}" va de 0 a 10`, { question: q.id }); clean[q.id] = v; nps ??= v as number; break;
      case "text": if (typeof v !== "string" || v.length > 2000) throw AppError.validation(`"${q.label}" admite hasta 2000 caracteres`, { question: q.id }); clean[q.id] = v.trim(); break;
      case "choice": if (typeof v !== "string" || !q.options.includes(v)) throw AppError.validation(`Opción inválida en "${q.label}"`, { question: q.id }); clean[q.id] = v; break;
      case "multi": if (!Array.isArray(v) || v.some((x) => typeof x !== "string" || !q.options.includes(x)) || new Set(v).size !== v.length) throw AppError.validation(`Opciones inválidas en "${q.label}"`, { question: q.id }); clean[q.id] = v; break;
    }
  }
  return { clean, nps };
}

/** Encuestas, concursos y registros de vacaciones (docs §5.6). */
export async function campaignRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const db = app.db;
  const rl = (max: number, timeWindow: string) => ({ rateLimit: app.env.AUTH_RATE_LIMIT_ENABLED ? { max, timeWindow } : { max: 1_000_000, timeWindow: "1 minute" } });
  const optionalUser = async (req: FastifyRequest) => { if (req.headers.authorization) { try { await app.authenticate(req, undefined as never); } catch { req.user = undefined; } } };
  const admin = app.requireRole("admin", "editor");
  const page = { page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(100).default(50) };

  // ---------- Encuestas ----------
  const survey = async (s: string, activeOnly = true) => {
    const t = (await db.query<{ id: string; slug: string; title: string; kind: string; questions: Question[]; is_active: boolean }>("SELECT id, slug, title, kind, questions, is_active FROM survey_templates WHERE slug = $1", [s])).rows[0];
    if (!t || (activeOnly && !t.is_active)) throw AppError.notFound("Encuesta");
    return t;
  };
  r.get("/surveys/:slug", { schema: { tags: ["encuestas"], summary: "Estructura de una encuesta", params: z.object({ slug }), response: { 200: ok } } }, async (req) => {
    const t = await survey(req.params.slug);
    return { data: { slug: t.slug, title: t.title, kind: t.kind, questions: t.questions } };
  });
  r.post("/surveys/:slug/responses", {
    preHandler: optionalUser, config: rl(10, "1 hour"),
    schema: { tags: ["encuestas"], summary: "Responde una encuesta (validada contra su estructura)", security: [{}, ...bearer], params: z.object({ slug }), body: z.object({ answers: z.record(z.string(), z.unknown()) }), response: { 201: ok } },
  }, async (req, reply) => {
    const t = await survey(req.params.slug);
    const { clean, nps } = validateAnswers(t.questions, req.body.answers);
    if (!Object.keys(clean).length) throw AppError.validation("Envía al menos una respuesta");
    try {
      await db.query("INSERT INTO survey_responses (template_id, user_id, responses, nps_score) VALUES ($1,$2,$3,$4)", [t.id, req.user?.id ?? null, JSON.stringify(clean), nps]);
    } catch (e) {
      if ((e as { code?: string }).code === "23505") throw new AppError("CONFLICT", "Ya respondiste esta encuesta", { reason: "ALREADY_ANSWERED" });
      throw e;
    }
    reply.code(201);
    return { data: { received: true } };
  });

  r.post("/admin/surveys", { preHandler: admin, schema: { tags: ["admin"], summary: "Crea una encuesta", security: bearer, body: z.object({ slug, title: z.string().trim().min(3).max(150), kind: z.enum(["general", "post_trip", "nps"]).default("general"), questions: z.array(question).min(1).max(40), is_active: z.boolean().default(true) }), response: { 201: ok } } }, async (req, reply) => {
    const ids = req.body.questions.map((q) => q.id);
    if (new Set(ids).size !== ids.length) throw AppError.validation("Hay ids de pregunta repetidos");
    try {
      const row = (await db.query<{ id: string }>("INSERT INTO survey_templates (slug, title, kind, questions, is_active) VALUES ($1,$2,$3,$4,$5) RETURNING id", [req.body.slug, req.body.title, req.body.kind, JSON.stringify(req.body.questions), req.body.is_active])).rows[0]!;
      await audit(db, { actor: req.user!.id, action: "survey.created", entity: "survey", id: row.id, ip: req.ip });
      reply.code(201);
      return { data: { id: row.id, slug: req.body.slug } };
    } catch (e) {
      if ((e as { code?: string }).code === "23505") throw new AppError("CONFLICT", "Ya existe una encuesta con ese slug", { reason: "SLUG_TAKEN" });
      throw e;
    }
  });
  r.patch("/admin/surveys/:slug", { preHandler: admin, schema: { tags: ["admin"], summary: "Activa/desactiva o retitula una encuesta (las preguntas no cambian una vez publicada)", security: bearer, params: z.object({ slug }), body: z.object({ title: z.string().trim().min(3).max(150), is_active: z.boolean() }).partial(), response: { 204: z.null() } } }, async (req, reply) => {
    const res = await db.query("UPDATE survey_templates SET title = coalesce($2, title), is_active = coalesce($3, is_active) WHERE slug = $1", [req.params.slug, req.body.title ?? null, req.body.is_active ?? null]);
    if (!res.rowCount) throw AppError.notFound("Encuesta");
    reply.code(204);
    return null;
  });
  r.get("/admin/surveys/:slug/results", { preHandler: admin, schema: { tags: ["admin"], summary: "Resultados agregados (NPS, medias y distribución)", security: bearer, params: z.object({ slug }), response: { 200: ok } } }, async (req) => {
    const t = await survey(req.params.slug, false);
    const rows = (await db.query<{ responses: Record<string, unknown>; nps_score: number | null }>("SELECT responses, nps_score FROM survey_responses WHERE template_id = $1", [t.id])).rows;
    const nps = rows.map((x) => x.nps_score).filter((x): x is number => x !== null);
    const promoters = nps.filter((x) => x >= 9).length, detractors = nps.filter((x) => x <= 6).length;
    const questions = t.questions.map((q) => {
      const vals = rows.map((x) => x.responses[q.id]).filter((v) => v !== undefined);
      if (q.type === "rating" || q.type === "nps") { const nums = vals as number[]; return { id: q.id, type: q.type, answers: nums.length, average: nums.length ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100 : null }; }
      if (q.type === "choice" || q.type === "multi") { const dist: Record<string, number> = Object.fromEntries(q.options.map((o) => [o, 0])); for (const v of vals) for (const o of (Array.isArray(v) ? v : [v]) as string[]) dist[o] = (dist[o] ?? 0) + 1; return { id: q.id, type: q.type, answers: vals.length, distribution: dist }; }
      return { id: q.id, type: q.type, answers: vals.length };
    });
    return { data: { responses: rows.length, nps: nps.length ? { score: Math.round(((promoters - detractors) / nps.length) * 100), promoters, detractors, passives: nps.length - promoters - detractors, count: nps.length } : null, questions } };
  });

  // ---------- Concursos ----------
  const activeContest = "status = 'published'";
  r.get("/contests", { schema: { tags: ["concursos"], summary: "Concursos y sorteos vigentes", querystring: z.object({ include: z.enum(["current", "past"]).default("current") }), response: { 200: ok } } }, async (req) => {
    const cond = req.query.include === "current" ? `${activeContest} AND ends_at > now()` : "status IN ('published', 'closed') AND ends_at <= now()";
    return { data: (await db.query(`SELECT slug, title, description, prize, image_url, starts_at, ends_at, status, (starts_at <= now() AND ends_at > now() AND status = 'published') AS open FROM contests WHERE ${cond} ORDER BY ends_at`)).rows };
  });
  r.get("/contests/:slug", { schema: { tags: ["concursos"], summary: "Detalle de un concurso", params: z.object({ slug }), response: { 200: ok } } }, async (req) => {
    const c = (await db.query("SELECT slug, title, description, rules, prize, image_url, starts_at, ends_at, status, min_age, max_entries, (starts_at <= now() AND ends_at > now() AND status = 'published') AS open FROM contests WHERE slug = $1 AND status IN ('published', 'closed')", [req.params.slug])).rows[0];
    if (!c) throw AppError.notFound("Concurso");
    return { data: c };
  });
  r.post("/contests/:slug/register", {
    preHandler: app.authenticate, config: rl(10, "1 hour"),
    schema: { tags: ["concursos"], summary: "Inscribirse (una vez por persona; correo verificado)", security: bearer, params: z.object({ slug }), body: z.object({ name: z.string().trim().min(2).max(100), phone: z.string().trim().max(30).optional(), country: z.string().trim().max(60).optional(), age: z.number().int().min(1).max(120).optional(), accept_rules: z.literal(true, { error: "Debes aceptar las bases" }) }), response: { 201: ok } },
  }, async (req, reply) => {
    const c = (await db.query<{ id: string; min_age: number | null; max_entries: number | null }>("SELECT id, min_age, max_entries FROM contests WHERE slug = $1 AND status = 'published' AND starts_at <= now() AND ends_at > now()", [req.params.slug])).rows[0];
    if (!c) throw new AppError("BUSINESS_RULE", "Este concurso no está abierto", { code: "CONTEST_CLOSED" });
    const u = (await db.query<{ email: string; verified: boolean }>("SELECT email, email_verified_at IS NOT NULL AS verified FROM users WHERE id = $1", [req.user!.id])).rows[0]!;
    if (!u.verified) throw new AppError("FORBIDDEN", "Verifica tu correo para participar", { code: "EMAIL_NOT_VERIFIED" });
    if (c.min_age && (req.body.age ?? 0) < c.min_age) throw new AppError("BUSINESS_RULE", `Debes tener al menos ${c.min_age} años`, { code: "UNDERAGE" });
    if (c.max_entries) {
      const n = (await db.query<{ n: number }>("SELECT count(*)::int AS n FROM contest_registrations WHERE contest_id = $1", [c.id])).rows[0]!.n;
      if (n >= c.max_entries) throw new AppError("BUSINESS_RULE", "Se alcanzó el máximo de participantes", { code: "CONTEST_FULL" });
    }
    try {
      const row = (await db.query<{ id: string }>("INSERT INTO contest_registrations (contest_id, user_id, nombre, email, telefono, pais, edad) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id", [c.id, req.user!.id, req.body.name, u.email, req.body.phone ?? null, req.body.country ?? null, req.body.age?.toString() ?? null])).rows[0]!;
      reply.code(201);
      return { data: { id: row.id } };
    } catch (e) {
      if ((e as { code?: string }).code === "23505") throw new AppError("CONFLICT", "Ya estás inscrito en este concurso", { reason: "ALREADY_REGISTERED" });
      throw e;
    }
  });
  r.get("/contests/:slug/winners", { schema: { tags: ["concursos"], summary: "Ganadores (nombre abreviado)", params: z.object({ slug }), response: { 200: ok } } }, async (req) => {
    const c = (await db.query<{ id: string; winners: string[] }>("SELECT id, winners FROM contests WHERE slug = $1 AND status = 'closed'", [req.params.slug])).rows[0];
    if (!c) throw AppError.notFound("Concurso");
    const rows = c.winners.length ? (await db.query<{ nombre: string; pais: string | null }>("SELECT nombre, pais FROM contest_registrations WHERE id = ANY($1)", [c.winners])).rows : [];
    return { data: rows.map((w) => ({ name: first(w.nombre), country: w.pais })) };
  });

  const contestBody = z.object({ slug, title: z.string().trim().min(3).max(150), description: z.string().max(4000).optional(), rules: z.string().max(8000).optional(), prize: z.string().max(300).optional(), image_url: z.string().url().max(500).optional(), starts_at: z.string().datetime(), ends_at: z.string().datetime(), status: z.enum(["draft", "published"]).default("draft"), max_entries: z.number().int().min(1).optional(), min_age: z.number().int().min(1).max(99).optional() });
  r.post("/admin/contests", { preHandler: admin, schema: { tags: ["admin"], summary: "Crea un concurso", security: bearer, body: contestBody, response: { 201: ok } } }, async (req, reply) => {
    const b = req.body;
    if (b.ends_at <= b.starts_at) throw AppError.validation("La fecha final debe ser posterior a la inicial");
    try {
      await db.query("INSERT INTO contests (slug, title, description, rules, prize, image_url, starts_at, ends_at, status, max_entries, min_age) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)", [b.slug, b.title, b.description ?? null, b.rules ?? null, b.prize ?? null, b.image_url ?? null, b.starts_at, b.ends_at, b.status, b.max_entries ?? null, b.min_age ?? null]);
    } catch (e) {
      if ((e as { code?: string }).code === "23505") throw new AppError("CONFLICT", "Ya existe un concurso con ese slug", { reason: "SLUG_TAKEN" });
      throw e;
    }
    await audit(db, { actor: req.user!.id, action: "contest.created", entity: "contest", id: b.slug, ip: req.ip });
    reply.code(201);
    return { data: { slug: b.slug } };
  });
  r.get("/admin/contests/:slug/registrations", { preHandler: admin, schema: { tags: ["admin"], summary: "Inscritos", security: bearer, params: z.object({ slug }), querystring: z.object(page), response: { 200: z.object({ data: z.any(), meta: z.any() }) } } }, async (req) => {
    const c = (await db.query<{ id: string }>("SELECT id FROM contests WHERE slug = $1", [req.params.slug])).rows[0];
    if (!c) throw AppError.notFound("Concurso");
    const total = (await db.query<{ n: number }>("SELECT count(*)::int AS n FROM contest_registrations WHERE contest_id = $1", [c.id])).rows[0]!.n;
    const { rows } = await db.query(`SELECT id, user_id, nombre AS name, email, telefono AS phone, pais AS country, edad AS age, created_at FROM contest_registrations WHERE contest_id = $1 ORDER BY created_at LIMIT ${req.query.per_page} OFFSET ${(req.query.page - 1) * req.query.per_page}`, [c.id]);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.post("/admin/contests/:slug/draw", {
    preHandler: admin,
    schema: { tags: ["admin"], summary: "Sortea ganadores al azar entre los inscritos y cierra el concurso", security: bearer, params: z.object({ slug }), body: z.object({ winners: z.number().int().min(1).max(50).default(1) }), response: { 200: ok } },
  }, async (req) => {
    const c = (await db.query<{ id: string; status: string; ends_at: Date }>("SELECT id, status, ends_at FROM contests WHERE slug = $1", [req.params.slug])).rows[0];
    if (!c) throw AppError.notFound("Concurso");
    if (c.status === "closed") throw new AppError("BUSINESS_RULE", "El sorteo ya se realizó", { code: "ALREADY_DRAWN" });
    if (c.ends_at.getTime() > Date.now()) throw new AppError("BUSINESS_RULE", "El concurso aún no termina", { code: "CONTEST_OPEN" });
    const picked = (await db.query<{ id: string }>("SELECT id FROM contest_registrations WHERE contest_id = $1 ORDER BY random() LIMIT $2", [c.id, req.body.winners])).rows.map((x) => x.id);
    if (!picked.length) throw new AppError("BUSINESS_RULE", "No hay inscritos", { code: "NO_ENTRIES" });
    await db.query("UPDATE contests SET winners = $2, status = 'closed' WHERE id = $1 AND status <> 'closed'", [c.id, picked]);
    await audit(db, { actor: req.user!.id, action: "contest.drawn", entity: "contest", id: req.params.slug, meta: { winners: picked.length }, ip: req.ip });
    return { data: { winners: picked } };
  });

  // ---------- Vacaciones / "Vuelve a casa" ----------
  r.post("/vacation-registrations", {
    preHandler: optionalUser, config: rl(10, "1 hour"),
    schema: {
      tags: ["formularios"], summary: "Registra el interés de vacaciones (con o sin cuenta)",
      body: z.object({ destination_id: z.string().uuid(), start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), travelers: z.number().int().min(1).max(50).default(1), notes: z.string().trim().max(1000).optional(), name: z.string().trim().min(2).max(100).optional(), email: email.optional(), phone: z.string().trim().max(30).optional(), website: z.string().max(200).optional() }),
      response: { 202: ok },
    },
  }, async (req, reply) => {
    const b = req.body;
    reply.code(202);
    if (b.website) return { data: { received: true } };
    if (!req.user && (!b.name || !b.email)) throw AppError.validation("Indica tu nombre y correo");
    if (b.end_date < b.start_date) throw AppError.validation("La fecha de regreso es anterior a la de salida");
    if (b.start_date < todayInSantoDomingo()) throw AppError.validation("La fecha de salida ya pasó");
    if (!(await db.query("SELECT 1 FROM destinations WHERE id = $1", [b.destination_id])).rowCount) throw AppError.validation("El destino no existe");
    await db.query("INSERT INTO vacation_registrations (user_id, destination_id, start_date, end_date, notes, contact_name, contact_email, contact_phone, travelers) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)", [req.user?.id ?? null, b.destination_id, b.start_date, b.end_date, b.notes ?? null, b.name ?? null, b.email ?? null, b.phone ?? null, b.travelers]);
    return { data: { received: true } };
  });
}
