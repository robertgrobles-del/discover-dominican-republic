import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAchievementChecker } from "@/hooks/useAchievementChecker";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { gamificationApi } from "@/lib/gamificationApi";
import { fetchApi } from "@/lib/fastifyClient";
import { toast } from "sonner";
import { cleanAnalyticsMetadata, cleanAnalyticsPage, getAnalyticsSessionId } from "@/hooks/useAnalytics";
import { isAnalyticsAllowed } from "@/lib/privacy-consent";

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
  | "article_read"
  | "early_bird"
  | "session_explorer";

interface TrackActionOptions {
  actionType: ActionType;
  metadata?: Record<string, unknown>;
  skipNotification?: boolean;
}

export function useActionTracker() {
  const { user } = useAuth();
  const { checkAchievements } = useAchievementChecker();
  const sessionPagesRef = useRef<number>(
    parseInt(sessionStorage.getItem("session_pages") || "0")
  );

  const trackAction = useCallback(
    async ({ actionType, metadata = {}, skipNotification = false }: TrackActionOptions) => {
      try {
        // Track page depth for session_explorer bonus
        if (actionType === "page_visit") {
          sessionPagesRef.current += 1;
          sessionStorage.setItem("session_pages", String(sessionPagesRef.current));
          if (sessionPagesRef.current === 5 && user) {
            await trackAction({ actionType: "session_explorer", skipNotification: true });
          }
        }

        // Analytics
        const analyticsSessionId = getAnalyticsSessionId();
        const analyticsPage = cleanAnalyticsPage(window.location.pathname);
        if (isAnalyticsAllowed() && analyticsSessionId && analyticsPage) {
          if (HAS_BACKEND_SESSION) {
            fetchApi("/analytics/events", {
              method: "POST",
              body: JSON.stringify({
                events: [
                  {
                    type: actionType,
                    page: analyticsPage,
                    session_id: analyticsSessionId,
                    props: cleanAnalyticsMetadata(metadata),
                  },
                ],
              }),
            }).catch((err) => {
              console.debug("Analytics telemetry dispatch error:", err);
            });
          } else {
            await supabase.from("analytics_events").insert([
              {
                event_type: actionType,
                page: analyticsPage,
                metadata: cleanAnalyticsMetadata(metadata) as Record<string, string | number | boolean | null>,
                session_id: analyticsSessionId,
              },
            ]);
          }
        }

        if (!user) return;

        // Si hay sesión backend real, el servidor calcula y valida la acción
        if (HAS_BACKEND_SESSION) {
          // Las acciones verificadas automáticamente por backend (favoritos, reseñas, reservas)
          // no se vuelven a reclamar desde cliente para evitar conteo doble
          const serverManagedActions = ["add_favorite", "leave_review", "complete_booking"];
          if (serverManagedActions.includes(actionType)) {
            return;
          }

          try {
            const refType = typeof metadata.ref_type === "string" ? metadata.ref_type : typeof metadata.content_type === "string" ? metadata.content_type : undefined;
            const refId = typeof metadata.ref_id === "string" ? metadata.ref_id : typeof metadata.content_id === "string" ? metadata.content_id : typeof metadata.article_id === "string" ? metadata.article_id : undefined;

            const res = await gamificationApi.reportAction(actionType, refType, refId);
            if (!res.denied_reason && !skipNotification) {
              if (res.level_up) {
                toast.success(`🎉 ¡Subiste al nivel ${res.level_up.to}!`);
              }
              if (res.achievements_unlocked.length > 0) {
                toast.success("🏆 ¡Nuevo logro desbloqueado!");
              }
            }
          } catch (err) {
            console.debug("Report gamification action error:", err);
          }
          return;
        }

        // Mock Supabase Fallback
        const { data: missions } = await supabase
          .from("gamification_missions")
          .select("*")
          .eq("target_action", actionType)
          .eq("is_active", true);

        if (!missions || missions.length === 0) return;

        for (const mission of missions) {
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
                updated_at: new Date().toISOString(),
              })
              .eq("id", existingProgress.id);
          } else {
            await supabase.from("user_missions").insert({
              user_id: user.id,
              mission_id: mission.id,
              progress: newProgress,
              is_completed: isCompleted,
              completed_at: isCompleted ? new Date().toISOString() : null,
            });
          }

          if (isCompleted) {
            const { data: gamification } = await supabase
              .from("user_gamification")
              .select("current_level, streak_days")
              .eq("user_id", user.id)
              .single();

            const prevLevel = gamification?.current_level || 1;
            const streak = gamification?.streak_days || 0;
            const multiplier = streak >= 30 ? 2.0 : streak >= 14 ? 1.75 : streak >= 7 ? 1.5 : streak >= 3 ? 1.25 : 1.0;
            const finalXp = Math.round(mission.xp_reward * multiplier);

            await supabase.rpc("award_user_xp", {
              xp_to_award: finalXp,
              coins_to_award: mission.coin_reward,
              xp_description: `Misión completada: ${mission.name}`,
              source_type: "mission",
              source_id: mission.id,
            });

            if (!skipNotification) {
              const multiplierText = multiplier > 1 ? ` (×${multiplier} por racha)` : "";
              toast.success(`🎯 ¡Misión completada: ${mission.name}!`, {
                description: `+${finalXp} XP${multiplierText}, +${mission.coin_reward} monedas`,
              });
            }
          }
        }

        if (user) {
          await checkAchievements();
        }
      } catch (error) {
        console.error("Error tracking action:", error);
      }
    },
    [user, checkAchievements]
  );

  /**
   * Daily check-in
   */
  const trackDailyCheckin = useCallback(async () => {
    if (!user) return false;

    if (HAS_BACKEND_SESSION) {
      try {
        const res = await gamificationApi.dailyCheckIn();
        if (res.success) {
          toast.success("🔥 ¡Check-in diario completado!", {
            description: `Racha actual: ${res.streak} días • +${res.xp ?? 0} XP, +${res.coins ?? 0} monedas`,
          });

          // Early bird bonus
          try {
            const eb = await gamificationApi.claimEarlyBird();
            if (eb.success) {
              toast.success("🐦 ¡Bono Madrugador!", {
                description: `+${eb.xp} XP por conectarte temprano`,
              });
            }
          } catch (err) {
            console.debug("Claim early bird bonus error:", err);
          }

          // Streak bonus
          try {
            const sb = await gamificationApi.claimStreakBonus();
            if (sb.success) {
              toast.success(`🎊 ¡Bono de racha de ${sb.streak} días!`, {
                description: `+${sb.coins} monedas de recompensa especial`,
              });
            }
          } catch (err) {
            console.debug("Claim streak bonus error:", err);
          }

          return true;
        }
        return false;
      } catch (err) {
        console.debug("Daily check-in fastify error:", err);
        return false;
      }
    }

    try {
      const { data, error } = await supabase.rpc("perform_daily_checkin");
      if (error) return false;

      const result = data as { success: boolean; xp_awarded?: number; coins_awarded?: number; streak_days?: number };
      if (!result.success) return false;

      await trackAction({
        actionType: "daily_checkin",
        metadata: { streak: result.streak_days },
        skipNotification: true,
      });

      const streak = result.streak_days || 0;
      toast.success("🔥 ¡Check-in diario!", {
        description: `Racha: ${streak} días • +${result.xp_awarded} XP, +${result.coins_awarded} monedas`,
      });

      return true;
    } catch (err) {
      console.debug("Daily check-in supabase error:", err);
      return false;
    }
  }, [user, trackAction]);

  /**
   * Track article reading time (>2min)
   */
  const trackArticleRead = useCallback(
    async (articleId: string, timeSpentSecs: number) => {
      if (!user || timeSpentSecs < 120) return;

      const flagKey = `article_read_${articleId}`;
      if (sessionStorage.getItem(flagKey)) return;
      sessionStorage.setItem(flagKey, "1");

      await trackAction({
        actionType: "article_read",
        metadata: { article_id: articleId, time_spent_secs: timeSpentSecs },
        skipNotification: false,
      });
    },
    [user, trackAction]
  );

  /**
   * Track share action with dedup (max 3/day)
   */
  const trackShare = useCallback(
    async (contentType: string, contentId: string) => {
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
        skipNotification: false,
      });
    },
    [user, trackAction]
  );

  return {
    trackAction,
    trackDailyCheckin,
    trackArticleRead,
    trackShare,
  };
}
