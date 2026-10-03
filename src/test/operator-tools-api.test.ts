import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearAccessToken } from "@/lib/accessToken";
import { HttpError } from "@/lib/httpClient";
import { lastFinishedQuarter, operatorToolsApi, recentQuarters, toolsErrorMessage } from "@/lib/operatorToolsApi";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

describe("herramientas del operador", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  const sent = (i = 0) => { const [url, init] = fetchMock.mock.calls[i] as [string, RequestInit]; return { url, method: init.method ?? "GET", body: init.body ? JSON.parse(String(init.body)) : undefined }; };
  beforeEach(() => { fetchMock = vi.fn(() => Promise.resolve(json({ data: {} }))); vi.stubGlobal("fetch", fetchMock); localStorage.clear(); clearAccessToken(); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("el último trimestre terminado se calcula con la fecha de Santo Domingo y cruza de año", () => {
    expect(lastFinishedQuarter(new Date("2026-10-03T12:00:00Z"))).toBe("2026-T3");
    expect(lastFinishedQuarter(new Date("2026-02-10T12:00:00Z"))).toBe("2025-T4");
    // 02:00 UTC del 1 de abril aún es 31 de marzo en Santo Domingo: el trimestre en curso sigue siendo el primero.
    expect(lastFinishedQuarter(new Date("2026-04-01T02:00:00Z"))).toBe("2025-T4");
    expect(recentQuarters(6, new Date("2026-10-03T12:00:00Z"))).toEqual(["2026-T3", "2026-T2", "2026-T1", "2025-T4", "2025-T3", "2025-T2"]);
  });

  it("webhooks: crear, probar, reactivar y eliminar usan sus rutas", async () => {
    await operatorToolsApi.createWebhook("https://mi.sistema/hook", ["booking.created"]);
    await operatorToolsApi.testWebhook("w1"); await operatorToolsApi.enableWebhook("w1"); await operatorToolsApi.deleteWebhook("w1");
    expect(sent(0)).toEqual({ url: "/api/v1/org/webhooks", method: "POST", body: { url: "https://mi.sistema/hook", events: ["booking.created"] } });
    expect([sent(1), sent(2), sent(3)].map((c) => `${c.method} ${c.url}`)).toEqual(["POST /api/v1/org/webhooks/w1/test", "POST /api/v1/org/webhooks/w1/enable", "DELETE /api/v1/org/webhooks/w1"]);
  });

  it("la solicitud del sello y la aceptación del contrato envían lo que el backend valida", async () => {
    await operatorToolsApi.apply({ business_id: "org-1", business_type: "operador", business_name: "Aventuras", rnc: "131000000" });
    await operatorToolsApi.acceptContract("c1", "a".repeat(64));
    expect(sent(0).body).toEqual({ business_id: "org-1", business_type: "operador", business_name: "Aventuras", rnc: "131000000", documents: [] });
    expect(sent(1)).toEqual({ url: "/api/v1/verifications/contracts/c1/accept", method: "POST", body: { body_hash: "a".repeat(64) } });
  });

  it("los errores muestran el mensaje del servidor, con un texto propio para permisos", () => {
    expect(toolsErrorMessage(new HttpError("x", 403, {}))).toMatch(/rol o tu plan/);
    expect(toolsErrorMessage(new HttpError("x", 409, { error: { message: "Ya existe" } }))).toBe("Ya existe");
    expect(toolsErrorMessage(new Error("red"))).toMatch(/Inténtalo de nuevo/);
  });
});
