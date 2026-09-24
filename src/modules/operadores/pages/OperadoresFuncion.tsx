import { Link, useParams } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OPERATOR_FEATURES } from "../constants";

export default function OperadoresFuncion() {
  const { feature } = useParams();
  const f = OPERATOR_FEATURES.find((x) => x.slug === feature);
  const others = OPERATOR_FEATURES.filter((x) => x.slug !== feature).slice(0, 3);

  if (!f) {
    return (
      <PageTransition>
        <SEOHead title="Función no encontrada — Operadores RD" description="La función que buscas no existe." />
        <Header variant="white" />
        <main className="min-h-[60vh] flex flex-col items-center justify-center gap-4 pt-24">
          <h1 className="font-display text-2xl font-bold">Función no encontrada</h1>
          <Button asChild><Link to="/operadores">Volver a Operadores RD</Link></Button>
        </main>
        <Footer />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <SEOHead title={`${f.title} — Operadores RD`} description={f.lead} />
      <Header variant="white" />
      <main>
        <section className="pt-28 pb-14 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <Badge variant="secondary" className="mb-4 gap-1"><f.icon className="h-3 w-3" /> {f.kicker}</Badge>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">{f.headline}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{f.lead}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" asChild><Link to="/operadores/panel">Empezar ahora <ArrowRight className="h-4 w-4 ml-2" /></Link></Button>
              <Button size="lg" variant="outline" asChild><Link to="/operadores">Ver todas las funciones</Link></Button>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 max-w-4xl grid gap-3 sm:grid-cols-2">
            {f.bullets.map((b) => (
              <Card key={b}><CardContent className="p-5 flex gap-3"><Check className="h-5 w-5 text-primary shrink-0 mt-0.5" /><p className="text-sm">{b}</p></CardContent></Card>
            ))}
          </div>
        </section>

        <section className="py-12 bg-secondary/40">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-display text-2xl font-bold mb-6 text-center">Preguntas sobre {f.title}</h2>
            <Accordion type="single" collapsible className="bg-card rounded-xl border border-border px-4">
              {f.faq.map((q, i) => (
                <AccordionItem key={q.q} value={`q${i}`}><AccordionTrigger className="text-left">{q.q}</AccordionTrigger><AccordionContent className="text-muted-foreground">{q.a}</AccordionContent></AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="py-14">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-display text-2xl font-bold mb-6">Otras funcionalidades</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {others.map((o) => (
                <Link key={o.slug} to={`/operadores/funciones/${o.slug}`}><Card className="h-full hover:border-primary/50 transition-colors"><CardContent className="p-5">
                  <o.icon className="h-6 w-6 text-primary mb-2" /><p className="font-semibold">{o.title}</p><p className="text-sm text-muted-foreground line-clamp-2">{o.lead}</p>
                </CardContent></Card></Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </PageTransition>
  );
}
