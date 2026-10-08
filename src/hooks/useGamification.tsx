import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { gamificationApi } from "@/lib/gamificationApi";
import { apiMessage } from "@/lib/accountApi";
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

export interface GamificationSeason {
  id: string;
  number: number;
  name: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  top_rewards?: Array<{ rank: string | number; prize: string; icon?: string; coins?: number; xp?: number }>;
}

export interface LeaderboardEntry {
  user_id: string;
  total_xp: number;
  current_level: number;
  coins: number;
  streak_days: number;
  total_missions_completed: number;
  display_name?: string;
  league_slug?: string;
  season_id?: string;
}

export function useGamification() {
  const { user } = useAuth();
  const [userGamification, setUserGamification] = useState<UserGamification | null>(null);
  const [levels, setLevels] = useState<GamificationLevel[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [userMissions, setUserMissions] = useState<UserMission[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [seasons, setSeasons] = useState<GamificationSeason[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("all");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all seasons
  const fetchSeasons = useCallback(async () => {
    if (HAS_BACKEND_SESSION) {
      try {
        const season = await gamificationApi.getCurrentSeason();
        if (season) {
          setSeasons([season]);
        }
      } catch (err: any) {
        console.warn("Error cargando temporada en backend:", err?.message || err);
      }
      return;
    }

    try {
      const { data } = await supabase
        .from("gamification_seasons" as any)
        .select("*")
        .order("number", { ascending: false });
      if (data && data.length > 0) {
        setSeasons(data as unknown as GamificationSeason[]);
      } else {
        // Fallback season metadata
        setSeasons([
          {
            id: "season-02",
            number: 2,
            name: "Temporada 2: Exploradores del Caribe",
            starts_at: "2026-09-01T00:00:00Z",
            ends_at: "2026-11-30T23:59:59Z",
            is_active: true,
            top_rewards: [
              { rank: 1, prize: "Estadía VIP en Cap Cana", icon: "👑", coins: 5000, xp: 2500 },
              { rank: 2, prize: "Pase Aventura Samaná", icon: "🥈", coins: 3000, xp: 1500 },
              { rank: 3, prize: "Cena Gourmet Colonial", icon: "🥉", coins: 1500, xp: 800 },
            ],
          },
          {
            id: "season-01",
            number: 1,
            name: "Temporada 1: Pioneros de Quisqueya",
            starts_at: "2026-06-01T00:00:00Z",
            ends_at: "2026-08-31T23:59:59Z",
            is_active: false,
            top_rewards: [
              { rank: 1, prize: "Vuelo Panorámico RD", icon: "👑", coins: 4000, xp: 2000 },
              { rank: 2, prize: "Kit Eco-Explorador", icon: "🥈", coins: 2500, xp: 1200 },
              { rank: 3, prize: "Medalla de Honor", icon: "🥉", coins: 1000, xp: 600 },
            ],
          },
        ]);
      }
    } catch {
      // Graceful fallback
    }
  }, []);

  // Fetch all levels
  const fetchLevels = useCallback(async () => {
    if (HAS_BACKEND_SESSION) {
      try {
        const lvls = await gamificationApi.getLevels();
        setLevels(
          lvls.map((l) => ({
            id: `lvl-${l.number}`,
            level_number: l.number,
            name: l.title,
            title: l.title,
            xp_required: l.xp_required,
            icon: l.icon || "🌟",
            color: l.color || "#008080",
            marketplace_discount: l.marketplace_discount || 0,
            perks: l.perks || [],
          }))
        );
      } catch (err: any) {
        console.warn("Error cargando niveles en backend:", err?.message || err);
      }
      return;
    }

    const { data } = await supabase
      .from("gamification_levels")
      .select("*")
      .order("level_number", { ascending: true });
    if (data) setLevels(data as unknown as GamificationLevel[]);
  }, []);

  // Fetch user gamification profile
  const fetchUserProfile = useCallback(async () => {
    if (!user) return;

    if (HAS_BACKEND_SESSION) {
      try {
        const state = await gamificationApi.getMyState();
        setUserGamification({
          id: state.id || user.id,
          user_id: user.id,
          total_xp: state.total_xp,
          current_level: state.current_level,
          coins: state.coins,
          streak_days: state.streak_days,
          last_activity_date: state.last_activity_date,
          total_missions_completed: state.total_missions_completed,
          total_purchases: state.total_purchases || 0,
          total_referrals: state.total_referrals || 0,
        });
      } catch (err: any) {
        console.warn("Error cargando perfil gamificación en backend:", err?.message || err);
      }
      return;
    }

    const { data, error } = await supabase
      .from("user_gamification")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setUserGamification(data as unknown as UserGamification);
    } else if (!error || error.code === "PGRST116") {
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
    if (HAS_BACKEND_SESSION) {
      try {
        const list = await gamificationApi.getMissions();
        setMissions(
          list.map((m) => ({
            id: m.id,
            name: m.name,
            description: m.description,
            short_description: m.short_description || m.description.slice(0, 80),
            mission_type: m.mission_type || "daily",
            category: m.category || "exploracion",
            icon: m.icon || "🎯",
            xp_reward: m.xp_reward,
            coin_reward: m.coin_reward,
            target_count: m.target_count || 1,
            target_action: m.target_action || "action",
            is_featured: !!m.is_featured,
            min_level: m.min_level || 1,
          }))
        );
      } catch (err: any) {
        console.warn("Error cargando misiones en backend:", err?.message || err);
      }
      return;
    }

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

    if (HAS_BACKEND_SESSION) {
      try {
        const myMissions = await gamificationApi.getMyMissions();
        setUserMissions(
          myMissions.map((m) => ({
            id: `um-${m.id}`,
            mission_id: m.id,
            progress: m.progress,
            is_completed: m.completed,
            completed_at: m.completed_at,
          }))
        );
      } catch (err: any) {
        console.warn("Error cargando misiones de usuario en backend:", err?.message || err);
      }
      return;
    }

    const { data } = await supabase
      .from("user_missions")
      .select("*")
      .eq("user_id", user.id);
    if (data) setUserMissions(data as unknown as UserMission[]);
  }, [user]);

  // Fetch prizes
  const fetchPrizes = useCallback(async () => {
    if (HAS_BACKEND_SESSION) {
      try {
        const list = await gamificationApi.getPrizes();
        setPrizes(
          list.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            short_description: p.short_description || p.description.slice(0, 80),
            image_url: p.image_url || "",
            prize_type: p.prize_type || "digital",
            coin_cost: p.coin_cost,
            min_level: p.min_level || 1,
            quantity_available: p.quantity_available,
            quantity_redeemed: p.quantity_redeemed || 0,
            is_featured: !!p.is_featured,
            sponsor: p.sponsor || "Descubre RD",
            valid_until: p.valid_until,
            terms: p.terms,
          }))
        );
      } catch (err: any) {
        console.warn("Error cargando premios en backend:", err?.message || err);
      }
      return;
    }

    const { data } = await supabase
      .from("gamification_prizes")
      .select("*")
      .eq("is_active", true)
      .order("is_featured", { ascending: false });
    if (data) setPrizes(data as unknown as Prize[]);
  }, []);

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(
    async (seasonId?: string) => {
      const targetSeason = seasonId !== undefined ? seasonId : selectedSeasonId;

      if (HAS_BACKEND_SESSION) {
        try {
          const scope = targetSeason === "week" ? "week" : targetSeason === "all" ? "all" : "season";
          const res = await gamificationApi.getLeaderboard(scope as any, 20);
          setLeaderboard(
            res.rows.map((d) => ({
              user_id: d.user_id,
              total_xp: d.total_xp,
              current_level: d.level,
              coins: d.coins || 0,
              streak_days: d.streak_days || 0,
              total_missions_completed: 0,
              display_name: d.display_name,
            }))
          );
        } catch (err: any) {
          console.warn("Error cargando tabla de clasificación en backend:", err?.message || err);
        }
        return;
      }

      if (targetSeason && targetSeason !== "all") {
        try {
          const { data: leagueStats } = await supabase
            .from("user_league_stats" as any)
            .select("user_id, xp_this_season, league_slug, season_id")
            .eq("season_id", targetSeason)
            .order("xp_this_season", { ascending: false })
            .limit(20);

          if (leagueStats && leagueStats.length > 0) {
            const userIds = leagueStats.map((d: any) => d.user_id);
            const { data: profiles } = await supabase
              .from("profiles")
              .select("id, display_name")
              .in("id", userIds);

            const profileMap = new Map(profiles?.map((p: any) => [p.id, p.display_name]) || []);

            setLeaderboard(
              leagueStats.map((d: any) => ({
                user_id: d.user_id,
                total_xp: d.xp_this_season || 0,
                current_level: Math.min(10, Math.floor((d.xp_this_season || 0) / 500) + 1),
                coins: Math.floor((d.xp_this_season || 0) / 2),
                streak_days: 7,
                total_missions_completed: Math.floor((d.xp_this_season || 0) / 150),
                display_name: profileMap.get(d.user_id) || "Viajero Anónimo",
                league_slug: d.league_slug,
                season_id: d.season_id,
              }))
            );
            return;
          }
        } catch {
          // Fallback to global user_gamification
        }
      }

      const { data } = await supabase
        .from("user_gamification")
        .select("user_id, total_xp, current_level, coins, streak_days, total_missions_completed")
        .order("total_xp", { ascending: false })
        .limit(20);

      if (data && data.length > 0) {
        const userIds = data.map((d) => d.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", userIds);

        const profileMap = new Map(profiles?.map((p) => [p.id, p.display_name]) || []);

        setLeaderboard(
          data.map((d) => ({
            ...d,
            display_name: profileMap.get(d.user_id) || "Viajero Anónimo",
          })) as LeaderboardEntry[]
        );
      }
    },
    [selectedSeasonId]
  );

  // Fetch referral code
  const fetchReferralCode = useCallback(async () => {
    if (!user) return;

    if (HAS_BACKEND_SESSION) {
      try {
        const data = await gamificationApi.getMyReferrals();
        if (data?.referral_code) {
          setReferralCode(data.referral_code);
        }
      } catch (err: any) {
        console.warn("Error cargando código de referido en backend:", err?.message || err);
      }
      return;
    }

    const { data } = await supabase
      .from("referral_codes")
      .select("code")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setReferralCode(data.code);
    } else {
      const code = `RD-${user.id.substring(0, 6).toUpperCase()}`;
      await supabase.from("referral_codes").insert({ user_id: user.id, code });
      setReferralCode(code);
    }
  }, [user]);

  // Get current level info
  const getCurrentLevel = useCallback(() => {
    if (!userGamification || levels.length === 0) return levels[0] || null;
    return levels.find((l) => l.level_number === userGamification.current_level) || levels[0];
  }, [userGamification, levels]);

  const getNextLevel = useCallback(() => {
    if (!userGamification || levels.length === 0) return null;
    return levels.find((l) => l.level_number === userGamification.current_level + 1) || null;
  }, [userGamification, levels]);

  const getXpProgress = useCallback(() => {
    const current = getCurrentLevel();
    const next = getNextLevel();
    if (!current || !next || !userGamification) return 0;
    const xpInLevel = userGamification.total_xp - current.xp_required;
    const xpNeeded = next.xp_required - current.xp_required;
    return Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));
  }, [getCurrentLevel, getNextLevel, userGamification]);

  // Report action or award XP
  const awardXp = useCallback(
    async (xp: number, coins: number, description: string, sourceType?: string, sourceId?: string) => {
      if (!user) return;

      if (HAS_BACKEND_SESSION) {
        try {
          const actionName = sourceType || "custom_action";
          const res = await gamificationApi.reportAction(actionName, sourceType, sourceId);
          if (res.granted) {
            if (res.level_up) {
              toast.success(`🎉 ¡Subiste al nivel ${res.level}!`);
            } else {
              toast.success(`+${xp} XP${coins > 0 ? ` y +${coins} monedas` : ""}`);
            }
          }
          await fetchUserProfile();
          return;
        } catch (err) {
          toast.error(apiMessage(err, "No se pudo registrar la acción"));
          return;
        }
      }

      if (!userGamification) return;
      const newXp = userGamification.total_xp + xp;
      const newLevel = levels.reduce((lvl, l) => {
        if (newXp >= l.xp_required && l.level_number > lvl) return l.level_number;
        return lvl;
      }, userGamification.current_level);

      const { error } = await supabase.rpc("award_user_xp", {
        xp_to_award: xp,
        coins_to_award: coins,
        xp_description: description,
        source_type: sourceType,
        source_id: sourceId,
      });

      if (error) {
        console.error("Error awarding XP:", error);
        return;
      }

      if (newLevel > userGamification.current_level) {
        const levelInfo = levels.find((l) => l.level_number === newLevel);
        toast.success(`🎉 ¡Subiste al nivel ${newLevel}: ${levelInfo?.title}!`);
      } else if (xp > 0) {
        toast.success(`+${xp} XP${coins > 0 ? ` y +${coins} monedas` : ""}`);
      }

      await fetchUserProfile();
    },
    [user, userGamification, levels, fetchUserProfile]
  );

  // Redeem a prize
  const redeemPrize = useCallback(
    async (prizeId: string) => {
      if (!user || !userGamification) return false;

      const prize = prizes.find((p) => p.id === prizeId);
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

      if (HAS_BACKEND_SESSION) {
        try {
          const res = await gamificationApi.redeemPrize(prizeId);
          toast.success(`🎁 ¡Premio canjeado! Código: ${res.code || res.id || "CONFIRMADO"}`);
          await fetchUserProfile();
          return true;
        } catch (err) {
          toast.error(apiMessage(err, "Error al procesar el canje de premio."));
          return false;
        }
      }

      const { data: code, error } = await supabase.rpc("redeem_user_prize", {
        target_prize_id: prizeId,
      });

      if (error) {
        toast.error(error.message || "Error al procesar el canje.");
        return false;
      }

      toast.success(`🎁 ¡Premio canjeado! Código: ${code}`);
      await fetchUserProfile();
      return true;
    },
    [user, userGamification, prizes, getCurrentLevel, fetchUserProfile]
  );

  // Initial fetch
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchSeasons(), fetchLevels(), fetchMissions(), fetchPrizes(), fetchLeaderboard()]);
      if (user) {
        await Promise.all([fetchUserProfile(), fetchUserMissions(), fetchReferralCode()]);
      } else {
        setUserGamification(null);
        setUserMissions([]);
        setReferralCode(null);
      }
      setLoading(false);
    };
    loadAll();
  }, [user, fetchSeasons, fetchLevels, fetchMissions, fetchPrizes, fetchLeaderboard, fetchUserProfile, fetchUserMissions, fetchReferralCode]);

  return {
    userGamification,
    levels,
    missions,
    userMissions,
    prizes,
    seasons,
    selectedSeasonId,
    setSelectedSeasonId: (id: string) => {
      setSelectedSeasonId(id);
      fetchLeaderboard(id);
    },
    leaderboard,
    referralCode,
    loading,
    getCurrentLevel,
    getNextLevel,
    getXpProgress,
    awardXp,
    redeemPrize,
    fetchLeaderboard,
    refresh: () => Promise.all([fetchUserProfile(), fetchUserMissions(), fetchLeaderboard(), fetchSeasons()]),
  };
}
