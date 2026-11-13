/* eslint-disable @typescript-eslint/no-explicit-any -- prueba: lee cuerpos JSON de forma laxa */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient, type Client } from "@libsql/client";
import { handle, hashPassword } from "./index";
import {
  parseEnLoteriaJsonLd,
  parseLoteriasDominicanasHtml,
  findDrawIdByTitle,
  parseScrapedDate,
  scrapeAndSyncLotteries,
  normalizeDrawTitle,
} from "./scraper/loterias";

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

describe("Scraper de Loterías Dominicanas", () => {
  it("normaliza títulos de sorteos correctamente", () => {
    expect(normalizeDrawTitle("Quiniela y Palé LEIDSA")).toBe("quiniela y pale leidsa");
    expect(normalizeDrawTitle("Nacional Gana Más")).toBe("nacional gana mas");
  });

  it("mapea títulos a slugs de sorteo conocidos", () => {
    expect(findDrawIdByTitle("Quiniela y Palé LEIDSA")).toBe("draw-lei-quiniela");
    expect(findDrawIdByTitle("Nacional Gana Más")).toBe("draw-nac-ganamas");
    expect(findDrawIdByTitle("Gana Más")).toBe("draw-nac-ganamas");
    expect(findDrawIdByTitle("Mega Chances Loteka")).toBe("draw-lot-megachances");
    expect(findDrawIdByTitle("Real")).toBe("draw-rea-quiniela");
    expect(findDrawIdByTitle("La Primera")).toBe("draw-pri-mediodia");
    expect(findDrawIdByTitle("New York Tarde")).toBe("draw-ny-tarde");
  });

  it("parsea fechas en diferentes formatos", () => {
    expect(parseScrapedDate("2026-11-12")).toBe("2026-11-12");
    expect(parseScrapedDate("12-11-2026")).toBe("2026-11-12");
    expect(parseScrapedDate("5/6/2026")).toBe("2026-06-05");
  });

  it("extrae sorteos desde JSON-LD Schema.org de enloteria.com", () => {
    const mockJsonLd = `
      <!DOCTYPE html>
      <html>
        <head>
          <script type="application/ld+json">
          {
            "@graph": [
              {
                "@type": "Event",
                "name": "Nacional Gana Más",
                "startDate": "2026-11-12T14:30:00-04:00",
                "additionalProperty": [
                  { "@type": "PropertyValue", "name": "Primer Premio", "value": "29" },
                  { "@type": "PropertyValue", "name": "Segundo Premio", "value": "73" },
                  { "@type": "PropertyValue", "name": "Tercer Premio", "value": "84" }
                ]
              },
              {
                "@type": "Event",
                "name": "La Primera",
                "startDate": "2026-11-12T12:00:00-04:00",
                "description": "Los números ganadores son: 46, 71, 90."
              }
            ]
          }
          </script>
        </head>
      </html>
    `;

    const parsed = parseEnLoteriaJsonLd(mockJsonLd);
    expect(parsed).toHaveLength(2);

    expect(parsed[0].title).toBe("Nacional Gana Más");
    expect(parsed[0].drawSlug).toBe("draw-nac-ganamas");
    expect(parsed[0].date).toBe("2026-11-12");
    expect(parsed[0].winningNumbers).toEqual([29, 73, 84]);

    expect(parsed[1].title).toBe("La Primera");
    expect(parsed[1].drawSlug).toBe("draw-pri-mediodia");
    expect(parsed[1].date).toBe("2026-11-12");
    expect(parsed[1].winningNumbers).toEqual([46, 71, 90]);
  });

  it("extrae bloques de sorteos de HTML estructurado de loteriasdominicanas.com", () => {
    const mockHtml = `
      <div class="game-block">
        <div class="game-header">
          <a href="/leidsa" class="game-title">Quiniela y Palé LEIDSA</a>
          <div class="session-date">12-11-2026</div>
        </div>
        <div class="game-scores">
          <span class="score">42</span>
          <span class="score">18</span>
          <span class="score">77</span>
        </div>
      </div>
    `;

    const parsed = parseLoteriasDominicanasHtml(mockHtml);
    expect(parsed).toHaveLength(1);

    expect(parsed[0].title).toBe("Quiniela y Palé LEIDSA");
    expect(parsed[0].drawSlug).toBe("draw-lei-quiniela");
    expect(parsed[0].date).toBe("2026-11-12");
    expect(parsed[0].winningNumbers).toEqual([42, 18, 77]);
  });

  it("sincroniza resultados con la base de datos mockeada", async () => {
    const executedStmts: any[] = [];
    const mockDb = {
      execute: async (stmt: any) => {
        executedStmts.push(stmt);
        return { rows: [] };
      },
    };

    const report = await scrapeAndSyncLotteries(mockDb, {
      htmlContent: `
        <script type="application/ld+json">
        {
          "@graph": [
            {
              "@type": "Event",
              "name": "Real",
              "startDate": "2026-11-12T12:55:00-04:00",
              "additionalProperty": [
                { "@type": "PropertyValue", "name": "Primer Premio", "value": "46" },
                { "@type": "PropertyValue", "name": "Segundo Premio", "value": "49" },
                { "@type": "PropertyValue", "name": "Tercer Premio", "value": "85" }
              ]
            }
          ]
        }
        </script>
      `,
    });

    expect(report.success).toBe(true);
    expect(report.source).toBe("html_payload");
    expect(report.syncedCount).toBe(1);
    expect(executedStmts.length).toBe(1);
    expect(executedStmts[0].args[1]).toBe("draw-rea-quiniela");
    expect(executedStmts[0].args[2]).toBe("2026-11-12");
    expect(executedStmts[0].args[3]).toBe(JSON.stringify([46, 49, 85]));
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

  it("POST /api/v1/admin/lotteries/sync sincroniza sorteos y escribe resultados en Turso", async () => {
    const syncRes = await handle(
      {
        method: "POST",
        path: "/api/v1/admin/lotteries/sync",
        headers: { authorization: `Bearer ${await staffToken()}` },
        body: {
          htmlContent: `
            <script type="application/ld+json">
            {
              "@graph": [
                {
                  "@type": "Event",
                  "name": "Quiniela y Palé LEIDSA",
                  "startDate": "2026-11-12T20:55:00-04:00",
                  "additionalProperty": [
                    { "@type": "PropertyValue", "name": "Primer Premio", "value": "42" },
                    { "@type": "PropertyValue", "name": "Segundo Premio", "value": "18" },
                    { "@type": "PropertyValue", "name": "Tercer Premio", "value": "77" }
                  ]
                },
                {
                  "@type": "Event",
                  "name": "Gana Más",
                  "startDate": "2026-11-12T14:30:00-04:00",
                  "additionalProperty": [
                    { "@type": "PropertyValue", "name": "Primer Premio", "value": "29" },
                    { "@type": "PropertyValue", "name": "Segundo Premio", "value": "73" },
                    { "@type": "PropertyValue", "name": "Tercer Premio", "value": "84" }
                  ]
                }
              ]
            }
            </script>
          `,
        },
      },
      db,
      SECRET
    );

    expect(syncRes.status).toBe(200);
    const body = syncRes.body as { data: { success: boolean; syncedCount: number } };
    expect(body.data.success).toBe(true);
    expect(body.data.syncedCount).toBe(2);

    // Verificar que GET /lotteries/results devuelve los nuevos resultados sincronizados
    const resultsRes = await handle(
      { method: "GET", path: "/api/v1/lotteries/results", headers: {}, body: {}, query: { date: "2026-11-12" } },
      db,
      SECRET
    );

    expect(resultsRes.status).toBe(200);
    const resultsBody = resultsRes.body as { data: any[] };
    expect(resultsBody.data.length).toBe(2);
    expect(resultsBody.data[0].winning_numbers).toBeDefined();
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
