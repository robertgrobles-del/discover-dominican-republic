import { Header } from "@/components/Header";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { InterestSection } from "@/components/InterestSection";
import { EventsSection } from "@/components/EventsSection";
import { AccommodationsSection } from "@/components/AccommodationsSection";
import { RestaurantsBarsSection } from "@/components/RestaurantsBarsSection";
import { DestinationsSection } from "@/components/DestinationsSection";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";

const Index = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />
        <HeroSlideshow />
        <InterestSection />
        <EventsSection />
        <RestaurantsBarsSection />
        <AccommodationsSection />
        <DestinationsSection />
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Index;
