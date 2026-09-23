import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useMemo } from "react";

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
      if (error) {
        console.warn("Could not load ad_banners from Supabase, using mock cache", error);
        return [] as AdBanner[];
      }
      return (data || []) as AdBanner[];
    },
    staleTime: 2 * 60 * 1000, // 2 min cache
  });
}

/**
 * Track an impression for a banner ID in DB (increment impressions count)
 */
export async function trackBannerImpression(bannerId: string) {
  if (!bannerId || bannerId === "preview-id" || bannerId.startsWith("demo-")) return;
  try {
    // Increment count using rpc or direct update
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
    // Silent fail for offline/sandbox
    console.debug("Track impression fallback:", e);
  }
}

/**
 * Track a click for a banner ID in DB (increment clicks count)
 */
export async function trackBannerClick(bannerId: string) {
  if (!bannerId || bannerId === "preview-id" || bannerId.startsWith("demo-")) return;
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
 * If multiple eligible banners exist, it rotates based on user session or randomized weight.
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

    let matches = allBanners.filter(
      (b) =>
        isValid(b) &&
        (!options.section || b.section === options.section || b.section === "global") &&
        (!options.bannerType || b.banner_type === options.bannerType) &&
        (!options.placement || b.placement === options.placement)
    );

    // If matches contain fixed banners with highest priority, prioritize fixed
    const fixedBanner = matches.find((b) => b.is_fixed === true || (b.priority && b.priority >= 100));
    if (fixedBanner) {
      return [fixedBanner];
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

  // If initial randomized rotation for different users:
  const selectedBanner = useMemo(() => {
    if (matchingBanners.length === 0) return null;
    if (matchingBanners.length === 1) return matchingBanners[0];
    
    // Pick based on rotatedIndex or initial pseudo-random seed
    return matchingBanners[rotatedIndex % matchingBanners.length] || matchingBanners[0];
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

