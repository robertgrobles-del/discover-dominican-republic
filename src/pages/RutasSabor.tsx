import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Coffee, Flame, Mountain, MapPin, Star, Clock, 
  Users, ChevronRight, Leaf, Calendar, Award, Camera, 
  Factory, Store, Wine, Play, Sparkles, Navigation, CheckCircle2, Share2, Compass, Heart
} from "lucide-react";
import { FavoriteButton } from "@/components/FavoriteButton";
import { BetweenSectionsAd } from "@/components/promo";

import { RUTAS_SABOR_DATA, type RutaSensorial } from "@/data/rutasSaborData";

export default function RutasSabor() {
  const [selectedRuta, setSelectedRuta] = useState<string>("cafe");
  const rutaActual = RUTAS_SABOR_DATA[selectedRuta];

  return (
    <PageTransition>
      <SEOHead
        title="Rutas del Sabor Dominicano - Circuitos Gastronómicos Auténticos"
        description="Explora las 5 rutas sensoriales de República Dominicana: Ruta del Café de Altura, Cacao y Chocolate, Tabaco Premium, Ron y Gastronomía Costera de Samaná."
        keywords="rutas gastronomicas republica dominicana, ruta del cafe jarabacoa, ruta del cacao san francisco, ruta del tabaco santiago santiago la aurora, pescado al coco samana"
      />

      <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-amber-500 selection:text-white">
        <Header />

        {/* HERO EDITORIAL SENSORIAL */}
        <section className="relative min-h-[65vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <motion.img
              key={rutaActual.heroImage}
              src={rutaActual.heroImage}
              alt={rutaActual.name}
              initial={{ scale: 1.08, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-black/60" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
          </div>

          <div className="relative z-10 container mx-auto px-4 py-20 text-center max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-4 bg-amber-500/20 text-amber-300 border-amber-500/40 backdrop-blur-md px-4 py-1.5 text-xs tracking-widest font-mono uppercase">
                {rutaActual.badge}
              </Badge>
              
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
                Rutas del <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-200 bg-clip-text text-transparent">Sabor Dominicano</span>
              </h1>

              <p className="text-lg md:text-xl text-white/90 font-light max-w-2xl mx-auto mb-8 leading-relaxed">
                {rutaActual.tagline}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-white/80">
                <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
                  <MapPin className="h-4 w-4 text-amber-400" />
                  {rutaActual.provinces[0]}
                </span>
                <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
                  <Clock className="h-4 w-4 text-amber-400" />
                  {rutaActual.duration}
                </span>
                <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
                  <Calendar className="h-4 w-4 text-amber-400" />
                  {rutaActual.bestSeason}
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SELECTOR DE CIRCUITOS INTERACTIVO (STICKY) */}
        <section className="sticky top-16 z-30 bg-card/95 backdrop-blur-md border-y border-border py-3 px-4 shadow-md">
          <div className="container mx-auto">
            <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto no-scrollbar py-1">
              {Object.values(RUTAS_DATA).map((ruta) => {
                const IconComponent = ruta.icon;
                const isSelected = selectedRuta === ruta.id;
                return (
                  <button
                    key={ruta.id}
                    onClick={() => setSelectedRuta(ruta.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300 ${
                      isSelected
                        ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30 scale-105"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <IconComponent className={`h-4 w-4 ${isSelected ? "text-white" : "text-amber-500"}`} />
                    <span>{ruta.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* CONTENIDO PRINCIPAL DE LA RUTA */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-6xl space-y-16">
            
            {/* INTRODUCCIÓN Y BENTO RESUMEN */}
            <div className="grid lg:grid-cols-3 gap-8 items-stretch">
              <div className="lg:col-span-2 bg-card rounded-3xl p-8 border border-border flex flex-col justify-between">
                <div>
                  <Badge variant="outline" className="mb-3 text-amber-500 border-amber-500/30">
                    MANIFIESTO SENSORIAL
                  </Badge>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4">
                    {rutaActual.name}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-base sm:text-lg mb-6">
                    {rutaActual.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-border/60">
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                    Provincias y Polos Incluidos
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {rutaActual.provinces.map((prov, i) => (
                      <Badge key={i} variant="secondary" className="bg-muted px-3 py-1 text-xs">
                        <MapPin className="h-3 w-3 mr-1 text-primary" />
                        {prov}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* CARD ACCIÓN RÁPIDA */}
              <div className="bg-gradient-to-br from-amber-600/10 via-card to-orange-600/10 rounded-3xl p-8 border border-amber-500/20 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500 mb-4">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2">
                    ¿Quieres vivir esta ruta guiada?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Contamos con guías y sumilleres locales certificados para tours de café, cacao y tabaco.
                  </p>
                </div>
                <div className="space-y-3">
                  <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-6 rounded-xl shadow-lg shadow-amber-600/20">
                    <Calendar className="h-4 w-4 mr-2" />
                    Consultar Salidas del Mes
                  </Button>
                  <Link to="/recetas-criollas" className="block text-center text-xs text-muted-foreground hover:text-foreground">
                    O descubre cómo cocinar estos platos en casa →
                  </Link>
                </div>
              </div>
            </div>

            {/* PARADAS CLAVE DEL CIRCUITO (BENTO GRID 3 COLS) */}
            <div>
              <div className="text-center max-w-2xl mx-auto mb-10">
                <Badge className="bg-amber-500/20 text-amber-500 mb-2">HACIENTAS Y PARADAS OBLIGADAS</Badge>
                <h3 className="font-display text-2xl sm:text-3xl font-bold">
                  Paradas Emblemáticas de la Ruta
                </h3>
                <p className="text-muted-foreground text-sm mt-2">
                  Haciendas, factorías y talleres que no puedes dejar de visitar en este recorrido.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {rutaActual.paradasClave.map((parada, idx) => (
                  <motion.div
                    key={parada.nombre}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-amber-500/40 transition-all duration-300 flex flex-col"
                  >
                    <div className="aspect-[16/10] relative overflow-hidden bg-muted">
                      <img
                        src={parada.imagen}
                        alt={parada.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white font-mono text-xs px-2.5 py-1 rounded-md border border-white/10">
                        Parada {idx + 1}
                      </span>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-amber-500 font-medium flex items-center gap-1 mb-1">
                          <MapPin className="h-3 w-3" />
                          {parada.ubicacion}
                        </p>
                        <h4 className="font-display font-bold text-lg text-foreground mb-2 leading-tight">
                          {parada.nombre}
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                          {parada.descripcion}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-border/60 bg-muted/30 -mx-6 -mb-6 p-4 mt-auto">
                        <p className="text-xs font-semibold text-foreground flex items-start gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>{parada.destacado}</span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* BANNER PUBLICITARIO RESPONSIVE */}
            <BetweenSectionsAd position="rutas-sabor-mid" />

            {/* TOURS Y EXPERIENCIAS DISPONIBLES */}
            <div>
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
                <div>
                  <Badge className="bg-amber-500/20 text-amber-500 mb-2">EXPERIENCIAS GUIADAS</Badge>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold">
                    Tours y Catas Disponibles
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm max-w-md mt-2 md:mt-0">
                  Reserva directamente con operadores certificados con seguro turístico y transporte incluido.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {rutaActual.tours.map((tour, idx) => (
                  <Card key={idx} className="bg-card border-border hover:border-amber-500/30 transition-all">
                    <CardContent className="p-6 sm:p-8">
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
                          Certificado MITUR
                        </Badge>
                        <div className="flex items-center gap-1 text-sm font-semibold">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span>{tour.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      <h4 className="font-display text-xl sm:text-2xl font-bold mb-2 text-foreground">
                        {tour.nombre}
                      </h4>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-primary" />
                          {tour.duracion}
                        </span>
                        <span className="text-xl font-bold text-amber-500">
                          {tour.precio}
                        </span>
                      </div>

                      <div className="space-y-2 mb-6">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                          Qué incluye:
                        </p>
                        {tour.incluye.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>

                      <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white gap-2 font-medium py-5">
                        Reservar Plaza para el Tour <ChevronRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* MARIDAJES Y ARTE DE LA CATA */}
            <div className="bg-card rounded-3xl p-8 sm:p-10 border border-border">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <Badge className="bg-amber-500/20 text-amber-500 mb-2">
                  <Wine className="h-3 w-3 mr-1 inline" />
                  ARTE DEL MARIDAJE CRIOLLO
                </Badge>
                <h3 className="font-display text-2xl sm:text-3xl font-bold">
                  Armonía y Perfiles de Cata
                </h3>
                <p className="text-muted-foreground text-sm mt-2">
                  Combinaciones maestras recomendadas por sumilleres gastronómicos dominicanos.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {rutaActual.maridaje.map((item, index) => (
                  <div
                    key={index}
                    className="bg-background rounded-2xl p-6 border border-border flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-amber-500 text-sm font-semibold mb-2">
                        <Sparkles className="h-4 w-4" />
                        <span>Maridaje Recomendado #{index + 1}</span>
                      </div>
                      <h4 className="font-bold text-lg text-foreground mb-1">
                        {item.protagonista}
                      </h4>
                      <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-4">
                        + {item.acompaniamiento}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        "{item.notaCata}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* CTA FINAL NAVEGACIÓN */}
        <section className="py-16 bg-muted/40 border-t border-border">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h3 className="font-display text-2xl sm:text-3xl font-bold mb-4">
              ¿Listo para saborear lo mejor de Quisqueya?
            </h3>
            <p className="text-muted-foreground mb-8">
              Continúa tu viaje gastronómico explorando nuestro recetario tradicional o encuentra los mejores restaurantes de cada provincia.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link to="/guia-gastronomica">Explorar Guía de Restaurantes</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/recetas-criollas">Ver Recetas Criollas Paso a Paso</Link>
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
