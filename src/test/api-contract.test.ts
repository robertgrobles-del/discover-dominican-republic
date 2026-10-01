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
