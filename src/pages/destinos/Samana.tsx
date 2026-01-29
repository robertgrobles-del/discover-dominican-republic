// Página estática de Samaná
import { StaticDestinationPage } from "@/components/StaticDestinationPage";
import { getDestinationBySlug } from "@/data/destinations";

export default function Samana() {
  const destination = getDestinationBySlug('samana');
  
  if (!destination) {
    return <div>Destino no encontrado</div>;
  }

  return <StaticDestinationPage destination={destination} />;
}
