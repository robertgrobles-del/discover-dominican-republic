import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Star, MapPin, Instagram, Globe, Mail, Filter, Search, X } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import samanaImg from "@/assets/samana.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";

const photographers = [
  {
    id: "1",
    name: "María Rodríguez",
    specialty: "Bodas & Eventos",
    location: "Punta Cana",
    rating: 4.9,
    reviews: 127,
    price: "Desde $500",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    portfolio: [puntaCanaImg, samanaImg, santoDomingoImg],
    tags: ["Bodas", "Parejas", "Drone"],
    verified: true,
  },
  {
    id: "2",
    name: "Carlos Méndez",
    specialty: "Paisajes & Naturaleza",
    location: "Jarabacoa",
    rating: 4.8,
    reviews: 89,
    price: "Desde $300",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    portfolio: [samanaImg, puntaCanaImg, santoDomingoImg],
    tags: ["Naturaleza", "Aventura", "Aéreo"],
    verified: true,
  },
  {
    id: "3",
    name: "Ana García",
    specialty: "Retratos & Lifestyle",
    location: "Santo Domingo",
    rating: 4.7,
    reviews: 156,
    price: "Desde $250",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    portfolio: [santoDomingoImg, puntaCanaImg, samanaImg],
    tags: ["Retratos", "Moda", "Comercial"],
    verified: false,
  },
  {
    id: "4",
    name: "Roberto Santos",
    specialty: "Underwater & Buceo",
    location: "Bayahíbe",
    rating: 5.0,
    reviews: 45,
    price: "Desde $400",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    portfolio: [puntaCanaImg, samanaImg, santoDomingoImg],
    tags: ["Submarino", "Vida Marina", "Deportes"],
    verified: true,
  },
];

const categories = ["Todos", "Bodas", "Naturaleza", "Retratos", "Aventura", "Submarino", "Comercial"];

export default function FotografosLocales() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhotographer, setSelectedPhotographer] = useState<typeof photographers[0] | null>(null);

  const filteredPhotographers = photographers.filter(p => {
    const matchesCategory = selectedCategory === "Todos" || p.tags.some(t => t.toLowerCase().includes(selectedCategory.toLowerCase()));
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <PageTransition>
      <SEOHead
        title="CapturaRD - Fotógrafos Locales | Turismo RD"
        description="Encuentra los mejores fotógrafos profesionales de República Dominicana para capturar tus momentos especiales."
        keywords="fotógrafos, República Dominicana, bodas, retratos, fotografía profesional"
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full mb-6">
                <Camera className="h-5 w-5" />
                <span className="font-medium">CapturaRD</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Fotógrafos Locales <span className="text-primary">Profesionales</span>
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                Conecta con los mejores talentos visuales de la isla para capturar tus momentos más especiales.
              </p>

              {/* Search */}
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o ubicación..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg rounded-full"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center gap-4 overflow-x-auto pb-2 hide-scrollbar">
              <Filter className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="flex-shrink-0"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPhotographers.map((photographer, index) => (
                <motion.div
                  key={photographer.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all group cursor-pointer"
                  onClick={() => setSelectedPhotographer(photographer)}
                >
                  {/* Portfolio Preview */}
                  <div className="grid grid-cols-3 gap-0.5 aspect-[3/2]">
                    {photographer.portfolio.slice(0, 3).map((img, i) => (
                      <div key={i} className="relative overflow-hidden">
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      <img
                        src={photographer.image}
                        alt={photographer.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-bold truncate">{photographer.name}</h3>
                          {photographer.verified && (
                            <Badge variant="secondary" className="bg-primary/20 text-primary text-xs">
                              Verificado
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{photographer.specialty}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span className="font-medium">{photographer.rating}</span>
                        <span className="text-muted-foreground">({photographer.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {photographer.location}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {photographer.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                      <span className="font-bold text-primary">{photographer.price}</span>
                      <Button 
                        size="sm"
                        onClick={() => setSelectedPhotographer(photographer)}
                      >
                        Ver Perfil y Cotizar
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Modal */}
        {selectedPhotographer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setSelectedPhotographer(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img
                  src={selectedPhotographer.portfolio[0]}
                  alt=""
                  className="w-full h-64 object-cover"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70"
                  onClick={() => setSelectedPhotographer(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <img
                    src={selectedPhotographer.image}
                    alt={selectedPhotographer.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-primary"
                  />
                  <div>
                    <h2 className="font-display text-2xl font-bold">{selectedPhotographer.name}</h2>
                    <p className="text-muted-foreground">{selectedPhotographer.specialty}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                        <span className="font-bold">{selectedPhotographer.rating}</span>
                        <span className="text-muted-foreground">({selectedPhotographer.reviews} reseñas)</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-5 w-5" />
                        {selectedPhotographer.location}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  {selectedPhotographer.portfolio.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={`https://wa.me/18092214660?text=${encodeURIComponent(`Hola, deseo cotizar una sesión fotográfica con ${selectedPhotographer.name} (${selectedPhotographer.specialty} en ${selectedPhotographer.location}). Tarifa de referencia: ${selectedPhotographer.price}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="gap-2">
                      <Mail className="h-4 w-4" />
                      Solicitar Disponibilidad
                    </Button>
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="gap-2">
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </Button>
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        <Footer />
      </div>
    </PageTransition>
  );
}
