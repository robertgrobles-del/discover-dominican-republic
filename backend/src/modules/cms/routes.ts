import { createHash, timingSafeEqual } from "node:crypto";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { MAPPINGS } from "./mappings.js";
import { CmsSyncService } from "./sync.js";

declare module "fastify" {
  interface FastifyInstance { cms: CmsSyncService }
}

const digest = (s: string) => createHash("sha256").update(s).digest();

export async function cmsRoutes(app: FastifyInstance) {
  const cms = new CmsSyncService(app.env, app.db, app.log);
  app.decorate("cms", cms);
  const r = app.withTypeProvider<ZodTypeProvider>();

  /** Strapi no firma sus webhooks, pero permite cabeceras propias: se compara un secreto compartido en tiempo constante. */
  r.post("/webhooks/cms", {
    schema: {
      tags: ["cms"], summary: "Webhook de Strapi (publish / unpublish / delete)",
      description: "En Strapi: Settings → Webhooks → URL de este endpoint, cabecera `X-Webhook-Secret` con el valor de `CMS_WEBHOOK_SECRET` y eventos Entry: create, update, delete, publish, unpublish. Sólo `publish`, `unpublish` y `delete` cambian lo público (con Draft & Publish, crear o editar es un borrador).",
      body: z.object({ event: z.string().max(60), model: z.string().max(80).optional(), uid: z.string().max(160).optional(), entry: z.record(z.string(), z.any()).optional() }).catchall(z.any()),
      response: { 200: z.object({ data: z.object({ outcome: z.enum(["applied", "ignored"]), detail: z.string() }) }) },
    },
    bodyLimit: 2 * 1024 * 1024,
  }, async (req) => {
    const expected = app.env.CMS_WEBHOOK_SECRET;
    if (!expected) throw new AppError("SERVICE_UNAVAILABLE", "El webhook del CMS no está configurado (CMS_WEBHOOK_SECRET)");
    const got = String(req.headers["x-webhook-secret"] ?? "");
    if (!timingSafeEqual(digest(got), digest(expected))) throw new AppError("UNAUTHENTICATED", "Secreto de webhook inválido");
    const result = await cms.handleWebhook(req.body as { event: string; model?: string; uid?: string; entry?: Record<string, unknown> });
    return { data: { outcome: result.outcome, detail: result.detail } };
  });

  // ---------- Administración de la sincronización ----------
  r.get("/admin/cms/sync-log", {
    schema: {
      tags: ["cms"], summary: "Últimas sincronizaciones con el CMS", security: [{ bearerAuth: [] }],
      querystring: z.object({ outcome: z.enum(["applied", "ignored", "error"]).optional(), limit: z.coerce.number().int().min(1).max(200).default(50) }),
      response: { 200: z.object({ data: z.array(z.object({ id: z.number(), received_at: z.string(), source: z.string(), event: z.string(), model: z.string().nullable(), document_id: z.string().nullable(), locale: z.string().nullable(), outcome: z.string(), detail: z.string().nullable() })) }) },
    },
    preHandler: app.requireRole("admin", "editor"),
  }, async (req, reply) => {
    const { rows } = await app.db.query(
      `SELECT id, received_at, source, event, model, document_id, locale, outcome, detail FROM cms_sync_log WHERE ($1::text IS NULL OR outcome = $1) ORDER BY id DESC LIMIT $2`, [req.query.outcome ?? null, req.query.limit],
    );
    reply.header("cache-control", "private, no-store");
    return { data: rows.map((x) => ({ ...x, id: Number(x.id), received_at: new Date(x.received_at).toISOString() })) };
  });

  r.post("/admin/cms/backfill", {
    schema: {
      tags: ["cms"], summary: "Carga completa desde Strapi (todo lo publicado, todos los idiomas)", security: [{ bearerAuth: [] }],
      description: `Modelos: ${MAPPINGS.map((m) => m.model).join(", ")}. Sin \`models\` sincroniza todos, con los destinos primero.`,
      body: z.object({ models: z.array(z.string()).optional() }).nullish(),
      response: { 200: z.object({ data: z.array(z.object({ model: z.string(), locale: z.string(), applied: z.number(), ignored: z.number(), errors: z.number() })) }) },
    },
    preHandler: app.requireRole("admin"),
  }, async (req) => ({ data: await cms.backfill(req.body?.models) }));

  r.get("/admin/cms/mappings", {
    schema: {
      tags: ["cms"], summary: "Correspondencia entre tipos de Strapi y tablas", security: [{ bearerAuth: [] }],
      response: { 200: z.object({ data: z.array(z.object({ model: z.string(), plural: z.string(), table: z.string(), fields: z.number(), localized_fields: z.number(), relations: z.array(z.string()) })), meta: z.object({ can_fetch: z.boolean(), webhook_configured: z.boolean() }) }) },
    },
    preHandler: app.requireRole("admin", "editor"),
  }, async () => ({
    data: MAPPINGS.map((m) => ({ model: m.model, plural: m.plural, table: m.table, fields: m.fields.length, localized_fields: m.fields.filter((f) => f.localized).length, relations: (m.relations ?? []).map((x) => `${x.from}→${x.model}`) })),
    meta: { can_fetch: cms.canFetch, webhook_configured: !!app.env.CMS_WEBHOOK_SECRET },
  }));
}
