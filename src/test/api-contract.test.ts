import { clearAccessToken, setAccessToken } from "@/lib/accessToken";
import { afterEach, describe, expect, it, vi } from "vitest";
import { calculateCartTotal, fetchApi } from "@/lib/fastifyClient";
import { HttpError } from "@/lib/httpClient";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("contrato HTTP del cliente Fastify", () => {
  it("envía el cálculo de carrito con el contrato esperado y devuelve totales", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ subtotal: 200, itbis: 36, total: 236 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await calculateCartTotal([{ id: "product-1", quantity: 2, price: 100 }]);

    expect(result).toEqual({ subtotal: 200, itbis: 36, total: 236 });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/v1/cart/calculate");
    expect(init.method).toBe("POST");
    expect(new Headers(init.headers).get("Accept")).toBe("application/json");
    expect(new Headers(init.headers).get("Content-Type")).toBe("application/json");
    expect(JSON.parse(String(init.body))).toEqual({
      items: [{ id: "product-1", quantity: 2, price: 100 }],
    });
  });

  it("inyecta el token Bearer que está en memoria y nunca lo lee del almacenamiento del navegador", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { success: true } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    // Un token dejado en el almacenamiento (p. ej. por una versión anterior) no debe usarse.
    const storage: Record<string, string> = { "sb-access-token": "token-en-almacenamiento" };
    const storageStub = { getItem: (key: string) => storage[key] ?? null, setItem: (key: string, val: string) => { storage[key] = val; }, removeItem: (key: string) => { delete storage[key]; } };
    vi.stubGlobal("localStorage", storageStub);
    vi.stubGlobal("sessionStorage", storageStub);

    await fetchApi("/operators/me/bookings");
    expect(new Headers((fetchMock.mock.calls[0] as [string, RequestInit])[1].headers).has("Authorization")).toBe(false);

    setAccessToken("jwt-en-memoria-123", 900);
    await fetchApi("/operators/me/bookings");
    expect(new Headers((fetchMock.mock.calls[1] as [string, RequestInit])[1].headers).get("Authorization")).toBe("Bearer jwt-en-memoria-123");
    expect(Object.values(storage)).not.toContain("jwt-en-memoria-123");
    clearAccessToken();
  });

  it("convierte el error del contrato HTTP en HttpError con estado y detalle", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "Cantidad inválida", code: "INVALID_QUANTITY" }), {
          status: 422,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const request = fetchApi("/cart/calculate", { method: "POST", body: JSON.stringify({ items: [] }) });
    await expect(request).rejects.toMatchObject({
      name: "HttpError",
      message: "Cantidad inválida",
      status: 422,
      details: { message: "Cantidad inválida", code: "INVALID_QUANTITY" },
    });
    await expect(request).rejects.toBeInstanceOf(HttpError);
  });
});
