import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildTerms } from "@/components/admin/AdminCreatorCampaigns";
import { accessGovernanceApi } from "@/lib/accessGovernanceApi";
import { clearAccessToken, setAccessToken } from "@/lib/accessToken";
import { campaignErrorMessage, creatorCampaignsApi as api, describeCompensation, money } from "@/lib/creatorCampaignsApi";
import { HttpError } from "@/lib/httpClient";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const ID = "11111111-1111-4111-8111-111111111111";
const FORM = {
  title: "Verano", sponsor: "", brief: "Mostrar un fin de semana completo en Samaná", deliverableType: "video", quantity: "2", startsOn: "2026-11-01", endsOn: "2026-12-01",
  compensation: "fixed", amount: "15000", currency: "DOP", pct: "", disclosure: "#publicidad al inicio", metrics: "reproducciones, clics", media: "portal, instagram",
  territory: "República Dominicana", days: "180", exclusive: "no", uses: "feed, anuncio",
};

describe("formulario de términos de campaña", () => {
  it("arma los términos que espera el servidor", () => {
    expect(buildTerms(FORM).terms).toEqual({
      brief: "Mostrar un fin de semana completo en Samaná",
      deliverables: [{ type: "video", quantity: 2 }],
      schedule: { starts_on: "2026-11-01", ends_on: "2026-12-01" },
      compensation: { type: "fixed", amount: 15000, currency: "DOP" },
      disclosure: "#publicidad al inicio",
      metrics: ["reproducciones", "clics"],
      rights: { media: ["portal", "instagram"], territory: "República Dominicana", duration_days: 180, exclusive: false, approved_uses: ["feed", "anuncio"] },
    });
    expect(buildTerms({ ...FORM, compensation: "commission", pct: "10" }).terms?.compensation).toEqual({ type: "commission", commission_pct: 10 });
    expect(buildTerms({ ...FORM, compensation: "none" }).terms?.compensation).toEqual({ type: "none" });
  });

  it("explica qué falta en lugar de enviar términos inválidos", () => {
    expect(buildTerms({ ...FORM, brief: "corto" }).problem).toMatch(/brief/);
    expect(buildTerms({ ...FORM, endsOn: "2026-10-01" }).problem).toMatch(/terminar antes/);
    expect(buildTerms({ ...FORM, days: "0" }).problem).toMatch(/perpetuas/);
    expect(buildTerms({ ...FORM, days: "5000" }).problem).toMatch(/perpetuas/);
    expect(buildTerms({ ...FORM, amount: "" }).problem).toMatch(/pago fijo/);
    expect(buildTerms({ ...FORM, compensation: "commission", pct: "80" }).problem).toMatch(/comisión/);
    expect(buildTerms({ ...FORM, disclosure: "" }).problem).toMatch(/publicidad/);
    expect(buildTerms({ ...FORM, uses: " , " }).problem).toMatch(/uso aprobado/);
  });
});

describe("cliente de campañas con creadores", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  const sent = (i = 0) => { const [url, init] = fetchMock.mock.calls[i] as [string, RequestInit]; return { url, method: init.method ?? "GET", body: init.body ? JSON.parse(String(init.body)) : undefined }; };
  beforeEach(() => { fetchMock = vi.fn().mockImplementation(async () => json({ data: {} })); vi.stubGlobal("fetch", fetchMock); setAccessToken("jwt", 900); });
  afterEach(() => { clearAccessToken(); vi.unstubAllGlobals(); });

  it("acepta una versión concreta y entrega una pieza", async () => {
    await api.accept(ID, 3);
    expect(sent(0)).toMatchObject({ url: `/api/v1/creators/campaigns/${ID}/accept`, method: "POST", body: { version: 3 } });
    await api.deliver(ID, "22222222-2222-4222-8222-222222222222");
    expect(sent(1)).toMatchObject({ url: `/api/v1/creators/campaigns/${ID}/deliverables`, body: { video_id: "22222222-2222-4222-8222-222222222222" } });
  });

  it("abre disputas, revoca licencias y opera la parte del personal", async () => {
    await api.openDispute({ subject_type: "ledger_entry", subject_id: ID, reason: "La entrega fue a tiempo", evidence: [{ label: "Captura", url: "https://x.do/a.png" }] });
    expect(sent(0)).toMatchObject({ url: "/api/v1/creators/disputes", body: { subject_type: "ledger_entry", subject_id: ID, evidence: [{ label: "Captura" }] } });
    await api.revokeRight(ID, "Ya no quiero difundirla");
    expect(sent(1)).toMatchObject({ url: `/api/v1/creators/rights/${ID}/revoke`, body: { reason: "Ya no quiero difundirla" } });
    await api.adminReview(ID, "approved");
    expect(sent(2).body).toEqual({ decision: "approved" }); // sin nota no se envía el campo
    await api.adminSetStatus(ID, "open");
    expect(sent(3)).toMatchObject({ url: `/api/v1/admin/creator-campaigns/${ID}/status`, body: { status: "open" } });
    await api.adminReviseTerms(ID, buildTerms(FORM).terms!);
    expect(sent(4)).toMatchObject({ url: `/api/v1/admin/creator-campaigns/${ID}/terms`, method: "PUT" });
    await api.adminDisputes();
    expect(sent(5).url).toBe("/api/v1/admin/creator-disputes?status=open");
  });

  it("invita personal y gestiona permisos acotados", async () => {
    await accessGovernanceApi.inviteStaff("nueva@descubrerd.com", "moderator");
    expect(sent(0)).toMatchObject({ url: "/api/v1/admin/staff-invitations", body: { email: "nueva@descubrerd.com", role: "moderator" } });
    await accessGovernanceApi.grantCapability({ user_id: ID, capability: "catalog.manage", collections: ["events"], record_ids: [ID], hours: 48, reason: "Organiza el festival" });
    expect(sent(1)).toMatchObject({ url: "/api/v1/admin/capability-grants", body: { capability: "catalog.manage", collections: ["events"], hours: 48 } });
    await accessGovernanceApi.revokeGrant(ID);
    expect(sent(2)).toMatchObject({ url: `/api/v1/admin/capability-grants/${ID}`, method: "DELETE" });
    await accessGovernanceApi.listGrants(ID);
    expect(sent(3).url).toBe(`/api/v1/admin/capability-grants?user_id=${ID}`);
  });

  it("describe la compensación y traduce los errores propios del módulo", () => {
    expect(describeCompensation({ type: "fixed", amount: 15000, currency: "DOP" })).toMatch(/Pago fijo de .*15.?000/);
    expect(describeCompensation({ type: "commission", commission_pct: 10 })).toBe("Comisión del 10 % sobre ventas atribuidas");
    expect(describeCompensation({ type: "none" })).toBe("Sin compensación económica");
    expect(money(-500, "DOP")).toMatch(/-.*500/);
    const err = (code: string) => new HttpError("x", 409, { error: { message: "x", details: { code } } });
    expect(campaignErrorMessage(err("TERMS_VERSION_MISMATCH"))).toMatch(/cambiaron/);
    expect(campaignErrorMessage(err("TERMS_NOT_ACCEPTED"))).toMatch(/Acepta los términos/);
    expect(campaignErrorMessage(err("CAMPAIGN_LICENSE"))).toMatch(/disputa/);
    expect(campaignErrorMessage(err("DISPUTE_WINDOW_CLOSED"))).toMatch(/plazo/);
  });
});
