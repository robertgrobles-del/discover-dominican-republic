import { Disc, Clock, Music } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NightlifeItem {
  name: string;
  type: string;
  hours: string;
  music: string;
  description: string;
}

interface AccommodationNightlifeProps {
  nightlife: NightlifeItem[];
}

export function AccommodationNightlife({ nightlife }: AccommodationNightlifeProps) {
  if (!nightlife || !Array.isArray(nightlife) || nightlife.length === 0) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2.5">
          <Disc className="h-6 w-6 text-primary" />
          Discotecas, Teatro & Vida Nocturna
        </h2>
        <p className="text-sm text-muted-foreground">Entretenimiento nocturno diario con artistas en vivo y club con DJ</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {nightlife.map((n) => (
          <div key={n.name} className="bg-card rounded-3xl p-5 border border-border hover:border-primary/40 transition-colors flex flex-col justify-between shadow-xs">
            <div>
              <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-[10px] mb-2">
                {n.type}
              </Badge>
              <h3 className="font-display text-base font-bold text-foreground mb-1.5">{n.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{n.description}</p>
            </div>
            <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-primary" /> {n.hours}</span>
              <span className="flex items-center gap-1"><Music className="h-3 w-3 text-primary" /> {n.music}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
