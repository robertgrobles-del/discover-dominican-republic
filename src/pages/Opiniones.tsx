import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Star, MessageSquare, ThumbsUp, Share2, Filter,
  CheckCircle, User, Users, Heart, Briefcase, Camera,
  ChevronDown, Search, MapPin, Calendar
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageTransition } from "@/components/PageTransition";
import { Checkbox } from "@/components/ui/checkbox";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import samanaImg from "@/assets/samana.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";

interface Review {
  id: string;
  author: string;
  avatar?: string;
  verified: boolean;
  rating: number;
  date: string;
  travelerType: "solo" | "couple" | "family" | "business";
  location: string;
  category: string;
  title: string;
  content: string;
  images?: string[];
  helpful: number;
  replies: number;
}

const reviews: Review[] = [
  {
    id: "1",
    author: "Sofia M.",
    verified: true,
    rating: 5,
    date: "Hace 2 días",
    travelerType: "solo",
    location: "Samaná",
    category: "Playas Paradisiacas",
    title: "Experiencia que cambió mi vida en Samaná",
    content: "Las playas de Las Terrenas superaron todas mis expectativas. El agua cristalina, la arena suave y la tranquilidad del lugar me hicieron sentir en el paraíso. Los locales son increíblemente amables y la comida es deliciosa. Definitivamente regresaré.",
    images: [samanaImg],
    helpful: 24,
    replies: 5,
  },
  {
    id: "2",
    author: "Carlos R.",
    verified: true,
    rating: 5,
    date: "Hace 5 días",
    travelerType: "couple",
    location: "Punta Cana",
    category: "Tours de Aventura",
    title: "El mejor tour de snorkel que hemos hecho",
    content: "Reservamos el tour de snorkel en la Isla Saona y fue espectacular. El guía conocía todos los mejores spots y vimos una variedad increíble de peces tropicales. El almuerzo incluido en la playa fue un plus increíble.",
    images: [puntaCanaImg],
    helpful: 18,
    replies: 3,
  },
  {
    id: "3",
    author: "María L.",
    verified: true,
    rating: 4,
    date: "Hace 1 semana",
    travelerType: "family",
    location: "Santo Domingo",
    category: "Gastronomía",
    title: "Un viaje culinario por la Zona Colonial",
    content: "Hicimos el tour gastronómico por la Zona Colonial y probamos de todo: mofongo, la bandera, dulces típicos... Todo estaba delicioso. El guía nos explicó la historia detrás de cada plato. Muy recomendado para familias.",
    images: [santoDomingoImg],
    helpful: 32,
    replies: 8,
  },
];

const travelerTypes = [
  { id: "solo", label: "Solo", icon: User },
  { id: "couple", label: "Pareja", icon: Heart },
  { id: "family", label: "Familia", icon: Users },
  { id: "business", label: "Negocios", icon: Briefcase },
];

const categoryFilters = [
  { label: "Playas Paradisiacas", count: 124 },
  { label: "Tours de Aventura", count: 86 },
  { label: "Gastronomía", count: 52 },
  { label: "Vida Nocturna", count: 30 },
];

const sortOptions = ["Más Recientes", "Mejor Valorados", "Con Fotos"];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 ${
            star <= rating ? "fill-amber-400 text-amber-400" : "text-muted"
          }`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const TravelerIcon = travelerTypes.find((t) => t.id === review.travelerType)?.icon || User;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card p-6 rounded-2xl border border-border hover:border-primary/30 transition-all group"
    >
      {/* User Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="size-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
              {review.avatar ? (
                <img src={review.avatar} alt={review.author} className="w-full h-full object-cover" />
              ) : (
                <User className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            {review.verified && (
              <div className="absolute -bottom-1 -right-1 bg-card rounded-full p-0.5">
                <CheckCircle className="h-4 w-4 text-primary fill-primary" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground">{review.author}</h3>
              {review.verified && (
                <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                  Viajero Verificado
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span>{review.date}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <TravelerIcon className="h-3 w-3" />
                {travelerTypes.find((t) => t.id === review.travelerType)?.label}
              </span>
            </div>
          </div>
        </div>
        <StarRating rating={review.rating} />
      </div>

      {/* Location & Category */}
      <div className="flex items-center gap-3 mb-3">
        <Badge variant="outline" className="gap-1">
          <MapPin className="h-3 w-3" />
          {review.location}
        </Badge>
        <Badge variant="secondary">{review.category}</Badge>
      </div>

      {/* Content */}
      <h4 className="font-semibold text-foreground mb-2">{review.title}</h4>
      <p className="text-muted-foreground text-sm leading-relaxed mb-4">
        {review.content}
      </p>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-4">
          {review.images.map((img, i) => (
            <div key={i} className="w-24 h-24 rounded-lg overflow-hidden">
              <img src={img} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-border">
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <ThumbsUp className="h-4 w-4" />
          Útil ({review.helpful})
        </Button>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          Responder ({review.replies})
        </Button>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground ml-auto">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.article>
  );
}

export default function Opiniones() {
  const [selectedTravelerTypes, setSelectedTravelerTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Más Recientes");

  const toggleTravelerType = (id: string) => {
    setSelectedTravelerTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const toggleCategory = (label: string) => {
    setSelectedCategories((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    );
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="bg-card pb-8 pt-10">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex flex-col gap-2 max-w-2xl">
                <div className="flex items-center gap-2 text-primary font-medium text-sm mb-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>Comunidad Verificada</span>
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                  Opiniones y Experiencias Reales
                </h1>
                <p className="text-muted-foreground text-lg mt-1">
                  Descubre la República Dominicana a través de los ojos de viajeros como tú. 100% transparente.
                </p>
              </div>
              <Button className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Escribir Reseña
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="container mx-auto px-4 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full lg:w-72 flex-shrink-0 space-y-8">
              <div className="bg-card p-6 rounded-2xl border border-border sticky top-24">
                <h3 className="font-bold text-lg mb-4 text-foreground">Filtrar por</h3>

                {/* Traveler Type */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                    Tipo de Viajero
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {travelerTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => toggleTravelerType(type.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedTravelerTypes.includes(type.id)
                            ? "bg-primary/10 text-primary ring-1 ring-primary/50"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                    Categoría
                  </h4>
                  <div className="space-y-2">
                    {categoryFilters.map((cat) => (
                      <label
                        key={cat.label}
                        className="flex items-center gap-3 cursor-pointer p-2 hover:bg-muted/50 rounded-lg transition-colors"
                      >
                        <Checkbox
                          checked={selectedCategories.includes(cat.label)}
                          onCheckedChange={() => toggleCategory(cat.label)}
                        />
                        <span className="text-sm font-medium text-foreground flex-1">{cat.label}</span>
                        <span className="text-xs text-muted-foreground">{cat.count}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedTravelerTypes([]);
                    setSelectedCategories([]);
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>

              {/* Trust Signal */}
              <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-card rounded-full shadow-sm text-primary">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">100% Verificado</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Solo permitimos reseñas de usuarios que han completado una reserva o verificado su ubicación por GPS.
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            {/* Reviews Feed */}
            <section className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  Últimas Reseñas <span className="text-muted-foreground text-lg font-normal ml-1">(458)</span>
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground hidden sm:block">Ordenar por:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-card border border-border text-sm font-medium rounded-lg py-2 pl-3 pr-8"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>

              <Button variant="outline" className="w-full mt-8">
                Cargar más reseñas
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
