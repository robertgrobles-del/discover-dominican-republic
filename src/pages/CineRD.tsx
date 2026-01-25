import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Film,
  MapPin,
  Camera,
  FileText,
  DollarSign,
  Plane,
  Users,
  Building,
  ChevronRight,
  Play,
  Download,
  Phone,
  Mail,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const incentives = [
  {
    icon: DollarSign,
    title: "Crédito Fiscal Transferible",
    description: "Un crédito fiscal transferible del 25% sobre todos los gastos elegibles realizados en el país, con un mínimo de gasto de US$500,000.",
  },
  {
    icon: FileText,
    title: "Exención de ITBIS",
    description: "Exención total del impuesto sobre Transferencia de Bienes Industrializados y Servicios (IVA) del 18% en proveedores calificados.",
  },
  {
    icon: Plane,
    title: "Permisos Ágiles",
    description: "Ventanilla única de rodaje (DGCINE) para trámites en locaciones públicas, áreas protegidas y zonas históricas rápidamente.",
  },
];

const locations = [
  { name: "Zona Colonial", type: "Histórico", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&h=400&fit=crop" },
  { name: "Costas Vírgenes", type: "Playas", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop" },
  { name: "Montañas", type: "Cordillera & Jarabacoa", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop" },
  { name: "Dunas", type: "Baní", image: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=600&h=400&fit=crop" },
];

const productions = [
  { title: "The Godfather Part II", location: "Zona Colonial, Santo Domingo", year: "1974", image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=400&fit=crop" },
  { title: "Jurassic Park", location: "Isla de Saona", year: "1993", image: "https://images.unsplash.com/photo-1559583985-c80d8ad9b29f?w=300&h=400&fit=crop" },
  { title: "The Lost City", location: "Samaná & Las Terrenas", year: "2022", image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=400&fit=crop" },
  { title: "Old", location: "Playa El Valle", year: "2021", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=400&fit=crop" },
];

const infrastructure = [
  {
    icon: Users,
    title: "Talento y Crew Local",
    description: "Personal técnico bilingüe altamente capacitado con experiencia en producciones de Hollywood.",
  },
  {
    icon: Building,
    title: "Equipamiento y Estudios",
    description: "Pinewood Dominican Republic Studios cuenta con el Horizon Water Tank, uno de los tanques de agua más grandes del mundo.",
  },
  {
    icon: Plane,
    title: "Logística y Conectividad",
    description: "8 aeropuertos internacionales y una infraestructura hotelera robusta para alojar equipos de cualquier tamaño.",
  },
];

export default function CineRD() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&h=1080&fit=crop"
              alt="Cine RD"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
          </div>

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-4">
              Tu Próxima Escena <br />
              <span className="italic">Comienza Aquí</span>
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Descubre por qué República Dominicana es el escenario ideal para tu producción. 
              Incentivos fiscales del 25%, diversidad de paisajes y equipos de clase mundial.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="gap-2">
                <Camera className="h-4 w-4" /> Explorar Locaciones
              </Button>
              <Button size="lg" variant="outline" className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Play className="h-4 w-4" /> Ver Reel 2024
              </Button>
            </div>
          </div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <ChevronRight className="h-8 w-8 text-white rotate-90" />
          </motion.div>
        </section>

        {/* Incentives Section */}
        <section className="py-20 bg-card/30">
          <div className="container mx-auto px-4">
            <Badge className="bg-primary/10 text-primary mb-4">LEY 108-10</Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Incentivos Competitivos
            </h2>
            <p className="text-muted-foreground max-w-2xl mb-12">
              Un marco legal sólido diseñado para maximizar el presupuesto de producciones 
              extranjeras y locales.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {incentives.map((incentive, index) => (
                <motion.div
                  key={incentive.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl border border-border p-6"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <incentive.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg mb-2">
                    {incentive.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {incentive.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Locations Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                  Escenarios Diversos
                </h2>
                <p className="text-muted-foreground">
                  Desde arquitectura colonial del siglo XVI hasta selvas vírgenes y playas prístinas.
                </p>
              </div>
              <Button variant="link" className="text-primary gap-1">
                Ver todas las locaciones <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              {locations.map((location, index) => (
                <motion.div
                  key={location.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative rounded-xl overflow-hidden group cursor-pointer ${
                    index === 0 ? "md:col-span-2 md:row-span-2" : ""
                  }`}
                >
                  <img
                    src={location.image}
                    alt={location.name}
                    className={`w-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                      index === 0 ? "h-full" : "aspect-square"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <p className="font-semibold text-white text-lg">{location.name}</p>
                    <p className="text-sm text-white/70">{location.type}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Productions Section */}
        <section className="py-20 bg-card/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">
              Rodado en RD
            </h2>
            <p className="text-muted-foreground mb-12">
              Grandes producciones que confiaron en nuestros escenarios
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {productions.map((production, index) => (
                <motion.div
                  key={production.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[3/4] rounded-xl overflow-hidden mb-3 border border-border">
                    <img
                      src={production.image}
                      alt={production.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="font-semibold text-foreground">{production.title}</h3>
                  <p className="text-sm text-muted-foreground">{production.location}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Infrastructure Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-6">
                  Infraestructura de Clase Mundial
                </h2>
                
                <div className="space-y-6">
                  {infrastructure.map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Button variant="outline" className="mt-8 gap-2">
                  Ver Directorio de Servicios <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                  <Button className="gap-2">
                    <Play className="h-4 w-4" /> Mapa Interactivo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              ¿Listo para rodar en el paraíso?
            </h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
              Contáctanos hoy para recibir asesoría gratuita sobre incentivos, 
              permisos y locaciones.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" className="gap-2">
                <Phone className="h-4 w-4" /> Contactar Comisión de Cine
              </Button>
              <Button size="lg" variant="outline" className="gap-2 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Download className="h-4 w-4" /> Descargar Kit de Prensa
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
