import { Waves } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PoolItem {
  name: string;
  type: string;
  vibe: string;
  depth: string;
  features: string;
}

interface AccommodationPoolsProps {
  pools: PoolItem[];
}

export function AccommodationPools({ pools }: AccommodationPoolsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2.5">
            <Waves className="h-6 w-6 text-primary" />
            Piscinas & Zonas Acuáticas ({pools.length} Piscinas)
          </h2>
          <p className="text-sm text-muted-foreground">Espacios de agua dulce y climatizada para cada momento del día</p>
        </div>
        <Badge variant="outline" className="text-xs font-mono">{pools.length} Áreas de Piscina</Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {pools.map((p, idx) => (
          <div key={p.name} className="bg-card rounded-3xl p-5 border border-border hover:border-primary/40 transition-all flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                  Piscina #{idx + 1} • {p.type}
                </Badge>
                <span className="text-xs font-bold text-primary">{p.vibe}</span>
              </div>
              <h3 className="font-display text-base font-bold text-foreground mb-1.5">{p.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{p.features}</p>
            </div>
            <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>Profundidad: <strong className="text-foreground">{p.depth}</strong></span>
              <span className="text-primary font-semibold">Toallas & Camastros ✓</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
