import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { pageMeta } from "../../lib/pagination.js";
import { audit } from "../../lib/audit.js";
import type { AmbassadorService } from "./service.js";

declare module "fastify" { interface FastifyInstance { ambassadors: AmbassadorService } }

const ok = z.object({ data: z.any() });
const paged = z.object({ data: z.any(), meta: z.any() });
const bearer = [{ bearerAuth: [] }];
const uuid = z.object({ id: z.string().uuid() });
const pageQ = { page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(100).default(25) };
const social = z.record(z.string().max(30), z.string().url().max(300)).refine((o) => Object.keys(o).length <= 6, "Máximo 6 enlaces");

/** Programa de embajadores (docs §5.11). */
export async function ambassadorRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const svc = app.ambassadors, db = app.db;
  const auth = app.authenticate, admin = app.requireRole("admin");
  const rl = (max: number, timeWindow: string) => ({ rateLimit: app.env.AUTH_RATE_LIMIT_ENABLED ? { max, timeWindow } : { max: 1_000_000, timeWindow: "1 minute" } });

  r.get("/ambassadors/track", { config: rl(60, "1 minute"), schema: { tags: ["embajadores"], summary: "Valida el código de un enlace de embajador y cuenta el clic (guardarlo 30 días y enviarlo como `ref_code` al comprar)", querystring: z.object({ ref: z.string().trim().min(4).max(30) }), response: { 200: ok } } }, async (req) => ({ data: await svc.track(req.query.ref) }));
  r.post("/ambassadors/apply", { onRequest: auth, config: rl(5, "1 hour"), schema: { tags: ["embajadores"], summary: "Solicita ser embajador (correo verificado)", security: bearer, body: z.object({ motivation: z.string().trim().min(20).max(1000), audience: z.string().trim().max(300).optional(), social_links: social.optional() }), response: { 201: ok } } }, async (req, reply) => {
    reply.code(201);
    return { data: await svc.apply(req.user!.id, req.body) };
  });
  r.get("/ambassadors/me", { onRequest: auth, schema: { tags: ["embajadores"], summary: "Mi estado, código, nivel, ventas y comisiones (en espera, disponible, solicitada, pagada)", security: bearer, response: { 200: ok } } }, async (req) => ({ data: await svc.me(req.user!.id) }));
  r.patch("/ambassadors/me", { onRequest: auth, schema: { tags: ["embajadores"], summary: "Actualiza mi forma de cobro y mis redes", security: bearer, body: z.object({ payout_method: z.enum(["bank_transfer", "paypal"]).nullable(), payout_details: z.string().trim().min(5).max(300).nullable(), social_links: social }).partial().strict(), response: { 200: ok } } }, async (req) => ({ data: await svc.updateProfile(req.user!.id, req.body) }));
  r.get("/ambassadors/me/referrals", { onRequest: auth, schema: { tags: ["embajadores"], summary: "Mis ventas atribuidas (comprador enmascarado)", security: bearer, querystring: z.object(pageQ), response: { 200: paged } } }, async (req) => {
    const { rows, total } = await svc.referrals(req.user!.id, req.query.page, req.query.per_page);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.get("/ambassadors/me/payouts", { onRequest: auth, schema: { tags: ["embajadores"], summary: "Mis pagos de comisiones", security: bearer, response: { 200: ok } } }, async (req) => ({ data: await svc.payouts(req.user!.id) }));
  r.post("/ambassadors/me/payouts/request", { onRequest: auth, config: rl(10, "1 hour"), schema: { tags: ["embajadores"], summary: "Solicita el pago de todo lo disponible (mínimo RD$ 1 000)", security: bearer, body: z.object({ method: z.enum(["bank_transfer", "paypal"]).optional(), details: z.string().trim().min(5).max(300).optional() }).nullish(), response: { 201: ok } } }, async (req, reply) => {
    const data = await svc.requestPayout(req.user!.id, req.body ?? {});
    reply.code(201);
    return { data };
  });

  // ---------- Administración ----------
  r.get("/admin/ambassadors", { onRequest: admin, schema: { tags: ["admin"], summary: "Embajadores y solicitudes", security: bearer, querystring: z.object({ ...pageQ, status: z.enum(["pending", "approved", "rejected", "suspended"]).optional(), q: z.string().trim().max(100).optional() }), response: { 200: paged } } }, async (req) => {
    const { rows, total } = await svc.adminList({ status: req.query.status, q: req.query.q, page: req.query.page, per_page: req.query.per_page });
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.get("/admin/ambassadors/payouts", { onRequest: admin, schema: { tags: ["admin"], summary: "Pagos de comisiones", security: bearer, querystring: z.object({ ...pageQ, status: z.enum(["pending", "paid", "failed"]).optional() }), response: { 200: paged } } }, async (req) => {
    const { rows, total } = await svc.adminPayouts({ status: req.query.status, page: req.query.page, per_page: req.query.per_page });
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.patch("/admin/ambassadors/payouts/:id", { onRequest: admin, schema: { tags: ["admin"], summary: "Marca un pago como enviado (con referencia) o fallido (las comisiones vuelven a estar disponibles)", security: bearer, params: uuid, body: z.object({ status: z.enum(["paid", "failed"]), reference: z.string().trim().min(2).max(100).optional(), note: z.string().trim().max(300).optional() }), response: { 200: ok } } }, async (req) => {
    const data = await svc.adminSettlePayout(req.params.id, req.body);
    await audit(db, { actor: req.user!.id, action: `ambassador.payout_${req.body.status}`, entity: "ambassador_payout", id: req.params.id, ip: req.ip });
    return { data };
  });
  r.get("/admin/ambassadors/:id", { onRequest: admin, schema: { tags: ["admin"], summary: "Detalle de un embajador con sus comisiones", security: bearer, params: uuid, response: { 200: ok } } }, async (req) => ({ data: await svc.adminGet(req.params.id) }));
  r.patch("/admin/ambassadors/:id", { onRequest: admin, schema: { tags: ["admin"], summary: "Aprueba, rechaza o suspende; fija una comisión especial", security: bearer, params: uuid, body: z.object({ status: z.enum(["approved", "rejected", "suspended"]), commission_override: z.number().min(0).max(40).nullable(), note: z.string().trim().max(300) }).partial().strict(), response: { 200: ok } } }, async (req) => {
    const data = await svc.adminSetStatus(req.params.id, req.body);
    await audit(db, { actor: req.user!.id, action: "ambassador.updated", entity: "ambassador", id: req.params.id, meta: { status: req.body.status ?? null, override: req.body.commission_override ?? null }, ip: req.ip });
    return { data };
  });
}
