import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

/**
 * Hook that checks and auto-unlocks achievements based on user stats.
 * Call `checkAchievements()` after significant user actions.
 */
export function useAchievementChecker() {
  const { user } = useAuth();

  const checkAchievements = useCallback(async () => {
    if (!user) return;

    try {
      // Get user stats
      const { data: gamification } = await supabase
        .from("user_gamification")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!gamification) return;

      // Get all active achievements
      const { data: achievements } = await supabase
        .from("achievements")
        .select("*")
        .eq("is_active", true);

      if (!achievements) return;

      // Get already unlocked
      const { data: userAchievements } = await supabase
        .from("user_achievements")
        .select("achievement_id")
        .eq("user_id", user.id);

      const unlockedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);

      // Get additional stats
      const [
        { count: favoriteCount },
        { count: reviewCount },
        { count: missionCount },
      ] = await Promise.all([
        supabase.from("favorites").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("reviews").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("user_missions").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("is_completed", true),
      ]);

      const stats = {
        total_xp: gamification.total_xp,
        current_level: gamification.current_level,
        coins: gamification.coins,
        streak_days: gamification.streak_days,
        total_missions_completed: gamification.total_missions_completed,
        total_purchases: gamification.total_purchases,
        total_referrals: gamification.total_referrals,
        favorites: favoriteCount || 0,
        reviews: reviewCount || 0,
        missions_completed: missionCount || 0,
      };

      // Check each achievement
      for (const achievement of achievements) {
        if (unlockedIds.has(achievement.id)) continue;
        if (achievement.min_level && stats.current_level < achievement.min_level) continue;

        const req = achievement.unlock_requirement as Record<string, number> | null;
        if (!req) continue;

        // Evaluate unlock conditions
        let unlocked = true;
        for (const [key, value] of Object.entries(req)) {
          const statValue = stats[key as keyof typeof stats];
          if (typeof statValue === "number" && statValue < (value as number)) {
            unlocked = false;
            break;
          }
        }

        if (unlocked) {
          // Call secure RPC to unlock achievement
          const { error } = await supabase.rpc("unlock_user_achievement", {
            target_achievement_id: achievement.id
          });

          if (error) {
            console.error("Error unlocking achievement via RPC:", error);
            continue;
          }

          toast.success(`🏆 ¡Logro desbloqueado: ${achievement.name}!`, {
            description: `+${achievement.xp_reward || 0} XP${achievement.coin_reward ? `, +${achievement.coin_reward} monedas` : ""}`,
          });
        }
      }
    } catch (error) {
      console.error("Error checking achievements:", error);
    }
  }, [user]);

  return { checkAchievements };
}
