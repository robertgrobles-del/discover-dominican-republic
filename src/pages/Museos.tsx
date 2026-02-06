import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Building2, MapPin, Clock, Phone, Globe, Star, Calendar,
  Ticket, Image, ChevronRight, Filter, Search
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const museums = [
  {
    id: "1",
    name: "Museo del Hombre Dominicano",
    image: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&h=500&fit=crop",
    category: "Historia",
    location: "Santo Domingo",
    rating: 4.7,
    reviews: 856,
    price: 100,
    currency: "RD$",
    hours: "Mar-Dom 10:00-17:00",
    description: "El museo más importante del país dedicado a la antropología y arqueología dominicana.",
    highlights: ["Colección Taína", "Historia Colonial", "Arte Precolombino"],
    featured: true,
  },
  {
    id: "2",
    name: "Museo de las Casas Reales",
    image: "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=800&h=500&fit=crop",
    category: "Historia",
    location: "Zona Colonial, Santo Domingo",
    rating: 4.8,
    reviews: 1234,
    price: 150,
    currency: "RD$",
    hours: "Mar-Dom 9:00-17:00",
    description: "Ubicado en el antiguo palacio de la Real Audiencia, muestra la historia colonial.",
    highlights: ["Armaduras Españolas", "Arte Colonial", "Historia Virreinal"],
    featured: true,
  },
  {
    id: "3",
    name: "Museo Bellapart",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=500&fit=crop",
    category: "Arte",
    location: "Santo Domingo",
    rating: 4.6,
    reviews: 432,
    price: 0,
    currency: "RD$",
    hours: "Lun-Vie 9:00-18:00",
    description: "Importante colección de arte dominicano del siglo XIX y XX.",
    highlights: ["Pintura Dominicana", "Esculturas", "Exposiciones Temporales"],
    featured: false,
  },
  {
    id: "4",
    name: "Museo del Ámbar",
    image: "https://images.unsplash.com/photo-1584799235813-aaf50775698c?w=800&h=500&fit=crop",
    category: "Ciencias",
    location: "Puerto Plata",
    rating: 4.5,
    reviews: 678,
    price: 250,
    currency: "RD$",
    hours: "Lun-Sáb 9:00-18:00",
    description: "Explora la fascinante historia del ámbar dominicano y sus inclusiones prehistóricas.",
    highlights: ["Ámbar con Insectos", "Historia Geológica", "Tienda de Ámbar"],
    featured: true,
  },
  {
    id: "5",
    name: "Museo de Arte Moderno",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=500&fit=crop",
    category: "Arte",
    location: "Santo Domingo",
    rating: 4.4,
    reviews: 321,
    price: 50,
    currency: "RD$",
    hours: "Mar-Dom 10:00-18:00",
    description: "Arte contemporáneo dominicano y latinoamericano en un espacio moderno.",
    highlights: ["Arte Contemporáneo", "Exposiciones Itinerantes", "Talleres"],
    featured: false,
  },
];

const categories = ["Todos", "Historia", "Arte", "Ciencias", "Arqueología"];

export default function Museos() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");

  const filteredMuseums = museums.filter((museum) => {
    const matchesSearch = museum.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      museum.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "Todos" || museum.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <PageTransition>
      <SEOHead
        title="Museos de República Dominicana - Guía Cultural"
        description="Descubre los mejores museos de RD. Arte, historia, ciencia y cultura dominicana en un solo lugar."
        keywords="museos, República Dominicana, cultura, arte, historia, museo del ámbar, museo hombre dominicano"
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-br from-primary/20 via-background to-background">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <Badge className="mb-4">Cultura</Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Museos de <span className="text-gradient">República Dominicana</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Sumérgete en la rica historia y cultura dominicana a través de sus museos más emblemáticos.
              </p>
            </motion.div>
          </div>
        </section>

        <main className="container mx-auto px-4 lg:px-8 py-12">
          {/* Search and Categories */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar museos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Museums Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMuseums.map((museum, index) => (
              <motion.div
                key={museum.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl border border-border overflow-hidden card-lift group"
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={museum.image}
                    alt={museum.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                  {museum.featured && (
                    <Badge className="absolute top-3 left-3 badge-gold">Destacado</Badge>
                  )}
                  <Badge className="absolute top-3 right-3 bg-background/80">{museum.category}</Badge>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                    {museum.name}
                  </h3>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{museum.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-gold fill-gold" />
                      <span>{museum.rating}</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {museum.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {museum.highlights.slice(0, 3).map((highlight, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {highlight}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{museum.hours}</span>
                    </div>
                    <div className="text-right">
                      {museum.price === 0 ? (
                        <Badge className="badge-emerald">Gratis</Badge>
                      ) : (
                        <span className="font-bold text-primary">{museum.currency}{museum.price}</span>
                      )}
                    </div>
                  </div>

                  <Button className="w-full mt-4 gap-2">
                    Ver Detalles
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
