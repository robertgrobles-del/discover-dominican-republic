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
import { usePageContent } from "@/lib/pageContent";

/** "18°24'N" o "68°54.5'W" → grados decimales (sur y oeste en negativo). */
const dms = (v: string) => {
  const [, d = "0", m = "0", h = ""] = v.match(/([\d.]+)°\s*([\d.]+)?'?\s*([NSEW])?/i) ?? [];
  const n = Number(d) + Number(m) / 60;
  return Math.round((/[SW]/i.test(h) ? -n : n) * 1e4) / 1e4;
};

export default function MarinaDetalle() {
  const pc = usePageContent("marina-detalle");
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
              <h1 className="text-2xl font-bold text-foreground mb-2">{pc.tx("h1.1", "Marina no encontrada")}</h1>
              <p className="text-muted-foreground mb-6">{pc.tx("p.1", "La marina que buscas no existe o ha sido removida.")}</p>
              <Link to="/puertos-marinas">
                <Button>{pc.tx("Button.1", "Volver a Puertos y Marinas")}</Button>
              </Link>
            </div>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  const lat = dms(marina.coordenadas.lat);
  const lng = dms(marina.coordenadas.lng);

  return (
    <PageTransition>
      <SEOHead
        title={`${marina.nombre} - Marinas en República Dominicana`}
        description={marina.descripcion}
        keywords={`${marina.nombre}, marina ${marina.ubicacion}, marinas ${marina.provincia}, marinas RD, puertos deportivos, yates Caribe`}
        url={`/marina/${id}`}
        geo={{ latitude: lat, longitude: lng, placename: marina.ubicacion, region: "DO" }}
        jsonLd={{
          "@context": "https://schema.org", "@type": "Marina", name: marina.nombre, description: marina.descripcion,
          url: `https://www.descubrerepdom.com/marina/${id}`, telephone: marina.telefono || undefined, email: marina.email || undefined,
          sameAs: marina.website ? [marina.website] : undefined,
          address: { "@type": "PostalAddress", addressLocality: marina.ubicacion, addressRegion: marina.provincia, addressCountry: "DO" },
          geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng },
        }}
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
