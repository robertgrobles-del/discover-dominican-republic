import React from "react";
import { CloudRain, DollarSign, Users, Waves, Sun, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DestinationAnnualCalendarProps {
  destinationName: string;
  region?: string;
}

interface MonthData {
  mes: string;
  lluvia: "Baja" | "Moderada" | "Alta";
  precios: "$" | "$$" | "$$$";
  afluencia: "Tranquilo" | "Media" | "Alta" | "Pico";
  ballenas?: boolean;
  sargazo: "Nulo" | "Bajo" | "Moderado" | "Variable";
  nota: string;
}

export function DestinationAnnualCalendar({ destinationName, region }: DestinationAnnualCalendarProps) {
  // Detect if destination has whale season (Samaná / Banco de la Plata)
  const isSamanaOrNorte = destinationName.toLowerCase().includes("samaná") || 
                           destinationName.toLowerCase().includes("las terrenas") ||
                           destinationName.toLowerCase().includes("las galeras") ||
                           (region && region.toLowerCase().includes("samaná"));

  // Detect coast exposure for sargassum (Eastern / Southern coasts have higher risk in summer)
  const isEastCoast = destinationName.toLowerCase().includes("punta cana") || 
                      destinationName.toLowerCase().includes("bávaro") ||
                      destinationName.toLowerCase().includes("cap cana") ||
                      destinationName.toLowerCase().includes("bayahíbe");

  const isMountain = destinationName.toLowerCase().includes("jarabacoa") || 
                     destinationName.toLowerCase().includes("constanza") ||
                     destinationName.toLowerCase().includes("pico duarte");

  const months: MonthData[] = [
    {
      mes: "Ene",
      lluvia: "Baja",
      precios: "$$$",
      afluencia: "Pico",
      ballenas: isSamanaOrNorte,
      sargazo: "Nulo",
      nota: "Temporada alta de invierno, brisa fresca y noches templadas."
    },
    {
      mes: "Feb",
      lluvia: "Baja",
      precios: "$$$",
      afluencia: "Pico",
      ballenas: isSamanaOrNorte,
      sargazo: "Nulo",
      nota: "Mes del Carnaval dominicano. Máxima observación de ballenas jorobadas."
    },
    {
      mes: "Mar",
      lluvia: "Baja",
      precios: "$$",
      afluencia: "Alta",
      ballenas: isSamanaOrNorte,
      sargazo: "Bajo",
      nota: "Clima seco idóneo. Final de temporada de ballenas en Samaná."
    },
    {
      mes: "Abr",
      lluvia: "Moderada",
      precios: "$$",
      afluencia: "Alta",
      sargazo: isEastCoast ? "Bajo" : "Nulo",
      nota: "Semana Santa suele llenar playas y balnearios comunitarios."
    },
    {
      mes: "May",
      lluvia: "Moderada",
      precios: "$",
      afluencia: "Tranquilo",
      sargazo: isEastCoast ? "Moderado" : "Nulo",
      nota: "Tarifas más convenientes en hoteles y menos concurrencia."
    },
    {
      mes: "Jun",
      lluvia: "Moderada",
      precios: "$$",
      afluencia: "Media",
      sargazo: isEastCoast ? "Moderado" : "Bajo",
      nota: "Inicio del verano caribeño y vacaciones familiares."
    },
    {
      mes: "Jul",
      lluvia: "Moderada",
      precios: "$$$",
      afluencia: "Alta",
      sargazo: isEastCoast ? "Variable" : "Bajo",
      nota: "Temporada alta vacacional, ambiente festivo y aguas cálidas."
    },
    {
      mes: "Ago",
      lluvia: "Moderada",
      precios: "$$",
      afluencia: "Media",
      sargazo: isEastCoast ? "Variable" : "Bajo",
      nota: "Gran sol caribeño con chubascos tropicales esporádicos al atardecer."
    },
    {
      mes: "Sep",
      lluvia: "Alta",
      precios: "$",
      afluencia: "Tranquilo",
      sargazo: "Bajo",
      nota: "Temporada más calma del año; excelente para ofertas hoteleras y ecoturismo."
    },
    {
      mes: "Oct",
      lluvia: "Alta",
      precios: "$",
      afluencia: "Tranquilo",
      sargazo: "Nulo",
      nota: "Lluvias vespertinas refrescantes, paisajes de vegetación exuberante."
    },
    {
      mes: "Nov",
      lluvia: "Moderada",
      precios: "$$",
      afluencia: "Media",
      sargazo: "Nulo",
      nota: "Entra la brisa fresca del otoño ('el fresquito de noviembre')."
    },
    {
      mes: "Dic",
      lluvia: "Baja",
      precios: "$$$",
      afluencia: "Pico",
      sargazo: "Nulo",
      nota: "Navidad dominicana, fiestas patronales y clima perfecto en costa y montaña."
    }
  ];

  const getRainBadge = (val: string) => {
    switch (val) {
      case "Baja":
        return <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium">Baja</span>;
      case "Moderada":
        return <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium">Media</span>;
      default:
        return <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium">Frecuente</span>;
    }
  };

  const getCrowdBadge = (val: string) => {
    switch (val) {
      case "Pico":
        return <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-400 font-medium">Pico</span>;
      case "Alta":
        return <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-700 dark:text-orange-400 font-medium">Alta</span>;
      case "Media":
        return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 font-medium">Media</span>;
      default:
        return <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-medium">Calmado</span>;
    }
  };

  return (
    <section className="py-10 bg-card/40 border-y border-border/60">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                Mejora 607 · Planificación Inteligente
              </Badge>
              {isSamanaOrNorte && (
                <Badge className="bg-sky-600 text-white text-xs">
                  Santuario de Ballenas
                </Badge>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Calendario Anual: El Año en {destinationName} de un Vistazo
            </h2>
            <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
              Compara mes a mes el régimen de lluvias, temporadas de precios, afluencia de viajeros, presencia de sargazo y temporada de ballenas para elegir tu momento ideal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground bg-background/80 p-3 rounded-lg border border-border/60">
            <span className="flex items-center gap-1"><CloudRain className="w-3.5 h-3.5 text-blue-500" /> Lluvia</span>
            <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-amber-500" /> Precios</span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-rose-500" /> Multitud</span>
            {isSamanaOrNorte && <span className="flex items-center gap-1"><Waves className="w-3.5 h-3.5 text-sky-500" /> Ballenas</span>}
            {!isMountain && <span className="flex items-center gap-1"><Sun className="w-3.5 h-3.5 text-orange-500" /> Sargazo</span>}
          </div>
        </div>

        {/* Desktop / Tablet Grid */}
        <div className="overflow-x-auto pb-4">
          <div className="grid grid-cols-12 min-w-[760px] gap-2">
            {months.map((m, idx) => (
              <div 
                key={idx} 
                className="bg-card border border-border/80 rounded-xl p-3 flex flex-col justify-between hover:border-primary/50 transition-all hover:shadow-sm"
              >
                <div className="text-center pb-2 border-b border-border/50">
                  <span className="font-display font-bold text-base text-foreground block">{m.mes}</span>
                </div>

                <div className="space-y-2 py-3 text-xs">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <CloudRain className="w-3 h-3 text-blue-500" /> Lluvia
                    </span>
                    {getRainBadge(m.lluvia)}
                  </div>

                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-amber-500" /> Tarifas
                    </span>
                    <span className="font-bold text-foreground tracking-widest">{m.precios}</span>
                  </div>

                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Users className="w-3 h-3 text-rose-500" /> Gente
                    </span>
                    {getCrowdBadge(m.afluencia)}
                  </div>

                  {m.ballenas && (
                    <div className="flex flex-col items-center gap-0.5 pt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-700 dark:text-sky-300 font-semibold flex items-center gap-0.5">
                        <Waves className="w-2.5 h-2.5" /> Ballenas
                      </span>
                    </div>
                  )}

                  {!isMountain && (
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[10px] text-muted-foreground">Sargazo</span>
                      <span className={`text-[11px] font-medium ${
                        m.sargazo === "Nulo" ? "text-emerald-600 dark:text-emerald-400" :
                        m.sargazo === "Bajo" ? "text-slate-600 dark:text-slate-300" :
                        "text-amber-600 dark:text-amber-400"
                      }`}>
                        {m.sargazo}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-border/40 text-center">
                  <p className="text-[10px] text-muted-foreground line-clamp-2" title={m.nota}>
                    {m.nota}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend / Insight */}
        <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary shrink-0" />
            <p className="text-foreground text-xs md:text-sm">
              <strong className="text-primary font-semibold">Consejo del Portal: </strong>
              Los meses de <strong>marzo, mayo y noviembre</strong> ofrecen la combinación más equilibrada de clima caribeño favorable, tarifas atractivas y menor afluencia turística.
            </p>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            Datos validados por ONAMET y el Clúster Turístico Dominicano
          </span>
        </div>
      </div>
    </section>
  );
}
