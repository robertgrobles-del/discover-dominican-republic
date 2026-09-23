import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Landmark, Church, MapPin, Clock, Star, Info,
  Calendar, Users, Camera, Heart, Search, ChevronRight
} from "lucide-react";

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
    price: 75,
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

const monuments = [
  {
    id: 1,
    name: "Faro a Colón",
    location: "Santo Domingo Este",
    description: "Monumento a Cristóbal Colón con supuestos restos del almirante",
    year: 1992
  },
  {
    id: 2,
    name: "Monumento a los Héroes de la Restauración",
    location: "Santiago",
    description: "Símbolo de la ciudad y de la independencia dominicana",
    year: 1944
  },
  {
    id: 3,
    name: "Altar de la Patria",
    location: "Santo Domingo",
    description: "Mausoleo de los padres de la patria: Duarte, Sánchez y Mella",
    year: 1976
  }
];

const categories = ["Todos", "Historia", "Arte", "Ciencias", "Arqueología"];

export default function MuseosMonumentos() {
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
        title="Museos y Monumentos de República Dominicana"
        description="Explora los museos y monumentos históricos de RD. Historia taína, colonial y arte contemporáneo."
      />
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-20">
          {/* Hero */}
          <section className="relative py-20 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
            <div className="container mx-auto px-4 text-center">
              <Landmark className="h-16 w-16 text-amber-600 mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Museos y Monumentos</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Descubre la rica historia y cultura de la República Dominicana
              </p>
            </div>
          </section>

          <section className="py-12">
            <div className="container mx-auto px-4 lg:px-8">
              <Tabs defaultValue="museums" className="space-y-8">
                <div className="flex justify-center">
                  <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="museums" className="flex items-center gap-2">
                      <Landmark className="h-4 w-4" />
                      Museos
                    </TabsTrigger>
                    <TabsTrigger value="monuments" className="flex items-center gap-2">
                      <Church className="h-4 w-4" />
                      Monumentos
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="museums" className="space-y-6">
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
                            <Badge className="absolute top-3 left-3 bg-amber-500 text-white">Destacado</Badge>
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
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
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

                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{museum.hours}</span>
                            </div>
                            <div>
                              {museum.price === 0 ? (
                                <Badge className="bg-emerald-500/10 text-emerald-500 border-none">Gratis</Badge>
                              ) : (
                                <span className="font-bold text-primary">{museum.currency}{museum.price}</span>
                              )}
                            </div>
                          </div>

                          <Button className="w-full mt-4 gap-2">
                            <Camera className="h-4 w-4" />
                            Ver Detalles
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="monuments" className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {monuments.map((monument) => (
                      <Card key={monument.id} className="text-center p-6 hover:shadow-xl transition-shadow border border-border">
                        <Church className="h-12 w-12 text-amber-600 mx-auto mb-4" />
                        <h3 className="font-bold text-lg mb-2">{monument.name}</h3>
                        <Badge variant="outline" className="mb-3">{monument.location}</Badge>
                        <p className="text-sm text-muted-foreground mb-4">{monument.description}</p>
                        <Badge variant="secondary">Inaugurado: {monument.year}</Badge>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
