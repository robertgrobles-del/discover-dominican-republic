import { lazy, Suspense } from "react";
import { Header } from "@/components/Header";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead, generateOrganizationSchema } from "@/components/SEOHead";
import { MobileAd, MobileStickyFooterAd, BetweenSectionsAd } from "@/components/promo";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";
import { Footer } from "@/components/Footer";
import { DeferredSection } from "@/components/DeferredSection";

// Critical above-the-fold components (loaded immediately for LCP and initial interaction)
import { InterestSection } from "@/components/InterestSection";
import { GamificationTeaser } from "@/components/GamificationTeaser";

// Deferred below-the-fold components to break critical request chains & reduce DOM tree size
const EventsSection = lazy(() => import("@/components/EventsSection").then(m => ({ default: m.EventsSection })));
const RestaurantsBarsSection = lazy(() => import("@/components/RestaurantsBarsSection").then(m => ({ default: m.RestaurantsBarsSection })));
const AccommodationsSection = lazy(() => import("@/components/AccommodationsSection").then(m => ({ default: m.AccommodationsSection })));
const DestinationsSection = lazy(() => import("@/components/DestinationsSection").then(m => ({ default: m.DestinationsSection })));
const ShoppingHighlightSection = lazy(() => import("@/components/ShoppingHighlightSection").then(m => ({ default: m.ShoppingHighlightSection })));
const TransportHighlightSection = lazy(() => import("@/components/TransportHighlightSection").then(m => ({ default: m.TransportHighlightSection })));
const TravelerToolsStrip = lazy(() => import("@/components/TravelerToolsStrip").then(m => ({ default: m.TravelerToolsStrip })));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection").then(m => ({ default: m.TestimonialsSection })));
const NewsSection = lazy(() => import("@/components/NewsSection").then(m => ({ default: m.NewsSection })));
const QuickThreeHoursSection = lazy(() => import("@/components/home/QuickThreeHoursSection").then(m => ({ default: m.QuickThreeHoursSection })));
const SorteoLectorBanner = lazy(() => import("@/components/forms/SorteoLectorBanner").then(m => ({ default: m.SorteoLectorBanner })));
const CTARegistroEstablecimiento = lazy(() => import("@/components/forms/CTARegistroEstablecimiento").then(m => ({ default: m.CTARegistroEstablecimiento })));

function SectionFallback() {
  return <div className="py-12 flex items-center justify-center min-h-[140px]" aria-hidden="true" />;
}

const Index = () => {
  return (
    <PageTransition>
      <SEOHead
        title="Descubre República Dominicana - Tu Portal de Turismo"
        description="Explora las mejores playas, destinos, hoteles, restaurantes y experiencias de República Dominicana. Planifica tu viaje perfecto al Caribe."
        keywords="República Dominicana, turismo, playas, Punta Cana, Samaná, Santo Domingo, hoteles, viajes Caribe"
        jsonLd={generateOrganizationSchema()}
      />
      <div className="min-h-screen bg-background" id="main-content">
        <Header />
        <HeroSlideshow />

        <SectionErrorBoundary sectionName="InterestSection">
          <InterestSection />
        </SectionErrorBoundary>

        <SectionErrorBoundary sectionName="GamificationTeaser">
          <GamificationTeaser />
        </SectionErrorBoundary>

        <BetweenSectionsAd showDemo />

        {/* Dynamic Contest Reader Banner for conversion */}
        <DeferredSection minHeight="220px">
          <div className="container mx-auto px-4 lg:px-8">
            <Suspense fallback={<SectionFallback />}>
              <SorteoLectorBanner origenCategoria="Turismo Dominicano" />
            </Suspense>
          </div>
        </DeferredSection>

        <DeferredSection minHeight="450px">
          <SectionErrorBoundary sectionName="EventsSection">
            <Suspense fallback={<SectionFallback />}>
              <EventsSection />
            </Suspense>
          </SectionErrorBoundary>
        </DeferredSection>

        <DeferredSection minHeight="500px">
          <SectionErrorBoundary sectionName="RestaurantsBarsSection">
            <Suspense fallback={<SectionFallback />}>
              <RestaurantsBarsSection />
            </Suspense>
          </SectionErrorBoundary>
        </DeferredSection>

        {/* Mejora 721: "Tengo 3 horas libres" - Micro-itinerarios espontáneos */}
        <DeferredSection minHeight="380px">
          <Suspense fallback={<SectionFallback />}>
            <QuickThreeHoursSection />
          </Suspense>
        </DeferredSection>

        <BetweenSectionsAd showDemo />

        <DeferredSection minHeight="500px">
          <SectionErrorBoundary sectionName="AccommodationsSection">
            <Suspense fallback={<SectionFallback />}>
              <AccommodationsSection />
            </Suspense>
          </SectionErrorBoundary>
        </DeferredSection>

        <DeferredSection minHeight="480px">
          <SectionErrorBoundary sectionName="DestinationsSection">
            <Suspense fallback={<SectionFallback />}>
              <DestinationsSection />
            </Suspense>
          </SectionErrorBoundary>
        </DeferredSection>

        <DeferredSection minHeight="400px">
          <SectionErrorBoundary sectionName="ShoppingHighlightSection">
            <Suspense fallback={<SectionFallback />}>
              <ShoppingHighlightSection />
            </Suspense>
          </SectionErrorBoundary>
        </DeferredSection>

        <BetweenSectionsAd showDemo />

        <DeferredSection minHeight="400px">
          <SectionErrorBoundary sectionName="TransportHighlightSection">
            <Suspense fallback={<SectionFallback />}>
              <TransportHighlightSection />
            </Suspense>
          </SectionErrorBoundary>
        </DeferredSection>

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
