import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Moon,
  Telescope,
  Calendar,
  MapPin,
  Clock,
  CloudMoon,
  ChevronRight,
  Eye,
} from "lucide-react";

const upcomingEvents = [
  {
    title: "Luna Llena de Febrero",
    date: "15 Feb 2026",
    time: "19:00",
    location: "Constanza",
    type: "Lunar",
  },
  {
    title: "Lluvia de Meteoros Perseidas",
    date: "12 Ago 2026",
    time: "21:00",
    location: "Valle Nuevo",
    type: "Meteoros",
  },
  {
    title: "Eclipse Lunar Parcial",
    date: "28 Oct 2026",
    time: "20:30",
    location: "Jarabacoa",
    type: "Eclipse",
  },
];

const observatories = [
  {
    name: "Observatorio Valle Nuevo",
    location: "Constanza",
    altitude: "2,200 m",
    features: ["Telescopio 16\"", "Planetario", "Cabañas"],
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400",
  },
  {
    name: "Mirador del Cielo",
    location: "Jarabacoa",
    altitude: "1,500 m",
    features: ["Tours nocturnos", "Fotografía", "Camping"],
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=400",
  },
  {
    name: "Astro Camp Bayahíbe",
    location: "Bayahíbe",
    altitude: "50 m",
    features: ["Playa nocturna", "Kayak estelar", "Yoga lunar"],
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1536746803623-cef87080bfc8?w=400",
  },
];

const constellations = [
  { name: "Orión", visibility: "Óptima", season: "Invierno" },
  { name: "Cruz del Sur", visibility: "Buena", season: "Primavera" },
  { name: "Escorpio", visibility: "Óptima", season: "Verano" },
  { name: "Sagitario", visibility: "Buena", season: "Verano" },
];

export default function Astroturismo() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920')] bg-cover bg-center opacity-40" />
          {/* Stars animation overlay */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <Badge className="mb-4 bg-indigo-500/20 text-indigo-200 border-indigo-400/30">
                <Star className="h-3 w-3 mr-1" />
                OBSERVACIÓN ASTRONÓMICA
              </Badge>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
                Astroturismo en <span className="text-indigo-400">RD</span>
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Descubre cielos prístinos, constelaciones brillantes y experiencias 
                únicas bajo el manto estrellado del Caribe.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="gap-2 bg-white text-indigo-900 hover:bg-white/90">
                  <Telescope className="h-4 w-4" />
                  Explorar Observatorios
                </Button>
                <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                  Calendario Astronómico
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Current Sky */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row items-center justify-between gap-8"
            >
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Moon className="h-10 w-10 text-amber-900" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Esta noche</p>
                  <p className="text-2xl font-bold text-foreground">Luna Creciente 45%</p>
                  <p className="text-sm text-muted-foreground">Condiciones: Excelentes para observación</p>
                </div>
              </div>
              <div className="flex gap-8">
                <div className="text-center">
                  <CloudMoon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nubosidad</p>
                  <p className="text-xl font-bold text-foreground">15%</p>
                </div>
                <div className="text-center">
                  <Eye className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Visibilidad</p>
                  <p className="text-xl font-bold text-foreground">Óptima</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Próximos <span className="text-gradient">Eventos Celestes</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                No te pierdas estos espectáculos astronómicos visibles desde República Dominicana.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-all group"
                >
                  <Badge className="mb-4" variant="outline">{event.type}</Badge>
                  <h3 className="font-display text-xl font-bold text-foreground mb-4">{event.title}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {event.date}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {event.time}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Mejor vista: {event.location}
                    </p>
                  </div>
                  <Button variant="outline" className="w-full gap-1">
                    Agregar al Plan
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Observatories */}
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
                  Observatorios y <span className="text-gradient">Miradores</span>
                </h2>
                <p className="text-muted-foreground max-w-xl">
                  Los mejores puntos para observar las estrellas en la isla.
                </p>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {observatories.map((obs, index) => (
                <motion.div
                  key={obs.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-surface rounded-2xl overflow-hidden hover:shadow-xl transition-all"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={obs.image}
                      alt={obs.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-semibold">{obs.rating}</span>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <Badge className="bg-indigo-500/90 text-white">
                        {obs.altitude} alt.
                      </Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold text-foreground mb-1">{obs.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                      <MapPin className="h-3.5 w-3.5" />
                      {obs.location}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {obs.features.map((feature) => (
                        <span key={feature} className="text-xs bg-muted px-2 py-1 rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                    <Button className="w-full">Reservar Tour</Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Constellations */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Constelaciones <span className="text-gradient">Visibles</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {constellations.map((const_, index) => (
                <motion.div
                  key={const_.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl p-4 text-center border border-border"
                >
                  <Star className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-bold text-foreground">{const_.name}</p>
                  <p className="text-xs text-muted-foreground">{const_.season}</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {const_.visibility}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-b from-indigo-950 to-purple-950">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Telescope className="h-16 w-16 text-indigo-300 mx-auto mb-6" />
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                ¿Listo para explorar el universo?
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Reserva tu experiencia astronómica y descubre los secretos del cielo caribeño.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="gap-2 bg-white text-indigo-900 hover:bg-white/90">
                  Reservar Ahora
                </Button>
                <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                  Agregar al Plan de Viaje
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
