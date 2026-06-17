import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  MapPin, 
  Star, 
  Plane, 
  Hotel, 
  Leaf,
  ChevronDown,
  Mail,
  Check,
  Navigation,
  Bell,
  NavigationOff,
  Compass,
  AlertTriangle
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

import puntaCanaImg from "@/assets/punta-cana.jpg";
import samanaImg from "@/assets/samana.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import puertoPlataImg from "@/assets/puerto-plata.jpg";
import heroBeachImg from "@/assets/hero-beach.jpg";
import laRomanaImg from "@/assets/la-romana.jpg";

const filters = ["Todo", "Ofertas Flash", "Aventura", "Cultura", "Eco-Glamping"];

// Preset locations for the simulator
const simLocations = [
  { name: "Zona Colonial, Santo Domingo", lat: 18.4735, lng: -69.8858, desc: "Cerca de Jalao y monumentos" },
  { name: "Secrets Resort, Cap Cana", lat: 18.4485, lng: -68.3970, desc: "Frente a playa privada" },
  { name: "Cayo Levantado, Samaná", lat: 19.1673, lng: -69.2974, desc: "Bahía de Samaná" },
  { name: "Los Haitises, Sabana de la Mar", lat: 19.0423, lng: -69.5752, desc: "Área ecológica" },
  { name: "Parque Central, Santiago", lat: 19.4517, lng: -70.6970, desc: "Sin ofertas inmediatas cercanas" }
];

interface Offer {
  id: string;
  title: string;
  location: string;
  duration: string;
  rating: number;
  originalPrice: number;
  price: number;
  discount: string;
  tags: string[];
  image: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  isFlash?: boolean;
  discountCode?: string;
}

export default function Ofertas() {
  const [activeFilter, setActiveFilter] = useState("Todo");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  
  // Geolocation & Simulation states
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [simulatedName, setSimulatedName] = useState<string>("Ninguna (Usando real si está activa)");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [nearbyOffers, setNearbyOffers] = useState<Record<string, number>>({}); // maps offerId -> distance in meters

  // Offers from Supabase
  const [dbOffers, setDbOffers] = useState<Offer[]>([
    {
      id: "cayo-levantado",
      title: "Escape Romántico en Cayo Levantado",
      location: "Samaná, RD",
      duration: "3 días / 2 noches",
      rating: 4.9,
      originalPrice: 25000,
      price: 15000,
      discount: "40% OFF",
      tags: ["Hotel 5*", "Todo Incluido"],
      image: samanaImg,
      latitude: 19.1673,
      longitude: -69.2974,
      radius: 1000,
      isFlash: true
    },
    {
      id: "cuevas-manglares",
      title: "Excursión Cuevas y Manglares",
      location: "Los Haitises, RD",
      duration: "Full Day Tour",
      rating: 4.7,
      originalPrice: 4500,
      price: 2250,
      discount: "50% OFF",
      tags: ["Transporte", "Almuerzo"],
      image: heroBeachImg,
      latitude: 19.0423,
      longitude: -69.5752,
      radius: 1200,
      isFlash: true
    },
    {
      id: "ruta-colonial",
      title: "Ruta Colonial + Cena de Lujo",
      location: "Santo Domingo, RD",
      duration: "Fin de Semana",
      rating: 4.8,
      originalPrice: 8000,
      price: 6500,
      discount: "20% OFF",
      tags: ["Cultura", "Cena Incluida"],
      image: santoDomingoImg,
      latitude: 18.4735,
      longitude: -69.8858,
      radius: 500,
      isFlash: true
    },
    {
      id: "glamping-paraiso",
      title: "Glamping en el Paraíso",
      location: "Bahía de las Águilas",
      duration: "Aventura 2 Días",
      rating: 5.0,
      originalPrice: 12000,
      price: 9900,
      discount: "15% OFF",
      tags: ["Camping", "Trekking"],
      image: laRomanaImg,
      latitude: 17.8465,
      longitude: -71.6508,
      radius: 1500,
      isFlash: false
    }
  ]);

  // Load from Supabase
  useEffect(() => {
    async function fetchOffers() {
      try {
        const { data, error } = await (supabase.from("offers" as any).select("*") as any);
        if (!error && data && data.length > 0) {
          const mapped = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            location: item.latitude && item.longitude 
              ? `${item.title.includes("Colonial") ? "Santo Domingo" : item.title.includes("Levantado") ? "Samaná" : "RD"} (Lat: ${Number(item.latitude).toFixed(3)}, Lng: ${Number(item.longitude).toFixed(3)})` 
              : "República Dominicana",
            duration: item.is_flash ? "¡Oferta Relámpago!" : "Por tiempo limitado",
            rating: item.is_flash ? 4.9 : 4.7,
            originalPrice: Number(item.original_price),
            price: Number(item.price),
            discount: item.discount_percentage ? `${item.discount_percentage}% OFF` : "Oferta Especial",
            tags: [item.discount_code ? `Código: ${item.discount_code}` : "Descuento"],
            image: item.image_url || samanaImg,
            latitude: Number(item.latitude),
            longitude: Number(item.longitude),
            radius: Number(item.radius_meters || 500),
            isFlash: item.is_flash,
            discountCode: item.discount_code
          }));
          setDbOffers(mapped);
        }
      } catch (err) {
        console.error("Failed to load offers from Supabase, using defaults:", err);
      }
    }
    fetchOffers();
  }, []);

  // Request Notification Permissions
  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
        toast.success("¡Notificaciones Push activadas con éxito!");
      } else {
        toast.error("Permiso de notificaciones denegado.");
      }
    } else {
      toast.warning("Este navegador no soporta notificaciones push nativas.");
    }
  };

  // Haversine Distance Formula
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) *
        Math.cos(phi2) *
        Math.sin(deltaLambda / 2) *
        Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // distance in meters
  };

  // Check proximity whenever location or offers change
  useEffect(() => {
    if (!userLocation) return;

    const newNearby: Record<string, number> = {};
    dbOffers.forEach((offer) => {
      if (offer.latitude && offer.longitude) {
        const dist = getDistance(
          userLocation.lat,
          userLocation.lng,
          offer.latitude,
          offer.longitude
        );
        const radius = offer.radius || 500;
        
        if (dist <= radius) {
          newNearby[offer.id] = Math.round(dist);
          
          // Trigger a notification if this is a newly detected proximity
          if (!nearbyOffers[offer.id]) {
            // Toast notification
            toast.info(`⚡ ¡Oferta Cercana! "${offer.title}" a solo ${Math.round(dist)}m.`, {
              description: `Usa el código ${offer.discountCode || "SPECIAL"} para canjear tu descuento.`,
              duration: 8000,
            });

            // Native Browser Push Notification
            if (Notification.permission === "granted") {
              new Notification("⚡ ¡Oferta cercana detectada!", {
                body: `${offer.title} está a solo ${Math.round(dist)} metros de ti. ¡Aprovecha el descuento!`,
                icon: "/favicon.ico",
              });
            }
          }
        }
      }
    });

    setNearbyOffers(newNearby);
  }, [userLocation, dbOffers]);

  // Simulate User Location
  const handleSimulateLocation = (loc: typeof simLocations[0]) => {
    setUserLocation({ lat: loc.lat, lng: loc.lng });
    setSimulatedName(loc.name);
    toast.success(`Ubicación simulada en: ${loc.name}`);
  };

  // Real Geolocation
  const handleUseRealLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setSimulatedName("Ubicación Real");
          toast.success("Usando tus coordenadas GPS actuales.");
        },
        (err) => {
          toast.error(`Error de geolocalización: ${err.message}`);
        }
      );
    } else {
      toast.error("Geolocalización no soportada por el navegador.");
    }
  };

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 35,
    seconds: 12,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 23;
          days--;
        }
        if (days < 0) {
          return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const filteredOffers = dbOffers.filter((offer) => {
    if (activeFilter === "Todo") return true;
    if (activeFilter === "Ofertas Flash") return offer.isFlash;
    if (activeFilter === "Aventura") return offer.tags.some(t => t.includes("Tour") || t.includes("Trekking"));
    if (activeFilter === "Cultura") return offer.tags.some(t => t.includes("Cultura"));
    if (activeFilter === "Eco-Glamping") return offer.title.includes("Glamping") || offer.tags.some(t => t.includes("Camping"));
    return true;
  });

  return (
    <PageTransition>
      <SEOHead
        title="Ofertas Relámpago y Cupones Geolocalizados - Descubre RD"
        description="Encuentra cupones y ofertas flash geolocalizadas cuando estés cerca de atracciones y hoteles en República Dominicana."
      />
      <div className="min-h-screen bg-background">
        <Header />

        <main>
        {/* Hero with Countdown */}
        <section className="relative h-[50vh] min-h-[420px] flex items-center justify-center overflow-hidden pt-16">
          <img
            src={puntaCanaImg}
            alt="Vista de Punta Cana, República Dominicana"
            className="absolute inset-0 w-full h-full object-cover object-center"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          
          <div className="relative z-10 container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="bg-primary/20 text-primary mb-4 border border-primary/20 animate-pulse">
                ⚡ OFERTA RELÁMPAGO DEL DÍA
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Escapada de Lujo a Punta Cana
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                5 días y 4 noches en Secrets Cap Cana con todo incluido. ¡Usa geolocalización para desbloquear más descuentos!
              </p>

              {/* Countdown */}
              <div className="flex justify-center gap-4 mb-8">
                {[
                  { value: timeLeft.days, label: "DÍAS" },
                  { value: timeLeft.hours, label: "HORAS" },
                  { value: timeLeft.minutes, label: "MIN" },
                  { value: timeLeft.seconds, label: "SEG" },
                ].map((item, i) => (
                  <div key={i} className="bg-card/80 backdrop-blur-sm rounded-xl p-4 min-w-[70px] border border-border">
                    <div className="text-2xl font-bold text-foreground font-mono">
                      {String(item.value).padStart(2, "0")}
                    </div>
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Geolocation Simulator Console */}
        <section className="py-8 bg-card border-y border-border">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Navigation className="h-5 w-5 text-primary animate-bounce" />
                  <h3 className="font-bold text-lg">Consola de Ofertas Proximidad GPS</h3>
                </div>
                <p className="text-sm text-muted-foreground max-w-md">
                  Simula tu ubicación en los puntos turísticos de RD para activar cupones flash y notificaciones push exclusivas.
                </p>
                <div className="flex flex-wrap gap-2 pt-1 justify-center md:justify-start">
                  <Badge variant="outline" className="gap-1">
                    <Compass className="h-3.5 w-3.5" /> Lat: {userLocation?.lat.toFixed(4) || "Ninguna"}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Compass className="h-3.5 w-3.5" /> Lng: {userLocation?.lng.toFixed(4) || "Ninguna"}
                  </Badge>
                  <Badge className="bg-primary/20 text-primary border-primary/20">
                    Socio: {simulatedName}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full md:w-auto">
                <div className="flex flex-wrap justify-center md:justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={handleUseRealLocation} className="gap-1">
                    <Navigation className="h-4 w-4" /> GPS Real
                  </Button>
                  <Button 
                    size="sm" 
                    variant={notificationsEnabled ? "secondary" : "default"} 
                    onClick={requestNotificationPermission} 
                    className="gap-1"
                  >
                    <Bell className="h-4 w-4" /> Activar Push
                  </Button>
                </div>
                <div className="flex flex-wrap justify-center md:justify-end gap-1.5">
                  {simLocations.map((loc) => (
                    <Button 
                      key={loc.name} 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleSimulateLocation(loc)}
                      className="text-xs bg-muted hover:bg-muted/80 py-1 px-2.5 rounded-full border border-border"
                      title={loc.desc}
                    >
                      📍 {loc.name.split(",")[0]}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 border-b border-border sticky top-16 bg-background/95 backdrop-blur-sm z-40">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
              <span className="text-sm text-muted-foreground whitespace-nowrap flex items-center gap-2">
                <Check className="h-4 w-4" />
                FILTRAR POR:
              </span>
              {filters.map((filter) => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter)}
                  className="whitespace-nowrap"
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Offers Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Ofertas Disponibles en el Destino
                </h2>
                <p className="text-muted-foreground">
                  Desbloquea cupones exclusivos acercándote a los destinos correspondientes.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOffers.map((offer, index) => {
                const isClose = nearbyOffers[offer.id] !== undefined;
                const distance = nearbyOffers[offer.id];

                return (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={`group bg-card rounded-2xl overflow-hidden border transition-all ${
                      isClose ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/5" : "border-border hover:shadow-xl"
                    }`}
                  >
                    <div className="relative aspect-[4/3]">
                      <img
                        src={offer.image}
                        alt={offer.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                        {offer.discount}
                      </Badge>
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-medium">{offer.rating}</span>
                      </div>
                      {isClose && (
                        <Badge className="absolute bottom-3 left-3 bg-emerald-600 text-white gap-1 font-semibold border-none animate-pulse">
                          📍 CERCANO ({distance}m)
                        </Badge>
                      )}
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{offer.location}</span>
                        <span>•</span>
                        <Clock className="h-3.5 w-3.5" />
                        <span>{offer.duration}</span>
                      </div>
                      
                      <h3 className="font-display font-bold text-foreground text-lg group-hover:text-primary transition-colors line-clamp-2">
                        {offer.title}
                      </h3>

                      <div className="flex flex-wrap gap-2">
                        {offer.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-secondary px-2 py-1 rounded flex items-center gap-1">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {isClose && offer.discountCode && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5 text-center">
                          <p className="text-xs text-emerald-600 font-semibold mb-1">¡CUPÓN DESBLOQUEADO!</p>
                          <code className="text-sm font-mono font-bold bg-white dark:bg-zinc-800 text-emerald-600 px-3 py-1 rounded border border-emerald-500/30 select-all block max-w-[180px] mx-auto">
                            {offer.discountCode}
                          </code>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <span className="text-sm text-muted-foreground line-through">
                            RD$ {offer.originalPrice.toLocaleString()}
                          </span>
                          <p className="text-xl font-bold text-primary">
                            RD$ {offer.price.toLocaleString()}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          disabled={offer.isFlash && !isClose}
                          variant={isClose ? "default" : "secondary"}
                          onClick={() => {
                            toast.success(`Redirigiendo a reserva para ${offer.title}`);
                            navigate(`/reserva-directa`);
                          }}
                        >
                          {offer.isFlash && !isClose ? "Bloqueado (Acércate)" : "Ver Oferta"}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filteredOffers.length === 0 && (
              <div className="text-center py-12">
                <NavigationOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay ofertas que coincidan con esta categoría.</p>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-primary rounded-3xl p-8 md:p-12 text-center text-primary-foreground relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-primary to-primary" />
              <div className="relative z-10 space-y-6">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
                  ¿Buscas ofertas ocultas?
                </h2>
                <p className="text-white/80 max-w-md mx-auto">
                  Únete a nuestro club exclusivo y recibe alertas GPS directamente en tu móvil con descuentos sorpresa de hasta 70% en hoteles.
                </p>
                <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder="Tu correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                  <Button variant="secondary" onClick={() => {
                    if (email) {
                      toast.success("¡Te has registrado para recibir ofertas exclusivas!");
                      setEmail("");
                    }
                  }}>Suscribirme</Button>
                </div>
                <p className="text-[10px] text-white/60">
                  Respetamos tu privacidad. Puedes darte de baja en cualquier momento.
                </p>
              </div>
            </div>
          </div>
        </section>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
}
 