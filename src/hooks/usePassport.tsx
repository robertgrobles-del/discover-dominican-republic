import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface PassportStamp {
  id: string;
  user_id: string;
  destination_id?: string;
  beach_id?: string;
  hotel_id?: string;
  restaurant_id?: string;
  experience_id?: string;
  stamp_type: 'destination' | 'beach' | 'hotel' | 'restaurant' | 'experience' | 'custom';
  stamp_name: string;
  stamp_location?: string;
  stamp_image?: string;
  visited_at: string;
  verification_method?: 'qr_scan' | 'check_in' | 'gps' | 'manual' | 'purchase';
  verification_data?: any;
  xp_earned: number;
  coins_earned: number;
  notes?: string;
  photos?: string[];
  rating?: number;
  is_verified: boolean;
  created_at: string;
}

export interface GamifiedRoute {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  short_description?: string;
  route_type: 'adventure' | 'culture' | 'gastronomy' | 'nature' | 'beach' | 'history' | 'wellness';
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  duration_days?: number;
  distance_km?: number;
  total_xp_reward: number;
  total_coin_reward: number;
  completion_badge_id?: string;
  image_url?: string;
  gallery?: string[];
  min_level: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RouteCheckpoint {
  id: string;
  route_id: string;
  checkpoint_order: number;
  checkpoint_name: string;
  checkpoint_description?: string;
  checkpoint_type: 'destination' | 'activity' | 'photo_spot' | 'challenge' | 'rest_stop';
  destination_id?: string;
  beach_id?: string;
  hotel_id?: string;
  restaurant_id?: string;
  experience_id?: string;
  latitude?: number;
  longitude?: number;
  xp_reward: number;
  coin_reward: number;
  challenge_task?: string;
  photo_required: boolean;
  is_mandatory: boolean;
  created_at: string;
}

export interface UserRouteProgress {
  id: string;
  user_id: string;
  route_id: string;
  started_at: string;
  completed_at?: string;
  current_checkpoint: number;
  checkpoints_completed: number;
  total_checkpoints: number;
  total_xp_earned: number;
  total_coins_earned: number;
  is_completed: boolean;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface DigitalCollectible {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  short_description?: string;
  collectible_type: 'landmark' | 'culture' | 'nature' | 'food' | 'activity' | 'event' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  image_url?: string;
  animated_url?: string;
  thumbnail_url?: string;
  unlock_condition?: string;
  unlock_requirement?: any;
  total_supply?: number;
  current_supply: number;
  xp_value: number;
  coin_value: number;
  is_tradeable: boolean;
  is_active: boolean;
  season?: string;
  event_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UserCollectible {
  id: string;
  user_id: string;
  collectible_id: string;
  acquired_at: string;
  acquisition_method?: 'mission' | 'route' | 'event' | 'purchase' | 'gift' | 'trade';
  is_favorite: boolean;
  display_order?: number;
  created_at: string;
}

export function usePassport() {
  const { user } = useAuth();
  const [stamps, setStamps] = useState<PassportStamp[]>([]);
  const [routes, setRoutes] = useState<GamifiedRoute[]>([]);
  const [userRouteProgress, setUserRouteProgress] = useState<UserRouteProgress[]>([]);
  const [collectibles, setCollectibles] = useState<DigitalCollectible[]>([]);
  const [userCollectibles, setUserCollectibles] = useState<UserCollectible[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's passport stamps
  const fetchStamps = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("passport_stamps")
      .select("*")
      .eq("user_id", user.id)
      .order("visited_at", { ascending: false });
    if (data) setStamps(data as unknown as PassportStamp[]);
  }, [user]);

  // Fetch available routes
  const fetchRoutes = useCallback(async () => {
    const { data } = await supabase
      .from("gamified_routes")
      .select("*")
      .eq("is_active", true)
      .order("is_featured", { ascending: false });
    if (data) setRoutes(data as unknown as GamifiedRoute[]);
  }, []);

  // Fetch user's route progress
  const fetchUserRouteProgress = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_route_progress")
      .select("*")
      .eq("user_id", user.id);
    if (data) setUserRouteProgress(data as unknown as UserRouteProgress[]);
  }, [user]);

  // Fetch available collectibles
  const fetchCollectibles = useCallback(async () => {
    const { data } = await supabase
      .from("digital_collectibles")
      .select("*")
      .eq("is_active", true)
      .order("rarity", { ascending: false });
    if (data) setCollectibles(data as unknown as DigitalCollectible[]);
  }, []);

  // Fetch user's collectibles
  const fetchUserCollectibles = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_collectibles")
      .select("*")
      .eq("user_id", user.id);
    if (data) setUserCollectibles(data as unknown as UserCollectible[]);
  }, [user]);

  // Add a new stamp
  const addStamp = useCallback(async (stamp: Partial<PassportStamp>) => {
    if (!user) return false;

    const { error } = await supabase.from("passport_stamps").insert({
      user_id: user.id,
      ...stamp,
    });

    if (error) {
      toast.error("Error al agregar sello");
      return false;
    }

    toast.success(`✅ Sello agregado: ${stamp.stamp_name}`);
    await fetchStamps();
    return true;
  }, [user, fetchStamps]);

  // Start a route
  const startRoute = useCallback(async (routeId: string) => {
    if (!user) return false;

    // Fetch checkpoints count
    const { count } = await supabase
      .from("route_checkpoints")
      .select("*", { count: "exact", head: true })
      .eq("route_id", routeId);

    const { error } = await supabase.from("user_route_progress").insert({
      user_id: user.id,
      route_id: routeId,
      total_checkpoints: count || 0,
    });

    if (error) {
      toast.error("Error al iniciar la ruta");
      return false;
    }

    toast.success("🗺️ ¡Ruta iniciada!");
    await fetchUserRouteProgress();
    return true;
  }, [user, fetchUserRouteProgress]);

  // Complete a checkpoint
  const completeCheckpoint = useCallback(async (
    routeId: string,
    checkpointId: string,
    data?: { photo_url?: string; notes?: string }
  ) => {
    if (!user) return false;

    // Get checkpoint details
    const { data: checkpoint } = await supabase
      .from("route_checkpoints")
      .select("*")
      .eq("id", checkpointId)
      .single();

    if (!checkpoint) return false;

    // Insert checkpoint completion
    const { error } = await supabase.from("user_checkpoint_completions").insert({
      user_id: user.id,
      route_id: routeId,
      checkpoint_id: checkpointId,
      xp_earned: checkpoint.xp_reward,
      coins_earned: checkpoint.coin_reward,
      photo_url: data?.photo_url,
      notes: data?.notes,
    });

    if (error) {
      toast.error("Error al completar checkpoint");
      return false;
    }

    // Update route progress
    const { data: progress } = await supabase
      .from("user_route_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("route_id", routeId)
      .single();

    if (progress) {
      const newCompleted = progress.checkpoints_completed + 1;
      const percentage = Math.round((newCompleted / progress.total_checkpoints) * 100);
      const isCompleted = newCompleted >= progress.total_checkpoints;

      await supabase
        .from("user_route_progress")
        .update({
          checkpoints_completed: newCompleted,
          current_checkpoint: checkpoint.checkpoint_order + 1,
          completion_percentage: percentage,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          total_xp_earned: progress.total_xp_earned + checkpoint.xp_reward,
          total_coins_earned: progress.total_coins_earned + checkpoint.coin_reward,
        })
        .eq("id", progress.id);

      if (isCompleted) {
        toast.success("🎉 ¡Ruta completada!");
      } else {
        toast.success(`✅ Checkpoint completado (+${checkpoint.xp_reward} XP)`);
      }
    }

    await fetchUserRouteProgress();
    return true;
  }, [user, fetchUserRouteProgress]);

  // Unlock a collectible
  const unlockCollectible = useCallback(async (
    collectibleId: string,
    method: 'mission' | 'route' | 'event' | 'purchase' | 'gift' | 'trade'
  ) => {
    if (!user) return false;

    const { error } = await supabase.from("user_collectibles").insert({
      user_id: user.id,
      collectible_id: collectibleId,
      acquisition_method: method,
    });

    if (error) {
      toast.error("Error al desbloquear coleccionable");
      return false;
    }

    toast.success("🎁 ¡Nuevo coleccionable desbloqueado!");
    await fetchUserCollectibles();
    return true;
  }, [user, fetchUserCollectibles]);

  // Get stamps count by type
  const getStampsByType = useCallback((type: string) => {
    return stamps.filter(s => s.stamp_type === type).length;
  }, [stamps]);

  // Get route progress percentage
  const getRouteProgress = useCallback((routeId: string) => {
    const progress = userRouteProgress.find(p => p.route_id === routeId);
    return progress?.completion_percentage || 0;
  }, [userRouteProgress]);

  // Get collectibles by rarity
  const getCollectiblesByRarity = useCallback((rarity: string) => {
    const owned = userCollectibles.map(uc => uc.collectible_id);
    return collectibles.filter(c => c.rarity === rarity && owned.includes(c.id));
  }, [collectibles, userCollectibles]);

  // Initial fetch
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchRoutes(), fetchCollectibles()]);
      if (user) {
        await Promise.all([
          fetchStamps(),
          fetchUserRouteProgress(),
          fetchUserCollectibles(),
        ]);
      }
      setLoading(false);
    };
    loadAll();
  }, [user, fetchRoutes, fetchCollectibles, fetchStamps, fetchUserRouteProgress, fetchUserCollectibles]);

  return {
    stamps,
    routes,
    userRouteProgress,
    collectibles,
    userCollectibles,
    loading,
    addStamp,
    startRoute,
    completeCheckpoint,
    unlockCollectible,
    getStampsByType,
    getRouteProgress,
    getCollectiblesByRarity,
    refresh: () => Promise.all([
      fetchStamps(),
      fetchUserRouteProgress(),
      fetchUserCollectibles(),
    ]),
  };
}
