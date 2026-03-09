import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { 
  MapPin, Ship, Anchor, Clock, Phone, Globe, Star, ChevronRight, 
  Car, ShoppingBag, Coffee, Compass, Calendar, Users, Info, Navigation
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { FavoriteButton } from "@/components/FavoriteButton";

interface PortData {
  id: string;
  name: string;
  location: string;
  coordinates: string;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  type: string;
  cruiseLines: { name: string; logo: string; routes: string[] }[];
  facilities: { name: string; icon: string; description: string }[];
  schedule: { openHours: string; peakSeason: string; avgShipsPerWeek: string };
  nearbyActivities: { name: string; type: string; distance: string; image: string }[];
  reviews: { name: string; rating: number; date: string; comment: string }[];
  nearbyDestinations: string[];
}

const puertosData: Record<string, PortData> = {
  "sans-souci": {
    id: "sans-souci",
    name: "Terminal de Cruceros Sans Souci",
    location: "Santo Domingo",
    coordinates: "18.4720, -69.8823",
    description: "La Terminal de Cruceros Sans Souci es el puerto de cruceros más importante de Santo Domingo, ubicado estratégicamente junto a la zona colonial. Recibe los principales cruceros del Caribe y ofrece acceso directo a la primera ciudad del Nuevo Mundo, declarada Patrimonio de la Humanidad por la UNESCO.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=800&fit=crop",
    rating: 4.6,
    reviewCount: 1250,
    type: "Puerto de Cruceros",
    cruiseLines: [
      { name: "Royal Caribbean", logo: "RC", routes: ["Miami", "Fort Lauderdale"] },
      { name: "Carnival Cruise Line", logo: "CCL", routes: ["Tampa", "New Orleans"] },
      { name: "Norwegian Cruise Line", logo: "NCL", routes: ["Nueva York", "San Juan"] },
      { name: "MSC Cruceros", logo: "MSC", routes: ["Miami", "Europa"] },
    ],
    facilities: [
      { name: "Terminal con A/C", icon: "building", description: "Área climatizada de espera" },
      { name: "Tiendas Duty Free", icon: "shopping", description: "Artesanías, licores, tabaco" },
      { name: "Restaurantes", icon: "coffee", description: "Gastronomía local e internacional" },
      { name: "Centro de Tours", icon: "compass", description: "Excursiones y city tours" },
      { name: "Transporte", icon: "car", description: "Taxis, buses, rent-a-car" },
      { name: "WiFi Gratis", icon: "wifi", description: "Conexión en toda la terminal" },
    ],
    schedule: { openHours: "Según itinerario de cruceros", peakSeason: "Noviembre - Abril", avgShipsPerWeek: "8-12 cruceros" },
    nearbyActivities: [
      { name: "Zona Colonial", type: "Historia", distance: "5 min caminando", image: "https://images.unsplash.com/photo-1585535116934-9e1a14063e35?w=300" },
      { name: "Alcázar de Colón", type: "Museo", distance: "10 min", image: "https://images.unsplash.com/photo-1564507004663-b6dfb3c824d5?w=300" },
      { name: "Calle El Conde", type: "Compras", distance: "8 min", image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=300" },
      { name: "Malecón", type: "Paseo", distance: "15 min", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300" },
    ],
    reviews: [
      { name: "Carlos M.", rating: 5, date: "Hace 1 semana", comment: "Excelente terminal, muy bien organizada. El acceso a la Zona Colonial es increíble." },
      { name: "María L.", rating: 4, date: "Hace 2 semanas", comment: "Buenos servicios, aunque en temporada alta puede haber mucha gente." },
    ],
    nearbyDestinations: ["Santo Domingo", "Boca Chica", "Juan Dolio"],
  },
  "amber-cove": {
    id: "amber-cove",
    name: "Puerto Amber Cove",
    location: "Puerto Plata",
    coordinates: "19.7942, -70.6984",
    description: "Amber Cove es un puerto de cruceros premium en la costa norte de República Dominicana, operado por Carnival Corporation. Inaugurado en 2015 con una inversión de US$85 millones, ofrece una experiencia completa con piscinas, restaurantes, tiendas y shuttle gratuito a Puerto Plata. Su diseño integra la naturaleza tropical con instalaciones modernas de primer nivel.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=800&fit=crop",
    rating: 4.7,
    reviewCount: 2100,
    type: "Puerto de Cruceros Premium",
    cruiseLines: [
      { name: "Carnival", logo: "CCL", routes: ["Miami", "Tampa", "Galveston"] },
      { name: "Holland America", logo: "HAL", routes: ["Fort Lauderdale", "San Diego"] },
      { name: "Princess Cruises", logo: "PC", routes: ["Fort Lauderdale"] },
      { name: "P&O Cruises", logo: "P&O", routes: ["Southampton"] },
    ],
    facilities: [
      { name: "Piscina y Área de Playa", icon: "compass", description: "Piscina de borde infinito con vista al mar" },
      { name: "Centro Comercial", icon: "shopping", description: "Tiendas de artesanías, ámbar y larimar" },
      { name: "Restaurantes", icon: "coffee", description: "Comida dominicana e internacional" },
      { name: "Shuttle Gratuito", icon: "car", description: "Transporte a Puerto Plata cada 15 min" },
      { name: "Zipline", icon: "compass", description: "Tirolesa sobre el agua" },
      { name: "WiFi", icon: "wifi", description: "Internet disponible en toda el área" },
    ],
    schedule: { openHours: "7:00 AM - 6:00 PM (días de crucero)", peakSeason: "Noviembre - Abril", avgShipsPerWeek: "4-6 cruceros" },
    nearbyActivities: [
      { name: "27 Charcos de Damajagua", type: "Aventura", distance: "25 min", image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=300" },
      { name: "Teleférico", type: "Naturaleza", distance: "20 min", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300" },
      { name: "Fortaleza San Felipe", type: "Historia", distance: "15 min", image: "https://images.unsplash.com/photo-1564507004663-b6dfb3c824d5?w=300" },
    ],
    reviews: [
      { name: "John S.", rating: 5, date: "Hace 3 días", comment: "Amazing port! The pool area is incredible and the shuttle to town is very convenient." },
      { name: "Ana R.", rating: 5, date: "Hace 1 semana", comment: "El mejor puerto de cruceros que he visitado. Las instalaciones son de primera." },
    ],
    nearbyDestinations: ["Puerto Plata", "Sosúa", "Cabarete"],
  },
  "taino-bay": {
    id: "taino-bay",
    name: "Puerto Taino Bay",
    location: "Puerto Plata",
    coordinates: "19.7950, -70.6900",
    description: "Taino Bay es el nuevo puerto de cruceros de Puerto Plata, inaugurado en 2019 en el centro de la ciudad. A diferencia de Amber Cove, está ubicado directamente en el malecón de Puerto Plata, permitiendo a los pasajeros caminar directamente a las atracciones de la ciudad. Cuenta con un área de entretenimiento, tiendas y restaurantes inspirados en la cultura taína.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=800&fit=crop",
    rating: 4.5,
    reviewCount: 1800,
    type: "Puerto de Cruceros Urbano",
    cruiseLines: [
      { name: "Royal Caribbean", logo: "RC", routes: ["Miami", "Fort Lauderdale"] },
      { name: "Celebrity Cruises", logo: "CC", routes: ["Fort Lauderdale"] },
      { name: "MSC Cruceros", logo: "MSC", routes: ["Miami"] },
    ],
    facilities: [
      { name: "Plaza Taína", icon: "compass", description: "Área de entretenimiento con cultura taína" },
      { name: "Tiendas", icon: "shopping", description: "Artesanías, ámbar y productos locales" },
      { name: "Restaurantes", icon: "coffee", description: "Gastronomía dominicana" },
      { name: "Acceso Peatonal", icon: "car", description: "Caminar directo al centro de Puerto Plata" },
    ],
    schedule: { openHours: "7:00 AM - 5:00 PM (días de crucero)", peakSeason: "Noviembre - Abril", avgShipsPerWeek: "3-5 cruceros" },
    nearbyActivities: [
      { name: "Malecón de Puerto Plata", type: "Paseo", distance: "A pie", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300" },
      { name: "Fortaleza San Felipe", type: "Historia", distance: "10 min", image: "https://images.unsplash.com/photo-1564507004663-b6dfb3c824d5?w=300" },
      { name: "Museo del Ámbar", type: "Cultura", distance: "5 min", image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=300" },
    ],
    reviews: [
      { name: "Pedro G.", rating: 4, date: "Hace 1 semana", comment: "Me encantó poder caminar directamente a la ciudad desde el barco." },
    ],
    nearbyDestinations: ["Puerto Plata", "Sosúa", "Cabarete"],
  },
  "la-romana": {
    id: "la-romana",
    name: "Puerto de Cruceros de La Romana",
    location: "La Romana",
    coordinates: "18.4301, -68.9674",
    description: "El Puerto de La Romana es un puerto mixto que recibe cruceros de lujo y embarcaciones de carga. Su proximidad a Casa de Campo, Altos de Chavón e Isla Catalina lo convierte en un destino popular para líneas de cruceros boutique y de lujo que buscan experiencias exclusivas en el Caribe.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=800&fit=crop",
    rating: 4.4,
    reviewCount: 850,
    type: "Puerto Mixto",
    cruiseLines: [
      { name: "Celebrity Cruises", logo: "CC", routes: ["Fort Lauderdale", "San Juan"] },
      { name: "Azamara", logo: "AZ", routes: ["Miami"] },
      { name: "Seabourn", logo: "SB", routes: ["Fort Lauderdale"] },
      { name: "Silversea", logo: "SS", routes: ["San Juan"] },
    ],
    facilities: [
      { name: "Terminal de Pasajeros", icon: "building", description: "Terminal con servicios básicos" },
      { name: "Tiendas", icon: "shopping", description: "Souvenirs y artesanías" },
      { name: "Transporte", icon: "car", description: "Conexión a Casa de Campo y Bayahíbe" },
      { name: "Tours", icon: "compass", description: "Excursiones organizadas a Isla Catalina y Altos de Chavón" },
    ],
    schedule: { openHours: "6:00 AM - 8:00 PM", peakSeason: "Noviembre - Abril", avgShipsPerWeek: "2-4 cruceros" },
    nearbyActivities: [
      { name: "Altos de Chavón", type: "Cultura", distance: "15 min", image: "https://images.unsplash.com/photo-1564507004663-b6dfb3c824d5?w=300" },
      { name: "Isla Catalina", type: "Playa", distance: "30 min en bote", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300" },
      { name: "Casa de Campo", type: "Resort", distance: "10 min", image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=300" },
    ],
    reviews: [
      { name: "Laura P.", rating: 5, date: "Hace 1 mes", comment: "Puerto pequeño pero la excursión a Altos de Chavón fue espectacular." },
    ],
    nearbyDestinations: ["La Romana", "Bayahíbe", "Casa de Campo"],
  },
  "puerto-caucedo": {
    id: "puerto-caucedo",
    name: "Puerto Multimodal Caucedo",
    location: "Santo Domingo Este",
    coordinates: "18.4300, -69.6300",
    description: "El Puerto Multimodal Caucedo (DP World Caucedo) es el principal puerto de carga y zona franca de República Dominicana. Ubicado en Punta Caucedo, al este de Santo Domingo, es un hub logístico internacional con zona franca industrial y operaciones portuarias de clase mundial. Aunque es principalmente comercial, recibe cruceros ocasionalmente.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=800&fit=crop",
    rating: 4.2,
    reviewCount: 300,
    type: "Puerto Comercial / Zona Franca",
    cruiseLines: [],
    facilities: [
      { name: "Terminal de Carga", icon: "building", description: "Operaciones de contenedores 24/7" },
      { name: "Zona Franca", icon: "shopping", description: "Parque industrial con empresas internacionales" },
      { name: "Aduana", icon: "building", description: "Servicios aduanales completos" },
    ],
    schedule: { openHours: "24/7 (operaciones de carga)", peakSeason: "Todo el año", avgShipsPerWeek: "15-20 buques de carga" },
    nearbyActivities: [],
    reviews: [],
    nearbyDestinations: ["Santo Domingo", "Boca Chica"],
  },
  "puerto-haina": {
    id: "puerto-haina",
    name: "Puerto de Haina",
    location: "San Cristóbal",
    coordinates: "18.4200, -70.0200",
    description: "El Puerto de Haina es uno de los puertos comerciales más importantes de República Dominicana. Ubicado en la desembocadura del Río Haina, maneja una porción significativa del comercio marítimo del país, incluyendo importaciones de combustibles, materias primas y productos terminados.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=800&fit=crop",
    rating: 3.8,
    reviewCount: 150,
    type: "Puerto Comercial",
    cruiseLines: [],
    facilities: [
      { name: "Terminal de Carga", icon: "building", description: "Muelles para buques de gran calado" },
      { name: "Depósitos", icon: "building", description: "Almacenamiento de mercancías" },
    ],
    schedule: { openHours: "24/7", peakSeason: "Todo el año", avgShipsPerWeek: "10-15 buques" },
    nearbyActivities: [],
    reviews: [],
    nearbyDestinations: ["San Cristóbal", "Santo Domingo"],
  },
  "manzanillo": {
    id: "manzanillo",
    name: "Puerto de Manzanillo",
    location: "Monte Cristi",
    coordinates: "19.7100, -71.7500",
    description: "El Puerto de Manzanillo es el principal puerto de la región noroeste de República Dominicana, ubicado en la Bahía de Manzanillo. Maneja exportaciones agrícolas como banano, cacao y otros productos de la región. Su bahía natural ofrece un puerto protegido con acceso directo al Atlántico.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=800&fit=crop",
    rating: 3.5,
    reviewCount: 80,
    type: "Puerto Comercial / Agrícola",
    cruiseLines: [],
    facilities: [
      { name: "Muelle de Carga", icon: "building", description: "Para buques de carga general" },
      { name: "Depósitos Refrigerados", icon: "building", description: "Para productos agrícolas de exportación" },
    ],
    schedule: { openHours: "6:00 AM - 6:00 PM", peakSeason: "Todo el año", avgShipsPerWeek: "3-5 buques" },
    nearbyActivities: [
      { name: "Cayos Siete Hermanos", type: "Naturaleza", distance: "30 min en bote", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300" },
    ],
    reviews: [],
    nearbyDestinations: ["Monte Cristi"],
  },
};

export default function PuertoDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState("info");
  
  const puerto = puertosData[slug || ""];

  if (!puerto) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-32 text-center">
            <Anchor className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Puerto no encontrado</h1>
            <p className="text-muted-foreground mb-8">El puerto que buscas no existe.</p>
            <Link to="/puertos-marinas"><Button>Ver Puertos y Marinas</Button></Link>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <SEOHead title={`${puerto.name} | DescubreRD`} description={puerto.description.slice(0, 160)} />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative h-[50vh] min-h-[400px] mt-16">
          <div className="absolute inset-0">
            <img src={puerto.image} alt={puerto.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-8 container mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Link to="/" className="hover:text-primary">Inicio</Link>
                <ChevronRight className="h-4 w-4" />
                <Link to="/puertos-marinas" className="hover:text-primary">Puertos</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground">{puerto.name}</span>
              </nav>
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  <Anchor className="h-3 w-3 mr-1" /> {puerto.type}
                </Badge>
                <FavoriteButton id={puerto.id} type="destino" name={puerto.name} image={puerto.image} location={puerto.location} variant="button" />
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">{puerto.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {puerto.rating > 0 && (
                  <>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium text-foreground">{puerto.rating}</span>
                      <span>({puerto.reviewCount} reseñas)</span>
                    </div>
                    <span>·</span>
                  </>
                )}
                <div className="flex items-center gap-1"><MapPin className="h-4 w-4" /><span>{puerto.location}</span></div>
                {puerto.schedule.avgShipsPerWeek && <><span>·</span><div className="flex items-center gap-1"><Ship className="h-4 w-4" /><span>{puerto.schedule.avgShipsPerWeek}</span></div></>}
              </div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">Sobre el Puerto</h2>
                <p className="text-muted-foreground leading-relaxed">{puerto.description}</p>
              </section>

              {/* Cruise Lines */}
              {puerto.cruiseLines.length > 0 && (
                <section>
                  <h3 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <Ship className="h-5 w-5 text-primary" /> Líneas de Cruceros
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {puerto.cruiseLines.map((line) => (
                      <div key={line.name} className="bg-card rounded-xl p-5 border border-border hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                            <span className="font-bold text-primary">{line.logo}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{line.name}</h4>
                            <p className="text-sm text-muted-foreground">Desde: {line.routes.join(", ")}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Facilities */}
              {puerto.facilities.length > 0 && (
                <section>
                  <h3 className="font-display text-xl font-bold text-foreground mb-6">Facilidades</h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {puerto.facilities.map((f) => (
                      <div key={f.name} className="bg-card rounded-xl p-4 border border-border text-center">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                          {f.icon === "shopping" && <ShoppingBag className="h-5 w-5 text-primary" />}
                          {f.icon === "coffee" && <Coffee className="h-5 w-5 text-primary" />}
                          {f.icon === "compass" && <Compass className="h-5 w-5 text-primary" />}
                          {f.icon === "car" && <Car className="h-5 w-5 text-primary" />}
                          {f.icon === "building" && <Info className="h-5 w-5 text-primary" />}
                          {f.icon === "wifi" && <Globe className="h-5 w-5 text-primary" />}
                        </div>
                        <h4 className="font-medium text-foreground text-sm mb-1">{f.name}</h4>
                        <p className="text-xs text-muted-foreground">{f.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Nearby Activities */}
              {puerto.nearbyActivities.length > 0 && (
                <section>
                  <h3 className="font-display text-xl font-bold text-foreground mb-6">Actividades Cercanas</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {puerto.nearbyActivities.map((activity) => (
                      <div key={activity.name} className="group">
                        <div className="aspect-square rounded-xl overflow-hidden relative">
                          <img src={activity.image} alt={activity.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <Badge className="mb-2 text-xs">{activity.type}</Badge>
                            <h4 className="font-semibold text-white text-sm">{activity.name}</h4>
                            <p className="text-xs text-white/70">{activity.distance}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Reviews */}
              {puerto.reviews.length > 0 && (
                <section>
                  <h3 className="font-display text-xl font-bold text-foreground mb-6">Reseñas</h3>
                  <div className="space-y-4">
                    {puerto.reviews.map((review, i) => (
                      <div key={i} className="bg-card rounded-xl p-5 border border-border">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{review.name}</p>
                              <p className="text-xs text-muted-foreground">{review.date}</p>
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, j) => (
                              <Star key={j} className={`h-4 w-4 ${j < review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-bold text-foreground mb-4">Horarios</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Horario</p>
                      <p className="font-medium text-foreground">{puerto.schedule.openHours}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Temporada Alta</p>
                      <p className="font-medium text-foreground">{puerto.schedule.peakSeason}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-bold text-foreground mb-4">Destinos Cercanos</h3>
                <div className="space-y-2">
                  {puerto.nearbyDestinations.map((dest) => (
                    <Link key={dest} to={`/destino/${dest.toLowerCase().replace(/ /g, "-")}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                      <span className="text-foreground">{dest}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-bold text-foreground mb-4">Ubicación</h3>
                <div className="aspect-square bg-muted rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Navigation className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{puerto.coordinates}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </PageTransition>
  );
}
