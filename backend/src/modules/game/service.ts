import type { NotifyInTransaction } from "../../contracts/notifications.js";
import type { DenyReason, GameGrantPort, GrantInput, GrantResult } from "../../contracts/game.js";
import type { PoolClient } from "pg";
import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";
import { todayInSantoDomingo } from "../../lib/dates.js";

// Reexport temporal: los módulos vecinos aún pueden migrar imports sin alterar la API interna.
export type { DenyReason, GrantInput, GrantResult } from "../../contracts/game.js";

const RD_DAY_START = "(date_trunc('day', now() AT TIME ZONE 'America/Santo_Domingo') AT TIME ZONE 'America/Santo_Domingo')";
const STREAK_MILESTONES: [number, number][] = [[7, 1], [14, 2], [30, 4], [60, 8], [100, 15]];

/** Multiplicador de XP del check-in según los días de racha. */
export const streakMultiplier = (days: number) => (days >= 30 ? 2.5 : days >= 14 ? 2 : days >= 7 ? 1.5 : days >= 3 ? 1.2 : 1);
/** Semana ISO ("2026-W39") para reiniciar misiones semanales. */
export function isoWeek(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day + 3);
  const first = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((d.getTime() - first.getTime()) / 86_400_000 - 3 + ((first.getUTCDay() + 6) % 7)) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}
export const missionPeriod = (type: string, today: string) => (type === "daily" ? today : type === "weekly" ? isoWeek(today) : "all");

/**
 * Motor de juego (docs §5.11): la ÚNICA puerta de escritura de XP y monedas. Todo pasa por `grant()`, que es transaccional, aplica
 * las reglas de la tabla `gamification_rules` (topes diarios, enfriamiento, unicidad por referencia) y deja cada concesión en
 * `gamification_transactions`. El cliente nunca aporta cifras: sólo informa qué hizo, y el servidor decide.
 */
export class GameService implements GameGrantPort {
  constructor(private readonly db: Db, private readonly notifyInTx: NotifyInTransaction) {}

  private async tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
    const c = await this.db.connect();
    try { await c.query("BEGIN"); const out = await fn(c); await c.query("COMMIT"); return out; }
    catch (e) { await c.query("ROLLBACK").catch(() => undefined); throw e; }
    finally { c.release(); }
  }

  /** Crea la fila del jugador si falta y la bloquea: serializa las concesiones de un mismo usuario. */
  private async lockPlayer(c: PoolClient, userId: string) {
    await c.query("INSERT INTO user_gamification (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING", [userId]);
    return (await c.query("SELECT * FROM user_gamification WHERE user_id = $1 FOR UPDATE", [userId])).rows[0] as { total_xp: number; coins: number; current_level: number; streak_days: number; last_checkin_date: string | null; total_missions_completed: number };
  }

  private async levelFor(c: PoolClient | Db, xp: number) {
    const { rows } = await c.query<{ level_number: number; title: string }>("SELECT level_number, title FROM gamification_levels WHERE xp_required <= $1 ORDER BY level_number DESC LIMIT 1", [xp]);
    return rows[0] ?? { level_number: 1, title: "Turista" };
  }

  /** Concesión desde otros módulos: un fallo del juego nunca debe romper la acción principal (publicar, reseñar…). */
  async safeGrant(input: GrantInput, log: { warn: (o: object, m: string) => void }): Promise<GrantResult | null> {
    try { return await this.grant(input); } catch (err) { log.warn({ err, action: input.action }, "No se pudo otorgar la recompensa"); return null; }
  }

  /**
   * Ajuste manual del equipo (docs §5.17). Positivo: pasa por `grant` (nivel, hitos y logros). Negativo: descuenta sin bajar de cero,
   * recalcula el nivel y deja el movimiento en la bitácora con el motivo.
   */
  async adjust(userId: string, d: { xp: number; coins: number; reason: string }): Promise<{ total_xp: number; coins: number; level: number }> {
    if (d.xp >= 0 && d.coins >= 0) {
      const g = await this.grant({ userId, action: "admin_adjustment", xp: d.xp, coins: d.coins, description: `Ajuste: ${d.reason}`, skipLimits: true });
      return { total_xp: g.total_xp, coins: g.coins, level: g.level };
    }
    return this.tx(async (c) => {
      const p = await this.lockPlayer(c, userId);
      const total = Math.max(0, p.total_xp + d.xp), coins = Math.max(0, p.coins + d.coins);
      const lvl = await this.levelFor(c, total);
      await c.query("UPDATE user_gamification SET total_xp = $2, coins = $3, current_level = $4, updated_at = now() WHERE user_id = $1", [userId, total, coins, lvl.level_number]);
      if (d.xp < 0) {
        const lost = p.total_xp - total;
        await c.query("UPDATE explorer_guilds SET total_xp = GREATEST(0, total_xp - $2) WHERE id = (SELECT guild_id FROM guild_members WHERE user_id = $1)", [userId, lost]);
        await c.query("UPDATE user_league_stats SET xp_this_week = GREATEST(0, xp_this_week - $2), xp_this_season = GREATEST(0, xp_this_season - $2) WHERE user_id = $1 AND season_id IN (SELECT id FROM gamification_seasons WHERE is_active)", [userId, lost]);
      }
      await c.query("INSERT INTO gamification_transactions (id, user_id, transaction_type, xp_amount, coin_amount, description, source_type, action) VALUES (gen_random_uuid(), $1, 'admin_adjust', $2, $3, $4, 'admin', 'admin_adjustment')", [userId, total - p.total_xp, coins - p.coins, `Ajuste: ${d.reason}`]);
      return { total_xp: total, coins, level: lvl.level_number };
    });
  }

  // ---------- Concesión ----------
  async grant(input: GrantInput, client?: PoolClient): Promise<GrantResult> {
    if (client) return this.grantIn(client, input);
    return this.tx((c) => this.grantIn(c, input));
  }

  private async grantIn(c: PoolClient, input: GrantInput): Promise<GrantResult> {
    const player = await this.lockPlayer(c, input.userId);
    const empty = (reason: DenyReason): GrantResult => ({ granted: { xp: 0, coins: 0 }, reason, total_xp: player.total_xp, coins: player.coins, level: player.current_level, level_up: null, missions_completed: [], achievements_unlocked: [], milestones_reached: [] });

    const rule = (await c.query<{ xp: number; coins: number; daily_cap: number | null; cooldown_seconds: number; unique_per_ref: boolean; is_active: boolean }>("SELECT xp, coins, daily_cap, cooldown_seconds, unique_per_ref, is_active FROM gamification_rules WHERE action = $1", [input.action])).rows[0];
    if (!rule && input.xp === undefined && input.coins === undefined) return empty("no_rule");
    if (rule && !rule.is_active && !input.skipLimits) return empty("inactive");

    if (rule && !input.skipLimits) {
      if (rule.daily_cap) {
        const n = (await c.query<{ n: number }>(`SELECT count(*)::int AS n FROM gamification_transactions WHERE user_id = $1 AND action = $2 AND created_at >= ${RD_DAY_START}`, [input.userId, input.action])).rows[0]!.n;
        if (n >= rule.daily_cap) return empty("daily_cap");
      }
      if (rule.cooldown_seconds) {
        const recent = await c.query("SELECT 1 FROM gamification_transactions WHERE user_id = $1 AND action = $2 AND created_at > now() - make_interval(secs => $3) LIMIT 1", [input.userId, input.action, rule.cooldown_seconds]);
        if (recent.rowCount) return empty("cooldown");
      }
      if (rule.unique_per_ref && input.ref) {
        const dup = await c.query("SELECT 1 FROM gamification_transactions WHERE user_id = $1 AND action = $2 AND source_id = $3 LIMIT 1", [input.userId, input.action, input.ref]);
        if (dup.rowCount) return empty("duplicate");
      }
    }

    const xp = Math.max(0, Math.round(input.xp ?? rule?.xp ?? 0));
    const coins = Math.round(input.coins ?? rule?.coins ?? 0);
    if (player.coins + coins < 0) throw new AppError("BUSINESS_RULE", "Saldo de monedas insuficiente", { code: "INSUFFICIENT_COINS" });
    await c.query(
      "INSERT INTO gamification_transactions (user_id, transaction_type, action, xp_amount, coin_amount, description, source_type, source_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
      [input.userId, coins < 0 ? "spend" : "earn", input.action, xp, coins, input.description ?? null, input.action, input.ref ?? null],
    );

    const totalXp = player.total_xp + xp;
    const lvl = await this.levelFor(c, totalXp);
    await c.query("UPDATE user_gamification SET total_xp = $2, coins = coins + $3, current_level = $4, last_activity_date = $5::date, updated_at = now() WHERE user_id = $1", [input.userId, totalXp, coins, lvl.level_number, todayInSantoDomingo()]);
    if (xp > 0) {
      await c.query("UPDATE explorer_guilds SET total_xp = total_xp + $2 WHERE id = (SELECT guild_id FROM guild_members WHERE user_id = $1)", [input.userId, xp]);
      await c.query(
        `INSERT INTO user_league_stats (user_id, season_id, xp_this_week, xp_this_season) SELECT $1, id, $2, $2 FROM gamification_seasons WHERE is_active
         ON CONFLICT (user_id, season_id) DO UPDATE SET xp_this_week = user_league_stats.xp_this_week + $2, xp_this_season = user_league_stats.xp_this_season + $2, last_updated = now()`, [input.userId, xp],
      );
    }

    const out: GrantResult = { granted: { xp, coins }, total_xp: totalXp, coins: player.coins + coins, level: lvl.level_number, level_up: lvl.level_number > player.current_level ? { from: player.current_level, to: lvl.level_number, title: lvl.title } : null, missions_completed: [], achievements_unlocked: [], milestones_reached: [] };

    if (out.level_up) await this.notifyInTx(c, input.userId, { type: "gamification", title: `¡Subiste al nivel ${out.level_up.to}: ${out.level_up.title}!`, message: "Sigue explorando para desbloquear más.", link: "/perfil/juego", data: { level: out.level_up.to } });
    if (xp > 0) out.milestones_reached = await this.milestones(c, input.userId, out);
    if (!input.noMissions && input.action !== "mission_completed") out.missions_completed = await this.advanceMissions(c, input.userId, input.action, out);
    if (!input.noAchievements) out.achievements_unlocked = await this.evaluateAchievements(c, input.userId, out);
    return out;
  }

  /** Hitos de XP: al cruzar un umbral se entrega su bono de monedas (una vez). */
  private async milestones(c: PoolClient, userId: string, out: GrantResult) {
    const { rows } = await c.query<{ id: string; badge_name: string; coin_reward: number }>(
      "SELECT m.id, m.badge_name, m.coin_reward FROM xp_milestones m WHERE m.xp_threshold <= $2 AND NOT EXISTS (SELECT 1 FROM user_xp_milestones u WHERE u.user_id = $1 AND u.milestone_id = m.id) ORDER BY m.xp_threshold", [userId, out.total_xp],
    );
    const reached: GrantResult["milestones_reached"] = [];
    for (const m of rows) {
      const ins = await c.query("INSERT INTO user_xp_milestones (user_id, milestone_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [userId, m.id]);
      if (!ins.rowCount) continue;
      if (m.coin_reward > 0) {
        await c.query("INSERT INTO gamification_transactions (user_id, transaction_type, action, xp_amount, coin_amount, description, source_type, source_id) VALUES ($1,'earn','xp_milestone',0,$2,$3,'xp_milestone',$4)", [userId, m.coin_reward, `Hito: ${m.badge_name}`, m.id]);
        await c.query("UPDATE user_gamification SET coins = coins + $2 WHERE user_id = $1", [userId, m.coin_reward]);
        out.coins += m.coin_reward;
      }
      reached.push({ id: m.id, name: m.badge_name, coins: m.coin_reward });
    }
    return reached;
  }

  private async advanceMissions(c: PoolClient, userId: string, action: string, out: GrantResult) {
    const today = todayInSantoDomingo();
    const { rows: missions } = await c.query<{ id: string; name: string; target_count: number; xp_reward: number; coin_reward: number; mission_type: string }>(
      "SELECT id, name, target_count, xp_reward, coin_reward, mission_type FROM gamification_missions WHERE is_active AND target_action = $1 AND coalesce(min_level, 1) <= $2", [action, out.level],
    );
    const done: GrantResult["missions_completed"] = [];
    for (const m of missions) {
      const period = missionPeriod(m.mission_type, today);
      const row = (await c.query<{ progress: number; is_completed: boolean }>(
        `INSERT INTO user_missions (user_id, mission_id, period_key, progress) VALUES ($1,$2,$3,1)
         ON CONFLICT (user_id, mission_id, period_key) DO UPDATE SET progress = CASE WHEN user_missions.is_completed THEN user_missions.progress ELSE LEAST($4, user_missions.progress + 1) END, updated_at = now()
         RETURNING progress, is_completed`, [userId, m.id, period, m.target_count],
      )).rows[0]!;
      if (row.is_completed || row.progress < m.target_count) continue;
      await c.query("UPDATE user_missions SET is_completed = true, completed_at = now() WHERE user_id = $1 AND mission_id = $2 AND period_key = $3", [userId, m.id, period]);
      await c.query("UPDATE user_gamification SET total_missions_completed = total_missions_completed + 1 WHERE user_id = $1", [userId]);
      const r = await this.grantIn(c, { userId, action: "mission_completed", ref: `${m.id}:${period}`, xp: m.xp_reward, coins: m.coin_reward, description: `Misión: ${m.name}`, skipLimits: true, noMissions: true, noAchievements: true });
      out.total_xp = r.total_xp; out.coins = r.coins; out.level = r.level;
      out.level_up ??= r.level_up;
      out.milestones_reached.push(...r.milestones_reached);
      done.push({ id: m.id, name: m.name, xp: m.xp_reward, coins: m.coin_reward });
    }
    return done;
  }

  // ---------- Logros con condición evaluada en el servidor ----------
  private async conditionMet(c: PoolClient, userId: string, cond: string, p: { total_xp: number; level: number; streak: number; missions: number; referrals: number; purchases: number }): Promise<boolean> {
    const m = cond.trim().match(/^(xp|level|streak|missions|referrals|purchases|action:[a-z_]+)>=(\d+)$/);
    if (!m) return false;
    const n = Number(m[2]);
    const key = m[1]!;
    if (key === "xp") return p.total_xp >= n;
    if (key === "level") return p.level >= n;
    if (key === "streak") return p.streak >= n;
    if (key === "missions") return p.missions >= n;
    if (key === "referrals") return p.referrals >= n;
    if (key === "purchases") return p.purchases >= n;
    const action = key.slice(7);
    return (await c.query<{ n: number }>("SELECT count(*)::int AS n FROM gamification_transactions WHERE user_id = $1 AND action = $2 AND (xp_amount > 0 OR coin_amount > 0)", [userId, action])).rows[0]!.n >= n;
  }

  private async evaluateAchievements(c: PoolClient, userId: string, out: GrantResult) {
    const unlocked: GrantResult["achievements_unlocked"] = [];
    for (let pass = 0; pass < 5; pass++) {
      const p = (await c.query("SELECT total_xp, current_level AS level, streak_days AS streak, total_missions_completed AS missions, total_referrals AS referrals, total_purchases AS purchases FROM user_gamification WHERE user_id = $1", [userId])).rows[0];
      const { rows } = await c.query<{ id: string; name: string; icon: string; xp_reward: number; coin_reward: number; unlock_condition: string }>(
        `SELECT a.id, a.name, a.icon, coalesce(a.xp_reward, 0) AS xp_reward, coalesce(a.coin_reward, 0) AS coin_reward, a.unlock_condition FROM achievements a
          WHERE a.is_active AND a.unlock_condition IS NOT NULL AND coalesce(a.min_level, 1) <= $2 AND (a.available_from IS NULL OR a.available_from <= current_date) AND (a.available_until IS NULL OR a.available_until >= current_date)
            AND NOT EXISTS (SELECT 1 FROM user_achievements u WHERE u.user_id = $1 AND u.achievement_id = a.id AND u.unlocked_at IS NOT NULL)`, [userId, p.level],
      );
      let any = false;
      for (const a of rows) {
        if (!(await this.conditionMet(c, userId, a.unlock_condition, p))) continue;
        const ins = await c.query("INSERT INTO user_achievements (user_id, achievement_id, progress, unlocked_at) VALUES ($1,$2,1,now()) ON CONFLICT (user_id, achievement_id) DO UPDATE SET unlocked_at = coalesce(user_achievements.unlocked_at, now()) WHERE user_achievements.unlocked_at IS NULL", [userId, a.id]);
        if (!ins.rowCount) continue;
        await c.query("UPDATE achievements SET total_unlocked = coalesce(total_unlocked, 0) + 1 WHERE id = $1", [a.id]);
        const r = await this.grantIn(c, { userId, action: "achievement_unlocked", ref: a.id, xp: a.xp_reward, coins: a.coin_reward, description: `Logro: ${a.name}`, skipLimits: true, noMissions: true, noAchievements: true });
        out.total_xp = r.total_xp; out.coins = r.coins; out.level = r.level; out.level_up ??= r.level_up;
        out.milestones_reached.push(...r.milestones_reached);
        unlocked.push({ id: a.id, name: a.name, icon: a.icon });
        await this.notifyInTx(c, userId, { type: "gamification", title: `Logro desbloqueado: ${a.name}`, link: "/perfil/logros", data: { achievement_id: a.id } });
        any = true;
      }
      if (!any) break;
    }
    return unlocked;
  }

  /** ¿Cumple el jugador esta condición (`xp>=N`, `level>=N`, `action:x>=N`…)? Se evalúa siempre en el servidor. */
  async meets(userId: string, condition: string, c: PoolClient | Db = this.db): Promise<boolean> {
    const p = (await c.query("SELECT total_xp, current_level AS level, streak_days AS streak, total_missions_completed AS missions, total_referrals AS referrals, total_purchases AS purchases FROM user_gamification WHERE user_id = $1", [userId])).rows[0]
      ?? { total_xp: 0, level: 1, streak: 0, missions: 0, referrals: 0, purchases: 0 };
    return this.conditionMet(c as PoolClient, userId, condition, p);
  }

  /** Desbloqueo pedido por el usuario: sólo procede si el servidor comprueba la condición. */
  async unlockAchievement(userId: string, achievementId: string) {
    return this.tx(async (c) => {
      await this.lockPlayer(c, userId);
      const a = (await c.query<{ id: string; name: string; icon: string; unlock_condition: string | null }>("SELECT id, name, icon, unlock_condition FROM achievements WHERE id = $1 AND is_active", [achievementId])).rows[0];
      if (!a) throw AppError.notFound("Logro");
      if ((await c.query("SELECT 1 FROM user_achievements WHERE user_id = $1 AND achievement_id = $2 AND unlocked_at IS NOT NULL", [userId, achievementId])).rowCount) throw new AppError("CONFLICT", "Ya tienes este logro", { reason: "ALREADY_UNLOCKED" });
      if (!a.unlock_condition) throw new AppError("BUSINESS_RULE", "Este logro se otorga de forma especial", { code: "NOT_UNLOCKABLE" });
      const out: GrantResult = { granted: { xp: 0, coins: 0 }, total_xp: 0, coins: 0, level: 1, level_up: null, missions_completed: [], achievements_unlocked: [], milestones_reached: [] };
      const found = await this.evaluateAchievements(c, userId, out);
      if (!found.some((x) => x.id === achievementId)) throw new AppError("BUSINESS_RULE", "Todavía no cumples la condición de este logro", { code: "CONDITION_NOT_MET", condition: a.unlock_condition });
      return { unlocked: found, total_xp: out.total_xp, coins: out.coins };
    });
  }

  // ---------- Retención ----------
  async checkIn(userId: string, now = new Date()) {
    return this.tx(async (c) => {
      const p = await this.lockPlayer(c, userId);
      const today = todayInSantoDomingo(now);
      if (p.last_checkin_date && String(p.last_checkin_date).slice(0, 10) === today) return { success: false as const, reason: "already_checked_in" as const, streak: p.streak_days };
      const yesterday = todayInSantoDomingo(new Date(now.getTime() - 86_400_000));
      const streak = p.last_checkin_date && String(p.last_checkin_date).slice(0, 10) === yesterday ? p.streak_days + 1 : 1;
      await c.query("UPDATE user_gamification SET streak_days = $2, last_checkin_date = $3::date WHERE user_id = $1", [userId, streak, today]);
      const rule = (await c.query<{ xp: number; coins: number }>("SELECT xp, coins FROM gamification_rules WHERE action = 'checkin' AND is_active")).rows[0];
      if (!rule) return { success: true as const, xp: 0, coins: 0, streak, multiplier: 1, level_up: null };
      const multiplier = streakMultiplier(streak);
      const r = await this.grantIn(c, { userId, action: "checkin", ref: today, xp: Math.round(rule.xp * multiplier), coins: rule.coins, description: `Check-in (racha de ${streak})`, skipLimits: true });
      return { success: true as const, xp: r.granted.xp, coins: r.granted.coins, streak, multiplier, level_up: r.level_up, missions_completed: r.missions_completed, achievements_unlocked: r.achievements_unlocked };
    });
  }

  async earlyBird(userId: string, now = new Date()) {
    const hour = new Date(now.getTime() - 4 * 3_600_000).getUTCHours();
    if (hour >= 8) return { success: false as const, reason: "too_late" as const };
    const r = await this.grant({ userId, action: "early_bird", ref: todayInSantoDomingo(now), description: "Bono madrugador" });
    return r.reason ? { success: false as const, reason: r.reason } : { success: true as const, xp: r.granted.xp, level_up: r.level_up };
  }

  /** Bono por hitos de racha (7, 14, 30, 60 y 100 días): una vez por racha e hito. */
  async streakBonus(userId: string, now = new Date()) {
    return this.tx(async (c) => {
      const p = await this.lockPlayer(c, userId);
      const hit = STREAK_MILESTONES.find(([d]) => d === p.streak_days);
      if (!hit || !p.last_checkin_date) return { success: false as const, reason: "no_milestone" as const, streak: p.streak_days };
      const start = new Date(`${String(p.last_checkin_date).slice(0, 10)}T00:00:00Z`);
      start.setUTCDate(start.getUTCDate() - (p.streak_days - 1));
      const rule = (await c.query<{ coins: number }>("SELECT coins FROM gamification_rules WHERE action = 'streak_bonus' AND is_active")).rows[0];
      const r = await this.grantIn(c, { userId, action: "streak_bonus", ref: `${p.streak_days}:${start.toISOString().slice(0, 10)}`, coins: (rule?.coins ?? 25) * hit[1], description: `Bono de racha de ${p.streak_days} días` });
      void now;
      return r.reason ? { success: false as const, reason: r.reason, streak: p.streak_days } : { success: true as const, coins: r.granted.coins, streak: p.streak_days };
    });
  }

  async checkMilestones(userId: string) {
    return this.tx(async (c) => {
      const p = await this.lockPlayer(c, userId);
      const out: GrantResult = { granted: { xp: 0, coins: 0 }, total_xp: p.total_xp, coins: p.coins, level: p.current_level, level_up: null, missions_completed: [], achievements_unlocked: [], milestones_reached: [] };
      out.milestones_reached = await this.milestones(c, userId, out);
      return { milestones_reached: out.milestones_reached, coins: out.coins };
    });
  }

  // ---------- Lectura ----------
  async me(userId: string) {
    const c = this.db;
    const p = (await c.query("SELECT total_xp, coins, current_level, streak_days, last_checkin_date, total_missions_completed, total_referrals FROM user_gamification WHERE user_id = $1", [userId])).rows[0] ?? { total_xp: 0, coins: 0, current_level: 1, streak_days: 0, last_checkin_date: null, total_missions_completed: 0, total_referrals: 0 };
    const levels = (await c.query<{ level_number: number; title: string; xp_required: number; icon: string }>("SELECT level_number, title, xp_required, icon FROM gamification_levels ORDER BY level_number")).rows;
    const cur = [...levels].reverse().find((l) => l.xp_required <= p.total_xp) ?? levels[0];
    const next = levels.find((l) => l.level_number > (cur?.level_number ?? 1)) ?? null;
    const into = p.total_xp - (cur?.xp_required ?? 0);
    const span = next ? next.xp_required - (cur?.xp_required ?? 0) : 0;
    const today = todayInSantoDomingo();
    const badges = (await c.query("SELECT a.id, a.name, a.icon, a.rarity, u.unlocked_at FROM user_achievements u JOIN achievements a ON a.id = u.achievement_id WHERE u.user_id = $1 AND u.unlocked_at IS NOT NULL ORDER BY u.unlocked_at DESC LIMIT 12", [userId])).rows;
    const stat = (await c.query<{ league_slug: string; xp_this_week: number; xp_this_season: number }>("SELECT s.league_slug, s.xp_this_week, s.xp_this_season FROM user_league_stats s JOIN gamification_seasons z ON z.id = s.season_id AND z.is_active WHERE s.user_id = $1", [userId])).rows[0];
    const rank = stat ? Number((await c.query<{ n: string }>("SELECT count(*) + 1 AS n FROM user_league_stats s JOIN gamification_seasons z ON z.id = s.season_id AND z.is_active WHERE s.xp_this_season > $1", [stat.xp_this_season])).rows[0]!.n) : null;
    const league = stat ? (await c.query("SELECT name, slug, icon FROM gamification_leagues WHERE slug = $1", [stat.league_slug])).rows[0] ?? null : null;
    return {
      xp: p.total_xp, coins: p.coins,
      level: cur ? { number: cur.level_number, title: cur.title, icon: cur.icon } : null,
      next_level: next ? { number: next.level_number, title: next.title, xp_required: next.xp_required } : null,
      progress: { xp_into_level: into, xp_for_next: span, percent: span ? Math.min(100, Math.floor((into / span) * 100)) : 100 },
      streak: { days: p.streak_days, last_checkin: p.last_checkin_date ? String(p.last_checkin_date).slice(0, 10) : null, checked_in_today: !!p.last_checkin_date && String(p.last_checkin_date).slice(0, 10) === today, multiplier: streakMultiplier(p.streak_days) },
      missions_completed: p.total_missions_completed, referrals: p.total_referrals, badges,
      league: league ? { ...league, xp_this_week: stat!.xp_this_week } : null, season: stat ? { xp: stat.xp_this_season, rank } : null,
    };
  }

  async transactions(userId: string, opts: { cursor?: string; limit: number }) {
    const params: unknown[] = [userId];
    let where = "user_id = $1";
    if (opts.cursor) {
      const [t, id] = Buffer.from(opts.cursor, "base64url").toString().split("|");
      if (!t || !id || Number.isNaN(Date.parse(t)) || !/^[0-9a-f-]{36}$/.test(id)) throw AppError.validation("Cursor inválido");
      params.push(t, id);
      where += ` AND (created_at, id) < ($2::timestamptz, $3::uuid)`;
    }
    const rows = (await this.db.query(`SELECT id, transaction_type AS type, action, xp_amount AS xp, coin_amount AS coins, description, created_at FROM gamification_transactions WHERE ${where} ORDER BY created_at DESC, id DESC LIMIT ${opts.limit + 1}`, params)).rows;
    const page = rows.slice(0, opts.limit), last = page.at(-1);
    return { rows: page, next_cursor: rows.length > opts.limit && last ? Buffer.from(`${new Date(last.created_at).toISOString()}|${last.id}`).toString("base64url") : null };
  }

  async missions(userId: string | null) {
    const today = todayInSantoDomingo();
    const level = userId ? Number((await this.db.query<{ l: number }>("SELECT coalesce((SELECT current_level FROM user_gamification WHERE user_id = $1), 1) AS l", [userId])).rows[0]!.l) : 1;
    const { rows } = await this.db.query<{
      id: string; name: string; description: string | null; target_action: string; target_count: number;
      xp_reward: number; coin_reward: number; mission_type: string; is_featured: boolean; icon: string | null;
      min_level: number; sponsor_id: string | null; sponsor_name: string | null; sponsor_logo_url: string | null;
      sponsor_reward_text: string | null; is_sponsored: boolean;
    }>(
      `SELECT id, name, description, target_action, target_count, xp_reward, coin_reward, mission_type, is_featured, icon,
              coalesce(min_level, 1) AS min_level, sponsor_id, sponsor_name, sponsor_logo_url, sponsor_reward_text, is_sponsored
         FROM gamification_missions
        WHERE is_active AND coalesce(min_level, 1) <= $1
        ORDER BY is_featured DESC, is_sponsored DESC, mission_type, name`, [level],
    );
    const mine = userId ? (await this.db.query<{ mission_id: string; period_key: string; progress: number; is_completed: boolean }>("SELECT mission_id, period_key, progress, is_completed FROM user_missions WHERE user_id = $1", [userId])).rows : [];
    return rows.map((m) => {
      const mp = mine.find((x) => x.mission_id === m.id && x.period_key === missionPeriod(m.mission_type, today));
      return { ...m, progress: mp?.progress ?? 0, completed: mp?.is_completed ?? false };
    });
  }

  async achievements(userId: string | null) {
    const { rows } = await this.db.query(
      `SELECT a.id, a.name, a.short_description, a.description, a.icon, a.category, a.rarity, a.xp_reward, a.coin_reward, a.is_secret, a.unlock_condition, a.total_unlocked, u.unlocked_at
         FROM achievements a LEFT JOIN user_achievements u ON u.achievement_id = a.id AND u.user_id = $1 WHERE a.is_active ORDER BY a.display_order, a.name`, [userId],
    );
    // Los logros secretos no revelan su nombre ni su condición hasta desbloquearse.
    return rows.map((a) => (a.is_secret && !a.unlocked_at ? { id: a.id, name: "???", icon: "❓", category: a.category, rarity: a.rarity, is_secret: true, unlocked: false } : { ...a, unlocked: !!a.unlocked_at }));
  }

  async guildLeaderboard(limit: number, viewer: string | null) {
    const rows = (await this.db.query("SELECT id, name, slug, icon, region, member_count, total_xp, is_official, rank() OVER (ORDER BY total_xp DESC)::int AS rank FROM explorer_guilds WHERE member_count > 0 ORDER BY total_xp DESC, name LIMIT $1", [limit])).rows;
    const mine = viewer ? (await this.db.query("SELECT g.id, g.name, g.total_xp, (SELECT count(*) + 1 FROM explorer_guilds o WHERE o.total_xp > g.total_xp)::int AS rank FROM guild_members m JOIN explorer_guilds g ON g.id = m.guild_id WHERE m.user_id = $1", [viewer])).rows[0] ?? null : null;
    return { rows, me: mine };
  }

  async leaderboard(scope: "season" | "week" | "all", limit: number, viewer: string | null) {
    const from = scope === "all"
      ? "SELECT g.user_id, g.total_xp AS xp FROM user_gamification g WHERE g.total_xp > 0"
      : `SELECT s.user_id, s.${scope === "week" ? "xp_this_week" : "xp_this_season"} AS xp FROM user_league_stats s JOIN gamification_seasons z ON z.id = s.season_id AND z.is_active WHERE s.${scope === "week" ? "xp_this_week" : "xp_this_season"} > 0`;
    const base = `WITH board AS (${from}), ranked AS (SELECT b.user_id, b.xp, rank() OVER (ORDER BY b.xp DESC) AS rank FROM board b JOIN users u ON u.id = b.user_id AND u.status = 'active' LEFT JOIN profiles p ON p.id = b.user_id WHERE coalesce(p.is_suspended, false) = false)`;
    const top = (await this.db.query(`${base} SELECT r.rank::int, r.xp, r.user_id, p.display_name, p.avatar_url FROM ranked r LEFT JOIN profiles p ON p.id = r.user_id ORDER BY r.rank, r.user_id LIMIT ${limit}`)).rows;
    const short = (n: string | null) => { const [a = "", b = ""] = (n ?? "").trim().split(/\s+/); return a ? `${a}${b ? ` ${b[0]!.toUpperCase()}.` : ""}` : "Explorador"; };
    const me = viewer ? (await this.db.query(`${base} SELECT rank::int, xp FROM ranked WHERE user_id = $1`, [viewer])).rows[0] ?? null : null;
    return { rows: top.map((x) => ({ rank: x.rank, xp: x.xp, user: { id: x.user_id, name: short(x.display_name), avatar_url: x.avatar_url } })), me };
  }
}
