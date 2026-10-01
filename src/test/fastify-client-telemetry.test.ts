import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PRIVACY_CONSENT_KEY } from "@/lib/privacy-consent";
import { SESSION_EXPIRED_EVENT } from "@/lib/session";

let fetchMock: ReturnType<typeof vi.fn>;

async function loadClient() {
  return import("@/lib/fastifyClient");
}

/** Evento de analítica enviado por el reportero tras un fallo del API. */
function reportedEvent(callIndex: number): { type: string; props: Record<string, unknown> } {
  const [, init] = fetchMock.mock.calls[callIndex] as [string, RequestInit];
  return JSON.parse(String(init.body)).events[0];
}

async function loadClientWithSessionListener() {
  const listener = vi.fn();
  window.addEventListener(SESSION_EXPIRED_EVENT, listener);
  const client = await loadClient();
  return { client, listener, dispose: () => window.removeEventListener(SESSION_EXPIRED_EVENT, listener) };
}

describe("telemetría del transporte de API (fastifyClient)", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    localStorage.setItem(PRIVACY_CONSENT_KEY, "accepted");
    window.history.pushState({}, "", "/tienda");
    fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("reporta un 5xx con estado y ruta del API (sin query string) y vuelve a lanzarlo", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 503 }));
    const { fetchApi } = await loadClient();

    await expect(fetchApi("/orders?status=open")).rejects.toThrow("Error HTTP (503)");

    expect(fetchMock.mock.calls[0][0]).toBe("/api/v1/orders?status=open");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toBe("/api/v1/analytics/events");
    const event = reportedEvent(1);
    expect(event.type).toBe("error");
    expect(event.props.src).toBe("api");
    expect(event.props.st).toBe(503);
    expect(event.props.ep).toBe("orders");
  });

  it("reporta caídas de red (TypeError de fetch) sin estado HTTP", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    const { fetchApi } = await loadClient();

    await expect(fetchApi("/tienda/products")).rejects.toThrow("Failed to fetch");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const event = reportedEvent(1);
    expect(event.type).toBe("error");
    expect(event.props.src).toBe("api");
    expect(event.props.st).toBeUndefined();
    expect(event.props.ep).toBe("tienda products");
  });

  it("no reporta los 4xx (salvo avisar la sesión vencida) porque el visitante puede resolverlos", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 404 }));
    const { fetchApi } = await loadClient();

    await expect(fetchApi("/tienda/products")).rejects.toThrow("Error HTTP (404)");
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("un 401 fuera de /auth/ emite el aviso de sesión vencida sin contarlo como error", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }));
    const { client, listener, dispose } = await loadClientWithSessionListener();
    try {
      await expect(client.fetchApi("/panel/bookings")).rejects.toThrow("Error HTTP (401)");
      expect(listener).toHaveBeenCalledOnce();
      expect(fetchMock).toHaveBeenCalledOnce();
    } finally {
      dispose();
    }
  });

  it("un 401 en /auth/ (credenciales incorrectas) no dispara el aviso de sesión", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }));
    const { client, listener, dispose } = await loadClientWithSessionListener();
    try {
      await expect(client.fetchApi("/auth/login", { method: "POST", body: "{}" })).rejects.toThrow();
      expect(listener).not.toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledOnce();
    } finally {
      dispose();
    }
  });

  it("no reporta fallos del propio transporte de analítica (evita un bucle de reportes)", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }));
    const { fetchApi } = await loadClient();

    await expect(fetchApi("/analytics/events", { method: "POST", body: "{}" })).rejects.toThrow("Error HTTP (500)");
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("ignora cancelaciones (AbortError) sin reportarlas", async () => {
    const abort = new Error("The operation was aborted");
    abort.name = "AbortError";
    fetchMock.mockRejectedValueOnce(abort);
    const { fetchApi } = await loadClient();

    await expect(fetchApi("/tienda/products")).rejects.toThrow("The operation was aborted");
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
