import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Camera, Check, Hotel, LayoutDashboard, MapPin, Megaphone, Sparkles, UserPlus, Video, Wallet } from "lucide-react";
import heroBeach from "@/assets/hero-beach.jpg";
import samanaImg from "@/assets/samana.jpg";
import divingImg from "@/assets/diving.jpg";
import hotelImg from "@/assets/hotel-eden-roc.jpg";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import suiteImg from "@/assets/hotel-room-suite.jpg";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PanoramaAd } from "@/components/promo";
import { CreatorsMonetizationInfoCard } from "@/components/creators/CreatorsMonetizationInfoCard";
import { useCreatorDashboard } from "@/lib/creatorDashboard";

const STEPS = [
  { icon: UserPlus, img: samanaImg, place: "Samaná", title: "Crea tu cuenta y tu perfil de creador", text: "Elige tu @ en Descubre RD y añade tus redes. La aprobación es inmediata." },
  { icon: Video, img: divingImg, place: "Bayahíbe", title: "Publica contenido de República Dominicana", text: "Sube videos de destinos, playas, comida o experiencias; el equipo los revisa antes de publicarlos." },
  { icon: Megaphone, img: hotelImg, place: "Hoteles aliados", title: "Únete a campañas y estancias", text: "Acepta campañas de marcas con sus términos a la vista y postúlate a estancias en hoteles aliados." },
  { icon: Wallet, img: puntaCanaImg, place: "Punta Cana", title: "Cobra lo que generas", text: "En tu panel ves lo estimado y lo confirmado, solicitas retiros y abres disputas si algo no cuadra." },
];

const PANEL = [
  { icon: LayoutDashboard, title: "Resumen", text: "Saldo disponible y pendiente, vistas y nivel." },
  { icon: Megaphone, title: "Campañas y promociones", text: "Campañas abiertas, entregas y enlaces de afiliado." },
  { icon: Wallet, title: "Ingresos y pagos", text: "Detalle por concepto, reversos explicados y retiros." },
  { icon: BadgeCheck, title: "Identidad y reputación", text: "Verificación, redes y tu perfil público." },
];

const FAQ = [
  { q: "¿Cuesta algo unirse?", a: "No. Registrarse y publicar contenido es gratis." },
  { q: "¿Necesito muchos seguidores?", a: "No hay un mínimo para registrarse. Algunas campañas y estancias piden un alcance o nicho concreto; lo verás en sus condiciones antes de aceptarlas." },
  { q: "¿Descubre RD puede usar mis videos en publicidad?", a: "Sólo si tú concedes una licencia o aceptas una campaña que lo incluya, con canales, plazo y pago definidos. Publicar no cede derechos comerciales." },
  { q: "¿Cuándo y cómo cobro?", a: "Lo confirmado pasa a tu saldo disponible y puedes solicitar el retiro desde tu panel. Los importes estimados no se pagan hasta confirmarse." },
];

/** Página informativa del programa: qué es, cómo funciona y cómo registrarse. El trabajo diario ocurre en /creadores/panel. */
export default function ProgramaCreadores() {
  const { user, data: dashboard, loading } = useCreatorDashboard();
  const isCreator = !!dashboard;
  const cta = isCreator
    ? { to: "/creadores/panel", label: "Ir a mi panel de creador", icon: LayoutDashboard }
    : user
      ? { to: "/creadores/registro", label: "Registrarme como creador", icon: UserPlus }
      : { to: `/registro?returnTo=${encodeURIComponent("/creadores/registro")}`, label: "Crear cuenta de creador", icon: UserPlus };

  const Cta = ({ big = false }: { big?: boolean }) => (
    <Button asChild size={big ? "lg" : "default"} className="gap-2 rounded-xl font-bold" disabled={loading}>
      <Link to={cta.to}><cta.icon className="h-4 w-4" />{cta.label}<ArrowRight className="h-4 w-4" /></Link>
    </Button>
  );

  return (
    <PageTransition>
      <SEOHead
        title="Programa de Creadores de Contenido | Descubre RD"
        description="Crea contenido de viajes sobre República Dominicana, únete a campañas de marcas y estancias en hoteles aliados, y gestiona tus ingresos desde tu panel de creador."
        keywords="creadores turismo rd, influencers republica dominicana, estancias para creadores, campañas de marcas rd"
      />
      <div className="flex min-h-dvh flex-col bg-background">
        <Header />
        <main className="flex-1">
          {/* Portada */}
          <section className="relative isolate overflow-hidden pb-20 pt-32 md:pb-28 md:pt-40">
            <img src={heroBeach} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" fetchPriority="high" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/60 to-black/20" />
            <div className="container mx-auto max-w-6xl px-4">
              <div className="max-w-3xl">
                <Badge className="mb-4 gap-1.5 border-white/30 bg-white/15 text-white backdrop-blur"><Sparkles className="h-3.5 w-3.5" />Programa de Creadores</Badge>
                <h1 className="font-display text-4xl font-black tracking-tight text-white md:text-6xl">Cuenta República Dominicana <span className="text-primary">y gana con tu contenido</span></h1>
                <p className="mt-5 max-w-2xl text-lg text-white/85">Publica tus videos de viajes, colabora con hoteles y marcas del país y lleva tus ingresos, campañas y pagos desde un solo panel.</p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Cta big />
                  {isCreator
                    ? <span className="text-sm text-white/80">Conectado como <strong className="text-white">@{dashboard.profile.handle}</strong></span>
                    : !user && <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white"><Link to={`/login?returnTo=${encodeURIComponent("/creadores/panel")}`}>Ya soy creador: iniciar sesión</Link></Button>}
                </div>
                <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85">
                  {["Registro gratis", "Aprobación inmediata", "Campañas con términos claros"].map((t) => <li key={t} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" />{t}</li>)}
                </ul>
              </div>
            </div>
          </section>

          {/* Cómo funciona */}
          <section className="py-16">
            <div className="container mx-auto max-w-6xl px-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Tu ruta como creador</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">Cómo funciona</h2>
              <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {STEPS.map((s, i) => (
                  <li key={s.title} className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
                    <div className="relative aspect-[4/3]">
                      <div className="absolute inset-0 overflow-hidden">
                        <img src={s.img} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      </div>
                      <span className="absolute left-4 top-3 font-display text-5xl font-black leading-none text-white/90 drop-shadow">{String(i + 1).padStart(2, "0")}</span>
                      <span className="absolute bottom-3 left-4 flex items-center gap-1 text-xs font-medium text-white/90"><MapPin className="h-3.5 w-3.5" />{s.place}</span>
                      <span className="absolute -bottom-5 right-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg ring-4 ring-card"><s.icon className="h-5 w-5" /></span>
                    </div>
                    <div className="flex flex-1 flex-col p-5 pt-7">
                      <h3 className="text-base font-semibold leading-snug text-foreground">{s.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Cómo se gana */}
          <section className="border-t border-border bg-muted/30 py-16">
            <div className="container mx-auto max-w-6xl px-4">
              <CreatorsMonetizationInfoCard />
            </div>
          </section>

          {/* Estancias */}
          <section className="py-16">
            <div className="container mx-auto max-w-6xl px-4">
              <div className="grid overflow-hidden rounded-3xl border border-border bg-card shadow-sm md:grid-cols-2">
                <div className="relative min-h-[16rem]">
                  <img src={suiteImg} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <Badge className="absolute left-5 top-5 gap-1.5 border-white/30 bg-black/40 text-white backdrop-blur"><Hotel className="h-3.5 w-3.5" />Estancias para creadores</Badge>
                </div>
                <div className="flex flex-col justify-center p-8 md:p-10">
                  <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Hoteles y experiencias que te invitan a crear</h2>
                  <p className="mt-3 text-muted-foreground">Los operadores publican estancias con sus entregables. Revisa las abiertas y postúlate con tu perfil de creador.</p>
                  <ul className="mt-5 space-y-2 text-sm text-foreground">
                    {["Entregables y fechas acordados desde el inicio", "Postulación con tu perfil, sin intermediarios", "Invitaciones directas de hoteles en tu panel"].map((t) => <li key={t} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{t}</li>)}
                  </ul>
                  <Button asChild className="mt-7 w-fit gap-2 rounded-xl"><Link to="/creadores/estancias"><Camera className="h-4 w-4" />Ver estancias abiertas</Link></Button>
                </div>
              </div>
            </div>
          </section>

          {/* Tu panel */}
          <section className="border-t border-border py-16">
            <div className="container mx-auto max-w-6xl px-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Todo en un lugar</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">Tu panel de creador</h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">Al registrarte tendrás un espacio privado para el día a día:</p>
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {PANEL.map((p, i) => (
                  <div key={p.title} className="group relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card to-primary/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
                    <span className="pointer-events-none absolute -right-1 -top-3 font-display text-7xl font-black text-primary/[0.08]" aria-hidden="true">{i + 1}</span>
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md shadow-primary/20"><p.icon className="h-6 w-6" /></span>
                    <h3 className="mt-5 text-base font-semibold leading-snug text-foreground">{p.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Preguntas frecuentes */}
          <section className="border-t border-border bg-muted/30 py-16">
            <div className="container mx-auto max-w-3xl px-4">
              <h2 className="font-display text-3xl font-bold text-foreground">Preguntas frecuentes</h2>
              <Accordion type="single" collapsible className="mt-6">
                {FAQ.map((f) => (
                  <AccordionItem key={f.q} value={f.q}>
                    <AccordionTrigger className="text-left text-base font-semibold">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <div className="mt-10 text-center"><Cta big /></div>
            </div>
          </section>

          <div className="container mx-auto max-w-6xl px-4 pb-12"><PanoramaAd /></div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
}
