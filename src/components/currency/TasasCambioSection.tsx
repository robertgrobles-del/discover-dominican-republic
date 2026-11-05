import { CurrencyExchangeSection } from "@/components/currency/CurrencyExchangeSection";
import { Card } from "@/components/ui/card";
import { ShieldCheck, CreditCard, Banknote } from "lucide-react";
import { usePageContent } from "@/lib/pageContent";

// Antes la página /tasas-cambio; ahora es una sección de /conversor-moneda. Conserva su clave de contenido editable.
export function TasasCambioSection() {
  const pc = usePageContent("tasas-cambio");
  return (
    <div id="tasas" className="container mx-auto px-4 lg:px-8 space-y-12 py-12 scroll-mt-24">
            {/* Currency Exchange Section Component */}
            <CurrencyExchangeSection />

            {/* Traveler Money & Banking Guide */}
            <section className="space-y-6 pt-4 border-t border-border">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                  <Banknote className="h-6 w-6 text-emerald-500" />{pc.tx("h2.1", "Consejos Prácticos sobre Dinero & Monedas en República Dominicana")}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">{pc.tx("p.1", "Información clave para turistas y viajeros sobre cajeros automáticos, propinas y pagos con tarjeta.")}</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="rounded-3xl border-border bg-card p-6 space-y-3">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base text-foreground">{pc.tx("h3.1", "Tarjetas de Crédito y Débito")}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{pc.tx("p.2", "Las tarjetas Visa y Mastercard son ampliamente aceptadas en hoteles, restaurantes, supermercados y comercios de todo el país. American Express es aceptada en cadenas internacionales.")}</p>
                </Card>

                <Card className="rounded-3xl border-border bg-card p-6 space-y-3">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base text-foreground">{pc.tx("h3.2", "Cajeros Automáticos (ATMs)")}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{pc.tx("p.3", "Disponibles 24/7 en sucursales de Banreservas, Banco Popular y Banco BHD en todo el territorio. Dispensan pesos dominicanos (DOP) y algunos cajeros seleccionados entregan dólares (USD).")}</p>
                </Card>

                <Card className="rounded-3xl border-border bg-card p-6 space-y-3">
                  <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base text-foreground">{pc.tx("h3.3", "Dónde Cambiar Divisas")}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{pc.tx("p.4", "Se recomienda cambiar dinero en bancos comerciales autorizados o en casas de cambio reguladas por la Superintendencia de Bancos para obtener las mejores tasas y máxima seguridad.")}</p>
                </Card>
              </div>
            </section>

    </div>
  );
}
