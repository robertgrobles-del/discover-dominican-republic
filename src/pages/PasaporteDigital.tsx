import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar, CircularProgress } from "@/components/ui/progress-bar";
import {
  MapPin,
  Trophy,
  Star,
  Award,
  Gift,
  Camera,
  Mountain,
  Waves,
  Utensils,
  Landmark,
  Lock,
  QrCode,
  Share2,
  TrendingUp,
  Ticket,
  Map,
  Calendar,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useGamification } from "@/hooks/useGamification";
import { usePassport } from "@/hooks/usePassport";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function PasaporteDigital() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    userGamification,
    getCurrentLevel,
    getNextLevel,
    getXpProgress,
    leaderboard,
    loading: gamificationLoading,
  } = useGamification();

  const {
    stamps,
    routes,
    userRouteProgress,
    collectibles,
    userCollectibles,
    getStampsByType,
    getRouteProgress,
    getCollectiblesByRarity,
    loading: passportLoading,
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

  const loading = gamificationLoading || passportLoading;
  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const xpProgress = getXpProgress();

  const totalStamps = stamps.length;
  const recentStamps = stamps.slice(0, 5);

  const activeRoutes = userRouteProgress.filter(p => !p.is_completed);
  const completedRoutes = userRouteProgress.filter(p => p.is_completed);

  const ownedCollectibles = userCollectibles.length;
  const legendaryCollectibles = getCollectiblesByRarity("legendary").length;
  const epicCollectibles = getCollectiblesByRarity("epic").length;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Profile Header */}
        <section className="pt-24 pb-8">
          <div className="container mx-auto px-4">
            <Card className="border-primary/20">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                        <Star className="h-10 w-10 text-primary" />
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Award className="h-4 w-4 text-primary-foreground fill-current" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h1 className="font-display text-3xl font-bold mb-1">
                      {currentLevel?.title || "Explorador"}
                    </h1>
                    <p className="text-muted-foreground mb-4">
                      Nivel {userGamification?.current_level || 1} • {userGamification?.total_xp || 0} XP Total
                    </p>
                    
                    {/* XP Progress */}
                    <div className="max-w-md">
                      <ProgressBar
                        value={xpProgress}
                        label="Progreso al siguiente nivel"
                        variant="gradient"
                        size="md"
                      />
                      {nextLevel && (
                        <p className="text-sm text-primary mt-2">
                          Siguiente: {nextLevel.title}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button className="gap-2">
                      <QrCode className="h-4 w-4" /> Escanear Código
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Share2 className="h-4 w-4" /> Compartir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-blue-500" />
                      </div>
                      <span className="text-sm text-muted-foreground">Sellos</span>
                    </div>
                    <p className="text-3xl font-bold">{totalStamps}</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-green-500" />
                      </div>
                      <span className="text-sm text-muted-foreground">Rutas</span>
                    </div>
                    <p className="text-3xl font-bold">{completedRoutes.length}</p>
                    <p className="text-xs text-muted-foreground">{activeRoutes.length} activas</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <Gift className="h-5 w-5 text-purple-500" />
                      </div>
                      <span className="text-sm text-muted-foreground">Coleccionables</span>
                    </div>
                    <p className="text-3xl font-bold">{ownedCollectibles}</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                        <Award className="h-5 w-5 text-yellow-500" />
                      </div>
                      <span className="text-sm text-muted-foreground">Monedas</span>
                    </div>
                    <p className="text-3xl font-bold">{userGamification?.coins || 0}</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="stamps">Sellos</TabsTrigger>
                <TabsTrigger value="routes">Rutas</TabsTrigger>
                <TabsTrigger value="collectibles">Coleccionables</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Recent Stamps */}
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-primary" />
                          Sellos Recientes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {recentStamps.length === 0 ? (
                          <p className="text-muted-foreground text-center py-8">
                            Aún no tienes sellos. ¡Visita destinos para comenzar!
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {recentStamps.map((stamp) => (
                              <div
                                key={stamp.id}
                                className="flex items-center gap-4 p-3 rounded-lg border"
                              >
                                {stamp.stamp_image && (
                                  <img
                                    src={stamp.stamp_image}
                                    alt={stamp.stamp_name}
                                    className="w-16 h-16 rounded object-cover"
                                  />
                                )}
                                <div className="flex-1">
                                  <h4 className="font-semibold">{stamp.stamp_name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {stamp.stamp_location}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(stamp.visited_at).toLocaleDateString("es-DO")}
                                  </p>
                                </div>
                                {stamp.is_verified && (
                                  <Badge className="bg-green-500/10 text-green-500">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Verificado
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Leaderboard */}
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-yellow-500" />
                          Top Exploradores
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {leaderboard.slice(0, 5).map((entry, index) => (
                            <div key={entry.user_id} className="flex items-center gap-3">
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  index === 0
                                    ? "bg-yellow-500 text-white"
                                    : index === 1
                                    ? "bg-gray-400 text-white"
                                    : "bg-orange-600 text-white"
                                }`}
                              >
                                {index + 1}
                              </span>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{entry.display_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {entry.total_xp.toLocaleString()} XP
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Stamps Tab */}
              <TabsContent value="stamps">
                <Card>
                  <CardHeader>
                    <CardTitle>Colección de Sellos ({totalStamps})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stamps.length === 0 ? (
                      <div className="text-center py-12">
                        <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          Comienza a explorar República Dominicana y colecciona sellos
                        </p>
                        <Button className="mt-4" onClick={() => navigate("/destinos")}>
                          Ver Destinos
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {stamps.map((stamp) => (
                          <Card key={stamp.id} className="overflow-hidden">
                            {stamp.stamp_image && (
                              <img
                                src={stamp.stamp_image}
                                alt={stamp.stamp_name}
                                className="w-full h-32 object-cover"
                              />
                            )}
                            <CardContent className="p-3">
                              <h4 className="font-semibold text-sm mb-1">{stamp.stamp_name}</h4>
                              <p className="text-xs text-muted-foreground mb-2">
                                {stamp.stamp_location}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {new Date(stamp.visited_at).toLocaleDateString("es-DO")}
                              </Badge>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Routes Tab */}
              <TabsContent value="routes">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Rutas Activas ({activeRoutes.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {activeRoutes.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                          No tienes rutas activas
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {activeRoutes.map((progress) => {
                            const route = routes.find(r => r.id === progress.route_id);
                            if (!route) return null;
                            
                            return (
                              <div key={progress.id} className="border rounded-lg p-4">
                                <h4 className="font-semibold mb-2">{route.name}</h4>
                                <ProgressBar
                                  value={progress.completion_percentage}
                                  label="Progreso"
                                  variant="gradient"
                                />
                                <div className="flex justify-between text-sm mt-2">
                                  <span className="text-muted-foreground">
                                    {progress.checkpoints_completed} / {progress.total_checkpoints} checkpoints
                                  </span>
                                  <span className="text-primary">
                                    +{progress.total_xp_earned} XP
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Rutas Disponibles</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {routes.filter(r => !userRouteProgress.some(p => p.route_id === r.id)).length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                          No hay rutas nuevas disponibles
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {routes
                            .filter(r => !userRouteProgress.some(p => p.route_id === r.id))
                            .slice(0, 3)
                            .map((route) => (
                              <div key={route.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-semibold">{route.name}</h4>
                                  {route.is_featured && (
                                    <Badge className="bg-yellow-500/10 text-yellow-500">
                                      Destacada
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                  {route.short_description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <div className="flex gap-3 text-xs">
                                    <span className="text-primary">+{route.total_xp_reward} XP</span>
                                    {route.difficulty && (
                                      <Badge variant="outline">{route.difficulty}</Badge>
                                    )}
                                  </div>
                                  <Button size="sm">Iniciar</Button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Collectibles Tab */}
              <TabsContent value="collectibles">
                <Card>
                  <CardHeader>
                    <CardTitle>Colección ({ownedCollectibles} / {collectibles.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {collectibles.map((collectible) => {
                        const owned = userCollectibles.some(uc => uc.collectible_id === collectible.id);
                        
                        const rarityColors = {
                          common: "bg-gray-500/10 text-gray-500",
                          uncommon: "bg-green-500/10 text-green-500",
                          rare: "bg-blue-500/10 text-blue-500",
                          epic: "bg-purple-500/10 text-purple-500",
                          legendary: "bg-yellow-500/10 text-yellow-500",
                        };

                        return (
                          <div
                            key={collectible.id}
                            className={`border rounded-lg p-4 text-center ${
                              !owned && "opacity-40 grayscale"
                            }`}
                          >
                            {collectible.image_url && (
                              <img
                                src={collectible.image_url}
                                alt={collectible.name}
                                className="w-full h-24 object-contain mb-2"
                              />
                            )}
                            <h4 className="font-semibold text-sm mb-1">{collectible.name}</h4>
                            <Badge className={rarityColors[collectible.rarity]}>
                              {collectible.rarity}
                            </Badge>
                            {!owned && (
                              <p className="text-xs text-muted-foreground mt-2">
                                <Lock className="h-3 w-3 inline mr-1" />
                                Bloqueado
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
