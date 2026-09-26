import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, MapPin, Compass, Sparkles, Utensils, Hotel, 
  TreePine, Waves, Camera, Calendar, ShieldCheck, ChevronRight 
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getDestinationsByRegion } from "@/data/destinations";
import { LeaderboardAd, BetweenSectionsAd, PanoramaAd } from "@/components/promo";

const regionData: Record<string, { 
  name: string; 
  description: string; 
  image: string; 
  color: string;
  tagline: string;
  bestTime: string;
  highlights: string[];
  climate: string;
  specialties: { title: string; desc: string; icon: string }[];
}> = {
  norte: {
    name: "Región Norte & Cibao",
    tagline: "El corazón verde, la cumbre más alta del Caribe y la costa de plata",
    description: "Montañas imponentes de la Cordillera Central, ríos y cascadas de aguas cristalinas, fértiles valles cafetaleros y las doradas playas atlánticas de Puerto Plata, Cabarete y Samaná.",
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1600&q=85",
    color: "from-emerald-600 to-teal-700",
    bestTime: "Diciembre a Abril (clima fresco de montaña) y Junio a Septiembre (verano atlántico)",
    climate: "Templado en zonas de montaña (12°C - 24°C) y tropical cálido en la costa (25°C - 31°C)",
    highlights: ["Pico Duarte (3,098m)", "27 Charcos de Damajagua", "Cacao & Café Orgánico", "Kitesurf en Cabarete", "Ballenas Jorobadas en Samaná"],
    specialties: [
      { title: "Ecoturismo de Aventura", desc: "Rafting en Jarabacoa, senderismo en Constanza y cañonismo en cascadas vírgenes.", icon: "mountain" },
      { title: "Ruta del Cacao & Tabaco", desc: "Fincas centenarias con degustaciones guiadas en Santiago y el Valle del Cibao.", icon: "coffee" },
      { title: "Playas Atlánticas", desc: "Olas de clase mundial para surf, arrecifes de coral y santuarios marinos protegidos.", icon: "waves" },
    ]
  },
  este: {
    name: "Región Este",
    tagline: "El santuario del Caribe: playas de arena blanca, campos de golf y arrecifes coralinos",
    description: "El epicentro turístico indiscutible de República Dominicana. Kilómetros ininterrumpidos de fina arena blanca, aguas turquesas del Mar Caribe, resorts de clase mundial, spas de autor y campos de golf PGA.",
    image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1600&q=85",
    color: "from-cyan-600 to-blue-700",
    bestTime: "Todo el año (temperatura promedio constante de 28°C)",
    climate: "Tropical caribeño soleado con suave brisa alisios constante",
    highlights: ["Playas de Bávaro y Cap Cana", "Isla Saona & Parque Cotubanamá", "Campos de Golf PGA", "Altos de Chavón", "Buceo en Arrecifes"],
    specialties: [
      { title: "Golf de Clase Mundial", desc: "Diseños icónicos de Jack Nicklaus, Pete Dye y Tom Fazio frente al mar.", icon: "golf" },
      { title: "Playas de Postal", desc: "Arenas de coral blanco y aguas tranquilas protegidas por barreras coralinas.", icon: "waves" },
      { title: "Resorts & All-Inclusive VIP", desc: "La mayor concentración hotelera 5 estrellas y gastronomía internacional del Caribe.", icon: "hotel" },
    ]
  },
  sur: {
    name: "Región Sur Profundo",
    tagline: "La última frontera virgen: reservas de la biosfera, desierto y mar cristalino",
    description: "Bahías vírgenes intactas como Bahía de las Águilas, salinas rosadas en Baní, dunas saharianas, bosques secos y la mayor biodiversidad endémica insular protegida en el Parque Nacional Jaragua.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=85",
    color: "from-amber-600 to-orange-700",
    bestTime: "Noviembre a Mayo (temperaturas más agradables para expediciones)",
    climate: "Árido a semitropical seco, cielos despejados todo el año",
    highlights: ["Bahía de las Águilas", "Dunas de Baní", "Laguna de Oviedo & Flamencos", "Lago Enriquillo", "Polo Magnético"],
    specialties: [
      { title: "Paisajes de Contraste", desc: "Desde dunas desérticas hasta bosques nublados en la Sierra de Bahoruco.", icon: "mountain" },
      { title: "Avistamiento de Vida Silvestre", desc: "Flamencos rosados, iguanas rinoceronte y colonias de aves migratorias.", icon: "tree" },
      { title: "Gastronomía Autóctona", desc: "Mangos banilejos, chivo liniero al caldero y pescados frescos de costa.", icon: "utensils" },
    ]
  },
  "santo-domingo": {
    name: "Gran Santo Domingo & Distrito Nacional",
    tagline: "Primada de América: cuna de la historia colonial, cultura viva y negocios",
    description: "La metrópoli más vibrante del Caribe. Más de cinco siglos de historia en la Ciudad Colonial (Patrimonio de la Humanidad UNESCO), museos de primer nivel, distrito financiero moderno y una escena gastronómica vanguardista.",
    image: "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=1600&q=85",
    color: "from-purple-700 to-indigo-800",
    bestTime: "Noviembre a Abril (temporada de festivales culturales y brisa fresca)",
    climate: "Tropical urbano caribeño con noches agradables junto al mar Caribe",
    highlights: ["Ciudad Colonial (UNESCO)", "Alcázar de Colón", "Malecón de Santo Domingo", "Parque Los Tres Ojos", "Alta Gastronomía en Piantini"],
    specialties: [
      { title: "Patrimonio Histórico Mundial", desc: "La primera catedral, primer hospital y primera fortaleza militar del Nuevo Mundo.", icon: "landmark" },
      { title: "Epicentro Gastronómico", desc: "Restaurantes de chefs galardonados, coctelería de autor y vida nocturna.", icon: "utensils" },
      { title: "Cultura & Museos", desc: "Teatros nacionales, galerías de arte contemporáneo y plazas coloniales con música en vivo.", icon: "music" },
    ]
  },
};

export default function DestinosRegion() {
  const { region } = useParams();
  const regionInfo = regionData[region || ""];
  
  // Obtener destinos estáticos por región
  const destinations = getDestinationsByRegion(region || "");
  const provinces = destinations.filter(d => d.type === 'provincia');
  const touristDestinations = destinations.filter(d => d.type === 'destino' || d.type === 'municipio');

  if (!regionInfo) {
    return (
      <PageTransition>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Región no encontrada</h1>
            <Link to="/destinos">
              <Button>Ver todos los destinos</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <SEOHead
        title={`${regionInfo.name} - Guía Turística Completa`}
        description={regionInfo.description}
        keywords={`${regionInfo.name}, turismo, República Dominicana, destinos, viajes, ecoturismo`}
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Section */}
        <section className="relative min-h-[480px] lg:h-[60vh] flex items-end overflow-hidden">
          <img
            src={regionInfo.image}
            alt={regionInfo.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${regionInfo.color} opacity-40`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/20" />

          <div className="relative z-10 container mx-auto px-4 pb-12 pt-28">
            <Link to="/destinos" className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors text-sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Todos los Destinos
            </Link>
            
            <div className="flex items-center gap-2 mb-3">
              <Compass className="h-5 w-5 text-amber-400" />
              <span className="text-amber-300 text-xs font-bold uppercase tracking-widest">Macro-Región Turística Oficial</span>
            </div>
            
            <h1 className="font-display text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-3 tracking-tight">
              {regionInfo.name}
            </h1>
            <p className="text-lg md:text-xl font-medium text-amber-200/90 mb-3 max-w-3xl">
              {regionInfo.tagline}
            </p>
            <p className="text-sm md:text-base text-white/85 max-w-3xl leading-relaxed">
              {regionInfo.description}
            </p>
          </div>
        </section>

        {/* Top Leaderboard Ad */}
        <div className="container mx-auto px-4 py-6">
          <LeaderboardAd showDemo />
        </div>

        {/* Regional Quick Info Banner */}
        <section className="border-y border-border/60 bg-muted/20 py-8">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/60">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Mejor Época para Visitar</h4>
                  <p className="text-xs text-muted-foreground mt-1">{regionInfo.bestTime}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/60">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Waves className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Clima & Entorno</h4>
                  <p className="text-xs text-muted-foreground mt-1">{regionInfo.climate}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/60">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Infraestructura</h4>
                  <p className="text-xs text-muted-foreground mt-1">Acceso asfaltado, aeropuertos internacionales y red de transporte turístico MITUR.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Regional Pillars & Signature Experiences */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mb-10">
              <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-widest uppercase mb-2">
                <Sparkles className="h-4 w-4" />
                <span>Identidad & Experiencias</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Lo Que Hace Única a la {regionInfo.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Descubre por qué miles de viajeros eligen esta zona para sus vacaciones, expediciones ecológicas y viajes de descanso.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {regionInfo.specialties.map((item, idx) => {
                const IconComponent = 
                  item.icon === "mountain" ? TreePine :
                  item.icon === "waves" ? Waves :
                  item.icon === "hotel" ? Hotel :
                  item.icon === "utensils" ? Utensils :
                  item.icon === "music" ? Compass :
                  item.icon === "landmark" ? Compass : Sparkles;

                return (
                  <Card key={idx} className="border-border/70 hover:border-primary/50 transition-all shadow-xs">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-foreground mb-2">{item.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Highlights pill tags */}
            <div className="flex items-center gap-2 flex-wrap pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-2">Atracciones Clave:</span>
              {regionInfo.highlights.map((h, i) => (
                <Badge key={i} variant="secondary" className="px-3 py-1 text-xs bg-muted/60 hover:bg-muted font-medium">
                  {h}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Mid-page Banner Ad */}
        <div className="container mx-auto px-4 py-4">
          <BetweenSectionsAd />
        </div>

        {/* Provinces in this region */}
        {provinces.length > 0 && (
          <section className="py-16 bg-muted/20 border-y border-border/50">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                    Provincias de la {regionInfo.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Explora la guía completa de cada provincia con sus municipios, monumentos, hoteles y gastronomía.
                  </p>
                </div>
                <Badge variant="outline" className="text-xs font-semibold px-3 py-1 self-start md:self-auto">
                  {provinces.length} Provincias
                </Badge>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {provinces.map((province, index) => (
                  <motion.div
                    key={province.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={`/provincia/${province.slug}`}
                      className="group block relative rounded-2xl overflow-hidden aspect-video cursor-pointer border border-border/50 hover:border-primary/50 shadow-xs hover:shadow-md transition-all"
                    >
                      <img
                        src={province.imageUrl || "/placeholder.svg"}
                        alt={province.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-white group-hover:text-primary transition-colors text-base">
                            {province.name}
                          </h3>
                          <span className="text-[11px] text-white/75">Ver Guía Provincial</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-white/80 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Tourist Destinations in this region */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  Destinos & Polos Turísticos en la {regionInfo.name}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Playas, pueblos mágicos, valles de montaña y complejos ecoturísticos.
                </p>
              </div>
              <Badge variant="outline" className="text-xs font-semibold px-3 py-1 self-start md:self-auto">
                {touristDestinations.length} Destinos Curados
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {touristDestinations.map((dest, index) => (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/destino/${dest.slug}`}
                    className="group block relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer border border-border/60 hover:border-primary/50 shadow-xs hover:shadow-xl transition-all"
                  >
                    <img
                      src={dest.imageUrl || "/placeholder.svg"}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      {dest.province && (
                        <div className="flex items-center gap-1.5 text-white/80 text-xs font-medium mb-1.5">
                          <MapPin className="h-3.5 w-3.5 text-amber-400" />
                          <span>{dest.province}</span>
                        </div>
                      )}
                      <h3 className="font-display text-xl font-bold text-white group-hover:text-primary transition-colors">
                        {dest.name}
                      </h3>
                      {dest.shortDescription && (
                        <p className="text-white/80 text-xs md:text-sm mt-1.5 line-clamp-2 leading-relaxed">
                          {dest.shortDescription}
                        </p>
                      )}
                      {dest.highlights && dest.highlights.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {dest.highlights.slice(0, 3).map((h, i) => (
                            <Badge key={i} className="bg-white/20 text-white text-[11px] backdrop-blur-xs font-normal">
                              {h}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
              {touristDestinations.length === 0 && (
                <p className="text-muted-foreground col-span-full text-center py-12">
                  No hay destinos registrados para esta región.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Regional Gastronomy Showcase */}
        <section className="py-16 bg-muted/20 border-y border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-widest uppercase mb-2">
                  <Utensils className="h-4 w-4" />
                  <span>Gastronomía & Sabores</span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  Sabores Representativos de la {regionInfo.name}
                </h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                  Platos auténticos, productos de denominación de origen y paradas gastronómicas obligatorias para los amantes de la buena mesa.
                </p>
              </div>
              <Button variant="outline" size="sm" asChild className="rounded-xl self-start md:self-auto gap-2">
                <Link to="/guia-gastronomica">
                  Explorar Guía Gastronómica <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-border/60 hover:border-primary/40 transition-all shadow-xs">
                <CardContent className="p-5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3">
                    <Utensils className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-foreground text-sm mb-1">Chivo Criollo & Sancocho</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Preparados a fuego lento con orégano silvestre, tubérculos cosechados en el valle y sazón campestre.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/60 hover:border-primary/40 transition-all shadow-xs">
                <CardContent className="p-5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3">
                    <TreePine className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-foreground text-sm mb-1">Café de Altura & Cacao</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Cosechas orgánicas de microclimas de montaña con tostado artesanal y chocolates premiados internacionalmente.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/60 hover:border-primary/40 transition-all shadow-xs">
                <CardContent className="p-5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-3">
                    <Waves className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-foreground text-sm mb-1">Pescados del Día al Coco</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Mero, chillo y langostas frescas de costa caribeña cocinadas con leche de coco natural y guarnición de tostones.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/60 hover:border-primary/40 transition-all shadow-xs">
                <CardContent className="p-5">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-3">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-foreground text-sm mb-1">Dulces Típicos & Frutas</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Dulces cortados de leche, pilones, mermeladas de chinola fresca y postres tradicionales de recetas centenarias.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Where to Stay Quick Access */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-widest uppercase mb-2">
                  <Hotel className="h-4 w-4" />
                  <span>Hospedaje & Confort</span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  Dónde Quedarte en la {regionInfo.name}
                </h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                  Resorts de playa todo incluido, eco-lodges entre montañas y hoteles boutique coloniales.
                </p>
              </div>
              <Button asChild className="rounded-xl self-start md:self-auto gap-2">
                <Link to="/alojamientos">
                  Ver Todos los Alojamientos <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] group border border-border/60 shadow-sm">
                <img 
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80" 
                  alt="Resorts Todo Incluido" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 flex flex-col justify-end">
                  <Badge className="w-fit mb-2 bg-primary text-primary-foreground text-xs">All-Inclusive</Badge>
                  <h3 className="font-bold text-white text-lg">Resorts Frente al Mar</h3>
                  <p className="text-xs text-white/80 mt-1">Spas, múltiples piscinas y régimen todo incluido de máxima categoría.</p>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] group border border-border/60 shadow-sm">
                <img 
                  src="https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80" 
                  alt="Eco-Lodges de Montaña" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 flex flex-col justify-end">
                  <Badge className="w-fit mb-2 bg-emerald-600 text-white text-xs">Ecoturismo</Badge>
                  <h3 className="font-bold text-white text-lg">Eco-Lodges & Cabañas</h3>
                  <p className="text-xs text-white/80 mt-1">Conexión con la naturaleza, chimeneas, senderos y vistas panorámicas.</p>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] group border border-border/60 shadow-sm">
                <img 
                  src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80" 
                  alt="Hoteles Boutique & Ciudad" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 flex flex-col justify-end">
                  <Badge className="w-fit mb-2 bg-amber-600 text-white text-xs">Boutique & Encanto</Badge>
                  <h3 className="font-bold text-white text-lg">Hoteles Boutique & Ciudad</h3>
                  <p className="text-xs text-white/80 mt-1">Atención personalizada, diseño de autor y ubicación en centros históricos.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Regional Panorama Ad Banner */}
        <section className="py-6">
          <div className="container mx-auto px-4 max-w-6xl">
            <PanoramaAd showDemo />
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}

