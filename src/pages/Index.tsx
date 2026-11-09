import { lazy, Suspense, useState } from "react";
import { Header } from "@/components/Header";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead, generateOrganizationSchema } from "@/components/SEOHead";
import { MobileAd, MobileStickyFooterAd, BetweenSectionsAd } from "@/components/promo";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";
import { Footer } from "@/components/Footer";
import { DeferredSection } from "@/components/DeferredSection";
import { GlobalSearch } from "@/components/GlobalSearch";

// Critical above-the-fold components (loaded immediately for LCP and initial interaction)
import { InterestSection } from "@/components/InterestSection";
import { AboutRepublicaDominicanaSection } from "@/components/home/AboutRepublicaDominicanaSection";
import { GamificationTeaser } from "@/components/GamificationTeaser";

// Deferred below-the-fold components to break critical request chains & reduce DOM tree size
const EventsSection = lazy(() => import("@/components/EventsSection").then(m => ({ default: m.EventsSection })));
const RestaurantsBarsSection = lazy(() => import("@/components/RestaurantsBarsSection").then(m => ({ default: m.RestaurantsBarsSection })));
const AccommodationsSection = lazy(() => import("@/components/AccommodationsSection").then(m => ({ default: m.AccommodationsSection })));
const DestinationsSection = lazy(() => import("@/components/DestinationsSection").then(m => ({ default: m.DestinationsSection })));
const TravelerToolsStrip = lazy(() => import("@/components/TravelerToolsStrip").then(m => ({ default: m.TravelerToolsStrip })));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection").then(m => ({ default: m.TestimonialsSection })));
const NewsSection = lazy(() => import("@/components/NewsSection").then(m => ({ default: m.NewsSection })));
const SorteoLectorBanner = lazy(() => import("@/components/forms/SorteoLectorBanner").then(m => ({ default: m.SorteoLectorBanner })));
const CTARegistroEstablecimiento = lazy(() => import("@/components/forms/CTARegistroEstablecimiento").then(m => ({ default: m.CTARegistroEstablecimiento })));

function SectionFallback() {
  return <div className="py-12 flex items-center justify-center min-h-[140px]" aria-hidden="true" />;
}

const Index = () => {
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  return (
    <PageTransition>
      <SEOHead
        title="Descubre República Dominicana - Portal Oficial de Turismo y Viajes"
        description="Explora las mejores playas, destinos, hoteles, restaurantes y experiencias de República Dominicana. Planifica tu viaje al Caribe con reservas directas y sin comisiones."
        url="/"
        image="/og-image.jpg"
        keywords="República Dominicana, turismo, playas, Punta Cana, Samaná, Santo Domingo, hoteles, viajes Caribe, vuelos republica dominicana"
        geo={{ placename: "República Dominicana", region: "DO", latitude: 18.7357, longitude: -70.1627 }}
        jsonLd={generateOrganizationSchema()}
      />
      <div className="min-h-screen bg-background" id="main-content">
        <Header onOpenSearch={() => setIsGlobalSearchOpen(true)} />
        <h1 className="sr-only">Descubre República Dominicana: destinos, experiencias y planificación de viaje</h1>
        <HeroSlideshow onOpenSearch={() => setIsGlobalSearchOpen(true)} />
        <GlobalSearch isOpen={isGlobalSearchOpen} onClose={() => setIsGlobalSearchOpen(false)} />

        <SectionErrorBoundary sectionName="AboutRepublicaDominicanaSection">
          <AboutRepublicaDominicanaSection />
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="InterestSection">
          <InterestSection />
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="GamificationTeaser">
          <GamificationTeaser />
        </SectionErrorBoundary>

        <DeferredSection minHeight="450px">
          <SectionErrorBoundary sectionName="EventsSection">
            <Suspense fallback={<SectionFallback />}>
              <EventsSection />
            </Suspense>
          </SectionErrorBoundary>
        </DeferredSection>

        {/* Entre secciones de contenido (no entre dos bloques promocionales) */}
        <BetweenSectionsAd showDemo />

        <DeferredSection minHeight="500px">
          <SectionErrorBoundary sectionName="RestaurantsBarsSection">
            <Suspense fallback={<SectionFallback />}>
              <RestaurantsBarsSection />
            </Suspense>
          </SectionErrorBoundary>
        </DeferredSection>


        <DeferredSection minHeight="500px">
          <SectionErrorBoundary sectionName="AccommodationsSection">
            <Suspense fallback={<SectionFallback />}>
              <AccommodationsSection />
            </Suspense>
          </SectionErrorBoundary>
        </DeferredSection>

        {/* Sorteo para lectores: lejos del pasaporte (misma idea de premiar al viajero) y de los anuncios */}
        <DeferredSection minHeight="220px">
          <div className="container mx-auto px-4 lg:px-8">
            <Suspense fallback={<SectionFallback />}>
              <SorteoLectorBanner origenCategoria="Turismo Dominicano" />
            </Suspense>
          </div>
        </DeferredSection>

        <DeferredSection minHeight="480px">
          <SectionErrorBoundary sectionName="DestinationsSection">
            <Suspense fallback={<SectionFallback />}>
              <DestinationsSection />
            </Suspense>
          </SectionErrorBoundary>
        </DeferredSection>

        <BetweenSectionsAd showDemo />

        <DeferredSection minHeight="380px">
          <SectionErrorBoundary sectionName="TravelerToolsStrip">
            <Suspense fallback={<SectionFallback />}>
              <TravelerToolsStrip />
            </Suspense>
          </SectionErrorBoundary>
        </DeferredSection>

        {/* B2B Establishment Registration CTA */}
        <DeferredSection minHeight="260px">
          <div className="container mx-auto px-4 lg:px-8">
            <Suspense fallback={<SectionFallback />}>
              <CTARegistroEstablecimiento tipo="general" />
            </Suspense>
          </div>
        </DeferredSection>

        <DeferredSection minHeight="350px">
          <SectionErrorBoundary sectionName="TestimonialsSection">
            <Suspense fallback={<SectionFallback />}>
              <TestimonialsSection />
            </Suspense>
          </SectionErrorBoundary>
        </DeferredSection>

        <DeferredSection minHeight="380px">
          <SectionErrorBoundary sectionName="NewsSection">
            <Suspense fallback={<SectionFallback />}>
              <NewsSection />
            </Suspense>
          </SectionErrorBoundary>
        </DeferredSection>

        <MobileStickyFooterAd showDemo />
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Index;
