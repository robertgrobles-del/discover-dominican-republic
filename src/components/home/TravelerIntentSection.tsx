import { ArrowUpRight, Landmark, Mountain, Users, Waves } from "lucide-react";
import { Link } from "react-router-dom";
import { usePageContent } from "@/lib/pageContent";

const travelIntents = [
  {
    title: "Playas vírgenes y relax",
    description: "Bahías de arena blanca, cocoteros y calas tranquilas en Samaná, Punta Cana y Pedernales.",
    href: "/playas",
    icon: Waves,
  },
  {
    title: "Ecoturismo y montaña",
    description: "Senderos del Pico Duarte, cascadas de Jarabacoa y reservas ecológicas de la cordillera.",
    href: "/ecoturismo",
    icon: Mountain,
  },
  {
    title: "Historia y sazón criollo",
    description: "Calles coloniales de 1502, museos primados, merengue típico y gastronomía autóctona.",
    href: "/cultura",
    icon: Landmark,
  },
  {
    title: "Planes para toda la familia",
    description: "Playas de oleaje suave, ecoparques seguros y actividades pensadas para viajar con niños.",
    href: "/familia-con-ninos",
    icon: Users,
  },
];

export function TravelerIntentSection() {
  const pc = usePageContent("traveler-intent-section");
  const travelIntents = pc.data("travelIntents", __pcData.travelIntents);
  return (
    <section aria-labelledby="traveler-intent-title" className="container mx-auto px-4 py-10 md:py-14 lg:px-8">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">{pc.tx("p.1", "Inspiración a tu medida")}</p>
          <h2 id="traveler-intent-title" className="font-display text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl text-foreground">{pc.tx("h2.1", "¿Qué tipo de viaje estás buscando?")}</h2>
        </div>
        <p className="max-w-md text-sm text-muted-foreground leading-relaxed">{pc.tx("p.2", "Selecciona tu estilo de exploración favorito y descubre rutas, establecimientos y consejos locales verificados.")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {travelIntents.map(({ title, description, href, icon: Icon }) => (
          <Link
            key={href}
            to={href}
            className="group card-taste flex min-h-36 items-start gap-4 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground" aria-hidden="true">
              <Icon className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2 font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">
                {title}
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
              </span>
              <span className="mt-2 block text-xs md:text-sm leading-relaxed text-muted-foreground/90">{description}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

// Datos del módulo editables desde el panel (ver pc.data en src/lib/pageContent.ts).
const __pcData = { travelIntents };
