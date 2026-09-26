import { 
  Hotel, Palmtree, Compass, UtensilsCrossed, Heart, Ship, LucideIcon 
} from "lucide-react";
import relaxBeach from "@/assets/relax-beach.jpg";
import puntaCana from "@/assets/punta-cana.jpg";
import gastronomy from "@/assets/gastronomy.jpg";
import adventureImg from "@/assets/adventure.jpg";
import samanaImg from "@/assets/samana.jpg";
import hotelRoom from "@/assets/hotel-room-suite.jpg";

export interface PremioSorteo {
  id: string;
  titulo: string;
  imagen: string;
  descripcion: string;
  valor: string;
  icon: LucideIcon;
  color: string;
}

export const premiosSorteo: PremioSorteo[] = [
  {
    id: "weekend-punta-cana",
    titulo: "Fin de Semana en Punta Cana",
    imagen: puntaCana,
    descripcion: "2 noches all-inclusive para 2 personas en resort 5 estrellas.",
    valor: "US$ 800",
    icon: Hotel,
    color: "text-amber-500",
  },
  {
    id: "daypass-samana",
    titulo: "Day Pass en Samaná",
    imagen: samanaImg,
    descripcion: "Day pass para 2 personas con almuerzo, bebidas y actividades acuáticas.",
    valor: "US$ 250",
    icon: Palmtree,
    color: "text-emerald-500",
  },
  {
    id: "excursion-27charcos",
    titulo: "Excursión 27 Charcos",
    imagen: adventureImg,
    descripcion: "Tour guiado para 2 personas por los 27 Charcos de Damajagua con transporte.",
    valor: "US$ 180",
    icon: Compass,
    color: "text-sky-500",
  },
  {
    id: "cena-romantica",
    titulo: "Cena Gourmet para Dos",
    imagen: gastronomy,
    descripcion: "Cena de 5 tiempos con maridaje de vinos en restaurante premiado.",
    valor: "US$ 300",
    icon: UtensilsCrossed,
    color: "text-rose-500",
  },
  {
    id: "spa-wellness",
    titulo: "Sesión Spa Premium",
    imagen: hotelRoom,
    descripcion: "Día completo de spa con masaje, facial, acceso a piscina y almuerzo.",
    valor: "US$ 200",
    icon: Heart,
    color: "text-purple-500",
  },
  {
    id: "catamaran-tour",
    titulo: "Tour en Catamarán",
    imagen: relaxBeach,
    descripcion: "Paseo en catamarán con snorkel, barra libre y fiesta en el mar para 2.",
    valor: "US$ 220",
    icon: Ship,
    color: "text-cyan-500",
  },
];

export const sorteoReglas = [
  "Debes ser mayor de 18 años para participar en cualquier dinámica promocional.",
  "El registro te da 1 entrada al sorteo. Cada encuesta o acción completada suma entradas adicionales auditables.",
  "Método de selección: Los ganadores se eligen aleatoriamente mediante algoritmo criptográfico con acta de constancia digital pública (hash de fecha, participantes registrados y certificado de transparencia).",
  "Cumplimiento Pro Consumidor: Las bases y términos de cada concurso se adhieren a la Ley 358-05 de Protección de los Derechos del Consumidor en la República Dominicana.",
  "Los premios no son transferibles ni canjeables por dinero en efectivo.",
  "Los ganadores serán contactados por email corporativo y notificados con su número de boleto dentro de las 48 horas posteriores al cierre mensual.",
  "Los vouchers y estadías cuentan con una vigencia de uso de hasta 6 meses a partir de la emisión del premio.",
  "Descubre RD y los establecimientos patrocinadores garantizan la disponibilidad de las fechas reservadas con previa coordinación."
];
