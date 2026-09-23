import { useState } from "react";
import { motion } from "framer-motion";
import { Bike, MapPin, Clock, TrendingUp, Mountain, Droplets, Sun, Wind, Filter, Calendar, Users, Star } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import raftingImg from "@/assets/rafting.jpg";
import samanaImg from "@/assets/samana.jpg";
import puertoPlataImg from "@/assets/puerto-plata.jpg";

const routes = {
  running: [
    {
      id: "malecon-sd",
      name: "Malecón Santo Domingo",
      distance: "8.5 km",
      difficulty: "Fácil",
      elevation: "Plano",
      image: samanaImg,
      rating: 4.8,
      description: "Ruta costera con vistas al Mar Caribe, ideal para correr al amanecer.",
      highlights: ["Vista al mar", "Iluminado", "Puntos de agua"],
    },
    {
      id: "mirador-sur",
      name: "Parque Mirador Sur",
      distance: "12 km",
      difficulty: "Fácil",
      elevation: "50m",
      image: puertoPlataImg,
      rating: 4.9,
      description: "El parque lineal más grande de Santo Domingo, perfecto para entrenar.",
      highlights: ["Zonas verdes", "Ciclovía", "Seguridad"],
    },
    {
      id: "jarabacoa-trail",
      name: "Sendero Jarabacoa",
      distance: "15 km",
      difficulty: "Difícil",
      elevation: "450m",
      image: raftingImg,
      rating: 4.7,
      description: "Trail running en las montañas con vistas espectaculares.",
      highlights: ["Naturaleza", "Cascadas", "Altura"],
    },
  ],
  cycling: [
    {
      id: "constanza-loop",
      name: "Valle de Constanza",
      distance: "45 km",
      difficulty: "Moderada",
      elevation: "800m",
      image: raftingImg,
      rating: 4.9,
      description: "Ruta ciclista por el valle más fértil de RD con clima fresco.",
      highlights: ["Paisajes", "Clima fresco", "Poco tráfico"],
    },
    {
      id: "samana-coast",
      name: "Costa de Samaná",
      distance: "60 km",
      difficulty: "Moderada",
      elevation: "350m",
      image: samanaImg,
      rating: 4.8,
      description: "Ruta costera con playas vírgenes y pueblos pescadores.",
      highlights: ["Playas", "Cocoteros", "Gastronomía"],
    },
    {
      id: "pico-duarte",
      name: "Ruta al Pico Duarte",
      distance: "80 km",
      difficulty: "Extrema",
      elevation: "2,500m",
      image: puertoPlataImg,
      rating: 5.0,
      description: "Desafío épico hacia el techo del Caribe (solo para expertos).",
      highlights: ["Montaña", "Reto extremo", "Vistas únicas"],
    },
  ],
};

const events = [
  { name: "Santo Domingo Marathon", date: "Marzo 2027", type: "Running", participants: "5,000+" },
  { name: "RD Bike Tour", date: "Abril 2027", type: "Ciclismo", participants: "2,500+" },
  { name: "Trail Jarabacoa", date: "Mayo 2027", type: "Trail", participants: "800+" },
  { name: "Triatlón Samaná", date: "Junio 2027", type: "Multi", participants: "1,200+" },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Fácil": return "bg-green-500/20 text-green-600";
    case "Moderada": return "bg-amber-500/20 text-amber-600";
    case "Difícil": return "bg-orange-500/20 text-orange-600";
    case "Extrema": return "bg-red-500/20 text-red-600";
    default: return "bg-primary/20 text-primary";
  }
};

export default function RDEnMovimiento() {
  const [selectedTab, setSelectedTab] = useState("running");

  return (
    <PageTransition>
      <SEOHead
        title="RD en Movimiento: Running y Ciclismo | Turismo RD"
        description="Descubre las mejores rutas de running y ciclismo en República Dominicana. Eventos, mapas y comunidad."
        keywords="running, ciclismo, bicicleta, rutas, maratón, República Dominicana, deportes"
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full mb-6">
                <Bike className="h-5 w-5" />
                <span className="font-medium">RD en Movimiento</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Running y <span className="text-primary">Ciclismo</span>
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                Explora la isla sobre dos ruedas o a pie. Las mejores rutas, 
                eventos y comunidades deportivas te esperan.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg">Explorar Rutas</Button>
                <Button size="lg" variant="outline">Ver Eventos</Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-primary">150+</p>
                <p className="text-sm text-muted-foreground">Rutas mapeadas</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">25</p>
                <p className="text-sm text-muted-foreground">Eventos anuales</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">50K+</p>
                <p className="text-sm text-muted-foreground">Atletas activos</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">12</p>
                <p className="text-sm text-muted-foreground">Clubes afiliados</p>
              </div>
            </div>
          </div>
        </section>

        {/* Routes */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                  <h2 className="font-display text-3xl font-bold mb-2">
                    Rutas <span className="text-primary">Destacadas</span>
                  </h2>
                  <p className="text-muted-foreground">
                    Selecciona tu disciplina y encuentra la ruta perfecta.
                  </p>
                </div>
                <TabsList>
                  <TabsTrigger value="running" className="gap-2">
                    🏃 Running
                  </TabsTrigger>
                  <TabsTrigger value="cycling" className="gap-2">
                    🚴 Ciclismo
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="running">
                <div className="grid md:grid-cols-3 gap-6">
                  {routes.running.map((route, index) => (
                    <motion.div
                      key={route.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden group h-full">
                        <div className="relative h-48">
                          <img
                            src={route.image}
                            alt={route.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <Badge className={`absolute top-4 left-4 ${getDifficultyColor(route.difficulty)}`}>
                            {route.difficulty}
                          </Badge>
                        </div>
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-display text-lg font-bold">{route.name}</h3>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                              <span className="text-sm font-medium">{route.rating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">{route.description}</p>
                          <div className="flex items-center gap-4 text-sm mb-4">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-primary" />
                              {route.distance}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4 text-primary" />
                              {route.elevation}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {route.highlights.map((h) => (
                              <Badge key={h} variant="outline" className="text-xs">{h}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="cycling">
                <div className="grid md:grid-cols-3 gap-6">
                  {routes.cycling.map((route, index) => (
                    <motion.div
                      key={route.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden group h-full">
                        <div className="relative h-48">
                          <img
                            src={route.image}
                            alt={route.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <Badge className={`absolute top-4 left-4 ${getDifficultyColor(route.difficulty)}`}>
                            {route.difficulty}
                          </Badge>
                        </div>
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-display text-lg font-bold">{route.name}</h3>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                              <span className="text-sm font-medium">{route.rating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">{route.description}</p>
                          <div className="flex items-center gap-4 text-sm mb-4">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-primary" />
                              {route.distance}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mountain className="h-4 w-4 text-primary" />
                              {route.elevation}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {route.highlights.map((h) => (
                              <Badge key={h} variant="outline" className="text-xs">{h}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="font-display text-3xl font-bold mb-4">
                Próximos <span className="text-primary">Eventos</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {events.map((event, index) => (
                <motion.div
                  key={event.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 h-full text-center">
                    <Badge className="mb-3">{event.type}</Badge>
                    <h3 className="font-bold mb-2">{event.name}</h3>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4" />
                      {event.date}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                      <Users className="h-4 w-4" />
                      {event.participants} participantes
                    </div>
                    <Button className="w-full" variant="outline">Inscribirse</Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
