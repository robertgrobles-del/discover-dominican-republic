import { motion } from "framer-motion";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { BetweenSectionsAd } from "@/components/ads";
import { useTranslation } from "@/hooks/useI18n";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";

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
  const { t } = useTranslation();
  const popularDestinations = getPopularDestinations();
  const recommendedDestinations = getRecommendedDestinations();
  const provinces = getProvinces();
  const municipalities = getMunicipalities();

  return (
    <PageTransition>
      <SEOHead
        title={t("destinos.seoTitle")}
        description={t("destinos.seoDescription")}
        keywords="destinos República Dominicana, turismo RD, playas Caribe, Punta Cana, Santo Domingo, Samaná"
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Section */}
        <section className="relative h-[70vh] min-h-[500px] w-full flex flex-col justify-center items-center">
          <div className="absolute inset-0 z-0">
            <img
              src={heroBeach}
              alt={t("destinos.heroAlt")}
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
              🌴 {t("destinos.discoverParadise")}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
            >
              {t("destinos.exploreThe")}{" "}
              <span className="text-gradient">{t("destinos.destinations")}</span>
              <br />
              {t("destinos.ofDR")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto"
            >
              {t("destinos.heroSubtitle")}
            </motion.p>
          </div>
        </section>

        <PopularDestinations destinations={popularDestinations} />
        <BetweenSectionsAd showDemo />
        <RegionsSection />
        <RecommendedDestinations destinations={recommendedDestinations} />
        <BetweenSectionsAd showDemo />
        <ProvincesGrid provinces={provinces} />
        <MunicipalitiesSection municipalities={municipalities} />
        <DestinationsByCategory />

        <Footer />
      </div>
    </PageTransition>
  );
}
