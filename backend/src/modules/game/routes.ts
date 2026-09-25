import type { FastifyInstance, FastifyRequest } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { PUBLIC_CACHE } from "../../plugins/etag.js";
import { audit } from "../operators/team.js";
import { PlayService } from "./play.js";
import { GameService, type GrantResult } from "./service.js";

declare module "fastify" { interface FastifyInstance { game: GameService; play: PlayService } }

const ok = z.object({ data: z.any() });
const bearer = [{ bearerAuth: [] }];
const uuid = z.object({ id: z.string().uuid() });
const summary = (r: GrantResult) => ({ granted: r.granted, total_xp: r.total_xp, coins: r.coins, level: r.level, level_up: r.level_up, missions_completed: r.missions_completed, achievements_unlocked: r.achievements_unlocked, milestones_reached: r.milestones_reached });

/** Juego (docs §5.11). El cliente sólo informa qué hizo; XP y monedas los decide el servidor. */
export async function gameRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const db = app.db;
  const game = app.game, play = app.play;
  const rl = (max: number, timeWindow: string) => ({ rateLimit: app.env.AUTH_RATE_LIMIT_ENABLED ? { max, timeWindow } : { max: 1_000_000, timeWindow: "1 minute" } });
  const optionalUser = async (req: FastifyRequest) => { if (req.headers.authorization) { try { await app.authenticate(req, undefined as never); } catch { req.user = undefined; } } };
  const auth = app.authenticate;
  const admin = app.requireRole("admin");
  const pub = <T>(reply: { header: (k: string, v: string) => unknown }, v: T) => { reply.header("cache-control", PUBLIC_CACHE); return v; };

  // ---------- Perfil de juego ----------
  r.get("/gamification/me", { preHandler: auth, schema: { tags: ["gamificación"], summary: "Mi perfil de juego: XP, monedas, nivel, racha, insignias y liga", security: bearer, response: { 200: ok } } }, async (req) => ({ data: await game.me(req.user!.id) }));
  r.get("/gamification/me/transactions", { preHandler: auth, schema: { tags: ["gamificación"], summary: "Historial de XP y monedas (cursor)", security: bearer, querystring: z.object({ cursor: z.string().max(200).optional(), limit: z.coerce.number().int().min(1).max(100).default(30) }), response: { 200: z.object({ data: z.any(), meta: z.any() }) } } }, async (req) => {
    const t = await game.transactions(req.user!.id, req.query);
    return { data: t.rows, meta: { limit: req.query.limit, next_cursor: t.next_cursor } };
  });
  r.get("/gamification/levels", { schema: { tags: ["gamificación"], summary: "Niveles", response: { 200: ok } } }, async (_q, reply) => pub(reply, { data: (await db.query("SELECT level_number AS number, title, xp_required, icon, color, marketplace_discount, perks FROM gamification_levels ORDER BY level_number")).rows }));
  r.get("/gamification/rules", { schema: { tags: ["gamificación"], summary: "Reglas de puntos (cómo ganar XP y monedas)", response: { 200: ok } } }, async (_q, reply) => pub(reply, { data: (await db.query("SELECT action, description, xp, coins, daily_cap, cooldown_seconds, unique_per_ref, client_allowed FROM gamification_rules WHERE is_active AND (xp > 0 OR coins > 0) ORDER BY xp DESC, action")).rows }));

  r.post("/gamification/actions", {
    preHandler: auth, config: rl(60, "1 minute"),
    schema: { tags: ["gamificación"], summary: "Informa una acción del usuario; el servidor decide si otorga puntos", security: bearer, body: z.object({ action: z.string().regex(/^[a-z][a-z0-9_]{1,40}$/), ref_type: z.string().max(40).optional(), ref_id: z.string().max(80).optional() }), response: { 200: ok } },
  }, async (req) => {
    const rule = (await db.query<{ client_allowed: boolean }>("SELECT client_allowed FROM gamification_rules WHERE action = $1 AND is_active", [req.body.action])).rows[0];
    // Las acciones que el servidor puede verificar por sí mismo (reseñas, favoritos, reservas…) se otorgan desde su propio módulo, nunca por petición del cliente.
    if (!rule?.client_allowed) throw new AppError("FORBIDDEN", "Esa acción no se puede reclamar desde el cliente", { code: "ACTION_NOT_CLAIMABLE" });
    const ref = req.body.ref_id ? `${req.body.ref_type ?? "ref"}:${req.body.ref_id}` : null;
    const res = await game.grant({ userId: req.user!.id, action: req.body.action, ref });
    if (res.reason === "daily_cap" || res.reason === "cooldown") {
      // Insistir contra el tope es señal de abuso: se cuenta y, si se repite, se marca la cuenta para revisión manual.
      const n = Number((await db.query<{ value: string }>(
        `INSERT INTO user_flags (user_id, flag_name, value) VALUES ($1, 'xp_denied_' || to_char(now() AT TIME ZONE 'America/Santo_Domingo', 'YYYYMMDD'), '1')
         ON CONFLICT (user_id, flag_name) DO UPDATE SET value = (user_flags.value::int + 1)::text, updated_at = now() RETURNING value`, [req.user!.id],
      )).rows[0]!.value);
      if (n === 200) await db.query("INSERT INTO user_flags (user_id, flag_name, value) VALUES ($1, 'xp_abuse_review', $2) ON CONFLICT (user_id, flag_name) DO UPDATE SET value = EXCLUDED.value, updated_at = now()", [req.user!.id, String(n)]);
    }
    return { data: { ...summary(res), denied_reason: res.reason ?? null } };
  });

  // ---------- Retención ----------
  r.post("/gamification/check-in", { preHandler: auth, schema: { tags: ["gamificación"], summary: "Check-in diario (una vez por día en hora de RD); actualiza la racha", security: bearer, response: { 200: ok } } }, async (req) => ({ data: await game.checkIn(req.user!.id) }));
  r.post("/gamification/early-bird", { preHandler: auth, schema: { tags: ["gamificación"], summary: "Bono madrugador (antes de las 8:00 hora de RD)", security: bearer, response: { 200: ok } } }, async (req) => ({ data: await game.earlyBird(req.user!.id) }));
  r.post("/gamification/streak-bonus", { preHandler: auth, schema: { tags: ["gamificación"], summary: "Bono por hitos de racha (7, 14, 30, 60 y 100 días)", security: bearer, response: { 200: ok } } }, async (req) => ({ data: await game.streakBonus(req.user!.id) }));
  r.post("/gamification/milestones/check", { preHandler: auth, schema: { tags: ["gamificación"], summary: "Entrega los hitos de XP pendientes", security: bearer, response: { 200: ok } } }, async (req) => ({ data: await game.checkMilestones(req.user!.id) }));

  // ---------- Misiones y logros ----------
  r.get("/gamification/missions", { preHandler: optionalUser, schema: { tags: ["gamificación"], summary: "Misiones activas (con mi progreso si hay sesión)", security: [{}, ...bearer], response: { 200: ok } } }, async (req) => ({ data: await game.missions(req.user?.id ?? null) }));
  r.get("/gamification/missions/me", { preHandler: auth, schema: { tags: ["gamificación"], summary: "Mis misiones con progreso", security: bearer, response: { 200: ok } } }, async (req) => ({ data: (await game.missions(req.user!.id)).filter((m) => m.progress > 0 || m.completed) }));
  r.post("/gamification/missions/:id/progress", { preHandler: auth, schema: { tags: ["gamificación"], summary: "Estado de una misión. El progreso lo suma el servidor con las acciones reales; aquí no se envían cifras", security: bearer, params: uuid, response: { 200: ok } } }, async (req) => {
    const m = (await game.missions(req.user!.id)).find((x) => x.id === req.params.id);
    if (!m) throw AppError.notFound("Misión");
    return { data: m };
  });
  r.get("/gamification/achievements", { preHandler: optionalUser, schema: { tags: ["gamificación"], summary: "Catálogo de logros (los secretos se ocultan hasta desbloquearse)", security: [{}, ...bearer], response: { 200: ok } } }, async (req) => ({ data: await game.achievements(req.user?.id ?? null) }));
  r.get("/gamification/achievements/me", { preHandler: auth, schema: { tags: ["gamificación"], summary: "Mis insignias", security: bearer, response: { 200: ok } } }, async (req) => ({ data: (await game.achievements(req.user!.id)).filter((a) => a.unlocked) }));
  r.post("/gamification/achievements/:id/unlock", { preHandler: auth, config: rl(30, "1 minute"), schema: { tags: ["gamificación"], summary: "Pide desbloquear un logro; el servidor comprueba la condición", security: bearer, params: uuid, response: { 200: ok } } }, async (req) => ({ data: await game.unlockAchievement(req.user!.id, req.params.id) }));

  // ---------- Premios ----------
  r.get("/gamification/prizes", { schema: { tags: ["gamificación"], summary: "Premios canjeables", response: { 200: ok } } }, async (_q, reply) => pub(reply, { data: await play.prizes() }));
  r.post("/gamification/prizes/:id/redeem", {
    preHandler: auth, config: rl(10, "1 minute"),
    schema: { tags: ["gamificación"], summary: "Canjea un premio con monedas (stock y monedas en una sola transacción)", security: bearer, params: uuid, body: z.object({ recipient_name: z.string().trim().min(2).max(100), recipient_phone: z.string().trim().min(7).max(30), shipping_address: z.string().trim().min(8).max(300) }).nullish(), response: { 201: ok } },
  }, async (req, reply) => { reply.code(201); return { data: await play.redeem(req.user!.id, req.params.id, req.body ?? undefined) }; });
  r.get("/gamification/redemptions/me", { preHandler: auth, schema: { tags: ["gamificación"], summary: "Mis canjes", security: bearer, response: { 200: ok } } }, async (req) => ({ data: await play.redemptions(req.user!.id) }));
  r.get("/gamification/shipments/me", { preHandler: auth, schema: { tags: ["gamificación"], summary: "Mis envíos de premios", security: bearer, response: { 200: ok } } }, async (req) => ({ data: await play.shipments(req.user!.id) }));

  // ---------- Trivia ----------
  r.get("/trivia/session", { preHandler: auth, config: rl(20, "1 hour"), schema: { tags: ["gamificación"], summary: "Inicia (o retoma) una partida; las preguntas llegan sin la respuesta correcta", security: bearer, response: { 200: ok } } }, async (req) => ({ data: await play.startTrivia(req.user!.id) }));
  r.post("/trivia/session/:id/answer", { preHandler: auth, config: rl(120, "1 minute"), schema: { tags: ["gamificación"], summary: "Responde una pregunta (se corrige en el servidor)", security: bearer, params: uuid, body: z.object({ question_id: z.string().uuid(), choice: z.number().int().min(0).max(9) }), response: { 200: ok } } }, async (req) => ({ data: await play.answerTrivia(req.user!.id, req.params.id, req.body) }));
  r.post("/trivia/session/:id/finish", { preHandler: auth, schema: { tags: ["gamificación"], summary: "Termina la partida; el XP se calcula con los aciertos registrados (tope por partida)", security: bearer, params: uuid, response: { 200: ok } } }, async (req) => ({ data: await play.finishTrivia(req.user!.id, req.params.id) }));
  r.get("/trivia/leaderboard", { schema: { tags: ["gamificación"], summary: "Ranking de trivia (últimos 7 días)", querystring: z.object({ limit: z.coerce.number().int().min(1).max(100).default(20) }), response: { 200: ok } } }, async (req, reply) => pub(reply, { data: await play.triviaLeaderboard(req.query.limit) }));

  // ---------- Temporada y ranking ----------
  r.get("/gamification/seasons/current", { schema: { tags: ["gamificación"], summary: "Temporada actual", response: { 200: ok } } }, async (_q, reply) => {
    const s = (await db.query("SELECT id, name, number, starts_at, ends_at, top_rewards FROM gamification_seasons WHERE is_active")).rows[0] ?? null;
    return pub(reply, { data: s });
  });
  r.get("/gamification/leagues", { schema: { tags: ["gamificación"], summary: "Ligas semanales", response: { 200: ok } } }, async (_q, reply) => pub(reply, { data: (await db.query("SELECT name, slug, icon, min_xp_week, max_xp_week, coin_reward, color FROM gamification_leagues ORDER BY display_order")).rows }));
  r.get("/gamification/leaderboard", { preHandler: optionalUser, schema: { tags: ["gamificación"], summary: "Ranking por temporada, semana o histórico (con mi posición si hay sesión)", security: [{}, ...bearer], querystring: z.object({ scope: z.enum(["season", "week", "all"]).default("season"), limit: z.coerce.number().int().min(1).max(100).default(20) }), response: { 200: z.object({ data: z.any(), meta: z.any() }) } } }, async (req) => {
    const b = await game.leaderboard(req.query.scope, req.query.limit, req.user?.id ?? null);
    return { data: b.rows, meta: { scope: req.query.scope, me: b.me } };
  });

  // ---------- Referidos ----------
  r.get("/referrals/me", { preHandler: auth, schema: { tags: ["gamificación"], summary: "Mi código de referido y estadísticas (se crea al primer uso)", security: bearer, response: { 200: ok } } }, async (req) => ({ data: await play.myReferral(req.user!.id) }));
  r.post("/referrals/apply", { preHandler: auth, config: rl(10, "1 hour"), schema: { tags: ["gamificación"], summary: "Aplica el código de otra persona (una vez; cuentas nuevas con correo verificado)", security: bearer, body: z.object({ code: z.string().trim().min(4).max(20) }), response: { 200: ok } } }, async (req) => ({ data: await play.applyReferral(req.user!.id, req.body.code) }));

  // ================= Administración =================
  r.post("/gamification/xp/award", {
    preHandler: admin,
    schema: { tags: ["admin"], summary: "Ajuste manual de XP/monedas con motivo (auditado)", security: bearer, body: z.object({ user_id: z.string().uuid(), xp: z.number().int().min(0).max(100_000).default(0), coins: z.number().int().min(-100_000).max(100_000).default(0), reason: z.string().trim().min(5).max(300) }), response: { 200: ok } },
  }, async (req) => {
    const b = req.body;
    if (!(await db.query("SELECT 1 FROM users WHERE id = $1 AND status = 'active'", [b.user_id])).rowCount) throw AppError.notFound("Usuario");
    const res = await game.grant({ userId: b.user_id, action: "admin_adjustment", xp: b.xp, coins: b.coins, description: `Ajuste: ${b.reason}`, skipLimits: true });
    await audit(db, { actor: req.user!.id, action: "gamification.adjusted", entity: "user", id: b.user_id, meta: { xp: b.xp, coins: b.coins, reason: b.reason }, ip: req.ip });
    return { data: summary(res) };
  });

  r.get("/admin/gamification/stats", { preHandler: admin, schema: { tags: ["admin"], summary: "XP emitido, jugadores activos, canjes y distribución por nivel", security: bearer, response: { 200: ok } } }, async () => {
    const one = async (sql: string) => Number((await db.query<{ n: string }>(sql)).rows[0]!.n);
    return {
      data: {
        players: await one("SELECT count(*) AS n FROM user_gamification"), active_7d: await one("SELECT count(DISTINCT user_id) AS n FROM gamification_transactions WHERE created_at > now() - interval '7 days'"),
        xp_issued_30d: await one("SELECT coalesce(sum(xp_amount), 0) AS n FROM gamification_transactions WHERE created_at > now() - interval '30 days'"), coins_issued_30d: await one("SELECT coalesce(sum(coin_amount) FILTER (WHERE coin_amount > 0), 0) AS n FROM gamification_transactions WHERE created_at > now() - interval '30 days'"),
        redemptions: { total: await one("SELECT count(*) AS n FROM user_prize_redemptions"), pending_shipments: await one("SELECT count(*) AS n FROM reward_shipments WHERE status IN ('pending', 'packed')") },
        flagged_users: await one("SELECT count(DISTINCT user_id) AS n FROM user_flags WHERE flag_name = 'xp_abuse_review'"),
        levels: (await db.query("SELECT current_level AS level, count(*)::int AS players FROM user_gamification GROUP BY 1 ORDER BY 1")).rows,
      },
    };
  });

  r.get("/admin/gamification/shipments", { preHandler: admin, schema: { tags: ["admin"], summary: "Consola de envíos", security: bearer, querystring: z.object({ status: z.enum(["pending", "packed", "shipped", "delivered"]).optional() }), response: { 200: ok } } }, async (req) => ({
    data: (await db.query("SELECT s.id, s.user_id, s.status, s.recipient_name, s.recipient_phone, s.shipping_address, s.courier_name, s.tracking_number, s.shipped_at, s.created_at, p.name AS prize FROM reward_shipments s LEFT JOIN user_prize_redemptions r ON r.id = s.redemption_id LEFT JOIN gamification_prizes p ON p.id = r.prize_id WHERE ($1::text IS NULL OR s.status = $1) ORDER BY s.created_at LIMIT 200", [req.query.status ?? null])).rows,
  }));
  const NEXT: Record<string, string[]> = { pending: ["packed", "shipped"], packed: ["shipped"], shipped: ["delivered"], delivered: [] };
  r.patch("/admin/gamification/shipments/:id", { preHandler: admin, schema: { tags: ["admin"], summary: "Avanza un envío (pending → packed → shipped → delivered)", security: bearer, params: uuid, body: z.object({ status: z.enum(["packed", "shipped", "delivered"]), courier_name: z.string().trim().max(80).optional(), tracking_number: z.string().trim().max(80).optional() }), response: { 204: z.null() } } }, async (req, reply) => {
    const cur = (await db.query<{ status: string; redemption_id: string | null }>("SELECT status, redemption_id FROM reward_shipments WHERE id = $1", [req.params.id])).rows[0];
    if (!cur) throw AppError.notFound("Envío");
    if (!(NEXT[cur.status] ?? []).includes(req.body.status)) throw new AppError("BUSINESS_RULE", `No se puede pasar de "${cur.status}" a "${req.body.status}"`, { code: "INVALID_TRANSITION" });
    if (req.body.status === "shipped" && !req.body.tracking_number) throw AppError.validation("Falta el número de guía");
    await db.query("UPDATE reward_shipments SET status = $2, courier_name = coalesce($3, courier_name), tracking_number = coalesce($4, tracking_number), shipped_at = CASE WHEN $2 = 'shipped' THEN now() ELSE shipped_at END, updated_at = now() WHERE id = $1", [req.params.id, req.body.status, req.body.courier_name ?? null, req.body.tracking_number ?? null]);
    if (cur.redemption_id && req.body.status === "delivered") await db.query("UPDATE user_prize_redemptions SET status = 'delivered', redeemed_at = now() WHERE id = $1", [cur.redemption_id]);
    await audit(db, { actor: req.user!.id, action: "gamification.shipment", entity: "shipment", id: req.params.id, meta: { status: req.body.status }, ip: req.ip });
    reply.code(204);
    return null;
  });

  r.post("/admin/gamification/seasons/:id/close", { preHandler: admin, schema: { tags: ["admin"], summary: "Cierra la temporada: reparte premios al top, y abre la siguiente", security: bearer, params: uuid, response: { 200: ok } } }, async (req) => {
    const res = await closeSeason(app, req.params.id);
    await audit(db, { actor: req.user!.id, action: "gamification.season_closed", entity: "season", id: req.params.id, meta: res, ip: req.ip });
    return { data: res };
  });
}

/** Cierra una temporada: congela el ranking, reparte `top_rewards` y crea la siguiente. Idempotente (una temporada ya cerrada no se reparte otra vez). */
export async function closeSeason(app: FastifyInstance, seasonId: string) {
  const db = app.db;
  const s = (await db.query<{ id: string; number: number; name: string; is_active: boolean; top_rewards: { rank: number; coins?: number; xp?: number }[] | null; ends_at: Date }>("SELECT id, number, name, is_active, top_rewards, ends_at FROM gamification_seasons WHERE id = $1", [seasonId])).rows[0];
  if (!s) throw AppError.notFound("Temporada");
  if (!s.is_active) throw new AppError("BUSINESS_RULE", "La temporada ya está cerrada", { code: "ALREADY_CLOSED" });
  const claim = await db.query("UPDATE gamification_seasons SET is_active = false WHERE id = $1 AND is_active", [seasonId]);
  if (!claim.rowCount) throw new AppError("BUSINESS_RULE", "La temporada ya está cerrada", { code: "ALREADY_CLOSED" });
  const top = (await db.query<{ user_id: string; rank: number }>(
    `SELECT s.user_id, rank() OVER (ORDER BY s.xp_this_season DESC)::int AS rank FROM user_league_stats s JOIN users u ON u.id = s.user_id AND u.status = 'active' LEFT JOIN profiles p ON p.id = s.user_id
      WHERE s.season_id = $1 AND s.xp_this_season > 0 AND coalesce(p.is_suspended, false) = false ORDER BY rank LIMIT 50`, [seasonId],
  )).rows;
  let rewarded = 0;
  for (const t of top) {
    const reward = s.top_rewards?.find((x) => x.rank === t.rank);
    if (!reward) continue;
    await app.game.grant({ userId: t.user_id, action: "season_reward", ref: `${seasonId}:${t.rank}`, xp: reward.xp ?? 0, coins: reward.coins ?? 0, description: `${s.name}: puesto ${t.rank}`, skipLimits: true, noMissions: true });
    rewarded++;
  }
  const days = 90;
  await db.query("INSERT INTO gamification_seasons (name, number, starts_at, ends_at, is_active, top_rewards) VALUES ($1, $2, now(), now() + make_interval(days => $3), true, $4) ON CONFLICT (number) DO NOTHING", [`Temporada ${s.number + 1}`, s.number + 1, days, JSON.stringify(s.top_rewards ?? [])]);
  return { closed: s.number, rewarded, next: s.number + 1 };
}
