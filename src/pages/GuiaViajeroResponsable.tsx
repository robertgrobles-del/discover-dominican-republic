import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Download, Leaf, TreePine, Map, CheckCircle } from "lucide-react";

export default function GuiaViajeroResponsable() {
  return (
    <PageTransition>
      <SEOHead
        title="Guía del Viajero Responsable | Descubre RD"
        description="Aprende cómo minimizar tu impacto ecológico y apoyar a las comunidades locales durante tu viaje a la República Dominicana."
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl space-y-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-emerald-500" />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold font-display text-foreground mb-4">
                Guía del Viajero Responsable
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Tu viaje tiene un impacto. Descubre cómo proteger nuestros paraísos naturales, apoyar la economía local y respetar la cultura dominicana.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
              <div className="flex items-start gap-4">
                <TreePine className="h-6 w-6 text-emerald-500 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg">Protección del Medio Ambiente</h3>
                  <p className="text-muted-foreground mt-1">
                    Utiliza protectores solares biodegradables, no dejes basura en las playas ni senderos, y respeta la flora y fauna silvestre.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Map className="h-6 w-6 text-emerald-500 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg">Apoyo a la Economía Local</h3>
                  <p className="text-muted-foreground mt-1">
                    Compra artesanías locales, come en restaurantes dominicanos y contrata guías certificados de la comunidad para asegurar que tu dinero beneficie a quienes viven allí.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-emerald-500 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg">Respeto Cultural</h3>
                  <p className="text-muted-foreground mt-1">
                    Pide permiso antes de tomar fotografías a personas locales, viste de manera respetuosa al visitar iglesias y muestra interés por nuestras costumbres.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                <Download className="h-5 w-5" /> Descargar Guía Completa (PDF)
              </Button>
              <Button size="lg" variant="outline" className="border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10">
                Calculadora de Huella
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
}