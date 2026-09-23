// Datos estáticos de experiencias turísticas de República Dominicana
//
// === GUÍA PARA CREAR NUEVAS PÁGINAS DE EXPERIENCIA ===
//
// 1. AGREGAR DATOS: Añadir el objeto de la experiencia a este archivo (experiences array)
// 2. CREAR PÁGINA: Crear archivo en src/pages/experiencias/NombreExperiencia.tsx
// 3. AGREGAR RUTA: Registrar la ruta en src/App.tsx como /experiencia/slug
//
// Ejemplo de página de experiencia:
// ```tsx
// import { StaticExperiencePage } from "@/components/StaticExperiencePage";
// import { getExperienceBySlug } from "@/data/experiences";
//
// export default function ExperienciaEjemplo() {
//   const experience = getExperienceBySlug('experiencia-ejemplo');
//   if (!experience) return <div>Experiencia no encontrada</div>;
//   return <StaticExperiencePage experience={experience} />;
// }
// ```
//
// === JERARQUÍA ===
// La experiencia puede pertenecer a un destino, municipio y/o provincia
// - destinationId: ID del destino donde está (ej: 'jarabacoa')
// - provinceId: ID de la provincia (ej: 'la-vega')
// - municipalityId: ID del municipio si aplica (opcional)

export interface Experience {
  id: string;
  slug: string;
  name: string;
  // Jerarquía geográfica
  destinationId: string;       // ID del destino
  destinationName: string;     // Nombre para mostrar
  province: string;            // Nombre de la provincia para mostrar
  provinceId?: string;         // ID de la provincia padre
  municipalityId?: string;     // ID del municipio padre (si aplica)
  category: 'aventura' | 'cultura' | 'naturaleza' | 'gastronomia' | 'wellness' | 'romance' | 'familia' | 'lujo' | 'deportes';
  experienceType: string;
  difficulty?: 'facil' | 'moderado' | 'dificil';
  duration: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  gallery: string[];
  highlights: string[];
  included: string[];
  requirements?: string[];
  bestSeason: string;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
}

export const experiences: Experience[] = [
  // === AVENTURA ===
  {
    id: 'rafting-jarabacoa',
    slug: 'rafting-jarabacoa',
    name: 'Rafting en Río Yaque del Norte',
    destinationId: 'jarabacoa',
    destinationName: 'Jarabacoa',
    province: 'La Vega',
    category: 'aventura',
    experienceType: 'Rafting',
    difficulty: 'moderado',
    duration: '3-4 horas',
    shortDescription: 'Desciende los rápidos del río más largo del Caribe.',
    description: 'Vive la adrenalina del rafting en el Río Yaque del Norte, el más largo del Caribe. Navegarás por rápidos de clase II y III atravesando valles verdes y paisajes montañosos espectaculares con guías certificados.',
    imageUrl: 'https://images.unsplash.com/photo-1531204709756-1c7a41bf8936?w=1200&h=800&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1531204709756-1c7a41bf8936?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1531204709756-1c7a41bf8936?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1531204709756-1c7a41bf8936?w=1200&h=800&fit=crop&q=80'],
    highlights: ['Rápidos clase II-III', 'Guías certificados', 'Equipo incluido', 'Paisajes de montaña'],
    included: ['Transporte', 'Equipo de rafting', 'Guía profesional', 'Snack y bebidas', 'Fotos'],
    requirements: ['Saber nadar', 'Mayores de 12 años', 'Condición física básica'],
    bestSeason: 'Mayo a Noviembre',
    priceRange: '$$',
    rating: 4.8,
    reviewCount: 1250,
    isFeatured: true
  },
  {
    id: 'canyoning-damajagua',
    slug: 'canyoning-damajagua',
    name: '27 Charcos de Damajagua',
    destinationId: 'puerto-plata',
    destinationName: 'Puerto Plata',
    province: 'Puerto Plata',
    category: 'aventura',
    experienceType: 'Canyoning',
    difficulty: 'moderado',
    duration: '4-5 horas',
    shortDescription: 'Salta, deslízate y nada en 27 cascadas naturales.',
    description: 'Los 27 Charcos de Damajagua son una serie de cascadas escalonadas donde saltarás, nadarás y te deslizarás por toboganes naturales formados en la roca caliza. Una aventura única en el Caribe.',
    imageUrl: 'https://images.unsplash.com/photo-1531204709756-1c7a41bf8936?w=1200&h=800&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1531204709756-1c7a41bf8936?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1531204709756-1c7a41bf8936?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1531204709756-1c7a41bf8936?w=1200&h=800&fit=crop&q=80'],
    highlights: ['27 cascadas', 'Saltos de hasta 6 metros', 'Toboganes naturales', 'Piscinas cristalinas'],
    included: ['Entrada al parque', 'Equipo de seguridad', 'Guía certificado', 'Almuerzo'],
    requirements: ['Saber nadar', 'Mayores de 8 años', 'Calzado acuático'],
    bestSeason: 'Todo el año',
    priceRange: '$$',
    rating: 4.9,
    reviewCount: 2100,
    isFeatured: true
  },
  {
    id: 'pico-duarte',
    slug: 'pico-duarte',
    name: 'Ascenso al Pico Duarte',
    destinationId: 'jarabacoa',
    destinationName: 'Jarabacoa',
    province: 'La Vega',
    category: 'aventura',
    experienceType: 'Senderismo',
    difficulty: 'dificil',
    duration: '2-3 días',
    shortDescription: 'Conquista el pico más alto del Caribe a 3,098 metros.',
    description: 'Alcanza la cima del Pico Duarte, el punto más alto del Caribe. Esta expedición de 2-3 días te llevará por senderos de montaña, bosques de pinos y parajes alpinos hasta la cumbre a 3,098 metros de altura.',
    imageUrl: 'https://images.unsplash.com/photo-1531204709756-1c7a41bf8936?w=1200&h=800&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1531204709756-1c7a41bf8936?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1531204709756-1c7a41bf8936?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1531204709756-1c7a41bf8936?w=1200&h=800&fit=crop&q=80'],
    highlights: ['Pico más alto del Caribe', 'Campamento en montaña', 'Amanecer en la cumbre', 'Flora endémica'],
    included: ['Guía de montaña', 'Mulas de carga', 'Campamento', 'Comidas', 'Permisos'],
    requirements: ['Excelente condición física', 'Experiencia en senderismo', 'Mayores de 16 años'],
    bestSeason: 'Diciembre a Marzo',
    priceRange: '$$$',
    rating: 4.9,
    reviewCount: 680,
    isFeatured: true
  },
  {
    id: 'kitesurf-cabarete',
    slug: 'kitesurf-cabarete',
    name: 'Clases de Kitesurf en Cabarete',
    destinationId: 'cabarete',
    destinationName: 'Cabarete',
    province: 'Puerto Plata',
    category: 'deportes',
    experienceType: 'Kitesurf',
    difficulty: 'moderado',
    duration: '3-5 días',
    shortDescription: 'Aprende kitesurf en la capital mundial de este deporte.',
    description: 'Aprende kitesurf en Cabarete, reconocido mundialmente como uno de los mejores destinos para este deporte. Con vientos constantes y aguas poco profundas, es el lugar perfecto para principiantes y avanzados.',
    imageUrl: 'https://images.unsplash.com/photo-1677616403766-2014be0763b6?w=1200&h=800&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1677616403766-2014be0763b6?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1677616403766-2014be0763b6?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1677616403766-2014be0763b6?w=1200&h=800&fit=crop&q=80'],
    highlights: ['Instructores IKO certificados', 'Equipo incluido', 'Vientos perfectos', 'Bahía protegida'],
    included: ['Instructor privado o grupal', 'Equipo completo', 'Teoría y práctica', 'Certificación'],
    requirements: ['Saber nadar', 'Mayores de 10 años', 'Buena condición física'],
    bestSeason: 'Junio a Septiembre',
    priceRange: '$$$',
    rating: 4.8,
    reviewCount: 920,
    isFeatured: true
  },

  // === NATURALEZA ===
  {
    id: 'ballenas-samana',
    slug: 'ballenas-samana',
    name: 'Avistamiento de Ballenas Jorobadas',
    destinationId: 'samana',
    destinationName: 'Samaná',
    province: 'Samaná',
    category: 'naturaleza',
    experienceType: 'Avistamiento de fauna',
    difficulty: 'facil',
    duration: '4-5 horas',
    shortDescription: 'Observa ballenas jorobadas en su santuario natural.',
    description: 'Cada año, de enero a marzo, miles de ballenas jorobadas llegan a la Bahía de Samaná para reproducirse. Esta experiencia te permite observar estos majestuosos mamíferos a pocos metros de distancia.',
    imageUrl: 'https://images.unsplash.com/photo-1786509334957-7065b72c0a9f?w=1200&h=800&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1786509334957-7065b72c0a9f?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1786509334957-7065b72c0a9f?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1786509334957-7065b72c0a9f?w=1200&h=800&fit=crop&q=80'],
    highlights: ['Ballenas jorobadas', 'Saltos y cantos', 'Guías naturalistas', 'Fotografía cercana'],
    included: ['Transporte en bote', 'Guía naturalista', 'Equipo de seguridad', 'Snacks'],
    requirements: ['No apto para embarazadas', 'No recomendado para problemas de espalda'],
    bestSeason: 'Enero a Marzo únicamente',
    priceRange: '$$',
    rating: 4.9,
    reviewCount: 3500,
    isFeatured: true
  },
  {
    id: 'los-haitises',
    slug: 'los-haitises',
    name: 'Parque Nacional Los Haitises',
    destinationId: 'samana',
    destinationName: 'Samaná',
    province: 'Samaná',
    category: 'naturaleza',
    experienceType: 'Ecoturismo',
    difficulty: 'facil',
    duration: '6-7 horas',
    shortDescription: 'Explora manglares, cuevas taínas y biodiversidad única.',
    description: 'Los Haitises es uno de los parques nacionales más impresionantes del Caribe. Navega entre mogotes kársticos, explora cuevas con petroglifos taínos, observa aves endémicas y admira manglares vírgenes.',
    imageUrl: 'https://images.unsplash.com/photo-1786509334957-7065b72c0a9f?w=1200&h=800&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1786509334957-7065b72c0a9f?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1786509334957-7065b72c0a9f?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1786509334957-7065b72c0a9f?w=1200&h=800&fit=crop&q=80'],
    highlights: ['Formaciones kársticas', 'Cuevas taínas', 'Manglares', 'Aves endémicas'],
    included: ['Transporte en bote', 'Guía naturalista', 'Entrada al parque', 'Almuerzo típico'],
    bestSeason: 'Todo el año',
    priceRange: '$$',
    rating: 4.8,
    reviewCount: 2200,
    isFeatured: true
  },
  {
    id: 'cascada-el-limon',
    slug: 'cascada-el-limon',
    name: 'Cascada El Limón',
    destinationId: 'las-terrenas',
    destinationName: 'Las Terrenas',
    province: 'Samaná',
    category: 'naturaleza',
    experienceType: 'Senderismo',
    difficulty: 'moderado',
    duration: '3-4 horas',
    shortDescription: 'Cabalgata o caminata hasta una cascada de 40 metros.',
    description: 'La Cascada El Limón es una impresionante caída de agua de 40 metros en medio de la selva tropical. Puedes llegar a caballo o caminando, y refrescarte en su piscina natural.',
    imageUrl: 'https://images.unsplash.com/photo-1786509334957-7065b72c0a9f?w=1200&h=800&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1786509334957-7065b72c0a9f?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1786509334957-7065b72c0a9f?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1786509334957-7065b72c0a9f?w=1200&h=800&fit=crop&q=80'],
    highlights: ['Cascada de 40 metros', 'Piscina natural', 'Cabalgata opcional', 'Selva tropical'],
    included: ['Guía local', 'Caballo (opcional)', 'Tiempo para nadar'],
    requirements: ['Calzado de senderismo', 'Traje de baño', 'Condición física básica'],
    bestSeason: 'Todo el año',
    priceRange: '$',
    rating: 4.6,
    reviewCount: 1800,
    isFeatured: true
  },

  // === CULTURA ===
  {
    id: 'tour-zona-colonial',
    slug: 'tour-zona-colonial',
    name: 'Tour Histórico Zona Colonial',
    destinationId: 'zona-colonial',
    destinationName: 'Zona Colonial',
    province: 'Santo Domingo',
    category: 'cultura',
    experienceType: 'Tour guiado',
    difficulty: 'facil',
    duration: '3-4 horas',
    shortDescription: 'Recorre la primera ciudad del Nuevo Mundo.',
    description: 'Camina por las calles empedradas de la primera ciudad de las Américas. Visita la primera catedral, el Alcázar de Colón, el Panteón Nacional y descubre 500 años de historia colonial.',
    imageUrl: 'https://images.unsplash.com/photo-1785758339173-c7a70e0e13ac?w=1200&h=800&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1785758339173-c7a70e0e13ac?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1785758339173-c7a70e0e13ac?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1785758339173-c7a70e0e13ac?w=1200&h=800&fit=crop&q=80'],
    highlights: ['Primera catedral de América', 'Alcázar de Colón', 'Calles coloniales', 'Historia viva'],
    included: ['Guía historiador', 'Entradas a monumentos', 'Mapa histórico'],
    bestSeason: 'Todo el año',
    priceRange: '$$',
    rating: 4.7,
    reviewCount: 1500,
    isFeatured: true
  },
  {
    id: 'carnaval-la-vega',
    slug: 'carnaval-la-vega',
    name: 'Carnaval de La Vega',
    destinationId: 'la-vega',
    destinationName: 'La Vega',
    province: 'La Vega',
    category: 'cultura',
    experienceType: 'Festival',
    difficulty: 'facil',
    duration: '1 día',
    shortDescription: 'Vive el carnaval más colorido y tradicional del Caribe.',
    description: 'El Carnaval de La Vega es el más espectacular de República Dominicana. Sus diablos cojuelos con máscaras elaboradas, vejigas y trajes coloridos crean una experiencia cultural única cada fin de semana de febrero.',
    imageUrl: 'https://images.unsplash.com/photo-1785758339173-c7a70e0e13ac?w=1200&h=800&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1785758339173-c7a70e0e13ac?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1785758339173-c7a70e0e13ac?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1785758339173-c7a70e0e13ac?w=1200&h=800&fit=crop&q=80'],
    highlights: ['Diablos cojuelos', 'Máscaras artesanales', 'Música y baile', 'Tradición centenaria'],
    included: ['Transporte', 'Guía cultural', 'Almuerzo típico'],
    bestSeason: 'Febrero únicamente',
    priceRange: '$$',
    rating: 4.9,
    reviewCount: 890,
    isFeatured: true
  },

  // === GASTRONOMÍA ===
  {
    id: 'tour-gastronomico-santo-domingo',
    slug: 'tour-gastronomico-santo-domingo',
    name: 'Tour Gastronómico Santo Domingo',
    destinationId: 'zona-colonial',
    destinationName: 'Zona Colonial',
    province: 'Santo Domingo',
    category: 'gastronomia',
    experienceType: 'Tour gastronómico',
    difficulty: 'facil',
    duration: '4-5 horas',
    shortDescription: 'Degusta los sabores auténticos de la cocina dominicana.',
    description: 'Explora la escena culinaria de Santo Domingo probando platos tradicionales como mangú, sancocho, y mofongo en restaurantes locales y puestos callejeros. Incluye maridaje con ron y café.',
    imageUrl: 'https://images.unsplash.com/photo-1783173690380-92016b00bd82?w=1200&h=800&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1783173690380-92016b00bd82?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1783173690380-92016b00bd82?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1783173690380-92016b00bd82?w=1200&h=800&fit=crop&q=80'],
    highlights: ['8-10 degustaciones', 'Restaurantes locales', 'Cata de ron', 'Café dominicano'],
    included: ['Guía gastronómico', 'Todas las degustaciones', 'Bebidas', 'Recetas'],
    bestSeason: 'Todo el año',
    priceRange: '$$',
    rating: 4.8,
    reviewCount: 720,
    isFeatured: true
  },
  {
    id: 'tour-cafe-jarabacoa',
    slug: 'tour-cafe-jarabacoa',
    name: 'Ruta del Café de Montaña',
    destinationId: 'jarabacoa',
    destinationName: 'Jarabacoa',
    province: 'La Vega',
    category: 'gastronomia',
    experienceType: 'Agroturismo',
    difficulty: 'facil',
    duration: '4-5 horas',
    shortDescription: 'Descubre el proceso del café dominicano de altura.',
    description: 'Visita fincas cafetaleras en las montañas de Jarabacoa para conocer todo el proceso del café de especialidad: desde la planta hasta la taza. Incluye cata profesional.',
    imageUrl: 'https://images.unsplash.com/photo-1783173690380-92016b00bd82?w=1200&h=800&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1783173690380-92016b00bd82?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1783173690380-92016b00bd82?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1783173690380-92016b00bd82?w=1200&h=800&fit=crop&q=80'],
    highlights: ['Fincas de café', 'Proceso completo', 'Cata profesional', 'Café para llevar'],
    included: ['Transporte', 'Tour de finca', 'Cata', 'Almuerzo campestre', 'Café para llevar'],
    bestSeason: 'Octubre a Febrero (cosecha)',
    priceRange: '$$',
    rating: 4.7,
    reviewCount: 480,
    isFeatured: true
  },

  // === LUJO ===
  {
    id: 'catamaran-punta-cana',
    slug: 'catamaran-punta-cana',
    name: 'Catamarán Premium con Snorkel',
    destinationId: 'punta-cana',
    destinationName: 'Punta Cana',
    province: 'La Altagracia',
    category: 'lujo',
    experienceType: 'Navegación',
    difficulty: 'facil',
    duration: '5-6 horas',
    shortDescription: 'Navega en catamarán de lujo con barra libre y snorkel.',
    description: 'Zarpa en un catamarán de lujo por las aguas turquesas de Punta Cana. Incluye snorkel en arrecife, piscina natural, barra libre premium y almuerzo gourmet a bordo.',
    imageUrl: 'https://images.unsplash.com/photo-1773593893090-27d17a880a07?w=1200&h=800&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1773593893090-27d17a880a07?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1773593893090-27d17a880a07?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1773593893090-27d17a880a07?w=1200&h=800&fit=crop&q=80'],
    highlights: ['Catamarán de lujo', 'Snorkel en arrecife', 'Barra libre', 'Almuerzo gourmet'],
    included: ['Navegación', 'Equipo de snorkel', 'Barra libre premium', 'Almuerzo', 'Toallas'],
    bestSeason: 'Todo el año',
    priceRange: '$$$',
    rating: 4.6,
    reviewCount: 1350,
    isFeatured: true
  },
  {
    id: 'golf-teeth-of-the-dog',
    slug: 'golf-teeth-of-the-dog',
    name: 'Golf en Teeth of the Dog',
    destinationId: 'la-romana',
    destinationName: 'La Romana',
    province: 'La Romana',
    category: 'lujo',
    experienceType: 'Golf',
    difficulty: 'moderado',
    duration: '5-6 horas',
    shortDescription: 'Juega en el campo de golf #1 del Caribe.',
    description: 'Teeth of the Dog en Casa de Campo es consistentemente clasificado como el mejor campo de golf del Caribe. Diseñado por Pete Dye con 7 hoyos frente al mar, es una experiencia de golf de clase mundial.',
    imageUrl: 'https://images.unsplash.com/photo-1773593893090-27d17a880a07?w=1200&h=800&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1773593893090-27d17a880a07?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1773593893090-27d17a880a07?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1773593893090-27d17a880a07?w=1200&h=800&fit=crop&q=80'],
    highlights: ['Campo #1 del Caribe', '7 hoyos frente al mar', 'Diseño Pete Dye', 'Servicio VIP'],
    included: ['Green fees', 'Carrito de golf', 'Caddy', 'Práctica', 'Servicio de bebidas'],
    requirements: ['Handicap certificado', 'Código de vestimenta'],
    bestSeason: 'Todo el año',
    priceRange: '$$$$',
    rating: 4.9,
    reviewCount: 620,
    isFeatured: true
  },

  // === ISLA ===
  {
    id: 'isla-saona',
    slug: 'isla-saona',
    name: 'Excursión a Isla Saona',
    destinationId: 'bayahibe',
    destinationName: 'Bayahíbe',
    province: 'La Romana',
    category: 'naturaleza',
    experienceType: 'Excursión a isla',
    difficulty: 'facil',
    duration: '8-9 horas',
    shortDescription: 'Pasa un día en la isla paradisíaca más famosa del Caribe.',
    description: 'Isla Saona es el paraíso hecho realidad: playas de arena blanca, palmeras, aguas cristalinas y estrellas de mar. Incluye paseo en catamarán, piscina natural y almuerzo caribeño.',
    imageUrl: 'https://images.unsplash.com/photo-1786509334957-7065b72c0a9f?w=1200&h=800&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1786509334957-7065b72c0a9f?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1786509334957-7065b72c0a9f?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1786509334957-7065b72c0a9f?w=1200&h=800&fit=crop&q=80'],
    highlights: ['Playas vírgenes', 'Piscina natural', 'Estrellas de mar', 'Catamarán'],
    included: ['Transporte', 'Catamarán', 'Barra libre', 'Almuerzo buffet', 'Música'],
    bestSeason: 'Todo el año',
    priceRange: '$$',
    rating: 4.5,
    reviewCount: 4200,
    isFeatured: true
  }
];

// === FUNCIONES DE UTILIDAD ===

export function getExperienceBySlug(slug: string): Experience | undefined {
  return experiences.find(e => e.slug === slug);
}

export function getExperienceById(id: string): Experience | undefined {
  return experiences.find(e => e.id === id);
}

export function getExperiencesByDestination(destinationId: string): Experience[] {
  return experiences.filter(e => e.destinationId === destinationId);
}

export function getExperiencesByProvince(province: string): Experience[] {
  return experiences.filter(e => e.province.toLowerCase() === province.toLowerCase());
}

export function getExperiencesByCategory(category: string): Experience[] {
  return experiences.filter(e => e.category === category);
}

export function getFeaturedExperiences(): Experience[] {
  return experiences.filter(e => e.isFeatured);
}

export function getExperiencesByDifficulty(difficulty: string): Experience[] {
  return experiences.filter(e => e.difficulty === difficulty);
}

export function searchExperiences(query: string): Experience[] {
  const lowerQuery = query.toLowerCase();
  return experiences.filter(e => 
    e.name.toLowerCase().includes(lowerQuery) ||
    e.destinationName.toLowerCase().includes(lowerQuery) ||
    e.experienceType.toLowerCase().includes(lowerQuery)
  );
}
