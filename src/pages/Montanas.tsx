import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Mountain, Search, MapPin, Star, Ruler, Filter, ChevronRight,
  Compass, ShieldCheck, Footprints, Tent, Thermometer, CloudSun,
  AlertTriangle, HelpCircle, ArrowUpRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { PanoramaAd } from "@/components/promo";
import { mountains, rangeLabels, Mountain as MountainType } from "@/data/mountains";

import adventureImg from "@/assets/adventure.jpg";

const difficultyLabels: Record<MountainType['difficulty'], { label: string; color: string }> = {
  'facil': { label: 'Fácil', color: 'bg-emerald-500' },
  'moderado': { label: 'Moderado', color: 'bg-amber-500' },
  'dificil': { label: 'Difícil', color: 'bg-orange-500' },
  'experto': { label: 'Experto', color: 'bg-red-600' }
};

const rutasPicoDuarte = [
  {
    nombre: "Ruta La Ciénaga - Manabao (Clásica)",
    distancia: "46 km ida y vuelta",
    duracion: "2 a 3 días",
    dificultad: "Exigente",
    descripcion: "La ruta más popular y con mejor infraestructura de refugios (La Compartición). Cruza bosques nublados de pinos criollos.",
    puntoPartida: "Jarabacoa, La Vega"
  },
  {
    nombre: "Ruta Mata Grande - San José de las Matas",
    distancia: "90 km travesía completa",
    duracion: "4 a 5 días",
    dificultad: "Experto / Extremo",
    descripcion: "Para montañistas experimentados. Paisajes vírgenes del Parque Nacional Armando Bermúdez y cruce del Valle del Tetero.",
    puntoPartida: "SAJOMA, Santiago"
  },
  {
    nombre: "Ruta Sabaneta - San Juan",
    distancia: "48 km travesía sur-norte",
    duracion: "3 a 4 días",
    dificultad: "Alta",
    descripcion: "Ascenso desde el Valle de San Juan cruzando la vertiente sur de la Cordillera Central.",
    puntoPartida: "Presa de Sabaneta, San Juan"
  }
];

const miradoresDestacados = [
  {
    nombre: "Montaña Redonda",
    ubicacion: "Miches, El Seibo",
    altitud: "330 m",
    destacado: "Columpios gigantes y vistas 360° a las lagunas Redonda y Limón y la bahía de Samaná.",
    imagen: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
    enlace: "/montana/montana-redonda"
  },
  {
    nombre: "Loma Isabel de Torres",
    ubicacion: "Puerto Plata",
    altitud: "793 m",
    destacado: "Ascenso en teleférico, Cristo Redentor y exuberante jardín botánico de montaña sobre el Atlántico.",
    imagen: "https://images.unsplash.com/photo-1590523278191-995cbcda646b?w=600&h=400&fit=crop",
    enlace: "/montana/isabel-de-torres"
  },
  {
    nombre: "Loma Miranda",
    ubicacion: "Bonao / La Vega",
    altitud: "650 m",
    destacado: "Santuario de biodiversidad con manantiales cristalinos y senderos ecológicos comunitarios.",
    imagen: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop",
    enlace: "/montana/loma-miranda"
  }
];

const faqsMontanismo = [
  {
    pregunta: "¿Se necesita permiso oficial para subir al Pico Duarte?",
    respuesta: "Sí. Es obligatorio registrarse ante el Ministerio de Medio Ambiente y contratar un guía local certificado y mulas de carga en la caseta del Parque Nacional Armando Bermúdez."
  },
  {
    pregunta: "¿Cuál es la mejor temporada para hacer montañismo en RD?",
    respuesta: "Entre diciembre y marzo el clima es más fresco y seco (las temperaturas en la cumbre del Pico Duarte y Valle del Tetero pueden bajar de 0°C). De junio a noviembre hay mayor probabilidad de lluvias."
  },
  {
    pregunta: "¿Qué vestimenta y equipo básico se requiere?",
    respuesta: "Botas de trekking impermeables con buen soporte de tobillo, ropa térmica en capas, chaqueta cortavientos/impermeable, linterna frontal con baterías extra, bolsa de dormir térmica (-5°C) y pastillas potabilizadoras de agua."
  }
];

export default function Montanas() {
  const [search, setSearch] = useState("");
  const [rangeFilter, setRangeFilter] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");

  const filtered = useMemo(() => {
    return mountains.filter(m => {
      const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.provinceName.toLowerCase().includes(search.toLowerCase());
      const matchRange = !rangeFilter || m.range === rangeFilter;
      const matchDiff = !difficultyFilter || m.difficulty === difficultyFilter;
      return matchSearch && matchRange && matchDiff;
    });
  }, [search, rangeFilter, difficultyFilter]);

  const ranges = Object.entries(rangeLabels);

  return (
    <PageTransition>
      <SEOHead
        title="Montañas y Picos de República Dominicana | Senderismo y Cumbres RD"
        description="Explora las montañas, cordilleras y picos principales de RD: Pico Duarte (3,098m), Isabel de Torres, Montaña Redonda, La Pelona y rutas de trekking."
        keywords="montañas republica dominicana, pico duarte, cordillera central, senderismo rd, trekking caribe, montaña redonda, isabel de torres"
      />
      <div className="min-h-screen bg-background flex flex-col text-foreground">
        <Header />

        {/* Hero Section */}
        <section className="relative h-[65vh] min-h-[480px] flex items-end overflow-hidden">
          <img
            src={adventureImg}
            alt="Cordillera Central y Montañas de República Dominicana"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-black/30" />

          <div className="relative z-10 container mx-auto px-4 lg:px-8 pb-12">
            <nav className="flex items-center gap-2 text-xs md:text-sm text-white/80 mb-4">
              <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link to="/ecoturismo" className="hover:text-primary transition-colors">Ecoturismo</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-white font-medium">Montañas y Picos</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <Badge className="mb-3 bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs px-3 py-1">
                  <Mountain className="h-3.5 w-3.5 mr-1.5" /> TECHO DEL CARIBE
                </Badge>
                <h1 className="font-display text-4xl md:text-6xl font-black text-white tracking-tight mb-3">
                  Montañas & Picos de RD
                </h1>
                <p className="text-base md:text-lg text-white/90 max-w-2xl leading-relaxed">
                  Desde el imponente Pico Duarte a 3,098 metros de altura hasta miradores escénicos con vistas al Atlántico y el Mar Caribe.
                </p>
              </div>

              {/* Stat Badges */}
              <div className="flex flex-wrap gap-3 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-white">
                <div className="text-center px-3 border-r border-white/10 last:border-none">
                  <p className="font-display text-2xl font-bold text-primary">{mountains.length}+</p>
                  <p className="text-[11px] text-white/70 uppercase">Cumbres Principales</p>
                </div>
                <div className="text-center px-3 border-r border-white/10 last:border-none">
                  <p className="font-display text-2xl font-bold text-emerald-400">3,098 m</p>
                  <p className="text-[11px] text-white/70 uppercase">Punto Más Alto</p>
                </div>
                <div className="text-center px-3">
                  <p className="font-display text-2xl font-bold text-amber-400">6</p>
                  <p className="text-[11px] text-white/70 uppercase">Sistemas Montañosos</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters & Search */}
        <section className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border/80 py-4 shadow-sm">
          <div className="container mx-auto px-4 lg:px-8 space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar montaña por nombre, provincia o cordillera..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  className="pl-10 h-11 bg-card rounded-xl border-border/70" 
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                <Button 
                  variant={rangeFilter === "" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setRangeFilter("")}
                  className="rounded-full text-xs"
                >
                  Todas las Cordilleras
                </Button>
                {ranges.map(([key, label]) => (
                  <Button 
                    key={key} 
                    variant={rangeFilter === key ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => setRangeFilter(rangeFilter === key ? "" : key)}
                    className="rounded-full text-xs whitespace-nowrap"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
              <span className="text-muted-foreground font-semibold flex items-center gap-1">
                <Filter className="h-3 w-3 text-primary" /> Dificultad:
              </span>
              <Button 
                variant={difficultyFilter === "" ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setDifficultyFilter("")}
                className="h-7 text-xs rounded-full"
              >
                Todas
              </Button>
              {Object.entries(difficultyLabels).map(([key, { label, color }]) => (
                <Button 
                  key={key} 
                  variant={difficultyFilter === key ? "default" : "ghost"} 
                  size="sm" 
                  onClick={() => setDifficultyFilter(difficultyFilter === key ? "" : key)}
                  className="h-7 text-xs rounded-full gap-1.5"
                >
                  <span className={`w-2 h-2 rounded-full ${color}`} />
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Mountain Cards Grid */}
        <section className="container mx-auto px-4 lg:px-8 py-10 flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground font-medium">
              Mostrando <span className="text-foreground font-bold">{filtered.length}</span> montañas y senderos
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((m, i) => {
              const diff = difficultyLabels[m.difficulty] || difficultyLabels.moderado;
              return (
                <motion.div 
                  key={m.id} 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.04 }}
                >
                  <Link 
                    to={`/montana/${m.slug}`} 
                    className="group flex flex-col h-full rounded-2xl overflow-hidden bg-card border border-border/70 hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative h-52 overflow-hidden bg-muted">
                      <img 
                        src={m.imageUrl || adventureImg} 
                        alt={m.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                      
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <Badge className={`${diff.color} text-white border-none text-[11px] shadow-sm font-semibold`}>
                          {diff.label}
                        </Badge>
                      </div>

                      <div className="absolute top-3 right-3">
                        <Badge className="bg-black/75 backdrop-blur-md text-white border-white/20 text-xs font-bold">
                          <Ruler className="h-3 w-3 mr-1 text-primary" /> {m.altitude.toLocaleString()} m
                        </Badge>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                        <span className="flex items-center gap-1 font-medium drop-shadow">
                          <MapPin className="h-3.5 w-3.5 text-primary" /> {m.provinceName}
                        </span>
                        <span className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-full text-amber-300 font-bold">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {m.rating || "4.8"}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-1">
                        {rangeLabels[m.range] || "Cordillera Central"}
                      </p>
                      <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                        {m.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4 flex-1">
                        {m.shortDescription}
                      </p>

                      <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-primary">
                        <span>Ver ruta y detalles</span>
                        <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 bg-card rounded-2xl border border-border">
              <Mountain className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="font-bold text-lg text-foreground mb-1">No se encontraron montañas</h3>
              <p className="text-sm text-muted-foreground mb-4">Intenta cambiar los filtros o el término de búsqueda.</p>
              <Button onClick={() => { setSearch(""); setRangeFilter(""); setDifficultyFilter(""); }} variant="outline">
                Limpiar Filtros
              </Button>
            </div>
          )}
        </section>

        {/* Pico Duarte Expedition Guide Section */}
        <section className="py-16 bg-card/40 border-y border-border/50">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
            <div className="text-center mb-12">
              <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">
                GUÍA DE EXPEDICIÓN
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl font-black text-foreground mb-3">
                Ascenso al Pico Duarte (3,098 m)
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
                La cumbre más alta de todas las Antillas. Conoce las principales rutas de trekking y qué necesitas para coronar el techo del Caribe.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {rutasPicoDuarte.map((ruta, i) => (
                <Card key={ruta.nombre} className="border-border/70 bg-card hover:border-primary/40 transition-all flex flex-col">
                  <CardContent className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">Ruta #{i + 1}</span>
                      <Badge variant="outline" className="text-xs">{ruta.dificultad}</Badge>
                    </div>
                    <h3 className="font-display font-bold text-lg text-foreground mb-2">{ruta.nombre}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">{ruta.descripcion}</p>
                    
                    <div className="space-y-1.5 pt-3 border-t border-border text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Distancia:</span>
                        <strong className="text-foreground">{ruta.distancia}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Duración:</span>
                        <strong className="text-foreground">{ruta.duracion}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Partida:</span>
                        <strong className="text-foreground">{ruta.puntoPartida}</strong>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Essential Equipment Box */}
            <div className="bg-gradient-to-r from-emerald-950/40 via-card to-card border border-emerald-500/30 rounded-2xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Tent className="h-8 w-8" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h4 className="font-display font-bold text-xl text-foreground mb-1">
                    Equipo & Requisitos Obligatorios
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Saco de dormir térmico (-5°C), ropa impermeable por capas, botas de montaña, linterna frontal y contratación de guía comunitario certificado con mulas de soporte.
                  </p>
                </div>
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white flex-shrink-0">
                  <Link to="/pico-duarte">Ver Guía Completa Pico Duarte</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Scenic Viewpoints Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
            <div className="text-center mb-12">
              <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">
                TURISMO ACCESIBLE
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl font-black text-foreground mb-3">
                Miradores y Picos Panorámicos
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
                Cumbres con vistas de ensueño aptas para toda la familia y accesibles en teleférico, vehículos 4x4 o caminatas cortas.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {miradoresDestacados.map((m) => (
                <Link 
                  key={m.nombre} 
                  to={m.enlace}
                  className="group rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/40 hover:shadow-xl transition-all"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img src={m.imagen} alt={m.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-black/75 text-white border-white/20 text-xs">{m.altitud}</Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-primary font-bold uppercase mb-1">{m.ubicacion}</p>
                    <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors mb-2">{m.nombre}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{m.destacado}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Panorama Ad Section */}
        <section className="py-6 bg-muted/20 border-t border-border/40">
          <div className="container mx-auto px-4 max-w-6xl">
            <PanoramaAd showDemo />
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8 text-center flex items-center justify-center gap-2">
              <HelpCircle className="h-6 w-6 text-primary" /> Preguntas Frecuentes sobre Montañismo en RD
            </h2>
            <div className="space-y-4">
              {faqsMontanismo.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-xl border border-border space-y-2">
                  <h3 className="font-semibold text-foreground text-base">{faq.pregunta}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.respuesta}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
