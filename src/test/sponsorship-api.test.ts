import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearAccessToken } from "@/lib/accessToken";
import { safeAdUrl, serveNative, trackAd } from "@/lib/sponsorshipApi";

const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
const creative = (over: object = {}) => ({ id: "c1", slot_id: "directory_native", title: "Hotel Sol", headline: null, body_text: null, target_url: "https://hotel.example/oferta", image_url: null, badge_label: "Patrocinado", ...over });

describe("anuncios nativos del directorio", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => { fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock); localStorage.clear(); clearAccessToken(); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("sólo admite enlaces http(s) o rutas internas", () => {
    expect(safeAdUrl("https://hotel.example/oferta")).toBe("https://hotel.example/oferta");
    expect(safeAdUrl("/operador/aventuras")).toBe("/operador/aventuras");
    for (const bad of ["javascript:alert(1)", "data:text/html,x", "//evil.example", "nada"]) expect(safeAdUrl(bad), bad).toBeNull();
  });

  it("sin backend no pide nada; con backend descarta creatividades con enlaces peligrosos", async () => {
    expect(await serveNative("directory_native", {}, false)).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
    fetchMock.mockResolvedValueOnce(json({ data: [creative(), creative({ id: "c2", target_url: "javascript:alert(1)" })] }));
    const out = await serveNative("directory_native", { category: "experiencia", limit: 2 }, true);
    expect(out.map((c) => c.id)).toEqual(["c1"]);
    expect(fetchMock.mock.calls[0]![0]).toBe("/api/v1/sponsorship/serve/directory_native?limit=2&category=experiencia");
  });

  it("la medición envía el evento y nunca propaga un fallo", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    expect(() => trackAd(creative(), "click", "/operadores/directorio")).not.toThrow();
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(JSON.parse(String((fetchMock.mock.calls[0]![1] as RequestInit).body))).toEqual({ creative_id: "c1", slot_id: "directory_native", event_type: "click", page: "/operadores/directorio" });
  });
});
