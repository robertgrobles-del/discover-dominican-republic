import {
  ArrowRight,
  BusFront,
  CalendarDays,
  Compass,
  Map,
  MapPin,
  ShieldCheck,
  Waves,
  Wind,
} from "lucide-react";
import { Link } from "react-router-dom";

const seasonalIdeas = [
  {
    period: "Enero – marzo",
    title: "Naturaleza en la costa norte",
    description: "Explora Samaná y otros destinos de la región norte.",
    href: "/destinos/region/norte",
    icon: Wind,
  },
  {
    period: "Abril – junio",
    title: "Ríos y montaña",
    description: "Encuentra ideas de ecoturismo y actividades al aire libre.",
    href: "/ecoturismo",
    icon: Compass,
  },
  {
    period: "Julio – septiembre",
    title: "Escapadas de playa",
    description: "Revisa playas y consulta sus condiciones antes de salir.",
    href: "/playas",
    icon: Waves,
  },
  {
    period: "Octubre – diciembre",
    title: "Cultura y sabores locales",
    description: "Planea un recorrido entre patrimonio y gastronomía.",
    href: "/cultura",
    icon: CalendarDays,
  },
];

const regions = [
  { name: "Norte y Cibao", slug: "norte", detail: "Montaña, costa atlántica y naturaleza" },
  { name: "Región Este", slug: "este", detail: "Playas, islas y experiencias costeras" },
  { name: "Región Sur", slug: "sur", detail: "Paisajes y comunidades del Caribe sur" },
];

const preparationLinks = [
  { label: "Clima y temporadas", href: "/clima-temporadas", icon: Wind },
  { label: "Estado de las playas", href: "/estado-playas", icon: Waves },
  { label: "Requisitos de viaje", href: "/requisitos-viaje", icon: ShieldCheck },
  { label: "Transporte y movilidad", href: "/info/transporte", icon: BusFront },
];

export function HomeDiscoveryHub() {
  const monthIndex = new Date().getMonth();
  const currentSeason = monthIndex < 3 ? 0 : monthIndex < 6 ? 1 : monthIndex < 9 ? 2 : 3;

  return (
    <section className="container mx-auto space-y-10 px-4 py-12 lg:px-8" aria-label="Explora y planifica tu viaje">
      <nav aria-label="Atajos de planificación" className="flex flex-wrap gap-2">
        {[
          { label: "Inspiración", href: "#inspiracion" },
          { label: "Regiones", href: "#regiones" },
          { label: "Preparar el viaje", href: "#preparacion" },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="rounded-full border border-border bg-surface-editorial px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {item.label}
          </a>
        ))}
        <Link
          to="/mapa-interactivo"
          className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Map className="h-4 w-4" aria-hidden="true" />
          Abrir mapa
        </Link>
      </nav>

      <div id="inspiracion" className="scroll-mt-24 space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Colecciones editoriales</p>
            <h2 className="mt-1 text-2xl font-bold text-foreground md:text-3xl">Inspírate por temporada</h2>
          </div>
          <p className="max-w-lg text-sm text-muted-foreground">Ideas para empezar a planificar; confirma horarios, clima y disponibilidad antes de viajar.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {seasonalIdeas.map(({ period, title, description, href, icon: Icon }, index) => (
            <Link
              key={period}
              to={href}
              className={`group rounded-card border p-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                index === currentSeason
                  ? "border-primary/45 bg-surface-elevated"
                  : "border-border bg-surface-editorial hover:border-primary/40"
              }`}
                aria-current={index === currentSeason ? "true" : undefined}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden="true">
                  <Icon className="h-5 w-5" />
                </span>
                {index === currentSeason && <span className="text-[11px] font-semibold text-primary">Ahora</span>}
              </span>
              <span className="mt-4 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{period}</span>
              <span className="mt-1 block font-semibold text-foreground group-hover:text-primary">{title}</span>
              <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">{description}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div id="regiones" className="scroll-mt-24 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Explora por zona</p>
            <h2 className="mt-1 text-xl font-bold text-foreground">Accesos a las regiones</h2>
          </div>
          <div className="grid gap-2">
            {regions.map((region) => (
              <Link
                key={region.slug}
                to={`/destinos/region/${region.slug}`}
                className="group flex items-center gap-3 rounded-xl border border-border bg-surface-editorial p-4 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-foreground">{region.name}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{region.detail}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>

        <div id="preparacion" className="scroll-mt-24 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Información práctica</p>
            <h2 className="mt-1 text-xl font-bold text-foreground">Antes de salir</h2>
            <p className="mt-1 text-sm text-muted-foreground">Consulta las condiciones relevantes para tu fecha y destino.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {preparationLinks.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                to={href}
                className="flex min-h-20 items-center gap-3 rounded-xl border border-border bg-surface-editorial p-4 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{label}</span>
                <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </Link>
            ))}
          </div>
          <Link to="/mapa-interactivo" className="inline-flex items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline">
            <Map className="h-4 w-4" aria-hidden="true" />
            Explora los lugares en el mapa
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
