import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { pageMeta } from "../../lib/pagination.js";
import { verifyPassword } from "../auth/password.js";
import { audit } from "../operators/team.js";

export const FAVORITE_TYPES = ["destination", "beach", "hotel", "restaurant", "bar", "experience", "event", "airbnb", "tour", "river", "mountain", "park", "article", "route", "operator_listing", "store_product"] as const;
export const DELETION_GRACE_DAYS = 30;
const CHANNELS = ["email", "push", "in_app"] as const;
const NOTIFICATION_TYPES = ["booking", "promo", "social", "system", "gamification"] as const;

const ok = z.object({ data: z.any() });
const bearer = [{ bearerAuth: [] }];
const pageQ = { page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(100).default(24) };
const httpsUrl = z.string().url().max(500).refine((u) => u.startsWith("https://"), "Debe ser una URL https");
const uuid = z.object({ id: z.string().uuid() });

/** Perfil, preferencias, favoritos, notificaciones, exportación y borrado de cuenta (docs §5.2; Ley 172-13). */
export async function meRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const auth = app.authenticate;
  const db = app.db;

  const profile = async (userId: string) => {
    const { rows } = await db.query(
      `SELECT u.id, u.email, u.locale, u.email_verified_at IS NOT NULL AS email_verified, u.marketing_opt_in, u.created_at, p.display_name, p.avatar_url, p.bio, p.travel_interests, p.country, p.birth_year, p.currency, p.analytics_consent, p.deletion_requested_at
         FROM users u LEFT JOIN profiles p ON p.id = u.id WHERE u.id = $1`, [userId],
    );
    if (!rows[0]) throw AppError.notFound("Usuario");
    const x = rows[0];
    return { ...x, travel_interests: x.travel_interests ?? [], created_at: new Date(x.created_at).toISOString(), deletion_requested_at: x.deletion_requested_at ? new Date(x.deletion_requested_at).toISOString() : null };
  };

  r.get("/me/profile", { preHandler: auth, schema: { tags: ["perfil"], summary: "Mi perfil", security: bearer, response: { 200: ok } } }, async (req) => ({ data: await profile(req.user!.id) }));

  r.patch("/me/profile", {
    preHandler: auth,
    schema: {
      tags: ["perfil"], summary: "Edita mi perfil", security: bearer,
      body: z.object({
        display_name: z.string().trim().min(1).max(80), bio: z.string().trim().max(500).nullable(), avatar_url: httpsUrl.nullable(), travel_interests: z.array(z.string().trim().min(1).max(40)).max(20),
        country: z.string().trim().length(2).toUpperCase().nullable(), birth_year: z.number().int().min(1900).max(new Date().getUTCFullYear() - 13).nullable(),
        locale: z.enum(["es", "en", "fr", "de", "pt", "it"]), currency: z.enum(["USD", "DOP"]),
      }).partial(),
      response: { 200: ok },
    },
  }, async (req) => {
    const b = req.body;
    const cols: [string, unknown][] = [["display_name", b.display_name], ["avatar_url", b.avatar_url], ["bio", b.bio], ["country", b.country], ["birth_year", b.birth_year], ["currency", b.currency]];
    const set = cols.filter(([, v]) => v !== undefined);
    if (b.travel_interests) set.push(["travel_interests", JSON.stringify([...new Set(b.travel_interests)])]);
    await db.query("INSERT INTO profiles (id) VALUES ($1) ON CONFLICT DO NOTHING", [req.user!.id]);
    if (set.length) await db.query(`UPDATE profiles SET ${set.map(([k], i) => `"${k}" = $${i + 2}`).join(", ")}, updated_at = now() WHERE id = $1`, [req.user!.id, ...set.map(([, v]) => v)]);
    if (b.locale) await db.query("UPDATE users SET locale = $2, updated_at = now() WHERE id = $1", [req.user!.id, b.locale]);
    return { data: await profile(req.user!.id) };
  });

  // ---- Preferencias y consentimientos ----
  const prefs = async (userId: string) => {
    const p = await profile(userId);
    const saved = ((await db.query("SELECT notification_prefs FROM profiles WHERE id = $1", [userId])).rows[0]?.notification_prefs ?? {}) as Record<string, Record<string, boolean>>;
    // Lo no guardado se toma como activado para lo transaccional y desactivado para promociones.
    const notifications = Object.fromEntries(CHANNELS.map((c) => [c, Object.fromEntries(NOTIFICATION_TYPES.map((t) => [t, saved[c]?.[t] ?? (t !== "promo")]))]));
    return { locale: p.locale, currency: p.currency, consents: { marketing: !!p.marketing_opt_in, analytics: !!p.analytics_consent }, notifications };
  };
  r.get("/me/preferences", { preHandler: auth, schema: { tags: ["perfil"], summary: "Idioma, moneda, consentimientos y notificaciones", security: bearer, response: { 200: ok } } }, async (req) => ({ data: await prefs(req.user!.id) }));
  r.put("/me/preferences", {
    preHandler: auth,
    schema: {
      tags: ["perfil"], summary: "Actualiza preferencias (sólo lo enviado)", security: bearer,
      body: z.object({
        locale: z.enum(["es", "en", "fr", "de", "pt", "it"]).optional(), currency: z.enum(["USD", "DOP"]).optional(),
        consents: z.object({ marketing: z.boolean().optional(), analytics: z.boolean().optional() }).optional(),
        notifications: z.partialRecord(z.enum(CHANNELS), z.partialRecord(z.enum(NOTIFICATION_TYPES), z.boolean())).optional(),
      }),
      response: { 200: ok },
    },
  }, async (req) => {
    const id = req.user!.id, b = req.body;
    await db.query("INSERT INTO profiles (id) VALUES ($1) ON CONFLICT DO NOTHING", [id]);
    if (b.locale) await db.query("UPDATE users SET locale = $2 WHERE id = $1", [id, b.locale]);
    if (b.currency) await db.query("UPDATE profiles SET currency = $2 WHERE id = $1", [id, b.currency]);
    if (b.consents?.marketing !== undefined) await db.query("UPDATE users SET marketing_opt_in = $2 WHERE id = $1", [id, b.consents.marketing]);
    if (b.consents?.analytics !== undefined) await db.query("UPDATE profiles SET analytics_consent = $2 WHERE id = $1", [id, b.consents.analytics]);
    if (b.notifications) {
      const cur = ((await db.query("SELECT notification_prefs FROM profiles WHERE id = $1", [id])).rows[0]?.notification_prefs ?? {}) as Record<string, Record<string, boolean>>;
      for (const [c, types] of Object.entries(b.notifications)) cur[c] = { ...(cur[c] ?? {}), ...types };
      await db.query("UPDATE profiles SET notification_prefs = $2 WHERE id = $1", [id, JSON.stringify(cur)]);
    }
    if (b.consents) await audit(db, { actor: id, action: "user.consent_update", entity: "user", id, meta: b.consents as Record<string, unknown>, ip: req.ip });
    return { data: await prefs(id) };
  });

  // ---- Favoritos ----
  const favParams = z.object({ entity_type: z.enum(FAVORITE_TYPES), entity_id: z.string().trim().min(1).max(80) });
  r.get("/me/favorites", { preHandler: auth, schema: { tags: ["perfil"], summary: "Mis favoritos", security: bearer, querystring: z.object({ ...pageQ, type: z.enum(FAVORITE_TYPES).optional() }), response: { 200: z.object({ data: z.any(), meta: z.any() }) } } }, async (req) => {
    const p: unknown[] = [req.user!.id];
    let w = "user_id = $1";
    if (req.query.type) { p.push(req.query.type); w += ` AND entity_type = $${p.length}`; }
    const total = (await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM favorites WHERE ${w}`, p)).rows[0]!.n;
    const { rows } = await db.query(`SELECT entity_type, entity_id, created_at FROM favorites WHERE ${w} ORDER BY created_at DESC LIMIT ${req.query.per_page} OFFSET ${(req.query.page - 1) * req.query.per_page}`, p);
    return { data: rows, meta: pageMeta(req.query.page, req.query.per_page, total) };
  });
  r.put("/me/favorites/:entity_type/:entity_id", { preHandler: auth, config: { rateLimit: { max: 120, timeWindow: "1 minute" } }, schema: { tags: ["perfil"], summary: "Marca un favorito (idempotente)", security: bearer, params: favParams, response: { 204: z.null() } } }, async (req, reply) => {
    const n = (await db.query<{ n: number }>("SELECT count(*)::int AS n FROM favorites WHERE user_id = $1", [req.user!.id])).rows[0]!.n;
    if (n >= 2000) throw new AppError("BUSINESS_RULE", "Llegaste al máximo de favoritos", { code: "FAVORITES_LIMIT" });
    const ins = await db.query("INSERT INTO favorites (user_id, entity_type, entity_id) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING", [req.user!.id, req.params.entity_type, req.params.entity_id]);
    if (ins.rowCount) await app.game.safeGrant({ userId: req.user!.id, action: "favorite_added", ref: `${req.params.entity_type}:${req.params.entity_id}` }, req.log);
    reply.code(204);
    return null;
  });
  r.delete("/me/favorites/:entity_type/:entity_id", { preHandler: auth, schema: { tags: ["perfil"], summary: "Quita un favorito", security: bearer, params: favParams, response: { 204: z.null() } } }, async (req, reply) => {
    await db.query("DELETE FROM favorites WHERE user_id = $1 AND entity_type = $2 AND entity_id = $3", [req.user!.id, req.params.entity_type, req.params.entity_id]);
    reply.code(204);
    return null;
  });

  // ---- Notificaciones ----
  r.get("/me/notifications", { preHandler: auth, schema: { tags: ["perfil"], summary: "Mi bandeja", security: bearer, querystring: z.object({ ...pageQ, unread: z.enum(["true", "false"]).optional() }), response: { 200: z.object({ data: z.any(), meta: z.any() }) } } }, async (req) => {
    const w = `user_id = $1${req.query.unread === "true" ? " AND NOT is_read" : ""}`;
    const total = (await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM notifications WHERE ${w}`, [req.user!.id])).rows[0]!.n;
    const unread = (await db.query<{ n: number }>("SELECT count(*)::int AS n FROM notifications WHERE user_id = $1 AND NOT is_read", [req.user!.id])).rows[0]!.n;
    const { rows } = await db.query(`SELECT id, title, message, type, link, is_read, created_at FROM notifications WHERE ${w} ORDER BY created_at DESC LIMIT ${req.query.per_page} OFFSET ${(req.query.page - 1) * req.query.per_page}`, [req.user!.id]);
    return { data: rows, meta: { ...pageMeta(req.query.page, req.query.per_page, total), unread } };
  });
  r.patch("/me/notifications/:id", { preHandler: auth, schema: { tags: ["perfil"], summary: "Marca una notificación como leída o no leída", security: bearer, params: uuid, body: z.object({ is_read: z.boolean() }), response: { 204: z.null() } } }, async (req, reply) => {
    const res = await db.query("UPDATE notifications SET is_read = $3 WHERE id = $1 AND user_id = $2", [req.params.id, req.user!.id, req.body.is_read]);
    if (!res.rowCount) throw AppError.notFound("Notificación");
    reply.code(204);
    return null;
  });
  r.post("/me/notifications/read-all", { preHandler: auth, schema: { tags: ["perfil"], summary: "Marca todas como leídas", security: bearer, response: { 204: z.null() } } }, async (req, reply) => {
    await db.query("UPDATE notifications SET is_read = true WHERE user_id = $1 AND NOT is_read", [req.user!.id]);
    reply.code(204);
    return null;
  });

  // ---- Exportación y borrado (Ley 172-13) ----
  r.get("/me/export", { preHandler: auth, config: { rateLimit: { max: 5, timeWindow: "1 hour" } }, schema: { tags: ["perfil"], summary: "Descarga todos mis datos personales (JSON)", security: bearer, response: { 200: z.any() } } }, async (req, reply) => {
    const id = req.user!.id;
    const q = async (sql: string) => (await db.query(sql, [id])).rows;
    const data = {
      generated_at: new Date().toISOString(),
      account: await profile(id),
      preferences: await prefs(id),
      favorites: await q("SELECT entity_type, entity_id, created_at FROM favorites WHERE user_id = $1"),
      notifications: await q("SELECT title, message, type, link, is_read, created_at FROM notifications WHERE user_id = $1"),
      bookings: await q("SELECT reference, listing_title, date, check_out, time, guests, total_price, currency, status, payment_status, contact_name, contact_email, contact_phone, notes, created_at FROM bookings WHERE user_id = $1 ORDER BY created_at"),
      support_tickets: await q("SELECT id, subject, description, status, category, created_at FROM support_tickets WHERE user_id = $1"),
      follows: await q("SELECT following_id, created_at FROM explorer_follows WHERE follower_id = $1"),
      team_memberships: await q("SELECT org_id, role, created_at FROM org_members WHERE user_id = $1"),
    };
    await audit(db, { actor: id, action: "user.export", entity: "user", id, ip: req.ip });
    reply.header("content-disposition", `attachment; filename="descubre-rd-mis-datos.json"`);
    return data;
  });

  r.delete("/me", {
    preHandler: auth, config: { rateLimit: { max: 5, timeWindow: "1 hour" } },
    schema: { tags: ["perfil"], summary: `Solicita eliminar mi cuenta (${DELETION_GRACE_DAYS} días de gracia)`, security: bearer, body: z.object({ password: z.string().min(1).max(200) }), response: { 200: ok } },
  }, async (req) => {
    const id = req.user!.id;
    const u = (await db.query<{ password_hash: string; password_set: boolean }>("SELECT password_hash, password_set FROM users WHERE id = $1", [id])).rows[0]!;
    if (!u.password_set || !(await verifyPassword(u.password_hash, req.body.password))) throw new AppError("FORBIDDEN", "La contraseña no es correcta");
    const owns = await db.query("SELECT 1 FROM org_members WHERE user_id = $1 AND role = 'owner'", [id]);
    if (owns.rowCount) throw new AppError("BUSINESS_RULE", "Eres propietario de una organización de operador: transfiérela o ciérrala antes de eliminar tu cuenta", { code: "OWNS_ORG" });
    await db.query("INSERT INTO profiles (id) VALUES ($1) ON CONFLICT DO NOTHING", [id]);
    await db.query("UPDATE profiles SET deletion_requested_at = coalesce(deletion_requested_at, now()) WHERE id = $1", [id]);
    await db.query("UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL", [id]);
    await audit(db, { actor: id, action: "user.deletion_requested", entity: "user", id, ip: req.ip });
    return { data: { deletion_requested_at: (await profile(id)).deletion_requested_at, grace_days: DELETION_GRACE_DAYS } };
  });
  r.post("/me/deletion/cancel", { preHandler: auth, schema: { tags: ["perfil"], summary: "Cancela la solicitud de eliminación durante el período de gracia", security: bearer, response: { 204: z.null() } } }, async (req, reply) => {
    await db.query("UPDATE profiles SET deletion_requested_at = NULL WHERE id = $1", [req.user!.id]);
    await audit(db, { actor: req.user!.id, action: "user.deletion_cancelled", entity: "user", id: req.user!.id, ip: req.ip });
    reply.code(204);
    return null;
  });

  // ---- Perfil público y seguidores ----
  r.get("/users/:id/public", { schema: { tags: ["perfil"], summary: "Perfil público de un explorador", params: uuid, response: { 200: ok } } }, async (req) => {
    const { rows } = await db.query(
      `SELECT u.id, p.display_name, p.avatar_url, p.bio, p.travel_interests, u.created_at,
              (SELECT count(*)::int FROM explorer_follows WHERE following_id = u.id) AS followers, (SELECT count(*)::int FROM explorer_follows WHERE follower_id = u.id) AS following
         FROM users u LEFT JOIN profiles p ON p.id = u.id WHERE u.id = $1 AND u.status = 'active' AND coalesce(p.is_suspended, false) = false AND p.deletion_requested_at IS NULL`, [req.params.id],
    );
    if (!rows[0]) throw AppError.notFound("Explorador");
    return { data: { ...rows[0], display_name: rows[0].display_name ?? "Explorador", travel_interests: rows[0].travel_interests ?? [], created_at: new Date(rows[0].created_at).toISOString() } };
  });
  r.post("/users/:id/follow", { preHandler: auth, config: { rateLimit: { max: 60, timeWindow: "1 minute" } }, schema: { tags: ["perfil"], summary: "Seguir a un explorador", security: bearer, params: uuid, response: { 204: z.null() } } }, async (req, reply) => {
    if (req.params.id === req.user!.id) throw AppError.validation("No puedes seguirte a ti mismo");
    if (!(await db.query("SELECT 1 FROM users WHERE id = $1 AND status = 'active'", [req.params.id])).rowCount) throw AppError.notFound("Explorador");
    await db.query("INSERT INTO explorer_follows (follower_id, following_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [req.user!.id, req.params.id]);
    reply.code(204);
    return null;
  });
  r.delete("/users/:id/follow", { preHandler: auth, schema: { tags: ["perfil"], summary: "Dejar de seguir", security: bearer, params: uuid, response: { 204: z.null() } } }, async (req, reply) => {
    await db.query("DELETE FROM explorer_follows WHERE follower_id = $1 AND following_id = $2", [req.user!.id, req.params.id]);
    reply.code(204);
    return null;
  });
}
