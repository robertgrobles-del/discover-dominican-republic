import { motion } from "framer-motion";
import { 
  Anchor, Ship, MapPin, Star, ChevronRight,
  Fuel, FileText, Download, Navigation, Plus
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import { CTARegistroEstablecimiento } from "@/components/forms/CTARegistroEstablecimiento";
import { SorteoLectorBanner } from "@/components/forms/SorteoLectorBanner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CruiserTimeEstimator } from "@/components/nautica/CruiserTimeEstimator";
import { 
  marinas, 
  puertos, 
  itinerario, 
  serviciosTerminal, 
  excursiones, 
  nauticalServices, 
  regulations 
} from "@/data/nauticaData";
import heroBeachImg from "@/assets/hero-beach.jpg";

export default function NauticaCruceros() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
          <img
            src={heroBeachImg}
            alt="Vista panorámica de costa caribeña dominicana"
            className="absolute inset-0 w-full h-full object-cover object-center"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/50" />

          <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <Anchor className="h-3 w-3 mr-1" />
                TURISMO NÁUTICO Y CRUCEROS
              </Badge>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
                Navega el Lujo del Caribe
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Descubre las marinas más exclusivas, puertos de cruceros, pesca deportiva de clase mundial
                y las costas vírgenes de República Dominicana.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="gap-2">
                  <Anchor className="h-4 w-4" />
                  Explorar Marinas
                </Button>
                <Button size="lg" variant="outline" className="gap-2">
                  <Ship className="h-4 w-4" />
                  Info Cruceros
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <Tabs defaultValue="marinas" className="w-full">
              <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 mb-8">
                <TabsTrigger value="marinas">Marinas</TabsTrigger>
                <TabsTrigger value="cruceros">Cruceros</TabsTrigger>
                <TabsTrigger value="servicios">Servicios</TabsTrigger>
              </TabsList>

              {/* Marinas Tab */}
              <TabsContent value="marinas">
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
              </TabsContent>

              {/* Cruceros Tab */}
              <TabsContent value="cruceros">
                {/* Puertos */}
                <div className="mb-12">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="font-display text-2xl font-bold text-foreground">
                      Puertos de Llegada
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {puertos.map((puerto) => (
                      <div key={puerto.nombre} className="group">
                        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-4">
                          <img 
                            src={puerto.imagen} 
                            alt={puerto.nombre}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs">
                            {puerto.ubicacion}
                          </Badge>
                        </div>
                        <h3 className="font-display font-bold text-lg text-foreground mb-1">{puerto.nombre}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{puerto.descripcion}</p>
                        <div className="flex gap-2">
                          {puerto.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Return-to-port calculator */}
                <CruiserTimeEstimator />

                {/* Itinerario + Servicios */}
                <div className="grid md:grid-cols-2 gap-12 mb-12">
                  {/* Itinerario */}
                  <div>
                    <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                      <Star className="h-3 w-3 mr-1" />
                      RECOMENDADO
                    </Badge>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                      Itinerario: Un Día Perfecto
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      Aprovecha al máximo tus 8 horas en tierra con este plan optimizado.
                    </p>

                    <div className="space-y-6">
                      {itinerario.map((item, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-primary" />
                            {index < itinerario.length - 1 && (
                              <div className="w-0.5 flex-1 bg-border mt-2" />
                            )}
                          </div>
                          <div className="pb-6">
                            <p className="text-primary text-sm font-medium">{item.hora}</p>
                            <h3 className="font-semibold text-foreground">{item.titulo}</h3>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Servicios Terminal */}
                  <div>
                    <Badge className="mb-4 bg-emerald-500/20 text-emerald-600 border-emerald-500/30">
                      ✓ FACILIDADES
                    </Badge>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                      Servicios en Terminal
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      Ubica lo esencial dentro de la terminal.
                    </p>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {serviciosTerminal.map((serv) => (
                        <div key={serv.nombre} className="bg-card rounded-xl p-4 border border-border text-center">
                          <serv.icon className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                          <p className="text-xs text-foreground">{serv.nombre}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-primary/10 rounded-2xl p-6 flex items-center justify-center">
                      <Button variant="outline" className="gap-2">
                        <MapPin className="h-4 w-4" /> Explorar Mapa
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Excursiones Express */}
                <div>
                  <div className="flex items-center justify-between mb-8" id="excursiones-express">
                    <div>
                      <h2 className="font-display text-2xl font-bold text-foreground">
                        Excursiones Express
                      </h2>
                      <p className="text-muted-foreground">Garantizadas para regresar antes de que zarpe tu barco.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {excursiones.map((exc) => (
                      <div key={exc.nombre} className="bg-card rounded-2xl border border-border overflow-hidden">
                        <div className="relative aspect-[4/3]">
                          <img 
                            src={exc.imagen} 
                            alt={exc.nombre}
                            className="w-full h-full object-cover"
                          />
                          <Badge className="absolute top-3 left-3 bg-emerald-500 text-white text-xs">
                            ✓ GARANTÍA REGRESO
                          </Badge>
                          <Badge className="absolute bottom-3 right-3 bg-background/90 text-foreground text-xs">
                            {exc.duracion}
                          </Badge>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-foreground mb-1">{exc.nombre}</h3>
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{exc.descripcion}</p>
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-primary">
                              ${exc.precio}<span className="text-xs font-normal text-muted-foreground">/pers</span>
                            </p>
                            <Button size="icon" variant="outline" className="h-8 w-8 rounded-full">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Servicios Tab */}
              <TabsContent value="servicios">
                <h2 className="font-display text-2xl font-bold text-foreground mb-8">
                  Servicios Náuticos
                </h2>

                <div className="grid md:grid-cols-3 gap-6 mb-12">
                  {nauticalServices.map((service, index) => (
                    <motion.div
                      key={service.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-card rounded-2xl p-6 border border-border"
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

                {/* Map and Regulations */}
                <div className="grid md:grid-cols-2 gap-8">
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
                          Seleccione un punto para ver detalles de profundidad, corrientes y servicios disponibles.
                        </p>
                      </div>
                    </div>
                  </div>

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
              </TabsContent>
            </Tabs>

            {/* Banners de Conversión */}
            <div className="mt-16 space-y-8">
              <SorteoLectorBanner origenCategoria="Turismo Náutico, Cruceros y Catamaranes" />

              <CTARegistroEstablecimiento
                tipo="tour"
                titulo="¿Administras una marina, charter de yates o tour en catamarán?"
                subtitulo="Inscribe tus embarcaciones y servicios náuticos en Descubre RD para el gran lanzamiento oficial. Conecta con navegantes y cruceristas de todo el mundo."
              />
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
