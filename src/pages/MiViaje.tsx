import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { TripPlanner } from "@/components/TripPlanner";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bookmark, MapPin, Star, ChevronRight, Calendar, Settings, Award, Sparkles, Heart, Route, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEOHead } from "@/components/SEOHead";

import puntaCana from "@/assets/punta-cana.jpg";
import { usePageContent } from "@/lib/pageContent";

export default function MiViaje() {
  const pc = usePageContent("mi-viaje");
  const { favorites, getFavoritesByType, totalCount } = useFavorites();
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return <div className="min-h-dvh flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // El planificador guarda itinerarios y favoritos en la cuenta: sin sesión se pide entrar o registrarse.
  if (!user) {
    return (
      <PageTransition>
        <SEOHead title={pc.t("SEOHead.title.1", "Mi Viaje: Planificador e Itinerario Personal")} description={pc.t("SEOHead.description.1", "Inicia sesión o crea una cuenta para planificar tu viaje a República Dominicana y guardar tu itinerario.")} />
        <div className="min-h-dvh bg-background flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center px-4 pt-28 pb-16">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-8 text-center space-y-4">
                <Route className="h-12 w-12 mx-auto text-primary" />
                <h1 className="font-display text-2xl font-bold">{pc.tx("h1.1", "Inicia sesión para planificar tu viaje")}</h1>
                <p className="text-muted-foreground">{pc.tx("p.1", "Con una cuenta puedes armar tu itinerario, guardar tus lugares favoritos y retomarlo desde cualquier dispositivo.")}</p>
                <div className="flex gap-3 justify-center">
                  <Button asChild><Link to="/login?returnTo=/mi-viaje">{pc.tx("Link.1", "Iniciar sesión")}</Link></Button>
                  <Button variant="outline" asChild><Link to="/registro">{pc.tx("Link.2", "Crear una cuenta")}</Link></Button>
                </div>
              </CardContent>
            </Card>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  const stats = [
    { icon: Bookmark, value: totalCount, label: "Lugares Guardados" },
    { icon: Route, value: 3, label: "Viajes Planeados" },
    { icon: Award, value: "85%", label: "Perfil Completado" },
  ];

  const recommendations = [
    { id: "cap-cana", name: "Cap Cana", desc: "Lujo y exclusividad a solo minutos del aeropuerto.", image: pc.img("asset.puntaCana", puntaCana) },
    { id: "puerto-plata", name: "Puerto Plata", desc: "Historia, teleférico y playas doradas.", image: "https://images.unsplash.com/photo-1590523278191-995cbcda646b?w=200&h=150&fit=crop" },
    { id: "bayahibe", name: "Bayahíbe", desc: "El mejor atardecer y puerta a Isla Saona.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=150&fit=crop" },
  ];

  return (
    <PageTransition>
      <SEOHead
        title={pc.t("SEOHead.title.2", "Mi Viaje: Planificador e Itinerario Personal")}
        description={pc.t("SEOHead.description.2", "Organiza tu viaje a República Dominicana: planifica tu itinerario, guarda tus destinos, hoteles y experiencias favoritas, y recibe recomendaciones personalizadas.")}
      />
      <div className="min-h-dvh flex flex-col bg-background">
        <Header />

        {/* Profile Section */}
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <span className="text-3xl">👋</span>
              </div>
              <div className="text-center md:text-left flex-1">
                <h1 className="font-display text-3xl font-bold text-foreground mb-1">{pc.tx("h1.2", "Hola, Viajero")}</h1>
                <p className="text-muted-foreground mb-2">{pc.tx("p.2", "Explorador entusiasta | Próxima parada: República Dominicana")}</p>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Badge className="bg-primary/20 text-primary">{pc.tx("Badge.1", "Miembro VIP")}</Badge>
                  <span className="text-sm text-muted-foreground">{pc.tx("span.1", "Desde 2024")}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />{" "}{pc.tx("Button.1", "Editar Perfil")}</Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto md:mx-0">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="itinerario" className="w-full">
              <TabsList className="bg-card border border-border mb-8">
                <TabsTrigger value="itinerario" className="gap-2">
                  <Calendar className="h-4 w-4" />{" "}{pc.tx("TabsTrigger.1", "Planificador")}</TabsTrigger>
                <TabsTrigger value="favoritos" className="gap-2">
                  <Heart className="h-4 w-4" />{" "}{pc.tx("TabsTrigger.2", "Mis Favoritos")}</TabsTrigger>
              </TabsList>

              <TabsContent value="itinerario">
                <TripPlanner />
              </TabsContent>

              <TabsContent value="favoritos">
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <Tabs defaultValue="destinos">
                      <TabsList className="mb-6">
                        <TabsTrigger value="destinos">{pc.tx("TabsTrigger.3", "Destinos")}</TabsTrigger>
                        <TabsTrigger value="hoteles">{pc.tx("TabsTrigger.4", "Hoteles")}</TabsTrigger>
                        <TabsTrigger value="experiencias">{pc.tx("TabsTrigger.5", "Experiencias")}</TabsTrigger>
                      </TabsList>

                      <TabsContent value="destinos">
                        {getFavoritesByType("destino").length === 0 ? (
                          <div className="text-center py-12 bg-card rounded-xl border border-border">
                            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">{pc.tx("p.3", "Aún no tienes destinos favoritos")}</p>
                            <Link to="/destinos">
                              <Button variant="outline">{pc.tx("Button.2", "Explorar Destinos")}</Button>
                            </Link>
                          </div>
                        ) : (
                          <div className="grid md:grid-cols-2 gap-4">
                            {getFavoritesByType("destino").map((item) => (
                              <Link key={item.id} to={`/destino/${item.id}`}>
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  className="bg-card rounded-xl border border-border overflow-hidden flex"
                                >
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-32 h-28 object-cover"
                                  />
                                  <div className="p-4 flex-1">
                                    <h2 className="h3 font-semibold text-foreground">{item.name}</h2>
                                    {item.location && (
                                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> {item.location}
                                      </p>
                                    )}
                                    <Button size="sm" variant="link" className="px-0 mt-2 text-primary gap-1">{pc.tx("Button.3", "Ver Detalles")}{" "}<ChevronRight className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </motion.div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="hoteles">
                        {getFavoritesByType("hotel").length === 0 ? (
                          <div className="text-center py-12 bg-card rounded-xl border border-border">
                            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">{pc.tx("p.4", "Aún no tienes hoteles favoritos")}</p>
                            <Link to="/alojamientos">
                              <Button variant="outline">{pc.tx("Button.4", "Explorar Hoteles")}</Button>
                            </Link>
                          </div>
                        ) : (
                          <div className="grid md:grid-cols-2 gap-4">
                            {getFavoritesByType("hotel").map((item) => (
                              <Link key={item.id} to={`/alojamiento/${item.id}`}>
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  className="bg-card rounded-xl border border-border overflow-hidden flex"
                                >
                                  <img src={item.image} alt={item.name} className="w-32 h-28 object-cover" />
                                  <div className="p-4 flex-1">
                                    <h2 className="h3 font-semibold text-foreground">{item.name}</h2>
                                    {item.location && (
                                      <p className="text-sm text-muted-foreground">{item.location}</p>
                                    )}
                                  </div>
                                </motion.div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="experiencias">
                        {getFavoritesByType("experiencia").length === 0 ? (
                          <div className="text-center py-12 bg-card rounded-xl border border-border">
                            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">{pc.tx("p.5", "Aún no tienes experiencias favoritas")}</p>
                            <Link to="/experiencias">
                              <Button variant="outline">{pc.tx("Button.5", "Explorar Experiencias")}</Button>
                            </Link>
                          </div>
                        ) : (
                          <div className="grid md:grid-cols-2 gap-4">
                            {getFavoritesByType("experiencia").map((item) => (
                              <Link key={item.id} to={`/experiencia/${item.id}`}>
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  className="bg-card rounded-xl border border-border overflow-hidden flex"
                                >
                                  <img src={item.image} alt={item.name} className="w-32 h-28 object-cover" />
                                  <div className="p-4 flex-1">
                                    <h2 className="h3 font-semibold text-foreground">{item.name}</h2>
                                  </div>
                                </motion.div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* Recommendations Sidebar */}
                  <div>
                    <div className="bg-card rounded-xl border border-border p-5 sticky top-24">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <h2 className="h3 font-semibold text-foreground">{pc.tx("h3.1", "Para Ti")}</h2>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{pc.tx("p.6", "Porque te gustó")}{" "}<span className="text-primary">{pc.tx("span.2", "Punta Cana")}</span>
                      </p>

                      <div className="space-y-3">
                        {recommendations.map((rec) => (
                          <Link key={rec.id} to={`/destino/${rec.id}`}>
                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                              <img
                                src={rec.image}
                                alt={rec.name}
                                className="w-14 h-14 rounded-lg object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground text-sm">{rec.name}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2">{rec.desc}</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>

                      <Button variant="link" className="w-full mt-4 text-primary gap-1">{pc.tx("Button.6", "Ver más sugerencias")}{" "}<ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
