import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = () => `cs${Date.now().toString(36)}${n++}@test.local`;

describe("estancias de creadores y gamificación patrocinada", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let admin: { token: string; id: string }, partner: { token: string; id: string }, creator: { token: string; id: string }, plain: { token: string; id: string };
  let stayId: string, applicationId: string;

  const call = (method: "GET" | "POST" | "PATCH", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const account = async (role?: string) => {
    const email = uniq();
    const reg = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true } }));
    const id = reg.data.user.id as string;
    if (!role) return { id, token: reg.data.tokens.access_token as string };
    await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [id, role]);
    return { id, token: json(await call("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token as string };
  };
  const stayBody = { hotel_name: "Hotel Estancia", destination: "Samaná", stay_title: "Fin de semana frente al mar", stay_description: "Dos noches con desayuno a cambio de contenido." };

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    admin = await account("admin"); partner = await account("partner"); creator = await account(); plain = await account();
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  it("sólo un negocio (rol partner) o administración publica estancias", async () => {
    expect((await call("POST", "/operators/creator-stays", { payload: stayBody })).statusCode).toBe(401);
    expect((await call("POST", "/operators/creator-stays", { token: plain.token, payload: stayBody })).statusCode).toBe(403);
    const created = await call("POST", "/operators/creator-stays", { token: partner.token, payload: stayBody });
    expect(created.statusCode).toBe(201);
    stayId = json(created).data.id;
  });

  it("quien dirige una organización de operador también puede, sin rol global", async () => {
    const owner = await account();
    expect((await call("GET", "/operators/creator-stays", { token: owner.token })).statusCode).toBe(403);
    expect((await call("POST", "/orgs", { token: owner.token, payload: { business_name: `Estancias ${Date.now()}` } })).statusCode).toBe(201);
    expect((await call("GET", "/operators/creator-stays", { token: owner.token })).statusCode).toBe(200);
    expect((await call("GET", "/operators/sponsorship/challenges", { token: owner.token })).statusCode).toBe(200);
    expect((await call("GET", "/admin/gamification/sponsored-challenges", { token: owner.token })).statusCode).toBe(403);
  });

  it("las estancias abiertas son públicas y muestran el establecimiento", async () => {
    const res = await call("GET", "/creators/stays/open");
    expect(res.statusCode).toBe(200);
    expect((json(res).data as { id: string; operator_business_name: string }[]).find((s) => s.id === stayId)).toMatchObject({ operator_business_name: "Hotel Estancia" });
  });

  it("un creador postula una sola vez y el negocio ve la postulación con su nombre", async () => {
    const body = { pitch_message: "Creo contenido de viajes y me encantaría colaborar." };
    const applied = await call("POST", `/creators/stays/${stayId}/apply`, { token: creator.token, payload: body });
    expect(applied.statusCode).toBe(201);
    applicationId = json(applied).data.id;
    expect((await call("POST", `/creators/stays/${stayId}/apply`, { token: creator.token, payload: body })).statusCode).toBe(409);
    const list = json(await call("GET", `/operators/creator-stays/${stayId}/applications`, { token: partner.token })).data;
    expect(list).toHaveLength(1);
    expect(list[0].creator_name).toBeTruthy();
    expect((await call("GET", `/operators/creator-stays/${stayId}/applications`, { token: admin.token })).statusCode).toBe(404); // no es su estancia
  });

  it("el directorio de creadores responde aunque no haya perfiles aprobados", async () => {
    const res = await call("GET", "/operators/creators/directory", { token: partner.token });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(json(res).data)).toBe(true);
  });

  it("la invitación directa llega al creador con el nombre del establecimiento", async () => {
    expect((await call("POST", `/operators/creators/${creator.id}/invite-stay`, { token: partner.token, payload: { hotel_name: "Hotel Estancia", invitation_message: "Nos gustaría invitarte un fin de semana." } })).statusCode).toBe(201);
    const res = await call("GET", "/creators/me/invitations", { token: creator.token });
    expect(res.statusCode).toBe(200);
    expect(json(res).data[0]).toMatchObject({ operator_name: "Hotel Estancia", status: "pending" });
  });

  it("los entregables los ve administración, no el negocio ni un usuario cualquiera", async () => {
    expect((await call("POST", `/creators/stays/${applicationId}/deliverables`, { token: creator.token, payload: { content_links: ["https://example.com/reel"] } })).statusCode).toBe(200);
    expect((await call("GET", "/admin/creators/stay-deliverables", { token: partner.token })).statusCode).toBe(403);
    const res = await call("GET", "/admin/creators/stay-deliverables", { token: admin.token });
    expect(res.statusCode).toBe(200);
    expect((json(res).data as { application_id: string; hotel_name: string }[]).find((d) => d.application_id === applicationId)).toMatchObject({ hotel_name: "Hotel Estancia" });
  });

  it("retos y premios patrocinados: el negocio los crea y administración los revisa", async () => {
    const challenge = json(await call("POST", "/operators/sponsorship/challenges", { token: partner.token, payload: { title: "Visita el mirador" } })).data;
    const reward = json(await call("POST", "/operators/sponsorship/rewards", { token: partner.token, payload: { prize_name: "Cena para dos", description: "Cena de tres tiempos." } })).data;
    expect(challenge.status).toBe("pending_review");
    expect((await call("GET", "/admin/gamification/sponsored-challenges", { token: partner.token })).statusCode).toBe(403);
    const pending = json(await call("GET", "/admin/gamification/sponsored-challenges?status=pending_review", { token: admin.token })).data as { id: string; operator_email: string; operator_name: string }[];
    expect(pending.find((c) => c.id === challenge.id)!.operator_name).toBeTruthy();
    expect(json(await call("PATCH", `/admin/gamification/sponsored-challenges/${challenge.id}/review`, { token: admin.token, payload: { decision: "active" } })).data.status).toBe("active");
    expect(json(await call("PATCH", `/admin/gamification/sponsored-rewards/${reward.id}/review`, { token: admin.token, payload: { decision: "rejected", rejection_reason: "Falta la vigencia" } })).data).toMatchObject({ status: "rejected", rejection_reason: "Falta la vigencia" });
    expect((json(await call("GET", "/admin/gamification/sponsored-rewards?status=rejected", { token: admin.token })).data as { id: string }[]).some((r) => r.id === reward.id)).toBe(true);
    expect(json(await call("GET", "/operators/sponsorship/stats", { token: partner.token })).data).toMatchObject({ active_challenges: 1, active_rewards: 1 });
  });
});
