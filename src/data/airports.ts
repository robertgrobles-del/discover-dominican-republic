// Datos estáticos de aeropuertos de República Dominicana

export interface AirlineContact {
  name: string;
  website: string;
  code?: string;
  terminal?: string;
  isHub?: boolean;
}

export interface VipLoungeItem {
  name: string;
  location: string;
  hours?: string;
  phone?: string;
  email?: string;
  website?: string;
  access?: string;
  description?: string;
  highlight?: string;
}

export interface DestinationGroup {
  region: string;
  destinations: string[];
}

export interface ParkingFaq {
  question: string;
  answer: string;
}

export interface ParkingInfo {
  overview: string;
  options: { title: string; detail: string; link?: string }[];
  faqs: ParkingFaq[];
}

export interface TravelGuide {
  handBaggage: {
    title: string;
    description: string;
    tips: string[];
  };
  petTravel: {
    title: string;
    description: string;
    tips: string[];
  };
}

export interface Airport {
  id: string;
  slug: string;
  aliases?: string[];
  name: string;
  code: string; // IATA
  icao: string;
  city: string;
  provinceId: string;
  provinceName: string;
  type: 'internacional' | 'domestico';
  shortDescription: string;
  description: string;
  operator?: string;
  passengersAnnual?: string;
  runwayLength?: string;
  elevation?: string;
  highlights?: string[];
  vipLounges?: VipLoungeItem[];
  imageUrl: string;
  gallery: string[];
  coordinates: { lat: number; lng: number };
  terminals?: string[];
  airlines?: string[];
  airlinesDetailed?: AirlineContact[];
  destinations: string[];
  destinationsByContinent?: DestinationGroup[];
  services: { name: string; description: string }[];
  parkingInfo?: ParkingInfo;
  travelGuides?: TravelGuide;
  transportation: { name: string; detail: string; price?: string }[];
  nearbyDestinations: { name: string; distance: string; slug: string }[];
  phone: string;
  website: string;
  rating: number;
  reviewCount: number;
  isPopular: boolean;
  isFeatured?: boolean;
}

export const airports: Airport[] = [
  {
    id: 'puj',
    slug: 'aeropuerto-internacional-de-punta-cana',
    aliases: ['punta-cana', 'punta-cana-puj', 'puj', 'aeropuerto-punta-cana'],
    name: 'Aeropuerto Internacional de Punta Cana',
    code: 'PUJ',
    icao: 'MDPC',
    city: 'Punta Cana',
    provinceId: 'la-altagracia',
    provinceName: 'La Altagracia',
    type: 'internacional',
    operator: 'Grupo Puntacana',
    passengersAnnual: '> 9.5M pasajeros / año (56% del tráfico nacional)',
    runwayLength: '3,100 m (10,171 ft) · Asfalto de alta densidad',
    elevation: '12 m (40 ft) MSL',
    highlights: ['Piscina VIP en Terraza', 'Arquitectura Tropical Ecológica', 'Hub Líder del Caribe', 'Wi-Fi 6 de Alta Velocidad'],
    shortDescription: 'El aeropuerto más transitado del Caribe y principal puerta de entrada turística del país.',
    description: 'El Aeropuerto Internacional de Punta Cana (PUJ) es el aeropuerto privado comercial más transitado del mundo y la principal puerta de entrada a la República Dominicana, concentrando más del 56% de todas las llegadas aéreas internacionales. Diseñado con una célebre arquitectura vernácula de techos de cana de palma y piedra coralina, cuenta con una Terminal B recientemente expandida con una inversión de US$ 90M que incluye una icónica piscina infinita en la terraza VIP con vistas panorámicas a la pista activa.',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&h=800&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1200&h=800&fit=crop&q=80'
    ],
    coordinates: { lat: 18.5674, lng: -68.3634 },
    terminals: ['Terminal A (Vuelos Internacionales)', 'Terminal B (Nueva Expansión & Puentes)', 'FBO (Aviación Privada y Ejecutiva)'],
    airlinesDetailed: [
      { name: 'American Airlines', code: 'AAL', website: 'https://www.aa.com/', terminal: 'Terminal B' },
      { name: 'Delta Air Lines', code: 'DAL', website: 'https://www.delta.com/', terminal: 'Terminal B' },
      { name: 'United Airlines', code: 'UAL', website: 'https://www.united.com/', terminal: 'Terminal B' },
      { name: 'JetBlue Airways', code: 'JBU', website: 'https://www.jetblue.com/', terminal: 'Terminal A' },
      { name: 'Air France', code: 'AFR', website: 'https://www.airfrance.com/', terminal: 'Terminal A' },
      { name: 'British Airways', code: 'BAW', website: 'https://www.britishairways.com/', terminal: 'Terminal A' },
      { name: 'Iberia', code: 'IBE', website: 'https://www.iberia.com/', terminal: 'Terminal A' },
      { name: 'Air Canada', code: 'ACA', website: 'https://www.aircanada.com/', terminal: 'Terminal B' },
      { name: 'Copa Airlines', code: 'CMP', website: 'https://www.copaair.com/', terminal: 'Terminal A' },
      { name: 'Avianca', code: 'AVA', website: 'https://www.avianca.com/', terminal: 'Terminal A' },
      { name: 'Arajet', code: 'ARA', website: 'https://www.arajet.com/', terminal: 'Terminal B' },
      { name: 'Condor', code: 'CFG', website: 'https://www.condor.com/', terminal: 'Terminal A' },
      { name: 'TUI Airways', code: 'TOM', website: 'https://www.tui.co.uk/', terminal: 'Terminal A' },
      { name: 'WestJet', code: 'WJA', website: 'https://www.westjet.com/', terminal: 'Terminal B' },
      { name: 'Frontier Airlines', code: 'FFT', website: 'https://www.flyfrontier.com/', terminal: 'Terminal B' },
      { name: 'Edelweiss Air', code: 'EDW', website: 'https://www.flyedelweiss.com/', terminal: 'Terminal A' },
      { name: 'Eurowings Discover', code: 'EWG', website: 'https://www.discover-airlines.com/', terminal: 'Terminal A' }
    ],
    destinations: ['Miami (MIA)', 'New York (JFK)', 'Atlanta (ATL)', 'Toronto (YYZ)', 'Madrid (MAD)', 'París (CDG)', 'Frankfurt (FRA)', 'Londres (LGW)', 'Bogotá (BOG)', 'Panamá (PTY)', 'San Juan (SJU)', 'Zúrich (ZRH)'],
    destinationsByContinent: [
      { region: 'Norteamérica', destinations: ['Miami (MIA)', 'New York (JFK)', 'Atlanta (ATL)', 'Toronto (YYZ)', 'Montreal (YUL)', 'Boston (BOS)', 'Charlotte (CLT)', 'Chicago (ORD)', 'Orlando (MCO)'] },
      { region: 'Europa', destinations: ['Madrid (MAD)', 'París (CDG/ORY)', 'Frankfurt (FRA)', 'Londres (LGW)', 'Zúrich (ZRH)', 'Bruselas (BRU)', 'Ámsterdam (AMS)'] },
      { region: 'Sudamérica', destinations: ['Bogotá (BOG)', 'Medellín (MDE)', 'Lima (LIM)', 'São Paulo (GRU)', 'Buenos Aires (EZE)'] },
      { region: 'Caribe y Centroamérica', destinations: ['Panamá (PTY)', 'San Juan (SJU)', 'San José (SJO)', 'Curazao (CUR)'] }
    ],
    vipLounges: [
      { name: 'VIP Lounge Terminal B (con Piscina)', location: 'Terminal B, Aire, puertas 24-31', access: 'Priority Pass, LoungeKey, DragonPass, Day Pass', highlight: 'Piscina infinita al aire libre frente a la pista de aterrizaje, duchas y barra premium.' },
      { name: 'VIP Lounge Terminal A', location: 'Terminal A, Nivel 2', access: 'Priority Pass, Tarjetas Bancarias Selectas', highlight: 'Espacio climatizado, buffet gourmet y business center silencioso.' }
    ],
    services: [
      { name: 'Salones VIP & Piscina', description: 'VIP Lounge con piscina exterior en terraza hacia la pista, duchas y bar.' },
      { name: 'Duty Free Americas', description: 'Tiendas libres de impuestos con rones añejos, cigarros premium y marcas de lujo.' },
      { name: 'Wi-Fi 6 Gratuito', description: 'Conexión simétrica de alta velocidad ilimitada en todas las salas de espera.' },
      { name: 'Cambio de Divisas & ATM', description: 'Casas de cambio y cajeros automáticos multimoneda en llegadas y salidas.' },
      { name: 'Asistencia Médica 24/7', description: 'Clínica de emergencias y primeros auxilios con ambulancia aeroportuaria.' },
      { name: 'Estacionamiento Inteligente', description: 'Parking vigilado de corta y larga estancia con lectores automáticos.' },
    ],
    transportation: [
      { name: 'Taxi Turístico Oficial', detail: 'Tarifas reguladas fijas con ticket impreso en mostrador MITUR', price: 'US$ 25-45' },
      { name: 'Shuttle Privado de Hotel', detail: 'La mayoría de resorts todo incluido disponen de counter en la zona de llegadas' },
      { name: 'Rent a Car Oficial', detail: 'Hertz, Avis, Budget, Europcar, National y Enterprise en la terminal' },
      { name: 'Transporte Expreso Bávaro', detail: 'Conexión diaria a Santo Domingo y La Romana con aire acondicionado', price: 'US$ 8-10' },
    ],
    nearbyDestinations: [
      { name: 'Punta Cana Village', distance: '5 min', slug: 'punta-cana' },
      { name: 'Bávaro & El Cortecito', distance: '15 min', slug: 'bavaro' },
      { name: 'Cap Cana & Marina', distance: '12 min', slug: 'cap-cana' },
      { name: 'Miches', distance: '55 min', slug: 'miches' },
    ],
    phone: '+1 809-959-2376',
    website: 'https://puntacanainternationalairport.com',
    rating: 4.8,
    reviewCount: 15400,
    isPopular: true,
    isFeatured: true
  },
  {
    id: 'sdq',
    slug: 'aeropuerto-internacional-las-americas',
    aliases: ['las-americas', 'las-americas-sdq', 'sdq', 'aeropuerto-las-americas'],
    name: 'Aeropuerto Internacional Las Américas',
    code: 'SDQ',
    icao: 'MDSD',
    city: 'Santo Domingo',
    provinceId: 'santo-domingo',
    provinceName: 'Santo Domingo',
    type: 'internacional',
    operator: 'AERODOM (VINCI Airports)',
    passengersAnnual: '> 5.81M pasajeros / año (Hub de la capital)',
    runwayLength: '3,354 m (11,004 ft) · Asfalto (Pista más extensa de RD)',
    elevation: '18 m (59 ft) MSL',
    highlights: ['Hub Principal de Arajet', 'Terminal de Carga #1 de RD', 'Inversión US$ 250M en marcha', 'Conexión Autovía del Este', '5 Salas VIP Exclusivas'],
    shortDescription: 'Principal aeropuerto de la capital, hub de Arajet y nombrado en honor a José Francisco Peña Gómez.',
    description: 'El Aeropuerto Internacional Las Américas Dr. José Francisco Peña Gómez (SDQ) es la principal infraestructura aérea de Santo Domingo y el mayor nodo de carga aérea del Caribe (más de 111,000 toneladas anuales). Operado por AERODOM/VINCI Airports, funciona como hub continental para Arajet y enlaza la capital con Norteamérica, Europa, Centroamérica y Sudamérica a través de su pista de 3,354 metros de longitud.',
    imageUrl: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1200&h=800&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1200&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546825551-a6628a941c91?w=1200&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&h=800&fit=crop&q=80'
    ],
    coordinates: { lat: 18.4297, lng: -69.6689 },
    terminals: ['Terminal A (Sur)', 'Terminal B (Norte / Arajet Hub)', 'Terminal de Carga Internacional'],
    airlines: [
      'AeroMexico', 'Air Antilles Express', 'Air Caraibes', 'Air Century', 'Air Europa', 'American Airlines',
      'Arajet', 'Avianca', 'Avior Airlines', 'Condor', 'Copa Airlines', 'Delta Airlines', 'Eastern Airlines',
      'Frontier Airlines', 'GlobalX Airlines', 'Iberia', 'Intercaribbean', 'Jet Blue', 'Laser Airlines',
      'Rutaca', 'Sky Cana', 'Sky High Aviation Services', 'Spirit Airlines', 'Sunrise', 'Turpial Airlines',
      'United Airlines', 'Venezolana', 'Wingo', 'World2Fly'
    ],
    airlinesDetailed: [
      { name: 'AeroMéxico', code: 'AMX', website: 'https://www.aeromexico.com/', terminal: 'Mostrador Terminal A' },
      { name: 'Arajet', code: 'ARA', website: 'https://www.arajet.com/', terminal: 'Terminal B (Norte)', isHub: true },
      { name: 'American Airlines', code: 'AAL', website: 'https://www.aa.com/', terminal: 'Mostrador Terminal B' },
      { name: 'Air Europa', code: 'AEA', website: 'https://www.aireuropa.com/', terminal: 'Terminal A (Sur)' },
      { name: 'Iberia', code: 'IBE', website: 'https://www.iberia.com/', terminal: 'Terminal A (Sur)' },
      { name: 'JetBlue', code: 'JBU', website: 'https://www.jetblue.com/', terminal: 'Terminal A & B' },
      { name: 'Copa Airlines', code: 'CMP', website: 'https://www.copaair.com/', terminal: 'Terminal B (Norte)' },
      { name: 'Delta Air Lines', code: 'DAL', website: 'https://www.delta.com/', terminal: 'Terminal B (Norte)' },
      { name: 'Avianca', code: 'AVA', website: 'https://www.avianca.com/', terminal: 'Terminal A (Sur)' },
      { name: 'Air Century', code: 'CEY', website: 'https://aircentury.com/', terminal: 'Operador Doméstico/Caribe' },
      { name: 'United Airlines', code: 'UAL', website: 'https://www.united.com/', terminal: 'Terminal B (Norte)' },
      { name: 'Spirit Airlines', code: 'NKS', website: 'https://www.spirit.com/', terminal: 'Terminal A (Sur)' },
      { name: 'Frontier Airlines', code: 'FFT', website: 'https://www.flyfrontier.com/', terminal: 'Terminal B (Norte)' },
      { name: 'Air Caraïbes', code: 'FWI', website: 'https://www.aircaraibes.com/', terminal: 'Terminal A (Sur)' },
      { name: 'Wingo', code: 'RPB', website: 'https://www.wingo.com/', terminal: 'Conexión Colombia' },
      { name: 'Air Antilles Express', code: 'CCE', website: 'https://www.airantilles.com/', terminal: 'Terminal A' },
      { name: 'Avior Airlines', code: 'ROI', website: 'https://aviorair.com/', terminal: 'Terminal A' },
      { name: 'Condor', code: 'CFG', website: 'https://www.condor.com/', terminal: 'Terminal A (Vuelos Europa)' },
      { name: 'Eastern Airlines', code: 'EAL', website: 'https://iflyea.com/', terminal: 'Terminal B' },
      { name: 'GlobalX Airlines', code: 'GXA', website: 'https://www.globalairlinesgroup.com/', terminal: 'Terminal B' },
      { name: 'Intercaribbean', code: 'IWY', website: 'https://www.intercaribbean.com/', terminal: 'Terminal A' },
      { name: 'Laser Airlines', code: 'LER', website: 'https://www.laserairlines.com/', terminal: 'Terminal A' },
      { name: 'Rutaca', code: 'RUC', website: 'https://www.flyrutaca.com/', terminal: 'Terminal A' },
      { name: 'Sky Cana', code: 'SNA', website: 'https://skycana.com/', terminal: 'Terminal A' },
      { name: 'Sky High Aviation Services', code: 'SHH', website: 'https://www.skyhighdominicana.com/', terminal: 'Terminal A & B' },
      { name: 'Sunrise Airways', code: 'KSZ', website: 'https://www.sunriseairways.net/', terminal: 'Terminal A' },
      { name: 'Turpial Airlines', code: 'VTU', website: 'https://www.turpialairlines.com/', terminal: 'Terminal A' },
      { name: 'Venezolana', code: 'VNE', website: 'https://www.venezolana.aero/', terminal: 'Terminal A' },
      { name: 'World2Fly', code: 'WFL', website: 'https://www.w2fly.es/', terminal: 'Terminal A (Vuelos Madrid)' }
    ],
    destinations: [
      'New York', 'Miami', 'Madrid', 'Bogotá', 'Panamá', 'San Juan', 'Ciudad de México', 'Atlanta', 'Boston',
      'Fort Lauderdale', 'Orlando', 'Filadelfia', 'Montreal', 'Toronto', 'Caracas', 'Valencia', 'Frankfurt',
      'Bruselas', 'Milán', 'París', 'Moscú', 'San José', 'La Habana', 'Santiago de Cuba', 'Curazao', 'Aruba'
    ],
    destinationsByContinent: [
      {
        region: 'Caribe y América Central',
        destinations: ['St. Kitts', 'Anguila', 'Aruba', 'Bonaire', 'Curazao', 'Dominica', 'St. Maarten', 'Tórtola', 'Pointe-a-Pitre', 'Providenciales', 'Habana', 'Santiago de Cuba', 'San Juan', 'Panamá', 'San José', 'Antigua']
      },
      {
        region: 'Norteamérica',
        destinations: ['New York', 'Miami', 'Atlanta', 'Boston', 'Fort Lauderdale', 'Orlando', 'Filadelfia', 'Ciudad de México', 'Toronto', 'Montreal']
      },
      {
        region: 'Sudamérica',
        destinations: ['Bogotá', 'Caracas', 'Valencia']
      },
      {
        region: 'Europa',
        destinations: ['Madrid', 'Frankfurt', 'Bruselas', 'Milán', 'París', 'Moscú']
      }
    ],
    vipLounges: [
      {
        name: 'Sala Premium Before Boarding',
        location: '1er nivel, Terminal de Pasajeros (Puerta No. 5 antes de rampa al 2do nivel)',
        hours: '24 horas',
        phone: '1-809-549-0202',
        email: 'info.sdq@beforeboarding.com',
        website: 'https://www.beforeboarding.com/',
        access: 'Servicio VIP tanto para salidas como para llegadas. Aplican tarifas y condiciones especiales.',
        highlight: 'Atención personalizada, asistencia en filtro de seguridad y migración exclusiva.'
      },
      {
        name: 'Sala Caribe Before Boarding',
        location: '2do nivel, Terminal A (Área de Salidas)',
        hours: '24 horas',
        phone: '1-809-549-0202',
        email: 'info.sdq@beforeboarding.com',
        website: 'https://www.beforeboarding.com/',
        access: 'Pasajeros de salidas internacionales. Aplican condiciones con tarjetas y pases directos.',
        highlight: 'Buffet dominicano e internacional, bar de cócteles, salas de descanso y duchas.'
      },
      {
        name: 'Copa Club',
        location: '2do nivel, Terminal B',
        hours: '24 horas',
        phone: '1-809-549-8044',
        website: 'https://www.copaair.com/es/web/co/copa-club',
        access: 'Exclusivo para pasajeros de Copa Airlines (Clase Ejecutiva, ConnectMiles PreferMember y Star Alliance Gold).',
        highlight: 'Ambiente silencioso de trabajo, bebidas premium de cortesía y asistencia de reservas.'
      },
      {
        name: 'Sala VIP American Express',
        location: '2do nivel, Terminal B',
        hours: '5:00 a.m. a 10:00 p.m.',
        phone: '809-545-7799',
        website: 'https://www.progreso.com.do/',
        access: 'Tarjetahabientes American Express (Banco del Progreso / Scotiabank) y tarjetas internacionales elegibles.',
        highlight: 'Catering exclusivo, prensa internacional, atención ejecutiva y privacidad total.'
      },
      {
        name: 'Sala SKY The Lounge',
        location: '2do nivel, Terminal A (Salidas)',
        hours: '6:00 a.m. a 11:59 p.m.',
        phone: '1-809-549-0202',
        email: 'hello@skythelounge.com',
        website: 'https://www.beforeboarding.com/',
        access: 'Pasajeros de salidas. Acceso con pases y aerolíneas aliadas.',
        highlight: 'Diseño vanguardista, barra de cafés gourmet y vista a la plataforma de aeronaves.'
      },
      {
        name: 'FBO Aviación Ejecutiva & Privada',
        location: 'Área Oeste AILA',
        hours: '24 horas',
        access: 'Pasajeros y tripulaciones de aviación corporativa y jets privados.',
        highlight: 'Trámite aduanal y migratorio express en rampa, sala de descanso para pilotos.'
      }
    ],
    parkingInfo: {
      overview: '¡Bienvenido al Aeropuerto Internacional de las Américas! Tenemos estacionamiento que se adapta a tus necesidades: Prepago, Pago en Línea, Zona Premium, Larga Duración y Corta Duración. Ven, estaciona tu auto y relájate.',
      options: [
        { title: 'Zona Premium', detail: 'Ubicación inmediata frente a la terminal principal, acceso directo y vigilancia reforzada.', link: 'https://aeropuertolasamericas.com/estacionamiento-premium/' },
        { title: 'Larga Duración', detail: 'Tarifa reducida por día ideal para viajes de negocios o vacaciones prolongadas.', link: 'https://aeropuertolasamericas.com/estacionamiento-de-larga-duracion/' },
        { title: 'Corta Duración', detail: 'Ideal para despedidas y recibimiento rápido de familiares o traslados ejecutivos.', link: 'https://aeropuertolasamericas.com/estacionamiento-de-corta-duracion/' },
        { title: 'Prepago y Pago en Línea', detail: 'Asegura tu tarifa antes de viajar mediante tarjeta de crédito o débito.', link: 'https://aeropuertolasamericas.com/pago-de-estacionamiento/' }
      ],
      faqs: [
        {
          question: '¿Cómo usar el parqueo de Larga Duración?',
          answer: 'Al entrar toma el ticket en la máquina de entrada (consérvalo con cuidado, ya que su pérdida retrasa el proceso de salida). Deja tu vehículo en un espacio señalizado. Al terminar tu viaje, introduce el ticket en las máquinas automáticas de pago en la salida del primer nivel (llegadas). Puedes pagar con tarjetas de débito/crédito o efectivo en pesos dominicanos (DOP) y dólares estadounidenses (USD). Presenta el ticket pagado en la máquina de salida para completar el proceso.'
        },
        {
          question: '¿Qué hacer si pierdes tu ticket de parqueo?',
          answer: 'El ticket es el documento que avala la propiedad del vehículo. En caso de pérdida, dirígete al Centro de Atención al Usuario del Estacionamiento con los documentos del vehículo y documento de identidad del titular (o vínculo demostrado). Existe un costo establecido como penalidad por pérdida de ticket de DOP$ 1,000.00.'
        },
        {
          question: '¿Cuáles son las áreas de NO ESTACIONE?',
          answer: 'Existen áreas identificadas con letreros de NO ESTACIONE en salidas (segundo nivel) y llegadas (primer nivel). En estas zonas un vehículo estacionado desatendido será remolcado requiriendo el pago de una multa. Están reservadas para que los pasajeros inicien su viaje o sean buscados de manera rápida sin usar los estacionamientos.'
        },
        {
          question: '¿Qué hacer si uno de los parqueos está lleno?',
          answer: 'Si la máquina de entrada indica que un parqueo está lleno, dirígete a otra de las localidades del aeropuerto (por ejemplo, si el parqueo Premium está lleno, acude a Larga Duración o Corta Duración).'
        },
        {
          question: '¿Qué hacer ante un neumático desinflado o batería descargada?',
          answer: 'Contamos con un servicio gratuito para nuestros usuarios de asistencia para baterías descargadas y neumáticos desinflados en la oficina de atención al usuario de estacionamiento.'
        }
      ]
    },
    travelGuides: {
      handBaggage: {
        title: 'Equipaje de Mano: Cuanto menos, es mejor',
        description: 'Las dos prioridades dentro del avión son la seguridad y la comodidad. Por eso, las reglas en cuanto al equipaje de mano son claras: solo debes llevar lo que es imprescindible. Lo demás debe ir en la bodega.',
        tips: [
          'Líquidos, geles y aerosoles deben ir en envases individuales de hasta 100 ml (3.4 oz) dentro de una bolsa transparente.',
          'Medicamentos esenciales, documentos de identidad y artículos de valor siempre deben ir contigo en cabina.',
          'Verifica los límites de peso (habitualmente 8 a 10 kg) y dimensiones con tu aerolínea antes de salir de casa.',
          'Objetos cortantes o punzantes están estrictamente prohibidos en cabina y deben despacharse en bodega.'
        ]
      },
      petTravel: {
        title: 'Viajar con Animales: Tu mejor amigo también tiene lugar aquí',
        description: 'Aunque cada aerolínea tenga sus reglas, se pueden transportar animales de compañía en un avión cumpliendo las directrices sanitarias para que el viaje sea cómodo y seguro para ambos.',
        tips: [
          'Presenta el certificado de salud emitido por un médico veterinario colegiado con fecha reciente.',
          'Comprueba que la cartilla de vacunación incluya la vacuna contra la rabia vigente.',
          'Utiliza una jaula transportadora aprobada por IATA donde tu mascota pueda ponerse de pie y girar con comodidad.',
          'Consulta previamente con la aerolínea las tarifas y si tu mascota puede viajar en cabina o en bodega presurizada.'
        ]
      }
    },
    services: [
      { name: 'Salones VIP Before Boarding & Copa Club', description: '5 salas VIP con Wi-Fi, bar de cócteles, buffet gourmet, áreas de trabajo y duchas.' },
      { name: 'Zona Comercial Duty Free', description: 'Paseo comercial de 3,000 m² con marcas de cosmética, licores, puros y souvenirs.' },
      { name: 'Wi-Fi Ilimitado Aerodom', description: 'Conexión a internet gratuita en todos los niveles y puertas de embarque.' },
      { name: 'Bancos & Cambio Oficial', description: 'Sucursales del Banco de Reservas y cajeros automáticos multimoneda 24 horas.' },
      { name: 'Food Court Internacional', description: 'Cafeterías y restaurantes con franquicias internacionales y sabor criollo.' },
      { name: 'Farmacia 24H & Sanidad', description: 'Dispensario médico y farmacia continua en el nivel de llegadas.' },
    ],
    transportation: [
      { name: 'Taxi Oficial AILA', detail: 'Taxis regulados SICHOPROA con tarifa fija por zona', price: 'US$ 30-40' },
      { name: 'Uber / DiDi Autorizado', detail: 'Puntos de recogida delimitados frente a la salida de la Terminal A y B' },
      { name: 'Rent a Car Multimarca', detail: 'Avis, Budget, Sixt, Europcar y Dollar con mostradores 24 horas' },
      { name: 'Autobús Interurbano', detail: 'Parada de autobuses hacia Boca Chica y el centro de Santo Domingo', price: 'RD$ 75-100' },
    ],
    nearbyDestinations: [
      { name: 'Zona Colonial (UNESCO)', distance: '25 min', slug: 'zona-colonial' },
      { name: 'Boca Chica & Club Náutico', distance: '10 min', slug: 'boca-chica' },
      { name: 'Juan Dolio & Guavaberry', distance: '20 min', slug: 'juan-dolio' },
      { name: 'Santo Domingo Centro', distance: '30 min', slug: 'santo-domingo' },
    ],
    phone: '+1 809-947-2225',
    website: 'https://aerodom.com',
    rating: 4.4,
    reviewCount: 11200,
    isPopular: true,
    isFeatured: true
  },
  {
    id: 'sti',
    slug: 'aeropuerto-internacional-del-cibao',
    aliases: ['cibao', 'cibao-sti', 'sti', 'aeropuerto-cibao', 'santiago'],
    name: 'Aeropuerto Internacional del Cibao',
    code: 'STI',
    icao: 'MDST',
    city: 'Santiago',
    provinceId: 'santiago',
    provinceName: 'Santiago',
    type: 'internacional',
    operator: 'Corporación Aeropuerto Internacional del Cibao',
    passengersAnnual: '> 2.15M pasajeros / año (Tercer aeropuerto de RD)',
    runwayLength: '2,620 m (8,596 ft) · En expansión a 3,000 m',
    elevation: '172 m (564 ft) MSL',
    highlights: ['Capital del Cibao & Diáspora', 'Expansión de Terminal 2025', 'Puerta a Cordillera Central & Jarabacoa', 'Carga Agrícola & Textil'],
    shortDescription: 'Principal aeropuerto del norte, sirve a Santiago, la región del Cibao y la Cordillera Central.',
    description: 'El Aeropuerto Internacional del Cibao (STI) es el tercer aeropuerto de mayor tráfico en la República Dominicana y el principal motor aéreo de la fértil región del Cibao y la ciudad de Santiago de los Caballeros. Gestionado por la Corporación del Aeropuerto Internacional del Cibao, conecta a la gran comunidad dominicana en el exterior con vuelos diarios directos hacia Nueva York, Boston, Miami, Fort Lauderdale, Puerto Rico y Panamá.',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&h=800&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1200&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&h=800&fit=crop&q=80'
    ],
    coordinates: { lat: 19.4061, lng: -70.6047 },
    airlinesDetailed: [
      { name: 'JetBlue Airways', code: 'JBU', website: 'https://www.jetblue.com/', terminal: 'Terminal Principal', isHub: true },
      { name: 'American Airlines', code: 'AAL', website: 'https://www.aa.com/', terminal: 'Terminal Principal' },
      { name: 'Delta Air Lines', code: 'DAL', website: 'https://www.delta.com/', terminal: 'Terminal Principal' },
      { name: 'United Airlines', code: 'UAL', website: 'https://www.united.com/', terminal: 'Terminal Principal' },
      { name: 'Spirit Airlines', code: 'NKS', website: 'https://www.spirit.com/', terminal: 'Terminal Principal' },
      { name: 'Copa Airlines', code: 'CMP', website: 'https://www.copaair.com/', terminal: 'Terminal Principal' },
      { name: 'Arajet', code: 'ARA', website: 'https://www.arajet.com/', terminal: 'Terminal Principal' },
      { name: 'Air Century', code: 'CEY', website: 'https://aircentury.com/', terminal: 'Terminal Doméstica/Caribe' }
    ],
    destinations: ['New York (JFK/EWR)', 'Boston (BOS)', 'Miami (MIA)', 'Fort Lauderdale (FLL)', 'Panamá (PTY)', 'San Juan (SJU)', 'Orlando (MCO)'],
    destinationsByContinent: [
      { region: 'Norteamérica', destinations: ['New York (JFK/EWR)', 'Boston (BOS)', 'Miami (MIA)', 'Fort Lauderdale (FLL)', 'Orlando (MCO)'] },
      { region: 'Caribe y Centroamérica', destinations: ['San Juan (SJU)', 'Panamá Tocumen (PTY)', 'St. Maarten (SXM)', 'Curazao (CUR)'] },
      { region: 'Sudamérica', destinations: ['Bogotá (BOG - vía Conexión PTY)'] }
    ],
    vipLounges: [
      { name: 'Sala VIP Cibao Lounge', location: 'Terminal Internacional, Salidas segundo nivel', access: 'Priority Pass, Mastercard Black, Visa Infinite, Day Pass', highlight: 'Salas de descanso ejecutivas, refrigerios premium, Wi-Fi de alta velocidad y vista a plataforma.' }
    ],
    services: [
      { name: 'Sala VIP Cibao Lounge', description: 'Atención personalizada, barra de cafés dominicanos y bocadillos gourmet.' },
      { name: 'Tienda Duty Free & Souvenirs', description: 'Artesanías del Cibao, puros de Tamboril y rones dominicanos libres de impuestos.' },
      { name: 'Wi-Fi Gratuito', description: 'Internet de alta velocidad en salas de abordaje y áreas comunes.' },
      { name: 'Estacionamiento Inteligente', description: 'Parking pavimentado con vigilancia 24 horas y acceso directo a la terminal.' },
      { name: 'Cajeros & Cambio Oficial', description: 'Bancos comerciales dominicanos y cajeros automáticos multimoneda.' },
      { name: 'Restaurantes y Cafés Típicos', description: 'Opciones gastronómicas locales e internacionales antes y después de seguridad.' },
    ],
    transportation: [
      { name: 'Taxi Oficial Cibao', detail: 'Tarifas reguladas fijas hacia Santiago centro y municipios', price: 'US$ 20-30' },
      { name: 'Rent a Car Oficial', detail: 'Hertz, Budget, Avis, Europcar y National dentro del hall de llegadas' },
      { name: 'Uber / DiDi Disponible', detail: 'Servicio por app con punto de encuentro frente a llegadas' },
      { name: 'Transporte a Jarabacoa / Constanza', detail: 'Taxis y transfers privados hacia el turismo de montaña', price: 'US$ 45-70' },
    ],
    nearbyDestinations: [
      { name: 'Santiago Centro (Monumento)', distance: '18 min', slug: 'santiago' },
      { name: 'Jarabacoa (Ecoturismo)', distance: '55 min', slug: 'jarabacoa' },
      { name: 'Constanza (Valle Nuevo)', distance: '1.4 horas', slug: 'constanza' },
      { name: 'Puerto Plata', distance: '1.2 horas', slug: 'puerto-plata' },
    ],
    phone: '+1 809-233-8000',
    website: 'https://aeropuertocibao.com.do',
    rating: 4.5,
    reviewCount: 4800,
    isPopular: true
  },
  {
    id: 'pop',
    slug: 'aeropuerto-internacional-gregorio-luperon',
    aliases: ['gregorio-luperon', 'gregorio-luperon-pop', 'pop', 'aeropuerto-gregorio-luperon', 'puerto-plata'],
    name: 'Aeropuerto Internacional Gregorio Luperón',
    code: 'POP',
    icao: 'MDPP',
    city: 'Puerto Plata',
    provinceId: 'puerto-plata',
    provinceName: 'Puerto Plata',
    type: 'internacional',
    operator: 'AERODOM (VINCI Airports)',
    passengersAnnual: '> 880,000 pasajeros / año (Crecimiento +19%)',
    runwayLength: '3,081 m (10,108 ft) · Asfalto para fuselaje ancho',
    elevation: '5 m (16 ft) MSL',
    highlights: ['Costa del Ámbar & Surf', 'Chárters de Europa & Canadá', 'Acceso Rápido a Cabarete & Sosúa', 'Vistas al Atlántico y Loma Isabel de Torres'],
    shortDescription: 'Aeropuerto de la Costa del Ámbar, puerta a playas del Atlántico, deportes acuáticos y turismo de aventura.',
    description: 'El Aeropuerto Internacional Gregorio Luperón (POP) sirve a Puerto Plata y toda la costa norte dominicana. Administrado por AERODOM/VINCI Airports, es el punto neurálgico de acceso a destinos de kitesurf y windsurf de clase mundial como Cabarete, las playas doradas de Sosúa, y el puerto de cruceros Amber Cove.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&h=800&fit=crop&q=80'
    ],
    coordinates: { lat: 19.7579, lng: -70.5700 },
    airlinesDetailed: [
      { name: 'American Airlines', code: 'AAL', website: 'https://www.aa.com/', terminal: 'Terminal Principal' },
      { name: 'United Airlines', code: 'UAL', website: 'https://www.united.com/', terminal: 'Terminal Principal' },
      { name: 'JetBlue Airways', code: 'JBU', website: 'https://www.jetblue.com/', terminal: 'Terminal Principal' },
      { name: 'Air Canada', code: 'ACA', website: 'https://www.aircanada.com/', terminal: 'Terminal Principal' },
      { name: 'WestJet', code: 'WJA', website: 'https://www.westjet.com/', terminal: 'Terminal Principal' },
      { name: 'Condor', code: 'CFG', website: 'https://www.condor.com/', terminal: 'Terminal Principal' },
      { name: 'TUI Airways', code: 'TOM', website: 'https://www.tui.co.uk/', terminal: 'Terminal Principal' },
      { name: 'Air Transat', code: 'TSC', website: 'https://www.airtransat.com/', terminal: 'Terminal Principal' }
    ],
    destinations: ['Miami (MIA)', 'New York (JFK)', 'Boston (BOS)', 'Toronto (YYZ)', 'Montreal (YUL)', 'Frankfurt (FRA)', 'Zúrich (ZRH)', 'Düsseldorf (DUS)'],
    destinationsByContinent: [
      { region: 'Norteamérica', destinations: ['Miami (MIA)', 'New York (JFK)', 'Boston (BOS)', 'Toronto (YYZ)', 'Montreal (YUL)'] },
      { region: 'Europa', destinations: ['Frankfurt (FRA)', 'Zúrich (ZRH)', 'Düsseldorf (DUS)', 'Bruselas (BRU)', 'Londres (LGW)'] }
    ],
    vipLounges: [
      { name: 'Sala VIP Gregorio Luperón', location: 'Salidas Internacionales, Nivel 2', access: 'Priority Pass, LoungeKey, DragonPass', highlight: 'Ambiente climatizado con vista al monte Isabel de Torres, snacks y bar de bebidas selectas.' }
    ],
    services: [
      { name: 'Sala VIP Aerodom', description: 'Lounge ejecutivo con Wi-Fi, bar de cócteles y estaciones de trabajo.' },
      { name: 'Duty Free Costa Norte', description: 'Tiendas libres de impuestos especializadas en joyería de larimar y ámbar auténtico.' },
      { name: 'Wi-Fi Gratuito', description: 'Internet ilimitado en todas las salas de espera de la terminal.' },
      { name: 'Mostrador Oficial MITUR', description: 'Centro de información turística y asistencia de POLITUR 24/7.' },
      { name: 'Cambio de Divisas & ATM', description: 'Casas de cambio y cajeros de la red local e internacional.' },
      { name: 'Café & Gastronomía Típica', description: 'Restaurantes con especialidades locales de pescado, café tostado y jugos tropicales.' },
    ],
    transportation: [
      { name: 'Taxi Oficial Turístico', detail: 'Tarifas fijas a Sosúa, Cabarete y Playa Dorada', price: 'US$ 25-40' },
      { name: 'Shuttle a Hoteles', detail: 'Traslados coordinados por operadores receptivos de la costa norte' },
      { name: 'Rent a Car en Terminal', detail: 'Agencias oficiales de alquiler de vehículos 4x4 y sedán' },
      { name: 'Guaguas / Transporte Local', detail: 'Conexión sobre la carretera Puerto Plata - Río San Juan', price: 'RD$ 100-150' },
    ],
    nearbyDestinations: [
      { name: 'Sosúa (Playas & Buceo)', distance: '12 min', slug: 'sosua' },
      { name: 'Cabarete (Capital del Kitesurf)', distance: '22 min', slug: 'cabarete' },
      { name: 'Puerto Plata Centro & Teleférico', distance: '20 min', slug: 'puerto-plata' },
      { name: 'Playa Dorada Resort Complex', distance: '15 min', slug: 'playa-dorada' },
    ],
    phone: '+1 809-291-0000',
    website: 'https://aerodom.com',
    rating: 4.3,
    reviewCount: 3900,
    isPopular: true
  },
  {
    id: 'lrm',
    slug: 'aeropuerto-internacional-de-la-romana',
    aliases: ['la-romana', 'la-romana-lrm', 'lrm', 'aeropuerto-la-romana', 'casa-de-campo'],
    name: 'Aeropuerto Internacional de La Romana',
    code: 'LRM',
    icao: 'MDLR',
    city: 'La Romana',
    provinceId: 'la-romana',
    provinceName: 'La Romana',
    type: 'internacional',
    operator: 'Central Romana Corporation',
    passengersAnnual: '> 350,000 pasajeros / año',
    runwayLength: '2,949 m (9,675 ft) · Asfalto',
    elevation: '73 m (240 ft) MSL',
    highlights: ['Diseño de Ingenio Azucarero', 'Conexión Directa Casa de Campo & Cruceros', 'Líder en Aviación Ejecutiva Privada', 'Acceso Rápido Bayahíbe'],
    shortDescription: 'Aeropuerto del este que sirve a Casa de Campo Resort, Bayahíbe y la terminal de cruceros.',
    description: 'El Aeropuerto Internacional de La Romana (LRM), conocido como "The Sweetest in the Caribbean" por su arquitectura inspirada en los tradicionales ingenios azucareros, está ubicado a solo 10 minutos del exclusivo complejo Casa de Campo Resort & Villas. Es una pieza clave para el turismo de alta gama, golf de nivel mundial (Teeth of the Dog), cruceros internacionales y aviación ejecutiva privada.',
    imageUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&h=800&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1200&h=800&fit=crop&q=80'
    ],
    coordinates: { lat: 18.4507, lng: -68.9118 },
    terminals: ['Terminal Comercial Internacional', 'Terminal de Aviación Privada / FBO Premier'],
    airlines: ['American Airlines', 'Neos', 'Air Transat', 'World2Fly', 'TUI', 'Chárters Privados Corporativos'],
    airlinesDetailed: [
      { name: 'American Airlines', code: 'AAL', website: 'https://www.aa.com/', terminal: 'Terminal Comercial' },
      { name: 'Neos', code: 'NOS', website: 'https://www.neosair.it/', terminal: 'Vuelos Italia / Europa' },
      { name: 'Air Transat', code: 'TSC', website: 'https://www.airtransat.com/', terminal: 'Vuelos Canadá' },
      { name: 'World2Fly', code: 'WFL', website: 'https://www.w2fly.es/', terminal: 'Vuelos España / Madrid' },
      { name: 'Condor', code: 'CFG', website: 'https://www.condor.com/', terminal: 'Vuelos Alemania' },
      { name: 'Sunwing Airlines', code: 'SWG', website: 'https://www.sunwing.ca/', terminal: 'Chárter Caribe' },
      { name: 'FBO Casa de Campo', code: 'FBO', website: 'https://aeropuertolaromana.com/', terminal: 'Aviación Ejecutiva & Jets Privados' }
    ],
    destinations: ['Miami (MIA)', 'Milán (MXP)', 'Roma (FCO)', 'Montreal (YUL)', 'Toronto (YYZ)', 'Madrid (MAD)', 'Frankfurt (FRA)'],
    destinationsByContinent: [
      { region: 'Norteamérica', destinations: ['Miami (MIA)', 'Montreal (YUL)', 'Toronto (YYZ)', 'Quebec City (YQB)'] },
      { region: 'Europa', destinations: ['Milán Malpensa (MXP)', 'Roma Fiumicino (FCO)', 'Madrid Barajas (MAD)', 'Frankfurt (FRA)'] },
      { region: 'Caribe', destinations: ['San Juan (SJU)', 'Santo Domingo (JBQ)'] }
    ],
    vipLounges: [
      { name: 'Premier Lounge Casa de Campo', location: 'Terminal Comercial & FBO', access: 'Huéspedes VIP Casa de Campo, Priority Pass, First/Business Class', highlight: 'Servicio de concierge personalizado, traslados en carritos de golf VIP y barra libre de alta gama.' }
    ],
    services: [
      { name: 'Premier VIP Lounge Casa de Campo', description: 'Recepción exclusiva con asistencia de equipaje rápida, traslados y bar premium.' },
      { name: 'Duty Free Central Romana', description: 'Selección de puros dominicanos hechos a mano, chocolates orgánicos y moda.' },
      { name: 'FBO Aviación Ejecutiva 24/7', description: 'Servicios de hangares, combustible y migración express para aeronaves privadas.' },
      { name: 'Wi-Fi de Alta Velocidad', description: 'Conexión a internet gratuita en salas de abordaje y salón VIP.' },
      { name: 'Solárium al Aire Libre', description: 'Terraza ajardinada tropical para disfrutar del sol caribeño antes del vuelo.' },
      { name: 'Bancos & Cambio Oficial', description: 'Cajeros automáticos y punto de cambio certificado para viajeros internacionales.' }
    ],
    transportation: [
      { name: 'Traslado Oficial Casa de Campo', detail: 'Servicio privado exclusivo directo a las villas del resort', price: 'Incluido en paquetes' },
      { name: 'Taxi Oficial de La Romana', detail: 'Traslados a Bayahíbe, Dominicus y La Romana centro', price: 'US$ 25-35' },
      { name: 'Rent a Car Autorizado', detail: 'Vehículos de gama alta y compactos con mostrador en llegadas' },
      { name: 'Conexión Puerto de Cruceros', detail: 'Logística exprés de equipaje aeropuerto-puerto de cruceros' },
    ],
    nearbyDestinations: [
      { name: 'Casa de Campo Resort & Villas', distance: '10 min', slug: 'la-romana' },
      { name: 'Bayahíbe & Salida a Isla Saona', distance: '22 min', slug: 'bayahibe' },
      { name: 'Altos de Chavón', distance: '12 min', slug: 'altos-de-chavon' },
      { name: 'La Romana Centro', distance: '15 min', slug: 'la-romana' },
    ],
    phone: '+1 809-813-9000',
    website: 'https://aeropuertolaromana.com',
    rating: 4.6,
    reviewCount: 2200,
    isPopular: true
  },
  {
    id: 'azs',
    slug: 'aeropuerto-internacional-presidente-juan-bosch',
    aliases: ['el-catey', 'azs', 'juan-bosch', 'juan-bosch-azs', 'samana-el-catey', 'samana'],
    name: 'Aeropuerto Internacional Presidente Juan Bosch',
    code: 'AZS',
    icao: 'MDCY',
    city: 'Samaná',
    provinceId: 'samana',
    provinceName: 'Samaná',
    type: 'internacional',
    operator: 'AERODOM (VINCI Airports)',
    passengersAnnual: '> 85,000 pasajeros / año',
    runwayLength: '3,000 m (9,842 ft) · Asfalto de fuselaje ancho',
    elevation: '9 m (30 ft) MSL',
    highlights: ['Santuario Ballenas Jorobadas', 'Puerta a Las Terrenas & Las Galeras', 'Chárters Europa & Canadá', 'Naturaleza Virgen'],
    shortDescription: 'Aeropuerto de Samaná, puerta a las ballenas jorobadas, Las Terrenas y playas vírgenes.',
    description: 'El Aeropuerto Internacional Presidente Juan Bosch (AZS), popularmente conocido como El Catey, es la puerta de entrada por excelencia a la Península de Samaná. Administrado por AERODOM/VINCI Airports, cuenta con una pista de 3,000 metros capaz de acoger aeronaves transatlánticas de fuselaje ancho, conectando directamente con Canadá y Europa durante la temporada de avistamiento de ballenas jorobadas.',
    imageUrl: 'https://images.unsplash.com/photo-1512353087810-25dfcd100962?w=1200&h=800&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512353087810-25dfcd100962?w=1200&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop&q=80'
    ],
    coordinates: { lat: 19.2670, lng: -69.7420 },
    terminals: ['Terminal Internacional El Catey'],
    airlines: ['Air Canada', 'WestJet', 'Air Transat', 'Condor', 'TUI', 'Air Century'],
    airlinesDetailed: [
      { name: 'Air Canada', code: 'ACA', website: 'https://www.aircanada.com/', terminal: 'Terminal Principal' },
      { name: 'WestJet', code: 'WJA', website: 'https://www.westjet.com/', terminal: 'Terminal Principal' },
      { name: 'Air Transat', code: 'TSC', website: 'https://www.airtransat.com/', terminal: 'Terminal Principal' },
      { name: 'Condor', code: 'CFG', website: 'https://www.condor.com/', terminal: 'Terminal Principal (Vuelos Europa)' },
      { name: 'TUI Airways', code: 'TOM', website: 'https://www.tui.co.uk/', terminal: 'Terminal Principal' },
      { name: 'Air Century', code: 'CEY', website: 'https://aircentury.com/', terminal: 'Conexión Doméstica / Caribe' }
    ],
    destinations: ['Toronto (YYZ)', 'Montreal (YUL)', 'Frankfurt (FRA)', 'Bruselas (BRU)', 'París (CDG)', 'Quebec City (YQB)'],
    destinationsByContinent: [
      { region: 'Norteamérica', destinations: ['Toronto Pearson (YYZ)', 'Montreal Trudeau (YUL)', 'Quebec City (YQB)', 'Ottawa (YOW)'] },
      { region: 'Europa', destinations: ['Frankfurt (FRA)', 'Bruselas (BRU)', 'París (CDG)'] },
      { region: 'Caribe', destinations: ['Santo Domingo (JBQ)', 'Punta Cana (PUJ)'] }
    ],
    vipLounges: [
      { name: 'Salón VIP Samaná', location: 'Terminal Principal, Salidas', access: 'Priority Pass, Pases de Operador', highlight: 'Ambiente tranquilo, cafés locales y vista a los palmerales que rodean la pista.' }
    ],
    services: [
      { name: 'Salón VIP Samaná', description: 'Espacio relajante con bebidas frías, Wi-Fi y bocadillos.' },
      { name: 'Información Turística MITUR & Ballenas', description: 'Oficina turística con mapas de excursiones y avistamiento de ballenas jorobadas.' },
      { name: 'Cafetería & Cocoteros Snack Bar', description: 'Comida fresca, café dominicano y dulces tradicionales de coco.' },
      { name: 'Wi-Fi en Terminal Aerodom', description: 'Internet de cortesía para todos los pasajeros en tránsito y salas de embarque.' },
      { name: 'Duty Free & Artesanías Locales', description: 'Tiendas libres de impuestos con artesanías de Samaná, larimar y ron dominicano.' },
      { name: 'Cambio de Divisas & Cajeros 24/7', description: 'Servicios financieros y cajeros automáticos multimoneda en el hall de llegadas.' },
    ],
    transportation: [
      { name: 'Taxi Oficial a Las Terrenas', detail: 'Traslado directo por el Boulevard Turístico del Atlántico', price: 'US$ 35-50' },
      { name: 'Shuttles Turísticos a Samaná', detail: 'Minibuses coordinados hacia Santa Bárbara de Samaná y Las Galeras', price: 'US$ 20-30' },
      { name: 'Rent a Car en Terminal', detail: 'Vehículos 4x4 y SUV ideales para recorrer las playas vírgenes de la península' },
      { name: 'Guaguas / Transporte Público El Catey', detail: 'Conexión sobre la carretera Sánchez - Nagua', price: 'RD$ 100-150' },
    ],
    nearbyDestinations: [
      { name: 'Las Terrenas (Playas & Gastronomía)', distance: '30 min', slug: 'las-terrenas' },
      { name: 'Santa Bárbara de Samaná', distance: '40 min', slug: 'samana' },
      { name: 'Las Galeras & Playa Rincón', distance: '1.1 horas', slug: 'las-galeras' },
      { name: 'Salto del Limón', distance: '45 min', slug: 'salto-del-limon' },
    ],
    phone: '+1 809-338-0042',
    website: 'https://aerodom.com',
    rating: 4.2,
    reviewCount: 1600,
    isPopular: true
  },
  {
    id: 'brx',
    slug: 'aeropuerto-internacional-maria-montez',
    aliases: ['maria-montez', 'maria-montez-brx', 'brx', 'barahona', 'aeropuerto-maria-montez'],
    name: 'Aeropuerto Internacional María Montez',
    code: 'BRX',
    icao: 'MDBH',
    city: 'Barahona',
    provinceId: 'barahona',
    provinceName: 'Barahona',
    type: 'internacional',
    operator: 'AERODOM (VINCI Airports)',
    passengersAnnual: '> 25,000 pasajeros / año',
    runwayLength: '3,000 m (9,842 ft) · Asfalto capaz de recibir aviones de fuselaje ancho',
    elevation: '3 m (10 ft) MSL',
    highlights: ['Puerta a Bahía de las Águilas', 'Enlace al Nuevo Polo de Pedernales', 'Reserva Biosfera Jaragua-Bahoruco-Enriquillo', 'Pista Transcontinental'],
    shortDescription: 'Aeropuerto del suroeste, puerta a Bahía de las Águilas, la Sierra de Bahoruco y el nuevo polo de Pedernales.',
    description: 'El Aeropuerto Internacional María Montez (BRX) es la infraestructura aérea estratégica del suroeste dominicano. Nombrado en memoria de la legendaria actriz dominicana de Hollywood, cuenta con una pista de 3,000 metros idónea para vuelos transcontinentales y vuelos chárter que enlazan con el nuevo polo turístico de Cabo Rojo, Pedernales y el Lago Enriquillo.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&h=800&fit=crop&q=80'
    ],
    coordinates: { lat: 18.2515, lng: -71.1204 },
    terminals: ['Terminal Principal María Montez', 'Plataforma FBO Aviación General'],
    airlines: ['Air Century', 'Sky Cana', 'Helidosa Aviation', 'Chárters Privados', 'Vuelos de Ecoturismo'],
    airlinesDetailed: [
      { name: 'Air Century', code: 'CEY', website: 'https://aircentury.com/', terminal: 'Terminal de Pasajeros' },
      { name: 'Sky Cana', code: 'SNA', website: 'https://skycana.com/', terminal: 'Chárters Ecoturísticos' },
      { name: 'Helidosa Aviation Group', code: 'HDA', website: 'https://helidosa.com/', terminal: 'Helipuerto & Vuelos Privados' },
      { name: 'Aviación General Aerodom', code: 'GEN', website: 'https://aerodom.com/', terminal: 'FBO Regional & Escuelas' }
    ],
    destinations: ['Santo Domingo (JBQ)', 'Pedernales (Cabo Rojo)', 'Punta Cana (PUJ)', 'Puerto Príncipe (PAP)', 'San Juan (SJU)'],
    destinationsByContinent: [
      { region: 'Nacional y Caribe', destinations: ['Santo Domingo (JBQ)', 'Pedernales (Cabo Rojo)', 'Punta Cana (PUJ)', 'Puerto Príncipe (PAP)'] },
      { region: 'Rutas Chárter', destinations: ['San Juan (SJU)', 'Curazao (CUR)'] }
    ],
    vipLounges: [
      { name: 'Sala Protocolar Turística Suroeste', location: 'Terminal Principal', access: 'Vuelos especiales y comitivas oficiales', highlight: 'Atención protocolar y coordinación directa de tours ecológicos.' }
    ],
    services: [
      { name: 'Sala Protocolar Turística Suroeste', description: 'Recepción protocolar para comitivas, tripulaciones y viajeros ecoturísticos.' },
      { name: 'Mostrador Ecoturístico MITUR', description: 'Punto de información y contacto con guías locales certificados del Sur.' },
      { name: 'Café Orgánico de Barahona', description: 'Área de descanso y degustación del café arábica cultivado en las montañas de Polo.' },
      { name: 'Wi-Fi en Terminal Aerodom', description: 'Conexión a internet gratuita en áreas de espera y vestíbulo central.' },
      { name: 'Estacionamiento Gratuito Vigilado', description: 'Zona de parking amplia con vigilancia continua 24 horas.' },
      { name: 'Asistencia Médica & POLITUR', description: 'Presencia permanente de la Policía de Turismo y primeros auxilios.' }
    ],
    transportation: [
      { name: 'Taxi Oficial a Barahona', detail: 'Traslado rápido a los hoteles del malecón y la costa', price: 'US$ 15-20' },
      { name: 'Transporte a Pedernales / Bahía de las Águilas', detail: 'Servicio de transfer 4x4 por la costa panorámica', price: 'US$ 60-90' },
      { name: 'Vehículos de Aventura 4x4', detail: 'Alquiler de jeeps y camionetas para explorar el Sur profundo' },
      { name: 'Transporte Público Interurbano', detail: 'Parada en cruce Barahona con microbuses hacia la capital', price: 'RD$ 75-100' },
    ],
    nearbyDestinations: [
      { name: 'Barahona Malecón & Hoteles', distance: '10 min', slug: 'barahona' },
      { name: 'San Rafael & Los Patos', distance: '35 min', slug: 'los-patos' },
      { name: 'Bahía de las Águilas (Cabo Rojo)', distance: '1.8 horas', slug: 'bahia-de-las-aguilas' },
      { name: 'Lago Enriquillo', distance: '1.2 horas', slug: 'lago-enriquillo' },
    ],
    phone: '+1 809-524-4144',
    website: 'https://aerodom.com',
    rating: 4.1,
    reviewCount: 650,
    isPopular: false
  },
  {
    id: 'jbq',
    slug: 'aeropuerto-internacional-dr-joaquin-balaguer',
    aliases: ['la-isabela', 'jbq', 'el-higuero', 'joaquin-balaguer', 'dr-joaquin-balaguer', 'aeropuerto-joaquin-balaguer'],
    name: 'Aeropuerto Internacional Dr. Joaquín Balaguer',
    code: 'JBQ',
    icao: 'MDJB',
    city: 'Santo Domingo Norte',
    provinceId: 'santo-domingo',
    provinceName: 'Santo Domingo',
    type: 'internacional',
    operator: 'AERODOM (VINCI Airports)',
    passengersAnnual: '> 120,000 pasajeros / año',
    runwayLength: '1,650 m (5,413 ft) · Asfalto de alta resistencia',
    elevation: '32 m (105 ft) MSL',
    highlights: ['Epicentro FBO Aviación Corporativa', 'Despacho Aduanal y Migratorio Express', 'Vuelos Regulares a Haití y el Caribe', 'Ubicación Estratégica Norte Capital'],
    shortDescription: 'Aeropuerto internacional de Santo Domingo Norte (La Isabela / El Higüero) para vuelos ejecutivos, aviación corporativa y conexiones regionales.',
    description: 'El Aeropuerto Internacional Dr. Joaquín Balaguer (JBQ), popularmente conocido como La Isabela o El Higüero, es el centro neurálgico de la aviación corporativa, privada y regional de la República Dominicana. Operado por AERODOM/VINCI Airports, cuenta con instalaciones aduanales y migratorias 24/7 de procesamiento ágil para jets privados, escuelas de aviación y vuelos comerciales ligeros a las islas del Caribe.',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&h=800&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1200&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&h=800&fit=crop&q=80'
    ],
    coordinates: { lat: 18.5725, lng: -69.9856 },
    terminals: ['Terminal Internacional de Pasajeros', 'FBO Ejecutivo Aerodom (Aviación Privada)', 'Hangares Corporativos'],
    airlines: ['Air Century', 'Sunrise Airways', 'Sky Cana', 'Aerolíneas Mas', 'Helidosa Aviation Group', 'Aviación Corporativa & Privada'],
    airlinesDetailed: [
      { name: 'Air Century', code: 'CEY', website: 'https://aircentury.com/', terminal: 'Terminal Principal (Hub Comercial)', isHub: true },
      { name: 'Sunrise Airways', code: 'KSZ', website: 'https://www.sunriseairways.net/', terminal: 'Terminal Internacional' },
      { name: 'Sky Cana', code: 'SNA', website: 'https://skycana.com/', terminal: 'Hangar Corporativo' },
      { name: 'Aerolíneas Mas', code: 'MAS', website: 'https://aerodom.com/', terminal: 'Aviación Regional' },
      { name: 'Helidosa Aviation Group', code: 'HDA', website: 'https://helidosa.com/', terminal: 'Base Helipuerto' },
      { name: 'FBO Ejecutivo Aerodom', code: 'FBO', website: 'https://aerodom.com/', terminal: 'Terminal Ejecutiva & Jets Privados' }
    ],
    destinations: ['Puerto Príncipe (PAP)', 'Cap-Haïtien (CAP)', 'San Juan (SJU)', 'La Habana (HAV)', 'Santiago de Cuba (SCU)', 'Aruba (AUA)', 'Curazao (CUR)', 'Sint Maarten (SXM)', 'Barahona (BRX)', 'Punta Cana (PUJ)'],
    destinationsByContinent: [
      { region: 'Caribe & Antillas', destinations: ['Puerto Príncipe (PAP)', 'Cap-Haïtien (CAP)', 'San Juan (SJU)', 'La Habana (HAV)', 'Santiago de Cuba (SCU)', 'Aruba (AUA)', 'Curazao (CUR)', 'Sint Maarten (SXM)'] },
      { region: 'Destinos Nacionales', destinations: ['Barahona (BRX)', 'Punta Cana (PUJ)', 'Santiago (STI)', 'Montecristi (MTC)'] }
    ],
    vipLounges: [
      { name: 'Executive FBO Suite & VIP Club', location: 'Edificio FBO Aerodom', access: 'Pilotos y pasajeros de aviación corporativa y privada', highlight: 'Salas de reuniones ejecutivas, despacho migratorio privado y catering exclusivo.' }
    ],
    services: [
      { name: 'Executive FBO Suite & VIP Club', description: 'Atención personalizada para aviación privada, pilotos y tripulaciones.' },
      { name: 'Migración & Aduana Express 24/7', description: 'Trámite aduanal y migratorio ágil e individualizado para vuelos corporativos.' },
      { name: 'Helipuerto Corporativo & Hangares', description: 'Base moderna con servicios integrales de combustible Jet-A1/AvGas y mantenimiento.' },
      { name: 'Wi-Fi de Alta Velocidad Aerodom', description: 'Internet simétrico gratuito para operaciones aéreas y pasajeros ejecutivos.' },
      { name: 'Café Ejecutivo & Lounge de Espera', description: 'Área climatizada con bebidas, aperitivos finos y sala de descanso.' },
      { name: 'Estacionamiento Privado Vigilado', description: 'Parqueo vigilado y controlado para usuarios de aviación privada y ejecutiva.' }
    ],
    transportation: [
      { name: 'Taxi Ejecutivo a Santo Domingo', detail: 'Conexión rápida con la zona norte, Arroyo Hondo y Polígono Central', price: 'US$ 20-30' },
      { name: 'Uber / DiDi Inmediato', detail: 'Recogida rápida por app móvil directamente en la puerta de la terminal', price: 'RD$ 600-900' },
      { name: 'Servicio de Helitransporte Privado', detail: 'Conexión punto a punto en helicóptero hacia resorts del este o norte' },
      { name: 'Renta de Autos Ejecutiva', detail: 'Vehículos blindados y ejecutivos con chofer previa reservación' },
    ],
    nearbyDestinations: [
      { name: 'Polígono Central (Piantini / Naco)', distance: '22 min', slug: 'santo-domingo' },
      { name: 'Jardín Botánico Nacional', distance: '15 min', slug: 'santo-domingo' },
      { name: 'Zona Colonial', distance: '28 min', slug: 'zona-colonial' },
    ],
    phone: '+1 809-826-4003',
    website: 'https://aerodom.com',
    rating: 4.4,
    reviewCount: 1100,
    isPopular: false
  }
];

export function getAirportBySlug(slug: string): Airport | undefined {
  if (!slug) return undefined;
  const clean = slug
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  return airports.find(a => {
    const aSlug = a.slug
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    if (aSlug === clean) return true;
    if (a.code.toLowerCase() === clean) return true;
    if (a.id.toLowerCase() === clean) return true;
    if (a.aliases?.some(alias => {
      const aliasClean = alias
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      return aliasClean === clean;
    })) return true;
    return false;
  });
}

export function getAirportByCode(code: string): Airport | undefined {
  if (!code) return undefined;
  const clean = code.toLowerCase().trim();
  return airports.find(a => a.code.toLowerCase() === clean || a.id.toLowerCase() === clean);
}
