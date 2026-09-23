import { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Storage keys for ethical and compliant 1st-party attribution
const STORAGE_KEYS = {
  SESSION_ID: "dr_session_id",
  ANON_VISITOR_ID: "dr_visitor_id",
  UTM_PARAMS: "dr_utm_attribution",
  INTERESTS_PROFILE: "dr_traveler_profile",
  CONSENT_STATE: "dr_privacy_consent"
};

export interface UTMData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  landing_page?: string;
  timestamp: string;
}

export interface TravelerInterests {
  categories: Record<string, number>; // e.g. { "alojamientos": 5, "gastronomia": 3 }
  destinations: Record<string, number>; // e.g. { "punta-cana": 4, "samana": 2 }
  lastVisitedCategory?: string;
  lastVisitedDestination?: string;
  totalPageViews: number;
}

// 1. Session & Anonymous Persistent ID Setup (1st Party, ethical)
let sessionId = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID);
if (!sessionId) {
  sessionId = crypto.randomUUID();
  sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
}

let anonymousVisitorId = localStorage.getItem(STORAGE_KEYS.ANON_VISITOR_ID);
if (!anonymousVisitorId) {
  anonymousVisitorId = "anon_" + crypto.randomUUID();
  localStorage.setItem(STORAGE_KEYS.ANON_VISITOR_ID, anonymousVisitorId);
}

// 2. Parse and Capture Inbound UTM & Campaign Attribution
export function captureInboundAttribution(): UTMData {
  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get("utm_source");
  const utmMedium = urlParams.get("utm_medium");
  const utmCampaign = urlParams.get("utm_campaign");
  const utmTerm = urlParams.get("utm_term");
  const utmContent = urlParams.get("utm_content");

  const existingRaw = sessionStorage.getItem(STORAGE_KEYS.UTM_PARAMS);
  const existing: UTMData | null = existingRaw ? JSON.parse(existingRaw) : null;

  if (utmSource || utmCampaign || !existing) {
    const utmData: UTMData = {
      utm_source: utmSource || existing?.utm_source || "direct",
      utm_medium: utmMedium || existing?.utm_medium || (document.referrer ? "referral" : "none"),
      utm_campaign: utmCampaign || existing?.utm_campaign || "organic",
      utm_term: utmTerm || existing?.utm_term || undefined,
      utm_content: utmContent || existing?.utm_content || undefined,
      referrer: document.referrer || existing?.referrer || "direct",
      landing_page: window.location.pathname + window.location.search,
      timestamp: new Date().toISOString()
    };
    sessionStorage.setItem(STORAGE_KEYS.UTM_PARAMS, JSON.stringify(utmData));
    return utmData;
  }

  return existing;
}

// 3. Update 1st-Party Traveler Interest Profile on-device
export function recordTravelerInterest(type: "category" | "destination", key: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INTERESTS_PROFILE);
    const profile: TravelerInterests = raw ? JSON.parse(raw) : {
      categories: {},
      destinations: {},
      totalPageViews: 0
    };

    profile.totalPageViews = (profile.totalPageViews || 0) + 1;

    if (type === "category") {
      profile.categories[key] = (profile.categories[key] || 0) + 1;
      profile.lastVisitedCategory = key;
    } else if (type === "destination") {
      profile.destinations[key] = (profile.destinations[key] || 0) + 1;
      profile.lastVisitedDestination = key;
    }

    localStorage.setItem(STORAGE_KEYS.INTERESTS_PROFILE, JSON.stringify(profile));
  } catch {
    // Fail silently if localStorage is restricted
  }
}

// Get the user's primary top interest for ethical dynamic on-site remarketing
export function getTopTravelerInterest(): { category?: string; destination?: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INTERESTS_PROFILE);
    if (!raw) return {};
    const profile: TravelerInterests = JSON.parse(raw);

    const topCategory = Object.entries(profile.categories || {}).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topDestination = Object.entries(profile.destinations || {}).sort((a, b) => b[1] - a[1])[0]?.[0];

    return { category: topCategory, destination: topDestination };
  } catch {
    return {};
  }
}

// 4. Hook for Automatic Page Tracking with Attribution
export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    const utmData = captureInboundAttribution();
    const path = location.pathname;

    // Detect category/destination from path for interests modeling
    if (path.startsWith("/alojamiento")) {
      recordTravelerInterest("category", "alojamientos");
    } else if (path.startsWith("/restaurante") || path.startsWith("/guia-gastronomica")) {
      recordTravelerInterest("category", "gastronomia");
    } else if (path.startsWith("/actividades") || path.startsWith("/experiencia")) {
      recordTravelerInterest("category", "aventura");
    } else if (path.startsWith("/evento")) {
      recordTravelerInterest("category", "eventos");
    } else if (path.startsWith("/destino")) {
      const parts = path.split("/");
      if (parts[2]) {
        recordTravelerInterest("destination", parts[2]);
      }
    }

    // Dispatch privacy-compliant event to DB
    supabase.from("analytics_events").insert([{
      event_type: "page_view",
      page: location.pathname,
      session_id: sessionId,
      metadata: {
        visitor_id: anonymousVisitorId,
        utm_source: utmData?.utm_source,
        utm_campaign: utmData?.utm_campaign,
        referrer: utmData?.referrer
      } as any,
    }]).then(() => {});
  }, [location.pathname]);
}

// 5. Explicit Event Tracking
export function trackEvent(eventType: string, metadata?: Record<string, unknown>) {
  const utmData = captureInboundAttribution();
  supabase.from("analytics_events").insert([{
    event_type: eventType,
    metadata: {
      visitor_id: anonymousVisitorId,
      utm_source: utmData?.utm_source,
      utm_campaign: utmData?.utm_campaign,
      ...(metadata || {})
    } as any,
    session_id: sessionId,
  }]).then(() => {});
}
