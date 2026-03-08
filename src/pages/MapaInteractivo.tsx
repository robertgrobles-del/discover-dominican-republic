import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { InteractiveMap } from "@/components/InteractiveMap";

const MapaInteractivo = () => {
  return (
    <PageTransition>
      <SEOHead
        title="Mapa Interactivo - Descubre República Dominicana"
        description="Explora destinos, hoteles, playas y restaurantes de República Dominicana en un mapa interactivo."
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">🗺️ Mapa Interactivo</h1>
            <p className="text-muted-foreground mb-6">
              Explora todos los destinos, hoteles, playas y restaurantes de República Dominicana en un solo lugar.
            </p>
            <InteractiveMap />
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default MapaInteractivo;
