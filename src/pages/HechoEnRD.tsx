import { motion } from "framer-motion";
import { Gem, Palette, MapPin, ShoppingBag, Award, Heart, ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import samanaImg from "@/assets/samana.jpg";
import puertoPlataImg from "@/assets/puerto-plata.jpg";

const categories = [
  {
    id: "larimar",
    name: "Larimar",
    description: "La piedra azul del Caribe, única en el mundo",
    image: samanaImg,
    icon: Gem,
    products: ["Collares", "Anillos", "Aretes", "Pulseras"],
    origin: "Barahona",
    priceRange: "$30 - $500+",
  },
  {
    id: "ambar",
    name: "Ámbar Dominicano",
    description: "Resina fósil con millones de años de historia",
    image: puertoPlataImg,
    icon: Gem,
    products: ["Joyería", "Piezas de colección", "Artesanías"],
    origin: "Puerto Plata",
    priceRange: "$20 - $1,000+",
  },
  {
    id: "artesanias",
    name: "Artesanías",
    description: "Tradición hecha a mano por artesanos locales",
    image: santoDomingoImg,
    icon: Palette,
    products: ["Muñecas sin rostro", "Cerámicas", "Máscaras de carnaval", "Tejidos"],
    origin: "Todo el país",
    priceRange: "$5 - $200",
  },
];

const culturalRoutes = [
  {
    name: "Ruta del Larimar",
    duration: "1 día",
    stops: ["Minas de Larimar", "Talleres artesanales", "Museo del Larimar"],
    region: "Barahona",
    difficulty: "Moderada",
  },
  {
    name: "Ruta del Ámbar",
    duration: "1 día",
    stops: ["Museo del Ámbar", "Talleres de joyería", "Mercado artesanal"],
    region: "Puerto Plata",
    difficulty: "Fácil",
  },
  {
    name: "Ruta Artesanal del Cibao",
    duration: "2 días",
    stops: ["Moca", "Santiago", "La Vega", "Bonao"],
    region: "Cibao",
    difficulty: "Fácil",
  },
];

const featuredProducts = [
  {
    name: "Collar Larimar Premium",
    artisan: "María Santos",
    location: "Barahona",
    price: "$185",
    rating: 4.9,
    image: samanaImg,
    certified: true,
  },
  {
    name: "Ámbar con Inclusiones",
    artisan: "Pedro Rodríguez",
    location: "Puerto Plata",
    price: "$320",
    rating: 5.0,
    image: puertoPlataImg,
    certified: true,
  },
  {
    name: "Muñeca Limé (sin rostro)",
    artisan: "Colectivo Artesanal",
    location: "Santo Domingo",
    price: "$45",
    rating: 4.8,
    image: santoDomingoImg,
    certified: true,
  },
];

export default function HechoEnRD() {
  return (
    <PageTransition>
      <SEOHead
        title="Hecho en RD - Artesanías y Productos Locales | Turismo RD"
        description="Descubre la riqueza artesanal de República Dominicana: Larimar, Ámbar, artesanías tradicionales y rutas culturales."
        keywords="artesanías, larimar, ámbar, productos dominicanos, souvenirs, República Dominicana"
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-br from-amber-500/10 via-background to-background">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-full mb-6">
                <Award className="h-5 w-5" />
                <span className="font-medium">Hecho en RD</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Tesoros <span className="text-amber-600 dark:text-amber-400">Artesanales</span>
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                Llévate un pedazo de la isla: piedras preciosas únicas, artesanías 
                tradicionales y productos hechos con amor por manos dominicanas.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="font-display text-3xl font-bold mb-4">
                Categorías <span className="text-amber-600 dark:text-amber-400">Principales</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                Explora los productos más emblemáticos de nuestra tierra.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="group"
                >
                  <Card className="overflow-hidden h-full">
                    <div className="relative h-56">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <div className="w-12 h-12 bg-amber-500/20 backdrop-blur rounded-xl flex items-center justify-center">
                          <category.icon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-display text-2xl font-bold mb-2">{category.name}</h3>
                      <p className="text-muted-foreground mb-4">{category.description}</p>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <MapPin className="h-4 w-4" />
                        <span>Origen: {category.origin}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {category.products.map((product) => (
                          <Badge key={product} variant="outline">{product}</Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <span className="text-sm text-muted-foreground">
                          Rango: <span className="font-bold text-foreground">{category.priceRange}</span>
                        </span>
                        <Button variant="ghost" size="sm" className="gap-1">
                          Explorar
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="font-display text-3xl font-bold mb-4">
                Productos <span className="text-amber-600 dark:text-amber-400">Destacados</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                Piezas verificadas y certificadas de artesanos locales.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden group">
                    <div className="relative h-48">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.certified && (
                        <Badge className="absolute top-4 left-4 bg-green-500">
                          <Award className="h-3 w-3 mr-1" />
                          Certificado
                        </Badge>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-4 right-4 bg-white/80 hover:bg-white text-red-500"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold">{product.name}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span className="text-sm font-medium">{product.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Por {product.artisan} • {product.location}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                          {product.price}
                        </span>
                        <Button size="sm" className="gap-2">
                          <ShoppingBag className="h-4 w-4" />
                          Comprar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Cultural Routes */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="font-display text-3xl font-bold mb-4">
                Rutas <span className="text-amber-600 dark:text-amber-400">Culturales</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                Recorre los lugares donde se crea la magia artesanal dominicana.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {culturalRoutes.map((route, index) => (
                <motion.div
                  key={route.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="font-bold">{route.name}</h3>
                        <p className="text-sm text-muted-foreground">{route.region}</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      {route.stops.map((stop, i) => (
                        <div key={stop} className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium">
                            {i + 1}
                          </div>
                          <span>{stop}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm pt-4 border-t border-border">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{route.duration}</Badge>
                        <Badge variant="outline">{route.difficulty}</Badge>
                      </div>
                      <Button variant="ghost" size="sm">Ver ruta</Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-r from-amber-500/20 to-orange-500/20">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                ¿Eres artesano dominicano?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                Únete a nuestra plataforma y muestra tus creaciones al mundo. 
                Certificamos y promovemos el talento local.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-amber-600 hover:bg-amber-700 gap-2">
                  <Award className="h-5 w-5" />
                  Registrar mi negocio
                </Button>
                <Button size="lg" variant="outline">Conocer requisitos</Button>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
