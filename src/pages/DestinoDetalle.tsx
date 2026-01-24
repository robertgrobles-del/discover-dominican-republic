import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Link, useParams } from "react-router-dom";
import { MapPin, Star, Cloud, Calendar, Map, Utensils, Bed, Waves, ChevronLeft, ChevronRight, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

import samana from "@/assets/samana.jpg";
import whaleSamana from "@/assets/whale-samana.jpg";
import heroBeach from "@/assets/hero-beach.jpg";
import gastronomy from "@/assets/gastronomy.jpg";
import adventure from "@/assets/adventure.jpg";
import hotelClareVerde from "@/assets/hotel-clare-verde.jpg";

const experiencias = [
  { id: 1, nombre: "Santuario de Ballenas", imagen: whaleSamana, categoria: "Naturaleza" },
  { id: 2, nombre: "Salto del Limón", imagen: adventure, categoria: "Aventura" },
  { id: 3, nombre: "Cayo Levantado", imagen: heroBeach, categoria: "Playa" },
];

const saborLocal = [
  { nombre: "Pescado al Coco", desc: "Especialidad de la zona", emoji: "🥥" },
  { nombre: "Pan de Coco", desc: "Tradición local", emoji: "🍞" },
  { nombre: "Mariscos Frescos", desc: "Del mar a la mesa", emoji: "🦐" },
  { nombre: "Fusión Tropical", desc: "Cocina de autor", emoji: "🍽️" },
];

const hospedaje = [
  {
    nombre: "Samaná Eco-Lodge & Spa",
    precio: 350,
    imagen: hotelClareVerde,
    tags: ["WiFi", "Piscina Privada", "Spa"],
    ecoCertified: true,
    rating: 4.8
  },
  {
    nombre: "Casa del Mar Boutique",
    precio: 180,
    imagen: heroBeach,
    tags: ["Desayuno", "Frente al mar"],
    ecoCertified: false,
    rating: 4.6
  }
];

const rutaSugerida = [
  { dia: 1, titulo: "AVENTURA MARINA", lugar: "Santuario de Ballenas & Cayo Levantado", desc: "Salida en bote desde las costas de la región para un encuentro mágico con las ballenas jorobadas en el santuario y atardecer en la bella isla de Cayo Levantado." },
  { dia: 2, titulo: "SELVA ADENTRO", lugar: "Senderismo al Salto del Limón", desc: "Caminata a caballo por un verde del bosque de monte lluvioso hasta llegar a la impresionante cascada de 40 metros." },
  { dia: 3, titulo: "PLAYAS VÍRGENES", lugar: "Atardecer en Playa Rincón", desc: "Relájate en una de las 10 mejores playas del mundo, con arena blanca y aguas turquesas." },
];

export default function DestinoDetalle() {
  const { id } = useParams();
  const [heroLoaded, setHeroLoaded] = useState(false);

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        {/* Hero */}
        <section className="relative h-[70vh] flex items-end overflow-hidden">
          {!heroLoaded && <Skeleton className="absolute inset-0" />}
          <img
            src={samana}
            alt="Samaná"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              heroLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setHeroLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          
          <div className="relative z-10 container mx-auto px-4 pb-12">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div>
                <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                  DESTINO PREMIUM
                </Badge>
                <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
                  Samaná:<br />
                  <span className="text-gradient">El Tesoro Escondido</span>
                </h1>
                <p className="text-lg text-white/80 max-w-xl mb-6">
                  Donde la selva abraza el mar. Descubre un paraíso virgen de playas infinitas, ballenas jorobadas y naturaleza exuberante.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button size="lg" className="gap-2">
                    Ver Video Completo
                  </Button>
                  <Button size="lg" variant="outline" className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20">
                    <Heart className="h-4 w-4" /> Guardar Destino
                  </Button>
                </div>
              </div>

              {/* Weather & Season Info */}
              <div className="flex gap-4">
                <div className="bg-card/80 backdrop-blur-md rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Cloud className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wider">Clima Actual</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">28°C</p>
                  <p className="text-sm text-muted-foreground">Soleado, cielo despejado</p>
                </div>
                <div className="bg-card/80 backdrop-blur-md rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wider">Temporada</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">Ene - Mar</p>
                  <p className="text-sm text-muted-foreground">Avistamiento Ballenas</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <section className="border-b border-border sticky top-16 z-30 bg-background/95 backdrop-blur-md">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="mapa" className="w-full">
              <TabsList className="h-14 bg-transparent gap-6">
                <TabsTrigger value="mapa" className="gap-2 data-[state=active]:text-primary">
                  <Map className="h-4 w-4" /> Mapa Interactivo
                </TabsTrigger>
                <TabsTrigger value="gastronomia" className="gap-2 data-[state=active]:text-primary">
                  <Utensils className="h-4 w-4" /> Gastronomía
                </TabsTrigger>
                <TabsTrigger value="hospedaje" className="gap-2 data-[state=active]:text-primary">
                  <Bed className="h-4 w-4" /> Hospedaje
                </TabsTrigger>
                <TabsTrigger value="rutas" className="gap-2 data-[state=active]:text-primary">
                  <Waves className="h-4 w-4" /> Rutas
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </section>

        {/* Explora la Península */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">Explora la Península</h2>
                <p className="text-muted-foreground">Ubica los puntos más icónicos de Samaná para planificar tu ruta.</p>
              </div>
              <Link to="/destinos" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
                Ver mapa completo <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Map Placeholder */}
            <div className="bg-card rounded-2xl border border-border p-8 aspect-[16/9] max-h-[400px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted opacity-50" />
              <div className="relative z-10 text-center">
                <Map className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Mapa interactivo de Samaná</p>
              </div>
            </div>
          </div>
        </section>

        {/* Experiencias Imperdibles */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8">Experiencias Imperdibles</h2>
            
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {experiencias.map((exp) => (
                <div key={exp.id} className="flex-shrink-0 w-40">
                  <div className="aspect-square rounded-2xl overflow-hidden mb-3 relative group">
                    <img 
                      src={exp.imagen} 
                      alt={exp.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <p className="font-semibold text-foreground text-sm">{exp.nombre}</p>
                  <p className="text-xs text-muted-foreground">{exp.categoria}</p>
                </div>
              ))}
              <div className="flex-shrink-0 w-40 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <ChevronRight className="h-6 w-6 text-primary" />
                </div>
                <p className="font-semibold text-primary text-sm text-center">Ver 15 actividades más</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sabor Local */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl font-bold text-foreground">Sabor Local</h2>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" className="rounded-full">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" className="rounded-full">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {saborLocal.map((item) => (
                <div key={item.nombre} className="text-center">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 flex items-center justify-center text-4xl mb-4">
                    {item.emoji}
                  </div>
                  <p className="font-semibold text-foreground">{item.nombre}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hospedaje Curado */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8">Hospedaje Curado</h2>
            
            <div className="space-y-6">
              {hospedaje.map((hotel) => (
                <div key={hotel.nombre} className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col md:flex-row">
                  <div className="md:w-64 h-48 md:h-auto relative">
                    <img src={hotel.imagen} alt={hotel.nombre} className="w-full h-full object-cover" />
                    {hotel.ecoCertified && (
                      <Badge className="absolute top-4 left-4 bg-emerald-500 text-white">ECO-LODGE</Badge>
                    )}
                  </div>
                  <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-display font-bold text-lg text-foreground">{hotel.nombre}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{hotel.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Ubicación exclusiva con vistas panorámicas a la bahía. Villas privadas con piscina infinity y servicio de mayordomo.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {hotel.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Desde</p>
                      <p className="text-2xl font-bold text-foreground">${hotel.precio}<span className="text-sm font-normal text-muted-foreground">/noche</span></p>
                      <Button size="sm" className="mt-3">Ver Disponibilidad</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ruta Sugerida */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8">Ruta Sugerida: 3 Días de Naturaleza</h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-0">
                {rutaSugerida.map((dia, index) => (
                  <div key={dia.dia} className="relative pl-8 pb-8 last:pb-0">
                    {index < rutaSugerida.length - 1 && (
                      <div className="absolute left-[11px] top-8 w-0.5 h-[calc(100%-24px)] bg-border" />
                    )}
                    <div className={`absolute left-0 top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      index === 0 ? "border-primary bg-primary/20" : "border-border bg-background"
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${index === 0 ? "bg-primary" : "bg-muted-foreground"}`} />
                    </div>
                    <div>
                      <span className="text-primary text-xs font-semibold uppercase tracking-wider">
                        DÍA {dia.dia}: {dia.titulo}
                      </span>
                      <h3 className="font-display font-bold text-lg text-foreground mt-1 mb-2">{dia.lugar}</h3>
                      <p className="text-sm text-muted-foreground">{dia.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl overflow-hidden aspect-[4/3]">
                <img 
                  src={whaleSamana} 
                  alt="Ruta sugerida" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
