import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface GamificationLevel {
  id: string;
  level_number: number;
  name: string;
  title: string;
  xp_required: number;
  icon: string;
  color: string;
  marketplace_discount: number;
  perks: string[];
}

export interface UserGamification {
  id: string;
  user_id: string;
  total_xp: number;
  current_level: number;
  coins: number;
  streak_days: number;
  last_activity_date: string | null;
  total_missions_completed: number;
  total_purchases: number;
  total_referrals: number;
}

export interface Mission {
  id: string;
  name: string;
  description: string;
  short_description: string;
  mission_type: string;
  category: string;
  icon: string;
  xp_reward: number;
  coin_reward: number;
  target_count: number;
  target_action: string;
  is_featured: boolean;
  min_level: number;
}

export interface UserMission {
  id: string;
  mission_id: string;
  progress: number;
  is_completed: boolean;
  completed_at: string | null;
}

export interface Prize {
  id: string;
  name: string;
  description: string;
  short_description: string;
  image_url: string;
  prize_type: string;
  coin_cost: number;
  min_level: number;
  quantity_available: number | null;
  quantity_redeemed: number;
  is_featured: boolean;
  sponsor: string;
  valid_until: string | null;
  terms: string | null;
}

export interface LeaderboardEntry {
  user_id: string;
  total_xp: number;
  current_level: number;
  coins: number;
  streak_days: number;
  total_missions_completed: number;
  display_name?: string;
}

export function useGamification() {
  const { user } = useAuth();
  const [userGamification, setUserGamification] = useState<UserGamification | null>(null);
  const [levels, setLevels] = useState<GamificationLevel[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [userMissions, setUserMissions] = useState<UserMission[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all levels
  const fetchLevels = useCallback(async () => {
    const { data } = await supabase
      .from("gamification_levels")
      .select("*")
      .order("level_number", { ascending: true });
    if (data) setLevels(data as unknown as GamificationLevel[]);
  }, []);

  // Fetch user gamification profile
  const fetchUserProfile = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("user_gamification")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (data) {
      setUserGamification(data as unknown as UserGamification);
    } else if (!error || error.code === "PGRST116") {
      // Create profile if doesn't exist
      const { data: newProfile } = await supabase
        .from("user_gamification")
        .insert({ user_id: user.id })
        .select()
        .single();
      if (newProfile) setUserGamification(newProfile as unknown as UserGamification);
    }
  }, [user]);

  // Fetch missions
  const fetchMissions = useCallback(async () => {
    const { data } = await supabase
      .from("gamification_missions")
      .select("*")
      .eq("is_active", true)
      .order("is_featured", { ascending: false });
    if (data) setMissions(data as unknown as Mission[]);
  }, []);

  // Fetch user mission progress
  const fetchUserMissions = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_missions")
      .select("*")
      .eq("user_id", user.id);
    if (data) setUserMissions(data as unknown as UserMission[]);
  }, [user]);

  // Fetch prizes
  const fetchPrizes = useCallback(async () => {
    const { data } = await supabase
      .from("gamification_prizes")
      .select("*")
      .eq("is_active", true)
      .order("is_featured", { ascending: false });
    if (data) setPrizes(data as unknown as Prize[]);
  }, []);

  // Fetch leaderboard (top 20)
  const fetchLeaderboard = useCallback(async () => {
    const { data } = await supabase
      .from("user_gamification")
      .select("user_id, total_xp, current_level, coins, streak_days, total_missions_completed")
      .order("total_xp", { ascending: false })
      .limit(20);
    
    if (data && data.length > 0) {
      // Fetch display names
      const userIds = data.map(d => d.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p.display_name]) || []);
      
      setLeaderboard(data.map(d => ({
        ...d,
        display_name: profileMap.get(d.user_id) || "Viajero Anónimo"
      })) as LeaderboardEntry[]);
    }
  }, []);

  // Fetch referral code
  const fetchReferralCode = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("referral_codes")
      .select("code")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (data) {
      setReferralCode(data.code);
    } else {
      // Generate a referral code
      const code = `RD-${user.id.substring(0, 6).toUpperCase()}`;
      await supabase.from("referral_codes").insert({ user_id: user.id, code });
      setReferralCode(code);
    }
  }, [user]);

  // Get current level info
  const getCurrentLevel = useCallback(() => {
    if (!userGamification || levels.length === 0) return levels[0] || null;
    return levels.find(l => l.level_number === userGamification.current_level) || levels[0];
  }, [userGamification, levels]);

  const getNextLevel = useCallback(() => {
    if (!userGamification || levels.length === 0) return null;
    return levels.find(l => l.level_number === userGamification.current_level + 1) || null;
  }, [userGamification, levels]);

  const getXpProgress = useCallback(() => {
    const current = getCurrentLevel();
    const next = getNextLevel();
    if (!current || !next || !userGamification) return 0;
    const xpInLevel = userGamification.total_xp - current.xp_required;
    const xpNeeded = next.xp_required - current.xp_required;
    return Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));
  }, [getCurrentLevel, getNextLevel, userGamification]);

  // Award XP and coins
  const awardXp = useCallback(async (xp: number, coins: number, description: string, sourceType?: string, sourceId?: string) => {
    if (!user || !userGamification) return;

    const newXp = userGamification.total_xp + xp;

    // Check for level up
    const newLevel = levels.reduce((lvl, l) => {
      if (newXp >= l.xp_required && l.level_number > lvl) return l.level_number;
      return lvl;
    }, userGamification.current_level);

    // Update via secure RPC definer function
    const { error } = await supabase.rpc("award_user_xp", {
      xp_to_award: xp,
      coins_to_award: coins,
      xp_description: description,
      source_type: sourceType,
      source_id: sourceId
    });

    if (error) {
      console.error("Error awarding XP:", error);
      return;
    }

    if (newLevel > userGamification.current_level) {
      const levelInfo = levels.find(l => l.level_number === newLevel);
      toast.success(`🎉 ¡Subiste al nivel ${newLevel}: ${levelInfo?.title}!`);
    } else if (xp > 0) {
      toast.success(`+${xp} XP${coins > 0 ? ` y +${coins} monedas` : ""}`);
    }

    await fetchUserProfile();
  }, [user, userGamification, levels, fetchUserProfile]);

  // Redeem a prize
  const redeemPrize = useCallback(async (prizeId: string) => {
    if (!user || !userGamification) return false;
    
    const prize = prizes.find(p => p.id === prizeId);
    if (!prize) return false;

    if (userGamification.coins < prize.coin_cost) {
      toast.error("No tienes suficientes monedas");
      return false;
    }

    const currentLevel = getCurrentLevel();
    if (currentLevel && currentLevel.level_number < prize.min_level) {
      toast.error(`Necesitas ser nivel ${prize.min_level} para canjear este premio`);
      return false;
    }

    // Call secure RPC definer function
    const { data: code, error } = await supabase.rpc("redeem_user_prize", {
      target_prize_id: prizeId
    });

    if (error) {
      toast.error(error.message || "Error al procesar el canje.");
      return false;
    }

    toast.success(`🎁 ¡Premio canjeado! Código: ${code}`);
    await fetchUserProfile();
    return true;
  }, [user, userGamification, prizes, getCurrentLevel, fetchUserProfile]);

  // Initial fetch
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchLevels(), fetchMissions(), fetchPrizes(), fetchLeaderboard()]);
      if (user) {
        await Promise.all([fetchUserProfile(), fetchUserMissions(), fetchReferralCode()]);
      } else {
        // Clear any previous user's data on logout so it doesn't linger for
        // the next signed-out view or briefly leak into the next login.
        setUserGamification(null);
        setUserMissions([]);
        setReferralCode(null);
      }
      setLoading(false);
    };
    loadAll();
  }, [user, fetchLevels, fetchMissions, fetchPrizes, fetchLeaderboard, fetchUserProfile, fetchUserMissions, fetchReferralCode]);

  return {
    userGamification,
    levels,
    missions,
    userMissions,
    prizes,
    leaderboard,
    referralCode,
    loading,
    getCurrentLevel,
    getNextLevel,
    getXpProgress,
    awardXp,
    redeemPrize,
    refresh: () => Promise.all([fetchUserProfile(), fetchUserMissions(), fetchLeaderboard()])
  };
}
