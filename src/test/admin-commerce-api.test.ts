import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearAccessToken } from "@/lib/accessToken";
import { adminCommerceApi, upcomingMondays } from "@/lib/adminCommerceApi";

const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });

describe("subasta y licencias en administración", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  const sent = (i = 0) => { const [url, init] = fetchMock.mock.calls[i] as [string, RequestInit]; return { url, method: init.method ?? "GET", body: init.body ? JSON.parse(String(init.body)) : undefined }; };
  beforeEach(() => { fetchMock = vi.fn(() => Promise.resolve(json({ data: {} }))); vi.stubGlobal("fetch", fetchMock); localStorage.clear(); clearAccessToken(); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("las semanas ofrecidas son lunes futuros según la fecha de Santo Domingo", () => {
    expect(upcomingMondays(3, new Date("2026-10-03T12:00:00Z"))).toEqual(["2026-10-05", "2026-10-12", "2026-10-19"]); // sábado
    expect(upcomingMondays(1, new Date("2026-10-05T12:00:00Z"))).toEqual(["2026-10-12"]); // lunes: la semana en curso no se ofrece
    // 02:00 UTC del lunes aún es domingo en Santo Domingo.
    expect(upcomingMondays(1, new Date("2026-10-05T02:00:00Z"))).toEqual(["2026-10-05"]);
  });

  it("subasta: consulta el tablero, fija el precio mínimo y cierra con las rutas correctas", async () => {
    await adminCommerceApi.board("home_hero_banner", "2026-10-12");
    await adminCommerceApi.setSlotAuction("home_hero_banner", true, 5000);
    await adminCommerceApi.closeAuction("home_hero_banner", "2026-10-12");
    expect(sent(0).url).toBe("/api/v1/admin/sponsorship/auctions?slot_id=home_hero_banner&period_start=2026-10-12");
    expect(sent(1)).toEqual({ url: "/api/v1/admin/sponsorship/slots/home_hero_banner/auction", method: "PUT", body: { enabled: true, reserve: 5000 } });
    expect(sent(2)).toEqual({ url: "/api/v1/admin/sponsorship/auctions/close", method: "POST", body: { slot_id: "home_hero_banner", period_start: "2026-10-12" } });
  });

  it("licencias: filtra por estado y envía la decisión con su comprobante", async () => {
    await adminCommerceApi.licenseRequests("requested");
    await adminCommerceApi.decideLicense("r1", { approve: true, payment_reference: "TRF-1" });
    expect(sent(0).url).toBe("/api/v1/admin/media/licenses/requests?per_page=100&status=requested");
    expect(sent(1)).toEqual({ url: "/api/v1/admin/media/licenses/requests/r1/decide", method: "POST", body: { approve: true, payment_reference: "TRF-1" } });
  });
});
