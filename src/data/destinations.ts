// Datos estáticos de destinos turísticos de República Dominicana
// 
// === GUÍA PARA CREAR NUEVAS PÁGINAS DE DESTINO ===
// 
// 1. AGREGAR DATOS: Añadir el objeto del destino a este archivo (destinations array)
// 2. CREAR PÁGINA: Crear archivo en src/pages/destinos/NombreDestino.tsx
// 3. AGREGAR RUTA: Registrar la ruta en src/App.tsx
//
// Ejemplo de página de destino:
// ```tsx
// import { StaticDestinationPage } from "@/components/StaticDestinationPage";
// import { getDestinationBySlug } from "@/data/destinations";
//
// export default function NombreDestino() {
//   const destination = getDestinationBySlug('nombre-destino');
//   if (!destination) return <div>Destino no encontrado</div>;
//   return <StaticDestinationPage destination={destination} />;
// }
// ```
//
// === JERARQUÍA ===
// Provincia → Municipio → Destino
// - provinceId: ID de la provincia padre (obligatorio para municipios y destinos)
// - municipalityId: ID del municipio padre (opcional, solo si está dentro de un municipio)
// 
// Ejemplo: Playa Boca Chica está en municipio Boca Chica que está en provincia Santo Domingo
// { id: 'playa-boca-chica', provinceId: 'santo-domingo', municipalityId: 'boca-chica-muni', ... }

export interface Destination {
  id: string;
  slug: string;
  name: string;
  // Campos de jerarquía
  province?: string;           // Nombre de la provincia (para mostrar)
  provinceSlug?: string;       // Slug de la provincia (para URLs)
  provinceId?: string;         // ID de la provincia padre
  municipalityId?: string;     // ID del municipio padre (si aplica)
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
  // Nuevos campos de información ampliada
  activities?: {
    name: string;
    type: 'aventura' | 'cultural' | 'relajación' | 'naturaleza' | 'gastronómico' | 'nocturno';
    duration?: string;
    price?: string;
    description?: string;
  }[];
  attractions?: {
    name: string;
    type: 'natural' | 'histórico' | 'entretenimiento' | 'religioso';
    description?: string;
    entryFee?: string;
    hours?: string;
  }[];
  tips?: string[];
  safetyInfo?: string;
  currency?: string;
  language?: string;
  timezone?: string;
  nearbyAirport?: string;
  distanceFromAirport?: string;
  averageBudget?: {
    budget: string;
    mid: string;
    luxury: string;
  };
  bestFor?: string[];
  notRecommendedFor?: string[];
  minimumDays?: number;
  idealDays?: number;
  // Campos de contenido enriquecido
  about?: {
    history?: string;
    geography?: string;
    artAndCulture?: string;
    politicalDivision?: string;
    economy?: string;
    demographics?: string;
    location?: string;
    pointsOfInterest?: { name: string; type: string; description?: string }[];
    whatToDo?: string[];
  };
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
    isFeatured: true,
    about: {
      history: 'La Altagracia fue creada como provincia en 1844, al nacer la República Dominicana. Su nombre proviene de la Virgen de la Altagracia, patrona del pueblo dominicano. Higüey, su capital, fue fundada en 1502 por Juan de Esquivel y es hogar de la Basílica Nuestra Señora de la Altagracia, diseñada por los arquitectos franceses André Dunoyer de Segonzac y Pierre Dupré, inaugurada en 1971.',
      geography: 'Ubicada en el extremo oriental de la isla, La Altagracia posee 160 km de costa bañados por el mar Caribe y el océano Atlántico. Su territorio es predominantemente llano con suelos calizos y vegetación subtropical. Incluye las islas Saona y Catalinita, parte del Parque Nacional del Este.',
      artAndCulture: 'La cultura altagraciana gira en torno a las tradiciones religiosas, especialmente la peregrinación anual a la Basílica de Higüey el 21 de enero. Los palos (atabales) y la música de gagá marcan las festividades. La artesanía local incluye trabajos en concha de lambí y madera de coco.',
      politicalDivision: 'La provincia se divide en 4 municipios: Higüey (capital), San Rafael del Yuma, Bávaro y La Otra Banda, además de 7 distritos municipales.',
      economy: 'El turismo es el motor económico principal, con más de 35,000 habitaciones hoteleras que generan el 70% del turismo nacional. La agricultura (caña de azúcar, ganadería) y la pesca complementan la economía local.',
      demographics: 'Población estimada de 390,000 habitantes. Es una de las provincias con mayor crecimiento demográfico debido a la migración laboral vinculada al sector turístico. La mayoría de la población se concentra en Higüey y las zonas turísticas.',
      location: 'Extremo este de la isla de La Española. Limita al norte con el océano Atlántico, al este y sur con el mar Caribe, y al oeste con las provincias El Seibo y La Romana.',
      pointsOfInterest: [
        { name: 'Basílica Nuestra Señora de la Altagracia', type: 'religioso', description: 'Monumento arquitectónico moderno y centro de peregrinación nacional.' },
        { name: 'Parque Nacional del Este', type: 'natural', description: 'Área protegida con manglares, cuevas taínas y la Isla Saona.' },
        { name: 'Indigenous Eyes Ecological Park', type: 'natural', description: '12 lagunas de agua dulce en medio de la selva tropical.' },
        { name: 'Altos de Chavón', type: 'cultural', description: 'Réplica de villa mediterránea del s. XVI con anfiteatro y galerías.' },
        { name: 'Hoyo Azul', type: 'natural', description: 'Cenote de aguas turquesas al pie de un acantilado de 75 metros.' },
        { name: 'Museo de Ponce de León', type: 'histórico', description: 'Casa-fortaleza del conquistador en San Rafael del Yuma.' },
      ],
      whatToDo: [
        'Buceo y snorkel en Isla Saona y Catalina',
        'Golf en campos de campeonato (Punta Espada, Corales)',
        'Safari en buggies por la campiña',
        'Tirolesa en Scape Park',
        'Peregrinación a la Basílica de Higüey',
        'Paseo en catamarán por la costa',
        'Visita a la Cueva de Padre Nuestro',
        'Observación de manatíes en los manglares',
      ],
    },
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
    isFeatured: true,
    about: {
      history: 'Samaná fue bautizada como "Bahía de las Flechas" por Cristóbal Colón en 1493 tras un enfrentamiento con los indígenas ciguayos. En el siglo XIX recibió inmigrantes afroamericanos libertos de EE.UU. que fundaron comunidades como Philadelphia y Bethesda, cuya herencia cultural anglófona persiste hoy.',
      geography: 'Península que se extiende hacia el Atlántico norte, con una topografía montañosa cubierta de bosque tropical húmedo. El Parque Nacional Los Haitises al sur presenta formaciones de mogotes (colinas cónicas) únicas en el Caribe, con cuevas con petroglifos taínos.',
      artAndCulture: 'La cultura samanesa fusiona raíces africanas, taínas y la herencia anglófona de los descendientes de afroamericanos. La música de bambulá y los himnos gospel en inglés conviven con el merengue y la bachata. La Semana Santa en las comunidades de descendientes es una experiencia cultural única.',
      economy: 'Turismo ecológico y de aventura como motor principal. La pesca artesanal, la producción de cacao orgánico y el aceite de coco complementan la economía. El avistamiento de ballenas genera más de $30 millones anuales.',
      demographics: 'Aproximadamente 120,000 habitantes. Comunidad multicultural con presencia de europeos residentes (principalmente franceses e italianos) en Las Terrenas y descendientes afroamericanos en las zonas rurales.',
      pointsOfInterest: [
        { name: 'Parque Nacional Los Haitises', type: 'natural', description: 'Bosque húmedo con mogotes, cuevas taínas y manglares.' },
        { name: 'Cascada El Limón', type: 'natural', description: 'Caída de agua de 40 metros accesible a caballo o a pie.' },
        { name: 'Playa Rincón', type: 'natural', description: 'Votada como una de las 10 mejores playas del mundo.' },
        { name: 'Cayo Levantado', type: 'natural', description: 'Isla paradisíaca conocida como "Isla Bacardí".' },
        { name: 'Puente de Samaná', type: 'histórico', description: 'Puente peatonal que cruza la bahía con vistas espectaculares.' },
      ],
      whatToDo: [
        'Avistamiento de ballenas jorobadas (enero-marzo)',
        'Excursión a la Cascada El Limón',
        'Tour en lancha por Los Haitises',
        'Buceo y snorkel en la costa',
        'Senderismo en la Sierra de Samaná',
        'Paseo a caballo por playas vírgenes',
        'Degustación de cacao orgánico',
      ],
    },
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
    isFeatured: true,
    about: {
      history: 'Fundada en 1502 por Nicolás de Ovando con el nombre de San Felipe de Puerto Plata. Fue puerto clave del comercio colonial y sufrió las devastaciones de Osorio en 1605. En el siglo XIX, el general Gregorio Luperón lideró desde aquí la Guerra de Restauración. El turismo masivo llegó en los años 80 con el desarrollo de Playa Dorada.',
      geography: 'Situada en la costa norte (Atlántico), flanqueada por la Cordillera Septentrional. El Pico Isabel de Torres (793 m) domina el paisaje urbano. La provincia cuenta con 120 km de costa con playas de arena dorada y formaciones coralinas.',
      artAndCulture: 'Cuna del ámbar dominicano, con el Museo del Ámbar albergando piezas de hasta 40 millones de años. Las fiestas patronales de San Felipe (mayo) y el carnaval con sus "taimáscaros" son tradiciones emblemáticas. La influencia afrocaribeña marca la música y la gastronomía local.',
      economy: 'Turismo (Playa Dorada, Sosúa, Cabarete), zonas francas industriales, producción de ron y tabaco. El puerto de carga de Maimón es importante para el comercio exterior.',
      demographics: 'Aproximadamente 330,000 habitantes. Comunidad cosmopolita con importante presencia de europeos y norteamericanos residentes, especialmente en Sosúa y Cabarete.',
      pointsOfInterest: [
        { name: 'Teleférico Pico Isabel de Torres', type: 'natural', description: 'Único teleférico del Caribe con jardín botánico en la cumbre.' },
        { name: 'Fortaleza San Felipe', type: 'histórico', description: 'Fortín colonial del s. XVI, hoy museo militar.' },
        { name: 'Museo del Ámbar', type: 'cultural', description: 'Colección de ámbar dominicano con insectos prehistóricos.' },
        { name: 'Ocean World Adventure Park', type: 'entretenimiento', description: 'Parque con delfines, leones marinos y acuario.' },
        { name: '27 Charcos de Damajagua', type: 'natural', description: 'Cascadas naturales para canyoning y aventura acuática.' },
      ],
      whatToDo: [
        'Subir en teleférico al Pico Isabel de Torres',
        'Kitesurf y windsurf en Cabarete',
        'Canyoning en los 27 Charcos de Damajagua',
        'Snorkel en los arrecifes de Sosúa',
        'Tour por fábricas de ron y tabaco',
        'Explorar la Fortaleza San Felipe',
        'Visitar el Museo del Ámbar',
      ],
    },
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
    isFeatured: true,
    about: {
      history: 'Fundada el 5 de agosto de 1496 por Bartolomé Colón, Santo Domingo es la primera ciudad permanente del Nuevo Mundo. Fue capital del imperio español en las Américas durante más de un siglo. La Zona Colonial alberga las primeras instituciones europeas del continente: la primera catedral (1521), el primer hospital (1503), la primera universidad (1538) y el primer monasterio.',
      geography: 'Situada en la costa sur de la isla, en la desembocadura del río Ozama. La ciudad se extiende sobre una llanura costera con elevaciones menores. El malecón recorre 12 km a lo largo del mar Caribe.',
      artAndCulture: 'Santo Domingo es el epicentro cultural del país con más de 20 museos, teatros como el Teatro Nacional Eduardo Brito y el Palacio de Bellas Artes. La escena artística contemporánea florece en galerías de la Zona Colonial y el barrio de Gazcue. El merengue, declarado Patrimonio Inmaterial de la Humanidad por la UNESCO, tiene aquí su mayor expresión.',
      politicalDivision: 'El Distrito Nacional (DN) alberga la capital. La provincia de Santo Domingo se divide en 4 municipios: Santo Domingo Este, Santo Domingo Oeste, Santo Domingo Norte y Boca Chica, más 7 distritos municipales.',
      economy: 'Como capital, concentra el 35% del PIB nacional. Los sectores dominantes son servicios financieros, comercio, telecomunicaciones, turismo urbano y zonas francas industriales. Es sede de las principales instituciones gubernamentales y corporativas.',
      demographics: 'La Gran Santo Domingo supera los 4 millones de habitantes, representando cerca del 40% de la población nacional. Es una ciudad multicultural con comunidades de más de 100 nacionalidades.',
      location: 'Costa sur de la isla, a orillas del mar Caribe y el río Ozama. A 150 km de Punta Cana, 155 km de Santiago y 245 km de Samaná.',
      pointsOfInterest: [
        { name: 'Zona Colonial', type: 'histórico', description: 'Patrimonio de la Humanidad UNESCO con más de 300 edificaciones coloniales.' },
        { name: 'Alcázar de Colón', type: 'histórico', description: 'Palacio de Diego Colón, hoy museo virreinal con vistas al río Ozama.' },
        { name: 'Los Tres Ojos', type: 'natural', description: 'Sistema de cuevas con lagos subterráneos de aguas cristalinas.' },
        { name: 'Jardín Botánico Nacional', type: 'natural', description: 'Uno de los jardines botánicos más grandes del Caribe.' },
        { name: 'Centro León Cultural', type: 'cultural', description: 'Espacio de arte, historia y cultura dominicana.' },
        { name: 'Faro a Colón', type: 'histórico', description: 'Monumento en forma de cruz que alberga los restos de Cristóbal Colón.' },
      ],
      whatToDo: [
        'Recorrido a pie por la Zona Colonial',
        'Tour gastronómico por los mercados y restaurantes',
        'Visitar museos y galerías de arte',
        'Disfrutar del malecón al atardecer',
        'Explorar las cuevas de Los Tres Ojos',
        'Vida nocturna en la Zona Colonial y Piantini',
        'Compras en Blue Mall y Ágora Mall',
        'Paseo en bote por el río Ozama',
      ],
    },
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
    isFeatured: true,
    about: {
      history: 'Fundada en 1495 por 30 caballeros de la Orden de Santiago, es la segunda ciudad más antigua fundada por europeos en el Nuevo Mundo. Jugó un papel crucial en las luchas independentistas y la Restauración de la República en 1863. El Monumento a los Héroes de la Restauración, inaugurado en 1944, es su ícono más representativo.',
      geography: 'Situada en el Valle del Cibao, la región agrícola más fértil del país, a 178 metros sobre el nivel del mar. Rodeada por la Cordillera Central al sur y la Cordillera Septentrional al norte.',
      artAndCulture: 'Capital cultural del Cibao, hogar del Centro León (uno de los museos más importantes del Caribe), galerías de arte y una vibrante escena de música urbana. Las fábricas artesanales de cigarros premium y la cultura del tabaco son parte integral de su identidad.',
      economy: 'Segunda economía del país. Líder en manufactura de tabaco (cigarros premium), zonas francas, agroindustria y comercio. La provincia aporta el 10% del PIB nacional.',
      demographics: 'Más de 1 millón de habitantes en el área metropolitana. Segunda ciudad más poblada del país, con una clase media en crecimiento y universidades de prestigio como PUCMM y UTESA.',
      pointsOfInterest: [
        { name: 'Monumento a los Héroes', type: 'histórico', description: 'Torre de 67 metros con vista panorámica de la ciudad y el valle.' },
        { name: 'Centro León', type: 'cultural', description: 'Museo de arte, historia y cultura dominicana de clase mundial.' },
        { name: 'Calle del Sol', type: 'cultural', description: 'Arteria comercial principal con arquitectura victoriana y art déco.' },
        { name: 'Fortaleza San Luis', type: 'histórico', description: 'Fortín colonial restaurado con exposiciones históricas.' },
      ],
      whatToDo: [
        'Visitar el Centro León y sus exposiciones',
        'Tour por fábricas de cigarros artesanales',
        'Subir al Monumento a los Héroes al atardecer',
        'Degustar gastronomía cibaeña auténtica',
        'Explorar la vida nocturna del centro',
        'Recorrer la Calle del Sol y sus tiendas',
      ],
    },
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
    howToGetThere: '3.5 horas desde Santo Domingo por autopista del sur.',
    weatherInfo: 'Clima variado, desde tropical en la costa hasta fresco en las montañas.',
    typicalDishes: ['Chivo guisado', 'Pescado con coco', 'Dulce de batata'],
    latitude: 18.2085,
    longitude: -71.1004,
    isPopular: false,
    isFeatured: true
  },
  // Distrito Nacional
  {
    id: 'distrito-nacional',
    slug: 'distrito-nacional',
    name: 'Distrito Nacional',
    region: 'santo-domingo',
    type: 'provincia',
    categories: ['cultura', 'ciudad'],
    shortDescription: 'Corazón político y cultural del país, sede de la Zona Colonial Patrimonio UNESCO.',
    description: 'El Distrito Nacional es el centro político, cultural y económico de República Dominicana. Aquí se encuentra la Zona Colonial declarada Patrimonio de la Humanidad, el Malecón de Santo Domingo, los principales museos, teatros y centros comerciales del país. Es la provincia más cosmopolita y vibrante de la nación.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg'],
    highlights: ['Zona Colonial UNESCO', 'Malecón', 'Plaza de la Cultura', 'Gastronomía metropolitana'],
    bestTimeToVisit: 'Todo el año',
    howToGetThere: 'Aeropuerto Las Américas (SDQ) a 25 minutos.',
    weatherInfo: 'Clima tropical cálido, 26-32°C promedio.',
    typicalDishes: ['La Bandera', 'Sancocho', 'Chimichurri', 'Yaroa'],
    latitude: 18.4861,
    longitude: -69.9312,
    isPopular: true,
    isFeatured: true
  },
  // Duarte
  {
    id: 'duarte',
    slug: 'duarte',
    name: 'Duarte',
    region: 'norte',
    type: 'provincia',
    categories: ['cultura', 'aventura'],
    shortDescription: 'Tierra del cacao dominicano y los Gigantes del Cibao.',
    description: 'La provincia Duarte, con capital en San Francisco de Macorís, es el corazón cacaotero de República Dominicana. Produce el cacao más fino del mundo, reconocido internacionalmente. Además, es hogar de los Gigantes del Cibao en el béisbol profesional y ofrece paisajes naturales con ríos y montañas del nordeste.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg'],
    highlights: ['Capital del Cacao', 'Fincas cacaoteras', 'Río Jaya', 'Béisbol profesional'],
    bestTimeToVisit: 'Noviembre a Abril',
    howToGetThere: '2 horas desde Santo Domingo por autopista Duarte.',
    weatherInfo: 'Clima tropical húmedo, ideal para el cultivo de cacao.',
    typicalDishes: ['Chocolate artesanal', 'Chacá', 'Habichuelas con dulce', 'Mofongo'],
    latitude: 19.3008,
    longitude: -70.2527,
    isPopular: false,
    isFeatured: false
  },
  // Espaillat
  {
    id: 'espaillat',
    slug: 'espaillat',
    name: 'Espaillat',
    region: 'norte',
    type: 'provincia',
    categories: ['cultura', 'playa'],
    shortDescription: 'Cuna del merengue con playas vírgenes y tradición cigarrera.',
    description: 'Espaillat, con capital en Moca, es conocida como la cuna del merengue típico y tierra de valientes patriotas. La ciudad de Moca es famosa por sus cigarros artesanales y su rica historia política. La provincia también ofrece playas poco exploradas en su costa atlántica.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg'],
    highlights: ['Merengue típico', 'Cigarros artesanales', 'Playas vírgenes', 'Historia patriótica'],
    bestTimeToVisit: 'Noviembre a Abril',
    howToGetThere: '2.5 horas desde Santo Domingo.',
    weatherInfo: 'Clima tropical con temperaturas agradables en el interior.',
    typicalDishes: ['Chenchen', 'Chivo liniero', 'Habichuelas con dulce'],
    latitude: 19.3967,
    longitude: -70.5228,
    isPopular: false,
    isFeatured: false
  },
  // Hato Mayor
  {
    id: 'hato-mayor',
    slug: 'hato-mayor',
    name: 'Hato Mayor',
    region: 'este',
    type: 'provincia',
    categories: ['ecoturismo', 'aventura'],
    shortDescription: 'Puerta de entrada al Parque Los Haitises y turismo rural auténtico.',
    description: 'Hato Mayor es la puerta de entrada al espectacular Parque Nacional Los Haitises desde su vertiente sur. La provincia ofrece turismo rural auténtico con fincas ganaderas, ríos para kayak y un ambiente campestre genuino. Su ubicación estratégica la conecta con los principales destinos del este.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg'],
    highlights: ['Parque Los Haitises', 'Turismo rural', 'Ríos para kayak', 'Fincas ganaderas'],
    bestTimeToVisit: 'Noviembre a Mayo',
    howToGetThere: '1.5 horas desde Santo Domingo.',
    weatherInfo: 'Clima tropical húmedo con temporada lluviosa mayo-noviembre.',
    typicalDishes: ['Carne de res guisada', 'Moro de habichuelas', 'Dulce de leche'],
    latitude: 18.7633,
    longitude: -69.2567,
    isPopular: false,
    isFeatured: false
  },
  // El Seibo
  {
    id: 'el-seibo',
    slug: 'el-seibo',
    name: 'El Seibo',
    region: 'este',
    type: 'provincia',
    categories: ['ecoturismo', 'aventura', 'playa'],
    shortDescription: 'Tierra del turismo ecológico con Montaña Redonda y playas de Miches.',
    description: 'El Seibo alberga algunos de los destinos emergentes más emocionantes de República Dominicana. Miches y su costa virgen están siendo desarrollados como el nuevo polo turístico del este. La icónica Montaña Redonda ofrece vistas de 360° y el columpio más famoso del Caribe.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg'],
    highlights: ['Montaña Redonda', 'Miches', 'Playa Esmeralda', 'Laguna Redonda'],
    bestTimeToVisit: 'Diciembre a Abril',
    howToGetThere: '2 horas desde Santo Domingo.',
    weatherInfo: 'Clima tropical con brisas costeras refrescantes.',
    typicalDishes: ['Pescado con coco', 'Cangrejo guisado', 'Casabe'],
    latitude: 18.7647,
    longitude: -69.0389,
    isPopular: false,
    isFeatured: true
  },
  // San Pedro de Macorís
  {
    id: 'san-pedro-de-macoris',
    slug: 'san-pedro-de-macoris',
    name: 'San Pedro de Macorís',
    region: 'este',
    type: 'provincia',
    categories: ['cultura', 'playa'],
    shortDescription: 'La Cuna de los Shortstops y tierra de los Guloya, Patrimonio Inmaterial UNESCO.',
    description: 'San Pedro de Macorís es famosa por producir más jugadores de Grandes Ligas de béisbol per cápita que cualquier ciudad del mundo. Es también hogar de los Guloyas, una tradición de danza y teatro callejero declarada Patrimonio Inmaterial de la Humanidad por la UNESCO. Sus malecones y playas complementan su rica oferta cultural.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg'],
    highlights: ['Cuna de los Shortstops', 'Guloyas UNESCO', 'Malecón', 'Estadio Tetelo Vargas'],
    bestTimeToVisit: 'Todo el año',
    howToGetThere: '1 hora desde Santo Domingo.',
    weatherInfo: 'Clima tropical con brisas marinas.',
    typicalDishes: ['Domplines', 'Guavaberry', 'Yaniqueques', 'Pescado frito'],
    latitude: 18.4537,
    longitude: -69.3088,
    isPopular: false,
    isFeatured: false
  },
  // Monte Cristi
  {
    id: 'monte-cristi',
    slug: 'monte-cristi',
    name: 'Monte Cristi',
    region: 'norte',
    type: 'provincia',
    categories: ['ecoturismo', 'playa', 'aventura'],
    shortDescription: 'El Morro icónico, cayos vírgenes y salinas en el extremo noroeste.',
    description: 'Monte Cristi es una de las provincias más fascinantes y menos exploradas de República Dominicana. Dominada por el icónico perfil de El Morro, ofrece los Cayos Siete Hermanos con playas vírgenes, extensos manglares, salinas históricas y una gastronomía basada en chivo y mariscos. Es el destino perfecto para viajeros aventureros.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg'],
    highlights: ['El Morro', 'Cayos Siete Hermanos', 'Salinas', 'Manglares', 'Punta Rucia'],
    bestTimeToVisit: 'Noviembre a Mayo',
    howToGetThere: '4.5 horas desde Santo Domingo.',
    weatherInfo: 'Clima seco y cálido, una de las zonas más secas del país.',
    typicalDishes: ['Chivo liniero', 'Pescado con coco', 'Mariscos frescos'],
    latitude: 19.8500,
    longitude: -71.6500,
    isPopular: false,
    isFeatured: true
  },
  // María Trinidad Sánchez
  {
    id: 'maria-trinidad-sanchez',
    slug: 'maria-trinidad-sanchez',
    name: 'María Trinidad Sánchez',
    region: 'norte',
    type: 'provincia',
    categories: ['playa', 'ecoturismo'],
    shortDescription: 'Playas espectaculares como Playa Grande y la Laguna Gri-Gri.',
    description: 'María Trinidad Sánchez alberga algunas de las playas más espectaculares del norte, incluyendo la famosa Playa Grande, considerada una de las más hermosas del país. La Laguna Gri-Gri en Río San Juan ofrece paseos en bote únicos por manglares y acantilados costeros. Es un destino emergente con enorme potencial turístico.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg'],
    highlights: ['Playa Grande', 'Laguna Gri-Gri', 'Playa Caletón', 'Río San Juan'],
    bestTimeToVisit: 'Diciembre a Mayo',
    howToGetThere: '3 horas desde Santo Domingo.',
    weatherInfo: 'Clima tropical húmedo con lluvias frecuentes.',
    typicalDishes: ['Pescado con coco', 'Cangrejo guisado', 'Casabe'],
    latitude: 19.3833,
    longitude: -69.9500,
    isPopular: false,
    isFeatured: false
  },
  // Peravia
  {
    id: 'peravia',
    slug: 'peravia',
    name: 'Peravia',
    region: 'sur',
    type: 'provincia',
    categories: ['playa', 'cultura'],
    shortDescription: 'Capital Baní, tierra del mango banilejo y las dunas costeras.',
    description: 'Peravia, con capital en Baní, es famosa por sus mangos considerados los más dulces del mundo, sus espectaculares dunas de arena (las Dunas de Baní), y las salinas de Azua. El pueblo de Las Calderas ofrece playas tranquilas y un ambiente costero relajado.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg'],
    highlights: ['Dunas de Baní', 'Mango banilejo', 'Salinas', 'Playa Las Calderas'],
    bestTimeToVisit: 'Junio-Julio para Festival del Mango',
    howToGetThere: '1.5 horas desde Santo Domingo.',
    weatherInfo: 'Clima semiárido en la costa, más húmedo en las montañas.',
    typicalDishes: ['Mango banilejo', 'Chivo guisado', 'Dulce de leche', 'Habichuelas con dulce'],
    latitude: 18.2833,
    longitude: -70.3333,
    isPopular: false,
    isFeatured: false
  },
  // Azua
  {
    id: 'azua',
    slug: 'azua',
    name: 'Azua',
    region: 'sur',
    type: 'provincia',
    categories: ['cultura', 'ecoturismo'],
    shortDescription: 'Ciudad histórica con la Batalla del 19 de Marzo y paisajes sureños.',
    description: 'Azua de Compostela es una de las ciudades más antiguas del continente americano, fundada en 1504. Fue escenario de la histórica Batalla del 19 de Marzo de 1844, primera batalla de la independencia dominicana. La provincia ofrece paisajes variados desde montañas hasta costas semiáridas.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg'],
    highlights: ['Batalla del 19 de Marzo', 'Ciudad colonial', 'Playas sureñas', 'Montañas'],
    bestTimeToVisit: 'Noviembre a Abril',
    howToGetThere: '2 horas desde Santo Domingo por la autopista del sur.',
    weatherInfo: 'Clima seco y cálido, una de las zonas más calurosas del país.',
    typicalDishes: ['Chenchén', 'Chivo guisado', 'Habas guisadas'],
    latitude: 18.4531,
    longitude: -70.7289,
    isPopular: false,
    isFeatured: false
  },
  // San Cristóbal
  {
    id: 'san-cristobal',
    slug: 'san-cristobal',
    name: 'San Cristóbal',
    region: 'sur',
    type: 'provincia',
    categories: ['cultura', 'ecoturismo'],
    shortDescription: 'Cuna de la Constitución dominicana con cuevas, ríos y el Castillo del Cerro.',
    description: 'San Cristóbal es conocida como la Cuna de la Constitución, ya que aquí se firmó la primera Constitución de la República Dominicana en 1844. La provincia ofrece el Castillo del Cerro de la era de Trujillo, las cuevas de El Pomier con arte rupestre taíno, ríos para balnearios y un rico patrimonio histórico-cultural.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg'],
    highlights: ['Cuna de la Constitución', 'Castillo del Cerro', 'Cuevas de El Pomier', 'Ríos y balnearios'],
    bestTimeToVisit: 'Todo el año',
    howToGetThere: '30 minutos desde Santo Domingo.',
    weatherInfo: 'Clima tropical con temperaturas moderadas en las montañas.',
    typicalDishes: ['Pastelón', 'Moro de guandules', 'Dulces criollos'],
    latitude: 18.4170,
    longitude: -70.1050,
    isPopular: false,
    isFeatured: false
  },
  // Independencia
  {
    id: 'independencia',
    slug: 'independencia',
    name: 'Independencia',
    region: 'sur',
    type: 'provincia',
    categories: ['ecoturismo', 'aventura'],
    shortDescription: 'Lago Enriquillo, cocodrilos americanos e iguanas en el punto más bajo del Caribe.',
    description: 'La provincia Independencia alberga el Lago Enriquillo, el lago más grande y el punto más bajo del Caribe (40 metros bajo el nivel del mar). Es hogar de la mayor población de cocodrilos americanos en estado salvaje, iguanas rinoceronte y flamencos rosados. La Isla Cabritos dentro del lago es un santuario de fauna única.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg'],
    highlights: ['Lago Enriquillo', 'Isla Cabritos', 'Cocodrilos americanos', 'Iguanas rinoceronte'],
    bestTimeToVisit: 'Noviembre a Marzo',
    howToGetThere: '4 horas desde Santo Domingo.',
    weatherInfo: 'Clima seco y caluroso, una de las zonas más áridas del país.',
    typicalDishes: ['Chivo guisado', 'Pescado de lago', 'Habichuelas con dulce'],
    latitude: 18.4833,
    longitude: -71.6167,
    isPopular: false,
    isFeatured: true
  },
  // Bahoruco
  {
    id: 'bahoruco',
    slug: 'bahoruco',
    name: 'Bahoruco',
    region: 'sur',
    type: 'provincia',
    categories: ['ecoturismo', 'montaña'],
    shortDescription: 'Sierra de Bahoruco con la mayor diversidad de orquídeas del Caribe.',
    description: 'La provincia Bahoruco es un paraíso para los amantes de la naturaleza. La Sierra de Bahoruco alberga más de 180 especies de orquídeas, 52 de ellas endémicas, y 49 especies de aves endémicas. Es uno de los sitios de mayor biodiversidad del Caribe y un destino emergente para el ecoturismo científico.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg'],
    highlights: ['Sierra de Bahoruco', '180+ orquídeas', 'Aves endémicas', 'Bosque nublado'],
    bestTimeToVisit: 'Enero a Abril para orquídeas en flor',
    howToGetThere: '4 horas desde Santo Domingo.',
    weatherInfo: 'Clima variado por altitud, desde cálido en valles hasta frío en cumbres.',
    typicalDishes: ['Chivo guisado', 'Habichuelas con dulce', 'Dulce de batata'],
    latitude: 18.4833,
    longitude: -71.4167,
    isPopular: false,
    isFeatured: false
  },
  // Monseñor Nouel
  {
    id: 'monsenor-nouel',
    slug: 'monsenor-nouel',
    name: 'Monseñor Nouel',
    region: 'norte',
    type: 'provincia',
    categories: ['cultura', 'aventura'],
    shortDescription: 'Capital Bonao, ciudad de las rondallas y el río Yuna.',
    description: 'Monseñor Nouel, con capital en Bonao, es conocida como la Ciudad de las Rondallas por su rica tradición musical navideña. La provincia cuenta con el Río Yuna para deportes acuáticos, montañas para senderismo y una comunidad artística vibrante. Las minas de ferroníquel son parte importante de su economía.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg'],
    highlights: ['Rondallas de Bonao', 'Río Yuna', 'Carnaval de Bonao', 'Artesanía'],
    bestTimeToVisit: 'Diciembre para las rondallas, Febrero para carnaval',
    howToGetThere: '1.5 horas desde Santo Domingo por autopista Duarte.',
    weatherInfo: 'Clima tropical con temperaturas agradables.',
    typicalDishes: ['Moro de guandules', 'Chivo guisado', 'Habichuelas con dulce'],
    latitude: 18.9417,
    longitude: -70.4083,
    isPopular: false,
    isFeatured: false
  },
  // Monte Plata
  {
    id: 'monte-plata',
    slug: 'monte-plata',
    name: 'Monte Plata',
    region: 'santo-domingo',
    type: 'provincia',
    categories: ['ecoturismo', 'aventura', 'rios'],
    shortDescription: 'Ríos cristalinos, cascadas y ecoturismo a las puertas de Santo Domingo.',
    description: 'Monte Plata es el pulmón verde cercano a Santo Domingo, con abundantes ríos cristalinos, cascadas y senderos naturales. Es un destino popular para excursiones de fin de semana con balnearios en los ríos Comate, Guanuma y Ozama. La Cueva Fun-Fun es una de las aventuras subterráneas más emocionantes del Caribe.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg'],
    highlights: ['Cueva Fun-Fun', 'Ríos cristalinos', 'Balnearios', 'Senderismo'],
    bestTimeToVisit: 'Todo el año',
    howToGetThere: '1 hora desde Santo Domingo.',
    weatherInfo: 'Clima tropical húmedo con lluvias frecuentes.',
    typicalDishes: ['Sancocho', 'Moro de guandules', 'Habichuelas con dulce'],
    latitude: 18.8072,
    longitude: -69.7850,
    isPopular: false,
    isFeatured: false
  },
  // Sánchez Ramírez
  {
    id: 'sanchez-ramirez',
    slug: 'sanchez-ramirez',
    name: 'Sánchez Ramírez',
    region: 'norte',
    type: 'provincia',
    categories: ['ecoturismo', 'aventura'],
    shortDescription: 'Presa de Hatillo, la más grande del país, rodeada de naturaleza.',
    description: 'Sánchez Ramírez, con capital en Cotuí, es hogar de la Presa de Hatillo, la más grande del Caribe, que crea un impresionante lago artificial rodeado de montañas verdes. La provincia ofrece turismo rural, pesca deportiva, senderos ecológicos y una rica tradición agrícola basada en el arroz y el cacao.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg'],
    highlights: ['Presa de Hatillo', 'Lago artificial', 'Turismo rural', 'Pesca deportiva'],
    bestTimeToVisit: 'Noviembre a Abril',
    howToGetThere: '2 horas desde Santo Domingo.',
    weatherInfo: 'Clima tropical con temperaturas moderadas.',
    typicalDishes: ['Arroz con pollo', 'Moro de habichuelas', 'Dulce de coco'],
    latitude: 19.0550,
    longitude: -70.1533,
    isPopular: false,
    isFeatured: false
  },
  // Hermanas Mirabal
  {
    id: 'hermanas-mirabal',
    slug: 'hermanas-mirabal',
    name: 'Hermanas Mirabal',
    region: 'norte',
    type: 'provincia',
    categories: ['cultura'],
    shortDescription: 'Tierra de las heroínas Mirabal, símbolo mundial contra la violencia de género.',
    description: 'La provincia Hermanas Mirabal (antes Salcedo) rinde homenaje a las hermanas Patria, Minerva y María Teresa Mirabal, heroínas nacionales asesinadas durante la dictadura de Trujillo. El Museo de las Hermanas Mirabal en Conuco es un sitio de peregrinación y reflexión. El 25 de noviembre, Día Internacional de la Eliminación de la Violencia contra la Mujer, se conmemora en su honor.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg'],
    highlights: ['Museo Hermanas Mirabal', 'Casa de las Mirabal', '25 de noviembre', 'Historia de resistencia'],
    bestTimeToVisit: 'Noviembre para conmemoración',
    howToGetThere: '2.5 horas desde Santo Domingo.',
    weatherInfo: 'Clima tropical agradable.',
    typicalDishes: ['Moro de guandules', 'Chivo guisado', 'Habichuelas con dulce'],
    latitude: 19.3783,
    longitude: -70.4150,
    isPopular: false,
    isFeatured: false
  },
  // San Juan
  {
    id: 'san-juan',
    slug: 'san-juan',
    name: 'San Juan',
    region: 'sur',
    type: 'provincia',
    categories: ['montaña', 'cultura', 'aventura'],
    shortDescription: 'El Valle de San Juan, puerta sur al Pico Duarte y tradición agrícola.',
    description: 'San Juan de la Maguana es una de las provincias más grandes del país, con el fértil Valle de San Juan. Es la puerta sur para expediciones al Pico Duarte y ofrece el misterioso Corral de los Indios, un sitio ceremonial taíno. La provincia tiene una rica tradición ganadera y agrícola con su famoso arroz.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg'],
    highlights: ['Corral de los Indios', 'Ruta sur al Pico Duarte', 'Valle fértil', 'Presa de Sabaneta'],
    bestTimeToVisit: 'Noviembre a Abril',
    howToGetThere: '3 horas desde Santo Domingo.',
    weatherInfo: 'Clima variado, cálido en el valle y fresco en las montañas.',
    typicalDishes: ['Chenchén con chivo', 'Habichuelas con dulce', 'Longaniza'],
    latitude: 18.8056,
    longitude: -71.2296,
    isPopular: false,
    isFeatured: false
  },
  // San José de Ocoa
  {
    id: 'san-jose-de-ocoa',
    slug: 'san-jose-de-ocoa',
    name: 'San José de Ocoa',
    region: 'sur',
    type: 'provincia',
    categories: ['montaña', 'ecoturismo'],
    shortDescription: 'La Suiza del Caribe con montañas verdes y café de altura.',
    description: 'San José de Ocoa es conocida como la Suiza del Caribe por sus montañas verdes y clima fresco. Es un destino emergente de ecoturismo con senderos de montaña, cascadas escondidas y fincas de café orgánico de altura. La provincia ofrece una escapada refrescante del calor costero.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg'],
    highlights: ['Montañas verdes', 'Café de altura', 'Cascadas', 'Senderismo'],
    bestTimeToVisit: 'Todo el año, especialmente dic-mar',
    howToGetThere: '2 horas desde Santo Domingo.',
    weatherInfo: 'Clima fresco de montaña, 18-25°C.',
    typicalDishes: ['Café orgánico', 'Chivo guisado', 'Habichuelas con dulce'],
    latitude: 18.5431,
    longitude: -70.5061,
    isPopular: false,
    isFeatured: false
  },
  // Elías Piña
  {
    id: 'elias-pina',
    slug: 'elias-pina',
    name: 'Elías Piña',
    region: 'sur',
    type: 'provincia',
    categories: ['cultura', 'ecoturismo'],
    shortDescription: 'Frontera con Haití, mercado binacional y tradiciones vudú sincréticas.',
    description: 'Elías Piña, en la frontera con Haití, es famosa por su colorido mercado binacional cada lunes y viernes. La provincia ofrece una experiencia cultural única con la fusión de tradiciones dominicanas y haitianas, incluyendo las fiestas de San Santiago con ceremonias sincréticas. Las montañas fronterizas ofrecen paisajes poco explorados.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg'],
    highlights: ['Mercado binacional', 'Fiestas de San Santiago', 'Frontera cultural', 'Montañas vírgenes'],
    bestTimeToVisit: 'Julio para fiestas de Santiago',
    howToGetThere: '4 horas desde Santo Domingo.',
    weatherInfo: 'Clima seco y caluroso en los valles.',
    typicalDishes: ['Chenchén', 'Chivo guisado', 'Plátano maduro'],
    latitude: 18.8761,
    longitude: -71.6983,
    isPopular: false,
    isFeatured: false
  },
  // Dajabón
  {
    id: 'dajabon',
    slug: 'dajabon',
    name: 'Dajabón',
    region: 'norte',
    type: 'provincia',
    categories: ['cultura'],
    shortDescription: 'Frontera norte con Haití y el famoso mercado fronterizo del río Masacre.',
    description: 'Dajabón es la principal ciudad fronteriza del norte, separada de Haití por el histórico río Masacre. Su mercado fronterizo es uno de los más activos del Caribe, donde comerciantes de ambos países intercambian productos en un ambiente vibrante y colorido. La provincia ofrece una experiencia cultural fronteriza única.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg'],
    highlights: ['Mercado fronterizo', 'Río Masacre', 'Cultura fronteriza', 'Comercio binacional'],
    bestTimeToVisit: 'Lunes y viernes (días de mercado)',
    howToGetThere: '5 horas desde Santo Domingo.',
    weatherInfo: 'Clima cálido y seco.',
    typicalDishes: ['Chivo liniero', 'Plátano maduro', 'Habichuelas con dulce'],
    latitude: 19.5489,
    longitude: -71.7083,
    isPopular: false,
    isFeatured: false
  },
  // Valverde
  {
    id: 'valverde',
    slug: 'valverde',
    name: 'Valverde',
    region: 'norte',
    type: 'provincia',
    categories: ['cultura'],
    shortDescription: 'Capital Mao, tierra del arroz dominicano y la presa de Monción.',
    description: 'Valverde, con capital en Mao, es el principal productor de arroz de República Dominicana, el alimento fundamental de la dieta dominicana. La Presa de Monción y sus alrededores ofrecen paisajes naturales para excursiones. La provincia mantiene tradiciones agrícolas arraigadas y un estilo de vida rural auténtico.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg'],
    highlights: ['Capital del arroz', 'Presa de Monción', 'Agricultura tradicional', 'Gastronomía rural'],
    bestTimeToVisit: 'Noviembre a Abril',
    howToGetThere: '3.5 horas desde Santo Domingo.',
    weatherInfo: 'Clima cálido y seco en el valle.',
    typicalDishes: ['Arroz dominicano', 'Habichuelas guisadas', 'Chivo liniero'],
    latitude: 19.5872,
    longitude: -71.0828,
    isPopular: false,
    isFeatured: false
  },
  // Santiago Rodríguez
  {
    id: 'santiago-rodriguez',
    slug: 'santiago-rodriguez',
    name: 'Santiago Rodríguez',
    region: 'norte',
    type: 'provincia',
    categories: ['ecoturismo', 'cultura'],
    shortDescription: 'Cuna de la Restauración dominicana con la Presa de Tavera.',
    description: 'Santiago Rodríguez, con capital en Sabaneta, es la Cuna de la Restauración, donde en 1863 se inició la guerra que restauró la república tras la anexión a España. La provincia ofrece la impresionante Presa de Tavera-Bao, montañas de la Cordillera Central y un patrimonio histórico ligado a la identidad nacional.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg'],
    highlights: ['Cuna de la Restauración', 'Presa de Tavera', 'Montañas', 'Historia patriótica'],
    bestTimeToVisit: 'Agosto para fiestas de la Restauración',
    howToGetThere: '4 horas desde Santo Domingo.',
    weatherInfo: 'Clima tropical fresco en las montañas.',
    typicalDishes: ['Chivo liniero', 'Habichuelas con dulce', 'Arroz con pollo'],
    latitude: 19.4683,
    longitude: -71.3361,
    isPopular: false,
    isFeatured: false
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
    highlights: ['Playa Bávaro', 'Hoyo Azul', 'Indigenous Eyes Ecological Park', 'Golf de clase mundial', 'Vida nocturna vibrante'],
    bestTimeToVisit: 'Diciembre a Abril para clima perfecto; todo el año es bueno',
    howToGetThere: 'Aeropuerto Internacional de Punta Cana (PUJ) - el más transitado del Caribe. Vuelos directos desde 70+ ciudades.',
    weatherInfo: 'Clima tropical perfecto con temperatura promedio de 27°C. Temporada de huracanes junio-noviembre (raro impacto directo).',
    typicalDishes: ['Langosta a la criolla', 'Pescado con coco', 'Ceviche tropical', 'Mofongo de mariscos'],
    latitude: 18.5601,
    longitude: -68.3725,
    isPopular: true,
    isRecommended: true,
    isFeatured: true,
    activities: [
      { name: 'Snorkel en arrecifes', type: 'aventura', duration: '3 horas', price: '$45-80 USD', description: 'Explora los coloridos arrecifes de coral con guías expertos' },
      { name: 'Excursión a Isla Saona', type: 'naturaleza', duration: 'Día completo', price: '$80-150 USD', description: 'Paraíso virgen con piscinas naturales y estrellas de mar' },
      { name: 'Tirolesa en Scape Park', type: 'aventura', duration: '4 horas', price: '$100-180 USD', description: '12 líneas de zipline sobre cenotes y selva tropical' },
      { name: 'Golf en Punta Espada', type: 'relajación', duration: '5 horas', price: '$350+ USD', description: 'Campo diseñado por Jack Nicklaus, ranked #1 en el Caribe' },
      { name: 'Fiesta en Coco Bongo', type: 'nocturno', duration: '4 horas', price: '$80-120 USD', description: 'El club nocturno más famoso del Caribe con shows espectaculares' },
      { name: 'Tour gastronómico', type: 'gastronómico', duration: '3 horas', price: '$60-90 USD', description: 'Degusta los sabores auténticos dominicanos' },
    ],
    attractions: [
      { name: 'Hoyo Azul', type: 'natural', description: 'Cenote de aguas turquesas en un acantilado de 75 pies', entryFee: '$25 USD', hours: '8:00 AM - 5:00 PM' },
      { name: 'Indigenous Eyes Ecological Park', type: 'natural', description: '12 lagunas de agua dulce en reserva ecológica privada', entryFee: '$50 USD', hours: '8:30 AM - 5:30 PM' },
      { name: 'Playa Macao', type: 'natural', description: 'Playa pública perfecta para surf y ambiente local auténtico' },
      { name: 'Marinarium', type: 'entretenimiento', description: 'Nada con tiburones y rayas en ambiente controlado', entryFee: '$99 USD' },
    ],
    tips: [
      'Reserva excursiones con anticipación en temporada alta (dic-abril)',
      'Negocia precios con vendedores de playa - siempre puedes obtener mejor precio',
      'Lleva protector solar reef-safe para proteger los arrecifes',
      'El agua del grifo no es potable - usa embotellada',
      'Propina estándar: 10-15% en restaurantes fuera del resort',
    ],
    nearbyAirport: 'Aeropuerto Internacional de Punta Cana (PUJ)',
    distanceFromAirport: '15-30 minutos dependiendo del resort',
    averageBudget: {
      budget: '$100-150 USD/día',
      mid: '$200-350 USD/día',
      luxury: '$500+ USD/día',
    },
    bestFor: ['Parejas en luna de miel', 'Familias', 'Amantes del golf', 'Viajeros de lujo', 'Fiestas y vida nocturna'],
    notRecommendedFor: ['Mochileros con presupuesto muy limitado', 'Quienes buscan experiencia cultural auténtica'],
    minimumDays: 3,
    idealDays: 5,
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
    highlights: ['Playa Cosón', 'Playa Bonita', 'Cascada El Limón', 'Gastronomía internacional', 'Avistamiento de ballenas'],
    bestTimeToVisit: 'Enero a Marzo para ballenas; Diciembre a Abril para clima',
    howToGetThere: '45 minutos desde el Aeropuerto El Catey (AZS) o 2.5 horas desde Santo Domingo.',
    weatherInfo: 'Clima tropical húmedo. Más lluvioso que el este. Temperaturas 24-30°C.',
    typicalDishes: ['Pescado con coco', 'Cocina francesa-dominicana', 'Langostinos', 'Cangrejo guisado'],
    latitude: 19.3120,
    longitude: -69.5420,
    isPopular: true,
    isRecommended: true,
    isFeatured: true,
    activities: [
      { name: 'Cascada El Limón a caballo', type: 'aventura', duration: '4 horas', price: '$35-60 USD', description: 'Cabalgata por senderos selváticos hasta una cascada de 40 metros' },
      { name: 'Avistamiento de ballenas', type: 'naturaleza', duration: '4 horas', price: '$60-90 USD', description: 'Experiencia única con ballenas jorobadas (enero-marzo)' },
      { name: 'Tour Parque Los Haitises', type: 'naturaleza', duration: 'Día completo', price: '$80-120 USD', description: 'Manglares, cuevas Taínas y bahía con islotes' },
      { name: 'Clases de kitesurf', type: 'aventura', duration: '3 horas', price: '$100-150 USD', description: 'Aprende kitesurf en Playa Popy con instructores certificados' },
      { name: 'Tour gastronómico', type: 'gastronómico', duration: '3 horas', price: '$50-80 USD', description: 'Descubre la fusión franco-dominicana única del pueblo' },
    ],
    attractions: [
      { name: 'Cascada El Limón', type: 'natural', description: 'Majestuosa cascada de 40 metros en la selva tropical', entryFee: '$5-10 USD (sin tour)' },
      { name: 'Playa Cosón', type: 'natural', description: '4 km de arena dorada y cocoteros - menos turística' },
      { name: 'Playa Bonita', type: 'natural', description: 'Bahía tranquila ideal para snorkel y kayak' },
      { name: 'Pueblo Pescadores', type: 'entretenimiento', description: 'Centro gastronómico con restaurantes de clase mundial' },
    ],
    tips: [
      'Alquila un quad o moto para explorar las playas remotas',
      'Los restaurantes franceses ofrecen la mejor relación calidad-precio para cenas',
      'Reserva avistamiento de ballenas con anticipación en temporada alta',
      'La electricidad puede ser intermitente - los hoteles buenos tienen generador',
    ],
    nearbyAirport: 'Aeropuerto Internacional El Catey (AZS)',
    distanceFromAirport: '45 minutos',
    averageBudget: {
      budget: '$60-100 USD/día',
      mid: '$120-200 USD/día',
      luxury: '$300+ USD/día',
    },
    bestFor: ['Parejas románticas', 'Fotógrafos', 'Amantes de la naturaleza', 'Foodies', 'Viajeros independientes'],
    notRecommendedFor: ['Quienes buscan vida nocturna intensa', 'Familias con niños que prefieren resorts'],
    minimumDays: 2,
    idealDays: 4,
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
    highlights: ['Salto de Jimenoa', 'Rafting en Río Yaque', 'Pico Duarte', 'Parapente', 'Café de altura'],
    bestTimeToVisit: 'Todo el año; nov-feb más fresco; evitar sep-oct por lluvias',
    howToGetThere: '2 horas desde Santo Domingo por autopista Duarte. No hay aeropuerto cercano.',
    weatherInfo: 'Clima templado de montaña único en el Caribe. 16-25°C. Puede bajar a 10°C en invierno.',
    typicalDishes: ['Chivo liniero', 'Habichuelas con dulce', 'Moro de guandules', 'Café orgánico'],
    latitude: 19.1200,
    longitude: -70.6400,
    isPopular: true,
    isRecommended: true,
    isFeatured: true,
    activities: [
      { name: 'Rafting Río Yaque del Norte', type: 'aventura', duration: '3-4 horas', price: '$65-95 USD', description: 'Rápidos clase II-III en el río más largo del Caribe' },
      { name: 'Canyoning', type: 'aventura', duration: '4 horas', price: '$75-100 USD', description: 'Rappel por cascadas, saltos y natación en cañones' },
      { name: 'Parapente', type: 'aventura', duration: '30 min vuelo', price: '$80-120 USD', description: 'Vuela sobre el valle con vistas espectaculares' },
      { name: 'Expedición Pico Duarte', type: 'aventura', duration: '2-3 días', price: '$250-400 USD', description: 'Conquista el pico más alto del Caribe (3,098m)' },
      { name: 'Tour de café', type: 'gastronómico', duration: '2 horas', price: '$25-45 USD', description: 'Visita fincas de café orgánico y degustación' },
      { name: 'Cabalgata a cascadas', type: 'naturaleza', duration: '3 horas', price: '$35-50 USD', description: 'Recorre senderos a caballo hacia cascadas escondidas' },
    ],
    attractions: [
      { name: 'Salto de Jimenoa', type: 'natural', description: 'Cascada de 40 metros accesible por puente colgante', entryFee: 'RD$ 100 (~$2 USD)' },
      { name: 'Salto Baiguate', type: 'natural', description: 'Cascada con piscina natural para nadar', entryFee: 'RD$ 100' },
      { name: 'Pico Duarte', type: 'natural', description: 'El techo del Caribe a 3,098 metros - requiere 2-3 días' },
      { name: 'Rancho Baiguate', type: 'entretenimiento', description: 'Centro de ecoaventura con todas las actividades' },
    ],
    tips: [
      'Trae ropa abrigada - las noches son frescas (10-15°C)',
      'Reserva expediciones al Pico Duarte con semanas de anticipación',
      'Los mejores operadores de aventura: Rancho Baiguate y Flying Tony',
      'El café local es excelente - compra directamente en fincas',
      'Alquila un carro 4x4 para explorar caminos rurales',
    ],
    nearbyAirport: 'Aeropuerto del Cibao (STI) en Santiago',
    distanceFromAirport: '1.5 horas desde Santiago',
    averageBudget: {
      budget: '$40-70 USD/día',
      mid: '$80-150 USD/día',
      luxury: '$200+ USD/día',
    },
    bestFor: ['Aventureros', 'Amantes de la naturaleza', 'Senderistas', 'Escapada del calor costero'],
    notRecommendedFor: ['Quienes buscan playa', 'Viajeros que prefieren resorts todo incluido'],
    minimumDays: 2,
    idealDays: 3,
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

// Obtener destinos por provincia (slug o id)
export function getDestinationsByProvince(provinceSlugOrId: string): Destination[] {
  return destinations.filter(d => 
    (d.provinceSlug === provinceSlugOrId || d.provinceId === provinceSlugOrId) && 
    d.type !== 'provincia'
  );
}

// Obtener municipios de una provincia
export function getMunicipalitiesByProvince(provinceId: string): Destination[] {
  return destinations.filter(d => d.provinceId === provinceId && d.type === 'municipio');
}

// Obtener destinos de un municipio
export function getDestinationsByMunicipality(municipalityId: string): Destination[] {
  return destinations.filter(d => d.municipalityId === municipalityId);
}

// Obtener la cadena jerárquica completa de un destino
export function getDestinationHierarchy(destinationId: string): {
  province?: Destination;
  municipality?: Destination;
  destination?: Destination;
} {
  const destination = getDestinationById(destinationId);
  if (!destination) return {};
  
  const province = destination.provinceId ? getDestinationById(destination.provinceId) : undefined;
  const municipality = destination.municipalityId ? getDestinationById(destination.municipalityId) : undefined;
  
  return { province, municipality, destination };
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

// Obtener URL del destino según su tipo
export function getDestinationUrl(destination: Destination): string {
  return `/destino/${destination.slug}`;
}
