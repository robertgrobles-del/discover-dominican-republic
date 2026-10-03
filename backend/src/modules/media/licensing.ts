import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import type { Db } from "../../db/pool.js";
import { audit } from "../../lib/audit.js";
import { AppError } from "../../lib/errors.js";
import { pageMeta } from "../../lib/pagination.js";

const LICENSE_TYPES = ["editorial", "commercial"] as const;
type LicenseType = (typeof LICENSE_TYPES)[number];
/** Vigencia de una licencia aprobada. */
const LICENSE_DAYS = 365;

/**
 * Licenciamiento de imágenes del banco oficial (plan de 150 mejoras, punto 40). Reglas, todas SUPUESTOS por validar:
 *  - Sólo se ofertan imágenes editoriales del equipo (`cms`) ya aprobadas.
 *  - Dos licencias: editorial (prensa, educación) y comercial (publicidad, productos), cada una con su precio.
 *  - No hay pasarela contratada: la persona solicita, paga por fuera y administración aprueba anotando el comprobante.
 *  - La licencia aprobada dura un año y da acceso al original; las vistas reducidas siguen siendo públicas.
 */
export class MediaLicensingService {
  constructor(private readonly db: Db) {}

  /** ¿Puede esta persona descargar el original de una imagen restringida? */
  async hasLicense(assetId: string, userId: string | undefined): Promise<boolean> {
    if (!userId) return false;
    return !!(await this.db.query("SELECT 1 FROM media_license_orders WHERE asset_id = $1 AND buyer_id = $2 AND status = 'approved' AND expires_at > now()", [assetId, userId])).rowCount;
  }

  async catalog(q: { page: number; per_page: number }, base: string) {
    const total = (await this.db.query<{ n: number }>("SELECT count(*)::int AS n FROM media_license_offers o JOIN media_assets a ON a.id = o.asset_id WHERE o.is_active AND a.status = 'ready'")).rows[0]!.n;
    const { rows } = await this.db.query(
      `SELECT o.id, o.asset_id, o.title, o.description, o.price_editorial, o.price_commercial, o.currency, a.width, a.height, a.credit, a.alt
         FROM media_license_offers o JOIN media_assets a ON a.id = o.asset_id WHERE o.is_active AND a.status = 'ready'
        ORDER BY o.created_at DESC, o.id LIMIT $1 OFFSET $2`, [q.per_page, (q.page - 1) * q.per_page],
    );
    return { total, rows: rows.map((r) => ({ ...r, price_editorial: Number(r.price_editorial), price_commercial: Number(r.price_commercial), preview_url: `${base}/${r.asset_id}?variant=medium` })) };
  }

  async createOffer(actorId: string, input: { asset_id: string; title: string; description?: string; price_editorial: number; price_commercial: number }) {
    const c = await this.db.connect();
    try {
      await c.query("BEGIN");
      const asset = (await c.query<{ purpose: string; status: string; variants: Record<string, unknown> | null }>("SELECT purpose, status, variants FROM media_assets WHERE id = $1 FOR UPDATE", [input.asset_id])).rows[0];
      if (!asset) throw AppError.notFound("Archivo");
      if (asset.purpose !== "cms" || asset.status !== "ready") throw new AppError("BUSINESS_RULE", "Sólo se licencian imágenes editoriales aprobadas", { code: "NOT_LICENSABLE" });
      // Sin vista reducida, la única copia pública sería el original que se quiere vender.
      if (!asset.variants?.medium) throw new AppError("BUSINESS_RULE", "La imagen es demasiado pequeña para ofrecer una vista previa distinta del original", { code: "NO_PREVIEW" });
      const offer = (await c.query(
        `INSERT INTO media_license_offers (asset_id, title, description, price_editorial, price_commercial, created_by) VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (asset_id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, price_editorial = EXCLUDED.price_editorial, price_commercial = EXCLUDED.price_commercial, is_active = true
         RETURNING id, asset_id, title, description, price_editorial, price_commercial, currency, is_active`,
        [input.asset_id, input.title, input.description ?? null, input.price_editorial, input.price_commercial, actorId],
      )).rows[0];
      await c.query("UPDATE media_assets SET license_restricted = true WHERE id = $1", [input.asset_id]);
      await c.query("COMMIT");
      return { ...offer, price_editorial: Number(offer.price_editorial), price_commercial: Number(offer.price_commercial) };
    } catch (e) { await c.query("ROLLBACK").catch(() => undefined); throw e; } finally { c.release(); }
  }

  /** Retirar la oferta no libera el original: quien ya tiene licencia la conserva y nadie más lo descarga. */
  async retireOffer(offerId: string) {
    const upd = await this.db.query("UPDATE media_license_offers SET is_active = false WHERE id = $1", [offerId]);
    if (!upd.rowCount) throw AppError.notFound("Oferta de licencia");
  }

  async request(userId: string, input: { offer_id: string; license_type: LicenseType; licensee_name: string; intended_use: string }) {
    const offer = (await this.db.query<{ asset_id: string; price_editorial: string; price_commercial: string; currency: string }>("SELECT asset_id, price_editorial, price_commercial, currency FROM media_license_offers WHERE id = $1 AND is_active", [input.offer_id])).rows[0];
    if (!offer) throw AppError.notFound("Oferta de licencia");
    const open = await this.db.query("SELECT 1 FROM media_license_orders WHERE offer_id = $1 AND buyer_id = $2 AND status = 'requested'", [input.offer_id, userId]);
    if (open.rowCount) throw new AppError("CONFLICT", "Ya tienes una solicitud en revisión para esta imagen");
    const price = input.license_type === "commercial" ? offer.price_commercial : offer.price_editorial;
    const row = (await this.db.query(
      `INSERT INTO media_license_orders (offer_id, asset_id, buyer_id, licensee_name, license_type, intended_use, price, currency) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, offer_id, asset_id, license_type, licensee_name, intended_use, price, currency, status, created_at`,
      [input.offer_id, offer.asset_id, userId, input.licensee_name, input.license_type, input.intended_use, price, offer.currency],
    )).rows[0];
    return { ...row, price: Number(row.price) };
  }

  async mine(userId: string, base: string) {
    const { rows } = await this.db.query(
      `SELECT r.id, r.asset_id, o.title, r.license_type, r.licensee_name, r.intended_use, r.price, r.currency, r.status, r.decision_note, r.expires_at, r.created_at
         FROM media_license_orders r JOIN media_license_offers o ON o.id = r.offer_id WHERE r.buyer_id = $1 ORDER BY r.created_at DESC LIMIT 100`, [userId],
    );
    return rows.map((r) => ({ ...r, price: Number(r.price), download_url: r.status === "approved" && r.expires_at > new Date() ? `${base}/${r.asset_id}` : null }));
  }

  async adminList(q: { status?: string; page: number; per_page: number }) {
    const total = (await this.db.query<{ n: number }>("SELECT count(*)::int AS n FROM media_license_orders WHERE ($1::text IS NULL OR status = $1)", [q.status ?? null])).rows[0]!.n;
    const { rows } = await this.db.query(
      `SELECT r.*, o.title FROM media_license_orders r JOIN media_license_offers o ON o.id = r.offer_id WHERE ($1::text IS NULL OR r.status = $1) ORDER BY r.created_at DESC LIMIT $2 OFFSET $3`,
      [q.status ?? null, q.per_page, (q.page - 1) * q.per_page],
    );
    return { total, rows: rows.map((r) => ({ ...r, price: Number(r.price) })) };
  }

  async decide(actorId: string, id: string, input: { approve: boolean; payment_reference?: string; note?: string }, ip?: string) {
    if (input.approve && !input.payment_reference) throw AppError.validation("Para aprobar hay que anotar el comprobante del pago");
    const upd = await this.db.query(
      `UPDATE media_license_orders SET status = $2, payment_reference = $3, decision_note = $4, decided_by = $5, decided_at = now(), expires_at = CASE WHEN $2 = 'approved' THEN now() + make_interval(days => $6) END
        WHERE id = $1 AND status = 'requested' RETURNING id, status, expires_at`,
      [id, input.approve ? "approved" : "rejected", input.payment_reference ?? null, input.note ?? null, actorId, LICENSE_DAYS],
    );
    if (!upd.rows[0]) throw new AppError("CONFLICT", "La solicitud no existe o ya fue decidida");
    await audit(this.db, { actor: actorId, action: input.approve ? "media.license_approve" : "media.license_reject", entity: "media_license_order", id, meta: { payment_reference: input.payment_reference ?? null }, ip });
    return upd.rows[0];
  }
}

/** Rutas de licenciamiento; se registran desde `mediaRoutes` para compartir su base de URLs. */
export function licensingRoutes(app: FastifyInstance, service: MediaLicensingService, base: string) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const ok = z.object({ data: z.any() });
  const paged = z.object({ data: z.any(), meta: z.any() });
  const bearer = [{ bearerAuth: [] }];
  const uuid = z.object({ id: z.string().uuid() });
  const page = { page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(100).default(24) };
  const admin = app.requireRole("admin");
  const rl = (max: number, timeWindow: string) => ({ rateLimit: app.env.AUTH_RATE_LIMIT_ENABLED ? { max, timeWindow } : { max: 1_000_000, timeWindow: "1 minute" } });
  const tag = ["medios"];

  r.get("/media/licenses/catalog", { schema: { tags: tag, summary: "Imágenes del banco oficial disponibles para licenciar, con su vista previa y precios", querystring: z.object(page), response: { 200: paged } } }, async (req) => {
    const { rows, total } = await service.catalog(req.query, base);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.post("/media/licenses/requests", { onRequest: app.authenticate, config: rl(20, "1 hour"), schema: { tags: tag, summary: "Solicita una licencia de uso; queda en revisión hasta confirmar el pago", security: bearer, body: z.object({ offer_id: z.string().uuid(), license_type: z.enum(LICENSE_TYPES), licensee_name: z.string().trim().min(3).max(200), intended_use: z.string().trim().min(10).max(1000) }), response: { 201: ok } } }, async (req, reply) => {
    reply.code(201);
    return { data: await service.request(req.user!.id, req.body) };
  });
  r.get("/media/licenses/mine", { onRequest: app.authenticate, schema: { tags: tag, summary: "Mis solicitudes y licencias, con el enlace de descarga de las vigentes", security: bearer, response: { 200: ok } } }, async (req) => ({ data: await service.mine(req.user!.id, base) }));

  r.post("/admin/media/licenses/offers", { onRequest: admin, schema: { tags: ["admin"], summary: "Oferta una imagen editorial para licenciar; su original deja de ser público", security: bearer, body: z.object({ asset_id: z.string().uuid(), title: z.string().trim().min(3).max(200), description: z.string().trim().max(1000).optional(), price_editorial: z.number().min(0).max(9_999_999), price_commercial: z.number().min(0).max(9_999_999) }), response: { 201: ok } } }, async (req, reply) => {
    const offer = await service.createOffer(req.user!.id, req.body);
    await audit(app.db, { actor: req.user!.id, action: "media.license_offer", entity: "media", id: req.body.asset_id, meta: { offer_id: offer.id }, ip: req.ip });
    reply.code(201);
    return { data: offer };
  });
  r.delete("/admin/media/licenses/offers/:id", { onRequest: admin, schema: { tags: ["admin"], summary: "Retira una oferta (las licencias ya concedidas siguen vigentes)", security: bearer, params: uuid, response: { 204: z.null() } } }, async (req, reply) => {
    await service.retireOffer(req.params.id);
    reply.code(204);
    return null;
  });
  r.get("/admin/media/licenses/requests", { onRequest: admin, schema: { tags: ["admin"], summary: "Solicitudes de licencia", security: bearer, querystring: z.object({ ...page, status: z.enum(["requested", "approved", "rejected"]).optional() }), response: { 200: paged } } }, async (req) => {
    const { rows, total } = await service.adminList(req.query);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.post("/admin/media/licenses/requests/:id/decide", { onRequest: admin, schema: { tags: ["admin"], summary: "Aprueba (anotando el comprobante del pago) o rechaza una solicitud de licencia", security: bearer, params: uuid, body: z.object({ approve: z.boolean(), payment_reference: z.string().trim().min(3).max(120).optional(), note: z.string().trim().max(500).optional() }), response: { 200: ok } } }, async (req) => ({ data: await service.decide(req.user!.id, req.params.id, req.body, req.ip) }));
}
