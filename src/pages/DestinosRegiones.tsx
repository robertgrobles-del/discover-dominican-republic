import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Link } from "react-router-dom";
import { ChevronRight, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

import heroBeach from "@/assets/hero-beach.jpg";
import puntaCana from "@/assets/punta-cana.jpg";
import samana from "@/assets/samana.jpg";
import santoDomingo from "@/assets/santo-domingo.jpg";
import puertoPlata from "@/assets/puerto-plata.jpg";
import laRomana from "@/assets/la-romana.jpg";
import whaleSamana from "@/assets/whale-samana.jpg";

const regiones = [
  { id: "cibao", nombre: "Cibao Norte", icon: "⛰️" },
  { id: "sur", nombre: "Región Sur", icon: "🏖️" },
  { id: "este", nombre: "Región Este", icon: "🌴" },
  { id: "sd", nombre: "Santo Domingo", icon: "🏛️" },
];

const zonasTuristicas = [
  "Puerto Plata", "Samaná", "Las Terrenas", "Cabarete", "Sosúa", "Jarabacoa", "Constanza", "Montecristi"
];

const destinosPremiun = [
  {
    id: "puerto-plata",
    nombre: "Puerto Plata",
    descripcion: "La novia del Atlántico, donde la arquitectura victoriana se encuentra con montañas verde...",
    imagen: puertoPlata,
    region: "REGIÓN NORTE",
    categoria: "AVENTURA & MAR"
  },
  {
    id: "samana",
    nombre: "Samaná",
    descripcion: "Un santuario salvaje donde las ballenas jorobadas danzan y la selva tropical besa el...",
    imagen: samana,
    region: "REGIÓN NORTE",
    categoria: "ECOTURISMO"
  },
  {
    id: "punta-cana",
    nombre: "Punta Cana",
    descripcion: "El epítome del lujo caribeño, con kilómetros de arena blanca ininterrumpida y aguas...",
    imagen: puntaCana,
    region: "REGIÓN ESTE",
    categoria: "LUJO & RELAX"
  },
];

const destinosPatrimonio = {
  nombre: "Santo Domingo",
  descripcion: "\"La Ciudad Primada de América. Un laberinto de piedras centenarias que guardan los secretos del Nuevo Mundo y una vibrante vida moderna.\"",
  imagen: santoDomingo,
  etiqueta: "PATRIMONIO DE LA HUMANIDAD"
};

const laRomanaInfo = {
  nombre: "La Romana",
  descripcion: "Elegancia costera tallada en piedra y coral, un refugio de sofisticación atemporal.",
  imagen: laRomana,
  etiqueta: "GOLF & MARINA"
};

export default function DestinosRegiones() {
  const [activeRegion, setActiveRegion] = useState("cibao");
  const [heroLoaded, setHeroLoaded] = useState(false);

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        {/* Hero */}
        <section className="relative h-[65vh] min-h-[500px] flex flex-col justify-center items-center overflow-hidden">
          {!heroLoaded && <Skeleton className="absolute inset-0" />}
          <img
            src={heroBeach}
            alt="Destinos de República Dominicana"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              heroLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setHeroLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/50 to-black/85" />

          <div className="relative z-10 text-center px-4">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
              ORGANIZACIÓN TERRITORIAL
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4 italic">
              Explora por<br />
              <span className="text-gradient not-italic">Regiones</span>
            </h1>
            <p className="text-lg text-white/90 max-w-xl mx-auto">
              Cibao, Sur, Este y Santo Domingo: elige una región para ver sus destinos.
            </p>
          </div>
        </section>

        {/* Region Selector */}
        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex justify-center gap-8 md:gap-16">
              {regiones.map((region) => (
                <button
                  key={region.id}
                  onClick={() => setActiveRegion(region.id)}
                  className={`flex flex-col items-center gap-3 transition-all ${
                    activeRegion === region.id ? "opacity-100" : "opacity-50 hover:opacity-80"
                  }`}
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                    activeRegion === region.id 
                      ? "bg-primary/20 ring-2 ring-primary" 
                      : "bg-secondary"
                  }`}>
                    {region.icon}
                  </div>
                  <div className="text-center">
                    <p className={`font-semibold ${activeRegion === region.id ? "text-foreground" : "text-muted-foreground"}`}>
                      {region.nombre}
                    </p>
                    {activeRegion === region.id && (
                      <span className="text-xs text-primary uppercase tracking-wider">SELECCIONADO</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Zonas Turísticas */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Filters */}
              <aside className="w-full md:w-48 space-y-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">NIVEL ADMINISTRATIVO</p>
                <nav className="space-y-2">
                  <button className="block text-sm text-muted-foreground hover:text-foreground">Provincias</button>
                  <button className="block text-sm text-muted-foreground hover:text-foreground">Municipios</button>
                  <button className="block text-sm text-primary font-medium">Zonas Turísticas</button>
                </nav>
              </aside>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-bold text-foreground">Zonas Turísticas Destacadas</h2>
                  <Link to="/destinos" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
                    Ver mapa completo <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {zonasTuristicas.map((zona, i) => (
                    <Badge 
                      key={zona} 
                      variant={i === 0 ? "default" : "outline"} 
                      className={i === 0 ? "bg-primary text-primary-foreground" : ""}
                    >
                      {zona}
                    </Badge>
                  ))}
                </div>

                <p className="text-muted-foreground italic mb-8">
                  "La región norte, conocida como El Cibao, es el corazón fértil y montañoso del país, hogar de las cumbres más altas del Caribe y costas de ámbar."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Experiencias Premium */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <p className="text-center text-xs text-muted-foreground uppercase tracking-widest mb-12">
              EXPERIENCIAS PREMIUM
            </p>

            {/* Bento Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {destinosPremiun.map((destino) => (
                <Link 
                  key={destino.id} 
                  to={`/destino/${destino.id}`}
                  className="group relative rounded-2xl overflow-hidden"
                >
                  <div className="aspect-[3/4] relative">
                    <img 
                      src={destino.imagen} 
                      alt={destino.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <Badge className="absolute top-4 left-4 bg-primary/90 text-primary-foreground text-xs">
                      {destino.categoria}
                    </Badge>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-display text-2xl font-bold text-white mb-2">{destino.nombre}</h3>
                    <p className="text-white/70 text-sm line-clamp-2 mb-4">{destino.descripcion}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/50 uppercase tracking-wider">{destino.region}</span>
                      <ArrowRight className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Santo Domingo Feature */}
            <div className="grid lg:grid-cols-2 gap-8 items-center mb-12">
              <div className="order-2 lg:order-1">
                <span className="text-primary text-xs uppercase tracking-widest">{destinosPatrimonio.etiqueta}</span>
                <h3 className="font-display text-3xl font-bold text-foreground mt-2 mb-4">{destinosPatrimonio.nombre}</h3>
                <p className="text-muted-foreground italic mb-6">{destinosPatrimonio.descripcion}</p>
                <Link to="/destino/santo-domingo">
                  <Button variant="outline" className="gap-2">
                    DESCUBRIR HISTORIA <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="order-1 lg:order-2 rounded-2xl overflow-hidden aspect-[4/3]">
                <img 
                  src={destinosPatrimonio.imagen} 
                  alt={destinosPatrimonio.nombre}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* La Romana */}
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="rounded-2xl overflow-hidden aspect-[4/3]">
                <img 
                  src={laRomanaInfo.imagen} 
                  alt={laRomanaInfo.nombre}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                  {laRomanaInfo.etiqueta}
                </Badge>
                <h3 className="font-display text-3xl font-bold text-foreground mb-4">{laRomanaInfo.nombre}</h3>
                <p className="text-muted-foreground mb-6">{laRomanaInfo.descripcion}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">REGIÓN ESTE</span>
                  <ArrowRight className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>

            {/* Explorar más */}
            <div className="text-center mt-12">
              <Button variant="outline" size="lg" className="gap-2">
                EXPLORAR MÁS DESTINOS <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-b from-card/50 to-transparent">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 italic">
              ¿Tu alma viajera busca inspiración?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Déjanos diseñar una ruta personalizada basada en tus deseos más profundos de exploración.
            </p>
            <Button size="lg" className="gap-2">
              COMENZAR EXPERIENCIA
            </Button>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
