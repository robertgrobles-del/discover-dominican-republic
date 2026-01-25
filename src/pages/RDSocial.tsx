import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Instagram, 
  Twitter, 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  Camera,
  Play,
  Search,
  TrendingUp,
  Trophy,
  Plus
} from "lucide-react";

const filters = ["Todos", "Instagram", "TikTok", "Punta Cana", "Samaná", "Mejores Fotos"];

const posts = [
  {
    id: 1,
    platform: "instagram",
    user: "@island_girl_22",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop",
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&h=800&fit=crop",
    caption: "Los colores de Punta Cana son irreales 🌴 #LaIslaEnRedes",
    likes: 2400,
    comments: 89,
    location: "Punta Cana"
  },
  {
    id: 2,
    platform: "instagram",
    user: "@foodie_travels",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop",
    image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600&h=400&fit=crop",
    caption: "No hay nada como un desayuno dominicano auténtico. El Mangú es vida. 🍳🥑 #Gastronomía #RD",
    likes: 1256,
    comments: 142,
    location: "Santo Domingo"
  },
  {
    id: 3,
    platform: "instagram",
    user: "@sunset_chaser",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=600&fit=crop",
    caption: "Atardeceres mágicos en Samaná 🌅 #Paradise",
    likes: 3890,
    comments: 234,
    location: "Samaná"
  },
  {
    id: 4,
    platform: "tiktok",
    user: "@adventure_mike",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop",
    image: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&h=800&fit=crop",
    caption: "Salto El Limón 💦🌴 La mejor experiencia! #RepúblicaDominicana",
    likes: 12500,
    comments: 456,
    location: "Samaná",
    isVideo: true
  },
  {
    id: 5,
    platform: "instagram",
    user: "@coastory_buff",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&h=600&fit=crop",
    caption: "Recorriendo la Zona Colonial 🏛️ #SantoDomingo",
    likes: 890,
    comments: 67,
    location: "Santo Domingo"
  },
  {
    id: 6,
    platform: "twitter",
    user: "@caribe_fan",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop",
    caption: "Acabo de reservar mis vuelos para Puerto Plata! ✈️ ¿Alguna recomendación de restaurantes con vista al mar? #RDReady #LaIslaEnRedes",
    likes: 234,
    comments: 45,
    location: "Puerto Plata",
    isText: true
  }
];

const topSpots = [
  { name: "Montaña Redonda", location: "Miches", description: "El famoso columpio sobre las nubes. Vista panorámica 360.", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop" },
  { name: "Bahía de las Águilas", location: "Pedernales", description: "Aguas cristalinas y arena blanca virgen.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&h=100&fit=crop" },
  { name: "Calle de las Damas", location: "Santo Domingo", description: "La calle más antigua de América. Arquitectura colonial.", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=100&h=100&fit=crop" },
  { name: "Hoyo Azul", location: "Punta Cana", description: "Cenote de aguas turquesas profundas escondido en un acantilado.", image: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=100&h=100&fit=crop" },
];

const weeklyWinners = [
  { title: "Samaná Inolvidable", author: "@traveler_jane", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=500&fit=crop", isWinner: true },
  { title: "Colores del Caribe", author: "@photo_master", image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=300&h=300&fit=crop" },
  { title: "Amanecer Colonial", author: "@dawn_hunter", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=300&h=400&fit=crop" },
  { title: "Palmeras al Viento", author: "@island_vibes", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=300&fit=crop" },
];

export default function RDSocial() {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=1080&fit=crop"
              alt="RD Social"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
          </div>
          
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <Badge className="bg-primary/20 text-primary mb-4">
              <span className="animate-pulse mr-2">●</span> EN VIVO AHORA
            </Badge>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-4">
              #LaIslaEnRedes
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Descubre la República Dominicana real a través de los lentes de miles 
              de viajeros. Únete a la conversación y comparte tu aventura.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Button size="lg" className="gap-2">
                <Camera className="h-4 w-4" /> Compartir Historia
              </Button>
              <Button size="lg" variant="outline" className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Play className="h-4 w-4" /> Ver Galería en Vivo
              </Button>
            </div>
            
            <div className="flex justify-center gap-8 text-white">
              <div className="text-center">
                <p className="text-3xl font-bold">1.2M+</p>
                <p className="text-sm text-white/70">Posts Totales</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">450k</p>
                <p className="text-sm text-white/70">Viajeros</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">24/7</p>
                <p className="text-sm text-white/70">Tiempo Real</p>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Filtrar por:</span>
                <div className="flex flex-wrap gap-2">
                  {filters.map((filter) => (
                    <Button
                      key={filter}
                      variant={activeFilter === filter ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveFilter(filter)}
                      className="gap-1"
                    >
                      {filter === "Instagram" && <Instagram className="h-3 w-3" />}
                      {filter === "TikTok" && <Play className="h-3 w-3" />}
                      {filter}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar hashtags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Masonry Feed */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="break-inside-avoid mb-6"
                >
                  <div className="bg-card rounded-xl border border-border overflow-hidden group hover:shadow-xl transition-shadow">
                    {!post.isText && (
                      <div className="relative">
                        <img
                          src={post.image}
                          alt={post.caption}
                          className="w-full object-cover"
                        />
                        {post.isVideo && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                              <Play className="h-6 w-6 text-primary fill-current ml-1" />
                            </div>
                          </div>
                        )}
                        <Badge className="absolute top-3 right-3 bg-card/90">
                          {post.platform === "instagram" && <Instagram className="h-3 w-3" />}
                          {post.platform === "tiktok" && <Play className="h-3 w-3" />}
                          {post.platform === "twitter" && <Twitter className="h-3 w-3" />}
                        </Badge>
                      </div>
                    )}
                    
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={post.avatar}
                          alt={post.user}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-foreground">{post.user}</p>
                          {post.location && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {post.location}
                            </p>
                          )}
                        </div>
                        {post.platform === "twitter" && (
                          <Twitter className="h-4 w-4 text-muted-foreground ml-auto" />
                        )}
                      </div>
                      
                      <p className="text-sm text-foreground mb-3">{post.caption}</p>
                      
                      <div className="flex items-center gap-4 text-muted-foreground text-sm">
                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                          <Heart className="h-4 w-4" /> {(post.likes / 1000).toFixed(1)}k
                        </button>
                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                          <MessageCircle className="h-4 w-4" /> {post.comments}
                        </button>
                        <button className="ml-auto hover:text-primary transition-colors">
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" /> Cargar más
              </Button>
            </div>
          </div>
        </section>

        {/* Ruta de la Foto Perfecta */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-2">
              <Camera className="h-6 w-6 text-primary" />
              <h2 className="font-display text-2xl font-bold text-foreground">
                Ruta de la Foto Perfecta
              </h2>
            </div>
            <p className="text-muted-foreground mb-8">
              Los puntos más "Instagrammables" de la isla, seleccionados por la comunidad.
            </p>
            
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground mb-4">Top 5 Spots</h3>
                {topSpots.map((spot, index) => (
                  <div key={spot.name} className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer">
                    <img
                      src={spot.image}
                      alt={spot.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{spot.name}</p>
                      <p className="text-sm text-primary">{spot.location}</p>
                      <p className="text-xs text-muted-foreground">{spot.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-card rounded-xl border border-border p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Mapa interactivo con ubicaciones</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hall of Fame */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <Badge className="bg-primary/20 text-primary mb-2">HALL OF FAME</Badge>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Mejores Fotos de la Semana
              </h2>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4">
              {weeklyWinners.map((winner, index) => (
                <motion.div
                  key={winner.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative rounded-xl overflow-hidden group cursor-pointer ${
                    index === 0 ? "md:row-span-2" : ""
                  }`}
                >
                  <img
                    src={winner.image}
                    alt={winner.title}
                    className="w-full h-full object-cover aspect-square group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  {winner.isWinner && (
                    <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground gap-1">
                      <Trophy className="h-3 w-3" /> Ganador #1
                    </Badge>
                  )}
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="font-semibold text-white">{winner.title}</p>
                    <p className="text-sm text-white/70">por {winner.author}</p>
                  </div>
                </motion.div>
              ))}
              
              <div className="bg-primary rounded-xl flex items-center justify-center aspect-square cursor-pointer hover:bg-primary/90 transition-colors">
                <div className="text-center text-primary-foreground p-4">
                  <ChevronRight className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-semibold">Ver Galería Completa</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
