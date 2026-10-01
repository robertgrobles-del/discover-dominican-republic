import type { FastifyInstance } from "fastify";
import { addDays, todayInSantoDomingo } from "../../lib/dates.js";
import type { JobRegistrar } from "../../contracts/jobs.js";
import { isoWeek } from "./service.js";
import { closeSeason } from "./routes.js";

/** Trabajos de gamificación (docs §9): rachas rotas, ligas semanales y cambio de temporada. */
export function registerGameJobs(app: FastifyInstance, runner: JobRegistrar) {
  const db = app.db;

  runner.register({
    name: "gamification.streaks", description: "Reinicia las rachas de quienes no hicieron check-in ayer ni hoy", everySeconds: 3600,
    run: async ({ now }) => {
      const today = todayInSantoDomingo(now);
      const res = await db.query("UPDATE user_gamification SET streak_days = 0, updated_at = now() WHERE streak_days > 0 AND (last_checkin_date IS NULL OR last_checkin_date < $1::date)", [addDays(today, -1)]);
      return { reset: res.rowCount };
    },
  });

  runner.register({
    name: "gamification.leagues", description: "Cierra la semana: asigna liga según el XP semanal, paga su premio y reinicia el contador", everySeconds: 7 * 86_400,
    run: async ({ now }) => {
      const week = isoWeek(todayInSantoDomingo(now));
      const leagues = (await db.query<{ slug: string; min_xp_week: number; max_xp_week: number | null; coin_reward: number }>("SELECT slug, min_xp_week, max_xp_week, coin_reward FROM gamification_leagues ORDER BY min_xp_week")).rows;
      const rows = (await db.query<{ user_id: string; season_id: string; xp_this_week: number }>("SELECT s.user_id, s.season_id, s.xp_this_week FROM user_league_stats s JOIN gamification_seasons z ON z.id = s.season_id AND z.is_active")).rows;
      let promoted = 0;
      for (const r of rows) {
        const league = [...leagues].reverse().find((l) => r.xp_this_week >= l.min_xp_week && (l.max_xp_week === null || r.xp_this_week <= l.max_xp_week)) ?? leagues[0];
        if (!league) continue;
        if (league.coin_reward > 0 && r.xp_this_week > 0) await app.game.grant({ userId: r.user_id, action: "league_reward", ref: `${r.season_id}:${week}`, coins: league.coin_reward, description: `Liga ${league.slug} (semana ${week})`, skipLimits: true, noMissions: true, noAchievements: true });
        await db.query("UPDATE user_league_stats SET league_slug = $3, xp_this_week = 0, week_rank = NULL, last_updated = now() WHERE user_id = $1 AND season_id = $2", [r.user_id, r.season_id, league.slug]);
        promoted++;
      }
      return { players: promoted, week };
    },
  });

  runner.register({
    name: "gamification.season_rollover", description: "Cierra la temporada vencida, reparte sus premios y abre la siguiente", everySeconds: 3600,
    run: async ({ now }) => {
      const s = (await db.query<{ id: string }>("SELECT id FROM gamification_seasons WHERE is_active AND ends_at <= $1", [now])).rows[0];
      return s ? closeSeason(app, s.id) : { closed: null };
    },
  });
}
