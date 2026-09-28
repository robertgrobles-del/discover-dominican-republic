import { Link, useParams } from "react-router-dom";
import { Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { puertosDetalleData } from "@/data/puertosDetalleData";
import { PortHero } from "@/components/puertos/PortHero";
import { PortExcursionGuide } from "@/components/puertos/PortExcursionGuide";
import { PortFacilitiesAndReviews } from "@/components/puertos/PortFacilitiesAndReviews";
import { PortSidebar } from "@/components/puertos/PortSidebar";

export default function PuertoDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const puerto = puertosDetalleData[slug || ""];

  if (!puerto) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-32 text-center">
            <Anchor className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Puerto no encontrado</h1>
            <p className="text-muted-foreground mb-8">El puerto que buscas no existe.</p>
            <Link to="/puertos-marinas">
              <Button>Ver Puertos y Marinas</Button>
            </Link>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <SEOHead
        title={`${puerto.name} - Puertos y Cruceros en República Dominicana | Descubre República Dominicana`}
        description={puerto.description.slice(0, 160)}
        image={puerto.image}
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Section */}
        <PortHero puerto={puerto} />

        {/* Main Content Layout */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  Sobre el Puerto
                </h2>
                <p className="text-muted-foreground leading-relaxed">{puerto.description}</p>
              </section>

              {/* Exclusive 8-hour excursion guide */}
              <PortExcursionGuide portId={puerto.id} portName={puerto.name} />

              {/* Lines, Facilities, Activities and Reviews */}
              <PortFacilitiesAndReviews
                cruiseLines={puerto.cruiseLines}
                facilities={puerto.facilities}
                nearbyActivities={puerto.nearbyActivities}
                reviews={puerto.reviews}
              />
            </div>

            {/* Sidebar Column */}
            <PortSidebar
              schedule={puerto.schedule}
              nearbyDestinations={puerto.nearbyDestinations}
              coordinates={puerto.coordinates}
            />
          </div>
        </div>

        <Footer />
      </div>
    </PageTransition>
  );
}
