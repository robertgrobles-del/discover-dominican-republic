import { motion } from "framer-motion";
import { Flame, Utensils, Wine } from "lucide-react";

export interface SignatureDishDetail {
  title: string;
  desc: string;
  tags: string[];
  pairing: string;
  priceEst: string;
  spiceLevel?: 0 | 1 | 2 | 3; // 0=suave, 1=toque caribeño, 2=picante medio, 3=picante intenso
  flavorIntensity?: "Suave" | "Equilibrado" | "Intenso & Especiado" | "Fuerte Criollo";
}

interface RestaurantDishesGridProps {
  dishes: SignatureDishDetail[];
}

export function RestaurantDishesGrid({ dishes }: RestaurantDishesGridProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-2xl font-bold text-foreground flex items-center gap-2.5">
          <Flame className="h-6 w-6 text-primary" />
          Platos Estrella y Creaciones del Chef
        </h3>
        <p className="text-sm text-muted-foreground">Especialidades icónicas recomendadas para tu visita</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {dishes.map((dish, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            viewport={{ once: true }}
            className="bg-card rounded-3xl p-6 border border-border hover:border-primary/40 transition-all duration-300 flex flex-col justify-between shadow-xs"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <Utensils className="h-5 w-5" />
                </div>
                <span className="font-black text-foreground text-sm bg-muted/60 px-2.5 py-1 rounded-lg">
                  {dish.priceEst}
                </span>
              </div>
              
              <h4 className="font-display text-lg font-bold text-foreground mb-1.5">{dish.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{dish.desc}</p>

              {/* Mejora 635: Escala visual de intensidad de sabor y picante */}
              <div className="flex items-center justify-between text-xs py-2 px-3 bg-muted/30 rounded-xl mb-3 border border-border/40">
                <span className="text-[11px] text-muted-foreground">
                  Sabor: <strong className="text-foreground">{dish.flavorIntensity || "Equilibrado"}</strong>
                </span>
                <div className="flex items-center gap-1" title={`Nivel de Picante: ${dish.spiceLevel ?? 0} de 3`}>
                  <span className="text-[10px] text-muted-foreground mr-1">Picante:</span>
                  {[1, 2, 3].map((lvl) => {
                    const active = (dish.spiceLevel ?? (dish.title.toLowerCase().includes("chivo") || dish.title.toLowerCase().includes("aguachile") ? 2 : 0)) >= lvl;
                    return (
                      <span
                        key={lvl}
                        className={`text-xs ${active ? "opacity-100 scale-110" : "opacity-25 grayscale"}`}
                      >
                        🌶️
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-border/50">
              <div className="flex flex-wrap gap-1.5">
                {dish.tags.map((t, ti) => (
                  <span key={ti} className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-md">
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/90 italic">
                <Wine className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span className="truncate">{dish.pairing}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
