import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { InteractiveMap } from "@/components/InteractiveMap";
import { usePageContent } from "@/lib/pageContent";

const MapaInteractivo = () => {
  const pc = usePageContent("mapa-interactivo");
  return (
    <PageTransition>
      <SEOHead
        title={pc.t("SEOHead.title.1", "Mapa Interactivo - Descubre República Dominicana")}
        description={pc.t("SEOHead.description.1", "Explora destinos, hoteles, playas y restaurantes de República Dominicana en un mapa interactivo.")}
      />
      <div className="min-h-dvh bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{pc.tx("h1.1", "🗺️ Mapa Interactivo")}</h1>
            <p className="text-muted-foreground mb-6">{pc.tx("p.1", "Explora todos los destinos, hoteles, playas y restaurantes de República Dominicana en un solo lugar.")}</p>
            <p className="text-xs text-muted-foreground mb-3" role="note">{pc.tx("p.2", "El mapa carga mosaicos de OpenStreetMap cuando se acerca a la pantalla; el proveedor recibe la dirección IP de tu conexión. La ubicación del dispositivo no se solicita.")}</p>
            <InteractiveMap />
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default MapaInteractivo;
