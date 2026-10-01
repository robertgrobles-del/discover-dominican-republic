import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearRecentlyViewed, isDetailPath, listRecentlyViewed, recordRecentlyViewed } from "@/lib/recentlyViewed";

describe("historial de fichas vistas (mejora 98)", () => {
  beforeEach(() => { localStorage.clear(); });

  it("sólo guarda fichas de detalle, sin repetir y con la más reciente primero", () => {
    expect(isDetailPath("/playa/bavaro")).toBe(true);
    expect(isDetailPath("/playas")).toBe(false);
    expect(isDetailPath("/admin/usuarios")).toBe(false);

    recordRecentlyViewed("/playa/bavaro", "Playa Bávaro | Descubre República Dominicana", 1);
    recordRecentlyViewed("/destino/samana", "Samaná", 2);
    recordRecentlyViewed("/playas", "Playas", 3);
    recordRecentlyViewed("/playa/bavaro", "Playa Bávaro", 4);

    expect(listRecentlyViewed().map((i) => [i.path, i.title])).toEqual([["/playa/bavaro", "Playa Bávaro"], ["/destino/samana", "Samaná"]]);
  });

  it("conserva como máximo 12 y tolera un almacenamiento corrupto", () => {
    for (let i = 0; i < 20; i++) recordRecentlyViewed(`/playa/p${i}`, `Playa ${i}`, i);
    expect(listRecentlyViewed()).toHaveLength(12);
    expect(listRecentlyViewed()[0]!.path).toBe("/playa/p19");

    localStorage.setItem("dr:recently-viewed", "{no es json");
    expect(listRecentlyViewed()).toEqual([]);
    clearRecentlyViewed();
    expect(localStorage.getItem("dr:recently-viewed")).toBeNull();
  });
});

describe("precarga de rutas (mejoras 95 y 128)", () => {
  beforeEach(() => { vi.resetModules(); document.body.innerHTML = ""; });

  it("precarga una ruta principal una sola vez y ignora las desconocidas", async () => {
    const { prefetchRoute } = await import("@/lib/routePrefetch");
    expect(prefetchRoute("/ruta-que-no-existe")).toBe(false);
    expect(prefetchRoute("/blog")).toBe(true);
    expect(prefetchRoute("/blog")).toBe(false);
  });

  it("no adelanta descargas con ahorro de datos", async () => {
    vi.stubGlobal("navigator", { ...navigator, connection: { saveData: true } });
    const { prefetchRoute } = await import("@/lib/routePrefetch");
    expect(prefetchRoute("/blog")).toBe(false);
    vi.unstubAllGlobals();
  });

  it("reacciona al pasar el cursor sobre un enlace interno y deja de hacerlo al retirar las escuchas", async () => {
    const mod = await import("@/lib/routePrefetch");
    const spy = vi.spyOn(mod, "prefetchRoute");
    document.body.innerHTML = '<a id="in" href="/galeria/"><span id="child">Galería</span></a><a id="out" href="https://otro.sitio/blog">x</a>';
    const dispose = mod.installRoutePrefetch();
    document.getElementById("out")!.dispatchEvent(new Event("mouseover", { bubbles: true }));
    document.getElementById("child")!.dispatchEvent(new Event("mouseover", { bubbles: true }));
    // La segunda intención sobre la misma ruta ya no dispara otra descarga.
    expect(mod.prefetchRoute("/galeria")).toBe(false);
    dispose();
    spy.mockRestore();
  });
});
