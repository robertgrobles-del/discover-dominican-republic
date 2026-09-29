import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Star, MessageSquare, ThumbsUp, Share2,
  CheckCircle, User, Users, Heart, Briefcase,
  ChevronDown, MapPin
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
  videoUrl?: string;
  video_url?: string;
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

import { ReviewCard, ReviewItem, travelerTypes as importedTravelerTypes } from "@/components/reviews/ReviewCard";
import { StarRating, formatDate } from "@/components/reviews/StarRating";
import { ReviewsSidebar, CategoryFilterItem } from "@/components/reviews/ReviewsSidebar";
import { CreateReviewDialog } from "@/components/reviews/CreateReviewDialog";

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

  const [isRecording, setIsRecording] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<any | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setVideoPreviewUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };
      
      setMediaStream(stream);
      setMediaRecorder(recorder);
      
      // Assign source stream to video element
      setTimeout(() => {
        const videoElement = document.getElementById("camera-preview") as HTMLVideoElement;
        if (videoElement) {
          videoElement.srcObject = stream;
        }
      }, 300);

      recorder.start();
      setIsRecording(true);
      toast({ title: "Grabación Iniciada", description: "La cámara está grabando tu reseña (máx. 8 segundos)." });
      
      // Auto-stop after 8 seconds
      setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop();
          setIsRecording(false);
          toast({ title: "Grabación Completada", description: "Tu video de 8 segundos está listo." });
        }
      }, 8000);
      
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Error", description: "No se pudo acceder a la cámara o micrófono." });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setIsRecording(false);
      toast({ title: "Grabación Detenida", description: "Tu video se ha procesado con éxito." });
    }
  };
  
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

    const authorDisplayName = (user.user_metadata?.display_name as string | undefined)?.slice(0, 60) || "Viajero";

    const insertPayload: any = {
      user_id: user.id,
      author_name: authorDisplayName,
      verified: false,
      rating: formData.rating,
      traveler_type: formData.traveler_type,
      location: formData.location,
      category: formData.category,
      title: formData.title,
      content: formData.content,
    };

    // If a video review is recorded, save it in the payload (in case column exists)
    if (videoPreviewUrl) {
      insertPayload.video_url = videoPreviewUrl;
    }

    const { error } = await (supabase as any).from("reviews").insert(insertPayload);

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
      
      // Add locally so video preview plays instantly on screen
      const localReview: Review = {
        id: "loc-" + Math.random().toString(36).substring(2, 9),
        author_name: authorDisplayName,
        verified: false,
        rating: formData.rating,
        traveler_type: formData.traveler_type as any,
        location: formData.location,
        category: formData.category,
        title: formData.title,
        content: formData.content,
        videoUrl: videoPreviewUrl || undefined,
        helpful_count: 0,
        user_id: user.id,
        created_at: new Date().toISOString()
      };
      setReviews(prev => [localReview, ...prev]);

      setDialogOpen(false);
      setFormData({ title: "", content: "", rating: 0, traveler_type: "", location: "", category: "" });
      setVideoPreviewUrl(null);
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
              
              <CreateReviewDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                formData={formData}
                onFormDataChange={setFormData}
                locations={locations}
                categoryFilters={categoryFilters}
                onSubmit={handleSubmit}
                submitting={submitting}
                isLoggedIn={!!user}
              />
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="container mx-auto px-4 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <ReviewsSidebar
              travelerTypes={travelerTypes}
              selectedTravelerTypes={selectedTravelerTypes}
              onToggleTravelerType={toggleTravelerType}
              categoryFilters={categoryFilters}
              selectedCategories={selectedCategories}
              onToggleCategory={toggleCategory}
              onClearFilters={() => {
                setSelectedTravelerTypes([]);
                setSelectedCategories([]);
              }}
            />

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
                    title="Ordenar opiniones por"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="space-y-6" aria-busy="true" aria-label="Cargando reseñas">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card p-6 rounded-2xl border border-border">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      </div>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredReviews.map((review) => (
                    <ReviewCard 
                      key={review.id} 
                      review={review}
                      onReply={() => toast({ title: "Responder", description: "La función de respuestas estará disponible pronto." })}
                      onShare={() => { navigator.clipboard.writeText(window.location.href); toast({ title: "Enlace copiado", description: "El enlace ha sido copiado al portapapeles." }); }}
                    />
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
