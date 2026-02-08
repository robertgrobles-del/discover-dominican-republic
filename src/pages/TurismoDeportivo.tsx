import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Target,
  Mountain,
  Waves,
  Bike,
  Dumbbell,
  MapPin,
  Calendar,
  Clock,
  Star,
  ChevronRight,
  Users,
  Ticket,
  Flag,
} from "lucide-react";
import { Link } from "react-router-dom";
import { GolfSection } from "@/components/sports/GolfSection";
import { BetweenSectionsAd, CompactInlineAd } from "@/components/ads";

const sports = [
  {
    icon: Target,
    title: "Golf",
    description: "12 campos diseñados por leyendas como Pete Dye y Jack Nicklaus.",
    destinations: ["Casa de Campo", "Punta Cana", "Cap Cana"],
    season: "Todo el año",
    color: "bg-green-500",
  },
  {
    icon: Waves,
    title: "Surf & Kitesurf",
    description: "Las mejores condiciones de viento del Caribe en Cabarete.",
    destinations: ["Cabarete", "Las Terrenas", "Playa Encuentro"],
    season: "Dic - Ago",
    color: "bg-blue-500",
  },
  {
    icon: Mountain,
    title: "Senderismo",
    description: "Escala el Pico Duarte, la cima más alta del Caribe.",
    destinations: ["Jarabacoa", "Constanza", "Valle Nuevo"],
    season: "Nov - Abr",
    color: "bg-amber-500",
  },
  {
    icon: Bike,
    title: "Ciclismo",
    description: "Rutas de montaña y carretera con paisajes espectaculares.",
    destinations: ["Cordillera Central", "Puerto Plata", "Samaná"],
    season: "Todo el año",
    color: "bg-red-500",
  },
  {
    icon: Waves,
    title: "Buceo",
    description: "Arrecifes de coral, cuevas submarinas y naufragios históricos.",
    destinations: ["Bayahíbe", "Samaná", "Sosúa"],
    season: "Todo el año",
    color: "bg-cyan-500",
  },
  {
    icon: Dumbbell,
    title: "Béisbol",
    description: "La pasión nacional. Vive la Liga de Béisbol Dominicano.",
    destinations: ["Santo Domingo", "Santiago", "La Romana"],
    season: "Oct - Ene",
    color: "bg-orange-500",
  },
];

const stadiums = [
  {
    name: "Estadio Quisqueya Juan Marichal",
    location: "Santo Domingo",
    capacity: "18,000",
    teams: ["Tigres del Licey", "Leones del Escogido"],
    image: "https://images.unsplash.com/photo-1567598508481-65985588e295?w=400",
    sport: "Béisbol",
  },
  {
    name: "Estadio Cibao",
    location: "Santiago",
    capacity: "16,500",
    teams: ["Águilas Cibaeñas"],
    image: "https://images.unsplash.com/photo-1569863959165-56dae551d4fc?w=400",
    sport: "Béisbol",
  },
  {
    name: "Teeth of the Dog",
    location: "Casa de Campo, La Romana",
    capacity: "18 hoyos",
    teams: ["Campo #1 del Caribe"],
    image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400",
    sport: "Golf",
  },
];

const hikingRoutes = [
  {
    name: "Pico Duarte",
    difficulty: "Difícil",
    duration: "2-3 días",
    altitude: "3,098m",
    description: "La cima más alta del Caribe. Una experiencia épica de montañismo.",
    startPoint: "La Ciénaga, Jarabacoa",
  },
  {
    name: "Salto de Jimenoa",
    difficulty: "Fácil",
    duration: "2 horas",
    altitude: "400m",
    description: "Cascada impresionante con sendero bien marcado.",
    startPoint: "Jarabacoa",
  },
  {
    name: "Valle Nuevo",
    difficulty: "Moderado",
    duration: "1 día",
    altitude: "2,200m",
    description: "Bosque de pinos y las temperaturas más bajas del país.",
    startPoint: "Constanza",
  },
];

const upcomingEvents = [
  {
    title: "Campeonato de Golf del Caribe",
    date: "15-18 Mar 2024",
    location: "Casa de Campo",
    category: "Golf",
  },
  {
    title: "Santo Domingo Half Marathon",
    date: "28 Abr 2024",
    location: "Santo Domingo",
    category: "Running",
  },
  {
    title: "Master of the Ocean",
    date: "Feb 2024",
    location: "Cabarete",
    category: "Deportes Acuáticos",
  },
];

export default function TurismoDeportivo() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-900/90 via-red-900/80 to-amber-900/90" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1920')] bg-cover bg-center opacity-30" />
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <span className="inline-flex items-center gap-2 text-orange-300 text-sm font-medium mb-4">
                <Trophy className="h-4 w-4" />
                Aventura y Deporte
              </span>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
                Turismo Deportivo en <span className="text-orange-400">República Dominicana</span>
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Desde el golf de clase mundial hasta el senderismo en la cima más alta del Caribe. 
                Vive la adrenalina en el paraíso tropical.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gap-2 bg-white text-orange-900 hover:bg-white/90">
                  <Calendar className="h-4 w-4" />
                  Ver Eventos
                </Button>
                <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                  Explorar Deportes
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tabs for different sports */}
        <section className="py-8">
          <div className="container mx-auto px-4 lg:px-8">
            <Tabs defaultValue="todos" className="w-full">
              <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 h-auto gap-2 bg-transparent mb-8">
                <TabsTrigger value="todos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3">
                  Todos
                </TabsTrigger>
                <TabsTrigger value="golf" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3">
                  ⛳ Golf
                </TabsTrigger>
                <TabsTrigger value="senderismo" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3">
                  🥾 Senderismo
                </TabsTrigger>
                <TabsTrigger value="acuaticos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3">
                  🏄 Acuáticos
                </TabsTrigger>
              </TabsList>

              {/* TAB: TODOS */}
              <TabsContent value="todos">
                <section className="py-12">
                  <div className="container mx-auto">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="text-center mb-12"
                    >
                      <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                        Deportes y <span className="text-gradient">Actividades</span>
                      </h2>
                      <p className="text-muted-foreground max-w-2xl mx-auto">
                        Desde golf de campeonato hasta aventuras extremas en la montaña.
                      </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sports.map((sport, index) => (
                        <motion.div
                          key={sport.title}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="group bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-all hover:shadow-lg"
                        >
                          <div className={`w-12 h-12 rounded-xl ${sport.color} flex items-center justify-center mb-4`}>
                            <sport.icon className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="font-display text-xl font-bold text-foreground mb-2">{sport.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4">{sport.description}</p>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span className="text-muted-foreground">{sport.destinations.join(", ")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span className="text-muted-foreground">Temporada: {sport.season}</span>
                            </div>
                          </div>
                          <Button variant="link" className="text-primary p-0 mt-4 gap-1">
                            Ver más
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </section>
              </TabsContent>

              {/* TAB: GOLF */}
              <TabsContent value="golf">
                <GolfSection />
              </TabsContent>

              {/* TAB: SENDERISMO - Uses existing hiking routes */}
              <TabsContent value="senderismo">
                <section className="py-12">
                  <div className="container mx-auto">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="text-center mb-12"
                    >
                      <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                        Rutas de <span className="text-gradient">Senderismo</span>
                      </h2>
                      <p className="text-muted-foreground max-w-2xl mx-auto">
                        Desde caminatas fáciles hasta expediciones de montaña en la Cordillera Central.
                      </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                      {hikingRoutes.map((route, index) => (
                        <motion.div
                          key={route.name}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-card rounded-2xl p-6 border border-border"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-display text-xl font-bold text-foreground">{route.name}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              route.difficulty === "Fácil" ? "bg-green-500/20 text-green-500" :
                              route.difficulty === "Moderado" ? "bg-amber-500/20 text-amber-500" :
                              "bg-red-500/20 text-red-500"
                            }`}>
                              {route.difficulty}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">{route.description}</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4 text-primary" />
                              Duración: {route.duration}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mountain className="h-4 w-4 text-primary" />
                              Altitud: {route.altitude}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Flag className="h-4 w-4 text-primary" />
                              Inicio: {route.startPoint}
                            </div>
                          </div>
                          <Button className="w-full mt-4" variant="outline">
                            Agregar al Plan de Viaje
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </section>
              </TabsContent>

              {/* TAB: ACUATICOS */}
              <TabsContent value="acuaticos">
                <section className="py-12">
                  <div className="container mx-auto">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="text-center mb-12"
                    >
                      <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                        Deportes <span className="text-gradient">Acuáticos</span>
                      </h2>
                      <p className="text-muted-foreground max-w-2xl mx-auto">
                        Las mejores condiciones del Caribe para surf, kitesurf, buceo y más.
                      </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sports.filter(s => s.title === "Surf & Kitesurf" || s.title === "Buceo").map((sport, index) => (
                        <motion.div
                          key={sport.title}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="group bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-all"
                        >
                          <div className={`w-12 h-12 rounded-xl ${sport.color} flex items-center justify-center mb-4`}>
                            <sport.icon className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="font-display text-xl font-bold text-foreground mb-2">{sport.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4">{sport.description}</p>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span className="text-muted-foreground">{sport.destinations.join(", ")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span className="text-muted-foreground">Temporada: {sport.season}</span>
                            </div>
                          </div>
                          <Button className="w-full mt-4">Ver Experiencias</Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </section>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Stadiums */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-end justify-between mb-12"
            >
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                  Estadios y <span className="text-gradient">Complejos</span>
                </h2>
                <p className="text-muted-foreground max-w-xl">
                  Las mejores instalaciones deportivas del Caribe para vivir la pasión.
                </p>
              </div>
              <Button variant="outline" className="hidden md:flex gap-2">
                <Ticket className="h-4 w-4" />
                Comprar Boletos
              </Button>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {stadiums.map((stadium, index) => (
                <motion.div
                  key={stadium.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-surface rounded-2xl overflow-hidden hover:shadow-xl transition-all"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={stadium.image}
                      alt={stadium.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-sm font-bold text-primary">{stadium.sport}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold text-foreground mb-1">{stadium.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-3.5 w-3.5" />
                      {stadium.location}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {stadium.capacity}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {stadium.teams.map((team) => (
                        <span key={team} className="text-xs bg-muted px-2 py-1 rounded-full">
                          {team}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Removed duplicate hiking routes section - now inside tabs */}

        {/* Upcoming Events */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Próximos <span className="text-gradient">Eventos</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-surface rounded-2xl p-6"
                >
                  <span className="inline-block text-xs bg-primary/10 text-primary px-2 py-1 rounded mb-3">
                    {event.category}
                  </span>
                  <h3 className="font-display font-bold text-foreground mb-2">{event.title}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-4">
                    Agregar al Viaje
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-orange-900 to-red-900">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                ¿Listo para la aventura?
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Planifica tu viaje deportivo con nuestros guías certificados y paquetes especializados.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="gap-2 bg-white text-orange-900 hover:bg-white/90">
                  Contactar Guía
                </Button>
                <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                  Comparar Experiencias
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Ad before footer */}
        <BetweenSectionsAd showDemo />

        <Footer />
      </div>
    </PageTransition>
  );
}
