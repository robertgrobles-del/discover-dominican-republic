import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { COLLECTIONS } from "../../contracts/content-collections.js";
import { audit } from "../../lib/audit.js";
import { AppError } from "../../lib/errors.js";

export const GRANT_CAPABILITIES = ["catalog.manage", "analytics.read"] as const;
/** Tope de duración de un permiso con vencimiento. */
const MAX_HOURS = 24 * 365;

const bearer = [{ bearerAuth: [] }];
const ok = z.object({ data: z.any() });

/**
 * Capacidades acotadas (plan de accesos, puntos 85, 95 y 96): dan a una persona un permiso concreto, con
 * alcance, motivo y, cuando delega registros, vencimiento. No crean roles globales: quien recibe
 * `catalog.manage` sobre `events` no puede publicar, borrar definitivamente ni tocar usuarios.
 */
export async function capabilityGrantRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const db = app.db;
  const admin = app.requireRole("admin");
  const tags = ["admin", "capacidades acotadas"];
  const paths = new Set(COLLECTIONS.map((c) => c.path));

  r.get("/admin/capability-grants", {
    onRequest: admin,
    schema: { tags, summary: "Permisos acotados concedidos, con su alcance y vigencia", security: bearer, querystring: z.object({ user_id: z.string().uuid().optional(), active: z.enum(["true", "false"]).default("true") }), response: { 200: ok } },
  }, async (req) => ({
    data: (await db.query(
      `SELECT g.id, g.user_id, u.email, g.capability, g.collections, g.record_ids, g.reason, g.granted_by, g.expires_at, g.revoked_at, g.created_at,
              (g.revoked_at IS NULL AND (g.expires_at IS NULL OR g.expires_at > now())) AS active
         FROM capability_grants g JOIN users u ON u.id = g.user_id
        WHERE ($1::uuid IS NULL OR g.user_id = $1) AND ($2::boolean IS FALSE OR (g.revoked_at IS NULL AND (g.expires_at IS NULL OR g.expires_at > now())))
        ORDER BY g.created_at DESC LIMIT 200`, [req.query.user_id ?? null, req.query.active === "true"],
    )).rows,
  }));

  r.post("/admin/capability-grants", {
    onRequest: admin,
    schema: {
      tags, summary: "Concede un permiso acotado (colecciones del catálogo, registros concretos con vencimiento, o analítica de sólo lectura)", security: bearer,
      body: z.object({
        user_id: z.string().uuid(),
        capability: z.enum(GRANT_CAPABILITIES),
        collections: z.array(z.string().max(60)).max(30).default([]),
        record_ids: z.array(z.string().uuid()).max(50).default([]),
        hours: z.number().int().min(1).max(MAX_HOURS).optional().describe("Duración; obligatoria si se delegan registros concretos"),
        reason: z.string().trim().min(10).max(300),
      }),
      response: { 201: ok },
    },
  }, async (req, reply) => {
    const b = req.body;
    if (b.user_id === req.user!.id) throw new AppError("FORBIDDEN", "No puedes concederte permisos a ti mismo");
    const target = (await db.query<{ status: string }>("SELECT status FROM users WHERE id = $1", [b.user_id])).rows[0];
    if (!target) throw AppError.notFound("Usuario");
    if (target.status !== "active") throw new AppError("BUSINESS_RULE", "La cuenta no está activa", { code: "INVALID_STATE" });
    if (b.capability === "catalog.manage") {
      if (!b.collections.length) throw AppError.validation("Indica al menos una colección", { field: "collections" });
      const unknown = b.collections.filter((c) => !paths.has(c));
      if (unknown.length) throw AppError.validation(`Colección desconocida: ${unknown.join(", ")}`, { field: "collections" });
      // Delegar un evento o un reto concreto es siempre temporal (punto 85).
      if (b.record_ids.length && !b.hours) throw AppError.validation("Un permiso sobre registros concretos necesita vencimiento", { field: "hours" });
      if (b.record_ids.length && b.collections.length !== 1) throw AppError.validation("Los registros concretos pertenecen a una sola colección", { field: "collections" });
    } else if (b.collections.length || b.record_ids.length) throw AppError.validation("La analítica de sólo lectura no lleva alcance por colección", { field: "collections" });

    const row = (await db.query(
      "INSERT INTO capability_grants (user_id, capability, collections, record_ids, reason, granted_by, expires_at) VALUES ($1,$2,$3,$4,$5,$6, CASE WHEN $7::int IS NULL THEN NULL ELSE now() + make_interval(hours => $7) END) RETURNING id, user_id, capability, collections, record_ids, expires_at",
      [b.user_id, b.capability, b.collections, b.record_ids, b.reason, req.user!.id, b.hours ?? null],
    )).rows[0];
    await audit(db, { actor: req.user!.id, action: "capability.granted", entity: "user", id: b.user_id, meta: { grant_id: row.id, capability: b.capability, collections: b.collections, records: b.record_ids.length, expires_at: row.expires_at, reason: b.reason }, ip: req.ip });
    await app.notifications.notify(b.user_id, { type: "system", title: "Tienes un permiso nuevo en la consola", message: b.capability === "analytics.read" ? "Analítica de sólo lectura." : `Gestión de: ${b.collections.join(", ")}.`, data: { grant_id: row.id, capability: b.capability } });
    reply.code(201);
    return { data: row };
  });

  r.delete("/admin/capability-grants/:id", { onRequest: admin, schema: { tags, summary: "Revoca un permiso acotado", security: bearer, params: z.object({ id: z.string().uuid() }), response: { 204: z.null() } } }, async (req, reply) => {
    const row = (await db.query<{ user_id: string; capability: string }>("UPDATE capability_grants SET revoked_at = now() WHERE id = $1 AND revoked_at IS NULL RETURNING user_id, capability", [req.params.id])).rows[0];
    if (!row) throw AppError.notFound("Permiso vigente");
    await audit(db, { actor: req.user!.id, action: "capability.revoked", entity: "user", id: row.user_id, meta: { grant_id: req.params.id, capability: row.capability }, ip: req.ip });
    reply.code(204);
    return null;
  });

  // La propia persona ve qué permisos acotados tiene, para que la consola muestre sólo lo que puede usar.
  r.get("/me/capability-grants", { onRequest: app.authenticate, schema: { tags: ["perfil"], summary: "Mis permisos acotados vigentes", security: bearer, response: { 200: ok } } }, async (req) => ({
    data: (await db.query("SELECT id, capability, collections, record_ids, expires_at FROM capability_grants WHERE user_id = $1 AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at > now()) ORDER BY created_at DESC", [req.user!.id])).rows,
  }));
}
