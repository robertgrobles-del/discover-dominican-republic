import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearAccessToken, getAccessToken, hasSessionHint, refreshAccessToken, setAccessToken } from "@/lib/accessToken";
import { fetchApi } from "@/lib/fastifyClient";
import { SESSION_EXPIRED_EVENT } from "@/lib/session";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const tokens = (access: string) => ({ data: { tokens: { access_token: access, token_type: "Bearer", expires_in: 900 } } });
const call = (mock: ReturnType<typeof vi.fn>, i: number) => mock.mock.calls[i] as [string, RequestInit];
const auth = (mock: ReturnType<typeof vi.fn>, i: number) => new Headers(call(mock, i)[1].headers).get("Authorization");

describe("token de acceso en memoria", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => { fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock); localStorage.clear(); sessionStorage.clear(); clearAccessToken(); });
  afterEach(() => { clearAccessToken(); vi.unstubAllGlobals(); });

  it("no deja el token en localStorage ni sessionStorage, sólo una marca sin valor secreto", () => {
    setAccessToken("secreto-jwt", 900);
    expect(getAccessToken()).toBe("secreto-jwt");
    const dump = (storage: Storage) => Array.from({ length: storage.length }, (_, i) => storage.getItem(storage.key(i)!)).join("|");
    const stored = `${dump(localStorage)}|${dump(sessionStorage)}`;
    expect(stored).not.toContain("secreto-jwt");
    expect(hasSessionHint()).toBe(true);
  });

  it("un token vencido o por vencer no se envía", () => {
    setAccessToken("corto", 5);
    expect(getAccessToken()).toBeNull();
  });

  it("un visitante anónimo no provoca peticiones de refresco", async () => {
    fetchMock.mockResolvedValue(json({ data: [] }));
    await fetchApi("/beaches");
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(auth(fetchMock, 0)).toBeNull();
  });

  it("tras recargar recupera la sesión con la cookie de refresco antes de la primera petición", async () => {
    setAccessToken("viejo", 900);
    // Simula la recarga: se pierde la memoria, queda la marca.
    clearAccessToken();
    localStorage.setItem("dr:has-session", "1");

    fetchMock.mockResolvedValueOnce(json(tokens("nuevo"))).mockResolvedValueOnce(json({ data: { ok: true } }));
    await fetchApi("/me");

    const [refreshUrl, refreshInit] = call(fetchMock, 0);
    expect(refreshUrl).toContain("/auth/refresh");
    expect(refreshInit.credentials).toBe("include");
    expect(new Headers(refreshInit.headers).get("x-refresh-transport")).toBe("cookie");
    expect(refreshInit.body).toBeUndefined(); // el token de refresco nunca pasa por JavaScript
    expect(auth(fetchMock, 1)).toBe("Bearer nuevo");
  });

  it("ante un 401 renueva una vez y reintenta la petición", async () => {
    setAccessToken("caducado-en-servidor", 900);
    fetchMock
      .mockResolvedValueOnce(json({ message: "Token vencido" }, 401))
      .mockResolvedValueOnce(json(tokens("renovado")))
      .mockResolvedValueOnce(json({ data: { ok: true } }));
    const expired = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, expired);
    await expect(fetchApi("/me")).resolves.toEqual({ data: { ok: true } });
    window.removeEventListener(SESSION_EXPIRED_EVENT, expired);
    expect(auth(fetchMock, 2)).toBe("Bearer renovado");
    expect(expired).not.toHaveBeenCalled();
  });

  it("si el refresco también falla avisa de sesión expirada y limpia el token", async () => {
    setAccessToken("caducado", 900);
    fetchMock.mockResolvedValueOnce(json({ message: "no" }, 401)).mockResolvedValueOnce(json({ message: "no" }, 401));
    const expired = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, expired);
    await expect(fetchApi("/me")).rejects.toMatchObject({ status: 401 });
    window.removeEventListener(SESSION_EXPIRED_EVENT, expired);
    expect(expired).toHaveBeenCalledOnce();
    expect(getAccessToken()).toBeNull();
    expect(hasSessionHint()).toBe(false);
  });

  it("un fallo del servidor al refrescar no cierra la sesión", async () => {
    setAccessToken("vigente", 900);
    fetchMock.mockResolvedValueOnce(json({}, 503));
    expect(await refreshAccessToken()).toBeNull();
    expect(hasSessionHint()).toBe(true);
  });

  it("los refrescos simultáneos comparten una sola petición (el token de refresco es de un solo uso)", async () => {
    setAccessToken("x", 900);
    fetchMock.mockResolvedValue(json(tokens("unico")));
    const results = await Promise.all([refreshAccessToken(), refreshAccessToken(), refreshAccessToken()]);
    expect(results).toEqual(["unico", "unico", "unico"]);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("iniciar sesión guarda el token en memoria con cookie; cerrar sesión lo borra", async () => {
    fetchMock.mockResolvedValueOnce(json({ data: { user: { id: "u1" }, tokens: tokens("de-login").data.tokens } })).mockResolvedValueOnce(new Response(null, { status: 204 }));
    await fetchApi("/auth/login", { method: "POST", body: JSON.stringify({ email: "a@b.do", password: "x" }) });
    const [, loginInit] = call(fetchMock, 0);
    expect(loginInit.credentials).toBe("include");
    expect(new Headers(loginInit.headers).get("x-refresh-transport")).toBe("cookie");
    expect(getAccessToken()).toBe("de-login");

    await fetchApi("/auth/logout", { method: "POST" });
    expect(getAccessToken()).toBeNull();
    expect(hasSessionHint()).toBe(false);
  });
});
