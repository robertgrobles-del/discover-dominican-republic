import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Dices, MapPin, Clock, Phone, Globe, Star, DollarSign,
  Sparkles, Users, ChevronRight, Filter, CreditCard, Utensils
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";

const casinos = [
  {
    id: "1",
    name: "Hard Rock Casino Punta Cana",
    image: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800&h=500&fit=crop",
    location: "Punta Cana",
    rating: 4.8,
    reviews: 2345,
    priceRange: "$$$",
    hours: "24 horas",
    description: "El casino más grande del Caribe con más de 40,000 pies cuadrados de juegos.",
    features: ["Slots", "Blackjack", "Póker", "Ruleta", "Baccarat"],
    amenities: ["Restaurantes", "Shows en vivo", "VIP Lounge", "Hotel"],
    featured: true,
  },
  {
    id: "2",
    name: "Casino Dominicus",
    image: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=800&h=500&fit=crop",
    location: "Bayahibe",
    rating: 4.5,
    reviews: 432,
    priceRange: "$$",
    hours: "18:00 - 4:00",
    description: "Casino íntimo con ambiente caribeño y excelente servicio.",
    features: ["Slots", "Blackjack", "Póker"],
    amenities: ["Bar", "Restaurante"],
    featured: false,
  },
  {
    id: "3",
    name: "Casino del Sol Santiago",
    image: "https://images.unsplash.com/photo-1511882150382-421056c89033?w=800&h=500&fit=crop",
    location: "Santiago",
    rating: 4.3,
    reviews: 287,
    priceRange: "$$",
    hours: "16:00 - 6:00",
    description: "El principal casino del norte con ambiente moderno y elegante.",
    features: ["Slots", "Mesas de juego", "Deportes"],
    amenities: ["Restaurante", "Bar VIP"],
    featured: false,
  },
  {
    id: "4",
    name: "Dreams Casino & Resort",
    image: "https://images.unsplash.com/photo-1517232115160-ff93364542dd?w=800&h=500&fit=crop",
    location: "Santo Domingo",
    rating: 4.6,
    reviews: 567,
    priceRange: "$$$",
    hours: "24 horas",
    description: "Experiencia de juego premium en el corazón de la capital.",
    features: ["Slots Premium", "High Stakes", "Torneos de Póker"],
    amenities: ["Spa", "Restaurantes gourmet", "Shows", "Hotel 5 estrellas"],
    featured: true,
  },
];

export default function Casinos() {
  return (
    <PageTransition>
      <SEOHead
        title="Casinos en República Dominicana - Entretenimiento y Juegos"
        description="Descubre los mejores casinos de RD. Hard Rock Casino, entretenimiento nocturno y más."
        keywords="casinos, República Dominicana, Hard Rock Casino, juegos, entretenimiento, Punta Cana"
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-background to-background" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 text-6xl">🎰</div>
            <div className="absolute top-40 right-20 text-6xl">🎲</div>
            <div className="absolute bottom-20 left-1/3 text-6xl">🃏</div>
          </div>
          <div className="container mx-auto px-4 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <Badge className="mb-4 badge-gold">Entretenimiento</Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Casinos en <span className="text-gradient-gold">República Dominicana</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Vive la emoción del juego en los mejores casinos del Caribe con entretenimiento de clase mundial.
              </p>
              <div className="flex gap-4">
                <Button size="lg" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Explorar Casinos
                </Button>
                <Button size="lg" variant="outline" className="gap-2">
                  <DollarSign className="h-4 w-4" />
                  Promociones
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <main className="container mx-auto px-4 lg:px-8 py-12">
          {/* Featured Casino */}
          {casinos.filter((c) => c.featured)[0] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 bg-gradient-to-r from-card via-card to-primary/10 rounded-2xl overflow-hidden border border-primary/30"
            >
              <div className="grid md:grid-cols-2">
                <div className="aspect-video md:aspect-auto relative">
                  <img
                    src={casinos[0].image}
                    alt={casinos[0].name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card md:hidden" />
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <Badge className="w-fit mb-4 badge-gold">Casino Destacado</Badge>
                  <h2 className="font-display text-3xl font-bold mb-3">{casinos[0].name}</h2>
                  <div className="flex items-center gap-4 text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{casinos[0].location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-gold fill-gold" />
                      <span>{casinos[0].rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{casinos[0].hours}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-6">{casinos[0].description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {casinos[0].features.map((feature, i) => (
                      <Badge key={i} variant="secondary">{feature}</Badge>
                    ))}
                  </div>
                  <Button className="w-fit gap-2">
                    Visitar Casino
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* All Casinos */}
          <h2 className="font-display text-2xl font-bold mb-6">Todos los Casinos</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {casinos.map((casino, index) => (
              <motion.div
                key={casino.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl border border-border overflow-hidden card-lift group"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={casino.image}
                    alt={casino.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                  <Badge className="absolute top-3 right-3 bg-background/80">{casino.priceRange}</Badge>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-lg mb-2">{casino.name}</h3>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{casino.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-gold fill-gold" />
                      <span>{casino.rating}</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {casino.description}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Clock className="h-4 w-4" />
                    <span>{casino.hours}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {casino.amenities.slice(0, 3).map((amenity, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{amenity}</Badge>
                    ))}
                  </div>

                  <Button className="w-full gap-2">
                    Ver Detalles
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Responsible Gaming Notice */}
          <div className="mt-12 bg-muted/50 rounded-xl p-6 text-center">
            <p className="text-sm text-muted-foreground">
              🎲 Juega responsablemente. Los juegos de azar pueden ser adictivos. 
              Si sientes que tienes un problema, busca ayuda profesional.
            </p>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
