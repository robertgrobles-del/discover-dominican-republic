import { useParams, Link } from "react-router-dom";
import {
  MapPin, Star, Waves, Umbrella, Car, ShieldCheck, Sun,
  Droplets, Wind, Sparkles, Navigation, Heart, Share2,
  ChevronRight, Utensils, Bus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { getBeachBySlug, beaches as allStaticBeaches, type Beach } from "@/data/beaches";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbox } from "@/components/ui/lightbox";
import { useLightbox } from "@/hooks/useLightbox";
import { DetailPageSidebarAd, BillboardAd, MobileStickyFooterAd } from "@/components/promo";
import { CommentSection } from "@/components/comments/CommentSection";
import { toast } from "sonner";
import { getSafeCoverImage } from "@/lib/imageCovers";

import { DetailHeroHeader } from "@/components/detail/DetailHeroHeader";
import { DetailAmenitiesGrid } from "@/components/detail/DetailAmenitiesGrid";
import { DetailLocationMapCard } from "@/components/detail/DetailLocationMapCard";
import { DetailFloatingBar } from "@/components/detail/DetailFloatingBar";
import { BeachConditionsCard } from "@/components/beach/BeachConditionsCard";
import { useState } from "react";

const beachTypeLabels: Record<string, string> = {
  "arena-blanca": "Arena Blanca",
  "arena-dorada": "Arena Dorada",
  virgen: "Virgen / Ecoturismo",
  bahia: "Bahía Tranquila",
  deportiva: "Surf & Deportes Acuáticos",
  urbana: "Urbana con Servicios",
};

interface BeachDbRow {
  image_url?: string;
  short_description?: string;
  beach_type?: string;
  wave_intensity?: string;
  crowd_level?: string;
  access_type?: string;
  sand_type?: string;
  water_color?: string;
  parking_available?: boolean;
  lifeguard_on_duty?: boolean;
  how_to_get_there?: string;
  best_time_to_visit?: string;
  province_slug?: string;
  destination_name?: string;
}

type BeachSource = Partial<Beach> & BeachDbRow;

function useBeachData(slug: string | undefined): { beach: BeachSource | undefined; isLoading: boolean } {
  const staticBeach = slug ? getBeachBySlug(slug) : undefined;
  const { data: dbBeach, isLoading } = useQuery({
    queryKey: ["beach", slug],
    queryFn: async (): Promise<BeachDbRow | undefined> => {
      const { data, error } = await supabase
        .from("beaches")
        .select("*")
        .eq("slug", slug!)
        .eq("is_active", true)
        .single();
      if (error) return undefined;
      return data as BeachDbRow;
    },
    enabled: !staticBeach && !!slug,
  });
  return { beach: staticBeach || dbBeach, isLoading: !staticBeach && isLoading };
}

export default function PlayaDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const { beach: rawBeach, isLoading } = useBeachData(slug);
  const [isSaved, setIsSaved] = useState(false);

  const {
    isOpen: lightboxOpen,
    currentIndex: lightboxIndex,
    open: openLightbox,
    close: closeLightbox,
  } = useLightbox();

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: rawBeach?.name || "Playa en República Dominicana",
          text: rawBeach?.shortDescription || "Descubre esta increíble playa en República Dominicana.",
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  const handleToggleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? "Playa removida de favoritos" : "Playa guardada en favoritos");
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-24">
            <Skeleton className="h-[450px] w-full rounded-3xl mb-8" />
            <Skeleton className="h-10 w-1/2 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  if (!rawBeach) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-32 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Waves className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-4">Playa no encontrada</h1>
            <p className="text-muted-foreground mb-8">
              La playa que buscas no existe o ha sido reubicada en nuestro catálogo.
            </p>
            <Link to="/playas">
              <Button className="rounded-xl">Explorar todas las playas</Button>
            </Link>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  // Normalize data
  const beach = {
    id: rawBeach.id || "",
    name: rawBeach.name || "",
    slug: rawBeach.slug || "",
    description: rawBeach.description || "",
    shortDescription: rawBeach.shortDescription || rawBeach.short_description || "",
    imageUrl: getSafeCoverImage(rawBeach.imageUrl || rawBeach.image_url, "beach", rawBeach.provinceSlug || rawBeach.slug),
    gallery: rawBeach.gallery || [],
    beachType: rawBeach.beachType || rawBeach.beach_type || "arena-blanca",
    waveIntensity: rawBeach.waveIntensity || rawBeach.wave_intensity || "calma",
    crowdLevel: rawBeach.crowdLevel || rawBeach.crowd_level || "media",
    accessType: rawBeach.accessType || rawBeach.access_type || "publico",
    sandType: rawBeach.sandType || rawBeach.sand_type || "Arena blanca fina",
    waterColor: rawBeach.waterColor || rawBeach.water_color || "Turquesa cristalino",
    activities: rawBeach.activities || ["Natación", "Snorkel", "Fotografía", "Caminatas al atardecer"],
    amenities: rawBeach.amenities || ["Sillas y sombrillas", "Restaurantes locales", "Chiringuitos de coco", "Parqueo"],
    parkingAvailable: rawBeach.parkingAvailable ?? rawBeach.parking_available ?? true,
    lifeguardOnDuty: rawBeach.lifeguardOnDuty ?? rawBeach.lifeguard_on_duty ?? false,
    howToGetThere: rawBeach.howToGetThere || rawBeach.how_to_get_there || "Accesible por carretera principal con señalización turística.",
    bestTimeToVisit: rawBeach.bestTimeToVisit || rawBeach.best_time_to_visit || "Diciembre a Mayo (aguas más calmas y menor pluviosidad)",
    province: rawBeach.province || "República Dominicana",
    provinceSlug: rawBeach.provinceSlug || rawBeach.province_slug || "la-altagracia",
    destinationName: rawBeach.destinationName || rawBeach.destination_name || "",
    rating: Number(rawBeach.rating) || 4.9,
    latitude: rawBeach.latitude || 18.5,
    longitude: rawBeach.longitude || -69.0,
  };

  const allImages = [beach.imageUrl, ...(beach.gallery || [])].filter(Boolean);

  const relatedBeaches = allStaticBeaches
    .filter((b) => b.slug !== beach.slug && (b.province === beach.province || b.provinceSlug === beach.provinceSlug))
    .slice(0, 3);

  return (
    <PageTransition>
      <SEOHead
        title={`${beach.name} - Guía de Playa en ${beach.province} | República Dominicana`}
        description={beach.shortDescription || beach.description?.slice(0, 160)}
        keywords={`playa ${beach.name}, ${beach.province}, turismo costa republica dominicana, como llegar ${beach.name}, oleaje, arena blanca`}
      />

      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <Header />

        {/* Hero Header Component */}
        <DetailHeroHeader
          title={beach.name}
          subtitle={beach.shortDescription}
          categoryBadge={beachTypeLabels[beach.beachType] || "Playa Paradisíaca"}
          categoryIcon={<Waves className="h-3.5 w-3.5 text-cyan-400" />}
          breadcrumbs={[
            { label: "Inicio", to: "/" },
            { label: "Playas", to: "/playas" },
            { label: beach.province, to: `/provincia/${beach.provinceSlug}` },
            { label: beach.name },
          ]}
          imageUrl={beach.imageUrl}
          location={`${beach.province}${beach.destinationName ? ` · ${beach.destinationName}` : ""}`}
          rating={beach.rating}
          reviewsCount={124}
          metrics={[
            { label: "Arena", value: beach.sandType, icon: <Sun className="h-3.5 w-3.5 text-amber-400" /> },
            { label: "Agua", value: beach.waterColor, icon: <Droplets className="h-3.5 w-3.5 text-blue-400" /> },
            { label: "Acceso", value: beach.accessType === "publico" ? "Público Libre" : "Controlado", icon: <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> },
          ]}
          isSaved={isSaved}
          onToggleSave={handleToggleSave}
          onShare={handleShare}
        />


        {/* Main Content Layout */}
        <main className="container mx-auto px-4 max-w-7xl py-10">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left Column: 8 cols */}
            <div className="lg:col-span-8 space-y-8">
              {/* Description Card */}
              <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-4">
                <h2 className="font-display font-bold text-xl text-foreground">
                  Sobre {beach.name}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {beach.description || beach.shortDescription}
                </p>
              </div>

              {/* Beach Marine Conditions Component */}
              <BeachConditionsCard
                beachType={beach.beachType}
                waveIntensity={beach.waveIntensity}
                crowdLevel={beach.crowdLevel}
                sandType={beach.sandType}
                waterColor={beach.waterColor}
                lifeguardOnDuty={beach.lifeguardOnDuty}
                bestTimeToVisit={beach.bestTimeToVisit}
              />

              {/* Amenities Grid Component */}
              <DetailAmenitiesGrid
                title="Servicios e Instalaciones en Playa"
                amenities={beach.amenities}
              />

              {/* Location & Maps Component */}
              <DetailLocationMapCard
                venue={beach.name}
                address={beach.howToGetThere}
                province={beach.province}
                coordinates={{ lat: beach.latitude, lng: beach.longitude }}
                parkingNotes={beach.parkingAvailable ? "Área de parqueo disponible cercana a la orilla." : "No cuenta con estacionamiento vigilado."}
                howToGetThereNotes={beach.howToGetThere}
              />

              {/* Community Reviews & Ratings */}
              <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-4">
                <CommentSection
                  targetId={beach.id || beach.slug}
                  targetType="destination"
                  targetName={beach.name}
                />
              </div>
            </div>

            {/* Right Column: 4 cols Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Quick Summary Card */}
              <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4 sticky top-24">
                <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Resumen Rápido de Visita
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-border/60">
                    <span className="text-muted-foreground">Provincia</span>
                    <span className="font-bold text-foreground">{beach.province}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border/60">
                    <span className="text-muted-foreground">Tipo de Arena</span>
                    <span className="font-bold text-foreground">{beach.sandType}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border/60">
                    <span className="text-muted-foreground">Oleaje</span>
                    <span className="font-bold text-foreground capitalize">{beach.waveIntensity}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border/60">
                    <span className="text-muted-foreground">Parqueo</span>
                    <span className="font-bold text-foreground">{beach.parkingAvailable ? "Disponible y Vigilado" : "Borde de carretera"}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border/60">
                    <span className="text-muted-foreground">Acceso de Transporte</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Bus className="h-3 w-3" /> Guagua / Carro estándar
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border/60">
                    <span className="text-muted-foreground">Servicios en Orilla</span>
                    <span className="font-bold text-foreground">Baños, Sombrillas & Comida</span>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${beach.latitude},${beach.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block pt-2"
                >
                  <Button className="w-full rounded-2xl font-bold text-xs h-10 shadow-md gap-1.5">
                    <Navigation className="h-4 w-4" /> Cómo Llegar con GPS
                  </Button>
                </a>
              </div>

              <DetailPageSidebarAd
                category="Playas & Excursiones"
                location={beach.province}
              />
            </div>
          </div>

          {/* Galería Fotográfica al final del contenido principal */}
          {allImages.length > 1 && (
            <section className="mt-14 space-y-6 pt-10 border-t border-border/60">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-2xl font-black text-foreground">
                    Galería Fotográfica de {beach.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Postales en alta definición del oleaje, arena y vistas panorámicas. Haz clic para ampliar.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {allImages.map((img, i) => (
                  <div
                    key={i}
                    className="relative aspect-[4/3] cursor-pointer overflow-hidden bg-muted group rounded-2xl border border-border/70 shadow-xs"
                    onClick={() => openLightbox(i)}
                  >
                    <img
                      src={img}
                      alt={`${beach.name} ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Related Beaches in same region */}
          {relatedBeaches.length > 0 && (
            <section className="mt-14 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-2xl font-black text-foreground">
                    Otras Playas Cercanas en {beach.province}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Completa tu ruta de sol y arena explorando estas costas vecinas.
                  </p>
                </div>
                <Link to="/playas">
                  <Button variant="outline" size="sm" className="rounded-xl text-xs">
                    Ver todas las playas
                  </Button>
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedBeaches.map((rb) => (
                  <Link
                    key={rb.slug}
                    to={`/playa/${rb.slug}`}
                    className="group rounded-3xl overflow-hidden bg-card border border-border hover:border-primary/40 transition-all shadow-sm flex flex-col justify-between"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      <img
                        src={getSafeCoverImage(rb.imageUrl, "beach", rb.slug)}
                        alt={rb.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <Badge className="absolute top-3 left-3 bg-black/60 text-white backdrop-blur-md text-[10px]">
                        {beachTypeLabels[rb.beachType] || rb.beachType}
                      </Badge>
                    </div>
                    <div className="p-5 space-y-1.5">
                      <h4 className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors">
                        {rb.name}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {rb.shortDescription}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Billboard Ad */}
          <div className="mt-14">
            <BillboardAd showDemo />
          </div>
        </main>

        <Footer />

        {/* Mobile Sticky Action Bar */}
        <DetailFloatingBar
          primaryActionLabel="Navegar con GPS"
          primaryActionIcon={<Navigation className="h-4 w-4" />}
          onPrimaryAction={() => {
            window.open(`https://www.google.com/maps/search/?api=1&query=${beach.latitude},${beach.longitude}`, "_blank");
          }}
          isSaved={isSaved}
          onToggleSave={handleToggleSave}
          onShare={handleShare}
        />

        <MobileStickyFooterAd />
      </div>

      {/* Lightbox Modal */}
      <Lightbox
        images={allImages}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={closeLightbox}
      />
    </PageTransition>
  );
}
