import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Calendar } from "lucide-react";
import { itinerarios } from "@/data/itinerariosData";
import { ItinerarioCard } from "@/components/itinerarios/ItinerarioCard";
import { ItinerarioDetailSection } from "@/components/itinerarios/ItinerarioDetailSection";
import { EditorialDecisionGuides } from "@/components/itinerarios/EditorialDecisionGuides";

export default function ItinerariosRecomendados() {
  const [seleccionado, setSeleccionado] = useState<string | null>(null);

  const itinerarioActivo = itinerarios.find((i) => i.id === seleccionado);

  return (
    <PageTransition>
      <SEOHead
        title="Itinerarios de Viaje - 3, 5, 7 y 14 Días | Descubre República Dominicana"
        description="Itinerarios prediseñados para tu viaje a RD: escapada de 3 días, ruta cultural de 5 días, tour completo de 7 días o gran aventura de 14 días."
        keywords="itinerario viaje dominicana, plan viaje RD, ruta 7 días dominicana, que hacer en dominicana"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Calendar className="h-3 w-3 mr-1" /> Planifica tu Aventura
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Itinerarios <span className="text-primary">Recomendados</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Elige tu duración y estilo de viaje. Cada itinerario incluye día a día, presupuesto y consejos prácticos.
            </p>
          </div>
        </section>

        {/* Grid de itinerarios */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {itinerarios.map((it) => (
                <ItinerarioCard
                  key={it.id}
                  itinerario={it}
                  isSelected={seleccionado === it.id}
                  onSelect={() => setSeleccionado(seleccionado === it.id ? null : it.id)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Detalle del itinerario seleccionado */}
        {itinerarioActivo && (
          <ItinerarioDetailSection itinerario={itinerarioActivo} />
        )}

        {/* Guías Editoriales Comparativas */}
        <EditorialDecisionGuides />

        <Footer />
      </div>
    </PageTransition>
  );
}
