import { Accessibility, ArrowDown, Bus, Check, Ear, Eye, Footprints, HandHelping, MapPin, Phone, ShieldCheck, Signpost, Volume2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const travelStages = [
  {
    id: "antes-de-reservar",
    step: "01",
    title: "Antes de reservar",
    intro: "Confirma las condiciones concretas que necesitas con cada proveedor. “Accesible” puede significar cosas distintas en cada lugar.",
    questions: [
      "¿La ruta desde la entrada hasta mi habitación o actividad no tiene escalones?",
      "¿Hay ascensor operativo y cuál es el ancho útil de las puertas?",
      "¿El baño tiene ducha a nivel, barras de apoyo y espacio para maniobrar?",
      "¿Pueden confirmar estas condiciones por escrito y compartir fotos actuales?",
    ],
  },
  {
    id: "como-llegar",
    step: "02",
    title: "Cómo llegar y moverte",
    intro: "Planifica los traslados y los recorridos a pie, incluidos el pavimento, las distancias, el calor y los lugares donde descansar.",
    questions: [
      "¿El vehículo tiene el tipo de acceso y espacio que necesito?",
      "¿Hay escalones, adoquines, pendientes o tramos sin acera en la ruta?",
      "¿Dónde puedo solicitar asistencia para embarque o conexiones?",
      "¿Qué alternativa tengo si el ascensor o el transporte previsto no funciona?",
    ],
  },
  {
    id: "alojamiento-y-actividades",
    step: "03",
    title: "Alojamiento y actividades",
    intro: "Pide detalles de la experiencia completa, no solo de la entrada: circulación interior, descansos, baños, evacuación y apoyos disponibles.",
    questions: [
      "¿La habitación accesible queda cerca de una salida y de los servicios que usaré?",
      "¿La actividad tiene rutas alternativas o una duración adaptable?",
      "¿El personal conoce los apoyos que necesito y puede confirmarlos antes de mi llegada?",
      "¿Hay un plan de evacuación que contemple mis necesidades?",
    ],
  },
];

const accessNeeds = [
  {
    title: "Movilidad",
    icon: Footprints,
    description: "Comprueba escalones, pendientes, superficies, distancias, asientos, baños y espacio de giro en cada tramo.",
  },
  {
    title: "Visión",
    icon: Eye,
    description: "Pregunta por iluminación, contraste, señalización táctil, orientación verbal y formatos digitales compatibles con lector de pantalla.",
  },
  {
    title: "Audición y comunicación",
    icon: Ear,
    description: "Confirma opciones de comunicación escrita, subtítulos, interpretación y avisos visuales para cambios o emergencias.",
  },
  {
    title: "Necesidades sensoriales o cognitivas",
    icon: Volume2,
    description: "Consulta horarios tranquilos, ruido, aglomeraciones, pausas, instrucciones anticipadas y espacios de descanso.",
  },
];

export default function Accesibilidad() {
  return (
    <PageTransition>
      <SEOHead
        title="Guía de viaje accesible en República Dominicana"
        description="Prepara un viaje accesible con preguntas prácticas sobre transporte, alojamiento y actividades. Confirma cada servicio directamente antes de reservar."
        keywords="guía viaje accesible República Dominicana, turismo inclusivo, movilidad, accesibilidad"
      />
      <div className="min-h-screen bg-background text-foreground">
        <Header variant="white" />

        <main id="main-content">
          <section className="border-b border-border bg-card">
            <div className="container mx-auto grid gap-10 px-4 py-16 md:grid-cols-[1.3fr_0.7fr] md:items-end md:px-8 md:py-24">
              <div className="max-w-3xl">
                <Badge variant="outline" className="mb-6 gap-2 border-primary/40 px-3 py-1 text-primary">
                  <Accessibility className="h-4 w-4" aria-hidden="true" />
                  Guía práctica para planificar
                </Badge>
                <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                  Viaja con más información. Decide a tu ritmo.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                  Una guía para conversar con alojamientos, transportistas y espacios antes de reservar. Elige qué confirmar según tus necesidades y prepara alternativas para cada etapa.
                </p>
                <Button asChild size="lg" className="mt-8 gap-2">
                  <a href="#antes-de-reservar">
                    Empezar a planificar <ArrowDown className="h-4 w-4" aria-hidden="true" />
                  </a>
                </Button>
              </div>

              <aside className="relative overflow-hidden rounded-2xl border border-border bg-background p-6 md:p-8" aria-labelledby="confirmar-heading">
                <div className="absolute inset-y-0 left-0 w-1 bg-primary" aria-hidden="true" />
                <div className="flex items-start gap-4">
                  <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <h2 id="confirmar-heading" className="font-display text-xl font-bold">Confirma antes de viajar</h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Las condiciones de acceso cambian entre proveedores y con el tiempo. Esta guía no certifica establecimientos ni sustituye la confirmación directa del servicio.
                    </p>
                  </div>
                </div>
                <a className="mt-6 inline-flex items-center gap-2 font-medium text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary" href="#preguntas-por-necesidad">
                  Ir a preguntas por necesidad <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </a>
              </aside>
            </div>
          </section>

          <section className="container mx-auto grid gap-12 px-4 py-16 md:grid-cols-[240px_1fr] md:px-8 md:py-20" aria-label="Guía para preparar el viaje">
            <nav aria-label="En esta guía" className="h-fit border-l-2 border-border pl-4 md:sticky md:top-24">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">En esta guía</p>
              <ul className="space-y-3 text-sm">
                {travelStages.map((stage) => (
                  <li key={stage.id}>
                    <a className="text-foreground underline-offset-4 hover:text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" href={`#${stage.id}`}>
                      {stage.title}
                    </a>
                  </li>
                ))}
                <li><a className="text-foreground underline-offset-4 hover:text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" href="#preguntas-por-necesidad">Preguntas por necesidad</a></li>
              </ul>
            </nav>

            <div className="min-w-0">
              <div className="mb-10 max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Un recorrido de preparación</p>
                <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">Tres conversaciones que evitan sorpresas</h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">Usa estas preguntas como lista de comprobación. Describe lo que te funciona y pide medidas, fotos recientes o confirmación escrita cuando te ayude a decidir.</p>
              </div>

              <div className="space-y-5">
                {travelStages.map((stage) => (
                  <details key={stage.id} id={stage.id} className="group scroll-mt-24 rounded-2xl border border-border bg-card open:border-primary/40">
                    <summary className="flex cursor-pointer list-none items-start gap-5 p-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:p-7 [&::-webkit-details-marker]:hidden">
                      <span className="font-mono text-sm font-semibold text-primary" aria-label={`Etapa ${Number(stage.step)}`}>{stage.step}</span>
                      <span className="flex-1">
                        <span className="block font-display text-xl font-bold">{stage.title}</span>
                        <span className="mt-2 block max-w-2xl text-sm leading-relaxed text-muted-foreground">{stage.intro}</span>
                      </span>
                      <ArrowDown className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <ul className="space-y-3 border-t border-border px-5 py-5 md:ml-12 md:px-7 md:py-6">
                      {stage.questions.map((question) => (
                        <li key={question} className="flex items-start gap-3 text-sm leading-relaxed">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                          <span>{question}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>

              <section id="preguntas-por-necesidad" className="scroll-mt-24 pt-16" aria-labelledby="needs-heading">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Adapta la conversación</p>
                <h2 id="needs-heading" className="mt-3 font-display text-3xl font-bold md:text-4xl">Preguntas según lo que necesitas</h2>
                <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">Las necesidades pueden combinarse. No tienes que encajar en una sola categoría para pedir información clara.</p>
                <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                  {accessNeeds.map(({ title, icon: Icon, description }) => (
                    <li key={title} className="rounded-2xl border border-border p-5 md:p-6">
                      <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                      <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                    </li>
                  ))}
                </ul>
              </section>

              <aside className="mt-12 rounded-2xl bg-primary/10 p-6 md:p-8" aria-labelledby="help-heading">
                <div className="flex gap-4">
                  <HandHelping className="mt-1 h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <h2 id="help-heading" className="font-display text-xl font-bold">¿Necesitas ayuda para organizar la llegada?</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">Consulta nuestra información general de transporte y movilidad. Verifica horarios, asistencia y condiciones directamente con cada operador antes de salir.</p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Button asChild variant="default"><Link to="/info/transporte"><Bus className="mr-2 h-4 w-4" aria-hidden="true" />Información de transporte</Link></Button>
                      <Button asChild variant="outline"><Link to="/centro-ayuda"><Phone className="mr-2 h-4 w-4" aria-hidden="true" />Centro de ayuda</Link></Button>
                      <Button asChild variant="ghost"><Link to="/destinos"><MapPin className="mr-2 h-4 w-4" aria-hidden="true" />Explorar destinos</Link></Button>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </section>

          <section className="border-t border-border bg-card py-12">
            <div className="container mx-auto flex flex-col gap-4 px-4 md:flex-row md:items-center md:justify-between md:px-8">
              <div className="flex items-start gap-3">
                <Signpost className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">Si una ficha no explica sus condiciones de acceso, solicita la información antes de reservar. No interpretes una etiqueta, una fotografía o una calificación como garantía de accesibilidad.</p>
              </div>
              <Link to="/accesibilidad" className="shrink-0 font-medium text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Volver al inicio de esta guía</Link>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
