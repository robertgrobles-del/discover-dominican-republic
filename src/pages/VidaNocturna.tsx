import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Search, MapPin, Star, Music, Wine, Sparkles, PartyPopper, 
  Palmtree, ChevronDown, Calendar, Clock, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BetweenSectionsAd, CompactInlineAd } from "@/components/ads";

const categories = [
  { id: "all", label: "Todos", icon: Sparkles },
  { id: "chill", label: "Chill & Lounge", icon: Wine },
  { id: "fiesta", label: "Fiesta Extrema", icon: PartyPopper },
  { id: "jazz", label: "Jazz & En Vivo", icon: Music },
  { id: "rooftop", label: "Rooftop", icon: Sparkles },
  { id: "playa", label: "Playa", icon: Palmtree }
];

const venues = [
  {
    name: "Lulú Tasting Bar",
    location: "Zona Colonial",
    rating: 4.9,
    description: "Ambiente sofisticado en el corazón de la ciudad colonial. Perfecto para degustaciones y...",
    tags: ["Casual Elegante", "Jazz / Lounge"],
    image: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=500&h=350&fit=crop",
    badge: "#ChillZone",
    badgeColor: "bg-purple-500"
  },
  {
    name: "Coco Bongo",
    location: "Punta Cana",
    rating: 4.7,
    description: "El show nocturno más famoso del Caribe. Acróbatas, imitadores y fiesta non-stop.",
    tags: ["Smart Casual", "Show / Top 40"],
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&h=350&fit=crop",
    badge: "#FiestaExtrema",
    badgeColor: "bg-red-500"
  },
  {
    name: "Sugar Cane House",
    location: "Santo Domingo",
    rating: 4.8,
    description: "Vistas increíbles de la ciudad con los mejores cócteles de autor basados en ron local.",
    tags: ["Casual", "Mixología"],
    image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=500&h=350&fit=crop",
    badge: "#RooftopView",
    badgeColor: "bg-cyan-500"
  },
  {
    name: "Mosquito Bar",
    location: "Las Terrenas",
    rating: 4.8,
    description: "El lugar icónico para ver el atardecer y bailar descalzo en la arena. Ambiente bohemio.",
    tags: ["Playa Chic", "Deep House"],
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&h=350&fit=crop",
    badge: "#PlayaVibes",
    badgeColor: "bg-amber-500"
  },
  {
    name: "La Fabrica",
    location: "Santiago",
    rating: 4.6,
    description: "Música electrónica y alternativa en un ambiente industrial renovado. Solo para conocedores.",
    tags: ["Urbano", "Techno"],
    image: "https://images.unsplash.com/photo-1545128485-c400e7702796?w=500&h=350&fit=crop",
    badge: "#Underground",
    badgeColor: "bg-slate-500"
  },
  {
    name: "El Mesón de la Cava",
    location: "Santo Domingo",
    rating: 4.9,
    description: "Una cueva natural convertida en restaurante y bar. Una experiencia única en el Caribe.",
    tags: ["Formal", "En Vivo"],
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&h=350&fit=crop",
    badge: "#VinoYArte",
    badgeColor: "bg-rose-500"
  }
];

const houseDrinks = [
  { name: "Mojito de Chinola", venue: "Lulú Tasting Bar", offer: "2x1 los Jueves", image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=100&h=100&fit=crop" },
  { name: "Ron Fashioned", venue: "Sugar Cane House", offer: "Especialidad del Chef", image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=100&h=100&fit=crop" }
];

const nightAgenda = [
  { day: "HOY", date: 24, event: "DJ Tiesto Guest Night", venue: "Coco Bongo", time: "10:00 PM", badge: "Venta", badgeColor: "bg-red-500" },
  { day: "SAB", date: 25, event: "Noche de Jazz & Vinos", venue: "Lulú Tasting Bar", time: "8:00 PM", badge: "Libre", badgeColor: "bg-green-500" },
  { day: "DOM", date: 26, event: "Sunset Sessions", venue: "Mosquito Bar", time: "5:00 PM", badge: "Libre", badgeColor: "bg-green-500" }
];

export default function VidaNocturna() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("santo-domingo");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1920&h=800&fit=crop"
            alt="Vida Nocturna RD"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl px-4"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full mb-4">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              En vivo ahora
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-2">
              Descubre la Noche
            </h1>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-6">
              Dominicana
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              La guía definitiva de los mejores bares, discotecas y eventos exclusivos en la isla.
            </p>

            {/* Search Bar */}
            <div className="flex gap-2 max-w-xl mx-auto bg-card/80 backdrop-blur-md p-2 rounded-full border border-border">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar lugar o DJ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-transparent border-0 focus-visible:ring-0"
                />
              </div>
              <div className="flex items-center gap-2 px-4 border-l border-border">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="border-0 bg-transparent w-[140px] focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="santo-domingo">Santo Domingo</SelectItem>
                    <SelectItem value="punta-cana">Punta Cana</SelectItem>
                    <SelectItem value="santiago">Santiago</SelectItem>
                    <SelectItem value="las-terrenas">Las Terrenas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="rounded-full px-6">Buscar</Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="border-b border-border bg-card/50 sticky top-16 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Filtrar por ambiente:</span>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
                className="gap-2 whitespace-nowrap"
              >
                <cat.icon className="h-4 w-4" />
                {cat.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Featured Venues */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Lugares Destacados</h2>
              <p className="text-sm text-muted-foreground">Los sitios más calientes de este fin de semana</p>
            </div>
            <Button variant="link" className="text-primary gap-1">
              Ver todo el mapa <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue, index) => (
              <motion.div
                key={venue.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card rounded-xl overflow-hidden border border-border group cursor-pointer hover:border-primary/50 transition-colors"
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img 
                    src={venue.image} 
                    alt={venue.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`text-xs px-2 py-1 rounded-full text-white font-medium ${venue.badgeColor}`}>
                      {venue.badge}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-medium">{venue.rating}</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display font-bold text-foreground">{venue.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{venue.location}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{venue.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {venue.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={`/bar/${venue.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      Ver Detalles y Agenda
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" className="gap-2">
              Cargar más lugares <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </section>

        {/* Bottom Section: Drinks & Agenda */}
        <section className="grid lg:grid-cols-2 gap-12">
          {/* House Drinks */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Wine className="h-5 w-5 text-primary" />
              <h3 className="font-display text-xl font-bold text-foreground">Tragos de la Casa</h3>
            </div>
            <div className="space-y-4">
              {houseDrinks.map((drink, i) => (
                <motion.div
                  key={drink.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-4 bg-card rounded-xl p-4 border border-border"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={drink.image} alt={drink.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{drink.name}</h4>
                    <p className="text-sm text-muted-foreground">{drink.venue}</p>
                    <span className="text-xs text-primary">{drink.offer}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Night Agenda */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="font-display text-xl font-bold text-foreground">Agenda Nocturna</h3>
            </div>
            <div className="space-y-4">
              {nightAgenda.map((event, i) => (
                <motion.div
                  key={event.event}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-4 bg-card rounded-xl p-4 border border-border"
                >
                  <div className="w-14 text-center flex-shrink-0">
                    <p className="text-xs text-muted-foreground">{event.day}</p>
                    <p className="text-2xl font-bold text-foreground">{event.date}</p>
                  </div>
                  <div className="flex-1 border-l border-border pl-4">
                    <h4 className="font-medium text-foreground">{event.event}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{event.venue}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.time}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full text-white ${event.badgeColor}`}>
                    {event.badge}
                  </span>
                </motion.div>
              ))}
            </div>
            <Button variant="link" className="w-full mt-4 text-primary">
              Ver calendario completo
            </Button>
          </div>
        </section>
      </div>

      {/* Ad before footer */}
      <BetweenSectionsAd showDemo />

      <Footer />
    </div>
  );
}