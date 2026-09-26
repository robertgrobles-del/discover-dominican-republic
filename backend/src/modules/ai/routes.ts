import type { FastifyInstance, FastifyRequest } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { LOCALES } from "../../lib/i18n.js";
import { audit } from "../operators/team.js";
import type { AiService } from "./service.js";

declare module "fastify" { interface FastifyInstance { ai: AiService } }

const ok = z.object({ data: z.any() });
const bearer = [{ bearerAuth: [] }];
const locale = z.enum(LOCALES);
const STAFF = ["admin", "editor", "moderator"];

/** Asistente de IA (docs §5.4 y §5.17). */
export async function aiRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const ai = app.ai, db = app.db;
  const auth = app.authenticate, editor = app.requireRole("admin", "editor"), admin = app.requireRole("admin");
  const rl = (max: number, timeWindow: string) => ({ rateLimit: app.env.AUTH_RATE_LIMIT_ENABLED ? { max, timeWindow } : { max: 1_000_000, timeWindow: "1 minute" } });
  const optionalUser = async (req: FastifyRequest) => { if (req.headers.authorization) { try { await app.authenticate(req, undefined as never); } catch { req.user = undefined; } } };
  const ctx = (req: FastifyRequest) => ({ userId: req.user?.id ?? null, staff: !!req.user?.roles.some((x) => STAFF.includes(x)) });
  const tag = ["ia"];

  r.get("/ai/quota", { onRequest: auth, schema: { tags: tag, summary: "Mi cuota diaria de consultas de IA", security: bearer, response: { 200: ok } } }, async (req) => ({ data: await ai.quota(req.user!.id, ctx(req).staff) }));

  // ---------- Chat (SSE) ----------
  r.post("/ai/chat", {
    onRequest: optionalUser, config: rl(10, "1 minute"),
    schema: {
      tags: tag, summary: "Asistente «Guía RD» en streaming (SSE): eventos `{places}`, `{delta}`, `{done, usage}` o `{error}`. 10 mensajes/min anónimo; con sesión cuenta en la cuota diaria", security: [{}, ...bearer],
      body: z.object({ messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(2000) })).min(1).max(20), locale: locale.optional(), context: z.string().max(300).optional() }),
    },
  }, async (req, reply) => {
    const h = await ai.prepareChat(ctx(req), req.body);          // errores de cuota o de configuración salen como JSON normal
    reply.hijack();
    const raw = reply.raw;
    raw.writeHead(200, { ...reply.getHeaders(), "content-type": "text/event-stream; charset=utf-8", "cache-control": "no-cache, no-transform", connection: "keep-alive", "x-accel-buffering": "no" } as never);
    const send = (o: unknown) => { if (!raw.destroyed) raw.write(`data: ${JSON.stringify(o)}\n\n`); };
    send({ places: h.places });
    try {
      const usage = await ai.streamChat(h, (d) => send({ delta: d }), () => raw.destroyed);
      send({ done: true, usage: { input_tokens: usage.inputTokens, output_tokens: usage.outputTokens } });
    } catch (e) {
      req.log.error({ err: e }, "Falló el chat de IA");
      send({ error: { code: e instanceof AppError ? e.code : "INTERNAL", message: e instanceof AppError ? e.message : "No se pudo completar la respuesta" } });
    }
    raw.end();
  });

  // ---------- Itinerario y recomendaciones ----------
  r.post("/ai/itinerary", {
    onRequest: auth, config: rl(10, "1 minute"),
    schema: {
      tags: tag, summary: "Genera un itinerario con lugares reales del catálogo (los `ref` inventados se descartan). Se guarda con POST /me/trips/{id}/from-itinerary", security: bearer,
      body: z.object({ days: z.number().int().min(1).max(14), budget: z.number().min(0).max(1_000_000).optional(), currency: z.enum(["USD", "DOP"]).optional(), interests: z.array(z.string().trim().min(2).max(40)).max(10).default([]), party: z.string().trim().max(100).optional(), start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), locale: locale.optional() }),
      response: { 200: ok },
    },
  }, async (req) => ({ data: await ai.itinerary(ctx(req), req.body) }));

  r.post("/ai/recommendations", {
    onRequest: auth, config: rl(20, "1 minute"),
    schema: { tags: tag, summary: "Recomendaciones según intereses, favoritos y lugares visitados (sin IA disponible, se ordena por calificación)", security: bearer, body: z.object({ interests: z.array(z.string().trim().min(2).max(40)).max(10).default([]), limit: z.number().int().min(1).max(20).default(6), locale: locale.optional() }).default({ interests: [], limit: 6 }), response: { 200: ok } },
  }, async (req) => ({ data: await ai.recommendations(ctx(req), req.user!.id, req.body) }));

  // ---------- Herramientas editoriales ----------
  r.post("/ai/translate", {
    onRequest: editor, config: rl(30, "1 minute"),
    schema: { tags: tag, summary: "Traducción asistida (editor); las repetidas salen de la caché sin costo", security: bearer, body: z.object({ text: z.string().trim().min(1).max(6000), to: locale, from: locale.optional() }), response: { 200: ok } },
  }, async (req) => ({ data: await ai.translate(ctx(req), req.body) }));

  r.post("/admin/ai/generate", {
    onRequest: editor, config: rl(20, "1 minute"),
    schema: { tags: ["admin", ...tag], summary: "Redacta un borrador de contenido (editor). Nunca publica: el texto lo pega una persona en un borrador", security: bearer, body: z.object({ prompt: z.string().trim().min(5).max(2000), tone: z.enum(["aventurero", "elegante", "familiar", "informativo", "romantico", "divertido"]).default("informativo"), entity_type: z.string().trim().min(2).max(40), locale: locale.default("es") }), response: { 200: ok } },
  }, async (req) => {
    const data = await ai.generate(ctx(req), req.body);
    await audit(db, { actor: req.user!.id, action: "ai.generate", entity: req.body.entity_type, id: null, ip: req.ip });
    return { data };
  });
  r.get("/admin/ai/usage", { onRequest: admin, schema: { tags: ["admin", ...tag], summary: "Consumo y costo de IA del mes (total, por tipo y por usuario) y gasto de hoy frente al tope", security: bearer, querystring: z.object({ month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional() }), response: { 200: ok } } }, async (req) => ({ data: await ai.usage(req.query.month ?? new Date().toISOString().slice(0, 7)) }));
}
