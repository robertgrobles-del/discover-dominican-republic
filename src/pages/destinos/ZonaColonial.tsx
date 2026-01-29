// Página estática de Zona Colonial
import { StaticDestinationPage } from "@/components/StaticDestinationPage";
import { getDestinationBySlug } from "@/data/destinations";

export default function ZonaColonial() {
  const destination = getDestinationBySlug('zona-colonial');
  
  if (!destination) {
    return <div>Destino no encontrado</div>;
  }

  return <StaticDestinationPage destination={destination} />;
}
