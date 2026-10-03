import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { addDays, todayInSantoDomingo } from "../src/lib/dates.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = () => `in${Date.now().toString(36)}${n++}@test.local`;

describe("índice de satisfacción y mapa de calor", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let admin: string, plain: string;
  // Días lejanos a los que ninguna otra prueba escribe.
  const reviewDay = addDays(todayInSantoDomingo(), -260), heatDay = addDays(todayInSantoDomingo(), -262);
  const type = `prueba_${Date.now().toString(36)}`, prefix = `/calor/${Date.now().toString(36)}`;

  const call = (url: string, token?: string) => app.inject({ method: "GET", url: `/api/v1${url}`, headers: token ? { authorization: `Bearer ${token}` } : {} });
  const account = async (role?: string) => {
    const email = uniq();
    const reg = json(await app.inject({ method: "POST", url: "/api/v1/auth/register", payload: { email, password: PW, accept_terms: true } }));
    const id = reg.data.user.id as string;
    if (!role) return { id, token: reg.data.tokens.access_token as string };
    await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [id, role]);
    return { id, token: json(await app.inject({ method: "POST", url: "/api/v1/auth/login", payload: { email, password: PW } })).data.tokens.access_token as string };
  };
  const review = (userId: string, rating: number, status = "approved", synthetic = false) =>
    pool.query("INSERT INTO reviews (user_id, entity_type, entity_id, rating, status, is_synthetic, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7::date + interval '16 hours')", [userId, type, randomUUID(), rating, status, synthetic, reviewDay]);
  const event = (eventType: string, session: string, page = `${prefix}/ficha`) =>
    pool.query("INSERT INTO analytics_events (event_type, page, session_id, metadata, created_at) VALUES ($1, $2, $3, '{}', $4::date + interval '16 hours')", [eventType, page, session, heatDay]);

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    admin = (await account("admin")).token;
    const visitor = await account(), other = await account();
    plain = other.token;
    await pool.query("INSERT INTO passport_stamps (user_id, stamp_type, stamp_name) VALUES ($1, 'destination', 'Sello de prueba')", [visitor.id]);
    await review(visitor.id, 5); await review(visitor.id, 5); await review(other.id, 2);
    await review(other.id, 1, "pending"); await review(other.id, 1, "approved", true);
    await event("page_view", "calor-sesion-1"); await event("page_view", "calor-sesion-1"); await event("page_view", "calor-sesion-2");
    await event("click", "calor-sesion-1"); await event("page_view", "calor-sesion-3", "/otra/pagina");
  });
  afterAll(async () => { await pool.end(); await app.close(); });

  it("pondera el doble las reseñas de visitantes con sello y descarta pendientes y sintéticas", async () => {
    const data = json(await call(`/admin/analytics/satisfaction?from=${reviewDay}&to=${reviewDay}`, admin)).data;
    const mine = data.by_entity_type.find((t: { entity_type: string }) => t.entity_type === type);
    // (5·2 + 5·2 + 2·1) / (5·2 + 5·2 + 5·1) = 22 / 25
    expect(mine).toEqual({ entity_type: type, reviews: 3, verified_reviews: 2, average_rating: 4, average_verified_rating: 5, index: 88 });
    expect(data.verified_weight).toBe(2);
    expect(data.by_month.length).toBeGreaterThanOrEqual(1);
  });

  it("sin reseñas en el rango el índice es nulo, no cero", async () => {
    const empty = addDays(reviewDay, -3000);
    expect(json(await call(`/admin/analytics/satisfaction?from=${empty}&to=${empty}`, admin)).data).toMatchObject({ reviews: 0, index: null, average_rating: null });
  });

  it("el mapa de calor agrupa por día de la semana y hora local, por métrica y prefijo de página", async () => {
    const weekday = ((new Date(`${heatDay}T00:00:00Z`).getUTCDay() + 6) % 7) + 1;
    const views = json(await call(`/admin/analytics/heatmap?from=${heatDay}&to=${heatDay}&page_prefix=${encodeURIComponent(prefix)}`, admin)).data;
    expect(views.cells).toEqual([{ weekday, hour: 12, events: 3, sessions: 2 }]);
    expect(views.peak).toEqual({ weekday, hour: 12, events: 3 });
    const all = json(await call(`/admin/analytics/heatmap?from=${heatDay}&to=${heatDay}&metric=all&page_prefix=${encodeURIComponent(prefix)}`, admin)).data;
    expect(all.total_events).toBe(4);
    expect((await call(`/admin/analytics/heatmap?metric=signup`, admin)).statusCode).toBe(400);
    expect((await call(`/admin/analytics/heatmap?page_prefix=${encodeURIComponent("/x?y=1")}`, admin)).statusCode).toBe(400);
  });

  it("sólo lo ve el equipo con acceso a analítica", async () => {
    for (const url of ["satisfaction", "heatmap"]) {
      expect((await call(`/admin/analytics/${url}`)).statusCode).toBe(401);
      expect((await call(`/admin/analytics/${url}`, plain)).statusCode).toBe(403);
    }
  });
});
