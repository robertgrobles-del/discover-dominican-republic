import React, { useState } from "react";
import { Clock, Compass, MapPin, Sparkles, Coffee, Utensils, Waves, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface QuickPlan {
  id: string;
  tiempo: "1-2 horas" | "2-3 horas" | "3-4 horas";
  momento: "Mañana" | "Tarde" | "Noche";
  titulo: string;
  categoria: string;
  zona: string;
  descripcion: string;
  pasos: string[];
  icono: any;
}

export function QuickThreeHoursSection() {
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<"todos" | "Mañana" | "Tarde" | "Noche">("todos");

  const plans: QuickPlan[] = [
    {
      id: "cafe-colonial",
      tiempo: "2-3 horas",
      momento: "Mañana",
      titulo: "Despertar Cafetero & Callejones Coloniales",
      categoria: "Cultura & Café",
      zona: "Santo Domingo",
      descripcion: "Aprovecha la brisa matutina antes del sol fuerte con un café de especialidad dominicano y un recorrido a pie.",
      pasos: [
        "Café de especialidad en Calle Las Mercedes o Plaza España.",
        "Caminata por Calle Las Damas y Fortaleza Ozama.",
        "Fotografía en el Callejón de los Curas y Parque Colón."
      ],
      icono: Coffee
    },
    {
      id: "snorkeling-bavaro",
      tiempo: "2-3 horas",
      momento: "Mañana",
      titulo: "Escape Express a Arrecife & Piscina Natural",
      categoria: "Acuático & Sol",
      zona: "Punta Cana / Bávaro",
      descripcion: "Si tienes la mañana libre antes de tu check-out, este plan acuático rápido te renueva por completo.",
      pasos: [
        "Salida en lancha rápida desde la playa de Bávaro.",
        "40 min de snorkel guiado en la barrera de coral protegida.",
        "Parada de agua hasta la cintura en piscina natural con coco fresco."
      ],
      icono: Waves
    },
    {
      id: "atardecer-gastronomico",
      tiempo: "3-4 horas",
      momento: "Tarde",
      titulo: "Atardecer Dorado & Pescado Frito Criollo",
      categoria: "Gastronomía Costera",
      zona: "Boca Chica / Las Terrenas / Bayahíbe",
      descripcion: "Conecta con el ambiente popular al caer la tarde, con los pies en la arena y música suave.",
      pasos: [
        "Llegada 4:30 PM para ver caer el sol sobre el horizonte.",
        "Chillo o mero frito con tostones recién hechos y aguacate criollo.",
        "Caminata por el malecón con agua de coco o jugo de chinola natural."
      ],
      icono: Utensils
    },
    {
      id: "son-ruinas",
      tiempo: "2-3 horas",
      momento: "Noche",
      titulo: "Noche Bohemia, Son & Cerveza Bien Fría",
      categoria: "Vida Nocturna & Música",
      zona: "Zona Colonial / Santiago",
      descripcion: "La verdadera vida nocturna no es solo discoteca: es baile tradicional al aire libre entre piedras centenarias.",
      pasos: [
        "Encuentro en las Ruinas de San Francisco o Monumento de Santiago.",
        "Disfrute de música en vivo, son tradicional y bachata clásica.",
        "Tragos de ron dominicano o cerveza 'vestida de novia'."
      ],
      icono: Sparkles
    }
  ];

  const filtered = selectedTimeOfDay === "todos"
    ? plans
    : plans.filter(p => p.momento === selectedTimeOfDay);

  return (
    <section className="py-12 bg-gradient-to-b from-card/30 to-background border-y border-border/60">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-semibold">
                <Clock className="w-3.5 h-3.5 mr-1" /> Mejora 721 · Planes Espontáneos
              </Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              "Tengo 3 Horas Libres": ¿Qué puedo hacer ya mismo?
            </h2>
            <p className="text-muted-foreground text-sm mt-1 max-w-xl">
              Micro-itinerarios diseñados para escalas, tardes libres de conferencias o descansos entre tours sin tener que planificar todo el día.
            </p>
          </div>

          {/* Time of day pill selectors */}
          <div className="flex bg-muted/60 p-1.5 rounded-2xl border border-border/60 gap-1">
            {(["todos", "Mañana", "Tarde", "Noche"] as const).map((momento) => (
              <button
                key={momento}
                onClick={() => setSelectedTimeOfDay(momento)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedTimeOfDay === momento
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {momento === "todos" ? "Cualquier Hora" : momento}
              </button>
            ))}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((plan) => {
            const Icon = plan.icono;
            return (
              <div
                key={plan.id}
                className="bg-card border border-border/80 rounded-3xl p-5 hover:border-primary/50 transition-all hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                      {plan.tiempo}
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-primary" /> {plan.zona}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-xl bg-muted/60 flex items-center justify-center text-primary shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">{plan.momento} · {plan.categoria}</span>
                  </div>

                  <h3 className="font-display font-bold text-base text-foreground mb-2 leading-snug">
                    {plan.titulo}
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    {plan.descripcion}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/50 space-y-2">
                  <p className="text-[11px] font-bold text-foreground/90 uppercase tracking-wider">
                    Paso a paso express:
                  </p>
                  <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                    {plan.pasos.map((paso, pidx) => (
                      <li key={pidx} className="flex items-start gap-1.5">
                        <span className="font-mono text-primary font-bold text-[10px] shrink-0">{pidx + 1}.</span>
                        <span>{paso}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
