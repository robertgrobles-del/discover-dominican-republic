/* eslint-disable @typescript-eslint/no-explicit-any -- prueba: lee cuerpos JSON de forma laxa */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient, type Client } from "@libsql/client";
import { handle, hashPassword } from "./index";
import { dueDraws, normalizeDrawTitle, parseEnLoteriaJsonLd, rdNow, scrapeAndSyncLotteries, sourceUrl } from "./scraper/loterias";

const dir = mkdtempSync(join(tmpdir(), "descubre-loterias-test-"));
let db: Client;
const SECRET = "secret-para-pruebas-de-loterias-32caracteres";

beforeAll(async () => {
  copyFileSync(join(__dirname, "../staging/descubre-staging.sqlite"), join(dir, "loterias.sqlite"));
  db = createClient({ url: `file:${join(dir, "loterias.sqlite")}` });
}, 30000);

afterAll(() => {
  db.close();
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch {
    /* EBUSY en Windows */
  }
});

async function staffToken(): Promise<string> {
  await db.execute({ sql: "INSERT OR IGNORE INTO users (id, email, password_hash, roles) VALUES ('lot-admin', 'lot@x.do', ?, '[\"admin\"]')", args: [hashPassword("clave-segura-123")] });
  const r = await handle({ method: "POST", path: "/api/v1/auth/login", headers: {}, body: { email: "lot@x.do", password: "clave-segura-123" } }, db, SECRET, false);
  return (r.body as { data: { tokens: { access_token: string } } }).data.tokens.access_token;
}

const ev = (name: string, startDate: string, nums: number[]) => JSON.stringify({ "@type": "Event", name, startDate, additionalProperty: nums.map((n) => ({ name: "Premio", value: String(n) })) });
const page = (...events: string[]) => `<script type="application/ld+json">{ "@graph": [${events.join(",")}] }</script>`;

describe("Scraper de Loterías Dominicanas", () => {
  it("normaliza títulos y calcula la hora de RD (UTC-4)", () => {
    expect(normalizeDrawTitle("Nacional Gana Más")).toBe("nacional gana mas");
    expect(rdNow(new Date("2026-11-13T02:30:00Z"))).toEqual({ date: "2026-11-12", minutes: 22 * 60 + 30 });
  });

  it("usa la página de hoy o la de la fecha pedida", () => {
    const now = new Date("2026-11-12T15:00:00Z");
    expect(sourceUrl("2026-11-12", now)).toBe("https://enloteria.com/resultados-loterias-hoy");
    expect(sourceUrl("2026-11-01", now)).toBe("https://enloteria.com/resultados-loterias-2026-11-01");
  });

  it("descarta los eventos sin números (sorteos aún no celebrados)", () => {
    const parsed = parseEnLoteriaJsonLd(page(ev("Real", "2026-11-12T12:55:00-04:00", [46, 49, 85]), ev("Nacional Noche", "2026-11-12T21:00:00-04:00", [])));
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toMatchObject({ title: "Real", date: "2026-11-12", winningNumbers: [46, 49, 85] });
  });

  it("valida fecha, hora, sorteo y números antes de guardar; nunca inventa resultados", async () => {
    const now = new Date("2026-11-12T23:00:00Z"); // 19:00 en RD
    const report = await scrapeAndSyncLotteries(db, {
      date: "2026-11-12", now,
      htmlContent: page(
        ev("Real", "2026-11-12T12:55:00-04:00", [46, 49, 85]),
        ev("La Primera", "2026-11-11T12:00:00-04:00", [1, 2, 3]),
        ev("Nacional Noche", "2026-11-12T21:00:00-04:00", [7, 8, 9]),
        ev("Loteka", "2026-11-12T10:55:00-04:00", [5]),
        ev("Sorteo Desconocido", "2026-11-12T10:00:00-04:00", [1, 2, 3]),
      ),
    });
    expect(report.syncedCount).toBe(1);
    const reasons = Object.fromEntries(report.skipped.map((x) => [x.title, x.reason]));
    expect(reasons["La Primera"]).toMatch(/2026-11-11/);
    expect(reasons["Nacional Noche"]).toMatch(/celebrado/);
    expect(reasons["Loteka"]).toMatch(/números/);
    expect(reasons["1 sorteos no registrados"]).toMatch(/Sorteo Desconocido/);
    const rows = (await db.execute("SELECT draw_id, draw_date, winning_numbers FROM lottery_results WHERE draw_date = '2026-11-12'")).rows;
    expect(rows).toEqual([expect.objectContaining({ draw_id: "draw-rea-quiniela", winning_numbers: "[46,49,85]" })]);

    const empty = await scrapeAndSyncLotteries(db, { date: "2026-11-12", now, htmlContent: "<html></html>" });
    expect(empty).toMatchObject({ success: false, syncedCount: 0 });
  });

  it("el cron busca cada sorteo a los 3, 5 y 10 minutos y solo mientras no tenga resultado", async () => {
    // Jueves 2026-11-12, 21:03 en RD: Nacional Noche (21:00) toca; Real (12:55) ya tiene resultado y no.
    const due = await dueDraws(db, new Date("2026-11-13T01:03:00Z"));
    expect(due).toContain("draw-nac-noche");
    expect(due).not.toContain("draw-rea-quiniela");
    expect(await dueDraws(db, new Date("2026-11-13T01:04:00Z"))).not.toContain("draw-nac-noche");
    expect(await dueDraws(db, new Date("2026-11-13T01:10:00Z"))).toContain("draw-nac-noche");
    expect(await dueDraws(db, new Date("2026-11-13T01:11:00Z"))).not.toContain("draw-nac-noche");
  });
});

describe("API de Loterías (Endpoints en api/index.ts)", () => {
  it("GET /api/v1/lotteries devuelve listado de loterías con sus sorteos", async () => {
    const res = await handle(
      { method: "GET", path: "/api/v1/lotteries", headers: {}, body: {} },
      db,
      SECRET
    );
    expect(res.status).toBe(200);
    const body = res.body as { data: any[] };
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(8);

    const leidsa = body.data.find((l) => l.slug === "leidsa");
    expect(leidsa).toBeDefined();
    expect(leidsa.name).toBe("LEIDSA");
    expect(Array.isArray(leidsa.draws)).toBe(true);
    expect(leidsa.draws.length).toBeGreaterThanOrEqual(3);
  });

  it("sin sesión ni CRON_SECRET no se puede sincronizar (escribe resultados)", async () => {
    const r = await handle({ method: "POST", path: "/api/v1/lotteries/sync", headers: {}, body: { htmlContent: "x" } }, db, SECRET, false);
    expect(r.status).toBe(401);
  });

  it("los resultados de una fecha traen el último anterior de los sorteos que aún no tienen el suyo", async () => {
    const r = await handle({ method: "GET", path: "/api/v1/lotteries/results", headers: {}, body: {}, query: { date: "2026-11-13" } }, db, SECRET);
    const rows = (r.body as { data: { draw_id: string; draw_date: string }[] }).data;
    expect(rows.find((x) => x.draw_id === "draw-rea-quiniela")?.draw_date).toBe("2026-11-12");
  });

  it("POST /api/v1/admin/lotteries/sync guarda un día pasado y rechaza fechas futuras", async () => {
    const auth = { authorization: `Bearer ${await staffToken()}` };
    const html = page(ev("Leidsa", "2026-11-10T20:55:00-04:00", [42, 18, 77]), ev("Nacional Gana Más", "2026-11-10T14:30:00-04:00", [29, 73, 84]));
    const syncRes = await handle({ method: "POST", path: "/api/v1/admin/lotteries/sync", headers: auth, body: { date: "2026-11-10", htmlContent: html } }, db, SECRET, false);
    expect(syncRes.status).toBe(200);
    expect((syncRes.body as { data: { syncedCount: number } }).data.syncedCount).toBe(2);

    const future = await handle({ method: "POST", path: "/api/v1/admin/lotteries/sync", headers: auth, body: { date: "2999-01-01" } }, db, SECRET, false);
    expect(future.status).toBe(422);

    const resultsRes = await handle({ method: "GET", path: "/api/v1/lotteries/results", headers: {}, body: {}, query: { date: "2026-11-10" } }, db, SECRET);
    expect((resultsRes.body as { data: unknown[] }).data.length).toBe(2);
  });

  it("el panel crea una lotería y un sorteo con validación", async () => {
    const auth = { authorization: `Bearer ${await staffToken()}` };
    const lot = await handle({ method: "POST", path: "/api/v1/admin/lotteries", headers: auth, body: { name: "Lotería Prueba", slug: "loteria-prueba", is_active: true } }, db, SECRET, false);
    expect(lot.status).toBe(201);
    const lotteryId = (lot.body as { data: { id: string } }).data.id;
    const bad = await handle({ method: "POST", path: "/api/v1/admin/lottery-draws", headers: auth, body: { lottery_id: lotteryId, name: "X", slug: "x-prueba", draw_days: ["lunes"], draw_time: "25:00" } }, db, SECRET, false);
    expect(bad.status).toBe(422);
    const draw = await handle({ method: "POST", path: "/api/v1/admin/lottery-draws", headers: auth, body: { lottery_id: lotteryId, name: "Prueba Noche", slug: "prueba-noche", source_name: "Prueba Noche", draw_days: ["lunes", "viernes"], draw_time: "20:00", number_of_balls: 3, is_active: true } }, db, SECRET, false);
    expect(draw.status).toBe(201);
    expect((draw.body as { data: { draw_days: string } }).data.draw_days).toBe('["lunes","viernes"]');
    const locked = await handle({ method: "DELETE", path: `/api/v1/admin/lotteries/${lotteryId}`, headers: auth, body: {} }, db, SECRET, false);
    expect(locked.status).toBe(409);
    const anon = await handle({ method: "POST", path: "/api/v1/admin/lotteries", headers: {}, body: { name: "Y", slug: "y" } }, db, SECRET, false);
    expect(anon.status).toBe(401);
  });

  it("GET /api/v1/lotteries/:slug devuelve detalle y sorteos de una empresa", async () => {
    const res = await handle(
      { method: "GET", path: "/api/v1/lotteries/leidsa", headers: {}, body: {} },
      db,
      SECRET
    );
    expect(res.status).toBe(200);
    const body = res.body as { data: any };
    expect(body.data.slug).toBe("leidsa");
    expect(body.data.name).toBe("LEIDSA");
    expect(body.data.draws.length).toBeGreaterThanOrEqual(3);
  });

  it("GET /api/v1/lotteries/:company/:draw devuelve el histórico y estadísticas de un sorteo", async () => {
    // Insertar un par de resultados de prueba para el sorteo
    await db.execute({
      sql: "INSERT OR REPLACE INTO lottery_results (id, draw_id, draw_date, winning_numbers, bonus_number) VALUES (?, ?, ?, ?, ?)",
      args: ["test-res-1", "draw-lei-quiniela", "2026-11-10", JSON.stringify([42, 18, 77]), null],
    });
    await db.execute({
      sql: "INSERT OR REPLACE INTO lottery_results (id, draw_id, draw_date, winning_numbers, bonus_number) VALUES (?, ?, ?, ?, ?)",
      args: ["test-res-2", "draw-lei-quiniela", "2026-11-11", JSON.stringify([42, 90, 15]), null],
    });

    const res = await handle(
      { method: "GET", path: "/api/v1/lotteries/leidsa/quiniela-pale-leidsa", headers: {}, body: {} },
      db,
      SECRET
    );

    expect(res.status).toBe(200);
    const body = res.body as {
      data: {
        lottery: { slug: string; name: string };
        draw: { slug: string; name: string; number_of_balls: number };
        results: Array<{ draw_date: string; winning_numbers: number[] }>;
        stats: { total_draws: number; hot_numbers: Array<{ number: string; count: number }> };
        related_draws: Array<{ slug: string; name: string }>;
      };
    };

    expect(body.data.lottery.slug).toBe("leidsa");
    expect(body.data.draw.slug).toBe("quiniela-pale-leidsa");
    expect(body.data.results.length).toBeGreaterThanOrEqual(2);
    expect(body.data.stats.total_draws).toBeGreaterThanOrEqual(2);
    expect(body.data.stats.hot_numbers.length).toBeGreaterThan(0);
    // El número 42 apareció en ambos resultados, por lo que debe ser el más caliente
    expect(body.data.stats.hot_numbers[0].number).toBe("42");
    expect(body.data.stats.hot_numbers[0].count).toBeGreaterThanOrEqual(2);
    expect(body.data.related_draws.length).toBeGreaterThan(0);
  });

  it("GET /api/v1/lotteries/:company/:draw devuelve 404 para lotería o sorteo no existente", async () => {
    const resLot = await handle(
      { method: "GET", path: "/api/v1/lotteries/lot-inventada/quiniela-pale-leidsa", headers: {}, body: {} },
      db,
      SECRET
    );
    expect(resLot.status).toBe(404);

    const resDraw = await handle(
      { method: "GET", path: "/api/v1/lotteries/leidsa/sorteo-inexistente-xyz", headers: {}, body: {} },
      db,
      SECRET
    );
    expect(resDraw.status).toBe(404);
  });

  it("reconoce las variables de entorno TURSO_DB_LOTERY_URL y TURSO_AUTH_LOTERY_TOKEN", async () => {
    // Verificamos que getIndicatorsDb prioriza TURSO_DB_LOTERY_URL
    const originalUrl = process.env.TURSO_DB_LOTERY_URL;
    const originalToken = process.env.TURSO_AUTH_LOTERY_TOKEN;

    try {
      process.env.TURSO_DB_LOTERY_URL = `file:${join(dir, "loterias.sqlite")}`;
      process.env.TURSO_AUTH_LOTERY_TOKEN = "dummy-lottery-token";

      const res = await handle(
        { method: "GET", path: "/api/v1/lotteries", headers: {}, body: {} },
        db,
        SECRET
      );

      expect(res.status).toBe(200);
      const body = res.body as { data: any[] };
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    } finally {
      process.env.TURSO_DB_LOTERY_URL = originalUrl;
      process.env.TURSO_AUTH_LOTERY_TOKEN = originalToken;
    }
  });
});
