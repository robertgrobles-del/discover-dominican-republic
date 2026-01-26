import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Clock, 
  MapPin, 
  Star, 
  Plane, 
  Hotel, 
  Leaf,
  ChevronDown,
  Mail,
  Check
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageTransition } from "@/components/PageTransition";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import samanaImg from "@/assets/samana.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import puertoPlataImg from "@/assets/puerto-plata.jpg";
import heroBeachImg from "@/assets/hero-beach.jpg";
import laRomanaImg from "@/assets/la-romana.jpg";

const filters = ["Todo", "Semana Santa", "Verano 2024", "Lujo", "Ecoturismo", "Vuelos"];

const offers = [
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
  },
  {
    id: "cuevas-manglares",
    title: "Excursión Cuevas y Manglares",
    location: "Los Haitises, RD",
    duration: "Full Day Tour",
    rating: 4.7,
    originalPrice: 4500,
    price: 2250,
    discount: "2x1",
    tags: ["Transporte", "Almuerzo"],
    image: heroBeachImg,
  },
  {
    id: "ruta-colonial",
    title: "Ruta Colonial + Cena de Lujo",
    location: "Santo Domingo, RD",
    duration: "Fin de Semana",
    rating: 4.8,
    originalPrice: 8000,
    price: 6500,
    discount: "Últimos cupos",
    tags: ["Cultura", "Vida Nocturna"],
    image: santoDomingoImg,
  },
  {
    id: "glamping-paraiso",
    title: "Glamping en el Paraíso",
    location: "Bahía de las Águilas",
    duration: "Aventura 2 Días",
    rating: 5.0,
    originalPrice: 12000,
    price: 9900,
    discount: "Eco-Friendly",
    tags: ["Camping", "Trekking"],
    isEco: true,
    image: laRomanaImg,
  },
  {
    id: "paquete-vacacional",
    title: "Paquete Vacacional Express",
    location: "Santiago → Punta Cana",
    duration: "Ida y Vuelta",
    rating: 4.5,
    originalPrice: 18000,
    price: 13500,
    discount: "Vuelo + Hotel",
    tags: ["Maleta Incluida"],
    isFlight: true,
    image: puntaCanaImg,
  },
  {
    id: "retiro-yoga",
    title: "Retiro de Yoga & Spa",
    location: "Puerto Plata, RD",
    duration: "Fin de Semana",
    rating: 4.6,
    originalPrice: 20000,
    price: 16000,
    discount: "Relax",
    tags: ["Masajes", "Yoga"],
    image: puertoPlataImg,
  },
];

export default function Ofertas() {
  const [activeFilter, setActiveFilter] = useState("Todo");
  const [email, setEmail] = useState("");
  
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

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero with Countdown */}
        <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${puntaCanaImg})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          
          <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="bg-primary/20 text-primary mb-4">
                ⚡ OFERTA RELÁMPAGO
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Escapada de Lujo a Punta Cana
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                Disfruta de 5 días y 4 noches en el Resort Grand Palace con todo incluido. ¡Solo por tiempo limitado!
              </p>

              {/* Countdown */}
              <div className="flex justify-center gap-4 mb-8">
                {[
                  { value: timeLeft.days, label: "DÍAS" },
                  { value: timeLeft.hours, label: "HORAS" },
                  { value: timeLeft.minutes, label: "MIN" },
                  { value: timeLeft.seconds, label: "SEG" },
                ].map((item, i) => (
                  <div key={i} className="bg-card/80 backdrop-blur-sm rounded-xl p-4 min-w-[70px]">
                    <div className="text-2xl font-bold text-foreground">
                      {String(item.value).padStart(2, "0")}
                    </div>
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="gap-2">
                  Reservar Ahora - 50% OFF
                </Button>
                <Button size="lg" variant="outline">
                  Ver Detalles
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 border-b border-border sticky top-16 bg-background/95 backdrop-blur-sm z-40">
          <div className="container mx-auto px-4 lg:px-8">
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
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Ofertas Destacadas del Mes
                </h2>
                <p className="text-muted-foreground">
                  Las mejores oportunidades seleccionadas para ti.
                </p>
              </div>
              <Button variant="link" className="text-primary">
                Ver todo →
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer, index) => (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-shadow"
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
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3" />
                      <span>{offer.location}</span>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>{offer.duration}</span>
                    </div>
                    <h3 className="font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {offer.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {offer.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-secondary px-2 py-1 rounded flex items-center gap-1">
                          {offer.isFlight && tag.includes("Maleta") && <Plane className="h-3 w-3" />}
                          {offer.isEco && <Leaf className="h-3 w-3 text-green-500" />}
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-muted-foreground line-through">
                          RD$ {offer.originalPrice.toLocaleString()}
                        </span>
                        <p className="text-xl font-bold text-primary">
                          RD$ {offer.price.toLocaleString()}
                        </p>
                      </div>
                      <Button size="sm">Ver Oferta</Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button variant="outline" className="gap-2">
                Cargar más ofertas <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="bg-primary rounded-3xl p-8 md:p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
                ¿Buscas ofertas ocultas?
              </h2>
              <p className="text-white/80 max-w-md mx-auto mb-8">
                Únete a nuestro club exclusivo y recibe descuentos de hasta 70% en hoteles y vuelos antes que nadie.
              </p>
              <div className="max-w-md mx-auto flex gap-3">
                <Input
                  type="email"
                  placeholder="Tu correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <Button variant="secondary">Suscribirme</Button>
              </div>
              <p className="text-xs text-white/60 mt-4">
                Nos preocupamos por tus datos. Lee nuestra <span className="underline cursor-pointer">política de privacidad</span>.
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
