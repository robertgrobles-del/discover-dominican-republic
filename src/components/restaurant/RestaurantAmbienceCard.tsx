import { Wine, Music, Sparkles, Volume2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RestaurantAmbienceCardProps {
  ambienceType?: "tranquilo" | "animado" | "fiesta";
  musicType?: string;
}

export function RestaurantAmbienceCard({ 
  ambienceType = "animado", 
  musicType = "Lounge caribeño & música acústica en vivo" 
}: RestaurantAmbienceCardProps) {
  const getAmbienceBadge = () => {
    switch (ambienceType) {
      case "tranquilo":
        return {
          label: "Ambiente Tranquilo & Íntimo",
          color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
          icon: "🌿",
          desc: "Ideal para cenas en pareja, conversaciones relajadas o negocios."
        };
      case "fiesta":
        return {
          label: "Ambiente Festivo & Enérgico",
          color: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
          icon: "🎉",
          desc: "DJ residente, coctelería dinámica y ambiente alegre hasta tarde."
        };
      default:
        return {
          label: "Ambiente Animado & Acogedor",
          color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
          icon: "✨",
          desc: "Vibra social agradable, música seleccionada y charlas familiares."
        };
    }
  };

  const badge = getAmbienceBadge();

  return (
    <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
        <div>
          <h3 className="font-display text-2xl font-bold text-foreground flex items-center gap-2.5">
            <Wine className="h-6 w-6 text-primary" />
            Ambiente, Coctelería & Cava
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Mejora 636 · Perfil sonoro y atmósfera</p>
        </div>

        <Badge variant="outline" className={`text-xs font-semibold px-3 py-1 ${badge.color}`}>
          <span className="mr-1.5">{badge.icon}</span> {badge.label}
        </Badge>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="p-4 bg-muted/30 rounded-2xl border border-border/60">
          <p className="text-xs font-bold text-primary uppercase mb-1 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5" /> Música & Clima
          </p>
          <p className="text-sm font-bold text-foreground">{musicType}</p>
          <p className="text-xs text-muted-foreground mt-1">{badge.desc}</p>
        </div>
        <div className="p-4 bg-muted/30 rounded-2xl border border-border/60">
          <p className="text-xs font-bold text-primary uppercase mb-1">Cava de Vinos</p>
          <p className="text-sm font-bold text-foreground">Selección Internacional</p>
          <p className="text-xs text-muted-foreground mt-1">Etiquetas del Viejo y Nuevo Mundo con sommelier en sala.</p>
        </div>
        <div className="p-4 bg-muted/30 rounded-2xl border border-border/60">
          <p className="text-xs font-bold text-primary uppercase mb-1">Mixología</p>
          <p className="text-sm font-bold text-foreground">Cócteles Botánicos</p>
          <p className="text-xs text-muted-foreground mt-1">Tragos de autor con rones añejos dominicanos y botánicos frescos.</p>
        </div>
      </div>
    </div>
  );
}
