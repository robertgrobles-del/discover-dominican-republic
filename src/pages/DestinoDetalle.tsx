import { Link, Navigate, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StaticDestinationPage } from "@/components/StaticDestinationPage";
import { getDestinationBySlug, type Destination } from "@/data/destinations";
import { useCollectionRecord, type Row } from "@/lib/collectionPage";
import { destinationPatch, withExtras, type PlaceIndex } from "@/services/contentMappers";

/**
 * Detalle de un destino. Todos los destinos usan la misma plantilla (`StaticDestinationPage`) y salen de la
 * colección «Destinos» del backend, que es lo que edita el panel:
 *  - backend disponible → se muestra lo publicado allí (un cambio del panel se ve al recargar; un destino
 *    despublicado o borrado deja de existir aunque siga en el catálogo local);
 *  - backend caído → se muestra la copia local del catálogo, si la hay.
 * La fila trae sus columnas y, en `extras`, el resto de la ficha (atracciones, consejos, presupuesto…).
 */
const NO_PLACES: PlaceIndex = { provinces: new Map(), destinations: new Map() };
/** Lo mínimo para que la plantilla pinte un destino que la base trae incompleto. */
const EMPTY: Destination = {
  id: "", slug: "", name: "", region: "este", type: "destino", categories: [], shortDescription: "", description: "",
  imageUrl: "/placeholder.svg", gallery: [], highlights: [], bestTimeToVisit: "", howToGetThere: "", weatherInfo: "", typicalDishes: [],
};
const REGIONS: Destination["region"][] = ["norte", "sur", "este", "santo-domingo"];

function fromRow(row: Row, local: Destination | undefined): Destination {
  const merged = { ...EMPTY, ...(local ?? {}), ...withExtras<Destination>(row, destinationPatch(row, NO_PLACES)) } as Destination;
  // Lo que venga de `extras` con una forma inesperada no debe romper la plantilla.
  const arr = <T,>(v: unknown, fallback: T[]): T[] => (Array.isArray(v) ? (v as T[]) : fallback);
  return {
    ...merged,
    id: local?.id ?? merged.id ?? String(row.slug ?? ""),
    region: REGIONS.includes(merged.region) ? merged.region : "este",
    categories: arr(merged.categories, []), gallery: arr(merged.gallery, []), highlights: arr(merged.highlights, []), typicalDishes: arr(merged.typicalDishes, []),
    attractions: Array.isArray(merged.attractions) ? merged.attractions : undefined,
    imageUrl: merged.imageUrl || EMPTY.imageUrl,
  };
}

export default function DestinoDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const { item: destination, loading } = useCollectionRecord<Destination>("destinations", slug, slug ? getDestinationBySlug(slug) : undefined, fromRow);

  if (loading) {
    return (
      <div className="min-h-dvh bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-28 pb-12">
          <Skeleton className="mb-8 h-[50vh] w-full rounded-3xl" />
          <Skeleton className="mb-3 h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Footer />
      </div>
    );
  }
  if (!destination) {
    return (
      <div className="min-h-dvh bg-background">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="mb-4 text-3xl font-bold">Destino no encontrado</h1>
          <p className="mb-8 text-muted-foreground">El destino que buscas no existe o ha sido movido.</p>
          <Button asChild><Link to="/destinos">Ver todos los destinos</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }
  // Una provincia tiene su propia página; /destino/<provincia> sería una copia pobre de ella.
  if (destination.type === "provincia") return <Navigate to={`/provincia/${destination.slug}`} replace />;
  return <StaticDestinationPage key={destination.slug} destination={destination} />;
}
