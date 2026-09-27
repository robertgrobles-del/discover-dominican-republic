import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { useGamification } from "@/hooks/useGamification";
import { usePassport } from "@/hooks/usePassport";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

import { PassportProfileHeader } from "@/components/passport/PassportProfileHeader";
import { PassportStatsGrid } from "@/components/passport/PassportStatsGrid";
import { PassportOverviewTab } from "@/components/passport/PassportOverviewTab";
import { PassportStampsTab } from "@/components/passport/PassportStampsTab";
import { PassportRoutesTab } from "@/components/passport/PassportRoutesTab";
import { PassportCollectiblesTab } from "@/components/passport/PassportCollectiblesTab";
import { PassportSeasonsTab } from "@/components/passport/PassportSeasonsTab";

export default function PasaporteDigital() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    userGamification,
    getCurrentLevel,
    getNextLevel,
    getXpProgress,
    leaderboard,
  } = useGamification();

  const {
    stamps,
    routes,
    userRouteProgress,
    collectibles,
    userCollectibles,
  } = usePassport();

  const [activeTab, setActiveTab] = useState("overview");

  if (!user) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-24">
            <Card>
              <CardContent className="py-12 text-center">
                <h2 className="text-2xl font-bold mb-4">Inicia sesión para acceder a tu pasaporte</h2>
                <Button onClick={() => navigate("/login")}>Iniciar Sesión</Button>
              </CardContent>
            </Card>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const xpProgress = getXpProgress();

  const totalStamps = stamps.length;
  const recentStamps = stamps.slice(0, 5);

  const activeRoutes = userRouteProgress.filter(p => !p.is_completed);
  const completedRoutes = userRouteProgress.filter(p => p.is_completed);
  const ownedCollectibles = userCollectibles.length;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Profile Header */}
        <PassportProfileHeader
          currentLevelTitle={currentLevel?.title}
          currentLevelNumber={userGamification?.current_level || 1}
          totalXp={userGamification?.total_xp || 0}
          xpProgress={xpProgress}
          nextLevelTitle={nextLevel?.title}
        />

        {/* Stats Cards */}
        <PassportStatsGrid
          totalStamps={totalStamps}
          completedRoutesCount={completedRoutes.length}
          activeRoutesCount={activeRoutes.length}
          ownedCollectibles={ownedCollectibles}
          coins={userGamification?.coins || 0}
        />

        {/* Tabs Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5 mb-8">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="stamps">Sellos</TabsTrigger>
                <TabsTrigger value="routes">Rutas</TabsTrigger>
                <TabsTrigger value="collectibles">Coleccionables</TabsTrigger>
                <TabsTrigger value="seasons" className="gap-1 text-amber-500 font-bold">
                  <Calendar className="h-3.5 w-3.5" /> Temporada
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview">
                <PassportOverviewTab
                  recentStamps={recentStamps}
                  leaderboard={leaderboard}
                />
              </TabsContent>

              {/* Stamps Tab */}
              <TabsContent value="stamps">
                <PassportStampsTab stamps={stamps} />
              </TabsContent>

              {/* Routes Tab */}
              <TabsContent value="routes">
                <PassportRoutesTab
                  routes={routes}
                  activeRoutes={activeRoutes}
                  userRouteProgress={userRouteProgress}
                />
              </TabsContent>

              {/* Collectibles Tab */}
              <TabsContent value="collectibles">
                <PassportCollectiblesTab
                  collectibles={collectibles}
                  userCollectibles={userCollectibles}
                  ownedCollectiblesCount={ownedCollectibles}
                />
              </TabsContent>

              {/* Seasons & Battle Pass Tab */}
              <TabsContent value="seasons">
                <PassportSeasonsTab />
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
