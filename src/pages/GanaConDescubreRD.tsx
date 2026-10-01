import { ArrowRight, Camera, Compass, Gift, HandCoins, MapPin, Store, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const paths = [
  {
    icon: Compass,
    eyebrow: "Para quien explora",
    title: "Viaja, participa y colecciona",
    description: "Registra visitas y completa actividades del Pasaporte. Las acciones elegibles pueden sumar XP, monedas o progreso, de acuerdo con las reglas vigentes.",
    href: "/gamificacion-turistica",
    action: "Explorar el Pasaporte",
    tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  {
    icon: HandCoins,
    eyebrow: "Para quien recomienda",
    title: "Comparte como embajador",
    description: "Solicita participar, comparte enlaces atribuibles y consulta las condiciones de elegibilidad, validación y pago del programa.",
    href: "/afiliados",
    action: "Conocer el programa",
    tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  {
    icon: Camera,
    eyebrow: "Para quien crea",
    title: "Publica historias de RD",
    description: "Presenta tu contenido al programa de creadores. Las oportunidades, licencias y pagos dependen de revisión y acuerdos específicos.",
    href: "/creadores",
    action: "Ver el programa",
    tone: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  {
    icon: Store,
    eyebrow: "Para negocios y destinos",
    title: "Participa como aliado",
    description: "Explora opciones de patrocinio y campañas. El alcance, la inversión y las entregas se confirman para cada propuesta.",
    href: "/para-empresas",
    action: "Ver opciones para empresas",
    tone: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  {
    icon: Gift,
    eyebrow: "Para quien canjea",
    title: "Revisa premios y beneficios",
    description: "Consulta el catálogo y sus condiciones. La disponibilidad de cada premio y los requisitos de canje pueden variar.",
    href: "/gamificacion-turistica/recompensas",
    action: "Ver catálogo de premios",
    tone: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
  {
    icon: Crown,
    eyebrow: "Para quien viaja con frecuencia",
    title: "Compara Pasaporte RD VIP",
    description: "Revisa los precios y beneficios configurados. La compra aún no está habilitada y los beneficios dependen de acuerdos activos.",
    href: "/membresias-pasaporte",
    action: "Comparar membresías",
    tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
];

export default function GanaConDescubreRD() {
  return (
    <PageTransition>
      <SEOHead
        title="Participa y gana con Descubre RD"
        description="Conoce las formas de participar en el Pasaporte Digital, el programa de embajadores, creadores, aliados y membresías de Descubre RD."
      />
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main>
          <section className="relative isolate overflow-hidden border-b border-border bg-[#0b3c36] text-white">
            <div className="absolute inset-0 -z-10 opacity-25" aria-hidden="true">
              <div className="absolute -right-24 -top-48 h-[34rem] w-[34rem] rounded-full border border-emerald-200/50" />
              <div className="absolute -right-6 -top-28 h-[27rem] w-[27rem] rounded-full border border-emerald-200/40" />
              <div className="absolute right-12 top-[-3rem] h-[19rem] w-[19rem] rounded-full border border-emerald-200/30" />
              <MapPin className="absolute right-[14rem] top-[11rem] h-8 w-8 text-amber-300" />
              <span className="absolute right-[8rem] top-[15rem] h-2 w-2 rounded-full bg-amber-300" />
            </div>
            <div className="container mx-auto grid max-w-7xl gap-12 px-4 py-20 md:grid-cols-[1.1fr_.9fr] md:items-center md:px-8 md:py-28">
              <div className="max-w-2xl">
                <Badge className="mb-6 border-white/20 bg-white/10 text-emerald-100 hover:bg-white/10">Una ruta para cada forma de participar</Badge>
                <h1 className="font-display text-4xl font-black leading-[1.06] tracking-tight sm:text-5xl md:text-6xl">
                  Tu viaje puede dejar <span className="text-amber-300">más que recuerdos.</span>
                </h1>
                <p className="mt-6 max-w-xl text-base leading-7 text-emerald-50/85 md:text-lg">
                  Explora, recomienda, crea o conecta tu negocio con quienes descubren República Dominicana. Elige un camino y conoce sus reglas antes de empezar.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild size="lg" className="bg-amber-300 text-emerald-950 hover:bg-amber-200">
                    <a href="#elige-tu-camino">Elegir un camino <ArrowRight className="ml-2 h-4 w-4" /></a>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-white/35 bg-transparent text-white hover:bg-white/10 hover:text-white">
                    <Link to="/reglas-gamificacion">Ver reglas de participación</Link>
                  </Button>
                </div>
              </div>
              <div className="relative mx-auto w-full max-w-md md:ml-auto">
                <div className="absolute left-8 top-8 h-[calc(100%-4rem)] border-l border-dashed border-emerald-200/60" aria-hidden="true" />
                <div className="relative space-y-4">
                  {[
                    ["01", "Explora", "Descubre un lugar"],
                    ["02", "Participa", "Registra una acción válida"],
                    ["03", "Comparte", "Invita a más personas"],
                    ["04", "Crea", "Cuenta tu propia historia"],
                  ].map(([number, title, text]) => (
                    <div key={number} className="relative flex items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.07] p-4 backdrop-blur-sm">
                      <span className="z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-amber-300/70 bg-[#0b3c36] font-mono text-xs text-amber-200">{number}</span>
                      <div><p className="font-semibold">{title}</p><p className="text-sm text-emerald-50/70">{text}</p></div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-right text-xs uppercase tracking-[.18em] text-emerald-100/60">Una comunidad que recorre el país</p>
              </div>
            </div>
          </section>

          <section id="elige-tu-camino" className="container mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
            <div className="mb-10 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">Encuentra tu lugar</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">Seis formas de ser parte</h2>
              <p className="mt-3 text-muted-foreground">Cada programa tiene condiciones distintas. Puedes empezar por el que mejor encaja contigo.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {paths.map((path) => (
                <article key={path.href} className="group flex min-h-[18rem] flex-col border-t-2 border-border bg-card p-6 transition-colors hover:border-primary">
                  <div className={`grid h-11 w-11 place-items-center rounded-xl ${path.tone}`}><path.icon className="h-5 w-5" aria-hidden="true" /></div>
                  <p className="mt-6 text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">{path.eyebrow}</p>
                  <h3 className="mt-2 font-display text-xl font-bold">{path.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{path.description}</p>
                  <Button asChild variant="link" className="mt-5 h-auto justify-start p-0 text-primary">
                    <Link to={path.href}>{path.action}<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
                  </Button>
                </article>
              ))}
            </div>
          </section>

          <section className="border-y border-border bg-muted/35">
            <div className="container mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[.8fr_1.2fr] md:items-center md:px-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">Transparencia</p>
                <h2 className="mt-3 font-display text-2xl font-bold">Las recompensas dependen de las reglas del programa.</h2>
              </div>
              <p className="leading-7 text-muted-foreground">
                Consultar una ficha no genera puntos por sí solo. Las acciones del Pasaporte se validan según sus reglas; las comisiones se calculan sobre ventas elegibles confirmadas; y las colaboraciones con creadores requieren revisión y acuerdos propios. Ninguna cifra de esta página es una promesa de ingresos.
              </p>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
}
