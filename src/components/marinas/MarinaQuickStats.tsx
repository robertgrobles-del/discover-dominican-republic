import { Anchor, Waves, Ship, Navigation } from "lucide-react";

interface MarinaQuickStatsProps {
  atraques: number;
  caladoMax: string;
  canalVHF: string;
  coordenadas: { lat: string; lng: string };
}

export function MarinaQuickStats({ atraques, caladoMax, canalVHF, coordenadas }: MarinaQuickStatsProps) {
  return (
    <section className="container mx-auto px-4 mb-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-5 hover:border-primary/50 transition-colors shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Anchor className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Atraques</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{atraques}</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-5 hover:border-primary/50 transition-colors shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Waves className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Calado Máx</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{caladoMax}</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-5 hover:border-primary/50 transition-colors shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Ship className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Canal VHF</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{canalVHF}</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-5 hover:border-primary/50 transition-colors shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Navigation className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Coordenadas</span>
          </div>
          <p className="text-lg font-bold text-foreground truncate font-mono">
            {coordenadas.lat} {coordenadas.lng}
          </p>
        </div>
      </div>
    </section>
  );
}
