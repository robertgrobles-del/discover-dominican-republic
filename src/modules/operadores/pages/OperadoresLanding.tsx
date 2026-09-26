import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Check, CalendarCheck, Percent, Star, Users, TrendingUp,
  Shield, Globe, Zap, BarChart3, MessageSquare, Compass, BedDouble,
  Car, Package, HeartHandshake, ChevronRight, Play
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AUDIENCES, COMMISSION_RATE, GENERAL_FAQ, MARKETPLACE_TYPICAL_COMMISSION,
  NINE_REASONS, ONBOARDING_STEPS, OPERATOR_FEATURES,
} from "../constants";

// ── Testimonials ─────────────────────────────────────────────────────────────
const testimonials = [
  {
    name: "Carlos Féliz",
    role: "Guía turístico certificado, Samaná",
    avatar: "CF",
    text: "En tres meses triplicé mis reservas directas. Ahora no dependo de las comisiones abusivas de los marketplaces.",
    rating: 5,
  },
  {
    name: "Laura Reyes",
    role: "Directora, EcoTours Jarabacoa",
    avatar: "LR",
    text: "El calendario y el chat integrado me ahorraron horas de trabajo. Mis clientes reservan solos, a cualquier hora.",
    rating: 5,
  },
  {
    name: "Roberto Marte",
    role: "Propietario, Villa Bonita Bávaro",
    avatar: "RM",
    text: "La integración con el portal Descubre RD nos da visibilidad que no podíamos pagar de otra manera.",
    rating: 5,
  },
];

// ── Category icons ────────────────────────────────────────────────────────────
const categoryIcons = [
  { icon: Compass, label: "Tours & Excursiones", count: "340+" },
  { icon: BedDouble, label: "Alojamientos", count: "180+" },
  { icon: Car, label: "Transportes", count: "95+" },
  { icon: Package, label: "Paquetes Completos", count: "60+" },
  { icon: HeartHandshake, label: "Voluntariados", count: "25+" },
];

// ─────────────────────────────────────────────────────────────────────────────
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
        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative pt-28 pb-20 overflow-hidden">
          {/* BG */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-background" />
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none">
            <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent" />
          </div>

          <div className="relative container mx-auto px-4 grid lg:grid-cols-2 gap-14 items-center">
            {/* Left */}
            <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-5">
                <Zap className="h-3.5 w-3.5" />
                Para operadores turísticos de RD
              </span>
              <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05] text-foreground">
                Más reservas directas.{" "}
                <span className="text-primary">Menos trabajo manual.</span>
              </h1>
              <p className="mt-5 text-lg text-muted-foreground max-w-xl leading-relaxed">
                Publica tus servicios, controla tu calendario, habla con tus viajeros
                y cobra en línea — todo desde un solo lugar, conectado al portal turístico oficial.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" asChild className="rounded-full gap-2 shadow-lg shadow-primary/25">
                  <Link to="/operadores/panel">
                    Empezar gratis <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="rounded-full gap-2">
                  <Link to="/operadores/directorio">
                    <Play className="h-4 w-4" />
                    Ver directorio
                  </Link>
                </Button>
              </div>

              <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {["Sin mensualidad", "Listo en 48 horas", "Integrado con Descubre RD", "Soporte en español"].map((t) => (
                  <li key={t} className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-primary shrink-0" /> {t}
                  </li>
                ))}
              </ul>

              {/* Social proof strip */}
              <div className="mt-8 flex items-center gap-3 pt-6 border-t border-border/50">
                <div className="flex -space-x-2">
                  {["CF", "LR", "RM", "JP"].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-[10px] font-bold text-primary">
                      {i}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">+700 operadores activos</p>
                </div>
              </div>
            </motion.div>

            {/* Right — Dashboard preview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="shadow-2xl shadow-primary/10 border-primary/20 overflow-hidden">
                <div className="bg-gradient-to-r from-primary/15 to-primary/5 border-b border-border/50 px-5 py-3 flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                  <span className="ml-3 text-xs text-muted-foreground font-medium">Panel del operador</span>
                </div>
                <CardContent className="p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      { v: "24", l: "Reservas", icon: CalendarCheck, color: "text-primary" },
                      { v: "US$3,420", l: "Ventas", icon: TrendingUp, color: "text-emerald-500" },
                      { v: "4.9★", l: "Calificación", icon: Star, color: "text-yellow-500" },
                    ].map(({ v, l, icon: Icon, color }) => (
                      <div key={l} className="rounded-2xl bg-secondary/50 border border-border/60 p-3">
                        <Icon className={`h-4 w-4 ${color} mx-auto mb-1`} />
                        <p className="font-display font-bold text-base text-foreground">{v}</p>
                        <p className="text-[10px] text-muted-foreground">{l}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {[
                      { t: "Rafting Río Yaque del Norte", s: "confirmed", d: "Hoy 9:00am · 6 pers." },
                      { t: "Tour Zona Colonial a pie", s: "pending", d: "Mañana 10:00am · 4 pers." },
                      { t: "Cascada El Limón a caballo", s: "pending", d: "Vie 8:00am · 8 pers." },
                    ].map(({ t, s, d }) => (
                      <div key={t} className="flex items-start justify-between rounded-xl border border-border/60 bg-card p-3 text-sm gap-3">
                        <div>
                          <p className="font-medium text-foreground text-xs leading-snug">{t}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{d}</p>
                        </div>
                        <Badge
                          variant={s === "confirmed" ? "default" : "secondary"}
                          className={`shrink-0 text-[9px] ${s === "confirmed" ? "bg-emerald-600 text-white" : ""}`}
                        >
                          {s === "confirmed" ? "✓ Confirmada" : "Pendiente"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Button size="sm" asChild className="w-full rounded-xl text-xs gap-1.5">
                    <Link to="/operadores/panel">Ir a mi panel <ChevronRight className="h-3.5 w-3.5" /></Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* ── CATEGORY STRIP ───────────────────────────────────────────── */}
        <section className="border-y border-border bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 divide-x divide-border">
              {categoryIcons.map(({ icon: Icon, label, count }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 py-5 px-3 text-center">
                  <Icon className="h-5 w-5 text-primary" />
                  <p className="text-xs font-semibold text-foreground">{label}</p>
                  <p className="text-[10px] text-muted-foreground">{count} servicios</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES GRID ────────────────────────────────────────────── */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                Todo lo que necesitas para vender y operar
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Cinco herramientas conectadas. Una sola plataforma. Cero complicaciones.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {OPERATOR_FEATURES.map((f, i) => (
                <motion.div
                  key={f.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link to={`/operadores/funciones/${f.slug}`} className="group block h-full">
                    <Card className="h-full border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-0.5">
                      <CardContent className="p-6 h-full flex flex-col">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                          <f.icon className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-display font-bold text-lg mb-2 text-foreground">{f.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{f.lead}</p>
                        <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary gap-1 group-hover:gap-2 transition-all">
                          Ver más <ArrowRight className="h-4 w-4" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
              <Link to="/tienda" className="group block h-full">
                <Card className="h-full border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-0.5">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <CalendarCheck className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-display font-bold text-lg mb-2 text-foreground">Tienda oficial</h3>
                    <p className="text-sm text-muted-foreground flex-1">Merchandising de Descubre RD para viajeros y equipos de operadores.</p>
                    <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary gap-1 group-hover:gap-2 transition-all">
                      Visitar tienda <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* ── PRICING COMPARISON ───────────────────────────────────────── */}
        <section className="py-20 bg-gradient-to-b from-secondary/20 to-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
                <Percent className="h-3.5 w-3.5" />
                Precios transparentes
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                Solo pagas por reservas que se concretizan
              </h2>
              <p className="text-muted-foreground">Sin cuotas mensuales. Sin costos de instalación. Sin sorpresas.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="border-2 border-primary shadow-xl shadow-primary/10 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-primary/60" />
                <CardContent className="p-8 text-center">
                  <Badge className="mb-3 bg-primary/10 text-primary border-primary/25">Operadores RD</Badge>
                  <p className="font-display text-7xl font-extrabold text-primary my-3">{COMMISSION_RATE}%</p>
                  <p className="text-sm text-muted-foreground">por reserva pagada en tu sitio.</p>
                  <p className="text-xs text-muted-foreground mt-2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 rounded-full px-3 py-1 inline-block mt-3">
                    ✓ Las reservas manuales no pagan comisión
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border relative">
                <CardContent className="p-8 text-center">
                  <Badge variant="outline" className="mb-3">Marketplaces tradicionales</Badge>
                  <p className="font-display text-7xl font-extrabold text-muted-foreground/50 my-3">~{MARKETPLACE_TYPICAL_COMMISSION}%</p>
                  <p className="text-sm text-muted-foreground">comisión típica, más tarifas por captación de clientes y suscripciones adicionales.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ── NINE REASONS ─────────────────────────────────────────────── */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                Nueve razones para mover tu operación
              </h2>
              <p className="text-muted-foreground">Por qué cientos de operadores turísticos confían en Operadores RD.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {NINE_REASONS.map((r, i) => (
                <motion.div
                  key={r.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card className="h-full border-border hover:border-primary/30 hover:shadow-md transition-all">
                    <CardContent className="p-5 flex gap-4">
                      <div className="shrink-0">
                        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                          <r.icon className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] text-primary font-mono mb-0.5 font-bold">{String(i + 1).padStart(2, "0")}</p>
                        <p className="font-semibold text-foreground text-sm">{r.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
        <section className="py-20 bg-secondary/20 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-foreground mb-2">Lo que dicen los operadores</h2>
              <p className="text-muted-foreground text-sm">Testimonios reales de profesionales del turismo en RD.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full border-border hover:shadow-lg transition-all">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-center gap-0.5 mb-4">
                        {[...Array(t.rating)].map((_, j) => (
                          <Star key={j} className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        ))}
                      </div>
                      <blockquote className="text-sm text-muted-foreground leading-relaxed flex-1 italic">
                        "{t.text}"
                      </blockquote>
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50">
                        <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {t.avatar}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">{t.name}</p>
                          <p className="text-[10px] text-muted-foreground">{t.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── AUDIENCES ────────────────────────────────────────────────── */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-foreground mb-3">
                ¿Para quién es Operadores RD?
              </h2>
              <p className="text-muted-foreground">Para todos los que promueven el turismo dominicano.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {AUDIENCES.map((a, i) => (
                <motion.div
                  key={a.title}
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className="h-full text-center border-border hover:border-primary/30 hover:shadow-md transition-all p-2">
                    <CardContent className="p-5">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <p className="font-display font-bold text-foreground mb-2">{a.title}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{a.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ONBOARDING STEPS ─────────────────────────────────────────── */}
        <section className="py-20 bg-secondary/20 border-y border-border">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-foreground mb-3">
                Tu primera reserva automatizada en minutos
              </h2>
              <p className="text-muted-foreground">Proceso simple, sin tecnicismos.</p>
            </div>
            <ol className="space-y-5 relative">
              <div className="absolute left-5 top-5 bottom-5 w-px bg-border/60" />
              {ONBOARDING_STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-5 relative">
                  <span className="h-10 w-10 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-md shadow-primary/25 z-10">
                    {i + 1}
                  </span>
                  <Card className="flex-1 border-border">
                    <CardContent className="p-4">
                      <p className="font-semibold text-foreground">{s.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</p>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl font-bold text-foreground mb-2">Preguntas frecuentes</h2>
              <p className="text-muted-foreground text-sm">Todo lo que necesitas saber antes de empezar.</p>
            </div>
            <Accordion type="single" collapsible className="bg-card rounded-2xl border border-border px-4 shadow-sm">
              {GENERAL_FAQ.map((f, i) => (
                <AccordionItem key={f.q} value={`q${i}`}>
                  <AccordionTrigger className="text-left font-medium text-foreground">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ── CTA FINAL ────────────────────────────────────────────────── */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground text-center p-10 md:p-16 relative overflow-hidden shadow-2xl shadow-primary/20"
            >
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,_white_0%,_transparent_70%)]" />
              <div className="relative">
                <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-6">
                  <Shield className="h-3.5 w-3.5" />
                  Sin riesgo · Sin mensualidad
                </span>
                <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight">
                  Empieza a generar reservas<br className="hidden md:block" /> automatizadas hoy mismo
                </h2>
                <p className="opacity-85 mb-8 max-w-xl mx-auto text-lg">
                  Crea tu organización, publica tu primer servicio y comparte tu sitio de reservas.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button size="lg" variant="secondary" asChild className="rounded-full gap-2 shadow-lg">
                    <Link to="/operadores/panel">
                      Empezar ahora <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full bg-transparent border-white/30 text-white hover:bg-white/15 gap-2"
                    asChild
                  >
                    <Link to="/partners">
                      <Globe className="h-4 w-4" />
                      Programa de socios
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </PageTransition>
  );
}
