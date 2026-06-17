import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAchievementChecker } from "@/hooks/useAchievementChecker";
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
  | "route_checkpoint"
  | "article_read"       // NEW: mejora #2 - XP por lectura
  | "early_bird"         // NEW: mejora #3 - Early Bird
  | "session_explorer";  // NEW: mejora #4 - 5+ páginas en sesión

interface TrackActionOptions {
  actionType: ActionType;
  metadata?: Record<string, unknown>;
  skipNotification?: boolean;
}

export function useActionTracker() {
  const { user } = useAuth();
  const { checkAchievements } = useAchievementChecker();
  // Track page depth per session
  const sessionPagesRef = useRef<number>(
    parseInt(sessionStorage.getItem("session_pages") || "0")
  );

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

      // Track page depth for session_explorer bonus (#4)
      if (actionType === "page_visit") {
        sessionPagesRef.current += 1;
        sessionStorage.setItem("session_pages", String(sessionPagesRef.current));
        // Trigger session explorer bonus at 5 pages
        if (sessionPagesRef.current === 5 && user) {
          await trackAction({ actionType: "session_explorer", skipNotification: true });
        }
      }

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
          // Get previous gamification level
          const { data: gamification } = await supabase
            .from("user_gamification")
            .select("current_level, streak_days")
            .eq("user_id", user.id)
            .single();

          const prevLevel = gamification?.current_level || 1;
          const streak = gamification?.streak_days || 0;

          // Apply streak multiplier (#1)
          const multiplier = streak >= 30 ? 2.0 : streak >= 14 ? 1.75 : streak >= 7 ? 1.5 : streak >= 3 ? 1.25 : 1.0;
          const finalXp = Math.round(mission.xp_reward * multiplier);

          // Call secure RPC to award user XP and Log transactions
          const { error } = await supabase.rpc("award_user_xp", {
            xp_to_award: finalXp,
            coins_to_award: mission.coin_reward,
            xp_description: `Misión completada: ${mission.name}`,
            source_type: "mission",
            source_id: mission.id
          });

          if (error) {
            console.error("Error awarding XP via RPC:", error);
            continue;
          }

          // Check XP milestones after award (#10)
          supabase.rpc("check_xp_milestones" as any).then(({ data: milestones }) => {
            if (milestones && Array.isArray(milestones) && milestones.length > 0) {
              (milestones as Array<{ badge_icon: string; badge_name: string; xp_threshold: number; coins: number }>)
                .forEach((m) => {
                  toast.success(`${m.badge_icon} ¡Hito XP: ${m.badge_name}!`, {
                    description: `Alcanzaste ${m.xp_threshold.toLocaleString()} XP • +${m.coins} monedas`
                  });
                });
            }
          });

          // Check streak bonus (#7)
          supabase.rpc("check_and_award_streak_bonus" as any).then(({ data }) => {
            const bonus = data as { success?: boolean; xp_awarded?: number; streak?: number } | null;
            if (bonus?.success && bonus.xp_awarded) {
              toast.success(`🔥 ¡Bono de racha de ${bonus.streak} días!`, {
                description: `+${bonus.xp_awarded} XP de recompensa`
              });
            }
          });

          // Fetch new gamification profile to check level up
          const { data: newGamification } = await supabase
            .from("user_gamification")
            .select("current_level")
            .eq("user_id", user.id)
            .single();

          const newLevel = newGamification?.current_level || prevLevel;

          // Notifications
          if (!skipNotification) {
            const multiplierText = multiplier > 1 ? ` (×${multiplier} por racha)` : "";
            toast.success(`🎯 ¡Misión completada: ${mission.name}!`, {
              description: `+${finalXp} XP${multiplierText}, +${mission.coin_reward} monedas`
            });

            if (newLevel > prevLevel) {
              toast.success(`🎉 ¡Subiste al nivel ${newLevel}!`, {
                description: "¡Sigue explorando para ganar más beneficios!"
              });
            }
          }
        }
      }

      // Check for achievement unlocks after processing actions
      if (user) {
        await checkAchievements();
      }
    } catch (error) {
      console.error("Error tracking action:", error);
    }
  }, [user, checkAchievements]);

  /**
   * Daily check-in with Early Bird bonus (#3)
   */
  const trackDailyCheckin = useCallback(async () => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc("perform_daily_checkin");
      if (error) {
        console.error("Error doing check-in RPC:", error);
        return false;
      }

      const result = data as { success: boolean; xp_awarded?: number; coins_awarded?: number; streak_days?: number };
      if (!result.success) {
        // Already checked in today
        return false;
      }

      // Track action for missions
      await trackAction({
        actionType: "daily_checkin",
        metadata: { streak: result.streak_days },
        skipNotification: true
      });

      const streak = result.streak_days || 0;
      const multiplier = streak >= 30 ? 2.0 : streak >= 14 ? 1.75 : streak >= 7 ? 1.5 : streak >= 3 ? 1.25 : 1.0;
      const multiplierText = multiplier > 1 ? ` • ×${multiplier} multiplicador activo` : "";

      toast.success(`🔥 ¡Check-in diario!`, {
        description: `Racha: ${streak} días • +${result.xp_awarded} XP, +${result.coins_awarded} monedas${multiplierText}`
      });

      // Try Early Bird bonus (#3)
      const { data: earlyBird } = await supabase.rpc("perform_early_bird_bonus" as any);
      const eb = earlyBird as { success?: boolean; xp_awarded?: number } | null;
      if (eb?.success) {
        toast.success("🐦 ¡Bono Madrugador!", {
          description: `+${eb.xp_awarded} XP por conectarte antes de las 9am`
        });
      }

      // Check streak bonus (#7)
      const { data: streakBonus } = await supabase.rpc("check_and_award_streak_bonus" as any);
      const sb = streakBonus as { success?: boolean; xp_awarded?: number; streak?: number } | null;
      if (sb?.success && sb.xp_awarded) {
        toast.success(`🎊 ¡Bono de racha de ${sb.streak} días!`, {
          description: `+${sb.xp_awarded} XP de recompensa especial`
        });
      }

      return true;
    } catch (error) {
      console.error("Error with daily checkin:", error);
      return false;
    }
  }, [user, trackAction]);

  /**
   * Track article reading time (#2 - XP por lectura)
   * Call when user has spent >2min on an article
   */
  const trackArticleRead = useCallback(async (articleId: string, timeSpentSecs: number) => {
    if (!user || timeSpentSecs < 120) return; // Min 2 minutes

    const flagKey = `article_read_${articleId}`;
    if (sessionStorage.getItem(flagKey)) return; // Already tracked this session
    sessionStorage.setItem(flagKey, "1");

    await trackAction({
      actionType: "article_read",
      metadata: { article_id: articleId, time_spent_secs: timeSpentSecs },
      skipNotification: false
    });
  }, [user, trackAction]);

  /**
   * Track share action with dedup (max 3/day) (#8)
   */
  const trackShare = useCallback(async (contentType: string, contentId: string) => {
    if (!user) return;

    const today = new Date().toDateString();
    const countKey = `shares_today_${today}`;
    const count = parseInt(sessionStorage.getItem(countKey) || "0");

    if (count >= 3) {
      toast.info("Máximo 3 compartidos con XP por día alcanzados");
      return;
    }

    sessionStorage.setItem(countKey, String(count + 1));

    await trackAction({
      actionType: "share_content",
      metadata: { content_type: contentType, content_id: contentId },
      skipNotification: false
    });
  }, [user, trackAction]);

  return {
    trackAction,
    trackDailyCheckin,
    trackArticleRead,
    trackShare,
  };
}
