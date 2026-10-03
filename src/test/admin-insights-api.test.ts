import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearAccessToken } from "@/lib/accessToken";
import { adminInsightsApi, heatmapGrid, lastDays } from "@/lib/adminInsightsApi";

const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });

describe("indicadores del equipo", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => { fetchMock = vi.fn(() => Promise.resolve(json({ data: {} }))); vi.stubGlobal("fetch", fetchMock); localStorage.clear(); clearAccessToken(); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("el rango usa la fecha de Santo Domingo, no la del navegador ni UTC", () => {
    // 02:30 UTC del día 3 todavía es día 2 en Santo Domingo (UTC-4).
    expect(lastDays(7, new Date("2026-10-03T02:30:00Z"))).toEqual({ from: "2026-09-26", to: "2026-10-02" });
    expect(lastDays(1, new Date("2026-10-03T12:00:00Z"))).toEqual({ from: "2026-10-03", to: "2026-10-03" });
  });

  it("arma la matriz de 7 por 24 y descarta celdas fuera de rango", () => {
    const grid = heatmapGrid([{ weekday: 1, hour: 0, events: 3, sessions: 2 }, { weekday: 7, hour: 23, events: 9, sessions: 4 }, { weekday: 8, hour: 5, events: 1, sessions: 1 }, { weekday: 2, hour: 24, events: 1, sessions: 1 }]);
    expect(grid).toHaveLength(7);
    expect(grid.every((row) => row.length === 24)).toBe(true);
    expect(grid[0]![0]).toBe(3);
    expect(grid[6]![23]).toBe(9);
    expect(grid.flat().reduce((a, b) => a + b, 0)).toBe(12);
  });

  it("cada reporte consulta su ruta con el rango pedido", async () => {
    const r = { from: "2026-09-01", to: "2026-09-30" };
    await adminInsightsApi.bounce(r); await adminInsightsApi.satisfaction(r); await adminInsightsApi.heatmap(r, "click"); await adminInsightsApi.reconciliation(r);
    expect(fetchMock.mock.calls.map((c) => c[0])).toEqual([
      "/api/v1/admin/analytics/bounce?from=2026-09-01&to=2026-09-30",
      "/api/v1/admin/analytics/satisfaction?from=2026-09-01&to=2026-09-30",
      "/api/v1/admin/analytics/heatmap?from=2026-09-01&to=2026-09-30&metric=click",
      "/api/v1/admin/finance/reconciliation?from=2026-09-01&to=2026-09-30",
    ]);
  });
});
