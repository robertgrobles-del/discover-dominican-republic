import { lazy, Suspense } from "react";
import { Header } from "@/components/Header";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { QuickExploreStrip } from "@/components/QuickExploreStrip";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead, generateOrganizationSchema } from "@/components/SEOHead";
import { MobileAd, MobileStickyFooterAd } from "@/components/ads";

// Lazy load below-fold sections
const StatsSection = lazy(() => import("@/components/StatsSection").then(m => ({ default: m.StatsSection })));
const InterestSection = lazy(() => import("@/components/InterestSection").then(m => ({ default: m.InterestSection })));
const EventsSection = lazy(() => import("@/components/EventsSection").then(m => ({ default: m.EventsSection })));
const RestaurantsBarsSection = lazy(() => import("@/components/RestaurantsBarsSection").then(m => ({ default: m.RestaurantsBarsSection })));
const AccommodationsSection = lazy(() => import("@/components/AccommodationsSection").then(m => ({ default: m.AccommodationsSection })));
const DestinationsSection = lazy(() => import("@/components/DestinationsSection").then(m => ({ default: m.DestinationsSection })));
const ShoppingHighlightSection = lazy(() => import("@/components/ShoppingHighlightSection").then(m => ({ default: m.ShoppingHighlightSection })));
const TransportHighlightSection = lazy(() => import("@/components/TransportHighlightSection").then(m => ({ default: m.TransportHighlightSection })));
const TravelerToolsStrip = lazy(() => import("@/components/TravelerToolsStrip").then(m => ({ default: m.TravelerToolsStrip })));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection").then(m => ({ default: m.TestimonialsSection })));
const NewsSection = lazy(() => import("@/components/NewsSection").then(m => ({ default: m.NewsSection })));
const RecommendationsWidget = lazy(() => import("@/components/RecommendationsWidget").then(m => ({ default: m.RecommendationsWidget })));
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));
const BetweenSectionsAd = lazy(() => import("@/components/ads").then(m => ({ default: m.BetweenSectionsAd })));

const Index = () => {
  return (
    <PageTransition>
      <SEOHead
        title="Descubre República Dominicana - Tu Portal de Turismo"
        description="Explora las mejores playas, destinos, hoteles, restaurantes y experiencias de República Dominicana. Planifica tu viaje perfecto al Caribe."
        keywords="República Dominicana, turismo, playas, Punta Cana, Samaná, Santo Domingo, hoteles, viajes Caribe"
        jsonLd={generateOrganizationSchema()}
      />
      <div className="min-h-screen bg-background">
        <Header />
        <MobileAd showDemo />
        <HeroSlideshow />
        <QuickExploreStrip />
        <StatsSection />
        <InterestSection />
        <BetweenSectionsAd showDemo />
        <EventsSection />
        <RestaurantsBarsSection />
        <BetweenSectionsAd showDemo />
        <AccommodationsSection />
        <DestinationsSection />
        <ShoppingHighlightSection />
        <BetweenSectionsAd showDemo />
        <TransportHighlightSection />
        <TravelerToolsStrip />
        <TestimonialsSection />
        <NewsSection />
        
        {/* Recomendaciones IA */}
        <section className="container mx-auto px-4 py-12">
          <RecommendationsWidget />
        </section>
        {/* Footer sticky ad para móvil */}
        <MobileStickyFooterAd showDemo />
        
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Index;
