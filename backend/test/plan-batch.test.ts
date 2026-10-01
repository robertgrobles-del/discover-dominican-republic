import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { paymentChargeCounts } from "../src/lib/payment-metrics.js";
import { withUtm } from "../src/lib/utm.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
const tag = Date.now().toString(36);
const day = (offset: number) => new Date(Date.now() - 4 * 3_600_000 + offset * 86_400_000).toISOString().slice(0, 10);

describe("UTM en destinos de anunciantes (mejora 21)", () => {
  it("añade los parámetros sin pisar los del anunciante ni tocar rutas propias", () => {
    expect(withUtm("https://hotel.do/oferta?x=1", { source: "descubrerd", medium: "banner", campaign: "Verano Bávaro 2026", content: "home_hero" }))
      .toBe("https://hotel.do/oferta?x=1&utm_source=descubrerd&utm_medium=banner&utm_campaign=verano-bavaro-2026&utm_content=home-hero");
    expect(withUtm("https://hotel.do/?utm_campaign=propia", { source: "descubrerd", medium: "banner", campaign: "otra" })).toContain("utm_campaign=propia");
    expect(withUtm("/ofertas", { source: "descubrerd", medium: "banner", campaign: "x" })).toBe("/ofertas");
  });
});

describe("lote del plan maestro: anuncios, precios y pagos", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let adminId: string;

  beforeAll(async () => {
    app = await makeApp({ METRICS_TOKEN: "token-de-metricas-para-pruebas-123456" });
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    const reg = json(await app.inject({ method: "POST", url: "/api/v1/auth/register", payload: { email: `pb${tag}@test.local`, password: PW, accept_terms: true, display_name: "Admin Lote" } }));
    adminId = reg.data.user.id;
    await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')", [adminId]);
  });
  afterAll(async () => {
    await pool.query("DELETE FROM ad_banners WHERE name LIKE $1", [`PB${tag}%`]);
    await pool.query("DELETE FROM membership_plans WHERE id LIKE $1", [`pb-${tag}%`]);
    await pool.end();
    await app.close();
  });

  const banner = async (name: string, endDate: string | null, target = "https://anunciante.do/promo") =>
    (await pool.query<{ id: string }>(
      "INSERT INTO ad_banners (id, name, slug, target_url, placement, end_date, status, published_at, is_active) VALUES (gen_random_uuid(), $1, $2, $3, 'home_hero', $4, 'published', now(), true) RETURNING id",
      [name, name.toLowerCase(), target, endDate],
    )).rows[0]!.id;

  it("el clic en un banner redirige con UTM de la campaña (mejora 21)", async () => {
    const id = await banner(`PB${tag}-utm`, null);
    const res = await app.inject({ method: "GET", url: `/api/v1/ads/${id}/click?s=sesion-de-prueba-123456` });
    expect(res.statusCode).toBe(302);
    const location = new URL(res.headers.location as string);
    expect(location.origin + location.pathname).toBe("https://anunciante.do/promo");
    expect(Object.fromEntries(location.searchParams)).toMatchObject({ utm_source: "descubrerd", utm_medium: "banner", utm_campaign: `pb${tag}-utm`, utm_content: "home-hero" });
  });

  it("avisa a los administradores de banners que vencen en 7 días o mañana, y sólo de esos (mejora 27)", async () => {
    const soon = await banner(`PB${tag}-vence7`, day(7));
    const tomorrow = await banner(`PB${tag}-vence1`, day(1));
    await banner(`PB${tag}-vence3`, day(3));
    await banner(`PB${tag}-sinfin`, null);
    const res = await app.jobs.runNow("ads.expiring");
    expect(res.status).toBe("success");
    const { rows } = await pool.query<{ banner: string; days: string }>("SELECT data->>'banner_id' AS banner, data->>'days_left' AS days FROM notifications WHERE user_id = $1 AND data ? 'banner_id'", [adminId]);
    const mine = rows.filter((r) => [soon, tomorrow].includes(r.banner));
    expect(mine.map((r) => `${r.banner}:${r.days}`).sort()).toEqual([`${soon}:7`, `${tomorrow}:1`].sort());
    expect(rows.some((r) => r.days !== "7" && r.days !== "1")).toBe(false);
  });

  it("los cambios de precio de un plan quedan en un historial que no se puede alterar (mejora 77)", async () => {
    const id = `pb-${tag}`;
    await pool.query("INSERT INTO membership_plans (id, slug, name, price_annual) VALUES ($1, $1, 'Plan de prueba', 49.99)", [id]);
    await pool.query("UPDATE membership_plans SET price_annual = 59.99 WHERE id = $1", [id]);
    await pool.query("UPDATE membership_plans SET updated_at = now() WHERE id = $1", [id]); // sin cambio real: no se registra
    await pool.query("DELETE FROM membership_plans WHERE id = $1", [id]);
    const { rows } = await pool.query<{ operation: string; old_price: string | null; new_price: string | null }>(
      "SELECT operation, old_values->>'price_annual' AS old_price, new_values->>'price_annual' AS new_price FROM pricing_history WHERE source_table = 'membership_plans' AND record_id = $1 ORDER BY id", [id],
    );
    expect(rows).toEqual([
      { operation: "INSERT", old_price: null, new_price: "49.99" },
      { operation: "UPDATE", old_price: "49.99", new_price: "59.99" },
      { operation: "DELETE", old_price: "59.99", new_price: null },
    ]);
    await expect(pool.query("UPDATE pricing_history SET new_values = '{}' WHERE record_id = $1", [id])).rejects.toThrow(/sólo anexado/);
    await expect(pool.query("DELETE FROM pricing_history WHERE record_id = $1", [id])).rejects.toThrow(/sólo anexado/);
  });

  it("/metrics cuenta cobros aprobados, rechazados y fallidos por proveedor (mejora 114)", async () => {
    const before = Object.fromEntries(paymentChargeCounts().map((c) => [`${c.provider}|${c.outcome}`, c.count]));
    const charge = (token: string) => app.gateway.charge({ amount: 10, currency: "DOP", token, reference: `pb-${tag}` });
    await charge("tok_test_ok");
    await charge("tok_test_declined");
    await charge("no-es-un-token");
    await expect(charge("tok_test_error")).rejects.toThrow();
    const after = Object.fromEntries(paymentChargeCounts().map((c) => [`${c.provider}|${c.outcome}`, c.count]));
    for (const key of ["fake|approved", "fake|declined", "fake|invalid_token", "fake|error"]) expect(after[key]! - (before[key] ?? 0), key).toBe(1);

    const metrics = await app.inject({ method: "GET", url: "/metrics", headers: { authorization: "Bearer token-de-metricas-para-pruebas-123456" } });
    expect(metrics.body).toMatch(/app_payment_charges_total\{provider="fake",outcome="declined"\} \d+/);
  });
});
