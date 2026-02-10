import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Sparkles, MapPin, Clock, Phone, Star, Heart, Leaf,
  Droplets, Smile, ChevronRight, Filter, Search
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const spas = [
  {
    id: "1",
    slug: "six-senses-spa",
    name: "Six Senses Spa",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=500&fit=crop",
    category: "Resort Spa",
    location: "Punta Cana",
    rating: 4.9,
    reviews: 567,
    priceFrom: 150,
    duration: "60-180 min",
    description: "Experiencia de bienestar holístico con vistas al mar Caribe.",
    services: ["Masajes", "Faciales", "Yoga", "Meditación", "Hidroterapia"],
    highlights: ["Tratamientos orgánicos", "Vistas al mar", "Programa detox"],
    featured: true,
  },
  {
    id: "2",
    slug: "spa-sanctuary",
    name: "Spa Sanctuary",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbec6b?w=800&h=500&fit=crop",
    category: "Day Spa",
    location: "Santo Domingo",
    rating: 4.7,
    reviews: 324,
    priceFrom: 80,
    duration: "30-120 min",
    description: "Oasis urbano de tranquilidad en el corazón de la capital.",
    services: ["Masajes terapéuticos", "Tratamientos faciales", "Manicure/Pedicure"],
    highlights: ["Productos locales", "Ambiente zen"],
    featured: false,
  },
  {
    id: "3",
    slug: "casa-de-campo-spa",
    name: "Casa de Campo Spa",
    image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&h=500&fit=crop",
    category: "Resort Spa",
    location: "La Romana",
    rating: 4.8,
    reviews: 456,
    priceFrom: 120,
    duration: "60-240 min",
    description: "Spa de lujo con tratamientos exclusivos y vistas tropicales.",
    services: ["Terapias de pareja", "Circuito de aguas", "Tratamientos corporales"],
    highlights: ["Tratamientos con cacao dominicano", "Piscinas termales"],
    featured: true,
  },
  {
    id: "4",
    slug: "jarabacoa-eco-spa",
    name: "Jarabacoa Eco Spa",
    image: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&h=500&fit=crop",
    category: "Eco Spa",
    location: "Jarabacoa",
    rating: 4.6,
    reviews: 189,
    priceFrom: 60,
    duration: "45-120 min",
    description: "Bienestar natural en las montañas con productos orgánicos locales.",
    services: ["Masajes con aceites esenciales", "Baños de flores", "Aromaterapia"],
    highlights: ["100% natural", "Productos de montaña", "Aire puro"],
    featured: false,
  },
];

const categories = ["Todos", "Resort Spa", "Day Spa", "Eco Spa", "Medical Spa"];

export default function SpasWellness() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");

  const filteredSpas = spas.filter((spa) => {
    const matchesSearch = spa.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spa.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "Todos" || spa.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <PageTransition>
      <SEOHead
        title="Spas y Wellness en República Dominicana - Relax y Bienestar"
        description="Descubre los mejores spas y centros de bienestar en RD. Masajes, tratamientos faciales, yoga y más."
        keywords="spa, wellness, bienestar, masajes, República Dominicana, relax, tratamientos"
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-br from-emerald/20 via-background to-background">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <Badge className="mb-4 badge-emerald">Bienestar</Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Spas & <span className="text-gradient">Wellness</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Renueva cuerpo y mente en los mejores centros de bienestar del Caribe. 
                Tratamientos exclusivos con ingredientes dominicanos.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Button className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Ver Tratamientos
                </Button>
                <Button variant="outline" className="gap-2">
                  <Heart className="h-4 w-4" />
                  Paquetes Parejas
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <main className="container mx-auto px-4 lg:px-8 py-12">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar spas..."
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

          {/* Spa Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {filteredSpas.map((spa, index) => (
              <Link key={spa.id} to={`/spa/${spa.slug}`} className="block">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl border border-border overflow-hidden card-lift group h-full"
              >
                <div className="grid md:grid-cols-5">
                  <div className="md:col-span-2 aspect-video md:aspect-auto relative overflow-hidden">
                    <img
                      src={spa.image}
                      alt={spa.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {spa.featured && (
                      <Badge className="absolute top-3 left-3 badge-emerald">Destacado</Badge>
                    )}
                  </div>
                  <div className="md:col-span-3 p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge variant="outline" className="mb-2 text-xs">{spa.category}</Badge>
                        <h3 className="font-bold text-lg">{spa.name}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Desde</p>
                        <p className="text-xl font-bold text-primary">${spa.priceFrom}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{spa.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-gold fill-gold" />
                        <span>{spa.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{spa.duration}</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {spa.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {spa.services.slice(0, 4).map((service, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{service}</Badge>
                      ))}
                    </div>

                    <Button className="w-full gap-2">
                      Ver Detalles
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
              </Link>
            ))}
          </div>

          {/* Benefits Section */}
          <section className="mt-16 bg-gradient-to-r from-emerald/10 via-card to-card rounded-2xl p-8 border border-emerald/30">
            <h2 className="font-display text-2xl font-bold mb-6 text-center">Beneficios del Bienestar</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: Leaf, title: "Productos Naturales", desc: "Ingredientes orgánicos locales" },
                { icon: Droplets, title: "Hidroterapia", desc: "Circuitos de agua termales" },
                { icon: Smile, title: "Relax Total", desc: "Ambiente de tranquilidad" },
                { icon: Heart, title: "Salud Integral", desc: "Cuerpo y mente en armonía" },
              ].map((benefit, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald/20 flex items-center justify-center">
                    <benefit.icon className="h-7 w-7 text-emerald" />
                  </div>
                  <h3 className="font-medium mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
