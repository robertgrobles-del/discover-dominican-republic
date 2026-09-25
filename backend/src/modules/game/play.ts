import { randomBytes } from "node:crypto";
import type { PoolClient } from "pg";
import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";
import type { GameService } from "./service.js";

const TRIVIA_QUESTIONS = 10;
const TRIVIA_MAX_XP = 150;          // tope por partida, sea cual sea el valor de las preguntas
const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const newCode = (n: number) => Array.from(randomBytes(n), (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");

/** Trivia, premios canjeables y referidos: cada resultado se calcula aquí y se concede con `GameService.grant()`. */
export class PlayService {
  constructor(private readonly db: Db, private readonly game: GameService) {}

  private async tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
    const c = await this.db.connect();
    try { await c.query("BEGIN"); const out = await fn(c); await c.query("COMMIT"); return out; }
    catch (e) { await c.query("ROLLBACK").catch(() => undefined); throw e; }
    finally { c.release(); }
  }

  // ---------- Trivia ----------
  /** Abre una partida con preguntas al azar SIN la respuesta correcta; una sola partida abierta por usuario. */
  async startTrivia(userId: string) {
    const open = (await this.db.query<{ id: string; question_ids: string[]; answers: Record<string, unknown> }>("SELECT id, question_ids, answers FROM trivia_sessions WHERE user_id = $1 AND finished_at IS NULL AND started_at > now() - interval '2 hours' ORDER BY started_at DESC LIMIT 1", [userId])).rows[0];
    const questionsOf = async (ids: string[]) => {
      const { rows } = await this.db.query<{ id: string; question: string; options: string[]; category: string; difficulty: string; image_url: string | null }>("SELECT id, question, options, category, difficulty, image_url FROM trivia_questions WHERE id = ANY($1)", [ids]);
      return ids.map((id) => rows.find((r) => r.id === id)!).filter(Boolean);
    };
    if (open) return { session_id: open.id, answered: Object.keys(open.answers).length, questions: await questionsOf(open.question_ids), resumed: true };
    const picked = (await this.db.query<{ id: string }>("SELECT id FROM trivia_questions WHERE is_active ORDER BY random() LIMIT $1", [TRIVIA_QUESTIONS])).rows.map((r) => r.id);
    if (picked.length < 3) throw new AppError("BUSINESS_RULE", "Todavía no hay suficientes preguntas de trivia", { code: "NOT_ENOUGH_QUESTIONS" });
    await this.db.query("UPDATE trivia_sessions SET finished_at = now() WHERE user_id = $1 AND finished_at IS NULL", [userId]); // sesiones viejas sin terminar
    const s = (await this.db.query<{ id: string }>("INSERT INTO trivia_sessions (user_id, total_questions, question_ids) VALUES ($1,$2,$3) RETURNING id", [userId, picked.length, picked])).rows[0]!;
    return { session_id: s.id, answered: 0, questions: await questionsOf(picked), resumed: false };
  }

  async answerTrivia(userId: string, sessionId: string, input: { question_id: string; choice: number }) {
    return this.tx(async (c) => {
      const s = (await c.query<{ question_ids: string[]; answers: Record<string, { choice: number; correct: boolean }>; finished_at: Date | null }>("SELECT question_ids, answers, finished_at FROM trivia_sessions WHERE id = $1 AND user_id = $2 FOR UPDATE", [sessionId, userId])).rows[0];
      if (!s) throw AppError.notFound("Partida");
      if (s.finished_at) throw new AppError("BUSINESS_RULE", "La partida ya terminó", { code: "SESSION_FINISHED" });
      if (!s.question_ids.includes(input.question_id)) throw AppError.validation("Esa pregunta no es de esta partida");
      if (s.answers[input.question_id]) throw new AppError("CONFLICT", "Ya respondiste esta pregunta", { reason: "ALREADY_ANSWERED" });
      const q = (await c.query<{ options: unknown[]; correct_index: number; explanation: string | null }>("SELECT options, correct_index, explanation FROM trivia_questions WHERE id = $1", [input.question_id])).rows[0]!;
      if (input.choice < 0 || input.choice >= q.options.length) throw AppError.validation("Opción inválida");
      const correct = input.choice === q.correct_index;
      await c.query("UPDATE trivia_sessions SET answers = answers || $2::jsonb WHERE id = $1", [sessionId, JSON.stringify({ [input.question_id]: { choice: input.choice, correct } })]);
      await c.query("UPDATE trivia_questions SET times_answered = times_answered + 1, times_correct = times_correct + $2 WHERE id = $1", [input.question_id, correct ? 1 : 0]);
      return { correct, correct_index: q.correct_index, explanation: q.explanation };
    });
  }

  async finishTrivia(userId: string, sessionId: string) {
    return this.tx(async (c) => {
      const s = (await c.query<{ question_ids: string[]; answers: Record<string, { correct: boolean }>; finished_at: Date | null; started_at: Date }>("SELECT question_ids, answers, finished_at, started_at FROM trivia_sessions WHERE id = $1 AND user_id = $2 FOR UPDATE", [sessionId, userId])).rows[0];
      if (!s) throw AppError.notFound("Partida");
      if (s.finished_at) throw new AppError("CONFLICT", "La partida ya se cerró", { reason: "ALREADY_FINISHED" });
      const qs = (await c.query<{ id: string; xp_reward: number }>("SELECT id, xp_reward FROM trivia_questions WHERE id = ANY($1)", [s.question_ids])).rows;
      let correct = 0, xp = 0, streak = 0, maxStreak = 0;
      for (const id of s.question_ids) {
        const a = s.answers[id];
        if (a?.correct) { correct++; streak++; maxStreak = Math.max(maxStreak, streak); xp += qs.find((q) => q.id === id)?.xp_reward ?? 0; } else streak = 0;
      }
      xp = Math.min(TRIVIA_MAX_XP, xp);
      const grant = await this.game.grant({ userId, action: "trivia_completed", ref: sessionId, xp, coins: correct === s.question_ids.length && correct > 0 ? 5 : 0, description: `Trivia: ${correct}/${s.question_ids.length}` }, c);
      const paid = !grant.reason; // con el tope diario alcanzado la partida cuenta para el ranking, pero no da XP
      await c.query("UPDATE trivia_sessions SET finished_at = now(), completed_at = now(), score = $2, correct_answers = $2, max_streak = $3, xp_earned = $4, coins_earned = $5, duration_seconds = $6 WHERE id = $1", [sessionId, correct, maxStreak, paid ? grant.granted.xp : 0, paid ? grant.granted.coins : 0, Math.round((Date.now() - s.started_at.getTime()) / 1000)]);
      return { score: correct, total: s.question_ids.length, max_streak: maxStreak, granted: grant.granted, denied_reason: grant.reason ?? null, level_up: grant.level_up, achievements_unlocked: grant.achievements_unlocked };
    });
  }

  async triviaLeaderboard(limit: number) {
    const { rows } = await this.db.query(
      `SELECT rank() OVER (ORDER BY best DESC, games DESC)::int AS rank, user_id, best, games, p.display_name, p.avatar_url FROM (
         SELECT t.user_id, max(t.score)::int AS best, count(*)::int AS games FROM trivia_sessions t WHERE t.finished_at > now() - interval '7 days' AND t.total_questions > 0 GROUP BY t.user_id) x
       JOIN users u ON u.id = x.user_id AND u.status = 'active' LEFT JOIN profiles p ON p.id = x.user_id WHERE coalesce(p.is_suspended, false) = false ORDER BY rank, user_id LIMIT ${limit}`,
    );
    const short = (n: string | null) => { const [a = "", b = ""] = (n ?? "").trim().split(/\s+/); return a ? `${a}${b ? ` ${b[0]!.toUpperCase()}.` : ""}` : "Explorador"; };
    return rows.map((r) => ({ rank: r.rank, best_score: r.best, games: r.games, user: { id: r.user_id, name: short(r.display_name), avatar_url: r.avatar_url } }));
  }

  // ---------- Premios ----------
  async prizes() {
    const { rows } = await this.db.query(
      `SELECT id, name, short_description, description, image_url, prize_type, coin_cost, coalesce(min_level, 1) AS min_level, sponsor, valid_until, terms, is_featured,
              CASE WHEN quantity_available IS NULL THEN NULL ELSE GREATEST(0, quantity_available - coalesce(quantity_redeemed, 0)) END AS remaining
         FROM gamification_prizes WHERE is_active AND (valid_until IS NULL OR valid_until >= current_date) ORDER BY is_featured DESC, coin_cost`,
    );
    return rows;
  }

  /** Canje atómico: descuenta monedas y stock en una transacción, genera el código y, si es físico, crea el envío. */
  async redeem(userId: string, prizeId: string, shipping?: { recipient_name: string; recipient_phone: string; shipping_address: string }) {
    return this.tx(async (c) => {
      const p = (await c.query<{ id: string; name: string; prize_type: string; coin_cost: number; min_level: number; valid_until: string | null }>("SELECT id, name, prize_type, coin_cost, coalesce(min_level, 1) AS min_level, valid_until FROM gamification_prizes WHERE id = $1 AND is_active FOR UPDATE", [prizeId])).rows[0];
      if (!p || (p.valid_until && String(p.valid_until).slice(0, 10) < new Date().toISOString().slice(0, 10))) throw AppError.notFound("Premio");
      const physical = p.prize_type === "physical" || p.prize_type === "merchandise";
      if (physical && !shipping) throw AppError.validation("Este premio es físico: indica los datos de envío");
      const stock = await c.query("UPDATE gamification_prizes SET quantity_redeemed = coalesce(quantity_redeemed, 0) + 1 WHERE id = $1 AND (quantity_available IS NULL OR coalesce(quantity_redeemed, 0) < quantity_available)", [prizeId]);
      if (!stock.rowCount) throw new AppError("BUSINESS_RULE", "El premio se agotó", { code: "OUT_OF_STOCK" });
      const player = (await c.query<{ current_level: number }>("SELECT current_level FROM user_gamification WHERE user_id = $1", [userId])).rows[0];
      if ((player?.current_level ?? 1) < p.min_level) throw new AppError("BUSINESS_RULE", `Necesitas el nivel ${p.min_level} para este premio`, { code: "LEVEL_TOO_LOW" });
      const code = `RD-${newCode(8)}`;
      const red = (await c.query<{ id: string }>("INSERT INTO user_prize_redemptions (user_id, prize_id, coins_spent, status, redemption_code) VALUES ($1,$2,$3,'pending',$4) RETURNING id", [userId, prizeId, p.coin_cost, code])).rows[0]!;
      // El descuento de monedas lanza INSUFFICIENT_COINS si no alcanzan, y con él se deshace el stock y el canje.
      await this.game.grant({ userId, action: "prize_redeemed", ref: red.id, coins: -p.coin_cost, description: `Canje: ${p.name}`, skipLimits: true, noMissions: true, noAchievements: true }, c);
      if (physical && shipping) await c.query("INSERT INTO reward_shipments (user_id, redemption_id, recipient_name, recipient_phone, shipping_address) VALUES ($1,$2,$3,$4,$5)", [userId, red.id, shipping.recipient_name, shipping.recipient_phone, shipping.shipping_address]);
      return { redemption_id: red.id, code, prize: p.name, coins_spent: p.coin_cost, shipping: physical };
    });
  }

  async redemptions(userId: string) {
    return (await this.db.query("SELECT r.id, r.status, r.redemption_code AS code, r.coins_spent, r.created_at, p.name AS prize, p.prize_type FROM user_prize_redemptions r JOIN gamification_prizes p ON p.id = r.prize_id WHERE r.user_id = $1 ORDER BY r.created_at DESC LIMIT 100", [userId])).rows;
  }
  async shipments(userId: string) {
    return (await this.db.query("SELECT s.id, s.status, s.courier_name, s.tracking_number, s.shipped_at, s.created_at, p.name AS prize FROM reward_shipments s LEFT JOIN user_prize_redemptions r ON r.id = s.redemption_id LEFT JOIN gamification_prizes p ON p.id = r.prize_id WHERE s.user_id = $1 ORDER BY s.created_at DESC LIMIT 100", [userId])).rows;
  }

  // ---------- Referidos ----------
  async myReferral(userId: string) {
    let row = (await this.db.query<{ id: string; code: string; total_referrals: number; total_earnings_coins: number }>("SELECT id, code, total_referrals, total_earnings_coins FROM referral_codes WHERE user_id = $1", [userId])).rows[0];
    if (!row) {
      for (let i = 0; i < 5 && !row; i++) {
        row = (await this.db.query<{ id: string; code: string; total_referrals: number; total_earnings_coins: number }>("INSERT INTO referral_codes (user_id, code) VALUES ($1,$2) ON CONFLICT DO NOTHING RETURNING id, code, total_referrals, total_earnings_coins", [userId, newCode(7)])).rows[0]
          ?? (await this.db.query<{ id: string; code: string; total_referrals: number; total_earnings_coins: number }>("SELECT id, code, total_referrals, total_earnings_coins FROM referral_codes WHERE user_id = $1", [userId])).rows[0];
      }
    }
    return { code: row!.code, total_referrals: row!.total_referrals, total_earnings_coins: row!.total_earnings_coins };
  }

  /** Aplica el código de otra persona: una sola vez por usuario, no el propio, con correo verificado y cuenta reciente (30 días). */
  async applyReferral(userId: string, codeRaw: string) {
    const code = codeRaw.trim().toUpperCase();
    return this.tx(async (c) => {
      const me = (await c.query<{ verified: boolean; created_at: Date }>("SELECT email_verified_at IS NOT NULL AS verified, created_at FROM users WHERE id = $1", [userId])).rows[0]!;
      if (!me.verified) throw new AppError("FORBIDDEN", "Verifica tu correo para usar un código de referido", { code: "EMAIL_NOT_VERIFIED" });
      if (Date.now() - me.created_at.getTime() > 30 * 86_400_000) throw new AppError("BUSINESS_RULE", "Los códigos de referido sólo se aplican en los primeros 30 días de la cuenta", { code: "ACCOUNT_TOO_OLD" });
      const ref = (await c.query<{ id: string; user_id: string }>("SELECT id, user_id FROM referral_codes WHERE code = $1 AND is_active", [code])).rows[0];
      if (!ref) throw AppError.notFound("Código");
      if (ref.user_id === userId) throw new AppError("BUSINESS_RULE", "No puedes usar tu propio código", { code: "OWN_CODE" });
      const used = await c.query("INSERT INTO referral_uses (referral_code_id, referred_user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [ref.id, userId]);
      if (!used.rowCount) throw new AppError("CONFLICT", "Ya usaste un código de referido", { reason: "ALREADY_REFERRED" });
      const mine = await this.game.grant({ userId, action: "referral_applied", ref: ref.id }, c);
      const theirs = await this.game.grant({ userId: ref.user_id, action: "referral_signup", ref: userId, description: "Un referido se registró con tu código" }, c);
      await c.query("UPDATE referral_uses SET xp_awarded = $2, coins_awarded = $3 WHERE referral_code_id = $1 AND referred_user_id = $4", [ref.id, mine.granted.xp, mine.granted.coins, userId]);
      await c.query("UPDATE referral_codes SET total_referrals = total_referrals + 1, total_earnings_coins = total_earnings_coins + $2 WHERE id = $1", [ref.id, theirs.granted.coins]);
      await c.query("UPDATE user_gamification SET total_referrals = total_referrals + 1 WHERE user_id = $1", [ref.user_id]);
      return { granted: mine.granted, level_up: mine.level_up };
    });
  }
}
