import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, Flame, Bell, BellRing, Check } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { useGamification } from "@/hooks/useGamification";
import { useAuth } from "@/hooks/useAuth";
import { useActionTracker } from "@/hooks/useActionTracker";
import { LevelUpModal } from "@/components/gamification/LevelUpModal";
import { OnboardingQuest } from "@/components/gamification/OnboardingQuest";
import { PhotoChallenge } from "@/components/gamification/PhotoChallenge";
import { FloatingXPBar } from "@/components/gamification/FloatingXPBar";
import { GuidedOnboardingTour } from "@/components/gamification/GuidedOnboardingTour";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AMBER_STORY_REWARDS } from "@/data/gamificacionHubData";
import { HubHero } from "@/components/gamificacion-hub/HubHero";
import { MissionsTeaser } from "@/components/gamificacion-hub/MissionsTeaser";
import { StoryQuestSection } from "@/components/gamificacion-hub/StoryQuestSection";
import { DailyWeeklyChallenges } from "@/components/gamificacion-hub/DailyWeeklyChallenges";
import { HowItWorksSection } from "@/components/gamificacion-hub/HowItWorksSection";
import { LeaderboardLeagueSection } from "@/components/gamificacion-hub/LeaderboardLeagueSection";
import { FeatureGrid } from "@/components/gamificacion-hub/FeatureGrid";
import { LevelsPreview } from "@/components/gamificacion-hub/LevelsPreview";
import { HubCTA } from "@/components/gamificacion-hub/HubCTA";

export default function GamificacionHub() {
  const { user } = useAuth();
  const {
    userGamification, levels, missions, userMissions, leaderboard,
    getCurrentLevel, getNextLevel, getXpProgress, awardXp
  } = useGamification();
  const { trackDailyCheckin } = useActionTracker();
  const [checkedIn, setCheckedIn] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const prevLevelRef = useRef<number | null>(null);

  // Story Quest State
  const [storyStage, setStoryStage] = useState<number>(() => {
    const saved = localStorage.getItem("amber_story_stage");
    return saved ? parseInt(saved, 10) : 1;
  });
  const [storyCompleted, setStoryCompleted] = useState<boolean>(() => {
    return localStorage.getItem("amber_story_completed") === "true";
  });

  // Web Push Notifications State (#34)
  const [pushSubscribed, setPushSubscribed] = useState<boolean>(() => {
    return localStorage.getItem("push_notifications_enabled") === "true";
  });

  const handleTogglePushNotifications = async () => {
    if (!("Notification" in window)) {
      toast.error("Tu navegador no soporta Notificaciones Web Push.");
      return;
    }

    if (pushSubscribed) {
      setPushSubscribed(false);
      localStorage.setItem("push_notifications_enabled", "false");
      toast.info("Notificaciones de racha y descensos desactivadas.");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setPushSubscribed(true);
      localStorage.setItem("push_notifications_enabled", "true");

      // Send sample browser notification
      if (navigator.serviceWorker?.controller) {
        new Notification("🔥 Descubre RD - Alerta de Racha", {
          body: "¡Notificaciones activadas! Te avisaremos 2 horas antes de que expire tu racha turística diaria.",
          icon: "/pwa-192x192.png",
        });
      }
      toast.success("🔔 ¡Notificaciones activadas! No perderás tu racha ni descenderás de liga.");
    } else {
      toast.error("Permiso de notificaciones denegado.");
    }
  };

  const handleAdvanceStory = async () => {
    if (!user) {
      toast.error("Inicia sesión para participar en la historia.");
      return;
    }

    const currentReward = AMBER_STORY_REWARDS[storyStage - 1];

    await awardXp(currentReward.xp, currentReward.coins, `📖 Historia: ${currentReward.desc}`);

    if (storyStage < 5) {
      const next = storyStage + 1;
      setStoryStage(next);
      localStorage.setItem("amber_story_stage", next.toString());
      toast.success(`¡Misión completada! Siguiente paso: ${next}/5`);
    } else {
      setStoryCompleted(true);
      localStorage.setItem("amber_story_completed", "true");

      // Auto unlock 'Ámbar Dominicano' achievement
      try {
        const { data: ach } = await supabase
          .from("achievements")
          .select("id")
          .eq("name", "Ámbar Dominicano")
          .maybeSingle();

        if (ach) {
          await supabase.rpc("unlock_user_achievement", {
            target_achievement_id: ach.id
          });
          toast.success("🏆 ¡Desbloqueaste la insignia: Ámbar Dominicano!", {
            description: "Has completado la historia del Ámbar"
          });
        }
      } catch (err) {
        console.error("Error auto-unlocking amber badge:", err);
      }
    }
  };

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const xpProgress = getXpProgress();
  const featuredMissions = missions.filter(m => m.is_featured).slice(0, 6);
  const teaserMissions = featuredMissions.length >= 3 ? featuredMissions : missions;

  // Daily missions
  const dailyMissions = useMemo(() => missions.filter(m => m.mission_type === "daily").slice(0, 3), [missions]);
  const weeklyMissions = useMemo(() => missions.filter(m => m.mission_type === "weekly").slice(0, 3), [missions]);

  // Auto daily check-in
  useEffect(() => {
    if (user && !checkedIn) {
      trackDailyCheckin().then(result => {
        if (result) setCheckedIn(true);
      });
    }
  }, [user, checkedIn, trackDailyCheckin]);

  // Detect level up (#49)
  useEffect(() => {
    if (!userGamification) return;
    const lv = userGamification.current_level;
    if (prevLevelRef.current !== null && lv > prevLevelRef.current) {
      setShowLevelUp(true);
    }
    prevLevelRef.current = lv;
  }, [userGamification?.current_level]);

  // Streak multiplier
  const streakDays = userGamification?.streak_days || 0;
  const multiplier = streakDays >= 30 ? 2.0 : streakDays >= 14 ? 1.75 : streakDays >= 7 ? 1.5 : streakDays >= 3 ? 1.25 : 1.0;
  const hasMultiplier = multiplier > 1.0;

  const getMissionProgress = (missionId: string) =>
    userMissions.find(um => um.mission_id === missionId);

  // Stats
  const completedCount = userMissions.filter(um => um.is_completed).length;
  const activeCount = userMissions.filter(um => !um.is_completed && um.progress > 0).length;

  return (
    <PageTransition>
      <SEOHead
        title="Gamificación - Explora, Juega y Descubre RD"
        description="Sistema de gamificación turística: completa retos, gana puntos, colecciona insignias y canjea premios explorando República Dominicana."
      />

      {/* Level Up Modal (#49) */}
      <LevelUpModal
        isOpen={showLevelUp}
        newLevel={userGamification?.current_level || 1}
        levelTitle={currentLevel?.title || "Explorador"}
        levelIcon={currentLevel?.icon || "🌱"}
        levelColor={currentLevel?.color || "#8B5CF6"}
        perks={currentLevel?.perks || []}
        onClose={() => setShowLevelUp(false)}
      />

      <div className="min-h-screen bg-background pb-20">
        <Header />

        <HubHero
          user={user}
          userGamification={userGamification}
          currentLevel={currentLevel}
          nextLevel={nextLevel}
          xpProgress={xpProgress}
          activeCount={activeCount}
          completedCount={completedCount}
        />

        {!user && missions.length > 0 && <MissionsTeaser missions={teaserMissions} />}

        {/* Onboarding Quest (#47) */}
        {user && (
          <div className="container mx-auto px-4 py-4">
            {/* Push Notifications Card (#34) */}
            <div className="mb-6 p-4 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  {pushSubscribed ? <BellRing className="h-5 w-5 text-emerald-500 animate-bounce" /> : <Bell className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground">Alertas de Racha & Descenso de Liga</h4>
                  <p className="text-xs text-muted-foreground">
                    {pushSubscribed
                      ? "Notificaciones push activas. Te avisaremos antes de que expire tu racha."
                      : "Activa notificaciones web para no perder tus puntos ni tu puesto en la liga."}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant={pushSubscribed ? "outline" : "default"}
                onClick={handleTogglePushNotifications}
                className={`text-xs shrink-0 gap-1.5 ${pushSubscribed ? "border-emerald-500 text-emerald-600" : ""}`}
              >
                {pushSubscribed ? <Check className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
                {pushSubscribed ? "Notificaciones Activas" : "Activar Notificaciones"}
              </Button>
            </div>

            <OnboardingQuest referralCode={null} />
          </div>
        )}

        {/* Story Quest Section (#29) */}
        {user && (
          <StoryQuestSection
            storyStage={storyStage}
            storyCompleted={storyCompleted}
            onAdvanceStory={handleAdvanceStory}
          />
        )}

        {/* Streak Multiplier Banner (#1) */}
        {user && hasMultiplier && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 border-y border-amber-500/20"
          >
            <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Flame className="h-5 w-5 text-orange-500 flex-shrink-0" />
                <div>
                  <span className="font-bold text-foreground text-sm">Multiplicador ×{multiplier} activo</span>
                  <span className="text-muted-foreground text-sm ml-2">— Racha de {streakDays} días</span>
                </div>
              </div>
              <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30 text-xs flex-shrink-0">
                {streakDays >= 30 ? "¡Racha Legendaria! 🔥" : streakDays >= 14 ? "¡Racha Élite! ⚡" : "¡Racha Activa! 🎯"}
              </Badge>
            </div>
          </motion.div>
        )}

        {user && (dailyMissions.length > 0 || weeklyMissions.length > 0) && (
          <DailyWeeklyChallenges
            dailyMissions={dailyMissions}
            weeklyMissions={weeklyMissions}
            getMissionProgress={getMissionProgress}
          />
        )}

        <HowItWorksSection />

        {/* Photo Challenge Section (#27) */}
        <section className="py-16 bg-card border-y border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <Badge className="mb-2 bg-primary/10 text-primary border-primary/20 gap-2">
                  <Camera className="h-3 w-3" /> Reto Semanal
                </Badge>
                <h2 className="font-display text-2xl font-bold text-foreground">Reto Fotográfico</h2>
                <p className="text-muted-foreground text-sm">Comparte tu mejor foto y compite por XP</p>
              </div>
            </div>
            <PhotoChallenge />
          </div>
        </section>

        <LeaderboardLeagueSection
          leaderboard={leaderboard}
          featuredMissions={featuredMissions}
          getMissionProgress={getMissionProgress}
          currentLevel={userGamification?.current_level || 1}
        />

        <FeatureGrid />

        <LevelsPreview levels={levels} currentLevelNumber={userGamification?.current_level} />

        <HubCTA user={user} />

        <Footer />
      </div>

      {/* Floating XP Bar (#45) */}
      <FloatingXPBar />

      {/* Guided Onboarding Tour (#47) */}
      <GuidedOnboardingTour />
    </PageTransition>
  );
}
