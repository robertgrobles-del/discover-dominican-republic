import { motion } from "framer-motion";
import { Anchor, Ship } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { cruisePorts, marinasList } from "@/data/portsData";
import { PortCard } from "@/components/puertos/PortCard";
import { MarinaCard } from "@/components/puertos/MarinaCard";
import { CruiseCTA } from "@/components/puertos/CruiseCTA";
import { usePageContent } from "@/lib/pageContent";

export default function PuertosMarinas() {
  const pc = usePageContent("puertos-marinas");
  return (
    <PageTransition>
      <SEOHead
        title={pc.t("SEOHead.title.1", "Puertos de Cruceros y Marinas | Turismo RD")}
        description={pc.t("SEOHead.description.1", "Descubre los principales puertos de cruceros y marinas de República Dominicana. Información sobre líneas, facilidades y actividades cercanas.")}
        keywords="puertos, cruceros, marinas, República Dominicana, náutica, yates"
      />
      <div className="min-h-dvh bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full mb-6">
                <Anchor className="h-5 w-5" />
                <span className="font-medium">{pc.tx("span.1", "Puertos y Marinas")}</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">{pc.tx("h1.1", "Puertos de")}{" "}<span className="text-primary">{pc.tx("span.2", "Cruceros")}</span>{" "}{pc.tx("h1.2", "y Marinas")}</h1>
              <p className="text-muted-foreground text-lg mb-8">{pc.tx("p.1", "República Dominicana te recibe por mar con puertos de clase mundial y marinas de lujo.")}</p>
            </motion.div>
          </div>
        </section>

        {/* Tabs */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <Tabs defaultValue="cruceros" className="space-y-8">
              <TabsList className="w-full justify-center">
                <TabsTrigger value="cruceros" className="gap-2">
                  <Ship className="h-4 w-4" />{pc.tx("TabsTrigger.1", "Puertos de Cruceros")}</TabsTrigger>
                <TabsTrigger value="marinas" className="gap-2">
                  <Anchor className="h-4 w-4" />{pc.tx("TabsTrigger.2", "Marinas")}</TabsTrigger>
              </TabsList>

              <TabsContent value="cruceros">
                <div className="space-y-8">
                  {cruisePorts.map((port, index) => (
                    <PortCard key={port.id} port={port} index={index} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="marinas">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {marinasList.map((marina, index) => (
                    <MarinaCard key={marina.id} marina={marina} index={index} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* CTA */}
        <CruiseCTA />

        <Footer />
      </div>
    </PageTransition>
  );
}
