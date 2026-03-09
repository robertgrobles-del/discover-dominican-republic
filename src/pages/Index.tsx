import { Header } from "@/components/Header";
import { RecommendationsWidget } from "@/components/RecommendationsWidget";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { InterestSection } from "@/components/InterestSection";
import { EventsSection } from "@/components/EventsSection";
import { AccommodationsSection } from "@/components/AccommodationsSection";
import { RestaurantsBarsSection } from "@/components/RestaurantsBarsSection";
import { DestinationsSection } from "@/components/DestinationsSection";
import { NewsSection } from "@/components/NewsSection";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead, generateOrganizationSchema } from "@/components/SEOHead";
import { BetweenSectionsAd, MobileAd, MobileStickyFooterAd } from "@/components/ads";
import { StatsSection } from "@/components/StatsSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { QuickExploreStrip } from "@/components/QuickExploreStrip";
import { ShoppingHighlightSection } from "@/components/ShoppingHighlightSection";
import { TransportHighlightSection } from "@/components/TransportHighlightSection";
import { TravelerToolsStrip } from "@/components/TravelerToolsStrip";

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
