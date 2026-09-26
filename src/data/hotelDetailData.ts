import {
  Waves, Dumbbell, Wifi, Car, Utensils, Coffee, Star, CircleDot,
  Gem, Baby, TreePine, Umbrella, Anchor, Globe, Bike, Bed, Bath,
  Music, Disc, PartyPopper, Heart, HeartPulse, Check
} from "lucide-react";
import { Hotel as StaticHotel } from "@/data/hotels";
import hotelRoomSuiteImg from "@/assets/hotel-room-suite.jpg";
import heroBeachImg from "@/assets/hero-beach.jpg";
import puntaCanaImg from "@/assets/punta-cana.jpg";

// ─── Amenity icon mapping ───
export const amenityIcons: Record<string, any> = {
  "Piscina": Waves, "Piscinas": Waves, "Piscina infinita": Waves, "Piscina infinity": Waves,
  "Piscinas infinitas": Waves, "Múltiples piscinas": Waves, "Piscina rooftop": Waves,
  "5 piscinas": Waves, "6 piscinas": Waves, "4 piscinas": Waves,
  "Spa": HeartPulse, "Spa de lujo": HeartPulse, "Spa premiado": HeartPulse,
  "Gimnasio": Dumbbell, "Gimnasio 24/7": Dumbbell,
  "Wifi": Wifi, "Wifi gratuito": Wifi, "Wifi de Alta Velocidad": Wifi,
  "Golf": CircleDot, "3 campos de golf": CircleDot,
  "Casino": Gem, "Kids Club": Baby, "Yoga": TreePine,
  "Playa privada": Umbrella, "Playa": Umbrella, "Playa Dorada": Umbrella,
  "Playa Juanillo": Umbrella, "Playa Dominicus": Umbrella, "Playa Minitas": Umbrella,
  "Deportes acuáticos": Anchor, "Deportes": Anchor,
  "Restaurante": Utensils, "Restaurante gourmet": Utensils, "Restaurante orgánico": Utensils,
  "Múltiples restaurantes": Utensils, "Restaurantes gourmet": Utensils,
  "Restaurantes temáticos": Utensils, "10 restaurantes": Utensils,
  "9 restaurantes": Utensils, "7 restaurantes": Utensils, "6 restaurantes": Utensils,
  "Bares": Coffee, "Múltiples bares": Coffee, "Bar de coctelería": Coffee, "5 bares": Coffee,
  "Room service 24h": Car, "Butler service": Star, "Concierge": Star,
  "Parking": Car, "Parking Valet": Car, "Parking gratis": Car,
  "Marina": Globe, "Polo": CircleDot, "Tours históricos": Globe,
  "Tours personalizados": Globe, "Tour de café": Coffee,
  "Rafting": Waves, "Canyoning": TreePine, "Senderismo": TreePine,
  "Cabalgatas": Bike, "Buceo": Anchor, "Centro de buceo": Anchor,
  "Villas privadas": Bed, "Suites con jacuzzi": Bath,
  "Tiro al plato": CircleDot, "Junto al río": Waves,
  "Cabañas privadas": Bed, "Shows nocturnos": Music, "Shows": Music,
  "Teatro": Music, "Discoteca": Disc, "Pool parties": PartyPopper,
  "DJs residentes": Disc, "Star Camp (kids)": Baby,
  "Solo adultos": Heart, "Lounge de cigarros": Coffee,
  "Vista al mar": Waves, "Vista al río": Waves,
  "Centro de negocios": Globe, "Salones de eventos": Globe,
  "Tours de ballenas": Anchor, "Vistas al valle": TreePine,
  "Edificio histórico": Globe, "Altos de Chavón": Globe,
};

export function getAmenityIcon(amenity: string) {
  return amenityIcons[amenity] || Check;
}

export function getCategoryLabel(cat: string) {
  const labels: Record<string, string> = {
    "resort": "Resort de Lujo",
    "boutique": "Hotel Boutique",
    "all-inclusive": "Todo Incluido Premium",
    "business": "Business & Confort",
    "eco-lodge": "Eco-Lodge & Naturaleza",
  };
  return labels[cat] || cat;
}

export function generatePolicies(hotel: StaticHotel | null) {
  const isAdultsOnly = hotel?.amenities?.some(a => a.toLowerCase().includes("solo adultos"));
  return {
    checkIn: "3:00 PM (15:00)",
    checkOut: "12:00 PM (Mediodía)",
    cancellation: "Cancelación 100% gratuita hasta 48 horas antes de la llegada.",
    children: isAdultsOnly ? "Exclusivo para adultos mayores de 18 años. Ambiente de total tranquilidad y privacidad." : "Familia amigable. Cunas disponibles bajo solicitud previa y acceso al club infantil.",
    pets: "Se admiten mascotas de hasta 10kg en habitaciones designadas (pueden aplicar cargos adicionales).",
    deposit: "Se requiere un depósito reembolsable en tarjeta de crédito al momento del check-in para gastos incidentales.",
    transfers: "Servicio de traslado privado aeropuerto-hotel disponible las 24 horas con reservación previa.",
    paymentMethods: ["Visa", "Mastercard", "American Express", "Apple Pay", "Efectivo USD/DOP"],
  };
}

export function generateRooms(hotel: StaticHotel | null) {
  const priceBase = hotel?.priceRange === '$$$$$' ? 650 : hotel?.priceRange === '$$$$' ? 420 : hotel?.priceRange === '$$$' ? 260 : hotel?.priceRange === '$$' ? 140 : 85;
  return [
    { 
      id: "deluxe",
      name: "Habitación Deluxe Garden View", 
      size: "42 m²", 
      view: "Vista a Jardines Tropicales", 
      bed: "1 Cama King o 2 Queen", 
      capacity: "2-3 Adultos",
      amenities: ["A/C Climatizado", "Smart TV 55\"", "Minibar Incluido", "WiFi 6", "Balcón Privado", "Cafetera Nespresso"], 
      price: priceBase, 
      breakfast: true, 
      image: hotelRoomSuiteImg, 
      description: "Elegante habitación con mobiliario contemporáneo en maderas nobles, terraza privada amueblada y baño de mármol con ducha tipo lluvia." 
    },
    { 
      id: "ocean-suite",
      name: "Master Suite Frente al Mar", 
      size: "68 m²", 
      view: "Vista Frontal al Mar Caribe", 
      bed: "1 Cama King Plush", 
      capacity: "2 Adultos",
      amenities: ["Vista Mar Directa", "Bañera de Hidromasaje", "Minibar Premium", "Room Service 24h", "Terraza con Camastros"], 
      price: Math.round(priceBase * 1.55), 
      breakfast: true, 
      image: heroBeachImg, 
      description: "Amplia suite con salón independiente, balcón panorámico con vistas directas al mar turquesa y amenidades de baño de diseñador." 
    },
    { 
      id: "presidential-villa",
      name: "Villa Presidencial con Piscina Privada", 
      size: "140 m²", 
      view: "Vista Panorámica al Océano", 
      bed: "2 Camas King + Sala", 
      capacity: "4-5 Personas",
      amenities: ["Piscina Infinity Privada", "Mayordomo (Butler) 24h", "Bar Abierto de Lujo", "Parrilla BBQ", "Acceso VIP"], 
      price: Math.round(priceBase * 2.8), 
      breakfast: true, 
      image: puntaCanaImg, 
      description: "Máxima exclusividad caribeña: residencia de doble nivel con piscina plunge privada, comedor exterior y servicio de mayordomo personalizado." 
    },
  ];
}

export function generateRestaurants(hotel: StaticHotel | null) {
  return [
    { 
      name: "El Palmar Buffet Internacional & Show Cooking", 
      cuisine: "Internacional & Caribeña", 
      hours: "07:00 - 11:00 / 12:30 - 16:00 / 18:30 - 22:30", 
      description: "Estaciones gourmet en vivo con cortes a la parrilla, pastas frescas, mariscos locales, panadería artesanal y opciones sin gluten.", 
      dressCode: "Casual", 
      reservations: false,
      tag: "Buffet Todo Incluido"
    },
    { 
      name: "La Cava de Autor", 
      cuisine: "Fusión Mediterránea & Alta Cocina", 
      hours: "18:30 - 23:00", 
      description: "Propuesta de alta cocina con maridajes guiados por sommelier y una selecta bodega de más de 300 etiquetas de vino.", 
      dressCode: "Elegante / Smart Casual", 
      reservations: true,
      tag: "Cena a la Carta"
    },
    { 
      name: "Breeze Beach Club & Raw Bar", 
      cuisine: "Mariscos, Ceviches & Grill de Playa", 
      hours: "11:00 - 18:30", 
      description: "Ubicado directamente sobre la arena: langosta a la brasa, tiraditos, aguachiles y cócteles tropicales con vista al mar.", 
      dressCode: "Casual de Playa", 
      reservations: false,
      tag: "Frente al Mar"
    },
    {
      name: "Samurai Teppanyaki & Sushi Bar",
      cuisine: "Cocina Japonesa & Asiática",
      hours: "18:30 - 22:30",
      description: "Mesas teppanyaki interactivas con show cooking de chefs, rollos de autor, tempuras y gyozas al vapor.",
      dressCode: "Casual Elegante",
      reservations: true,
      tag: "Especialidad Asiática"
    },
    {
      name: "Trattoria Bella Italia",
      cuisine: "Cocina Italiana Tradicional",
      hours: "18:30 - 22:30",
      description: "Pizzas al horno de leña, risottos cremosos, carpaccios y pastas frescas con salsas tradicionales italianas.",
      dressCode: "Casual",
      reservations: false,
      tag: "Italiano"
    },
    {
      name: "Fuego Criollo Dominican Grill",
      cuisine: "Gastronomía Dominicana Contemporánea",
      hours: "19:00 - 23:00",
      description: "Sabores auténticos de la isla reinterpretados: chivo liniero confitado, sancocho de mariscos y mofongo gourmet.",
      dressCode: "Casual Elegante",
      reservations: true,
      tag: "Sabores Locales"
    }
  ];
}

export function generateBars(hotel: StaticHotel | null) {
  return [
    { 
      name: "Sky Lounge & Cocktail Rooftop", 
      type: "Mixología en Azotea", 
      hours: "17:00 - 01:00", 
      description: "Terraza panorámica con vistas al atardecer, cócteles de autor con rones añejos dominicanos y música chillout.", 
      specialty: "Ron Punch Infusionado & Mamajuana Signature" 
    },
    { 
      name: "Swim-up Oasis Wet Bar", 
      type: "Bar Acuático en Piscina", 
      hours: "10:00 - 18:00", 
      description: "Bebidas heladas, frappés naturales, cervezas locales y piñas coladas servidas dentro de la piscina infinita.", 
      specialty: "Piña Colada en Coco Natural" 
    },
    {
      name: "Lobby Bar & Rum Experience",
      type: "Lobby & Degustación",
      hours: "09:00 - 00:00",
      description: "Elegante salón central con piano en vivo y catas dirigidas de los mejores rones dominicanos.",
      specialty: "Old Fashioned con Ron Dominicano"
    },
    {
      name: "Coco Beach Bar",
      type: "Bar de Playa",
      hours: "10:00 - 19:00",
      description: "Kiosco rústico en la arena sirviendo cocos fríos, mojitos de maracuyá y snacks ligeros.",
      specialty: "Coco Loco & Mojito Caribeño"
    },
    {
      name: "Sports Bar & Lounge 24 Horas",
      type: "Sports Bar 24h",
      hours: "24 Horas (Todo Incluido)",
      description: "Retransmisión de partidos en vivo, mesas de billar y servicio ininterrumpido de snacks calientes.",
      specialty: "Cerveza Presidente Helada & Snacks"
    }
  ];
}

export function generateNightlife(hotel: StaticHotel | null) {
  return [
    {
      name: "Discoteca & Club 'Neon Caribe'",
      type: "Discoteca & Nightclub",
      hours: "22:30 - 03:00 AM",
      music: "DJ Set & Ritmos Latinos",
      description: "Sonido de alta fidelidad, iluminación robótica, DJs residentes, barra libre de cócteles premium y ritmos latinos e internacionales.",
      dressCode: "Elegante Casual (+18)"
    },
    {
      name: "Teatro Principal & Gran Escenario",
      type: "Shows en Vivo & Musicales",
      hours: "21:00 - 22:30",
      music: "Orquesta en Vivo",
      description: "Producciones escénicas diarias, tributos musicales internacionales, ballet folclórico dominicano y noches de circo caribeño.",
      dressCode: "Casual"
    },
    {
      name: "Fiestas Temáticas & Beach Party",
      type: "Fiestas en la Playa",
      hours: "Noches Semanales",
      music: "Merengue & Bachata",
      description: "Fogata en la arena, Fiesta Blanca (White Party), orquesta de merengue en directo y estaciones de comida nocturna.",
      dressCode: "White / Tropical"
    }
  ];
}

export function generateSpa(hotel: StaticHotel | null | string) {
  const hotelNameStr = typeof hotel === "string" ? hotel : (hotel?.name || "Resort");
  return {
    name: `${hotelNameStr} Spa`,
    concept: "Santuario de hidroterapia y bienestar holístico caribeño",
    size: "1,800 m² de Instalaciones",
    hours: "08:00 AM - 20:00 PM",
    schedule: "08:00 AM - 20:00 PM",
    bookingPolicy: "Reservación recomendada en recepción del Spa",
    facilities: [
      { name: "Circuito Hidrotermal", desc: "Piscina de contrastes frío/calor, cascadas cervicales y camas de hidromasaje." },
      { name: "Sauna Finlandés & Baño de Vapor", desc: "Aromaterapia con eucalipto silvestre y cromoterapia relajante." },
      { name: "Cabinas de Masaje frente al Mar", desc: "Palapas privadas sobre la arena con brisa marina y sonido de olas." },
      { name: "Tratamientos Autóctonos", desc: "Envolturas corporales con cacao orgánico dominicano y sales minerales de Montecristi." },
      { name: "Salón de Belleza & Estética", desc: "Manicura spa, peinados para ocasiones especiales y tratamientos faciales antiedad." }
    ],
    treatments: [
      "Masaje Relajante Caribeño con Aceite de Coco Virgen (60/90 min)",
      "Envoltura Desintoxicante con Cacao Dominicano y Miel Silvestre",
      "Tratamiento Facial Antiedad con Perlas Marinas y Ácido Hialurónico",
      "Exfoliación Corporal con Sales Minerales de Montecristi",
      "Ritual en Pareja 'Atardecer Romántico' con Aromaterapia y Cava"
    ],
    hydrotherapy: [
      "Piscina Dinámica de Contrastes (Aguas Térmicas & Frías)",
      "Cascadas Cervicales de Alta Presión y Cuellos de Cisne",
      "Camas de Hidromasaje Sumergidas con Microburbujas",
      "Sauna Finlandés a 85°C con Esencias de Eucalipto",
      "Baño de Vapor Turco (Hammam) con Aromaterapia Relajante",
      "Duchas de Sensaciones Bitérmicas y Pediluvio Terapéutico"
    ]
  };
}

export function generatePools(hotel: StaticHotel | null) {
  return [
    {
      name: "Piscina Infinity Panorámica Oceanfront",
      type: "Frente al Mar",
      depth: "1.20m - 1.60m",
      features: "Efecto infinito sobre el Mar Caribe, camas balinesas sumergidas y servicio de toallas premium.",
      vibe: "Vistas & Relajación"
    },
    {
      name: "Piscina Laguna Central con Bar Acuático",
      type: "Piscina Central",
      depth: "1.40m",
      features: "Swim-up wet bar, hidromasaje integrado y actividades de aquagym diurnas.",
      vibe: "Animación & Cócteles"
    },
    {
      name: "Piscina Oasis 'Solo Adultos' (Zen Pool)",
      type: "Solo Adultos",
      depth: "1.30m",
      features: "Ambiente de máxima serenidad, tumbonas acolchadas privadas y menú de aguas aromatizadas.",
      vibe: "Tranquilidad Total"
    },
    {
      name: "Parque Acuático Splash con Toboganes",
      type: "Familiar & Niños",
      depth: "0.30m - 0.60m",
      features: "Toboganes acuáticos, juegos interactivos de agua y socorristas certificados.",
      vibe: "Diversión Familiar"
    },
    {
      name: "Piscina de Hidroterapia & Jacuzzis",
      type: "Spa & Termal",
      depth: "1.00m",
      features: "Cuellos de cisne, cascadas de agua tibia e hidrojets para relajación muscular profunda.",
      vibe: "Bienestar Terapéutico"
    }
  ];
}

export const hotelFaqsData = [
  {
    q: "¿A qué distancia está el hotel del aeropuerto más cercano?",
    a: "El alojamiento cuenta con servicio de transfer privado coordinable con anticipación. El tiempo estimado de traslado oscila entre 15 y 30 minutos dependiendo de la ubicación del destino."
  },
  {
    q: "¿Qué incluye la tarifa de hospedaje?",
    a: "Todas las tarifas reservadas a través de nuestro portal incluyen desayuno gourmet diario, acceso a piscinas, Wi-Fi de alta velocidad en todo el complejo, toallas de playa y uso del gimnasio."
  },
  {
    q: "¿Cuáles son las condiciones de cancelación?",
    a: "Ofrecemos cancelación sin penalidad hasta 48 horas antes del check-in. Para cancelaciones posteriores se cobrará la primera noche de estancia."
  },
  {
    q: "¿Tienen opciones gastronómicas para dietas especiales?",
    a: "Sí, todos los restaurantes del complejo disponen de menús adaptados para comensales celíacos (sin gluten), vegetarianos, veganos o con alergias alimentarias señalizadas."
  }
];
