import { Badge } from "@/components/ui/badge";

export function EditorialDecisionGuides() {
  return (
    <section className="py-16 bg-muted/20 border-t border-border">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">
            Guías de Decisión Hotelera
          </Badge>
          <h2 className="text-3xl font-display font-bold text-foreground mb-2">
            ¿Dónde quedarse en República Dominicana?
          </h2>
          <p className="text-sm text-muted-foreground">
            Comparativa editorial honesta entre polos turísticos vecinos para ayudarte a elegir la zona perfecta para tu viaje.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 hover:border-primary/40 transition-all shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Punta Cana Este</span>
              <Badge variant="outline" className="text-[10px]">Lujo vs. Ambiente</Badge>
            </div>
            <h3 className="text-lg font-bold text-foreground">Bávaro vs. Cap Cana</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Bávaro:</strong> Ideal para diversión, deportes acuáticos, vida nocturna, variedad gastronómica y resorts all-inclusive con excelente relación calidad-precio.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Cap Cana:</strong> Para privacidad de ultra-lujo, marinas exclusivas, campos de golf PGA y tranquilidad absoluta sin multitudes.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 hover:border-primary/40 transition-all shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Península de Samaná</span>
              <Badge variant="outline" className="text-[10px]">Boho vs. Naturaleza</Badge>
            </div>
            <h3 className="text-lg font-bold text-foreground">Las Terrenas vs. Las Galeras</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Las Terrenas:</strong> Ambiente cosmopolita franco-dominicano, bares en la arena, cafés gourmet, tiendas boutique y vida social activa.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Las Galeras:</strong> Paraíso virgen y desconexión total. Acceso directo a Playa Rincón, Playa Frontón y ecoturismo auténtico.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 hover:border-primary/40 transition-all shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Cordillera Central</span>
              <Badge variant="outline" className="text-[10px]">Aventura vs. Clima Frío</Badge>
            </div>
            <h3 className="text-lg font-bold text-foreground">Jarabacoa vs. Constanza</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Jarabacoa:</strong> Capital de los ríos y aventura (rafting, cañonismo, cascadas como Salto Baiguate y villas de montaña).
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Constanza:</strong> La ciudad más fría del Caribe. Turismo agrícola de fresas, flores, Valle Nuevo y paisajes alpinos únicos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
