// Página estática de Cap Cana
import { StaticDestinationPage } from "@/components/StaticDestinationPage";
import { getDestinationBySlug } from "@/data/destinations";

export default function CapCana() {
  const destination = getDestinationBySlug('cap-cana');
  
  if (!destination) {
    return <div>Destino no encontrado</div>;
  }

  return <StaticDestinationPage destination={destination} />;
}
