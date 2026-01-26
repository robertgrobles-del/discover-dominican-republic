import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Gift, Star, Trophy, Award, Ticket, Coffee, 
  Hotel, MapPin, ChevronRight, Search, Sparkles,
  Palmtree, UtensilsCrossed, Anchor, Camera
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import { Progress } from "@/components/ui/progress";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import samanaImg from "@/assets/samana.jpg";
import gastronomiImg from "@/assets/gastronomy.jpg";
import heroBeachImg from "@/assets/hero-beach.jpg";

const userStats = {
  name: "Viajero VIP",
  points: 2450,
  level: "Explorador Oro",
  nextLevel: "Platino",
  pointsToNext: 800,
  progress: 75,
};

const categories = [
  { id: "all", label: "Todos", icon: Gift },
  { id: "hotels", label: "Hoteles", icon: Hotel },
  { id: "tours", label: "Aventura & Tours", icon: Anchor },
  { id: "gastronomy", label: "Gastronomía", icon: UtensilsCrossed },
  { id: "vip", label: "VIP", icon: Star },
];

const rewards = [
  {
    id: "coffee-santo-domingo",
    name: "Degustación Café Santo Domingo",
    category: "gastronomy",
    points: 850,
    image: gastronomiImg,
    description: "Experiencia sensorial de café premium en la Zona Colonial. Incluye postre.",
    location: "Santo Domingo",
    popular: true,
  },
  {
    id: "hotel-discount-25",
    name: "25% OFF en Hoteles Seleccionados",
    category: "hotels",
    points: 1200,
    image: puntaCanaImg,
    description: "Descuento válido en más de 50 hoteles asociados en todo el país.",
    location: "Todo RD",
    discount: "-25%",
  },
  {
    id: "whale-watching",
    name: "Tour Avistamiento de Ballenas",
    category: "tours",
    points: 2500,
    image: samanaImg,
    description: "Experiencia inolvidable en la bahía de Samaná. Temporada Enero-Marzo.",
    location: "Samaná",
    featured: true,
  },
  {
    id: "sunset-cruise",
    name: "Crucero al Atardecer",
    category: "tours",
    points: 1800,
    image: heroBeachImg,
    description: "Navegación privada con cena gourmet y champagne incluido.",
    location: "Punta Cana",
  },
  {
    id: "spa-day",
    name: "Día de Spa Premium",
    category: "hotels",
    points: 3200,
    image: puntaCanaImg,
    description: "Tratamiento completo en los mejores spas del Caribe.",
    location: "La Romana",
    vip: true,
  },
  {
    id: "local-cooking",
    name: "Clase de Cocina Dominicana",
    category: "gastronomy",
    points: 650,
    image: gastronomiImg,
    description: "Aprende a preparar La Bandera con un chef local.",
    location: "Santo Domingo",
  },
];

const featuredOffer = {
  title: "Escapada a Samaná",
  description: "2 noches en hotel boutique + avistamiento de ballenas.",
  points: 4500,
  image: samanaImg,
};

export default function ClubRecompensas() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredRewards = rewards.filter((reward) => {
    const matchesCategory = activeCategory === "all" || reward.category === activeCategory;
    const matchesSearch = reward.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          reward.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Section */}
        <section className="bg-card border-b border-border">
          <div className="container mx-auto px-4 lg:px-8 py-8 md:py-12">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              {/* User Greeting & Points */}
              <div className="flex-1 w-full">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2"
                >
                  Hola, {userStats.name} 👋
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-muted-foreground text-lg mb-6"
                >
                  Tienes recompensas increíbles esperando por ti.
                </motion.p>

                <div className="flex gap-4 flex-wrap">
                  {/* Points Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex-1 min-w-[200px] bg-background p-4 rounded-xl border border-border"
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Saldo Actual
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-foreground">
                      {userStats.points.toLocaleString()}{" "}
                      <span className="text-sm font-medium text-muted-foreground">Pts</span>
                    </div>
                  </motion.div>

                  {/* Level Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex-1 min-w-[200px] bg-background p-4 rounded-xl border border-border relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Trophy className="h-16 w-16 text-primary" />
                    </div>
                    <div className="flex items-center gap-3 mb-1">
                      <Award className="h-5 w-5 text-amber-500" />
                      <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Nivel
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-2">{userStats.level}</div>
                    <Progress value={userStats.progress} className="h-1.5 mb-1" />
                    <p className="text-xs text-muted-foreground">
                      Faltan {userStats.pointsToNext} pts para {userStats.nextLevel}
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* Featured Offer */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full lg:w-[450px]"
              >
                <div className="relative rounded-2xl overflow-hidden aspect-[16/9] shadow-lg group cursor-pointer">
                  <img
                    src={featuredOffer.image}
                    alt={featuredOffer.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 text-white">
                    <Badge className="bg-primary text-primary-foreground mb-2">
                      Oferta del Mes
                    </Badge>
                    <h3 className="text-xl font-bold leading-tight mb-1">{featuredOffer.title}</h3>
                    <p className="text-sm text-white/80 mb-3">{featuredOffer.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg">{featuredOffer.points.toLocaleString()} Pts</span>
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border py-4">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              {/* Categories */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={activeCategory === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(cat.id)}
                    className="gap-2 rounded-full whitespace-nowrap"
                  >
                    <cat.icon className="h-4 w-4" />
                    {cat.label}
                  </Button>
                ))}
              </div>

              {/* Search */}
              <div className="w-full md:w-auto md:min-w-[320px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar recompensas (ej. Punta Cana)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Rewards Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRewards.map((reward, index) => (
                <motion.article
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group flex flex-col rounded-xl overflow-hidden bg-card border border-border hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={reward.image}
                      alt={reward.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <Badge className="absolute top-3 left-3 bg-card/90 text-foreground">
                      {categories.find((c) => c.id === reward.category)?.label || "Experiencia"}
                    </Badge>
                    {reward.discount && (
                      <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">
                        {reward.discount}
                      </Badge>
                    )}
                    {reward.vip && (
                      <Badge className="absolute top-3 right-3 bg-amber-500 text-white">
                        VIP
                      </Badge>
                    )}
                    {reward.featured && (
                      <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                        Destacado
                      </Badge>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3" />
                      {reward.location}
                    </div>
                    <h3 className="font-bold text-lg text-foreground leading-tight group-hover:text-primary transition-colors mb-2">
                      {reward.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {reward.description}
                    </p>
                    <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                      <div>
                        <span className="block text-xs text-muted-foreground font-medium">Costo</span>
                        <span className="text-primary font-bold text-xl">
                          {reward.points.toLocaleString()}{" "}
                          <span className="text-sm font-medium text-muted-foreground">Pts</span>
                        </span>
                      </div>
                      <Button size="sm">Canjear</Button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {filteredRewards.length === 0 && (
              <div className="text-center py-12">
                <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No se encontraron recompensas para tu búsqueda.</p>
                <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}>
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="font-display text-2xl font-bold text-foreground text-center mb-12">
              ¿Cómo funciona el Club de Recompensas?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Camera, title: "Explora RD", desc: "Visita destinos, restaurantes y hoteles participantes." },
                { icon: Sparkles, title: "Acumula Puntos", desc: "Gana puntos por cada experiencia y compra verificada." },
                { icon: Gift, title: "Canjea Premios", desc: "Usa tus puntos para recompensas exclusivas." },
              ].map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
