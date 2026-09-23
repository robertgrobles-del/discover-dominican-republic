import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, ChevronRight, Utensils, BookOpen, MapPin, Download, ArrowRight, Crown, PlusCircle, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BetweenSectionsAd, CompactInlineAd, PanoramaAd, SquareAd } from "@/components/promo";
import { getFeaturedRestaurants } from "@/data/restaurants";
import { SEOHead } from "@/components/SEOHead";
import { RestaurantRegistrationModal } from "@/components/gastronomy/RestaurantRegistrationModal";
import { RestaurantMenuViewer, RestaurantMenuData } from "@/components/gastronomy/RestaurantMenuViewer";

const sampleMenus: Record<string, RestaurantMenuData> = {
  "pat-e-palo": {
    restaurantId: "pat-e-palo",
    restaurantName: "Pat'e Palo European Brasserie",
    cuisine: "Fusión Mediterránea / Criolla de Autor",
    location: "Plaza España, Ciudad Colonial, Santo Domingo",
    menuMode: "both",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    pdfFileName: "Carta_PatePalo_2026_Verificada.pdf",
    pdfFileSize: "3.1 MB",
    pdfLastUpdated: "Hace 3 días",
    currencyDefault: "DOP",
    activeSponsorship: {
      type: "regalo_usuario",
      title: "Cortesía Turística Exclusiva",
      description: "Cóctel de bienvenida de ron añejo dominicano reservando a través de Descubre RD."
    },
    items: [
      {
        id: "p1",
        name: "Carpaccio de Pulpo de Samaná",
        category: "entradas",
        description: "Finas láminas de pulpo caribeño macerado en aceite de oliva virgen extra, alcaparras de Montecristi y páprika ahumada.",
        priceDOP: 890,
        priceUSD: 14.80,
        dietary: ["mariscos", "sin_gluten"],
        isSignature: true
      },
      {
        id: "p2",
        name: "Chivo Liniero al Ron Dominicano",
        category: "platos_fuertes",
        description: "Guiso tradicional de chivo de Montecristi cocido a fuego lento durante 8 horas con reducción de ron añejo, acompañado de chenchén del sur.",
        priceDOP: 1450,
        priceUSD: 24.15,
        dietary: ["tipico_rd", "sin_gluten"],
        isSignature: true
      },
      {
        id: "p3",
        name: "Risotto Criollo de Hongos y Plátano Maduro",
        category: "platos_fuertes",
        description: "Arroz arborio cremoso con selección de setas de Jarabacoa, toques caramelizados de plátano maduro y queso de hoja.",
        priceDOP: 1150,
        priceUSD: 19.15,
        dietary: ["vegetariano"]
      },
      {
        id: "p4",
        name: "Esfera de Chocolate Orgánico de San Francisco",
        category: "postres",
        description: "Mousse de cacao 70% dominicano sobre tierra de café de Polo Barahona y helado artesanal de coco caribeño.",
        priceDOP: 620,
        priceUSD: 10.30,
        dietary: ["tipico_rd", "vegetariano"],
        isSignature: true
      },
      {
        id: "p5",
        name: "Cóctel Ciguapa Pasión",
        category: "bebidas",
        description: "Ron blanco prémium, chinola fresca de Samaná, toque de jengibre y menta silvestre de Constanza.",
        priceDOP: 550,
        priceUSD: 9.15,
        dietary: ["tipico_rd", "vegano"]
      }
    ]
  },
  "jellyfish-punta-cana": {
    restaurantId: "jellyfish-punta-cana",
    restaurantName: "Jellyfish Beach Restaurant",
    cuisine: "Mariscos Frescos & Cocina de Playa",
    location: "Playa Bávaro, Punta Cana",
    menuMode: "pdf",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    pdfFileName: "Menu_Jellyfish_Beach_Club_2026.pdf",
    pdfFileSize: "4.8 MB",
    pdfLastUpdated: "Ayer",
    currencyDefault: "USD",
    activeSponsorship: {
      type: "rifa_seguidores",
      title: "Sorteo Mensual para Seguidores",
      description: "Cena romántica de 3 tiempos frente al atardecer para 2 personas."
    }
  },
  "meson-de-bari": {
    restaurantId: "meson-de-bari",
    restaurantName: "Mesón de Bari",
    cuisine: "Cocina Tradicional Dominicana",
    location: "Calle Hostos, Ciudad Colonial, Santo Domingo",
    menuMode: "items",
    currencyDefault: "DOP",
    activeSponsorship: {
      type: "degustacion_influencer",
      title: "Programa Creadores de Contenido",
      description: "Menú degustación 'Sabores Criollos' disponible para reseñas de influencers verificados."
    },
    items: [
      {
        id: "mb1",
        name: "Empanaditas de Yuca Rellenas de Cangrejo",
        category: "entradas",
        description: "Masa crujiente de yuca de Moca rellena de guiso criollo de cangrejo de Sánchez.",
        priceDOP: 580,
        priceUSD: 9.60,
        dietary: ["tipico_rd", "mariscos"],
        isSignature: true
      },
      {
        id: "mb2",
        name: "Pescado al Coco al Estilo Samaná",
        category: "platos_fuertes",
        description: "Mero fresco bañado en salsa artesanal de leche de coco virgen, pimientos morrones y cilantro fresco con tostones crujientes.",
        priceDOP: 1350,
        priceUSD: 22.50,
        dietary: ["tipico_rd", "mariscos", "sin_gluten"],
        isSignature: true
      },
      {
        id: "mb3",
        name: "Sancocho de 7 Carnes Tradicional",
        category: "platos_fuertes",
        description: "El plato bandera festivo dominicano con víveres seleccionados, aguacate fresco y arroz blanco con concón.",
        priceDOP: 1200,
        priceUSD: 20.00,
        dietary: ["tipico_rd", "sin_gluten"],
        isSignature: true
      },
      {
        id: "mb4",
        name: "Dulce de Leche Cortada con Limón",
        category: "postres",
        description: "Receta campesina tradicional con raspadura de limón verde y canela en rama.",
        priceDOP: 380,
        priceUSD: 6.30,
        dietary: ["tipico_rd", "vegetariano"]
      }
    ]
  }
};

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
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [activeMenuViewer, setActiveMenuViewer] = useState<RestaurantMenuData | null>(null);
  const featuredRestaurants = getFeaturedRestaurants().slice(0, 4);

  const openMenuForSlug = (slug: string, fallbackName: string) => {
    if (sampleMenus[slug]) {
      setActiveMenuViewer(sampleMenus[slug]);
    } else {
      // Create a fallback dynamic menu
      setActiveMenuViewer({
        restaurantId: slug,
        restaurantName: fallbackName,
        cuisine: "Cocina Caribeña Contemporánea",
        location: "República Dominicana",
        menuMode: "both",
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        pdfFileName: `Carta_${fallbackName.replace(/\s+/g, '_')}.pdf`,
        pdfFileSize: "2.1 MB",
        currencyDefault: "DOP",
        items: [
          {
            id: "fb1",
            name: "Mofongo de Camarones al Ajillo",
            category: "platos_fuertes",
            description: "Plátano verde majado con chicharrón crocante y ajo, coronado con camarones en salsa criolla.",
            priceDOP: 980,
            priceUSD: 16.30,
            dietary: ["tipico_rd", "mariscos"],
            isSignature: true
          },
          {
            id: "fb2",
            name: "Tostones Rellenos de Chivo Liniero",
            category: "entradas",
            description: "Canasticas de plátano verde rellenas de carne de chivo estofada con finas hierbas.",
            priceDOP: 620,
            priceUSD: 10.30,
            dietary: ["tipico_rd"],
            isSignature: true
          }
        ]
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Guía Gastronómica de República Dominicana - Sabores, Cartas y Rutas Culinarias"
        description="Descubre los platos típicos dominicanos, menús oficiales en PDF o platos detallados, rutas gastronómicas y da de alta tu restaurante."
        keywords="gastronomia dominicana, comida dominicana, restaurantes punta cana, mangu dominicano, platos tipicos republica dominicana, cartas restaurantes rd"
        image="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=630&fit=crop"
        type="website"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Guía Gastronómica de República Dominicana",
          description: "Rutas gastronómicas, recetas criollas y restaurantes destacados en República Dominicana.",
          url: "https://descubrerd.com/guia-gastronomica",
          publisher: {
            "@type": "Organization",
            name: "Descubre República Dominicana",
            url: "https://descubrerd.com"
          }
        }}
      />
      <Header />

      {/* Hero */}
      <section className="relative py-24">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&h=600&fit=crop"
            alt="Gastronomía Dominicana"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/60" />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge className="bg-primary/20 text-primary border-primary/30">
                <BookOpen className="h-3 w-3 mr-1" /> Guía Gastronómica
              </Badge>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                ⭐ Portal Restaurantes & Menús Digitales
              </Badge>
            </div>

            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
              Sabores de República Dominicana
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Tu portal gastronómico interactivo: consulta menús en PDF o platos detallados, rutas del cacao y marisco, o afilia tu restaurante para patrocinar regalos y rifas.
            </p>
            <div className="flex flex-wrap gap-4 justify-center items-center">
              <Link to="/restaurante">
                <Button size="lg" className="gap-2 shadow-lg">
                  <Utensils className="h-4 w-4" />
                  Ver todos los restaurantes
                </Button>
              </Link>
              
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => setIsRegisterModalOpen(true)}
                className="gap-2 bg-background/80 hover:bg-background border-primary/40 text-primary hover:text-primary font-semibold shadow-sm"
              >
                <PlusCircle className="h-4 w-4 text-primary" />
                Dar de Alta Mi Restaurante
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Recommendations */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Recomendaciones Rápidas y Cartas Activas
              </h2>
              <p className="text-xs text-muted-foreground">
                Haz clic para ver la carta gastronómica verificada en PDF o formato detallado
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {recommendations.map((rec) => (
              <button
                key={rec.slug}
                onClick={() => openMenuForSlug(rec.slug, rec.name)}
                className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/50 hover:shadow-md transition-all group flex flex-col items-center justify-between"
              >
                <span className="text-2xl block mb-2">{rec.emoji}</span>
                <p className="text-xs text-muted-foreground mb-1">{rec.label}</p>
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{rec.name}</p>
                <div className="mt-2 text-[11px] text-primary/80 group-hover:text-primary flex items-center gap-1 font-medium">
                  <FileText className="w-3 h-3" /> Ver Carta
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Restaurants with Direct Menu Access */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-primary mb-2">
                <Crown className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">Selección del Editor & Cartas Verificadas</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Restaurantes Destacados
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsRegisterModalOpen(true)}
                className="hidden sm:flex gap-1.5 border-primary/40 text-primary"
              >
                <PlusCircle className="h-4 w-4" /> Registrar Local
              </Button>
              <Link to="/restaurante">
                <Button variant="outline" size="sm" className="gap-1">
                  Ver todos <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
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
                <div className="block bg-card rounded-xl overflow-hidden border border-border group hover:shadow-lg transition-all h-full flex flex-col justify-between">
                  <div>
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-medium">{r.rating}</span>
                      </div>
                      <Badge className="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur-sm text-white text-[10px]">
                        Carta Disponible
                      </Badge>
                    </div>
                    <div className="p-4">
                      <Badge variant="secondary" className="mb-2 text-xs">{r.priceRange} · {r.cuisineType[0]}</Badge>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{r.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" /> {r.destinationName}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex gap-2">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="w-full text-xs gap-1.5"
                      onClick={() => openMenuForSlug(r.slug, r.name)}
                    >
                      <Utensils className="w-3.5 h-3.5" />
                      Consultar Menú
                    </Button>
                    <Link to={`/restaurante/${r.slug}`} className="w-auto">
                      <Button variant="outline" size="sm" className="text-xs px-2.5" title="Ver ficha completa">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
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

      {/* Panorama High Impact Gastronomy Ad */}
      <section className="py-4">
        <div className="container mx-auto px-4 max-w-6xl">
          <PanoramaAd showDemo />
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

      {/* Restaurant Registration Wizard Modal */}
      <RestaurantRegistrationModal
        open={isRegisterModalOpen}
        onOpenChange={setIsRegisterModalOpen}
        onRestaurantRegistered={(data) => {
          console.log('Restaurante registrado exitosamente:', data);
        }}
      />

      {/* Restaurant Menu Viewer Modal */}
      {activeMenuViewer && (
        <RestaurantMenuViewer
          menuData={activeMenuViewer}
          isOpen={Boolean(activeMenuViewer)}
          onClose={() => setActiveMenuViewer(null)}
        />
      )}

      <Footer />
    </div>
  );
}

