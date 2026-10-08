import { Sparkles, ArrowUpRight, Camera } from "lucide-react";
import { Link } from "react-router-dom";
import { groupByCategory, useDestinationActivities } from "@/lib/destinationActivities";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&auto=format&fit=crop&q=80";

interface MustSeeItem {
  titulo: string;
  subtitulo?: string;
  categoria: string;
  imagen: string;
  enlace?: string;
}

interface DestinationMustSeeProps {
  destinoNombre: string;
  /** Slug del destino: con él la sección lee las actividades registradas y enlaza a su listado. */
  slug?: string;
  items?: MustSeeItem[];
}

export function DestinationMustSee({ destinoNombre, slug, items }: DestinationMustSeeProps) {
  const defaultItems: MustSeeItem[] = [
    {
      titulo: `Playas y Aguas Cristalinas de ${destinoNombre}`,
      subtitulo: "Paisajes vírgenes protegidos con arenas doradas y aguas turquesas.",
      categoria: "Naturaleza & Costas",
      imagen: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&auto=format&fit=crop&q=80",
      enlace: "/playas",
    },
    {
      titulo: "Patrimonio Histórico y Tradición",
      subtitulo: "Más de 500 años de relatos, arquitectura auténtica e identidad dominicana.",
      categoria: "Cultura Viva",
      imagen: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=1200&auto=format&fit=crop&q=80",
      enlace: "/cultura",
    },
    {
      titulo: "Ecoturismo y Rutas de Montaña",
      subtitulo: "Senderos entre vegetación tropical, cascadas y miradores panorámicos.",
      categoria: "Aventura",
      imagen: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1200&auto=format&fit=crop&q=80",
      enlace: "/ecoturismo",
    },
    {
      titulo: "Gastronomía Típica y Sabores del Caribe",
      subtitulo: "Pescado al coco, chivo liniero, dulces criollos y ron premium.",
      categoria: "Sabores de Origen",
      imagen: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80",
      enlace: "/guia-gastronomica",
    },
  ];

  // Con actividades registradas en el destino, la sección muestra sus categorías reales: cada una aparece en
  // cuanto el panel de administración publica la primera actividad de esa categoría aquí.
  const { data: activities = [] } = useDestinationActivities(slug);
  const categories = groupByCategory(activities);
  const allActivitiesHref = slug ? `/destino/${slug}/actividades` : "/experiencias";
  const categoryItems: MustSeeItem[] = categories.map((category) => ({
    titulo: `${category.label} en ${destinoNombre}`,
    subtitulo: category.count === 1 ? "1 actividad disponible" : `${category.count} actividades disponibles`,
    categoria: category.label,
    imagen: category.image || FALLBACK_IMAGE,
    enlace: `${allActivitiesHref}?categoria=${encodeURIComponent(category.key)}`,
  }));
  const hasActivities = categoryItems.length > 0;

  const displayItems = hasActivities ? categoryItems : items && items.length > 0 ? items : defaultItems;

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-2 border border-primary/20">
              Experiencias Clave
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Lo que no te puedes perder en {destinoNombre}
            </h2>
            <p className="text-muted-foreground text-sm md:text-base mt-1 max-w-xl">
              Selección curada de los hitos más memorables para vivir la esencia de este destino caribeño.
            </p>
          </div>
          <Link
            to={allActivitiesHref}
            className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 group self-start md:self-auto"
          >
            {hasActivities ? `Ver todas las actividades (${activities.length})` : "Explorar todas las vivencias"}
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Grid Visual Inmersivo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayItems.slice(0, hasActivities ? 8 : 4).map((item, idx) => (
            <Link
              key={idx}
              to={item.enlace || "#"}
              className="group relative rounded-2xl overflow-hidden bg-card border border-border shadow-sm flex flex-col h-[380px] hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5"
            >
              {/* Imagen con zoom sutil */}
              <div className="absolute inset-0 z-0">
                <img
                  src={item.imagen}
                  alt={item.titulo}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              </div>

              {/* Contenido overlay */}
              <div className="relative z-10 p-5 mt-auto flex flex-col justify-end text-white">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/90 text-primary-foreground self-start mb-2 backdrop-blur-sm">
                  {item.categoria}
                </span>
                <h3 className="font-display text-xl font-bold leading-tight mb-2 group-hover:text-primary-foreground transition-colors">
                  {item.titulo}
                </h3>
                {item.subtitulo && (
                  <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">
                    {item.subtitulo}
                  </p>
                )}
                <div className="mt-3 flex items-center text-xs font-semibold text-primary-foreground/90 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Descubrir más</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
