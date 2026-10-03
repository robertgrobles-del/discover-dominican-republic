import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearAccessToken } from "@/lib/accessToken";
import { HttpError } from "@/lib/httpClient";
import { advertiserApi, advertiserErrorMessage, sameOriginPath } from "@/lib/advertiserApi";

const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });

describe("anunciante y banco de imágenes", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  const sent = (i = 0) => { const [url, init] = fetchMock.mock.calls[i] as [string, RequestInit]; return { url, method: init.method ?? "GET", body: init.body ? JSON.parse(String(init.body)) : undefined }; };
  beforeEach(() => { fetchMock = vi.fn(() => Promise.resolve(json({ data: {} }))); vi.stubGlobal("fetch", fetchMock); localStorage.clear(); clearAccessToken(); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("sólo ofrece para pujar los espacios que están en subasta", async () => {
    fetchMock.mockResolvedValueOnce(json({ data: [{ id: "home_hero_banner", name: "Home", max_active_creatives: 5, auction_enabled: true, auction_reserve: "300.00" }, { id: "newsletter_sponsor", name: "Boletín", max_active_creatives: 2, auction_enabled: false, auction_reserve: "0" }] }));
    expect((await advertiserApi.slots()).map((s) => s.id)).toEqual(["home_hero_banner"]);
  });

  it("la campaña se crea con tarifa fija por 90 días y el anuncio va a su ruta", async () => {
    const now = new Date("2026-10-03T12:00:00Z");
    await advertiserApi.createCampaign({ advertiser_name: "Aventuras", advertiser_email: "a@test.local", campaign_name: "Temporada alta" }, now);
    await advertiserApi.createCreative("camp-1", { slot_id: "home_hero_banner", title: "Ballenas en Samaná", target_url: "https://aventuras.example" });
    expect(sent(0).body).toEqual({ advertiser_name: "Aventuras", advertiser_email: "a@test.local", campaign_name: "Temporada alta", billing_type: "flat", starts_at: "2026-10-03T12:00:00.000Z", ends_at: "2027-01-01T12:00:00.000Z" });
    expect(sent(1)).toEqual({ url: "/api/v1/sponsorship/campaigns/camp-1/creatives", method: "POST", body: { slot_id: "home_hero_banner", title: "Ballenas en Samaná", target_url: "https://aventuras.example" } });
  });

  it("pujar, retirar y pedir una licencia usan sus rutas", async () => {
    await advertiserApi.bid({ slot_id: "home_hero_banner", creative_id: "cr-1", period_start: "2026-10-12", amount: 900 });
    await advertiserApi.withdraw("bid-1");
    await advertiserApi.requestLicense({ offer_id: "of-1", license_type: "commercial", licensee_name: "Agencia Caribe", intended_use: "Campaña impresa 2027" });
    expect([sent(0), sent(1), sent(2)].map((c) => `${c.method} ${c.url}`)).toEqual(["POST /api/v1/sponsorship/bids", "DELETE /api/v1/sponsorship/bids/bid-1", "POST /api/v1/media/licenses/requests"]);
    expect(sent(0).body).toEqual({ slot_id: "home_hero_banner", creative_id: "cr-1", period_start: "2026-10-12", amount: 900 });
  });

  it("las direcciones de imágenes se usan por el mismo origen, sea cual sea el dominio que mande el backend", async () => {
    expect(sameOriginPath("https://api.descubrerd.com/api/v1/media/files/abc?variant=medium")).toBe("/api/v1/media/files/abc?variant=medium");
    expect(sameOriginPath("/api/v1/media/files/abc")).toBe("/api/v1/media/files/abc");
    fetchMock.mockResolvedValueOnce(json({ data: [{ id: "o1", asset_id: "a1", preview_url: "http://localhost:3000/api/v1/media/files/a1?variant=medium" }] }));
    expect((await advertiserApi.catalog()).data[0]!.preview_url).toBe("/api/v1/media/files/a1?variant=medium");
    fetchMock.mockResolvedValueOnce(json({ data: [{ id: "l1", download_url: "http://localhost:3000/api/v1/media/files/a1" }, { id: "l2", download_url: null }] }));
    expect((await advertiserApi.myLicenses()).data.map((l) => l.download_url)).toEqual(["/api/v1/media/files/a1", null]);
  });

  it("explica en palabras claras los rechazos de una puja", () => {
    expect(advertiserErrorMessage(new HttpError("x", 422, { error: { message: "m", details: { code: "BELOW_RESERVE", reserve: 300 } } }))).toBe("La puja mínima para este espacio es 300.");
    expect(advertiserErrorMessage(new HttpError("x", 422, { error: { message: "m", details: { code: "BID_NOT_HIGHER" } } }))).toMatch(/sólo puede subirse/);
    expect(advertiserErrorMessage(new HttpError("x", 401, {}))).toMatch(/Inicia sesión/);
  });
});
