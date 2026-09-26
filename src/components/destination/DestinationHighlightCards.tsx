import { Link } from "react-router-dom";
import { 
  Waves, Sparkles, Trees, Trophy, Moon, 
  MapPin, ArrowUpRight, Compass, Flame
} from "lucide-react";

interface HighlightItem {
  title: string;
  tag: string;
  category: string;
  description: string;
  imageUrl: string;
  href?: string;
  badgeColor?: string;
}

// Catálogo enriquecido de destacados por destino
const HIGHLIGHTS_CATALOG: Record<string, HighlightItem[]> = {
  "punta-cana": [
    {
      title: "Playa Bávaro",
      tag: "Playa #1 del Caribe",
      category: "Playa Icónica",
      description: "Arenas blancas de coral, aguas turquesas cristalinas y cocoteros infinitos reconocidos por la UNESCO.",
      imageUrl: "https://images.unsplash.com/photo-1628281158250-48001a7687d3?w=800&h=600&fit=crop&q=80",
      href: "/destino/bavaro",
      badgeColor: "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
    },
    {
      title: "Hoyo Azul",
      tag: "Cenote Escondido",
      category: "Ecoturismo",
      description: "Cenote natural de aguas azul zafiro al pie de un impresionante acantilado de 75 metros en Scape Park.",
      imageUrl: "https://images.unsplash.com/photo-1682965740861-fdd2065bdd2e?w=800&h=600&fit=crop&q=80",
      href: "/experiencia/hoyo-azul",
      badgeColor: "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30",
    },
    {
      title: "Indigenous Eyes Ecological Park",
      tag: "Reserva de 12 Lagunas",
      category: "Naturaleza & Selva",
      description: "1,500 acres de bosque subtropical virgen con lagunas naturales de agua dulce cristalina.",
      imageUrl: "https://images.unsplash.com/photo-1549294413-26f195200c16?w=800&h=600&fit=crop&q=80",
      href: "/experiencias",
      badgeColor: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    },
    {
      title: "Golf de clase mundial",
      tag: "Punta Espada & Corales",
      category: "Deporte de Élite",
      description: "Campos de campeonato PGA diseñados por leyendas como Jack Nicklaus y Tom Fazio junto al mar.",
      imageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=600&fit=crop&q=80",
      href: "/golf",
      badgeColor: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30",
    },
    {
      title: "Vida nocturna vibrante",
      tag: "Coco Bongo & Imagine",
      category: "Entretenimiento",
      description: "Shows acrobáticos de nivel internacional, discotecas en cuevas milenarias y clubes de playa icónicos.",
      imageUrl: "https://images.unsplash.com/photo-1578736641330-3155e606cd40?w=800&h=600&fit=crop&q=80",
      href: "/vida-nocturna",
      badgeColor: "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30",
    },
  ],
  "la-altagracia": [
    {
      title: "Playa Bávaro",
      tag: "Playa Icónica",
      category: "Costas del Este",
      description: "Kilómetros de arena blanca y resorts de clase mundial en el litoral este.",
      imageUrl: "https://images.unsplash.com/photo-1628281158250-48001a7687d3?w=800&h=600&fit=crop&q=80",
      href: "/destino/bavaro",
    },
    {
      title: "Hoyo Azul & Scape Park",
      tag: "Cenote & Aventura",
      category: "Ecoturismo",
      description: "Cenote natural de ensueño en Cap Cana con senderos botánicos.",
      imageUrl: "https://images.unsplash.com/photo-1682965740861-fdd2065bdd2e?w=800&h=600&fit=crop&q=80",
      href: "/experiencia/hoyo-azul",
    },
    {
      title: "Basílica de Higüey",
      tag: "Monumento Nacional",
      category: "Cultura & Fe",
      description: "Centro espiritual de la República Dominicana con arquitectura vanguardista.",
      imageUrl: "https://images.unsplash.com/photo-1762995875707-19c6de2c6fd9?w=800&h=600&fit=crop&q=80",
      href: "/destino/higuey",
    },
    {
      title: "Golf de clase mundial",
      tag: "PGA Tour Venue",
      category: "Golf",
      description: "Campos con hoyos sobre acantilados del mar Caribe y del Atlántico.",
      imageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=600&fit=crop&q=80",
      href: "/golf",
    },
    {
      title: "Vida nocturna vibrante",
      tag: "Espectáculos & Shows",
      category: "Fiesta",
      description: "Clubes de renombre mundial con música en vivo y acróbatas.",
      imageUrl: "https://images.unsplash.com/photo-1578736641330-3155e606cd40?w=800&h=600&fit=crop&q=80",
      href: "/vida-nocturna",
    },
  ],
};

const DEFAULT_HIGHLIGHT_IMAGES = [
  "https://images.unsplash.com/photo-1628281158250-48001a7687d3?w=800&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1682965740861-fdd2065bdd2e?w=800&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1549294413-26f195200c16?w=800&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1578736641330-3155e606cd40?w=800&h=600&fit=crop&q=80",
];

interface DestinationHighlightCardsProps {
  destinationSlug: string;
  destinationName: string;
  highlights: string[];
}

export function DestinationHighlightCards({
  destinationSlug,
  destinationName,
  highlights,
}: DestinationHighlightCardsProps) {
  // Check if we have a tailored catalog for this slug
  const customItems = HIGHLIGHTS_CATALOG[destinationSlug];

  const itemsToRender: HighlightItem[] = customItems || highlights.map((hl, idx) => ({
    title: hl,
    tag: `Destacado #${idx + 1}`,
    category: "Atracción Clave",
    description: `Descubre y vive una de las experiencias más aclamadas y representativas de ${destinationName}.`,
    imageUrl: DEFAULT_HIGHLIGHT_IMAGES[idx % DEFAULT_HIGHLIGHT_IMAGES.length],
    href: `/experiencias?search=${encodeURIComponent(hl)}`,
    badgeColor: "bg-primary/20 text-primary border-primary/30",
  }));

  return (
    <div className="pt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-xl md:text-2xl font-black text-foreground tracking-tight">
            Lo más destacado de {destinationName}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Explora las experiencias, playas y atracciones imprescindibles
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {itemsToRender.map((item, index) => {
          const isFeatured = index === 0;
          return (
            <Link
              key={index}
              to={item.href || `/experiencias?search=${encodeURIComponent(item.title)}`}
              className={`group relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 flex flex-col justify-between ${
                isFeatured ? "sm:col-span-2 lg:col-span-2" : ""
              }`}
            >
              {/* Image Container with Zoom Effect */}
              <div className={`relative overflow-hidden w-full ${isFeatured ? "h-56 md:h-64" : "h-44"}`}>
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 group-hover:brightness-105 transition-all duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                {/* Badge top-left */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase backdrop-blur-md border ${
                    item.badgeColor || "bg-black/60 text-white border-white/20"
                  }`}>
                    {item.tag}
                  </span>
                </div>

                {/* Top right link arrow icon */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-md">
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>

                {/* Bottom text inside image overlay */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-white/75 block">
                    {item.category}
                  </span>
                  <h4 className="text-lg md:text-xl font-black text-white group-hover:text-primary-foreground transition-colors leading-snug">
                    {item.title}
                  </h4>
                </div>
              </div>

              {/* Bottom Card Content */}
              <div className="p-4 flex-1 flex flex-col justify-between bg-card/60">
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-primary">
                  <span>Explorar atracción</span>
                  <span className="group-hover:translate-x-1 transition-transform inline-flex items-center">
                    →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
