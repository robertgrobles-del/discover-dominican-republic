import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { addDays, todayInSantoDomingo } from "../src/lib/dates.js";
import { AuctionService, mondayOf } from "../src/modules/sponsorship/auctions.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = () => `au${Date.now().toString(36)}${n++}@test.local`;

describe("semana de subasta", () => {
  it("el lunes de cualquier día de la semana", () => {
    expect(mondayOf("2026-10-03")).toBe("2026-09-28"); // sábado
    expect(mondayOf("2026-10-04")).toBe("2026-09-28"); // domingo
    expect(mondayOf("2026-10-05")).toBe("2026-10-05"); // lunes
  });
});

describe("subasta de posiciones patrocinadas", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let admin: string;
  // Espacio propio de la prueba, con dos posiciones, para no interferir con los espacios reales.
  const SLOT = `subasta_${Date.now().toString(36)}`;
  const week = addDays(mondayOf(todayInSantoDomingo()), 14);
  const advertisers: { token: string; id: string; campaign: string; creative: string }[] = [];

  const call = (method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const account = async (role?: string) => {
    const email = uniq();
    const reg = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true } }));
    const id = reg.data.user.id as string;
    if (!role) return { id, token: reg.data.tokens.access_token as string };
    await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [id, role]);
    return { id, token: json(await call("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token as string };
  };
  const advertiser = async (name: string, approve = true) => {
    const a = await account();
    const campaign = json(await call("POST", "/sponsorship/campaigns", { token: a.token, payload: { advertiser_name: name, advertiser_email: "ads@test.local", campaign_name: `Campaña ${name}`, billing_type: "flat", starts_at: new Date(Date.now() - 86_400_000).toISOString(), ends_at: new Date(Date.now() + 90 * 86_400_000).toISOString() } })).data.id as string;
    if (approve) await call("PATCH", `/admin/sponsorship/campaigns/${campaign}/status`, { token: admin, payload: { status: "active" } });
    const creative = json(await call("POST", `/sponsorship/campaigns/${campaign}/creatives`, { token: a.token, payload: { slot_id: SLOT, title: `Anuncio ${name}`, target_url: "https://anunciante.example/oferta" } })).data.id as string;
    return { ...a, campaign, creative };
  };
  const bid = (a: { token: string; creative: string }, amount: number, over: object = {}) => call("POST", "/sponsorship/bids", { token: a.token, payload: { slot_id: SLOT, creative_id: a.creative, period_start: week, amount, ...over } });

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    admin = (await account("admin")).token;
    await pool.query("INSERT INTO sponsorship_slots (id, name, slot_type, max_active_creatives) VALUES ($1, 'Espacio de prueba', 'banner', 2)", [SLOT]);
    for (const name of ["Uno", "Dos", "Tres"]) advertisers.push(await advertiser(name));
  });
  afterAll(async () => { await pool.query("DELETE FROM sponsorship_slots WHERE id = $1", [SLOT]); await pool.end(); await app.close(); });

  it("nadie añade anuncios a una campaña ajena, ni con enlaces que no sean http(s)", async () => {
    const [uno, dos] = advertisers;
    const payload = { slot_id: SLOT, title: "Anuncio intruso", target_url: "https://intruso.example" };
    expect((await call("POST", `/sponsorship/campaigns/${uno!.campaign}/creatives`, { token: dos!.token, payload })).statusCode).toBe(404);
    expect((await call("POST", `/sponsorship/campaigns/${uno!.campaign}/creatives`, { token: uno!.token, payload: { ...payload, target_url: "javascript:alert(1)" } })).statusCode).toBe(400);
    expect((await call("POST", `/sponsorship/campaigns/${uno!.campaign}/creatives`, { token: admin, payload })).statusCode).toBe(201);
  });

  it("cada anunciante ve sólo sus campañas, con sus anuncios", async () => {
    const [uno, dos] = advertisers;
    const mine = json(await call("GET", "/sponsorship/campaigns/mine", { token: uno!.token })).data;
    expect(mine).toHaveLength(1);
    expect(mine[0]).toMatchObject({ id: uno!.campaign, status: "active" });
    expect(mine[0].creatives.map((c: { id: string }) => c.id)).toContain(uno!.creative);
    expect(JSON.stringify(mine)).not.toContain(dos!.campaign);
    expect((await call("GET", "/sponsorship/campaigns/mine")).statusCode).toBe(401);
  });

  it("sólo se puja en espacios en subasta, por semanas futuras que empiezan en lunes y sobre el precio mínimo", async () => {
    const [uno] = advertisers;
    expect((await bid(uno!, 500)).statusCode).toBe(422); // el espacio aún no se subasta
    expect((await call("PUT", `/admin/sponsorship/slots/${SLOT}/auction`, { token: uno!.token, payload: { enabled: true, reserve: 300 } })).statusCode).toBe(403);
    expect(json(await call("PUT", `/admin/sponsorship/slots/${SLOT}/auction`, { token: admin, payload: { enabled: true, reserve: 300 } })).data).toMatchObject({ auction_enabled: true, auction_reserve: 300 });
    expect((await bid(uno!, 500, { period_start: addDays(week, 1) })).statusCode).toBe(400);
    expect((await bid(uno!, 500, { period_start: mondayOf(todayInSantoDomingo()) })).statusCode).toBe(400);
    expect((await bid(uno!, 500, { period_start: addDays(week, 70) })).statusCode).toBe(400);
    expect((await bid(uno!, 299)).statusCode).toBe(422);
    expect((await bid(uno!, 500)).statusCode).toBe(201);
  });

  it("una puja sólo sube, es privada y exige una campaña aprobada y una creatividad propia", async () => {
    const [uno, dos, tres] = advertisers;
    expect((await bid(uno!, 450)).statusCode).toBe(422);
    expect(json(await bid(uno!, 600)).data).toMatchObject({ amount: 600, status: "open" });
    expect((await bid(dos!, 900, { creative_id: uno!.creative })).statusCode).toBe(404);
    const pendiente = await advertiser("Sin aprobar", false);
    expect((await bid(pendiente, 5000)).statusCode).toBe(422);
    expect((await bid(dos!, 900)).statusCode).toBe(201);
    expect((await bid(tres!, 600)).statusCode).toBe(201); // empata con Uno, que pujó antes
    const mine = json(await call("GET", "/sponsorship/bids/mine", { token: dos!.token })).data;
    expect(mine).toHaveLength(1);
    expect(mine[0]).toMatchObject({ amount: 900, auction_reserve: 300, status: "open" });
    expect((await call("GET", `/admin/sponsorship/auctions?slot_id=${SLOT}&period_start=${week}`, { token: dos!.token })).statusCode).toBe(403);
  });

  it("al cerrar ganan las pujas más altas hasta el cupo; el empate lo gana quien pujó primero y no se cierra dos veces", async () => {
    const [uno, dos, tres] = advertisers;
    const board = json(await call("GET", `/admin/sponsorship/auctions?slot_id=${SLOT}&period_start=${week}`, { token: admin })).data;
    expect(board.slot).toMatchObject({ positions: 2, reserve: 300 });
    expect(board.bids.map((b: { advertiser_name: string; amount: number }) => [b.advertiser_name, b.amount])).toEqual([["Dos", 900], ["Uno", 600], ["Tres", 600]]);
    expect(json(await call("POST", "/admin/sponsorship/auctions/close", { token: admin, payload: { slot_id: SLOT, period_start: week } })).data).toEqual({ slot_id: SLOT, period_start: week, winners: 2, amount_due: 1500 });
    expect((await call("POST", "/admin/sponsorship/auctions/close", { token: admin, payload: { slot_id: SLOT, period_start: week } })).statusCode).toBe(409);
    const status = async (a: { token: string }) => json(await call("GET", "/sponsorship/bids/mine", { token: a.token })).data[0].status;
    expect([await status(uno!), await status(dos!), await status(tres!)]).toEqual(["won", "won", "lost"]);
    expect((await bid(tres!, 5000)).statusCode).toBe(409);
    expect((await pool.query("SELECT count(*)::int AS n FROM audit_log WHERE action = 'sponsorship.auction_close' AND entity_id = $1", [SLOT])).rows[0].n).toBe(1);
  });

  it("durante la semana ganada el espacio muestra sólo a los ganadores, en el orden de sus pujas", async () => {
    const [uno, dos, tres] = advertisers;
    const before = json(await call("GET", `/sponsorship/serve/${SLOT}?limit=10`)).data as { id: string }[];
    expect(before.map((c) => c.id)).toEqual(expect.arrayContaining([uno!.creative, dos!.creative, tres!.creative])); // aún no es esa semana: rotación normal
    const svc = new AuctionService(app.db);
    expect(await svc.winningCreativeIds(SLOT, new Date(`${addDays(week, 2)}T16:00:00Z`))).toEqual([dos!.creative, uno!.creative]);
    expect(await svc.winningCreativeIds(SLOT)).toEqual([]);
    // Se adelanta la semana ganada a la actual para comprobar la entrega real.
    await pool.query("UPDATE sponsorship_bids SET period_start = $2 WHERE slot_id = $1", [SLOT, mondayOf(todayInSantoDomingo())]);
    const served = json(await call("GET", `/sponsorship/serve/${SLOT}?limit=10`)).data as { id: string }[];
    expect(served.map((c) => c.id)).toEqual([dos!.creative, uno!.creative]);
  });

  it("una puja abierta se puede retirar; una ajena o ya cerrada no", async () => {
    const [uno, dos] = advertisers;
    const next = addDays(week, 7);
    const b = json(await bid(uno!, 400, { period_start: next })).data;
    expect((await call("DELETE", `/sponsorship/bids/${b.id}`, { token: dos!.token })).statusCode).toBe(404);
    expect((await call("DELETE", `/sponsorship/bids/${b.id}`, { token: uno!.token })).statusCode).toBe(204);
    expect((await call("DELETE", `/sponsorship/bids/${b.id}`, { token: uno!.token })).statusCode).toBe(404);
    expect(json(await bid(uno!, 350, { period_start: next })).data).toMatchObject({ amount: 350, status: "open" }); // tras retirarla puede volver a pujar
  });
});
