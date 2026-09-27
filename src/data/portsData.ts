import { ShoppingBag, Bus, Compass } from "lucide-react";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import puertoPlataImg from "@/assets/puerto-plata.jpg";
import laRomanaImg from "@/assets/la-romana.jpg";

export interface PortData {
  id: string;
  name: string;
  location: string;
  image: string;
  type: string;
  cruiseLines: string[];
  facilities: { icon: React.ElementType; name: string }[];
  schedule: string;
  nearbyAttractions: string[];
  coordinates: string;
}

export interface MarinaData {
  id: string;
  name: string;
  location: string;
  image: string;
  slips: number;
  maxLength: string;
  services: string[];
  rating: number;
  priceRange: string;
}

export const cruisePorts: PortData[] = [
  {
    id: "sans-souci",
    name: "Puerto Sans Souci",
    location: "Santo Domingo",
    image: santoDomingoImg,
    type: "Puerto de Cruceros",
    cruiseLines: ["Carnival", "Royal Caribbean", "MSC", "Norwegian"],
    facilities: [
      { icon: ShoppingBag, name: "Zona comercial duty-free" },
      { icon: Bus, name: "Terminal de taxis y tours" },
      { icon: Compass, name: "Centro de información turística" },
    ],
    schedule: "6:00 AM - 10:00 PM",
    nearbyAttractions: ["Zona Colonial", "Malecón", "Los Tres Ojos"],
    coordinates: "18.4636° N, 69.8827° W",
  },
  {
    id: "amber-cove",
    name: "Amber Cove",
    location: "Puerto Plata",
    image: puertoPlataImg,
    type: "Puerto de Cruceros Premium",
    cruiseLines: ["Carnival", "Holland America", "Princess", "P&O"],
    facilities: [
      { icon: ShoppingBag, name: "Centro comercial y artesanías" },
      { icon: Bus, name: "Shuttle gratuito a la ciudad" },
      { icon: Compass, name: "Piscina y área de playa" },
    ],
    schedule: "7:00 AM - 6:00 PM",
    nearbyAttractions: ["Teleférico", "27 Charcos", "Fortaleza San Felipe"],
    coordinates: "19.7942° N, 70.6984° W",
  },
  {
    id: "la-romana",
    name: "Puerto de La Romana",
    location: "La Romana",
    image: laRomanaImg,
    type: "Puerto Mixto",
    cruiseLines: ["Celebrity", "Azamara", "Seabourn"],
    facilities: [
      { icon: ShoppingBag, name: "Tiendas de recuerdos" },
      { icon: Bus, name: "Conexión a Casa de Campo" },
      { icon: Compass, name: "Tours organizados" },
    ],
    schedule: "6:00 AM - 8:00 PM",
    nearbyAttractions: ["Altos de Chavón", "Isla Catalina", "Casa de Campo"],
    coordinates: "18.4301° N, 68.9674° W",
  },
  {
    id: "taino-bay",
    name: "Taino Bay",
    location: "Puerto Plata",
    image: puertoPlataImg,
    type: "Puerto Urbano de Cruceros",
    cruiseLines: ["Royal Caribbean", "Celebrity", "MSC Cruceros", "Virgin Voyages"],
    facilities: [
      { icon: ShoppingBag, name: "Plaza comercial Taína" },
      { icon: Bus, name: "Acceso a pie directo al centro histórico" },
      { icon: Compass, name: "Parque y piscinas temáticas" },
    ],
    schedule: "7:00 AM - 5:00 PM",
    nearbyAttractions: ["Malecón de Puerto Plata", "Calle de las Sombrillas", "Fortaleza San Felipe"],
    coordinates: "19.7950° N, 70.6900° W",
  },
  {
    id: "cabo-rojo",
    name: "Port Cabo Rojo",
    location: "Pedernales",
    image: puntaCanaImg,
    type: "Puerto Ecoturístico Sostenible",
    cruiseLines: ["Norwegian", "Royal Caribbean", "MSC Cruceros"],
    facilities: [
      { icon: ShoppingBag, name: "Mercado ecológico de artesanos" },
      { icon: Bus, name: "Embarcadero a Bahía de las Águilas" },
      { icon: Compass, name: "Punto de eco-expediciones del Sur" },
    ],
    schedule: "7:00 AM - 6:00 PM",
    nearbyAttractions: ["Bahía de las Águilas", "Pozos de Romeo", "Parque Jaragua"],
    coordinates: "17.9150° N, 71.6520° W",
  },
];

export const marinasList: MarinaData[] = [
  {
    id: "cap-cana",
    name: "Marina Cap Cana",
    location: "Cap Cana, Punta Cana",
    image: puntaCanaImg,
    slips: 140,
    maxLength: "250 ft",
    services: ["Combustible", "Agua", "Electricidad", "WiFi", "Seguridad 24h"],
    rating: 4.9,
    priceRange: "$$$",
  },
  {
    id: "casa-campo",
    name: "Marina Casa de Campo",
    location: "La Romana",
    image: laRomanaImg,
    slips: 350,
    maxLength: "250 ft",
    services: ["Combustible", "Mantenimiento", "Tienda náutica", "Restaurantes"],
    rating: 4.8,
    priceRange: "$$$$",
  },
  {
    id: "ocean-world",
    name: "Ocean World Marina",
    location: "Puerto Plata",
    image: puertoPlataImg,
    slips: 80,
    maxLength: "150 ft",
    services: ["Combustible", "Agua", "Electricidad", "Parque acuático"],
    rating: 4.5,
    priceRange: "$$",
  },
];
