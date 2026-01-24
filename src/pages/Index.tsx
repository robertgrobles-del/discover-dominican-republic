import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { InterestSection } from "@/components/InterestSection";
import { EventsSection } from "@/components/EventsSection";
import { DestinationsSection } from "@/components/DestinationsSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <InterestSection />
      <EventsSection />
      <DestinationsSection />
      <Footer />
    </div>
  );
};

export default Index;
