import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export type ActionType = 
  | "page_visit"
  | "destination_view"
  | "add_favorite"
  | "share_content"
  | "leave_review"
  | "complete_booking"
  | "daily_checkin"
  | "use_chatbot"
  | "complete_quiz"
  | "refer_friend"
  | "passport_stamp"
  | "route_checkpoint";

interface TrackActionOptions {
  actionType: ActionType;
  metadata?: Record<string, unknown>;
  skipNotification?: boolean;
}

export function useActionTracker() {
  const { user } = useAuth();

  const trackAction = useCallback(async ({ 
    actionType, 
    metadata = {},
    skipNotification = false 
  }: TrackActionOptions) => {
    try {
      // Log analytics event (works for all users)
      const sessionId = sessionStorage.getItem("session_id") || (() => {
        const newId = crypto.randomUUID();
        sessionStorage.setItem("session_id", newId);
        return newId;
      })();

      await supabase.from("analytics_events").insert([{
        event_type: actionType,
        user_id: user?.id || null,
        page: window.location.pathname,
        metadata: metadata as Record<string, string | number | boolean | null>,
        session_id: sessionId
      }]);

      // Gamification only for logged-in users
      if (!user) return;

      // Fetch matching missions for this action
      const { data: missions } = await supabase
        .from("gamification_missions")
        .select("*")
        .eq("target_action", actionType)
        .eq("is_active", true);

      if (!missions || missions.length === 0) return;

      for (const mission of missions) {
        // Get or create user mission progress
        const { data: existingProgress } = await supabase
          .from("user_missions")
          .select("*")
          .eq("user_id", user.id)
          .eq("mission_id", mission.id)
          .maybeSingle();

        if (existingProgress?.is_completed) continue;

        const newProgress = (existingProgress?.progress || 0) + 1;
        const isCompleted = newProgress >= mission.target_count;

        if (existingProgress) {
          await supabase
            .from("user_missions")
            .update({
              progress: newProgress,
              is_completed: isCompleted,
              completed_at: isCompleted ? new Date().toISOString() : null,
              updated_at: new Date().toISOString()
            })
            .eq("id", existingProgress.id);
        } else {
          await supabase.from("user_missions").insert({
            user_id: user.id,
            mission_id: mission.id,
            progress: newProgress,
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null
          });
        }

        // Award XP and coins if completed
        if (isCompleted) {
          // Get current gamification stats
          const { data: gamification } = await supabase
            .from("user_gamification")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (gamification) {
            const newXp = gamification.total_xp + mission.xp_reward;
            const newCoins = gamification.coins + mission.coin_reward;

            // Check for level up
            const { data: levels } = await supabase
              .from("gamification_levels")
              .select("*")
              .order("level_number", { ascending: true });

            const newLevel = levels?.reduce((lvl, l) => {
              if (newXp >= l.xp_required && l.level_number > lvl) return l.level_number;
              return lvl;
            }, gamification.current_level) || gamification.current_level;

            await supabase
              .from("user_gamification")
              .update({
                total_xp: newXp,
                coins: newCoins,
                current_level: newLevel,
                total_missions_completed: gamification.total_missions_completed + 1,
                last_activity_date: new Date().toISOString().split('T')[0]
              })
              .eq("user_id", user.id);

            // Log transaction
            await supabase.from("gamification_transactions").insert({
              user_id: user.id,
              transaction_type: "earn",
              xp_amount: mission.xp_reward,
              coin_amount: mission.coin_reward,
              description: `Misión completada: ${mission.name}`,
              source_type: "mission",
              source_id: mission.id
            });

            // Notifications
            if (!skipNotification) {
              toast.success(`🎯 ¡Misión completada: ${mission.name}!`, {
                description: `+${mission.xp_reward} XP, +${mission.coin_reward} monedas`
              });

              if (newLevel > gamification.current_level) {
                const levelInfo = levels?.find(l => l.level_number === newLevel);
                toast.success(`🎉 ¡Subiste al nivel ${newLevel}!`, {
                  description: levelInfo?.title
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error tracking action:", error);
    }
  }, [user]);

  const trackDailyCheckin = useCallback(async () => {
    if (!user) return false;

    try {
      const { data: gamification } = await supabase
        .from("user_gamification")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!gamification) return false;

      const today = new Date().toISOString().split('T')[0];
      const lastActivity = gamification.last_activity_date;

      // Already checked in today
      if (lastActivity === today) return false;

      // Calculate streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const newStreak = lastActivity === yesterdayStr 
        ? gamification.streak_days + 1 
        : 1;

      // Award daily bonus
      const xpBonus = 10 + (newStreak * 2);
      const coinBonus = 5 + newStreak;

      await supabase
        .from("user_gamification")
        .update({
          total_xp: gamification.total_xp + xpBonus,
          coins: gamification.coins + coinBonus,
          streak_days: newStreak,
          last_activity_date: today
        })
        .eq("user_id", user.id);

      await supabase.from("gamification_transactions").insert({
        user_id: user.id,
        transaction_type: "earn",
        xp_amount: xpBonus,
        coin_amount: coinBonus,
        description: `Check-in diario (racha: ${newStreak} días)`,
        source_type: "daily_checkin"
      });

      // Track action for missions
      await trackAction({ 
        actionType: "daily_checkin",
        metadata: { streak: newStreak },
        skipNotification: true
      });

      toast.success(`🔥 ¡Check-in diario!`, {
        description: `Racha: ${newStreak} días • +${xpBonus} XP, +${coinBonus} monedas`
      });

      return true;
    } catch (error) {
      console.error("Error with daily checkin:", error);
      return false;
    }
  }, [user, trackAction]);

  return {
    trackAction,
    trackDailyCheckin
  };
}
