import { Header } from "@/components/Header";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { InterestSection } from "@/components/InterestSection";
import { EventsSection } from "@/components/EventsSection";
import { AccommodationsSection } from "@/components/AccommodationsSection";
import { DestinationsSection } from "@/components/DestinationsSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSlideshow />
      <InterestSection />
      <EventsSection />
      <AccommodationsSection />
      <DestinationsSection />
      <Footer />
    </div>
  );
};

export default Index;
