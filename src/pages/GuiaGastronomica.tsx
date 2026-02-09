import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, ChevronRight, Utensils, BookOpen, MapPin, Download, ArrowRight, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BetweenSectionsAd } from "@/components/ads";
import { getFeaturedRestaurants } from "@/data/restaurants";

const gastronomicRoutes = [
  {
    id: "ruta-colonial",
    title: "Ruta de la Zona Colonial",
    description: "Recorre los restaurantes más emblemáticos del casco histórico de Santo Domingo, desde brasseries europeas hasta fondas criollas centenarias.",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop",
    stops: 5,
    duration: "1 día",
    difficulty: "Fácil",
  },
  {
    id: "ruta-mariscos",
    title: "Ruta del Marisco Caribeño",
    description: "De Punta Cana a Samaná, descubre los mejores restaurantes de mariscos frente al mar con las capturas más frescas del Caribe.",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop",
    stops: 4,
    duration: "2-3 días",
    difficulty: "Moderada",
  },
  {
    id: "ruta-montana",
    title: "Sabores de Montaña",
    description: "Explora la gastronomía de Jarabacoa y Constanza: chivo al horno, trucha fresca y café orgánico entre paisajes de montaña.",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
    stops: 3,
    duration: "1-2 días",
    difficulty: "Fácil",
  },
];

const blogPosts = [
  {
    id: "platos-imperdibles",
    title: "10 Platos Dominicanos que Debes Probar",
    excerpt: "Desde la Bandera hasta el mangú, una guía completa de los sabores que definen la cocina criolla dominicana.",
    image: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&h=400&fit=crop",
    category: "Guía",
    readTime: "8 min",
  },
  {
    id: "street-food",
    title: "Street Food: Comer en la Calle como un Local",
    excerpt: "Los mejores puestos callejeros, frituras y chimichurris que encontrarás en cada esquina de la República Dominicana.",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop",
    category: "Experiencia",
    readTime: "6 min",
  },
  {
    id: "ron-dominicano",
    title: "La Cultura del Ron Dominicano",
    excerpt: "Brugal, Barceló, Bermúdez: descubre la historia y tradición detrás de los rones más premiados del mundo.",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&h=400&fit=crop",
    category: "Cultura",
    readTime: "10 min",
  },
  {
    id: "cacao-chocolate",
    title: "Del Cacao al Chocolate: Ruta del Cacao",
    excerpt: "República Dominicana es el mayor exportador de cacao orgánico. Visita las plantaciones y degusta chocolate artesanal.",
    image: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&h=400&fit=crop",
    category: "Ruta",
    readTime: "7 min",
  },
];

const recommendations = [
  { label: "Mejor para parejas", emoji: "💑", slug: "pat-e-palo", name: "Pat'e Palo" },
  { label: "Mejor vista al mar", emoji: "🌊", slug: "jellyfish-punta-cana", name: "Jellyfish" },
  { label: "Mejor comida local", emoji: "🇩🇴", slug: "meson-de-bari", name: "Mesón de Bari" },
  { label: "Mejor fusión", emoji: "🍽️", slug: "buche-perico", name: "Buche Perico" },
  { label: "Mejor italiano", emoji: "🇮🇹", slug: "la-piazzetta", name: "La Piazzetta" },
  { label: "Mejor saludable", emoji: "🥗", slug: "bliss", name: "Bliss Restaurant" },
];

export default function GuiaGastronomica() {
  const featuredRestaurants = getFeaturedRestaurants().slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative py-24 mt-16">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&h=600&fit=crop"
            alt="Gastronomía Dominicana"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <BookOpen className="h-3 w-3 mr-1" /> Guía Gastronómica
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
              Sabores de República Dominicana
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Tu guía completa para descubrir la riqueza culinaria de la isla: rutas gastronómicas, recetas tradicionales, restaurantes destacados y mucho más.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/restaurante">
                <Button size="lg" className="gap-2">
                  <Utensils className="h-4 w-4" />
                  Ver todos los restaurantes
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Descargar Guía PDF
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Recommendations */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-xl font-bold text-foreground mb-6 text-center">
            Recomendaciones Rápidas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {recommendations.map((rec) => (
              <Link
                key={rec.slug}
                to={`/restaurante/${rec.slug}`}
                className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/50 hover:shadow-md transition-all group"
              >
                <span className="text-2xl block mb-2">{rec.emoji}</span>
                <p className="text-xs text-muted-foreground mb-1">{rec.label}</p>
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{rec.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-primary mb-2">
                <Crown className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">Selección del Editor</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Restaurantes Destacados
              </h2>
            </div>
            <Link to="/restaurante">
              <Button variant="outline" className="gap-1">
                Ver todos <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredRestaurants.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Link
                  to={`/restaurante/${r.slug}`}
                  className="block bg-card rounded-xl overflow-hidden border border-border group hover:shadow-lg transition-all"
                >
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-medium">{r.rating}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <Badge variant="secondary" className="mb-2 text-xs">{r.priceRange} · {r.cuisineType[0]}</Badge>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{r.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" /> {r.destinationName}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <BetweenSectionsAd showDemo />

      {/* Gastronomic Routes */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">Rutas</Badge>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              Rutas Gastronómicas
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Itinerarios curados para explorar los mejores sabores de cada región dominicana.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {gastronomicRoutes.map((route, i) => (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="overflow-hidden group hover:shadow-lg transition-all h-full">
                  <div className="aspect-[16/10] relative overflow-hidden">
                    <img src={route.image} alt={route.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute bottom-3 left-3 flex gap-2">
                      <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">{route.stops} paradas</Badge>
                      <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">{route.duration}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-display text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {route.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{route.description}</p>
                    <Button variant="outline" size="sm" className="gap-1 w-full">
                      Explorar ruta <ArrowRight className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">Blog</Badge>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              Artículos sobre Gastronomía
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Historias, recetas y secretos de la cocina dominicana contados por expertos locales.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {blogPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Link
                  to={`/articulo/${post.id}`}
                  className="flex flex-col sm:flex-row gap-4 bg-card border border-border rounded-xl overflow-hidden group hover:shadow-lg transition-all"
                >
                  <div className="sm:w-48 aspect-video sm:aspect-square flex-shrink-0 overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4 sm:p-5 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                      <span className="text-xs text-muted-foreground">{post.readTime} lectura</span>
                    </div>
                    <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Downloadable Guide CTA */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                Descarga la Guía Gastronómica Completa
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Más de 50 páginas con restaurantes, recetas, rutas culinarias y recomendaciones de chefs locales. Disponible en PDF para llevar en tu viaje.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" className="gap-2">
                  <Download className="h-4 w-4" />
                  Descargar Gratis (PDF)
                </Button>
                <Link to="/restaurante">
                  <Button size="lg" variant="outline" className="gap-2">
                    Explorar restaurantes <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
