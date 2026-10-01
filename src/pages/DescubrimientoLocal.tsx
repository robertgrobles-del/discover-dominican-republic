import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, CalendarDays, Footprints, Bus, Users, ShoppingBasket, Leaf, BookOpen, MapPin } from "lucide-react";

const explorations = [
  { id: "events", number: "111–112", title: "Agenda y esta semana", description: "Consulta el calendario editorial y los eventos publicados. Verifica fecha, lugar y cambios con la organización antes de desplazarte.", href: "/eventos", icon: CalendarDays, source: "Agenda de eventos" },
  { id: "walking", number: "113", title: "Explorar a pie", description: "Descubre destinos y puntos en el mapa para organizar un paseo. Revisa aceras, cruces, clima, distancia y condiciones locales antes de salir.", href: "/mapa-interactivo", icon: Footprints, source: "Mapa interactivo" },
  { id: "transit", number: "114", title: "Transporte urbano", description: "Revisa la guía de sistemas urbanos y confirma operación, tarifas y horarios con el operador antes del viaje.", href: "/transporte-urbano", icon: Bus, source: "Información de transporte" },
  { id: "guides", number: "115", title: "Guías locales", description: "Explora el directorio disponible. Comprueba credenciales, idioma, precio, seguro y condiciones directamente con cada profesional.", href: "/guias-ecologicos", icon: Users, source: "Directorio de guías" },
  { id: "craft", number: "116–118", title: "Artesanía, origen y mercados", description: "Conoce experiencias comunitarias y opciones de compras. Pregunta por quién produce, materiales, procedencia, horarios y métodos de pago.", href: "/turismo-comunitario", icon: ShoppingBasket, source: "Turismo comunitario" },
  { id: "nature", number: "119", title: "Naturaleza por temporada", description: "Consulta recursos de naturaleza y observación responsable. Las temporadas son orientativas; sigue cierres, alertas y reglas del área protegida.", href: "/avistamiento-aves", icon: Leaf, source: "Avistamiento de aves" },
  { id: "stories", number: "120", title: "Historias por territorio", description: "Explora la historia dominicana y sus territorios. Las historias orales deben publicarse con consentimiento, autoría y contexto de la comunidad.", href: "/historia", icon: BookOpen, source: "Historia de RD" },
];

const walkingIdeas = [
  { title: "Zona Colonial · plazas y patrimonio", stops: "Parque Colón · Catedral Primada · Plaza España" },
  { title: "Centro de Santo Domingo · cultura", stops: "Parque Independencia · Calle El Conde · Parque Colón" },
  { title: "Malecón · paseo costero", stops: "Parque Eugenio María de Hostos · tramo del Malecón hacia el Obelisco" },
];

export default function DescubrimientoLocal() {
  return (
    <PageTransition>
      <SEOHead title="Descubrimiento local y comunidad | Descubre RD" description="Agenda local, movilidad, guías, artesanía, naturaleza e historias para descubrir República Dominicana con contexto y respeto." />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="container mx-auto max-w-6xl flex-1 px-4 py-16">
          <Badge variant="outline" className="mb-4 gap-2"><MapPin className="h-4 w-4" aria-hidden="true" /> Descubrimiento local</Badge>
          <h1 className="max-w-3xl font-display text-4xl font-bold md:text-5xl">Conecta con lo que ocurre en cada territorio</h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">Una entrada a la agenda, la movilidad y las experiencias culturales y naturales del país. La disponibilidad y vigencia de cada dato depende de su fuente; confirma la información operativa con organizadores, comunidades y proveedores.</p>
          <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {explorations.map((item) => {
              const Icon = item.icon;
              return <li key={item.id}><Card className="h-full transition-colors hover:border-primary/50"><CardContent className="flex h-full flex-col p-6">
                <div className="flex items-center justify-between"><Badge variant="secondary">Fase 12 · {item.number}</Badge><Icon className="h-5 w-5 text-primary" aria-hidden="true" /></div>
                <h2 className="mt-5 font-display text-xl font-bold">{item.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                <Link className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline" to={item.href}>{item.source}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
              </CardContent></Card></li>;
            })}
          </ul>
          <section className="mt-12" aria-labelledby="walking-routes-heading">
            <h2 id="walking-routes-heading" className="font-display text-2xl font-bold">Ideas de recorridos urbanos</h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">Son secuencias orientativas de puntos de interés, no rutas peatonales validadas. Comprueba distancia, cruces, accesibilidad, clima y condiciones locales; adapta o suspende el paseo si el trayecto no es seguro o cómodo.</p>
            <ul className="mt-4 grid gap-4 md:grid-cols-3">{walkingIdeas.map((route) => <li key={route.title}><Card className="h-full"><CardContent className="p-5"><h3 className="font-semibold">{route.title}</h3><p className="mt-2 text-sm text-muted-foreground">{route.stops}</p><Link className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary underline" to="/mapa-interactivo">Revisar puntos en el mapa<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></CardContent></Card></li>)}</ul>
          </section>
          <aside className="mt-8 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
            <strong className="text-foreground">Criterio editorial:</strong> no publicamos como confirmados horarios, eventos, certificaciones o precios sin responsable de actualización y fecha de revisión. Las historias comunitarias requieren autorización de sus protagonistas.
          </aside>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
}
