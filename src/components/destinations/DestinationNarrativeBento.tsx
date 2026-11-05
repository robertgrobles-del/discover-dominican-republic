import React, { useState } from "react";
import { 
  Sparkles, 
  Compass, 
  MapPin, 
  Clock, 
  Camera, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  CheckCircle2, 
  ChevronRight,
  Sun,
  Flame,
  Award,
  Layers,
  Heart
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { activateOnKey } from "@/lib/a11y";
export interface CuratedPhoto {
  url: string;
  caption: string;
  tag?: string;
  highlight?: boolean;
}

export interface DayStep {
  timeOfDay: "Mañana" | "Tarde" | "Noche";
  title: string;
  activity: string;
  iconName?: string;
}

export interface DestinationNarrativeBentoProps {
  destinationName: string;
  provinceName?: string;
  quote?: string;
  quoteAuthor?: string;
  storyText?: string;
  photos?: CuratedPhoto[];
  dayTimeline?: DayStep[];
  quickFacts?: { label: string; value: string; icon?: string }[];
  audioAtmosphereUrl?: string;
  onOpenGallery?: () => void;
}

export const DestinationNarrativeBento: React.FC<DestinationNarrativeBentoProps> = ({
  destinationName,
  provinceName = "República Dominicana",
  quote = "Donde las olas turquesas susurran historias taínas y cada atardecer pinta el cielo de oro caribeño.",
  quoteAuthor = "Guía Local RNT Certificado",
  storyText = `Explorar ${destinationName} trasciende la típica postal turística. Es perderse entre callejones con olor a café tostado, sentir la brisa salina que acaricia palmeras centenarias y conectar con la calidez indómita de su gente. Cada rincón resguarda un secreto natural que solo quien viaja con calma llega a descifrar.`,
  photos = [
    {
      url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&fit=crop",
      caption: "Arrecifes vírgenes & aguas cristalinas",
      tag: "Spot Secreto",
      highlight: true
    },
    {
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&fit=crop",
      caption: "Arenas doradas al caer la tarde",
      tag: "Atardecer Mágico"
    },
    {
      url: "https://images.unsplash.com/photo-1510414842594-a61752afb394?w=800&fit=crop",
      caption: "Senderismo ecológico y manglares",
      tag: "Ecoturismo"
    }
  ],
  dayTimeline = [
    { timeOfDay: "Mañana", title: "Primer chapuzón & Café Criollo", activity: "Navegación temprana en lancha y desayuno de mangú en el muelle." },
    { timeOfDay: "Tarde", title: "Pescado al coco & Caminata botánica", activity: "Degustación gastronómica frente al mar y descanso bajo cocoteros." },
    { timeOfDay: "Noche", title: "Sinfonía marina & Ron artesanal", activity: "Cena a la luz de las antorchas con ritmo de percusión y bachata suave." }
  ],
  quickFacts = [
    { label: "Puntos de interés", value: "18+ Secretos" },
    { label: "Vibra dominante", value: "100% Caribe Viva" },
    { label: "Acceso RNT", value: "Verificado Oficial" }
  ],
  onOpenGallery
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const toggleAtmosphereAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  return (
    <section className="relative z-20 -mt-10 md:-mt-16 container mx-auto px-4 mb-16">
      {/* Bento Grid Principal */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6">
        
        {/* ========================================================
            CARD 1: STORYTELLING EDITORIAL & CITA (Col 1-7)
           ======================================================== */}
        <div className="md:col-span-7 bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-primary/40 transition-all duration-300">
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            {/* Header del bloque */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <Badge variant="outline" className="px-3 py-1 rounded-full bg-primary/10 text-primary border-primary/20 gap-1.5 font-medium text-xs">
                <Compass className="h-3.5 w-3.5" />
                El Alma de {destinationName}
              </Badge>

              {/* Botón de audio ambiental simulado */}
              <button
                onClick={toggleAtmosphereAudio}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-muted/80 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all border border-border"
                title="Sonido ambiente del destino"
              >
                {isPlayingAudio ? (
                  <>
                    <Volume2 className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">Brisa marina sonando...</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-3.5 w-3.5" />
                    <span>Ambiente sonoro</span>
                  </>
                )}
              </button>
            </div>

            {/* Cita inspiracional destacada */}
            <blockquote className="my-3 font-display italic text-lg md:text-xl text-foreground/90 border-l-4 border-primary pl-4 py-1 leading-snug">
              “{quote}”
              <footer className="text-xs font-sans not-italic text-muted-foreground mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                {quoteAuthor} • {provinceName}
              </footer>
            </blockquote>

            {/* Narrativa descriptiva fuera de lo común */}
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed mt-4">
              {storyText}
            </p>
          </div>

          {/* Micro-píldoras de datos curiosos en la base */}
          <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-border/60">
            {quickFacts.map((fact, idx) => (
              <div key={idx} className="bg-muted/40 rounded-2xl p-3 text-center border border-border/40">
                <span className="text-xs text-muted-foreground block truncate">{fact.label}</span>
                <span className="text-sm md:text-base font-bold text-foreground font-display block mt-0.5 truncate">
                  {fact.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================
            CARD 2: FOTO PRINCIPAL CON TILT & BADGE FLOTANTE (Col 8-12)
           ======================================================== */}
        <div className="md:col-span-5 relative group">
          <div className="h-full min-h-[340px] md:min-h-[420px] rounded-3xl overflow-hidden relative shadow-2xl border border-border">
            <img 
              src={photos[0]?.url || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&fit=crop"} 
              alt={photos[0]?.caption || destinationName} 
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Badge de Spot Secreto */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 text-xs px-3 py-1 font-medium">
                <Sparkles className="h-3 w-3 mr-1 text-amber-300" />
                {photos[0]?.tag || "Imperdible"}
              </Badge>
            </div>

            {/* Pie de foto y botón interactivo */}
            <div className="absolute bottom-5 left-5 right-5 z-10">
              <p className="text-white font-display font-semibold text-base md:text-lg mb-2">
                {photos[0]?.caption}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/80 font-mono flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-rose-400" /> {destinationName}
                </span>
                
                <Button 
                  size="sm" 
                  variant="secondary"
                  className="rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border-white/20 text-xs gap-1.5 shadow-lg"
                  onClick={onOpenGallery}
                >
                  <Camera className="h-3.5 w-3.5" />
                  Ver 360° / Galería
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            CARD 3: TICKET DE ABORDAJE RD / PASAPORTE DIGITAL (Col 1-5)
           ======================================================== */}
        <div className="md:col-span-5 bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          {/* Muesca visual de ticket */}
          <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-background border border-primary/20" />
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xs uppercase font-mono tracking-widest text-primary font-bold">
                Tarjeta de Aventura Quisqueya
              </span>
              <Badge variant="outline" className="border-primary/40 text-primary text-3xs font-mono">
                RD-GO • CERTIFIED
              </Badge>
            </div>

            <h4 className="font-display font-bold text-xl text-foreground mb-1">
              {destinationName} Explorer Ticket
            </h4>
            <p className="text-xs text-muted-foreground mb-4">
              Pase digital con beneficios en tours, guías locales registrados y gastronomía típica.
            </p>

            {/* Código de barra estético y detalles */}
            <div className="bg-background/80 rounded-2xl p-4 border border-border/80 flex items-center justify-between">
              <div>
                <span className="text-3xs text-muted-foreground block uppercase font-mono">Destino Oficial</span>
                <span className="text-sm font-bold text-foreground">{destinationName}</span>
              </div>
              <div className="text-right">
                <span className="text-3xs text-muted-foreground block uppercase font-mono">Región</span>
                <span className="text-sm font-semibold text-primary">{provinceName}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-dashed border-border/80 flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-amber-500" /> 150 Puntos Pasaporte RD
            </span>
            <Button size="sm" className="rounded-full gap-1 text-xs px-4">
              Activar Sello <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* ========================================================
            CARD 4: TIMELINE DE "UN DÍA PERFECTO AQUÍ" (Col 6-12)
           ======================================================== */}
        <div className="md:col-span-7 bg-card border border-border/80 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-muted-foreground font-semibold">
                Itinerario Esencial
              </span>
              <h4 className="font-display font-bold text-xl text-foreground">
                Un Día Perfecto en {destinationName}
              </h4>
            </div>
            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-xs">
              <Sun className="h-3.5 w-3.5 mr-1" /> Ritmo Caribeño
            </Badge>
          </div>

          {/* Pasos del día */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-2">
            {dayTimeline.map((step, idx) => (
              <div 
                key={idx} 
                className="bg-muted/40 hover:bg-muted/70 transition-colors rounded-2xl p-4 border border-border/50 flex flex-col justify-between"
              >
                <div>
                  <span className="text-2xs font-mono font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10 inline-block mb-2">
                    {step.timeOfDay}
                  </span>
                  <h5 className="font-bold text-sm text-foreground mb-1 leading-snug">
                    {step.title}
                  </h5>
                </div>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
                  {step.activity}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 mt-2 border-t border-border/60">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" /> Diseñado con guías locales certificados por MITUR
            </span>
            <span className="text-xs font-semibold text-primary hover:underline cursor-pointer flex items-center gap-0.5">
              Personalizar ruta <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </div>

      </div>

      {/* ========================================================
          CARRUSEL INFERIOR TÁCTIL (MÓVIL & TABLET PEAKING CARDS)
         ======================================================== */}
      {photos.length > 1 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3 px-1">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase font-mono tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Postales y Rincones Exclusivos
            </h4>
            <span className="text-xs text-muted-foreground md:hidden">Desliza para explorar →</span>
          </div>

          {/* Scroll horizontal con tarjetas 'peeking' en móvil */}
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x snap-mandatory">
            {photos.slice(1).map((photo, i) => (
              <div role="button" tabIndex={0} onKeyDown={activateOnKey} 
                key={i}
                className="snap-start shrink-0 w-[260px] sm:w-[300px] md:w-[340px] rounded-2xl overflow-hidden border border-border shadow-md group relative cursor-pointer"
                onClick={() => setSelectedImage(photo.url)}
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img 
                    src={photo.url} 
                    alt={photo.caption} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  
                  {photo.tag && (
                    <Badge className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-white border-white/20 text-3xs">
                      {photo.tag}
                    </Badge>
                  )}

                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-xs font-medium text-white line-clamp-1">{photo.caption}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal para ver imagen ampliada */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-3xl p-1 bg-black/95 border-none">
            <img src={selectedImage} alt="Detalle" className="w-full max-h-[80vh] object-contain rounded-lg" />
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
};
export default DestinationNarrativeBento;
