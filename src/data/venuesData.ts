export interface VenueItem {
  id: string;
  slug: string;
  name: string;
  category: "estadio" | "golf" | "arena" | "teatro" | "centro_convenciones" | "mall";
  categoryLabel: string;
  location: string;
  province: string;
  address: string;
  capacity?: string | number;
  yearBuilt?: number;
  description: string;
  image: string;
  gallery?: string[];
  rating: number;
  reviewCount: number;
  amenities: string[];
  features?: string[];
  homeTeams?: { name: string; colors: string; championships: number; logo: string }[];
  golfSpecs?: { holes: number; par: number; designer: string; greenFee: string };
  upcomingEvents: {
    id: string;
    title: string;
    date: string;
    time: string;
    type: "deporte" | "concierto" | "cultural" | "feria" | "teatro";
    priceFrom: string;
    ticketUrl?: string;
    eventSlug?: string;
  }[];
  howToGet?: {
    byMetro?: string;
    byBus?: string;
    byCar?: string;
    parking?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

export const VENUES_DATA: Record<string, VenueItem> = {
  // ─── ESTADIOS Y DEPORTES ───
  "estadio-quisqueya": {
    id: "estadio-quisqueya",
    slug: "estadio-quisqueya",
    name: "Estadio Quisqueya Juan Marichal",
    category: "estadio",
    categoryLabel: "Estadio de Béisbol",
    location: "Ensanche La Fe, Santo Domingo",
    province: "Santo Domingo",
    address: "Av. Tiradentes esq. San Cristóbal, Santo Domingo D.N.",
    capacity: 14400,
    yearBuilt: 1955,
    description: "El templo del béisbol invernal dominicano (LIDOM). Sede histórica de los Tigres del Licey y Leones del Escogido. Además de albergar la Serie del Caribe, su amplio campo se transforma para megaconciertos multitudinarios de artistas internacionales.",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1920&h=800&fit=crop",
    rating: 4.8,
    reviewCount: 3120,
    amenities: ["Palcos VIP Climatizados", "Estacionamiento Vigilado", "Restaurantes & Bares", "Tiendas Oficiales", "WiFi", "Acceso Inclusivo"],
    homeTeams: [
      { name: "Tigres del Licey", colors: "Azul y Blanco", championships: 24, logo: "TL" },
      { name: "Leones del Escogido", colors: "Rojo y Blanco", championships: 16, logo: "LE" },
    ],
    upcomingEvents: [
      {
        id: "ev-clásico-licey-aguilas",
        title: "Clásico Nacional: Tigres del Licey vs Águilas Cibaeñas",
        date: "Viernes 20 Octubre",
        time: "7:30 PM",
        type: "deporte",
        priceFrom: "RD$ 650",
        eventSlug: "carnaval-dominicano"
      },
      {
        id: "ev-concierto-estadio-1",
        title: "Festival Presidente Quisqueya Live",
        date: "Sábado 28 Noviembre",
        time: "8:00 PM",
        type: "concierto",
        priceFrom: "RD$ 2,500",
        eventSlug: "festival-merengue"
      }
    ],
    howToGet: {
      byMetro: "Estación Pedro Mir o Casandra Damirón (Línea 1/2 con enlace de taxi/bus)",
      byBus: "Corredor Tiradentes y Rutas de la Av. San Cristóbal",
      byCar: "Acceso directo por Av. John F. Kennedy y Av. Tiradentes. Parqueos internos y perímetros vigilados.",
      parking: "Más de 1,200 espacios de aparcamiento disponible con tarifa fija en días de evento."
    },
    contact: {
      phone: "+1 (809) 567-6371",
      website: "https://lidom.com"
    }
  },

  "estadio-cibao": {
    id: "estadio-cibao",
    slug: "estadio-cibao",
    name: "Estadio Cibao",
    category: "estadio",
    categoryLabel: "Estadio de Béisbol",
    location: "Santiago de los Caballeros",
    province: "Santiago",
    address: "Av. Imbert, Sector Las Colinas, Santiago",
    capacity: 18077,
    yearBuilt: 1958,
    description: "Conocido como 'El Valle de la Muerte', es el estadio con mayor capacidad de República Dominicana y casa de las Águilas Cibaeñas. Es célebre por su apasionada fanaticada y su uso constante para espectáculos multitudinarios y festivales del Cibao.",
    image: "https://images.unsplash.com/photo-1569863959165-56dae551d4fc?w=1920&h=800&fit=crop",
    rating: 4.8,
    reviewCount: 2840,
    amenities: ["Palcos Ejecutivos", "Gradas VIP", "Zona Gastronómica Cibaeña", "Parqueo Asfaltado", "Seguridad Privada"],
    homeTeams: [
      { name: "Águilas Cibaeñas", colors: "Amarillo y Negro", championships: 22, logo: "AC" }
    ],
    upcomingEvents: [
      {
        id: "ev-cibao-juego",
        title: "Águilas Cibaeñas vs Gigantes del Cibao",
        date: "Sábado 24 Octubre",
        time: "7:00 PM",
        type: "deporte",
        priceFrom: "RD$ 500"
      },
      {
        id: "ev-cibao-concierto",
        title: "Santiago Vive la Música - Mega Concierto",
        date: "Viernes 11 Diciembre",
        time: "8:30 PM",
        type: "concierto",
        priceFrom: "RD$ 1,800"
      }
    ],
    howToGet: {
      byBus: "Rutas de concho A, B y F desde el Centro Histórico de Santiago",
      byCar: "Fácil acceso desde la Autopista Duarte ingresando por la Avenida Imbert."
    },
    contact: {
      phone: "+1 (809) 575-4310",
      website: "https://aguilas.com.do"
    }
  },

  "estadio-olimpico-felix-sanchez": {
    id: "estadio-olimpico-felix-sanchez",
    slug: "estadio-olimpico-felix-sanchez",
    name: "Estadio Olímpico Félix Sánchez",
    category: "estadio",
    categoryLabel: "Estadio Olímpico & Multiuso",
    location: "Centro Olímpico Juan Pablo Duarte, Santo Domingo",
    province: "Santo Domingo",
    address: "Av. Máximo Gómez esq. 27 de Febrero, Santo Domingo D.N.",
    capacity: 50000,
    yearBuilt: 1974,
    description: "El recinto de espectáculos y eventos deportivos de mayor escala en la historia del país. Ha sido escenario de los Juegos Panamericanos 2003, Copas Mundiales FIFA Femeninas Sub-17, el histórico Festival Presidente de Música Latina y conciertos de estrellas globales.",
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1920&h=800&fit=crop",
    rating: 4.7,
    reviewCount: 4200,
    amenities: ["Pista Atlética Sintética", "Gramado Olímpico FIFA", "Cabinas de Transmisión Internacional", "Múltiples Accesos Peatonales", "Conexión a Red de Metro"],
    upcomingEvents: [
      {
        id: "ev-festival-presidente-olimpico",
        title: "Gran Regreso del Festival Presidente 2026",
        date: "Viernes 4 - Domingo 6 Diciembre",
        time: "5:00 PM",
        type: "concierto",
        priceFrom: "RD$ 3,200",
        eventSlug: "festival-merengue"
      }
    ],
    howToGet: {
      byMetro: "Estación Juan Bosch o Juan Pablo Duarte (cruce Líneas 1 y 2 a pocos pasos)",
      byBus: "Corredor 27 de Febrero y Corredor Máximo Gómez",
      byCar: "Ingresos por Av. 27 de Febrero, Ortega y Gasset y Máximo Gómez."
    }
  },

  // ─── ARENAS, BASKETBALL Y VOLLEYBALL ───
  "palacio-deportes-virgilio-travieso": {
    id: "palacio-deportes-virgilio-travieso",
    slug: "palacio-deportes-virgilio-travieso",
    name: "Palacio de los Deportes Virgilio Travieso Soto ('La Media Naranja')",
    category: "arena",
    categoryLabel: "Arena Techada & Coliseo",
    location: "Centro Olímpico, Santo Domingo",
    province: "Santo Domingo",
    address: "Centro Olímpico Juan Pablo Duarte, Av. 27 de Febrero, Santo Domingo",
    capacity: 8300,
    yearBuilt: 1974,
    description: "Icónica arena cubierta con cúpula naranja, epicentro del Baloncesto Superior del Distrito Nacional (TBS), partidos de la Selección Dominicana de Baloncesto ('Los Quisqueyanos'), voleibol internacional de Las Reinas del Caribe, y conciertos bajo techo con climatización central.",
    image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=1920&h=800&fit=crop",
    rating: 4.6,
    reviewCount: 1540,
    amenities: ["Climatización Integral A/C", "Tabloncillo de Madera Certificado FIBA", "Pantalla Central LED 360", "Palcos Presidenciales", "Camerinos de Nivel Olímpico"],
    upcomingEvents: [
      {
        id: "ev-tbs-distrito",
        title: "Torneo de Baloncesto Superior del Distrito (TBS Santo Domingo)",
        date: "Miércoles 18 Octubre",
        time: "6:00 PM",
        type: "deporte",
        priceFrom: "RD$ 300"
      },
      {
        id: "ev-reinas-del-caribe",
        title: "Copa Panamericana de Voleibol Femenino - Reinas del Caribe",
        date: "Sábado 7 Noviembre",
        time: "7:00 PM",
        type: "deporte",
        priceFrom: "RD$ 400"
      }
    ],
    howToGet: {
      byMetro: "Estación Juan Pablo Duarte (L1 y L2)",
      byCar: "Parqueo vigilado dentro del complejo del Centro Olímpico."
    }
  },

  "arena-del-cibao": {
    id: "arena-del-cibao",
    slug: "arena-del-cibao",
    name: "Gran Arena del Cibao Dr. Oscar Gobaira",
    category: "arena",
    categoryLabel: "Arena Multiuso Climatizada",
    location: "Santiago de los Caballeros",
    province: "Santiago",
    address: "Av. Salvador Estrella Sadhalá esq. Av. Imbert, Santiago",
    capacity: 8768,
    yearBuilt: 1979,
    description: "Moderna arena techada de clase mundial en el corazón de Santiago. Sede del Baloncesto Superior de Santiago (ABASACA), veladas de boxeo titular, torneos de voleibol y presentaciones teatrales y musicales de artistas nacionales e internacionales.",
    image: "https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=1920&h=800&fit=crop",
    rating: 4.7,
    reviewCount: 1190,
    amenities: ["Aire Acondicionado Central", "Asientos Ergonómicos", "Piso de Parquet Flotante", "Sonido Line-Array", "Cafeterías & Lounge"],
    upcomingEvents: [
      {
        id: "ev-torneo-santiago-basket",
        title: "Gran Final Baloncesto Superior de Santiago (ABASACA)",
        date: "Domingo 15 Noviembre",
        time: "6:00 PM",
        type: "deporte",
        priceFrom: "RD$ 350"
      }
    ],
    howToGet: {
      byCar: "Sobre la Av. Estrella Sadhalá frente al complejo deportivo municipal."
    }
  },

  // ─── CAMPOS DE GOLF DE CAMPEONATO ───
  "teeth-of-the-dog": {
    id: "teeth-of-the-dog",
    slug: "teeth-of-the-dog",
    name: "Teeth of the Dog (Casa de Campo)",
    category: "golf",
    categoryLabel: "Campo de Golf de Campeonato",
    location: "La Romana",
    province: "La Romana",
    address: "Casa de Campo Resort & Villas, Carretera La Romana - Higuey",
    capacity: "18 Hoyos / Par 72",
    yearBuilt: 1971,
    description: "La obra cumbre del maestro Pete Dye y consagrado unánimemente como el campo de golf número 1 del Caribe y top 50 mundial. Con 7 hoyos excavados directamente contra los arrecifes y acantilados coralinos del Mar Caribe. Sede de torneos internacionales como el Latin America Amateur Championship (LAAC) clasificatorio al Masters de Augusta.",
    image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1920&h=800&fit=crop",
    rating: 4.9,
    reviewCount: 1850,
    amenities: ["Pro Shop Titleist / FootJoy", "Driving Range con TrackMan", "Restaurante 19th Hole", "Servicio de Caddie Profesional", "Carritos de Golf Eléctricos con GPS"],
    golfSpecs: {
      holes: 18,
      par: 72,
      designer: "Pete Dye",
      greenFee: "US$ 395 - US$ 495"
    },
    upcomingEvents: [
      {
        id: "ev-caribbean-open-golf",
        title: "Torneo Abierto de Golf Casa de Campo",
        date: "14 - 17 Noviembre 2026",
        time: "08:00 AM",
        type: "deporte",
        priceFrom: "US$ 250 Inscripción"
      }
    ],
    howToGet: {
      byCar: "A 5 minutos del Aeropuerto Internacional de La Romana (LRM) y a 45 min de Punta Cana por la Autovía del Este."
    },
    contact: {
      phone: "+1 (809) 523-8115",
      website: "https://casadecampo.com.do"
    }
  },

  "corales-golf-club": {
    id: "corales-golf-club",
    slug: "corales-golf-club",
    name: "Corales Golf Club (Puntacana Resort)",
    category: "golf",
    categoryLabel: "Campo de Golf PGA Tour Venue",
    location: "Punta Cana",
    province: "La Altagracia",
    address: "Puntacana Resort & Club, Punta Cana",
    capacity: "18 Hoyos / Par 72",
    yearBuilt: 2010,
    description: "Sede oficial del prestigioso PGA TOUR Corales Puntacana Championship. Diseñado por Tom Fazio, este campo culmina con el 'Codo del Diablo' (Devil's Elbow), un trío final de hoyos dramáticos tallados a lo largo de acantilados oceánicos del Atlántico.",
    image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1920&h=800&fit=crop",
    rating: 4.9,
    reviewCount: 1420,
    amenities: ["Clubhouse Exclusivo con Terraza Marítima", "Pro Shop Oficial PGA TOUR", "Academia de Golf", "Locker Rooms de Lujo"],
    golfSpecs: {
      holes: 18,
      par: 72,
      designer: "Tom Fazio",
      greenFee: "US$ 350 - US$ 450"
    },
    upcomingEvents: [
      {
        id: "ev-pga-corales",
        title: "PGA TOUR Corales Puntacana Championship",
        date: "18 - 22 Marzo 2027",
        time: "07:30 AM",
        type: "deporte",
        priceFrom: "US$ 35 Pase Espectador / Día"
      }
    ],
    howToGet: {
      byCar: "A solo 10 minutos del Aeropuerto Internacional de Punta Cana (PUJ)."
    }
  },

  "punta-espada-golf-club": {
    id: "punta-espada-golf-club",
    slug: "punta-espada-golf-club",
    name: "Punta Espada Golf Club (Cap Cana)",
    category: "golf",
    categoryLabel: "Campo Jack Nicklaus Signature",
    location: "Cap Cana",
    province: "La Altagracia",
    address: "Cap Cana Resort, Punta Cana",
    capacity: "18 Hoyos / Par 72",
    yearBuilt: 2006,
    description: "Catalogado recurrentemente como uno de los mejores campos de golf de México y el Caribe por Golf Digest. Ocho de sus hoyos discurren directamente junto al mar, invitando a tiros sobre bahías turquesas.",
    image: "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=1920&h=800&fit=crop",
    rating: 4.9,
    reviewCount: 1210,
    amenities: ["Clubhouse con Vistas Panorámicas", "Restaurante Hoyo 19 Gourmet", "Flota de Carritos con GPS de Alta Definición"],
    golfSpecs: {
      holes: 18,
      par: 72,
      designer: "Jack Nicklaus",
      greenFee: "US$ 380 - US$ 480"
    },
    upcomingEvents: [
      {
        id: "ev-cap-cana-classic",
        title: "Torneo Invitational Cap Cana",
        date: "5 Diciembre 2026",
        time: "08:30 AM",
        type: "deporte",
        priceFrom: "US$ 200"
      }
    ],
    howToGet: {
      byCar: "Ingresando por el portón principal de Cap Cana hacia el sector Punta Espada."
    }
  },

  // ─── TEATROS Y CENTROS CULTURALES ───
  "teatro-nacional-eduardo-brito": {
    id: "teatro-nacional-eduardo-brito",
    slug: "teatro-nacional-eduardo-brito",
    name: "Teatro Nacional Eduardo Brito",
    category: "teatro",
    categoryLabel: "Teatro Nacional & Bellas Artes",
    location: "Plaza de la Cultura, Santo Domingo",
    province: "Santo Domingo",
    address: "Av. Máximo Gómez #35, Plaza de la Cultura Juan Pablo Duarte, D.N.",
    capacity: 1589,
    yearBuilt: 1973,
    description: "La máxima casa del arte escénico y la cultura de la República Dominicana. Diseñado con una acústica prodigiosa por el arquitecto Teófilo Carbonell, cuenta con la emblemática Sala Principal Carlos Piantini, la Sala Ravelo y la Sala Aida Bonnelly. Sede de óperas, ballets clásicos, la Orquesta Sinfónica Nacional, los Premios Soberano y obras de teatro internacionales.",
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1920&h=800&fit=crop",
    rating: 4.9,
    reviewCount: 3890,
    amenities: ["Foyer de Mármol & Esculturas", "Fila VIP & Palcos Presidenciales", "Foso Hidráulico para Orquesta", "Cafetería Cultural", "Parqueo en Plaza de la Cultura"],
    upcomingEvents: [
      {
        id: "ev-sinfonica-gala",
        title: "Gala Sinfónica Nacional Dominicana: Ritmos de Quisqueya",
        date: "Jueves 22 Octubre",
        time: "8:30 PM",
        type: "cultural",
        priceFrom: "RD$ 1,200",
        eventSlug: "carnaval-dominicano"
      },
      {
        id: "ev-ballet-cascanueces",
        title: "Ballet Clásico Nacional: El Cascanueces",
        date: "11 - 13 Diciembre",
        time: "8:00 PM",
        type: "teatro",
        priceFrom: "RD$ 1,500"
      }
    ],
    howToGet: {
      byMetro: "Estación Casandra Damirón (Línea 1) ubicada literalmente en la entrada del Teatro",
      byCar: "Acceso vehicular por la Avenida Máximo Gómez con parqueo vigilado."
    },
    contact: {
      phone: "+1 (809) 687-3191",
      website: "https://teatronacional.gob.do"
    }
  },

  "anfiteatro-altos-de-chavon": {
    id: "anfiteatro-altos-de-chavon",
    slug: "anfiteatro-altos-de-chavon",
    name: "Anfiteatro Griego de Altos de Chavón",
    category: "teatro",
    categoryLabel: "Anfiteatro de Piedra al Aire Libre",
    location: "Altos de Chavón, La Romana",
    province: "La Romana",
    address: "Altos de Chavón, Casa de Campo, La Romana",
    capacity: 5000,
    yearBuilt: 1982,
    description: "Inaugurado con el célebre concierto 'Concert for the Americas' de Frank Sinatra y Buddy Rich en 1982. Este imponente anfiteatro de piedra coralina de estilo romano-griego con vista al río Chavón ha acogido leyendas como Sting, Elton John, Andrea Bocelli, Bad Bunny y Juan Luis Guerra.",
    image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1920&h=800&fit=crop",
    rating: 4.9,
    reviewCount: 2950,
    amenities: ["Vistas al Valle del Río Chavón", "Pueblo Medieval de Piedra con Galerías", "Restaurantes & Bares Exclusivos", "Seguridad de Clase Mundial"],
    upcomingEvents: [
      {
        id: "ev-chavon-acoustic",
        title: "Concierto Bajo las Estrellas en Chavón",
        date: "Sábado 28 Noviembre",
        time: "8:00 PM",
        type: "concierto",
        priceFrom: "US$ 80",
        eventSlug: "festival-merengue"
      }
    ],
    howToGet: {
      byCar: "Dentro del complejo Casa de Campo Resort, siguiendo señalizaciones hacia la Villa Cultural de Altos de Chavón."
    }
  },

  // ─── SALONES DE HOTELES & CENTROS DE CONVENCIONES ───
  "centro-convenciones-hotel-jaragua": {
    id: "centro-convenciones-hotel-jaragua",
    slug: "centro-convenciones-hotel-jaragua",
    name: "Salón La Fiesta & Centro de Convenciones Renaissance Jaragua",
    category: "centro_convenciones",
    categoryLabel: "Salón de Gala & Convenciones",
    location: "Malecón de Santo Domingo",
    province: "Santo Domingo",
    address: "Av. George Washington #367, Malecón, Santo Domingo",
    capacity: 1200,
    yearBuilt: 1988,
    description: "Uno de los salones más legendarios de la capital dominicana. El Salón La Fiesta ha sido el hogar histórico de las grandes fiestas de fin de año, cumbres corporativas MICE, congresos médicos y recepciones nupciales de alta sociedad en el Malecón.",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1920&h=800&fit=crop",
    rating: 4.7,
    reviewCount: 1650,
    amenities: ["Banquete y Catering 5 Estrellas", "División Modular en Salones", "Equipos Audiovisuales de Punta", "Valet Parking", "Alojamiento Hotelero Integrado"],
    upcomingEvents: [
      {
        id: "ev-expo-turismo-rd",
        title: "Expo Turismo & Inversión Inmobiliaria Caribeña",
        date: "Jueves 5 - Sábado 7 Noviembre",
        time: "09:00 AM",
        type: "feria",
        priceFrom: "Entrada Libre con Pre-registro"
      }
    ],
    howToGet: {
      byCar: "Frente al Mar Caribe sobre la Av. George Washington con servicio de Valet Parking propio."
    },
    contact: {
      phone: "+1 (809) 221-2222",
      website: "https://marriott.com"
    }
  },

  "convention-center-barcelo-bavaro": {
    id: "convention-center-barcelo-bavaro",
    slug: "convention-center-barcelo-bavaro",
    name: "Barceló Bávaro Grand Resort Convention Center",
    category: "centro_convenciones",
    categoryLabel: "Centro de Convenciones Resort",
    location: "Playa Bávaro, Punta Cana",
    province: "La Altagracia",
    address: "Carretera Bávaro Km 1, Playa Bávaro",
    capacity: 5000,
    yearBuilt: 2011,
    description: "El centro de convenciones más grande y moderno de toda la República Dominicana y el Caribe insular. Cuenta con 11,500 m² de espacio flexible dividido en 13 salas multifuncionales con tecnología de última generación para congresos globales y ferias turísticas como DATE.",
    image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1920&h=800&fit=crop",
    rating: 4.8,
    reviewCount: 980,
    amenities: ["13 Salas Modulares", "Capacidad hasta 5,000 delegados", "Alta Gastronomía Internacional", "Helipuerto Cercano", "A pie de Playa"],
    upcomingEvents: [
      {
        id: "ev-date-punta-cana",
        title: "Dominican Annual Tourism Exchange (DATE)",
        date: "20 - 23 Abril 2027",
        time: "09:00 AM",
        type: "feria",
        priceFrom: "Delegados Registrados"
      }
    ],
    howToGet: {
      byCar: "A 20 minutos del Aeropuerto Internacional de Punta Cana en el complejo Barceló Bávaro."
    }
  },

  // ─── CENTROS COMERCIALES CON PLAZAS DE EVENTOS ───
  "agora-mall-atrio": {
    id: "agora-mall-atrio",
    slug: "agora-mall-atrio",
    name: "Atrio Central & Jardín Ágora Mall",
    category: "mall",
    categoryLabel: "Centro Comercial & Atrio de Eventos",
    location: "Piantini, Santo Domingo",
    province: "Santo Domingo",
    address: "Av. John F. Kennedy esq. Av. Abraham Lincoln, Santo Domingo",
    capacity: 1500,
    yearBuilt: 2012,
    description: "El primer centro comercial ecológico certificado LEED Gold de Centroamérica y el Caribe. Su imponente Atrio Central de cuádruple altura y cúpula de cristal transparente es el epicentro urbano de ferias de emprendimiento ('El Mercadito de Ágora'), exhibiciones de arte, lanzamientos de productos y conciertos corales.",
    image: "https://images.unsplash.com/photo-1567449303078-57ad995bd301?w=1920&h=800&fit=crop",
    rating: 4.8,
    reviewCount: 5200,
    amenities: ["Aire Acondicionado", "4 Niveles de Parqueo Subterráneo", "Zona Gastronómica 'El Jardín'", "Seguridad Biométrica", "Acceso Directo al Metro"],
    upcomingEvents: [
      {
        id: "ev-mercadito-agora",
        title: "El Mercadito de los Sábados: Artesanos & Sabores Criollos",
        date: "Todos los Sábados",
        time: "10:00 AM - 08:00 PM",
        type: "feria",
        priceFrom: "Entrada Libre"
      }
    ],
    howToGet: {
      byMetro: "Estación Pedro Mir (Línea 2) con salida peatonal inmediata frente a Ágora Mall.",
      byCar: "Entradas vehiculares por la Av. John F. Kennedy y Av. Abraham Lincoln."
    },
    contact: {
      phone: "+1 (809) 472-2000",
      website: "https://agora.com.do"
    }
  },

  "blue-mall-punta-cana": {
    id: "blue-mall-punta-cana",
    slug: "blue-mall-punta-cana",
    name: "Anfiteatro de Aguas & Plaza BlueMall Punta Cana",
    category: "mall",
    categoryLabel: "Lifestyle Mall & Anfiteatro",
    location: "Punta Cana",
    province: "La Altagracia",
    address: "Boulevard Turístico del Este esq. Carretera Juanillo, Punta Cana",
    capacity: 2000,
    yearBuilt: 2017,
    description: "El shopping mall más sofisticado del Caribe Oriental. Cuenta con un innovador anfiteatro al aire libre con fuentes danzantes y espectáculos de luces, donde se realizan festivales de jazz, desfiles de moda de verano y catas gastronómicas.",
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1920&h=800&fit=crop",
    rating: 4.7,
    reviewCount: 2150,
    amenities: ["Fuentes Danzantes Iluminadas", "Restaurantes de Lujo con Terrazas", "Tiendas de Diseñador", "Parqueo Gratuito"],
    upcomingEvents: [
      {
        id: "ev-jazz-fountains-bluemall",
        title: "Noche de Vinos & Jazz Frente a las Fuentes Danzantes",
        date: "Viernes 27 Noviembre",
        time: "07:30 PM",
        type: "concierto",
        priceFrom: "Acceso Libre"
      }
    ],
    howToGet: {
      byCar: "A 3 minutos del Aeropuerto de Punta Cana sobre el Boulevard Turístico del Este."
    },
    contact: {
      phone: "+1 (809) 784-4000",
      website: "https://bluemallpuntacana.com.do"
    }
  }
};

export function getVenueBySlug(slug: string): VenueItem | undefined {
  if (!slug) return undefined;
  return VENUES_DATA[slug] || Object.values(VENUES_DATA).find(v => v.id === slug || v.slug === slug);
}

export function getAllVenues(): VenueItem[] {
  return Object.values(VENUES_DATA);
}
