import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Anchor } from "lucide-react";
import { marinasDetalleData } from "@/data/marinasDetalleData";
import { MarinaHero } from "@/components/marinas/MarinaHero";
import { MarinaQuickStats } from "@/components/marinas/MarinaQuickStats";
import { MarinaContent } from "@/components/marinas/MarinaContent";
import { MarinaSidebar } from "@/components/marinas/MarinaSidebar";

export default function MarinaDetalle() {
  const { slug: id } = useParams<{ slug: string }>();
  const marina = marinasDetalleData[id || ""];

  if (!marina) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8">
              <Anchor className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Marina no encontrada</h1>
              <p className="text-muted-foreground mb-6">
                La marina que buscas no existe o ha sido removida.
              </p>
              <Link to="/puertos-marinas">
                <Button>Volver a Puertos y Marinas</Button>
              </Link>
            </div>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <SEOHead
        title={`${marina.nombre} - Marinas en República Dominicana`}
        description={marina.descripcion}
        keywords={`${marina.nombre}, marinas RD, puertos deportivos, yates Caribe`}
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Breadcrumb & Hero */}
          <MarinaHero marina={marina} />

          {/* Quick Nautical Stats */}
          <MarinaQuickStats
            atraques={marina.atraques}
            caladoMax={marina.caladoMax}
            canalVHF={marina.canalVHF}
            coordenadas={marina.coordenadas}
          />

          {/* Content & Booking Grid */}
          <section className="container mx-auto px-4 pb-16">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <MarinaContent
                descripcionLarga={marina.descripcionLarga}
                servicios={marina.servicios}
                amenidades={marina.amenidades}
              />

              {/* Sidebar Booking & Contact */}
              <MarinaSidebar
                rating={marina.rating}
                reviews={marina.reviews}
                tarifas={marina.tarifas}
                telefono={marina.telefono}
                email={marina.email}
                website={marina.website}
              />
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
