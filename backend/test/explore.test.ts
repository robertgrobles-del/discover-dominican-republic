import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { distanceM } from "../src/modules/game/explore.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
const tag = Date.now().toString(36);
let n = 0;
const uniq = () => `ex${Date.now().toString(36)}${n++}@test.local`;
const HOTEL = { id: "a1000000-0000-4000-8000-000000000001", lat: 18.681, lng: -68.421 };       // Hotel Caribe (La Altagracia)
const PUNTA_CANA = { id: "d1000000-0000-4000-8000-000000000001", lat: 18.582, lng: -68.4055 };  // destino, provincia 2222… (La Altagracia)
const SAMANA = { id: "d1000000-0000-4000-8000-000000000002", lat: 19.2058, lng: -69.3364 };     // destino, provincia 1111… (Samaná)
const HIDDEN_BEACH = "b1000000-0000-4000-8000-000000000004";                                   // inactiva: no es un lugar válido
const near = (p: { lat: number; lng: number }, dLat = 0, dLng = 0) => ({ lat: p.lat + dLat, lng: p.lng + dLng, accuracy_m: 20 });

describe("distancia", () => {
  it("calcula metros entre dos coordenadas", () => {
    expect(distanceM(HOTEL, HOTEL)).toBe(0);
    expect(distanceM(HOTEL, { lat: HOTEL.lat + 0.001, lng: HOTEL.lng })).toBeCloseTo(111.2, 0);
    expect(distanceM(PUNTA_CANA, SAMANA) / 1000).toBeGreaterThan(120);
    expect(distanceM(PUNTA_CANA, SAMANA) / 1000).toBeLessThan(160);
  });
});

describe("explorar", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let admin: string, moderator: string;
  const call = (method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const account = async (o: { role?: string; verified?: boolean } = {}) => {
    const email = uniq();
    const reg = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true, display_name: "Explorador Prueba" } }));
    if (o.verified !== false) await pool.query("UPDATE users SET email_verified_at = now() WHERE id = $1", [reg.data.user.id]);
    let token = reg.data.tokens.access_token as string;
    if (o.role) { await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [reg.data.user.id, o.role]); token = json(await call("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token; }
    return { token, id: reg.data.user.id as string };
  };
  const award = (userId: string, xp: number) => call("POST", "/gamification/xp/award", { token: admin, payload: { user_id: userId, xp, reason: "Ajuste de prueba" } });
  const me = async (token: string) => json(await call("GET", "/gamification/me", { token })).data;
  const stamp = (token: string, place: { id: string }, type: string, proof: object) => call("POST", "/passport/stamps", { token, payload: { entity_type: type, entity_id: place.id, ...proof } });

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    admin = (await account({ role: "admin" })).token; moderator = (await account({ role: "moderator" })).token;
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  describe("pasaporte", () => {
    it("sella con la ubicación verificada, da puntos y registra la provincia", async () => {
      const u = await account();
      const res = await stamp(u.token, HOTEL, "hotel", { ...near(HOTEL, 0.0005), notes: "Genial", rating: 5 });
      expect(res.statusCode).toBe(201);
      const d = json(res).data;
      expect(d).toMatchObject({ verified_by: "gps", place: { type: "hotel", name: "Hotel Caribe" }, granted: { xp: 20, coins: 3 }, province: { first_visit: true } });
      expect((await me(u.token)).xp).toBeGreaterThanOrEqual(20 + 25); // sello + primera visita a la provincia
      const pass = json(await call("GET", "/passport/me", { token: u.token })).data;
      expect(pass.totals).toMatchObject({ stamps: 1, by_type: { hotel: 1 }, provinces_visited: 1 });
      expect(pass.stamps[0]).toMatchObject({ name: "Hotel Caribe", verified_by: "gps", xp_earned: 20 });
    });

    it("rechaza lo que no se puede probar: lejos, sin precisión, sin prueba, repetido y lugares inválidos", async () => {
      const u = await account();
      const far = await stamp(u.token, HOTEL, "hotel", near(HOTEL, 0.02)); // ~2 km
      expect(far.statusCode).toBe(422);
      expect(json(far).error.details).toMatchObject({ code: "TOO_FAR", radius_m: 300 });
      expect(json(await stamp(u.token, HOTEL, "hotel", { ...near(HOTEL), accuracy_m: 500 })).error.details.code).toBe("GPS_ACCURACY_LOW");
      expect(json(await stamp(u.token, HOTEL, "hotel", {})).error.details.code).toBe("PROOF_REQUIRED");
      expect((await stamp(u.token, HOTEL, "planeta", near(HOTEL))).statusCode).toBe(400);
      expect((await stamp(u.token, { id: HIDDEN_BEACH }, "beach", near(HOTEL))).statusCode).toBe(404);
      expect((await stamp(u.token, { id: randomUUID() }, "hotel", near(HOTEL))).statusCode).toBe(404);
      expect((await call("POST", "/passport/stamps", { payload: { entity_type: "hotel", entity_id: HOTEL.id, ...near(HOTEL) } })).statusCode).toBe(401);
      expect((await stamp(u.token, HOTEL, "hotel", near(HOTEL))).statusCode).toBe(201);
      const dup = await stamp(u.token, HOTEL, "hotel", near(HOTEL));
      expect(dup.statusCode).toBe(409);
      expect(json(dup).error.details.reason).toBe("ALREADY_STAMPED");
    });

    it("detecta desplazamientos imposibles (GPS falseado) y marca la cuenta, sin bloquear a otros", async () => {
      const u = await account();
      expect((await stamp(u.token, PUNTA_CANA, "destination", near(PUNTA_CANA))).statusCode).toBe(201);
      const jump = await stamp(u.token, SAMANA, "destination", near(SAMANA)); // 140 km en segundos
      expect(jump.statusCode).toBe(422);
      expect(json(jump).error.details.code).toBe("IMPLAUSIBLE_TRAVEL");
      expect((await pool.query("SELECT value FROM user_flags WHERE user_id = $1 AND flag_name = 'gps_suspect'", [u.id])).rows[0].value).toBe("1");
      const other = await account();
      expect((await stamp(other.token, SAMANA, "destination", near(SAMANA))).statusCode).toBe(201);
    });

    it("el código QR del lugar verifica sin ubicación; sólo se guarda su hash y sólo lo genera el admin", async () => {
      const u = await account();
      expect((await call("POST", "/admin/place-qr", { token: u.token, payload: { entity_type: "hotel", entity_id: HOTEL.id } })).statusCode).toBe(403);
      const qr = json(await call("POST", "/admin/place-qr", { token: admin, payload: { entity_type: "hotel", entity_id: HOTEL.id } })).data;
      expect(qr.code).toMatch(/^RD-[0-9A-F]{16}$/);
      expect(JSON.stringify((await pool.query("SELECT * FROM place_qr_codes WHERE entity_id = $1", [HOTEL.id])).rows)).not.toContain(qr.code);
      expect(json(await stamp(u.token, HOTEL, "hotel", { qr_code: "RD-CODIGOINVENTADO1" })).error.details.code).toBe("QR_INVALID");
      const ok = await stamp(u.token, HOTEL, "hotel", { qr_code: qr.code });
      expect(ok.statusCode).toBe(201);
      expect(json(ok).data.verified_by).toBe("qr");
    });

    it("provincias: se registran con la ubicación cerca de un punto de la provincia", async () => {
      const u = await account();
      const visit = (slug: string, p: object) => call("POST", `/gamification/provinces/${slug}/visit`, { token: u.token, payload: p });
      const far = await visit("samana", near(PUNTA_CANA));
      expect(far.statusCode).toBe(422);
      expect(json(far).error.details.code).toBe("TOO_FAR");
      const ok = await visit("samana", near(SAMANA, 0.01));
      expect(ok.statusCode).toBe(200);
      expect(json(ok).data).toMatchObject({ province: "Samaná", xp_awarded: 25, total_provinces: 1 });
      expect((await visit("samana", near(SAMANA))).statusCode).toBe(409);
      expect((await visit("no-existe", near(SAMANA))).statusCode).toBe(404);
      const list = json(await call("GET", "/gamification/provinces", { token: u.token })).data;
      expect(list.provinces.find((p: { name: string }) => p.name === "Samaná")).toMatchObject({ visited: true });
      expect(list.visited).toBe(1);
      expect((await call("GET", "/gamification/provinces")).statusCode).toBe(401);
    });
  });

  describe("rutas gamificadas", () => {
    let route: { id: string }; let cps: { id: string }[];
    beforeAll(async () => {
      route = json(await call("POST", "/admin/gamified_routes", { token: admin, payload: { name: `Ruta ${tag}`, slug: `ruta-${tag}`, route_type: "adventure", total_xp_reward: 100, total_coin_reward: 10, min_level: 1, is_active: true } })).data;
      cps = [];
      const mk = async (order: number, over: object) => cps.push(json(await call("POST", "/admin/route_checkpoints", { token: admin, payload: { route_id: route.id, checkpoint_order: order, checkpoint_name: `Punto ${order}`, checkpoint_type: "landmark", xp_reward: 15, coin_reward: 1, ...over } })).data);
      await mk(1, { latitude: HOTEL.lat, longitude: HOTEL.lng, radius_m: 200 });
      await mk(2, { latitude: HOTEL.lat + 0.004, longitude: HOTEL.lng, radius_m: 200 });
      await mk(3, { checkpoint_type: "challenge", xp_reward: 5, is_mandatory: false });
    });

    it("lista y detalle públicos, sin exponer códigos y con mi avance si hay sesión", async () => {
      const list = json(await call("GET", "/gamification/routes")).data as { id: string; checkpoints: number }[];
      expect(list.find((x) => x.id === route.id)).toMatchObject({ checkpoints: 3 });
      const d = json(await call("GET", `/gamification/routes/ruta-${tag}`)).data;
      expect(d.checkpoints.map((c: { order: number }) => c.order)).toEqual([1, 2, 3]);
      expect(JSON.stringify(d)).not.toContain("qr_hash");
      expect(d.progress).toBeNull();
      expect((await call("GET", "/gamification/routes/no-existe")).statusCode).toBe(404);
    });

    it("exige iniciar la ruta, respeta el orden y verifica cada punto en el servidor", async () => {
      const u = await account();
      const done = (cp: { id: string }, proof: object) => call("POST", `/gamification/routes/${route.id}/checkpoints/${cp.id}/complete`, { token: u.token, payload: proof });
      expect(json(await done(cps[0]!, near(HOTEL))).error.details.code).toBe("NOT_STARTED");
      expect(json(await call("POST", `/gamification/routes/${route.id}/start`, { token: u.token })).data).toMatchObject({ started: true });
      expect(json(await call("POST", `/gamification/routes/${route.id}/start`, { token: u.token })).data).toMatchObject({ already_started: true });
      expect(json(await done(cps[1]!, near(HOTEL, 0.004))).error.details.code).toBe("OUT_OF_ORDER");
      expect(json(await done(cps[0]!, near(HOTEL, 0.02))).error.details.code).toBe("TOO_FAR");
      const one = await done(cps[0]!, near(HOTEL, 0.0005));
      expect(one.statusCode).toBe(200);
      expect(json(one).data).toMatchObject({ verified_by: "gps", granted: { xp: 15, coins: 1 }, progress: { completed: 1, total: 3, percent: 33 }, route_completed: false });
      expect((await done(cps[0]!, near(HOTEL))).statusCode).toBe(409);
      // El segundo punto se verifica con su QR (sin ubicación).
      const qr = json(await call("POST", `/admin/route-checkpoints/${cps[1]!.id}/qr`, { token: admin })).data;
      expect(json(await done(cps[1]!, { qr_code: "RD-INVENTADO-12345" })).error.details.code).toBe("QR_INVALID");
      const two = await done(cps[1]!, { qr_code: qr.code });
      expect(json(two).data).toMatchObject({ verified_by: "qr", route_completed: true, progress: { completed: 2, total: 3 } }); // el tercero es opcional
      expect(json(two).data.completion).toMatchObject({ xp: 100, coins: 10 });
      expect((await me(u.token)).xp).toBeGreaterThanOrEqual(15 + 15 + 100);
      const detail = json(await call("GET", `/gamification/routes/${route.id}`, { token: u.token })).data;
      expect(detail.progress).toMatchObject({ is_completed: true });
      expect(detail.checkpoints.filter((c: { completed: boolean }) => c.completed)).toHaveLength(2);
      // El bono de la ruta se otorga una sola vez.
      const three = await done(cps[2]!, {});
      expect(json(three).data.route_completed).toBe(false);
    });

    it("una ruta con nivel mínimo o sin puntos no se puede iniciar", async () => {
      const gated = json(await call("POST", "/admin/gamified_routes", { token: admin, payload: { name: `Difícil ${tag}`, slug: `dificil-${tag}`, min_level: 5, is_active: true } })).data;
      const empty = json(await call("POST", "/admin/gamified_routes", { token: admin, payload: { name: `Vacía ${tag}`, slug: `vacia-${tag}`, is_active: true } })).data;
      const u = await account();
      expect(json(await call("POST", `/gamification/routes/${gated.id}/start`, { token: u.token })).error.details.code).toBe("LEVEL_TOO_LOW");
      expect(json(await call("POST", `/gamification/routes/${empty.id}/start`, { token: u.token })).error.details.code).toBe("ROUTE_EMPTY");
      expect((await call("POST", `/gamification/routes/${randomUUID()}/start`, { token: u.token })).statusCode).toBe(404);
    });

    it("un punto que pide foto exige una foto propia", async () => {
      const r2 = json(await call("POST", "/admin/gamified_routes", { token: admin, payload: { name: `Foto ${tag}`, slug: `foto-${tag}`, is_active: true } })).data;
      const cp = json(await call("POST", "/admin/route_checkpoints", { token: admin, payload: { route_id: r2.id, checkpoint_order: 1, checkpoint_name: "Selfie", checkpoint_type: "challenge", photo_required: true, xp_reward: 8 } })).data;
      const u = await account(), other = await account();
      await call("POST", `/gamification/routes/${r2.id}/start`, { token: u.token });
      const done = (p: object) => call("POST", `/gamification/routes/${r2.id}/checkpoints/${cp.id}/complete`, { token: u.token, payload: p });
      expect(json(await done({})).error.details.code).toBe("PHOTO_REQUIRED");
      const foreign = (await pool.query("INSERT INTO media_assets (owner_id, purpose, mime, declared_size, status) VALUES ($1, 'ugc', 'image/png', 100, 'ready') RETURNING id", [other.id])).rows[0].id;
      expect((await done({ photo_media_id: foreign })).statusCode).toBe(400); // no es suya
      const mine = (await pool.query("INSERT INTO media_assets (owner_id, purpose, mime, declared_size, status) VALUES ($1, 'ugc', 'image/png', 100, 'in_review') RETURNING id", [u.id])).rows[0].id;
      expect((await done({ photo_media_id: mine })).statusCode).toBe(200);
    });

    it("sólo el admin administra rutas", async () => {
      const u = await account();
      expect((await call("POST", "/admin/gamified_routes", { token: u.token, payload: { name: "Intento", slug: "intento-x" } })).statusCode).toBe(403);
      expect((await call("POST", `/admin/route-checkpoints/${cps[0]!.id}/qr`, { token: u.token })).statusCode).toBe(403);
    });
  });

  describe("coleccionables", () => {
    it("se reclaman si se cumple la condición, sin repetir, y con suministro limitado exacto bajo concurrencia", async () => {
      const mk = async (over: object) => json(await call("POST", "/admin/digital_collectibles", { token: admin, payload: { name: `Coleccionable ${tag}-${Math.random().toString(36).slice(2, 6)}`, collectible_type: "badge", rarity: "rare", is_active: true, xp_value: 10, coin_value: 2, ...over } })).data;
      const limited = await mk({ unlock_condition: "xp>=50", total_supply: 2 });
      const manual = await mk({});
      const u = await account();
      const claim = (token: string, id: string) => call("POST", `/collectibles/${id}/claim`, { token });
      expect(json(await claim(u.token, limited.id)).error.details.code).toBe("CONDITION_NOT_MET");
      expect(json(await claim(u.token, manual.id)).error.details.code).toBe("NOT_CLAIMABLE");
      await award(u.id, 60);
      const ok = await claim(u.token, limited.id);
      expect(ok.statusCode).toBe(201);
      expect(json(ok).data.granted).toMatchObject({ xp: 10, coins: 2 });
      expect(json(await claim(u.token, limited.id)).error.details.reason).toBe("ALREADY_OWNED");

      const rest = await Promise.all(Array.from({ length: 5 }, () => account()));
      await Promise.all(rest.map((x) => award(x.id, 60)));
      const results = await Promise.all(rest.map((x) => claim(x.token, limited.id)));
      expect(results.filter((x) => x.statusCode === 201)).toHaveLength(1); // quedaba 1 de 2
      expect(json(results.find((x) => x.statusCode !== 201)!).error.details.code).toBe("SOLD_OUT");
      expect((await pool.query("SELECT current_supply FROM digital_collectibles WHERE id = $1", [limited.id])).rows[0].current_supply).toBe(2);

      const cat = json(await call("GET", "/collectibles", { token: u.token })).data as { id: string; owned: boolean; remaining: number | null }[];
      expect(cat.find((x) => x.id === limited.id)).toMatchObject({ owned: true, remaining: 0 });
      await call("PATCH", `/collectibles/me/${limited.id}`, { token: u.token, payload: { is_favorite: true, display_order: 1 } });
      const mine = json(await call("GET", "/collectibles/me", { token: u.token })).data;
      expect(mine[0]).toMatchObject({ id: limited.id, is_favorite: true, display_order: 1 });
      expect((await call("PATCH", `/collectibles/me/${manual.id}`, { token: u.token, payload: { is_favorite: true } })).statusCode).toBe(404);
      expect((await call("DELETE", `/collectibles/me/${limited.id}`, { token: u.token })).statusCode).toBe(204);
      expect(json(await call("GET", "/collectibles/me", { token: u.token })).data).toHaveLength(0);
    });
  });

  describe("retos de foto", () => {
    it("envío moderado, votos únicos, cierre con ganador y premio", async () => {
      const ch = json(await call("POST", "/admin/photo_challenges", { token: admin, payload: { title: `Reto ${tag}`, theme: "Atardeceres", is_active: true, xp_reward: 100, coin_reward: 50 } })).data;
      const [a, b, voter, unverified] = [await account(), await account(), await account(), await account({ verified: false })];
      const asset = async (u: { id: string }) => (await pool.query("INSERT INTO media_assets (owner_id, purpose, mime, declared_size, status) VALUES ($1, 'ugc', 'image/png', 100, 'in_review') RETURNING id", [u.id])).rows[0].id as string;
      const submit = (u: { token: string }, media_id: string) => call("POST", `/gamification/photo-challenges/${ch.id}/submissions`, { token: u.token, payload: { media_id, caption: "Bonito" } });

      expect((await submit(unverified, await asset(unverified))).statusCode).toBe(403);
      expect((await submit(a, randomUUID())).statusCode).toBe(400); // la foto no existe
      const sa = json(await submit(a, await asset(a))).data;
      expect(sa.status).toBe("pending_review");
      expect((await submit(a, await asset(a))).statusCode).toBe(409); // una por persona
      const sb = json(await submit(b, await asset(b))).data;
      const list = async () => json(await call("GET", `/gamification/photo-challenges/${ch.id}/submissions`, { token: voter.token }));
      expect((await list()).data).toHaveLength(0); // nada visible hasta aprobarse
      expect((await call("POST", `/gamification/photo-submissions/${sa.id}/vote`, { token: voter.token })).statusCode).toBe(404);

      expect((await call("POST", `/admin/photo-submissions/${sa.id}/moderate`, { token: voter.token, payload: { action: "approve" } })).statusCode).toBe(403);
      const ap = await call("POST", `/admin/photo-submissions/${sa.id}/moderate`, { token: moderator, payload: { action: "approve" } });
      expect(json(ap).data).toMatchObject({ status: "approved", granted: { xp: 10 } });
      await call("POST", `/admin/photo-submissions/${sb.id}/moderate`, { token: moderator, payload: { action: "approve" } });
      expect((await call("POST", `/admin/photo-submissions/${sa.id}/moderate`, { token: moderator, payload: { action: "approve" } })).statusCode).toBe(422);
      expect((await list()).data).toHaveLength(2);

      expect((await call("POST", `/gamification/photo-submissions/${sa.id}/vote`, { token: a.token })).statusCode).toBe(400); // la propia
      expect((await call("POST", `/gamification/photo-submissions/${sa.id}/vote`, { token: unverified.token })).statusCode).toBe(403);
      expect(json(await call("POST", `/gamification/photo-submissions/${sb.id}/vote`, { token: voter.token })).data.votes).toBe(1);
      expect((await call("POST", `/gamification/photo-submissions/${sb.id}/vote`, { token: voter.token })).statusCode).toBe(409);
      await call("POST", `/gamification/photo-submissions/${sb.id}/vote`, { token: a.token });
      const sorted = (await list()).data;
      expect(sorted[0]).toMatchObject({ id: sb.id, votes: 2 });
      expect(sorted[0].voted_by_me).toBe(true);

      const before = (await me(b.token)).xp;
      expect((await call("POST", `/admin/photo-challenges/${ch.id}/close`, { token: moderator })).statusCode).toBe(403);
      const closed = json(await call("POST", `/admin/photo-challenges/${ch.id}/close`, { token: admin })).data;
      expect(closed.winner).toMatchObject({ submission_id: sb.id, votes: 2 });
      expect((await me(b.token)).xp).toBeGreaterThanOrEqual(before + 100); // más un posible logro que se desbloquee al llegar a 100 XP
      expect((await list()).data[0].is_winner).toBe(true);
      expect((await call("POST", `/admin/photo-challenges/${ch.id}/close`, { token: admin })).statusCode).toBe(422);
      expect((await submit(voter, await asset(voter))).statusCode).toBe(422); // cerrado
      expect((await call("POST", `/gamification/photo-submissions/${sa.id}/vote`, { token: voter.token })).statusCode).toBe(404);
    });

    it("rechazar elimina la foto", async () => {
      const ch = json(await call("POST", "/admin/photo_challenges", { token: admin, payload: { title: `Reto2 ${tag}`, theme: "Playas", is_active: true } })).data;
      const u = await account();
      const m = (await pool.query("INSERT INTO media_assets (owner_id, purpose, mime, declared_size, status) VALUES ($1, 'ugc', 'image/png', 100, 'in_review') RETURNING id", [u.id])).rows[0].id;
      const s = json(await call("POST", `/gamification/photo-challenges/${ch.id}/submissions`, { token: u.token, payload: { media_id: m } })).data;
      expect(json(await call("POST", `/admin/photo-submissions/${s.id}/moderate`, { token: moderator, payload: { action: "reject" } })).data.status).toBe("rejected");
      expect((await pool.query("SELECT 1 FROM photo_submissions WHERE id = $1", [s.id])).rowCount).toBe(0);
      expect(json(await call("GET", "/gamification/photo-challenges")).data.some((c: { id: string }) => c.id === ch.id)).toBe(true);
    });
  });

  describe("gremios", () => {
    it("se crean con nivel 3, acumulan el XP de sus miembros, y cambian de líder o se disuelven al irse", async () => {
      const leader = await account(), m1 = await account(), m2 = await account(), newbie = await account();
      const body = { name: `Gremio ${tag}`, region: "Este", description: "Exploradores del este" };
      expect(json(await call("POST", "/gamification/guilds", { token: newbie.token, payload: body })).error.details.code).toBe("LEVEL_TOO_LOW");
      await award(leader.id, 300); // nivel 3
      const created = await call("POST", "/gamification/guilds", { token: leader.token, payload: body });
      expect(created.statusCode).toBe(201);
      const guild = json(created).data;
      expect((await call("POST", "/gamification/guilds", { token: leader.token, payload: { ...body, name: `Otro ${tag}` } })).statusCode).toBe(409); // ya está en uno
      await award(m1.id, 300);
      expect((await call("POST", "/gamification/guilds", { token: m1.token, payload: body })).statusCode).toBe(409); // nombre repetido

      expect((await call("POST", `/gamification/guilds/${guild.id}/join`, { token: m1.token })).statusCode).toBe(204);
      expect((await call("POST", `/gamification/guilds/${guild.id}/join`, { token: m1.token })).statusCode).toBe(409);
      const base = (await pool.query("SELECT total_xp, member_count FROM explorer_guilds WHERE id = $1", [guild.id])).rows[0];
      expect(base.member_count).toBe(2);
      await award(m1.id, 100);
      expect((await pool.query("SELECT total_xp FROM explorer_guilds WHERE id = $1", [guild.id])).rows[0].total_xp).toBe(base.total_xp + 100);

      const board = json(await call("GET", "/gamification/leaderboard?scope=guild&limit=100", { token: m1.token }));
      expect(board.data.find((g: { id: string }) => g.id === guild.id)).toMatchObject({ member_count: 2 });
      expect(board.meta.me).toMatchObject({ id: guild.id });
      const listed = json(await call("GET", "/gamification/guilds", { token: leader.token })).data;
      expect(listed.my_guild).toBe(guild.id);
      expect(listed.guilds.find((g: { id: string }) => g.id === guild.id)).toMatchObject({ is_member: true, my_role: "leader" });

      await pool.query("UPDATE explorer_guilds SET max_members = 2 WHERE id = $1", [guild.id]);
      expect(json(await call("POST", `/gamification/guilds/${guild.id}/join`, { token: m2.token })).error.details.code).toBe("GUILD_FULL");

      expect(json(await call("POST", `/gamification/guilds/${guild.id}/leave`, { token: leader.token })).data.disbanded).toBe(false);
      expect((await pool.query("SELECT role FROM guild_members WHERE user_id = $1", [m1.id])).rows[0].role).toBe("leader"); // el mando pasó al que quedaba
      expect((await call("POST", `/gamification/guilds/${guild.id}/leave`, { token: leader.token })).statusCode).toBe(404);
      expect(json(await call("POST", `/gamification/guilds/${guild.id}/leave`, { token: m1.token })).data.disbanded).toBe(true);
      expect((await pool.query("SELECT 1 FROM explorer_guilds WHERE id = $1", [guild.id])).rowCount).toBe(0);
    });
  });
});
