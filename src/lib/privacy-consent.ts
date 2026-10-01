export type AnalyticsConsent = "accepted" | "essential_only" | null;

export const PRIVACY_CONSENT_KEY = "dr_privacy_consent";

const ANALYTICS_LOCAL_KEYS = [
  "dr_visitor_id",
  "dr_utm_attribution",
  "dr_traveler_profile",
];
const ANALYTICS_SESSION_KEYS = ["dr_session_id", "dr_utm_attribution", "dr_analytics_session_id", "session_id"];
export const OPEN_PRIVACY_SETTINGS_EVENT = "dr:open-privacy-settings";

export function getAnalyticsConsent(): AnalyticsConsent {
  try {
    const value = localStorage.getItem(PRIVACY_CONSENT_KEY);
    return value === "accepted" || value === "essential_only" ? value : null;
  } catch {
    return null;
  }
}

export function setAnalyticsConsent(consent: Exclude<AnalyticsConsent, null>) {
  try {
    localStorage.setItem(PRIVACY_CONSENT_KEY, consent);
  } catch {
    // If consent cannot be stored, analytics stays disabled by default.
  }

  if (consent === "essential_only") {
    clearAnalyticsData();
  } else {
    clearLegacyAnalyticsIdentifiers();
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("dr:privacy-consent-change"));
  }
}

/** A browser privacy signal always overrides a stored opt-in. */
export function isAnalyticsAllowed(): boolean {
  if (getAnalyticsConsent() !== "accepted" || typeof navigator === "undefined") return false;
  const privacyNavigator = navigator as Navigator & { globalPrivacyControl?: boolean; doNotTrack?: string };
  return privacyNavigator.globalPrivacyControl !== true && privacyNavigator.doNotTrack !== "1" && privacyNavigator.doNotTrack !== "yes";
}

export function openPrivacySettings() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(OPEN_PRIVACY_SETTINGS_EVENT));
}

export function clearAnalyticsData() {
  clearLegacyAnalyticsIdentifiers();
  try {
    ANALYTICS_SESSION_KEYS.forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // Storage may be disabled by the browser; analytics remains consent-gated.
  }
}

function clearLegacyAnalyticsIdentifiers() {
  try { ANALYTICS_LOCAL_KEYS.forEach((key) => localStorage.removeItem(key)); } catch { /* Browser storage may be blocked. */ }
}
