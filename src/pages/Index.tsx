import { lazy, Suspense } from "react";
import { Header } from "@/components/Header";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead, generateOrganizationSchema } from "@/components/SEOHead";
import { MobileAd, MobileStickyFooterAd } from "@/components/ads";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";
import { SectionSkeleton } from "@/components/ui/section-skeleton";

// Lazy load below-fold sections
const InterestSection = lazy(() => import("@/components/InterestSection").then(m => ({ default: m.InterestSection })));
const GamificationTeaser = lazy(() => import("@/components/GamificationTeaser").then(m => ({ default: m.GamificationTeaser })));
const EventsSection = lazy(() => import("@/components/EventsSection").then(m => ({ default: m.EventsSection })));
const RestaurantsBarsSection = lazy(() => import("@/components/RestaurantsBarsSection").then(m => ({ default: m.RestaurantsBarsSection })));
const AccommodationsSection = lazy(() => import("@/components/AccommodationsSection").then(m => ({ default: m.AccommodationsSection })));
const DestinationsSection = lazy(() => import("@/components/DestinationsSection").then(m => ({ default: m.DestinationsSection })));
const ShoppingHighlightSection = lazy(() => import("@/components/ShoppingHighlightSection").then(m => ({ default: m.ShoppingHighlightSection })));
const TransportHighlightSection = lazy(() => import("@/components/TransportHighlightSection").then(m => ({ default: m.TransportHighlightSection })));
const TravelerToolsStrip = lazy(() => import("@/components/TravelerToolsStrip").then(m => ({ default: m.TravelerToolsStrip })));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection").then(m => ({ default: m.TestimonialsSection })));
const NewsSection = lazy(() => import("@/components/NewsSection").then(m => ({ default: m.NewsSection })));
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));
const BetweenSectionsAd = lazy(() => import("@/components/ads").then(m => ({ default: m.BetweenSectionsAd })));

function LazySection({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <SectionErrorBoundary sectionName={name}>
      <Suspense fallback={<SectionSkeleton />}>
        {children}
      </Suspense>
    </SectionErrorBoundary>
  );
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
        <MobileAd showDemo />
        <HeroSlideshow />

        <LazySection name="InterestSection">
          <InterestSection />
        </LazySection>

        <LazySection name="GamificationTeaser">
          <GamificationTeaser />
        </LazySection>

        <Suspense fallback={null}><BetweenSectionsAd showDemo /></Suspense>

        <LazySection name="EventsSection">
          <EventsSection />
        </LazySection>

        <LazySection name="RestaurantsBarsSection">
          <RestaurantsBarsSection />
        </LazySection>

        <Suspense fallback={null}><BetweenSectionsAd showDemo /></Suspense>

        <LazySection name="AccommodationsSection">
          <AccommodationsSection />
        </LazySection>

        <LazySection name="DestinationsSection">
          <DestinationsSection />
        </LazySection>

        <LazySection name="ShoppingHighlightSection">
          <ShoppingHighlightSection />
        </LazySection>

        <Suspense fallback={null}><BetweenSectionsAd showDemo /></Suspense>

        <LazySection name="TransportHighlightSection">
          <TransportHighlightSection />
        </LazySection>

        <LazySection name="TravelerToolsStrip">
          <TravelerToolsStrip />
        </LazySection>

        <LazySection name="TestimonialsSection">
          <TestimonialsSection />
        </LazySection>

        <LazySection name="NewsSection">
          <NewsSection />
        </LazySection>

        <Suspense fallback={null}>
          <MobileStickyFooterAd showDemo />
          <Footer />
        </Suspense>
      </div>
    </PageTransition>
  );
};

export default Index;
