// Datos estáticos de aeropuertos de República Dominicana

export interface Airport {
  id: string;
  slug: string;
  name: string;
  code: string; // IATA
  icao: string;
  city: string;
  provinceId: string;
  provinceName: string;
  type: 'internacional' | 'domestico';
  shortDescription: string;
  description: string;
  imageUrl: string;
  gallery: string[];
  coordinates: { lat: number; lng: number };
  terminals: string[];
  airlines: string[];
  destinations: string[];
  services: { name: string; description: string }[];
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
    slug: 'punta-cana',
    name: 'Aeropuerto Internacional de Punta Cana',
    code: 'PUJ',
    icao: 'MDPC',
    city: 'Punta Cana',
    provinceId: 'la-altagracia',
    provinceName: 'La Altagracia',
    type: 'internacional',
    shortDescription: 'El aeropuerto más transitado del Caribe y principal puerta de entrada turística del país.',
    description: 'El Aeropuerto Internacional de Punta Cana (PUJ) es el aeropuerto privado más transitado del mundo y el de mayor tráfico en el Caribe. Inaugurado en 1984 por el Grupo Puntacana, recibe más de 8 millones de pasajeros anuales procedentes de América, Europa y otras regiones. Su diseño de terminal abierta con techos de cana (palma) es icónico y ofrece una bienvenida tropical inmediata. Cuenta con modernas instalaciones duty-free, salones VIP y conexión directa con los principales resorts de la zona este.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    coordinates: { lat: 18.5674, lng: -68.3634 },
    terminals: ['Terminal A', 'Terminal B'],
    airlines: ['American Airlines', 'Delta', 'JetBlue', 'United', 'Air Canada', 'Air France', 'Iberia', 'Condor', 'TUI', 'Copa Airlines', 'Avianca', 'Spirit', 'Frontier', 'WestJet', 'Edelweiss', 'Eurowings'],
    destinations: ['Miami', 'New York', 'Toronto', 'Madrid', 'París', 'Frankfurt', 'Londres', 'Bogotá', 'Panamá', 'San Juan'],
    services: [
      { name: 'Salones VIP', description: 'VIP Lounge con Wi-Fi, bar y snacks premium en ambas terminales.' },
      { name: 'Duty Free', description: 'Tiendas libres de impuestos con ron, cigarro, chocolate y souvenirs.' },
      { name: 'Wi-Fi Gratuito', description: 'Conexión de alta velocidad en todas las áreas del aeropuerto.' },
      { name: 'Cambio de Divisas', description: 'Casas de cambio y cajeros ATM en ambas terminales.' },
      { name: 'Asistencia Médica', description: 'Clínica de primeros auxilios 24/7.' },
      { name: 'Estacionamiento', description: 'Parking de corta y larga estancia con seguridad 24 horas.' },
    ],
    transportation: [
      { name: 'Taxi Oficial', detail: 'Servicio regulado con tarifas fijas a hoteles', price: 'US$ 25-50' },
      { name: 'Shuttle de Hotel', detail: 'La mayoría de resorts ofrecen traslado incluido' },
      { name: 'Rent a Car', detail: 'Hertz, Avis, Budget, National, Enterprise disponibles' },
      { name: 'Autobús Expreso', detail: 'Conexión a Higüey y Santo Domingo', price: 'US$ 5-15' },
    ],
    nearbyDestinations: [
      { name: 'Punta Cana', distance: '10 min', slug: 'punta-cana' },
      { name: 'Bávaro', distance: '20 min', slug: 'bavaro' },
      { name: 'Cap Cana', distance: '15 min', slug: 'cap-cana' },
      { name: 'Higüey', distance: '30 min', slug: 'higuey' },
    ],
    phone: '+1 809-959-2376',
    website: 'https://puntacanainternationalairport.com',
    rating: 4.5,
    reviewCount: 12500,
    isPopular: true,
    isFeatured: true
  },
  {
    id: 'sdq',
    slug: 'las-americas',
    name: 'Aeropuerto Internacional Las Américas',
    code: 'SDQ',
    icao: 'MDSD',
    city: 'Santo Domingo',
    provinceId: 'santo-domingo',
    provinceName: 'Santo Domingo',
    type: 'internacional',
    shortDescription: 'Principal aeropuerto de la capital, nombrado en honor a José Francisco Peña Gómez.',
    description: 'El Aeropuerto Internacional Las Américas Dr. José Francisco Peña Gómez (SDQ) es el principal aeropuerto de Santo Domingo y el segundo más transitado del país. Ubicado a 22 km del centro de la capital, sirve como hub principal para conexiones domésticas e internacionales. Recibe más de 4 millones de pasajeros anuales y conecta la capital con las principales ciudades de América, Europa y el Caribe.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    coordinates: { lat: 18.4297, lng: -69.6689 },
    terminals: ['Terminal 1', 'Terminal 2'],
    airlines: ['American Airlines', 'Delta', 'JetBlue', 'United', 'Copa Airlines', 'Avianca', 'Spirit', 'Arajet', 'Air Century', 'Iberia', 'Air Europa', 'LATAM'],
    destinations: ['Miami', 'New York', 'Bogotá', 'Madrid', 'Panamá', 'San Juan', 'Curazao', 'Medellín', 'Lima'],
    services: [
      { name: 'Salones VIP', description: 'Global Lounge y VIP Lounge en Terminal 1.' },
      { name: 'Duty Free', description: 'Amplia zona comercial con marcas internacionales.' },
      { name: 'Wi-Fi', description: 'Conexión gratuita en todas las áreas.' },
      { name: 'Cambio de Divisas', description: 'Bancos y cajeros automáticos.' },
      { name: 'Food Court', description: 'Restaurantes y cafeterías nacionales e internacionales.' },
      { name: 'Farmacia', description: 'Farmacia 24 horas en el área de llegadas.' },
    ],
    transportation: [
      { name: 'Taxi', detail: 'Servicio de taxi oficial a Santo Domingo', price: 'US$ 35-40' },
      { name: 'Uber/DiDi', detail: 'Servicios de transporte por aplicación disponibles' },
      { name: 'Rent a Car', detail: 'Múltiples agencias de alquiler de vehículos' },
      { name: 'Metro/Bus', detail: 'Conexión por autobús al Metro de Santo Domingo', price: 'RD$ 50' },
    ],
    nearbyDestinations: [
      { name: 'Santo Domingo', distance: '25 min', slug: 'santo-domingo' },
      { name: 'Zona Colonial', distance: '30 min', slug: 'zona-colonial' },
      { name: 'Boca Chica', distance: '10 min', slug: 'boca-chica' },
      { name: 'Juan Dolio', distance: '25 min', slug: 'juan-dolio' },
    ],
    phone: '+1 809-947-2225',
    website: 'https://aerodom.com',
    rating: 3.9,
    reviewCount: 8200,
    isPopular: true,
    isFeatured: true
  },
  {
    id: 'sti',
    slug: 'cibao',
    name: 'Aeropuerto Internacional del Cibao',
    code: 'STI',
    icao: 'MDST',
    city: 'Santiago',
    provinceId: 'santiago',
    provinceName: 'Santiago',
    type: 'internacional',
    shortDescription: 'Principal aeropuerto del norte, sirve a Santiago y la región del Cibao.',
    description: 'El Aeropuerto Internacional del Cibao (STI) es la puerta de entrada a la segunda ciudad más grande de República Dominicana y toda la región del Cibao. Inaugurado en 2002, cuenta con modernas instalaciones y conecta Santiago con destinos en Estados Unidos, Panamá y el Caribe. Es un aeropuerto en crecimiento que sirve tanto a viajeros de negocios como turistas que visitan la Cordillera Central.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    coordinates: { lat: 19.4061, lng: -70.6047 },
    terminals: ['Terminal Principal'],
    airlines: ['JetBlue', 'Spirit', 'United', 'Copa Airlines', 'Arajet', 'Air Century'],
    destinations: ['New York (JFK)', 'Miami', 'Fort Lauderdale', 'Panamá', 'San Juan'],
    services: [
      { name: 'Duty Free', description: 'Tienda libre de impuestos con productos locales.' },
      { name: 'Cafetería', description: 'Área de comidas con opciones locales.' },
      { name: 'Wi-Fi', description: 'Internet gratuito en la terminal.' },
      { name: 'Estacionamiento', description: 'Parking amplio con seguridad.' },
    ],
    transportation: [
      { name: 'Taxi', detail: 'Servicio de taxi a Santiago centro', price: 'US$ 20-30' },
      { name: 'Rent a Car', detail: 'Agencias disponibles en la terminal' },
    ],
    nearbyDestinations: [
      { name: 'Santiago', distance: '20 min', slug: 'santiago' },
      { name: 'Jarabacoa', distance: '1 hora', slug: 'jarabacoa' },
      { name: 'Constanza', distance: '1.5 horas', slug: 'constanza' },
      { name: 'Puerto Plata', distance: '1.5 horas', slug: 'puerto-plata' },
    ],
    phone: '+1 809-233-8000',
    website: 'https://aeropuertocibao.com.do',
    rating: 4.2,
    reviewCount: 3500,
    isPopular: true
  },
  {
    id: 'pop',
    slug: 'gregorio-luperon',
    name: 'Aeropuerto Internacional Gregorio Luperón',
    code: 'POP',
    icao: 'MDPP',
    city: 'Puerto Plata',
    provinceId: 'puerto-plata',
    provinceName: 'Puerto Plata',
    type: 'internacional',
    shortDescription: 'Aeropuerto de la Costa del Ámbar, puerta a playas del Atlántico y deportes acuáticos.',
    description: 'El Aeropuerto Internacional Gregorio Luperón (POP) sirve a Puerto Plata y toda la costa norte dominicana. Es la puerta de entrada a destinos de surf como Cabarete, el teleférico de Isabel de Torres y las playas doradas del Atlántico. Recibe vuelos directos desde Norteamérica y Europa, especialmente turismo de aventura y deportes acuáticos.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    coordinates: { lat: 19.7579, lng: -70.5700 },
    terminals: ['Terminal Principal'],
    airlines: ['JetBlue', 'Spirit', 'United', 'Air Canada', 'WestJet', 'Sunwing', 'Condor', 'TUI'],
    destinations: ['New York', 'Miami', 'Toronto', 'Montreal', 'Frankfurt', 'Düsseldorf'],
    services: [
      { name: 'Duty Free', description: 'Tiendas con ámbar, larimar y souvenirs.' },
      { name: 'Wi-Fi', description: 'Internet gratuito.' },
      { name: 'Cambio de Divisas', description: 'Casas de cambio disponibles.' },
      { name: 'Información Turística', description: 'Oficina del Ministerio de Turismo.' },
    ],
    transportation: [
      { name: 'Taxi', detail: 'A Puerto Plata, Sosúa o Cabarete', price: 'US$ 25-40' },
      { name: 'Shuttle', detail: 'Servicios de traslado a hoteles' },
      { name: 'Rent a Car', detail: 'Agencias de alquiler en la terminal' },
    ],
    nearbyDestinations: [
      { name: 'Puerto Plata', distance: '20 min', slug: 'puerto-plata' },
      { name: 'Sosúa', distance: '15 min', slug: 'sosua' },
      { name: 'Cabarete', distance: '25 min', slug: 'cabarete' },
    ],
    phone: '+1 809-291-0000',
    website: 'https://aerodom.com',
    rating: 3.8,
    reviewCount: 2800,
    isPopular: true
  },
  {
    id: 'lrm',
    slug: 'la-romana',
    name: 'Aeropuerto Internacional de La Romana',
    code: 'LRM',
    icao: 'MDLR',
    city: 'La Romana',
    provinceId: 'la-romana',
    provinceName: 'La Romana',
    type: 'internacional',
    shortDescription: 'Aeropuerto del este que sirve a Casa de Campo y Bayahíbe.',
    description: 'El Aeropuerto Internacional de La Romana (LRM) está ubicado junto al exclusivo resort Casa de Campo. Sirve principalmente a turistas que visitan La Romana, Bayahíbe e Isla Saona. Recibe vuelos charter y comerciales desde Norteamérica y Europa, con un servicio personalizado y eficiente.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg'],
    coordinates: { lat: 18.4507, lng: -68.9118 },
    terminals: ['Terminal Principal'],
    airlines: ['American Airlines', 'JetBlue', 'Air Canada', 'Charter privados'],
    destinations: ['Miami', 'New York', 'Toronto'],
    services: [
      { name: 'VIP Service', description: 'Servicio VIP personalizado de Casa de Campo.' },
      { name: 'Duty Free', description: 'Tienda con productos selectos.' },
      { name: 'Traslados', description: 'Conexión directa a Casa de Campo.' },
    ],
    transportation: [
      { name: 'Traslado Casa de Campo', detail: 'Servicio exclusivo del resort' },
      { name: 'Taxi', detail: 'A La Romana centro o Bayahíbe', price: 'US$ 20-35' },
      { name: 'Rent a Car', detail: 'Agencias disponibles' },
    ],
    nearbyDestinations: [
      { name: 'La Romana', distance: '10 min', slug: 'la-romana' },
      { name: 'Bayahíbe', distance: '25 min', slug: 'bayahibe' },
    ],
    phone: '+1 809-813-9000',
    website: 'https://aeropuertolaromana.com',
    rating: 4.3,
    reviewCount: 1500,
    isPopular: true
  },
  {
    id: 'azs',
    slug: 'el-catey',
    name: 'Aeropuerto Internacional El Catey',
    code: 'AZS',
    icao: 'MDCY',
    city: 'Samaná',
    provinceId: 'samana',
    provinceName: 'Samaná',
    type: 'internacional',
    shortDescription: 'Aeropuerto de Samaná, puerta a las ballenas jorobadas y playas vírgenes.',
    description: 'El Aeropuerto Internacional El Catey (AZS), también conocido como Aeropuerto Juan Bosch, es la puerta de entrada a la Península de Samaná. Desde aquí se accede a las playas vírgenes de Las Terrenas, Las Galeras y al avistamiento de ballenas jorobadas entre enero y marzo. El aeropuerto ha crecido significativamente con vuelos directos desde Europa y Canadá.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg'],
    coordinates: { lat: 19.2670, lng: -69.7420 },
    terminals: ['Terminal Principal'],
    airlines: ['Air Canada', 'WestJet', 'Condor', 'TUI', 'Evelop', 'Air Century'],
    destinations: ['Toronto', 'Montreal', 'Frankfurt', 'Bruselas', 'París'],
    services: [
      { name: 'Información Turística', description: 'Oficina de turismo de Samaná.' },
      { name: 'Cafetería', description: 'Área de comidas.' },
      { name: 'Wi-Fi', description: 'Internet disponible.' },
    ],
    transportation: [
      { name: 'Taxi', detail: 'A Las Terrenas o Samaná', price: 'US$ 30-50' },
      { name: 'Shuttle', detail: 'Servicios de traslado a hoteles' },
      { name: 'Rent a Car', detail: 'Disponible en la terminal' },
    ],
    nearbyDestinations: [
      { name: 'Las Terrenas', distance: '40 min', slug: 'las-terrenas' },
      { name: 'Samaná', distance: '45 min', slug: 'samana' },
      { name: 'Las Galeras', distance: '1 hora', slug: 'las-galeras' },
    ],
    phone: '+1 809-338-0042',
    website: 'https://aerodom.com',
    rating: 3.7,
    reviewCount: 1200,
    isPopular: true
  },
  {
    id: 'brx',
    slug: 'maria-montez',
    name: 'Aeropuerto Internacional María Montez',
    code: 'BRX',
    icao: 'MDBH',
    city: 'Barahona',
    provinceId: 'barahona',
    provinceName: 'Barahona',
    type: 'internacional',
    shortDescription: 'Aeropuerto del suroeste, puerta a Bahía de las Águilas y la Sierra de Bahoruco.',
    description: 'El Aeropuerto Internacional María Montez (BRX) sirve a la región suroeste de República Dominicana. Nombrado en honor a la famosa actriz dominicana, este aeropuerto es la puerta de entrada a Bahía de las Águilas, el Lago Enriquillo, la Sierra de Bahoruco y las playas vírgenes de Pedernales. Actualmente opera con vuelos domésticos y charter.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg'],
    coordinates: { lat: 18.2515, lng: -71.1204 },
    terminals: ['Terminal Principal'],
    airlines: ['Air Century', 'Charter privados'],
    destinations: ['Santo Domingo', 'Vuelos charter'],
    services: [
      { name: 'Información', description: 'Punto de información turística.' },
      { name: 'Estacionamiento', description: 'Parking disponible.' },
    ],
    transportation: [
      { name: 'Taxi', detail: 'A Barahona centro', price: 'US$ 10-15' },
      { name: 'Guagua', detail: 'Transporte público a Pedernales o Santo Domingo' },
    ],
    nearbyDestinations: [
      { name: 'Barahona', distance: '10 min', slug: 'barahona' },
      { name: 'Bahía de las Águilas', distance: '2 horas', slug: 'bahia-de-las-aguilas' },
      { name: 'Pedernales', distance: '2.5 horas', slug: 'pedernales' },
    ],
    phone: '+1 809-524-4144',
    website: 'https://aerodom.com',
    rating: 3.5,
    reviewCount: 400,
    isPopular: false
  },
  {
    id: 'jbq',
    slug: 'la-isabela',
    name: 'Aeropuerto La Isabela Dr. Joaquín Balaguer',
    code: 'JBQ',
    icao: 'MDJB',
    city: 'Santo Domingo Norte',
    provinceId: 'santo-domingo',
    provinceName: 'Santo Domingo',
    type: 'domestico',
    shortDescription: 'Aeropuerto doméstico de Santo Domingo para vuelos internos y privados.',
    description: 'El Aeropuerto La Isabela Dr. Joaquín Balaguer (JBQ) es el aeropuerto doméstico principal de la zona metropolitana de Santo Domingo. Ubicado al norte de la capital, sirve como hub para vuelos domésticos a Samaná, Puerto Plata y otros destinos internos, así como aviación privada y charter.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg'],
    coordinates: { lat: 18.5725, lng: -69.9856 },
    terminals: ['Terminal Doméstica', 'FBO Aviación Privada'],
    airlines: ['Air Century', 'Sky Cana', 'Aviación privada'],
    destinations: ['Puerto Plata', 'Samaná', 'Barahona', 'La Romana'],
    services: [
      { name: 'FBO', description: 'Servicios de aviación ejecutiva y privada.' },
      { name: 'Estacionamiento', description: 'Parking disponible.' },
      { name: 'Cafetería', description: 'Área de comidas.' },
    ],
    transportation: [
      { name: 'Taxi', detail: 'Al centro de Santo Domingo', price: 'US$ 15-20' },
      { name: 'Uber/DiDi', detail: 'Disponible por aplicación' },
    ],
    nearbyDestinations: [
      { name: 'Santo Domingo', distance: '20 min', slug: 'santo-domingo' },
      { name: 'Zona Colonial', distance: '25 min', slug: 'zona-colonial' },
    ],
    phone: '+1 809-826-4003',
    website: 'https://aerodom.com',
    rating: 3.6,
    reviewCount: 800,
    isPopular: false
  },
];

export function getAirportBySlug(slug: string): Airport | undefined {
  return airports.find(a => a.slug === slug);
}

export function getAirportByCode(code: string): Airport | undefined {
  return airports.find(a => a.code === code);
}
