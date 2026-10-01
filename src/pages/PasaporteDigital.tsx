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

        <section aria-labelledby="passport-how-it-works" className="container mx-auto px-4 pb-4">
          <Card className="overflow-hidden border-emerald-900/15 bg-gradient-to-r from-emerald-950 to-emerald-900 text-white">
            <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_1.4fr] md:items-center md:p-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-amber-200">Tu ruta de exploración</p>
                <h2 id="passport-how-it-works" className="mt-2 font-display text-2xl font-bold">Cada visita suma una historia.</h2>
                <p className="mt-2 text-sm leading-6 text-emerald-50/80">Registra visitas y completa rutas para reunir sellos. Las acciones elegibles pueden generar XP o monedas, sujetas a validación y topes.</p>
              </div>
              <ol className="grid gap-3 sm:grid-cols-3">
                {[
                  ["01", "Explora", "Elige un destino o punto de interés."],
                  ["02", "Acredita", "Completa el método de verificación disponible."],
                  ["03", "Avanza", "Revisa tus sellos, nivel y progreso."],
                ].map(([step, title, detail]) => (
                  <li key={step} className="border-l border-amber-200/50 pl-3">
                    <span className="font-mono text-xs text-amber-200">{step}</span>
                    <h3 className="mt-1 font-semibold">{title}</h3>
                    <p className="mt-1 text-xs leading-5 text-emerald-50/70">{detail}</p>
                  </li>
                ))}
              </ol>
              {totalStamps === 0 && (
                <div className="flex flex-col gap-3 border-t border-white/15 pt-4 sm:flex-row sm:items-center sm:justify-between md:col-span-2">
                  <p className="text-sm text-emerald-50/80">Tu pasaporte aún no tiene sellos. Puedes comenzar explorando un destino y consultar cómo acreditar la visita.</p>
                  <Button onClick={() => navigate("/destinos")} className="w-fit bg-amber-300 text-emerald-950 hover:bg-amber-200">Buscar destinos</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

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
