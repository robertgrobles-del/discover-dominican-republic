import type { Locale } from "@/i18n/types";

const SUPPORTED: readonly string[] = ["es", "en", "fr", "de", "pt", "it"];
const supported = (value: string | null | undefined): Locale | null => (value && SUPPORTED.includes(value) ? (value as Locale) : null);

/**
 * Idioma con el que arranca el sitio: el del enlace (`?lang=en`), el guardado en el navegador o el del navegador,
 * en ese orden. Lo comparten el proveedor de idioma y la carga del catálogo, que debe pedirse en el mismo idioma.
 */
export function detectLocale(): Locale {
  try {
    const fromUrl = supported(new URLSearchParams(window.location.search).get("lang"));
    if (fromUrl) return fromUrl;
  } catch { /* Sin acceso a la URL: se sigue con las demás fuentes. */ }
  try {
    const saved = supported(localStorage.getItem("app-locale"));
    if (saved) return saved;
  } catch { /* Storage may be blocked by browser policy. */ }
  try {
    const fromBrowser = supported(navigator.language?.slice(0, 2));
    if (fromBrowser) return fromBrowser;
  } catch { /* Sin navegador (pruebas): español. */ }
  return "es";
}
