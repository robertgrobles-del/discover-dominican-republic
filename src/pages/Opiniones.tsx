import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Star, MessageSquare, ThumbsUp, Share2,
  CheckCircle, User, Users, Heart, Briefcase,
  ChevronDown, MapPin, Loader2
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageTransition } from "@/components/PageTransition";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import samanaImg from "@/assets/samana.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";

interface Review {
  id: string;
  author_name: string;
  verified: boolean;
  rating: number;
  created_at: string;
  traveler_type: "solo" | "couple" | "family" | "business";
  location: string;
  category: string;
  title: string;
  content: string;
  images?: string[];
  helpful_count: number;
  user_id: string;
}

// Sample reviews for initial display
const sampleReviews: Review[] = [
  {
    id: "sample-1",
    author_name: "Sofia M.",
    verified: true,
    rating: 5,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    traveler_type: "solo",
    location: "Samaná",
    category: "Playas Paradisiacas",
    title: "Experiencia que cambió mi vida en Samaná",
    content: "Las playas de Las Terrenas superaron todas mis expectativas. El agua cristalina, la arena suave y la tranquilidad del lugar me hicieron sentir en el paraíso. Los locales son increíblemente amables y la comida es deliciosa. Definitivamente regresaré.",
    images: [samanaImg],
    helpful_count: 24,
    user_id: "",
  },
  {
    id: "sample-2",
    author_name: "Carlos R.",
    verified: true,
    rating: 5,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    traveler_type: "couple",
    location: "Punta Cana",
    category: "Tours de Aventura",
    title: "El mejor tour de snorkel que hemos hecho",
    content: "Reservamos el tour de snorkel en la Isla Saona y fue espectacular. El guía conocía todos los mejores spots y vimos una variedad increíble de peces tropicales. El almuerzo incluido en la playa fue un plus increíble.",
    images: [puntaCanaImg],
    helpful_count: 18,
    user_id: "",
  },
  {
    id: "sample-3",
    author_name: "María L.",
    verified: true,
    rating: 4,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    traveler_type: "family",
    location: "Santo Domingo",
    category: "Gastronomía",
    title: "Un viaje culinario por la Zona Colonial",
    content: "Hicimos el tour gastronómico por la Zona Colonial y probamos de todo: mofongo, la bandera, dulces típicos... Todo estaba delicioso. El guía nos explicó la historia detrás de cada plato. Muy recomendado para familias.",
    images: [santoDomingoImg],
    helpful_count: 32,
    user_id: "",
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

const locations = ["Samaná", "Punta Cana", "Santo Domingo", "Puerto Plata", "La Romana", "Bayahíbe"];

const sortOptions = ["Más Recientes", "Mejor Valorados", "Con Fotos"];

function StarRating({ rating, interactive = false, onRate }: { rating: number; interactive?: boolean; onRate?: (r: number) => void }) {
  const [hovered, setHovered] = useState(0);
  
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onRate?.(star)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              star <= (hovered || rating) ? "fill-amber-400 text-amber-400" : "text-muted"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semana${diffDays >= 14 ? 's' : ''}`;
  return date.toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ReviewCard({ review }: { review: Review }) {
  const TravelerIcon = travelerTypes.find((t) => t.id === review.traveler_type)?.icon || User;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card p-6 rounded-2xl border border-border hover:border-primary/30 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="size-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            {review.verified && (
              <div className="absolute -bottom-1 -right-1 bg-card rounded-full p-0.5">
                <CheckCircle className="h-4 w-4 text-primary fill-primary" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground">{review.author_name}</h3>
              {review.verified && (
                <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                  Viajero Verificado
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span>{formatDate(review.created_at)}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <TravelerIcon className="h-3 w-3" />
                {travelerTypes.find((t) => t.id === review.traveler_type)?.label}
              </span>
            </div>
          </div>
        </div>
        <StarRating rating={review.rating} />
      </div>

      <div className="flex items-center gap-3 mb-3">
        <Badge variant="outline" className="gap-1">
          <MapPin className="h-3 w-3" />
          {review.location}
        </Badge>
        <Badge variant="secondary">{review.category}</Badge>
      </div>

      <h4 className="font-semibold text-foreground mb-2">{review.title}</h4>
      <p className="text-muted-foreground text-sm leading-relaxed mb-4">
        {review.content}
      </p>

      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-4">
          {review.images.map((img, i) => (
            <div key={i} className="w-24 h-24 rounded-lg overflow-hidden">
              <img src={img} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 pt-4 border-t border-border">
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <ThumbsUp className="h-4 w-4" />
          Útil ({review.helpful_count})
        </Button>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          Responder
        </Button>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground ml-auto">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.article>
  );
}

export default function Opiniones() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>(sampleReviews);
  const [loading, setLoading] = useState(true);
  const [selectedTravelerTypes, setSelectedTravelerTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Más Recientes");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    rating: 0,
    traveler_type: "" as "solo" | "couple" | "family" | "business" | "",
    location: "",
    category: "",
  });

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data && data.length > 0) {
      setReviews(data as Review[]);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Inicia sesión",
        description: "Debes iniciar sesión para escribir una reseña.",
      });
      return;
    }

    if (!formData.rating || !formData.traveler_type || !formData.location || !formData.category) {
      toast({
        variant: "destructive",
        title: "Campos incompletos",
        description: "Por favor completa todos los campos requeridos.",
      });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      author_name: user.email?.split("@")[0] || "Usuario",
      verified: true,
      rating: formData.rating,
      traveler_type: formData.traveler_type,
      location: formData.location,
      category: formData.category,
      title: formData.title,
      content: formData.content,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo publicar la reseña. Intenta de nuevo.",
      });
    } else {
      toast({
        title: "¡Gracias!",
        description: "Tu reseña ha sido publicada exitosamente.",
      });
      setDialogOpen(false);
      setFormData({ title: "", content: "", rating: 0, traveler_type: "", location: "", category: "" });
      loadReviews();
    }

    setSubmitting(false);
  }

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

  const filteredReviews = reviews.filter((review) => {
    if (selectedTravelerTypes.length > 0 && !selectedTravelerTypes.includes(review.traveler_type)) {
      return false;
    }
    if (selectedCategories.length > 0 && !selectedCategories.includes(review.category)) {
      return false;
    }
    return true;
  });

  return (
    <PageTransition>
      <SEOHead
        title="Opiniones y Experiencias Reales"
        description="Lee reseñas verificadas de viajeros que visitaron República Dominicana. Comparte tu experiencia y ayuda a otros a planificar su viaje perfecto."
        keywords="opiniones, reseñas, viajeros, República Dominicana, experiencias, turismo"
      />
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
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Escribir Reseña
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Comparte tu Experiencia</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Tu calificación *</Label>
                      <StarRating
                        rating={formData.rating}
                        interactive
                        onRate={(r) => setFormData((prev) => ({ ...prev, rating: r }))}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tipo de viaje *</Label>
                        <Select
                          value={formData.traveler_type}
                          onValueChange={(v) => setFormData((prev) => ({ ...prev, traveler_type: v as any }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                          <SelectContent>
                            {travelerTypes.map((t) => (
                              <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Destino *</Label>
                        <Select
                          value={formData.location}
                          onValueChange={(v) => setFormData((prev) => ({ ...prev, location: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((loc) => (
                              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Categoría *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(v) => setFormData((prev) => ({ ...prev, category: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryFilters.map((c) => (
                            <SelectItem key={c.label} value={c.label}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Título de tu reseña *</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Ej: Una experiencia inolvidable en Samaná"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tu experiencia *</Label>
                      <Textarea
                        value={formData.content}
                        onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                        placeholder="Cuéntanos los detalles de tu viaje..."
                        rows={4}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={submitting || !user}>
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Publicando...
                        </>
                      ) : !user ? (
                        "Inicia sesión para publicar"
                      ) : (
                        "Publicar Reseña"
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
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

              <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-card rounded-full shadow-sm text-primary">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">100% Verificado</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Solo permitimos reseñas de usuarios registrados y verificados.
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            {/* Reviews Feed */}
            <section className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  Últimas Reseñas <span className="text-muted-foreground text-lg font-normal ml-1">({filteredReviews.length})</span>
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

              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}

              {!loading && filteredReviews.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No se encontraron reseñas con los filtros seleccionados.</p>
                </div>
              )}

              {filteredReviews.length > 0 && (
                <Button variant="outline" className="w-full mt-8">
                  Cargar más reseñas
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              )}
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
