import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TreePine, Search, Shield, Bird, Mountain } from "lucide-react";

interface ReservasHeroProps {
  search: string;
  onSearchChange: (val: string) => void;
}

const stats = [
  { icon: TreePine, label: "Parques Nacionales", value: "13" },
  { icon: Shield, label: "Reservas Científicas", value: "3" },
  { icon: Bird, label: "Monumentos Naturales", value: "5" },
  { icon: Mountain, label: "Áreas Protegidas", value: "30+" },
];

export function ReservasHero({ search, onSearchChange }: ReservasHeroProps) {
  return (
    <section className="relative py-20 bg-gradient-to-b from-emerald-500/10 to-background">
      <div className="container mx-auto px-4 text-center">
        <Badge className="mb-4 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
          <TreePine className="h-3 w-3 mr-1" /> Patrimonio Natural
        </Badge>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
          Reservas Naturales y <span className="text-emerald-600 dark:text-emerald-400">Parques Nacionales</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          República Dominicana protege el 25% de su territorio en 128 áreas protegidas con ecosistemas únicos del Caribe.
        </p>

        <div className="max-w-md mx-auto relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar reservas..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 h-12 bg-card border-border"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {stats.map((s) => (
            <div key={s.label} className="bg-card rounded-xl p-4 border border-border">
              <s.icon className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
