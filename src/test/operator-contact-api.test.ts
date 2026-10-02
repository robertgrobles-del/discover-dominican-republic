import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearAccessToken } from "@/lib/accessToken";
import { operatorContactApi, trackContactClick, whatsappNumber } from "@/lib/operatorContactApi";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

describe("clics de contacto del operador", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  const sent = (i = 0) => { const [url, init] = fetchMock.mock.calls[i] as [string, RequestInit]; return { url, init, body: init.body ? JSON.parse(String(init.body)) : undefined }; };
  beforeEach(() => { fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock); localStorage.clear(); clearAccessToken(); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("arma el número de WhatsApp sólo con teléfonos utilizables", () => {
    expect(whatsappNumber("(809) 555-0123")).toBe("18095550123");
    expect(whatsappNumber("+1 829 555 0123")).toBe("18295550123");
    expect(whatsappNumber("555-0123")).toBeNull();
    expect(whatsappNumber("")).toBeNull();
  });

  it("envía el clic con el canal y el servicio, y no hace nada sin backend", async () => {
    trackContactClick("aventuras", "whatsapp", "tour-1", false);
    expect(fetchMock).not.toHaveBeenCalled();

    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    trackContactClick("aventuras del caribe", "call", "tour-1", true);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(sent().url).toBe("/api/v1/operators/aventuras%20del%20caribe/contact-click");
    expect(sent().init.method).toBe("POST");
    expect(sent().body).toEqual({ channel: "call", listing_id: "tour-1" });
  });

  it("un fallo al contar nunca llega al visitante", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    expect(() => trackContactClick("aventuras", "directions", undefined, true)).not.toThrow();
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(sent().body).toEqual({ channel: "directions" });
  });

  it("consulta el reporte por rango y guarda la preferencia del resumen semanal", async () => {
    fetchMock.mockResolvedValueOnce(json({ data: { range: { from: "2026-09-01", to: "2026-09-30" }, totals: { whatsapp: 2, call: 1, directions: 0, website: 0, total: 3 }, by_day: [], by_listing: [] } }));
    expect((await operatorContactApi.clicks("2026-09-01", "2026-09-30")).data.totals.total).toBe(3);
    expect(sent().url).toBe("/api/v1/org/reports/contact-clicks?from=2026-09-01&to=2026-09-30");

    fetchMock.mockResolvedValueOnce(json({ data: { enabled: false } }));
    await operatorContactApi.setWeeklyEmail(false);
    expect(sent(1).init.method).toBe("PUT");
    expect(sent(1).body).toEqual({ enabled: false });
  });
});
