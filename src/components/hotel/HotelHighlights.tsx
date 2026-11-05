import { Waves, UtensilsCrossed, Disc, HeartPulse, Sun, Baby } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HotelHighlightsProps {
  poolsCount: number;
  restaurantsCount: number;
  barsCount: number;
  spaName?: string;
  nightlifeSummary?: string;
  /** Pasadía y política de niños: vienen de la ficha del hotel en el backend (`extras`). Sin dato, no se muestran. */
  dayPass?: { price?: string; hours?: string; includes?: string };
  kidsPolicy?: { title?: string; text?: string };
  /** Sin backend se muestran los textos de muestra. */
  fromBackend?: boolean;
}

const SAMPLE_DAY_PASS = { price: "$85 USD (~RD$ 5,100) / persona", hours: "09:30 AM - 06:00 PM", includes: "Incluye acceso total a piscinas, playa privada, almuerzo buffet ilimitado, bebidas nacionales y toallas." };
const SAMPLE_KIDS = { title: "Hasta 2 Niños Gratis (0 - 5 años)", text: "Niños de 6 a 12 años con 50% de descuento compartiendo habitación. Acceso sin costo al Kids Club y parque acuático infantil." };

export function HotelHighlights({
  poolsCount,
  restaurantsCount,
  barsCount,
  spaName,
  nightlifeSummary,
  dayPass,
  kidsPolicy,
  fromBackend,
}: HotelHighlightsProps) {
  const pass = fromBackend ? dayPass : SAMPLE_DAY_PASS;
  const kids = fromBackend ? kidsPolicy : SAMPLE_KIDS;
  return (
    <section>
      {/* 4 Feature Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-card/60 backdrop-blur-md p-4 rounded-2xl border border-border shadow-sm">
        {poolsCount > 0 && <div className="flex items-center gap-3 p-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Waves className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Zonas Acuáticas</p>
            <p className="text-sm font-bold text-foreground">{poolsCount} {poolsCount === 1 ? "Piscina" : "Piscinas"}</p>
          </div>
        </div>}

        {restaurantsCount + barsCount > 0 && <div className="flex items-center gap-3 p-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Gastronomía & Bares</p>
            <p className="text-sm font-bold text-foreground">
              {restaurantsCount} Restaurantes • {barsCount} Bares
            </p>
          </div>
        </div>}

        {nightlifeSummary && <div className="flex items-center gap-3 p-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Disc className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Vida Nocturna</p>
            <p className="text-sm font-bold text-foreground">{nightlifeSummary}</p>
          </div>
        </div>}

        {spaName && <div className="flex items-center gap-3 p-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <HeartPulse className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Spa & Bienestar</p>
            <p className="text-sm font-bold text-foreground">{spaName}</p>
          </div>
        </div>}
      </div>

      {/* Day Pass & Family Policy Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {pass?.price && <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <Sun className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-500 text-slate-950 font-bold text-3xs uppercase">
                Pasadía / Day Pass Disponible
              </Badge>
              <span className="text-xs font-bold text-foreground">{pass.price}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {pass.hours && <>Horario: <strong>{pass.hours}</strong>. </>}{pass.includes}
            </p>
          </div>
        </div>}

        {kids?.title && <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
            <Baby className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold text-3xs uppercase">
                Política Familiar & Niños
              </Badge>
              <span className="text-xs font-bold text-foreground">{kids.title}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{kids.text}</p>
          </div>
        </div>}
      </div>
    </section>
  );
}
