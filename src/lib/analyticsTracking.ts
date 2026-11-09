import { isAnalyticsAllowed } from "@/lib/privacy-consent";
import { ANALYTICS_EVENT, AnalyticsEventDetail } from "@/lib/marketingPixels";

/**
 * Módulo de integración para Google Analytics (GA4), Google Tag Manager (GTM)
 * y Microsoft Clarity.
 *
 * Principios de Privacidad y Cumplimiento:
 * 1. Cero carga de scripts de terceros sin consentimiento previo (GDPR / GPC / Do Not Track).
 * 2. Si el usuario revoca el consentimiento, se desactiva el rastreo de inmediato.
 * 3. En GA4/GTM se envía anonymize_ip por defecto y no se transmiten datos PII.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

export interface AnalyticsIds {
  gaMeasurementId?: string;
  gtmId?: string;
  clarityProjectId?: string;
}

export function readAnalyticsIds(env: {
  VITE_GA_MEASUREMENT_ID?: string;
  VITE_GTM_ID?: string;
  VITE_CLARITY_PROJECT_ID?: string;
} = import.meta.env): AnalyticsIds {
  const ga = env.VITE_GA_MEASUREMENT_ID?.trim();
  const gtm = env.VITE_GTM_ID?.trim();
  const clarity = env.VITE_CLARITY_PROJECT_ID?.trim();

  return {
    gaMeasurementId: ga && /^G-[A-Z0-9]+$/i.test(ga) ? ga : undefined,
    gtmId: gtm && /^GTM-[A-Z0-9]+$/i.test(gtm) ? gtm : undefined,
    clarityProjectId: clarity && /^[a-z0-9]{8,15}$/i.test(clarity) ? clarity : undefined,
  };
}

function loadScript(src: string, id?: string): void {
  if (id && document.getElementById(id)) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  if (id) script.id = id;
  document.head.appendChild(script);
}

function loadGA(gaId: string): void {
  if (window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  }
  window.gtag = gtag;

  loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`, "ga4-script");
  gtag("js", new Date());
  gtag("config", gaId, {
    anonymize_ip: true,
    send_page_view: false, // Controlado manualmente por navegación SPA
  });
}

function loadGTM(gtmId: string): void {
  if (document.getElementById("gtm-script")) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  loadScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`, "gtm-script");
}

function loadClarity(projectId: string): void {
  if (window.clarity) return;
  (function (c: unknown, l: unknown, a: string, r: string, i: string, t?: unknown, y?: unknown) {
    (c as Record<string, unknown>)[a] = (c as Record<string, unknown>)[a] || function (...args: unknown[]) {
      (((c as Record<string, unknown>)[a] as Record<string, unknown[]>).q = ((c as Record<string, unknown>)[a] as Record<string, unknown[]>).q || []).push(args);
    };
    const s = (l as Document).createElement(r) as HTMLScriptElement;
    s.async = true;
    s.src = "https://www.clarity.ms/tag/" + i;
    const first = (l as Document).getElementsByTagName(r)[0];
    first?.parentNode?.insertBefore(s, first);
  })(window, document, "clarity", "script", projectId);
}

let started = false;
let active = false;

function sync(ids: AnalyticsIds): void {
  const allowed = isAnalyticsAllowed();

  if (allowed && !active) {
    if (ids.gaMeasurementId) loadGA(ids.gaMeasurementId);
    if (ids.gtmId) loadGTM(ids.gtmId);
    if (ids.clarityProjectId) loadClarity(ids.clarityProjectId);
    active = true;

    // Track initial pageview
    if (ids.gaMeasurementId && window.gtag) {
      window.gtag("event", "page_view", {
        page_path: window.location.pathname,
        page_title: document.title,
      });
    }
  } else if (!allowed && active) {
    // Si retira consentimiento, desactivamos el envío
    active = false;
  }
}

export function initAnalyticsTracking(env = import.meta.env): AnalyticsIds {
  const ids = readAnalyticsIds(env);
  if (started || typeof window === "undefined" || (!ids.gaMeasurementId && !ids.gtmId && !ids.clarityProjectId)) {
    return ids;
  }

  started = true;
  window.addEventListener("dr:privacy-consent-change", () => sync(ids));
  window.addEventListener(ANALYTICS_EVENT, (e) => {
    if (!active || !isAnalyticsAllowed()) return;
    const detail = (e as CustomEvent<AnalyticsEventDetail>).detail;
    if (window.gtag && ids.gaMeasurementId) {
      window.gtag("event", detail.type, detail.props);
    }
    if (window.dataLayer && ids.gtmId) {
      window.dataLayer.push({ event: detail.type, ...detail.props });
    }
    if (window.clarity && ids.clarityProjectId && detail.type === "page_view") {
      window.clarity("set", "page", window.location.pathname);
    }
  });

  sync(ids);
  return ids;
}
