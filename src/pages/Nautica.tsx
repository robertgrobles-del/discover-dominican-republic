import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Anchor, 
  Ship, 
  MapPin, 
  Star, 
  ChevronRight,
  Fuel,
  Waves,
  FileText,
  Download,
  Navigation
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import heroBeachImg from "@/assets/hero-beach.jpg";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import laRomanaImg from "@/assets/la-romana.jpg";
import puertoPlataImg from "@/assets/puerto-plata.jpg";

const marinas = [
  {
    id: "cap-cana",
    name: "Marina Cap Cana",
    location: "Punta Cana",
    rating: 5,
    description: "Ubicada en el punto de encuentro del Caribe y el Atlántico, ofrece servicios de clase mundial y es reconocida como uno de los mejores destinos para la pesca deportiva de aguja blanca y azul.",
    slips: "150+",
    maxLength: "8ft",
    services: ["Fuel"],
    image: puntaCanaImg,
  },
  {
    id: "casa-de-campo",
    name: "Marina Casa de Campo",
    location: "La Romana",
    rating: 4.5,
    description: "Un elegante puerto deportivo inspirado en el Mediterráneo, donde el río Chavón se encuentra con el Mar Caribe. Cuenta con tiendas exclusivas, cine y restaurantes gourmet.",
    slips: "370",
    maxLength: "12ft",
    services: ["Service"],
    image: laRomanaImg,
  },
  {
    id: "ocean-world",
    name: "Ocean World Marina",
    location: "Puerto Plata",
    rating: 4,
    description: "La única marina con servicio completo en la costa norte. Integra un parque de aventuras con delfines, restaurantes, casino y vida nocturna vibrante.",
    slips: "100+",
    maxLength: "Casino",
    services: ["Customs"],
    image: puertoPlataImg,
  },
];

const nauticalServices = [
  {
    title: "Pesca Deportiva",
    description: "República Dominicana es un destino premier para la pesca del marlín. Organizamos torneos y charters privados con tripulación experta.",
    action: "Reservar Charter",
    icon: Anchor,
  },
  {
    title: "Alquiler de Yates",
    description: "Desde catamaranes para fiestas hasta megayates de lujo. Explore las costas de Samaná o Isla Saona con estilo y confort total.",
    action: "Ver Flota",
    icon: Ship,
  },
  {
    title: "Mantenimiento y Amarre",
    description: "Servicios técnicos especializados, limpieza de cascos, reabastecimiento de combustible y seguridad 24/7 para su embarcación.",
    action: "Solicitar Servicio",
    icon: Waves,
  },
];

const regulations = [
  { title: "Permisos de Entrada", description: "Requisitos para embarcaciones extranjeras." },
  { title: "Protocolos de Seguridad", description: "Normas de la Armada Dominicana." },
  { title: "Áreas Protegidas", description: "Mapas de santuarios marinos." },
];

export default function Nautica() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroBeachImg})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          
          <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-primary text-sm font-medium mb-4 tracking-wider">
                TURISMO NÁUTICO EN REPÚBLICA DOMINICANA
              </p>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
                Navega el Lujo del Caribe
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Descubre las marinas más exclusivas, pesca deportiva de clase mundial
                y las costas vírgenes de República Dominicana.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="gap-2">
                  <Anchor className="h-4 w-4" />
                  Explorar Marinas
                </Button>
                <Button size="lg" variant="outline" className="gap-2">
                  <MapPin className="h-4 w-4" />
                  Ver Mapa
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Marinas */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Marinas Destacadas
              </h2>
              <Button variant="link" className="text-primary gap-1">
                Ver todas <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-8">
              {marinas.map((marina, index) => (
                <motion.div
                  key={marina.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col md:flex-row bg-card rounded-2xl overflow-hidden border border-border"
                >
                  <div className="md:w-1/2 p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-primary">
                        {marina.location}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.floor(marina.rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <h3 className="font-display text-xl font-bold text-foreground mb-3">
                      {marina.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {marina.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Anchor className="h-4 w-4 text-primary" />
                        {marina.slips} Slips
                      </div>
                      <div className="flex items-center gap-1">
                        <Ship className="h-4 w-4 text-primary" />
                        {marina.maxLength} Max
                      </div>
                      <div className="flex items-center gap-1">
                        <Fuel className="h-4 w-4 text-primary" />
                        {marina.services.join(", ")}
                      </div>
                    </div>
                    <Button variant="outline" className="w-fit gap-2">
                      Ver Detalles <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="md:w-1/2 h-64 md:h-auto">
                    <img
                      src={marina.image}
                      alt={marina.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Nautical Services */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8">
              Servicios Náuticos
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {nauticalServices.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-background rounded-2xl p-6 border border-border"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                  <Button variant="link" className="text-primary p-0 gap-1">
                    {service.action} <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Map and Regulations */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Map */}
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                  Mapa de Navegación Costera
                </h2>
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                    <Navigation className="h-12 w-12 text-primary" />
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Rutas de Navegación</strong> — 
                      Seleccione un punto para ver detalles de profundidad, corrientes y servicios disponibles en la zona.
                    </p>
                  </div>
                </div>
              </div>

              {/* Regulations */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Reglamentaciones
                  </h2>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {regulations.map((reg, index) => (
                    <motion.div
                      key={reg.title}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {reg.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">{reg.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Importante:</strong> Recuerde reportar su llegada con 24 horas de antelación a la marina de destino vía radio VHF canal 16.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
