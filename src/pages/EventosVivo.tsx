import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Users, Ticket, Radio, Filter, Calendar } from "lucide-react";
import { toast } from "sonner";
import { CheckoutModal } from "@/components/CheckoutModal";

interface Evento {
  id: string;
  title: string;
  city: string;
  category: "concert" | "party" | "baseball" | "folklore";
  venue: string;
  time: string;
  status: "live" | "scheduled" | "ended";
  price: number;
  attendees: number;
  image: string;
}

const mockEvents: Evento[] = [
  {
    id: "e1",
    title: "Concierto 4.40 - Juan Luis Guerra",
    city: "Santo Domingo",
    category: "concert",
    venue: "Estadio Olímpico Félix Sánchez",
    time: "20:00 - 23:30",
    status: "live",
    price: 3500,
    attendees: 42000,
    image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&fit=crop"
  },
  {
    id: "e2",
    title: "Tigres del Licey vs Águilas Cibaeñas",
    city: "Santo Domingo",
    category: "baseball",
    venue: "Estadio Quisqueya",
    time: "19:15 - 22:30",
    status: "live",
    price: 800,
    attendees: 18000,
    image: "https://images.unsplash.com/photo-1508704019882-f9cf40e475b4?w=800&fit=crop"
  },
  {
    id: "e3",
    title: "Santo Domingo Cockfight Championship",
    city: "Santiago",
    category: "folklore",
    venue: "Club Gallístico Santiago",
    time: "21:00 - 01:00",
    status: "live",
    price: 1500,
    attendees: 350,
    image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&fit=crop"
  },
  {
    id: "e4",
    title: "Mega Reggaeton Beach Party",
    city: "Punta Cana",
    category: "party",
    venue: "Coco Bongo Beach Club",
    time: "22:00 - 04:00",
    status: "scheduled",
    price: 2500,
    attendees: 2200,
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&fit=crop"
  },
  {
    id: "e5",
    title: "Noche de Bachata y Son",
    city: "Las Terrenas",
    category: "party",
    venue: "El Mosquito Bar",
    time: "21:00 - 02:00",
    status: "live",
    price: 500,
    attendees: 450,
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&fit=crop"
  },
  {
    id: "e6",
    title: "Festival del Merengue Dominicano",
    city: "Santiago",
    category: "concert",
    venue: "Monumento a los Héroes de la Restauración",
    time: "19:00 - 23:00",
    status: "ended",
    price: 0,
    attendees: 15000,
    image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&fit=crop"
  }
];

const categoryLabels = {
  concert: "Concierto",
  party: "Fiesta/Discoteca",
  baseball: "Béisbol LIDOM",
  folklore: "Folklore y Tradición"
};

export default function EventosVivo() {
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Checkout Modal State
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const filteredEvents = mockEvents.filter(event => {
    const cityMatch = selectedCity === "all" || event.city === selectedCity;
    const categoryMatch = selectedCategory === "all" || event.category === selectedCategory;
    return cityMatch && categoryMatch;
  });

  const handleBooking = (event: Evento) => {
    setSelectedEvent({
      id: event.id,
      name: `Ticket: ${event.title}`,
      type: "tour",
      price: event.price === 0 ? 0.01 : Number((event.price / 58).toFixed(2)),
      image: event.image
    });
    setCheckoutOpen(true);
  };

  return (
    <PageTransition>
      <SEOHead
        title="Eventos en Vivo Ahora mismo en RD"
        description="Descubre conciertos, fiestas, juegos de béisbol y eventos culturales pasando esta noche en cada ciudad de la República Dominicana."
      />
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />

        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8">
            
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-border pb-6">
              <div>
                <Badge className="mb-3 bg-red-500/10 text-red-500 border-red-500/20 gap-1.5 py-1 px-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  En Vivo Ahora
                </Badge>
                <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground">
                  ¿Qué pasa esta noche en la Isla?
                </h1>
                <p className="text-muted-foreground mt-2 max-w-xl">
                  Explora las actividades y espectáculos nocturnos en tiempo real. ¡No te quedes en el hotel!
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground bg-secondary/50 rounded-lg py-1 px-3">
                  <Radio className="h-4 w-4 text-red-500 animate-pulse" />
                  <span>24/7 Live Stream</span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-8 bg-card/40 backdrop-blur-md p-4 rounded-xl border border-border">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mr-2">
                <Filter className="h-4 w-4" />
                <span>Filtrar por:</span>
              </div>
              
              {/* City selector */}
              <div className="flex flex-wrap gap-2">
                {["all", "Santo Domingo", "Santiago", "Punta Cana", "Las Terrenas"].map((city) => (
                  <Button
                    key={city}
                    variant={selectedCity === city ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCity(city)}
                    className="rounded-full text-xs"
                  >
                    {city === "all" ? "Todas las Ciudades" : city}
                  </Button>
                ))}
              </div>

              <div className="h-6 w-px bg-border hidden md:block" />

              {/* Category selector */}
              <div className="flex flex-wrap gap-2">
                {["all", "concert", "party", "baseball", "folklore"].map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full text-xs ${selectedCategory === cat ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
                  >
                    {cat === "all" ? "Todas las Categorías" : categoryLabels[cat as keyof typeof categoryLabels]}
                  </Button>
                ))}
              </div>
            </div>

            {/* Grid display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="h-full overflow-hidden border border-border bg-card/55 hover:border-primary/20 transition-all duration-300 group hover:shadow-lg flex flex-col justify-between">
                      <div>
                        {/* Image banner */}
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          
                          {/* Live/Scheduled status badge */}
                          {event.status === "live" && (
                            <Badge className="absolute top-3 right-3 bg-red-500 text-white gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-200 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                              </span>
                              En Vivo
                            </Badge>
                          )}
                          {event.status === "scheduled" && (
                            <Badge className="absolute top-3 right-3 bg-amber-500 text-white gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                              Próximamente
                            </Badge>
                          )}
                          {event.status === "ended" && (
                            <Badge className="absolute top-3 right-3 bg-slate-700 text-slate-300 gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                              Terminado
                            </Badge>
                          )}

                          {/* City tag */}
                          <Badge className="absolute bottom-3 left-3 bg-black/70 text-white border-none text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            {event.city}
                          </Badge>
                        </div>

                        {/* Event Content */}
                        <div className="p-5">
                          <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                            {categoryLabels[event.category]}
                          </p>
                          <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-1">
                            {event.title}
                          </h3>

                          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary/60 flex-shrink-0" />
                              <span className="truncate">{event.venue}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-primary/60 flex-shrink-0" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-primary/60 flex-shrink-0" />
                              <span>{event.attendees.toLocaleString()} asistiendo esta noche</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="p-5 pt-0 border-t border-border/40 mt-4 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-muted-foreground">Entrada</p>
                          <p className="font-display font-bold text-foreground">
                            {event.price === 0 ? "Gratis" : `RD$ ${event.price.toLocaleString()}`}
                          </p>
                        </div>
                        <Button
                          disabled={event.status === "ended"}
                          onClick={() => handleBooking(event)}
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1 text-xs"
                        >
                          <Ticket className="h-3.5 w-3.5" />
                          {event.price === 0 ? "Obtener Pase" : "Comprar Ticket"}
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredEvents.length === 0 && (
                <div className="col-span-full py-16 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-foreground mb-1">No hay eventos activos</h3>
                  <p className="text-muted-foreground">No encontramos espectáculos en vivo en la ciudad o categoría seleccionada.</p>
                </div>
              )}
            </div>

          </div>
        </main>

        <Footer />

        <CheckoutModal 
          isOpen={checkoutOpen} 
          onClose={() => setCheckoutOpen(false)} 
          item={selectedEvent} 
        />
      </div>
    </PageTransition>
  );
}
