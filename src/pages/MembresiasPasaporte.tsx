import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Crown, Sparkles } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Gratis",
    price: "US$0",
    cadence: "sin suscripción",
    multiplier: "1×",
    icon: Sparkles,
    benefits: ["Pasaporte Digital y reglas de participación", "XP, ligas y recompensas según las reglas vigentes", "Acceso al catálogo de premios sujeto a disponibilidad"],
  },
  {
    name: "Pasaporte RD VIP Anual",
    price: "US$59.99",
    cadence: "por año · precio configurado",
    multiplier: "2× puntos de fidelización",
    icon: BadgeCheck,
    benefits: ["Beneficios VIP configurados para operadores participantes", "Descuento configurado del 15% en tours certificados", "Acceso prioritario a eventos en vivo", "Insignia VIP y soporte concierge"],
  },
  {
    name: "Pasaporte RD Elite",
    price: "US$119.99",
    cadence: "por año · precio configurado",
    multiplier: "2.5× puntos de fidelización",
    icon: Crown,
    benefits: ["Incluye beneficios configurados del plan VIP", "Asistencia al viajero nacional incluida en el plan", "Acceso backstage en festivales asociados"],
  },
];

export default function MembresiasPasaporte() {
  return (
    <PageTransition>
      <SEOHead title="Membresías Pasaporte RD" description="Compara el acceso gratuito y los planes VIP configurados para Pasaporte RD. Consulta beneficios, multiplicadores y estado de disponibilidad." />
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main>
          <section className="bg-[#0b3c36] text-white">
            <div className="container mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
              <Badge className="border-white/20 bg-white/10 text-emerald-100">Pasaporte RD</Badge>
              <h1 className="mt-5 max-w-3xl font-display text-4xl font-black md:text-5xl">Compara el acceso gratuito con los planes VIP</h1>
              <p className="mt-5 max-w-2xl leading-7 text-emerald-50/80">Los precios y beneficios siguientes provienen de la configuración inicial del servicio y pueden cambiar. Esta página informa la propuesta, pero todavía no procesa suscripciones ni pagos.</p>
            </div>
          </section>
          <section className="container mx-auto grid max-w-7xl gap-5 px-4 py-12 md:grid-cols-3 md:px-8">
            {plans.map((plan, index) => (
              <article key={plan.name} className={`flex flex-col rounded-2xl border bg-card p-6 ${index === 1 ? "border-primary shadow-lg" : "border-border"}`}>
                <plan.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                <h2 className="mt-4 font-display text-xl font-bold">{plan.name}</h2>
                <p className="mt-4 text-3xl font-black tabular-nums">{plan.price}</p>
                <p className="text-sm text-muted-foreground">{plan.cadence}</p>
                <p className="mt-5 rounded-lg bg-primary/5 p-3 text-sm font-semibold">{plan.multiplier}</p>
                <ul className="mt-5 flex-1 space-y-3 text-sm leading-6 text-muted-foreground">
                  {plan.benefits.map((benefit) => <li key={benefit} className="flex gap-2"><span className="text-primary" aria-hidden="true">✓</span>{benefit}</li>)}
                </ul>
              </article>
            ))}
          </section>
          <section className="container mx-auto max-w-7xl px-4 pb-14 md:px-8">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
              <h2 className="font-semibold">Disponibilidad y condiciones</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">El servicio contiene planes de referencia, pero la interfaz de compra y el cobro real todavía no están habilitados. La inclusión de descuentos, asistencia y acceso a eventos depende de acuerdos vigentes con los proveedores; confirma su disponibilidad antes de viajar. No introduzcas datos de pago en esta página.</p>
              <div className="mt-4 flex flex-wrap gap-4">
                <Button asChild variant="outline"><Link to="/gamificacion-turistica/recompensas">Ver catálogo de recompensas <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                <Link className="self-center text-sm text-primary hover:underline" to="/centro-ayuda">Consultar el centro de ayuda</Link>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
}
