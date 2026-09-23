import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { PanoramaAd } from "@/components/promo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Headphones, Play, Pause, Download, Clock, MapPin, Volume2, 
  ChevronRight, Radio, Smartphone, WifiOff, Sparkles, CheckCircle,
  Share2, ArrowRight
} from "lucide-react";
import { toast } from "sonner";

import santoDomingoImg from "@/assets/santo-domingo.jpg";
import samanaImg from "@/assets/samana.jpg";
import adventureImg from "@/assets/adventure.jpg";
import gastronomyImg from "@/assets/gastronomy.jpg";

interface AudioGuide {
  id: number;
  title: string;
  category: "historia" | "naturaleza" | "gastronomia" | "aventura";
  location: string;
  duration: string;
  stops: number;
  language: string;
  description: string;
  downloaded: boolean;
  size: string;
  image: string;
  narrator: string;
}

const audioGuidesList: AudioGuide[] = [
  { 
    id: 1, 
    title: "Secretos de la Ciudad Primada de América", 
    category: "historia",
    location: "Zona Colonial, Santo Domingo", 
    duration: "45 min", 
    stops: 12, 
    language: "Español / Inglés", 
    description: "Recorrido histórico inmersivo por el Alcázar de Colón, Calle Las Damas, Fortaleza Ozama y la Catedral Primada.", 
    downloaded: false, 
    size: "85 MB",
    image: santoDomingoImg,
    narrator: "Dra. Altagracia Pou (Historiadora)"
  },
  { 
    id: 2, 
    title: "Santuario de Ballenas y Selva Tropical", 
    category: "naturaleza",
    location: "Bahía de Samaná", 
    duration: "30 min", 
    stops: 5, 
    language: "Español / Inglés / Francés", 
    description: "Guía acústica y biológica de las ballenas jorobadas, el Parque Nacional Los Haitises y Cayo Levantado.", 
    downloaded: true, 
    size: "62 MB",
    image: samanaImg,
    narrator: "Biólogo Marino Carlos De Moya"
  },
  { 
    id: 3, 
    title: "Expedición Épica al Pico Duarte", 
    category: "aventura",
    location: "Cordillera Central, Jarabacoa", 
    duration: "1h 45 min", 
    stops: 8, 
    language: "Español / Inglés", 
    description: "Narración de apoyo paso a paso por los senderos de La Ciénaga, Los Tablones, La Compartición hasta la cima.", 
    downloaded: false, 
    size: "145 MB",
    image: adventureImg,
    narrator: "Guía de Montaña Juan 'Pico' Jiménez"
  },
  { 
    id: 4, 
    title: "Ruta del Cacao y Sabores Quisqueyanos", 
    category: "gastronomia",
    location: "San Francisco de Macorís / Nacional", 
    duration: "25 min", 
    stops: 10, 
    language: "Español / Inglés", 
    description: "De la mazorca al chocolate fino y los secretos del sancocho criollo, mangú con los tres golpes y café de altura.", 
    downloaded: true, 
    size: "48 MB",
    image: gastronomyImg,
    narrator: "Chef Inés Páez (Chef Tita)"
  },
  { 
    id: 5, 
    title: "Misterios Taínos de Los Haitises", 
    category: "historia",
    location: "Parque Nacional Los Haitises", 
    duration: "35 min", 
    stops: 6, 
    language: "Español / Inglés", 
    description: "Pictografías milenarias, cavernas sagradas de La Arena y el ferrocarril bananero perdido en la selva.", 
    downloaded: false, 
    size: "72 MB",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop",
    narrator: "Antropólogo Manuel García"
  },
  { 
    id: 6, 
    title: "Ruta del Tabaco y el Ron Dominicano", 
    category: "gastronomia",
    location: "Santiago de los Caballeros / San Pedro", 
    duration: "40 min", 
    stops: 7, 
    language: "Español / Inglés", 
    description: "Proceso artesanal de torcido de cigarros premium y la herencia de las grandes bodegas de añejamiento.", 
    downloaded: false, 
    size: "78 MB",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=400&fit=crop",
    narrator: "Master Blender Roberto Henríquez"
  },
];

const featuresList = [
  {
    icon: Smartphone,
    title: "Geolocalización GPS Automática",
    desc: "El audio se activa por sí solo en el momento exacto en que te paras frente a un monumento o mirador."
  },
  {
    icon: WifiOff,
    title: "100% Funcional Sin Conexión",
    desc: "Descarga la audioguía antes de salir del hotel para disfrutar de la experiencia sin consumir tus datos móviles."
  },
  {
    icon: Radio,
    title: "Sonido Envolvente 3D",
    desc: "Efectos sonoros ambientales reales, música folclórica dominicana y narraciones de historiadores galardonados."
  }
];

export default function AudioGuias() {
  const [playing, setPlaying] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("todas");
  const [guides, setGuides] = useState(audioGuidesList);

  const filteredGuides = activeCategory === "todas" 
    ? guides 
    : guides.filter(g => g.category === activeCategory);

  const toggleDownload = (id: number) => {
    setGuides(prev => prev.map(g => {
      if (g.id === id) {
        const nextState = !g.downloaded;
        toast.success(nextState ? `Audioguía "${g.title}" descargada sin conexión.` : `Audioguía eliminada del almacenamiento local.`);
        return { ...g, downloaded: nextState };
      }
      return g;
    }));
  };

  const togglePlay = (id: number) => {
    if (playing === id) {
      setPlaying(null);
    } else {
      setPlaying(id);
      const current = guides.find(g => g.id === id);
      if (current) {
        toast.info(`Reproduciendo: ${current.title}`, {
          description: `Narrado por ${current.narrator}`
        });
      }
    }
  };

  return (
    <PageTransition>
      <SEOHead
        title="Audioguías de República Dominicana | Recorridos Narrados con GPS"
        description="Explora la Zona Colonial, Samaná, el Pico Duarte y Los Haitises con audioguías interactivas narradas por expertos. Descarga sin conexión."
        keywords="audioguias republica dominicana, audioguia zona colonial, audio tour rd, relatos dominicanos, tours guiados con gps"
      />
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />

        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[460px] flex items-end overflow-hidden">
          <img
            src={santoDomingoImg}
            alt="Audioguías en República Dominicana"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-black/40" />

          <div className="relative z-10 container mx-auto px-4 lg:px-8 pb-12">
            <nav className="flex items-center gap-2 text-xs md:text-sm text-white/80 mb-4">
              <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link to="/experiencias" className="hover:text-primary transition-colors">Experiencias</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-white font-medium">Audioguías Oficiales</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <Badge className="mb-3 bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs px-3 py-1">
                  <Headphones className="h-3.5 w-3.5 mr-1.5" /> EXPERIENCIA INMERSIVA
                </Badge>
                <h1 className="font-display text-4xl md:text-6xl font-black text-white tracking-tight mb-3">
                  Audioguías de RD
                </h1>
                <p className="text-base md:text-lg text-white/90 max-w-2xl leading-relaxed">
                  Descubre los secretos mejor guardados de nuestra historia, naturaleza y cultura narrados por historiadores, biólogos y chefs locales.
                </p>
              </div>

              {/* Stats pill */}
              <div className="flex flex-wrap gap-4 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-white">
                <div className="text-center px-2">
                  <p className="font-display text-2xl font-bold text-primary">{guides.length}</p>
                  <p className="text-[11px] text-white/70 uppercase">Tours Narrados</p>
                </div>
                <div className="text-center px-2 border-l border-white/10">
                  <p className="font-display text-2xl font-bold text-emerald-400">100%</p>
                  <p className="text-[11px] text-white/70 uppercase">Modo Offline</p>
                </div>
                <div className="text-center px-2 border-l border-white/10">
                  <p className="font-display text-2xl font-bold text-indigo-400">GPS</p>
                  <p className="text-[11px] text-white/70 uppercase">Auto-Play</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Selector */}
        <section className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border/80 py-4 shadow-sm">
          <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-2">
              <Button 
                variant={activeCategory === "todas" ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveCategory("todas")}
                className="rounded-full text-xs"
              >
                Todas ({guides.length})
              </Button>
              <Button 
                variant={activeCategory === "historia" ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveCategory("historia")}
                className="rounded-full text-xs"
              >
                Historia & Monumentos
              </Button>
              <Button 
                variant={activeCategory === "naturaleza" ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveCategory("naturaleza")}
                className="rounded-full text-xs"
              >
                Naturaleza & Ballenas
              </Button>
              <Button 
                variant={activeCategory === "gastronomia" ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveCategory("gastronomia")}
                className="rounded-full text-xs"
              >
                Gastronomía & Sabores
              </Button>
              <Button 
                variant={activeCategory === "aventura" ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveCategory("aventura")}
                className="rounded-full text-xs"
              >
                Aventura & Cumbres
              </Button>
            </div>
          </div>
        </section>

        {/* Audio Guides Grid */}
        <section className="container mx-auto px-4 lg:px-8 py-12 flex-1">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map((guide) => {
              const isPlaying = playing === guide.id;
              return (
                <Card 
                  key={guide.id} 
                  className={`overflow-hidden border transition-all duration-300 flex flex-col ${
                    isPlaying ? "border-primary shadow-xl ring-2 ring-primary/20 bg-card" : "border-border/70 bg-card/80 hover:border-primary/40 hover:shadow-lg"
                  }`}
                >
                  <div className="relative h-48 overflow-hidden bg-muted">
                    <img 
                      src={guide.image} 
                      alt={guide.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

                    <div className="absolute top-3 left-3">
                      <Badge className="bg-black/75 backdrop-blur-md text-white border-white/20 text-xs font-semibold">
                        <MapPin className="h-3 w-3 mr-1 text-primary" /> {guide.location}
                      </Badge>
                    </div>

                    <div className="absolute top-3 right-3">
                      <Button
                        size="icon"
                        variant={isPlaying ? "default" : "secondary"}
                        className={`rounded-full h-11 w-11 shadow-lg transition-transform ${isPlaying ? "scale-105" : "hover:scale-110"}`}
                        onClick={() => togglePlay(guide.id)}
                        aria-label={isPlaying ? "Pausar audioguía" : "Reproducir audioguía"}
                      >
                        {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
                      </Button>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-primary" /> {guide.duration}
                      </span>
                      <span className="flex items-center gap-1 font-semibold">
                        <Volume2 className="h-3.5 w-3.5 text-indigo-400" /> {guide.stops} Paradas
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-5 flex flex-col flex-1">
                    <h3 className="font-display font-bold text-lg text-foreground mb-1 leading-snug">
                      {guide.title}
                    </h3>
                    <p className="text-[11px] font-semibold text-primary mb-2">
                      🎙️ {guide.narrator}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">
                      {guide.description}
                    </p>

                    {/* Active player visualizer */}
                    {isPlaying && (
                      <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-xl space-y-2 animate-in fade-in">
                        <div className="flex items-center justify-between text-xs font-mono text-primary font-bold">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-primary animate-ping" /> EN REPRODUCCIÓN
                          </span>
                          <span>04:18 / {guide.duration}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: '42%' }} />
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[11px] text-muted-foreground block">{guide.language}</span>
                        <span className="text-[11px] text-muted-foreground font-mono">{guide.size}</span>
                      </div>

                      <Button 
                        size="sm" 
                        variant={guide.downloaded ? "secondary" : "outline"}
                        className={`text-xs gap-1.5 rounded-xl ${guide.downloaded ? "text-emerald-500 border-emerald-500/30" : ""}`}
                        onClick={() => toggleDownload(guide.id)}
                      >
                        {guide.downloaded ? (
                          <>
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Descargada
                          </>
                        ) : (
                          <>
                            <Download className="h-3.5 w-3.5" /> Descargar Offline
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-card/40 border-y border-border/50">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
            <div className="text-center mb-12">
              <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">
                TECNOLOGÍA INTELIGENTE
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                ¿Cómo Funciona la Audioguía con GPS?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
                Tu teléfono se convierte en un guía turístico privado que reacciona a tu ubicación en tiempo real.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {featuresList.map((item) => (
                <div key={item.title} className="p-6 bg-card rounded-2xl border border-border text-center flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <item.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-display font-bold text-base text-foreground mb-2">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
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

        <Footer />
      </div>
    </PageTransition>
  );
}
