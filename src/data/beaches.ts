// Datos estáticos de playas de República Dominicana
//
// === GUÍA PARA CREAR NUEVAS PÁGINAS DE PLAYA ===
//
// 1. AGREGAR DATOS: Añadir el objeto de la playa a este archivo (beaches array)
// 2. CREAR PÁGINA: Crear archivo en src/pages/playas/NombrePlaya.tsx
// 3. AGREGAR RUTA: Registrar la ruta en src/App.tsx como /playa/slug
//
// Ejemplo de página de playa:
// ```tsx
// import { StaticBeachPage } from "@/components/StaticBeachPage";
// import { getBeachBySlug } from "@/data/beaches";
//
// export default function PlayaEjemplo() {
//   const beach = getBeachBySlug('playa-ejemplo');
//   if (!beach) return <div>Playa no encontrada</div>;
//   return <StaticBeachPage beach={beach} />;
// }
// ```
//
// === JERARQUÍA ===
// La playa pertenece a una provincia, y opcionalmente a un municipio o destino
// - provinceId: ID de la provincia (obligatorio)
// - municipalityId: ID del municipio si aplica (opcional)
// - destinationId: ID del destino turístico si aplica (opcional)

export interface Beach {
  id: string;
  slug: string;
  name: string;
  // Jerarquía geográfica
  province: string;              // Nombre de la provincia para mostrar
  provinceId: string;            // ID de la provincia (obligatorio)
  provinceSlug: string;          // Slug de la provincia para URLs
  municipalityId?: string;       // ID del municipio padre (si aplica)
  municipalityName?: string;     // Nombre del municipio para mostrar
  destinationId?: string;        // ID del destino turístico (si aplica)
  destinationName?: string;      // Nombre del destino para mostrar
  // Información general
  beachType: 'arena-blanca' | 'arena-dorada' | 'virgen' | 'bahia' | 'deportiva' | 'urbana';
  shortDescription: string;
  description: string;
  imageUrl: string;
  gallery: string[];
  activities: string[];
  amenities: string[];
  rating: number;
  // Características
  waterColor: string;
  sandType: string;
  waveIntensity: 'calma' | 'moderada' | 'fuerte';
  crowdLevel: 'baja' | 'media' | 'alta';
  // Acceso
  accessType: 'publico' | 'semi-privado' | 'privado';
  parkingAvailable: boolean;
  lifeguardOnDuty: boolean;
  // Ubicación
  latitude?: number;
  longitude?: number;
  howToGetThere: string;
  bestTimeToVisit: string;
  // Destacados
  isPopular?: boolean;
  isFeatured?: boolean;
}

export const beaches: Beach[] = [
  // === LA ALTAGRACIA ===
  {
    id: 'playa-bavaro',
    slug: 'playa-bavaro',
    name: 'Playa Bávaro',
    province: 'La Altagracia',
    provinceId: 'la-altagracia',
    provinceSlug: 'la-altagracia',
    destinationId: 'bavaro',
    destinationName: 'Bávaro',
    beachType: 'arena-blanca',
    shortDescription: 'La playa más famosa del Caribe, reconocida por la UNESCO como una de las mejores del mundo.',
    description: 'Playa Bávaro es el ícono de Punta Cana y del Caribe dominicano. Con más de 30 kilómetros de arena blanca como el azúcar y aguas cristalinas de color turquesa, ha sido reconocida por la UNESCO como una de las mejores playas del mundo. Bordeada de cocoteros y resorts de clase mundial, ofrece todas las comodidades mientras mantiene su belleza natural impresionante.',
    imageUrl: 'https://images.unsplash.com/photo-1781901227396-34e5fc040091?w=1200&h=800&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1781901227396-34e5fc040091?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1781901227396-34e5fc040091?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1781901227396-34e5fc040091?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1781901227396-34e5fc040091?w=1200&h=800&fit=crop&q=80'],
    activities: ['Snorkel', 'Parasailing', 'Catamarán', 'Paddleboard', 'Jet ski', 'Banana boat', 'Buceo'],
    amenities: ['Sillas y sombrillas', 'Restaurantes', 'Bares de playa', 'Duchas', 'Baños', 'Deportes acuáticos'],
    rating: 4.9,
    waterColor: 'Turquesa cristalino',
    sandType: 'Arena blanca fina',
    waveIntensity: 'calma',
    crowdLevel: 'alta',
    accessType: 'semi-privado',
    parkingAvailable: true,
    lifeguardOnDuty: true,
    latitude: 18.6870,
    longitude: -68.4514,
    howToGetThere: '15 minutos desde el Aeropuerto Internacional de Punta Cana. Acceso principal por los resorts de la zona.',
    bestTimeToVisit: 'Todo el año, especialmente de diciembre a abril',
    isPopular: true,
    isFeatured: true
  },
  {
    id: 'playa-juanillo',
    slug: 'playa-juanillo',
    name: 'Playa Juanillo',
    province: 'La Altagracia',
    provinceId: 'la-altagracia',
    provinceSlug: 'la-altagracia',
    destinationId: 'cap-cana',
    destinationName: 'Cap Cana',
    beachType: 'arena-blanca',
    shortDescription: 'La playa más exclusiva de República Dominicana en el desarrollo de lujo Cap Cana.',
    description: 'Playa Juanillo es la joya de Cap Cana, considerada una de las playas más exclusivas del Caribe. Su arena blanca inmaculada y aguas cristalinas crean un escenario perfecto. A diferencia de otras playas de la zona, Juanillo mantiene un ambiente más íntimo y exclusivo, con beach clubs de lujo y restaurantes gourmet.',
    imageUrl: 'https://images.unsplash.com/photo-1781901227396-34e5fc040091?w=1200&h=800&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1781901227396-34e5fc040091?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1781901227396-34e5fc040091?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1781901227396-34e5fc040091?w=1200&h=800&fit=crop&q=80'],
    activities: ['Snorkel', 'Kayak', 'Paddleboard', 'Paseos en yate', 'Buceo'],
    amenities: ['Beach clubs', 'Restaurantes de lujo', 'Servicio de playa VIP', 'Duchas', 'Estacionamiento'],
    rating: 4.9,
    waterColor: 'Turquesa claro',
    sandType: 'Arena blanca muy fina',
    waveIntensity: 'calma',
    crowdLevel: 'baja',
    accessType: 'semi-privado',
    parkingAvailable: true,
    lifeguardOnDuty: true,
    latitude: 18.4245,
    longitude: -68.3862,
    howToGetThere: '10 minutos desde el Aeropuerto de Punta Cana, dentro del desarrollo Cap Cana.',
    bestTimeToVisit: 'Todo el año',
    isPopular: true,
    isFeatured: true
  },
  {
    id: 'playa-macao',
    slug: 'playa-macao',
    name: 'Playa Macao',
    province: 'La Altagracia',
    provinceId: 'la-altagracia',
    provinceSlug: 'la-altagracia',
    beachType: 'virgen',
    shortDescription: 'Playa salvaje perfecta para surf y escapar de las multitudes.',
    description: 'Playa Macao es la alternativa perfecta para quienes buscan una experiencia más auténtica. Esta playa pública, una de las pocas que quedan sin desarrollar en la zona, ofrece olas perfectas para surf y bodyboard. Su arena dorada y palmeras inclinadas crean un escenario tropical clásico.',
    imageUrl: 'https://images.unsplash.com/photo-1730944527343-74e3e09f088b?w=1200&h=800&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1730944527343-74e3e09f088b?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1730944527343-74e3e09f088b?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1730944527343-74e3e09f088b?w=1200&h=800&fit=crop&q=80'],
    activities: ['Surf', 'Bodyboard', 'Paseos en buggy', 'Fotografía', 'Natación'],
    amenities: ['Restaurantes locales', 'Vendedores de playa', 'Estacionamiento'],
    rating: 4.6,
    waterColor: 'Azul intenso',
    sandType: 'Arena dorada',
    waveIntensity: 'fuerte',
    crowdLevel: 'media',
    accessType: 'publico',
    parkingAvailable: true,
    lifeguardOnDuty: false,
    latitude: 18.7521,
    longitude: -68.5182,
    howToGetThere: '30 minutos desde Punta Cana hacia el norte.',
    bestTimeToVisit: 'Todo el año, mejor oleaje en invierno',
    isPopular: true,
    isFeatured: true
  },

  // === SAMANÁ ===
  {
    id: 'playa-rincon',
    slug: 'playa-rincon',
    name: 'Playa Rincón',
    province: 'Samaná',
    provinceId: 'samana',
    provinceSlug: 'samana',
    destinationId: 'las-galeras',
    destinationName: 'Las Galeras',
    beachType: 'virgen',
    shortDescription: 'Considerada una de las mejores playas del mundo por su belleza virgen e intacta.',
    description: 'Playa Rincón es consistentemente clasificada entre las mejores playas del mundo. Esta joya de 3 kilómetros de arena dorada rodeada de palmeras y montañas verdes permanece prácticamente intacta. El agua cristalina y la tranquilidad la hacen perfecta para quienes buscan la playa caribeña de sus sueños.',
    imageUrl: 'https://images.unsplash.com/photo-1541417904950-b855846fe074?w=1200&h=800&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1541417904950-b855846fe074?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1541417904950-b855846fe074?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1541417904950-b855846fe074?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1541417904950-b855846fe074?w=1200&h=800&fit=crop&q=80'],
    activities: ['Natación', 'Snorkel', 'Picnic', 'Fotografía', 'Caminatas'],
    amenities: ['Restaurantes rústicos', 'Sillas bajo palmeras', 'Comida local'],
    rating: 5.0,
    waterColor: 'Turquesa cristalino',
    sandType: 'Arena dorada fina',
    waveIntensity: 'calma',
    crowdLevel: 'baja',
    accessType: 'publico',
    parkingAvailable: true,
    lifeguardOnDuty: false,
    latitude: 19.2638,
    longitude: -69.2505,
    howToGetThere: 'En bote desde Las Galeras (15 min) o por carretera de tierra (30 min).',
    bestTimeToVisit: 'Diciembre a abril',
    isPopular: true,
    isFeatured: true
  },
  {
    id: 'playa-coson',
    slug: 'playa-coson',
    name: 'Playa Cosón',
    province: 'Samaná',
    provinceId: 'samana',
    provinceSlug: 'samana',
    destinationId: 'las-terrenas',
    destinationName: 'Las Terrenas',
    beachType: 'virgen',
    shortDescription: 'Extensa playa salvaje ideal para caminatas románticas al atardecer.',
    description: 'Playa Cosón es una de las playas más largas y hermosas de Samaná. Sus 5 kilómetros de arena dorada bordeados de palmeras cocoteras ofrecen un escenario idílico. El oleaje moderado y las corrientes la hacen popular entre surfistas principiantes.',
    imageUrl: 'https://images.unsplash.com/photo-1730944527343-74e3e09f088b?w=1200&h=800&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1730944527343-74e3e09f088b?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1730944527343-74e3e09f088b?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1730944527343-74e3e09f088b?w=1200&h=800&fit=crop&q=80'],
    activities: ['Surf', 'Caminatas', 'Cabalgatas', 'Fotografía'],
    amenities: ['Restaurantes rústicos', 'Estacionamiento limitado'],
    rating: 4.7,
    waterColor: 'Azul turquesa',
    sandType: 'Arena dorada',
    waveIntensity: 'moderada',
    crowdLevel: 'baja',
    accessType: 'publico',
    parkingAvailable: true,
    lifeguardOnDuty: false,
    latitude: 19.3420,
    longitude: -69.5010,
    howToGetThere: '10 minutos en carro desde Las Terrenas hacia el oeste.',
    bestTimeToVisit: 'Todo el año',
    isPopular: false,
    isFeatured: true
  },
  {
    id: 'playa-bonita',
    slug: 'playa-bonita',
    name: 'Playa Bonita',
    province: 'Samaná',
    provinceId: 'samana',
    provinceSlug: 'samana',
    destinationId: 'las-terrenas',
    destinationName: 'Las Terrenas',
    beachType: 'bahia',
    shortDescription: 'Bahía protegida con aguas tranquilas ideal para familias.',
    description: 'Playa Bonita hace honor a su nombre. Esta bahía protegida ofrece aguas tranquilas y poco profundas, perfectas para familias con niños. El ambiente es más relajado que Las Terrenas principal, con pequeños hoteles boutique y restaurantes.',
    imageUrl: 'https://images.unsplash.com/photo-1781961486948-dd199476488e?w=1200&h=800&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1781961486948-dd199476488e?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1781961486948-dd199476488e?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1781961486948-dd199476488e?w=1200&h=800&fit=crop&q=80'],
    activities: ['Natación', 'Snorkel', 'Kayak', 'Paddleboard'],
    amenities: ['Hoteles boutique', 'Restaurantes', 'Sillas de playa'],
    rating: 4.6,
    waterColor: 'Verde turquesa',
    sandType: 'Arena dorada',
    waveIntensity: 'calma',
    crowdLevel: 'media',
    accessType: 'publico',
    parkingAvailable: true,
    lifeguardOnDuty: false,
    latitude: 19.3250,
    longitude: -69.5580,
    howToGetThere: '5 minutos desde el centro de Las Terrenas.',
    bestTimeToVisit: 'Todo el año',
    isPopular: false,
    isFeatured: false
  },

  // === PUERTO PLATA ===
  {
    id: 'playa-sosua',
    slug: 'playa-sosua',
    name: 'Playa Sosúa',
    province: 'Puerto Plata',
    provinceId: 'puerto-plata',
    provinceSlug: 'puerto-plata',
    destinationId: 'sosua',
    destinationName: 'Sosúa',
    beachType: 'bahia',
    shortDescription: 'Bahía protegida perfecta para snorkel con vida marina abundante.',
    description: 'Playa Sosúa es una pintoresca bahía en forma de herradura protegida por arrecifes de coral. Sus aguas tranquilas y cristalinas albergan una vida marina impresionante, haciéndola uno de los mejores lugares para snorkel en la costa norte. El ambiente es vibrante con restaurantes, bares y vendedores locales.',
    imageUrl: 'https://images.unsplash.com/photo-1781961486948-dd199476488e?w=1200&h=800&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1781961486948-dd199476488e?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1781961486948-dd199476488e?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1781961486948-dd199476488e?w=1200&h=800&fit=crop&q=80'],
    activities: ['Snorkel', 'Buceo', 'Kayak', 'Paddleboard', 'Paseos en bote'],
    amenities: ['Restaurantes', 'Bares', 'Alquiler de equipos', 'Duchas', 'Baños'],
    rating: 4.6,
    waterColor: 'Turquesa claro',
    sandType: 'Arena dorada fina',
    waveIntensity: 'calma',
    crowdLevel: 'alta',
    accessType: 'publico',
    parkingAvailable: true,
    lifeguardOnDuty: true,
    latitude: 19.7567,
    longitude: -70.5132,
    howToGetThere: '20 minutos desde el Aeropuerto de Puerto Plata.',
    bestTimeToVisit: 'Diciembre a abril',
    isPopular: true,
    isFeatured: true
  },
  {
    id: 'playa-cabarete',
    slug: 'playa-cabarete',
    name: 'Playa Cabarete',
    province: 'Puerto Plata',
    provinceId: 'puerto-plata',
    provinceSlug: 'puerto-plata',
    destinationId: 'cabarete',
    destinationName: 'Cabarete',
    beachType: 'deportiva',
    shortDescription: 'Capital mundial del kitesurf y windsurf con vientos perfectos todo el año.',
    description: 'Playa Cabarete es mundialmente famosa como la capital del kitesurf y windsurf. Los vientos alisios constantes y las condiciones ideales atraen a atletas y entusiastas de todo el mundo. El pueblo tiene un ambiente joven, internacional y vibrante, con excelente vida nocturna.',
    imageUrl: 'https://images.unsplash.com/photo-1674951447608-8bb6c3e4700d?w=1200&h=800&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1674951447608-8bb6c3e4700d?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1674951447608-8bb6c3e4700d?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1674951447608-8bb6c3e4700d?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1674951447608-8bb6c3e4700d?w=1200&h=800&fit=crop&q=80'],
    activities: ['Kitesurf', 'Windsurf', 'Surf', 'Paddleboard', 'Yoga en la playa'],
    amenities: ['Escuelas de kite', 'Restaurantes', 'Bares de playa', 'Alquiler de equipos', 'Wifi'],
    rating: 4.7,
    waterColor: 'Azul atlántico',
    sandType: 'Arena dorada',
    waveIntensity: 'moderada',
    crowdLevel: 'alta',
    accessType: 'publico',
    parkingAvailable: true,
    lifeguardOnDuty: false,
    latitude: 19.7578,
    longitude: -70.4165,
    howToGetThere: '30 minutos desde el Aeropuerto de Puerto Plata.',
    bestTimeToVisit: 'Junio a septiembre para kite, todo el año para surf',
    isPopular: true,
    isFeatured: true
  },
  {
    id: 'playa-dorada',
    slug: 'playa-dorada',
    name: 'Playa Dorada',
    province: 'Puerto Plata',
    provinceId: 'puerto-plata',
    provinceSlug: 'puerto-plata',
    beachType: 'arena-dorada',
    shortDescription: 'Complejo turístico con playa amplia y resorts todo incluido.',
    description: 'Playa Dorada es el principal complejo turístico de Puerto Plata, con una extensa playa de arena dorada bordeada de resorts todo incluido. Ofrece un campo de golf de campeonato, centro comercial y todas las comodidades para unas vacaciones completas.',
    imageUrl: 'https://images.unsplash.com/photo-1775615752013-85ea1ff73929?w=1200&h=800&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1775615752013-85ea1ff73929?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1775615752013-85ea1ff73929?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1775615752013-85ea1ff73929?w=1200&h=800&fit=crop&q=80'],
    activities: ['Golf', 'Deportes acuáticos', 'Tenis', 'Natación'],
    amenities: ['Resorts all-inclusive', 'Golf', 'Centro comercial', 'Restaurantes', 'Spa'],
    rating: 4.4,
    waterColor: 'Azul atlántico',
    sandType: 'Arena dorada',
    waveIntensity: 'moderada',
    crowdLevel: 'media',
    accessType: 'semi-privado',
    parkingAvailable: true,
    lifeguardOnDuty: true,
    latitude: 19.7780,
    longitude: -70.6320,
    howToGetThere: '10 minutos desde el centro de Puerto Plata.',
    bestTimeToVisit: 'Diciembre a abril',
    isPopular: false,
    isFeatured: false
  },

  // === PEDERNALES ===
  {
    id: 'bahia-de-las-aguilas',
    slug: 'bahia-de-las-aguilas',
    name: 'Bahía de las Águilas',
    province: 'Pedernales',
    provinceId: 'pedernales',
    provinceSlug: 'pedernales',
    beachType: 'virgen',
    shortDescription: 'La playa más prístina del Caribe, 8 km de arena virgen sin desarrollo.',
    description: 'Bahía de las Águilas es el tesoro más preciado de República Dominicana. Esta playa de 8 kilómetros de arena blanca virgen dentro del Parque Nacional Jaragua es considerada una de las playas más hermosas y prístinas del mundo. Sin desarrollo, sin electricidad, sin ruido - solo naturaleza pura.',
    imageUrl: 'https://images.unsplash.com/photo-1541417904950-b855846fe074?w=1200&h=800&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1541417904950-b855846fe074?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1541417904950-b855846fe074?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1541417904950-b855846fe074?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1541417904950-b855846fe074?w=1200&h=800&fit=crop&q=80'],
    activities: ['Natación', 'Snorkel', 'Camping', 'Fotografía', 'Observación de aves'],
    amenities: ['Ninguna - llevar todo lo necesario', 'Botes locales para acceso'],
    rating: 5.0,
    waterColor: 'Turquesa cristalino perfecto',
    sandType: 'Arena blanca virgen',
    waveIntensity: 'calma',
    crowdLevel: 'baja',
    accessType: 'publico',
    parkingAvailable: false,
    lifeguardOnDuty: false,
    latitude: 17.8532,
    longitude: -71.6245,
    howToGetThere: 'En bote desde La Cueva o Cabo Rojo (30-45 min). No hay acceso por carretera.',
    bestTimeToVisit: 'Diciembre a abril',
    isPopular: true,
    isFeatured: true
  },

  // === SANTO DOMINGO ===
  {
    id: 'playa-boca-chica',
    slug: 'playa-boca-chica',
    name: 'Playa Boca Chica',
    province: 'Santo Domingo',
    provinceId: 'santo-domingo',
    provinceSlug: 'santo-domingo',
    municipalityId: 'boca-chica-muni',
    municipalityName: 'Boca Chica',
    beachType: 'bahia',
    shortDescription: 'Piscina natural del Caribe, la playa más cercana a Santo Domingo.',
    description: 'Boca Chica es famosa por ser una "piscina natural" - una bahía protegida por arrecifes que crea aguas extremadamente tranquilas y poco profundas. Es la escapada de playa favorita de los capitalinos, a solo 30 minutos de Santo Domingo. El ambiente es festivo y familiar los fines de semana.',
    imageUrl: 'https://images.unsplash.com/photo-1781961486948-dd199476488e?w=1200&h=800&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1781961486948-dd199476488e?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1781961486948-dd199476488e?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1781961486948-dd199476488e?w=1200&h=800&fit=crop&q=80'],
    activities: ['Natación', 'Paddleboard', 'Paseos en bote', 'Deportes de playa'],
    amenities: ['Restaurantes', 'Bares', 'Sillas y sombrillas', 'Vendedores locales', 'Música'],
    rating: 4.3,
    waterColor: 'Turquesa claro',
    sandType: 'Arena blanca',
    waveIntensity: 'calma',
    crowdLevel: 'alta',
    accessType: 'publico',
    parkingAvailable: true,
    lifeguardOnDuty: true,
    latitude: 18.4486,
    longitude: -69.6072,
    howToGetThere: '30 minutos desde Santo Domingo por autopista.',
    bestTimeToVisit: 'Todo el año, entre semana para menos gente',
    isPopular: true,
    isFeatured: true
  },
  {
    id: 'playa-juan-dolio',
    slug: 'playa-juan-dolio',
    name: 'Playa Juan Dolio',
    province: 'San Pedro de Macorís',
    provinceId: 'san-pedro-de-macoris',
    provinceSlug: 'san-pedro-de-macoris',
    destinationId: 'juan-dolio',
    destinationName: 'Juan Dolio',
    beachType: 'arena-blanca',
    shortDescription: 'Playa tranquila con resorts y apartamentos de playa.',
    description: 'Juan Dolio ofrece una alternativa más tranquila a Boca Chica. Esta serie de playas conectadas tiene arena suave, aguas claras y un ambiente más relajado. Es popular entre dominicanos de clase media y expatriados que buscan una experiencia de playa accesible.',
    imageUrl: 'https://images.unsplash.com/photo-1781901227396-34e5fc040091?w=1200&h=800&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1781901227396-34e5fc040091?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1781901227396-34e5fc040091?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1781901227396-34e5fc040091?w=1200&h=800&fit=crop&q=80'],
    activities: ['Natación', 'Snorkel', 'Golf cercano', 'Caminatas'],
    amenities: ['Resorts', 'Restaurantes', 'Bares de playa', 'Estacionamiento'],
    rating: 4.2,
    waterColor: 'Azul turquesa',
    sandType: 'Arena blanca',
    waveIntensity: 'calma',
    crowdLevel: 'media',
    accessType: 'publico',
    parkingAvailable: true,
    lifeguardOnDuty: false,
    latitude: 18.4268,
    longitude: -69.4320,
    howToGetThere: '45 minutos desde Santo Domingo por autopista del este.',
    bestTimeToVisit: 'Todo el año',
    isPopular: false,
    isFeatured: false
  },

  // === LA ROMANA ===
  {
    id: 'isla-saona',
    slug: 'isla-saona',
    name: 'Isla Saona',
    province: 'La Romana',
    provinceId: 'la-romana',
    provinceSlug: 'la-romana',
    destinationId: 'bayahibe',
    destinationName: 'Bayahíbe',
    beachType: 'virgen',
    shortDescription: 'Isla paradisíaca dentro del Parque Nacional del Este, la excursión más popular de RD.',
    description: 'Isla Saona es la excursión de playa más popular de República Dominicana. Esta isla dentro del Parque Nacional del Este ofrece playas vírgenes de postal, piscinas naturales con estrellas de mar, y un ambiente tropical perfecto. Miles de visitantes llegan diariamente en catamaranes desde Bayahíbe.',
    imageUrl: 'https://images.unsplash.com/photo-1730944527343-74e3e09f088b?w=1200&h=800&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1730944527343-74e3e09f088b?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1730944527343-74e3e09f088b?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1730944527343-74e3e09f088b?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1730944527343-74e3e09f088b?w=1200&h=800&fit=crop&q=80'],
    activities: ['Snorkel', 'Piscinas naturales', 'Catamarán', 'Observación de estrellas de mar'],
    amenities: ['Almuerzo incluido en tours', 'Barra abierta en tours', 'Baños'],
    rating: 4.7,
    waterColor: 'Turquesa perfecta',
    sandType: 'Arena blanca',
    waveIntensity: 'calma',
    crowdLevel: 'alta',
    accessType: 'publico',
    parkingAvailable: false,
    lifeguardOnDuty: false,
    latitude: 18.1508,
    longitude: -68.7189,
    howToGetThere: 'En catamarán o lancha desde Bayahíbe (45-90 min según embarcación).',
    bestTimeToVisit: 'Diciembre a abril, ir temprano',
    isPopular: true,
    isFeatured: true
  },
  {
    id: 'playa-bayahibe',
    slug: 'playa-bayahibe',
    name: 'Playa Bayahíbe',
    province: 'La Romana',
    provinceId: 'la-romana',
    provinceSlug: 'la-romana',
    destinationId: 'bayahibe',
    destinationName: 'Bayahíbe',
    beachType: 'bahia',
    shortDescription: 'Encantador pueblo de pescadores con playa de aguas cristalinas.',
    description: 'Bayahíbe es un pintoresco pueblo de pescadores que ha mantenido su encanto a pesar del turismo. Su pequeña playa de aguas cristalinas es perfecta para snorkel y buceo, con acceso a algunos de los mejores sitios de buceo del país.',
    imageUrl: 'https://images.unsplash.com/photo-1781961486948-dd199476488e?w=1200&h=800&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1781961486948-dd199476488e?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1781961486948-dd199476488e?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1781961486948-dd199476488e?w=1200&h=800&fit=crop&q=80'],
    activities: ['Buceo', 'Snorkel', 'Kayak', 'Pesca', 'Tours a islas'],
    amenities: ['Restaurantes de pescado', 'Centros de buceo', 'Tiendas locales'],
    rating: 4.5,
    waterColor: 'Turquesa cristalino',
    sandType: 'Arena blanca',
    waveIntensity: 'calma',
    crowdLevel: 'media',
    accessType: 'publico',
    parkingAvailable: true,
    lifeguardOnDuty: false,
    latitude: 18.3622,
    longitude: -68.8438,
    howToGetThere: '30 minutos desde La Romana, 1.5 horas desde Punta Cana.',
    bestTimeToVisit: 'Todo el año',
    isPopular: true,
    isFeatured: true
  },

  // === BARAHONA ===
  {
    id: 'playa-san-rafael',
    slug: 'playa-san-rafael',
    name: 'Playa San Rafael',
    province: 'Barahona',
    provinceId: 'barahona',
    provinceSlug: 'barahona',
    beachType: 'virgen',
    shortDescription: 'Playa única donde un río de agua dulce y fría se une con el mar.',
    description: 'Playa San Rafael es una de las playas más únicas del Caribe. Aquí, un río de agua dulce cristalina y fría fluye directamente hacia el mar Caribe, creando piscinas naturales de agua dulce junto a la playa. El contraste de temperaturas y colores es espectacular.',
    imageUrl: 'https://images.unsplash.com/photo-1541417904950-b855846fe074?w=1200&h=800&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1541417904950-b855846fe074?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1541417904950-b855846fe074?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1541417904950-b855846fe074?w=1200&h=800&fit=crop&q=80'],
    activities: ['Natación en río', 'Natación en mar', 'Fotografía', 'Picnic'],
    amenities: ['Comedores locales', 'Estacionamiento', 'Baños rústicos'],
    rating: 4.8,
    waterColor: 'Azul profundo (mar) / Cristalino (río)',
    sandType: 'Piedras y arena',
    waveIntensity: 'moderada',
    crowdLevel: 'media',
    accessType: 'publico',
    parkingAvailable: true,
    lifeguardOnDuty: false,
    latitude: 18.0875,
    longitude: -71.0682,
    howToGetThere: '40 minutos desde Barahona por la carretera costera.',
    bestTimeToVisit: 'Todo el año',
    isPopular: true,
    isFeatured: true
  }
];

// === FUNCIONES DE UTILIDAD ===

export function getBeachBySlug(slug: string): Beach | undefined {
  return beaches.find(b => b.slug === slug);
}

export function getBeachById(id: string): Beach | undefined {
  return beaches.find(b => b.id === id);
}

export function getBeachesByProvince(provinceId: string): Beach[] {
  return beaches.filter(b => b.provinceId === provinceId);
}

export function getBeachesByDestination(destinationId: string): Beach[] {
  return beaches.filter(b => b.destinationId === destinationId);
}

export function getBeachesByType(beachType: Beach['beachType']): Beach[] {
  return beaches.filter(b => b.beachType === beachType);
}

export function getPopularBeaches(): Beach[] {
  return beaches.filter(b => b.isPopular);
}

export function getFeaturedBeaches(): Beach[] {
  return beaches.filter(b => b.isFeatured);
}

export function getVirginBeaches(): Beach[] {
  return beaches.filter(b => b.beachType === 'virgen');
}

export function getCalmBeaches(): Beach[] {
  return beaches.filter(b => b.waveIntensity === 'calma');
}

export function searchBeaches(query: string): Beach[] {
  const lowerQuery = query.toLowerCase();
  return beaches.filter(b => 
    b.name.toLowerCase().includes(lowerQuery) ||
    b.province.toLowerCase().includes(lowerQuery) ||
    b.activities.some(a => a.toLowerCase().includes(lowerQuery))
  );
}

// Obtener la jerarquía completa de una playa
export function getBeachHierarchy(beach: Beach): {
  province: { name: string; slug: string };
  municipality?: { name: string; id: string };
  destination?: { name: string; id: string };
} {
  return {
    province: { name: beach.province, slug: beach.provinceSlug },
    municipality: beach.municipalityId && beach.municipalityName 
      ? { name: beach.municipalityName, id: beach.municipalityId } 
      : undefined,
    destination: beach.destinationId && beach.destinationName
      ? { name: beach.destinationName, id: beach.destinationId }
      : undefined
  };
}
