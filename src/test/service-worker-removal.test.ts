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
  // El único registro permitido es el de la PWA (src/lib/pwa.ts → /pwa-sw.js), y ese service worker no puede
  // repetir el fallo del anterior: servir páginas desde la caché y dejar a la gente en una versión vieja para siempre.
  it("solo src/lib/pwa.ts registra un service worker, y es /pwa-sw.js", { timeout: 60000 }, () => {
    const candidates = [
      ...listFiles(path.join(ROOT, "src")).filter((f) => SOURCE_EXTENSIONS.has(path.extname(f))),
      path.join(ROOT, "index.html"),
      ...listFiles(path.join(ROOT, "public")),
    ];

    const offenders = candidates.filter((file) => REGISTER_CALL.test(read(file))).map((f) => path.relative(ROOT, f).split(path.sep).join("/"));

    expect(offenders).toEqual(["src/lib/pwa.ts"]);
    expect(read(path.join(ROOT, "src", "lib", "pwa.ts"))).toContain('"/pwa-sw.js"');
  });

  it("el service worker de la PWA nunca sirve páginas desde la caché ni precarga la app", () => {
    const sw = read(path.join(ROOT, "public", "pwa-sw.js"));
    // Navegación: red primero; la caché solo da /offline.html cuando no hay conexión.
    expect(sw).toMatch(/req\.mode === "navigate"[\s\S]*fetch\(req\)\.catch\(\(\) => caches\.match\("\/offline\.html"\)\)/);
    const precache = sw.match(/const PRECACHE = \[([^\]]*)\]/)?.[1] ?? "";
    expect(precache).not.toMatch(/"\/"|index\.html/);
    expect(sw).toContain('url.pathname.startsWith("/api/")'); // la API nunca pasa por la caché
  });

  it("la limpieza del service worker antiguo respeta el de la PWA", () => {
    expect(read(path.join(ROOT, "public", "legacy-sw-cleanup.js"))).toContain("pwa-sw");
  });

  it("public/ no contiene un archivo de service worker ni de workbox", () => {
    const offenders = listFiles(path.join(ROOT, "public")).filter((file) =>
      /^(sw|service-worker|workbox)/i.test(path.basename(file)),
    );

    expect(offenders).toEqual([]);
  });

  it("index.html desregistra el service worker y borra sus cachés una sola vez", () => {
    expect(read(path.join(ROOT, "index.html"))).toContain('<script src="/legacy-sw-cleanup.js" async></script>');
    const html = read(path.join(ROOT, "public", "legacy-sw-cleanup.js"));

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
