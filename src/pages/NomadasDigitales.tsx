import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import {
  Laptop,
  Wifi,
  Building2,
  Home,
  FileCheck,
  Users,
  MapPin,
  Sun,
  DollarSign,
  Plane,
  Coffee,
  ChevronRight,
  Check,
  Star,
  Globe,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  { icon: Sun, title: "300+ días de sol", description: "Clima tropical perfecto todo el año" },
  { icon: DollarSign, title: "Bajo costo de vida", description: "50-70% menos que EE.UU. o Europa" },
  { icon: Wifi, title: "Internet rápido", description: "Fibra óptica en zonas principales" },
  { icon: Plane, title: "Conexiones aéreas", description: "Vuelos directos a América y Europa" },
];

const coworkingSpaces = [
  {
    name: "Blue Mall Business Center",
    location: "Punta Cana",
    amenities: ["Fibra 500 Mbps", "Salas de reuniones", "Café incluido", "24/7"],
    price: "$200/mes",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
    rating: 4.8,
  },
  {
    name: "Nómada Hub",
    location: "Santo Domingo",
    amenities: ["Fibra 300 Mbps", "Terraza", "Eventos networking", "Café"],
    price: "$150/mes",
    image: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=400",
    rating: 4.7,
  },
  {
    name: "Cowork Cabarete",
    location: "Cabarete, Puerto Plata",
    amenities: ["200 Mbps", "Vista al mar", "Clases de surf", "Comunidad"],
    price: "$180/mes",
    image: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=400",
    rating: 4.9,
  },
];

const zones = [
  {
    name: "Punta Cana",
    type: "Playa & Lujo",
    pros: ["Playas increíbles", "Resorts con coworking", "Vida nocturna"],
    connectivity: "Excelente",
    costOfLiving: "$$$$",
  },
  {
    name: "Santo Domingo",
    type: "Ciudad & Cultura",
    pros: ["Historia colonial", "Gastronomía", "Mejor infraestructura"],
    connectivity: "Excelente",
    costOfLiving: "$$",
  },
  {
    name: "Cabarete",
    type: "Surf & Comunidad",
    pros: ["Comunidad nómada activa", "Deportes acuáticos", "Ambiente relajado"],
    connectivity: "Buena",
    costOfLiving: "$$$",
  },
  {
    name: "Las Terrenas",
    type: "Europeo & Tranquilo",
    pros: ["Pueblo francés", "Playas vírgenes", "Gastronomía europea"],
    connectivity: "Buena",
    costOfLiving: "$$$",
  },
];

const visaInfo = [
  { title: "Tarjeta de Turista", duration: "30 días", extendable: "Hasta 120 días", requirements: ["Pasaporte válido", "Boleto de salida"] },
  { title: "Visa de Negocios", duration: "1 año", extendable: "Renovable", requirements: ["Carta de empresa", "Prueba de fondos"] },
  { title: "Residencia Temporal", duration: "1-2 años", extendable: "Permanente", requirements: ["Visa consular", "Antecedentes", "Examen médico"] },
];

const community = [
  { platform: "Facebook", name: "Digital Nomads RD", members: "5,200+" },
  { platform: "Slack", name: "Nomads Caribe", members: "1,800+" },
  { platform: "Meetup", name: "Coworking Santo Domingo", members: "3,400+" },
];

export default function NomadasDigitales() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/90 via-indigo-900/80 to-blue-900/90" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920')] bg-cover bg-center opacity-30" />
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <span className="inline-flex items-center gap-2 text-violet-300 text-sm font-medium mb-4">
                <Laptop className="h-4 w-4" />
                Trabajo Remoto
              </span>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
                Nómadas Digitales en <span className="text-violet-400">República Dominicana</span>
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Trabaja desde el paraíso caribeño. Internet rápido, bajo costo de vida, 
                comunidad activa y el mejor clima del mundo. Tu oficina con vista al mar te espera.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gap-2 bg-white text-violet-900 hover:bg-white/90">
                  <Building2 className="h-4 w-4" />
                  Ver Coworkings
                </Button>
                <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                  Guía de Visa
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid md:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Recommended Zones */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Zonas <span className="text-gradient">Recomendadas</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Cada zona ofrece un estilo de vida único. Encuentra tu lugar ideal según tus preferencias.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {zones.map((zone, index) => (
                <motion.div
                  key={zone.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-all"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h3 className="font-display text-xl font-bold text-foreground">{zone.name}</h3>
                  </div>
                  <span className="inline-block text-xs bg-primary/10 text-primary px-2 py-1 rounded mb-4">
                    {zone.type}
                  </span>
                  <ul className="space-y-2 mb-4">
                    {zone.pros.map((pro) => (
                      <li key={pro} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-3.5 w-3.5 text-primary" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4 border-t border-border space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Conectividad</span>
                      <span className="flex items-center gap-1 text-foreground">
                        <Wifi className="h-3.5 w-3.5 text-green-500" />
                        {zone.connectivity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Costo de vida</span>
                      <span className="text-foreground">{zone.costOfLiving}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Coworking Spaces */}
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
                  Espacios de <span className="text-gradient">Coworking</span>
                </h2>
                <p className="text-muted-foreground max-w-xl">
                  Oficinas con internet de alta velocidad, café, comunidad y las mejores vistas del Caribe.
                </p>
              </div>
              <Button variant="outline" className="hidden md:flex gap-2">
                Ver todos
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {coworkingSpaces.map((space, index) => (
                <motion.div
                  key={space.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-surface rounded-2xl overflow-hidden hover:shadow-xl transition-all"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={space.image}
                      alt={space.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-sm font-bold text-primary">{space.price}</span>
                    </div>
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-semibold">{space.rating}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold text-foreground mb-1">{space.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                      <MapPin className="h-3.5 w-3.5" />
                      {space.location}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {space.amenities.map((amenity) => (
                        <span key={amenity} className="text-xs bg-muted px-2 py-1 rounded-full flex items-center gap-1">
                          {amenity.includes("Mbps") && <Wifi className="h-3 w-3" />}
                          {amenity.includes("Café") && <Coffee className="h-3 w-3" />}
                          {amenity}
                        </span>
                      ))}
                    </div>
                    <Button className="w-full" variant="outline">
                      Reservar Tour
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Visa Information */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Requisitos <span className="text-gradient">Legales</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Información sobre visas y permisos de estadía para trabajar remotamente desde RD.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {visaInfo.map((visa, index) => (
                <motion.div
                  key={visa.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-6 border border-border"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-foreground">{visa.title}</h3>
                      <p className="text-xs text-muted-foreground">{visa.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4 text-sm">
                    <Zap className="h-4 w-4 text-green-500" />
                    <span className="text-muted-foreground">Extensión: {visa.extendable}</span>
                  </div>
                  <ul className="space-y-2">
                    {visa.requirements.map((req) => (
                      <li key={req} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-3.5 w-3.5 text-primary" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Community */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Únete a la <span className="text-gradient">Comunidad</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Conecta con otros nómadas digitales, asiste a eventos y haz networking.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {community.map((group, index) => (
                <motion.div
                  key={group.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-surface rounded-2xl p-6 text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{group.platform}</p>
                  <h3 className="font-display font-bold text-foreground mb-2">{group.name}</h3>
                  <p className="text-primary font-semibold">{group.members} miembros</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-violet-900 to-indigo-900">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                ¿Listo para trabajar desde el paraíso?
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Descarga nuestra guía completa para nómadas digitales con todo lo que necesitas saber.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="gap-2 bg-white text-violet-900 hover:bg-white/90">
                  Descargar Guía PDF
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
