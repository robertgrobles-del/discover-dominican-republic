// Datos estáticos de ríos de República Dominicana
//
// === GUÍA PARA CREAR NUEVAS PÁGINAS DE RÍO ===
//
// 1. AGREGAR DATOS: Añadir el objeto del río a este archivo (rivers array)
// 2. CREAR PÁGINA: Crear archivo en src/pages/rios/NombreRio.tsx
// 3. AGREGAR RUTA: Registrar la ruta en src/App.tsx como /rio/slug
//
// Ejemplo de página de río:
// ```tsx
// import { StaticRiverPage } from "@/components/StaticRiverPage";
// import { getRiverBySlug } from "@/data/rivers";
//
// export default function RioEjemplo() {
//   const river = getRiverBySlug('rio-ejemplo');
//   if (!river) return <div>Río no encontrado</div>;
//   return <StaticRiverPage river={river} />;
// }
// ```
//
// === JERARQUÍA ===
// Un río puede pasar por múltiples provincias
// - provinces: Array de provincias por donde pasa el río
// - mainProvinceId: Provincia principal (donde está la actividad turística principal)
// - destinationId: Destino turístico asociado (si aplica)

export interface RiverProvince {
  id: string;
  name: string;
  slug: string;
}

export interface River {
  id: string;
  slug: string;
  name: string;
  // Jerarquía geográfica - Los ríos pueden pasar por varias provincias
  provinces: RiverProvince[];    // Array de provincias por donde pasa
  mainProvinceId: string;        // ID de la provincia principal (turísticamente)
  mainProvinceName: string;      // Nombre de la provincia principal
  destinationId?: string;        // Destino turístico asociado (si aplica)
  destinationName?: string;      // Nombre del destino para mostrar
  // Información general
  riverType: 'montaña' | 'cascada' | 'charco' | 'cañon' | 'manantial';
  shortDescription: string;
  description: string;
  imageUrl: string;
  gallery: string[];
  activities: string[];
  // Características
  waterTemperature: 'fria' | 'templada' | 'fresca';
  currentIntensity: 'suave' | 'moderada' | 'fuerte';
  difficulty: 'facil' | 'moderado' | 'dificil' | 'experto';
  adrenalineLevel: 1 | 2 | 3 | 4 | 5;
  // Seguridad
  guidesRequired: boolean;
  safetyTips: string[];
  // Información práctica
  duration: string;
  bestSeason: string;
  priceRange: '$' | '$$' | '$$$';
  rating: number;
  reviewCount: number;
  // Ubicación
  latitude?: number;
  longitude?: number;
  howToGetThere: string;
  // Destacados
  isPopular?: boolean;
  isFeatured?: boolean;
}

export const rivers: River[] = [
  // === JARABACOA ===
  {
    id: 'rio-yaque-del-norte',
    slug: 'rio-yaque-del-norte',
    name: 'Río Yaque del Norte',
    provinces: [
      { id: 'la-vega', name: 'La Vega', slug: 'la-vega' },
      { id: 'santiago', name: 'Santiago', slug: 'santiago' }
    ],
    mainProvinceId: 'la-vega',
    mainProvinceName: 'La Vega',
    destinationId: 'jarabacoa',
    destinationName: 'Jarabacoa',
    riverType: 'montaña',
    shortDescription: 'El río más importante del país, con los mejores rápidos para rafting del Caribe.',
    description: 'El Río Yaque del Norte es el más largo y caudaloso de República Dominicana, naciendo en las laderas del Pico Duarte. En Jarabacoa ofrece los mejores rápidos de rafting del Caribe, con tramos de clase II a IV dependiendo de la temporada. Es la experiencia de aventura más emocionante del país.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    activities: ['Rafting', 'Kayak', 'Tubing', 'Canyoning', 'Natación'],
    waterTemperature: 'fria',
    currentIntensity: 'fuerte',
    difficulty: 'moderado',
    adrenalineLevel: 4,
    guidesRequired: true,
    safetyTips: [
      'Siempre ir con guía certificado',
      'Usar chaleco salvavidas y casco',
      'Verificar condiciones del río antes',
      'No consumir alcohol antes de la actividad',
      'Saber nadar es recomendado'
    ],
    duration: '2-3 horas (rafting)',
    bestSeason: 'Mayo a noviembre (temporada de lluvias = mejores rápidos)',
    priceRange: '$$',
    rating: 4.8,
    reviewCount: 2450,
    latitude: 19.1120,
    longitude: -70.6380,
    howToGetThere: 'Los operadores de rafting recogen en Jarabacoa y transportan al punto de inicio.',
    isPopular: true,
    isFeatured: true
  },
  {
    id: 'salto-jimenoa',
    slug: 'salto-jimenoa',
    name: 'Salto de Jimenoa',
    provinces: [
      { id: 'la-vega', name: 'La Vega', slug: 'la-vega' }
    ],
    mainProvinceId: 'la-vega',
    mainProvinceName: 'La Vega',
    destinationId: 'jarabacoa',
    destinationName: 'Jarabacoa',
    riverType: 'cascada',
    shortDescription: 'Espectacular cascada de 40 metros accesible por puentes colgantes.',
    description: 'El Salto de Jimenoa es una impresionante cascada de 40 metros de altura en las montañas de Jarabacoa. El acceso es parte de la aventura, cruzando varios puentes colgantes sobre el río. Al llegar, la piscina natural al pie de la cascada ofrece un refrescante baño en aguas cristalinas.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    activities: ['Senderismo', 'Natación', 'Fotografía', 'Puentes colgantes'],
    waterTemperature: 'fria',
    currentIntensity: 'moderada',
    difficulty: 'facil',
    adrenalineLevel: 2,
    guidesRequired: false,
    safetyTips: [
      'Usar calzado adecuado para senderos',
      'Llevar repelente de insectos',
      'No saltar desde las rocas',
      'Cuidado con los puentes cuando están mojados'
    ],
    duration: '2-3 horas (ida y vuelta)',
    bestSeason: 'Todo el año',
    priceRange: '$',
    rating: 4.6,
    reviewCount: 1820,
    latitude: 19.1285,
    longitude: -70.6542,
    howToGetThere: '15 minutos en carro desde el centro de Jarabacoa.',
    isPopular: true,
    isFeatured: true
  },
  {
    id: 'salto-baiguate',
    slug: 'salto-baiguate',
    name: 'Salto de Baiguate',
    provinces: [
      { id: 'la-vega', name: 'La Vega', slug: 'la-vega' }
    ],
    mainProvinceId: 'la-vega',
    mainProvinceName: 'La Vega',
    destinationId: 'jarabacoa',
    destinationName: 'Jarabacoa',
    riverType: 'cascada',
    shortDescription: 'Cascada de 25 metros con piscina natural ideal para nadar.',
    description: 'El Salto de Baiguate es una de las cascadas más accesibles de Jarabacoa. Con 25 metros de altura, cae en una amplia piscina natural perfecta para nadar. El sendero es corto y fácil, haciéndola ideal para familias y visitantes de todas las edades.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    activities: ['Natación', 'Fotografía', 'Senderismo corto', 'Picnic'],
    waterTemperature: 'fria',
    currentIntensity: 'suave',
    difficulty: 'facil',
    adrenalineLevel: 1,
    guidesRequired: false,
    safetyTips: [
      'No nadar directamente bajo la cascada',
      'Cuidado con las rocas resbalosas',
      'Llevar toalla y ropa de cambio'
    ],
    duration: '1-2 horas',
    bestSeason: 'Todo el año',
    priceRange: '$',
    rating: 4.5,
    reviewCount: 1250,
    latitude: 19.0920,
    longitude: -70.6180,
    howToGetThere: '10 minutos desde Jarabacoa, sendero de 15 minutos.',
    isPopular: true,
    isFeatured: true
  },

  // === SAMANÁ ===
  {
    id: 'cascada-el-limon',
    slug: 'cascada-el-limon',
    name: 'Cascada El Limón',
    provinces: [
      { id: 'samana', name: 'Samaná', slug: 'samana' }
    ],
    mainProvinceId: 'samana',
    mainProvinceName: 'Samaná',
    destinationId: 'las-terrenas',
    destinationName: 'Las Terrenas',
    riverType: 'cascada',
    shortDescription: 'La cascada más famosa del país, 52 metros de caída libre en la selva tropical.',
    description: 'El Salto del Limón es la cascada más icónica de República Dominicana. Con 52 metros de caída libre en medio de una exuberante selva tropical, es un espectáculo de la naturaleza. El acceso puede ser a pie (45 min) o a caballo, atravesando un paisaje de plantaciones y bosque tropical.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    activities: ['Cabalgata', 'Senderismo', 'Natación', 'Fotografía'],
    waterTemperature: 'fresca',
    currentIntensity: 'fuerte',
    difficulty: 'moderado',
    adrenalineLevel: 2,
    guidesRequired: true,
    safetyTips: [
      'Usar calzado resistente al agua',
      'Llevar protector solar y repelente',
      'El sendero puede ser resbaloso',
      'Opción de caballo recomendada si no está en forma'
    ],
    duration: '3-4 horas (tour completo)',
    bestSeason: 'Todo el año, más caudalosa en época de lluvias',
    priceRange: '$$',
    rating: 4.7,
    reviewCount: 3200,
    latitude: 19.2785,
    longitude: -69.4680,
    howToGetThere: '20 minutos desde Las Terrenas hasta el inicio del sendero.',
    isPopular: true,
    isFeatured: true
  },

  // === PUERTO PLATA ===
  {
    id: '27-charcos',
    slug: '27-charcos',
    name: '27 Charcos de Damajagua',
    provinces: [
      { id: 'puerto-plata', name: 'Puerto Plata', slug: 'puerto-plata' }
    ],
    mainProvinceId: 'puerto-plata',
    mainProvinceName: 'Puerto Plata',
    riverType: 'charco',
    shortDescription: 'Aventura de canyoning con 27 cascadas y pozas naturales para saltar y deslizar.',
    description: 'Los 27 Charcos de Damajagua son la aventura más emocionante de la costa norte. Este sistema de 27 cascadas y pozas naturales ofrece una experiencia única de canyoning donde saltarás, te deslizarás y nadarás a través de formaciones rocosas esculpidas por el agua. Es adrenalina pura en un entorno natural espectacular.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    activities: ['Canyoning', 'Saltos de cascada', 'Toboganes naturales', 'Natación'],
    waterTemperature: 'fresca',
    currentIntensity: 'moderada',
    difficulty: 'moderado',
    adrenalineLevel: 5,
    guidesRequired: true,
    safetyTips: [
      'Obligatorio usar chaleco y casco',
      'Seguir instrucciones del guía siempre',
      'Saltar solo donde indique el guía',
      'No apto para personas con problemas cardíacos',
      'Edad mínima recomendada: 8 años'
    ],
    duration: '3-4 horas',
    bestSeason: 'Todo el año',
    priceRange: '$$',
    rating: 4.9,
    reviewCount: 4500,
    latitude: 19.6425,
    longitude: -70.7285,
    howToGetThere: '45 minutos desde Puerto Plata. Transporte incluido desde resorts.',
    isPopular: true,
    isFeatured: true
  },

  // === CONSTANZA ===
  {
    id: 'aguas-blancas',
    slug: 'aguas-blancas',
    name: 'Salto de Aguas Blancas',
    provinces: [
      { id: 'la-vega', name: 'La Vega', slug: 'la-vega' }
    ],
    mainProvinceId: 'la-vega',
    mainProvinceName: 'La Vega',
    destinationId: 'constanza',
    destinationName: 'Constanza',
    riverType: 'cascada',
    shortDescription: 'La cascada más alta de las Antillas con 83 metros de caída.',
    description: 'El Salto de Aguas Blancas es la cascada más alta de las Antillas, con una impresionante caída de 83 metros. Ubicada en las montañas de Constanza, en el corazón de la cordillera Central, ofrece un espectáculo natural sobrecogedor. El agua extremadamente fría viene directamente de los picos más altos del Caribe.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    activities: ['Senderismo', 'Fotografía', 'Observación de naturaleza'],
    waterTemperature: 'fria',
    currentIntensity: 'fuerte',
    difficulty: 'moderado',
    adrenalineLevel: 2,
    guidesRequired: false,
    safetyTips: [
      'Llevar ropa abrigada (temperatura fría)',
      'El agua es muy fría para nadar mucho tiempo',
      'Sendero empinado, ir con calma'
    ],
    duration: '2-3 horas',
    bestSeason: 'Todo el año',
    priceRange: '$',
    rating: 4.7,
    reviewCount: 890,
    latitude: 18.9125,
    longitude: -70.7420,
    howToGetThere: '30 minutos desde Constanza en vehículo 4x4.',
    isPopular: false,
    isFeatured: true
  },

  // === BARAHONA ===
  {
    id: 'rio-san-rafael',
    slug: 'rio-san-rafael',
    name: 'Río San Rafael (Balneario)',
    provinces: [
      { id: 'barahona', name: 'Barahona', slug: 'barahona' }
    ],
    mainProvinceId: 'barahona',
    mainProvinceName: 'Barahona',
    riverType: 'manantial',
    shortDescription: 'Río de aguas cristalinas y frías que desemboca en el mar Caribe.',
    description: 'El Balneario de San Rafael es uno de los lugares más únicos del Caribe. Un río de aguas cristalinas y sorprendentemente frías fluye desde las montañas hasta desembocar directamente en el mar Caribe. Puedes nadar en las pozas del río y luego caminar metros hasta el mar caliente. El contraste es mágico.',
    imageUrl: '/placeholder.svg',
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    activities: ['Natación', 'Picnic', 'Fotografía', 'Relajación'],
    waterTemperature: 'fria',
    currentIntensity: 'suave',
    difficulty: 'facil',
    adrenalineLevel: 1,
    guidesRequired: false,
    safetyTips: [
      'El agua es muy fría, entrar gradualmente',
      'Cuidado con las corrientes cerca de la desembocadura',
      'Llevar comida, opciones limitadas'
    ],
    duration: '2-4 horas',
    bestSeason: 'Todo el año',
    priceRange: '$',
    rating: 4.8,
    reviewCount: 1120,
    latitude: 18.0875,
    longitude: -71.0682,
    howToGetThere: '40 minutos desde Barahona por la carretera costera.',
    isPopular: true,
    isFeatured: true
  }
];

// === FUNCIONES DE UTILIDAD ===

export function getRiverBySlug(slug: string): River | undefined {
  return rivers.find(r => r.slug === slug);
}

export function getRiverById(id: string): River | undefined {
  return rivers.find(r => r.id === id);
}

export function getRiversByProvince(provinceId: string): River[] {
  return rivers.filter(r => 
    r.provinces.some(p => p.id === provinceId) || r.mainProvinceId === provinceId
  );
}

export function getRiversByDestination(destinationId: string): River[] {
  return rivers.filter(r => r.destinationId === destinationId);
}

export function getRiversByType(riverType: River['riverType']): River[] {
  return rivers.filter(r => r.riverType === riverType);
}

export function getRiversByDifficulty(difficulty: River['difficulty']): River[] {
  return rivers.filter(r => r.difficulty === difficulty);
}

export function getRiversByAdrenaline(minLevel: number): River[] {
  return rivers.filter(r => r.adrenalineLevel >= minLevel);
}

export function getPopularRivers(): River[] {
  return rivers.filter(r => r.isPopular);
}

export function getFeaturedRivers(): River[] {
  return rivers.filter(r => r.isFeatured);
}

export function getCascadas(): River[] {
  return rivers.filter(r => r.riverType === 'cascada');
}

export function getRaftingRivers(): River[] {
  return rivers.filter(r => r.activities.includes('Rafting'));
}

export function searchRivers(query: string): River[] {
  const lowerQuery = query.toLowerCase();
  return rivers.filter(r => 
    r.name.toLowerCase().includes(lowerQuery) ||
    r.mainProvinceName.toLowerCase().includes(lowerQuery) ||
    r.activities.some(a => a.toLowerCase().includes(lowerQuery))
  );
}

// Obtener todas las provincias por las que pasa un río
export function getRiverProvinces(river: River): RiverProvince[] {
  return river.provinces;
}
