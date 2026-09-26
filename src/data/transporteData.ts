import { Car, Bus, Plane, Ship, Zap, DollarSign, Snowflake, ShieldCheck, Train } from "lucide-react";

export interface OperadorPremium {
  nombre: string;
  logo: string;
  descripcion: string;
  tarifaPromedio: string;
  servicios: string[];
  rutas: { tramo: string; tiempo: string; salidas: string }[];
  telefono: string;
  terminalPrincipal: string;
}

export interface SistemaMasivo {
  sistema: string;
  icono: any;
  estado: string;
  tarifa: string;
  horario: string;
  cobertura: string;
  consejo: string;
  link: string;
}

export interface PeajePasoRapido {
  autopista: string;
  estacion: string;
  precioCat1: string;
}

export interface RutaGuagua {
  ruta: string;
  tiempo: string;
  precio: string;
  frecuencia: string;
}

export interface ConsejoViaje {
  titulo: string;
  descripcion: string;
  icono: any;
}

export interface TransportOption {
  type: string;
  icon: any;
  description: string;
  pros: string[];
  cons: string[];
  priceRange: string;
  tips: string[];
  apps?: string[];
  companies?: string[];
}

export interface RouteItem {
  from: string;
  to: string;
  distance: string;
  time: string;
  transport: string;
  tolls: string;
}

export const operadoresPremium: OperadorPremium[] = [
  {
    nombre: "Caribe Tours",
    logo: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=200&auto=format&fit=crop&q=80",
    descripcion: "La red de transporte interurbano más grande y moderna del país. Salidas cada 30-60 min hacia el Cibao, Costa Norte y Región Sur.",
    tarifaPromedio: "RD$ 400 - 650 (US$7-11)",
    servicios: ["WiFi 5G", "A/C Frío", "Baño a bordo", "Tomas USB", "Rastreo GPS"],
    rutas: [
      { tramo: "Santo Domingo ↔ Santiago", tiempo: "2h 15m", salidas: "Cada 30 min" },
      { tramo: "Santo Domingo ↔ Puerto Plata", tiempo: "3h 45m", salidas: "Cada 1h" },
      { tramo: "Santo Domingo ↔ Samaná / Las Terrenas", tiempo: "2h 45m", salidas: "4 diarias" },
      { tramo: "Santo Domingo ↔ Barahona", tiempo: "3h 30m", salidas: "Cada 2h" },
    ],
    telefono: "(809) 221-4422",
    terminalPrincipal: "Av. 27 de Febrero esq. Leopoldo Navarro, D.N."
  },
  {
    nombre: "Metro Servicios Turísticos",
    logo: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=200&auto=format&fit=crop&q=80",
    descripcion: "Servicio ejecutivo de primera clase con terminales tipo VIP lounge, asientos reclinables de piel y café de cortesía.",
    tarifaPromedio: "RD$ 500 - 750 (US$9-13)",
    servicios: ["Lounge VIP", "Asientos de Piel", "Café Gratis", "WiFi Ultra", "Puntualidad 100%"],
    rutas: [
      { tramo: "Santo Domingo ↔ Santiago (Ejecutivo)", tiempo: "2h 00m", salidas: "Cada 1h" },
      { tramo: "Santo Domingo ↔ Puerto Plata", tiempo: "3h 30m", salidas: "3 diarias" },
      { tramo: "Santiago ↔ Puerto Plata", tiempo: "1h 15m", salidas: "Cada 2h" },
    ],
    telefono: "(809) 583-9111",
    terminalPrincipal: "Av. Winston Churchill esq. Hatuey, Santo Domingo"
  },
  {
    nombre: "Expreso Bávaro",
    logo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&auto=format&fit=crop&q=80",
    descripcion: "La conexión oficial directa y sin paradas intermedias entre la capital Santo Domingo y la zona hotelera de Punta Cana / Bávaro.",
    tarifaPromedio: "RD$ 550 (US$9.50)",
    servicios: ["Directo sin paradas", "A/C", "TV Entretenimiento", "Bodega Amplia"],
    rutas: [
      { tramo: "Santo Domingo ↔ Punta Cana / Bávaro", tiempo: "2h 30m", salidas: "Cada hora (6am - 6pm)" },
      { tramo: "Santo Domingo ↔ Friusa / Verón", tiempo: "2h 45m", salidas: "Cada hora" }
    ],
    telefono: "(809) 552-1678",
    terminalPrincipal: "Calle Juan Sánchez Ramírez 31, Gazcue, Santo Domingo"
  },
  {
    nombre: "Transporte Asotrapusa (Las Terrenas)",
    logo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&auto=format&fit=crop&q=80",
    descripcion: "Conexión exprés directa por la moderna Autopista del Nordeste hacia las playas de Las Terrenas y la Península de Samaná.",
    tarifaPromedio: "RD$ 500 (US$8.50)",
    servicios: ["Directo Autopista Nordeste", "A/C", "Música ambiental"],
    rutas: [
      { tramo: "Santo Domingo (Parada Samaná) ↔ Las Terrenas", tiempo: "2h 15m", salidas: "6 diarias" },
      { tramo: "Santo Domingo ↔ Santa Bárbara de Samaná", tiempo: "2h 30m", salidas: "5 diarias" }
    ],
    telefono: "(809) 687-1470",
    terminalPrincipal: "C/ Barahona esq. C/ Eusebio Manzueta, Villa Consuelo"
  }
];

export const sistemasMasivos: SistemaMasivo[] = [
  {
    sistema: "Metro de Santo Domingo",
    icono: Train,
    estado: "Operativo (Línea 1, 2 y Extensión Los Alcarrizos)",
    tarifa: "RD$ 20 por viaje + RD$ 60 Tarjeta Metro recargable",
    horario: "Lun-Vie: 6:00 AM - 10:30 PM | Sáb-Dom-Feriados: 6:00 AM - 10:00 PM",
    cobertura: "Conecta Santo Domingo Norte, Centro, Este y Oeste sin tráfico vehicular.",
    consejo: "Usa la estación central Juan Pablo Duarte (Av. Kennedy / Máximo Gómez) para transbordar gratis entre Línea 1 y Línea 2.",
    link: "/metro-santo-domingo"
  },
  {
    sistema: "Teleférico de Santo Domingo",
    icono: Zap,
    estado: "Operativo (Línea 1 Gualey/Sabana Perdida + Línea 2 Los Alcarrizos)",
    tarifa: "Integrado al Metro (Sin costo adicional con la misma tarjeta)",
    horario: "Lun-Vie: 6:00 AM - 10:30 PM | Sáb: 6:00 AM - 9:00 PM | Dom: 8:00 AM - 9:00 PM",
    cobertura: "Sobrevuela el Río Ozama y conecta sectores elevados con las terminales del metro.",
    consejo: "Excelente opción escénica y libre de congestionamiento para cruzar el Gran Santo Domingo.",
    link: "/teleferico-santo-domingo"
  },
  {
    sistema: "Monorriel de Santiago",
    icono: Train,
    estado: "Fase 1 Inauguración 2026 (En Pruebas)",
    tarifa: "Tarifa integrada Sistema SIT Santiago",
    horario: "6:00 AM - 10:00 PM (Estimado operativo)",
    cobertura: "Primer monorriel del Caribe: Conecta Cienfuegos con el Monumento de Santiago y PUCMM.",
    consejo: "Reducirá el trayecto norte-sur en Santiago de 60 min en hora pico a solo 18 min.",
    link: "/monoriel-santiago"
  }
];

export const peajesPasoRapido: PeajePasoRapido[] = [
  { autopista: "Autopista Duarte (SD ↔ Cibao / Santiago)", estacion: "Peaje Duarte Km 25", precioCat1: "RD$ 60" },
  { autopista: "Autopista Las Américas (SD ↔ Boca Chica / Este)", estacion: "Peaje Las Américas", precioCat1: "RD$ 60" },
  { autopista: "Autovía del Este (SD ↔ Punta Cana)", estacion: "Peaje Coral I & II", precioCat1: "RD$ 100 / RD$ 100" },
  { autopista: "Autopista del Nordeste (SD ↔ Samaná)", estacion: "Peaje Marbella / Naranjal", precioCat1: "RD$ 63 / RD$ 201" },
  { autopista: "Circunvalación Santo Domingo", estacion: "Peaje Tramo I & II", precioCat1: "RD$ 100" },
];

export const rutasGuaguas: RutaGuagua[] = [
  { ruta: "Higüey ↔ Punta Cana / Bávaro", tiempo: "45 min", precio: "RD$ 150 (US$2.50)", frecuencia: "Cada 15 min" },
  { ruta: "Santo Domingo ↔ Boca Chica", tiempo: "40 min", precio: "RD$ 100 (US$1.70)", frecuencia: "Cada 10 min" },
  { ruta: "Puerto Plata ↔ Sosúa ↔ Cabarete", tiempo: "35 min", precio: "RD$ 80 (US$1.40)", frecuencia: "Continuo" },
  { ruta: "Santiago ↔ Jarabacoa", tiempo: "55 min", precio: "RD$ 150 (US$2.50)", frecuencia: "Cada 20 min" },
  { ruta: "Las Terrenas ↔ El Limón / Las Galeras", tiempo: "45 min", precio: "RD$ 120 (US$2.00)", frecuencia: "Cada 30 min" },
  { ruta: "Santo Domingo ↔ San Cristóbal", tiempo: "30 min", precio: "RD$ 80 (US$1.40)", frecuencia: "Cada 5 min" }
];

export const consejosViaje: ConsejoViaje[] = [
  {
    titulo: "Paso Rápido en Peajes",
    descripcion: "Si alquilas un vehículo, solicita el tag de 'Paso Rápido'. Ahorra hasta 30 minutos de cola en las autopistas hacia Punta Cana, Samaná y Santiago.",
    icono: Zap
  },
  {
    titulo: "Efectivo vs. Apps",
    descripcion: "En Uber y DiDi puedes pagar con tarjeta de crédito en Santo Domingo y Santiago. En guaguas, motoconchos y peajes manuales lleva siempre efectivo en RD$.",
    icono: DollarSign
  },
  {
    titulo: "Aire Acondicionado Potente",
    descripcion: "Los autobuses de larga distancia (Caribe Tours, Metro, Expreso Bávaro) mantienen el aire a temperaturas muy frescas (18°C). Lleva siempre un suéter ligero.",
    icono: Snowflake
  },
  {
    titulo: "Conducción Defensiva",
    descripcion: "En carretera respeta los límites de velocidad (80-100 km/h en autopistas). Evita conducir de noche en carreteras secundarias o caminos de montaña.",
    icono: ShieldCheck
  }
];

export const transportOptions: TransportOption[] = [
  {
    type: "Apps de Transporte (Uber / DiDi / inDrive)",
    icon: Car,
    description: "La forma más segura, cómoda y con tarifa transparente para moverte en Santo Domingo, Santiago, Puerto Plata y zonas urbanas.",
    pros: ["Tarifa fijada antes de abordar", "Pago seguro con tarjeta o efectivo", "Trazabilidad GPS y soporte 24/7"],
    cons: ["Disponibilidad limitada en zonas rurales o playas remotas"],
    priceRange: "RD$ 180 - 600 (US$3 - 10 por viaje)",
    tips: [
      "Verifica la placa del vehículo antes de subirte",
      "Uber opera con alta disponibilidad en SD, Santiago y Punta Cana",
      "DiDi e inDrive son muy populares en las áreas metropolitanas"
    ],
    apps: ["Uber", "DiDi", "inDrive", "Apolo Taxi"],
  },
  {
    type: "Rent-a-Car (Alquiler de Vehículo)",
    icon: Car,
    description: "Recomendado para recorrer el país con libertad: playas vírgenes de Samaná, cascadas de Jarabacoa o la costa virgen de Pedernales.",
    pros: ["Libertad absoluta de itinerario", "Espacio para todo el equipaje", "Excelente red de autopistas principales"],
    cons: ["Tráfico denso en horas pico en SD", "Peajes obligatorios (Paso Rápido recomendado)"],
    priceRange: "US$ 35 - 85 / día",
    tips: [
      "Licencia de conducir de tu país de origen es 100% válida para turistas",
      "Contrata seguro con cobertura total (CDW / LDW)",
      "Usa Google Maps o Waze con eSIM local para navegación en tiempo real",
    ],
    companies: ["Avis", "Budget", "Hertz", "National", "Alamo", "Europcar"],
  },
  {
    type: "Traslados Privados & Aeropuerto",
    icon: Plane,
    description: "Vans y transfers ejecutivos reservados previamente con chofer bilingüe directo desde el aeropuerto a tu hotel o resort.",
    pros: ["Recepción en sala de llegadas", "Sin esperas ni regateo", "Vehículos amplios con aire acondicionado"],
    cons: ["Costo superior al autobús público"],
    priceRange: "US$ 30 - 90 por trayecto",
    tips: [
      "Aeropuertos clave: Punta Cana (PUJ), Las Américas (SDQ), Cibao (STI), Puerto Plata (POP)",
      "Reserva con antelación si viajas con familia o grupos grandes",
    ],
  },
];

export const routes: RouteItem[] = [
  { from: "Santo Domingo", to: "Punta Cana", distance: "195 km", time: "2h 15 min", transport: "Autovía del Este", tolls: "3 peajes" },
  { from: "Santo Domingo", to: "Samaná / Las Terrenas", distance: "160 km", time: "2h 15 min", transport: "Autopista Nordeste", tolls: "4 peajes" },
  { from: "Santo Domingo", to: "Santiago de los Caballeros", distance: "155 km", time: "2h 00 min", transport: "Autopista Duarte", tolls: "1 peaje" },
  { from: "Santo Domingo", to: "Puerto Plata", distance: "215 km", time: "3h 30 min", transport: "Autopista Duarte / Navarrete", tolls: "1 peaje" },
  { from: "Punta Cana", to: "Bayahíbe / La Romana", distance: "70 km", time: "50 min", transport: "Autovía del Coral", tolls: "1 peaje" },
  { from: "Santiago", to: "Jarabacoa (Montaña)", distance: "52 km", time: "50 min", transport: "Carretera Federico Basilis", tolls: "Sin peajes" },
  { from: "Puerto Plata", to: "Cabarete / Sosúa", distance: "38 km", time: "40 min", transport: "Carretera Troncal Costa Norte", tolls: "Sin peajes" },
  { from: "Santo Domingo", to: "Barahona / Bahía de las Águilas", distance: "205 km", time: "3h 15 min", transport: "Autopista Sánchez / 6 de Nov.", tolls: "1 peaje" },
];

export const localTips = [
  {
    title: "Guaguas (Minibuses)",
    desc: "Transporte público local muy económico. Experiencia auténtica pero no siempre cómoda.",
    icon: Bus,
  },
  {
    title: "Motoconchos",
    desc: "Motos-taxi populares para distancias cortas. Económicos pero solo para aventureros.",
    icon: Car,
  },
  {
    title: "Botes y Ferries",
    desc: "Para llegar a cayos e islas como Saona, Catalina o Cayo Levantado.",
    icon: Ship,
  },
];
