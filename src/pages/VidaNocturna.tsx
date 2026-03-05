import { useState, useMemo } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { bars as staticBarsData } from "@/data/bars";

const categories = [
  { id: "all", label: "Todos", icon: Sparkles },
  { id: "chill", label: "Chill & Lounge", icon: Wine },
  { id: "fiesta", label: "Fiesta Extrema", icon: PartyPopper },
  { id: "jazz", label: "Jazz & En Vivo", icon: Music },
  { id: "rooftop", label: "Rooftop", icon: Sparkles },
  { id: "playa", label: "Playa", icon: Palmtree }
];

const categoryToType: Record<string, string[]> = {
  chill: ['lounge', 'cocktail-bar'],
  fiesta: ['nightclub'],
  jazz: ['cocktail-bar'],
  rooftop: ['rooftop'],
  playa: ['beach-bar'],
};

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

  const { data: dbBars } = useQuery({
    queryKey: ['bars-list'],
    queryFn: async () => {
      const { data } = await supabase.from('bars').select('*').eq('is_active', true).order('is_featured', { ascending: false });
      return data || [];
    },
  });

  const allVenues = useMemo(() => {
    const staticMapped = staticBarsData.map(b => ({
      name: b.name,
      slug: b.slug,
      location: b.destinationName,
      rating: b.rating,
      description: b.shortDescription,
      tags: [b.dressCode || '', b.musicStyle[0] || ''].filter(Boolean),
      image: b.imageUrl !== '/placeholder.svg' ? b.imageUrl : `https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=500&h=350&fit=crop`,
      badge: b.barType === 'nightclub' ? '#FiestaExtrema' : b.barType === 'beach-bar' ? '#PlayaVibes' : b.barType === 'rooftop' ? '#RooftopView' : '#ChillZone',
      badgeColor: b.barType === 'nightclub' ? 'bg-red-500' : b.barType === 'beach-bar' ? 'bg-amber-500' : b.barType === 'rooftop' ? 'bg-cyan-500' : 'bg-purple-500',
      barType: b.barType,
    }));
    const slugs = new Set(staticMapped.map(v => v.slug));
    (dbBars || []).forEach(db => {
      const slug = db.slug || db.id;
      if (!slugs.has(slug)) {
        staticMapped.push({
          name: db.name,
          slug,
          location: db.address || '',
          rating: Number(db.rating) || 0,
          description: db.short_description || '',
          tags: [db.dress_code, db.music_style].filter(Boolean) as string[],
          image: db.image_url || `https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=500&h=350&fit=crop`,
          badge: '#Nuevo',
          badgeColor: 'bg-primary',
          barType: (db.bar_type || 'lounge') as any,
        });
        slugs.add(slug);
      }
    });
    return staticMapped;
  }, [dbBars]);

  const filteredVenues = useMemo(() => {
    let results = allVenues;
    if (activeCategory !== 'all') {
      const types = categoryToType[activeCategory] || [];
      results = results.filter(v => types.includes(v.barType));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(v => v.name.toLowerCase().includes(q) || v.location.toLowerCase().includes(q));
    }
    return results;
  }, [allVenues, activeCategory, searchQuery]);

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
            {filteredVenues.map((venue, index) => (
              <motion.div
                key={venue.slug}
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
                    <Link to={`/bar/${venue.slug}`}>
                      Ver Detalles y Agenda
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredVenues.length === 0 && (
            <div className="text-center py-12">
              <Wine className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No se encontraron lugares con esos filtros.</p>
            </div>
          )}
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