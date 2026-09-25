import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { isoWeek, missionPeriod, streakMultiplier } from "../src/modules/game/service.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = () => `gm${Date.now().toString(36)}${n++}@test.local`;
const tag = Date.now().toString(36);

describe("utilidades del juego", () => {
  it("multiplicador de racha y períodos de misión", () => {
    expect([1, 2, 3, 6, 7, 13, 14, 29, 30, 90].map(streakMultiplier)).toEqual([1, 1, 1.2, 1.2, 1.5, 1.5, 2, 2, 2.5, 2.5]);
    expect(isoWeek("2026-01-01")).toBe("2026-W01");
    expect(isoWeek("2026-12-31")).toBe("2026-W53");
    expect(isoWeek("2027-01-03")).toBe("2026-W53");
    expect(missionPeriod("daily", "2026-05-05")).toBe("2026-05-05");
    expect(missionPeriod("weekly", "2026-05-05")).toBe("2026-W19");
    expect(missionPeriod("special", "2026-05-05")).toBe("all");
  });
});

describe("gamificación", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let admin: string;

  const call = (method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const signup = async (verified = true) => {
    const email = uniq();
    const res = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true, display_name: "Jugador Prueba" } }));
    if (verified) await pool.query("UPDATE users SET email_verified_at = now() WHERE id = $1", [res.data.user.id]);
    return { token: res.data.tokens.access_token as string, id: res.data.user.id as string, email };
  };
  const award = (userId: string, xp: number, coins = 0) => call("POST", "/gamification/xp/award", { token: admin, payload: { user_id: userId, xp, coins, reason: "Ajuste de prueba" } });
  const me = async (token: string) => json(await call("GET", "/gamification/me", { token })).data;
  const act = (token: string, action: string, ref?: string) => call("POST", "/gamification/actions", { token, payload: { action, ...(ref ? { ref_type: "lugar", ref_id: ref } : {}) } });

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    const a = await signup();
    await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')", [a.id]);
    admin = json(await call("POST", "/auth/login", { payload: { email: a.email, password: PW } })).data.tokens.access_token;
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  describe("perfil, reglas y acciones", () => {
    it("niveles y reglas son públicos; un jugador nuevo empieza en el nivel 1", async () => {
      const levels = json(await call("GET", "/gamification/levels")).data;
      expect(levels[0]).toMatchObject({ number: 1, xp_required: 0 });
      expect(json(await call("GET", "/gamification/rules")).data.some((x: { action: string }) => x.action === "review_created")).toBe(true);
      const u = await signup();
      expect((await call("GET", "/gamification/me")).statusCode).toBe(401);
      const p = await me(u.token);
      expect(p).toMatchObject({ xp: 0, coins: 0, level: { number: 1 }, next_level: { number: 2, xp_required: 100 }, streak: { days: 0, checked_in_today: false } });
    });

    it("el cliente sólo reclama acciones permitidas y el servidor fija los puntos", async () => {
      const u = await signup();
      for (const a of ["review_created", "booking_completed", "admin_adjustment", "inventada"]) {
        const res = await act(u.token, a, "x1");
        expect(res.statusCode, a).toBe(403);
        expect(json(res).error.details.code).toBe("ACTION_NOT_CLAIMABLE");
      }
      expect((await call("POST", "/gamification/actions", { token: u.token, payload: { action: "share", xp: 9999 } })).statusCode).toBe(200); // cifras del cliente se ignoran
      expect((await me(u.token)).xp).toBe(3);
      expect((await call("POST", "/gamification/actions", { payload: { action: "share" } })).statusCode).toBe(401);
    });

    it("enfriamiento, topes diarios y unicidad por referencia", async () => {
      const u = await signup();
      const first = json(await act(u.token, "page_visit")).data;
      expect(first).toMatchObject({ granted: { xp: 1 }, denied_reason: null });
      expect(json(await act(u.token, "page_visit")).data).toMatchObject({ granted: { xp: 0 }, denied_reason: "cooldown" });
      // spot_visited: único por lugar y máximo 5 al día.
      expect(json(await act(u.token, "spot_visited", "playa-1")).data.granted.xp).toBe(15);
      expect(json(await act(u.token, "spot_visited", "playa-1")).data.denied_reason).toBe("duplicate");
      for (let i = 2; i <= 5; i++) expect(json(await act(u.token, "spot_visited", `playa-${i}`)).data.granted.xp).toBe(15);
      expect(json(await act(u.token, "spot_visited", "playa-6")).data.denied_reason).toBe("daily_cap");
      expect((await me(u.token)).xp).toBe(1 + 15 * 5);
    });

    it("subir de nivel, historial con cursor y saldo de monedas", async () => {
      const u = await signup();
      const res = json(await award(u.id, 120, 30)).data;
      expect(res).toMatchObject({ total_xp: 120, coins: 30, level: 2, level_up: { from: 1, to: 2 } });
      const p = await me(u.token);
      expect(p).toMatchObject({ xp: 120, coins: 30, level: { number: 2 }, next_level: { number: 3 }, progress: { xp_into_level: 20, xp_for_next: 200, percent: 10 } });
      for (let i = 0; i < 3; i++) await award(u.id, 1);
      const page1 = json(await call("GET", "/gamification/me/transactions?limit=2", { token: u.token }));
      expect(page1.data).toHaveLength(2);
      const page2 = json(await call("GET", `/gamification/me/transactions?limit=2&cursor=${page1.meta.next_cursor}`, { token: u.token }));
      expect(page2.data.map((x: { id: string }) => x.id)).not.toContain(page1.data[0].id);
      expect((await call("GET", "/gamification/me/transactions?cursor=basura", { token: u.token })).statusCode).toBe(400);
    });

    it("sólo un admin ajusta puntos, con motivo, y queda auditado", async () => {
      const u = await signup();
      expect((await call("POST", "/gamification/xp/award", { token: u.token, payload: { user_id: u.id, xp: 999, reason: "me lo doy yo" } })).statusCode).toBe(403);
      expect((await call("POST", "/gamification/xp/award", { token: admin, payload: { user_id: u.id, xp: 5, reason: "x" } })).statusCode).toBe(400);
      expect((await award(u.id, 5)).statusCode).toBe(200);
      expect((await pool.query("SELECT 1 FROM audit_log WHERE action = 'gamification.adjusted' AND entity_id = $1", [u.id])).rowCount).toBe(1);
      const neg = await call("POST", "/gamification/xp/award", { token: admin, payload: { user_id: u.id, coins: -100, reason: "quitar monedas de más" } });
      expect(neg.statusCode).toBe(422);
      expect(json(neg).error.details.code).toBe("INSUFFICIENT_COINS");
    });
  });

  describe("retención", () => {
    it("check-in: una vez al día, la racha crece, se rompe si se salta un día y multiplica el XP", async () => {
      const u = await signup();
      const day = (k: number) => new Date(Date.now() + k * 86_400_000);
      const r1 = await app.game.checkIn(u.id, day(-2));
      expect(r1).toMatchObject({ success: true, streak: 1, xp: 10 });
      expect(await app.game.checkIn(u.id, day(-2))).toMatchObject({ success: false, reason: "already_checked_in" });
      expect(await app.game.checkIn(u.id, day(-1))).toMatchObject({ success: true, streak: 2, xp: 10 });
      expect(await app.game.checkIn(u.id, day(0))).toMatchObject({ success: true, streak: 3, multiplier: 1.2, xp: 12 });
      expect(await app.game.checkIn(u.id, day(2))).toMatchObject({ success: true, streak: 1 }); // saltó un día
      // Por HTTP, hoy: ya hizo check-in el día de la prueba en la simulación anterior → sólo vale una vez.
      const v = await signup();
      expect(json(await call("POST", "/gamification/check-in", { token: v.token })).data).toMatchObject({ success: true, streak: 1 });
      expect(json(await call("POST", "/gamification/check-in", { token: v.token })).data).toMatchObject({ success: false, reason: "already_checked_in" });
      expect((await me(v.token)).streak).toMatchObject({ days: 1, checked_in_today: true });
    });

    it("el trabajo diario reinicia las rachas rotas", async () => {
      const u = await signup();
      await call("POST", "/gamification/check-in", { token: u.token });
      await pool.query("UPDATE user_gamification SET last_checkin_date = current_date - 5, streak_days = 9 WHERE user_id = $1", [u.id]);
      await app.jobs.runNow("gamification.streaks");
      expect((await me(u.token)).streak.days).toBe(0);
    });

    it("bono madrugador (antes de las 8:00 de RD) y bono de racha una sola vez por hito", async () => {
      const u = await signup();
      expect(await app.game.earlyBird(u.id, new Date("2030-01-01T14:00:00Z"))).toEqual({ success: false, reason: "too_late" }); // 10:00 en RD
      expect(await app.game.earlyBird(u.id, new Date("2030-01-01T10:00:00Z"))).toMatchObject({ success: true, xp: 15 }); // 06:00 en RD
      expect(await app.game.earlyBird(u.id, new Date("2030-01-01T10:00:00Z"))).toMatchObject({ success: false, reason: "daily_cap" });

      expect(json(await call("POST", "/gamification/streak-bonus", { token: u.token })).data).toMatchObject({ success: false, reason: "no_milestone" });
      await pool.query("UPDATE user_gamification SET streak_days = 7, last_checkin_date = current_date WHERE user_id = $1", [u.id]);
      expect(json(await call("POST", "/gamification/streak-bonus", { token: u.token })).data).toMatchObject({ success: true, coins: 25 });
      expect(json(await call("POST", "/gamification/streak-bonus", { token: u.token })).data).toMatchObject({ success: false, reason: "duplicate" });
    });

    it("hitos de XP: al cruzar el umbral se entrega el bono una sola vez", async () => {
      const u = await signup();
      const res = json(await award(u.id, 500)).data;
      expect(res.milestones_reached.map((m: { coins: number }) => m.coins)).toContain(10);
      expect(res.coins).toBeGreaterThanOrEqual(10);
      expect(json(await award(u.id, 1)).data.milestones_reached).toEqual([]);
      expect(json(await call("POST", "/gamification/milestones/check", { token: u.token })).data.milestones_reached).toEqual([]);
    });
  });

  describe("misiones y logros", () => {
    it("una misión suma progreso con acciones reales, se completa una vez por período y paga su premio", async () => {
      const mission = json(await call("POST", "/admin/gamification_missions", { token: admin, payload: { name: `Explora ${tag}`, target_action: "spot_visited", target_count: 2, xp_reward: 30, coin_reward: 5, mission_type: "daily", is_active: true } })).data;
      const u = await signup();
      const st = async () => (json(await call("GET", "/gamification/missions", { token: u.token })).data as { id: string; progress: number; completed: boolean }[]).find((m) => m.id === mission.id)!;
      expect(await st()).toMatchObject({ progress: 0, completed: false });
      await act(u.token, "spot_visited", `m-${tag}-1`);
      expect(await st()).toMatchObject({ progress: 1, completed: false });
      const done = json(await act(u.token, "spot_visited", `m-${tag}-2`)).data;
      expect(done.missions_completed).toEqual([expect.objectContaining({ id: mission.id, xp: 30, coins: 5 })]);
      expect((await me(u.token)).xp).toBe(15 + 15 + 30);
      expect(await st()).toMatchObject({ progress: 2, completed: true });
      const again = json(await act(u.token, "spot_visited", `m-${tag}-3`)).data;
      expect(again.missions_completed).toEqual([]);
      expect(json(await call("GET", "/gamification/missions/me", { token: u.token })).data.some((m: { id: string }) => m.id === mission.id)).toBe(true);
      expect(json(await call("POST", `/gamification/missions/${mission.id}/progress`, { token: u.token, payload: { progress: 99 } })).data.progress).toBe(2); // el cliente no fija progreso
    });

    it("los logros se desbloquean al cumplirse su condición en el servidor y los secretos se ocultan", async () => {
      const ach = json(await call("POST", "/admin/achievements", { token: admin, payload: { name: `Cien ${tag}`, category: "xp", icon: "💯", xp_reward: 10, coin_reward: 3, unlock_condition: "xp>=100" } })).data;
      const secret = json(await call("POST", "/admin/achievements", { token: admin, payload: { name: `Secreto ${tag}`, category: "xp", is_secret: true, unlock_condition: "xp>=99999" } })).data;
      const manual = json(await call("POST", "/admin/achievements", { token: admin, payload: { name: `Manual ${tag}`, category: "xp" } })).data;
      const u = await signup();
      const early = await call("POST", `/gamification/achievements/${ach.id}/unlock`, { token: u.token });
      expect(early.statusCode).toBe(422);
      expect(json(early).error.details.code).toBe("CONDITION_NOT_MET");
      expect(json(await call("POST", `/gamification/achievements/${manual.id}/unlock`, { token: u.token })).error.details.code).toBe("NOT_UNLOCKABLE");
      const res = json(await award(u.id, 100)).data;
      expect(res.achievements_unlocked.map((a: { id: string }) => a.id)).toContain(ach.id);
      expect(res.total_xp).toBe(110); // 100 + recompensa del logro
      expect(res.coins).toBeGreaterThanOrEqual(3);
      expect((await call("POST", `/gamification/achievements/${ach.id}/unlock`, { token: u.token })).statusCode).toBe(409);
      const catalog = json(await call("GET", "/gamification/achievements", { token: u.token })).data as { id: string; name: string; unlocked: boolean }[];
      expect(catalog.find((a) => a.id === ach.id)).toMatchObject({ unlocked: true });
      expect(catalog.find((a) => a.id === secret.id)).toMatchObject({ name: "???", unlocked: false });
      expect(json(await call("GET", "/gamification/achievements/me", { token: u.token })).data.some((a: { id: string }) => a.id === ach.id)).toBe(true);
    });
  });

  describe("premios", () => {
    const prize = async (over: object = {}) => json(await call("POST", "/admin/gamification_prizes", { token: admin, payload: { name: `Premio ${tag}-${Math.random().toString(36).slice(2, 6)}`, prize_type: "experience", coin_cost: 50, min_level: 1, is_active: true, ...over } })).data;

    it("canjea en una transacción: descuenta monedas y stock, genera código y respeta requisitos", async () => {
      const p = await prize({ quantity_available: 1 });
      const rich = await signup(), poor = await signup(), second = await signup();
      await award(rich.id, 0, 60); await award(second.id, 0, 60);
      expect((await call("POST", `/gamification/prizes/${p.id}/redeem`, { token: poor.token })).statusCode).toBe(422);
      expect(json(await call("GET", "/gamification/prizes")).data.find((x: { id: string }) => x.id === p.id).remaining).toBe(1); // el intento fallido no gastó stock
      const ok = await call("POST", `/gamification/prizes/${p.id}/redeem`, { token: rich.token });
      expect(ok.statusCode).toBe(201);
      expect(json(ok).data).toMatchObject({ coins_spent: 50, shipping: false });
      expect(json(ok).data.code).toMatch(/^RD-[A-Z2-9]{8}$/);
      expect((await me(rich.token)).coins).toBe(10);
      const out = await call("POST", `/gamification/prizes/${p.id}/redeem`, { token: second.token });
      expect(out.statusCode).toBe(422);
      expect(json(out).error.details.code).toBe("OUT_OF_STOCK");
      expect((await me(second.token)).coins).toBe(60);
      expect(json(await call("GET", "/gamification/redemptions/me", { token: rich.token })).data).toHaveLength(1);
      const high = await prize({ min_level: 5 });
      const lvl = await call("POST", `/gamification/prizes/${high.id}/redeem`, { token: second.token });
      expect(json(lvl).error.details.code).toBe("LEVEL_TOO_LOW");
    });

    it("nunca vende más que el stock: 8 canjes simultáneos por 3 unidades → exactamente 3", async () => {
      const p = await prize({ quantity_available: 3, coin_cost: 10 });
      const users = await Promise.all(Array.from({ length: 8 }, () => signup()));
      await Promise.all(users.map((u) => award(u.id, 0, 10)));
      const results = await Promise.all(users.map((u) => call("POST", `/gamification/prizes/${p.id}/redeem`, { token: u.token })));
      expect(results.filter((r) => r.statusCode === 201)).toHaveLength(3);
      expect((await pool.query("SELECT quantity_redeemed FROM gamification_prizes WHERE id = $1", [p.id])).rows[0].quantity_redeemed).toBe(3);
      const spent = (await pool.query("SELECT count(*)::int AS n FROM user_prize_redemptions WHERE prize_id = $1", [p.id])).rows[0].n;
      expect(spent).toBe(3);
    });

    it("un premio físico exige datos de envío y el admin lo gestiona hasta la entrega", async () => {
      const p = await prize({ prize_type: "physical", coin_cost: 20 });
      const u = await signup();
      await award(u.id, 0, 25);
      expect((await call("POST", `/gamification/prizes/${p.id}/redeem`, { token: u.token })).statusCode).toBe(400);
      const ok = await call("POST", `/gamification/prizes/${p.id}/redeem`, { token: u.token, payload: { recipient_name: "Jugador Prueba", recipient_phone: "8095551234", shipping_address: "Calle 1 #2, Santo Domingo" } });
      expect(ok.statusCode).toBe(201);
      expect(json(ok).data.shipping).toBe(true);
      const ship = json(await call("GET", "/gamification/shipments/me", { token: u.token })).data[0];
      expect(ship).toMatchObject({ status: "pending" });
      expect((await call("PATCH", `/admin/gamification/shipments/${ship.id}`, { token: u.token, payload: { status: "shipped", tracking_number: "T1" } })).statusCode).toBe(403);
      expect((await call("PATCH", `/admin/gamification/shipments/${ship.id}`, { token: admin, payload: { status: "delivered" } })).statusCode).toBe(422);
      expect((await call("PATCH", `/admin/gamification/shipments/${ship.id}`, { token: admin, payload: { status: "shipped" } })).statusCode).toBe(400); // sin guía
      expect((await call("PATCH", `/admin/gamification/shipments/${ship.id}`, { token: admin, payload: { status: "shipped", courier_name: "Vimenpaq", tracking_number: "VP123" } })).statusCode).toBe(204);
      expect((await call("PATCH", `/admin/gamification/shipments/${ship.id}`, { token: admin, payload: { status: "delivered" } })).statusCode).toBe(204);
      expect(json(await call("GET", "/gamification/shipments/me", { token: u.token })).data[0]).toMatchObject({ status: "delivered", tracking_number: "VP123" });
      expect(json(await call("GET", "/gamification/redemptions/me", { token: u.token })).data[0].status).toBe("delivered");
    });
  });

  describe("trivia", () => {
    it("las preguntas llegan sin respuesta, se corrigen en el servidor y el XP sale de los aciertos", async () => {
      const ids: string[] = [];
      for (let i = 0; i < 4; i++) ids.push(json(await call("POST", "/admin/trivia_questions", { token: admin, payload: { question: `¿Pregunta ${i} ${tag}?`, options: ["A", "B", "C"], correct_index: 1, category: "general", xp_reward: 10 } })).data.id);
      expect((await call("POST", "/admin/trivia_questions", { token: admin, payload: { question: "mala", options: ["A", "B"], correct_index: 5 } })).statusCode).toBe(400);
      // Aísla la prueba: sólo estas preguntas están activas.
      await pool.query("UPDATE trivia_questions SET is_active = false WHERE id <> ALL($1)", [ids]);
      const u = await signup();
      const session = json(await call("GET", "/trivia/session", { token: u.token })).data;
      expect(session.questions).toHaveLength(4);
      expect(JSON.stringify(session)).not.toContain("correct_index");
      expect(json(await call("GET", "/trivia/session", { token: u.token })).data).toMatchObject({ session_id: session.session_id, resumed: true });
      const answer = (qid: string, choice: number) => call("POST", `/trivia/session/${session.session_id}/answer`, { token: u.token, payload: { question_id: qid, choice } });
      const q = session.questions as { id: string }[];
      expect(json(await answer(q[0]!.id, 1)).data).toMatchObject({ correct: true, correct_index: 1 });
      expect((await answer(q[0]!.id, 1)).statusCode).toBe(409);
      expect(json(await answer(q[1]!.id, 0)).data.correct).toBe(false);
      expect((await answer("99999999-9999-4999-8999-999999999999", 0)).statusCode).toBe(400);
      expect((await answer(q[2]!.id, 7)).statusCode).toBe(400);
      await answer(q[2]!.id, 1);
      const other = await signup();
      expect((await call("POST", `/trivia/session/${session.session_id}/finish`, { token: other.token })).statusCode).toBe(404);
      const fin = json(await call("POST", `/trivia/session/${session.session_id}/finish`, { token: u.token })).data;
      expect(fin).toMatchObject({ score: 2, total: 4, granted: { xp: 20 }, denied_reason: null });
      expect((await me(u.token)).xp).toBe(20);
      expect((await call("POST", `/trivia/session/${session.session_id}/finish`, { token: u.token })).statusCode).toBe(409);
      expect((await call("POST", `/trivia/session/${session.session_id}/answer`, { token: u.token, payload: { question_id: q[3]!.id, choice: 1 } })).statusCode).toBe(422);
      const board = json(await call("GET", "/trivia/leaderboard")).data;
      expect(board.some((x: { user: { id: string }; best_score: number }) => x.user.id === u.id && x.best_score === 2)).toBe(true);
    });
  });

  describe("referidos", () => {
    it("un código se aplica una sola vez, no el propio, con correo verificado; ambos ganan", async () => {
      const a = await signup(), b = await signup(), c = await signup(false);
      const code = json(await call("GET", "/referrals/me", { token: a.token })).data.code as string;
      expect(code).toMatch(/^[A-Z2-9]{7}$/);
      expect(json(await call("GET", "/referrals/me", { token: a.token })).data.code).toBe(code); // estable
      expect((await call("POST", "/referrals/apply", { token: a.token, payload: { code } })).statusCode).toBe(422);
      expect((await call("POST", "/referrals/apply", { token: c.token, payload: { code } })).statusCode).toBe(403);
      expect((await call("POST", "/referrals/apply", { token: b.token, payload: { code: "NOEXISTE" } })).statusCode).toBe(404);
      const ok = await call("POST", "/referrals/apply", { token: b.token, payload: { code: code.toLowerCase() } });
      expect(ok.statusCode).toBe(200);
      expect(json(ok).data.granted).toMatchObject({ xp: 25, coins: 10 });
      expect((await call("POST", "/referrals/apply", { token: b.token, payload: { code } })).statusCode).toBe(409);
      expect(await me(a.token)).toMatchObject({ xp: 50, coins: 20, referrals: 1 });
      expect(json(await call("GET", "/referrals/me", { token: a.token })).data).toMatchObject({ total_referrals: 1, total_earnings_coins: 20 });
    });
  });

  describe("integración con el resto del portal", () => {
    it("favoritos y comentarios de RD Social otorgan puntos con sus propias reglas", async () => {
      const u = await signup();
      await call("PUT", "/me/favorites/hotel/abc", { token: u.token });
      await call("PUT", "/me/favorites/hotel/abc", { token: u.token }); // repetido: no vuelve a dar puntos
      expect((await me(u.token)).xp).toBe(2);
      const post = json(await call("POST", "/social/posts", { token: u.token, payload: { content: "Un día maravilloso en Samaná" } })).data.id;
      expect((await me(u.token)).xp).toBe(2 + 5);
      const commenter = await signup();
      const c1 = json(await call("POST", `/social/posts/${post}/comments`, { token: commenter.token, payload: { content: "¡Qué buen lugar para visitar!" } })).data;
      expect(c1.xp_awarded).toBe(2);
      const c2 = json(await call("POST", `/social/posts/${post}/comments`, { token: commenter.token, payload: { content: "Otro comentario distinto pronto" } })).data;
      expect(c2.xp_awarded).toBe(0); // enfriamiento de 20 s
    });
  });

  describe("ranking, temporadas y configuración", () => {
    it("el ranking muestra nombres abreviados y la posición propia", async () => {
      const u = await signup();
      await award(u.id, 777);
      const board = json(await call("GET", "/gamification/leaderboard?scope=season&limit=100", { token: u.token }));
      expect(board.data[0].user.name).toMatch(/^Jugador P\./);
      expect(board.data[0].user.email).toBeUndefined();
      expect(board.meta.me.xp).toBeGreaterThanOrEqual(777); // el logro "xp>=100" de otra prueba puede sumar su recompensa
      expect(json(await call("GET", "/gamification/leaderboard?scope=all")).meta.me).toBeNull();
      expect(json(await call("GET", "/gamification/seasons/current")).data).toMatchObject({ number: expect.any(Number) });
      expect(json(await call("GET", "/gamification/leagues")).data.map((l: { slug: string }) => l.slug)).toContain("gold");
      expect((await me(u.token)).season.xp).toBeGreaterThanOrEqual(777);
    });

    it("la liga semanal reparte su premio y reinicia el XP de la semana", async () => {
      const u = await signup();
      await award(u.id, 350); // liga oro (300–699)
      const coinsBefore = (await me(u.token)).coins;
      await app.jobs.runNow("gamification.leagues");
      const p = await me(u.token);
      expect(p.league).toMatchObject({ slug: "gold", xp_this_week: 0 });
      expect(p.coins).toBe(coinsBefore + 25);
    });

    it("configuración: las reglas se editan y afectan a lo siguiente; sólo admin", async () => {
      const u = await signup();
      expect((await call("GET", "/admin/gamification_rules", { token: u.token })).statusCode).toBe(403);
      expect((await call("PATCH", "/admin/gamification_rules/share", { token: admin, payload: { xp: 4 } })).statusCode).toBe(200);
      await act(u.token, "share");
      expect((await me(u.token)).xp).toBe(4);
      await call("PATCH", "/admin/gamification_rules/share", { token: admin, payload: { xp: 3 } });
      expect((await call("PATCH", "/admin/gamification_rules/share", { token: admin, payload: { inventado: 1 } })).statusCode).toBe(400);
      expect((await call("POST", "/admin/gamification_levels", { token: admin, payload: { level_number: 1, title: "Repetido", xp_required: 5 } })).statusCode).toBe(409);
      expect((await call("DELETE", "/admin/gamification_rules/no_existe", { token: admin })).statusCode).toBe(404);
    });

    it("cerrar una temporada reparte premios al top, abre la siguiente y no se repite", async () => {
      const season = (await pool.query("SELECT id, number FROM gamification_seasons WHERE is_active")).rows[0];
      const u = await signup();
      await award(u.id, 100_000); // primer puesto seguro
      const before = (await me(u.token)).coins;
      expect((await call("POST", `/admin/gamification/seasons/${season.id}/close`, { token: u.token })).statusCode).toBe(403);
      const res = json(await call("POST", `/admin/gamification/seasons/${season.id}/close`, { token: admin })).data;
      expect(res).toMatchObject({ closed: season.number, next: season.number + 1 });
      expect((await me(u.token)).coins).toBe(before + 500);
      expect((await pool.query("SELECT number FROM gamification_seasons WHERE is_active")).rows.map((x) => x.number)).toEqual([season.number + 1]);
      expect((await call("POST", `/admin/gamification/seasons/${season.id}/close`, { token: admin })).statusCode).toBe(422);
      expect((await app.jobs.runNow("gamification.season_rollover")).result).toEqual({ closed: null });
      const stats = json(await call("GET", "/admin/gamification/stats", { token: admin })).data;
      expect(stats.players).toBeGreaterThan(5);
    });
  });
});
