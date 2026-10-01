import { ArrowUpRight, Landmark, Mountain, Users, Waves } from "lucide-react";
import { Link } from "react-router-dom";

const travelIntents = [
  {
    title: "Playa y descanso",
    description: "Encuentra costas, balnearios y rincones para desconectar.",
    href: "/playas",
    icon: Waves,
  },
  {
    title: "Naturaleza y aventura",
    description: "Explora parques, montañas y experiencias al aire libre.",
    href: "/ecoturismo",
    icon: Mountain,
  },
  {
    title: "Cultura e historia",
    description: "Descubre patrimonio, museos y tradiciones dominicanas.",
    href: "/cultura",
    icon: Landmark,
  },
  {
    title: "Viajar en familia",
    description: "Planea actividades y lugares para disfrutar juntos.",
    href: "/familia-con-ninos",
    icon: Users,
  },
];

export function TravelerIntentSection() {
  return (
    <section aria-labelledby="traveler-intent-title" className="container mx-auto px-4 py-10 md:py-14 lg:px-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Empieza por lo que te gusta
          </p>
          <h2 id="traveler-intent-title" className="text-2xl font-bold md:text-3xl">
            ¿Qué te gustaría vivir?
          </h2>
        </div>
        <p className="max-w-md text-sm text-muted-foreground">
          Elige una forma de viajar y explora ideas para armar tu visita.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {travelIntents.map(({ title, description, href, icon: Icon }) => (
          <Link
            key={href}
            to={href}
            className="group flex min-h-36 items-start gap-4 rounded-card border border-border bg-surface-editorial p-5 transition-colors hover:border-primary/50 hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden="true">
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2 font-semibold text-foreground">
                {title}
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
              </span>
              <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">{description}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
