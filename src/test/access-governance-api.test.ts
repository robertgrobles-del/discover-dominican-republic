import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { accessEventLabel, accessGovernanceApi as api, governanceErrorMessage, UUID_PATTERN } from "@/lib/accessGovernanceApi";
import { clearAccessToken, setAccessToken } from "@/lib/accessToken";
import { HttpError } from "@/lib/httpClient";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const ID = "11111111-1111-4111-8111-111111111111";

describe("cliente de gobernanza de accesos", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  const sent = (i = 0) => { const [url, init] = fetchMock.mock.calls[i] as [string, RequestInit]; return { url, method: init.method ?? "GET", body: init.body ? JSON.parse(String(init.body)) : undefined, auth: new Headers(init.headers).get("Authorization") }; };

  beforeEach(() => { fetchMock = vi.fn().mockImplementation(async () => json({ data: {} })); vi.stubGlobal("fetch", fetchMock); setAccessToken("jwt-admin", 900); });
  afterEach(() => { clearAccessToken(); vi.unstubAllGlobals(); });

  it("pide aprobaciones con el filtro de estado y la sesión en memoria", async () => {
    await api.listApprovals("pending");
    expect(sent()).toMatchObject({ url: "/api/v1/admin/approvals?status=pending", method: "GET", auth: "Bearer jwt-admin" });
    await api.listApprovals();
    expect(sent(1).url).toBe("/api/v1/admin/approvals");
  });

  it("crea, aprueba, rechaza y retira solicitudes con el cuerpo que espera el servidor", async () => {
    await api.requestApproval({ kind: "grant_admin", target_id: ID, reason: "Guardia de fin de semana", payload: { hours: 12 } });
    expect(sent(0)).toMatchObject({ url: "/api/v1/admin/approvals", method: "POST", body: { kind: "grant_admin", target_id: ID, reason: "Guardia de fin de semana", payload: { hours: 12 } } });
    await api.requestApproval({ kind: "reset_2fa", target_id: ID, reason: "Perdió el teléfono" });
    expect(sent(1).body.payload).toEqual({}); // el servidor exige el campo aunque vaya vacío

    await api.approve(ID);
    expect(sent(2)).toMatchObject({ url: `/api/v1/admin/approvals/${ID}/approve`, body: {} });
    await api.reject(ID, "No corresponde");
    expect(sent(3)).toMatchObject({ url: `/api/v1/admin/approvals/${ID}/reject`, body: { note: "No corresponde" } });
    await api.cancelApproval(ID);
    expect(sent(4)).toMatchObject({ url: `/api/v1/admin/approvals/${ID}/cancel`, method: "POST" });
  });

  it("opera las revisiones de acceso y los accesos por persona", async () => {
    await api.decideItem(ID, "22222222-2222-4222-8222-222222222222", "revoke", "Dejó el equipo");
    expect(sent(0)).toMatchObject({ url: `/api/v1/admin/access-reviews/${ID}/items/22222222-2222-4222-8222-222222222222/decide`, body: { decision: "revoke", justification: "Dejó el equipo" } });
    await api.closeReview(ID);
    expect(sent(1).url).toBe(`/api/v1/admin/access-reviews/${ID}/close`);
    await api.timeline(ID);
    expect(sent(2).url).toBe(`/api/v1/admin/users/${ID}/access-timeline`);
    await api.grantTemporaryRole(ID, { role: "moderator", hours: 24, reason: "Cobertura de vacaciones" });
    expect(sent(3)).toMatchObject({ url: `/api/v1/admin/users/${ID}/roles/temporary`, body: { role: "moderator", hours: 24, reason: "Cobertura de vacaciones" } });
  });

  it("traduce los errores del servidor a mensajes para la persona", () => {
    const err = (status: number, details: object, message = "x") => new HttpError(message, status, { error: { message, details } });
    expect(governanceErrorMessage(err(403, { code: "SELF_APPROVAL" }))).toMatch(/otra persona administradora/);
    expect(governanceErrorMessage(err(403, { code: "SELF_REVIEW" }))).toMatch(/tus propios accesos/);
    expect(governanceErrorMessage(err(422, { code: "LAST_ADMIN" }))).toMatch(/último administrador/);
    expect(governanceErrorMessage(err(409, { reason: "APPROVAL_ALREADY_PENDING" }))).toMatch(/pendiente/);
    expect(governanceErrorMessage(err(403, {}))).toMatch(/no tiene permiso/);
    expect(governanceErrorMessage(err(422, {}, "La solicitud ya está approved"))).toBe("La solicitud ya está approved");
    expect(governanceErrorMessage(new TypeError("Failed to fetch"))).toMatch(/Inténtalo de nuevo/);
  });

  it("nombra los eventos conocidos y deja pasar los desconocidos; valida identificadores", () => {
    expect(accessEventLabel("user.role_expired")).toBe("Rol temporal vencido");
    expect(accessEventLabel("algo.nuevo")).toBe("algo.nuevo");
    expect(UUID_PATTERN.test(ID)).toBe(true);
    expect(UUID_PATTERN.test("no-es-un-id")).toBe(false);
  });
});
