import { Wine, Music, Sparkles } from "lucide-react";

export function RestaurantAmbienceCard() {
  return (
    <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm space-y-4">
      <h3 className="font-display text-2xl font-bold text-foreground flex items-center gap-2.5">
        <Wine className="h-6 w-6 text-primary" />
        Ambiente, Coctelería & Cava
      </h3>
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="p-4 bg-muted/30 rounded-2xl border border-border/60">
          <p className="text-xs font-bold text-primary uppercase mb-1">Música & Clima</p>
          <p className="text-sm font-bold text-foreground">Ambiente Lounge & Acústico</p>
          <p className="text-xs text-muted-foreground mt-1">Música suave seleccionada para veladas gastronómicas íntimas.</p>
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
