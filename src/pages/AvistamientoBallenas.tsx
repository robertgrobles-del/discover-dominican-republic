import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Anchor, Binoculars, CalendarDays, ChevronRight, Clock, LifeBuoy, MapPin, Ruler, ShieldCheck, Ship, Sun, Waves } from "lucide-react";
import whaleJpg from "@/assets/whale-samana.jpg";
import whaleAvif from "@/assets/whale-samana.avif";
import whaleWebp from "@/assets/whale-samana.webp";
import { usePageContent } from "@/lib/pageContent";

const facts = [
  { icon: CalendarDays, label: "Temporada", value: "Mediados de enero a finales de marzo" },
  { icon: MapPin, label: "Dónde", value: "Bahía de Samaná" },
  { icon: Clock, label: "Duración de la salida", value: "De 2 a 4 horas" },
  { icon: Sun, label: "Mejor momento", value: "Febrero, por la mañana" },
];

const places = [
  {
    icon: Ship,
    title: "En barco desde Santa Bárbara de Samaná",
    text: "Es la forma más habitual. Las embarcaciones autorizadas salen del muelle de la ciudad y navegan por la bahía. Muchas excursiones terminan con una parada en Cayo Levantado.",
  },
  {
    icon: Binoculars,
    title: "Desde tierra en Punta Balandra",
    text: "Un mirador terrestre en la costa norte de la bahía permite observarlas sin subir a un barco. Es la mejor opción si te mareas o viajas con niños pequeños.",
  },
  {
    icon: Anchor,
    title: "Banco de la Plata",
    text: "Zona de reproducción en mar abierto, al norte de Puerto Plata. Solo se visita en expediciones de varios días a bordo, con cupos muy limitados y permiso especial.",
  },
];

const rules = [
  "Solo pueden acercarse a las ballenas las embarcaciones con permiso de temporada.",
  "Los barcos mantienen una distancia mínima y la aumentan cuando hay una madre con su cría.",
  "El tiempo junto a un mismo grupo de ballenas es limitado, para dar paso a otras embarcaciones.",
  "En la bahía de Samaná no se permite nadar ni bucear con las ballenas.",
  "Cerca de los animales se navega despacio y sin cambios bruscos de rumbo.",
];

const behaviors = [
  { name: "Salto", text: "La ballena saca casi todo el cuerpo del agua y cae de costado. Es el momento más buscado." },
  { name: "Golpe de cola", text: "Levanta la aleta caudal y la deja caer con fuerza sobre la superficie." },
  { name: "Aleteo pectoral", text: "Gira de lado y golpea el agua con sus aletas, las más largas de cualquier ballena." },
  { name: "Soplo", text: "La columna de vapor al respirar se ve a distancia y es la primera señal para encontrarlas." },
];

const tips = [
  "Reserva con un operador autorizado y pregunta si lleva guía naturalista a bordo.",
  "Las salidas de la mañana suelen tener el mar más tranquilo.",
  "Lleva protector solar, gorra, una chaqueta ligera impermeable y agua.",
  "Si te mareas, toma tu medicación antes de embarcar y siéntate en la parte central del barco.",
  "Guarda bien el teléfono y la cámara: el barco se mueve y salpica.",
  "Ver ballenas no está garantizado: son animales salvajes. En plena temporada la probabilidad es alta.",
];

export default function AvistamientoBallenas() {
  const pc = usePageContent("avistamiento-ballenas");
  const facts = pc.data("facts", __pcData.facts);
  const behaviors = pc.data("behaviors", __pcData.behaviors);
  const places = pc.data("places", __pcData.places);
  const rules = pc.data("rules", __pcData.rules);
  const tips = pc.data("tips", __pcData.tips);
  return (
    <PageTransition>
      <SEOHead
        title={pc.t("SEOHead.title.1", "Avistamiento de ballenas jorobadas en Samaná | Descubre República Dominicana")}
        description={pc.t("SEOHead.description.1", "Guía para ver ballenas jorobadas en la bahía de Samaná: temporada, desde dónde observarlas, normas del santuario y consejos para la excursión.")}
      />
      <Header />

      <main className="min-h-screen bg-background">
        <section className="relative isolate overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
          <picture>
            <source srcSet={pc.img("asset.whaleAvif", whaleAvif)} type="image/avif" />
            <source srcSet={pc.img("asset.whaleWebp", whaleWebp)} type="image/webp" />
            <img src={pc.img("img.src.1", whaleJpg)} alt={pc.t("img.alt.1", "Ballena jorobada saltando en la bahía de Samaná")} className="absolute inset-0 -z-20 h-full w-full object-cover" />
          </picture>
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
          <div className="container mx-auto px-4 text-white">
            <Badge className="mb-4 bg-white/15 text-white border-white/30 backdrop-blur">{pc.tx("Badge.1", "Samaná · Temporada de invierno")}</Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold max-w-3xl">{pc.tx("h1.1", "Avistamiento de ballenas jorobadas")}</h1>
            <p className="mt-4 max-w-2xl text-lg text-white/90">{pc.tx("p.1", "Cada invierno, las ballenas jorobadas del Atlántico Norte llegan a las aguas cálidas de la República Dominicana para aparearse y dar a luz. La bahía de Samaná es uno de los mejores lugares del Caribe para verlas.")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild><Link to="/tours">{pc.tx("Link.1", "Ver excursiones")}{" "}<ChevronRight className="ml-1 h-4 w-4" /></Link></Button>
              <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/40 hover:bg-white/20 hover:text-white" asChild>
                <Link to="/destino/samana">{pc.tx("Link.2", "Conocer Samaná")}</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 -mt-10 relative z-10">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {facts.map((fact) => (
              <Card key={fact.label} className="shadow-lg">
                <CardContent className="p-5">
                  <fact.icon className="h-5 w-5 text-primary mb-2" />
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{fact.label}</p>
                  <p className="font-semibold text-foreground">{fact.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold mb-4">{pc.tx("h2.1", "Por qué vienen a Samaná")}</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>{pc.tx("p.2", "Las ballenas jorobadas pasan el verano alimentándose en las aguas frías del Atlántico Norte. Al llegar el invierno recorren miles de kilómetros hasta el Caribe, donde las aguas templadas y protegidas son ideales para las crías recién nacidas.")}</p>
              <p>{pc.tx("p.3", "La bahía de Samaná y los bancos de la Plata y de la Navidad forman parte del Santuario de Mamíferos Marinos de la República Dominicana, creado en 1986 y uno de los primeros del mundo dedicados a proteger a las ballenas.")}</p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-border p-4">
                <Ruler className="h-5 w-5 text-primary mb-2" />
                <p className="font-semibold">{pc.tx("p.4", "Hasta unos 15 metros")}</p>
                <p className="text-sm text-muted-foreground">{pc.tx("p.5", "Longitud de un adulto")}</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <Waves className="h-5 w-5 text-primary mb-2" />
                <p className="font-semibold">{pc.tx("p.6", "Cantos de los machos")}</p>
                <p className="text-sm text-muted-foreground">{pc.tx("p.7", "Se escuchan bajo el agua durante la temporada")}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-display text-3xl font-bold mb-4">{pc.tx("h2.2", "Qué vas a ver")}</h2>
            <ul className="space-y-3">
              {behaviors.map((item) => (
                <li key={item.name} className="rounded-xl bg-muted/50 p-4">
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-secondary/30 py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl font-bold mb-2">{pc.tx("h2.3", "Desde dónde observarlas")}</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl">{pc.tx("p.8", "Hay tres formas de verlas, según el tiempo y el presupuesto que tengas.")}</p>
            <div className="grid gap-6 md:grid-cols-3">
              {places.map((place) => (
                <Card key={place.title}>
                  <CardContent className="p-6">
                    <place.icon className="h-7 w-7 text-primary mb-3" />
                    <h3 className="font-semibold text-lg mb-2">{place.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{place.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold mb-4 flex items-center gap-2"><ShieldCheck className="h-7 w-7 text-primary" />{" "}{pc.tx("h2.4", "Normas del santuario")}</h2>
            <p className="text-muted-foreground mb-4">{pc.tx("p.9", "La observación está regulada para no molestar a las ballenas, sobre todo a las madres con cría.")}</p>
            <ul className="space-y-3">
              {rules.map((rule) => (
                <li key={rule} className="flex gap-3 text-sm text-foreground">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  {rule}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">{pc.tx("p.10", "Las fechas de la temporada, las distancias y los tiempos exactos los fija cada año el Ministerio de Medio Ambiente y Recursos Naturales. Confírmalos con tu operador antes de viajar.")}</p>
          </div>

          <div>
            <h2 className="font-display text-3xl font-bold mb-4 flex items-center gap-2"><LifeBuoy className="h-7 w-7 text-primary" />{" "}{pc.tx("h2.5", "Consejos para la excursión")}</h2>
            <ul className="space-y-3">
              {tips.map((tip) => (
                <li key={tip} className="flex gap-3 text-sm text-foreground">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-20">
          <div className="rounded-2xl bg-primary/10 p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="font-display text-2xl font-bold">{pc.tx("h2.6", "Planifica tu salida")}</h2>
              <p className="text-muted-foreground mt-1 max-w-xl">{pc.tx("p.11", "Busca un operador verificado en Samaná y combina la excursión con unos días en la península.")}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild><Link to="/operadores/directorio">{pc.tx("Link.3", "Operadores verificados")}</Link></Button>
              <Button variant="outline" asChild><Link to="/viaje-responsable">{pc.tx("Link.4", "Viaje responsable")}</Link></Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </PageTransition>
  );
}

// Datos del módulo editables desde el panel (ver pc.data en src/lib/pageContent.ts).
const __pcData = { facts, behaviors, places, rules, tips };
