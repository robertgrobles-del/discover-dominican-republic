import { Link } from "react-router-dom";
import { ArrowRight, Clock, MapPin, Megaphone, Star, UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/FavoriteButton";
import { SponsoredBadge } from "@/components/promo/SponsoredBadge";
import type { Restaurant } from "@/data/restaurants";
import { getSafeCoverImage } from "@/lib/imageCovers";

/** Lo que cuesta, en palabras: el símbolo solo no dice nada a quien no conoce la escala. */
const PRICE_LABEL: Record<Restaurant["priceRange"], string> = { $: "Económico", $$: "Precio medio", $$$: "Precio alto", $$$$: "Alta cocina" };

const reviews = (count: number) => (count >= 1000 ? `${(count / 1000).toFixed(1).replace(".0", "")} mil` : String(count));

interface RestaurantListCardProps {
  restaurant: Restaurant & { isSponsored?: boolean; imageNote?: string };
  /** Etiquetas ya traducidas de los distintivos. */
  labels: { sponsored: string; featured: string };
  /** La primera fila se carga de inmediato; el resto, al acercarse. */
  priority?: boolean;
}

/**
 * Tarjeta de un restaurante en los listados. Toda la tarjeta lleva a la ficha (el enlace del título se
 * extiende sobre ella), y el botón de favoritos queda por encima sin anidarse dentro del enlace.
 */
export function RestaurantListCard({ restaurant, labels, priority = false }: RestaurantListCardProps) {
  const cuisines = restaurant.cuisineType.slice(0, 2);
  const dish = restaurant.signatureDishes?.[0];
  const services = (restaurant.services ?? []).slice(0, 3);
  const place = [restaurant.destinationName, restaurant.province].filter((part, i, all) => part && all.indexOf(part) === i).join(", ");
  const hasRating = Number.isFinite(restaurant.rating) && restaurant.rating > 0;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/30">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={getSafeCoverImage(restaurant.imageUrl, "restaurant", restaurant.slug)}
          alt={`${restaurant.name}${cuisines[0] ? `, cocina ${cuisines[0].toLowerCase()}` : ""}`}
          width={640}
          height={480}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        {/* Oscurece la base de la foto para que el precio y la cocina se lean sobre cualquier imagen. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" aria-hidden="true" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {restaurant.isSponsored && <SponsoredBadge label={labels.sponsored} />}
          {!restaurant.isSponsored && restaurant.isFeatured && (
            <Badge className="gap-1 border-0 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
              <Megaphone className="h-3 w-3" aria-hidden="true" />{labels.featured}
            </Badge>
          )}
        </div>

        <div className="absolute right-3 top-3 z-20">
          <FavoriteButton id={restaurant.id} type="restaurante" name={restaurant.name} image={restaurant.imageUrl} location={place} size="sm" />
        </div>

        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 text-white">
          <div className="flex flex-wrap gap-1.5">
            {cuisines.map((cuisine) => (
              <span key={cuisine} className="rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">{cuisine}</span>
            ))}
          </div>
          <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-neutral-900" title={PRICE_LABEL[restaurant.priceRange]}>
            <span aria-hidden="true">{restaurant.priceRange}</span>
            <span className="sr-only">{PRICE_LABEL[restaurant.priceRange]}</span>
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-bold leading-snug text-foreground">
            <Link to={`/restaurante/${restaurant.slug}`} className="outline-none transition-colors after:absolute after:inset-0 after:z-10 after:content-[''] group-hover:text-primary">
              {restaurant.name}
            </Link>
          </h3>
          {hasRating && (
            <div className="flex shrink-0 items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-sm font-bold text-primary" aria-label={`Valoración ${restaurant.rating.toFixed(1)} de 5${restaurant.reviewCount ? `, ${restaurant.reviewCount} opiniones` : ""}`}>
              <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              <span aria-hidden="true">{restaurant.rating.toFixed(1)}</span>
              {restaurant.reviewCount > 0 && <span className="text-xs font-medium text-muted-foreground" aria-hidden="true">({reviews(restaurant.reviewCount)})</span>}
            </div>
          )}
        </div>

        {place && (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate">{place}</span>
          </p>
        )}

        <p className="line-clamp-2 text-sm text-muted-foreground">{restaurant.shortDescription}</p>

        {(dish || restaurant.openingHours) && (
          <dl className="space-y-1 text-xs text-muted-foreground">
            {dish && (
              <div className="flex items-center gap-1.5">
                <UtensilsCrossed className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <dt className="sr-only">Plato de la casa</dt>
                <dd className="truncate"><span className="font-medium text-foreground">Prueba:</span> {dish}</dd>
              </div>
            )}
            {restaurant.openingHours && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <dt className="sr-only">Horario</dt>
                <dd className="truncate">{restaurant.openingHours}</dd>
              </div>
            )}
          </dl>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
          <ul className="flex min-w-0 flex-wrap gap-1.5" aria-label="Servicios">
            {services.map((service) => (
              <li key={service} className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{service}</li>
            ))}
          </ul>
          <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary" aria-hidden="true">
            Ver ficha <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
          </span>
        </div>

        {restaurant.imageNote && <p className="text-[11px] italic text-muted-foreground">Imagen de referencia.</p>}
      </div>
    </article>
  );
}
