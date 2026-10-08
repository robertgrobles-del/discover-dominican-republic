/**
 * UTM Builder and Attribution Utilities for Descubre RD Ad System
 * Automatically appends and standardizes marketing attribution parameters
 * (utm_source, utm_medium, utm_campaign, utm_content, utm_term)
 * to any destination URL for external analytics tracking (Google Analytics 4, CRM, etc.)
 */

export interface UtmParams {
  source?: string;       // Default: "descubrerd"
  medium?: string;       // Default: "banner_ad" or "takeover"
  campaign?: string;     // e.g. "hoteles_punta_cana" or "capcana_luxury_2026"
  content?: string;      // e.g. "billboard_970x250" or "leaderboard_728x90"
  term?: string;         // e.g. "resorts_all_inclusive"
  sponsor?: string;      // e.g. "sanctuary_cap_cana"
}

/**
 * Builds or enriches a URL with standardized UTM parameters
 */
export function buildUtmUrl(rawUrl: string, params: UtmParams = {}): string {
  if (!rawUrl || typeof rawUrl !== "string") return "/";
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed === "#") return "/";

  // If internal route without protocol, decide whether to append UTMs or leave as internal path
  const isExternal = trimmed.startsWith("http://") || trimmed.startsWith("https://");
  
  try {
    // If it's a domain without protocol like "hotel.com", normalize first
    const urlString = isExternal 
      ? trimmed 
      : trimmed.startsWith("/") 
      ? `https://descubrerd.do${trimmed}` 
      : `https://${trimmed}`;

    const url = new URL(urlString);

    const source = params.source || "descubrerd";
    const medium = params.medium || "banner_ad";
    
    // Only set default if not already present in rawUrl
    if (!url.searchParams.has("utm_source")) url.searchParams.set("utm_source", source);
    if (!url.searchParams.has("utm_medium")) url.searchParams.set("utm_medium", medium);
    
    if (params.campaign && !url.searchParams.has("utm_campaign")) {
      url.searchParams.set("utm_campaign", slugifyParam(params.campaign));
    }
    if (params.content && !url.searchParams.has("utm_content")) {
      url.searchParams.set("utm_content", slugifyParam(params.content));
    }
    if (params.term && !url.searchParams.has("utm_term")) {
      url.searchParams.set("utm_term", slugifyParam(params.term));
    }

    // If it was originally an internal route, return pathname + search
    if (!isExternal && trimmed.startsWith("/")) {
      return `${url.pathname}${url.search}`;
    }

    return url.href;
  } catch {
    return trimmed;
  }
}

function slugifyParam(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 80);
}
