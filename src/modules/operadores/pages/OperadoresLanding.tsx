import { Link } from "react-router-dom";
import { ArrowRight, Check, CalendarCheck, Percent } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AUDIENCES, COMMISSION_RATE, GENERAL_FAQ, MARKETPLACE_TYPICAL_COMMISSION, NINE_REASONS, ONBOARDING_STEPS, OPERATOR_FEATURES,
} from "../constants";

export default function OperadoresLanding() {
  return (
    <PageTransition>
      <SEOHead
        title="Operadores RD: reservas directas para tours, alojamientos y transporte"
        description="Publica tus servicios, recibe reservas y cobra en línea desde tu propio sitio. Sin mensualidad: solo pagas 8 % por reservas realizadas en tu web."
        keywords="reservas directas, operadores turísticos, tour operadores república dominicana, sitio de reservas, crm turístico"
      />
      <Header variant="white" />

      <main>
        <section className="pt-28 pb-16 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">Para operadores turísticos</Badge>
              <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
                Más reservas directas. <span className="text-primary">Menos trabajo manual.</span>
              </h1>
              <p className="mt-5 text-lg text-muted-foreground max-w-xl">
                Una plataforma para guías, tour operadores, agencias, alojamientos y transportes: publica tus servicios, controla tu calendario,
                habla con tus viajeros y cobra en línea, todo desde un solo lugar y conectado al portal turístico oficial.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" asChild><Link to="/operadores/panel">Empezar ahora <ArrowRight className="h-4 w-4 ml-2" /></Link></Button>
                <Button size="lg" variant="outline" asChild><Link to="/operadores/directorio">Ver operadores</Link></Button>
              </div>
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-1"><Check className="h-4 w-4 text-primary" /> Sin mensualidad</li>
                <li className="flex items-center gap-1"><Check className="h-4 w-4 text-primary" /> Listo en 48 horas</li>
                <li className="flex items-center gap-1"><Check className="h-4 w-4 text-primary" /> Se integra con Descubre RD</li>
              </ul>
            </div>
            <Card className="shadow-xl"><CardContent className="p-6 space-y-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Vista previa del panel</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[["24", "Reservas del mes"], ["US$ 3,420", "Ventas"], ["4.9", "Calificación"]].map(([v, l]) => (
                  <div key={l} className="rounded-xl bg-muted p-3"><p className="font-display font-bold text-lg">{v}</p><p className="text-[11px] text-muted-foreground">{l}</p></div>
                ))}
              </div>
              <div className="space-y-2">
                {["Rafting en el río Yaque del Norte", "Tour a pie por la Zona Colonial", "Cascada El Limón a caballo"].map((t, i) => (
                  <div key={t} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"><span>{t}</span><Badge variant={i === 0 ? "default" : "secondary"}>{i === 0 ? "Confirmada" : "Pendiente"}</Badge></div>
                ))}
              </div>
            </CardContent></Card>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl font-bold text-center mb-2">Todo lo que necesitas para vender y operar</h2>
            <p className="text-center text-muted-foreground mb-10">Cinco herramientas conectadas entre sí.</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {OPERATOR_FEATURES.map((f) => (
                <Link key={f.slug} to={`/operadores/funciones/${f.slug}`} className="group">
                  <Card className="h-full transition-colors group-hover:border-primary/50"><CardContent className="p-6">
                    <f.icon className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-display font-bold text-lg mb-1">{f.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">{f.lead}</p>
                    <span className="mt-3 inline-flex items-center text-sm font-medium text-primary">Ver más <ArrowRight className="h-4 w-4 ml-1" /></span>
                  </CardContent></Card>
                </Link>
              ))}
              <Link to="/tienda" className="group">
                <Card className="h-full transition-colors group-hover:border-primary/50"><CardContent className="p-6">
                  <CalendarCheck className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-display font-bold text-lg mb-1">Tienda oficial</h3>
                  <p className="text-sm text-muted-foreground">Merchandising de Descubre RD para viajeros y equipos de operadores.</p>
                  <span className="mt-3 inline-flex items-center text-sm font-medium text-primary">Visitar tienda <ArrowRight className="h-4 w-4 ml-1" /></span>
                </CardContent></Card>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-secondary/40">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <Percent className="h-8 w-8 text-primary mx-auto mb-3" />
            <h2 className="font-display text-3xl font-bold mb-2">Paga solo por reservas realizadas en tu web</h2>
            <p className="text-muted-foreground mb-8">Sin cuotas mensuales ni costos de instalación.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-primary"><CardContent className="p-8"><p className="text-sm text-muted-foreground">Operadores RD</p><p className="font-display text-6xl font-extrabold text-primary my-2">{COMMISSION_RATE}%</p><p className="text-sm">por reserva pagada en tu sitio. Las reservas manuales no pagan comisión.</p></CardContent></Card>
              <Card><CardContent className="p-8"><p className="text-sm text-muted-foreground">Marketplaces tradicionales</p><p className="font-display text-6xl font-extrabold my-2">~{MARKETPLACE_TYPICAL_COMMISSION}%</p><p className="text-sm text-muted-foreground">comisión típica, más tarifas por captación.</p></CardContent></Card>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl font-bold text-center mb-10">Nueve razones para mover tu operación</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {NINE_REASONS.map((r, i) => (
                <Card key={r.title}><CardContent className="p-5">
                  <p className="text-xs text-primary font-mono mb-1">{String(i + 1).padStart(2, "0")}</p>
                  <p className="font-semibold flex items-center gap-2"><r.icon className="h-4 w-4 text-primary" /> {r.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>
                </CardContent></Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-secondary/40">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl font-bold text-center mb-10">Para los que promueven viajar</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {AUDIENCES.map((a) => <Card key={a.title}><CardContent className="p-5"><p className="font-display font-bold mb-1">{a.title}</p><p className="text-sm text-muted-foreground">{a.desc}</p></CardContent></Card>)}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-display text-3xl font-bold text-center mb-10">Tu primera reserva automatizada en minutos</h2>
            <ol className="space-y-4">
              {ONBOARDING_STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-4"><span className="h-9 w-9 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">{i + 1}</span>
                  <div><p className="font-semibold">{s.title}</p><p className="text-sm text-muted-foreground">{s.desc}</p></div></li>
              ))}
            </ol>
          </div>
        </section>

        <section className="py-16 bg-secondary/40">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-display text-3xl font-bold text-center mb-8">Preguntas frecuentes</h2>
            <Accordion type="single" collapsible className="bg-card rounded-xl border border-border px-4">
              {GENERAL_FAQ.map((f, i) => (
                <AccordionItem key={f.q} value={`q${i}`}><AccordionTrigger className="text-left">{f.q}</AccordionTrigger><AccordionContent className="text-muted-foreground">{f.a}</AccordionContent></AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="rounded-3xl bg-primary text-primary-foreground text-center p-10 md:p-16">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Empieza a generar reservas automatizadas</h2>
              <p className="opacity-90 mb-6 max-w-xl mx-auto">Crea tu organización, publica tu primer servicio y comparte tu sitio de reservas.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button size="lg" variant="secondary" asChild><Link to="/operadores/panel">Empezar ahora</Link></Button>
                <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10" asChild><Link to="/partners">Conoce el programa de socios</Link></Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </PageTransition>
  );
}
