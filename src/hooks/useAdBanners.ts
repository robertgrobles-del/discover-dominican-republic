import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AdBanner {
  id: string;
  name: string;
  slug: string | null;
  image_url: string | null;
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
}

/**
 * Fetch all active banners, cached globally.
 */
export function useAdBanners() {
  return useQuery({
    queryKey: ["ad-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_banners")
        .select("*")
        .eq("is_active", true)
        .order("priority", { ascending: false });
      if (error) throw error;
      return (data || []) as AdBanner[];
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
}

/**
 * Get a banner by section and optionally by banner_type/placement.
 * Falls back to "global" section banners if no specific match.
 */
export function useBanner(options: {
  section?: string;
  bannerType?: string;
  placement?: string;
}) {
  const { data: allBanners } = useAdBanners();

  if (!allBanners) return null;

  const now = new Date();

  const isValid = (b: AdBanner) => {
    if (b.start_date && new Date(b.start_date) > now) return false;
    if (b.end_date && new Date(b.end_date) < now) return false;
    return true;
  };

  // Try exact match first
  let match = allBanners.find(
    (b) =>
      isValid(b) &&
      (!options.section || b.section === options.section) &&
      (!options.bannerType || b.banner_type === options.bannerType) &&
      (!options.placement || b.placement === options.placement)
  );

  // Fallback to global section
  if (!match && options.section && options.section !== "global") {
    match = allBanners.find(
      (b) =>
        isValid(b) &&
        b.section === "global" &&
        (!options.bannerType || b.banner_type === options.bannerType) &&
        (!options.placement || b.placement === options.placement)
    );
  }

  return match || null;
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
  
  return allBanners
    .filter((b) => {
      if (b.start_date && new Date(b.start_date) > now) return false;
      if (b.end_date && new Date(b.end_date) < now) return false;
      if (options.section && b.section !== options.section && b.section !== "global") return false;
      if (options.placement && b.placement !== options.placement) return false;
      return true;
    })
    .slice(0, options.limit || 10);
}
