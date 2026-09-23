import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { PanoramaAd } from "@/components/promo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Coffee, MapPin, Compass, AlertCircle, Sparkles, BookOpen, Star, 
  ChevronRight, Wine, GlassWater, Clock, CheckCircle, ArrowRight
} from "lucide-react";
import { toast } from "sonner";

import gastronomyImg from "@/assets/gastronomy.jpg";

interface Bebida {
  name: string;
  category: "alcohol" | "non-alcohol" | "traditional";
  history: string;
  notes: string;
  brands: string[];
  image: string;
  rating: number;
  origin: string;
}

const bebidasList: Bebida[] = [
  {
    name: "Ron Dominicano Añejo",
    category: "alcohol",
    history: "La caña de azúcar introducida en 1493 floreció en Quisqueya. El método de añejamiento en barricas de roble blanco americano crea rones suaves con denominación de origen.",
    notes: "Notas intensas de vainilla, caramelo, frutos secos, cacao tostado y un final amaderado sedoso.",
    brands: ["Brugal (1888, Leyenda)", "Barceló (Imperial)", "Bermúdez", "Siboney"],
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&h=400&fit=crop",
    rating: 5.0,
    origin: "Puerto Plata & San Pedro"
  },
  {
    name: "Mamajuana Taína",
    category: "traditional",
    history: "Elixir ancestral curativo heredado de los taínos a base de raíces (bejuco indio, anamú, timacle) maceradas con ron dominicano, vino tinto y miel de abeja pura.",
    notes: "Sabor herbal aromático, dulce, especiado, con matices terrosos y propiedades energizantes reconocidas.",
    brands: ["Kalembú", "Karibú", "Elaboración artesanal"],
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=400&fit=crop",
    rating: 4.9,
    origin: "Todo el país / Samaná"
  },
  {
    name: "Cerveza Presidente 'Vestida de Novia'",
    category: "alcohol",
    history: "Nacida en 1935, es el ícono cervecero dominicano. El término popular 'vestida de novia' o 'ceniza' describe su punto de congelación exacto con capa de escarcha blanca.",
    notes: "Pilsner ligera, crujiente y sumamente refrescante, servida entre -2°C y 0°C con suave amargor de lúpulo.",
    brands: ["Cervecería Nacional Dominicana"],
    image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&h=400&fit=crop",
    rating: 4.8,
    origin: "Santo Domingo"
  },
  {
    name: "Morir Soñando Tradicional",
    category: "non-alcohol",
    history: "La joya de las meriendas dominicanas. Un néctar celestial que combina zumo recién exprimido de naranja dulce con leche evaporada bien fría y vainilla.",
    notes: "Textura aterciopelada de batida cremosa con perfecto balance cítrico dulce sin llegar a cortarse.",
    brands: ["Cafeterías locales y colmados"],
    image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600&h=400&fit=crop",
    rating: 4.9,
    origin: "Tradición Nacional"
  },
  {
    name: "Mabí Taíno de Bejuco Indio / Cacheo",
    category: "traditional",
    history: "Bebida fermentada ancestral de corteza de bejuco indio y azúcar de caña. En El Seibo y San Juan de la Maguana se mantiene la receta tradicional en tinajas.",
    notes: "Efervescencia natural ligera, regusto herbal agridulce y refrescante efecto digestivo.",
    brands: ["Mabí Seibano", "Mabí de Cacheo"],
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&h=400&fit=crop",
    rating: 4.7,
    origin: "El Seibo & San Juan"
  },
  {
    name: "Jugo de Chinola Fresco (Maracuyá)",
    category: "non-alcohol",
    history: "La fruta de la pasión caribeña en su máxima expresión. Los campos de Monte Plata y Hato Mayor producen las chinolas más jugosas y aromáticas.",
    notes: "Explosión cítrica tropical de acidez vibrante, ideal para acompañar un almuerzo de pescado frito en la playa.",
    brands: ["Puestos playeros y restaurantes"],
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&h=400&fit=crop",
    rating: 4.9,
    origin: "Monte Plata & Hato Mayor"
  }
];

const recetasCocteles = [
  {
    nombre: "Santo Libre Clásico",
    ingredientes: ["2 oz Ron Dominicano Añejo o Blanco", "1 oz Zumo de lima recién exprimido", "Refresco de lima-limón (Sprite/7Up)", "Hielo abundante y rodaja de lima"],
    preparacion: "Llena un vaso alto con hielo, vierte el ron y el zumo de lima, completa con refresco de lima-limón y mezcla suavemente."
  },
  {
    nombre: "Morir Soñando Perfecto (Truco de la Abuela)",
    ingredientes: ["1 taza de Zumo de naranja dulce colado", "1 lata de Leche Evaporada bien fría", "3 cucharadas de azúcar de caña", "1 cdta de vainilla y hielo picado"],
    preparacion: "Disuelve el azúcar y vainilla en la leche evaporada con el hielo. Vierte el zumo de naranja MUY LENTAMENTE mientras bates enérgicamente con cuchara para evitar que la leche se corte."
  }
];

export default function BebidasRD() {
  const [activeTab, setActiveTab] = useState<string>("all");

  const filteredBebidas = bebidasList.filter(bebida => {
    if (activeTab === "all") return true;
    return bebida.category === activeTab;
  });

  return (
    <PageTransition>
      <SEOHead
        title="Guía de Bebidas y Licores de República Dominicana | Ron, Mamajuana y Más"
        description="Descubre las bebidas emblemáticas de RD: Ron dominicano añejo, Mamajuana taína, Cerveza Presidente, Morir Soñando y Mabí. Recetas y rutas de degustación."
        keywords="bebidas republica dominicana, ron dominicano, mamajuana receta, morir soñando dominicano, cerveza presidente, mabi seibano"
      />
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />

        {/* Hero Section */}
        <section className="relative h-[65vh] min-h-[480px] flex items-end overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1920&h=800&fit=crop"
            alt="Bebidas, Licores y Cócteles Típicos de República Dominicana"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-black/30" />

          <div className="relative z-10 container mx-auto px-4 lg:px-8 pb-12">
            <nav className="flex items-center gap-2 text-xs md:text-sm text-white/80 mb-4">
              <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link to="/guia-gastronomica" className="hover:text-primary transition-colors">Gastronomía</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-white font-medium">Bebidas y Licores de RD</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <Badge className="mb-3 bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs px-3 py-1 font-semibold">
                  🍹 PATRIMONIO LÍQUIDO DE QUISQUEYA
                </Badge>
                <h1 className="font-display text-4xl md:text-6xl font-black text-white tracking-tight mb-3">
                  Bebidas & Licores de RD
                </h1>
                <p className="text-base md:text-lg text-white/90 max-w-2xl leading-relaxed">
                  Desde rones centenarios galardonados internacionalmente y el místico elixir de mamajuana hasta batidas tropicales como el morir soñando.
                </p>
              </div>

              {/* Stats pill */}
              <div className="flex flex-wrap gap-3 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-white">
                <div className="text-center px-3 border-r border-white/10 last:border-none">
                  <p className="font-display text-2xl font-bold text-amber-400">1888</p>
                  <p className="text-[11px] text-white/70 uppercase">Herencia Ronera</p>
                </div>
                <div className="text-center px-3 border-r border-white/10 last:border-none">
                  <p className="font-display text-2xl font-bold text-emerald-400">100%</p>
                  <p className="text-[11px] text-white/70 uppercase">Ingredientes Naturales</p>
                </div>
                <div className="text-center px-3">
                  <p className="font-display text-2xl font-bold text-primary">Taína</p>
                  <p className="text-[11px] text-white/70 uppercase">Raíz Ancestral</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Tabs */}
        <section className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border/80 py-4 shadow-sm">
          <div className="container mx-auto px-4 lg:px-8 flex justify-center">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-card border border-border">
                <TabsTrigger value="all">Todas ({bebidasList.length})</TabsTrigger>
                <TabsTrigger value="alcohol">Espirituosas & Ron</TabsTrigger>
                <TabsTrigger value="traditional">Ancestrales & Tradicionales</TabsTrigger>
                <TabsTrigger value="non-alcohol">Sin Alcohol & Batidas</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </section>

        {/* Bebidas Grid */}
        <section className="container mx-auto px-4 lg:px-8 py-12 flex-1">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBebidas.map((bebida) => (
              <Card key={bebida.name} className="overflow-hidden bg-card border-border/80 hover:border-primary/40 hover:shadow-xl transition-all duration-300 flex flex-col">
                <div className="relative h-52 overflow-hidden bg-muted">
                  <img 
                    src={bebida.image} 
                    alt={bebida.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />

                  <div className="absolute top-3 left-3">
                    <Badge className="bg-amber-500 text-slate-950 font-bold border-none text-[11px]">
                      {bebida.category === "alcohol" ? "Espirituosa" : bebida.category === "traditional" ? "Tradición Ancestral" : "Sin Alcohol"}
                    </Badge>
                  </div>

                  <div className="absolute top-3 right-3">
                    <Badge className="bg-black/70 text-amber-300 border-none text-xs font-bold">
                      ★ {bebida.rating}
                    </Badge>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="flex items-center gap-1 font-semibold">
                      <MapPin className="h-3.5 w-3.5 text-primary" /> {bebida.origin}
                    </span>
                  </div>
                </div>

                <CardContent className="p-5 flex flex-col flex-1">
                  <h3 className="font-display font-bold text-xl text-foreground mb-2">
                    {bebida.name}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">
                    {bebida.history}
                  </p>

                  <div className="p-3 bg-muted/30 rounded-xl border border-border/60 text-xs text-muted-foreground space-y-1 mb-4">
                    <strong className="text-foreground block text-[11px] uppercase tracking-wider">Notas de Cata:</strong>
                    <p className="italic">{bebida.notes}</p>
                  </div>

                  <div className="pt-3 border-t border-border flex flex-wrap gap-1.5">
                    {bebida.brands.map((b) => (
                      <Badge key={b} variant="secondary" className="text-[10px]">
                        {b}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Interactive Cocktail & Drink Recipes */}
        <section className="py-16 bg-card/40 border-y border-border/50">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
            <div className="text-center mb-12">
              <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">
                RECETARIO DOMINICANO
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                Cómo Preparar Cócteles y Bebidas Icónicas
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
                Fáciles de hacer en casa o en tu villa de vacaciones para saborear el auténtico espíritu caribeño.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {recetasCocteles.map((receta) => (
                <div key={receta.nombre} className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display font-bold text-xl text-foreground mb-3">{receta.nombre}</h3>
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-primary uppercase mb-2">Ingredientes:</h4>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {receta.ingredientes.map((ing, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span>{ing}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="p-3 bg-secondary/40 rounded-xl border border-border/50 text-xs text-muted-foreground">
                    <strong className="text-foreground block mb-1">Preparación:</strong>
                    {receta.preparacion}
                  </div>
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
