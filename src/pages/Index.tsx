import { Header } from "@/components/Header";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { InterestSection } from "@/components/InterestSection";
import { EventsSection } from "@/components/EventsSection";
import { AccommodationsSection } from "@/components/AccommodationsSection";
import { RestaurantsBarsSection } from "@/components/RestaurantsBarsSection";
import { DestinationsSection } from "@/components/DestinationsSection";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead, generateOrganizationSchema } from "@/components/SEOHead";
import { BetweenSectionsAd, MobileAd } from "@/components/ads";

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
        <InterestSection />
        <BetweenSectionsAd showDemo />
        <EventsSection />
        <RestaurantsBarsSection />
        <BetweenSectionsAd showDemo />
        <AccommodationsSection />
        <DestinationsSection />
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Index;
