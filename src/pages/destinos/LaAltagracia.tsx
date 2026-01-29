// Página estática de La Altagracia
import { StaticDestinationPage } from "@/components/StaticDestinationPage";
import { getDestinationBySlug } from "@/data/destinations";

export default function LaAltagracia() {
  const destination = getDestinationBySlug('la-altagracia');
  
  if (!destination) {
    return <div>Destino no encontrado</div>;
  }

  return <StaticDestinationPage destination={destination} />;
}
