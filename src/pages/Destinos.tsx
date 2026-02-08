import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { BetweenSectionsAd } from "@/components/ads";

import { PopularDestinations } from "@/components/destinations/PopularDestinations";
import { RegionsSection } from "@/components/destinations/RegionsSection";
import { RecommendedDestinations } from "@/components/destinations/RecommendedDestinations";
import { ProvincesGrid } from "@/components/destinations/ProvincesGrid";
import { MunicipalitiesSection } from "@/components/destinations/MunicipalitiesSection";
import { DestinationsByCategory } from "@/components/destinations/DestinationsByCategory";

import { 
  getPopularDestinations, 
  getRecommendedDestinations, 
  getProvinces, 
  getMunicipalities 
} from "@/data/destinations";

import heroBeach from "@/assets/hero-beach.jpg";

export default function Destinos() {
  // Obtener datos estáticos
  const popularDestinations = getPopularDestinations();
  const recommendedDestinations = getRecommendedDestinations();
  const provinces = getProvinces();
  const municipalities = getMunicipalities();

  return (
    <PageTransition>
      <SEOHead
        title="Destinos Turísticos de República Dominicana"
        description="Explora todos los destinos turísticos de República Dominicana: playas paradisíacas, montañas, ciudades coloniales y mucho más."
        keywords="destinos República Dominicana, turismo RD, playas Caribe, Punta Cana, Santo Domingo, Samaná"
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Section */}
        <section className="relative h-[70vh] min-h-[500px] w-full flex flex-col justify-center items-center">
          <div className="absolute inset-0 z-0">
            <img
              src={heroBeach}
              alt="Playas de República Dominicana"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/20" />
          </div>

          <div className="relative z-10 text-center px-4 pt-16">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block bg-primary/20 text-primary text-sm font-medium px-4 py-2 rounded-full mb-6"
            >
              🌴 Descubre tu paraíso
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
            >
              Explora los{" "}
              <span className="text-gradient">Destinos</span>
              <br />
              de República Dominicana
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto"
            >
              Desde playas infinitas hasta montañas esmeralda, descubre cada rincón 
              de la isla más diversa del Caribe.
            </motion.p>
          </div>
        </section>

        {/* Popular Destinations */}
        <PopularDestinations destinations={popularDestinations} />

        {/* Banner Ad */}
        <BetweenSectionsAd showDemo />

        {/* Regions */}
        <RegionsSection />

        {/* Recommended Destinations */}
        <RecommendedDestinations destinations={recommendedDestinations} />

        {/* Banner Ad */}
        <BetweenSectionsAd showDemo />

        {/* Provinces Grid */}
        <ProvincesGrid provinces={provinces} />

        {/* Municipalities */}
        <MunicipalitiesSection municipalities={municipalities} />

        {/* Destinations by Category */}
        <DestinationsByCategory />

        <Footer />
      </div>
    </PageTransition>
  );
}
