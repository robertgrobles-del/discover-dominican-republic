import { Link } from "react-router-dom";
import { BedDouble, Star, UtensilsCrossed } from "lucide-react";
import { getHotelsByDestination, getHotelsByProvince } from "@/data/hotels";
import { getRestaurantsByDestination, getRestaurantsByProvince } from "@/data/restaurants";

/**
 * «Dónde alojarte» y «Dónde comer» cerca de un lugar (playa, atracción…): primero los del mismo destino, luego
 * los de la provincia. Si no hay ninguno cerca, la sección no se muestra (no se rellena con otros del país).
 */
export function NearbyStayEat({ placeName, destinationId, province }: { placeName: string; destinationId?: string; province?: string }) {
  const pick = <T,>(own: T[], prov: T[]) => Array.from(new Set([...own, ...prov])).slice(0, 3);
  const hotels = pick(destinationId ? getHotelsByDestination(destinationId) : [], province ? getHotelsByProvince(province) : []);
  const restaurants = pick(destinationId ? getRestaurantsByDestination(destinationId) : [], province ? getRestaurantsByProvince(province) : []);
  if (!hotels.length && !restaurants.length) return null;

  const Card = ({ to, img, title, sub, rating }: { to: string; img: string; title: string; sub: string; rating?: number }) => (
    <Link to={to} className="group flex gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/50">
      <img src={img} alt="" loading="lazy" className="h-20 w-24 shrink-0 rounded-xl object-cover" />
      <div className="min-w-0">
        <h4 className="truncate font-semibold text-foreground group-hover:text-primary">{title}</h4>
        <p className="truncate text-xs text-muted-foreground">{sub}</p>
        {rating ? <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{rating}</p> : null}
      </div>
    </Link>
  );

  return (
    <section className="mt-14 grid gap-8 border-t border-border/60 pt-10 lg:grid-cols-2 [&>*]:min-w-0">
      {hotels.length > 0 && (
        <div>
          <h3 className="mb-4 flex items-center gap-2 font-display text-2xl font-black text-foreground"><BedDouble className="h-6 w-6 text-primary" />Dónde alojarte cerca de {placeName}</h3>
          <div className="space-y-3">{hotels.map((h) => <Card key={h.id} to={`/alojamiento/${h.slug}`} img={h.imageUrl} title={h.name} sub={[h.destinationName, h.priceRange].filter(Boolean).join(" · ")} rating={h.rating} />)}</div>
          <Link to="/alojamientos" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline underline-offset-4">Ver más alojamientos</Link>
        </div>
      )}
      {restaurants.length > 0 && (
        <div>
          <h3 className="mb-4 flex items-center gap-2 font-display text-2xl font-black text-foreground"><UtensilsCrossed className="h-6 w-6 text-primary" />Dónde comer cerca</h3>
          <div className="space-y-3">{restaurants.map((r) => <Card key={r.id} to={`/restaurante/${r.slug}`} img={r.imageUrl} title={r.name} sub={[r.cuisineType?.[0], r.destinationName, r.priceRange].filter(Boolean).join(" · ")} rating={r.rating} />)}</div>
          <Link to="/restaurantes" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline underline-offset-4">Ver más restaurantes</Link>
        </div>
      )}
    </section>
  );
}
