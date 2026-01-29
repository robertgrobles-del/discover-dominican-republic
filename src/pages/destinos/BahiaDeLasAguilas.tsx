// Página estática de Bahía de las Águilas
import { StaticDestinationPage } from "@/components/StaticDestinationPage";
import { getDestinationBySlug } from "@/data/destinations";

export default function BahiaDeLasAguilas() {
  const destination = getDestinationBySlug('bahia-de-las-aguilas');
  
  if (!destination) {
    return <div>Destino no encontrado</div>;
  }

  return <StaticDestinationPage destination={destination} />;
}
