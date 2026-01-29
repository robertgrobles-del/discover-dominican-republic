// Página estática de Puerto Plata
import { StaticDestinationPage } from "@/components/StaticDestinationPage";
import { getDestinationBySlug } from "@/data/destinations";

export default function PuertoPlata() {
  const destination = getDestinationBySlug('puerto-plata');
  
  if (!destination) {
    return <div>Destino no encontrado</div>;
  }

  return <StaticDestinationPage destination={destination} />;
}
