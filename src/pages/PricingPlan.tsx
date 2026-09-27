import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { PRICING_PLANS } from "@/data/pricingPlansData";
import { PricingPlanCard } from "@/components/pricing/PricingPlanCard";
import { PricingValueProps } from "@/components/pricing/PricingValueProps";
import { PricingFaqSection } from "@/components/pricing/PricingFaqSection";

export default function PricingPlan() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  return (
    <PageTransition>
      <SEOHead
        title="Planes y Publicidad para Empresas Turísticas - Descubre RD"
        description="Registra o reclama tu hotel, restaurante, bar o tour en Descubre República Dominicana. Conecta con millones de viajeros nacionales e internacionales."
      />
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />

        <main className="flex-grow pt-24 pb-20">
          {/* Hero Section */}
          <section className="container mx-auto px-4 lg:px-8 text-center max-w-4xl py-8">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
              ● Soluciones para Hoteles, Restaurantes, Operadores y Comercios
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-tight mb-6">
              Haz crecer tu negocio con el <br className="hidden sm:block" />
              <span className="text-primary">Ecosistema Turístico Oficial de RD</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Llega a turistas activos en el momento exacto en que planifican y reservan su viaje. Recibe contactos directos a tu WhatsApp sin pagar comisiones por reserva.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-3 bg-muted/60 p-1.5 rounded-2xl border border-border">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  billingCycle === "monthly" 
                    ? "bg-card text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Facturación Mensual
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  billingCycle === "annual" 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Facturación Anual
                <span className="bg-amber-400 text-slate-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  Ahorra 20%
                </span>
              </button>
            </div>
          </section>

          {/* Pricing Cards Grid */}
          <section className="container mx-auto px-4 lg:px-8 max-w-6xl py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {PRICING_PLANS.map((plan) => (
                <PricingPlanCard
                  key={plan.id}
                  plan={plan}
                  billingCycle={billingCycle}
                />
              ))}
            </div>
          </section>

          {/* Value Props & Direct ROI */}
          <PricingValueProps />

          {/* Quick FAQ */}
          <PricingFaqSection />
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
