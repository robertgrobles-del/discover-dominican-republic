import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin, Star, Droplets, Clock, Shield, ChevronRight,
  Navigation, Thermometer, Users, Mountain, Sparkles,
  TreePine, Waves, Heart, Share2, Compass, ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { getRiverBySlug, rivers as allRivers, type River } from "@/data/rivers";
import { getRioAsRiver } from "@/data/riosData";
import { Lightbox } from "@/components/ui/lightbox";
import { useLightbox } from "@/hooks/useLightbox";
import { DetailPageSidebarAd, BillboardAd, MobileStickyFooterAd } from "@/components/promo";
import { CommentSection } from "@/components/comments/CommentSection";
import { toast } from "sonner";
import { getSafeCoverImage } from "@/lib/imageCovers";

import { DetailHeroHeader } from "@/components/detail/DetailHeroHeader";
import { DetailAmenitiesGrid } from "@/components/detail/DetailAmenitiesGrid";
import { DetailInclusionsCard } from "@/components/detail/DetailInclusionsCard";
import { DetailLocationMapCard } from "@/components/detail/DetailLocationMapCard";
import { DetailFloatingBar } from "@/components/detail/DetailFloatingBar";
import { RiverConditionsCard } from "@/components/river/RiverConditionsCard";

const riverTypeLabels: Record<River["riverType"], string> = {
  montaña: "Río de Montaña",
  cascada: "Cascada / Salto",
  charco: "Charcos & Pozas Cristalinas",
  cañon: "Cañón & Canyoning",
  manantial: "Manantial Subterráneo",
  río: "Río Caudaloso",
};

export default function RioDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const river = slug ? getRiverBySlug(slug) || getRioAsRiver(slug) : undefined;
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
          title: river?.name || "Río en República Dominicana",
          text: river?.shortDescription || "Explora este increíble río o cascada en República Dominicana.",
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
    toast.success(isSaved ? "Río removido de favoritos" : "Río guardado en favoritos");
  };

  if (!river) {
    return (
      <PageTransition>
        <SEOHead
          title="Río no encontrado"
          description="El río o cascada que buscas no existe o ha sido movido. Explora todos los ríos y cascadas de República Dominicana."
        />
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-32 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Droplets className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-4">Río no encontrado</h1>
            <p className="text-muted-foreground mb-8">
              El destino fluvial que buscas no se encuentra disponible.
            </p>
            <Link to="/rios">
              <Button className="rounded-xl">Explorar todos los ríos y cascadas</Button>
            </Link>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  const imageUrl = getSafeCoverImage(river.imageUrl, "waterfall", river.slug);
  const allImages = [imageUrl, ...(river.gallery || [])].filter(Boolean);

  const relatedRivers = allRivers
    .filter((r) => r.slug !== river.slug && (r.province === river.province || r.provinceSlug === river.provinceSlug))
    .slice(0, 3);

  return (
    <PageTransition>
      <SEOHead
        title={`${river.name} - Cascada & Balneario en ${river.province} | Descubre RD`}
        description={river.shortDescription || river.description?.slice(0, 160)}
        keywords={`rio ${river.name}, cascada ${river.name}, ${river.province}, ecoturismo rd, balnearios republica dominicana`}
      />

      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <Header />

        {/* Hero Header Component */}
        <DetailHeroHeader
          title={river.name}
          subtitle={river.shortDescription}
          categoryBadge={riverTypeLabels[river.riverType] || "Río Ecoturístico"}
          categoryIcon={<Droplets className="h-3.5 w-3.5 text-emerald-400" />}
          breadcrumbs={[
            { label: "Inicio", to: "/" },
            { label: "Ríos & Cascadas", to: "/rios" },
            { label: river.province, to: `/provincia/${river.provinceSlug}` },
            { label: river.name },
          ]}
          imageUrl={imageUrl}
          location={`${river.province} · ${river.municipality || "República Dominicana"}`}
          rating={river.rating}
          reviewsCount={98}
          metrics={[
            { label: "Dificultad", value: river.difficulty.toUpperCase(), icon: <Mountain className="h-3.5 w-3.5 text-amber-400" /> },
            { label: "Caminata", value: river.hikingTime || "20 min", icon: <Clock className="h-3.5 w-3.5 text-blue-400" /> },
            { label: "Agua", value: river.waterTemperature === "fria" ? "Fresca de Montaña" : "Templada", icon: <Thermometer className="h-3.5 w-3.5 text-cyan-400" /> },
          ]}
          isSaved={isSaved}
          onToggleSave={handleToggleSave}
          onShare={handleShare}
        />

        {/* Bento Gallery Grid */}
        {allImages.length > 1 && (
          <section className="container mx-auto px-4 max-w-7xl pt-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-3xl overflow-hidden">
              {allImages.slice(0, 4).map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-[4/3] cursor-pointer overflow-hidden bg-muted group rounded-2xl"
                  onClick={() => openLightbox(i)}
                >
                  <img
                    src={img}
                    alt={`${river.name} ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Main Content Layout */}
        <main className="container mx-auto px-4 max-w-7xl py-10">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left Column: 8 cols */}
            <div className="lg:col-span-8 space-y-8">
              {/* Description Card */}
              <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-4">
                <h2 className="font-display font-bold text-xl text-foreground">
                  Sobre {river.name}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {river.description || river.shortDescription}
                </p>
              </div>

              {/* River Freshwater Conditions Component */}
              <RiverConditionsCard
                riverType={river.riverType}
                difficulty={river.difficulty}
                waterTemperature={river.waterTemperature}
                hikingTime={river.hikingTime}
                familyFriendly={river.familyFriendly}
              />

              {/* Inclusions & Safety Checklist */}
              <DetailInclusionsCard
                title="Equipamiento y Qué Llevar al Río"
                included={river.facilities || ["Acceso a senderos naturales", "Zonas de baño y pozas", "Áreas de descanso bajo sombra"]}
                recommendations={[
                  "Calzado cerrado para agua (evita chanclas que se sueltan con la corriente)",
                  "Bolsa impermeable / Dry-bag para teléfonos, llaves y documentos",
                  "Repelente de mosquitos biodegradable y protector solar eco-amigable",
                  "Llevar suficiente agua potable y snacks ligeros de montaña",
                  "Regresar con toda la basura para proteger el ecosistema fluvial"
                ]}
              />

              {/* Amenities Grid Component */}
              <DetailAmenitiesGrid
                title="Servicios en el Entorno Fluvial"
                amenities={river.facilities && river.facilities.length > 0 ? river.facilities : ["Guías locales disponibles", "Estacionamiento rural", "Puestos de comida típica", "Senderos rústicos"]}
              />

              {/* Location & Maps Component */}
              <DetailLocationMapCard
                venue={river.name}
                address={river.howToGetThere}
                province={river.province}
                coordinates={{ lat: river.latitude, lng: river.longitude }}
                parkingNotes={river.parkingAvailable ? "Área de parqueo disponible al inicio del sendero." : "Parqueo en la carretera comunitaria."}
                howToGetThereNotes={river.howToGetThere}
              />

              {/* Community Reviews & Ratings */}
              <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-4">
                <CommentSection
                  targetId={river.id || river.slug}
                  targetType="destination"
                  targetName={river.name}
                />
              </div>
            </div>

            {/* Right Column: 4 cols Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Quick Summary Card */}
              <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4 sticky top-24">
                <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Ficha Técnica del Río
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-border/60">
                    <span className="text-muted-foreground">Provincia</span>
                    <span className="font-bold text-foreground">{river.province}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border/60">
                    <span className="text-muted-foreground">Tipo de Flujo</span>
                    <span className="font-bold text-foreground capitalize">{riverTypeLabels[river.riverType]}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border/60">
                    <span className="text-muted-foreground">Dificultad</span>
                    <span className="font-bold text-foreground capitalize">{river.difficulty}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border/60">
                    <span className="text-muted-foreground">Caminata</span>
                    <span className="font-bold text-foreground">{river.hikingTime || "15-20 min"}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border/60">
                    <span className="text-muted-foreground">Entorno Familiar</span>
                    <span className="font-bold text-foreground">{river.familyFriendly ? "Sí (Familiar)" : "Aventura"}</span>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${river.latitude},${river.longitude}`}
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
                category="Ríos & Cascadas"
                location={river.province}
              />
            </div>
          </div>

          {/* Related Rivers in same region */}
          {relatedRivers.length > 0 && (
            <section className="mt-14 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-2xl font-black text-foreground">
                    Otros Ríos y Cascadas en {river.province}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Continúa tu aventura explorando estas fuentes de agua dulce cercanas.
                  </p>
                </div>
                <Link to="/rios">
                  <Button variant="outline" size="sm" className="rounded-xl text-xs">
                    Ver todos los ríos
                  </Button>
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedRivers.map((rr) => (
                  <Link
                    key={rr.slug}
                    to={`/rio/${rr.slug}`}
                    className="group rounded-3xl overflow-hidden bg-card border border-border hover:border-primary/40 transition-all shadow-sm flex flex-col justify-between"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      <img
                        src={getSafeCoverImage(rr.imageUrl, "waterfall", rr.slug)}
                        alt={rr.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <Badge className="absolute top-3 left-3 bg-black/60 text-white backdrop-blur-md text-[10px]">
                        {riverTypeLabels[rr.riverType] || rr.riverType}
                      </Badge>
                    </div>
                    <div className="p-5 space-y-1.5">
                      <h4 className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors">
                        {rr.name}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {rr.shortDescription}
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
          primaryActionLabel="Navegar al Río"
          primaryActionIcon={<Navigation className="h-4 w-4" />}
          onPrimaryAction={() => {
            window.open(`https://www.google.com/maps/search/?api=1&query=${river.latitude},${river.longitude}`, "_blank");
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
