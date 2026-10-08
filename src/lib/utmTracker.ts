/**
 * Sistema de Rastreo de Parámetros UTM & Atribución de Campañas
 * Captura automáticamente parámetros de marketing (Instagram, TikTok, Google Ads, Referidos)
 * y los preserva en la sesión para asociarlos a cotizaciones, reservas y registros.
 */

export interface AttributionData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  ref_code?: string;
  referrer?: string;
  landing_page?: string;
  first_touch_at?: string;
}

const UTM_STORAGE_KEY = "descubrerd_attribution";

/**
 * Inicializa el capturador de parámetros UTM desde la URL actual
 */
export function initUtmTracker(): AttributionData | null {
  if (typeof window === "undefined") return null;

  try {
    const params = new URLSearchParams(window.location.search);
    const source = params.get("utm_source");
    const medium = params.get("utm_medium");
    const campaign = params.get("utm_campaign");
    const content = params.get("utm_content");
    const term = params.get("utm_term");
    const ref = params.get("ref") || params.get("ref_code");

    // Si viene con parámetros de campaña o referido, guardamos el primer toque
    if (source || medium || campaign || content || term || ref) {
      const attribution: AttributionData = {
        utm_source: source || undefined,
        utm_medium: medium || undefined,
        utm_campaign: campaign || undefined,
        utm_content: content || undefined,
        utm_term: term || undefined,
        ref_code: ref || undefined,
        referrer: document.referrer || undefined,
        landing_page: window.location.pathname,
        first_touch_at: new Date().toISOString(),
      };

      // Guardar en sessionStorage para la sesión actual y en localStorage como respaldo
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(attribution));
      if (!localStorage.getItem(UTM_STORAGE_KEY)) {
        localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(attribution));
      }

      return attribution;
    }

    // Si no hay parámetros nuevos, recuperamos el atribución previa de la sesión
    const saved = sessionStorage.getItem(UTM_STORAGE_KEY) || localStorage.getItem(UTM_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as AttributionData;
    }
  } catch (e) {
    console.debug("Error initializing UTM tracker:", e);
  }

  return null;
}

/**
 * Obtiene los datos de atribución activos para adjuntar a formularios y conversiones
 */
export function getAttributionData(): AttributionData {
  if (typeof window === "undefined") return {};
  try {
    const saved = sessionStorage.getItem(UTM_STORAGE_KEY) || localStorage.getItem(UTM_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as AttributionData;
    }
  } catch {
    // Fallback silencioso
  }
  return {};
}
