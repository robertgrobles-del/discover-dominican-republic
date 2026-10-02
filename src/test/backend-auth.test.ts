import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearAccessToken, getAccessToken, hasSessionHint } from "@/lib/accessToken";
import { resolveAuthSource } from "@/lib/authSource";
import { INVALID_CREDENTIALS, restoreSession, signIn, signOut, signUp, verifyTwoFactor } from "@/lib/backendAuth";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const USER = { id: "u1", email: "ana@descubrerd.com", email_verified: true, display_name: "Ana", avatar_url: null, locale: "es", roles: ["user"], created_at: "2026-01-01T00:00:00Z" };
const session = (token = "jwt-1") => ({ data: { user: USER, tokens: { access_token: token, token_type: "Bearer", expires_in: 900 } } });

describe("origen de la sesión", () => {
  it("sigue al catálogo si no se indica, y permite sesión real con catálogo simulado", () => {
    expect(resolveAuthSource(undefined, "mock")).toBe("mock");
    expect(resolveAuthSource("", "api")).toBe("api");
    expect(resolveAuthSource("api", "mock")).toBe("api");
    expect(resolveAuthSource(" API ", "mock")).toBe("api");
  });
  it("rechaza valores desconocidos y la sesión simulada sobre datos reales", () => {
    expect(() => resolveAuthSource("supabase", "mock")).toThrow(/inválido/);
    expect(() => resolveAuthSource("mock", "api")).toThrow(/no es compatible/);
  });
});

describe("sesión contra el backend", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  const sent = (i = 0) => { const [url, init] = fetchMock.mock.calls[i] as [string, RequestInit]; return { url, init, body: init.body ? JSON.parse(String(init.body)) : undefined, headers: new Headers(init.headers) }; };
  beforeEach(() => { fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock); localStorage.clear(); clearAccessToken(); });
  afterEach(() => { clearAccessToken(); vi.unstubAllGlobals(); });

  it("iniciar sesión deja el token en memoria y pide la cookie de refresco, sin guardar nada secreto", async () => {
    fetchMock.mockResolvedValueOnce(json(session("jwt-login")));
    const result = await signIn("ana@descubrerd.com", "Clave-Segura-2026");
    expect(result).toMatchObject({ status: "signed_in", user: { id: "u1" } });
    expect(sent().url).toBe("/api/v1/auth/login");
    expect(sent().init.credentials).toBe("include");
    expect(sent().headers.get("x-refresh-transport")).toBe("cookie");
    expect(getAccessToken()).toBe("jwt-login");
    expect(JSON.stringify({ ...localStorage })).not.toContain("jwt-login");
  });

  it("credenciales incorrectas y exceso de intentos dan mensajes que las pantallas ya entienden", async () => {
    fetchMock.mockResolvedValueOnce(json({ error: { message: "Correo o contraseña incorrectos" } }, 401));
    const bad = await signIn("ana@descubrerd.com", "mala");
    expect(bad.status === "error" && bad.error.message).toBe(INVALID_CREDENTIALS);
    expect(getAccessToken()).toBeNull();

    fetchMock.mockResolvedValueOnce(json({ error: { message: "Demasiadas solicitudes" } }, 429));
    const limited = await signIn("ana@descubrerd.com", "otra");
    expect(limited.status === "error" && limited.error.message).toMatch(/Demasiados intentos/);
  });

  it("con verificación en dos pasos devuelve el reto y lo canjea con el código o con uno de recuperación", async () => {
    fetchMock.mockResolvedValueOnce(json({ data: { two_factor_required: true, challenge_token: "reto-de-cinco-minutos-123456" } }));
    const first = await signIn("ana@descubrerd.com", "Clave-Segura-2026");
    expect(first).toEqual({ status: "two_factor_required", challengeToken: "reto-de-cinco-minutos-123456" });
    expect(getAccessToken()).toBeNull(); // todavía no hay sesión

    fetchMock.mockResolvedValueOnce(json({ data: { ...session("jwt-2fa").data, used_recovery_code: false } }));
    expect((await verifyTwoFactor("reto-de-cinco-minutos-123456", "123 456")).status).toBe("signed_in");
    expect(sent(1).body).toEqual({ challenge_token: "reto-de-cinco-minutos-123456", code: "123 456" });
    expect(getAccessToken()).toBe("jwt-2fa");

    fetchMock.mockResolvedValueOnce(json(session()));
    await verifyTwoFactor("reto-de-cinco-minutos-123456", "ABCD-EFGH-1234");
    expect(sent(2).body).toEqual({ challenge_token: "reto-de-cinco-minutos-123456", recovery_code: "ABCD-EFGH-1234" });

    fetchMock.mockResolvedValueOnce(json({ error: { message: "x" } }, 401));
    const wrong = await verifyTwoFactor("reto-de-cinco-minutos-123456", "000000");
    expect(wrong.status === "error" && wrong.error.message).toMatch(/código no es válido/);
  });

  it("el alta envía la aceptación de términos que recogió el formulario", async () => {
    fetchMock.mockResolvedValueOnce(json(session("jwt-alta"), 201));
    await signUp({ email: "nueva@descubrerd.com", password: "Clave-Segura-2026", displayName: "Nueva", acceptedTerms: true });
    expect(sent().url).toBe("/api/v1/auth/register");
    expect(sent().body).toEqual({ email: "nueva@descubrerd.com", password: "Clave-Segura-2026", accept_terms: true, display_name: "Nueva" });
    expect(getAccessToken()).toBe("jwt-alta");
  });

  it("al recargar recupera la sesión con la cookie; un visitante anónimo no genera peticiones", async () => {
    expect(await restoreSession()).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();

    fetchMock.mockResolvedValueOnce(json(session("jwt-inicial")));
    await signIn("ana@descubrerd.com", "Clave-Segura-2026");
    clearAccessToken();                     // la recarga pierde la memoria…
    localStorage.setItem("dr:has-session", "1"); // …pero queda la marca
    fetchMock.mockResolvedValueOnce(json({ data: { tokens: { access_token: "jwt-renovado", token_type: "Bearer", expires_in: 900 } } })).mockResolvedValueOnce(json({ data: USER }));
    expect(await restoreSession()).toMatchObject({ id: "u1", email: "ana@descubrerd.com" });
    expect(sent(1).url).toContain("/auth/refresh");
    expect(sent(2).headers.get("Authorization")).toBe("Bearer jwt-renovado");
  });

  it("si la cookie ya no vale, no hay sesión y se borra la marca", async () => {
    localStorage.setItem("dr:has-session", "1");
    fetchMock.mockResolvedValueOnce(json({ error: { message: "x" } }, 401));
    expect(await restoreSession()).toBeNull();
    expect(hasSessionHint()).toBe(false);
  });

  it("cerrar sesión limpia el token aunque el servidor no responda", async () => {
    fetchMock.mockResolvedValueOnce(json(session("jwt-x")));
    await signIn("ana@descubrerd.com", "Clave-Segura-2026");
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    await signOut();
    expect(getAccessToken()).toBeNull();
    expect(hasSessionHint()).toBe(false);
  });
});
