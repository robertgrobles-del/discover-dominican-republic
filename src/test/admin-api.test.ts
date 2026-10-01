import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AdminApiError,
  adminCreateEntity,
  adminDeleteEntity,
  adminGetEntity,
  adminListEntities,
  adminUpdateEntity,
  setAdminAccessTokenProvider,
  translateFilters,
} from "@/lib/adminApi";

/**
 * Capa de administración contra Fastify (Plan de accesos, punto 3).
 *
 * Se fija el contrato de las cinco operaciones contra `/api/v1/admin/<colección>`: es lo que sustituye a
 * la función simulada `admin-entities`, así que la ruta, el método y la cabecera de autorización importan
 * tanto como el resultado.
 */

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

const lastCall = (mock: ReturnType<typeof vi.fn>) => mock.mock.calls.at(-1) as [string, RequestInit];

describe("translateFilters", () => {
  it("traduce búsqueda y paginación al vocabulario del servidor", () => {
    expect(translateFilters({ search: "playa", limit: 20, offset: 40 })).toEqual({
      query: { page: "3", per_page: "20", q: "playa" },
      unsupported: [],
    });
  });

  it("acota el tamaño de página y declara los filtros que el servidor no entiende", () => {
    const { query, unsupported } = translateFilters({ limit: 500, is_active: true, destination_id: "abc" });
    expect(query.per_page).toBe("200");
    expect(unsupported.sort()).toEqual(["destination_id", "is_active"]);
  });
});

describe("adminApi", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    setAdminAccessTokenProvider(() => "token-de-prueba");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    setAdminAccessTokenProvider(() => "token-de-prueba");
  });

  it("lista con la ruta, la paginación y el token de sesión", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: [{ id: "h1" }], meta: { total: 7 } }));

    const result = await adminListEntities("hotels", { search: "caribe", limit: 10, offset: 20 });

    const [url, init] = lastCall(fetchMock);
    expect(url).toBe("/api/v1/admin/hotels?page=3&per_page=10&q=caribe");
    expect(init.method).toBe("GET");
    expect(new Headers(init.headers).get("Authorization")).toBe("Bearer token-de-prueba");
    expect(result).toEqual({ data: [{ id: "h1" }], total: 7 });
  });

  it("usa los métodos y rutas del contrato en ver, crear, editar y borrar", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: { id: "abc" } }));

    await adminGetEntity("restaurants", "abc");
    expect(lastCall(fetchMock)[0]).toBe("/api/v1/admin/restaurants/abc");
    expect(lastCall(fetchMock)[1].method).toBe("GET");

    await adminCreateEntity("restaurants", { name: "Nuevo" });
    expect(lastCall(fetchMock)[0]).toBe("/api/v1/admin/restaurants");
    expect(lastCall(fetchMock)[1].method).toBe("POST");
    expect(JSON.parse(String(lastCall(fetchMock)[1].body))).toEqual({ name: "Nuevo" });

    await adminUpdateEntity("restaurants", "abc", { name: "Editado" });
    expect(lastCall(fetchMock)[0]).toBe("/api/v1/admin/restaurants/abc");
    expect(lastCall(fetchMock)[1].method).toBe("PATCH");

    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    const deleted = await adminDeleteEntity("restaurants", "abc");
    expect(lastCall(fetchMock)[0]).toBe("/api/v1/admin/restaurants/abc");
    expect(lastCall(fetchMock)[1].method).toBe("DELETE");
    expect(deleted.data).toBeNull();
  });

  it("explica con claridad que una colección no está expuesta por la API", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: { code: "NOT_FOUND", message: "Ruta no encontrada" } }, 404));

    await expect(adminListEntities("lottery_results")).rejects.toMatchObject({
      name: "AdminApiError",
      kind: "not_exposed",
      status: 404,
    });
    await expect(adminListEntities("lottery_results")).rejects.toThrow(/no está expuesta por la API/);
  });

  it("distingue falta de sesión y falta de capacidad", async () => {
    setAdminAccessTokenProvider(() => null);
    await expect(adminListEntities("hotels")).rejects.toMatchObject({ kind: "unauthorized", status: 401 });
    expect(fetchMock).not.toHaveBeenCalled();

    setAdminAccessTokenProvider(() => "token-de-prueba");
    fetchMock.mockResolvedValue(jsonResponse({ error: { code: "FORBIDDEN", message: "No tienes permiso" } }, 403));
    await expect(adminListEntities("hotels")).rejects.toMatchObject({ kind: "forbidden", status: 403 });
  });

  it("marca los errores de validación del servidor", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: { code: "VALIDATION_ERROR", message: "Solicitud inválida" } }, 400));
    const error = await adminCreateEntity("hotels", { name: "" }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(AdminApiError);
    expect((error as AdminApiError).kind).toBe("validation");
  });
});
