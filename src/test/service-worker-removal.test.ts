import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

// Se construye por partes para que este mismo archivo no coincida con la búsqueda.
const REGISTER_CALL = new RegExp(["serviceWorker", "\\??\\.register\\s*\\("].join(""));

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

function listFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(full);
    return [full];
  });
}

function read(file: string): string {
  return readFileSync(file, "utf8");
}

describe("retirada del service worker", () => {
  // El barrido recorre todo `src/` en disco; en carpetas sincronizadas (OneDrive) un pico de E/S puede
  // superar un timeout corto y hacer fallar la prueba por el entorno, no por una regresión real.
  it("ninguna fuente, la página ni public/ registran un service worker", { timeout: 60000 }, () => {
    const candidates = [
      ...listFiles(path.join(ROOT, "src")).filter((f) => SOURCE_EXTENSIONS.has(path.extname(f))),
      path.join(ROOT, "index.html"),
      ...listFiles(path.join(ROOT, "public")),
    ];

    const offenders = candidates.filter((file) => REGISTER_CALL.test(read(file)));

    expect(offenders).toEqual([]);
  });

  it("public/ no contiene un archivo de service worker ni de workbox", () => {
    const offenders = listFiles(path.join(ROOT, "public")).filter((file) =>
      /^(sw|service-worker|workbox)/i.test(path.basename(file)),
    );

    expect(offenders).toEqual([]);
  });

  it("index.html desregistra el service worker y borra sus cachés una sola vez", () => {
    const html = read(path.join(ROOT, "index.html"));

    expect(html).toContain("navigator.serviceWorker.getRegistrations()");
    expect(html).toContain("unregister()");
    expect(html).toContain("caches.keys()");
    expect(html).toContain("dr-sw-cleanup-v1");
    expect(html).toContain("sessionStorage.setItem(reloadKey");
    expect(html).toContain("location.reload()");
  });

  it("vite-plugin-pwa no vuelve al proyecto", () => {
    const pkg = read(path.join(ROOT, "package.json"));
    const viteConfig = read(path.join(ROOT, "vite.config.ts"));

    expect(pkg).not.toContain("vite-plugin-pwa");
    expect(viteConfig).not.toContain("vite-plugin-pwa");
    expect(viteConfig).not.toContain("VitePWA");
  });
});
