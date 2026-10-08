/**
 * Standardized UTM Attribution & Campaign Tracking Utilities
 * Automatically captures, stores, and attaches UTM parameters to leads, conversions, and outbound partner links.
 */

export interface UtmParameters {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  ref?: string;
  gclid?: string;
  fbclid?: string;
  captured_at?: string;
}

const UTM_STORAGE_KEY = "descubrerd_attribution_utm";

/**
 * Captures UTM parameters from the current window URL and persists them in sessionStorage.
 */
export function captureAndStoreUtmParams(): UtmParameters {
  if (typeof window === "undefined") return {};

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const captured: UtmParameters = {};

    const keys: (keyof UtmParameters)[] = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "ref",
      "gclid",
      "fbclid",
    ];

    let hasAnyUtm = false;
    for (const key of keys) {
      const val = urlParams.get(key);
      if (val) {
        captured[key] = val;
        hasAnyUtm = true;
      }
    }

    if (hasAnyUtm) {
      captured.captured_at = new Date().toISOString();
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(captured));
      return captured;
    }

    // Return previously stored parameters if present
    const existing = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (existing) {
      return JSON.parse(existing) as UtmParameters;
    }
  } catch (err) {
    console.warn("Failed to capture UTM parameters:", err);
  }

  return {};
}

/**
 * Retrieves the currently active UTM attribution parameters from session storage.
 */
export function getStoredUtmParams(): UtmParameters {
  if (typeof window === "undefined") return {};
  try {
    const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as UtmParameters) : {};
  } catch {
    return {};
  }
}

/**
 * Appends active UTM parameters to any outgoing URL or WhatsApp message link.
 */
export function appendUtmToUrl(targetUrl: string, overrides?: Partial<UtmParameters>): string {
  try {
    const utm = { ...getStoredUtmParams(), ...overrides };
    if (Object.keys(utm).length === 0) return targetUrl;

    const url = new URL(targetUrl, window.location.origin);
    Object.entries(utm).forEach(([k, v]) => {
      if (v && k !== "captured_at" && !url.searchParams.has(k)) {
        url.searchParams.set(k, v);
      }
    });
    return url.toString();
  } catch {
    return targetUrl;
  }
}
