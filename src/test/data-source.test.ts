import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("resolveDataSource", () => {
  it("usa mock cuando el valor está ausente o vacío", async () => {
    const { resolveDataSource } = await import("@/lib/dataSource");
    expect(resolveDataSource(undefined)).toBe("mock");
    expect(resolveDataSource("")).toBe("mock");
    expect(resolveDataSource("  ")).toBe("mock");
  });

  it("acepta mock y api ignorando mayúsculas y espacios", async () => {
    const { resolveDataSource } = await import("@/lib/dataSource");
    expect(resolveDataSource("mock")).toBe("mock");
    expect(resolveDataSource("MOCK")).toBe("mock");
    expect(resolveDataSource(" api ")).toBe("api");
    expect(resolveDataSource("API")).toBe("api");
  });

  it("lanza con un valor desconocido en lugar de degradar a mock", async () => {
    const { resolveDataSource } = await import("@/lib/dataSource");
    expect(() => resolveDataSource("produccion")).toThrow(/VITE_DATA_SOURCE inválido/);
    expect(() => resolveDataSource("true")).toThrow(/VITE_DATA_SOURCE inválido/);
  });
});

describe("DATA_SOURCE evaluado con el entorno", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("sin variable definida el origen es mock", async () => {
    vi.stubEnv("VITE_DATA_SOURCE", "");
    const mod = await import("@/lib/dataSource");
    expect(mod.DATA_SOURCE).toBe("mock");
    expect(mod.IS_MOCK_DATA).toBe(true);
  });

  it("con VITE_DATA_SOURCE=API el origen es api", async () => {
    vi.stubEnv("VITE_DATA_SOURCE", "API");
    const mod = await import("@/lib/dataSource");
    expect(mod.DATA_SOURCE).toBe("api");
    expect(mod.IS_MOCK_DATA).toBe(false);
  });

  it("un valor desconocido impide cargar el módulo", async () => {
    vi.stubEnv("VITE_DATA_SOURCE", "produccion");
    await expect(import("@/lib/dataSource")).rejects.toThrow(/VITE_DATA_SOURCE inválido/);
  });

  it("con VITE_DATA_SOURCE=api el cliente de datos falla de forma cerrada", async () => {
    vi.stubEnv("VITE_DATA_SOURCE", "api");
    await expect(import("@/integrations/supabase/client")).rejects.toThrow(/backend real/);
  });
});
