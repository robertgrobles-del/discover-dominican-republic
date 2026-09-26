import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { CurrencyExchangeSection } from "@/components/currency/CurrencyExchangeSection";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, CreditCard, Banknote, HelpCircle, MapPin, AlertCircle } from "lucide-react";
import { PreFooterPresidenteBanner } from "@/components/promo";

export default function TasasCambio() {
  return (
    <PageTransition>
      <SEOHead
        title="Tasas de Cambio en República Dominicana - Bancos y Conversor de Monedas"
        description="Consulta las tasas de cambio oficiales en bancos dominicanos (Banco Central, Banreservas, Popular, BHD). Conversor de USD, EUR, CAD a Pesos Dominicanos (DOP)."
      />

      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />

        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8 space-y-12">
            
            {/* Currency Exchange Section Component */}
            <CurrencyExchangeSection />

            {/* Traveler Money & Banking Guide */}
            <section className="space-y-6 pt-4 border-t border-border">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                  <Banknote className="h-6 w-6 text-emerald-500" />
                  Consejos Prácticos sobre Dinero & Monedas en República Dominicana
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Información clave para turistas y viajeros sobre cajeros automáticos, propinas y pagos con tarjeta.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="rounded-3xl border-border bg-card p-6 space-y-3">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base text-foreground">Tarjetas de Crédito y Débito</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Las tarjetas Visa y Mastercard son ampliamente aceptadas en hoteles, restaurantes, supermercados y comercios de todo el país. American Express es aceptada en cadenas internacionales.
                  </p>
                </Card>

                <Card className="rounded-3xl border-border bg-card p-6 space-y-3">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base text-foreground">Cajeros Automáticos (ATMs)</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Disponibles 24/7 en sucursales de Banreservas, Banco Popular y Banco BHD en todo el territorio. Dispensan pesos dominicanos (DOP) y algunos cajeros seleccionados entregan dólares (USD).
                  </p>
                </Card>

                <Card className="rounded-3xl border-border bg-card p-6 space-y-3">
                  <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base text-foreground">Dónde Cambiar Divisas</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Se recomienda cambiar dinero en bancos comerciales autorizados o en casas de cambio reguladas por la Superintendencia de Bancos para obtener las mejores tasas y máxima seguridad.
                  </p>
                </Card>
              </div>
            </section>

            {/* Prefooter Promo Banner */}
            <PreFooterPresidenteBanner />

          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
