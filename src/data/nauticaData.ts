import { Anchor, Ship, Fuel, Waves, Wifi, CreditCard, Car, Pill, Info, ShipWheel } from "lucide-react";
import heroBeachImg from "@/assets/hero-beach.jpg";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import laRomanaImg from "@/assets/la-romana.jpg";
import puertoPlataImg from "@/assets/puerto-plata.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import adventureImg from "@/assets/adventure.jpg";

export const destinationData: Record<string, Record<string, { label: string; dist: number; timeMinutes: number }>> = {
  "Amber Cove": {
    "Damajagua": { label: "27 Charcos de Damajagua", dist: 24, timeMinutes: 35 },
    "PlayaDorada": { label: "Playa Dorada (Puerto Plata)", dist: 16, timeMinutes: 25 },
    "Cabarete": { label: "Cabarete (Windsurf / Surf)", dist: 45, timeMinutes: 65 },
    "CayoArena": { label: "Cayo Arena (Punta Rucia)", dist: 78, timeMinutes: 110 },
  },
  "Taino Bay": {
    "Damajagua": { label: "27 Charcos de Damajagua", dist: 18, timeMinutes: 30 },
    "PlayaDorada": { label: "Playa Dorada (Puerto Plata)", dist: 8, timeMinutes: 15 },
    "Cabarete": { label: "Cabarete (Windsurf / Surf)", dist: 38, timeMinutes: 50 },
    "CayoArena": { label: "Cayo Arena (Punta Rucia)", dist: 75, timeMinutes: 105 },
  },
  "Sans Soucí": {
    "ZonaColonial": { label: "Zona Colonial (Histórico)", dist: 2, timeMinutes: 10 },
    "BocaChica": { label: "Playa Boca Chica", dist: 32, timeMinutes: 40 },
    "TresOjos": { label: "Los Tres Ojos", dist: 6, timeMinutes: 15 },
    "Samaná": { label: "Samaná (Terrestre)", dist: 175, timeMinutes: 160 },
  }
};

export const marinas = [
  {
    id: "cap-cana",
    name: "Marina Cap Cana",
    location: "Punta Cana",
    rating: 5,
    description: "Ubicada en el punto de encuentro del Caribe y el Atlántico, ofrece servicios de clase mundial y es reconocida como uno de los mejores destinos para la pesca deportiva de aguja blanca y azul.",
    slips: "150+",
    maxLength: "8ft",
    services: ["Fuel"],
    image: puntaCanaImg,
  },
  {
    id: "casa-de-campo",
    name: "Marina Casa de Campo",
    location: "La Romana",
    rating: 4.5,
    description: "Un elegante puerto deportivo inspirado en el Mediterráneo, donde el río Chavón se encuentra con el Mar Caribe. Cuenta con tiendas exclusivas, cine y restaurantes gourmet.",
    slips: "370",
    maxLength: "12ft",
    services: ["Service"],
    image: laRomanaImg,
  },
  {
    id: "ocean-world",
    name: "Ocean World Marina",
    location: "Puerto Plata",
    rating: 4,
    description: "La única marina con servicio completo en la costa norte. Integra un parque de aventuras con delfines, restaurantes, casino y vida nocturna vibrante.",
    slips: "100+",
    maxLength: "Casino",
    services: ["Customs"],
    image: puertoPlataImg,
  },
];

export const puertos = [
  {
    nombre: "Amber Cove",
    ubicacion: "Puerto Plata",
    descripcion: "Terminal moderna de Carnival con parque acuático y cabañas.",
    imagen: puertoPlataImg,
    tags: ["Piscinas", "Zip Line"]
  },
  {
    nombre: "Taino Bay",
    ubicacion: "Puerto Plata",
    descripcion: "Terminal vibrante con río lento, avario y restaurantes.",
    imagen: adventureImg,
    tags: ["Río Lento", "Motos"]
  },
  {
    nombre: "Sans Soucí",
    ubicacion: "Santo Domingo",
    descripcion: "Acceso directo a la Zona Colonial, Primera de América.",
    imagen: santoDomingoImg,
    tags: ["Historia", "Cultura"]
  }
];

export const itinerario = [
  { hora: "9:00 AM", titulo: "Desembarque y Bienvenida", desc: "Disfruta de la música típica y tómate fotos en el letrero del puerto." },
  { hora: "10:00 AM", titulo: "Transporte al Centro", desc: "Toma un taxi autorizado o shuttle hacia el centro histórico o playa." },
  { hora: "11:00 AM - 1:00 PM", titulo: "Exploración y Cultura", desc: "Visita museos, camina por calles coloniales y compra artesanías locales." },
  { hora: "1:30 PM", titulo: "Almuerzo Dominicano", desc: 'Prueba el "Mofongo" o la "Bandera" en un restaurante certificado.' },
  { hora: "4:00 PM", titulo: "Regreso al Barco", desc: "Tiempo de sobra para abordar con seguridad antes de zarpar." },
];

export const serviciosTerminal = [
  { nombre: "Wi-Fi Gratis", icon: Wifi },
  { nombre: "ATM / Cajeros", icon: CreditCard },
  { nombre: "Parada Taxis", icon: Car },
  { nombre: "Farmacia", icon: Pill },
  { nombre: "Duty Free", icon: ShipWheel },
  { nombre: "Info Point", icon: Info },
];

export const excursiones = [
  {
    nombre: "27 Charcos de Damajagua",
    descripcion: "Aventura de saltos y toboganes naturales en...",
    precio: 55,
    duracion: "4 Horas",
    imagen: adventureImg,
  },
  {
    nombre: "City Tour Colonial",
    descripcion: "Recorrido histórico por la primera ciudad de América.",
    precio: 45,
    duracion: "3 Horas",
    imagen: santoDomingoImg,
  },
  {
    nombre: "Ron & Tabaco",
    descripcion: "Experiencia sensorial probando los mejores...",
    precio: 35,
    duracion: "2 Horas",
    imagen: heroBeachImg,
  },
  {
    nombre: "Día de Playa VIP",
    descripcion: "Relajación total con almuerzo y bebidas incluid.",
    precio: 65,
    duracion: "5 Horas",
    imagen: puertoPlataImg,
  },
];

export const nauticalServices = [
  {
    title: "Pesca Deportiva",
    description: "República Dominicana es un destino premier para la pesca del marlín. Organizamos torneos y charters privados con tripulación experta.",
    action: "Reservar Charter",
    icon: Anchor,
  },
  {
    title: "Alquiler de Yates",
    description: "Desde catamaranes para fiestas hasta megayates de lujo. Explore las costas de Samaná o Isla Saona con estilo y confort total.",
    action: "Ver Flota",
    icon: Ship,
  },
  {
    title: "Mantenimiento y Amarre",
    description: "Servicios técnicos especializados, limpieza de cascos, reabastecimiento de combustible y seguridad 24/7 para su embarcación.",
    action: "Solicitar Servicio",
    icon: Waves,
  },
];

export const regulations = [
  { title: "Permisos de Entrada", description: "Requisitos para embarcaciones extranjeras." },
  { title: "Protocolos de Seguridad", description: "Normas de la Armada Dominicana." },
  { title: "Áreas Protegidas", description: "Mapas de santuarios marinos." },
];

export const transporte = [
  { tipo: "Taxis Turísticos", desc: "Tarifas fijas reguladas por el sindicato. Seguros y disponibles en la salida.", precio: "$20 - $35" },
  { tipo: "Shuttle de Excursión", desc: "Ideal para grupos. Incluye guía y regreso garantizado a tiempo.", precio: "$15 / persona" },
  { tipo: "Rent-a-Car", desc: "Para los aventureros. Se requiere licencia válida y tarjeta de crédito.", precio: "$50 / día" },
];
