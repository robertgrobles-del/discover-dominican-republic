import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchApi } from "@/lib/fastifyClient";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { useEffect, useState, useMemo } from "react";

export interface AdBanner {
  id: string;
  name: string;
  slug: string | null;
  image_url: string | null;
  /** Skyscrapers en pareja: imagen del lado derecho; si falta, los dos lados llevan image_url. */
  image_url_right?: string | null;
  /** Diapositivas de carrusel (hero-slide): datos de portada que un banner normal no tiene. */
  slide_details?: { tag?: string; location?: string; season?: string; rating?: number; badge?: string; stats?: { value: string; label: string }[] } | null;
  alt_text: string | null;
  target_url: string | null;
  headline: string | null;
  subtext: string | null;
  cta_text: string | null;
  sponsor: string | null;
  banner_type: string;
  placement: string;
  section: string | null;
  page: string | null;
  start_date: string | null;
  end_date: string | null;
  impressions: number | null;
  clicks: number | null;
  priority: number | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  content_type: string;
  video_url: string | null;
  video_autoplay: boolean | null;
  video_loop: boolean | null;
  video_muted: boolean | null;
  animation_type: string | null;
  animation_config: Record<string, unknown> | null;
  slider_items: Record<string, unknown>[] | null;
  slider_interval: number | null;
  is_fixed?: boolean;
  rotation_mode?: "fixed" | "rotative";
  sponsorship_scope?: "slot" | "section" | "global";
  is_takeover?: boolean;
}

/**
 * Fetch all active banners, cached globally.
 */
export function useAdBanners() {
  return useQuery({
    queryKey: ["ad-banners"],
    queryFn: async () => {
      // Con backend real el catálogo sale del servidor de anuncios (sólo lo publicado, vigente y con cliente).
      if (HAS_BACKEND_SESSION) {
        try { return (await fetchApi<{ data: AdBanner[] }>("/ads/catalog")).data ?? []; } catch { return [] as AdBanner[]; }
      }
      const { data, error } = await supabase
        .from("ad_banners")
        .select("*")
        .eq("is_active", true)
        .order("priority", { ascending: false });
      if (error) {
        console.warn("Could not load ad_banners from Supabase, using mock cache", error);
        return [] as AdBanner[];
      }
      return (data || []) as AdBanner[];
    },
    staleTime: 2 * 60 * 1000, // 2 min cache
  });
}

// In-memory click deduplication cache (prevents duplicate clicks within 5 seconds)
const recentClicks = new Map<string, number>();

/**
 * Track an impression for a banner ID in DB (increment impressions count)
 */
export async function trackBannerImpression(bannerId: string) {
  if (!bannerId || bannerId === "preview-id" || bannerId.startsWith("demo-")) return;
  if (HAS_BACKEND_SESSION) {
    // El servidor deduplica por sesión, banner y hora.
    void fetchApi(`/ads/${bannerId}/impression`, { method: "POST", keepalive: true, body: JSON.stringify({ session_id: adSessionId() }) }).catch(() => undefined);
    return;
  }
  try {
    // Record impression in Supabase / Local DB
    const { data: current } = await supabase
      .from("ad_banners")
      .select("impressions")
      .eq("id", bannerId)
      .maybeSingle();

    if (current) {
      await supabase
        .from("ad_banners")
        .update({ impressions: (current.impressions || 0) + 1 })
        .eq("id", bannerId);
    }
  } catch (e) {
    console.debug("Track impression fallback:", e);
  }
}

// Cache for viewable impressions to avoid counting multiple times per session
const viewableImpressionSet = new Set<string>();

/**
 * Track a viewable impression (IAB standard: >= 50% in viewport for >= 1s)
 */
export async function trackBannerViewableImpression(bannerId: string) {
  if (!bannerId || bannerId === "preview-id" || bannerId.startsWith("demo-")) return;
  if (viewableImpressionSet.has(bannerId)) return;
  viewableImpressionSet.add(bannerId);

  try {
    const { data: current } = await supabase
      .from("ad_banners")
      .select("impressions, viewable_impressions")
      .eq("id", bannerId)
      .maybeSingle();

    if (current) {
      await supabase
        .from("ad_banners")
        .update({ 
          viewable_impressions: ((current as unknown as { viewable_impressions?: number })?.viewable_impressions || 0) + 1 
        })
        .eq("id", bannerId);
    }
  } catch (e) {
    console.debug("Track viewable impression fallback:", e);
  }
}

/**
 * Track an engagement (CPE) for rich interactive banners (slider next, video play, expand)
 */
export async function trackBannerEngagement(bannerId: string, action = "interact") {
  if (!bannerId || bannerId === "preview-id" || bannerId.startsWith("demo-")) return;
  try {
    const { data: current } = await supabase
      .from("ad_banners")
      .select("engagements")
      .eq("id", bannerId)
      .maybeSingle();

    if (current) {
      await supabase
        .from("ad_banners")
        .update({ 
          engagements: ((current as unknown as { engagements?: number })?.engagements || 0) + 1 
        })
        .eq("id", bannerId);
    }
  } catch (e) {
    console.debug("Track engagement fallback:", e, action);
  }
}

/**
 * Track a click for a banner ID with anti-duplication protection
 */
export async function trackBannerClick(bannerId: string) {
  if (!bannerId || bannerId === "preview-id" || bannerId.startsWith("demo-")) return;
  
  // Anti-duplication check: ignore multiple clicks on same banner within 5 seconds
  const now = Date.now();
  const lastClick = recentClicks.get(bannerId) || 0;
  if (now - lastClick < 5000) {
    return;
  }
  recentClicks.set(bannerId, now);

  if (HAS_BACKEND_SESSION) {
    // El servidor cuenta el clic antes de redirigir; no se sigue la redirección (el enlace ya navega al destino).
    void fetchApi(`/ads/${bannerId}/click?s=${encodeURIComponent(adSessionId())}`, { redirect: "manual", keepalive: true }).catch(() => undefined);
    return;
  }

  try {
    const { data: current } = await supabase
      .from("ad_banners")
      .select("clicks")
      .eq("id", bannerId)
      .maybeSingle();

    if (current) {
      await supabase
        .from("ad_banners")
        .update({ clicks: (current.clicks || 0) + 1 })
        .eq("id", bannerId);
    }
  } catch (e) {
    console.debug("Track click fallback:", e);
  }
}

/**
 * Get a banner by section and placement, supporting FIXED or ROTATIVE mode.
 * - Banners fijos: se muestran el 100% de las veces sin límite.
 * - Banners rotativos: rotan dinámicamente con control de frecuencia por sesión.
 */
export function useBanner(options: {
  section?: string;
  bannerType?: string;
  placement?: string;
  rotationInterval?: number; // optional auto-rotate interval in ms
}) {
  const { data: allBanners } = useAdBanners();
  const [rotatedIndex, setRotatedIndex] = useState(0);

  const now = new Date();

  const isValid = (b: AdBanner) => {
    if (b.start_date && new Date(b.start_date) > now) return false;
    if (b.end_date && new Date(b.end_date) < now) return false;
    return true;
  };

  const matchingBanners = useMemo(() => {
    if (!allBanners || allBanners.length === 0) return [];

    // Section alias normalization helper (e.g. hoteles <-> alojamientos, home <-> index/inicio)
    const matchesSection = (bannerSection: string | null | undefined, targetSection?: string) => {
      if (!bannerSection) return false;
      if (bannerSection === "global") return true;
      if (!targetSection) return true;
      if (bannerSection.toLowerCase() === targetSection.toLowerCase()) return true;
      // Aliases
      if ((targetSection === "hoteles" || targetSection === "alojamientos") && 
          (bannerSection === "hoteles" || bannerSection === "alojamientos")) {
        return true;
      }
      if ((targetSection === "home" || targetSection === "inicio" || targetSection === "index") && 
          (bannerSection === "home" || bannerSection === "inicio" || bannerSection === "index")) {
        return true;
      }
      return false;
    };

    // 1. NIVEL MÁXIMO: Global Takeover (Patrocinio exclusivo de TODO el portal)
    // Si una marca patrocina todo el portal, todos los banners muestran su publicidad
    const globalTakeovers = allBanners.filter(
      (b) =>
        isValid(b) &&
        (b.sponsorship_scope === "global" || (b.is_takeover && b.section === "global")) &&
        (!options.bannerType || b.banner_type === options.bannerType)
    );
    if (globalTakeovers.length > 0) {
      return globalTakeovers;
    }

    // 2. SEGUNDO NIVEL: Section Takeover (Patrocinio exclusivo de una sección completa, ej. Hoteles)
    // Todos los banners de la sección seleccionada pertenecen al patrocinador exclusivo
    if (options.section) {
      const sectionTakeovers = allBanners.filter(
        (b) =>
          isValid(b) &&
          (b.sponsorship_scope === "section" || b.is_takeover) &&
          matchesSection(b.section, options.section) &&
          (!options.bannerType || b.banner_type === options.bannerType)
      );
      if (sectionTakeovers.length > 0) {
        return sectionTakeovers;
      }
    }

    // 3. TERCER NIVEL: Banners estándar por sección y placement
    let matches = allBanners.filter(
      (b) =>
        isValid(b) &&
        matchesSection(b.section, options.section) &&
        (!options.bannerType || b.banner_type === options.bannerType) &&
        (!options.placement || b.placement === options.placement)
    );

    // If matches contain fixed banners with highest priority, prioritize fixed (100% visibility)
    const fixedBanner = matches.find((b) => b.is_fixed === true || b.rotation_mode === "fixed" || (b.priority && b.priority >= 100));
    if (fixedBanner) {
      return [fixedBanner];
    }

    // Frequency capping for rotative pool: filter out banners that have exceeded 10 rotative impressions in session
    if (typeof window !== "undefined" && window.sessionStorage) {
      matches = matches.filter((b) => {
        if (b.is_fixed || b.rotation_mode === "fixed") return true;
        const count = parseInt(sessionStorage.getItem(`ad_rot_views_${b.id}`) || "0", 10);
        return count < 10;
      });
    }

    return matches;
  }, [allBanners, options.section, options.bannerType, options.placement]);

  // Handle client-side interval rotation if multiple rotative banners exist
  useEffect(() => {
    if (matchingBanners.length <= 1 || !options.rotationInterval) return;

    const interval = setInterval(() => {
      setRotatedIndex((prev) => (prev + 1) % matchingBanners.length);
    }, options.rotationInterval);

    return () => clearInterval(interval);
  }, [matchingBanners, options.rotationInterval]);

  // Pick banner
  const selectedBanner = useMemo(() => {
    if (matchingBanners.length === 0) return null;
    if (matchingBanners.length === 1) return matchingBanners[0];
    
    const banner = matchingBanners[rotatedIndex % matchingBanners.length] || matchingBanners[0];
    if (banner && !banner.is_fixed && banner.rotation_mode !== "fixed" && typeof window !== "undefined" && window.sessionStorage) {
      try {
        const cur = parseInt(sessionStorage.getItem(`ad_rot_views_${banner.id}`) || "0", 10);
        sessionStorage.setItem(`ad_rot_views_${banner.id}`, (cur + 1).toString());
      } catch {
        // Storage unavailable
      }
    }
    return banner;
  }, [matchingBanners, rotatedIndex]);

  return selectedBanner;
}

/**
 * Get multiple banners for a section.
 */
export function useBanners(options: {
  section?: string;
  placement?: string;
  limit?: number;
}) {
  const { data: allBanners } = useAdBanners();

  if (!allBanners) return [];

  const now = new Date();

  const isValid = (b: AdBanner) => {
    if (b.start_date && new Date(b.start_date) > now) return false;
    if (b.end_date && new Date(b.end_date) < now) return false;
    return true;
  };

  const matchesSection = (bannerSection: string | null | undefined, targetSection?: string) => {
    if (!bannerSection) return false;
    if (bannerSection === "global") return true;
    if (!targetSection) return true;
    if (bannerSection.toLowerCase() === targetSection.toLowerCase()) return true;
    if ((targetSection === "hoteles" || targetSection === "alojamientos") && 
        (bannerSection === "hoteles" || bannerSection === "alojamientos")) {
      return true;
    }
    if ((targetSection === "home" || targetSection === "inicio" || targetSection === "index") && 
        (bannerSection === "home" || bannerSection === "inicio" || bannerSection === "index")) {
      return true;
    }
    return false;
  };

  // 1. Check Global Takeover
  const globalTakeovers = allBanners.filter(
    (b) => isValid(b) && (b.sponsorship_scope === "global" || (b.is_takeover && b.section === "global"))
  );
  if (globalTakeovers.length > 0) {
    return globalTakeovers.slice(0, options.limit || 10);
  }

  // 2. Check Section Takeover
  if (options.section) {
    const sectionTakeovers = allBanners.filter(
      (b) => isValid(b) && (b.sponsorship_scope === "section" || b.is_takeover) && matchesSection(b.section, options.section)
    );
    if (sectionTakeovers.length > 0) {
      return sectionTakeovers.slice(0, options.limit || 10);
    }
  }

  // 3. Regular banners
  return allBanners
    .filter((b) => {
      if (!isValid(b)) return false;
      if (options.section && !matchesSection(b.section, options.section)) return false;
      if (options.placement && b.placement !== options.placement) return false;
      return true;
    })
    .slice(0, options.limit || 10);
}


/**
 * Espacio publicitario propio (tarjeta nativa, diapositiva, menú…): el anuncio vigente del admin para ese hueco, con la
 * impresión contada al mostrarse y `trackClick` para el enlace. Sin anuncio vigente el componente muestra su respaldo.
 */
export function useTrackedBanner(options: { section?: string; bannerType: string; placement: string }) {
  const banner = useBanner(options);
  useEffect(() => { if (banner) void trackBannerImpression(banner.id); }, [banner?.id]);
  return { banner, trackClick: () => { if (banner) void trackBannerClick(banner.id); } };
}

/** Todos los anuncios vigentes de un tipo para una sección (o `global`), p. ej. las diapositivas patrocinadas de un carrusel. */
export function useAdBannerList(bannerType: string, section: string) {
  const { data } = useAdBanners();
  return useMemo(() => {
    const now = new Date();
    return (data ?? []).filter((b) =>
      b.banner_type === bannerType && !!b.section && ["global", section.toLowerCase()].includes(b.section.toLowerCase()) &&
      (!b.start_date || new Date(b.start_date) <= now) && (!b.end_date || new Date(b.end_date) >= now));
  }, [data, bannerType, section]);
}

/** Id anónimo de la pestaña para deduplicar métricas de anuncios (no identifica a la persona). */
function adSessionId() {
  try {
    let id = sessionStorage.getItem("ad_session_id");
    if (!id) { id = crypto.randomUUID(); sessionStorage.setItem("ad_session_id", id); }
    return id;
  } catch { return "anon-session-0000"; }
}
