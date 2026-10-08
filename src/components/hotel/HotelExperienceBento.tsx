import React, { useState } from "react";
import { 
  Sparkles, 
  Eye, 
  ShieldCheck, 
  Clock, 
  Coffee, 
  Waves, 
  Utensils, 
  Wifi, 
  Car, 
  Wine, 
  ExternalLink, 
  ChevronRight,
  Maximize2,
  Calendar,
  Compass
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface HotelExperienceBentoProps {
  hotelName: string;
  tour360Url?: string;
  images: string[];
  guestTimeline?: { time: string; title: string; desc: string; icon?: string }[];
  ecoGuidelines?: string[];
  dayPassPrice?: number;
}

export const HotelExperienceBento: React.FC<HotelExperienceBentoProps> = ({
  hotelName,
  tour360Url,
  images = [],
  guestTimeline = [
    { time: "07:30 AM", title: "Amanecer Caribeño & Desayuno Buffet", desc: "Frutas tropicales, café de Jarabacoa y mangú con los tres golpes frente al mar." },
    { time: "11:00 AM", title: "Piscina Infinity & Coctelería de Autor", desc: "Snacks ligeros, coco frío natural y música ambient lounge en las cabañas privadas." },
    { time: "04:30 PM", title: "Paseo en Catamarán o Paddle Board", desc: "Deportes acuáticos incluidos en arrecife protegido con guía salvavidas." },
    { time: "08:00 PM", title: "Cena a la Carta & Show de Ritmos Vivos", desc: "Gastronomía gourmet dominicana con maridaje de rones y noche de música tradicional." }
  ],
  ecoGuidelines = [
    "Energía solar en áreas comunes",
    "Tratamiento y reutilización de agua para jardines",
    "Plásticos de un solo uso 100% eliminados",
    "Apoyo directo a pescadores y agricultores locales"
  ],
  dayPassPrice = 75
}) => {
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);

  const heroImage = images[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&fit=crop";
  const secondaryImage = images[1] || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&fit=crop";

  return (
    <section className="my-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* ========================================================
            CARD 1: EXPERIENCIA 360° / VISTA VIRTUAL O FOTO DESTACADA (Col 1-7)
           ======================================================== */}
        <div className="md:col-span-7 bg-card rounded-3xl overflow-hidden border border-border shadow-md relative min-h-[380px] group flex flex-col justify-end p-6 md:p-8">
          <img 
            src={heroImage} 
            alt={hotelName} 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

          <div className="relative z-10 max-w-xl">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-primary text-primary-foreground border-none text-xs px-3 py-1 font-semibold flex items-center gap-1.5 shadow-sm">
                <Sparkles className="h-3.5 w-3.5" /> Recorrido Inmersivo
              </Badge>
              <Badge variant="outline" className="bg-black/40 backdrop-blur-md text-white border-white/20 text-xs">
                Certificación MITUR
              </Badge>
            </div>

            <h3 className="font-display font-black text-2xl md:text-3xl text-white mb-2 leading-tight">
              Vive {hotelName} desde adentro
            </h3>
            <p className="text-white/80 text-xs md:text-sm line-clamp-2 mb-4 leading-relaxed">
              Explora las suites, jardines tropicales, piscinas estilo laguna y acceso directo a la playa de arena coralina.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button 
                onClick={() => setIsTourModalOpen(true)}
                className="rounded-full text-xs gap-2 font-bold shadow-lg bg-white text-slate-900 hover:bg-white/90"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                Explorar Recorrido Virtual 360°
              </Button>

              <span className="text-xs text-white/70 font-mono flex items-center gap-1">
                <Eye className="h-3.5 w-3.5 text-primary" /> Visualización interactiva
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            CARD 2: COMPROMISO ECO & DAY PASS EXCLUSIVO (Col 8-12)
           ======================================================== */}
        <div className="md:col-span-5 flex flex-col justify-between gap-5">
          
          {/* Pase de Día (Day Pass) */}
          <div className="bg-gradient-to-br from-amber-500/10 via-card to-card border border-amber-500/30 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                  Sin Necesidad de Estadía
                </span>
                <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 text-[10px]">
                  Pase Todo Incluido
                </Badge>
              </div>

              <h4 className="font-display font-bold text-lg text-foreground mb-1">
                Day Pass & Acceso Club de Playa
              </h4>
              <p className="text-xs text-muted-foreground mb-4">
                Disfruta de piscinas, buffet gastronómico, barra libre y camastros de 9:00 AM a 6:00 PM.
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div>
                <span className="text-[10px] text-muted-foreground block font-mono">Tarifa por persona</span>
                <span className="text-lg font-extrabold text-foreground font-display">US$ {dayPassPrice}</span>
              </div>
              <Button size="sm" variant="outline" className="rounded-full text-xs font-semibold">
                Consultar Cupo
              </Button>
            </div>
          </div>

          {/* Sostenibilidad y Prácticas Verdes */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex-1 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase font-mono flex items-center gap-1.5 mb-2">
                <ShieldCheck className="h-4 w-4" /> Turismo Sostenible
              </span>
              <h4 className="font-display font-bold text-base text-foreground mb-3">
                Iniciativas Verdes del Complejo
              </h4>

              <ul className="space-y-2">
                {ecoGuidelines.slice(0, 3).map((guide, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>{guide}</span>
                  </li>
                ))}
              </ul>
            </div>

            <span className="text-[11px] font-mono text-muted-foreground block pt-3 border-t border-border mt-3">
              🌱 Avalado por estándares ambientales de hotelería dominicana
            </span>
          </div>

        </div>

        {/* ========================================================
            CARD 3: UN DÍA TÍPICO DE HUÉSPED (TIMELINE DE EXPERIENCIA) (Col 1-12)
           ======================================================== */}
        <div className="md:col-span-12 bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
                Cronograma Sugerido
              </span>
              <h4 className="font-display font-bold text-xl text-foreground">
                Un Día Inolvidable en {hotelName}
              </h4>
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-primary" /> Horarios de amenidades incluidos en tu tarifa
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {guestTimeline.map((item, idx) => (
              <div 
                key={idx}
                className="bg-muted/40 hover:bg-muted/70 transition-colors rounded-2xl p-4 border border-border/60 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-mono font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/10 inline-block mb-2">
                    {item.time}
                  </span>
                  <h5 className="font-bold text-sm text-foreground mb-1 leading-snug">
                    {item.title}
                  </h5>
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modal para Visualización 360° o Galería Inmersiva */}
      <Dialog open={isTourModalOpen} onOpenChange={setIsTourModalOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none rounded-3xl">
          <DialogHeader className="p-4 bg-card border-b border-border">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Recorrido Virtual 360° • {hotelName}
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full relative bg-slate-950 flex items-center justify-center">
            {tour360Url ? (
              <iframe 
                src={tour360Url} 
                title="Tour 360" 
                className="w-full h-full border-none"
                allowFullScreen 
              />
            ) : (
              <div className="text-center p-8 space-y-3">
                <img 
                  src={secondaryImage} 
                  alt={hotelName} 
                  className="w-full h-64 object-cover rounded-2xl opacity-80" 
                />
                <p className="text-xs text-white/80 font-mono">
                  Simulación panorámica de alta definición disponible para este complejo.
                </p>
                <Button size="sm" onClick={() => setIsTourModalOpen(false)} className="rounded-full text-xs">
                  Cerrar Visualizador
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
export default HotelExperienceBento;
