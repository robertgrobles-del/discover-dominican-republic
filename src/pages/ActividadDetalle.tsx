import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Clock, Star, MapPin, Shield, Users, Share2, 
  ArrowLeft, Check, Compass, Sparkles, Tag, AlertCircle 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FavoriteButton } from "@/components/FavoriteButton";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { staticActivities } from "@/data/activitiesData";
import { ActivityBookingCard } from "@/components/activities/ActivityBookingCard";
import { ActivityItineraryTimeline } from "@/components/activities/ActivityItineraryTimeline";
import { DetailInclusionsCard } from "@/components/detail/DetailInclusionsCard";
import { DetailFloatingBar } from "@/components/detail/DetailFloatingBar";
import { CommentSection } from "@/components/comments/CommentSection";

export function ActividadDetalle() {
  const { slug } = useParams<{ slug: string }>();

  // Load static activity data
  const staticActivity = staticActivities[slug || ""];

  // Fetch activity from DB if it's dynamic
  const { data: dbActivity, isLoading: loadingDb } = useQuery({
    queryKey: ["db-activity", slug],
    queryFn: async () => {
      if (!slug || staticActivity) return null;
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
      let query = supabase.from("experiences").select("*");
      if (isUUID) {
        query = query.eq("id", slug);
      } else {
        query = query.eq("slug", slug);
      }
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug && !staticActivity,
  });

  const isLoading = !staticActivity && loadingDb;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Render Loader
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <p className="text-muted-foreground text-sm font-medium">Cargando detalles de actividad...</p>
        </div>
      </div>
    );
  }

  // Activity not found
  if (!staticActivity && !dbActivity) {
    return (
      <PageTransition>
        <Header />
        <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Actividad No Encontrada</h1>
          <p className="text-muted-foreground mb-6 max-w-md">Lo sentimos, la actividad solicitada no se encuentra disponible o ha sido desactivada.</p>
          <Link to="/actividades">
            <Button className="rounded-xl">Ver Catálogo de Actividades</Button>
          </Link>
        </div>
        <Footer />
      </PageTransition>
    );
  }

  // Format activity object uniformly
  const activity = staticActivity ? {
    id: slug || "",
    nombre: staticActivity.nombre,
    categoria: staticActivity.categoria,
    imagen: staticActivity.imagen,
    rating: staticActivity.rating,
    duracion: staticActivity.duracion,
    precio: staticActivity.precio,
    descripcion: staticActivity.descripcion,
    ubicacion: staticActivity.ubicacion,
    dificultad: staticActivity.dificultad,
    recomendaciones: staticActivity.recomendaciones,
    incluye: staticActivity.incluye,
    galeria: staticActivity.galeria,
    itinerario: staticActivity.itinerario,
    isStatic: true
  } : {
    id: dbActivity!.id,
    nombre: dbActivity!.name,
    categoria: dbActivity!.category || "Aventura",
    imagen: dbActivity!.image_url || "/placeholder.svg",
    rating: dbActivity!.rating || 4.5,
    duracion: dbActivity!.duration || "3 horas",
    precio: typeof dbActivity!.price_range === 'number' ? dbActivity!.price_range : parseFloat((dbActivity!.price_range || "45").replace(/[^0-9.]/g, "")) || 45,
    descripcion: dbActivity!.description || "Una fantástica actividad turística en República Dominicana.",
    ubicacion: (dbActivity as any)?.location || dbActivity!.destination_id || "República Dominicana",
    dificultad: dbActivity!.difficulty || "Moderado",
    recomendaciones: [
      "Llevar protector solar amigable con el arrecife.",
      "Mantenerse hidratado durante el trayecto.",
      "Seguir las instrucciones del guía en todo momento."
    ],
    incluye: [
      "Guía turístico local certificado",
      "Equipo de seguridad obligatorio",
      "Paseo con entradas incluidas"
    ],
    galeria: [dbActivity!.image_url || "/placeholder.svg"],
    itinerario: undefined,
    isStatic: false
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: activity.nombre,
        text: activity.descripcion,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  return (
    <PageTransition>
      <SEOHead
        title={`${activity.nombre} - Actividades en República Dominicana`}
        description={activity.descripcion}
        image={activity.imagen}
      />
      
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />

        {/* Hero Section */}
        <section className="relative h-[65vh] min-h-[480px] flex items-end overflow-hidden">
          <img
            src={activity.imagen}
            alt={activity.nombre}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/50 to-black/20" />
          
          <div className="relative z-10 container mx-auto px-4 pb-12">
            <Link to="/actividades" className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors text-sm font-medium">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Volver a Actividades
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-3xl space-y-2">
                <Badge className="bg-primary text-primary-foreground uppercase font-bold text-xs px-3 py-1">
                  {activity.categoria}
                </Badge>
                <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-md">
                  {activity.nombre}
                </h1>
                <p className="text-white/90 text-base sm:text-lg font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                  {activity.ubicacion}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <FavoriteButton
                  id={activity.id}
                  type="tour"
                  name={activity.nombre}
                  image={activity.imagen}
                  location={activity.ubicacion}
                  variant="button"
                  size="lg"
                  className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20"
                />
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="gap-2 bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" /> Compartir
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Layout */}
        <main className="py-12 container mx-auto px-4 flex-1">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left Column: Description, Inclusions & Timeline (8 cols) */}
            <div className="lg:col-span-8 space-y-10">
              
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-card border border-border rounded-2xl shadow-sm">
                <div className="text-center p-2 border-r border-border last:border-0 sm:border-r">
                  <Clock className="h-5 w-5 text-primary mx-auto mb-1.5" />
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Duración</p>
                  <p className="font-bold text-foreground text-sm">{activity.duracion}</p>
                </div>
                <div className="text-center p-2 border-r border-border last:border-0 sm:border-r">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mx-auto mb-1.5" />
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Valoración</p>
                  <p className="font-bold text-foreground text-sm">{activity.rating} / 5.0</p>
                </div>
                <div className="text-center p-2 border-r border-border last:border-0 sm:border-r">
                  <Compass className="h-5 w-5 text-primary mx-auto mb-1.5" />
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Dificultad</p>
                  <p className="font-bold text-foreground text-sm">{activity.dificultad}</p>
                </div>
                <div className="text-center p-2">
                  <Tag className="h-5 w-5 text-emerald-500 mx-auto mb-1.5" />
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Precio Desde</p>
                  <p className="font-bold text-primary text-sm">${activity.precio} USD</p>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-4 p-6 sm:p-8 bg-card border border-border rounded-3xl shadow-sm">
                <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> Sobre la Actividad
                </h2>
                <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                  {activity.descripcion}
                </p>
              </div>

              {/* Itinerary Timeline */}
              <ActivityItineraryTimeline 
                itinerario={activity.itinerario}
                duracion={activity.duracion}
              />

              {/* Inclusions and Recommendations */}
              <DetailInclusionsCard 
                included={activity.incluye}
                excluded={activity.recomendaciones}
                title="Detalles y Recomendaciones del Tour"
              />

              {/* Gallery */}
              {activity.galeria.length > 0 && (
                <div className="space-y-4">
                  <h2 className="font-display text-2xl font-bold text-foreground">Galería de Imágenes</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {activity.galeria.map((imgSrc, i) => (
                      <motion.div 
                        key={i} 
                        className={`rounded-2xl overflow-hidden shadow-sm border border-border aspect-video ${
                          i === 0 ? "col-span-2 row-span-1 sm:col-span-2 sm:row-span-1" : ""
                        }`}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                      >
                        <img 
                          src={imgSrc} 
                          alt={`${activity.nombre} - Foto ${i + 1}`} 
                          className="w-full h-full object-cover" 
                          loading="lazy" 
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Community Comments & Reviews */}
              <div className="pt-4">
                <CommentSection
                  contentId={activity.id}
                  contentType="activity"
                  title={`Opiniones y Experiencias sobre ${activity.nombre}`}
                />
              </div>

            </div>

            {/* Right Column: Sticky Booking Card (4 cols) */}
            <div className="lg:col-span-4">
              <ActivityBookingCard
                activityName={activity.nombre}
                price={activity.precio}
                duration={activity.duracion}
              />
            </div>

          </div>
        </main>

        {/* Mobile Sticky Floating Bar */}
        <DetailFloatingBar 
          title={activity.nombre}
          price={`$${activity.precio} USD`}
          pricePeriod="/ persona"
          rating={activity.rating}
          ctaText="Reservar Actividad"
          onCtaClick={() => {
            const bookingElement = document.getElementById("booking-date");
            if (bookingElement) {
              bookingElement.scrollIntoView({ behavior: "smooth", block: "center" });
              bookingElement.focus();
            }
          }}
        />

        <Footer />
      </div>
    </PageTransition>
  );
}

export default ActividadDetalle;
