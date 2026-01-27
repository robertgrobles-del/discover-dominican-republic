import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Ear,
  HandMetal,
  Heart,
  Accessibility,
  ZoomIn,
  Volume2,
  Contrast,
  Languages,
  MapPin,
  Star,
  ChevronRight,
  Check,
} from "lucide-react";

const accessibilityFeatures = [
  { icon: ZoomIn, title: "Texto Ajustable", description: "Aumenta o reduce el tamaño del texto" },
  { icon: Contrast, title: "Alto Contraste", description: "Modo de alto contraste para mejor visibilidad" },
  { icon: Volume2, title: "Audio Descripción", description: "Contenido narrado para experiencias visuales" },
  { icon: Languages, title: "Lengua de Señas", description: "Videos con interpretación en LSM" },
];

const sensoryExperiences = [
  {
    title: "Sonidos del Caribe",
    type: "Auditiva",
    icon: Ear,
    description: "Sumérgete en los ritmos de merengue, bachata y los sonidos naturales de la isla.",
    locations: ["Santo Domingo", "Puerto Plata"],
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
  },
  {
    title: "Aromas Tropicales",
    type: "Olfativa",
    icon: Heart,
    description: "Descubre los aromas del cacao, café, tabaco y flores tropicales en tours guiados.",
    locations: ["San Cristóbal", "Santiago"],
    image: "https://images.unsplash.com/photo-1611070235554-7a8d3fb6b4e1?w=400",
  },
  {
    title: "Texturas de la Isla",
    type: "Táctil",
    icon: HandMetal,
    description: "Experiencias táctiles en talleres de artesanía, arena volcánica y piedras de río.",
    locations: ["Jarabacoa", "Samaná"],
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
  },
  {
    title: "Colores del Trópico",
    type: "Visual",
    icon: Eye,
    description: "Tours diseñados para maximizar la experiencia visual con descripciones detalladas.",
    locations: ["Punta Cana", "Las Terrenas"],
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
  },
];

const accessibleDestinations = [
  {
    name: "Playa Bávaro Accesible",
    location: "Punta Cana",
    features: ["Sillas anfibias", "Rampas", "Personal capacitado"],
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
  },
  {
    name: "Zona Colonial",
    location: "Santo Domingo",
    features: ["Audio guías", "Rutas táctiles", "Intérpretes LSM"],
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400",
  },
  {
    name: "Parque Nacional Los Tres Ojos",
    location: "Santo Domingo",
    features: ["Senderos adaptados", "Descripciones braille", "Asistentes"],
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=400",
  },
];

export default function TurismoSensorial() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Accessibility Toolbar */}
        <div className="bg-card border-b border-border px-4 py-2 flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Accessibility className="h-4 w-4 text-primary" />
            Modo Accesible
          </span>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
              <ZoomIn className="h-4 w-4" />
              <span className="hidden sm:inline">Aumentar Texto</span>
            </button>
            <button className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
              <Contrast className="h-4 w-4" />
              <span className="hidden sm:inline">Alto Contraste</span>
            </button>
          </div>
        </div>

        {/* Hero */}
        <section className="relative py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-indigo-900/80 to-blue-900/90" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1920')] bg-cover bg-center opacity-30" />
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <Badge className="mb-4 bg-purple-500/20 text-purple-200 border-purple-400/30">
                <Accessibility className="h-3 w-3 mr-1" />
                TURISMO INCLUSIVO
              </Badge>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
                RD para <span className="text-purple-400">Sentir</span>
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Experiencias turísticas diseñadas para todos los sentidos. 
                República Dominicana accesible e inclusiva para cada viajero.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="gap-2 bg-white text-purple-900 hover:bg-white/90">
                  <Heart className="h-4 w-4" />
                  Explorar Experiencias
                </Button>
                <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                  Guía de Accesibilidad
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Accessibility Features */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid md:grid-cols-4 gap-6">
              {accessibilityFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Sensory Experiences */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Experiencias <span className="text-gradient">Sensoriales</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Descubre la República Dominicana a través de todos tus sentidos con experiencias 
                diseñadas para maximizar cada percepción.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {sensoryExperiences.map((exp, index) => (
                <motion.div
                  key={exp.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 aspect-video md:aspect-square relative overflow-hidden">
                      <img
                        src={exp.image}
                        alt={exp.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-primary/90 text-primary-foreground">
                          <exp.icon className="h-3 w-3 mr-1" />
                          {exp.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex-1 p-6">
                      <h3 className="font-display text-xl font-bold text-foreground mb-2">{exp.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{exp.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <MapPin className="h-4 w-4" />
                        {exp.locations.join(", ")}
                      </div>
                      <Button variant="outline" size="sm" className="gap-1">
                        Explorar
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Accessible Destinations */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Destinos <span className="text-gradient">Accesibles</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Lugares certificados con infraestructura adaptada y servicios inclusivos.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {accessibleDestinations.map((dest, index) => (
                <motion.div
                  key={dest.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-surface rounded-2xl overflow-hidden hover:shadow-xl transition-all"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-semibold">{dest.rating}</span>
                    </div>
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-green-500/90 text-white">
                        <Accessibility className="h-3 w-3 mr-1" />
                        Accesible
                      </Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold text-foreground mb-1">{dest.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                      <MapPin className="h-3.5 w-3.5" />
                      {dest.location}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {dest.features.map((feature) => (
                        <span key={feature} className="text-xs bg-muted px-2 py-1 rounded-full flex items-center gap-1">
                          <Check className="h-3 w-3 text-primary" />
                          {feature}
                        </span>
                      ))}
                    </div>
                    <Button className="w-full" variant="outline">
                      Ver Detalles
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-purple-900 to-indigo-900">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Accessibility className="h-16 w-16 text-purple-300 mx-auto mb-6" />
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                Turismo sin Barreras
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Contamos con guías especializados y servicios adaptados para que cada viajero 
                disfrute de una experiencia inolvidable.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="gap-2 bg-white text-purple-900 hover:bg-white/90">
                  Solicitar Asistencia
                </Button>
                <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                  Descargar Guía
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
