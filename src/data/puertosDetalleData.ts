export interface PortFacility {
  name: string;
  icon: string;
  description: string;
}

export interface CruiseLine {
  name: string;
  logo: string;
  routes: string[];
}

export interface PortSchedule {
  openHours: string;
  peakSeason: string;
  avgShipsPerWeek: string;
}

export interface PortNearbyActivity {
  name: string;
  type: string;
  distance: string;
  image: string;
}

export interface PortReview {
  name: string;
  rating: number;
  date: string;
  comment: string;
}

export interface PortDetailData {
  id: string;
  name: string;
  location: string;
  coordinates: string;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  type: string;
  cruiseLines: CruiseLine[];
  facilities: PortFacility[];
  schedule: PortSchedule;
  nearbyActivities: PortNearbyActivity[];
  reviews: PortReview[];
  nearbyDestinations: string[];
}

export const puertosDetalleData: Record<string, PortDetailData> = {
  "sans-souci": {
    id: "sans-souci",
    name: "Terminal de Cruceros Sans Souci",
    location: "Santo Domingo",
    coordinates: "18.4720, -69.8823",
    description: "La Terminal de Cruceros Sans Souci es el puerto de cruceros más importante de Santo Domingo, ubicado estratégicamente junto a la zona colonial. Recibe los principales cruceros del Caribe y ofrece acceso directo a la primera ciudad del Nuevo Mundo, declarada Patrimonio de la Humanidad por la UNESCO.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=800&fit=crop",
    rating: 4.6,
    reviewCount: 1250,
    type: "Puerto de Cruceros",
    cruiseLines: [
      { name: "Royal Caribbean", logo: "RC", routes: ["Miami", "Fort Lauderdale"] },
      { name: "Carnival Cruise Line", logo: "CCL", routes: ["Tampa", "New Orleans"] },
      { name: "Norwegian Cruise Line", logo: "NCL", routes: ["Nueva York", "San Juan"] },
      { name: "MSC Cruceros", logo: "MSC", routes: ["Miami", "Europa"] },
    ],
    facilities: [
      { name: "Terminal con A/C", icon: "building", description: "Área climatizada de espera" },
      { name: "Tiendas Duty Free", icon: "shopping", description: "Artesanías, licores, tabaco" },
      { name: "Restaurantes", icon: "coffee", description: "Gastronomía local e internacional" },
      { name: "Centro de Tours", icon: "compass", description: "Excursiones y city tours" },
      { name: "Transporte", icon: "car", description: "Taxis, buses, rent-a-car" },
      { name: "WiFi Gratis", icon: "wifi", description: "Conexión en toda la terminal" },
    ],
    schedule: { openHours: "Según itinerario de cruceros", peakSeason: "Noviembre - Abril", avgShipsPerWeek: "8-12 cruceros" },
    nearbyActivities: [
      { name: "Zona Colonial", type: "Historia", distance: "5 min caminando", image: "https://images.unsplash.com/photo-1585535116934-9e1a14063e35?w=300" },
      { name: "Alcázar de Colón", type: "Museo", distance: "10 min", image: "https://images.unsplash.com/photo-1564507004663-b6dfb3c824d5?w=300" },
      { name: "Calle El Conde", type: "Compras", distance: "8 min", image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=300" },
      { name: "Malecón", type: "Paseo", distance: "15 min", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300" },
    ],
    reviews: [
      { name: "Carlos M.", rating: 5, date: "Hace 1 semana", comment: "Excelente terminal, muy bien organizada. El acceso a la Zona Colonial es increíble." },
      { name: "María L.", rating: 4, date: "Hace 2 semanas", comment: "Buenos servicios, aunque en temporada alta puede haber mucha gente." },
    ],
    nearbyDestinations: ["Santo Domingo", "Boca Chica", "Juan Dolio"],
  },
  "amber-cove": {
    id: "amber-cove",
    name: "Puerto Amber Cove",
    location: "Puerto Plata",
    coordinates: "19.7942, -70.6984",
    description: "Amber Cove es un puerto de cruceros premium en la costa norte de República Dominicana, operado por Carnival Corporation. Inaugurado en 2015 con una inversión de US$85 millones, ofrece una experiencia completa con piscinas, restaurantes, tiendas y shuttle gratuito a Puerto Plata. Su diseño integra la naturaleza tropical con instalaciones modernas de primer nivel.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=800&fit=crop",
    rating: 4.7,
    reviewCount: 2100,
    type: "Puerto de Cruceros Premium",
    cruiseLines: [
      { name: "Carnival", logo: "CCL", routes: ["Miami", "Tampa", "Galveston"] },
      { name: "Holland America", logo: "HAL", routes: ["Fort Lauderdale", "San Diego"] },
      { name: "Princess Cruises", logo: "PC", routes: ["Fort Lauderdale"] },
      { name: "P&O Cruises", logo: "P&O", routes: ["Southampton"] },
    ],
    facilities: [
      { name: "Piscina y Área de Playa", icon: "compass", description: "Piscina de borde infinito con vista al mar" },
      { name: "Centro Comercial", icon: "shopping", description: "Tiendas de artesanías, ámbar y larimar" },
      { name: "Restaurantes", icon: "coffee", description: "Comida dominicana e internacional" },
      { name: "Shuttle Gratuito", icon: "car", description: "Transporte a Puerto Plata cada 15 min" },
      { name: "Zipline", icon: "compass", description: "Tirolesa sobre el agua" },
      { name: "WiFi", icon: "wifi", description: "Internet disponible en toda el área" },
    ],
    schedule: { openHours: "7:00 AM - 6:00 PM (días de crucero)", peakSeason: "Noviembre - Abril", avgShipsPerWeek: "4-6 cruceros" },
    nearbyActivities: [
      { name: "27 Charcos de Damajagua", type: "Aventura", distance: "25 min", image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=300" },
      { name: "Teleférico", type: "Naturaleza", distance: "20 min", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300" },
      { name: "Fortaleza San Felipe", type: "Historia", distance: "15 min", image: "https://images.unsplash.com/photo-1564507004663-b6dfb3c824d5?w=300" },
    ],
    reviews: [
      { name: "John S.", rating: 5, date: "Hace 3 días", comment: "Amazing port! The pool area is incredible and the shuttle to town is very convenient." },
      { name: "Ana R.", rating: 5, date: "Hace 1 semana", comment: "El mejor puerto de cruceros que he visitado. Las instalaciones son de primera." },
    ],
    nearbyDestinations: ["Puerto Plata", "Sosúa", "Cabarete"],
  },
  "taino-bay": {
    id: "taino-bay",
    name: "Puerto Taino Bay",
    location: "Puerto Plata",
    coordinates: "19.7950, -70.6900",
    description: "Taino Bay es el nuevo puerto de cruceros de Puerto Plata, inaugurado en 2019 en el centro de la ciudad. A diferencia de Amber Cove, está ubicado directamente en el malecón de Puerto Plata, permitiendo a los pasajeros caminar directamente a las atracciones de la ciudad. Cuenta con un área de entretenimiento, tiendas y restaurantes inspirados en la cultura taína.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=800&fit=crop",
    rating: 4.5,
    reviewCount: 1800,
    type: "Puerto de Cruceros Urbano",
    cruiseLines: [
      { name: "Royal Caribbean", logo: "RC", routes: ["Miami", "Fort Lauderdale"] },
      { name: "Celebrity Cruises", logo: "CC", routes: ["Fort Lauderdale"] },
      { name: "MSC Cruceros", logo: "MSC", routes: ["Miami"] },
    ],
    facilities: [
      { name: "Plaza Taína", icon: "compass", description: "Área de entretenimiento con cultura taína" },
      { name: "Tiendas", icon: "shopping", description: "Artesanías, ámbar y productos locales" },
      { name: "Restaurantes", icon: "coffee", description: "Gastronomía dominicana" },
      { name: "Acceso Peatonal", icon: "car", description: "Caminar directo al centro de Puerto Plata" },
    ],
    schedule: { openHours: "7:00 AM - 5:00 PM (días de crucero)", peakSeason: "Noviembre - Abril", avgShipsPerWeek: "3-5 cruceros" },
    nearbyActivities: [
      { name: "Malecón de Puerto Plata", type: "Paseo", distance: "A pie", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300" },
      { name: "Fortaleza San Felipe", type: "Historia", distance: "10 min", image: "https://images.unsplash.com/photo-1564507004663-b6dfb3c824d5?w=300" },
      { name: "Museo del Ámbar", type: "Cultura", distance: "5 min", image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=300" },
    ],
    reviews: [
      { name: "Pedro G.", rating: 4, date: "Hace 1 semana", comment: "Me encantó poder caminar directamente a la ciudad desde el barco." },
    ],
    nearbyDestinations: ["Puerto Plata", "Sosúa", "Cabarete"],
  },
  "cabo-rojo": {
    id: "cabo-rojo",
    name: "Puerto Cabo Rojo (Port Cabo Rojo)",
    location: "Pedernales",
    coordinates: "17.9150, -71.6520",
    description: "Port Cabo Rojo es la nueva joya portuaria de República Dominicana, inaugurada en 2024 para abrir las maravillas ecoturísticas del sur profundo a los cruceristas globales de Norwegian, Royal Caribbean y MSC. Su arquitectura sostenible combina muelles de última generación con senderos naturales hacia Bahía de las Águilas, el Parque Nacional Jaragua y Pozos de Romeo.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=800&fit=crop",
    rating: 4.8,
    reviewCount: 920,
    type: "Nuevo Puerto Ecoturístico de Cruceros",
    cruiseLines: [
      { name: "Norwegian Cruise Line", logo: "NCL", routes: ["Miami", "Canaveral"] },
      { name: "Royal Caribbean", logo: "RC", routes: ["Miami", "San Juan"] },
      { name: "MSC Cruceros", logo: "MSC", routes: ["Miami", "Fort Lauderdale"] },
    ],
    facilities: [
      { name: "Terminal Ecológica", icon: "building", description: "Diseño bioclimático y amigable con el entorno" },
      { name: "Muelle de Pasajeros", icon: "compass", description: "Capacidad para cruceros clase Oasis y mega-buques" },
      { name: "Mercado Artesanal del Sur", icon: "shopping", description: "Productos y gastronomía autóctona de Pedernales" },
      { name: "Punto de Excursiones", icon: "car", description: "Lanchas rápidas a Bahía de las Águilas y transportes 4x4" },
    ],
    schedule: { openHours: "7:00 AM - 6:00 PM (días de atraque)", peakSeason: "Octubre - Mayo", avgShipsPerWeek: "2-4 cruceros" },
    nearbyActivities: [
      { name: "Bahía de las Águilas", type: "Playa Virgen", distance: "20 min en lancha", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300" },
      { name: "Pozos de Romeo", type: "Cenotes Naturales", distance: "15 min", image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=300" },
      { name: "Parque Nacional Jaragua", type: "Ecoturismo", distance: "25 min", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300" },
    ],
    reviews: [
      { name: "David M.", rating: 5, date: "Hace 5 días", comment: "¡La escala en Cabo Rojo fue la sorpresa del crucero! Aguas cristalinas como nunca vi." },
    ],
    nearbyDestinations: ["Pedernales", "Bahía de las Águilas", "Barahona"],
  },
  "la-romana": {
    id: "la-romana",
    name: "Puerto de Cruceros de La Romana",
    location: "La Romana",
    coordinates: "18.4301, -68.9674",
    description: "El Puerto de La Romana es un puerto mixto que recibe cruceros de lujo y embarcaciones de carga. Su proximidad a Casa de Campo, Altos de Chavón e Isla Catalina lo convierte en un destino popular para líneas de cruceros boutique y de lujo que buscan experiencias exclusivas en el Caribe.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=800&fit=crop",
    rating: 4.4,
    reviewCount: 850,
    type: "Puerto Mixto",
    cruiseLines: [
      { name: "Celebrity Cruises", logo: "CC", routes: ["Fort Lauderdale", "San Juan"] },
      { name: "Azamara", logo: "AZ", routes: ["Miami"] },
      { name: "Seabourn", logo: "SB", routes: ["Fort Lauderdale"] },
      { name: "Silversea", logo: "SS", routes: ["San Juan"] },
    ],
    facilities: [
      { name: "Terminal de Pasajeros", icon: "building", description: "Terminal con servicios básicos" },
      { name: "Tiendas", icon: "shopping", description: "Souvenirs y artesanías" },
      { name: "Transporte", icon: "car", description: "Conexión a Casa de Campo y Bayahíbe" },
      { name: "Tours", icon: "compass", description: "Excursiones organizadas a Isla Catalina y Altos de Chavón" },
    ],
    schedule: { openHours: "6:00 AM - 8:00 PM", peakSeason: "Noviembre - Abril", avgShipsPerWeek: "2-4 cruceros" },
    nearbyActivities: [
      { name: "Altos de Chavón", type: "Cultura", distance: "15 min", image: "https://images.unsplash.com/photo-1564507004663-b6dfb3c824d5?w=300" },
      { name: "Isla Catalina", type: "Playa", distance: "30 min en bote", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300" },
      { name: "Casa de Campo", type: "Resort", distance: "10 min", image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=300" },
    ],
    reviews: [
      { name: "Laura P.", rating: 5, date: "Hace 1 mes", comment: "Puerto pequeño pero la excursión a Altos de Chavón fue espectacular." },
    ],
    nearbyDestinations: ["La Romana", "Bayahíbe", "Casa de Campo"],
  },
  "puerto-caucedo": {
    id: "puerto-caucedo",
    name: "Puerto Multimodal Caucedo",
    location: "Santo Domingo Este",
    coordinates: "18.4300, -69.6300",
    description: "El Puerto Multimodal Caucedo (DP World Caucedo) es el principal puerto de carga y zona franca de República Dominicana. Ubicado en Punta Caucedo, al este de Santo Domingo, es un hub logístico internacional con zona franca industrial y operaciones portuarias de clase mundial. Aunque es principalmente comercial, recibe cruceros ocasionalmente.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=800&fit=crop",
    rating: 4.2,
    reviewCount: 300,
    type: "Puerto Comercial / Zona Franca",
    cruiseLines: [],
    facilities: [
      { name: "Terminal de Carga", icon: "building", description: "Operaciones de contenedores 24/7" },
      { name: "Zona Franca", icon: "shopping", description: "Parque industrial con empresas internacionales" },
      { name: "Aduana", icon: "building", description: "Servicios aduanales completos" },
    ],
    schedule: { openHours: "24/7 (operaciones de carga)", peakSeason: "Todo el año", avgShipsPerWeek: "15-20 buques de carga" },
    nearbyActivities: [],
    reviews: [],
    nearbyDestinations: ["Santo Domingo", "Boca Chica"],
  },
  "puerto-haina": {
    id: "puerto-haina",
    name: "Puerto de Haina",
    location: "San Cristóbal",
    coordinates: "18.4200, -70.0200",
    description: "El Puerto de Haina es uno de los puertos comerciales más importantes de República Dominicana. Ubicado en la desembocadura del Río Haina, maneja una porción significativa del comercio marítimo del país, incluyendo importaciones de combustibles, materias primas y productos terminados.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=800&fit=crop",
    rating: 3.8,
    reviewCount: 150,
    type: "Puerto Comercial",
    cruiseLines: [],
    facilities: [
      { name: "Terminal de Carga", icon: "building", description: "Muelles para buques de gran calado" },
      { name: "Depósitos", icon: "building", description: "Almacenamiento de mercancías" },
    ],
    schedule: { openHours: "24/7", peakSeason: "Todo el año", avgShipsPerWeek: "10-15 buques" },
    nearbyActivities: [],
    reviews: [],
    nearbyDestinations: ["San Cristóbal", "Santo Domingo"],
  },
  "manzanillo": {
    id: "manzanillo",
    name: "Puerto de Manzanillo",
    location: "Monte Cristi",
    coordinates: "19.7100, -71.7500",
    description: "El Puerto de Manzanillo es el principal puerto de la región noroeste de República Dominicana, ubicado en la Bahía de Manzanillo. Maneja exportaciones agrícolas como banano, cacao y otros productos de la región. Su bahía natural ofrece un puerto protegido con acceso directo al Atlántico.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=800&fit=crop",
    rating: 3.5,
    reviewCount: 80,
    type: "Puerto Comercial / Agrícola",
    cruiseLines: [],
    facilities: [
      { name: "Muelle de Carga", icon: "building", description: "Para buques de carga general" },
      { name: "Depósitos Refrigerados", icon: "building", description: "Para productos agrícolas de exportación" },
    ],
    schedule: { openHours: "6:00 AM - 6:00 PM", peakSeason: "Todo el año", avgShipsPerWeek: "3-5 buques" },
    nearbyActivities: [
      { name: "Cayos Siete Hermanos", type: "Naturaleza", distance: "30 min en bote", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300" },
    ],
    reviews: [],
    nearbyDestinations: ["Monte Cristi"],
  },
};
