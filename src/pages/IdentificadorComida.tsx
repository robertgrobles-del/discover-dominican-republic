import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/SEOHead";
import {
  Camera,
  Search,
  Utensils,
  Leaf,
  AlertTriangle,
  Star,
  MapPin,
  ChevronRight,
  Upload,
  Scan,
} from "lucide-react";

const popularDishes = [
  {
    name: "La Bandera",
    description: "El plato nacional: arroz blanco, habichuelas rojas y carne guisada",
    ingredients: ["Arroz", "Habichuelas", "Carne de res", "Sofrito"],
    calories: "650 kcal",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400",
    allergens: [],
  },
  {
    name: "Mangú",
    description: "Puré de plátano verde servido con los tres golpes: huevo, queso y salami",
    ingredients: ["Plátano verde", "Mantequilla", "Cebolla roja"],
    calories: "450 kcal",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
    allergens: ["Lácteos"],
  },
  {
    name: "Sancocho",
    description: "Caldo tradicional con siete carnes y tubérculos dominicanos",
    ingredients: ["Pollo", "Res", "Cerdo", "Yuca", "Ñame", "Plátano"],
    calories: "520 kcal",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400",
    allergens: [],
  },
  {
    name: "Mofongo",
    description: "Plátano verde frito y majado con chicharrón y ajo",
    ingredients: ["Plátano verde", "Chicharrón", "Ajo", "Aceite"],
    calories: "580 kcal",
    image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400",
    allergens: [],
  },
];

const categories = [
  { icon: Utensils, name: "Platos típicos", count: 45 },
  { icon: Leaf, name: "Frutas tropicales", count: 28 },
  { icon: Star, name: "Postres", count: 18 },
];

const recentScans = [
  { name: "Tostones", time: "Hace 2 min", confidence: 98 },
  { name: "Chivo guisado", time: "Hace 15 min", confidence: 95 },
  { name: "Chinola", time: "Hace 1 hora", confidence: 99 },
];

export default function IdentificadorComida() {
  return (
    <PageTransition>
      <SEOHead
        title="Identificador de Comida Dominicana con IA"
        description="Escanea platos dominicanos con tu cámara para descubrir ingredientes, información nutricional y dónde encontrar comidas típicas como la bandera, mangú, sancocho y mofongo."
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-lime-900/90 via-green-900/80 to-emerald-900/90" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920')] bg-cover bg-center opacity-20" />
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <Badge className="mb-4 bg-lime-500/20 text-lime-200 border-lime-400/30">
                <Camera className="h-3 w-3 mr-1" />
                IDENTIFICACIÓN IA
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
                ¿Qué estoy <span className="text-lime-400">comiendo</span>?
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Escanea cualquier plato dominicano y descubre sus ingredientes, 
                origen, información nutricional y dónde encontrarlo.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Scanner Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-card rounded-3xl border border-border p-8"
              >
                <div className="aspect-square rounded-2xl bg-muted/50 border-2 border-dashed border-border flex flex-col items-center justify-center mb-6 cursor-pointer hover:border-primary/50 transition-colors">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Camera className="h-10 w-10 text-primary" />
                  </div>
                  <p className="text-muted-foreground text-center mb-2">
                    Toca para tomar una foto o sube una imagen
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG • Máx 10MB
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1 gap-2" size="lg">
                    <Camera className="h-4 w-4" />
                    Tomar Foto
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2" size="lg">
                    <Upload className="h-4 w-4" />
                    Subir Imagen
                  </Button>
                </div>
              </motion.div>

              {/* Recent Scans */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-8"
              >
                <h3 className="font-display font-bold text-foreground mb-4">Escaneos recientes</h3>
                <div className="space-y-3">
                  {recentScans.map((scan) => (
                    <div
                      key={scan.name}
                      className="flex items-center justify-between bg-card rounded-xl p-4 border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Scan className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{scan.name}</p>
                          <p className="text-xs text-muted-foreground">{scan.time}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-primary border-primary/30">
                        {scan.confidence}% match
                      </Badge>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Explora el <span className="text-gradient">Catálogo</span>
              </h2>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {categories.map((cat) => (
                <Button
                  key={cat.name}
                  variant="outline"
                  className="gap-2 rounded-full"
                >
                  <cat.icon className="h-4 w-4" />
                  {cat.name}
                  <Badge variant="secondary" className="ml-1">{cat.count}</Badge>
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Dishes */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-end justify-between mb-12"
            >
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                  Platos <span className="text-gradient">Populares</span>
                </h2>
                <p className="text-muted-foreground max-w-xl">
                  Los sabores más emblemáticos de la gastronomía dominicana.
                </p>
              </div>
              <Button variant="outline" className="hidden md:flex gap-2">
                Ver todos
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularDishes.map((dish, index) => (
                <motion.div
                  key={dish.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all"
                >
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-background/90 text-foreground backdrop-blur-sm">
                        {dish.calories}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold text-foreground mb-2">{dish.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{dish.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {dish.ingredients.slice(0, 3).map((ing) => (
                        <span key={ing} className="text-xs bg-muted px-2 py-1 rounded-full">
                          {ing}
                        </span>
                      ))}
                      {dish.ingredients.length > 3 && (
                        <span className="text-xs bg-muted px-2 py-1 rounded-full">
                          +{dish.ingredients.length - 3}
                        </span>
                      )}
                    </div>
                    {dish.allergens.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="h-3 w-3" />
                        Contiene: {dish.allergens.join(", ")}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-lime-900 to-green-900">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Utensils className="h-16 w-16 text-lime-300 mx-auto mb-6" />
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                Descubre los sabores de RD
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Escanea, aprende y disfruta. Tu guía gastronómica personal siempre contigo.
              </p>
              <Button size="lg" className="gap-2 bg-white text-lime-900 hover:bg-white/90">
                <Camera className="h-4 w-4" />
                Comenzar a Escanear
              </Button>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
