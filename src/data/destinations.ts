// Datos estáticos de destinos turísticos de República Dominicana

export interface Destination {
  id: string;
  slug: string;
  name: string;
  province?: string;
  provinceSlug?: string;
  region: 'norte' | 'sur' | 'este' | 'santo-domingo';
  type: 'provincia' | 'destino' | 'municipio';
  categories: ('playa' | 'montaña' | 'ecoturismo' | 'cultura' | 'aventura' | 'rios' | 'ciudad' | 'lujo')[];
  shortDescription: string;
  description: string;
  imageUrl: string;
  gallery: string[];
  highlights: string[];
  bestTimeToVisit: string;
  howToGetThere: string;
  weatherInfo: string;
  typicalDishes: string[];
  latitude?: number;
  longitude?: number;
  isPopular?: boolean;
  isRecommended?: boolean;
  isFeatured?: boolean;
}

export const destinations: Destination[] = [
  // === PROVINCIAS ===
  {
    id: 'la-altagracia',
    slug: 'la-altagracia',
    name: 'La Altagracia',
    region: 'este',
    type: 'provincia',
    categories: ['playa', 'lujo', 'aventura'],
    shortDescription: 'La provincia más turística del Caribe, hogar de Punta Cana y Bávaro.',
    description: 'La Altagracia es la joya turística de República Dominicana, conocida mundialmente por sus playas de arena blanca y aguas cristalinas. Aquí se encuentran los destinos más exclusivos del Caribe, incluyendo Punta Cana, Bávaro y Cap Cana, con resorts de clase mundial, campos de golf de campeonato y una vibrante vida nocturna.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    highlights: ['Playas de arena blanca', 'Resorts todo incluido', 'Golf de clase mundial', 'Parques temáticos'],
    bestTimeToVisit: 'Diciembre a Abril',
    howToGetThere: 'Aeropuerto Internacional de Punta Cana (PUJ), el más transitado del Caribe.',
    weatherInfo: 'Clima tropical con temperaturas promedio de 26-32°C durante todo el año.',
    typicalDishes: ['Pescado con coco', 'Langosta a la criolla', 'Mofongo de mariscos'],
    latitude: 18.5825,
    longitude: -68.4055,
    isPopular: true,
    isFeatured: true
  },
  {
    id: 'samana',
    slug: 'samana',
    name: 'Samaná',
    region: 'norte',
    type: 'provincia',
    categories: ['playa', 'ecoturismo', 'aventura'],
    shortDescription: 'Paraíso ecológico con ballenas jorobadas, cascadas y playas vírgenes.',
    description: 'Samaná es un santuario natural que ofrece una experiencia única en el Caribe. Desde el avistamiento de ballenas jorobadas de enero a marzo, hasta las majestuosas cascadas de El Limón y las playas vírgenes de Las Terrenas, este destino cautiva a los amantes de la naturaleza y la aventura.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    highlights: ['Avistamiento de ballenas', 'Cascada El Limón', 'Parque Nacional Los Haitises', 'Playas vírgenes'],
    bestTimeToVisit: 'Enero a Marzo para ballenas, todo el año para playas',
    howToGetThere: 'Aeropuerto Internacional El Catey (AZS) o 2.5 horas desde Santo Domingo.',
    weatherInfo: 'Clima tropical húmedo, lluvias más frecuentes que en el este.',
    typicalDishes: ['Pescado con coco', 'Cangrejo guisado', 'Dulce de coco'],
    latitude: 19.2056,
    longitude: -69.3364,
    isPopular: true,
    isFeatured: true
  },
  {
    id: 'puerto-plata',
    slug: 'puerto-plata',
    name: 'Puerto Plata',
    region: 'norte',
    type: 'provincia',
    categories: ['playa', 'cultura', 'aventura'],
    shortDescription: 'La Costa del Ámbar con teleférico, fortaleza histórica y playas doradas.',
    description: 'Puerto Plata, conocida como la Costa del Ámbar, combina historia colonial, aventura y belleza natural. El teleférico al Pico Isabel de Torres, la Fortaleza San Felipe y las playas de Sosúa y Cabarete hacen de esta provincia un destino diverso y emocionante.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    highlights: ['Teleférico Pico Isabel de Torres', 'Fortaleza San Felipe', 'Museo del Ámbar', 'Kitesurf en Cabarete'],
    bestTimeToVisit: 'Diciembre a Abril',
    howToGetThere: 'Aeropuerto Internacional Gregorio Luperón (POP).',
    weatherInfo: 'Clima tropical con temperaturas de 24-30°C.',
    typicalDishes: ['Yaroa', 'Chivo liniero', 'Dulce de leche'],
    latitude: 19.7934,
    longitude: -70.6884,
    isPopular: true,
    isFeatured: true
  },
  {
    id: 'santo-domingo',
    slug: 'santo-domingo',
    name: 'Santo Domingo',
    region: 'santo-domingo',
    type: 'provincia',
    categories: ['cultura', 'ciudad'],
    shortDescription: 'La primera ciudad del Nuevo Mundo, patrimonio de la humanidad.',
    description: 'Santo Domingo, fundada en 1496, es la ciudad más antigua del Nuevo Mundo. La Zona Colonial, declarada Patrimonio de la Humanidad por la UNESCO, alberga tesoros históricos como la primera catedral, el primer hospital y la primera universidad de las Américas. Una metrópolis vibrante que combina historia, gastronomía y vida nocturna.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    highlights: ['Zona Colonial UNESCO', 'Alcázar de Colón', 'Malecón', 'Gastronomía de clase mundial'],
    bestTimeToVisit: 'Todo el año',
    howToGetThere: 'Aeropuerto Internacional Las Américas (SDQ).',
    weatherInfo: 'Clima tropical con temperaturas de 25-32°C.',
    typicalDishes: ['La Bandera', 'Sancocho', 'Mangú', 'Chimichurri'],
    latitude: 18.4861,
    longitude: -69.9312,
    isPopular: true,
    isFeatured: true
  },
  {
    id: 'la-romana',
    slug: 'la-romana',
    name: 'La Romana',
    region: 'este',
    type: 'provincia',
    categories: ['playa', 'lujo', 'cultura'],
    shortDescription: 'Hogar de Casa de Campo, el resort más exclusivo del Caribe.',
    description: 'La Romana es sinónimo de lujo y exclusividad en el Caribe. Casa de Campo, uno de los resorts más prestigiosos del mundo, ofrece campos de golf de campeonato, la marina más grande del Caribe y Altos de Chavón, una réplica de una villa mediterránea del siglo XVI con un anfiteatro espectacular.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    highlights: ['Casa de Campo Resort', 'Altos de Chavón', 'Isla Catalina', 'Teeth of the Dog Golf'],
    bestTimeToVisit: 'Diciembre a Abril',
    howToGetThere: 'Aeropuerto Internacional La Romana (LRM) o 1.5 horas desde Punta Cana.',
    weatherInfo: 'Clima tropical seco, ideal durante todo el año.',
    typicalDishes: ['Langosta al ajillo', 'Pescado al coco', 'Chicharrón de cerdo'],
    latitude: 18.4273,
    longitude: -68.9728,
    isPopular: true,
    isFeatured: true
  },
  {
    id: 'la-vega',
    slug: 'la-vega',
    name: 'La Vega',
    region: 'norte',
    type: 'provincia',
    categories: ['montaña', 'cultura', 'aventura'],
    shortDescription: 'El corazón del Cibao con el carnaval más famoso del país.',
    description: 'La Vega es conocida por tener el carnaval más espectacular de República Dominicana, con sus diablos cojuelos y máscaras elaboradas. También ofrece acceso a Jarabacoa y Constanza, los destinos de montaña más importantes del país.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    highlights: ['Carnaval de La Vega', 'Santo Cerro', 'Acceso a Jarabacoa', 'Cultura cibaeña'],
    bestTimeToVisit: 'Febrero para el carnaval',
    howToGetThere: '1.5 horas desde Santo Domingo por autopista.',
    weatherInfo: 'Clima templado en las montañas, más fresco que la costa.',
    typicalDishes: ['Chivo liniero', 'Locrio de pica pica', 'Habichuelas con dulce'],
    latitude: 19.2220,
    longitude: -70.5296,
    isPopular: false,
    isFeatured: true
  },
  {
    id: 'santiago',
    slug: 'santiago',
    name: 'Santiago',
    region: 'norte',
    type: 'provincia',
    categories: ['cultura', 'ciudad', 'montaña'],
    shortDescription: 'La Ciudad Corazón, capital cultural y económica del Cibao.',
    description: 'Santiago de los Caballeros es la segunda ciudad más importante de República Dominicana. Conocida como la Ciudad Corazón, es el centro cultural y económico de la región del Cibao, famosa por su producción de tabaco, ron y su vibrante escena artística y gastronómica.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    highlights: ['Monumento a los Héroes', 'Centro León', 'Fábricas de cigarros', 'Gastronomía cibaeña'],
    bestTimeToVisit: 'Todo el año',
    howToGetThere: 'Aeropuerto Internacional del Cibao (STI).',
    weatherInfo: 'Clima tropical con temperaturas de 22-30°C.',
    typicalDishes: ['Yaroa', 'Chivo liniero', 'Morir soñando'],
    latitude: 19.4517,
    longitude: -70.6970,
    isPopular: true,
    isFeatured: true
  },
  {
    id: 'pedernales',
    slug: 'pedernales',
    name: 'Pedernales',
    region: 'sur',
    type: 'provincia',
    categories: ['ecoturismo', 'playa', 'aventura'],
    shortDescription: 'El último paraíso virgen del Caribe con Bahía de las Águilas.',
    description: 'Pedernales es la frontera sur con Haití y hogar del tesoro natural más preciado del país: Bahía de las Águilas, una playa virgen de 8 kilómetros considerada una de las más hermosas del mundo. El Parque Nacional Jaragua protege ecosistemas únicos.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    highlights: ['Bahía de las Águilas', 'Parque Nacional Jaragua', 'Laguna de Oviedo', 'Hoyo de Pelempito'],
    bestTimeToVisit: 'Diciembre a Abril',
    howToGetThere: '5 horas desde Santo Domingo.',
    weatherInfo: 'Clima seco y cálido, zona más árida del país.',
    typicalDishes: ['Chivo guisado', 'Pescado frito', 'Casabe'],
    latitude: 18.0384,
    longitude: -71.7440,
    isPopular: false,
    isFeatured: true
  },
  {
    id: 'barahona',
    slug: 'barahona',
    name: 'Barahona',
    region: 'sur',
    type: 'provincia',
    categories: ['ecoturismo', 'playa', 'montaña'],
    shortDescription: 'Donde la montaña se encuentra con el mar en paisajes dramáticos.',
    description: 'Barahona ofrece algunos de los paisajes más dramáticos del Caribe, donde las montañas de la Sierra de Bahoruco descienden directamente al mar. Es famosa por sus minas de larimar, la piedra azul única de República Dominicana, y sus playas de aguas turquesas.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    highlights: ['Minas de Larimar', 'Playa San Rafael', 'Polo Magnético', 'Cachote'],
    bestTimeToVisit: 'Noviembre a Abril',
    howToGetThere: '3.5 horas desde Santo Domingo.',
    weatherInfo: 'Clima variado, desde tropical en la costa hasta fresco en las montañas.',
    typicalDishes: ['Chivo guisado', 'Pescado con coco', 'Dulce de batata'],
    latitude: 18.2085,
    longitude: -71.1004,
    isPopular: false,
    isFeatured: true
  },

  // === DESTINOS TURÍSTICOS ===
  {
    id: 'punta-cana',
    slug: 'punta-cana',
    name: 'Punta Cana',
    province: 'La Altagracia',
    provinceSlug: 'la-altagracia',
    region: 'este',
    type: 'destino',
    categories: ['playa', 'lujo', 'aventura'],
    shortDescription: 'El destino turístico más famoso del Caribe con playas de ensueño.',
    description: 'Punta Cana es el corazón turístico del Caribe, famoso por sus 48 kilómetros de playas de arena blanca bordeadas de cocoteros. Aquí encontrarás los mejores resorts todo incluido, campos de golf de campeonato, y una infinidad de actividades acuáticas y de aventura.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    highlights: ['Playa Bávaro', 'Hoyo Azul', 'Indigenous Eyes Ecological Park', 'Golf'],
    bestTimeToVisit: 'Diciembre a Abril',
    howToGetThere: 'Aeropuerto Internacional de Punta Cana (PUJ).',
    weatherInfo: 'Clima tropical perfecto con sol casi todo el año.',
    typicalDishes: ['Langosta', 'Pescado con coco', 'Ceviche tropical'],
    latitude: 18.5601,
    longitude: -68.3725,
    isPopular: true,
    isRecommended: true,
    isFeatured: true
  },
  {
    id: 'bavaro',
    slug: 'bavaro',
    name: 'Bávaro',
    province: 'La Altagracia',
    provinceSlug: 'la-altagracia',
    region: 'este',
    type: 'destino',
    categories: ['playa', 'lujo'],
    shortDescription: 'La playa más fotografiada del Caribe con arenas blancas perfectas.',
    description: 'Bávaro alberga una de las playas más hermosas del mundo, reconocida por la UNESCO. Sus aguas cristalinas color turquesa y su arena blanca como el azúcar la convierten en el escenario perfecto para unas vacaciones de ensueño.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    highlights: ['Playa Bávaro', 'Resorts de lujo', 'Vida nocturna', 'Compras'],
    bestTimeToVisit: 'Todo el año',
    howToGetThere: '15 minutos desde el Aeropuerto de Punta Cana.',
    weatherInfo: 'Clima tropical con brisas marinas refrescantes.',
    typicalDishes: ['Mariscos frescos', 'Pescado a la plancha', 'Cócteles tropicales'],
    latitude: 18.6870,
    longitude: -68.4514,
    isPopular: true,
    isRecommended: true
  },
  {
    id: 'cap-cana',
    slug: 'cap-cana',
    name: 'Cap Cana',
    province: 'La Altagracia',
    provinceSlug: 'la-altagracia',
    region: 'este',
    type: 'destino',
    categories: ['playa', 'lujo'],
    shortDescription: 'El destino más exclusivo del Caribe con marina y golf de clase mundial.',
    description: 'Cap Cana es el epítome del lujo caribeño. Este desarrollo exclusivo cuenta con la marina más grande del Caribe, el campo de golf Punta Espada diseñado por Jack Nicklaus, y Juanillo Beach, una de las playas más exclusivas de la región.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    highlights: ['Marina Cap Cana', 'Punta Espada Golf', 'Juanillo Beach', 'Scape Park'],
    bestTimeToVisit: 'Todo el año',
    howToGetThere: '10 minutos desde el Aeropuerto de Punta Cana.',
    weatherInfo: 'Clima tropical perfecto durante todo el año.',
    typicalDishes: ['Alta cocina caribeña', 'Sushi tropical', 'Langosta'],
    latitude: 18.4501,
    longitude: -68.4094,
    isPopular: true,
    isRecommended: true
  },
  {
    id: 'higuey',
    slug: 'higuey',
    name: 'Higüey',
    province: 'La Altagracia',
    provinceSlug: 'la-altagracia',
    region: 'este',
    type: 'municipio',
    categories: ['cultura'],
    shortDescription: 'Capital espiritual del país con la Basílica de Nuestra Señora de la Altagracia.',
    description: 'Higüey es la capital de la provincia La Altagracia y el centro religioso más importante del país. La Basílica de Nuestra Señora de la Altagracia, patrona de República Dominicana, atrae millones de peregrinos cada año, especialmente el 21 de enero.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    highlights: ['Basílica de la Altagracia', 'Plaza Central', 'Gastronomía local'],
    bestTimeToVisit: 'Enero para festividades religiosas',
    howToGetThere: '30 minutos desde Punta Cana.',
    weatherInfo: 'Clima tropical cálido.',
    typicalDishes: ['Chivo guisado', 'Mofongo', 'Dulce de leche'],
    latitude: 18.6156,
    longitude: -68.7080,
    isPopular: false,
    isRecommended: false
  },
  {
    id: 'las-terrenas',
    slug: 'las-terrenas',
    name: 'Las Terrenas',
    province: 'Samaná',
    provinceSlug: 'samana',
    region: 'norte',
    type: 'destino',
    categories: ['playa', 'ecoturismo'],
    shortDescription: 'Villa bohemia con playas paradisíacas y ambiente cosmopolita.',
    description: 'Las Terrenas es un encantador pueblo costero con un toque europeo, particularmente francés e italiano. Sus playas vírgenes, restaurantes gourmet y ambiente relajado lo convierten en el destino favorito de viajeros que buscan autenticidad y belleza natural.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    highlights: ['Playa Cosón', 'Playa Bonita', 'Pueblo El Limón', 'Gastronomía internacional'],
    bestTimeToVisit: 'Diciembre a Abril',
    howToGetThere: '45 minutos desde el Aeropuerto El Catey.',
    weatherInfo: 'Clima tropical húmedo con lluvias ocasionales.',
    typicalDishes: ['Pescado con coco', 'Cocina francesa-dominicana', 'Langostinos'],
    latitude: 19.3120,
    longitude: -69.5420,
    isPopular: true,
    isRecommended: true,
    isFeatured: true
  },
  {
    id: 'las-galeras',
    slug: 'las-galeras',
    name: 'Las Galeras',
    province: 'Samaná',
    provinceSlug: 'samana',
    region: 'norte',
    type: 'destino',
    categories: ['playa', 'ecoturismo'],
    shortDescription: 'El rincón más virgen de Samaná con Playa Rincón.',
    description: 'Las Galeras es un pequeño pueblo de pescadores en el extremo este de la península de Samaná. Aquí encontrarás Playa Rincón, considerada una de las 10 mejores playas del mundo, accesible solo por bote o camino de tierra.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    highlights: ['Playa Rincón', 'Playa Frontón', 'Buceo', 'Pesca artesanal'],
    bestTimeToVisit: 'Diciembre a Abril',
    howToGetThere: '1 hora desde el Aeropuerto El Catey.',
    weatherInfo: 'Clima tropical húmedo.',
    typicalDishes: ['Pescado fresco', 'Langosta', 'Coco frío'],
    latitude: 19.2689,
    longitude: -69.2458,
    isPopular: false,
    isRecommended: true
  },
  {
    id: 'cabarete',
    slug: 'cabarete',
    name: 'Cabarete',
    province: 'Puerto Plata',
    provinceSlug: 'puerto-plata',
    region: 'norte',
    type: 'destino',
    categories: ['playa', 'aventura'],
    shortDescription: 'Capital mundial del kitesurf y windsurf con vibra surfista.',
    description: 'Cabarete es reconocido internacionalmente como uno de los mejores destinos del mundo para deportes acuáticos de viento. Su bahía ofrece condiciones perfectas para kitesurf y windsurf, mientras que su ambiente relajado atrae a una comunidad internacional de deportistas y amantes del mar.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    highlights: ['Kitesurf', 'Windsurf', 'Playa Cabarete', 'Vida nocturna'],
    bestTimeToVisit: 'Junio a Septiembre para viento óptimo',
    howToGetThere: '20 minutos desde el Aeropuerto de Puerto Plata.',
    weatherInfo: 'Vientos alisios constantes, ideal para deportes acuáticos.',
    typicalDishes: ['Bowls saludables', 'Mariscos', 'Cocina internacional'],
    latitude: 19.7580,
    longitude: -70.4163,
    isPopular: true,
    isRecommended: true,
    isFeatured: true
  },
  {
    id: 'sosua',
    slug: 'sosua',
    name: 'Sosúa',
    province: 'Puerto Plata',
    provinceSlug: 'puerto-plata',
    region: 'norte',
    type: 'destino',
    categories: ['playa', 'cultura'],
    shortDescription: 'Playa de aguas cristalinas con herencia judía y ambiente vibrante.',
    description: 'Sosúa es famosa por su hermosa playa en forma de herradura con aguas cristalinas perfectas para snorkeling. El pueblo tiene una fascinante historia como refugio de judíos europeos durante la Segunda Guerra Mundial, visible en su museo y arquitectura.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    highlights: ['Playa Sosúa', 'Museo Judío', 'Snorkeling', 'Tiendas de artesanías'],
    bestTimeToVisit: 'Diciembre a Abril',
    howToGetThere: '15 minutos desde el Aeropuerto de Puerto Plata.',
    weatherInfo: 'Clima tropical agradable todo el año.',
    typicalDishes: ['Productos lácteos artesanales', 'Pan europeo', 'Mariscos'],
    latitude: 19.7549,
    longitude: -70.5196,
    isPopular: true,
    isRecommended: true
  },
  {
    id: 'jarabacoa',
    slug: 'jarabacoa',
    name: 'Jarabacoa',
    province: 'La Vega',
    provinceSlug: 'la-vega',
    region: 'norte',
    type: 'destino',
    categories: ['montaña', 'ecoturismo', 'aventura', 'rios'],
    shortDescription: 'La ciudad de la eterna primavera con aventura y naturaleza.',
    description: 'Jarabacoa es el destino de montaña más importante de República Dominicana, conocido como la ciudad de la eterna primavera por su clima fresco. Rodeado de ríos, cascadas y pinos, ofrece actividades de aventura como rafting, canyoning, parapente y senderismo hacia el Pico Duarte.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    highlights: ['Salto de Jimenoa', 'Rafting en Río Yaque', 'Pico Duarte', 'Parapente'],
    bestTimeToVisit: 'Todo el año, fresco especialmente de noviembre a febrero',
    howToGetThere: '2 horas desde Santo Domingo.',
    weatherInfo: 'Clima templado de montaña, 18-25°C durante el día.',
    typicalDishes: ['Chivo liniero', 'Habichuelas con dulce', 'Moro de guandules'],
    latitude: 19.1200,
    longitude: -70.6400,
    isPopular: true,
    isRecommended: true,
    isFeatured: true
  },
  {
    id: 'constanza',
    slug: 'constanza',
    name: 'Constanza',
    province: 'La Vega',
    provinceSlug: 'la-vega',
    region: 'norte',
    type: 'destino',
    categories: ['montaña', 'ecoturismo', 'aventura'],
    shortDescription: 'El valle más alto del Caribe con clima de montaña y fresas.',
    description: 'Constanza, ubicada a 1,200 metros de altura, es el valle más alto del Caribe. Su clima único permite el cultivo de fresas, flores y vegetales. Es la puerta de entrada a las montañas más altas de las Antillas y ofrece paisajes espectaculares.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    highlights: ['Valle de Constanza', 'Cultivo de fresas', 'Salto de Aguas Blancas', 'Reserva Valle Nuevo'],
    bestTimeToVisit: 'Noviembre a Febrero para temperaturas más frescas',
    howToGetThere: '3 horas desde Santo Domingo.',
    weatherInfo: 'El lugar más frío del Caribe, temperaturas pueden bajar a 0°C.',
    typicalDishes: ['Fresas con crema', 'Vegetales de montaña', 'Chivo guisado'],
    latitude: 18.9100,
    longitude: -70.7500,
    isPopular: false,
    isRecommended: true
  },
  {
    id: 'bayahibe',
    slug: 'bayahibe',
    name: 'Bayahíbe',
    province: 'La Romana',
    provinceSlug: 'la-romana',
    region: 'este',
    type: 'destino',
    categories: ['playa', 'ecoturismo'],
    shortDescription: 'Pueblo de pescadores con acceso a las mejores islas del Caribe.',
    description: 'Bayahíbe es un encantador pueblo de pescadores que sirve como puerta de entrada a la Isla Saona, la Isla Catalina y el Parque Nacional del Este. Sus aguas cristalinas son perfectas para buceo y snorkeling, con algunos de los arrecifes más saludables del Caribe.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    highlights: ['Isla Saona', 'Isla Catalina', 'Buceo en arrecifes', 'Parque Nacional del Este'],
    bestTimeToVisit: 'Diciembre a Abril',
    howToGetThere: '30 minutos desde La Romana o 1.5 horas desde Punta Cana.',
    weatherInfo: 'Clima tropical con aguas cálidas todo el año.',
    typicalDishes: ['Pescado fresco', 'Langosta a la criolla', 'Cangrejo'],
    latitude: 18.3690,
    longitude: -68.8370,
    isPopular: true,
    isRecommended: true,
    isFeatured: true
  },
  {
    id: 'zona-colonial',
    slug: 'zona-colonial',
    name: 'Zona Colonial',
    province: 'Santo Domingo',
    provinceSlug: 'santo-domingo',
    region: 'santo-domingo',
    type: 'destino',
    categories: ['cultura', 'ciudad'],
    shortDescription: 'Primera ciudad del Nuevo Mundo, Patrimonio de la Humanidad UNESCO.',
    description: 'La Zona Colonial de Santo Domingo es el corazón histórico de las Américas. Declarada Patrimonio de la Humanidad, alberga la primera catedral, el primer hospital, la primera universidad y la primera calle empedrada del continente. Sus calles adoquinadas rebosan de historia, restaurantes y vida nocturna.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    highlights: ['Catedral Primada', 'Alcázar de Colón', 'Calle El Conde', 'Parque Colón'],
    bestTimeToVisit: 'Todo el año',
    howToGetThere: '30 minutos desde el Aeropuerto Las Américas.',
    weatherInfo: 'Clima tropical cálido todo el año.',
    typicalDishes: ['La Bandera', 'Sancocho', 'Chimichurri', 'Yaroa'],
    latitude: 18.4735,
    longitude: -69.8866,
    isPopular: true,
    isRecommended: true,
    isFeatured: true
  },
  {
    id: 'bahia-de-las-aguilas',
    slug: 'bahia-de-las-aguilas',
    name: 'Bahía de las Águilas',
    province: 'Pedernales',
    provinceSlug: 'pedernales',
    region: 'sur',
    type: 'destino',
    categories: ['playa', 'ecoturismo'],
    shortDescription: 'La playa más hermosa y virgen de todo el Caribe.',
    description: 'Bahía de las Águilas es considerada la playa más hermosa del Caribe y una de las mejores del mundo. Con 8 kilómetros de arena blanca inmaculada y aguas cristalinas, es un paraíso virgen protegido dentro del Parque Nacional Jaragua, sin desarrollo turístico masivo.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    highlights: ['8 km de playa virgen', 'Aguas cristalinas', 'Sin desarrollo', 'Parque Nacional Jaragua'],
    bestTimeToVisit: 'Diciembre a Abril',
    howToGetThere: 'Solo accesible por bote desde Cabo Rojo o La Cueva.',
    weatherInfo: 'Clima seco y cálido, muy soleado.',
    typicalDishes: ['Pescado fresco', 'Langosta local', 'Chivo guisado'],
    latitude: 17.8167,
    longitude: -71.6333,
    isPopular: false,
    isRecommended: true,
    isFeatured: true
  },
  {
    id: 'playa-rincon',
    slug: 'playa-rincon',
    name: 'Playa Rincón',
    province: 'Samaná',
    provinceSlug: 'samana',
    region: 'norte',
    type: 'destino',
    categories: ['playa', 'ecoturismo'],
    shortDescription: 'Una de las 10 mejores playas del mundo según Condé Nast.',
    description: 'Playa Rincón es frecuentemente clasificada entre las 10 mejores playas del mundo. Esta joya de 3 kilómetros de arena dorada bordeada de palmeras ofrece aguas turquesas perfectas y un ambiente completamente natural, accesible solo por bote o camino de tierra.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    highlights: ['Arena dorada', 'Palmeras cocoteras', 'Restaurantes locales', 'Ambiente natural'],
    bestTimeToVisit: 'Diciembre a Abril',
    howToGetThere: 'Bote desde Las Galeras o vehículo 4x4.',
    weatherInfo: 'Clima tropical húmedo con brisas marinas.',
    typicalDishes: ['Pescado con coco', 'Langosta a la plancha', 'Coco frío'],
    latitude: 19.2806,
    longitude: -69.2639,
    isPopular: false,
    isRecommended: true
  },
  {
    id: 'boca-chica',
    slug: 'boca-chica',
    name: 'Boca Chica',
    province: 'Santo Domingo',
    provinceSlug: 'santo-domingo',
    region: 'santo-domingo',
    type: 'destino',
    categories: ['playa'],
    shortDescription: 'La playa más cercana a Santo Domingo con aguas tranquilas.',
    description: 'Boca Chica es la playa más cercana a la capital, conocida por sus aguas poco profundas y tranquilas protegidas por un arrecife natural. Es el destino de fin de semana favorito de los capitalinos y ofrece una animada escena de restaurantes y bares frente al mar.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    highlights: ['Aguas tranquilas', 'Restaurantes de mariscos', 'Ambiente festivo', 'Cerca del aeropuerto'],
    bestTimeToVisit: 'Todo el año',
    howToGetThere: '30 minutos desde Santo Domingo y 10 minutos del Aeropuerto Las Américas.',
    weatherInfo: 'Clima tropical cálido todo el año.',
    typicalDishes: ['Pescado frito', 'Lambi', 'Langosta', 'Cangrejo'],
    latitude: 18.4461,
    longitude: -69.6053,
    isPopular: true,
    isRecommended: false
  },
  {
    id: 'juan-dolio',
    slug: 'juan-dolio',
    name: 'Juan Dolio',
    province: 'San Pedro de Macorís',
    provinceSlug: 'san-pedro-de-macoris',
    region: 'este',
    type: 'destino',
    categories: ['playa'],
    shortDescription: 'Destino de playa tranquilo entre Santo Domingo y Punta Cana.',
    description: 'Juan Dolio es un destino de playa más tranquilo y relajado, situado entre la capital y los grandes resorts del este. Sus playas de arena blanca y palmeras ofrecen un escape perfecto sin las multitudes, con buenos restaurantes y hoteles boutique.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    highlights: ['Playas tranquilas', 'Golf', 'Ambiente relajado', 'Vida nocturna moderada'],
    bestTimeToVisit: 'Diciembre a Abril',
    howToGetThere: '45 minutos desde Santo Domingo.',
    weatherInfo: 'Clima tropical con brisas marinas.',
    typicalDishes: ['Mariscos frescos', 'Pescado a la plancha', 'Langosta'],
    latitude: 18.4281,
    longitude: -69.4267,
    isPopular: false,
    isRecommended: false
  }
];

// === FUNCIONES DE UTILIDAD ===

export function getDestinationBySlug(slug: string): Destination | undefined {
  return destinations.find(d => d.slug === slug);
}

export function getDestinationById(id: string): Destination | undefined {
  return destinations.find(d => d.id === id);
}

export function getDestinationsByProvince(provinceSlug: string): Destination[] {
  return destinations.filter(d => d.provinceSlug === provinceSlug && d.type !== 'provincia');
}

export function getDestinationsByRegion(region: string): Destination[] {
  return destinations.filter(d => d.region === region);
}

export function getDestinationsByCategory(category: string): Destination[] {
  return destinations.filter(d => d.categories.includes(category as any));
}

export function getPopularDestinations(): Destination[] {
  return destinations.filter(d => d.isPopular);
}

export function getRecommendedDestinations(): Destination[] {
  return destinations.filter(d => d.isRecommended);
}

export function getFeaturedDestinations(): Destination[] {
  return destinations.filter(d => d.isFeatured);
}

export function getProvinces(): Destination[] {
  return destinations.filter(d => d.type === 'provincia');
}

export function getMunicipalities(): Destination[] {
  return destinations.filter(d => d.type === 'municipio');
}

export function getTouristDestinations(): Destination[] {
  return destinations.filter(d => d.type === 'destino');
}

export function searchDestinations(query: string): Destination[] {
  const lowerQuery = query.toLowerCase();
  return destinations.filter(d => 
    d.name.toLowerCase().includes(lowerQuery) ||
    d.shortDescription.toLowerCase().includes(lowerQuery) ||
    d.province?.toLowerCase().includes(lowerQuery)
  );
}
