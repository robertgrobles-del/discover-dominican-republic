import { Wine, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface SignatureCocktail {
  name: string;
  desc: string;
  price: string;
  strength: string;
}

interface BarCocktailsGridProps {
  cocktails?: SignatureCocktail[];
}

export function BarCocktailsGrid({ cocktails }: BarCocktailsGridProps) {
  const defaultCocktails: SignatureCocktail[] = [
    { name: "Caribe Fusión Passion", desc: "Ron Dominicano Extra Añejo, maracuyá fresca, jarabe de jengibre y toque de prosecco.", price: "$14 USD", strength: "Medio" },
    { name: "Mamajuana Old Fashioned", desc: "Infusión artesanal de hierbas y raíces dominicanas, amargo de angostura y piel de naranja flameada.", price: "$16 USD", strength: "Fuerte" },
    { name: "Santo Domingo Mezcalita", desc: "Mezcal ahumado, piña asada al carbón, jugo de lima criolla y sal de chile tajín.", price: "$15 USD", strength: "Equilibrado" },
    { name: "Coco Loco Royal", desc: "Crema de coco natural de Samaná, ron blanco, agua con gas y esencia de menta silvestre.", price: "$12 USD", strength: "Refrescante" }
  ];

  const items = cocktails && cocktails.length > 0 ? cocktails : defaultCocktails;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-2xl font-bold text-foreground flex items-center gap-2.5">
          <Wine className="h-6 w-6 text-primary" />
          Mixología & Cócteles de Autor
        </h3>
        <p className="text-sm text-muted-foreground">Creaciones exclusivas de nuestros bartenders con licores premium</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {items.map((drink, idx) => (
          <div key={idx} className="bg-card rounded-3xl p-5 border border-border hover:border-primary/40 transition-colors flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                  {drink.strength}
                </Badge>
                <span className="font-bold text-sm text-foreground bg-muted/60 px-2.5 py-0.5 rounded-md">
                  {drink.price}
                </span>
              </div>
              <h4 className="font-display text-base font-bold text-foreground mb-1">{drink.name}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{drink.desc}</p>
            </div>
            <div className="pt-3 mt-3 border-t border-border/50 text-[11px] text-primary flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Preparado al momento con ingredientes frescos
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
