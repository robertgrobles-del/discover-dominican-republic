import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Check, ShieldCheck, Sparkles, TrendingUp, Users, 
  MessageSquare, Star, ArrowRight, Zap, Building2, 
  Store, UtensilsCrossed, Hotel, Compass, Award, PhoneCall,
  Eye, HelpCircle, ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { ClaimBusinessModal } from "@/components/business/ClaimBusinessModal";

export default function PricingPlan() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  const plans = [
    {
      id: "gratis",
      name: "Ficha Básica",
      tagline: "Presencia esencial en el directorio oficial dominicano",
      priceMonthly: 0,
      priceAnnual: 0,
      badge: "Gratis Para Siempre",
      popular: false,
      features: [
        "Ficha pública en el directorio nacional",
        "Información básica (nombre, dirección y mapa)",
        "Hasta 3 fotografías de baja/media resolución",
        "Horario comercial de atención",
        "Aparición en búsquedas generales del destino",
        "Acceso básico al panel de autogestión",
      ],
      notIncluded: [
        "Botón directo de WhatsApp / Llamada inmediata",
        "Galería HD completa y menús/habitaciones",
        "Sello dorado Verificado MITUR",
        "Protección contra publicidad de competidores en su ficha",
        "Métricas avanzadas de clientes potenciales (leads)",
        "Posicionamiento prioritario en resultados"
      ],
      ctaText: "Reclamar Ficha Gratis",
      ctaVariant: "outline" as const
    },
    {
      id: "premium",
      name: "Plan Premium",
      tagline: "Captación directa de clientes, leads a WhatsApp y cero competidores",
      priceMonthly: 49,
      priceAnnual: 39,
      badge: "Más Recomendado • Autoservicio",
      popular: true,
      features: [
        "Todo lo incluido en el Plan Básico",
        "Botón directo de WhatsApp y llamada con 1 clic",
        "Galería de fotos y videos HD ilimitada",
        "Catálogo completo de habitaciones / menú / tours",
        "Ficha bilingüe optimizada (Español e Inglés)",
        "Ficha libre de competidores anunciados",
        "Sello 'Verificado MITUR' (sujeto a validación de licencia)",
        "Panel con analítica de leads (llamadas, WhatsApp y clics a ruta)",
        "Publicación de ofertas y promociones especiales"
      ],
      notIncluded: [
        "Posición #1 garantizada en la categoría del destino",
        "Campañas de Banners display en la red oficial",
        "Reportaje editorial dedicado en la Revista Descubre RD"
      ],
      ctaText: "Comenzar Prueba Premium",
      ctaVariant: "default" as const
    },
    {
      id: "destacado",
      name: "Plan Destacado Exclusivo",
      tagline: "Dominio absoluto del destino turístico con cupos limitados",
      priceMonthly: 189,
      priceAnnual: 149,
      badge: "Exclusivo • Cupos Limitados",
      popular: false,
      features: [
        "Todo lo incluido en el Plan Premium",
        "Posición #1 destacada en el destino y categoría",
        "Etiqueta distintiva dorada 'Establecimiento Destacado'",
        "Rotación en banners oficiales de alta visibilidad (980x120 y Skyscrapers)",
        "Artículo editorial completo en la Revista Descubre RD",
        "Inclusión prioritaria en itinerarios generados por el Chatbot IA",
        "Recepción de solicitudes de cotización grupal (MICE y bodas)",
        "Asesor dedicado de cuenta y soporte prioritario 24/7",
        "Facturación fiscal dominicana con NCF"
      ],
      notIncluded: [],
      ctaText: "Solicitar Cupo Exclusivo",
      ctaVariant: "default" as const
    }
  ];

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
              {plans.map((plan) => {
                const price = billingCycle === "annual" ? plan.priceAnnual : plan.priceMonthly;

                return (
                  <div 
                    key={plan.id}
                    className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                      plan.popular 
                        ? "bg-card border-2 border-primary shadow-2xl scale-[1.02] z-10" 
                        : "bg-card/70 border border-border shadow-md hover:border-border/80"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground font-bold text-xs uppercase px-4 py-1 shadow-md">
                          {plan.badge}
                        </Badge>
                      </div>
                    )}

                    <div>
                      {!plan.popular && (
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                          {plan.badge}
                        </div>
                      )}
                      
                      <h3 className="text-2xl font-bold font-display text-foreground mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-6 min-h-[36px]">
                        {plan.tagline}
                      </p>

                      {/* Pricing Display */}
                      <div className="mb-6 pb-6 border-b border-border">
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-extrabold font-display text-foreground">
                            ${price}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            USD / mes {billingCycle === "annual" && price > 0 ? "(facturado anualmente)" : ""}
                          </span>
                        </div>
                        {price === 0 && (
                          <span className="text-xs text-emerald-500 font-semibold mt-1 inline-block">
                            Sin tarjeta de crédito requerida
                          </span>
                        )}
                      </div>

                      {/* Features */}
                      <div className="space-y-3 mb-8">
                        <div className="text-xs font-bold uppercase text-foreground/80 tracking-wider">
                          Qué incluye:
                        </div>
                        {plan.features.map((feat, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                            <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="leading-snug">{feat}</span>
                          </div>
                        ))}

                        {plan.notIncluded.length > 0 && (
                          <div className="pt-2 space-y-2 opacity-50">
                            {plan.notIncluded.map((feat, i) => (
                              <div key={i} className="flex items-start gap-2.5 text-xs line-through text-muted-foreground">
                                <span className="h-4 w-4 flex items-center justify-center text-xs flex-shrink-0">✕</span>
                                <span className="leading-snug">{feat}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div>
                      <ClaimBusinessModal
                        businessName="Tu Empresa"
                        businessType="otro"
                        triggerButton={
                          <Button 
                            variant={plan.popular ? "default" : "outline"} 
                            className={`w-full rounded-xl py-6 font-bold text-sm shadow-sm gap-2 ${
                              plan.popular ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
                            }`}
                          >
                            {plan.ctaText}
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Value Props & Direct ROI */}
          <section className="container mx-auto px-4 lg:px-8 max-w-5xl py-12">
            <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 shadow-sm">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-3">
                  ¿Por qué los negocios turísticos eligen Descubre RD?
                </h2>
                <p className="text-sm text-muted-foreground">
                  A diferencia de OTAs internacionales que cobran entre 15% y 25% de comisión, aquí tú eres dueño directo de tus clientes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div className="space-y-3 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto sm:mx-0">
                    <PhoneCall className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-base text-foreground">Cero Comisiones por Reserva</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Los turistas hacen clic directamente a tu número de WhatsApp o formulario. No retenemos pagos ni cobramos cargos por cliente ganado.
                  </p>
                </div>

                <div className="space-y-3 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto sm:mx-0">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-base text-foreground">Sello Verificado MITUR</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Valida tu licencia oficial de turismo de República Dominicana para obtener la insignia oficial que genera máxima confianza ante extranjeros.
                  </p>
                </div>

                <div className="space-y-3 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto sm:mx-0">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-base text-foreground">Analítica Real de Leads</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Conoce exactamente cuántos visitantes llamaron a tu negocio, abrieron la ruta en GPS y consultaron tu carta o habitaciones cada mes.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Quick FAQ */}
          <section className="container mx-auto px-4 lg:px-8 max-w-4xl py-8">
            <h2 className="text-2xl font-bold font-display text-center text-foreground mb-8">
              Preguntas Frecuentes de Empresas
            </h2>
            <div className="space-y-4">
              <div className="bg-card border border-border p-5 rounded-2xl">
                <h4 className="font-bold text-sm text-foreground mb-1">
                  ¿Cómo reclamo un negocio que ya aparece en el portal?
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Busca la ficha de tu hotel, restaurante o bar en el directorio y haz clic en el botón <strong>"¿Eres el propietario? Reclama tu ficha"</strong>. Tras validar tus datos y titularidad con el RNC o licencia comercial, recibirás acceso a tu panel.
                </p>
              </div>

              <div className="bg-card border border-border p-5 rounded-2xl">
                <h4 className="font-bold text-sm text-foreground mb-1">
                  ¿Emiten comprobante fiscal (NCF) en República Dominicana?
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sí. Todas nuestras suscripciones y planes publicitarios cuentan con factura electrónica fiscal (B01 con valor fiscal o B02 consumidor final) autorizada por la DGII.
                </p>
              </div>

              <div className="bg-card border border-border p-5 rounded-2xl">
                <h4 className="font-bold text-sm text-foreground mb-1">
                  ¿Puedo cambiar de plan o cancelar en cualquier momento?
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Totalmente. Los planes no tienen permanencia forzosa. Puedes actualizar a Destacado o volver al plan básico gratuito cuando lo desees desde tu panel.
                </p>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
