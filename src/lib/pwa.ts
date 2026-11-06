// Registro del service worker de la PWA (public/pwa-sw.js). Único registro permitido en el proyecto: ver
// src/test/service-worker-removal.test.ts, que exige que ese archivo nunca sirva páginas desde la caché.
export const PWA_SW_URL = "/pwa-sw.js";

export function registerPwa(): void {
  if (!import.meta.env.PROD || typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  // Tras la carga, para no competir con el primer pintado.
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(PWA_SW_URL, { scope: "/" }).catch(() => undefined);
  });
}
