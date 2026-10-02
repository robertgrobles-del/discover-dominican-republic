import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { campaignTerms } from "./campaigns.js";

const bearer = [{ bearerAuth: [] }];
const ok = z.object({ data: z.any() });
const uuid = z.object({ id: z.string().uuid() });
const reason = z.string().trim().min(10).max(500);

/** Campañas con creadores, derechos por pieza, ingresos por concepto y disputas (plan de accesos, puntos 87 a 93). */
export async function creatorCampaignRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const svc = app.creatorCampaigns;
  const auth = app.authenticate;
  const admin = app.requireRole("admin");
  const isStaff = (roles: string[]) => roles.includes("admin");
  const creatorTags = ["creadores", "campañas"], adminTags = ["admin", "creadores"];

  // ───────────── Personal ─────────────
  r.get("/admin/creator-campaigns", { onRequest: admin, schema: { tags: adminTags, summary: "Campañas con creadores, con aceptaciones y entregas pendientes", security: bearer, response: { 200: ok } } }, async () => ({ data: await svc.listForAdmin() }));
  r.post("/admin/creator-campaigns", {
    onRequest: admin,
    schema: { tags: adminTags, summary: "Crea una campaña en borrador con la primera versión de sus términos", security: bearer, body: z.object({ title: z.string().trim().min(3).max(150), sponsor: z.string().trim().max(150).optional(), terms: campaignTerms }), response: { 201: ok } },
  }, async (req, reply) => { reply.code(201); return { data: await svc.createCampaign(req.user!.id, req.body, req.ip) }; });
  r.put("/admin/creator-campaigns/:id/terms", {
    onRequest: admin,
    schema: { tags: adminTags, summary: "Publica una versión nueva de los términos (quien ya aceptó debe volver a aceptar)", security: bearer, params: uuid, body: z.object({ terms: campaignTerms }), response: { 200: ok } },
  }, async (req) => ({ data: await svc.reviseTerms(req.user!.id, req.params.id, req.body.terms, req.ip) }));
  r.post("/admin/creator-campaigns/:id/status", {
    onRequest: admin,
    schema: { tags: adminTags, summary: "Abre o cierra la campaña", security: bearer, params: uuid, body: z.object({ status: z.enum(["open", "closed"]) }), response: { 204: z.null() } },
  }, async (req, reply) => { await svc.setStatus(req.user!.id, req.params.id, req.body.status, req.ip); reply.code(204); return null; });
  r.get("/admin/creator-campaigns/:id/acceptances", { onRequest: admin, schema: { tags: adminTags, summary: "Evidencia de aceptación: quién aceptó qué versión, cuándo y con qué texto", security: bearer, params: uuid, response: { 200: ok } } }, async (req) => ({ data: await svc.acceptances(req.params.id) }));
  r.get("/admin/creator-campaigns/:id/deliverables", { onRequest: admin, schema: { tags: adminTags, summary: "Entregas de una campaña, con las pendientes de revisar primero", security: bearer, params: uuid, response: { 200: ok } } }, async (req) => ({ data: await svc.deliverables(req.params.id) }));
  r.post("/admin/creator-deliverables/:id/review", {
    onRequest: admin,
    schema: { tags: adminTags, summary: "Aprueba o rechaza una entrega; aprobar registra la licencia y, si aplica, el pago", security: bearer, params: uuid, body: z.object({ decision: z.enum(["approved", "rejected"]), note: z.string().trim().max(300).optional() }), response: { 200: ok } },
  }, async (req) => ({ data: await svc.reviewDeliverable(req.user!.id, req.params.id, req.body.decision, req.body.note, req.ip) }));

  r.post("/admin/creator-ledger", {
    onRequest: admin,
    schema: { tags: adminTags, summary: "Registra una bonificación, un ajuste, fondo de creadores o propina (motivo obligatorio)", security: bearer, body: z.object({ creator_id: z.string().uuid(), source: z.enum(["bonus", "adjustment", "creator_fund", "tip"]), amount: z.number().refine((n) => n !== 0, "No puede ser cero"), currency: z.enum(["DOP", "USD"]).default("DOP"), reason }), response: { 201: ok } },
  }, async (req, reply) => {
    reply.code(201);
    return { data: await svc.addManualEntry(req.user!.id, { creatorId: req.body.creator_id, source: req.body.source, amount: req.body.amount, currency: req.body.currency, reason: req.body.reason }, req.ip) };
  });
  r.post("/admin/creator-ledger/:id/reverse", { onRequest: admin, schema: { tags: adminTags, summary: "Revierte un ingreso dejando la razón a la vista del creador", security: bearer, params: uuid, body: z.object({ reason }), response: { 200: ok } } }, async (req) => ({ data: await svc.reverse(req.user!.id, req.params.id, req.body.reason, req.ip) }));

  r.get("/admin/creator-disputes", { onRequest: admin, schema: { tags: adminTags, summary: "Disputas de creadores por plazo de respuesta", security: bearer, querystring: z.object({ status: z.enum(["open", "resolved_accepted", "resolved_rejected", "withdrawn"]).default("open") }), response: { 200: ok } } }, async (req) => ({ data: await svc.disputesForStaff(req.query.status) }));
  r.post("/admin/creator-disputes/:id/resolve", {
    onRequest: admin,
    schema: { tags: adminTags, summary: "Resuelve una disputa (la corrección económica, si procede, se registra aparte como reverso o ajuste)", security: bearer, params: uuid, body: z.object({ decision: z.enum(["resolved_accepted", "resolved_rejected"]), note: reason }), response: { 204: z.null() } },
  }, async (req, reply) => { await svc.resolveDispute(req.user!.id, req.params.id, req.body.decision, req.body.note, req.ip); reply.code(204); return null; });

  // ───────────── Creador ─────────────
  r.get("/creators/campaigns", { onRequest: auth, schema: { tags: creatorTags, summary: "Campañas abiertas con sus términos vigentes y lo que ya acepté", security: bearer, response: { 200: ok } } }, async (req) => ({ data: await svc.listOpen(req.user!.id) }));
  r.post("/creators/campaigns/:id/accept", {
    onRequest: auth,
    schema: { tags: creatorTags, summary: "Acepta una versión concreta de los términos (queda registrada con fecha, IP y huella del texto)", security: bearer, params: uuid, body: z.object({ version: z.number().int().min(1) }), response: { 200: ok } },
  }, async (req) => ({ data: await svc.accept(req.user!.id, req.params.id, req.body.version, req.ip) }));
  r.post("/creators/campaigns/:id/deliverables", {
    onRequest: auth,
    schema: { tags: creatorTags, summary: "Entrega una pieza propia a la campaña (exige haber aceptado los términos vigentes)", security: bearer, params: uuid, body: z.object({ video_id: z.string().uuid() }), response: { 201: ok } },
  }, async (req, reply) => { reply.code(201); return { data: await svc.submitDeliverable(req.user!.id, req.params.id, req.body.video_id, req.ip) }; });

  r.get("/creators/me/earnings", { onRequest: auth, schema: { tags: creatorTags, summary: "Mis ingresos por concepto, separando lo estimado de lo confirmado y explicando los reversos", security: bearer, response: { 200: ok } } }, async (req) => ({ data: await svc.earnings(req.user!.id) }));

  r.get("/creators/videos/:id/rights", { onRequest: auth, schema: { tags: creatorTags, summary: "Titular y licencias de una pieza (sólo su autor y el personal)", security: bearer, params: uuid, response: { 200: ok } } }, async (req) => ({ data: await svc.rightsOf(req.params.id, { id: req.user!.id, staff: isStaff(req.user!.roles) }) }));
  r.post("/creators/videos/:id/platform-license", { onRequest: auth, schema: { tags: creatorTags, summary: "Concede a la plataforma una licencia de difusión de un año sobre una pieza propia", security: bearer, params: uuid, response: { 201: ok } } }, async (req, reply) => { reply.code(201); return { data: await svc.grantPlatformLicense(req.user!.id, req.params.id) }; });
  r.post("/creators/rights/:id/revoke", {
    onRequest: auth,
    schema: { tags: creatorTags, summary: "Revoca una licencia: el autor la de plataforma; el personal, cualquiera", security: bearer, params: uuid, body: z.object({ reason }), response: { 204: z.null() } },
  }, async (req, reply) => { await svc.revokeRight(req.params.id, { id: req.user!.id, staff: isStaff(req.user!.roles) }, req.body.reason, req.ip); reply.code(204); return null; });

  r.get("/creators/me/disputes", { onRequest: auth, schema: { tags: creatorTags, summary: "Mis disputas y su estado", security: bearer, response: { 200: ok } } }, async (req) => ({ data: await svc.myDisputes(req.user!.id) }));
  r.post("/creators/disputes", {
    onRequest: auth, config: { rateLimit: app.env.AUTH_RATE_LIMIT_ENABLED ? { max: 10, timeWindow: "1 hour" } : { max: 1_000_000, timeWindow: "1 minute" } },
    schema: {
      tags: creatorTags, summary: "Abre una disputa sobre una campaña o un movimiento propio, con evidencia", security: bearer,
      body: z.object({
        subject_type: z.enum(["campaign", "ledger_entry"]), subject_id: z.string().uuid(), reason,
        evidence: z.array(z.object({ label: z.string().trim().min(2).max(120), url: z.string().url().max(500).optional(), text: z.string().trim().max(1000).optional() }).refine((e) => e.url || e.text, "Cada evidencia necesita un enlace o un texto")).max(10).default([]),
      }),
      response: { 201: ok },
    },
  }, async (req, reply) => {
    reply.code(201);
    return { data: await svc.openDispute(req.user!.id, { subjectType: req.body.subject_type, subjectId: req.body.subject_id, reason: req.body.reason, evidence: req.body.evidence }, req.ip) };
  });
  r.post("/creators/disputes/:id/withdraw", { onRequest: auth, schema: { tags: creatorTags, summary: "Retira una disputa propia aún abierta", security: bearer, params: uuid, response: { 204: z.null() } } }, async (req, reply) => { await svc.withdrawDispute(req.user!.id, req.params.id); reply.code(204); return null; });
}
